import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MOTION_TEMPLATES, MotionTemplateId } from '@/lib/motion-templates';
import { getContextualMediaForScene } from '@/lib/curated-media';

/**
 * POST /api/studio/generate-blueprint
 * Motor de Roteirização e Engenharia de Direção Motion (Video-as-Code).
 * Gera cenas 100% personalizadas para o tema do usuário, incluindo:
 * - Locução de alta retenção
 * - Prompt Técnico Extenso de Engenharia Motion (Timeline segundo a segundo, curvas GSAP, camadas, tipografia e câmera)
 * - Prompt Fotográfico B-Roll em inglês + Imagens contextuais reais
 * - Dados estruturados ricos (gráficos, contadores, comparativos, checklists) específicos do tema
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = '',
      aestheticId = 'vox_documentary',
      aspectRatio = '9:16',
      targetDurationSec = 30,
      voiceTone = 'authoritative',
    } = body;

    if (!prompt.trim()) {
      return NextResponse.json({ success: false, error: 'Digite uma ideia ou tema para o vídeo.' }, { status: 400 });
    }

    const sceneCount =
      targetDurationSec <= 15 ? 3 : targetDurationSec <= 30 ? 5 : targetDurationSec <= 45 ? 7 : 8;

    const validTemplateIds = MOTION_TEMPLATES.map((t) => t.id);

    const systemInstruction = `Você é um Diretor de Arte Sênior de Motion Graphics (estilo Vox, MagnatesMedia e Alex Hormozi) e Engenheiro de Video-as-Code (GSAP / Revideo / SVG).
Sua missão é criar o Blueprint completo de um vídeo altamente profissional sobre o tema enviado pelo usuário, dividido em exatamente ${sceneCount} cenas.

DIRETRIZES DE DIREÇÃO DE ARTE & TEMPLATES POR CENA:
Você deve associar a cada cena o "templateId" ideal dentre os modelos disponíveis na nossa biblioteca:
1. CENA 0 (GANCHO / HOOK):
   - Use templates da categoria "opening" como: 'spotlight-hero-card' (foco heroico em holofote dramático), 'crane-rise-reveal' (subida em grua), 'letterspace-materialize' ou 'assemble-then-type-flyin' (esqueleto montando e texto 3D).
2. CENAS INTERMEDIÁRIAS (ARGUMENTO, DADOS E DEMONSTRAÇÃO):
   - Para enumeração de conceitos ou múltiplos recursos: use 'card-stack' (leque dinâmico de cards 3D) ou 'flying-words' (túnel de palavras em velocidade).
   - Para métricas e dados de autoridade: use 'stat_counter' (contador neon), 'chart-live-moves' (gráficos vivos) ou 'gauge-readout-moves' (velocímetro).
   - Para comparações: use 'versus_comparison' ou 'before-after-slider-scrub' (antes e depois).
3. CENA FINAL (CONCLUSÃO & CTA):
   - Use 'ui-strip-away-outro' (desmonte minimalista para o CTA), 'cta_pulse' ou 'logo-shrink-wordmark-lockup'.

REGRAS OBRIGATÓRIAS:
1. O campo "motionPrompt" de CADA cena DEVE ter entre 60 e 100 palavras especificando a coreografia:
   - [0.0s - 0.8s]: Entrada dos elementos e easing GSAP.
   - [0.8s - 3.5s]: Movimento tipográfico e animação de ícones/cards.
   - [3.5s - FIM]: Câmera 2.5D e transição.
2. O campo "templateId" de cada cena deve ser escolhido criteriosamente dentre:
   ${validTemplateIds.slice(0, 30).join(', ')}, etc.
3. O campo "visualPrompt" deve ser em INGLÊS, descrevendo uma fotografia cinematográfica 8k hiper-realista e específica para aquela cena.
4. Preencha os dados ricos ("statValue", "statLabel", "headline", "subText", "tag") com dados persuasivos sobre "${prompt}".

Retorne ESTRITAMENTE um JSON válido no seguinte formato:
{
  "projectTitle": "Título Magnético do Projeto",
  "searchTopicEnglish": "main topic in english",
  "scenes": [
    {
      "sceneIndex": 0,
      "templateId": "hormozi_bold",
      "durationSec": 5.0,
      "text": "Texto completo falado pelo narrador nesta cena, natural e magnético.",
      "tag": "BADGE CURTA DE TOPO",
      "headline": "MANCHETE PRINCIPAL VISUAL DA CENA",
      "subText": "Subtítulo complementar de apoio visual",
      "highlightWord": "PALAVRA",
      "sfx": "impact",
      "cameraMotion": "zoom_in",
      "visualPrompt": "Detailed English cinematic photography prompt specific to this scene...",
      "searchKeywords": "specific english keywords",
      "motionPrompt": "[0.0s - 0.8s ENTRADA]: Fundo B-Roll inicia em scale(1.18) com blur(12px) reduzindo para 0px via power3.out enquanto vinheta radial escura (#05070f) estabiliza contraste. Badge superior entra de y:-80 com mola back.out(2) acompanhada de SFX impact. [0.8s - 3.6s COREOGRAFIA]: Headline central emerge linha por linha com stagger(0.12) e rotação 3D rotateX(25deg -> 0deg). A palavra-chave recebe caixa de grifo amarelo neon (#facc15) desenhada da esquerda para a direita (width: 0% -> 100% em 0.35s). Legenda word-by-word sincronizada no terço inferior com pop elástico scale(1.22) em cada sílaba tônica. [3.6s - 5.0s CLÍMAX]: Câmera executa dolly zoom progressivo até scale(1.12) com partículas de luz flutuantes e corte seco.",
      "statValue": "87%",
      "statLabel": "Explicação da métrica caso use stat_counter",
      "barsData": [
        { "label": "Item A", "value": 35, "displayValue": "35%" },
        { "label": "Item B", "value": 92, "displayValue": "92%" }
      ],
      "versusData": {
        "leftTitle": "MODELO ANTIGO",
        "leftItems": ["Ponto negativo 1", "Ponto negativo 2"],
        "rightTitle": "NOVO MÉTODO",
        "rightItems": ["Vantagem 1", "Vantagem 2"]
      },
      "stepsData": [
        "Primeiro passo prático ou item",
        "Segundo passo prático ou item",
        "Terceiro passo prático ou item"
      ],
      "authorName": "Nome da Fonte / Especialista",
      "authorHandle": "@especialista"
    }
  ]
}`;

    const userPrompt = `Tema / Ideia do Vídeo: "${prompt}"
Estética Visual Escolhida: ${aestheticId}
Proporção de Tela: ${aspectRatio}
Duração Total Alvo: ${targetDurationSec} segundos (${sceneCount} cenas)
Tom da Locução: ${voiceTone}`;

    let parsedResult: any = null;

    // 1. Tenta Gemini API se configurada
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([{ text: systemInstruction }, { text: userPrompt }]);
        const raw = result.response.text();
        parsedResult = extractJson(raw);
      } catch (e) {
        console.warn('Gemini fallback to Pollinations OpenAI:', e);
      }
    }

    // 2. Usa Pollinations OpenAI JSON Endpoint (Zero-Config Real LLM)
    if (!parsedResult || !Array.isArray(parsedResult.scenes)) {
      try {
        const aiRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || '';
          parsedResult = extractJson(content);
        }
      } catch (err) {
        console.warn('Pollinations OpenAI error:', err);
      }
    }

    // 3. Normaliza e enriquece todas as cenas geradas com mídias contextuais reais
    const rawScenes = Array.isArray(parsedResult?.scenes) && parsedResult.scenes.length > 0
      ? parsedResult.scenes
      : buildContextualFallbackScenes(prompt, sceneCount);

    const width = aspectRatio === '16:9' ? 1280 : 1080;
    const height = aspectRatio === '16:9' ? 720 : aspectRatio === '1:1' ? 1080 : 1920;

    const enrichedScenes = rawScenes.map((sc: any, idx: number) => {
      const templateMeta =
        MOTION_TEMPLATES.find((t) => t.id === sc.templateId) ||
        MOTION_TEMPLATES[idx % MOTION_TEMPLATES.length];

      const visualPrompt =
        sc.visualPrompt ||
        `Cinematic high contrast editorial photography about ${prompt}, scene ${idx + 1}, dramatic studio lighting, 8k`;

      const narration = String(sc.text || '').trim();
      const visualKeywords = sc.searchKeywords || prompt;
      const verifiedMedia = getContextualMediaForScene(narration, visualKeywords, idx);

      const words = narration.split(/\s+/).filter(Boolean);
      const estimatedDur = Math.max(4.0, Math.min(7.5, Number(sc.durationSec) || Math.round(words.length * 0.38 * 10) / 10));

      return {
        id: `scene-${idx + 1}-${Date.now()}`,
        sceneIndex: idx,
        templateId: templateMeta.id as MotionTemplateId,
        durationSec: estimatedDur,
        text: narration,
        tag: sc.tag || templateMeta.badge,
        headline: sc.headline || narration.split(/[.,!?]/)[0]?.toUpperCase().slice(0, 48) || prompt.toUpperCase(),
        subText: sc.subText || `Cena #${idx + 1}`,
        highlightWord: sc.highlightWord || findBestHighlightWord(narration),
        highlightColor: templateMeta.defaultHighlightColor,
        sfx: 'none',
        cameraMotion: sc.cameraMotion || (idx % 2 === 0 ? 'zoom_in' : 'float_3d'),
        visualPrompt,
        searchKeywords: visualKeywords,
        motionPrompt:
          sc.motionPrompt && sc.motionPrompt.length > 80
            ? sc.motionPrompt
            : buildDetailedMotionPrompt(idx + 1, templateMeta.name, narration, sc.headline || prompt, estimatedDur),
        brollUrl: verifiedMedia,
        collageImages: [verifiedMedia],
        statValue: sc.statValue || '94%',
        statLabel: sc.statLabel || sc.headline || narration.slice(0, 60),
        barsData: Array.isArray(sc.barsData) && sc.barsData.length > 0
          ? sc.barsData
          : [
              { label: 'Abordagem Comum', value: 28, displayValue: '28%' },
              { label: 'Média do Setor', value: 54, displayValue: '54%' },
              { label: 'Alta Performance', value: 94, displayValue: '94%' },
            ],
        versusData: sc.versusData || {
          leftTitle: 'MODELO TRADICIONAL',
          leftItems: ['Baixa retenção visual', 'Processo lento e manual', 'Sem previsibilidade'],
          rightTitle: 'NOVA ESTRUTURA',
          rightItems: ['Retenção magnética nos 3s', 'Escala automatizada', 'Conversão comprovada'],
        },
        stepsData: Array.isArray(sc.stepsData) && sc.stepsData.length > 0
          ? sc.stepsData
          : [
              'Capture a atenção nos primeiros 2 segundos com contraste visual',
              'Apresente provas visuais, dados e movimento contínuo na tela',
              'Direcione para uma ação única e irresistível no fechamento',
            ],
        authorName: sc.authorName || 'Relatório Executivo',
        authorHandle: sc.authorHandle || '@analise_mercado',
        ctaText: sc.ctaText || sc.headline || 'COMECE AGORA MESMO',
      };
    });

    return NextResponse.json({
      success: true,
      projectTitle: parsedResult?.projectTitle || prompt.slice(0, 55),
      searchTopicEnglish: parsedResult?.searchTopicEnglish || prompt.slice(0, 40),
      scenes: enrichedScenes,
    });
  } catch (error: any) {
    console.error('Erro em generate-blueprint:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao gerar blueprint do vídeo' },
      { status: 500 }
    );
  }
}

function extractJson(raw: string): any {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function findBestHighlightWord(text: string): string {
  const words = text
    .replace(/[.,!?;:"]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 5);
  return (words[Math.floor(words.length / 2)] || words[0] || 'AGORA').toUpperCase();
}

function buildDetailedMotionPrompt(
  sceneNumber: number,
  templateName: string,
  narration: string,
  headline: string,
  duration: number
): string {
  return `[0.0s - 0.8s | ENTRADA & IMPACTO VISUAL]: Camada B-Roll inicia em scale(1.22) com filtro de contraste dramático e vinheta radial profunda (#05070f), desacelerando via curva GSAP power3.out. A badge superior da Cena #${sceneNumber} (${templateName}) desliza de y:-90px com elastic.out(1, 0.6) sincronizada ao efeito sonoro de transição.\n[0.8s - ${(duration - 1.0).toFixed(1)}s | COREOGRAFIA DE ELEMENTOS & TIMELINE]: O bloco central "${headline}" revela seus elementos vetoriais com stagger(0.14s) e perspectiva 3D (rotateX: 18deg -> 0deg). A barra de destaque luminosa expande de width:0% a 100% atrás da palavra-chave principal, enquanto o motor de legendas cinéticas destaca cada palavra de "${narration.slice(0, 60)}..." no exato milissegundo da voz neural.\n[${(duration - 1.0).toFixed(1)}s - ${duration.toFixed(1)}s | CLÍMAX & TRANSIÇÃO]: Câmera executa movimento orbital contínuo até scale(1.12), intensificando o glow neon nos indicadores visuais antes do corte determinístico.`;
}

function buildContextualFallbackScenes(prompt: string, count: number): any[] {
  const cleanTopic = prompt.trim();
  const baseTemplates: MotionTemplateId[] = [
    'hormozi_bold',
    'news_headline',
    'stat_counter',
    'grafico_barras',
    'versus_comparison',
    'lista_passos',
    'quote_autoridade',
    'cta_pulse',
  ];

  const templates = baseTemplates.slice(0, count);
  if (templates[templates.length - 1] !== 'cta_pulse') {
    templates[templates.length - 1] = 'cta_pulse';
  }

  return templates.map((tpl, idx) => ({
    sceneIndex: idx,
    templateId: tpl,
    durationSec: 4.8,
    text:
      idx === 0
        ? `Quase ninguém percebeu, mas a forma como entendemos ${cleanTopic} acabou de mudar completamente.`
        : idx === 1
        ? `Nos bastidores do mercado, uma nova estrutura está redefinindo quem domina ${cleanTopic}.`
        : idx === 2
        ? `Mais de 89 por cento das iniciativas falham porque ignoram o princípio mais importante de ${cleanTopic}.`
        : idx === count - 1
        ? `Aplique essa estratégia em ${cleanTopic} hoje mesmo e assuma a liderança antes da maioria.`
        : `Quando você analisa os dados reais sobre ${cleanTopic}, a diferença de resultado fica impossível de ignorar.`,
    tag: idx === 0 ? 'GANCHO DE RETENÇÃO' : idx === count - 1 ? 'PRÓXIMO PASSO' : `ANÁLISE #${idx}`,
    headline: `${cleanTopic.toUpperCase().slice(0, 36)}`,
    visualPrompt: `${cleanTopic}, cinematic dark moody photography, dramatic lighting, 8k ultra detailed, scene ${idx + 1}`,
    searchKeywords: cleanTopic.slice(0, 30),
  }));
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
