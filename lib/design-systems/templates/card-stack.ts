// Gerador Procedural HTML5 + GSAP: Leque de Cards Dinâmico (card-stack)
// 100% Nativo, determinístico e acoplado à masterTl via START_SEC.

export interface CardStackParams {
  headline?: string;
  subheadline?: string;
  tag?: string;
  highlightColor?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  cards?: Array<{ title: string; tag: string; isHero?: boolean }>;
  brollUrl?: string;
  durationSec?: number;
}

export function buildCardStackHtml(params: CardStackParams, sceneIndex: number = 0) {
  const headline = params.headline || 'ESTRUTURA & MOTION';
  const subheadline = params.subheadline || 'COLEÇÃO DE COMPONENTES EM LEQUE 3D';
  const tag = params.tag || 'MOTION STUDIO';
  const highlightColor = params.highlightColor || '#6366f1';
  const idx = sceneIndex;
  const dur = Math.max(3.5, params.durationSec || 5.0);

  const defaultCards = [
    { title: 'Atenção Imediata', tag: 'PASSO 01 · GANCHO' },
    { title: 'Prova Visual', tag: 'PASSO 02 · DADOS' },
    { title: headline.slice(0, 26), tag: `${tag} · PRINCIPAL`, isHero: true },
    { title: 'Retenção Máxima', tag: 'PASSO 04 · RITMO' },
    { title: 'Ação & Escala', tag: 'PASSO 05 · META' },
  ];
  const cards = params.cards && params.cards.length >= 3 ? params.cards : defaultCards;
  const center = (cards.length - 1) / 2;

  const html = `
    <div id="card-stack-viewport-${idx}" style="position:relative; width:100%; height:100%; background:radial-gradient(circle at 50% 25%, rgba(30, 27, 75, 0.75) 0%, rgba(7, 10, 19, 0.92) 85%); overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:'Inter', sans-serif;">
      
      <!-- Bloco de Título Superior -->
      <div id="cs-header-${idx}" style="position:relative; text-align:center; z-index:20; margin-bottom:40px; max-width:900px; padding:0 24px;">
        <div style="display:inline-flex; align-items:center; gap:10px; padding:8px 24px; border-radius:999px; background:rgba(15,23,42,0.85); border:2px solid ${highlightColor}; box-shadow:0 0 25px ${highlightColor}55; margin-bottom:18px;">
          <span style="width:10px; height:10px; border-radius:50%; background:${highlightColor};"></span>
          <span style="font-family:'JetBrains Mono', monospace; font-size:16px; font-weight:800; letter-spacing:0.2em; color:#ffffff;">${tag}</span>
        </div>
        <h1 style="font-size:62px; font-weight:900; letter-spacing:-0.03em; color:#ffffff; text-transform:uppercase; line-height:1.08; text-shadow:0 10px 35px rgba(0,0,0,0.9);">
          ${headline}
        </h1>
        <p style="font-size:24px; color:#cbd5e1; font-weight:600; margin-top:10px;">
          ${subheadline}
        </p>
      </div>

      <!-- Palco dos Cartões em Leque -->
      <div id="stack-container-${idx}" style="position:relative; width:420px; height:460px; display:flex; align-items:center; justify-content:center; perspective:1200px;">
        ${cards.map((c, i) => {
          return `
            <div class="stack-card-${idx}" id="scard-${idx}-${i}" style="
              position:absolute;
              width:330px;
              height:420px;
              border-radius:28px;
              background:${c.isHero ? `linear-gradient(145deg, ${highlightColor}, #1e1b4b)` : 'rgba(15, 23, 42, 0.94)'};
              border: 2px solid ${c.isHero ? '#ffffff' : 'rgba(255,255,255,0.16)'};
              box-shadow: ${c.isHero ? `0 30px 70px rgba(0,0,0,0.85), 0 0 50px ${highlightColor}77` : '0 20px 45px rgba(0,0,0,0.75)'};
              padding: 28px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              transform-origin: 50% 115%;
              z-index: ${c.isHero ? 30 : 10 + i};
              overflow: hidden;
            ">
              ${c.isHero && params.brollUrl ? `<img src="${params.brollUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.32;mix-blend-mode:luminosity;pointer-events:none;" />` : ''}
              <div style="position:relative;z-index:2;display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:13px; font-family:'JetBrains Mono', monospace; font-weight:800; color:${c.isHero ? '#ffffff' : '#94a3b8'}; text-transform:uppercase;">${c.tag}</span>
                <span style="font-size:18px; font-weight:900; color:${c.isHero ? '#ffffff' : highlightColor};">0${i + 1}</span>
              </div>
              <div style="position:relative;z-index:2;">
                <h3 style="font-size:32px; font-weight:900; color:#ffffff; line-height:1.15; text-transform:uppercase;">${c.title}</h3>
                <div style="width:64px; height:5px; background:${c.isHero ? '#ffffff' : highlightColor}; margin-top:16px; border-radius:4px;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  let cardsGsap = '';
  cards.forEach((c, i) => {
    const rot = Number(((i - center) * 11).toFixed(1));
    const xOff = Math.round((i - center) * 125);
    const yOff = Math.round(Math.abs(i - center) * 18);
    cardsGsap += `
      masterTl.fromTo("#scard-${idx}-${i}",
        { y: 500, rotation: 0, x: 0, autoAlpha: 0, scale: 0.75 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.6)" },
        START_SEC + ${(0.1 + i * 0.07).toFixed(2)}
      );
      masterTl.to("#scard-${idx}-${i}",
        { rotation: ${rot}, x: ${xOff}, y: ${yOff}, duration: 0.75, ease: "back.out(1.7)" },
        START_SEC + 0.58
      );
    `;
    if (c.isHero) {
      cardsGsap += `
        masterTl.to("#scard-${idx}-${i}",
          { y: -42, scale: 1.12, duration: 0.65, ease: "back.out(2)" },
          START_SEC + 1.15
        );
        masterTl.to("#scard-${idx}-${i}",
          { y: -54, duration: ${(dur * 0.35).toFixed(2)}, yoyo: true, repeat: 1, ease: "sine.inOut" },
          START_SEC + 1.85
        );
      `;
    }
  });

  const gsapScript = `
    // --- TEMPLATE: CARD STACK 3D FAN ---
    masterTl.fromTo("#cs-header-${idx}", { y: -50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, START_SEC + 0.05);
    ${cardsGsap}
  `;

  return { html, gsap: gsapScript };
}
