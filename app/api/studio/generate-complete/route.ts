import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptScene, WordTimestamp, SfxType, CameraMotionType, TransitionType } from '@/types/studio';
import { selectContextualBroll } from '@/lib/broll-library';
import { getContextualMediaForScene } from '@/lib/curated-media';
import { MOTION_TEMPLATES, MotionTemplateId } from '@/lib/motion-templates';
import { buildProceduralMotionScene } from '@/lib/scene-motion-generator';

function buildWordTimestamps(text: string, durationSec: number): WordTimestamp[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const totalChars = words.reduce((acc, w) => acc + w.length + 1, 0);
  let cursor = 0;

  return words.map((word) => {
    const ratio = (word.length + 1) / totalChars;
    const wordDur = ratio * (durationSec * 0.92);
    const startSec = Number(cursor.toFixed(2));
    const endSec = Number((cursor + wordDur).toFixed(2));
    cursor += wordDur;
    return { word, startSec, endSec };
  });
}

function estimateSpeechDuration(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Number(Math.max(4.0, Math.min(7.2, words / 2.6 + 0.8)).toFixed(1));
}

/**
 * Resolve o ID do template preservando integralmente qualquer um dos 124 templates oficiais
 * de MOTION_TEMPLATES, sem sobrescrevê-lo por IDs legados.
 */
