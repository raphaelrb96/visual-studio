import { ScriptScene } from '@/types/studio';

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
}

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Sintetiza uma composição cinematográfica completa (HTML5/SVG + GSAP 3 Seekable Timeline)
 * em tela cheia (Full-Canvas), eliminando 100% de slides estáticos ou cards de texto.
 * Baseado estritamente em Direção de Arte de Retenção Extrema (Alex Hormozi / Vox / MagnatesMedia).
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
  } = input;

  const p = scene.componentProps || {};
  const promptLower = `${resolvedTemplate} ${visualPrompt}`.toLowerCase();

  // Extrai apenas 2 a 3 palavras de alto impacto para a tipografia de choque (nunca parágrafos)
  const rawWords = (headline || tag || 'ALERTA MÁXIMO')
    .replace(/[^\w\sÀ-ÿ]/gi, '')
    .split(/\s+/)
    .filter(Boolean);
  const impactWords = rawWords.slice(0, Math.min(3, Math.max(1, rawWords.length)));

  const kineticWordsHtml = impactWords
    .map((w, wi) => {
      const isHl = wi === impactWords.length - 1 || impactWords.length === 1;
      return `<span id="ai-kw-${idx}-${wi}" style="display:inline-block;padding:12px 28px;margin:6px;border-radius:22px;font-weight:900;font-size:74px;text-transform:uppercase;letter-spacing:-1.5px;line-height:1;${
        isHl
          ? `background:${highlightColor};color:#04060d;box-shadow:0 0 50px ${highlightColor}99;`
          : `color:${primaryTextColor};text-shadow:0 10px 30px rgba(0,0,0,0.95);`
      }">${escapeHtml(w)}</span>`;
    })
    .join('');

  const kineticWordsGsap = impactWords
    .map(
      (_, wi) => `
      masterTl.fromTo("#ai-kw-${idx}-${wi}",
        { y: 80, rotationX: -65, scale: 0.35, autoAlpha: 0 },
        { y: 0, rotationX: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2.4)" },
        START_SEC + ${(0.12 + wi * 0.08).toFixed(2)}
      );
      masterTl.to("#ai-kw-${idx}-${wi}",
        { y: ${wi % 2 === 0 ? -10 : 10}, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 },
        START_SEC + ${(0.65 + wi * 0.05).toFixed(2)}
      );`
    )
    .join('\n');

  // =========================================================================
  // 1. Contador / Velocímetro Neon em SVG (stat_counter)
  // =========================================================================
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
    const statLabel = p.label || scene.statLabel || 'TAXA DE IMPACTO VERIFICADA';
    const dashOffsetTarget = Math.round(754 * (1 - Math.min(98, Math.max(15, rawNum)) / 100));

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;perspective:1200px;">
        <!-- Órbitas Holográficas Tridimensionais Giratórias -->
        <svg id="ai-orbit-${idx}" viewBox="0 0 600 600" style="position:absolute;width:720px;height:720px;opacity:0.32;pointer-events:none;">
          <circle cx="300" cy="300" r="280" stroke="${highlightColor}" stroke-width="2" stroke-dasharray="14 20" fill="none" />
          <circle cx="300" cy="300" r="230" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="30 18" fill="none" />
          <line x1="300" y1="0" x2="300" y2="600" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
          <line x1="0" y1="300" x2="600" y2="300" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        </svg>

        <!-- Selo de Topo da Métrica -->
        <div id="ai-stat-badge-${idx}" style="display:inline-flex;align-items:center;gap:12px;padding:12px 30px;border-radius:999px;background:rgba(10,14,28,0.85);border:2px solid ${highlightColor};box-shadow:0 0 35px ${highlightColor}66;z-index:3;">
          <span style="width:12px;height:12px;border-radius:50%;background:${highlightColor};box-shadow:0 0 12px ${highlightColor};"></span>
          <span style="font-size:20px;font-weight:900;letter-spacing:3px;color:${highlightColor};text-transform:uppercase;">DADO OFICIAL</span>
        </div>

        <!-- Velocímetro / Gauge Neon Central Gigante -->
        <div id="ai-gauge-card-${idx}" style="position:relative;width:400px;height:400px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:radial-gradient(circle, rgba(15,23,42,0.92) 0%, rgba(4,6,13,0.96) 100%);box-shadow:0 0 90px ${highlightColor}44, inset 0 0 50px rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.15);z-index:3;">
          <svg viewBox="0 0 280 280" style="width:360px;height:360px;transform:rotate(-90deg);">
            <circle cx="140" cy="140" r="120" stroke="rgba(255,255,255,0.08)" stroke-width="18" fill="none" />
            <circle id="ai-ring-prog-${idx}" cx="140" cy="140" r="120" stroke="${highlightColor}" stroke-width="20" fill="none"
              stroke-dasharray="754" stroke-dashoffset="754" stroke-linecap="round"
              style="filter:drop-shadow(0 0 18px ${highlightColor});" />
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span id="stat-num-${idx}" data-target="${rawNum}" data-suffix="${escapeHtml(suffix)}" style="font-size:104px;font-weight:900;color:${highlightColor};letter-spacing:-3px;text-shadow:0 0 40px ${highlightColor}88;">0${escapeHtml(suffix)}</span>
            <span style="font-size:16px;font-weight:800;letter-spacing:4px;color:#94a3b8;text-transform:uppercase;">COMPROVADO</span>
          </div>
        </div>

        <!-- Rótulo Inferior Flutuante -->
        <div id="ai-stat-pill-${idx}" style="padding:18px 38px;border-radius:24px;background:rgba(15,23,42,0.92);border:2px solid ${highlightColor}66;backdrop-filter:blur(16px);box-shadow:0 20px 50px rgba(0,0,0,0.8);z-index:3;max-width:840px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#f8fafc;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(statLabel)}</div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-orbit-${idx}", { scale: 0.3, rotation: -90, autoAlpha: 0 }, { scale: 1.15, rotation: 120, autoAlpha: 0.35, duration: ${d}, ease: "none" }, START_SEC);
      masterTl.fromTo("#ai-stat-badge-${idx}", { y: -40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, START_SEC + 0.1);
      masterTl.fromTo("#ai-gauge-card-${idx}", { scale: 0.25, rotationY: 75, autoAlpha: 0 }, { scale: 1, rotationY: 0, autoAlpha: 1, duration: 0.65, ease: "back.out(1.8)" }, START_SEC + 0.18);
      masterTl.to("#ai-ring-prog-${idx}", { strokeDashoffset: ${dashOffsetTarget}, duration: 1.5, ease: "power3.out" }, START_SEC + 0.35);
      masterTl.to("#ai-gauge-card-${idx}", { scale: 1.05, y: -12, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.85);
      masterTl.fromTo("#ai-stat-pill-${idx}", { y: 50, scale: 0.85, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(1.8)" }, START_SEC + 0.45);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 2. Gráfico de Barras Animado em 3D (grafico_barras)
  // =========================================================================
  if (
    resolvedTemplate.includes('grafico') ||
    resolvedTemplate.includes('bar') ||
    promptLower.includes('gráfico') ||
    promptLower.includes('barras')
  ) {
    const bars = [
      { label: 'Método Lento', value: 24, displayValue: '24%' },
      { label: 'Comum', value: 52, displayValue: '52%' },
      { label: 'Com IA & Motion', value: 98, displayValue: '98%' },
    ];

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;perspective:1200px;">
        <div id="ai-chart-badge-${idx}" style="display:inline-flex;align-items:center;gap:12px;padding:12px 30px;border-radius:999px;background:rgba(10,14,28,0.85);border:2px solid ${highlightColor};box-shadow:0 0 35px ${highlightColor}66;z-index:3;">
          <span style="font-size:22px;">📊</span>
          <span style="font-size:20px;font-weight:900;letter-spacing:3px;color:${highlightColor};text-transform:uppercase;">ANÁLISE COMPARATIVA</span>
        </div>

        <!-- Palco do Gráfico de Barras 3D -->
        <div id="ai-chart-box-${idx}" style="width:100%;max-width:920px;height:520px;border-radius:36px;background:rgba(10,15,30,0.88);border:2px solid rgba(255,255,255,0.14);padding:40px 36px 30px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 35px 90px rgba(0,0,0,0.85);position:relative;overflow:hidden;">
          <!-- Linha de Tendência Crescente com SVG -->
          <svg viewBox="0 0 800 320" style="position:absolute;top:60px;left:40px;right:40px;width:calc(100% - 80px);height:280px;pointer-events:none;z-index:1;">
            <path id="ai-trend-line-${idx}" d="M 60 260 Q 380 180 720 30" fill="none" stroke="${highlightColor}" stroke-width="6" stroke-dasharray="900" stroke-dashoffset="900" stroke-linecap="round" style="filter:drop-shadow(0 0 16px ${highlightColor});" />
          </svg>

          <div style="display:flex;align-items:flex-end;justify-content:space-around;gap:24px;height:400px;z-index:2;padding-top:20px;">
            ${bars
              .map((b, bi) => {
                const isWinner = bi === bars.length - 1;
                return `
                  <div style="flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:14px;">
                    <div id="ai-bval-${idx}-${bi}" style="font-size:46px;font-weight:900;color:${isWinner ? highlightColor : '#e2e8f0'};text-shadow:0 0 25px ${isWinner ? highlightColor : 'transparent'};">${escapeHtml(b.displayValue)}</div>
                    <div style="width:100%;max-width:160px;height:280px;background:rgba(255,255,255,0.05);border-radius:24px;padding:8px;display:flex;align-items:flex-end;border:1px solid rgba(255,255,255,0.1);">
                      <div id="ai-bfill-${idx}-${bi}" style="width:100%;height:0%;border-radius:18px;background:${
                        isWinner
                          ? `linear-gradient(180deg, ${highlightColor} 0%, #f59e0b 100%)`
                          : 'linear-gradient(180deg, #475569 0%, #1e293b 100%)'
                      };box-shadow:${isWinner ? `0 0 45px ${highlightColor}99` : 'none'};"></div>
                    </div>
                    <div style="font-size:24px;font-weight:800;color:${isWinner ? '#ffffff' : '#94a3b8'};text-transform:uppercase;letter-spacing:1px;text-align:center;">${escapeHtml(b.label)}</div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-chart-badge-${idx}", { y: -40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, START_SEC + 0.08);
      masterTl.fromTo("#ai-chart-box-${idx}", { y: 90, rotationX: 25, autoAlpha: 0 }, { scale: 1, y: 0, rotationX: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, START_SEC + 0.15);
      masterTl.fromTo("#ai-bfill-${idx}-0", { height: "0%" }, { height: "24%", duration: 0.8, ease: "elastic.out(1, 0.75)" }, START_SEC + 0.3);
      masterTl.fromTo("#ai-bfill-${idx}-1", { height: "0%" }, { height: "52%", duration: 0.85, ease: "elastic.out(1, 0.75)" }, START_SEC + 0.45);
      masterTl.fromTo("#ai-bfill-${idx}-2", { height: "0%" }, { height: "98%", duration: 1.1, ease: "elastic.out(1.2, 0.6)" }, START_SEC + 0.6);
      masterTl.to("#ai-trend-line-${idx}", { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" }, START_SEC + 0.65);
      masterTl.to("#ai-chart-box-${idx}", { y: -12, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.9);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 3. Versus Comparativo de Choque (versus_comparison)
  // =========================================================================
  if (
    resolvedTemplate.includes('versus') ||
    promptLower.includes('versus') ||
    promptLower.includes('comparativo') ||
    promptLower.includes('lado a lado')
  ) {
    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;perspective:1200px;">
        <!-- Painel Vermelho: O Erro Tradicional -->
        <div id="ai-vs-left-${idx}" style="width:100%;max-width:900px;padding:36px 42px;border-radius:32px;background:linear-gradient(135deg, rgba(127,29,29,0.45) 0%, rgba(15,23,42,0.94) 100%);border:3px solid rgba(239,68,68,0.6);box-shadow:0 30px 70px rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-between;gap:24px;">
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:72px;height:72px;border-radius:20px;background:rgba(239,68,68,0.25);border:2px solid #ef4444;display:flex;align-items:center;justify-content:center;font-size:36px;color:#ef4444;font-weight:900;flex-shrink:0;">✕</div>
            <div>
              <div style="font-size:34px;font-weight:900;color:#f87171;letter-spacing:1px;text-transform:uppercase;">MÉTODO ANTIGO</div>
              <div style="font-size:24px;font-weight:700;color:#cbd5e1;margin-top:4px;">Demorado, manual e sem retenção</div>
            </div>
          </div>
          <div style="font-size:26px;font-weight:900;color:#ef4444;background:rgba(239,68,68,0.15);padding:8px 18px;border-radius:12px;border:1px solid #ef4444;">FRACASSO</div>
        </div>

        <!-- Emblema Central VS Explosivo -->
        <div id="ai-vs-badge-${idx}" style="width:110px;height:110px;border-radius:50%;background:${highlightColor};color:#04060d;font-size:44px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 0 60px ${highlightColor}, inset 0 0 20px rgba(255,255,255,0.4);z-index:5;">
          VS
        </div>

        <!-- Painel Neon: A Solução Superior -->
        <div id="ai-vs-right-${idx}" style="width:100%;max-width:900px;padding:36px 42px;border-radius:32px;background:linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(15,23,42,0.96) 100%);border:3px solid ${highlightColor};box-shadow:0 0 60px ${highlightColor}44, 0 30px 70px rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:space-between;gap:24px;">
          <div style="display:flex;align-items:center;gap:20px;">
            <div style="width:72px;height:72px;border-radius:20px;background:${highlightColor};color:#04060d;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;flex-shrink:0;box-shadow:0 0 35px ${highlightColor};">✓</div>
            <div>
              <div style="font-size:34px;font-weight:900;color:${highlightColor};letter-spacing:1px;text-transform:uppercase;">COM NOSSA IA</div>
              <div style="font-size:24px;font-weight:700;color:#ffffff;margin-top:4px;">100% automático e 4x mais visual</div>
            </div>
          </div>
          <div style="font-size:26px;font-weight:900;color:#04060d;background:${highlightColor};padding:8px 18px;border-radius:12px;">SUCESSO</div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-vs-left-${idx}", { x: -280, rotationY: -30, autoAlpha: 0 }, { x: 0, rotationY: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.6)" }, START_SEC + 0.15);
      masterTl.fromTo("#ai-vs-badge-${idx}", { scale: 0, rotation: -180, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.55, ease: "elastic.out(1.2, 0.5)" }, START_SEC + 0.35);
      masterTl.fromTo("#ai-vs-right-${idx}", { x: 280, rotationY: 30, autoAlpha: 0 }, { x: 0, rotationY: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.6)" }, START_SEC + 0.45);
      masterTl.to("#ai-vs-badge-${idx}", { scale: 1.18, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 3 }, START_SEC + 0.85);
      masterTl.to("#ai-vs-right-${idx}", { y: -10, scale: 1.02, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.9);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 4. Arquivo Confidencial / Dossiê Secreto (segredo_revelado)
  // =========================================================================
  if (
    resolvedTemplate.includes('segredo') ||
    promptLower.includes('confidencial') ||
    promptLower.includes('tarja') ||
    promptLower.includes('dossiê')
  ) {
    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px;perspective:1200px;">
        <div id="ai-dossier-box-${idx}" style="width:100%;max-width:900px;padding:56px 48px;border-radius:40px;background:rgba(10,14,26,0.94);border:3px dashed ${highlightColor}aa;box-shadow:0 40px 100px rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;gap:30px;position:relative;overflow:hidden;">
          <!-- Carimbo de Impacto Vermelho -->
          <div id="ai-stamp-${idx}" style="padding:14px 40px;border:6px solid #ef4444;color:#ef4444;font-size:36px;font-weight:900;letter-spacing:8px;border-radius:14px;transform:rotate(-7deg);box-shadow:0 0 45px rgba(239,68,68,0.5);">
            DOCUMENTO CONFIDENCIAL
          </div>

          <!-- Revelação com Tarja de Censura Deslizante -->
          <div style="position:relative;overflow:hidden;padding:26px 40px;border-radius:24px;background:rgba(255,255,255,0.06);width:100%;text-align:center;">
            <div style="font-size:62px;font-weight:900;color:${highlightColor};text-transform:uppercase;letter-spacing:-1px;">
              SEGREDO DESCOBERTO
            </div>
            <!-- Tarja de Censura Listrada que Desliza -->
            <div id="ai-redact-bar-${idx}" style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,#090d16,#090d16 20px,#1e293b 20px,#1e293b 40px);border:3px solid ${highlightColor};display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;letter-spacing:6px;color:#facc15;">
              ████ RESTRITO ████
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:12px;color:#94a3b8;font-size:22px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
            <span>🔓 ACESSO AUTORIZADO</span>
          </div>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-dossier-box-${idx}", { scale: 0.7, rotationX: 25, autoAlpha: 0 }, { scale: 1, rotationX: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.6)" }, START_SEC + 0.12);
      masterTl.fromTo("#ai-stamp-${idx}", { scale: 3.2, rotation: -30, autoAlpha: 0 }, { scale: 1, rotation: -7, autoAlpha: 1, duration: 0.38, ease: "power4.in" }, START_SEC + 0.32);
      masterTl.to("#ai-redact-bar-${idx}", { xPercent: 110, duration: 0.85, ease: "power3.inOut" }, START_SEC + 0.85);
      masterTl.to("#ai-dossier-box-${idx}", { y: -12, duration: ${(d * 0.4).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 1.1);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 5. Chamada para Ação com Botão 3D e Cursor (cta_pulse)
  // =========================================================================
  if (
    resolvedTemplate.includes('cta') ||
    promptLower.includes('botão') ||
    promptLower.includes('cursor') ||
    promptLower.includes('clique')
  ) {
    const btnText = p.buttonText || scene.ctaText || 'QUERO COMEÇAR AGORA';

    const html = `
      <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:38px;perspective:1200px;">
        <!-- Onda Expansiva de Choque -->
        <div id="ai-cta-wave-${idx}" style="position:absolute;width:440px;height:440px;border-radius:50%;border:4px solid ${highlightColor};opacity:0;pointer-events:none;"></div>

        <!-- Título Curto de Conversão -->
        <div id="ai-cta-head-${idx}" style="font-size:62px;font-weight:900;color:#ffffff;text-transform:uppercase;text-align:center;letter-spacing:-1px;text-shadow:0 8px 30px rgba(0,0,0,0.9);z-index:3;">
          DESTRAVE SEU ACESSO
        </div>

        <!-- Botão 3D Vibrante com Sombra Neon Gigante -->
        <div style="position:relative;z-index:4;margin-top:10px;">
          <div id="ai-cta-btn-${idx}" style="padding:38px 72px;border-radius:999px;background:linear-gradient(135deg, ${highlightColor} 0%, #f59e0b 100%);color:#04060d;font-size:42px;font-weight:900;letter-spacing:2px;text-transform:uppercase;box-shadow:0 0 80px ${highlightColor}aa, 0 25px 50px rgba(0,0,0,0.85);display:inline-flex;align-items:center;gap:18px;">
            <span>🔥 ${escapeHtml(btnText)}</span>
          </div>
          <!-- Cursor Animado que Clica no Botão -->
          <svg id="ai-cta-cursor-${idx}" viewBox="0 0 48 48" width="90" height="90" style="position:absolute;right:-25px;bottom:-50px;filter:drop-shadow(0 16px 30px rgba(0,0,0,0.95));">
            <path d="M10 6 L38 22 L24 26 L31 40 L24 43 L17 29 L10 35 Z" fill="#ffffff" stroke="#04060d" stroke-width="3"/>
          </svg>
        </div>
      </div>
    `;

    const gsap = `
      masterTl.fromTo("#ai-cta-head-${idx}", { y: -50, scale: 0.7, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2)" }, START_SEC + 0.15);
      masterTl.fromTo("#ai-cta-btn-${idx}", { scale: 0.4, y: 70, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(2.2)" }, START_SEC + 0.35);
      masterTl.fromTo("#ai-cta-cursor-${idx}", { x: 280, y: 280, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.65, ease: "power3.out" }, START_SEC + 0.55);
      masterTl.to("#ai-cta-btn-${idx}", { scale: 0.9, duration: 0.12, ease: "power2.in" }, START_SEC + 1.25);
      masterTl.to("#ai-cta-btn-${idx}", { scale: 1.1, duration: 0.35, ease: "elastic.out(1.3, 0.4)" }, START_SEC + 1.37);
      masterTl.fromTo("#ai-cta-wave-${idx}", { scale: 0.4, opacity: 0.95 }, { scale: 2.4, opacity: 0, duration: 1.2, ease: "power2.out" }, START_SEC + 1.37);
    `;
    return { html, gsap };
  }

  // =========================================================================
  // 6. Arquitetura Padrão: Tipografia Cinética 3D + Retícula Holográfica (Hormozi Viral Bold)
  // =========================================================================
  const html = `
    <div id="ai-scene-content-${idx}" style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:36px;perspective:1200px;">
      <!-- Retícula Holográfica Tecnológica em Rotação 3D -->
      <svg id="ai-hud-reticle-${idx}" viewBox="0 0 500 500" style="position:absolute;width:680px;height:680px;opacity:0.25;pointer-events:none;">
        <polygon points="250,20 470,140 470,360 250,480 30,360 30,140" fill="none" stroke="${highlightColor}" stroke-width="2.5" stroke-dasharray="20 12" />
        <circle cx="250" cy="250" r="190" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="10 16" />
        <line x1="250" y1="40" x2="250" y2="460" stroke="${highlightColor}" stroke-width="1" stroke-dasharray="6 6" />
        <line x1="40" y1="250" x2="460" y2="250" stroke="${highlightColor}" stroke-width="1" stroke-dasharray="6 6" />
      </svg>

      <!-- Badge Neon Superior de Alerta -->
      <div id="ai-top-pill-${idx}" style="display:inline-flex;align-items:center;gap:14px;padding:14px 34px;border-radius:999px;background:rgba(15,23,42,0.92);border:2px solid ${highlightColor};box-shadow:0 0 40px ${highlightColor}66;z-index:3;">
        <span style="width:14px;height:14px;border-radius:50%;background:${highlightColor};box-shadow:0 0 16px ${highlightColor};"></span>
        <span style="font-size:24px;font-weight:900;letter-spacing:3px;color:${highlightColor};text-transform:uppercase;">${escapeHtml(tag || 'ATENÇÃO CRÍTICA')}</span>
      </div>

      <!-- Impacto Tipográfico 3D de 1 a 3 Palavras (Zero Parágrafos) -->
      <div id="ai-impact-wrap-${idx}" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;max-width:920px;z-index:3;">
        ${kineticWordsHtml}
      </div>

      <!-- Laser Scanner Holográfico Horizontal -->
      <div id="ai-laser-bar-${idx}" style="width:380px;height:4px;border-radius:99px;background:${highlightColor};box-shadow:0 0 35px ${highlightColor}, 0 0 10px #ffffff;z-index:3;"></div>
    </div>
  `;

  const gsap = `
    masterTl.fromTo("#ai-hud-reticle-${idx}", { scale: 0.4, rotation: 0, autoAlpha: 0 }, { scale: 1.25, rotation: 140, autoAlpha: 0.3, duration: ${d}, ease: "none" }, START_SEC);
    masterTl.fromTo("#ai-top-pill-${idx}", { y: -60, scale: 0.6, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: "back.out(2.2)" }, START_SEC + 0.08);
    ${kineticWordsGsap}
    masterTl.fromTo("#ai-laser-bar-${idx}", { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, START_SEC + 0.35);
    masterTl.to("#ai-impact-wrap-${idx}", { scale: 1.06, duration: ${(d * 0.45).toFixed(2)}, ease: "sine.inOut", yoyo: true, repeat: 1 }, START_SEC + 0.8);
  `;

  return { html, gsap };
}
