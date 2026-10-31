'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { buildMasterVideoHtml, CompiledSceneData } from '@/lib/motion-compiler';
import { soundEngine } from '@/lib/sound-effects';
import { SfxType } from '@/types/studio';

interface MotionStagePlayerProps {
  projectId: string;
  title: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  scenes: CompiledSceneData[];
  currentTimeSec: number;
  isPlaying: boolean;
  isMuted: boolean;
  sfxEnabled?: boolean;
  bgMusicUrl?: string;
  bgMusicVolume?: number;
  className?: string;
}

/**
 * MotionStagePlayer
 * Palco Determinístico de Resolução Fixa (1080x1920 / 1920x1080 / 1080x1080)
 * Executa a Master Timeline GSAP 3 + SVG + Karaoke Word-by-Word + Voz Neural + SFX a 60 FPS
 * sem jamais alterar o tamanho do quadro entre cenas.
 */
export const MotionStagePlayer: React.FC<MotionStagePlayerProps> = ({
  projectId,
  title,
  aspectRatio = '9:16',
  scenes,
  currentTimeSec,
  isPlaying,
  isMuted,
  sfxEnabled = true,
  bgMusicUrl,
  bgMusicVolume = 0.15,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastTriggeredSceneRef = useRef<number>(-1);

  const [scale, setScale] = useState(0.28);

  const internalWidth = aspectRatio === '16:9' ? 1920 : 1080;
  const internalHeight = aspectRatio === '16:9' ? 1080 : aspectRatio === '1:1' ? 1080 : 1920;

  // Compila o HTML5 + GSAP Master Document sempre que a estrutura das cenas mudar
  const masterHtml = useMemo(() => {
    return buildMasterVideoHtml({
      projectId,
      title,
      aspectRatio,
      scenes,
    });
  }, [projectId, title, aspectRatio, scenes]);

  // Calcula tempos de início/fim de cada cena na timeline global
  const sceneRanges = useMemo(() => {
    let acc = 0;
    return scenes.map((sc, idx) => {
      const start = acc;
      const dur = Number(sc.durationSec) || 4.5;
      acc += dur;
      return { idx, start, end: acc, scene: sc };
    });
  }, [scenes]);

  // ResizeObserver para manter escala matematicamente cravada sem variar tamanho
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setScale(rect.width / internalWidth);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [internalWidth, aspectRatio]);

  // Seek determinístico a 60 FPS na Master Timeline GSAP dentro do palco
  useEffect(() => {
    const win = iframeRef.current?.contentWindow as any;
    if (!win) return;

    if (typeof win.seekToTime === 'function') {
      win.seekToTime(currentTimeSec);
    } else {
      win.postMessage({ type: 'SEEK_VIDEO', time: currentTimeSec }, '*');
    }
  }, [currentTimeSec, masterHtml]);

  // Sincronização de Voz Neural (TTS), Efeitos Sonoros (SFX) e Música de Fundo
  useEffect(() => {
    const activeRange =
      sceneRanges.find((r) => currentTimeSec >= r.start && currentTimeSec < r.end) ||
      sceneRanges[0];

    if (!activeRange) return;

    if (!isPlaying) {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
      }
      lastTriggeredSceneRef.current = -1;
      return;
    }

    // Dispara transição de nova cena (SFX + Áudio da locução da cena)
    if (lastTriggeredSceneRef.current !== activeRange.idx) {
      lastTriggeredSceneRef.current = activeRange.idx;

      if (!isMuted && sfxEnabled && activeRange.scene.sfx && activeRange.scene.sfx !== 'none') {
        soundEngine.playSfx(activeRange.scene.sfx as SfxType, 0.25);
      }

      if (voiceAudioRef.current) {
        const targetUrl =
          activeRange.scene.audioUrl ||
          `/api/tts?text=${encodeURIComponent(activeRange.scene.text)}&lang=pt-BR`;

        if (voiceAudioRef.current.src !== window.location.origin + targetUrl && voiceAudioRef.current.src !== targetUrl) {
          voiceAudioRef.current.src = targetUrl;
        }
        voiceAudioRef.current.muted = isMuted;
        voiceAudioRef.current.currentTime = Math.max(0, currentTimeSec - activeRange.start);
        voiceAudioRef.current.play().catch(() => {});
      }
    }

    if (voiceAudioRef.current) {
      voiceAudioRef.current.muted = isMuted;
    }

    if (bgMusicAudioRef.current && bgMusicUrl) {
      bgMusicAudioRef.current.muted = isMuted;
      bgMusicAudioRef.current.volume = bgMusicVolume;
      if (bgMusicAudioRef.current.paused) {
        bgMusicAudioRef.current.play().catch(() => {});
      }
    }
  }, [currentTimeSec, isPlaying, isMuted, sfxEnabled, sceneRanges, bgMusicUrl, bgMusicVolume]);

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-[16/9] w-full max-w-[780px]'
      : aspectRatio === '1:1'
      ? 'aspect-square h-full max-h-[540px]'
      : 'aspect-[9/16] h-full max-h-[68vh]';

  return (
    <div
      ref={containerRef}
      className={`relative ${aspectClass} rounded-2xl overflow-hidden bg-[#04060d] border-2 border-slate-800/90 shadow-[0_25px_70px_rgba(0,0,0,0.85)] select-none shrink-0 ${className}`}
    >
      <iframe
        ref={iframeRef}
        title={title || 'Motion Stage'}
        srcDoc={masterHtml}
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => {
          const win = iframeRef.current?.contentWindow as any;
          if (win && typeof win.seekToTime === 'function') {
            win.seekToTime(currentTimeSec);
          }
        }}
        style={{
          width: `${internalWidth}px`,
          height: `${internalHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          border: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Elementos de Áudio Ocultos Sincronizados */}
      <audio ref={voiceAudioRef} preload="auto" />
      {bgMusicUrl && <audio ref={bgMusicAudioRef} src={bgMusicUrl} loop preload="auto" />}
    </div>
  );
};
