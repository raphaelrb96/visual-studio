import { MOTION_TEMPLATES, MotionTemplateId } from './motion-templates';
import { buildProceduralMotionScene } from './scene-motion-generator';

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
  // Timing assíncrono por faixa
  motionStartSec?: number;
  motionDurationSec?: number;
  mediaStartSec?: number;
  mediaDurationSec?: number;
  subtitleStartSec?: number;
  subtitleDurationSec?: number;
  audioStartSec?: number;
  audioDurationSec?: number;
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
 * Gera o palco visual cinematográfico (HTML5/SVG + GSAP 3) para a cena.
 * 100% dinâmico e em tela cheia, sem nenhum card estático tipo slide.
 */
function renderSceneCenterpieceHtml(sc: CompiledSceneData, idx: number, highlightColor: string): string {
  // Se a IA gerou HTML customizado para essa cena baseado no prompt detalhado, prioriza a renderização direta em tela cheia
  if (sc.compiledCustomHtml && sc.compiledCustomHtml.trim().length > 10) {
    return `
      <div class="ai-full-stage" id="cp-${idx}">
        ${sc.compiledCustomHtml}
      </div>
    `;
  }

  // Gera proceduralmente o palco visual completo Full-Canvas cinematográfico caso não tenha vindo da IA
  const procedural = buildProceduralMotionScene({
    scene: sc,
    sceneIndex: idx,
    resolvedTemplate: sc.templateId || 'hormozi_bold',
    visualPrompt: sc.visualPrompt || sc.headline || '',
    headline: sc.headline || sc.text.slice(0, 42).toUpperCase(),
    subText: sc.subText || '',
    tag: sc.tag || 'DESTAQUE',
    text: sc.text || '',
    duration: sc.durationSec || 4.5,
    highlightColor,
    primaryTextColor: '#ffffff',
  });

  return `
    <div class="ai-full-stage" id="cp-${idx}">
      ${procedural.html}
    </div>
  `;
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

      const centerpieceHtml = `<div class="ai-stage-fullscreen" id="stage-wrapper-${sc.idx}">${centerpiece}</div>`;

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

        <!-- Camada 2: Palco Visual Dinâmico 100% Full-Canvas -->
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
      const highlightColor = sc.highlightColor || '#facc15';
      const hlColor = highlightColor;

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

      // Offset individual assíncrono para cada faixa se customizado pelo usuário
      const motionStart = typeof sc.motionStartSec === 'number' ? sc.motionStartSec : s;
      const motionDur = typeof sc.motionDurationSec === 'number' ? sc.motionDurationSec : d;

      const mediaStart = typeof sc.mediaStartSec === 'number' ? sc.mediaStartSec : s;
      const mediaDur = typeof sc.mediaDurationSec === 'number' ? sc.mediaDurationSec : d;

      return `
      // --- CENA #${idx + 1} (${sc.templateId}) [${s}s -> ${sc.endSec}s] ---
      masterTl.set("#scene-${idx}", { autoAlpha: 1, zIndex: ${10 + idx} }, ${Math.min(s, mediaStart, motionStart)});

      // 1. Câmera Contínua Ken Burns (Movimento cinematográfico contínuo durante a faixa de mídia)
      masterTl.fromTo("#broll-img-${idx}",
        { scale: 1.0, xPercent: 0, yPercent: 0 },
        { scale: 1.18, xPercent: ${idx % 2 === 0 ? 3 : -3}, yPercent: ${idx % 2 === 0 ? -2 : 2}, duration: ${mediaDur}, ease: "none" },
        ${mediaStart}
      );
      masterTl.fromTo("#glow-${idx}",
        { scale: 0.8, opacity: 0.2 },
        { scale: 1.3, opacity: 0.6, duration: ${mediaDur}, ease: "power1.inOut" },
        ${mediaStart}
      );

      // 2. Elemento Motion 3D (Entrada e saída conforme timing da Pista de Motion)
      masterTl.set("#cp-${idx}", { autoAlpha: 1, display: "flex" }, ${motionStart});
      masterTl.fromTo("#cp-${idx}",
        { scale: 0.94, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.45, ease: "power2.out" },
        ${motionStart}
      );

      // 4. Barra de Progresso
      masterTl.fromTo("#prog-${idx}",
        { width: "0%" },
        { width: "100%", duration: ${d}, ease: "none" },
        ${s}
      );

      // 5. Legendas Word-by-Word sincronizadas na timeline
      ${captionsGsap}

      try {
        ${
          (sc.compiledGsapScript && sc.compiledGsapScript.trim().length > 20
            ? sc.compiledGsapScript
            : buildProceduralMotionScene({
                scene: sc,
                sceneIndex: sc.idx,
                resolvedTemplate: sc.templateId || 'hormozi_bold',
                visualPrompt: sc.visualPrompt || sc.headline || '',
                headline: sc.headline || sc.text.slice(0, 42).toUpperCase(),
                subText: sc.subText || '',
                tag: sc.tag || 'DESTAQUE',
                text: sc.text || '',
                duration: motionDur,
                highlightColor,
                primaryTextColor: '#ffffff',
              }).gsap
          ).replace(/START_SEC/g, String(motionStart))
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
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #04060d;
      font-family: 'Inter', sans-serif;
      color: #ffffff;
      margin: 0;
      padding: 0;
    }
    #stage-viewport {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #04060d;
      position: absolute;
      inset: 0;
    }
    #root {
      position: absolute;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      perspective: 1200px;
      background: #04060d;
      transform-origin: center center;
      flex-shrink: 0;
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
      background: #04060d;
    }
    .broll-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.88;
      filter: contrast(1.15) saturate(1.2) brightness(0.92);
    }
    .broll-vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(4,6,13,0.2) 30%, rgba(4,6,13,0.78) 100%);
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
      padding: 0;
      pointer-events: none;
    }
    .ai-full-stage {
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
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
  <div id="stage-viewport">
    <div id="root" data-composition-id="root" data-start="0" data-width="${width}" data-height="${height}" data-duration="${totalDuration}">
      ${config.fullAudioUrl ? `<audio id="master-narration-audio" src="${escapeHtml(config.fullAudioUrl)}" preload="auto" style="display:none"></audio>` : ''}
      ${scenesDom}
    </div>
  </div>

  <script>
    // Auto-fit responsivo do Canvas (1080x1920) à janela do iframe sem cortar
    function autoFitCanvas() {
      const root = document.getElementById('root');
      if (!root) return;
      const targetW = ${width};
      const targetH = ${height};
      const winW = window.innerWidth || document.documentElement.clientWidth;
      const winH = window.innerHeight || document.documentElement.clientHeight;
      if (winW <= 0 || winH <= 0) return;
      const scale = Math.min(winW / targetW, winH / targetH);
      root.style.transform = 'scale(' + scale + ')';
      root.style.left = ((winW - targetW) / 2) + 'px';
      root.style.top = ((winH - targetH) / 2) + 'px';
    }
    window.addEventListener('resize', autoFitCanvas);
    document.addEventListener('DOMContentLoaded', autoFitCanvas);
    setTimeout(autoFitCanvas, 50);
    setTimeout(autoFitCanvas, 300);
    autoFitCanvas();
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
        if (this.time() >= ${totalDuration} - 0.15) {
          syncAudioPlayback(this.duration(), false);
          try {
            window.parent.postMessage({ type: 'HYPERFRAME_PLAYBACK_ENDED' }, '*');
          } catch (e) {}
        }
      }
    });

    ${gsapSceneScripts}

    // Fixa o fim exato da timeline para totalDuration evitando finalização prematura
    masterTl.to({}, { duration: 0.01 }, ${totalDuration});

    window.__timelines.root = masterTl;

    function seekToTime(t) {
      const clamped = Math.max(0, Math.min(${totalDuration}, Number(t) || 0));
      masterTl.time(clamped);
      syncCounters(clamped);
      syncAudioPlayback(clamped, !masterTl.paused());
    }

    function playVideo() {
      if (masterTl.time() >= ${totalDuration} - 0.1) {
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

    // Inicializa a agulha no frame 0
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

    // Registra listener no documento para garantir que o primeiro clique/toque do usuário desbloqueie o áudio do navegador
    document.addEventListener('click', () => {
      if (masterAudio && masterAudio.paused && !masterTl.paused()) {
        masterAudio.play().catch(() => {});
      }
    }, { once: true });
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
