'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'hyperframes-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          srcdoc?: string;
          type?: string;
          width?: number | string;
          height?: number | string;
          controls?: boolean;
          muted?: boolean;
          loop?: boolean;
          autoplay?: boolean;
          poster?: string;
          'playback-rate'?: number;
          'audio-src'?: string;
          'audio-locked'?: boolean;
          'shader-loading'?: string;
          'assets-loading-ui'?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface HyperFramesLivePlayerProps {
  compositionHtml: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  audioUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlaybackEnded?: () => void;
  className?: string;
}

/**
 * Player Oficial HyperFrames Pro (@hyperframes/player)
 * Sincronizado bidirecionalmente com a Timeline NLE, reproduzindo GSAP 3 + Áudio Neural
 */
export function HyperFramesLivePlayer({
  compositionHtml,
  aspectRatio = '9:16',
  audioUrl,
  isPlaying = false,
  currentTime = 0,
  onTimeUpdate,
  onDurationChange,
  onPlaybackEnded,
  className = '',
}: HyperFramesLivePlayerProps) {
  const [useIframeFallback, setUseIframeFallback] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevTimeRef = useRef<number>(currentTime);
  const prevPlayingRef = useRef<boolean>(isPlaying);
  const parentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Áudio da narração executado com privilégio nativo na janela mãe para contornar bloqueios de autoplay de iframes
  useEffect(() => {
    if (!audioUrl) return;
    if (!parentAudioRef.current) {
      const a = new Audio(audioUrl);
      parentAudioRef.current = a;
    } else if (parentAudioRef.current.src !== audioUrl) {
      parentAudioRef.current.src = audioUrl;
    }
  }, [audioUrl]);

  useEffect(() => {
    const a = parentAudioRef.current;
    if (!a) return;
    if (isPlaying) {
      if (Math.abs(a.currentTime - currentTime) > 0.3) {
        a.currentTime = currentTime;
      }
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const a = parentAudioRef.current;
    if (!a) return;
    if (!isPlaying && Math.abs(a.currentTime - currentTime) > 0.2) {
      a.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Helper para enviar comandos postMessage ao iframe da composição
  const postToIframe = useCallback((message: any) => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(message, '*');
      } catch (e) {}
    }
  }, []);

  // Ouve mensagens de retorno do GSAP enviadas de dentro do iframe
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'HYPERFRAME_TIME_UPDATE') {
        const t = Number(event.data.currentTime) || 0;
        prevTimeRef.current = t;
        onTimeUpdate?.(t);
      } else if (event.data.type === 'HYPERFRAME_PLAYBACK_ENDED') {
        if (parentAudioRef.current) {
          parentAudioRef.current.pause();
          parentAudioRef.current.currentTime = 0;
        }
        onPlaybackEnded?.();
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [onTimeUpdate, onPlaybackEnded]);

  // Sincroniza Play/Pause externo com o iframe
  useEffect(() => {
    if (isPlaying !== prevPlayingRef.current) {
      prevPlayingRef.current = isPlaying;
      if (isPlaying) {
        postToIframe({ type: 'PLAY_VIDEO' });
      } else {
        postToIframe({ type: 'PAUSE_VIDEO' });
      }
    }
  }, [isPlaying, postToIframe]);

  // Sincroniza Scrubbing / Seek de agulha externo SOMENTE quando NÃO estiver reproduzindo ativamente
  useEffect(() => {
    if (!isPlaying && Math.abs(currentTime - prevTimeRef.current) > 0.1) {
      prevTimeRef.current = currentTime;
      postToIframe({ type: 'SEEK_VIDEO', time: currentTime });
    }
  }, [currentTime, isPlaying, postToIframe]);

  const width = aspectRatio === '16:9' ? 1920 : 1080;
  const height = aspectRatio === '16:9' ? 1080 : 1920;

  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] h-full max-h-[calc(100vh-280px)] w-auto'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9] w-full max-w-[800px] h-auto'
      : 'aspect-square w-[450px] h-[450px]';

  return (
    <div
      className={`relative ${aspectClass} rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#04060d] flex items-center justify-center ${className}`}
      style={{
        aspectRatio: aspectRatio === '9:16' ? '9/16' : aspectRatio === '16:9' ? '16/9' : '1/1',
      }}
    >
      <iframe
        ref={iframeRef}
        key={`${aspectRatio}-${compositionHtml.length}`}
        srcDoc={compositionHtml}
        title="HyperFrames Live Stage"
        sandbox="allow-scripts allow-same-origin"
        allow="autoplay; fullscreen"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#04060d',
          display: 'block',
        }}
      />
    </div>
  );
}
