/**
 * Template de Design System: Montar e Digitar Voando (assemble-then-type-flyin)
 * Reprodução matemática determinística da anatomia de 5.6s (168f a 30fps)
 */

export interface AssembleTemplateConfig {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  tag?: string;
  highlightColor?: string;
  imageSrc?: string;
  durationSec?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

/**
 * Função determinística para rotação e posição 3D de cada caractere
 */
function deterministicRand(seed: number): number {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Converte string em spans com inline-block e caracteres não separáveis \u00a0
 */
export function wrapCharacters3D(text: string, blockIndex: number, startFrame: number): { html: string; charsCount: number } {
  const chars = Array.from(text);
  const html = chars
    .map((ch, i) => {
      const displayChar = ch === ' ' ? '&nbsp;' : ch;
      return `<span class="char-3d char-blk-${blockIndex}" data-char-idx="${i}" style="display:inline-block;transform-style:preserve-3d;will-change:transform,opacity;">${displayChar}</span>`;
    })
    .join('');
  return { html, charsCount: chars.length };
}

/**
 * Compilador de HTML5 e GSAP 3 do Template "Montar e Digitar Voando"
 */
export function buildMontarEDigitarVoandoHtml(config: AssembleTemplateConfig, sceneIndex = 0): { html: string; gsap: string } {
  const headline = config.headline || 'Enquadre o movimento.\nCrie a cena.';
  const subheadline = config.subheadline || 'Demonstração de layout cinemático de alta precisão.';
  const ctaText = config.ctaText || 'COMEÇAR AGORA';
  const tag = config.tag || 'MOTION STUDIO';
  const highlightColor = config.highlightColor || '#e4c58a';
  const mainImage = config.imageSrc || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80';
  const idx = sceneIndex;

  const hlLines = headline.split('\n');
  const line1 = wrapCharacters3D(hlLines[0] || 'Enquadre o movimento.', 1, 58);
  const line2 = wrapCharacters3D(hlLines[1] || 'Crie a cena.', 2, 66);
  const subChars = wrapCharacters3D(subheadline, 3, 85);

  const isVertical = config.aspectRatio === '9:16';
  const isSquare = config.aspectRatio === '1:1';
  const titleSize = isSquare ? '46px' : isVertical ? '54px' : '72px';
  const gridTemplate = (isSquare || isVertical) ? '1fr' : '1.5fr 1fr';
  const cardHeight = isSquare ? '180px' : isVertical ? '260px' : '320px';

  const html = `
  <div id="assemble-stage-${idx}" style="position:relative;width:100%;height:100%;background:#090b10;overflow:hidden;font-family:'Inter',sans-serif;color:#ffffff;display:flex;flex-direction:column;justify-content:space-between;padding:${isSquare ? '28px 24px' : '48px 40px'};box-sizing:border-box;">
    
    <!-- Linhas de Referência de Grid (12 Colunas) que desaparecem no f50 -->
    <div id="grid-lines-${idx}" style="position:absolute;inset:0;display:flex;justify-content:space-between;padding:0 ${isSquare ? '24px' : '40px'};pointer-events:none;opacity:0.25;z-index:1;">
      <div style="width:1px;height:100%;background:#ffffff;"></div>
      <div style="width:1px;height:100%;background:#ffffff;"></div>
      <div style="width:1px;height:100%;background:#ffffff;"></div>
      <div style="width:1px;height:100%;background:#ffffff;"></div>
      <div style="width:1px;height:100%;background:#ffffff;"></div>
      <div style="width:1px;height:100%;background:#ffffff;"></div>
      <div style="width:1px;height:100%;background:#ffffff;"></div>
      <div style="width:1px;height:100%;background:#ffffff;"></div>
    </div>

    <!-- Barra de Navegação (Esqueleto Comp 1 e 3) -->
    <header id="sk-nav-${idx}" style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:${isSquare ? '12px' : '18px'};">
      <div style="display:flex;align-items:center;gap:12px;">
        <div id="sk-logo-${idx}" style="width:32px;height:32px;border-radius:8px;background:${highlightColor};box-shadow:0 0 20px ${highlightColor}88;"></div>
        <span style="font-weight:900;letter-spacing:3px;font-size:14px;color:${highlightColor};">${tag}</span>
      </div>
      <div style="display:flex;gap:16px;align-items:center;">
        <span style="font-size:11px;color:rgba(255,255,255,0.6);font-mono">PRODUÇÃO 4K</span>
        <div style="width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 10px #10b981;"></div>
      </div>
    </header>

    <!-- Corpo Central: Título 3D e Grade de Layout -->
    <main style="position:relative;z-index:10;flex:1;display:flex;flex-direction:column;justify-content:center;gap:${isSquare ? '14px' : '24px'};perspective:900px;perspective-origin:center center;">
      
      <!-- Bloco de Título Principal Serifado 3D -->
      <div style="font-size:${titleSize};font-weight:900;line-height:1.05;letter-spacing:-1.5px;text-transform:uppercase;">
        <div id="hl-row-1-${idx}" style="perspective:900px;">${line1.html}</div>
        <div id="hl-row-2-${idx}" style="perspective:900px;color:${highlightColor};">${line2.html}</div>
      </div>

      <!-- Bloco Explicativo com Caracteres 3D -->
      <div id="sub-row-${idx}" style="font-size:${isSquare ? '16px' : '22px'};color:rgba(255,255,255,0.75);font-weight:600;max-width:850px;line-height:1.4;perspective:900px;">
        ${subChars.html}
      </div>

      <!-- Grade dos Componentes do Esqueleto -->
      <div style="display:grid;grid-template-columns:${gridTemplate};gap:${isSquare ? '14px' : '24px'};margin-top:${isSquare ? '4px' : '12px'};">
        <!-- Card de Mídia / Imagem com Linha de Revelação Dourada -->
        <div id="sk-image-card-${idx}" style="position:relative;height:${cardHeight};border-radius:20px;overflow:hidden;border:2px solid rgba(255,255,255,0.12);background:#0f131f;">
          <img id="film-img-${idx}" src="${mainImage}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(100%) contrast(1.1);" alt="" />
          <div id="gold-wipe-line-${idx}" style="position:absolute;top:0;bottom:0;width:4px;background:${highlightColor};box-shadow:0 0 25px ${highlightColor};left:0%;"></div>
        </div>

        ${!isSquare ? `
        <!-- Painel Lateral de Métricas / Color Wheel (Exibido em 16:9 e 9:16) -->
        <div id="sk-side-card-${idx}" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;font-mono;color:${highlightColor};letter-spacing:2px;">CORREÇÃO DE COR</span>
            <span style="font-size:14px;font-weight:900;">3200K ➔ 5600K</span>
          </div>

          <div style="display:flex;justify-content:space-around;gap:12px;">
            <div id="wheel-1-${idx}" style="width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);position:relative;display:flex;align-items:center;justify-content:center;">
              <div id="dot-1-${idx}" style="width:8px;height:8px;border-radius:50%;background:#ef4444;position:absolute;"></div>
            </div>
            <div id="wheel-2-${idx}" style="width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);position:relative;display:flex;align-items:center;justify-content:center;">
              <div id="dot-2-${idx}" style="width:8px;height:8px;border-radius:50%;background:#10b981;position:absolute;"></div>
            </div>
            <div id="wheel-3-${idx}" style="width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,0.2);position:relative;display:flex;align-items:center;justify-content:center;">
              <div id="dot-3-${idx}" style="width:8px;height:8px;border-radius:50%;background:#38bdf8;position:absolute;"></div>
            </div>
          </div>

          <div style="font-size:11px;color:rgba(255,255,255,0.4);font-mono;text-align:right;">LUT: GOLD_WARM_V2</div>
        </div>
        ` : ''}
      </div>
    </main>

    <!-- Rodapé: CTA e Botão Secundário -->
    <footer style="position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:${isSquare ? '12px' : '20px'};">
      <div id="sk-sec-btn-${idx}" style="padding:10px 20px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);">
        Documentação
      </div>

      <!-- CTA de Contorno que Vira Dourado Sólido -->
      <div id="sk-cta-btn-${idx}" style="padding:12px 28px;border-radius:10px;border:2px solid ${highlightColor};color:${highlightColor};font-size:14px;font-weight:900;letter-spacing:1px;text-transform:uppercase;display:flex;align-items:center;gap:8px;box-shadow:0 0 30px transparent;">
        <span>${ctaText}</span>
        <span>→</span>
      </div>
    </footer>
  </div>
  `;

  // Geração do Script GSAP com física determinística exata
  let charsGsap = '';

  // Animação 3D caractere por caractere para cada linha de texto
  const buildCharsAnimation = (className: string, baseStartSec: number, totalChars: number) => {
    let script = '';
    const step = Math.min(1.6 / 30, Math.max(0.35 / 30, (128 / 30 - baseStartSec - 16 / 30) / Math.max(1, totalChars)));

    for (let i = 0; i < totalChars; i++) {
      const seed = idx * 1000 + i;
      const dx = (deterministicRand(seed * 1) * 2 - 1) * 260;
      const dy = (deterministicRand(seed * 2) * 2 - 1) * 200;
      const dz = -(200 + deterministicRand(seed * 3) * 560); // -200 até -760
      const rotX = (deterministicRand(seed * 4) * 2 - 1) * 170;
      const rotY = (deterministicRand(seed * 5) * 2 - 1) * 190;
      const rotZ = (deterministicRand(seed * 6) * 2 - 1) * 120;
      const charTime = Number((baseStartSec + i * step).toFixed(3));

      script += `
        masterTl.fromTo(".${className}[data-char-idx='${i}']",
          {
            opacity: 0,
            transform: "translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, ${dz.toFixed(1)}px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) rotateZ(${rotZ.toFixed(1)}deg)",
            filter: "blur(8px)"
          },
          {
            opacity: 1,
            transform: "none",
            filter: "blur(0px)",
            duration: 0.53, // 16 frames
            ease: "back.out(1.8)"
          },
          START_SEC + ${charTime}
        );
      `;
    }
    return script;
  };

  // Linhas do cabeçalho
  charsGsap += buildCharsAnimation('char-blk-1', 58 / 30, line1.charsCount);
  charsGsap += buildCharsAnimation('char-blk-2', 66 / 30, line2.charsCount);
  charsGsap += buildCharsAnimation('char-blk-3', 85 / 30, subChars.charsCount);

  const gsap = `
    // --- TEMPLATE: MONTAR E DIGITAR VOANDO (5.6s - 168f) ---
    
    // 1. Etapa 1: Componentes do Esqueleto Planar (f6 -> f44 com overshoot)
    masterTl.fromTo("#sk-nav-${idx}", { y: -120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.53, ease: "back.out(1.7)" }, START_SEC + ${6 / 30});
    masterTl.fromTo("#sk-logo-${idx}", { scale: 0, rotation: -45 }, { scale: 1, rotation: 0, duration: 0.53, ease: "back.out(2)" }, START_SEC + ${15 / 30});
    masterTl.fromTo("#sk-image-card-${idx}", { y: 220, rotation: -7, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.53, ease: "back.out(1.7)" }, START_SEC + ${23 / 30});
    if (document.getElementById("sk-side-card-${idx}")) {
      masterTl.fromTo("#sk-side-card-${idx}", { x: 260, rotation: 7, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.53, ease: "back.out(1.7)" }, START_SEC + ${31 / 30});
    }
    masterTl.fromTo("#sk-sec-btn-${idx}", { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.53, ease: "back.out(1.7)" }, START_SEC + ${35 / 30});
    masterTl.fromTo("#sk-cta-btn-${idx}", { y: 180, opacity: 0 }, { y: 0, opacity: 1, duration: 0.53, ease: "back.out(1.7)" }, START_SEC + ${39 / 30});

    // 2. Transição e Desaparecimento da Grade de Referência (f50)
    masterTl.to("#grid-lines-${idx}", { opacity: 0, duration: 0.26, ease: "power2.out" }, START_SEC + ${50 / 30});

    // 3. Etapa 2: Texto 3D Voando Caractere por Caractere (f58 -> f128)
    ${charsGsap}

    // 4. Etapa 3: Acabamento e Revelação (f118 -> f168)
    // Wipe da Imagem cinematográfica do preto-e-branco para cores ricas
    masterTl.fromTo("#gold-wipe-line-${idx}", { left: "0%" }, { left: "100%", duration: 0.73, ease: "power2.inOut" }, START_SEC + ${124 / 30});
    masterTl.to("#film-img-${idx}", { filter: "grayscale(0%) contrast(1.2)", duration: 0.73, ease: "power2.inOut" }, START_SEC + ${124 / 30});

    // Transformação do CTA de contorno para dourado sólido brilhante
    masterTl.to("#sk-cta-btn-${idx}", {
      backgroundColor: "${highlightColor}",
      color: "#080a0f",
      boxShadow: "0 0 45px ${highlightColor}aa",
      scale: 1.05,
      duration: 0.46,
      ease: "power3.out"
    }, START_SEC + ${118 / 30});

    // Movimentação dos pontos das 3 Rodas de Cores se existirem
    if (document.getElementById("dot-1-${idx}")) {
      masterTl.to("#dot-1-${idx}", { x: 14, y: -10, duration: 0.6, ease: "power2.out" }, START_SEC + ${120 / 30});
      masterTl.to("#dot-2-${idx}", { x: -12, y: 12, duration: 0.6, ease: "power2.out" }, START_SEC + ${122 / 30});
      masterTl.to("#dot-3-${idx}", { x: 10, y: 14, duration: 0.6, ease: "power2.out" }, START_SEC + ${124 / 30});
    }

    // Respiração lenta de 1.5% do canvas até o final dos 5.6s
    masterTl.to("#assemble-stage-${idx}", { scale: 1.015, duration: 1.33, ease: "none" }, START_SEC + ${128 / 30});
  `;

  return { html, gsap };
}
