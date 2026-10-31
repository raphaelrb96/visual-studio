'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Sparkles } from 'lucide-react';

export interface StudioScene {
  id: string;
  sceneIndex: number;
  durationSec: number;
  text: string;
  headline?: string;
  subText?: string;
  highlightWord?: string;
  brollUrl: string;
  visualPrompt?: string;
  audioUrl?: string;
}

interface CinemaVideoPlayerProps {
  scenes: StudioScene[];
  aspectRatio?: '9:16' | '16:9' | '1:1';
  voiceId?: string;
  captionStyle?: 'hormozi' | 'neon' | 'clean';
  ambientMusicUrl?: string;
  ambientVolume?: number;
  onSceneChange?: (index: number) => void;
  activeSceneIndex?: number;
}

export function CinemaVideoPlayer({
  scenes,
  aspectRatio = '9:16',
  voiceId = 'antonio',
  captionStyle = 'hormozi',
  ambientMusicUrl = '',
  ambientVolume = 0.12,
  onSceneChange,
  activeSceneIndex: controlledIndex,
}: CinemaVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0); // 0 a 1 na cena atual
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sincroniza caso venha controlado externamente pela lista de cenas
  useEffect(() => {
    if (controlledIndex !== undefined && controlledIndex !== currentIndex && controlledIndex >= 0 && controlledIndex < scenes.length) {
      setCurrentIndex(controlledIndex);
      setSceneProgress(0);
      setActiveWordIndex(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        }
      }
    }
  }, [controlledIndex, scenes.length]);

  const currentScene = scenes[currentIndex] || scenes[0];

  // Palavras da narração da cena atual
  const words = (currentScene?.text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Áudio da cena atual via TTS Neural
  const currentAudioUrl =
    currentScene?.audioUrl ||
    `/api/tts?text=${encodeURIComponent(currentScene?.text || '')}&voice=${encodeURIComponent(voiceId)}`;

  // Atualiza áudio quando troca de cena
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = currentAudioUrl;
    audioRef.current.currentTime = 0;
    if (isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentIndex, currentAudioUrl]);

  // Controle de Play/Pause do Áudio e Trilha
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (musicRef.current) musicRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (musicRef.current && ambientMusicUrl) {
            musicRef.current.volume = isMuted ? 0 : ambientVolume;
            musicRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('Erro ao reproduzir áudio neural:', err);
          setIsPlaying(true); // Se o browser bloquear áudio por autoplay, ainda avança visualmente
        });
    }
  };

  // Monitora progresso do áudio da cena para sincronizar as palavras e avançar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const dur = audio.duration || currentScene?.durationSec || 5.0;
      const cur = audio.currentTime;
      const progress = Math.min(1, Math.max(0, cur / dur));
      setSceneProgress(progress);

      // Calcula palavra ativa no momento exato
      if (words.length > 0) {
        const wordIdx = Math.min(words.length - 1, Math.floor(progress * words.length));
        setActiveWordIndex(wordIdx);
      }
    };

    const handleEnded = () => {
      // Avança para a próxima cena ou encerra
      if (currentIndex < scenes.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setSceneProgress(0);
        setActiveWordIndex(0);
        onSceneChange?.(nextIdx);
      } else {
        setIsPlaying(false);
        setCurrentIndex(0);
        setSceneProgress(0);
        setActiveWordIndex(0);
        onSceneChange?.(0);
        if (musicRef.current) musicRef.current.pause();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, scenes.length, words.length, currentScene?.durationSec, onSceneChange]);

  // Se o áudio não estiver tocando (ex: erro de rede), usa timer de fallback
  useEffect(() => {
    if (!isPlaying) return;
    if (audioRef.current && !audioRef.current.paused) return;

    const interval = setInterval(() => {
      setSceneProgress((prev) => {
        const step = 0.1 / (currentScene?.durationSec || 5.0);
        const next = prev + step;
        if (words.length > 0) {
          setActiveWordIndex(Math.min(words.length - 1, Math.floor(next * words.length)));
        }
        if (next >= 1) {
          if (currentIndex < scenes.length - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            onSceneChange?.(nextIdx);
            return 0;
          } else {
            setIsPlaying(false);
            setCurrentIndex(0);
            onSceneChange?.(0);
            return 0;
          }
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, scenes.length, currentScene?.durationSec, words.length, onSceneChange]);

  // Formatação de tempo
  const totalDuration = scenes.reduce((acc, s) => acc + (s.durationSec || 5), 0);
  const currentTotalTime =
    scenes.slice(0, currentIndex).reduce((acc, s) => acc + (s.durationSec || 5), 0) +
    sceneProgress * (currentScene?.durationSec || 5);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * totalDuration;

    let accum = 0;
    for (let i = 0; i < scenes.length; i++) {
      const dur = scenes[i].durationSec || 5;
      if (accum + dur >= targetTime) {
        setCurrentIndex(i);
        onSceneChange?.(i);
        const sceneTime = targetTime - accum;
        const progress = sceneTime / dur;
        setSceneProgress(progress);
        if (audioRef.current) {
          audioRef.current.currentTime = sceneTime;
        }
        break;
      }
      accum += dur;
    }
  };

  // Proporções do Container
  const aspectClass =
    aspectRatio === '9:16'
      ? 'w-[340px] sm:w-[380px] h-[600px] sm:h-[670px]'
      : aspectRatio === '16:9'
      ? 'w-full max-w-[800px] h-[450px]'
      : 'w-[450px] h-[450px]';

  return (
    <div className="flex flex-col items-center select-none">
      {/* Elementos de Áudio Ocultos */}
      <audio ref={audioRef} preload="auto" playsInline muted={isMuted} />
      {ambientMusicUrl && (
        <audio
          ref={musicRef}
          src={ambientMusicUrl}
          preload="auto"
          loop
          muted={isMuted}
        />
      )}

      {/* Frame Principal do Vídeo */}
      <div
        ref={containerRef}
        className={`relative ${aspectClass} rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black group`}
      >
        {/* Camada 1: Background Cinematográfico com Movimento Contínuo (Ken Burns) */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            key={currentScene?.brollUrl || currentScene?.id}
            src={currentScene?.brollUrl}
            alt="Cena"
            className="w-full h-full object-cover transition-transform duration-[6000ms] ease-out will-change-transform"
            style={{
              transform: isPlaying ? 'scale(1.12) translate(-1%, -1%)' : 'scale(1.0)',
            }}
          />

          {/* Vinheta Escura de Cinema e Máscara para Legendas */}
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />
        </div>

        {/* Camada 2: Badge / Indicador Superior Discreto */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
            Cena {currentIndex + 1} / {scenes.length}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/80 backdrop-blur-md text-white flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3 h-3" />
            {(currentScene?.durationSec || 5).toFixed(1)}s
          </span>
        </div>

        {/* Camada 3: Legendas Dinâmicas Sincronizadas Palavra por Palavra (Estilo Hormozi / CapCut) */}
        <div className="absolute inset-x-4 bottom-20 flex flex-col items-center justify-center text-center z-20 pointer-events-none px-2">
          {words.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 max-w-[94%]">
              {words.map((word, wIdx) => {
                const isCurrent = wIdx === activeWordIndex;
                const isPast = wIdx < activeWordIndex;

                let wordStyle = 'text-white/60 font-bold';
                if (isCurrent) {
                  if (captionStyle === 'neon') {
                    wordStyle =
                      'text-emerald-400 font-black scale-110 drop-shadow-[0_4px_16px_rgba(52,211,153,0.8)]';
                  } else if (captionStyle === 'clean') {
                    wordStyle =
                      'text-white font-black scale-105 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]';
                  } else {
                    // Hormozi Gold
                    wordStyle =
                      'text-yellow-400 font-black scale-110 drop-shadow-[0_4px_20px_rgba(250,204,21,0.9)]';
                  }
                } else if (isPast) {
                  wordStyle = 'text-white font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
                }

                return (
                  <span
                    key={wIdx}
                    className={`inline-block uppercase tracking-wider text-lg sm:text-2xl transition-all duration-150 ${wordStyle}`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Overlay de Play no Centro (ao pausar) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer z-30"
          >
            <div className="w-16 h-16 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
              <Play className="w-7 h-7 ml-1 fill-black" />
            </div>
          </button>
        )}

        {/* Barra de Controles Inferior do Vídeo */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex flex-col gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Barra de Progresso com Scrubber */}
          <div
            onClick={handleSeek}
            className="w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all"
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-100"
              style={{
                width: `${(currentTotalTime / (totalDuration || 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/80">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="hover:text-white transition-colors p-1"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setSceneProgress(0);
                  setActiveWordIndex(0);
                  if (audioRef.current) audioRef.current.currentTime = 0;
                  onSceneChange?.(0);
                }}
                className="hover:text-white transition-colors p-1"
                title="Reiniciar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-white transition-colors p-1"
                title={isMuted ? 'Ativar Som' : 'Mutar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="font-mono text-[11px] text-white/70">
                {formatTime(currentTotalTime)} / {formatTime(totalDuration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (containerRef.current?.requestFullscreen) {
                    containerRef.current.requestFullscreen();
                  }
                }}
                className="hover:text-white transition-colors p-1"
                title="Tela Cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