function resolveRealTemplateId(input: string | undefined, defaultTemplate: string): MotionTemplateId {
  const candidate = (input || defaultTemplate || 'assemble-then-type-flyin').trim();
  const exactMatch = MOTION_TEMPLATES.find((t) => t.id === candidate);
  if (exactMatch) return exactMatch.id;

  const normalized = candidate.toLowerCase().replace(/[_ ]/g, '-');
  const dashMatch = MOTION_TEMPLATES.find((t) => t.id.toLowerCase() === normalized);
  if (dashMatch) return dashMatch.id;

  const fallbackMatch = MOTION_TEMPLATES.find((t) => t.id === defaultTemplate);
  if (fallbackMatch) return fallbackMatch.id;

  return candidate;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = 'Como atrair clientes qualificados todos os dias usando vídeos curtos automáticos',
      styleMode = 'assemble-then-type-flyin',
      aspectRatio = '9:16',
      presetId = 'kinetic_yellow',
      targetDurationSec = 25,
      targetSceneCount = 5,
      voiceId = 'antonio',
    } = body;

    const sceneCount = Math.max(4, Math.min(8, Number(targetSceneCount) || 5));
    const apiKey = process.env.GEMINI_API_KEY;
    let rawScenes: any[] = [];
    let generatedTitle = prompt.slice(0, 52);
    let fullNarrationText = '';

    const chosenTemplateId = resolveRealTemplateId(styleMode, 'assemble-then-type-flyin');
    const chosenTemplateMeta =
      MOTION_TEMPLATES.find((t) => t.id === chosenTemplateId) || MOTION_TEMPLATES[0];

    // Seleciona também templates complementares da mesma família ou ritmo para enriquecer o vídeo se a IA desejar variar cenas intermediárias
    const relatedTemplates = MOTION_TEMPLATES.filter(
      (t) => t.category === chosenTemplateMeta.category || t.hasMotionEngine
    ).slice(0, 12);

    const catalogPromptBlock = [
      `TEMPLATE PRINCIPAL ESCOLHIDO PELO USUÁRIO (OBRIGATÓRIO NA CENA 1 E BASE VISUAL DO VÍDEO):`,
      `- ID: "${chosenTemplateMeta.id}"`,
      `- Nome: "${chosenTemplateMeta.name}"`,
      `- Categoria: "${chosenTemplateMeta.categoryName}" (${chosenTemplateMeta.badge})`,
      `- Duração Recomendada: ${chosenTemplateMeta.duration}`,
      `- Anatomia Visual e Mecânica de Movimento: "${chosenTemplateMeta.description}"`,
      ``,
      `TEMPLATES COMPLEMENTARES DO CATÁLOGO OFICIAL PARA AS DEMAIS CENAS:`,
      ...relatedTemplates.map(
        (t) => `- "${t.id}" (${t.name}): ${t.description}`
      ),
    ].join('\n');

    const systemInstruction = `
Você é o Diretor de Criação e Roteirista Chefe de Vídeos Virais (estilo Alex Hormozi, Vox e MagnatesMedia).
O tema do vídeo solicitado pelo usuário é: "${prompt}".
Proporção de tela: ${aspectRatio}.
Duração alvo: ~${targetDurationSec} segundos divididos em exatamente ${sceneCount} cenas conectadas.

${catalogPromptBlock}

REGRAS OBRIGATÓRIAS DE GERAÇÃO BASEADA NO TEMPLATE ESCOLHIDO:
1. PRIMEIRO CRIE A NARRAÇÃO COMPLETA UNIFICADA ("fullNarration"):
   - Escreva um texto único, fluido, magnético e natural em português (pt-BR) do início ao fim.
   - O locutor lerá essa narração de forma contínua, sem pausas robóticas entre cenas.
2. DIVIDA A NARRATIVA EM ${sceneCount} CENAS VISUAIS SINCRONIZADAS ("scenes"):
   - A Cena 1 DEVE OBRIGATORIAMENTE usar o template escolhido pelo usuário: "templateId": "${chosenTemplateMeta.id}".
   - Nas cenas seguintes, você pode usar "${chosenTemplateMeta.id}" ou combinar com templates complementares do catálogo acima (como "flying-words", "card-stack", "spotlight-hero-card", ou outros listados) para criar ritmo visual dinâmico (gancho, dados/métricas, comparativo, prova e CTA).
   - O campo "visualPrompt" de cada cena DEVE incorporar explicitamente a mecânica e os elementos descritos na anatomia do template daquela cena (ex: "${chosenTemplateMeta.description}"), adaptados ao tema "${prompt}".
   - As imagens de B-Roll não devem ser meros papéis de parede passivos: descreva como a imagem do tema interage dentro da moldura/card 3D do template.

RETORNE APENAS UM OBJETO JSON VÁLIDO NO FORMATO ABAIXO:
{
  "title": "Título Curto e Magnético do Vídeo",
  "fullNarration": "Texto completo e contínuo da locução falada do início ao fim...",
  "scenes": [
    {
      "summary": "Resumo direto do que acontece neste momento da narrativa",
      "visualPrompt": "Descrição técnica detalhada da cena aplicando a anatomia exata do template ${chosenTemplateMeta.name}: ${chosenTemplateMeta.description}",
      "text": "Trecho exato da locução falada correspondente a este momento",
      "templateId": "${chosenTemplateMeta.id}",
      "tag": "${chosenTemplateMeta.badge}",
      "headline": "TÍTULO DE IMPACTO CURTO (ATÉ 5 PALAVRAS)",
      "subText": "Frase de apoio visual complementar ao título",
      "highlightWord": "PALAVRA-CHAVE",
      "statValue": "92%",
      "statLabel": "Rótulo da métrica (se aplicável)",
      "ctaText": "Ação Principal"
    }
  ]
}
`;

    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash-lite',
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent(systemInstruction);
        const responseText = result.response
          .text()
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(responseText);
        if (parsed?.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
          rawScenes = parsed.scenes;
          if (parsed.title) generatedTitle = parsed.title;
          if (parsed.fullNarration) fullNarrationText = parsed.fullNarration;
        }
      } catch (aiErr) {
        console.warn('Gemini error/fallback:', aiErr);
      }
    }

    if (rawScenes.length === 0) {
      rawScenes = buildTemplateDrivenFallbackScenes(prompt, chosenTemplateMeta.id, sceneCount);
    }

    const sfxOptions: SfxType[] = ['impact', 'whoosh', 'pop', 'cash', 'cinematic_boom', 'glitch', 'rise'];
    const camOptions: CameraMotionType[] = ['zoom_in', 'float_3d', 'pan_right', 'zoom_out', 'pan_left'];
    const transOptions: TransitionType[] = ['flash_zoom', 'spring_slide', 'glitch_cut', 'fade'];

    if (!fullNarrationText) {
      fullNarrationText = rawScenes.map((s) => s.text).filter(Boolean).join(' ');
    }

    const fullAudioUrl = `/api/tts?text=${encodeURIComponent(fullNarrationText.slice(0, 1500))}&voice=${encodeURIComponent(voiceId)}`;

    let accumulatedStartSec = 0;

    const enrichedScenes: ScriptScene[] = rawScenes.map((sc, idx) => {
      const cleanText = sc.text || 'Descubra como transformar seus resultados hoje mesmo com automação.';
      const durationSec = estimateSpeechDuration(cleanText);
      const sceneStartSec = Number(accumulatedStartSec.toFixed(2));
      accumulatedStartSec += durationSec;

      const curatedMedia = getContextualMediaForScene(cleanText, prompt, idx);
      const broll = selectContextualBroll(`${prompt} ${cleanText}`, idx);
      const finalImage = curatedMedia || broll.imageUrl;

      // Garante que a Cena 1 use o template exato escolhido pelo usuário e as demais respeitem o templateId real
      const templateResolved =
        idx === 0
          ? chosenTemplateMeta.id
          : resolveRealTemplateId(sc.templateId || sc.componentType, chosenTemplateMeta.id);

      const tplInfo = MOTION_TEMPLATES.find((t) => t.id === templateResolved) || chosenTemplateMeta;
      const highlightColor = tplInfo.defaultHighlightColor || '#facc15';

      const sceneHeadline = (sc.headline || cleanText.slice(0, 38)).toUpperCase();
      const sceneSubText = sc.subText || tplInfo.description.slice(0, 75);
      const sceneTag = sc.tag || tplInfo.badge || 'MOTION STUDIO';
      const sceneVisualPrompt =
        sc.visualPrompt ||
        `Template "${tplInfo.name}" (${tplInfo.id}): ${tplInfo.description} Aplicado ao tema "${sceneHeadline}" com mídia B-Roll integrada em primeiro plano.`;

      // Compila imediatamente o HTML5/SVG + GSAP 3 fiel ao template para que o preview funcione instantaneamente
      const procedural = buildProceduralMotionScene({
        scene: {
          brollUrl: finalImage,
          brollImageUrl: finalImage,
          statValue: sc.statValue || '92%',
          statLabel: sc.statLabel || sceneHeadline,
          barsData: sc.barsData,
          versusData: sc.versusData,
          ctaText: sc.ctaText || 'COMEÇAR AGORA',
          componentProps: {
            headline: sceneHeadline,
            subtext: sceneSubText,
            badge: sceneTag,
            highlightWords: [sc.highlightWord || 'DESTAQUE'],
            number: parseInt(String(sc.statValue || '92').replace(/\D/g, ''), 10) || 92,
            suffix: String(sc.statValue || '%').replace(/[0-9]/g, '') || '%',
            label: sc.statLabel || sceneHeadline,
            bars: sc.barsData,
            leftTitle: sc.versusData?.leftTitle,
            rightTitle: sc.versusData?.rightTitle,
            buttonText: sc.ctaText || 'COMEÇAR AGORA',
            imageUrl: finalImage,
          },
        },
        sceneIndex: idx,
        resolvedTemplate: templateResolved,
        visualPrompt: sceneVisualPrompt,
        headline: sceneHeadline,
        subText: sceneSubText,
        tag: sceneTag,
        text: cleanText,
        duration: durationSec,
        highlightColor,
        primaryTextColor: '#ffffff',
        aspectRatio: aspectRatio as any,
      });

      return {
        id: `scene-${idx + 1}-${Date.now()}`,
        sceneIndex: idx,
        summary: sc.summary || `${tplInfo.name}: ${cleanText.slice(0, 60)}...`,
        visualPrompt: sceneVisualPrompt,
        text: cleanText,
        durationSec,
        motionStartSec: sceneStartSec,
        motionDurationSec: durationSec,
        mediaStartSec: sceneStartSec,
        mediaDurationSec: durationSec,
        subtitleStartSec: sceneStartSec,
        subtitleDurationSec: durationSec,
        audioStartSec: sceneStartSec,
        audioDurationSec: durationSec,
        templateId: templateResolved,
        componentType: templateResolved as any,
        compiledCustomHtml: procedural.html,
        compiledGsapScript: procedural.gsap,
        componentProps: {
          badge: sceneTag,
          headline: sceneHeadline,
          subtext: sceneSubText,
          highlightWords: [sc.highlightWord || 'DESTAQUE'],
          number: parseInt(String(sc.statValue || '92').replace(/\D/g, ''), 10) || 92,
          suffix: String(sc.statValue || '%').replace(/[0-9]/g, '') || '%',
          label: sc.statLabel || sceneHeadline,
          bars: sc.barsData || [
            { label: 'Abordagem Comum', value: 24, displayValue: '24%' },
            { label: 'Média do Setor', value: 51, displayValue: '51%' },
            { label: 'Novo Método', value: 96, displayValue: '96%' },
          ],
          leftTitle: sc.versusData?.leftTitle || 'O ERRO COMUM',
          leftDesc: sc.versusData?.leftItems?.[0] || 'Resultados lentos e previsíveis',
          rightTitle: sc.versusData?.rightTitle || sceneHeadline,
          rightDesc: sc.versusData?.rightItems?.[0] || sceneSubText,
          authorName: sc.authorName || 'Especialista',
          authorHandle: sc.authorHandle || '@motion_studio',
          buttonText: sc.ctaText || 'COMEÇAR AGORA',
          imageUrl: finalImage,
          images: [finalImage, finalImage],
        },
        audioUrl: `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(voiceId)}`,
        brollVideoUrl: broll.videoUrl,
        brollImageUrl: finalImage,
        collageImages: [finalImage, finalImage],
        sfxType: sc.sfxType || sfxOptions[idx % sfxOptions.length],
        cameraMotion: sc.cameraMotion || camOptions[idx % camOptions.length],
        transition: sc.transition || transOptions[idx % transOptions.length],
        visualNotes: sceneVisualPrompt,
        wordTimestamps: buildWordTimestamps(cleanText, durationSec),
      };
    });

    return NextResponse.json({
      success: true,
      title: generatedTitle,
      aspectRatio,
      presetId,
      styleMode: chosenTemplateMeta.id,
      voiceId,
      fullNarration: fullNarrationText,
      fullAudioUrl,
      scenes: enrichedScenes,
    });
  } catch (error: any) {
    console.error('Erro em /api/studio/generate-complete:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao gerar roteiro e cenas' },
      { status: 500 }
    );
  }
}

