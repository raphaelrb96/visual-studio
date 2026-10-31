import { MOTION_TEMPLATES, MotionTemplateId } from './motion-templates';

export interface WordTimestampItem {
  word: string;
  startSec: number;
  endSec: number;
}

export interface CompiledSceneData {
  id: string;
  sceneIndex: number;
  templateId: MotionTemplateId;
  durationSec: number;
  text: string;
  tag?: string;
  headline?: string;
  subText?: string;
  highlightWord?: string;
  highlightColor?: string;
  sfx?: string;
  cameraMotion?: string;
  visualPrompt?: string;
  searchKeywords?: string;
  motionPrompt?: string;
  brollUrl?: string;
  collageImages?: string[];
  audioUrl?: string;
  wordTimestamps?: WordTimestampItem[];
  statValue?: string;
  statLabel?: string;
  barsData?: Array<{ label: string; value: number; displayValue?: string }>;
  versusData?: {
    leftTitle: string;
    leftItems: string[];
    rightTitle: string;
    rightItems: string[];
  };
  stepsData?: string[];
  authorName?: string;
  authorHandle?: string;
  ctaText?: string;
  compiledCustomHtml?: string;
  compiledGsapScript?: string;
}

export interface MasterCompositionConfig {
  projectId: string;
  title: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  aestheticId?: string;
  fullNarration?: string;
  fullAudioUrl?: string;
  scenes: CompiledSceneData[];
}

/**
 * Calcula timestamps palavra por palavra para a narração da cena
 */
export function computeWordTimestamps(text: string, durationSec: number): WordTimestampItem[] {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  // Reserva 0.15s no início e 0.25s no final para respiração natural
  const usableDuration = Math.max(1.0, durationSec - 0.4);
  const totalChars = words.reduce((acc, w) => acc + Math.max(2, w.length), 0);

  let cursor = 0.15;
  return words.map((word) => {
    const weight = Math.max(2, word.length) / totalChars;
    const wordDur = usableDuration * weight;
    const item: WordTimestampItem = {
      word,
      startSec: Number(cursor.toFixed(3)),
      endSec: Number((cursor + wordDur).toFixed(3)),
    };
    cursor += wordDur;
    return item;
  });
}

/**
 * Gera o Centerpiece HTML/SVG específico para cada um dos 20 Modelos de Motion
 */
