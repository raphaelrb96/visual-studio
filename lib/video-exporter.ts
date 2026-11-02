import { VideoManifest, ScriptScene } from '@/types/studio';
import { MOTION_TEMPLATES } from '@/lib/motion-templates';
import { DEFAULT_STYLE_PRESETS, getPresetById } from '@/lib/presets';

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(Math.min(1, Math.max(0, x)) - 1, 3) + c1 * Math.pow(Math.min(1, Math.max(0, x)) - 1, 2);
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function loadImageSafe(url: string | undefined): Promise<HTMLImageElement | null> {
  if (!url) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), 3500);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  scale = 1
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const imgRatio = img.width / Math.max(1, img.height);
  const targetRatio = w / Math.max(1, h);
  let drawW = w * scale;
  let drawH = h * scale;

  if (imgRatio > targetRatio) {
    drawH = h * scale;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * scale;
    drawH = drawW / imgRatio;
  }

  const dx = x + (w - drawW) / 2;
  const dy = y + (h - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();
}

/**
 * Renderizador e Exportador Oficial de Vídeo MP4 H.264/AAC.
 * 1. Renderiza todos os quadros a 30fps diretamente em Canvas 2D de alta resolução (1080x1920 / 1920x1080)
 *    fiel ao template de cada cena, B-Roll integrado e legendas dinâmicas (zero bug de foreignObject em branco).
 * 2. Envia o stream gravado para `/api/studio/export-mp4` que executa o FFmpeg local (`libx264` + `yuv420p` + `aac`)
 *    e devolve um arquivo `.mp4` genuíno que abre perfeitamente no Windows Media Player.
 */
