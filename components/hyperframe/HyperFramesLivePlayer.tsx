'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  className?: string;
}

/**
 * Player Oficial HyperFrames (@hyperframes/player)
 * Web Component nativo que roda a composição HTML5 + GSAP 3 com áudio e sincronia determinística
 * Implementação padrão recomendada pela HeyGen e HyperFrames OSS.
 */
export function HyperFramesLivePlayer({
  compositionHtml,
  aspectRatio = '9:16',
  onTimeUpdate,
  onDurationChange,
  className = '',
}: HyperFramesLivePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Importa o web component @hyperframes/player no browser
    import('@hyperframes/player')
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Erro ao registrar @hyperframes/player:', err);
      });
  }, []);

  // Ouve eventos oficiais do HyperFrames Player
  useEffect(() => {
    const el = playerRef.current;
    if (!el) return;

    const handleTimeUpdate = (e: any) => {
      const time = el.currentTime || e.detail || 0;
      onTimeUpdate?.(time);
    };

    const handleReady = (e: any) => {
      const dur = el.duration || e.detail || 0;
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
    <div className={`relative ${aspectClass} rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#04060d] flex items-center justify-center ${className}`}>
      {!isLoaded ? (
        <div className="flex flex-col items-center justify-center gap-2 text-white text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Iniciando HyperFrames Player...</span>
        </div>
      ) : (
        <hyperframes-player
          key={compositionHtml.length}
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
