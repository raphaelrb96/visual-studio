import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptScene } from '@/types/studio';
import { z } from 'zod';

// Schema de validação da requisição usando Zod
const generateScriptSchema = z.object({
  topic: z.string().min(1),
  tone: z.string().min(1),
  durationSec: z.number().int().positive().default(30),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']).default('9:16'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic = 'O impacto da inteligência artificial nos negócios em 2026',
      tone = 'Educacional',
      durationSec = 30,
      aspectRatio = '9:16',
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Number of scenes based on target duration (each scene ~3.5 to 5s)
    const targetSceneCount = durationSec === 60 ? 8 : 4;

    if (!apiKey) {
      // Deterministic intelligent fallback when Gemini key is not yet configured in .env.local
      const fallbackScenes: ScriptScene[] = generateFallbackScript(topic, tone, durationSec);
      return NextResponse.json({
        success: true,
        source: 'fallback_template',
        message: 'Chave GEMINI_API_KEY não configurada no ambiente. Gerado via motor estruturado padrão.',
        scenes: fallbackScenes,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
Você é um diretor sênior de Motion Graphics e roteirista de vídeos virais de alta retenção no YouTube Shorts, TikTok e Instagram Reels.
Sua missão é transformar a ideia do usuário em um roteiro sequencial estruturado com exatamente ${targetSceneCount} cenas.
A duração total acumulada deve ser de aproximadamente ${durationSec} segundos.

Para cada cena, você deve selecionar o componente visual React mais adequado:
- 'CardFrase': Para ganchos fortes, perguntas ou declarações impactantes (headline curta, subtext, highlightWords para dar ênfase, badge).
- 'StatCounter': Para dados estatísticos marcantes, números e porcentagens (number, prefix, suffix, label, description).
- 'GraficoPizza': Para distribuição proporcional, fatias de mercado ou comparações percentuais (title, slices: [{label, value, color}]).
- 'GraficoBarras': Para rankings, crescimento acelerado ou comparações lado a lado (title, bars: [{label, value, formatted}]).
- 'MediaBroll': Para transições visuais com imagens de impacto e frases curtas (overlayText, caption).
- 'CTAButton': Obrigatoriamente na última cena como chamada para ação (buttonText, subcaption).

Retorne ESTRITAMENTE um objeto JSON válido, sem markdown ou crases ao redor, no seguinte formato:
{
  "scenes": [
    {
      "id": "sc-1",
      "sceneIndex": 0,
      "text": "Frase falada pelo narrador de forma fluida",
      "durationSec": 4.5,
      "componentType": "CardFrase",
      "componentProps": {
        "headline": "TEXTO EM CAIXA ALTA",
        "subtext": "Complemento curto",
        "highlightWords": ["palavra1", "palavra2"],
        "badge": "GANCHO"
      }
    }
  ]
}
`;

    const userPrompt = `
Tópico: ${topic}
Tom de voz: ${tone}
Duração pretendida: ${durationSec} segundos
Formato de vídeo: ${aspectRatio}
`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text();
    // Clean potential markdown blocks
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      source: 'gemini',
      scenes: parsed.scenes,
    });
  } catch (error: any) {
    console.error('Erro ao gerar roteiro via Gemini:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Falha ao processar roteiro com IA',
      },
      { status: 500 }
    );
  }
}

function generateFallbackScript(topic: string, tone: string, durationSec: number): ScriptScene[] {
  const is60 = durationSec === 60;

  return [
    {
      id: `sc-${Date.now()}-1`,
      sceneIndex: 0,
      text: `Você já parou para pensar em como ${topic} está transformando tudo agora?`,
      durationSec: 4.5,
      componentType: 'CardFrase' as const,
      componentProps: {
        headline: topic.toUpperCase().slice(0, 32),
        subtext: `Tom: ${tone} • Uma revolução em andamento`,
        highlightWords: ['transformando', 'tudo'],
        badge: 'ATENÇÃO',
      },
    },
    {
      id: `sc-${Date.now()}-2`,
      sceneIndex: 1,
      text: 'Os números comprovam: a eficiência média saltou mais de 78% nos últimos 6 meses.',
      durationSec: 4.5,
      componentType: 'StatCounter' as const,
      componentProps: {
        number: 78,
        suffix: '%',
        prefix: '+',
        label: 'Aceleração de Resultados',
        description: 'Métricas comprovadas no cenário atual',
      },
    },
    {
      id: `sc-${Date.now()}-3`,
      sceneIndex: 2,
      text: 'Mais de 65% dos líderes já migraram totalmente seus métodos tradicionais.',
      durationSec: 5.0,
      componentType: 'GraficoPizza' as const,
      componentProps: {
        title: 'Adoção Estratégica',
        slices: [
          { label: 'Novos Modelos', value: 65, color: '#6366f1' },
          { label: 'Em Transição', value: 25, color: '#06b6d4' },
          { label: 'Legado', value: 10, color: '#facc15' },
        ],
      },
    },
    ...(is60
      ? [
          {
            id: `sc-${Date.now()}-4`,
            sceneIndex: 3,
            text: 'Enquanto alguns hesitam, o ganho de escala supera qualquer método convencional.',
            durationSec: 5.0,
            componentType: 'GraficoBarras' as const,
            componentProps: {
              title: 'Crescimento de Escala',
              bars: [
                { label: 'Fluxo Manual', value: 28, formatted: '28%' },
                { label: 'Video as Code', value: 95, formatted: '95%' },
                { label: 'Mídia Estática', value: 42, formatted: '42%' },
              ],
            },
          },
          {
            id: `sc-${Date.now()}-5`,
            sceneIndex: 4,
            text: 'A velocidade de produção multiplica o alcance de maneira exponencial.',
            durationSec: 4.5,
            componentType: 'MediaBroll' as const,
            componentProps: {
              overlayText: 'Escala Sem Gargalos',
              caption: 'ALTA PERFORMANCE',
            },
          },
        ]
      : []),
    {
      id: `sc-${Date.now()}-end`,
      sceneIndex: is60 ? 5 : 3,
      text: 'Não fique para trás nessa corrida. Dê o próximo passo hoje mesmo!',
      durationSec: 4.0,
      componentType: 'CTAButton' as const,
      componentProps: {
        buttonText: 'Acessar Plataforma Agora',
        subcaption: 'Gere seus primeiros vídeos em segundos',
      },
    },
  ];
}
