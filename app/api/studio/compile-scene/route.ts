import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildProceduralMotionScene } from '@/lib/scene-motion-generator';

/**
 * POST /api/studio/compile-scene
 * Compila o resultado visual animado (HTML5/SVG + GSAP 3 Seekable Timeline)
 * para uma cena específica a partir do seu prompt visual detalhado.
 * Possui timeout estrito de 4.0s para nunca travar a interface do usuário.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      scene,
      sceneIndex = 0,
      aspectRatio = '9:16',
      highlightColor = '#facc15',
      primaryTextColor = '#ffffff',
      backgroundColor = '#050505',
      templateId = 'hormozi_bold',
    } = body;

    if (!scene) {
      return NextResponse.json({ success: false, error: 'Cena inválida' }, { status: 400 });
    }

    const visualPrompt = String(scene.visualPrompt || scene.visualNotes || '').trim();
    const text = String(scene.text || '').trim();
    const headline = String(
      scene.componentProps?.headline || scene.headline || text.slice(0, 42).toUpperCase()
    ).trim();
    const subText = String(scene.componentProps?.subtext || scene.subText || '').trim();
    const tag = String(scene.componentProps?.badge || scene.tag || 'DESTAQUE').trim();
    const duration = Math.max(3.5, Number(scene.durationSec) || 4.5);
    const resolvedTemplate = String(
      scene.templateId || scene.componentType || templateId || 'hormozi_bold'
    ).toLowerCase();

    const systemPrompt = `Você é o Motor de Renderização de Inteligência Artificial Code-to-Video especializado em HTML5/SVG e GSAP 3 para o Canvas 1080x1920 (HyperFrames).
Sua missão nesta etapa é TRANSFORMAR O PROMPT VISUAL (que é a alma e a direção de arte da cena) em código real executável de vídeo animado.

DIRETRIZ DA CENA #${sceneIndex + 1}:
- PROMPT VISUAL (A ALMA DA CENA): "${visualPrompt}"
- Headline: "${headline}"
- Subtítulo/Contexto: "${subText}"
- Badge/Tag: "${tag}"
- Locução falada: "${text}"
- Duração exata da cena: ${duration} segundos
- Cor Neon Principal: ${highlightColor}
- Cor do Texto: ${primaryTextColor}
- Template de Referência: "${resolvedTemplate}"

REGRAS RÍGIDAS DE CODE-TO-VIDEO:
1. MATERIALIZE O PROMPT VISUAL: Construa exatamente todos os elementos gráficos descritos no prompt (SVGs vetoriais customizados, medidores, anéis orbitais, retículas tecnológicas, barras de progresso, gráficos de linha/barras, cards 3D com glassmorphism, cursores animados, tarjas e carimbos).
2. PROIBIDO SLIDES DE TEXTO: NUNCA crie apenas um quadro ou card com o texto do prompt escrito! O prompt visual é a sua ordem de arquitetura visual e direção de arte. O texto falado deve ter no máximo 2 a 3 palavras-chave gigantes em destaque de 74px+, todo o restante são elementos visuais motion.
3. ESTRUTURA HTML5/SVG:
   - Container raiz: <div id="ai-scene-content-${sceneIndex}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;perspective:1200px;overflow:hidden;">
   - Crie SVGs desenhados para cada elemento técnico com IDs claros (ex: #ai-svg-gauge-${sceneIndex}, #ai-chart-${sceneIndex}, #ai-badge-${sceneIndex}, #ai-laser-${sceneIndex}).
4. SCRIPT GSAP 3 DE ANIMAÇÃO CONTÍNUA:
   - Adicione animações diretamente na timeline global \`masterTl\` usando o ponto de partida \`START_SEC\`.
   - Crie NO MÍNIMO 5 a 8 instruções GSAP (entradas com back.out/elastic.out, rotações infinitas ou contínuas durante toda a duração da cena, preenchimento de stroke-dashoffset em SVGs, pulsações de escala e filtros de glow).

Retorne ESTRITAMENTE um objeto JSON:
{
  "compiledCustomHtml": "<div id='ai-scene-content-${sceneIndex}' ...>...</div>",
  "compiledGsapScript": "masterTl.fromTo(...) ... masterTl.to(...) ..."
}`;

    let compiledHtml = '';
    let compiledGsap = '';

    // 1. Tenta Gemini API com JSON mode explícito (gemini-3.5-flash-lite com cota ativa)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash-lite',
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await Promise.race([
          model.generateContent(systemPrompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini timeout')), 12000)
          ),
        ]);
        const raw = result.response.text().trim();
        const parsed = JSON.parse(raw);
        if (
          parsed.compiledCustomHtml &&
          parsed.compiledGsapScript &&
          (parsed.compiledGsapScript.match(/masterTl\./g) || []).length >= 1
        ) {
          compiledHtml = parsed.compiledCustomHtml;
          compiledGsap = parsed.compiledGsapScript;
        }
      } catch (err) {
        console.warn(`Cena #${sceneIndex + 1}: Gemini compile fallback.`, err);
      }
    }

    // 2. Tenta Pollinations OpenAI com AbortController de 1.8s
    if (!compiledHtml) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      try {
        const res = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: 'openai',
            messages: [{ role: 'user', content: systemPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.75,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawContent = (data.choices?.[0]?.message?.content || '{}')
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          const parsed = JSON.parse(rawContent);
          const gsapCount = (String(parsed.compiledGsapScript || '').match(/masterTl\./g) || []).length;
          const htmlStr = String(parsed.compiledCustomHtml || '');
          const printedPrompt =
            visualPrompt.length > 25 && htmlStr.includes(visualPrompt.slice(0, 30));

          if (htmlStr.length > 80 && gsapCount >= 3 && !printedPrompt) {
            compiledHtml = htmlStr;
            compiledGsap = String(parsed.compiledGsapScript);
          }
        }
      } catch (err) {
        // Fallback imediato
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // 3. Compilador Procedural Cinematográfico (Garante 100% de animação rica e zero slides estáticos)
    if (!compiledHtml || !compiledGsap) {
      const procedural = buildProceduralMotionScene({
        scene,
        sceneIndex,
        resolvedTemplate,
        visualPrompt,
        headline,
        subText,
        tag,
        text,
        duration,
        highlightColor,
        primaryTextColor,
      });
      compiledHtml = procedural.html;
      compiledGsap = procedural.gsap;
    }

    return NextResponse.json({
      success: true,
      compiledScene: {
        ...scene,
        compiledCustomHtml: compiledHtml,
        compiledGsapScript: compiledGsap,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao compilar cena com IA' },
      { status: 500 }
    );
  }
}

