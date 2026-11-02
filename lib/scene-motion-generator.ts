import { MOTION_TEMPLATES } from './motion-templates';
import { buildMontarEDigitarVoandoHtml } from './design-systems/templates/montar-e-digitar-voando';
import { buildFlyingWordsHtml } from './design-systems/templates/flying-words';
import { buildCardStackHtml } from './design-systems/templates/card-stack';
import { buildSpotlightHeroHtml } from './design-systems/templates/spotlight-hero-card';

export interface ProceduralSceneInput {
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
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Motor Universal de Renderização Procedural (HTML5/SVG + GSAP 3 Seekable Timeline).
 * Cobre TODOS os 124 templates de MOTION_TEMPLATES com física de mola, 3D, B-Roll integrado
 * como elemento de cena em primeiro plano (janelas flutuantes, split-screen, polaroids, cards)
 * e fidelidade direta à descrição do template selecionado pelo usuário.
 */
export function buildProceduralMotionScene(input: ProceduralSceneInput): { html: string; gsap: string } {
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
    highlightColor = '#facc15',
    primaryTextColor = '#ffffff',
    aspectRatio = '9:16',
  } = input;

  const p = scene?.componentProps || {};
  const brollUrl =
    scene?.brollUrl ||
    scene?.brollImageUrl ||
    p?.imageUrl ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85';

  const tplMeta = MOTION_TEMPLATES.find((t) => t.id === resolvedTemplate);
  const tplCategory = tplMeta?.category || '';
  const tplId = (resolvedTemplate || 'hormozi_bold').toLowerCase().trim();
  const promptLower = `${tplId} ${tplCategory} ${visualPrompt} ${tplMeta?.description || ''}`.toLowerCase();

  const effectiveHighlight = highlightColor || tplMeta?.defaultHighlightColor || '#facc15';
  const cleanHeadline = (headline || p.headline || text.slice(0, 36)).toUpperCase();
  const cleanSub = subText || p.subtext || tplMeta?.description?.slice(0, 75) || text.slice(0, 68);
  const cleanTag = (tag || p.badge || tplMeta?.badge || 'DESTAQUE').toUpperCase();

  // =========================================================================
  // 1. ENGENHARIA DEDICADA: MONTAR & DIGITAR VOANDO 3D (assemble-then-type-flyin)
  // =========================================================================
  if (
    tplId === 'assemble-then-type-flyin' ||
    tplId.includes('assemble') ||
    tplId.includes('flyin') ||
    tplId.includes('3d-char') ||
    tplId.includes('typewriter-cursor')
  ) {
    const words = cleanHeadline.split(/\s+/);
    const half = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(' ');
    const line2 = words.slice(half).join(' ') || 'EM ALTA PRECISÃO.';

    return buildMontarEDigitarVoandoHtml(
      {
        headline: `${line1}\n${line2}`,
        subheadline: cleanSub,
        ctaText: p.buttonText || scene?.ctaText || 'EXPLORAR AGORA',
        tag: cleanTag,
        highlightColor: effectiveHighlight,
        imageSrc: brollUrl,
        durationSec: d,
        aspectRatio,
      },
      idx
    );
  }

