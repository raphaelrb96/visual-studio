import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/studio/compile-scene
 * Compila o resultado visual animado (HTML5/SVG + GSAP 3 Seekable Timeline)
 * para uma cena específica a partir do seu prompt visual detalhado.
 * Possui timeout estrito de 7.5s para nunca travar a interface do usuário.
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

    const systemPrompt = `Você é um Diretor de Motion Graphics Sênior especialista em GSAP 3 e HTML5/SVG para o motor HyperFrames (Canvas 1080x1920).
Sua missão é compilar a Cena #${sceneIndex + 1} em código HTML5/SVG multi-camadas e um script GSAP 3 rico em movimento contínuo.

DADOS DA CENA #${sceneIndex + 1}:
- Template/Arquitetura: "${resolvedTemplate}"
- Prompt Visual Detalhado: "${visualPrompt}"
- Headline: "${headline}"
- Subtítulo/Contexto: "${subText}"
- Badge/Tag: "${tag}"
- Locução da cena: "${text}"
- Duração exata da cena: ${duration} segundos
- Cor Neon Principal: ${highlightColor}
- Cor do Texto: ${primaryTextColor}

REGRAS OBRIGATÓRIAS (PROIBIDO GERAR SLIDES ESTÁTICOS):
1. NUNCA imprima o texto do "Prompt Visual Detalhado" na tela! O prompt visual é sua instrução de direção de arte para criar os elementos gráficos (SVGs, medidores, gráficos, cards 3D, ícones, partículas, ondas, cursores, tarjas reveladoras).
2. O container raiz deve ter id="ai-scene-content-${sceneIndex}" e ocupar 100% da área central com perspectiva 3D.
3. Crie no mínimo 4 a 6 sub-elementos visuais independentes com IDs únicos (ex: #ai-bg-ring-${sceneIndex}, #ai-badge-${sceneIndex}, #ai-main-visual-${sceneIndex}, #ai-svg-draw-${sceneIndex}, #ai-kinetic-words-${sceneIndex}, #ai-floating-hud-${sceneIndex}).
4. O script GSAP ("compiledGsapScript") deve usar a variável global \`masterTl\` e o offset \`START_SEC\`, contendo NO MÍNIMO 6 animações GSAP encadeadas ao longo de toda a duração da cena (de \`START_SEC\` até \`START_SEC + ${duration}\`):
   - Entrada coreografada em múltiplos eixos (scale, rotationX, rotationY, x, y, skewX, autoAlpha) com eases dinâmicos ("back.out(1.8)", "elastic.out(1, 0.75)", "expo.out").
   - Animação de elementos SVG (strokeDashoffset, rotation, scale) e contadores/barras.
   - Movimento contínuo durante todo o meio da cena (flutuação 3D, rotação de anéis SVG, pulso de glow, varredura de laser ou destaque progressivo de palavras) para que NENHUM frame fique parado.

Retorne ESTRITAMENTE um objeto JSON válido com as chaves:
{
  "compiledCustomHtml": "<div id='ai-scene-content-${sceneIndex}' ...>...</div>",
  "compiledGsapScript": "..."
}`;

    let compiledHtml = '';
    let compiledGsap = '';

    // 1. Tenta Gemini API com timeout estrito de 7s
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await Promise.race([
          model.generateContent(systemPrompt),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini timeout')), 7000)
          ),
        ]);
        const raw = result.response
          .text()
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        const parsed = JSON.parse(raw);
        if (
          parsed.compiledCustomHtml &&
          parsed.compiledGsapScript &&
          (parsed.compiledGsapScript.match(/masterTl\./g) || []).length >= 3
        ) {
          compiledHtml = parsed.compiledCustomHtml;
          compiledGsap = parsed.compiledGsapScript;
        }
      } catch (err) {
        console.warn(`Cena #${sceneIndex + 1}: Gemini fallback acionado.`);
      }
    }

    // 2. Tenta Pollinations OpenAI com AbortController de 6.5s para nunca travar por minutos
    if (!compiledHtml) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);
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
          // Valida se o código gerado pela IA realmente contém múltiplas animações GSAP e não imprimiu o prompt
          const gsapCount = (String(parsed.compiledGsapScript || '').match(/masterTl\./g) || []).length;
          const htmlStr = String(parsed.compiledCustomHtml || '');
          const printedPrompt =
            visualPrompt.length > 25 && htmlStr.includes(visualPrompt.slice(0, 30));

          if (htmlStr.length > 80 && gsapCount >= 4 && !printedPrompt) {
            compiledHtml = htmlStr;
            compiledGsap = String(parsed.compiledGsapScript);
          }
        }
      } catch (err) {
        // Timeout ou rate-limit: cai imediatamente para o compilador procedural de alta complexidade
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // 3. Compilador Procedural Cinematográfico de Motion Graphics (Garante 100% de animação rica e zero slides estáticos)
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

interface ProceduralSceneInput {
  scene: any;
  sceneIndex: number;
  resolvedTemplate: string;
  visualPrompt: string;
  headline: string;
  subText: string;
  tag: string;
  text: string;
  duration: number;
  highlightColor: string;
  primaryTextColor: string;
}

/**
 * Sintetiza uma composição HTML5/SVG + GSAP 3 completa, multi-camadas e com movimento contínuo
 * interpretando as diretrizes do prompt visual e os dados estruturados da cena.
 */
function buildProceduralMotionScene(input: ProceduralSceneInput): { html: string; gsap: string } {
  const {
    scene,
    sceneIndex: idx,
    resolvedTemplate,
    visualPrompt,
    headline,
    subText,
    tag,
    text,
    duration: d,
    highlightColor,
    primaryTextColor,
  } = input;

  const p = scene.componentProps || {};
  const promptLower = `${resolvedTemplate} ${visualPrompt}`.toLowerCase();
  const brollImg = scene.brollImageUrl || p.imageUrl || '';

  // Quebra a headline em palavras cinéticas individuais para animação stagger 3D
  const headlineWords = headline
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);

  const kineticWordsHtml = headlineWords
    .map((w, wi) => {
      const isHighlight =
        wi === headlineWords.length - 1 ||
        (p.highlightWords?.[0] && w.toUpperCase().includes(String(p.highlightWords[0]).toUpperCase()));
      return `<span id="ai-kw-${idx}-${wi}" style="display:inline-block;padding:4px 14px;margin:4px;border-radius:14px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;${
        isHighlight
          ? `background:${highlightColor};color:#04060d;box-shadow:0 0 35px ${highlightColor}88;`
          : `color:${primaryTextColor};text-shadow:0 8px 24px rgba(0,0,0,0.9);`
      }">${escapeHtml(w)}</span>`;
    })
    .join('');

  const kineticWordsGsap = headlineWords
    .map(
      (_, wi) => `
      masterTl.fromTo("#ai-kw-${idx}-${wi}",
        { y: 65, rotationX: -75, scale: 0.5, autoAlpha: 0 },
        { y: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 0.48, ease: "back.out(2.1)" },
        START_SEC + ${(0.14 + wi * 0.08).toFixed(2)}
      );
      masterTl.to("#ai-kw-${idx}-${wi}",
        { y: ${wi % 2 === 0 ? -8 : 8}, duration: ${(d * 0.45).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 },
        START_SEC + ${(0.7 + wi * 0.05).toFixed(2)}
      );`
    )
    .join('\n');

  // Detecta arquitetura ideal pelo template ou palavras-chave no visualPrompt
  if (
    resolvedTemplate.includes('stat') ||
    resolvedTemplate.includes('counter') ||
    promptLower.includes('contador') ||
    promptLower.includes('anel') ||
    promptLower.includes('estatística') ||
    promptLower.includes('por cento')
  ) {
    const rawNum = parseInt(String(p.number || scene.statValue || '89').replace(/\D/g, ''), 10) || 89;
    const suffix = String(p.suffix || scene.statValue || '%').replace(/[0-9]/g, '') || '%';
    const statLabel = p.label || scene.statLabel || subText || 'Impacto Comprovado em Retenção';
    const dashOffsetTarget = Math.round(754 * (1 - Math.min(98, Math.max(15, rawNum)) / 100));

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;perspective:1200px;">
        <!-- Anéis Orbitais Vetoriais de Fundo -->
        <svg id="ai-orbit-${idx}" viewBox="0 0 600 600" style="position:absolute;width:680px;height:680px;opacity:0.28;pointer-events:none;">
          <circle cx="300" cy="300" r="270" stroke="${highlightColor}" stroke-width="2" stroke-dasharray="12 18" fill="none" />
          <circle cx="300" cy="300" r="220" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="40 20" fill="none" />
          <line x1="300" y1="0" x2="300" y2="600" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          <line x1="0" y1="300" x2="600" y2="300" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        </svg>

        <!-- Headline Cinética Multi-Palavra -->
        <div style="display:flex;flex-wrap:wrap;justify-content:center;max-width:920px;font-size:48px;line-height:1.15;z-index:3;">
          ${kineticWordsHtml}
        </div>

        <!-- Medidor Radial Neon 3D -->
        <div id="ai-gauge-card-${idx}" style="position:relative;width:380px;height:380px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle, rgba(15,23,42,0.92) 0%, rgba(4,6,13,0.96) 100%);box-shadow:0 0 80px ${highlightColor}33, inset 0 0 40px rgba(255,255,255,0.06);border:2px solid rgba(255,255,255,0.12);z-index:3;">
          <svg viewBox="0 0 280 280" style="width:340px;height:340px;transform:rotate(-90deg);">
            <circle cx="140" cy="140" r="120" stroke="rgba(255,255,255,0.08)" stroke-width="18" fill="none" />
            <circle id="ai-ring-prog-${idx}" cx="140" cy="140" r="120" stroke="${highlightColor}" stroke-width="18" fill="none"
              stroke-dasharray="754" stroke-dashoffset="754" stroke-linecap="round"
              style="filter:drop-shadow(0 0 16px ${highlightColor});" />
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span id="stat-num-${idx}" data-target="${rawNum}" data-suffix="${escapeHtml(suffix)}" style="font-size:92px;font-weight:900;color:${highlightColor};letter-spacing:-3px;text-shadow:0 0 35px ${highlightColor}88;">0${escapeHtml(suffix)}</span>
            <span style="font-size:18px;font-weight:800;letter-spacing:4px;color:#94a3b8;text-transform:uppercase;">MÉTRICA VERIFICADA</span>
          </div>
        </div>

        <!-- Card Flutuante de Impacto Inferior -->
        <div id="ai-stat-pill-${idx}" style="padding:22px 42px;border-radius:28px;background:rgba(15,23,42,0.88);border:2px solid ${highlightColor}66;backdrop-filter:blur(16px);box-shadow:0 24px 60px rgba(0,0,0,0.75);z-index:3;max-width:860px;text-align:center;">
          <div style="font-size:32px;font-weight:800;color:#f8fafc;line-height:1.25;">${escapeHtml(statLabel)}</div>
        </div>
      </div>
    `;

    const gsap = `
      ${kineticWordsGsap}
      masterTl.fromTo("#ai-orbit-${idx}", { scale: 0.4, rotation: -90, autoAlpha: 0 }, { scale: 1.15, rotation: 90, autoAlpha: 0.32, duration: ${d}, ease: "none" }, START_SEC);
      masterTl.fromTo("#ai-gauge-card-${idx}", { scale: 0.3, rotationY: 65, autoAlpha: 0 }, { scale: 1, rotationY: 0, autoAlpha: 1, duration: 0.65, ease: "back.out(1.7)" }, START_SEC + 0.18);
      masterTl.to("#ai-ring-prog-${idx}", { strokeDashoffset: ${dashOffsetTarget}, duration: 1.5, ease: "power3.out" }, START_SEC + 0.35);
      masterTl.to("#ai-gauge-card-${idx}", { scale: 1.06, y: -14, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.85);
      masterTl.fromTo("#ai-stat-pill-${idx}", { y: 70, scale: 0.85, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(1.8)" }, START_SEC + 0.55);
    `;
    return { html, gsap };
  }

  if (
    resolvedTemplate.includes('grafico') ||
    resolvedTemplate.includes('bar') ||
    promptLower.includes('gráfico') ||
    promptLower.includes('barras')
  ) {
    const bars = Array.isArray(p.bars) && p.bars.length > 0
      ? p.bars
      : Array.isArray(scene.barsData) && scene.barsData.length > 0
      ? scene.barsData
      : [
          { label: 'Estático', value: 22, displayValue: '22%' },
          { label: 'Comum', value: 51, displayValue: '51%' },
          { label: 'Motion IA', value: 96, displayValue: '96%' },
        ];

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;perspective:1200px;">
        <div style="display:flex;flex-wrap:wrap;justify-content:center;max-width:920px;font-size:48px;line-height:1.15;z-index:3;">
          ${kineticWordsHtml}
        </div>

        <div id="ai-chart-box-${idx}" style="width:100%;max-width:920px;height:520px;border-radius:36px;background:rgba(10,15,30,0.9);border:2px solid rgba(255,255,255,0.14);padding:42px 38px 34px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 35px 90px rgba(0,0,0,0.85);position:relative;overflow:hidden;">
          <!-- Linha de Tendência Vetorial Animada -->
          <svg viewBox="0 0 800 320" style="position:absolute;top:60px;left:40px;right:40px;width:calc(100% - 80px);height:280px;pointer-events:none;z-index:1;">
            <path id="ai-trend-line-${idx}" d="M 60 260 Q 380 180 720 30" fill="none" stroke="${highlightColor}" stroke-width="6" stroke-dasharray="900" stroke-dashoffset="900" stroke-linecap="round" style="filter:drop-shadow(0 0 14px ${highlightColor});" />
          </svg>

          <div style="display:flex;align-items:flex-end;justify-content:space-around;gap:28px;height:380px;z-index:2;padding-top:20px;">
            ${bars
              .slice(0, 4)
              .map((b: any, bi: number) => {
                const isWinner = bi === bars.length - 1;
                const hVal = Math.min(100, Math.max(18, Number(b.value) || 50));
                return `
                  <div style="flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:14px;">
                    <div id="ai-bval-${idx}-${bi}" style="font-size:40px;font-weight:900;color:${isWinner ? highlightColor : '#e2e8f0'};text-shadow:0 0 20px ${isWinner ? highlightColor : 'transparent'};">${escapeHtml(b.displayValue || b.value + '%')}</div>
                    <div style="width:100%;max-width:150px;height:270px;background:rgba(255,255,255,0.05);border-radius:22px;padding:8px;display:flex;align-items:flex-end;border:1px solid rgba(255,255,255,0.08);">
                      <div id="ai-bfill-${idx}-${bi}" data-h="${hVal}" style="width:100%;height:0%;border-radius:16px;background:${
                        isWinner
                          ? `linear-gradient(180deg, ${highlightColor} 0%, #f59e0b 100%)`
                          : 'linear-gradient(180deg, #475569 0%, #1e293b 100%)'
                      };box-shadow:${isWinner ? `0 0 35px ${highlightColor}88` : 'none'};"></div>
                    </div>
                    <div style="font-size:24px;font-weight:800;color:${isWinner ? '#ffffff' : '#94a3b8'};text-transform:uppercase;letter-spacing:1px;">${escapeHtml(b.label)}</div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    const barsGsap = bars
      .slice(0, 4)
      .map((b: any, bi: number) => {
        const hVal = Math.min(100, Math.max(18, Number(b.value) || 50));
        return `
          masterTl.fromTo("#ai-bfill-${idx}-${bi}", { height: "0%" }, { height: "${hVal}%", duration: 0.95, ease: "elastic.out(1, 0.75)" }, START_SEC + ${(0.3 + bi * 0.18).toFixed(2)});
          masterTl.fromTo("#ai-bval-${idx}-${bi}", { y: 30, scale: 0.5, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, START_SEC + ${(0.45 + bi * 0.18).toFixed(2)});
        `;
      })
      .join('\n');

    const gsap = `
      ${kineticWordsGsap}
      masterTl.fromTo("#ai-chart-box-${idx}", { y: 80, rotationX: 22, autoAlpha: 0 }, { y: 0, rotationX: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, START_SEC + 0.15);
      ${barsGsap}
      masterTl.to("#ai-trend-line-${idx}", { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" }, START_SEC + 0.55);
      masterTl.to("#ai-chart-box-${idx}", { y: -12, duration: ${(d * 0.45).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.8);
    `;
    return { html, gsap };
  }

  if (
    resolvedTemplate.includes('versus') ||
    promptLower.includes('versus') ||
    promptLower.includes('comparativo') ||
    promptLower.includes('lado a lado')
  ) {
    const leftTitle = p.leftTitle || scene.versusData?.leftTitle || 'MÉTODO ANTIGO';
    const rightTitle = p.rightTitle || scene.versusData?.rightTitle || 'NOVO SISTEMA IA';
    const leftItems = scene.versusData?.leftItems || [
      p.leftDesc || 'Lento, manual e cansativo',
      'Baixa retenção nos 3s iniciais',
    ];
    const rightItems = scene.versusData?.rightItems || [
      p.rightDesc || 'Automático e cinematográfico',
      'Retenção máxima até o final',
    ];

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;perspective:1200px;">
        <div style="display:flex;flex-wrap:wrap;justify-content:center;max-width:920px;font-size:44px;line-height:1.15;z-index:3;">
          ${kineticWordsHtml}
        </div>

        <!-- Card Negativo (Antigo) -->
        <div id="ai-vs-left-${idx}" style="width:100%;max-width:900px;padding:34px 38px;border-radius:30px;background:linear-gradient(135deg, rgba(127,29,29,0.35) 0%, rgba(15,23,42,0.92) 100%);border:2px solid rgba(239,68,68,0.5);box-shadow:0 25px 60px rgba(0,0,0,0.75);display:flex;flex-direction:column;gap:14px;">
          <div style="font-size:32px;font-weight:900;color:#f87171;letter-spacing:1.5px;display:flex;align-items:center;gap:12px;">
            <span style="display:inline-flex;width:42px;height:42px;border-radius:12px;background:rgba(239,68,68,0.2);align-items:center;justify-content:center;">✕</span>
            <span>${escapeHtml(leftTitle)}</span>
          </div>
          ${leftItems
            .slice(0, 2)
            .map(
              (item: string) =>
                `<div style="font-size:27px;font-weight:700;color:#cbd5e1;padding-left:10px;">• ${escapeHtml(item)}</div>`
            )
            .join('')}
        </div>

        <!-- Emblema Central de Colisão VS -->
        <div id="ai-vs-badge-${idx}" style="width:96px;height:96px;border-radius:50%;background:${highlightColor};color:#04060d;font-size:40px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 0 50px ${highlightColor};z-index:5;margin:-18px 0;">
          VS
        </div>

        <!-- Card Positivo (Novo) -->
        <div id="ai-vs-right-${idx}" style="width:100%;max-width:900px;padding:34px 38px;border-radius:30px;background:linear-gradient(135deg, rgba(16,185,129,0.28) 0%, rgba(15,23,42,0.95) 100%);border:3px solid ${highlightColor};box-shadow:0 0 55px ${highlightColor}33, 0 25px 60px rgba(0,0,0,0.85);display:flex;flex-direction:column;gap:14px;">
          <div style="font-size:32px;font-weight:900;color:${highlightColor};letter-spacing:1.5px;display:flex;align-items:center;gap:12px;">
            <span style="display:inline-flex;width:42px;height:42px;border-radius:12px;background:${highlightColor};color:#04060d;align-items:center;justify-content:center;">✓</span>
            <span>${escapeHtml(rightTitle)}</span>
          </div>
          ${rightItems
            .slice(0, 2)
            .map(
              (item: string) =>
                `<div style="font-size:28px;font-weight:800;color:#ffffff;padding-left:10px;">⚡ ${escapeHtml(item)}</div>`
            )
            .join('')}
        </div>
      </div>
    `;

    const gsap = `
      ${kineticWordsGsap}
      masterTl.fromTo("#ai-vs-left-${idx}", { x: -240, rotationY: -25, autoAlpha: 0 }, { x: 0, rotationY: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.5)" }, START_SEC + 0.18);
      masterTl.fromTo("#ai-vs-badge-${idx}", { scale: 0, rotation: -180, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.55, ease: "elastic.out(1, 0.6)" }, START_SEC + 0.38);
      masterTl.fromTo("#ai-vs-right-${idx}", { x: 240, rotationY: 25, autoAlpha: 0 }, { x: 0, rotationY: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.5)" }, START_SEC + 0.48);
      masterTl.to("#ai-vs-badge-${idx}", { scale: 1.16, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 4 }, START_SEC + 0.95);
      masterTl.to("#ai-vs-right-${idx}", { y: -10, scale: 1.02, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.9);
    `;
    return { html, gsap };
  }

  if (
    resolvedTemplate.includes('news') ||
    promptLower.includes('jornal') ||
    promptLower.includes('manchete') ||
    promptLower.includes('notícia')
  ) {
    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;perspective:1200px;">
        <div id="ai-news-card-${idx}" style="width:100%;max-width:920px;border-radius:32px;background:#f8fafc;color:#0f172a;padding:42px;box-shadow:0 40px 90px rgba(0,0,0,0.88);display:flex;flex-direction:column;gap:24px;position:relative;overflow:hidden;">
          <div style="display:flex;align-items:center;gap:14px;border-bottom:4px solid #0f172a;padding-bottom:18px;">
            <span id="ai-news-dot-${idx}" style="width:18px;height:18px;border-radius:50%;background:#ef4444;box-shadow:0 0 16px #ef4444;"></span>
            <span style="font-size:22px;font-weight:900;letter-spacing:3px;color:#0f172a;">PLANTÃO INVESTIGATIVO • ${escapeHtml(tag)}</span>
            <span style="margin-left:auto;font-size:20px;font-weight:800;color:#64748b;">URGENTE</span>
          </div>
          <div style="position:relative;display:inline-block;">
            <div id="ai-news-hl-${idx}" style="position:absolute;left:-8px;bottom:4px;height:100%;width:0%;background:${highlightColor};border-radius:10px;z-index:0;"></div>
            <h2 style="position:relative;z-index:1;font-size:50px;font-weight:900;line-height:1.12;color:#090d16;text-transform:uppercase;">${escapeHtml(headline)}</h2>
          </div>
          <p style="font-size:28px;font-weight:700;color:#334155;line-height:1.4;">${escapeHtml(subText || text)}</p>
          ${
            brollImg
              ? `<div style="height:240px;border-radius:20px;overflow:hidden;background:#0f172a;position:relative;">
                  <img id="ai-news-img-${idx}" src="${escapeHtml(brollImg)}" alt="" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />
                </div>`
              : ''
          }
        </div>
      </div>
    `;
    const gsap = `
      masterTl.fromTo("#ai-news-card-${idx}", { rotationX: 35, y: 110, scale: 0.82, autoAlpha: 0 }, { rotationX: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.6)" }, START_SEC + 0.12);
      masterTl.fromTo("#ai-news-hl-${idx}", { width: "0%" }, { width: "102%", duration: 0.75, ease: "power3.inOut" }, START_SEC + 0.55);
      masterTl.to("#ai-news-dot-${idx}", { scale: 1.45, opacity: 0.4, duration: 0.4, yoyo: true, repeat: 6 }, START_SEC + 0.2);
      if (document.querySelector("#ai-news-img-${idx}")) {
        masterTl.fromTo("#ai-news-img-${idx}", { scale: 1.25 }, { scale: 1.0, duration: ${d}, ease: "none" }, START_SEC);
      }
      masterTl.to("#ai-news-card-${idx}", { y: -12, rotationZ: -0.8, duration: ${(d * 0.45).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.8);
    `;
    return { html, gsap };
  }

  if (
    resolvedTemplate.includes('chat') ||
    resolvedTemplate.includes('tweet') ||
    promptLower.includes('whatsapp') ||
    promptLower.includes('conversa') ||
    promptLower.includes('mensage')
  ) {
    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;gap:24px;max-width:900px;margin:0 auto;perspective:1200px;">
        <div id="ai-chat-1-${idx}" style="align-self:flex-start;max-width:84%;padding:28px 34px;border-radius:30px;border-bottom-left-radius:6px;background:rgba(15,23,42,0.95);border:2px solid rgba(255,255,255,0.14);box-shadow:0 20px 50px rgba(0,0,0,0.7);">
          <div style="font-size:19px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Bastidores do Mercado</div>
          <div style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.3;">${escapeHtml(headline)}</div>
        </div>
        <div id="ai-chat-2-${idx}" style="align-self:flex-end;max-width:86%;padding:28px 34px;border-radius:30px;border-bottom-right-radius:6px;background:linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);box-shadow:0 24px 60px rgba(37,99,235,0.45);">
          <div style="font-size:30px;font-weight:700;color:#ffffff;line-height:1.35;">${escapeHtml(text)}</div>
        </div>
        <div id="ai-chat-3-${idx}" style="align-self:flex-start;max-width:84%;padding:26px 34px;border-radius:30px;border-bottom-left-radius:6px;background:rgba(15,23,42,0.95);border:3px solid ${highlightColor};box-shadow:0 0 45px ${highlightColor}44;">
          <div style="font-size:30px;font-weight:900;color:${highlightColor};">⚡ ${escapeHtml(subText || tag + ': Resultado Imediato!')}</div>
        </div>
      </div>
    `;
    const gsap = `
      masterTl.fromTo("#ai-chat-1-${idx}", { x: -120, scale: 0.75, autoAlpha: 0 }, { x: 0, scale: 1, autoAlpha: 1, duration: 0.48, ease: "back.out(1.7)" }, START_SEC + 0.15);
      masterTl.fromTo("#ai-chat-2-${idx}", { x: 120, scale: 0.75, autoAlpha: 0 }, { x: 0, scale: 1, autoAlpha: 1, duration: 0.48, ease: "back.out(1.7)" }, START_SEC + 0.75);
      masterTl.fromTo("#ai-chat-3-${idx}", { y: 60, scale: 0.8, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "elastic.out(1, 0.7)" }, START_SEC + 1.45);
      masterTl.to("#ai-chat-3-${idx}", { y: -10, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 2 }, START_SEC + 2.0);
    `;
    return { html, gsap };
  }

  if (
    resolvedTemplate.includes('segredo') ||
    promptLower.includes('confidencial') ||
    promptLower.includes('tarja') ||
    promptLower.includes('dossiê') ||
    promptLower.includes('censura')
  ) {
    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;perspective:1200px;">
        <div id="ai-dossier-box-${idx}" style="width:100%;max-width:900px;padding:52px 44px;border-radius:36px;background:rgba(10,14,26,0.94);border:3px dashed ${highlightColor}88;box-shadow:0 35px 90px rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;gap:26px;position:relative;overflow:hidden;">
          <div id="ai-stamp-${idx}" style="padding:12px 34px;border:5px solid #ef4444;color:#ef4444;font-size:32px;font-weight:900;letter-spacing:6px;border-radius:12px;transform:rotate(-7deg);box-shadow:0 0 35px rgba(239,68,68,0.4);">
            ARQUIVO CONFIDENCIAL
          </div>
          <div style="position:relative;overflow:hidden;padding:24px 36px;border-radius:20px;background:rgba(255,255,255,0.05);width:100%;text-align:center;">
            <div style="font-size:52px;font-weight:900;color:${highlightColor};text-transform:uppercase;line-height:1.15;">
              ${escapeHtml(headline)}
            </div>
            <div id="ai-redact-bar-${idx}" style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,#0f172a,#0f172a 20px,#1e293b 20px,#1e293b 40px);border:2px solid ${highlightColor};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;letter-spacing:6px;color:#94a3b8;">
              ████████████████
            </div>
          </div>
          <div style="font-size:28px;font-weight:700;color:#e2e8f0;text-align:center;line-height:1.35;">
            ${escapeHtml(subText || text)}
          </div>
        </div>
      </div>
    `;
    const gsap = `
      masterTl.fromTo("#ai-dossier-box-${idx}", { scale: 0.8, rotationX: 25, autoAlpha: 0 }, { scale: 1, rotationX: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.6)" }, START_SEC + 0.12);
      masterTl.fromTo("#ai-stamp-${idx}", { scale: 2.8, rotation: -25, autoAlpha: 0 }, { scale: 1, rotation: -7, autoAlpha: 1, duration: 0.38, ease: "power4.in" }, START_SEC + 0.35);
      masterTl.to("#ai-redact-bar-${idx}", { xPercent: 105, duration: 0.85, ease: "power3.inOut" }, START_SEC + 0.95);
      masterTl.to("#ai-dossier-box-${idx}", { y: -12, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 1.1);
    `;
    return { html, gsap };
  }

  if (
    resolvedTemplate.includes('cta') ||
    promptLower.includes('botão') ||
    promptLower.includes('cursor') ||
    promptLower.includes('clique')
  ) {
    const btnText = p.buttonText || scene.ctaText || 'QUERO COMEÇAR AGORA';
    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;perspective:1200px;">
        <!-- Ondas de Choque Concêntricas -->
        <div id="ai-cta-wave-${idx}" style="position:absolute;width:420px;height:420px;border-radius:50%;border:3px solid ${highlightColor};opacity:0;pointer-events:none;"></div>

        <div style="display:flex;flex-wrap:wrap;justify-content:center;max-width:900px;font-size:56px;line-height:1.12;z-index:3;">
          ${kineticWordsHtml}
        </div>

        <div id="ai-cta-sub-${idx}" style="font-size:30px;font-weight:700;color:#cbd5e1;max-width:780px;text-align:center;z-index:3;">
          ${escapeHtml(subText || 'Transforme sua produção com retenção máxima hoje mesmo')}
        </div>

        <!-- Botão 3D Interativo com Cursor Simulado -->
        <div style="position:relative;z-index:4;margin-top:16px;">
          <div id="ai-cta-btn-${idx}" style="padding:36px 68px;border-radius:999px;background:linear-gradient(135deg, ${highlightColor} 0%, #f59e0b 100%);color:#04060d;font-size:38px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;box-shadow:0 0 70px ${highlightColor}99, 0 20px 40px rgba(0,0,0,0.8);display:inline-flex;align-items:center;gap:18px;">
            <span>🔥 ${escapeHtml(btnText)}</span>
          </div>
          <svg id="ai-cta-cursor-${idx}" viewBox="0 0 48 48" width="82" height="82" style="position:absolute;right:-30px;bottom:-45px;filter:drop-shadow(0 14px 24px rgba(0,0,0,0.9));">
            <path d="M10 6 L38 22 L24 26 L31 40 L24 43 L17 29 L10 35 Z" fill="#ffffff" stroke="#04060d" stroke-width="3"/>
          </svg>
        </div>
      </div>
    `;

    const gsap = `
      ${kineticWordsGsap}
      masterTl.fromTo("#ai-cta-sub-${idx}", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, START_SEC + 0.35);
      masterTl.fromTo("#ai-cta-btn-${idx}", { scale: 0.5, y: 60, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(2)" }, START_SEC + 0.45);
      masterTl.fromTo("#ai-cta-cursor-${idx}", { x: 240, y: 240, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }, START_SEC + 0.65);
      masterTl.to("#ai-cta-btn-${idx}", { scale: 0.91, duration: 0.12, ease: "power2.in" }, START_SEC + 1.3);
      masterTl.to("#ai-cta-btn-${idx}", { scale: 1.08, duration: 0.35, ease: "elastic.out(1.2, 0.4)" }, START_SEC + 1.42);
      masterTl.fromTo("#ai-cta-wave-${idx}", { scale: 0.4, opacity: 0.9 }, { scale: 2.2, opacity: 0, duration: 1.1, ease: "power2.out" }, START_SEC + 1.42);
    `;
    return { html, gsap };
  }

  // Arquitetura Dinâmica Cinética 3D + HUD Vetorial + Mídia/Dossiê (Hormozi / Vox / News / Segredo / Geral)
  const html = `
    <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;perspective:1200px;">
      <!-- Grade Vetorial & Mira Dinâmica SVG -->
      <svg id="ai-hud-reticle-${idx}" viewBox="0 0 500 500" style="position:absolute;width:620px;height:620px;opacity:0.22;pointer-events:none;">
        <polygon points="250,20 470,140 470,360 250,480 30,360 30,140" fill="none" stroke="${highlightColor}" stroke-width="2" stroke-dasharray="18 10" />
        <circle cx="250" cy="250" r="180" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="8 14" />
      </svg>

      <!-- Tag / Badge Flutuante 3D -->
      <div id="ai-top-pill-${idx}" style="display:inline-flex;align-items:center;gap:14px;padding:14px 32px;border-radius:999px;background:rgba(15,23,42,0.92);border:2px solid ${highlightColor};box-shadow:0 0 35px ${highlightColor}55;z-index:3;">
        <span style="width:14px;height:14px;border-radius:50%;background:${highlightColor};box-shadow:0 0 14px ${highlightColor};"></span>
        <span style="font-size:22px;font-weight:900;letter-spacing:3px;color:${highlightColor};text-transform:uppercase;">${escapeHtml(tag)}</span>
      </div>

      <!-- Palavras Cinéticas Staggered -->
      <div style="display:flex;flex-wrap:wrap;justify-content:center;max-width:920px;font-size:56px;line-height:1.12;z-index:3;">
        ${kineticWordsHtml}
      </div>

      <!-- Showcase Visual Animado (B-Roll Frame + Scanner Laser + Subtítulo de Impacto) -->
      <div id="ai-showcase-card-${idx}" style="position:relative;width:100%;max-width:880px;border-radius:34px;overflow:hidden;background:rgba(12,18,36,0.9);border:2px solid rgba(255,255,255,0.16);box-shadow:0 35px 80px rgba(0,0,0,0.85);z-index:3;">
        ${
          brollImg
            ? `<div style="position:relative;width:100%;height:320px;overflow:hidden;">
                <img id="ai-card-img-${idx}" src="${escapeHtml(brollImg)}" alt="" style="width:100%;height:100%;object-fit:cover;filter:contrast(1.15) saturate(1.15);" onerror="this.style.display='none'" />
                <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 20%, rgba(12,18,36,0.98) 100%);"></div>
                <div id="ai-laser-${idx}" style="position:absolute;left:0;top:0;width:100%;height:4px;background:${highlightColor};box-shadow:0 0 25px ${highlightColor};"></div>
              </div>`
            : ''
        }
        <div style="padding:28px 36px;display:flex;align-items:center;justify-content:space-between;gap:20px;">
          <div style="text-align:left;">
            <div style="font-size:28px;font-weight:800;color:#f8fafc;line-height:1.3;">
              ${escapeHtml(subText || text.slice(0, 75))}
            </div>
          </div>
          <div style="width:68px;height:68px;border-radius:20px;background:${highlightColor};color:#04060d;font-size:32px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 30px ${highlightColor}88;">
            ⚡
          </div>
        </div>
      </div>
    </div>
  `;

  const gsap = `
    ${kineticWordsGsap}
    masterTl.fromTo("#ai-hud-reticle-${idx}", { scale: 0.5, rotation: 0, autoAlpha: 0 }, { scale: 1.2, rotation: 120, autoAlpha: 0.25, duration: ${d}, ease: "none" }, START_SEC);
    masterTl.fromTo("#ai-top-pill-${idx}", { y: -50, scale: 0.7, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, START_SEC + 0.08);
    masterTl.fromTo("#ai-showcase-card-${idx}", { y: 90, rotationX: 20, scale: 0.88, autoAlpha: 0 }, { y: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.5)" }, START_SEC + 0.32);
    if (document.querySelector("#ai-card-img-${idx}")) {
      masterTl.fromTo("#ai-card-img-${idx}", { scale: 1.0 }, { scale: 1.22, duration: ${d}, ease: "none" }, START_SEC);
    }
    if (document.querySelector("#ai-laser-${idx}")) {
      masterTl.fromTo("#ai-laser-${idx}", { top: "0%" }, { top: "100%", duration: ${(d * 0.5).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.2);
    }
    masterTl.to("#ai-showcase-card-${idx}", { y: -14, duration: ${(d * 0.45).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.9);
  `;

  return { html, gsap };
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
