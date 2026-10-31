import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { computeWordTimestamps } from '@/lib/motion-compiler';

/**
 * POST /api/studio/compile-scene
 * Fase de Compilação Video-as-Code (Executada ANTES de abrir o Estúdio).
 * Recebe o prompt extenso de motion da cena, gera os timestamps palavra por palavra,
 * vincula o stream de voz neural e compila código HTML/SVG + GSAP adicional para a cena.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { scene, sceneIndex = 0, aspectRatio = '9:16' } = body;

    if (!scene) {
      return NextResponse.json({ success: false, error: 'Cena inválida para compilação' }, { status: 400 });
    }

    const durationSec = Number(scene.durationSec) || 4.8;
    const narration = String(scene.text || '').trim();
    const wordTimestamps = computeWordTimestamps(narration, durationSec);
    const audioUrl = `/api/tts?text=${encodeURIComponent(narration)}&lang=pt-BR`;

    // Compila um widget SVG/HUD complementar baseado no motionPrompt da cena
    let compiledCustomHtml = '';
    let compiledGsapScript = '';

    const systemPrompt = `Você é um compilador de Motion Graphics HTML5/SVG + GSAP 3.
A partir do prompt técnico da cena abaixo, gere um mini-widget visual complementar em HTML/SVG inline (máximo 1 badge/indicador/gráfico vetorial extra com id="ai-widget-${sceneIndex}") e 1 linha de animação GSAP no masterTl.
NÃO imprima o texto do prompt na tela! Gere apenas elementos gráficos visuais de apoio (ex: barra de métrica, indicador de status, ícone SVG animado).
Retorne ESTRITAMENTE um JSON:
{
  "customHtml": "<div id='ai-widget-${sceneIndex}' style='display:flex;align-items:center;gap:12px;margin-top:8px;padding:10px 22px;border-radius:14px;background:rgba(255,255,255,0.06);font-size:22px;font-weight:700;color:#cbd5e1'>...</div>",
  "gsapCode": "if(document.querySelector('#ai-widget-${sceneIndex}')){ masterTl.fromTo('#ai-widget-${sceneIndex}', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.7)' }, START_SEC + 0.45); }"
}`;

    const userMsg = `Cena #${sceneIndex + 1}
Headline: ${scene.headline || ''}
Subtexto: ${scene.subText || ''}
Tag: ${scene.tag || ''}
Prompt de Motion: ${scene.motionPrompt || ''}`;

    try {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([{ text: systemPrompt }, { text: userMsg }]);
        const raw = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(raw);
        compiledCustomHtml = parsed.customHtml || '';
        compiledGsapScript = parsed.gsapCode || '';
      } else {
        const aiRes = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMsg },
            ],
            response_format: { type: 'json_object' },
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const parsed = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');
          compiledCustomHtml = parsed.customHtml || '';
          compiledGsapScript = parsed.gsapCode || '';
        }
      }
    } catch {
      // Fallback determinístico limpo
      compiledCustomHtml = `<div id="ai-widget-${sceneIndex}" style="display:inline-flex;align-items:center;gap:10px;padding:10px 24px;border-radius:99px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);font-size:22px;font-weight:700;color:#94a3b8"><span>●</span><span>${
        scene.subText || 'Sincronizado em 60 FPS'
      }</span></div>`;
    }

    return NextResponse.json({
      success: true,
      compiledScene: {
        ...scene,
        durationSec,
        audioUrl,
        wordTimestamps,
        compiledCustomHtml,
        compiledGsapScript: compiledGsapScript.replace(/START_SEC/g, '0'),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
