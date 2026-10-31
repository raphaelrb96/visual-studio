'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { getPresetById } from '@/lib/presets';
import { soundEngine } from '@/lib/sound-effects';
import { CardFrase } from './CardFrase';
import { GraficoPizza } from './GraficoPizza';
import { StatCounter } from './StatCounter';
import { GraficoBarras } from './GraficoBarras';
import { MediaBroll } from './MediaBroll';
import { CTAButton } from './CTAButton';
import { TweetCard } from './TweetCard';
import { NewsHeadline } from './NewsHeadline';
import { ChatSimulation } from './ChatSimulation';
import { QuoteCard } from './QuoteCard';
import { VersusComparison } from './VersusComparison';
import { Object3DShowcase } from './Object3DShowcase';
import { CollageBroll } from './CollageBroll';
import { Volume2, VolumeX } from 'lucide-react';

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
  const lastSceneIdRef = useRef<string | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  let accumulatedTime = 0;
  let activeScene = manifest.scenes[0];
  let sceneProgress = 0;
  let sceneElapsedSec = 0;

  for (let i = 0; i < manifest.scenes.length; i++) {
    const sc = manifest.scenes[i];
    if (currentTime >= accumulatedTime && currentTime <= accumulatedTime + sc.durationSec) {
      activeScene = sc;
      sceneElapsedSec = currentTime - accumulatedTime;
      sceneProgress = Math.min(1, Math.max(0, sceneElapsedSec / sc.durationSec));
      break;
    }
    accumulatedTime += sc.durationSec;
    if (i === manifest.scenes.length - 1) {
      activeScene = sc;
      sceneElapsedSec = sc.durationSec;
      sceneProgress = 1;
    }
  }

  useEffect(() => {
    if (!isPlaying || !activeScene) {
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
      return;
    }

    if (lastSceneIdRef.current !== activeScene.id) {
      lastSceneIdRef.current = activeScene.id;

      if (!isMuted) {
        soundEngine.playSfx(activeScene.sfxType || 'whoosh', 0.22);
      }

      if (voiceAudioRef.current) voiceAudioRef.current.pause();

      if (activeScene.audioUrl && !isMuted) {
        const audio = new Audio(activeScene.audioUrl);
        audio.volume = 1.0;
        audio.playbackRate = 1.08;
        voiceAudioRef.current = audio;
        audio.play().catch(() => {});
      } else if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(activeScene.text);
        utter.lang = 'pt-BR';
        utter.rate = 1.15;
        window.speechSynthesis.speak(utter);
      }
    }
  }, [activeScene?.id, isPlaying, isMuted]);

  useEffect(() => {
    if (!isPlaying) {
      lastSceneIdRef.current = null;
      if (voiceAudioRef.current) voiceAudioRef.current.pause();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
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
        setIsPlaying(false);
        setCurrentTime(0);
      } else {
        setCurrentTime(nextTime);
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentTime, totalDuration, setCurrentTime, setIsPlaying]);

  const renderSubtitles = () => {
    if (!manifest.subtitles.enabled || !activeScene?.text) return null;

    const words = activeScene.text.trim().split(/\s+/);
    let activeWordIndex = Math.min(
      words.length - 1,
      Math.floor(sceneProgress * words.length)
    );

    if (activeScene.wordTimestamps && activeScene.wordTimestamps.length === words.length) {
      const foundIdx = activeScene.wordTimestamps.findIndex(
        (wt: any) => sceneElapsedSec >= wt.startSec && sceneElapsedSec <= wt.endSec
      );
      if (foundIdx !== -1) activeWordIndex = foundIdx;
    }

    const chunkSize = 4;
    const currentChunkIndex = Math.floor(activeWordIndex / chunkSize);
    const chunkStart = currentChunkIndex * chunkSize;
    const visibleWords = words.slice(chunkStart, chunkStart + chunkSize);

    return (
      <div className="absolute bottom-8 inset-x-3 z-30 flex justify-center pointer-events-none">
        <div className="px-4 py-2.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex flex-wrap justify-center items-center gap-2 max-w-[94%] text-center">
          {visibleWords.map((w: string, idx: number) => {
            const globalWordIdx = chunkStart + idx;
            const isCurrent = globalWordIdx === activeWordIndex;
            const isPast = globalWordIdx < activeWordIndex;

            return (
              <span
                key={globalWordIdx}
                className={`text-base md:text-lg font-black uppercase tracking-tight transition-all duration-100 inline-block ${
                  isCurrent
                    ? 'scale-115 -translate-y-0.5 px-2 py-0.5 rounded-lg'
                    : isPast
                    ? 'text-white opacity-95'
                    : 'text-white/50'
                }`}
                style={{
                  backgroundColor: isCurrent ? `${preset.theme.highlightTextColor}28` : undefined,
                  color: isCurrent ? preset.theme.highlightTextColor : undefined,
                  textShadow: isCurrent
                    ? `0 0 20px ${preset.theme.highlightTextColor}, 0 2px 4px rgba(0,0,0,0.9)`
                    : '0 2px 6px rgba(0,0,0,0.9)',
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderVisualComponent = () => {
    if (!activeScene) return null;

    const collageImgs =
      activeScene.collageImages && activeScene.collageImages.length > 0
        ? activeScene.collageImages
        : activeScene.componentProps?.images;

    const props = {
      ...activeScene.componentProps,
      images: collageImgs,
      object3d:
        activeScene.hyperframeConfig?.threeJsObject ||
        activeScene.componentProps?.object3d ||
        'coin',
      text: activeScene.text,
      preset,
      progress: sceneProgress,
    };

    switch (activeScene.componentType) {
      case 'Object3DShowcase':
        return <Object3DShowcase {...props} />;
      case 'CollageBroll':
        return <CollageBroll {...props} />;
      case 'TweetCard':
        return <TweetCard {...props} />;
      case 'NewsHeadline':
        return <NewsHeadline {...props} />;
      case 'ChatSimulation':
        return <ChatSimulation {...props} />;
      case 'QuoteCard':
        return <QuoteCard {...props} />;
      case 'VersusComparison':
        return <VersusComparison {...props} />;
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

  const getAspectClass = () => {
    switch (manifest.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] w-full max-w-[330px] md:max-w-[365px]';
      case '16:9':
        return 'aspect-[16/9] w-full max-w-[660px]';
      case '1:1':
      default:
        return 'aspect-square w-full max-w-[400px]';
    }
  };

  const kenBurnsScale = 1.04 + sceneProgress * 0.14;
  const kenBurnsTranslateY = (0.5 - sceneProgress) * 14;

  return (
    <div className={`flex items-center justify-center relative ${className}`}>
      <div
        className={`relative overflow-hidden rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-[5px] border-slate-800/90 flex flex-col justify-between transition-all duration-300 ${getAspectClass()}`}
        style={{
          backgroundColor: preset.theme.backgroundColor,
          fontFamily: preset.theme.fontFamily,
        }}
      >
        {activeScene?.brollImageUrl && (
          <img
            key={`img-${activeScene.id}`}
            src={activeScene.brollImageUrl}
            alt="Cena de Fundo"
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-cover opacity-45 pointer-events-none transition-transform duration-100 ease-linear"
            style={{
              transform: `scale(${kenBurnsScale}) translateY(${kenBurnsTranslateY}px)`,
            }}
          />
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(6,9,17,0.82) 0%, rgba(6,9,17,0.45) 45%, rgba(6,9,17,0.92) 100%)`,
          }}
        />

        <div
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[90px] opacity-35 pointer-events-none"
          style={{ backgroundColor: preset.theme.highlightTextColor }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[90px] opacity-30 pointer-events-none"
          style={{ backgroundColor: preset.theme.highlightTextColor }}
        />

        <div className="relative z-30 pt-3 px-3 flex gap-1.5">
          {manifest.scenes.map((sc: any, idx: number) => {
            const isActive = sc.id === activeScene?.id;
            const isCompleted = idx < (activeScene?.sceneIndex || 0);
            return (
              <div key={sc.id} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: isCompleted ? '100%' : isActive ? `${sceneProgress * 100}%` : '0%',
                    backgroundColor: preset.theme.highlightTextColor,
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="relative z-30 w-full px-4 pt-2 flex items-center justify-between text-[11px] font-mono tracking-wider">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/90 font-bold">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: preset.theme.highlightTextColor }}
            />
            {activeScene?.componentType || 'HYPERFRAME'} • CENA {activeScene ? activeScene.sceneIndex + 1 : 1}/{manifest.scenes.length}
          </span>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/15 transition-colors"
            title={isMuted ? 'Ativar voz e efeitos' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        <div className="relative z-20 flex-1 flex items-center justify-center w-full px-2 pb-12">
          {renderVisualComponent()}
        </div>

        {renderSubtitles()}

        {showWatermark && (
          <div className="absolute top-12 right-4 z-20 pointer-events-none bg-black/60 px-2 py-0.5 rounded text-[10px] text-white/70 font-mono">
            Visual Studio
          </div>
        )}
      </div>
    </div>
  );
};
