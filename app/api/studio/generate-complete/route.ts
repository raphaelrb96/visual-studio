import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptScene, WordTimestamp, SfxType, CameraMotionType, TransitionType } from '@/types/studio';
import { selectContextualBroll } from '@/lib/broll-library';
import { getContextualMediaForScene } from '@/lib/curated-media';

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
  return Number(Math.max(3.8, Math.min(7.2, words / 2.6 + 0.8)).toFixed(1));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = 'Como atrair clientes qualificados todos os dias usando vídeos curtos automáticos',
      styleMode = 'viral_hormozi',
      aspectRatio = '9:16',
      presetId = 'kinetic_yellow',
      targetDurationSec = 30,
      targetSceneCount = 6,
      voiceId = 'antonio',
    } = body;

    const sceneCount = Math.max(4, Math.min(18, Number(targetSceneCount) || Math.round(Number(targetDurationSec) / 5) || 6));

    const apiKey = process.env.GEMINI_API_KEY;
    let rawScenes: Partial<ScriptScene>[] = [];
    let generatedTitle = prompt.slice(0, 52);

    const systemInstruction = `
Você é uma equipe de Diretores de Motion Graphics e Roteiristas Virais para Vídeos Curtos (Reels, TikTok, Shorts).
O usuário quer criar um vídeo sobre: "${prompt}".
Duração total alvo: ~${targetDurationSec} segundos.
Quantidade exata de cenas: ${sceneCount} cenas.

Você DEVE alternar entre a biblioteca de 12 componentes HyperFrame:
1. "Object3DShowcase": Objeto 3D real renderizado em WebGL (object3d: 'coin' | 'diamond' | 'shield' | 'cube', title: 'VALOR AGREGADO', subtitle: 'Ativo digital em ascensão').
2. "CollageBroll": Colagem estilizada e dinâmica de 3 B-Rolls recortados com movimento Parallax Ken Burns (badge: 'CASO REAL', headline: 'IMPACTO VISUAL').
3. "CardFrase": Headline curta em caixa alta com highlightWords e badge.
4. "StatCounter": Número de impacto gigante com suffix ("%" ou "x") e label explicativo.
5. "TweetCard": Simulação de post viral no X / Twitter (authorName, authorHandle, tweetText).
6. "NewsHeadline": Manchete urgente de jornal (portalName: 'THE WALL STREET JOURNAL', headline em caixa alta).
7. "ChatSimulation": Conversa simulada (contactName, senderText, replyText).
8. "VersusComparison": Comparativo lado a lado (leftTitle: 'O JEITO COMUM', rightTitle: 'COM A NOSSA SOLUÇÃO').
9. "QuoteCard": Citação marcante de autoridade (quoteText, authorName, authorRole).
10. "GraficoBarras": Ranking ou comparativo numérico (title, bars: [{label, value, formatted}]).
11. "GraficoPizza": Distribuição percentual (title, slices: [{label, value, color}]).
12. "CTAButton": Obrigatoriamente na última cena como chamada para ação direta.

Crie exatamente ${sceneCount} cenas no seguinte formato JSON puro:
{
  "title": "Título do Vídeo",
  "scenes": [
    {
      "text": "Frase falada pelo narrador em português com ritmo humano e persuasivo.",
      "componentType": "NewsHeadline",
      "sfxType": "impact",
      "cameraMotion": "zoom_in",
      "transition": "flash_zoom",
      "visualNotes": "Entrada rápida com flash branco e manchete com destaque neon.",
      "componentProps": {
        "portalName": "THE WALL STREET JOURNAL",
        "headline": "NOTÍCIA EXPLOSIVA DO SETOR",
        "badge": "URGENTE"
      }
    }
  ]
}
`;

    // 1. Tenta Gemini se configurado
    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(systemInstruction);
        const responseText = result.response
          .text()
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(responseText);
        if (parsed?.scenes && Array.isArray(parsed.scenes)) {
          rawScenes = parsed.scenes;
          if (parsed.title) generatedTitle = parsed.title;
        }
      } catch (aiErr) {
        console.warn('Gemini fallback to Pollinations OpenAI:', aiErr);
      }
    }

    // 2. Tenta Pollinations OpenAI JSON se não tiver Gemini
    if (rawScenes.length === 0) {
      try {
        const aiRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: `Tema: "${prompt}"` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const parsed = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');
          if (parsed?.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
            rawScenes = parsed.scenes;
            if (parsed.title) generatedTitle = parsed.title;
          }
        }
      } catch (pollErr) {
        console.warn('Pollinations error:', pollErr);
      }
    }

    // 3. Fallback Dinâmico Estruturado
    if (rawScenes.length === 0) {
      rawScenes = buildDynamicHyperframeScenes(prompt, styleMode, sceneCount);
    }

    const sfxOptions: SfxType[] = ['impact', 'whoosh', 'pop', 'cash', 'cinematic_boom', 'glitch', 'rise'];
    const camOptions: CameraMotionType[] = ['zoom_in', 'float_3d', 'pan_right', 'zoom_out', 'pan_left'];
    const transOptions: TransitionType[] = ['flash_zoom', 'spring_slide', 'glitch_cut', 'fade'];

    const enrichedScenes: ScriptScene[] = rawScenes.map((sc, idx) => {
      const cleanText = sc.text || 'Descubra como transformar seus resultados hoje mesmo.';
      const durationSec = estimateSpeechDuration(cleanText);
      const curatedMedia = getContextualMediaForScene(cleanText, prompt, idx);
      const broll = selectContextualBroll(`${prompt} ${cleanText}`, idx);
      const finalImage = curatedMedia || broll.imageUrl;

      return {
        id: `scene-${idx + 1}-${Date.now()}`,
        sceneIndex: idx,
        text: cleanText,
        durationSec,
        componentType: sc.componentType || 'CardFrase',
        componentProps: {
          ...sc.componentProps,
          imageUrl: sc.componentProps?.imageUrl || finalImage,
          images: sc.componentProps?.images || [finalImage, finalImage],
        },
        audioUrl: `/api/tts?text=${encodeURIComponent(cleanText)}&voice=${encodeURIComponent(voiceId)}`,
        brollVideoUrl: broll.videoUrl,
        brollImageUrl: finalImage,
        collageImages: [finalImage, finalImage],
        sfxType: sc.sfxType || sfxOptions[idx % sfxOptions.length],
        cameraMotion: sc.cameraMotion || camOptions[idx % camOptions.length],
        transition: sc.transition || transOptions[idx % transOptions.length],
        visualNotes:
          sc.visualNotes ||
          `Cena #${idx + 1}: Animação Motion Graphics dinâmica ativa.`,
        hyperframeConfig: {
          physicsDamping: 14,
          physicsStiffness: 130,
          threeJsObject: (sc.componentProps?.object3d as any) || (['coin', 'diamond', 'shield', 'cube'][idx % 4] as any),
          lightColor: '#38bdf8',
        },
        wordTimestamps: buildWordTimestamps(cleanText, durationSec),
      };
    });

    return NextResponse.json({
      success: true,
      title: generatedTitle,
      presetId,
      aspectRatio,
      scenes: enrichedScenes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao gerar vídeo completo' },
      { status: 500 }
    );
  }
}