function buildTemplateDrivenFallbackScenes(prompt: string, chosenTemplateId: string, targetCount = 5): any[] {
  const cleanTopic = prompt.trim().replace(/\.$/, '');
  const words = cleanTopic.split(/\s+/);
  const hookWords = words.slice(0, Math.min(4, words.length)).join(' ').toUpperCase();
  const chosenMeta = MOTION_TEMPLATES.find((t) => t.id === chosenTemplateId) || MOTION_TEMPLATES[0];

  const scenes: any[] = [
    {
      templateId: chosenMeta.id,
      tag: chosenMeta.badge || 'ABERTURA',
      headline: hookWords || 'O SEGREDO REVELADO',
      subText: chosenMeta.description,
      highlightWord: words[0] || 'AGORA',
      text: `Quase ninguém percebe isso a tempo, mas entender ${cleanTopic.toLowerCase()} muda completamente o jogo.`,
      summary: `Abertura de alto impacto utilizando o modelo ${chosenMeta.name}.`,
      visualPrompt: `Cena de abertura executando a anatomia completa do template "${chosenMeta.name}" (${chosenMeta.id}): ${chosenMeta.description}`,
    },
    {
      templateId: 'flying-words',
      tag: 'VELOCIDADE 3D',
      headline: 'O QUE A MAIORIA IGNORA',
      subText: 'Fatores invisíveis que aceleram ou travam seus resultados',
      highlightWord: 'IGNORA',
      text: `Mais de 89 por cento das pessoas cometem erros básicos logo no início por falta de clareza e método estruturado.`,
      summary: 'Túnel 3D de palavras em hipervelocidade destacando os pontos críticos do tema.',
      visualPrompt: `Túnel 3D de palavras voando no eixo Z em direção à câmera (template flying-words) com título centralizado e iluminação volumétrica.`,
    },
    {
      templateId: 'card-stack',
      tag: 'ESTRUTURA EM LEQUE',
      headline: 'OS PILARES ESSENCIAIS',
      subText: 'Cada etapa conectada em sequência lógica',
      highlightWord: 'PILARES',
      text: `Quando você organiza os pilares certos em sequência, cada decisão passa a multiplicar o seu resultado acumulado.`,
      summary: 'Abertura de cartões em leque 3D destacando a estrutura principal do método.',
      visualPrompt: `Pilha de cartões se abre em leque 3D com física de mola (template card-stack) e eleva o cartão Hero central com mídia integrada.`,
    },
    {
      templateId: 'spotlight-hero-card',
      tag: 'FOCO CENTRAL',
      headline: 'A VIRADA DE CHAVE REAL',
      subText: 'Foco direcionado no que gera retorno imediato',
      highlightWord: 'VIRADA',
      text: `O segredo dos profissionais que dominam esse cenário é concentrar energia exatamente onde o retorno é comprovado.`,
      summary: 'Holofote teatral iluminando o card Hero com a chave principal do conteúdo.',
      visualPrompt: `Holofote cônico superior acende no escuro revelando o Card Hero central com varredura de brilho e mídia integrada (template spotlight-hero-card).`,
    },
    {
      templateId: chosenMeta.id,
      tag: 'PASSO FINAL',
      headline: 'COLOQUE EM PRÁTICA HOJE',
      subText: 'Aplique essa estratégia agora mesmo',
      highlightWord: 'HOJE',
      ctaText: 'COMEÇAR AGORA MESMO',
      text: `Aplique esses passos a partir de hoje e veja a diferença acontecer na prática.`,
      summary: 'Fechamento de alta conversão retomando a identidade visual escolhida.',
      visualPrompt: `Fechamento dinâmico com a arquitetura "${chosenMeta.name}": ${chosenMeta.description}`,
    },
  ];

  return scenes.slice(0, targetCount);
}
