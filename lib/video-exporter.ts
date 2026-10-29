import { VideoManifest, ScriptScene } from '@/types/studio';
import { getPresetById } from '@/lib/presets';

export async function renderManifestToVideoBlob(
  manifest: VideoManifest,
  onProgress?: (percent: number, stageText: string) => void
): Promise<{ blob: Blob; url: string }> {
  const preset = getPresetById(manifest.presetId);
  const width = manifest.aspectRatio === '16:9' ? 1280 : manifest.aspectRatio === '1:1' ? 1080 : 720;
  const height = manifest.aspectRatio === '16:9' ? 720 : manifest.aspectRatio === '1:1' ? 1080 : 1280;

  onProgress?.(8, 'Carregando mídias B-Roll e locução neural...');

  const sceneImages: Record<string, HTMLImageElement | null> = {};
  await Promise.all(
    manifest.scenes.map(
      (sc: ScriptScene) =>
        new Promise<void>((resolve) => {
          const url = sc.brollImageUrl || sc.componentProps?.imageUrl;
          if (!url) {
            sceneImages[sc.id] = null;
            return resolve();
          }
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            sceneImages[sc.id] = img;
            resolve();
          };
          img.onerror = () => {
            sceneImages[sc.id] = null;
            resolve();
          };
          img.src = url;
        })
    )
  );

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const destNode = audioCtx.createMediaStreamDestination();

  onProgress?.(22, 'Sintetizando áudio neural e sound design...');

  const sceneAudioBuffers: Record<string, AudioBuffer | null> = {};
  await Promise.all(
    manifest.scenes.map(async (sc: ScriptScene) => {
      const ttsUrl = sc.audioUrl || `/api/tts?text=${encodeURIComponent(sc.text)}&lang=pt-BR`;
      try {
        const res = await fetch(ttsUrl);
        if (!res.ok) throw new Error('TTS status error');
        const arrBuf = await res.arrayBuffer();
        const decoded = await audioCtx.decodeAudioData(arrBuf);
        sceneAudioBuffers[sc.id] = decoded;
      } catch {
        sceneAudioBuffers[sc.id] = null;
      }
    })
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  let timeCursor = 0.1;
  const startAudioTime = audioCtx.currentTime + 0.1;

  for (const sc of manifest.scenes) {
    const sceneStart = startAudioTime + timeCursor;

    scheduleTransitionSfx(audioCtx, destNode, sceneStart);

    const buf = sceneAudioBuffers[sc.id];
    if (buf) {
      const source = audioCtx.createBufferSource();
      source.buffer = buf;
      source.playbackRate.value = 1.06;
      const gain = audioCtx.createGain();
      gain.gain.value = 1.0;
      source.connect(gain);
      gain.connect(destNode);
      source.start(sceneStart);
    }

    timeCursor += sc.durationSec;
  }

  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...destNode.stream.getAudioTracks(),
  ]);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 4_500_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const totalDuration = manifest.scenes.reduce((acc: number, s: ScriptScene) => acc + s.durationSec, 0);

  return new Promise((resolve, reject) => {
    recorder.onerror = (err) => reject(err);
    recorder.onstop = () => {
      audioCtx.close().catch(() => {});
      const finalBlob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(finalBlob);
      resolve({ blob: finalBlob, url });
    };

    recorder.start(100);
    const renderStartMs = performance.now();

    const drawLoop = () => {
      const elapsedSec = (performance.now() - renderStartMs) / 1000;

      if (elapsedSec >= totalDuration) {
        onProgress?.(100, 'Vídeo finalizado!');
        recorder.stop();
        return;
      }

      const pct = Math.min(98, Math.round(25 + (elapsedSec / totalDuration) * 73));
      onProgress?.(pct, `Renderizando quadros HyperFrames (${Math.ceil(totalDuration - elapsedSec)}s restantes)...`);

      let acc = 0;
      let activeScene: ScriptScene = manifest.scenes[0];
      let sceneProgress = 0;
      let sceneElapsed = 0;

      for (const sc of manifest.scenes) {
        if (elapsedSec >= acc && elapsedSec <= acc + sc.durationSec) {
          activeScene = sc;
          sceneElapsed = elapsedSec - acc;
          sceneProgress = Math.min(1, Math.max(0, sceneElapsed / sc.durationSec));
          break;
        }
        acc += sc.durationSec;
      }

      drawSceneOnCanvas(
        ctx,
        width,
        height,
        activeScene,
        sceneProgress,
        sceneElapsed,
        preset,
        sceneImages[activeScene.id]
      );

      requestAnimationFrame(drawLoop);
    };

    requestAnimationFrame(drawLoop);
  });
}

function scheduleTransitionSfx(
  audioCtx: AudioContext,
  dest: MediaStreamAudioDestinationNode,
  startTime: number
) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, startTime);
  osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.22);

  gain.gain.setValueAtTime(0.18, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.24);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(startTime);
  osc.stop(startTime + 0.25);
}

function drawSceneOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: ScriptScene,
  progress: number,
  sceneElapsed: number,
  preset: any,
  bgImage: HTMLImageElement | null
) {
  // 1. Fundo base
  ctx.fillStyle = preset.theme.backgroundColor || '#070a12';
  ctx.fillRect(0, 0, width, height);

  // 2. B-Roll com movimento Ken Burns
  if (bgImage) {
    ctx.save();
    const scale = 1.05 + progress * 0.14;
    const drawW = width * scale;
    const drawH = height * scale;
    const dx = (width - drawW) / 2;
    const dy = (height - drawH) / 2;
    ctx.globalAlpha = 0.45;
    ctx.drawImage(bgImage, dx, dy, drawW, drawH);
    ctx.restore();
  }

  // 3. Vinheta escura cinematográfica
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, 'rgba(6, 9, 17, 0.85)');
  grad.addColorStop(0.5, 'rgba(6, 9, 17, 0.45)');
  grad.addColorStop(1, 'rgba(6, 9, 17, 0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 4. Renderiza o Card HyperFrame Central
  const cardW = width * 0.86;
  const cardH = height * 0.36;
  const cardX = (width - cardW) / 2;
  const cardY = height * 0.24;

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = preset.theme.highlightTextColor || '#facc15';
  ctx.lineWidth = 3;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();
  ctx.stroke();

  // Tipo do Componente no Topo
  const badgeText = (scene.componentType || 'HYPERFRAME').toUpperCase();
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = preset.theme.highlightTextColor || '#facc15';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, width / 2, cardY + 48);

  if (scene.componentType === 'StatCounter') {
    const targetNum = Number(scene.componentProps?.number || 90);
    const currentNum = Math.round(targetNum * Math.min(1, progress * 1.4));
    const displayStat = `${scene.componentProps?.prefix || ''}${currentNum}${scene.componentProps?.suffix || '%'}`;
    ctx.font = '900 88px sans-serif';
    ctx.fillStyle = preset.theme.highlightTextColor || '#facc15';
    ctx.fillText(displayStat, width / 2, cardY + cardH * 0.55);

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(scene.componentProps?.label || '', width / 2, cardY + cardH * 0.78);
  } else if (scene.componentType === 'NewsHeadline') {
    ctx.font = 'bold 22px serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText(scene.componentProps?.portalName || 'BREAKING NEWS', width / 2, cardY + 85);

    ctx.font = '900 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, scene.componentProps?.headline || scene.text, width / 2, cardY + 140, cardW - 50, 44);
  } else if (scene.componentType === 'VersusComparison') {
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(scene.componentProps?.leftTitle || 'O JEITO COMUM', width / 2, cardY + 90);

    ctx.font = '900 28px sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText(scene.componentProps?.rightTitle || 'COM O VISUAL STUDIO', width / 2, cardY + 165);
  } else {
    const headline =
      scene.componentProps?.headline ||
      scene.componentProps?.quoteText ||
      scene.componentProps?.buttonText ||
      scene.text.slice(0, 42).toUpperCase();

    ctx.font = '900 38px sans-serif';
    ctx.fillStyle = '#ffffff';
    wrapText(ctx, headline, width / 2, cardY + 120, cardW - 60, 46);
  }
  ctx.restore();

  // 5. Legendas Dinâmicas Palavra por Palavra
  const words = scene.text.trim().split(/\s+/);
  const activeIdx = Math.min(words.length - 1, Math.floor(progress * words.length));
  const chunkSize = 4;
  const chunkStart = Math.floor(activeIdx / chunkSize) * chunkSize;
  const chunkWords = words.slice(chunkStart, chunkStart + chunkSize);

  const subBoxY = height * 0.78;
  ctx.save();
  ctx.font = '900 36px sans-serif';
  ctx.textAlign = 'center';

  const lineStr = chunkWords.join(' ').toUpperCase();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  const textWidth = Math.min(width * 0.9, ctx.measureText(lineStr).width + 60);
  roundRect(ctx, (width - textWidth) / 2, subBoxY - 44, textWidth, 68, 18);
  ctx.fill();

  let xCursor = width / 2 - ctx.measureText(lineStr).width / 2;
  ctx.textAlign = 'left';
  chunkWords.forEach((w, idx) => {
    const wordUpper = w.toUpperCase() + ' ';
    const isCurrent = chunkStart + idx === activeIdx;
    ctx.fillStyle = isCurrent ? preset.theme.highlightTextColor || '#facc15' : '#ffffff';
    ctx.fillText(wordUpper, xCursor, subBoxY);
    xCursor += ctx.measureText(wordUpper).width;
  });
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[n] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currY);
}
