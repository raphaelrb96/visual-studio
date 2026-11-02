// Gerador Procedural HTML5 + GSAP: Túnel 3D de Palavras em Hipervelocidade (flying-words)
// 100% Nativo, determinístico e acoplado à masterTl via START_SEC.

export interface FlyingWordsParams {
  headline?: string;
  subheadline?: string;
  tag?: string;
  highlightColor?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  words?: string[];
  durationSec?: number;
}

export function buildFlyingWordsHtml(params: FlyingWordsParams, sceneIndex: number = 0) {
  const headline = params.headline || 'MOVIMENTO CINEMÁTICO';
  const subheadline = params.subheadline || 'HIPERVELOCIDADE & PROFUNDIDADE 3D';
  const tag = params.tag || 'MOTION STUDIO';
  const highlightColor = params.highlightColor || '#60a5fa';
  const idx = sceneIndex;
  const dur = Math.max(3.5, params.durationSec || 5.0);

  const defaultWords = [
    'Timeline', 'Keyframes', 'Easing', 'Câmera 3D', 'Profundidade', 'Paralaxe',
    'Motion Blur', 'Física Spring', 'Camadas', 'Tipografia', 'Iluminação', 'Granulação',
    'Beat Grid', 'Stagger', 'Transições', 'Cores', 'Áudio Sync', 'Storyboards', 'Órbita',
    'Alta Retenção', 'Engajamento', 'Impacto'
  ];
  const words = params.words && params.words.length >= 6 ? params.words : defaultWords;

  const html = `
    <div id="flying-words-viewport-${idx}" style="position:relative; width:100%; height:100%; background:radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.72) 0%, rgba(3, 7, 18, 0.92) 85%); overflow:hidden; display:flex; align-items:center; justify-content:center; font-family:'Inter', sans-serif;">
      
      <!-- Fundo Radial com Bloom de Luz -->
      <div id="fw-bloom-${idx}" style="position:absolute; inset:0; background: radial-gradient(circle at 50% 50%, ${highlightColor}33 0%, transparent 70%); pointer-events:none;"></div>
      
      <!-- Túnel 3D Container com Perspectiva -->
      <div id="tunnel-3d-${idx}" style="position:absolute; width:100%; height:100%; perspective:850px; transform-style:preserve-3d; pointer-events:none;">
        ${words.map((w, i) => {
          const angle = (i / words.length) * Math.PI * 2;
          const radius = 280 + (i % 3) * 110;
          const x = Math.round(Math.cos(angle) * radius);
          const y = Math.round(Math.sin(angle) * radius * 0.75);
          const color = (i % 3 === 0) ? highlightColor : (i % 2 === 0 ? '#f8fafc' : '#94a3b8');
          const isAccent = i % 3 === 0;
          return `
            <div class="tunnel-word-${idx}" id="tword-${idx}-${i}" style="
              position:absolute;
              left:calc(50% + ${x}px);
              top:calc(50% + ${y}px);
              transform:translate(-50%, -50%) translateZ(-2200px);
              font-size: ${isAccent ? '62px' : '44px'};
              font-weight: 900;
              letter-spacing: -0.02em;
              white-space: nowrap;
              color: ${color};
              opacity: 0;
              text-transform: uppercase;
              text-shadow: ${isAccent ? `0 0 30px ${highlightColor}` : '0 4px 16px rgba(0,0,0,0.85)'};
            ">${w}</div>
          `;
        }).join('')}
      </div>

      <!-- Anéis de Velocidade SVG -->
      <svg id="fw-rings-${idx}" viewBox="0 0 800 800" style="position:absolute; width:820px; height:820px; opacity:0.25; pointer-events:none;">
        <circle cx="400" cy="400" r="340" fill="none" stroke="${highlightColor}" stroke-width="2" stroke-dasharray="18 28" />
        <circle cx="400" cy="400" r="240" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="8 20" />
      </svg>

      <!-- Máscara Central para Destacar o Título -->
      <div style="position:absolute; width:820px; height:420px; border-radius:50%; background:radial-gradient(ellipse at center, rgba(3,7,18,0.92) 0%, rgba(3,7,18,0.6) 55%, transparent 100%); pointer-events:none;"></div>

      <!-- Bloco de Texto Central de Primeiro Plano -->
      <div id="fw-center-${idx}" style="position:relative; z-index:10; text-align:center; max-width:940px; padding:0 40px;">
        <!-- Tag / Selo Superior -->
        <div id="fw-tag-${idx}" style="display:inline-flex; align-items:center; gap:10px; padding:10px 26px; border-radius:999px; background:rgba(15,23,42,0.85); border:2px solid ${highlightColor}; box-shadow:0 0 28px ${highlightColor}55; margin-bottom:26px;">
          <span style="width:10px; height:10px; border-radius:50%; background:${highlightColor}; box-shadow:0 0 12px ${highlightColor};"></span>
          <span style="font-family:'JetBrains Mono', monospace; font-size:18px; font-weight:800; letter-spacing:0.2em; color:#ffffff; text-transform:uppercase;">${tag}</span>
        </div>

        <!-- Headline Principal Imponente -->
        <h1 id="fw-hl-${idx}" style="font-size:76px; font-weight:900; line-height:1.05; letter-spacing:-0.03em; color:#ffffff; text-transform:uppercase; margin-bottom:18px; text-shadow:0 12px 40px rgba(0,0,0,0.95), 0 0 35px ${highlightColor}55;">
          ${headline}
        </h1>

        <!-- Subheadline Elegante -->
        <p id="fw-sub-${idx}" style="font-size:28px; font-weight:700; color:#cbd5e1; letter-spacing:-0.01em; text-shadow:0 4px 16px rgba(0,0,0,0.9);">
          ${subheadline}
        </p>
      </div>
    </div>
  `;

  let wordsGsap = '';
  words.forEach((_, i) => {
    const startOffset = Number(((i / words.length) * (dur * 0.65)).toFixed(2));
    const flyDur = Number(Math.max(1.4, dur * 0.45).toFixed(2));
    wordsGsap += `
      masterTl.fromTo("#tword-${idx}-${i}",
        { z: -2200, opacity: 0, scale: 0.3 },
        { z: 250, opacity: 1, scale: 1.15, duration: ${(flyDur * 0.7).toFixed(2)}, ease: "power2.in" },
        START_SEC + ${startOffset}
      );
      masterTl.to("#tword-${idx}-${i}",
        { z: 650, opacity: 0, scale: 1.6, duration: ${(flyDur * 0.3).toFixed(2)}, ease: "power1.in" },
        START_SEC + ${(startOffset + flyDur * 0.7).toFixed(2)}
      );
    `;
  });

  const gsapScript = `
    // --- TEMPLATE: FLYING WORDS 3D TUNNEL ---
    masterTl.fromTo("#fw-tag-${idx}", { y: -40, scale: 0.7, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, START_SEC + 0.08);
    masterTl.fromTo("#fw-hl-${idx}", { scale: 0.5, z: -400, autoAlpha: 0 }, { scale: 1, z: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.8)" }, START_SEC + 0.16);
    masterTl.fromTo("#fw-sub-${idx}", { y: 35, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, START_SEC + 0.32);
    masterTl.fromTo("#fw-rings-${idx}", { rotation: 0, scale: 0.75 }, { rotation: 140, scale: 1.18, duration: ${dur}, ease: "none" }, START_SEC);
    masterTl.fromTo("#tunnel-3d-${idx}", { rotationZ: -4 }, { rotationZ: 4, duration: ${dur}, ease: "sine.inOut" }, START_SEC);
    masterTl.to("#fw-hl-${idx}", { scale: 1.05, duration: ${(dur * 0.45).toFixed(2)}, yoyo: true, repeat: 1, ease: "sine.inOut" }, START_SEC + 0.7);
    ${wordsGsap}
  `;

  return { html, gsap: gsapScript };
}
