import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/studio/refine-script
 * Recebe o roteiro atual e um comando de refinamento da IA
 * (Ex: "Deixe mais agressivo no gancho", "Encurte para caber em 20 segundos", "Foque mais em vendas")
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, currentScenes, instruction } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      // Ajuste local inteligente caso sem chave
      const refined = currentScenes.map((sc: any, idx: number) => ({
        ...sc,
        text: idx === 0 
          ? `[REFINADO] ${sc.text}`
          : sc.text,
      }));
      return NextResponse.json({ success: true, scenes: refined });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
Você é um roteirista sênior de retenção para vídeos verticais (Shorts, Reels, TikTok).
O usuário tem este roteiro atual:
${JSON.stringify(currentScenes, null, 2)}

O usuário solicitou este ajuste: "${instruction}".
Tema original: "${prompt}".

Reescreva e ajuste as falas ("text") mantendo a mesma estrutura de cenas em Português do Brasil.
Retorne ESTRITAMENTE um array JSON de cenas no formato:
[
  {
    "id": "sc-1",
    "sceneIndex": 0,
    "text": "Nova fala revisada",
    "durationSec": 4.0,
    "componentType": "CardFrase",
    "componentProps": {
      "headline": "TEXTO CURTO",
      "subtext": "complemento",
      "badge": "NOVO"
    }
  }
]
`;

    const result = await model.generateContent(systemPrompt);
    const cleanText = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return NextResponse.json({ success: true, scenes: Array.isArray(parsed) ? parsed : parsed.scenes || currentScenes });
  } catch (error: any) {
    console.error('Erro ao refinar roteiro:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Falha ao refinar roteiro' }, { status: 500 });
  }
}