  // =========================================================================
  // 2. ENGENHARIA DEDICADA: TÚNEL 3D DE PALAVRAS VOANDO (flying-words / kinetic)
  // =========================================================================
  if (
    tplId === 'flying-words' ||
    tplId.includes('flying') ||
    tplId.includes('kinetic-word') ||
    tplId.includes('tunnel') ||
    tplId.includes('velocity-trail')
  ) {
    const speechWords = text
      .replace(/[^\w\sÀ-ÿ]/gi, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    return buildFlyingWordsHtml(
      {
        headline: cleanHeadline,
        subheadline: cleanSub,
        tag: cleanTag,
        highlightColor: effectiveHighlight,
        aspectRatio,
        words: speechWords.length >= 8 ? speechWords : undefined,
        durationSec: d,
      },
      idx
    );
  }

  // =========================================================================
  // 3. ENGENHARIA DEDICADA: LEQUE DE CARDS 3D (card-stack / bento / carousel)
  // =========================================================================
  if (
    tplId === 'card-stack' ||
    tplId.includes('stack') ||
    tplId.includes('deck') ||
    tplId.includes('carousel') ||
    tplId.includes('fan')
  ) {
    return buildCardStackHtml(
      {
        headline: cleanHeadline,
        subheadline: cleanSub,
        tag: cleanTag,
        highlightColor: effectiveHighlight,
        aspectRatio,
        brollUrl,
        durationSec: d,
      },
      idx
    );
  }

  // =========================================================================
  // 4. ENGENHARIA DEDICADA: HOLOFOTE TEATRAL & CARD HERO (spotlight-hero-card)
  // =========================================================================
  if (
    tplId === 'spotlight-hero-card' ||
    tplId.includes('spotlight') ||
    tplId.includes('hero-card') ||
    tplId.includes('aurora') ||
    tplId.includes('glass-morphism') ||
    tplId.includes('glow')
  ) {
    return buildSpotlightHeroHtml(
      {
        headline: cleanHeadline,
        subheadline: cleanSub,
        tag: cleanTag,
        highlightColor: effectiveHighlight,
        aspectRatio,
        brollUrl,
        durationSec: d,
      },
      idx
    );
  }

  // =========================================================================
  // 5. DADOS, MÉTRICAS, KPI & VELOCÍMETRO RADIAL (data / stat_counter / kpi)
  // =========================================================================
  if (
    tplId.includes('stat') ||
    tplId.includes('counter') ||
    tplId.includes('kpi') ||
    tplId.includes('ring') ||
    tplId.includes('gauge') ||
    tplId.includes('progress-circle') ||
    promptLower.includes('velocímetro') ||
    promptLower.includes('anel radial')
  ) {
    const rawNum = parseInt(String(p.number || scene?.statValue || '92').replace(/\D/g, ''), 10) || 92;
    const suffix = String(p.suffix || scene?.statValue || '%').replace(/[0-9]/g, '') || '%';
    const statLabel = p.label || scene?.statLabel || cleanHeadline;
    const dashOffsetTarget = Math.round(754 * (1 - Math.min(98, Math.max(15, rawNum)) / 100));

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;perspective:1200px;padding:40px;">
        <!-- Órbitas Holográficas Tridimensionais Giratórias -->
        <svg id="ai-orbit-${idx}" viewBox="0 0 600 600" style="position:absolute;width:720px;height:720px;opacity:0.32;pointer-events:none;">
          <circle cx="300" cy="300" r="280" stroke="${effectiveHighlight}" stroke-width="2" stroke-dasharray="14 20" fill="none" />
          <circle cx="300" cy="300" r="230" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="30 18" fill="none" />
        </svg>

        <!-- Selo de Topo + Mini Card de Mídia B-Roll Integrado -->
        <div id="ai-stat-top-${idx}" style="display:flex;align-items:center;gap:18px;padding:12px 26px;border-radius:24px;background:rgba(10,14,28,0.9);border:2px solid ${effectiveHighlight};box-shadow:0 0 35px ${effectiveHighlight}44;z-index:3;">
          <img src="${escapeHtml(brollUrl)}" alt="" style="width:56px;height:56px;border-radius:14px;object-fit:cover;border:2px solid #ffffff;" />
          <div style="text-align:left;">
            <div style="font-size:15px;font-weight:900;letter-spacing:3px;color:${effectiveHighlight};text-transform:uppercase;">${escapeHtml(cleanTag)}</div>
            <div style="font-size:20px;font-weight:800;color:#ffffff;">MÉTRICA AUDITADA EM TEMPO REAL</div>
          </div>
        </div>

        <!-- Velocímetro / Gauge Neon Central Gigante -->
        <div id="ai-gauge-card-${idx}" style="position:relative;width:390px;height:390px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle, rgba(15,23,42,0.95) 0%, rgba(4,6,13,0.98) 100%);box-shadow:0 0 90px ${effectiveHighlight}44, inset 0 0 50px rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.18);z-index:3;">
          <svg viewBox="0 0 280 280" style="width:350px;height:350px;transform:rotate(-90deg);">
            <circle cx="140" cy="140" r="120" stroke="rgba(255,255,255,0.08)" stroke-width="18" fill="none" />
            <circle id="ai-ring-prog-${idx}" cx="140" cy="140" r="120" stroke="${effectiveHighlight}" stroke-width="20" fill="none"
              stroke-dasharray="754" stroke-dashoffset="754" stroke-linecap="round"
              style="filter:drop-shadow(0 0 18px ${effectiveHighlight});" />
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span id="stat-num-${idx}" data-target="${rawNum}" data-suffix="${escapeHtml(suffix)}" style="font-size:102px;font-weight:900;color:${effectiveHighlight};letter-spacing:-3px;text-shadow:0 0 40px ${effectiveHighlight}88;">0${escapeHtml(suffix)}</span>
            <span style="font-size:16px;font-weight:800;letter-spacing:4px;color:#94a3b8;text-transform:uppercase;">IMPACTO DIRETO</span>
          </div>
        </div>

        <!-- Rótulo Inferior Flutuante -->
        <div id="ai-stat-pill-${idx}" style="padding:22px 38px;border-radius:26px;background:rgba(15,23,42,0.94);border:2px solid ${effectiveHighlight}88;backdrop-filter:blur(16px);box-shadow:0 20px 50px rgba(0,0,0,0.85);z-index:3;max-width:860px;text-align:center;">
          <div style="font-size:34px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;text-transform:uppercase;line-height:1.15;">${escapeHtml(statLabel)}</div>
          <div style="font-size:20px;font-weight:600;color:#cbd5e1;margin-top:8px;">${escapeHtml(cleanSub)}</div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-orbit-${idx}", { scale: 0.4, rotation: -90, autoAlpha: 0 }, { scale: 1.15, rotation: 120, autoAlpha: 0.35, duration: ${d}, ease: "none" }, START_SEC);
      masterTl.fromTo("#ai-stat-top-${idx}", { y: -50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, START_SEC + 0.08);
      masterTl.fromTo("#ai-gauge-card-${idx}", { scale: 0.3, rotationY: 75, autoAlpha: 0 }, { scale: 1, rotationY: 0, autoAlpha: 1, duration: 0.65, ease: "back.out(1.8)" }, START_SEC + 0.16);
      masterTl.to("#ai-ring-prog-${idx}", { strokeDashoffset: ${dashOffsetTarget}, duration: 1.4, ease: "power3.out" }, START_SEC + 0.3);
      masterTl.to("#ai-gauge-card-${idx}", { scale: 1.05, y: -10, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.85);
      masterTl.fromTo("#ai-stat-pill-${idx}", { y: 50, scale: 0.85, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.8)" }, START_SEC + 0.4);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 6. GRÁFICOS DE BARRAS, DASHBOARDS & ANALYTICS (chart / bar / data)
  // =========================================================================
  if (
    tplCategory === 'data' ||
    tplId.includes('grafico') ||
    tplId.includes('bar') ||
    tplId.includes('chart') ||
    tplId.includes('dashboard') ||
    promptLower.includes('gráfico') ||
    promptLower.includes('barras')
  ) {
    const bars = p.bars || scene?.barsData || [
      { label: 'Sem Estratégia', value: 22, displayValue: '22%' },
      { label: 'Média Comum', value: 48, displayValue: '48%' },
      { label: 'Alta Performance', value: 96, displayValue: '96%' },
    ];

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;perspective:1200px;padding:40px;">
        <!-- Header com B-Roll Integrado -->
        <div id="ai-chart-head-${idx}" style="width:100%;max-width:900px;display:flex;align-items:center;justify-content:space-between;background:rgba(15,23,42,0.92);border:2px solid rgba(255,255,255,0.15);border-radius:28px;padding:22px 30px;box-shadow:0 25px 60px rgba(0,0,0,0.8);">
          <div style="text-align:left;max-width:620px;">
            <span style="font-size:16px;font-weight:900;letter-spacing:3px;color:${effectiveHighlight};text-transform:uppercase;">📊 ${escapeHtml(cleanTag)}</span>
            <h2 style="font-size:38px;font-weight:900;color:#ffffff;text-transform:uppercase;line-height:1.1;margin-top:6px;">${escapeHtml(cleanHeadline)}</h2>
          </div>
          <img src="${escapeHtml(brollUrl)}" alt="" style="width:110px;height:110px;border-radius:20px;object-fit:cover;border:3px solid ${effectiveHighlight};box-shadow:0 0 25px ${effectiveHighlight}66;" />
        </div>

        <!-- Palco do Gráfico de Barras 3D -->
        <div id="ai-chart-box-${idx}" style="width:100%;max-width:900px;height:500px;border-radius:36px;background:rgba(10,15,30,0.92);border:2px solid ${effectiveHighlight}66;padding:38px 34px 28px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 35px 90px rgba(0,0,0,0.85);position:relative;overflow:hidden;">
          <svg viewBox="0 0 800 320" style="position:absolute;top:50px;left:40px;right:40px;width:calc(100% - 80px);height:260px;pointer-events:none;z-index:1;">
            <path id="ai-trend-line-${idx}" d="M 60 250 Q 380 170 720 25" fill="none" stroke="${effectiveHighlight}" stroke-width="6" stroke-dasharray="900" stroke-dashoffset="900" stroke-linecap="round" style="filter:drop-shadow(0 0 16px ${effectiveHighlight});" />
          </svg>

          <div style="display:flex;align-items:flex-end;justify-content:space-around;gap:24px;height:380px;z-index:2;padding-top:20px;">
            ${bars
              .slice(0, 4)
              .map((b: any, bi: number) => {
                const isWinner = bi === Math.min(bars.length, 4) - 1;
                return `
                  <div style="flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:12px;">
                    <div id="ai-bval-${idx}-${bi}" style="font-size:44px;font-weight:900;color:${isWinner ? effectiveHighlight : '#e2e8f0'};">${escapeHtml(b.displayValue || b.value + '%')}</div>
                    <div style="width:100%;max-width:160px;height:260px;background:rgba(255,255,255,0.06);border-radius:22px;padding:8px;display:flex;align-items:flex-end;border:1px solid rgba(255,255,255,0.12);">
                      <div id="ai-bfill-${idx}-${bi}" style="width:100%;height:0%;border-radius:16px;background:${
                        isWinner
                          ? `linear-gradient(180deg, ${effectiveHighlight} 0%, #f59e0b 100%)`
                          : 'linear-gradient(180deg, #475569 0%, #1e293b 100%)'
                      };box-shadow:${isWinner ? `0 0 40px ${effectiveHighlight}99` : 'none'};"></div>
                    </div>
                    <div style="font-size:22px;font-weight:800;color:${isWinner ? '#ffffff' : '#94a3b8'};text-transform:uppercase;text-align:center;">${escapeHtml(b.label)}</div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-chart-head-${idx}", { y: -50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.8)" }, START_SEC + 0.06);
      masterTl.fromTo("#ai-chart-box-${idx}", { y: 80, rotationX: 20, autoAlpha: 0 }, { y: 0, rotationX: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, START_SEC + 0.14);
      masterTl.fromTo("#ai-bfill-${idx}-0", { height: "0%" }, { height: "28%", duration: 0.75, ease: "elastic.out(1, 0.75)" }, START_SEC + 0.28);
      masterTl.fromTo("#ai-bfill-${idx}-1", { height: "0%" }, { height: "54%", duration: 0.85, ease: "elastic.out(1, 0.75)" }, START_SEC + 0.4);
      masterTl.fromTo("#ai-bfill-${idx}-2", { height: "0%" }, { height: "96%", duration: 1.05, ease: "elastic.out(1.2, 0.6)" }, START_SEC + 0.52);
      masterTl.to("#ai-trend-line-${idx}", { strokeDashoffset: 0, duration: 1.3, ease: "power2.out" }, START_SEC + 0.55);
      masterTl.to("#ai-chart-box-${idx}", { y: -10, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.9);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 7. INTERFACE SAAS, MOCKUP DE PRODUTO, CURSOR INTERATIVO & SPLIT B-ROLL
  // =========================================================================
  if (
    tplCategory === 'ui-entrance' ||
    tplCategory === 'interaction' ||
    tplId.includes('ui') ||
    tplId.includes('saas') ||
    tplId.includes('bento') ||
    tplId.includes('cursor') ||
    tplId.includes('modal') ||
    tplId.includes('window') ||
    tplId.includes('autolayout')
  ) {
    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;perspective:1200px;padding:40px;">
        <!-- Janela Mockup de Interface / Produto com B-Roll Real Dentro -->
        <div id="ai-ui-win-${idx}" style="width:100%;max-width:920px;border-radius:32px;background:rgba(13,18,32,0.95);border:2px solid rgba(255,255,255,0.18);box-shadow:0 40px 100px rgba(0,0,0,0.9), 0 0 60px ${effectiveHighlight}33;overflow:hidden;transform-style:preserve-3d;">
          <!-- Barra de Título macOS / SaaS -->
          <div style="height:56px;background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.1);padding:0 24px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;gap:10px;">
              <span style="width:14px;height:14px;border-radius:50%;background:#ef4444;"></span>
              <span style="width:14px;height:14px;border-radius:50%;background:#f59e0b;"></span>
              <span style="width:14px;height:14px;border-radius:50%;background:#10b981;"></span>
            </div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:15px;font-weight:700;color:${effectiveHighlight};letter-spacing:2px;">${escapeHtml(tplMeta?.name || cleanTag)}</div>
            <div style="font-size:13px;font-family:'JetBrains Mono',monospace;color:#94a3b8;">ATIVO ●</div>
          </div>

          <!-- Corpo da Janela: Mídia B-Roll Integrada + Cards Bento Interativos -->
          <div style="padding:32px;display:flex;flex-direction:column;gap:24px;">
            <!-- Imagem B-Roll como Destaque Visual do Produto -->
            <div id="ai-ui-media-${idx}" style="position:relative;width:100%;height:320px;border-radius:22px;overflow:hidden;border:2px solid ${effectiveHighlight}88;">
              <img src="${escapeHtml(brollUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;" />
              <div style="position:absolute;inset:0;background:linear-gradient(0deg, rgba(10,14,26,0.85) 0%, transparent 65%);"></div>
              <div style="position:absolute;bottom:20px;left:24px;right:24px;display:flex;align-items:center;justify-content:space-between;">
                <span style="padding:8px 18px;border-radius:99px;background:${effectiveHighlight};color:#04060d;font-weight:900;font-size:16px;letter-spacing:1.5px;">${escapeHtml(cleanTag)}</span>
                <span style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:800;color:#ffffff;background:rgba(0,0,0,0.65);padding:6px 14px;border-radius:10px;">4K HDR</span>
              </div>
            </div>

            <!-- Título & Subtítulo Dinâmicos -->
            <div id="ai-ui-text-${idx}" style="text-align:left;padding:4px 8px;">
              <h2 style="font-size:48px;font-weight:900;color:#ffffff;line-height:1.1;letter-spacing:-1px;text-transform:uppercase;">${escapeHtml(cleanHeadline)}</h2>
              <p style="font-size:24px;font-weight:600;color:#cbd5e1;margin-top:10px;line-height:1.35;">${escapeHtml(cleanSub)}</p>
            </div>

            <!-- Barra Interativa com Cursor Clicando -->
            <div id="ai-ui-action-${idx}" style="display:flex;align-items:center;justify-content:space-between;padding:20px 26px;border-radius:20px;background:rgba(255,255,255,0.05);border:1px solid ${effectiveHighlight}66;position:relative;">
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:18px;height:18px;border-radius:50%;background:${effectiveHighlight};box-shadow:0 0 16px ${effectiveHighlight};"></div>
                <span style="font-size:22px;font-weight:800;color:#ffffff;text-transform:uppercase;">${escapeHtml(p.buttonText || 'SISTEMA VERIFICADO')}</span>
              </div>
              <div id="ai-ui-btn-${idx}" style="padding:12px 28px;border-radius:14px;background:${effectiveHighlight};color:#04060d;font-size:20px;font-weight:900;text-transform:uppercase;">ATIVAR →</div>

              <!-- Cursor Vetorial que Clica -->
              <svg id="ai-ui-cursor-${idx}" viewBox="0 0 48 48" width="68" height="68" style="position:absolute;right:15px;bottom:-28px;filter:drop-shadow(0 12px 24px rgba(0,0,0,0.9));z-index:10;">
                <path d="M10 6 L38 22 L24 26 L31 40 L24 43 L17 29 L10 35 Z" fill="#ffffff" stroke="#04060d" stroke-width="3"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-ui-win-${idx}", { y: 120, rotationX: 22, scale: 0.84, autoAlpha: 0 }, { y: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.6)" }, START_SEC + 0.08);
      masterTl.fromTo("#ai-ui-media-${idx}", { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, START_SEC + 0.22);
      masterTl.fromTo("#ai-ui-text-${idx}", { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, START_SEC + 0.34);
      masterTl.fromTo("#ai-ui-cursor-${idx}", { x: 180, y: 160, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: "power3.out" }, START_SEC + 0.5);
      masterTl.to("#ai-ui-btn-${idx}", { scale: 0.88, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.inOut" }, START_SEC + 1.08);
      masterTl.to("#ai-ui-win-${idx}", { y: -12, rotationY: -3, duration: ${(d * 0.45).toFixed(2)}, yoyo: true, repeat: 1, ease: "sine.inOut" }, START_SEC + 0.9);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 8. VERSUS COMPARATIVO OU TRANSIÇÃO SPLIT-SCREEN (versus / transition / split)
  // =========================================================================
  if (
    tplCategory === 'transition' ||
    tplId.includes('versus') ||
    tplId.includes('split') ||
    tplId.includes('wipe') ||
    tplId.includes('comparison') ||
    promptLower.includes('versus') ||
    promptLower.includes('comparativo')
  ) {
    const leftTitle = p.leftTitle || scene?.versusData?.leftTitle || 'O ERRO COMUM';
    const rightTitle = p.rightTitle || scene?.versusData?.rightTitle || cleanHeadline;

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;perspective:1200px;padding:40px;">
        <!-- Painel Superior: Antes / Problema -->
        <div id="ai-vs-left-${idx}" style="width:100%;max-width:900px;padding:34px 38px;border-radius:30px;background:linear-gradient(135deg, rgba(127,29,29,0.55) 0%, rgba(15,23,42,0.95) 100%);border:3px solid rgba(239,68,68,0.65);box-shadow:0 25px 60px rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-between;gap:22px;">
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:68px;height:68px;border-radius:20px;background:rgba(239,68,68,0.25);border:2px solid #ef4444;display:flex;align-items:center;justify-content:center;font-size:34px;color:#ef4444;font-weight:900;flex-shrink:0;">✕</div>
            <div style="text-align:left;">
              <div style="font-size:30px;font-weight:900;color:#f87171;text-transform:uppercase;">${escapeHtml(leftTitle)}</div>
              <div style="font-size:22px;font-weight:600;color:#cbd5e1;margin-top:4px;">${escapeHtml(p.leftDesc || 'Sem escala, alto risco e perda de tempo')}</div>
            </div>
          </div>
        </div>

        <!-- Emblema Central VS Explosivo -->
        <div id="ai-vs-badge-${idx}" style="width:100px;height:100px;border-radius:50%;background:${effectiveHighlight};color:#04060d;font-size:40px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 0 55px ${effectiveHighlight};z-index:5;">
          VS
        </div>

        <!-- Painel Inferior: Depois / Solução com Imagem B-Roll -->
        <div id="ai-vs-right-${idx}" style="width:100%;max-width:900px;padding:34px 38px;border-radius:30px;background:linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(15,23,42,0.96) 100%);border:3px solid ${effectiveHighlight};box-shadow:0 0 60px ${effectiveHighlight}44, 0 30px 70px rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-between;gap:22px;">
          <div style="display:flex;align-items:center;gap:20px;">
            <img src="${escapeHtml(brollUrl)}" alt="" style="width:88px;height:88px;border-radius:20px;object-fit:cover;border:3px solid ${effectiveHighlight};flex-shrink:0;" />
            <div style="text-align:left;">
              <div style="font-size:32px;font-weight:900;color:${effectiveHighlight};text-transform:uppercase;line-height:1.1;">${escapeHtml(rightTitle)}</div>
              <div style="font-size:22px;font-weight:700;color:#ffffff;margin-top:6px;">${escapeHtml(cleanSub)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-vs-left-${idx}", { x: -260, rotationY: -25, autoAlpha: 0 }, { x: 0, rotationY: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.6)" }, START_SEC + 0.1);
      masterTl.fromTo("#ai-vs-badge-${idx}", { scale: 0, rotation: -180, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.55, ease: "elastic.out(1.2, 0.5)" }, START_SEC + 0.28);
      masterTl.fromTo("#ai-vs-right-${idx}", { x: 260, rotationY: 25, autoAlpha: 0 }, { x: 0, rotationY: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.6)" }, START_SEC + 0.38);
      masterTl.to("#ai-vs-badge-${idx}", { scale: 1.15, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 3 }, START_SEC + 0.8);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 9. FECHAMENTO, OUTRO & CTA DE ALTA CONVERSÃO (outro / cta_pulse)
  // =========================================================================
  if (
    tplCategory === 'outro' ||
    tplId.includes('cta') ||
    tplId.includes('outro') ||
    tplId.includes('endcard') ||
    tplId.includes('subscribe')
  ) {
    const btnText = p.buttonText || scene?.ctaText || 'COMEÇAR AGORA MESMO';

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;perspective:1200px;padding:40px;">
        <div id="ai-cta-wave-${idx}" style="position:absolute;width:460px;height:460px;border-radius:50%;border:4px solid ${effectiveHighlight};opacity:0;pointer-events:none;"></div>

        <!-- Card Visual Redondo com B-Roll -->
        <div id="ai-cta-img-${idx}" style="width:180px;height:180px;border-radius:50%;padding:6px;background:linear-gradient(135deg, ${effectiveHighlight}, #3b82f6);box-shadow:0 0 60px ${effectiveHighlight}77;z-index:3;">
          <img src="${escapeHtml(brollUrl)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />
        </div>

        <div id="ai-cta-head-${idx}" style="text-align:center;max-width:880px;z-index:3;">
          <span style="font-size:18px;font-weight:900;letter-spacing:4px;color:${effectiveHighlight};text-transform:uppercase;">${escapeHtml(cleanTag)}</span>
          <h2 style="font-size:62px;font-weight:900;color:#ffffff;text-transform:uppercase;line-height:1.08;margin-top:10px;text-shadow:0 10px 35px rgba(0,0,0,0.9);">${escapeHtml(cleanHeadline)}</h2>
          <p style="font-size:26px;font-weight:600;color:#cbd5e1;margin-top:12px;">${escapeHtml(cleanSub)}</p>
        </div>

        <div style="position:relative;z-index:4;margin-top:8px;">
          <div id="ai-cta-btn-${idx}" style="padding:34px 66px;border-radius:999px;background:linear-gradient(135deg, ${effectiveHighlight} 0%, #f59e0b 100%);color:#04060d;font-size:38px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;box-shadow:0 0 80px ${effectiveHighlight}aa, 0 25px 50px rgba(0,0,0,0.85);display:inline-flex;align-items:center;gap:16px;">
            <span>🚀 ${escapeHtml(btnText)}</span>
          </div>
          <svg id="ai-cta-cursor-${idx}" viewBox="0 0 48 48" width="86" height="86" style="position:absolute;right:-20px;bottom:-45px;filter:drop-shadow(0 16px 30px rgba(0,0,0,0.95));">
            <path d="M10 6 L38 22 L24 26 L31 40 L24 43 L17 29 L10 35 Z" fill="#ffffff" stroke="#04060d" stroke-width="3"/>
          </svg>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-cta-img-${idx}", { scale: 0, rotation: -45, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(2)" }, START_SEC + 0.08);
      masterTl.fromTo("#ai-cta-head-${idx}", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, START_SEC + 0.2);
      masterTl.fromTo("#ai-cta-btn-${idx}", { scale: 0.4, y: 60, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(2.2)" }, START_SEC + 0.32);
      masterTl.fromTo("#ai-cta-cursor-${idx}", { x: 240, y: 240, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, START_SEC + 0.5);
      masterTl.to("#ai-cta-btn-${idx}", { scale: 0.9, duration: 0.12, ease: "power2.in" }, START_SEC + 1.15);
      masterTl.to("#ai-cta-btn-${idx}", { scale: 1.08, duration: 0.35, ease: "elastic.out(1.3, 0.4)" }, START_SEC + 1.27);
      masterTl.fromTo("#ai-cta-wave-${idx}", { scale: 0.4, opacity: 0.95 }, { scale: 2.3, opacity: 0, duration: 1.1, ease: "power2.out" }, START_SEC + 1.27);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 10. ARQUITETURA UNIVERSAL DE ALTA RETENÇÃO: CÂMERA 3D + MÍDIA B-ROLL EM MOLDURA + TIPOGRAFIA CINÉTICA
  // =========================================================================
  const rawWords = cleanHeadline
    .replace(/[^\w\sÀ-ÿ%$]/gi, '')
    .split(/\s+/)
    .filter(Boolean);
  const impactWords = rawWords.slice(0, Math.min(5, Math.max(1, rawWords.length)));

  const kineticWordsHtml = impactWords
    .map((w: string, wi: number) => {
      const isHl = wi === impactWords.length - 1 || impactWords.length === 1;
      return `<span id="ai-kw-${idx}-${wi}" style="display:inline-block;padding:10px 24px;margin:6px;border-radius:18px;font-weight:900;font-size:64px;text-transform:uppercase;letter-spacing:-1.5px;line-height:1.05;${
        isHl
          ? `background:${effectiveHighlight};color:#04060d;box-shadow:0 0 45px ${effectiveHighlight}99;`
          : `color:${primaryTextColor};background:rgba(15,23,42,0.85);border:1px solid rgba(255,255,255,0.15);text-shadow:0 8px 24px rgba(0,0,0,0.9);`
      }">${escapeHtml(w)}</span>`;
    })
    .join('');

  const kineticWordsGsap = impactWords
    .map(
      (_: string, wi: number) => `
      masterTl.fromTo("#ai-kw-${idx}-${wi}",
        { y: 70, rotationX: -65, scale: 0.4, autoAlpha: 0 },
        { y: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 0.48, ease: "back.out(2.2)" },
        START_SEC + ${(0.18 + wi * 0.08).toFixed(2)}
      );`
    )
    .join('\n');

  const html = `
    <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;perspective:1200px;padding:40px;">
      <!-- Retícula Holográfica Tecnológica em Rotação 3D -->
      <svg id="ai-hud-reticle-${idx}" viewBox="0 0 500 500" style="position:absolute;width:720px;height:720px;opacity:0.24;pointer-events:none;">
        <polygon points="250,20 470,140 470,360 250,480 30,360 30,140" fill="none" stroke="${effectiveHighlight}" stroke-width="2.5" stroke-dasharray="20 12" />
        <circle cx="250" cy="250" r="195" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="10 16" />
      </svg>

      <!-- Badge Neon Superior -->
      <div id="ai-top-pill-${idx}" style="display:inline-flex;align-items:center;gap:14px;padding:12px 30px;border-radius:999px;background:rgba(15,23,42,0.92);border:2px solid ${effectiveHighlight};box-shadow:0 0 35px ${effectiveHighlight}66;z-index:4;">
        <span style="width:12px;height:12px;border-radius:50%;background:${effectiveHighlight};box-shadow:0 0 14px ${effectiveHighlight};"></span>
        <span style="font-size:20px;font-weight:900;letter-spacing:3px;color:${effectiveHighlight};text-transform:uppercase;">${escapeHtml(cleanTag)}</span>
      </div>

      <!-- Moldura de Vídeo/B-Roll Flutuante em Primeiro Plano (B-Roll como Elemento Protagonista) -->
      <div id="ai-broll-card-${idx}" style="position:relative;width:100%;max-width:860px;height:360px;border-radius:32px;overflow:hidden;border:3px solid rgba(255,255,255,0.22);box-shadow:0 35px 80px rgba(0,0,0,0.85), 0 0 50px ${effectiveHighlight}33;z-index:3;transform-style:preserve-3d;">
        <img id="ai-broll-fg-${idx}" src="${escapeHtml(brollUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;" />
        <div style="position:absolute;inset:0;background:linear-gradient(0deg, rgba(4,6,13,0.85) 0%, transparent 55%);"></div>
        <div style="position:absolute;bottom:20px;left:28px;right:28px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:22px;font-weight:700;color:#f8fafc;text-shadow:0 4px 12px rgba(0,0,0,0.9);">${escapeHtml(cleanSub)}</span>
        </div>
      </div>

      <!-- Impacto Tipográfico 3D -->
      <div id="ai-impact-wrap-${idx}" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;max-width:940px;z-index:4;">
        ${kineticWordsHtml}
      </div>

      <!-- Laser Scanner Holográfico Horizontal -->
      <div id="ai-laser-bar-${idx}" style="width:420px;height:5px;border-radius:99px;background:${effectiveHighlight};box-shadow:0 0 35px ${effectiveHighlight}, 0 0 10px #ffffff;z-index:4;"></div>
    </div>
  `;

  const gsap = `
    masterTl.fromTo("#ai-hud-reticle-${idx}", { scale: 0.5, rotation: 0, autoAlpha: 0 }, { scale: 1.2, rotation: 135, autoAlpha: 0.28, duration: ${d}, ease: "none" }, START_SEC);
    masterTl.fromTo("#ai-top-pill-${idx}", { y: -50, scale: 0.7, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "back.out(2)" }, START_SEC + 0.06);
    masterTl.fromTo("#ai-broll-card-${idx}", { y: 70, rotationX: 18, scale: 0.85, autoAlpha: 0 }, { y: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 0.58, ease: "back.out(1.6)" }, START_SEC + 0.14);
    masterTl.fromTo("#ai-broll-fg-${idx}", { scale: 1.0 }, { scale: 1.16, duration: ${d}, ease: "none" }, START_SEC);
    ${kineticWordsGsap}
    masterTl.fromTo("#ai-laser-bar-${idx}", { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, START_SEC + 0.4);
    masterTl.to("#ai-broll-card-${idx}", { y: -10, rotationY: 4, duration: ${(d * 0.45).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.85);
  `;

  return { html, gsap };
}