function renderSceneCenterpieceHtml(sc: CompiledSceneData, idx: number, highlightColor: string): string {
  // Se a IA gerou HTML customizado para essa cena baseado no prompt detalhado, prioriza a renderização direta em tela cheia (sem card estático padronizado)
  if (sc.compiledCustomHtml && sc.compiledCustomHtml.trim().length > 10) {
    return `
      <div class="ai-full-stage" id="cp-${idx}">
        ${sc.compiledCustomHtml}
      </div>
    `;
  }

  const tpl = sc.templateId || 'hormozi_bold';
  const headline = escapeHtml(sc.headline || sc.text.slice(0, 48).toUpperCase());
  const subText = escapeHtml(sc.subText || '');
  const tag = escapeHtml(sc.tag || 'DESTAQUE');
  const imgs = sc.collageImages && sc.collageImages.length > 0 ? sc.collageImages : [sc.brollUrl || ''];

  switch (tpl) {
    case 'stat_counter': {
      const rawNum = parseInt(String(sc.statValue || '92').replace(/\D/g, ''), 10) || 92;
      const suffix = String(sc.statValue || '92%').replace(/[0-9]/g, '') || '%';
      return `
        <div class="centerpiece stat-card" id="cp-${idx}">
          <div class="stat-ring-wrap">
            <svg class="stat-svg" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r="110" stroke="rgba(255,255,255,0.08)" stroke-width="16" fill="none" />
              <circle id="stat-circle-${idx}" cx="130" cy="130" r="110" stroke="${highlightColor}" stroke-width="16" fill="none"
                stroke-dasharray="691" stroke-dashoffset="691" stroke-linecap="round" transform="rotate(-90 130 130)" />
            </svg>
            <div class="stat-number-box">
              <span id="stat-num-${idx}" data-target="${rawNum}" data-suffix="${escapeHtml(suffix)}" style="color:${highlightColor}">0${escapeHtml(suffix)}</span>
            </div>
          </div>
          <div class="stat-label-box" id="stat-lbl-${idx}">
            <div class="stat-headline">${escapeHtml(sc.statLabel || headline)}</div>
            <div class="stat-sub">${subText}</div>
          </div>
        </div>
      `;
    }

    case 'grafico_barras': {
      const bars = sc.barsData && sc.barsData.length > 0
        ? sc.barsData
        : [
            { label: 'Tradicional', value: 32, displayValue: '32%' },
            { label: 'Média', value: 58, displayValue: '58%' },
            { label: 'Novo Modelo', value: 95, displayValue: '95%' },
          ];
      return `
        <div class="centerpiece chart-card" id="cp-${idx}">
          <div class="chart-title">${headline}</div>
          <div class="bars-stage">
            ${bars
              .map(
                (b, bi) => `
              <div class="bar-col">
                <div class="bar-val" id="bar-val-${idx}-${bi}" style="color:${bi === bars.length - 1 ? highlightColor : '#e2e8f0'}">${escapeHtml(b.displayValue || b.value + '%')}</div>
                <div class="bar-track">
                  <div class="bar-fill" id="bar-fill-${idx}-${bi}" data-height="${Math.min(100, Math.max(15, b.value))}"
                    style="background:${bi === bars.length - 1 ? `linear-gradient(180deg, ${highlightColor}, #3b82f6)` : 'linear-gradient(180deg, #475569, #1e293b)'}; box-shadow:${bi === bars.length - 1 ? `0 0 30px ${highlightColor}66` : 'none'}"></div>
                </div>
                <div class="bar-label">${escapeHtml(b.label)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    case 'versus_comparison': {
      const v = sc.versusData || {
        leftTitle: 'MÉTODO ANTIGO',
        leftItems: ['Lento e manual', 'Baixa retenção', 'Alto custo'],
        rightTitle: 'NOVO MÉTODO',
        rightItems: ['Escala imediata', 'Retenção máxima', 'Alta conversão'],
      };
      return `
        <div class="centerpiece versus-stage" id="cp-${idx}">
          <div class="vs-panel vs-left" id="vs-left-${idx}">
            <div class="vs-header bad">✕ ${escapeHtml(v.leftTitle)}</div>
            ${(v.leftItems || []).map((item) => `<div class="vs-item bad-item"><span>✕</span> ${escapeHtml(item)}</div>`).join('')}
          </div>
          <div class="vs-badge" id="vs-badge-${idx}">VS</div>
          <div class="vs-panel vs-right" id="vs-right-${idx}" style="border-color:${highlightColor}">
            <div class="vs-header good" style="color:${highlightColor}">✓ ${escapeHtml(v.rightTitle)}</div>
            ${(v.rightItems || []).map((item) => `<div class="vs-item good-item"><span style="color:${highlightColor}">✓</span> ${escapeHtml(item)}</div>`).join('')}
          </div>
        </div>
      `;
    }

    case 'news_headline': {
      return `
        <div class="centerpiece news-clipping" id="cp-${idx}">
          <div class="news-masthead">
            <span class="news-live-dot"></span>
            <span class="news-paper-name">INVESTIGATIVE REPORT • EDIÇÃO ESPECIAL</span>
            <span class="news-date">${new Date().toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="news-body">
            <div class="news-hl-wrap">
              <div class="news-highlighter" id="hl-bar-${idx}" style="background:${highlightColor}55"></div>
              <h2 class="news-title">${headline}</h2>
            </div>
            <p class="news-excerpt">${escapeHtml(sc.text)}</p>
          </div>
          <div class="news-Photo-strip">
            <img src="${escapeHtml(imgs[0] || '')}" alt="" onerror="this.style.display='none'" />
          </div>
        </div>
      `;
    }

    case 'tweet_card': {
      return `
        <div class="centerpiece tweet-box" id="cp-${idx}">
          <div class="tweet-header">
            <div class="tweet-avatar" style="background:linear-gradient(135deg, ${highlightColor}, #6366f1)">
              ${escapeHtml((sc.authorName || 'E')[0])}
            </div>
            <div class="tweet-user">
              <div class="tweet-name">${escapeHtml(sc.authorName || 'Análise de Mercado')} <span class="verified">✓</span></div>
              <div class="tweet-handle">${escapeHtml(sc.authorHandle || '@insider_report')}</div>
            </div>
          </div>
          <div class="tweet-content">${escapeHtml(sc.text)}</div>
          <div class="tweet-metrics" id="tweet-metrics-${idx}">
            <span>💬 1.4K</span>
            <span>🔁 8.9K</span>
            <span style="color:#f43f5e">❤️ 42.8K</span>
            <span>📊 1.2M</span>
          </div>
        </div>
      `;
    }

    case 'chat_simulation': {
      return `
        <div class="centerpiece chat-stage" id="cp-${idx}">
          <div class="chat-bubble incoming" id="chat-1-${idx}">
            <div class="chat-sender">Cliente / Equipe</div>
            <div class="chat-msg">Você viu o que acabou de mudar sobre ${headline.toLowerCase()}?</div>
          </div>
          <div class="chat-bubble outgoing" id="chat-2-${idx}" style="background:linear-gradient(135deg, #4f46e5, #2563eb)">
            <div class="chat-msg">${escapeHtml(sc.text)}</div>
          </div>
          <div class="chat-bubble incoming highlight-chat" id="chat-3-${idx}" style="border-color:${highlightColor}">
            <div class="chat-msg" style="color:${highlightColor}; font-weight:800">⚡ ${tag}: Resultado comprovado na prática!</div>
          </div>
        </div>
      `;
    }

    case 'segredo_revelado': {
      return `
        <div class="centerpiece dossier-card" id="cp-${idx}">
          <div class="dossier-stamp" id="stamp-${idx}">CONFIDENCIAL</div>
          <div class="dossier-label">ARQUIVO DESCLASSIFICADO #0${idx + 1}</div>
          <div class="redact-wrap">
            <div class="secret-text">${headline}</div>
            <div class="redact-bar" id="redact-${idx}"></div>
          </div>
          <div class="dossier-sub">${subText || 'Acesso restrito liberado'}</div>
        </div>
      `;
    }

    case 'lista_passos':
    case 'timeline_progress':
    case 'ranking_top3': {
      const steps = sc.stepsData && sc.stepsData.length > 0
        ? sc.stepsData
        : [headline, subText || 'Execução estruturada em alta velocidade', 'Escala com retenção máxima'];
      return `
        <div class="centerpiece steps-card" id="cp-${idx}">
          <div class="steps-header" style="color:${highlightColor}">${headline}</div>
          <div class="steps-list">
            ${steps
              .slice(0, 3)
              .map(
                (st, si) => `
              <div class="step-row" id="step-${idx}-${si}">
                <div class="step-badge" style="background:${highlightColor}; color:#05070f">${ tpl === 'ranking_top3' ? `#${si + 1}` : '✓' }</div>
                <div class="step-text">${escapeHtml(st)}</div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    case 'split_collage': {
      return `
        <div class="centerpiece collage-stage" id="cp-${idx}">
          <div class="collage-frame frame-1" id="col-1-${idx}">
            <img src="${escapeHtml(imgs[0] || '')}" alt="" onerror="this.style.opacity='0'" />
          </div>
          <div class="collage-frame frame-2" id="col-2-${idx}">
            <img src="${escapeHtml(imgs[1] || imgs[0] || '')}" alt="" onerror="this.style.opacity='0'" />
          </div>
          <div class="collage-caption-card" id="col-cap-${idx}" style="border-color:${highlightColor}">
            <div class="col-hl" style="color:${highlightColor}">${tag}</div>
            <div class="col-title">${headline}</div>
          </div>
        </div>
      `;
    }

    case 'cta_pulse': {
      return `
        <div class="centerpiece cta-stage" id="cp-${idx}">
          <div class="cta-glow-orb" style="background:${highlightColor}"></div>
          <div class="cta-headline">${headline}</div>
          <div class="cta-button-3d" id="cta-btn-${idx}" style="background:${highlightColor}; color:#05070f; box-shadow: 0 0 50px ${highlightColor}88">
            <span>🔥 ${escapeHtml(sc.ctaText || 'COMEÇAR AGORA MESMO')}</span>
          </div>
          <svg class="cta-cursor" id="cta-cursor-${idx}" viewBox="0 0 36 36" width="64" height="64">
            <path d="M8 4 L28 16 L18 19 L23 30 L18 32 L13 21 L8 26 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
          </svg>
        </div>
      `;
    }

    default: {
      // Hormozi Bold / Alerta / Pergunta / Quote / Luxury / Spotlight / Card Frase
      return `
        <div class="centerpiece kinetic-card" id="cp-${idx}">
          <div class="kinetic-accent-line" id="k-line-${idx}" style="background:${highlightColor}"></div>
          <div class="kinetic-headline" id="k-hl-${idx}">${headline}</div>
          <div class="kinetic-highlight-pill" id="k-pill-${idx}" style="background:${highlightColor}; color:#05070f">
            ⚡ ${escapeHtml(sc.highlightWord || tag)}
          </div>
          ${sc.compiledCustomHtml ? `<div class="ai-custom-layer">${sc.compiledCustomHtml}</div>` : ''}
        </div>
      `;
    }
  }
}

/**
 * Gera o documento HTML5 completo com GSAP 3 Master Timeline para o Player e para Exportação
 */
export function buildMasterVideoHtml(config: MasterCompositionConfig): string {
  const { aspectRatio = '9:16', scenes = [] } = config;
  const width = aspectRatio === '16:9' ? 1920 : 1080;
  const height = aspectRatio === '16:9' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920;

  let accumulatedTime = 0;
  const sceneTimings = scenes.map((sc, idx) => {
    const startSec = Number(accumulatedTime.toFixed(3));
    const dur = Number((sc.durationSec || 4.5).toFixed(3));
    accumulatedTime += dur;
    const words =
      sc.wordTimestamps && sc.wordTimestamps.length > 0
        ? sc.wordTimestamps
        : computeWordTimestamps(sc.text, dur);
    return {
      ...sc,
      idx,
      startSec,
      durationSec: dur,
      endSec: Number((startSec + dur).toFixed(3)),
      words,
    };
  });

  const totalDuration = Math.max(1, Number(accumulatedTime.toFixed(3)));

  const scenesDom = sceneTimings
    .map((sc) => {
      const tplMeta = MOTION_TEMPLATES.find((t) => t.id === sc.templateId) || MOTION_TEMPLATES[0];
      const highlightColor = sc.highlightColor || tplMeta.defaultHighlightColor || '#facc15';
      const centerpiece = renderSceneCenterpieceHtml(sc, sc.idx, highlightColor);

      // Divide palavras em blocos de 4 a 5 palavras para legendas dinâmicas no estilo Hormozi / Vox
      const chunks: Array<{ start: number; end: number; words: WordTimestampItem[] }> = [];
      const chunkSize = 4;
      for (let i = 0; i < sc.words.length; i += chunkSize) {
        const slice = sc.words.slice(i, i + chunkSize);
        if (slice.length > 0) {
          chunks.push({
            start: slice[0].startSec,
            end: slice[slice.length - 1].endSec,
            words: slice,
          });
        }
      }

      const centerpieceHtml = sc.compiledCustomHtml && sc.compiledCustomHtml.trim().length > 10
        ? `<div class="ai-stage-fullscreen" id="cp-${sc.idx}">${sc.compiledCustomHtml}</div>`
        : `<div class="stage-center"><div class="centerpiece" id="cp-${sc.idx}">${centerpiece}</div></div>`;

      return `
      <section class="scene-clip clip" id="scene-${sc.idx}" data-index="${sc.idx}" data-start="${sc.startSec}" data-duration="${sc.durationSec}" style="${sc.idx === 0 ? 'opacity:1;visibility:inherit;z-index:10;' : ''}">
        <!-- Camada 0: B-Roll Cinematográfico com Movimento Contínuo (Ken Burns Dinâmico) -->
        <div class="broll-container" id="broll-${sc.idx}">
          <img class="broll-img" id="broll-img-${sc.idx}" src="${escapeHtml(sc.brollUrl || '')}" alt="" crossorigin="anonymous" onerror="this.style.opacity='0'" />
          <div class="broll-vignette"></div>
          <div class="broll-grid-overlay"></div>
          <!-- Partículas e Luzes Flutuantes de Fundo -->
          <div class="ambient-glow" id="glow-${sc.idx}" style="background: radial-gradient(circle, ${highlightColor}28 0%, transparent 70%);"></div>
        </div>

        ${
          sc.audioUrl
            ? `<audio src="${escapeHtml(sc.audioUrl)}" data-start="${sc.startSec}" data-duration="${sc.durationSec}" data-volume="1" preload="auto"></audio>`
            : ''
        }

        <!-- Camada 1: Header HUD Documentário -->
        <div class="hud-top" id="hud-${sc.idx}">
          <div class="hud-badge" style="border-color:${highlightColor}; color:${highlightColor}">
            <span class="hud-dot" style="background:${highlightColor}"></span>
            <span>${escapeHtml((sc.tag || tplMeta.badge).toUpperCase())}</span>
          </div>
          <div class="hud-counter">CENA 0${sc.idx + 1} // ${sc.durationSec.toFixed(1)}S</div>
        </div>

        <!-- Camada 2: Palco Visual (IA Custom Canvas ou Centerpiece Dinâmico) -->
        ${centerpieceHtml}

        <!-- Camada 3: Legendas Cinéticas Pop Word-by-Word (Karaoke Hormozi Ultra-Visível) -->
        <div class="captions-zone" id="cap-zone-${sc.idx}">
          ${chunks
            .map(
              (chunk, ci) => `
            <div class="caption-phrase" id="phrase-${sc.idx}-${ci}">
              ${chunk.words
                .map(
                  (w, wi) => `
                <span class="caption-word" id="word-${sc.idx}-${ci}-${wi}"
                  data-hl="${highlightColor}">${escapeHtml(w.word)}</span>
              `
                )
                .join(' ')}
            </div>
          `
            )
            .join('')}
        </div>

        <!-- Barra de Progresso Inferior -->
        <div class="scene-progress-track">
          <div class="scene-progress-bar" id="prog-${sc.idx}" style="background:${highlightColor}"></div>
        </div>
      </section>
      `;
    })
    .join('\n');

  // Constrói o script GSAP determinístico para todas as cenas com animação contínua e legendas integradas
  const gsapSceneScripts = sceneTimings
    .map((sc) => {
      const s = sc.startSec;
      const d = sc.durationSec;
      const idx = sc.idx;
      const hlColor = sc.highlightColor || '#facc15';

      // Divide palavras em blocos de 4 a 5 palavras
      const chunks: Array<{ start: number; end: number; words: Array<WordTimestampItem & { globalIdx: number }> }> = [];
      const chunkSize = 4;
      for (let i = 0; i < sc.words.length; i += chunkSize) {
        const slice = sc.words.slice(i, i + chunkSize).map((w, subI) => ({ ...w, globalIdx: i + subI }));
        if (slice.length > 0) {
          chunks.push({
            start: slice[0].startSec,
            end: slice[slice.length - 1].endSec,
            words: slice,
          });
        }
      }

      // Script para frases e palavras diretamente integradas na masterTl
      let captionsGsap = '';
      chunks.forEach((chunk, ci) => {
        const phStart = s + chunk.start;
        const phEnd = s + chunk.end + 0.15;
        // Mostra a frase ativa
        captionsGsap += `
        masterTl.set("#phrase-${idx}-${ci}", { autoAlpha: 1, display: "flex" }, ${phStart});
        masterTl.set("#phrase-${idx}-${ci}", { autoAlpha: 0, display: "none" }, ${phEnd});
        `;

        chunk.words.forEach((w, wi) => {
          const wStart = s + w.startSec;
          const wEnd = s + w.endSec;
          const wDur = Math.max(0.12, wEnd - wStart);
          // Pop da palavra com highlight estilo Hormozi
          captionsGsap += `
          masterTl.fromTo("#word-${idx}-${ci}-${wi}",
            { scale: 0.95, color: "rgba(255,255,255,0.45)", backgroundColor: "transparent", y: 0 },
            { scale: 1.15, color: "#000000", backgroundColor: "${hlColor}", y: -4, duration: 0.14, ease: "back.out(2)" },
            ${wStart}
          );
          masterTl.to("#word-${idx}-${ci}-${wi}",
            { scale: 1.0, color: "#ffffff", backgroundColor: "transparent", y: 0, duration: 0.12 },
            ${wEnd}
          );
          `;
        });
      });

      return `
      // --- CENA #${idx + 1} (${sc.templateId}) [${s}s -> ${sc.endSec}s] ---
      masterTl.set("#scene-${idx}", { autoAlpha: 1, zIndex: ${10 + idx} }, ${s});

      // 1. Câmera Contínua Ken Burns (Movimento cinematográfico contínuo durante toda a cena)
      masterTl.fromTo("#broll-img-${idx}",
        { scale: 1.0, xPercent: 0, yPercent: 0 },
        { scale: 1.18, xPercent: ${idx % 2 === 0 ? 3 : -3}, yPercent: ${idx % 2 === 0 ? -2 : 2}, duration: ${d}, ease: "none" },
        ${s}
      );
      masterTl.fromTo("#glow-${idx}",
        { scale: 0.8, opacity: 0.2 },
        { scale: 1.3, opacity: 0.6, duration: ${d}, ease: "power1.inOut" },
        ${s}
      );

      // 2. HUD Top Entry
      masterTl.fromTo("#hud-${idx}",
        { y: -60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.7)" },
        ${s + 0.05}
      );

      // 3. Centerpiece Entry com Impacto 3D
      if (!sc.compiledCustomHtml) {
        masterTl.fromTo("#cp-${idx}",
          { scale: 0.82, y: 70, rotationX: 18, autoAlpha: 0 },
          { scale: 1, y: 0, rotationX: 0, autoAlpha: 1, duration: 0.55, ease: "back.out(1.5)" },
          ${s + 0.1}
        );

        // Movimento secundário contínuo no Centerpiece (Flutuação suave para eliminar efeito estático)
        masterTl.to("#cp-${idx}",
          { y: -12, duration: ${d * 0.5}, ease: "sine.inOut", yoyo: true, repeat: 1 },
          ${s + 0.65}
        );
      } else {
        masterTl.set("#cp-${idx}", { autoAlpha: 1, display: "flex" }, ${s});
        masterTl.fromTo("#cp-${idx}",
          { scale: 0.94, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
          ${s}
        );
      }

      // 4. Barra de Progresso
      masterTl.fromTo("#prog-${idx}",
        { width: "0%" },
        { width: "100%", duration: ${d}, ease: "none" },
        ${s}
      );

      // 5. Legendas Word-by-Word sincronizadas na timeline
      ${captionsGsap}

      // Animações Específicas por Arquitetura
      if (document.querySelector("#stat-circle-${idx}")) {
        masterTl.to("#stat-circle-${idx}", { strokeDashoffset: 95, duration: 1.4, ease: "power3.out" }, ${s + 0.25});
      }
      if (document.querySelector("#bar-fill-${idx}-0")) {
        [0, 1, 2].forEach((bi) => {
          const el = document.querySelector("#bar-fill-${idx}-" + bi);
          if (el) {
            const targetH = el.getAttribute("data-height") || "75";
            masterTl.fromTo(el, { height: "0%" }, { height: targetH + "%", duration: 0.9, ease: "elastic.out(1, 0.75)" }, ${s + 0.25} + bi * 0.15);
          }
        });
      }
      if (document.querySelector("#vs-left-${idx}")) {
        masterTl.fromTo("#vs-left-${idx}", { x: -120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, ${s + 0.2});
        masterTl.fromTo("#vs-badge-${idx}", { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2)" }, ${s + 0.35});
        masterTl.fromTo("#vs-right-${idx}", { x: 120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, ${s + 0.45});
      }
      if (document.querySelector("#hl-bar-${idx}")) {
        masterTl.fromTo("#hl-bar-${idx}", { width: "0%" }, { width: "102%", duration: 0.65, ease: "power2.inOut" }, ${s + 0.45});
      }
      if (document.querySelector("#redact-${idx}")) {
        masterTl.fromTo("#stamp-${idx}", { scale: 2.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "power4.in" }, ${s + 0.3});
        masterTl.to("#redact-${idx}", { xPercent: 105, duration: 0.7, ease: "power3.inOut" }, ${s + 1.1});
      }
      if (document.querySelector("#chat-1-${idx}")) {
        masterTl.fromTo("#chat-1-${idx}", { y: 40, scale: 0.85, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(1.6)" }, ${s + 0.2});
        masterTl.fromTo("#chat-2-${idx}", { y: 40, scale: 0.85, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(1.6)" }, ${s + 0.9});
        masterTl.fromTo("#chat-3-${idx}", { y: 40, scale: 0.85, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(1.6)" }, ${s + 1.7});
      }
      if (document.querySelector("#step-${idx}-0")) {
        [0, 1, 2].forEach((si) => {
          const stEl = document.querySelector("#step-${idx}-" + si);
          if (stEl) {
            masterTl.fromTo(stEl, { x: -70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, ${s + 0.25} + si * 0.35);
          }
        });
      }
      if (document.querySelector("#col-1-${idx}")) {
        masterTl.fromTo("#col-1-${idx}", { x: -90, rotation: -12, autoAlpha: 0 }, { x: -30, rotation: -5, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, ${s + 0.15});
        masterTl.fromTo("#col-2-${idx}", { x: 90, rotation: 12, autoAlpha: 0 }, { x: 35, rotation: 6, autoAlpha: 1, duration: 0.6, ease: "power3.out" }, ${s + 0.35});
        masterTl.fromTo("#col-cap-${idx}", { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.7)" }, ${s + 0.55});
      }
      if (document.querySelector("#cta-cursor-${idx}")) {
        masterTl.fromTo("#cta-cursor-${idx}", { x: 220, y: 240, autoAlpha: 0 }, { x: 40, y: 35, autoAlpha: 1, duration: 0.75, ease: "power2.out" }, ${s + 0.5});
        masterTl.to("#cta-btn-${idx}", { scale: 0.93, duration: 0.12 }, ${s + 1.25});
        masterTl.to("#cta-btn-${idx}", { scale: 1.06, duration: 0.25, ease: "elastic.out(1.2, 0.4)" }, ${s + 1.37});
      }

      try {
        ${
          sc.compiledGsapScript
            ? sc.compiledGsapScript.replace(/START_SEC/g, String(s))
            : ''
        }
      } catch (err) {
        console.warn("GSAP custom scene warning:", err);
      }

      ${
        idx < sceneTimings.length - 1
          ? `masterTl.set("#scene-${idx}", { autoAlpha: 0 }, ${sc.endSec});`
          : ''
      }
      `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=${width}, height=${height}, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: #04060d;
      font-family: 'Inter', sans-serif;
      color: #ffffff;
    }
    #root {
      position: relative;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      perspective: 1200px;
      background: #04060d;
    }
    .clip {
      position: absolute;
      inset: 0;
    }
    .scene-clip {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      visibility: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px 64px 110px;
    }
    .broll-container {
      position: absolute;
      inset: 0;
      z-index: 0;
      background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #04060d 75%);
    }
    .broll-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.42;
      filter: contrast(1.12) saturate(1.1);
    }
    .broll-vignette {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(4,6,13,0.88) 0%, rgba(4,6,13,0.45) 45%, rgba(4,6,13,0.94) 100%);
    }
    .broll-grid-overlay {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .hud-top {
      position: relative;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .hud-badge {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      padding: 14px 28px;
      border-radius: 999px;
      background: rgba(10, 14, 28, 0.82);
      border: 2px solid #facc15;
      backdrop-filter: blur(16px);
      font-weight: 900;
      font-size: 24px;
      letter-spacing: 3px;
    }
    .hud-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      box-shadow: 0 0 16px currentColor;
    }
    .hud-counter {
      font-family: 'JetBrains Mono', monospace;
      font-size: 22px;
      color: rgba(255,255,255,0.55);
      letter-spacing: 2px;
    }
    .stage-center {
      position: relative;
      z-index: 5;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 24px 0;
    }
    .ai-stage-fullscreen {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 50px 200px;
      pointer-events: none;
    }
    .ai-full-stage {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .centerpiece {
      width: 100%;
      max-width: 940px;
      border-radius: 40px;
      background: rgba(12, 17, 34, 0.84);
      border: 2px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(24px);
      padding: 56px 48px;
      box-shadow: 0 35px 90px rgba(0, 0, 0, 0.75);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 28px;
    }
    .kinetic-accent-line {
      width: 140px;
      height: 8px;
      border-radius: 99px;
    }
    .kinetic-headline {
      font-size: 62px;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -1.5px;
      text-transform: uppercase;
      text-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    .kinetic-highlight-pill {
      padding: 16px 38px;
      border-radius: 20px;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    /* Stat Counter */
    .stat-ring-wrap { position: relative; width: 260px; height: 260px; display: flex; align-items: center; justify-content: center; }
    .stat-svg { width: 260px; height: 260px; }
    .stat-number-box { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 68px; font-weight: 900; }
    .stat-headline { font-size: 44px; font-weight: 900; line-height: 1.2; text-transform: uppercase; }
    .stat-sub { font-size: 28px; color: #94a3b8; margin-top: 10px; font-weight: 600; }
    /* Bar Chart */
    .chart-title { font-size: 42px; font-weight: 900; text-transform: uppercase; }
    .bars-stage { width: 100%; height: 420px; display: flex; align-items: flex-end; justify-content: space-around; gap: 32px; padding: 20px 10px 0; }
    .bar-col { flex: 1; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 14px; }
    .bar-val { font-size: 34px; font-weight: 900; }
    .bar-track { width: 100%; max-width: 140px; height: 290px; background: rgba(255,255,255,0.05); border-radius: 20px; display: flex; align-items: flex-end; overflow: hidden; padding: 6px; }
    .bar-fill { width: 100%; height: 0%; border-radius: 14px; }
    .bar-label { font-size: 24px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; }
    /* Versus */
    .versus-stage { position: relative; gap: 24px; padding: 42px; }
    .vs-panel { width: 100%; padding: 34px; border-radius: 28px; text-align: left; display: flex; flex-direction: column; gap: 16px; border: 2px solid rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); }
    .vs-right { background: rgba(34,197,94,0.1); }
    .vs-header { font-size: 34px; font-weight: 900; letter-spacing: 1px; }
    .vs-header.bad { color: #f87171; }
    .vs-item { font-size: 28px; font-weight: 700; display: flex; align-items: center; gap: 14px; color: #f1f5f9; }
    .vs-badge { width: 84px; height: 84px; border-radius: 50%; background: #ffffff; color: #04060d; font-size: 34px; font-weight: 900; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 40px rgba(255,255,255,0.5); }
    /* News Clipping */
    .news-clipping { background: #f8fafc; color: #0f172a; align-items: stretch; text-align: left; border: none; }
    .news-masthead { display: flex; align-items: center; gap: 14px; border-bottom: 3px solid #0f172a; padding-bottom: 18px; font-weight: 900; font-size: 22px; letter-spacing: 2px; }
    .news-live-dot { width: 16px; height: 16px; border-radius: 50%; background: #ef4444; }
    .news-date { margin-left: auto; color: #64748b; }
    .news-hl-wrap { position: relative; display: inline-block; margin: 16px 0; }
    .news-highlighter { position: absolute; left: -6px; bottom: 4px; height: 100%; width: 0%; z-index: 0; border-radius: 8px; }
    .news-title { position: relative; z-index: 1; font-size: 52px; font-weight: 900; line-height: 1.12; color: #090d16; }
    .news-excerpt { font-size: 28px; line-height: 1.45; color: #334155; font-weight: 600; }
    .news-Photo-strip { height: 220px; border-radius: 20px; overflow: hidden; background: #0f172a; }
    .news-Photo-strip img { width: 100%; height: 100%; object-fit: cover; }
    /* Tweet */
    .tweet-box { align-items: stretch; text-align: left; }
    .tweet-header { display: flex; align-items: center; gap: 22px; }
    .tweet-avatar { width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 900; }
    .tweet-name { font-size: 34px; font-weight: 900; display: flex; align-items: center; gap: 10px; }
    .verified { display: inline-flex; width: 34px; height: 34px; border-radius: 50%; background: #1d9bf0; color: #fff; align-items: center; justify-content: center; font-size: 20px; }
    .tweet-handle { font-size: 26px; color: #94a3b8; }
    .tweet-content { font-size: 40px; font-weight: 700; line-height: 1.38; margin: 12px 0; }
    .tweet-metrics { display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 24px; font-size: 26px; font-weight: 800; color: #94a3b8; }
    /* Chat */
    .chat-stage { align-items: stretch; gap: 22px; background: transparent; border: none; box-shadow: none; padding: 10px; }
    .chat-bubble { max-width: 85%; padding: 28px 34px; border-radius: 32px; text-align: left; font-size: 32px; font-weight: 700; line-height: 1.35; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
    .chat-bubble.incoming { align-self: flex-start; background: rgba(15, 23, 42, 0.92); border: 2px solid rgba(255,255,255,0.12); border-bottom-left-radius: 8px; }
    .chat-bubble.outgoing { align-self: flex-end; border-bottom-right-radius: 8px; }
    .chat-sender { font-size: 20px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 8px; }
    /* Dossier Redact */
    .dossier-card { position: relative; overflow: hidden; border: 2px dashed rgba(245, 158, 11, 0.5); }
    .dossier-stamp { padding: 10px 28px; border: 4px solid #ef4444; color: #ef4444; font-size: 28px; font-weight: 900; letter-spacing: 6px; border-radius: 10px; transform: rotate(-6deg); }
    .dossier-label { font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #94a3b8; letter-spacing: 3px; }
    .redact-wrap { position: relative; overflow: hidden; padding: 20px 30px; border-radius: 16px; background: rgba(255,255,255,0.04); }
    .secret-text { font-size: 54px; font-weight: 900; color: #facc15; text-transform: uppercase; }
    .redact-bar { position: absolute; inset: 0; background: #090d16; border: 2px solid #334155; }
    .dossier-sub { font-size: 26px; color: #cbd5e1; }
    /* Steps */
    .steps-card { align-items: stretch; text-align: left; }
    .steps-header { font-size: 40px; font-weight: 900; text-transform: uppercase; margin-bottom: 10px; text-align: center; }
    .steps-list { display: flex; flex-direction: column; gap: 22px; }
    .step-row { display: flex; align-items: center; gap: 24px; padding: 26px 30px; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
    .step-badge { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 900; flex-shrink: 0; }
    .step-text { font-size: 32px; font-weight: 700; line-height: 1.3; }
    /* Collage */
    .collage-stage { position: relative; height: 640px; justify-content: flex-end; background: transparent; border: none; box-shadow: none; }
    .collage-frame { position: absolute; top: 0; width: 520px; height: 420px; border-radius: 28px; overflow: hidden; border: 6px solid rgba(255,255,255,0.9); box-shadow: 0 30px 70px rgba(0,0,0,0.85); background: #1e293b; }
    .collage-frame img { width: 100%; height: 100%; object-fit: cover; }
    .frame-1 { left: 40px; }
    .frame-2 { right: 40px; top: 50px; }
    .collage-caption-card { position: relative; z-index: 4; width: 100%; padding: 34px; border-radius: 28px; background: rgba(9, 13, 24, 0.92); border: 2px solid #818cf8; backdrop-filter: blur(20px); }
    .col-hl { font-size: 22px; font-weight: 900; letter-spacing: 3px; margin-bottom: 8px; }
    .col-title { font-size: 42px; font-weight: 900; text-transform: uppercase; }
    /* CTA */
    .cta-stage { position: relative; padding: 70px 48px; }
    .cta-headline { font-size: 52px; font-weight: 900; text-transform: uppercase; line-height: 1.15; }
    .cta-button-3d { padding: 32px 60px; border-radius: 999px; font-size: 36px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-top: 16px; }
    .cta-cursor { position: absolute; right: 140px; bottom: 40px; filter: drop-shadow(0 12px 20px rgba(0,0,0,0.8)); }
    /* Ambient Glow & Floating Elements */
    .ambient-glow {
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      pointer-events: none;
      top: 20%;
      left: 15%;
      filter: blur(80px);
      z-index: 1;
    }
    /* Legendas Karaoke Word-by-Word Hormozi Ultra-Visíveis */
    .captions-zone {
      position: relative;
      z-index: 50;
      min-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin-top: auto;
      padding: 10px 0;
    }
    .caption-phrase {
      position: absolute;
      width: 100%;
      padding: 16px 24px;
      display: none;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px 16px;
      opacity: 0;
      background: rgba(0, 0, 0, 0.45);
      border-radius: 28px;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);
    }
    .caption-word {
      display: inline-block;
      font-size: 54px;
      font-weight: 900;
      line-height: 1.1;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.5);
      text-shadow: 0 4px 18px rgba(0, 0, 0, 0.95);
      padding: 6px 14px;
      border-radius: 12px;
      transform-origin: center bottom;
      letter-spacing: -0.5px;
    }
    .scene-progress-track {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 12px;
      background: rgba(255,255,255,0.08);
      z-index: 20;
    }
    .scene-progress-bar {
      height: 100%;
      width: 0%;
    }
  </style>
</head>
<body>
  <div id="root" data-composition-id="root" data-start="0" data-width="${width}" data-height="${height}" data-duration="${totalDuration}">
    ${config.fullAudioUrl ? `<audio id="master-narration-audio" src="${escapeHtml(config.fullAudioUrl)}" preload="auto" style="display:none"></audio>` : ''}
    ${scenesDom}
  </div>

  <script>
    window.__timelines = window.__timelines || {};
    const masterAudio = document.getElementById('master-narration-audio');
    const sceneAudios = Array.from(document.querySelectorAll('.scene-clip audio'));
    const statNumbers = Array.from(document.querySelectorAll('[id^="stat-num-"]'));

    function syncCounters(currentTime) {
      statNumbers.forEach((el) => {
        const sceneEl = el.closest('.scene-clip');
        if (!sceneEl) return;
        const st = parseFloat(sceneEl.getAttribute('data-start') || '0');
        const target = parseInt(el.getAttribute('data-target') || '90', 10);
        const suffix = el.getAttribute('data-suffix') || '%';
        const localT = Math.max(0, currentTime - st);
        const prog = Math.min(1, localT / 1.35);
        const currentVal = Math.round(target * (1 - Math.pow(1 - prog, 3)));
        el.textContent = currentVal + suffix;
      });
    }

    function syncAudioPlayback(currentTime, isPlaying) {
      if (masterAudio && masterAudio.src) {
        try {
          if (Math.abs(masterAudio.currentTime - currentTime) > 0.3) {
            masterAudio.currentTime = currentTime;
          }
          if (isPlaying && masterAudio.paused) {
            masterAudio.play().catch(() => {});
          } else if (!isPlaying && !masterAudio.paused) {
            masterAudio.pause();
          }
        } catch (e) {}
      }

      // Sincroniza áudio de cada cena caso não haja masterAudio
      if (!masterAudio || !masterAudio.src) {
        sceneAudios.forEach((aud) => {
          try {
            const start = parseFloat(aud.getAttribute('data-start') || '0');
            const dur = parseFloat(aud.getAttribute('data-duration') || '4');
            const end = start + dur;
            if (currentTime >= start && currentTime < end) {
              const localT = currentTime - start;
              if (Math.abs(aud.currentTime - localT) > 0.3) {
                aud.currentTime = localT;
              }
              if (isPlaying && aud.paused) {
                aud.play().catch(() => {});
              } else if (!isPlaying && !aud.paused) {
                aud.pause();
              }
            } else {
              if (!aud.paused) aud.pause();
            }
          } catch (e) {}
        });
      }
    }

    const masterTl = gsap.timeline({
      paused: true,
      onUpdate: function () {
        const t = this.time();
        syncCounters(t);
        syncAudioPlayback(t, !this.paused());
        try {
          window.parent.postMessage({ type: 'HYPERFRAME_TIME_UPDATE', currentTime: t }, '*');
        } catch (e) {}
      },
      onComplete: function () {
        syncAudioPlayback(this.duration(), false);
        try {
          window.parent.postMessage({ type: 'HYPERFRAME_PLAYBACK_ENDED' }, '*');
        } catch (e) {}
      }
    });
    ${gsapSceneScripts}

    window.__timelines.root = masterTl;

    function seekToTime(t) {
      const clamped = Math.max(0, Math.min(${totalDuration}, Number(t) || 0));
      masterTl.time(clamped);
      syncCounters(clamped);
      syncAudioPlayback(clamped, !masterTl.paused());
    }

    function playVideo() {
      if (masterTl.time() >= ${totalDuration} - 0.05) {
        masterTl.time(0);
      }
      masterTl.play();
      syncAudioPlayback(masterTl.time(), true);
    }

    function pauseVideo() {
      masterTl.pause();
      syncAudioPlayback(masterTl.time(), false);
    }

    window.seekToTime = seekToTime;
    window.playVideo = playVideo;
    window.pauseVideo = pauseVideo;
    seekToTime(0);

    window.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.type === 'SEEK_VIDEO') {
        seekToTime(event.data.time);
      } else if (event.data.type === 'PLAY_VIDEO') {
        playVideo();
      } else if (event.data.type === 'PAUSE_VIDEO') {
        pauseVideo();
      } else if (event.data.type === 'SET_VOLUME') {
        const vol = Math.max(0, Math.min(1, Number(event.data.volume) || 1));
        if (masterAudio) masterAudio.volume = vol;
        sceneAudios.forEach((a) => { a.volume = vol; });
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
