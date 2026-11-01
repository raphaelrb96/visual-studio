import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptScene, WordTimestamp, SfxType, CameraMotionType, TransitionType } from '@/types/studio';
import { selectContextualBroll } from '@/lib/broll-library';
import { getContextualMediaForScene } from '@/lib/curated-media';
import { MotionTemplateId } from '@/lib/motion-templates';
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
  return Number(Math.max(3.8, Math.min(7.2, words / 2.6 + 0.8)).toFixed(1));
}

// Normalizador de TemplateId para garantir que caia em um dos 20 templates reais do compilador
function normalizeTemplateId(input: string | undefined, defaultTemplate: string): MotionTemplateId {
  if (!input) return (defaultTemplate as MotionTemplateId) || 'hormozi_bold';
  const clean = input.toLowerCase().trim().replace(/[- ]/g, '_');

  const map: Record<string, MotionTemplateId> = {
    // 1. Ganchos & Retenção
    hormozi_bold: 'hormozi_bold',
    hormozi: 'hormozi_bold',
    cardfrase: 'hormozi_bold',
    card_frase: 'hormozi_bold',
    alerta_urgente: 'alerta_urgente',
    alerta: 'alerta_urgente',
    urgent: 'alerta_urgente',
    pergunta_provocativa: 'pergunta_provocativa',
    pergunta: 'pergunta_provocativa',
    question: 'pergunta_provocativa',
    segredo_revelado: 'segredo_revelado',
    segredo: 'segredo_revelado',
    secret: 'segredo_revelado',
    confidencial: 'segredo_revelado',

    // 2. Notícias & Prova Social
    news_headline: 'news_headline',
    newsheadline: 'news_headline',
    news: 'news_headline',
    breaking_news: 'news_headline',
    tweet_card: 'tweet_card',
    tweetcard: 'tweet_card',
    tweet: 'tweet_card',
    twitter: 'tweet_card',
    x_post: 'tweet_card',
    chat_simulation: 'chat_simulation',
    chatsimulation: 'chat_simulation',
    chat: 'chat_simulation',
    whatsapp: 'chat_simulation',
    imessage: 'chat_simulation',
    quote_autoridade: 'quote_autoridade',
    quotecard: 'quote_autoridade',
    quote: 'quote_autoridade',

    // 3. Dados & Métricas
    stat_counter: 'stat_counter',
    statcounter: 'stat_counter',
    counter: 'stat_counter',
    estatistica: 'stat_counter',
    grafico_barras: 'grafico_barras',
    graficobarras: 'grafico_barras',
    bar_chart: 'grafico_barras',
    versus_comparison: 'versus_comparison',
    versuscomparison: 'versus_comparison',
    versus: 'versus_comparison',
    comparativo: 'versus_comparison',
    timeline_progress: 'timeline_progress',
    timeline: 'timeline_progress',

    // 4. Mídia & B-Roll
    ken_burns_cinematic: 'ken_burns_cinematic',
    kenburns: 'ken_burns_cinematic',
    cinema: 'ken_burns_cinematic',
    split_collage: 'split_collage',
    splitcollage: 'split_collage',
    collage: 'split_collage',
    collagebroll: 'split_collage',
    broll_spotlight: 'broll_spotlight',
    spotlight: 'broll_spotlight',
    card_frase_impacto: 'card_frase_impacto',
    mediabroll: 'broll_spotlight',

    // 5. Conversão & CTA
    cta_pulse: 'cta_pulse',
    ctabutton: 'cta_pulse',
    cta: 'cta_pulse',
    botao: 'cta_pulse',
    ranking_top3: 'ranking_top3',
    top3: 'ranking_top3',
    ranking: 'ranking_top3',
    lista_passos: 'lista_passos',
    checklist: 'lista_passos',
    passos: 'lista_passos',
    minimal_luxury: 'minimal_luxury',
    luxury: 'minimal_luxury',
  };

  return map[clean] || (defaultTemplate as MotionTemplateId) || 'hormozi_bold';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = 'Como atrair clientes qualificados todos os dias usando vídeos curtos automáticos',
      styleMode = 'hormozi_bold',
      aspectRatio = '9:16',
      presetId = 'kinetic_yellow',
      targetDurationSec = 30,
      targetSceneCount = 5,
      voiceId = 'antonio',
    } = body;

    const sceneCount = Math.max(4, Math.min(10, Number(targetSceneCount) || 5));
    const apiKey = process.env.GEMINI_API_KEY;
    let rawScenes: any[] = [];
    let generatedTitle = prompt.slice(0, 52);
    let fullNarrationText = '';

    const chosenTemplate = styleMode || 'hormozi_bold';

    // Prompt de Sistema com Instruções Ricas para a IA (retornar JSON completo preenchido com Motion Graphics específicos)
    const systemInstruction = `
Você é uma equipe de Diretores de Cinema, Motion Designers e Roteiristas Virais Especializados em Vídeos Curtos (TikTok, Shorts, Reels).
O tema do vídeo é: "${prompt}".
O estilo/template principal escolhido pelo usuário é: "${chosenTemplate}".
Duração alvo: ~${targetDurationSec} segundos.
Quantidade de cenas: exatamente ${sceneCount} cenas.

DIRETRIZES FUNDAMENTAIS DE ROTEIRO & MOTION:
1. NARRAÇÃO UNIFICADA E CONTÍNUA ("fullNarration"):
   - Crie uma locução fluida, magnética e humana do início ao fim em português (pt-BR).
   - Sem interrupções mecânicas ou cortes artificiais. Ritmo estilo Alex Hormozi / Vox / MagnatesMedia.
2. CENAS VISUAIS ESPECÍFICAS ("scenes"):
   - Para cada cena, defina o "templateId" ideal selecionando da lista abaixo. Varie com inteligência entre ganchos, prova, dados numéricos e CTA final:
     * "hormozi_bold": Tipografia gigante amarela neon, foco em palavras de choque.
     * "alerta_urgente": Badge vermelho piscante de emergência ou notícia crítica.
     * "pergunta_provocativa": Ponto de interrogação elástico roxo com gancho de reflexão.
     * "segredo_revelado": Tarja preta de censura que é destravada para revelar verdade oculta.
     * "news_headline": Manchete de telejornal investigativo (portalName, headline, badge).
     * "tweet_card": Post viral no X/Twitter com selo de verificado e métricas (authorName, authorHandle, tweetText).
     * "chat_simulation": Conversa de WhatsApp/iMessage contando um bastidor chocante.
     * "quote_autoridade": Citação elegante de autoridade com aspas douradas.
     * "stat_counter": Número gigante animado com contagem (statValue: "84%", statLabel, subText).
     * "grafico_barras": Gráfico comparativo de barras verticais (title, barsData: [{label, value, displayValue}]).
     * "versus_comparison": Comparativo lado a lado (versusData: {leftTitle, leftItems: [], rightTitle, rightItems: []}).
     * "timeline_progress": Linha do tempo ou passo a passo progressivo (stepsData: ["Passo 1", "Passo 2", "Passo 3"]).
     * "split_collage": Duas imagens em movimento dinâmico com vinheta.
     * "ranking_top3": Pódio de melhores soluções #1, #2, #3.
     * "cta_pulse": Obrigatoriamente na última cena com botão animado de chamada para ação.

3. PROMPT VISUAL CINEMATOGRÁFICO HIPER-DETALHADO ("visualPrompt") - A ALMA DA CENA:
   - Este campo é a DIRETRIZ VISUAL COMPLETA que a IA de geração de código usará na etapa seguinte para desenhar o vídeo (Code to Video).
   - NUNCA crie prompts curtos ou genéricos! Cada "visualPrompt" DEVE ter entre 3 a 6 linhas longas e minuciosas descrevendo:
     * Arquitetura e Cenografia Visual: elementos vetoriais SVG, camadas em profundidade 3D (perspectiva 1200px), formas geométricas, cards de vidro com blur e reflexos.
     * Paleta de Cores e Iluminação Volumétrica: contrastes fortes, luzes neon periféricas (glow ciano, dourado ou vermelho alerta), partículas suspensas e vinhetas cinematográficas.
     * Elementos Gráficos Centrais: exatamente o que deve estar em cena (ex: medidor radial de 0 a 100%, pirâmide de camadas, gráfico de barras ascendente, selo metálico carimbado, arena de combate split-screen, cursor clicando com ripple de ondas).
     * Coreografia de Animação e Movimento de Câmera: velocidade de entrada, curvas de aceleração com molas (back.out, elastic.out), rotações orbitais de retículas HUD secundárias e zoom contínuo de retenção (Ken Burns) ao longo dos segundos da cena.
     * Efeitos de Áudio e Impacto (SFX): whoosh na entrada, impacto metálico ou clique digital.

4. CAMPOS OBRIGATÓRIOS NO JSON DE CADA CENA:
   - "summary": Resumo limpo em 1 frase direta da narrativa da cena.
   - "visualPrompt": Descrição técnica e artística minuciosa da composição gráfica (mínimo 2 a 3 frases densas com posições, cores, efeitos, animações GSAP e transições).
   - "text": O trecho falado correspondente nesta cena.
   - "templateId": O ID exato do template motion acima.
   - "tag": Badge curta em caixa alta (ex: "ALERTA", "DADO REAL", "SEGREDO").
   - "headline": Título curto de até 5 palavras em caixa alta de alto impacto visual.
   - "subText": Linha de apoio descritiva.
   - "highlightWord": A palavra mais importante para o brilho neon.
   - "statValue": Valor com % ou x (caso use stat_counter).
   - "statLabel": Rótulo explicativo da estatística.
   - "barsData": Array de barras (se for grafico_barras).
   - "versusData": Objeto com leftTitle, leftItems, rightTitle, rightItems (se for versus_comparison).
   - "authorName" e "authorHandle" (se for tweet_card).
   - "ctaText": Texto chamativo do botão final (se for cta_pulse).

RETORNE APENAS JSON PURO NO SEGUINTE FORMATO:
{
  "title": "Título Curto do Vídeo",
  "fullNarration": "Texto corrido integral da locução do início ao fim...",
  "scenes": [
    {
      "summary": "Resumo da cena",
      "visualPrompt": "Composição central com card flutuante em glassmorphism translúcido, posicionado a 45% do topo do Canvas 9:16. Iluminação volumétrica neon amarela pulsando no fundo com vinheta escura profunda. Entrada do elemento central com impacto elástico em escala de 0.8 para 1.0 com mola GSAP, acompanhado de flash branco e efeito de som whoosh. Câmera executa zoom-in contínuo de 1.15x durante os 4.5 segundos da cena, com partículas luminosas flutuando em segundo plano.",
      "text": "Frase falada",
      "templateId": "news_headline",
      "tag": "EXCLUSIVO",
      "headline": "MUDANÇA RADICAL NO MERCADO",
      "subText": "Relatório revela a virada nos negócios digitais",
      "highlightWord": "RADICAL",
      "statValue": "90%",
      "statLabel": "dos criadores já migraram"
    }
  ]
}
`;

    // 1. Tenta Gemini com chave ativa (gemini-3.5-flash-lite com cota ativa)
    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
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

    // 2. Tenta Pollinations OpenAI API se não houver Gemini configurado (com timeout estrito de 2.0s para resposta ultra-rápida)
    if (rawScenes.length === 0) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        const aiRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: `Tema: "${prompt}". Estilo: "${chosenTemplate}".` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const cleanJson = aiData.choices?.[0]?.message?.content?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim();
          const parsed = JSON.parse(cleanJson || '{}');
          if (parsed?.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
            rawScenes = parsed.scenes;
            if (parsed.title) generatedTitle = parsed.title;
            if (parsed.fullNarration) fullNarrationText = parsed.fullNarration;
          }
        }
      } catch (pollErr) {
        console.warn('Pollinations OpenAI fallback rápido acionado:', pollErr);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // 3. Fallback Dinâmico Inteligente e Totalmente Customizado pelo Tema e pelo Template
    if (rawScenes.length === 0) {
      rawScenes = buildDynamicHyperframeScenes(prompt, chosenTemplate, sceneCount);
    }

    const sfxOptions: SfxType[] = ['impact', 'whoosh', 'pop', 'cash', 'cinematic_boom', 'glitch', 'rise'];
    const camOptions: CameraMotionType[] = ['zoom_in', 'float_3d', 'pan_right', 'zoom_out', 'pan_left'];
    const transOptions: TransitionType[] = ['flash_zoom', 'spring_slide', 'glitch_cut', 'fade'];

    // Garante que a narração unificada contínua exista
    if (!fullNarrationText) {
      fullNarrationText = rawScenes.map((s) => s.text).filter(Boolean).join(' ');
    }

    const fullAudioUrl = `/api/tts?text=${encodeURIComponent(fullNarrationText.slice(0, 1500))}&voice=${encodeURIComponent(voiceId)}`;

    // Enriquece cada cena ligando com os dados do template, componente visual, b-rolls e código motion pré-compilado
    const enrichedScenes: ScriptScene[] = rawScenes.map((sc, idx) => {
      const cleanText = sc.text || 'Descubra como transformar seus resultados hoje mesmo com automação.';
      const durationSec = estimateSpeechDuration(cleanText);
      const curatedMedia = getContextualMediaForScene(cleanText, prompt, idx);
      const broll = selectContextualBroll(`${prompt} ${cleanText}`, idx);
      const finalImage = curatedMedia || broll.imageUrl;

      const templateResolved = normalizeTemplateId(sc.templateId || sc.componentType, chosenTemplate);

      // Compila imediatamente o código HTML5/SVG + GSAP 3 para que o vídeo já nasça 100% animado e pronto
      const procedural = buildProceduralMotionScene({
        scene: {
          brollImageUrl: finalImage,
          componentProps: {
            headline: sc.headline || cleanText.slice(0, 42).toUpperCase(),
            subtext: sc.subText || '',
            highlightWords: [sc.highlightWord || 'DESTAQUE'],
            number: parseInt(String(sc.statValue || '84').replace(/\D/g, ''), 10) || 84,
            suffix: String(sc.statValue || '%').replace(/[0-9]/g, '') || '%',
            label: sc.statLabel || 'Taxa de Retenção',
            bars: sc.barsData,
            leftTitle: sc.versusData?.leftTitle,
            rightTitle: sc.versusData?.rightTitle,
            buttonText: sc.ctaText,
          },
        },
        sceneIndex: idx,
        resolvedTemplate: templateResolved,
        visualPrompt: sc.visualPrompt || '',
        headline: sc.headline || cleanText.slice(0, 42).toUpperCase(),
        subText: sc.subText || '',
        tag: sc.tag || 'DESTAQUE',
        text: cleanText,
        duration: durationSec,
        highlightColor: '#facc15',
        primaryTextColor: '#ffffff',
      });

      return {
        id: `scene-${idx + 1}-${Date.now()}`,
        sceneIndex: idx,
        summary: sc.summary || `Cena #${idx + 1}: ${cleanText.slice(0, 50)}...`,
        visualPrompt:
          sc.visualPrompt ||
          `Composição dinâmica em Canvas 9:16 com layout "${templateResolved}". Tipografia cinética com iluminação neon volumétrica e zoom contínuo de retenção de 1.15x.`,
        text: cleanText,
        durationSec,
        templateId: templateResolved,
        componentType: templateResolved,
        // Deixa vazio para ser compilado pela IA a partir do visualPrompt na etapa seguinte
        compiledCustomHtml: '',
        compiledGsapScript: '',
        componentProps: {
          badge: sc.tag || sc.componentProps?.badge || 'RETENÇÃO',
          headline: sc.headline || sc.componentProps?.headline || cleanText.slice(0, 42).toUpperCase(),
          subtext: sc.subText || sc.componentProps?.subtext || '',
          highlightWords: [sc.highlightWord || sc.componentProps?.highlightWords?.[0] || 'DESTAQUE'],
          number: parseInt(String(sc.statValue || sc.componentProps?.number || '84').replace(/\D/g, ''), 10) || 84,
          suffix: String(sc.statValue || sc.componentProps?.suffix || '%').replace(/[0-9]/g, '') || '%',
          label: sc.statLabel || sc.componentProps?.label || 'Taxa de Retenção',
          bars: sc.barsData || sc.componentProps?.bars || [
            { label: 'Método Manual', value: 24, displayValue: '24%' },
            { label: 'Com HyperFrame', value: 92, displayValue: '92%' },
          ],
          leftTitle: sc.versusData?.leftTitle || sc.componentProps?.leftTitle || 'O MÉTODO ANTIGO',
          leftDesc: sc.versusData?.leftItems?.[0] || sc.componentProps?.leftDesc || 'Lento, manual e sem retenção',
          rightTitle: sc.versusData?.rightTitle || sc.componentProps?.rightTitle || 'COM NOSSA SOLUÇÃO',
          rightDesc: sc.versusData?.rightItems?.[0] || sc.componentProps?.rightDesc || '100% automático e cinematográfico',
          authorName: sc.authorName || sc.componentProps?.authorName || 'Estrategista Viral',
          authorHandle: sc.authorHandle || sc.componentProps?.authorHandle || '@growth_insider',
          buttonText: sc.ctaText || sc.componentProps?.buttonText || 'Quero Começar Agora',
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
        visualNotes: sc.visualPrompt || `Cena #${idx + 1}: Animação do template ${templateResolved} com GSAP 3.`,
        wordTimestamps: buildWordTimestamps(cleanText, durationSec),
      };
    });

    return NextResponse.json({
      success: true,
      title: generatedTitle,
      presetId,
      aspectRatio,
      styleMode: chosenTemplate,
      fullNarration: fullNarrationText,
      fullAudioUrl,
      scenes: enrichedScenes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao gerar vídeo completo' },
      { status: 500 }
    );
  }
}

/**
 * Fallback Dinâmico Estruturado Baseado no Tema do Usuário e no Template Selecionado
 */
function buildDynamicHyperframeScenes(prompt: string, styleMode: string, targetCount = 5): any[] {
  const cleanTopic = prompt.trim().replace(/\.$/, '');
  const words = cleanTopic.split(/\s+/);
  const hookWords = words.slice(0, Math.min(3, words.length)).join(' ').toUpperCase();

  // Mapeia templates recomendados para cada momento da narrativa respeitando a escolha do usuário
  const scenes: any[] = [];

  // Cena 1: Gancho / Hook
  scenes.push({
    templateId: styleMode.includes('alerta') ? 'alerta_urgente' : styleMode.includes('pergunta') ? 'pergunta_provocativa' : styleMode.includes('news') ? 'news_headline' : 'hormozi_bold',
    tag: 'ATENÇÃO',
    headline: hookWords || 'ALERTA MÁXIMO',
    subText: 'Preste muita atenção nesta revelação',
    highlightWord: words[0] || 'ALERTA',
    text: `Preste muita atenção: uma virada silenciosa acabou de transformar tudo sobre ${words.slice(0, 4).join(' ')} no mercado.`,
    summary: 'Gancho magnético de retenção alertando sobre a transformação do mercado.',
    visualPrompt: `Composição 3D de choque com tipografia pesada em neon amarelo, acompanhado de retícula holográfica giratória e laser horizontal.`,
  });

  // Cena 2: O Problema Oculto ou Estatística Chocante
  scenes.push({
    templateId: 'stat_counter',
    tag: 'DADO CHOCANTE',
    headline: 'RETENÇÃO EM QUEDA LIVRE',
    subText: 'Dados comprovados do comportamento de consumo digital',
    highlightWord: '89%',
    statValue: '89%',
    statLabel: 'perdem clientes por formato estático',
    text: `Mais de 89 por cento das pessoas simplesmente ignoram formatos estáticos e lentos logo nos primeiros segundos.`,
    summary: 'Apresentação de métrica de perda para quem ainda insiste em modelos ultrapassados.',
    visualPrompt: `Contador radial vetorial SVG gigante posicionado no centro do Canvas 9:16. O anel externo preenche progressivamente de 0 a 691px enquanto o número central roda de 0 a 89% com desaceleração power3.out em 1.4s. Partículas cianas flutuam no fundo sobreposto por grade técnica de baixa opacidade e som de pop sincronizado.`,
  });

  // Cena 3: O Comparativo de Solução (Versus ou Gráfico)
  scenes.push({
    templateId: styleMode.includes('grafico') ? 'grafico_barras' : 'versus_comparison',
    tag: 'COMPARAÇÃO',
    headline: 'O MÉTODO TRADICIONAL VS NOVO',
    subText: 'Comparativo definitivo de produtividade e velocidade',
    highlightWord: 'ESCALA',
    versusData: {
      leftTitle: 'O JEITO ANTIGO',
      leftItems: ['Horas em edições manuais', 'Baixíssima retenção', 'Custo elevado'],
      rightTitle: 'COM IA & MOTION',
      rightItems: ['Vídeos prontos em segundos', 'Retenção e engajamento 4x maior', 'Escala automática'],
    },
    barsData: [
      { label: 'Post Estático', value: 18, displayValue: '18%' },
      { label: 'Corte Simples', value: 45, displayValue: '45%' },
      { label: 'Motion Dinâmico', value: 96, displayValue: '96%' },
    ],
    text: `Enquanto o método comum consome horas em edições manuais, o novo sistema gera retenção e movimento em segundos.`,
    summary: 'Divisão de contraste provando a superioridade da automação inteligente.',
    visualPrompt: `Split-screen comparativo com dois cards flutuantes translúcidos em lados opostos: à esquerda entra o painel do método antigo com borda vermelha e ícones de erro deslizando de -120px; à direita entra o painel da nova solução com borda neon e gradiente azul esmeralda. No centro, o badge de 'VS' surge rotacionando a 180 graus com impacto sonoro cinematográfico.`,
  });

  // Cena 4: Prova Social ou Segredo Revelado
  scenes.push({
    templateId: styleMode.includes('tweet') ? 'tweet_card' : styleMode.includes('chat') ? 'chat_simulation' : 'segredo_revelado',
    tag: 'BASTIDORES',
    headline: 'O CÓDIGO DA VIRALIZAÇÃO',
    subText: 'Como os canais de maior engajamento estruturam cada segundo',
    highlightWord: 'RESULTADO',
    authorName: 'Especialista em Escala',
    authorHandle: '@insider_growth',
    text: `Os bastidores mostram que o segredo não é ter equipamentos caros, mas sim ritmo visual cinematográfico.`,
    summary: 'Revelação de autoridade e quebra de objeção do espectador.',
    visualPrompt: `Card de arquivo confidencial estilo dossiê com carimbo vermelho inclinado carimbando a 2.5x de escala no segundo 0.3s. A tarja preta de censura sobre a frase de maior impacto desliza lateralmente revelando o texto oculto com efeito sonoro de glitch digital e iluminação âmbar volumétrica ao fundo.`,
  });

  // Cena 5: Chamada para Ação Final (CTA)
  scenes.push({
    templateId: 'cta_pulse',
    tag: 'COMECE AGORA',
    headline: 'DESTRAVE SEU ACESSO HOJE',
    subText: 'Produza seus primeiros vídeos de alta retenção agora',
    highlightWord: 'AGORA',
    ctaText: 'Quero Começar Agora Mesmo',
    text: `Clique no botão agora mesmo e transforme suas ideias em vídeos virais prontos para publicar.`,
    summary: 'Chamada para ação direta com botão pulsante e clique simulado.',
    visualPrompt: `Botão 3D de alta conversão posicionado na parte inferior central do Canvas 9:16 com gradiente vibrante e sombra iluminada de 50px de raio. Um cursor de mouse realista entra diagonalmente no segundo 0.5s, posiciona-se sobre o botão e executa clique com compressão física de escala para 0.93 e retorno com mola elástica, enquanto um orbe de luz neon pulsa continuamente atrás do elemento.`,
  });

  return scenes.slice(0, targetCount);
}
