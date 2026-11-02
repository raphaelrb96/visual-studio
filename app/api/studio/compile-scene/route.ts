import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MOTION_TEMPLATES } from '@/lib/motion-templates';
import { buildProceduralMotionScene } from '@/lib/scene-motion-generator';

/**
 * POST /api/studio/compile-scene
 * Compila o palco visual (HTML5/SVG + GSAP 3 Seekable Timeline) para uma cena específica.
 * Prioriza os motores determinísticos oficiais dos templates (para fidelidade 100% ao preview do catálogo)
 * e utiliza Gemini quando o usuário solicita uma customização específica via prompt.
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
      templateId = 'assemble-then-type-flyin',
      forceAiCustom = false,
    } = body;

    if (!scene) {
      return NextResponse.json({ success: false, error: 'Cena inválida' }, { status: 400 });
    }

    const resolvedTemplate = String(
      scene.templateId || scene.componentType || templateId || 'assemble-then-type-flyin'
    ).trim();

    const tplMeta = MOTION_TEMPLATES.find((t) => t.id === resolvedTemplate);
    const effectiveHighlight = highlightColor || tplMeta?.defaultHighlightColor || '#facc15';

    const visualPrompt = String(
      scene.visualPrompt || scene.visualNotes || tplMeta?.description || ''
    ).trim();
    const text = String(scene.text || '').trim();
    const headline = String(
      scene.componentProps?.headline || scene.headline || text.slice(0, 38).toUpperCase()
    ).trim();
    const subText = String(
      scene.componentProps?.subtext || scene.subText || tplMeta?.description?.slice(0, 75) || ''
    ).trim();
    const tag = String(
      scene.componentProps?.badge || scene.tag || tplMeta?.badge || 'MOTION STUDIO'
    ).trim();
    const duration = Math.max(3.5, Number(scene.durationSec) || 4.5);
    const brollUrl =
      scene.brollImageUrl ||
      scene.brollUrl ||
      scene.componentProps?.imageUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85';

    // Sempre gera a base procedural de alta precisão fiel ao template selecionado
    const procedural = buildProceduralMotionScene({
      scene: {
        ...scene,
        brollUrl,
        brollImageUrl: brollUrl,
      },
      sceneIndex,
      resolvedTemplate,
      visualPrompt,
      headline,
      subText,
      tag,
      text,
      duration,
      highlightColor: effectiveHighlight,
      primaryTextColor,
      aspectRatio: aspectRatio as any,
    });

    let compiledHtml = procedural.html;
    let compiledGsap = procedural.gsap;

    // Se o usuário clicou explicitamente em "Recompilar Animação desta Cena com IA" e não é um dos 4 motores fechados
    const dedicatedIds = ['assemble-then-type-flyin', 'flying-words', 'card-stack', 'spotlight-hero-card'];
    const apiKey = process.env.GEMINI_API_KEY;

    if (forceAiCustom && !dedicatedIds.includes(resolvedTemplate) && apiKey && apiKey !== 'YOUR_API_KEY') {
      try {
        const systemPrompt = `Você é o Motor de Renderização Code-to-Video especializado em HTML5/SVG + GSAP 3 para o Canvas ${
          aspectRatio === '16:9' ? '1920x1080' : '1080x1920'
        }.
Transforme a diretriz abaixo em uma cena animada com B-Roll integrado e elementos SVG/3D:

TEMPLATE ESCOLHIDO: "${tplMeta?.name || resolvedTemplate}" (${resolvedTemplate})
ANATOMIA DO TEMPLATE: "${tplMeta?.description || visualPrompt}"
PROMPT VISUAL DO USUÁRIO: "${visualPrompt}"
HEADLINE (TÍTULO PRINCIPAL): "${headline}"
SUBTÍTULO: "${subText}"
TAG/BADGE: "${tag}"
URL DA IMAGEM B-ROLL PARA INTEGRAR EM MOLDURA NA CENA: "${brollUrl}"
COR DE DESTAQUE NEON: "${effectiveHighlight}"
DURAÇÃO: ${duration}s

REGRAS OBRIGATÓRIAS:
1. Integre a imagem "${brollUrl}" dentro de uma moldura 3D, janela SaaS, split-screen ou card interativo no palco.
2. Crie animações GSAP diretamente em \`masterTl\` usando \`START_SEC\` como início (mínimo 5 animações com back.out, elastic.out ou rotação contínua).
3. Retorne ESTRITAMENTE JSON:
{
  "compiledCustomHtml": "<div id='ai-scene-content-${sceneIndex}' style='position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;perspective:1200px;padding:40px;'>...</div>",
  "compiledGsapScript": "masterTl.fromTo(..., START_SEC + 0.1); ..."
}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash-lite',
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await Promise.race([
          model.generateContent(systemPrompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini timeout')), 9000)
          ),
        ]);
        const parsed = JSON.parse(result.response.text().trim());
        if (
          parsed.compiledCustomHtml &&
          parsed.compiledGsapScript &&
          (parsed.compiledGsapScript.match(/masterTl\./g) || []).length >= 3
        ) {
          compiledHtml = parsed.compiledCustomHtml;
          compiledGsap = parsed.compiledGsapScript;
        }
      } catch (err) {
        console.warn(`Cena #${sceneIndex + 1}: mantendo motor procedural nativo do template.`, err);
      }
    }

    return NextResponse.json({
      success: true,
      compiledScene: {
        ...scene,
        templateId: resolvedTemplate,
        componentType: resolvedTemplate,
        compiledCustomHtml: compiledHtml,
        compiledGsapScript: compiledGsap,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao compilar cena' },
      { status: 500 }
    );
  }
}