export async function renderManifestToVideoBlob(
  manifest: VideoManifest,
  onProgress?: (percent: number, stageText: string) => void,
  voiceId: string = 'antonio'
): Promise<{ blob: Blob; url: string }> {
  const width = manifest.aspectRatio === '16:9' ? 1920 : 1080;
  const height = manifest.aspectRatio === '16:9' ? 1080 : manifest.aspectRatio === '1:1' ? 1080 : 1920;

  onProgress?.(8, 'Carregando mídias B-Roll e preparando cenas...');

  const preset = getPresetById(manifest.presetId || 'kinetic_yellow') || DEFAULT_STYLE_PRESETS[0];
  const scenes = manifest.scenes || [];

  // Pré-carrega todas as imagens B-Roll com segurança CORS
  const sceneImages = await Promise.all(
    scenes.map((s) => loadImageSafe(s.brollImageUrl || s.componentProps?.imageUrl))
  );

  // Calcula tempos exatos de cada cena
  let acc = 0;
  const timedScenes = scenes.map((sc, i) => {
    const dur = Math.max(2.5, Number(sc.durationSec) || 4.5);
    const startSec = acc;
    acc += dur;
    return {
      scene: sc,
      idx: i,
      startSec,
      durationSec: dur,
      endSec: acc,
      img: sceneImages[i],
    };
  });

  const totalDuration = Math.max(3, acc);
  const fullNarrationText =
    manifest.fullNarration || scenes.map((s) => s.text).filter(Boolean).join(' ');

  onProgress?.(20, 'Iniciando motor gráfico 60fps para gravação...');

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(30);

  // Conecta o áudio também no stream para caso o usuário use fallback
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const destNode = audioCtx.createMediaStreamDestination();

  const fullAudioUrl =
    manifest.fullAudioUrl ||
    `/api/tts?text=${encodeURIComponent(fullNarrationText.slice(0, 1200))}&voice=${encodeURIComponent(voiceId)}`;

  try {
    const aRes = await fetch(fullAudioUrl);
    if (aRes.ok) {
      const aBuf = await aRes.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(aBuf);
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(destNode);
      source.start(audioCtx.currentTime + 0.05);
    }
  } catch (e) {
    console.warn('Áudio será muxado diretamente pelo FFmpeg no servidor:', e);
  }

  const combinedStream = new MediaStream([
    ...stream.getVideoTracks(),
    ...destNode.stream.getAudioTracks(),
  ]);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
    ? 'video/webm;codecs=vp8,opus'
    : 'video/webm';

  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 10_000_000,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const webmBlobPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      audioCtx.close().catch(() => {});
      resolve(new Blob(chunks, { type: mimeType }));
    };
  });

  recorder.start(100);
  const startWallTime = performance.now();

  const drawSceneFrame = (currentTime: number) => {
    const active =
      timedScenes.find((ts) => currentTime >= ts.startSec && currentTime <= ts.endSec) ||
      timedScenes[timedScenes.length - 1];

    if (!active) return;

    const { scene, idx, startSec, durationSec, img } = active;
    const localT = Math.max(0, currentTime - startSec);
    const prog = Math.min(1, localT / durationSec);

    const tplId = String(scene.templateId || scene.componentType || 'assemble-then-type-flyin');
    const tplMeta = MOTION_TEMPLATES.find((t) => t.id === tplId);
    const hlColor = tplMeta?.defaultHighlightColor || preset.theme.highlightTextColor || '#facc15';
    const headline = String(
      scene.componentProps?.headline || scene.text.slice(0, 38)
    ).toUpperCase();
    const subText = String(
      scene.componentProps?.subtext || tplMeta?.description?.slice(0, 70) || ''
    );
    const tag = String(scene.componentProps?.badge || tplMeta?.badge || 'MOTION STUDIO').toUpperCase();

    // 1. Fundo Escuro Profundo + B-Roll Ambiental Suave
    ctx.fillStyle = '#04060d';
    ctx.fillRect(0, 0, width, height);

    if (img) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      drawCoverImage(ctx, img, 0, 0, width, height, 1.0 + prog * 0.14);
      ctx.restore();
    }

    // Gradiente Radial Cinematográfico
    const grad = ctx.createRadialGradient(
      width / 2,
      height * 0.42,
      width * 0.08,
      width / 2,
      height * 0.5,
      Math.max(width, height) * 0.75
    );
    grad.addColorStop(0, `${hlColor}26`);
    grad.addColorStop(0.6, 'rgba(4, 6, 13, 0.82)');
    grad.addColorStop(1, 'rgba(4, 6, 13, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Grade Técnica Sutil
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Anel Orbital Rotativo
    ctx.save();
    ctx.translate(width / 2, height * 0.44);
    ctx.rotate(localT * 0.35);
    ctx.strokeStyle = `${hlColor}44`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([18, 22]);
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(width, height) * 0.34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    const enterSpring = easeOutBack(Math.min(1, localT / 0.55));
    const padX = width * 0.08;
    const cardW = width - padX * 2;

    // 2. Badge Superior Animada
    ctx.save();
    const badgeY = height * 0.11 + (1 - enterSpring) * -50;
    ctx.font = '800 22px Inter, sans-serif';
    const badgeW = Math.max(240, ctx.measureText(tag).width + 80);
    roundRect(ctx, (width - badgeW) / 2, badgeY, badgeW, 54, 27);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fill();
    ctx.strokeStyle = hlColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = hlColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, width / 2, badgeY + 28);
    ctx.restore();

    // 3. Renderização Específica por Família de Template
    if (tplId.includes('card-stack') || tplId.includes('stack')) {
      // Leque de Cartões 3D
      const fanProg = easeOutBack(Math.min(1, Math.max(0, (localT - 0.15) / 0.65)));
      const angles = [-14, -7, 0, 7, 14];
      angles.forEach((deg, ci) => {
        const isHero = ci === 2;
        ctx.save();
        ctx.translate(width / 2 + deg * 11 * fanProg, height * 0.45 + Math.abs(deg) * 2.5);
        ctx.rotate(((deg * fanProg) * Math.PI) / 180);
        const cw = Math.min(460, width * 0.44);
        const ch = Math.min(540, height * 0.32);
        roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 28);
        ctx.fillStyle = isHero ? hlColor : 'rgba(15, 23, 42, 0.95)';
        ctx.fill();
        ctx.strokeStyle = isHero ? '#ffffff' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = isHero ? 4 : 2;
        ctx.stroke();

        if (isHero && img) {
          ctx.save();
          roundRect(ctx, -cw / 2 + 16, -ch / 2 + 16, cw - 32, ch * 0.55, 18);
          ctx.clip();
          drawCoverImage(ctx, img, -cw / 2 + 16, -ch / 2 + 16, cw - 32, ch * 0.55, 1.05);
          ctx.restore();
        }
        ctx.restore();
      });
    } else if (tplId.includes('stat') || tplId.includes('counter') || tplId.includes('data')) {
      // Velocímetro / Contador Radial
      const targetNum = parseInt(String(scene.componentProps?.number || '92'), 10) || 92;
      const curNum = Math.round(targetNum * easeOutCubic(Math.min(1, localT / 1.3)));
      const cx = width / 2;
      const cy = height * 0.38;
      const r = Math.min(width, height) * 0.16;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 22;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        r,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * (curNum / 100)
      );
      ctx.strokeStyle = hlColor;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.fillStyle = hlColor;
      ctx.font = '900 88px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${curNum}%`, cx, cy);
      ctx.restore();
    } else {
      // Moldura B-Roll Protagonista em Primeiro Plano + Wipe Dourado/Neon
      const mediaY = height * 0.2 + (1 - enterSpring) * 70;
      const mediaH = height * 0.28;
      ctx.save();
      roundRect(ctx, padX, mediaY, cardW, mediaH, 32);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.clip();

      if (img) {
        drawCoverImage(ctx, img, padX, mediaY, cardW, mediaH, 1.02 + prog * 0.12);
      }

      // Linha de varredura neon estilo assemble-then-type-flyin
      const wipeX = padX + cardW * easeOutCubic(Math.min(1, localT / 1.4));
      ctx.fillStyle = hlColor;
      ctx.fillRect(wipeX - 3, mediaY, 6, mediaH);
      ctx.restore();

      ctx.save();
      roundRect(ctx, padX, mediaY, cardW, mediaH, 32);
      ctx.strokeStyle = hlColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }

    // 4. Tipografia Principal 3D (Headline + Subtítulo)
    ctx.save();
    const textStartY = height * 0.56 + (1 - enterSpring) * 45;
    ctx.font = `900 ${width > 1200 ? '64px' : '58px'} Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const hlLines = wrapTextLines(ctx, headline, cardW - 40).slice(0, 3);
    hlLines.forEach((line, li) => {
      const ly = textStartY + li * 68;
      if (li === hlLines.length - 1) {
        const lw = ctx.measureText(line).width + 44;
        roundRect(ctx, (width - lw) / 2, ly - 6, lw, 66, 16);
        ctx.fillStyle = hlColor;
        ctx.fill();
        ctx.fillStyle = '#04060d';
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.fillText(line, width / 2, ly);
    });

    if (subText) {
      ctx.font = '600 26px Inter, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      const subLines = wrapTextLines(ctx, subText, cardW - 60).slice(0, 2);
      subLines.forEach((sl, si) => {
        ctx.fillText(sl, width / 2, textStartY + hlLines.length * 68 + 18 + si * 34);
      });
    }
    ctx.restore();

    // 5. Legenda Pop Word-by-Word na Zona Inferior (Karaoke Hormozi)
    const words = (scene.text || '').trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const activeWordIdx = Math.min(
        words.length - 1,
        Math.floor(prog * words.length)
      );
      const chunkStart = Math.floor(activeWordIdx / 4) * 4;
      const chunkWords = words.slice(chunkStart, chunkStart + 4);

      const capY = height * 0.82;
      ctx.save();
      roundRect(ctx, padX, capY - 24, cardW, 110, 28);
      ctx.fillStyle = 'rgba(4, 6, 13, 0.82)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '900 42px Inter, sans-serif';
      ctx.textBaseline = 'middle';
      const totalChunkWidth =
        chunkWords.reduce((accW, w) => accW + ctx.measureText(w.toUpperCase()).width + 28, 0);
      let cursorX = (width - totalChunkWidth) / 2;

      chunkWords.forEach((w, wi) => {
        const wUpper = w.toUpperCase();
        const wWidth = ctx.measureText(wUpper).width;
        const isCurrent = chunkStart + wi === activeWordIdx;

        if (isCurrent) {
          roundRect(ctx, cursorX - 10, capY + 2, wWidth + 20, 56, 12);
          ctx.fillStyle = hlColor;
          ctx.fill();
          ctx.fillStyle = '#04060d';
        } else {
          ctx.fillStyle = '#ffffff';
        }

        ctx.textAlign = 'left';
        ctx.fillText(wUpper, cursorX, capY + 30);
        cursorX += wWidth + 28;
      });
      ctx.restore();
    }

    // 6. Barra de Progresso Inferior
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(0, height - 12, width, 12);
    ctx.fillStyle = hlColor;
    ctx.fillRect(0, height - 12, width * (currentTime / totalDuration), 12);
  };

  // Loop de renderização sincronizado
  await new Promise<void>((resolve) => {
    const step = () => {
      const elapsed = (performance.now() - startWallTime) / 1000;
      if (elapsed >= totalDuration) {
        drawSceneFrame(totalDuration - 0.05);
        recorder.stop();
        resolve();
        return;
      }

      drawSceneFrame(elapsed);
      const pct = Math.min(75, Math.round(20 + (elapsed / totalDuration) * 55));
      onProgress?.(
        pct,
        `Renderizando quadros de alta definição (${Math.max(1, Math.ceil(totalDuration - elapsed))}s restantes)...`
      );
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const recordedWebmBlob = await webmBlobPromise;

  onProgress?.(82, 'Codificando arquivo MP4 (H.264 + AAC) via FFmpeg...');

  // Envia o vídeo capturado para o backend FFmpeg converter para MP4 H.264 legítimo
  const formData = new FormData();
  formData.append('video', recordedWebmBlob, 'capture.webm');
  formData.append('narrationText', fullNarrationText);
  formData.append('voiceId', voiceId);

  const mp4Res = await fetch('/api/studio/export-mp4', {
    method: 'POST',
    body: formData,
  });

  if (!mp4Res.ok) {
    throw new Error('Falha na conversão FFmpeg para MP4 H.264.');
  }

  const mp4ArrayBuffer = await mp4Res.arrayBuffer();
  const finalMp4Blob = new Blob([mp4ArrayBuffer], { type: 'video/mp4' });
  const finalUrl = URL.createObjectURL(finalMp4Blob);

  onProgress?.(100, 'Vídeo MP4 H.264 finalizado com sucesso!');
  return { blob: finalMp4Blob, url: finalUrl };
}
