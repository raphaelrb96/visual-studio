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
  isPlaying = false,
  currentTime = 0,
  onTimeUpdate,
  onDurationChange,
  onPlaybackEnded,
  className = '',
}: HyperFramesLivePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const playerRef = useRef<any>(null);
  const prevTimeRef = useRef<number>(currentTime);
  const prevPlayingRef = useRef<boolean>(isPlaying);

  // Importa o web component @hyperframes/player no browser
  useEffect(() => {
    import('@hyperframes/player')
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Erro ao registrar @hyperframes/player:', err);
      });
  }, []);

  // Helper para enviar comandos postMessage ao iframe interno da composição
  const postToIframe = useCallback((message: any) => {
    const el = playerRef.current;
    if (!el) return;
    try {
      // 1. Tenta acessar via shadowRoot do hyperframes-player
      const iframe = el.shadowRoot?.querySelector('iframe') || el.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, '*');
        return;
      }
    } catch (e) {}

    // 2. Tenta método nativo do elemento se existir
    try {
      if (message.type === 'PLAY_VIDEO' && typeof el.play === 'function') {
        el.play();
      } else if (message.type === 'PAUSE_VIDEO' && typeof el.pause === 'function') {
        el.pause();
      } else if (message.type === 'SEEK_VIDEO' && typeof el.seek === 'function') {
        el.seek(message.time);
      }
    } catch (e) {}
  }, []);

  // Ouve mensagens de retorno enviadas de dentro do iframe (onUpdate do GSAP)
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'HYPERFRAME_TIME_UPDATE') {
        const t = Number(event.data.currentTime) || 0;
        onTimeUpdate?.(t);
      } else if (event.data.type === 'HYPERFRAME_PLAYBACK_ENDED') {
        onPlaybackEnded?.();
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => {
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [onTimeUpdate, onPlaybackEnded]);

  // Sincroniza Play/Pause externo com o Player e o Iframe
  useEffect(() => {
    if (isPlaying !== prevPlayingRef.current) {
      prevPlayingRef.current = isPlaying;
      const el = playerRef.current;
      if (isPlaying) {
        if (el && typeof el.play === 'function') {
          try { el.play(); } catch (e) {}
        }
        postToIframe({ type: 'PLAY_VIDEO' });
      } else {
        if (el && typeof el.pause === 'function') {
          try { el.pause(); } catch (e) {}
        }
        postToIframe({ type: 'PAUSE_VIDEO' });
      }
    }
  }, [isPlaying, postToIframe]);

  // Sincroniza Scrubbing / Seek de agulha externo
  useEffect(() => {
    if (Math.abs(currentTime - prevTimeRef.current) > 0.08) {
      prevTimeRef.current = currentTime;
      const el = playerRef.current;
      if (el) {
        if (typeof el.seek === 'function') {
          try { el.seek(currentTime); } catch (e) {}
        } else if ('currentTime' in el) {
          try { el.currentTime = currentTime; } catch (e) {}
        }
      }
      postToIframe({ type: 'SEEK_VIDEO', time: currentTime });
    }
  }, [currentTime, postToIframe]);

  // Ouve eventos do próprio Custom Element do HyperFrames
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;

    const handleTimeUpdate = (e: any) => {
      const time = el.currentTime ?? e.detail ?? 0;
      onTimeUpdate?.(time);
    };

    const handleReady = (e: any) => {
      const dur = el.duration ?? e.detail?.duration ?? 0;
      if (dur > 0) onDurationChange?.(dur);
    };

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('ready', handleReady);
    el.addEventListener('durationchange', handleReady);

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('ready', handleReady);
      el.removeEventListener('durationchange', handleReady);
    };
  }, [isLoaded, onTimeUpdate, onDurationChange]);

  const width = aspectRatio === '16:9' ? 1920 : 1080;
  const height = aspectRatio === '16:9' ? 1080 : 1920;

  const aspectClass =
    aspectRatio === '9:16'
      ? 'w-[330px] sm:w-[370px] h-[580px] sm:h-[650px]'
      : aspectRatio === '16:9'
      ? 'w-full max-w-[800px] h-[450px]'
      : 'w-[450px] h-[450px]';

  return (
    <div
      className={`relative ${aspectClass} rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#04060d] flex items-center justify-center ${className}`}
    >
      {!isLoaded ? (
        <div className="flex flex-col items-center justify-center gap-2 text-white text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Iniciando HyperFrames Player...</span>
        </div>
      ) : (
        <hyperframes-player
          key={`${aspectRatio}-${compositionHtml.length}`}
          ref={playerRef}
          srcdoc={compositionHtml}
          controls
          loop
          width={width}
          height={height}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            backgroundColor: '#04060d',
          }}
        />
      )}
    </div>
  );
}
