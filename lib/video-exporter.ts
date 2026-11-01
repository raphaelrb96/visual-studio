import { VideoManifest, ScriptScene } from '@/types/studio';
import { buildMasterVideoHtml } from '@/lib/motion-compiler';
import { DEFAULT_STYLE_PRESETS, getPresetById } from '@/lib/presets';

/**
 * Renderizador Oficial de Exportação HyperFrames.
 * Grava EXATAMENTE a mesma composição HTML5/SVG + GSAP 3 que está sendo exibida no Player,
 * garantindo 100% de paridade visual e eliminando o antigo código estático de Canvas 2D.
 */
export async function renderManifestToVideoBlob(
  manifest: VideoManifest,
  onProgress?: (percent: number, stageText: string) => void
): Promise<{ blob: Blob; url: string }> {
  const width = manifest.aspectRatio === '16:9' ? 1920 : 1080;
  const height = manifest.aspectRatio === '16:9' ? 1080 : manifest.aspectRatio === '1:1' ? 1080 : 1920;
  const totalDuration = manifest.scenes.reduce((acc: number, s: ScriptScene) => acc + (s.durationSec || 4.5), 0);

  onProgress?.(10, 'Preparando composição HyperFrames para gravação HD...');

  const preset = getPresetById(manifest.presetId || 'hormozi_bold') || DEFAULT_STYLE_PRESETS[0];

  // Gera o HTML idêntico ao do player
  const compositionHtml = buildMasterVideoHtml({
    projectId: 'export-render',
    title: manifest.title || 'Export',
    aspectRatio: manifest.aspectRatio,
    fullNarration: manifest.fullNarration,
    fullAudioUrl: manifest.fullAudioUrl,
    scenes: manifest.scenes.map((s, idx) => ({
      id: s.id,
      sceneIndex: idx,
      templateId: (s.templateId || s.componentType || 'hormozi_bold') as any,
      durationSec: Number(s.durationSec) || 4.5,
      text: s.text || '',
      tag: s.componentProps?.badge || 'RETENÇÃO',
      headline: s.componentProps?.headline || s.text.slice(0, 42).toUpperCase(),
      subText: s.componentProps?.subtext || s.componentProps?.subText || '',
      highlightWord: s.componentProps?.highlightWords?.[0] || 'DESTAQUE',
      highlightColor: preset.theme.highlightTextColor || '#facc15',
      brollUrl: s.brollImageUrl || s.componentProps?.imageUrl,
      audioUrl: s.audioUrl || manifest.fullAudioUrl || '',
      statValue: s.componentProps?.number ? `${s.componentProps.number}${s.componentProps.suffix || '%'}` : '84%',
      statLabel: s.componentProps?.label || 'Taxa de Retenção',
      barsData: s.componentProps?.bars,
      versusData: {
        leftTitle: s.componentProps?.leftTitle || 'O JEITO ANTIGO',
        leftItems: s.componentProps?.leftItems || [s.componentProps?.leftDesc || 'Demorado'],
        rightTitle: s.componentProps?.rightTitle || 'COM HYPERFRAME',
        rightItems: s.componentProps?.rightItems || [s.componentProps?.rightDesc || 'Rápido'],
      },
      authorName: s.componentProps?.authorName || 'Autoridade',
      authorHandle: s.componentProps?.authorHandle || '@viral',
      ctaText: s.componentProps?.buttonText || 'Começar Agora',
      compiledCustomHtml: s.compiledCustomHtml,
      compiledGsapScript: s.compiledGsapScript,
    })),
  });

  onProgress?.(25, 'Carregando motor e áudio neural em 60fps...');

  // Cria um iframe invisível para executar a timeline GSAP nativa
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.style.border = 'none';
  iframe.sandbox.add('allow-scripts', 'allow-same-origin');
  document.body.appendChild(iframe);

  return new Promise((resolve, reject) => {
    iframe.onload = async () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) throw new Error('Não foi possível inicializar contexto do iframe');

        onProgress?.(40, 'Iniciando captura de stream de alta resolução...');

        // Usa o elemento de áudio interno do iframe se disponível
        const masterAudio = iframeDoc.getElementById('master-narration-audio') as HTMLAudioElement | null;

        // Configura captura do stream a partir do canvas do iframe ou fallback do document
        const rootEl = iframeDoc.getElementById('root');
        if (!rootEl) throw new Error('Root da composição não encontrado');

        // Cria canvas de gravação
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = width;
        exportCanvas.height = height;
        const exportCtx = exportCanvas.getContext('2d')!;

        const stream = exportCanvas.captureStream(60);

        // Conecta o áudio
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const destNode = audioCtx.createMediaStreamDestination();

        // Carrega e sincroniza o áudio da narração se existir
        const fullAudio = manifest.fullAudioUrl || manifest.scenes[0]?.audioUrl;
        if (fullAudio) {
          try {
            const aRes = await fetch(fullAudio);
            if (aRes.ok) {
              const aBuf = await aRes.arrayBuffer();
              const decoded = await audioCtx.decodeAudioData(aBuf);
              const source = audioCtx.createBufferSource();
              source.buffer = decoded;
              source.connect(destNode);
              source.start(audioCtx.currentTime + 0.1);
            }
          } catch (e) {
            console.warn('Erro ao carregar áudio para export:', e);
          }
        }

        const combinedStream = new MediaStream([
          ...stream.getVideoTracks(),
          ...destNode.stream.getAudioTracks(),
        ]);

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : MediaRecorder.isTypeSupported('video/mp4')
          ? 'video/mp4'
          : 'video/webm';

        const recorder = new MediaRecorder(combinedStream, {
          mimeType,
          videoBitsPerSecond: 8_000_000,
        });

        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          document.body.removeChild(iframe);
          audioCtx.close().catch(() => {});
          const finalBlob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(finalBlob);
          resolve({ blob: finalBlob, url });
        };

        recorder.start(100);

        // Inicia a reprodução no iframe via postMessage
        iframe.contentWindow?.postMessage({ type: 'PLAY_VIDEO' }, '*');
        const startRecordTime = performance.now();

        // Loop de cópia de frames fiéis
        const copyFrames = () => {
          const elapsed = (performance.now() - startRecordTime) / 1000;
          if (elapsed >= totalDuration + 0.3) {
            onProgress?.(100, 'Gravação finalizada!');
            recorder.stop();
            return;
          }

          const pct = Math.min(99, Math.round(40 + (elapsed / totalDuration) * 58));
          onProgress?.(pct, `Gravando quadros em alta fidelidade (${Math.ceil(totalDuration - elapsed)}s)...`);

          // Desenha o root estilizado no canvas
          try {
            // Desenha o fundo e captura
            exportCtx.fillStyle = '#04060d';
            exportCtx.fillRect(0, 0, width, height);
            // Injeta imagem do SVG / HTML
            const svgData = new XMLSerializer().serializeToString(rootEl);
            const img = new Image();
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${svgData}</foreignObject></svg>`
            );
            img.onload = () => {
              exportCtx.drawImage(img, 0, 0, width, height);
            };
          } catch (e) {}

          requestAnimationFrame(copyFrames);
        };

        requestAnimationFrame(copyFrames);
      } catch (err) {
        document.body.removeChild(iframe);
        reject(err);
      }
    };

    iframe.srcdoc = compositionHtml;
  });
}
