import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/studio/refine-script
 * Refina o roteiro e os prompts técnicos de motion com IA real de acordo com a instrução do usuário.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, currentScenes, instruction } = await req.json();

    if (!Array.isArray(currentScenes) || currentScenes.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhuma cena para refinar' }, { status: 400 });
    }

    const systemPrompt = `Você é um Diretor de Roteiro e Engenheiro de Motion Graphics.
Receba a lista atual de cenas e aplique a instrução solicitada pelo usuário: "${instruction}".
Tema central do vídeo: "${prompt}".

Atualize os campos "text" (locução), "headline", "tag", "highlightWord" e "motionPrompt" (mantendo o prompt técnico de timeline GSAP detalhado com pelo menos 80 palavras por cena) para refletir a instrução.
Preserve os IDs, templateId e URLs de mídia existentes.
Retorne ESTRITAMENTE um objeto JSON no formato:
{
  "scenes": [ ...cenas atualizadas... ]
}`;

    const userMessage = JSON.stringify(
      currentScenes.map((s: any) => ({
        id: s.id,
        sceneIndex: s.sceneIndex,
        templateId: s.templateId,
        durationSec: s.durationSec,
        text: s.text,
        tag: s.tag,
        headline: s.headline,
        highlightWord: s.highlightWord,
        motionPrompt: s.motionPrompt,
      }))
    );

    let updatedList: any[] | null = null;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([{ text: systemPrompt }, { text: userMessage }]);
        const raw = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(raw);
        updatedList = Array.isArray(parsed) ? parsed : parsed.scenes;
      } catch (e) {
        console.warn('Gemini refine fallback:', e);
      }
    }

    if (!updatedList) {
      try {
        const aiRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || '{}';
          const parsed = JSON.parse(content);
          updatedList = Array.isArray(parsed) ? parsed : parsed.scenes;
        }
      } catch (e) {
        console.warn('Pollinations refine error:', e);
      }
    }

    const mergedScenes = currentScenes.map((orig: any, idx: number) => {
      const found = updatedList?.find((u: any) => u.id === orig.id) || updatedList?.[idx];
      if (!found) return orig;
      return {
        ...orig,
        text: found.text || orig.text,
        tag: found.tag || orig.tag,
        headline: found.headline || orig.headline,
        highlightWord: found.highlightWord || orig.highlightWord,
        motionPrompt: found.motionPrompt || orig.motionPrompt,
      };
    });

    return NextResponse.json({ success: true, scenes: mergedScenes });
  } catch (error: any) {
    console.error('Erro ao refinar roteiro:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Falha ao refinar roteiro' }, { status: 500 });
  }
}
