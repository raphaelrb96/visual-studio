// Gerador Procedural HTML5 + GSAP: Holofote Teatral & Card Hero (spotlight-hero-card)
// 100% Nativo, determinístico e acoplado à masterTl via START_SEC.

export interface SpotlightHeroParams {
  headline?: string;
  subheadline?: string;
  tag?: string;
  highlightColor?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  brollUrl?: string;
  durationSec?: number;
}

export function buildSpotlightHeroHtml(params: SpotlightHeroParams, sceneIndex: number = 0) {
  const headline = params.headline || 'O FOCO CENTRAL.';
  const subheadline = params.subheadline || 'PRODUTO EM DESTAQUE CINEMÁTICO';
  const tag = params.tag || 'MOTION STUDIO';
  const highlightColor = params.highlightColor || '#f59e0b';
  const idx = sceneIndex;
  const dur = Math.max(3.5, params.durationSec || 5.0);

  const html = `
    <div id="spotlight-viewport-${idx}" style="position:relative; width:100%; height:100%; background:radial-gradient(circle at 50% 30%, rgba(15, 23, 42, 0.72) 0%, rgba(5, 7, 14, 0.94) 85%); overflow:hidden; display:flex; align-items:center; justify-content:center; font-family:'Inter', sans-serif;">
      
      <!-- Feixe Cônico de Holofote Teatral -->
      <div id="spotlight-beam-${idx}" style="
        position:absolute;
        top:-180px;
        left:50%;
        width:920px;
        height:1500px;
        transform:translateX(-50%);
        background: radial-gradient(ellipse at top, ${highlightColor}66 0%, ${highlightColor}18 55%, transparent 82%);
        clip-path: polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%);
        pointer-events:none;
        filter: blur(14px);
        opacity: 0;
      "></div>

      <!-- Container Central do Card Hero -->
      <div id="hero-card-container-${idx}" style="position:relative; z-index:10; display:flex; flex-direction:column; align-items:center; width:100%; max-width:880px; padding:0 32px;">
        
        <!-- Cartão Hero com Iluminação de Borda e Mídia Integrada -->
        <div id="hero-card-${idx}" style="
          width: 100%;
          min-height: 520px;
          border-radius: 36px;
          background: linear-gradient(145deg, rgba(19, 23, 34, 0.94), rgba(10, 13, 20, 0.96));
          border: 2px solid ${highlightColor};
          box-shadow: 0 35px 90px rgba(0,0,0,0.9), 0 0 65px ${highlightColor}44;
          padding: 44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        ">
          <!-- Brilho de Varredura de Borda -->
          <div id="card-sheen-${idx}" style="position:absolute; top:-50%; left:-50%; width:200%; height:200%; background:linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.22) 50%, transparent 60%); pointer-events:none; transform:translateX(-100%); z-index:4;"></div>

          <!-- Topo do Card -->
          <div style="display:flex; justify-content:space-between; align-items:center; position:relative; z-index:3;">
            <div style="display:inline-flex; align-items:center; gap:12px; padding:8px 22px; border-radius:999px; background:rgba(255,255,255,0.06); border:1px solid ${highlightColor}66;">
              <span style="width:12px; height:12px; border-radius:50%; background:${highlightColor}; box-shadow:0 0 14px ${highlightColor};"></span>
              <span style="font-family:'JetBrains Mono', monospace; font-size:16px; font-weight:800; letter-spacing:0.15em; color:${highlightColor}; text-transform:uppercase;">${tag}</span>
            </div>
            <span style="font-size:14px; font-family:'JetBrains Mono', monospace; color:#94a3b8; font-weight:800;">PRODUÇÃO 4K</span>
          </div>

          ${params.brollUrl ? `
          <!-- Janela de Mídia B-Roll Integrada ao Card Hero -->
          <div id="hero-media-${idx}" style="position:relative; width:100%; height:240px; border-radius:22px; overflow:hidden; margin:24px 0; border:1px solid rgba(255,255,255,0.15); z-index:3;">
            <img src="${params.brollUrl}" alt="" style="width:100%; height:100%; object-fit:cover;" />
            <div style="position:absolute; inset:0; background:linear-gradient(0deg, rgba(10,13,20,0.65) 0%, transparent 60%);"></div>
          </div>
          ` : ''}

          <!-- Centro do Card com Títulos -->
          <div style="position:relative; z-index:3; margin: 16px 0;">
            <h2 style="font-size:56px; font-weight:900; color:#ffffff; letter-spacing:-0.03em; line-height:1.08; margin-bottom:14px; text-transform:uppercase;">
              ${headline}
            </h2>
            <p style="font-size:24px; color:#cbd5e1; font-weight:600; line-height:1.35;">
              ${subheadline}
            </p>
          </div>

          <!-- Rodapé do Card com Barra de Progresso -->
          <div style="display:flex; align-items:center; gap:20px; position:relative; z-index:3; margin-top:16px;">
            <div style="flex:1; height:8px; background:rgba(255,255,255,0.1); border-radius:99px; overflow:hidden;">
              <div id="spot-bar-${idx}" style="width:0%; height:100%; background:${highlightColor}; border-radius:99px; box-shadow:0 0 18px ${highlightColor};"></div>
            </div>
            <span style="font-size:16px; font-family:'JetBrains Mono', monospace; font-weight:800; color:${highlightColor};">EM DESTAQUE</span>
          </div>
        </div>

        <!-- Anel de Luz no Chão Sob o Card -->
        <div id="floor-glow-${idx}" style="
          width: 620px;
          height: 64px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, ${highlightColor}77 0%, transparent 72%);
          margin-top: 28px;
          filter: blur(12px);
          opacity: 0;
        "></div>
      </div>
    </div>
  `;

  const gsapScript = `
    // --- TEMPLATE: SPOTLIGHT HERO CARD ---
    masterTl.fromTo("#spotlight-beam-${idx}", { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 0.55, ease: "power2.out" }, START_SEC + 0.05);
    masterTl.fromTo("#hero-card-${idx}", { y: 110, scale: 0.85, rotationX: 18, autoAlpha: 0 }, { y: 0, scale: 1, rotationX: 0, autoAlpha: 1, duration: 0.65, ease: "back.out(1.6)" }, START_SEC + 0.16);
    masterTl.fromTo("#floor-glow-${idx}", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }, START_SEC + 0.28);
    masterTl.fromTo("#card-sheen-${idx}", { xPercent: -100 }, { xPercent: 120, duration: 1.2, ease: "power2.inOut" }, START_SEC + 0.5);
    masterTl.fromTo("#spot-bar-${idx}", { width: "0%" }, { width: "92%", duration: ${(dur * 0.7).toFixed(2)}, ease: "power2.out" }, START_SEC + 0.35);
    masterTl.to("#hero-card-${idx}", { y: -14, duration: ${(dur * 0.4).toFixed(2)}, yoyo: true, repeat: 1, ease: "sine.inOut" }, START_SEC + 0.85);
  `;

  return { html, gsap: gsapScript };
}
