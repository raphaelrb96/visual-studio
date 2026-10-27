'use client';

import React, { useEffect, useRef } from 'react';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { getPresetById } from '@/lib/presets';
import { CardFrase } from './CardFrase';
import { GraficoPizza } from './GraficoPizza';
import { StatCounter } from './StatCounter';
import { GraficoBarras } from './GraficoBarras';
import { MediaBroll } from './MediaBroll';
import { CTAButton } from './CTAButton';

interface MotionPlayerProps {
  className?: string;
  showWatermark?: boolean;
}

export const MotionPlayer: React.FC<MotionPlayerProps> = ({
  className = '',
  showWatermark = false,
}) => {
  const {
    manifest,
    isPlaying,
    currentTime,
    setCurrentTime,
    setIsPlaying,
    getTotalDuration,
  } = useStudioStore();

  const preset = getPresetById(manifest.presetId);
  const totalDuration = getTotalDuration();
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  // Find active scene & progress within scene
  let accumulatedTime = 0;
  let activeScene = manifest.scenes[0];
  let sceneProgress = 0;

  for (let i = 0; i < manifest.scenes.length; i++) {
    const sc = manifest.scenes[i];
    if (currentTime >= accumulatedTime && currentTime <= accumulatedTime + sc.durationSec) {
      activeScene = sc;
      sceneProgress = (currentTime - accumulatedTime) / sc.durationSec;
      break;
    }
    accumulatedTime += sc.durationSec;
    if (i === manifest.scenes.length - 1) {
      activeScene = sc;
      sceneProgress = 1;
    }
  }

  // 60 FPS Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimestampRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const nextTime = currentTime + delta;
      if (nextTime >= totalDuration) {
        setCurrentTime(0); // Loop back or stop
      } else {
        setCurrentTime(nextTime);
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, totalDuration, setCurrentTime]);

  // Subtitle Renderer
  const renderSubtitles = () => {
    if (!manifest.subtitles.enabled || !activeScene?.text) return null;

    const words = activeScene.text.split(' ');
    const activeWordIndex = Math.min(
      words.length - 1,
      Math.floor(sceneProgress * words.length)
    );

    if (manifest.subtitles.style === 'kinetic_word') {
      return (
        <div className="absolute bottom-10 inset-x-4 z-20 flex justify-center pointer-events-none">
          <div className="px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl flex flex-wrap justify-center gap-1.5 max-w-[90%] text-center">
            {words.map((w, idx) => {
              const isActive = idx === activeWordIndex;
              return (
                <span
                  key={idx}
                  className={`text-sm md:text-base font-extrabold transition-all duration-150 ${
                    isActive
                      ? 'scale-110'
                      : 'opacity-40 text-white'
                  }`}
                  style={{
                    color: isActive ? preset.theme.highlightTextColor : undefined,
                    textShadow: isActive ? `0 0 15px ${preset.theme.highlightTextColor}` : undefined,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    if (manifest.subtitles.style === 'karaoke_highlight') {
      return (
        <div className="absolute bottom-10 inset-x-6 z-20 flex justify-center pointer-events-none">
          <div className="relative overflow-hidden px-4 py-2 rounded-xl bg-black/70 border border-white/20 text-center">
            <span className="text-sm font-black tracking-wide text-white drop-shadow">
              {activeScene.text}
            </span>
            <div
              className="absolute left-0 top-0 bottom-0 bg-yellow-400/25 transition-all duration-100"
              style={{ width: `${sceneProgress * 100}%` }}
            />
          </div>
        </div>
      );
    }

    // Classic bottom
    return (
      <div className="absolute bottom-6 inset-x-4 z-20 flex justify-center pointer-events-none">
        <div className="px-4 py-1.5 rounded-lg bg-black/90 text-white text-xs md:text-sm font-semibold max-w-[85%] text-center leading-relaxed">
          {activeScene.text}
        </div>
      </div>
    );
  };

  // Render Component inside Canvas
  const renderVisualComponent = () => {
    if (!activeScene) return null;

    const props = {
      ...activeScene.componentProps,
      text: activeScene.text,
      preset,
      progress: sceneProgress,
    };

    switch (activeScene.componentType) {
      case 'CardFrase':
        return <CardFrase {...props} />;
      case 'GraficoPizza':
        return <GraficoPizza {...props} />;
      case 'StatCounter':
        return <StatCounter {...props} />;
      case 'GraficoBarras':
        return <GraficoBarras {...props} />;
      case 'MediaBroll':
        return <MediaBroll {...props} />;
      case 'CTAButton':
        return <CTAButton {...props} />;
      default:
        return <CardFrase {...props} />;
    }
  };

  // Aspect ratio classes for responsive scaling
  const getAspectClass = () => {
    switch (manifest.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] w-full max-w-[340px] md:max-w-[380px]';
      case '16:9':
        return 'aspect-[16/9] w-full max-w-[680px]';
      case '1:1':
      default:
        return 'aspect-square w-full max-w-[420px]';
    }
  };

  return (
    <div className={`flex items-center justify-center relative ${className}`}>
      {/* Phone/Canvas Frame */}
      <div
        className={`relative overflow-hidden rounded-3xl shadow-2xl border-4 border-slate-800 flex flex-col justify-between transition-all duration-300 ${getAspectClass()}`}
        style={{
          backgroundColor: preset.theme.backgroundColor,
          fontFamily: preset.theme.fontFamily,
        }}
      >
        {/* Ambient Grid overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Glow Orb in background */}
        <div
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-25 pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: preset.theme.highlightTextColor }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: preset.theme.highlightTextColor }}
        />

        {/* Header indicator inside canvas */}
        <div className="relative z-10 w-full p-4 flex items-center justify-between text-[11px] font-mono tracking-wider opacity-60">
          <span className="flex items-center gap-1.5" style={{ color: preset.theme.primaryTextColor }}>
            <span className="w-2 h-2 rounded-full animate-ping bg-emerald-500" />
            CENA #{activeScene ? activeScene.sceneIndex + 1 : 1}
          </span>
          <span style={{ color: preset.theme.primaryTextColor }}>
            {manifest.aspectRatio} • 60 FPS
          </span>
        </div>

        {/* Main Visual Centerpiece */}
        <div className="relative z-10 flex-1 flex items-center justify-center w-full px-2">
          {renderVisualComponent()}
        </div>

        {/* Subtitles Overlay */}
        {renderSubtitles()}

        {/* Watermark (optional) */}
        {showWatermark && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none bg-black/60 px-2 py-1 rounded text-[10px] text-white/70 font-mono">
            Visual Studio
          </div>
        )}
      </div>
    </div>
  );
};
