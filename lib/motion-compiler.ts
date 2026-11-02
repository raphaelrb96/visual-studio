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

export function computeWordTimestamps(text: string, durationSec: number): WordTimestampItem[] {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

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

function shouldUseAiCustomStage(sc: CompiledSceneData): boolean {
  const dedicatedEngines = ['assemble-then-type-flyin', 'flying-words', 'card-stack', 'spotlight-hero-card'];
  if (dedicatedEngines.includes(sc.templateId)) {
    return false;
  }
  return Boolean(
    sc.compiledCustomHtml &&
      sc.compiledCustomHtml.trim().length > 30 &&
      sc.compiledGsapScript &&
      sc.compiledGsapScript.trim().length > 20 &&
      !sc.compiledCustomHtml.includes('class="centerpiece"')
  );
}

function renderSceneCenterpieceHtml(
  sc: CompiledSceneData,
  idx: number,
  highlightColor: string,
  aspectRatio: '9:16' | '16:9' | '1:1'
): string {
  if (shouldUseAiCustomStage(sc)) {
    return `
      <div class="ai-full-stage" id="cp-${idx}">
        ${sc.compiledCustomHtml}
      </div>
    `;
  }

  const procedural = buildProceduralMotionScene({
    scene: sc,
    sceneIndex: idx,
    resolvedTemplate: sc.templateId || 'hormozi_bold',
    visualPrompt: sc.visualPrompt || sc.headline || '',
    headline: sc.headline || sc.text.slice(0, 42).toUpperCase(),
    subText: sc.subText || '',
    tag: sc.tag || 'DESTAQUE',
    text: sc.text || '',
    duration: typeof sc.motionDurationSec === 'number' ? sc.motionDurationSec : sc.durationSec || 4.5,
    highlightColor,
    primaryTextColor: '#ffffff',
    aspectRatio,
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
      const highlightColor = sc.highlightColor || tplMeta?.defaultHighlightColor || '#facc15';
      const centerpiece = renderSceneCenterpieceHtml(sc, sc.idx, highlightColor, aspectRatio);

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
        <!-- Camada 0: Ambiente Cinematográfico Dinâmico -->
        <div class="broll-container" id="broll-${sc.idx}">
          <img class="broll-img" id="broll-img-${sc.idx}" src="${escapeHtml(sc.brollUrl || '')}" alt="" crossorigin="anonymous" onerror="this.style.opacity='0'" />
          <div class="broll-vignette"></div>
          <div class="broll-grid-overlay"></div>
          <div class="ambient-glow" id="glow-${sc.idx}" style="background: radial-gradient(circle, ${highlightColor}28 0%, transparent 70%);"></div>
        </div>

        ${
          sc.audioUrl
            ? `<audio src="${escapeHtml(sc.audioUrl)}" data-start="${sc.startSec}" data-duration="${sc.durationSec}" data-volume="1" preload="auto"></audio>`
            : ''
        }

        <!-- Camada 2: Palco Visual Dinâmico 100% Full-Canvas -->
        ${centerpieceHtml}

        <!-- Camada 3: Legendas Cinéticas Pop Word-by-Word -->
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

  const gsapSceneScripts = sceneTimings
    .map((sc) => {
      const s = sc.startSec;
      const d = sc.durationSec;
      const idx = sc.idx;
      const tplMeta = MOTION_TEMPLATES.find((t) => t.id === sc.templateId) || MOTION_TEMPLATES[0];
      const highlightColor = sc.highlightColor || tplMeta?.defaultHighlightColor || '#facc15';
      const hlColor = highlightColor;

      const motionStart = typeof sc.motionStartSec === 'number' ? sc.motionStartSec : s;
      const motionDur = typeof sc.motionDurationSec === 'number' ? sc.motionDurationSec : d;
      const mediaStart = typeof sc.mediaStartSec === 'number' ? sc.mediaStartSec : s;
      const mediaDur = typeof sc.mediaDurationSec === 'number' ? sc.mediaDurationSec : d;
      const subStart = typeof sc.subtitleStartSec === 'number' ? sc.subtitleStartSec : s;
      const subDur = typeof sc.subtitleDurationSec === 'number' ? sc.subtitleDurationSec : d;
      const subScale = d > 0 ? subDur / d : 1;

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

      let captionsGsap = '';
      chunks.forEach((chunk, ci) => {
        const phStart = Number((subStart + chunk.start * subScale).toFixed(3));
        const phEnd = Number((subStart + chunk.end * subScale + 0.12).toFixed(3));
        captionsGsap += `
        masterTl.set("#phrase-${idx}-${ci}", { autoAlpha: 1, display: "flex" }, ${phStart});
        masterTl.set("#phrase-${idx}-${ci}", { autoAlpha: 0, display: "none" }, ${phEnd});
        `;

        chunk.words.forEach((w, wi) => {
          const wStart = Number((subStart + w.startSec * subScale).toFixed(3));
          const wEnd = Number((subStart + w.endSec * subScale).toFixed(3));
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

      const rawMotionGsap = shouldUseAiCustomStage(sc)
        ? sc.compiledGsapScript!
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
            aspectRatio,
          }).gsap;

      const sceneStartVis = Math.min(s, mediaStart, motionStart, subStart);
      const sceneEndVis = Math.max(sc.endSec, mediaStart + mediaDur, motionStart + motionDur, subStart + subDur);

      return `
      // --- CENA #${idx + 1} (${sc.templateId}) [${sceneStartVis}s -> ${sceneEndVis}s] ---
      masterTl.set("#scene-${idx}", { autoAlpha: 1, zIndex: ${10 + idx} }, ${sceneStartVis});

      // 1. Câmera Contínua Ken Burns na Pista de Mídia
      masterTl.set("#broll-${idx}", { autoAlpha: 1 }, ${mediaStart});
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

      // 2. Elemento Motion 3D conforme Pista de Motion
      masterTl.set("#cp-${idx}", { autoAlpha: 1, display: "flex" }, ${motionStart});
      masterTl.fromTo("#cp-${idx}",
        { scale: 0.94, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.38, ease: "power2.out" },
        ${motionStart}
      );
      masterTl.set("#cp-${idx}", { autoAlpha: 0 }, ${(motionStart + motionDur).toFixed(3)});

      // 3. Barra de Progresso
      masterTl.fromTo("#prog-${idx}",
        { width: "0%" },
        { width: "100%", duration: ${d}, ease: "none" },
        ${s}
      );

      // 4. Legendas Word-by-Word sincronizadas na timeline
      ${captionsGsap}

      try {
        ${rawMotionGsap.replace(/START_SEC/g, String(motionStart))}
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
      padding: 64px 52px 96px;
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
      opacity: 0.34;
      filter: contrast(1.15) saturate(1.2) blur(4px);
    }
    .broll-vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, rgba(4,6,13,0.35) 20%, rgba(4,6,13,0.88) 100%);
    }
    .broll-grid-overlay {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .ambient-glow {
      position: absolute;
      inset: -15%;
      pointer-events: none;
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
    .captions-zone {
      position: relative;
      z-index: 25;
      min-height: 130px;
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
      background: rgba(4, 6, 13, 0.72);
      border-radius: 28px;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);
    }
    .caption-word {
      display: inline-block;
      font-size: 50px;
      font-weight: 900;
      line-height: 1.1;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.55);
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
      z-index: 30;
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
          if (Math.abs(masterAudio.currentTime - currentTime) > 0.35) {
            masterAudio.currentTime = currentTime;
          }
          if (isPlaying && masterAudio.paused) {
            masterAudio.play().catch(() => {});
          } else if (!isPlaying && !masterAudio.paused) {
            masterAudio.pause();
          }
        } catch (e) {}
      }

      if (!masterAudio || !masterAudio.src) {
        sceneAudios.forEach((aud) => {
          try {
            const start = parseFloat(aud.getAttribute('data-start') || '0');
            const dur = parseFloat(aud.getAttribute('data-duration') || '4');
            const end = start + dur;
            if (currentTime >= start && currentTime < end) {
              const localT = currentTime - start;
              if (Math.abs(aud.currentTime - localT) > 0.35) {
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