function buildDynamicHyperframeScenes(prompt: string, styleMode: string, targetCount = 6): Partial<ScriptScene>[] {
  const cleanTopic = prompt.trim().replace(/\.$/, '');
  const words = cleanTopic.split(/\s+/);
  const shortSubject = words.slice(0, 5).join(' ');

  const pool: Partial<ScriptScene>[] = [
    {
      text: `Atenção: uma mudança silenciosa acabou de transformar tudo sobre ${shortSubject} no mercado.`,
      componentType: 'NewsHeadline',
      sfxType: 'impact',
      cameraMotion: 'zoom_in',
      transition: 'flash_zoom',
      visualNotes: 'Recorte urgente de jornal com zoom dramático e vinheta escura.',
      componentProps: {
        portalName: 'THE WALL STREET JOURNAL',
        headline: `${cleanTopic.toUpperCase().slice(0, 48)}: A VIRADA DO MERCADO`,
        badge: 'BREAKING NEWS',
        dateStr: 'Relatório Exclusivo 2026',
      },
    },
    {
      text: `Veja como os líderes estão acumulando ativos de alto valor enquanto a maioria segue o modelo antigo.`,
      componentType: 'Object3DShowcase',
      sfxType: 'cash',
      cameraMotion: 'float_3d',
      transition: 'spring_slide',
      visualNotes: 'Cubo / Moeda 3D em rotação contínua WebGL com brilho de estúdio.',
      componentProps: {
        object3d: 'coin',
        title: 'CRESCIMENTO EXPONENCIAL',
        subtitle: 'Ativos digitais e tecnologia avançada',
      },
    },
    {
      text: `Mais de 84% das pessoas que tentam esse método sem a estratégia certa acabam travando.`,
      componentType: 'StatCounter',
      sfxType: 'pop',
      cameraMotion: 'pan_right',
      transition: 'glitch_cut',
      visualNotes: 'Contador gigante animando de 0 a 84% com pulso neon.',
      componentProps: {
        number: 84,
        suffix: '%',
        prefix: '+',
        label: 'Atenção e Retenção no Formato Vertical',
        description: 'Dados comprovados do comportamento de consumo',
      },
    },
    {
      text: `Olhe a diferença brutal entre continuar no processo manual ou automatizar sua produção inteira.`,
      componentType: 'VersusComparison',
      sfxType: 'cinematic_boom',
      cameraMotion: 'zoom_in',
      transition: 'flash_zoom',
      visualNotes: 'Split screen comparativo com contraste vermelho vs verde esmeralda.',
      componentProps: {
        leftTitle: 'O MÉTODO TRADICIONAL',
        leftDesc: 'Horas perdidas em edições manuais e custo altíssimo',
        rightTitle: 'COM NOSSA SOLUÇÃO',
        rightDesc: 'Vídeo 100% pronto e animado em segundos',
      },
    },
    {
      text: `As conversas nos bastidores mostram resultados imediatos logo nas primeiras 48 horas de campanha.`,
      componentType: 'ChatSimulation',
      sfxType: 'typing',
      cameraMotion: 'pan_left',
      transition: 'spring_slide',
      visualNotes: 'Simulação de mensagens com check azul duplo e pop elástico.',
      componentProps: {
        contactName: 'Diretor Comercial',
        senderText: 'Você viu o CTR do vídeo novo com elementos 3D?',
        replyText: 'Bateu 4.8x mais retenção que o criativo estático!',
      },
    },
    {
      text: `O crescimento em ranking supera qualquer formato estático tradicional nas redes sociais.`,
      componentType: 'GraficoBarras',
      sfxType: 'rise',
      cameraMotion: 'zoom_in',
      transition: 'fade',
      visualNotes: 'Barras progressivas com preenchimento neon sincronizado.',
      componentProps: {
        title: 'TAXA DE RETENÇÃO POR FORMATO',
        bars: [
          { label: 'Motion + B-Roll', value: 94, formatted: '94%' },
          { label: 'Corte Simples', value: 52, formatted: '52%' },
          { label: 'Post Estático', value: 18, formatted: '18%' },
        ],
      },
    },
    {
      text: `A blindagem de autoridade acontece quando seu conteúdo combina estética de cinema com dados claros.`,
      componentType: 'Object3DShowcase',
      sfxType: 'impact',
      cameraMotion: 'float_3d',
      transition: 'glitch_cut',
      visualNotes: 'Diamante / Escudo 3D rotacionando em WebGL com reflexo especular.',
      componentProps: {
        object3d: 'diamond',
        title: 'AUTORIDADE PREMIUM',
        subtitle: 'Posicionamento visual inconfundível',
      },
    },
    {
      text: `Como já destacavam os maiores estrategistas: quem domina a atenção visual domina todo o mercado.`,
      componentType: 'QuoteCard',
      sfxType: 'whoosh',
      cameraMotion: 'zoom_out',
      transition: 'fade',
      visualNotes: 'Card de citação dourado com 5 estrelas e retrato em moldura.',
      componentProps: {
        quoteText: 'Quem domina a retenção visual nos primeiros 3 segundos domina o mercado.',
        authorName: 'Alex Hormozi',
        authorRole: 'Estrategista de Escala',
      },
    },
    {
      text: `Veja a repercussão real de quem já transformou ideias em vídeos de alta conversão.`,
      componentType: 'TweetCard',
      sfxType: 'pop',
      cameraMotion: 'float_3d',
      transition: 'spring_slide',
      visualNotes: 'Card X/Twitter com selo verificado e inclinação 3D.',
      componentProps: {
        authorName: 'Tech Founder',
        authorHandle: '@founder_ai',
        tweetText: 'Substituímos 12 horas de After Effects por 60 segundos de geração com IA e Motion Graphics.',
      },
    },
    {
      text: `A distribuição de resultados comprova onde você deve concentrar sua energia criativa hoje.`,
      componentType: 'GraficoPizza',
      sfxType: 'whoosh',
      cameraMotion: 'zoom_in',
      transition: 'flash_zoom',
      visualNotes: 'Gráfico circular animado com legenda lateral.',
      componentProps: {
        title: 'IMPACTO NA CONVERSÃO',
        slices: [
          { label: 'Gancho Visual Motion', value: 55, color: '#eab308' },
          { label: 'Ritmo & Sound Design', value: 30, color: '#38bdf8' },
          { label: 'Copywriting', value: 15, color: '#a855f7' },
        ],
      },
    },
    {
      text: `Toque no botão abaixo agora mesmo e comece a produzir seus vídeos com inteligência artificial hoje.`,
      componentType: 'CTAButton',
      sfxType: 'rise',
      cameraMotion: 'zoom_in',
      transition: 'flash_zoom',
      visualNotes: 'Botão CTA pulsante com brilho intenso.',
      componentProps: {
        buttonText: 'Quero Começar Agora',
        subcaption: 'Acesso Imediato • Renderização em 60fps',
        accentColor: '#eab308',
      },
    },
  ];

  if (targetCount <= pool.length) {
    const selected = pool.slice(0, targetCount - 1);
    selected.push(pool[pool.length - 1]);
    return selected;
  }

  const extended: Partial<ScriptScene>[] = [];
  for (let i = 0; i < targetCount - 1; i++) {
    extended.push(pool[i % (pool.length - 1)]);
  }
  extended.push(pool[pool.length - 1]);
  return extended;
}
