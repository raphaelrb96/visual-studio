'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Project } from '@revideo/core';
import { Player, Stage, getFullPreviewSettings, Vector2 } from '@revideo/core';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Loader2 } from 'lucide-react';

interface RevideoLivePreviewProps {
  project: Project;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

/**
 * Player Oficial do Revideo com Renderização Canvas 2D Direta
 * Utiliza o motor puro do @revideo/core (Stage e Player) renderizando em 60 FPS
 * Sem dependência do CSS Tailwind v4 do player-react que conflita com o PostCSS.
 */
export function RevideoLivePreview({
  project,
  aspectRatio = '9:16',
}: RevideoLivePreviewProps) {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const stageRef = useRef<Stage | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Inicializa o motor do Revideo (Stage e Player)
  useEffect(() => {
    if (!canvasContainerRef.current || !project) return;

    let isSubscribed = true;
    setIsReady(false);

    try {
      // Cria o Stage gráfico e obtém o Canvas oficial do Revideo
      const stage = new Stage();
      stageRef.current = stage;
      const canvas = stage.finalBuffer;
      canvas.className = 'w-full h-full object-contain block select-none pointer-events-none';

      // Limpa container e injeta o canvas oficial do Revideo
      canvasContainerRef.current.innerHTML = '';
      canvasContainerRef.current.appendChild(canvas);

      // Instancia o Player oficial com o projeto Revideo
      const player = new Player(project);
      playerRef.current = player;
      player.toggleLoop(true);

      const defaultSettings = getFullPreviewSettings(project);
      const width = aspectRatio === '16:9' ? 1920 : 1080;
      const height = aspectRatio === '16:9' ? 1080 : 1920;

      stage.configure({
        ...defaultSettings,
        size: new Vector2(width, height),
        resolutionScale: 1,
      });

      player.activate();

      // Render loop conectado ao Stage oficial
      const onRenderCallback = async () => {
        if (!isSubscribed) return;
        try {
          await stage.render(player.playback.currentScene, player.playback.previousScene);
          const fps = player.playback.fps || 60;
          const time = player.playback.frame / fps;
          const dur = player.playback.duration / fps;
          setCurrentTime(time);
          if (dur > 0) setDuration(dur);
        } catch (renderErr) {
          console.warn('Frame render:', renderErr);
        }
      };

      player.onRender.subscribe(onRenderCallback);

      // Renderiza o primeiro frame imediatamente para exibição
      player.requestSeek(0);
      setIsReady(true);

      return () => {
        isSubscribed = false;
        player.onRender.unsubscribe(onRenderCallback);
        player.togglePlayback(false);
        player.deactivate();
      };
    } catch (err) {
      console.error('Erro ao inicializar Revideo Engine:', err);
    }
  }, [project, aspectRatio]);

  // Controle de Play/Pause
  const togglePlay = () => {
    if (!playerRef.current) return;
    const nextState = !isPlaying;
    playerRef.current.togglePlayback(nextState);
    setIsPlaying(nextState);
  };

  // Seek na Timeline
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = ratio * duration;
    const targetFrame = Math.round(targetSeconds * playerRef.current.playback.fps);
    playerRef.current.requestSeek(targetFrame);
    setCurrentTime(targetSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const containerClass =
    aspectRatio === '9:16'
      ? 'w-[330px] sm:w-[370px] h-[580px] sm:h-[650px]'
      : aspectRatio === '16:9'
      ? 'w-full max-w-[800px] h-[450px]'
      : 'w-[450px] h-[450px]';

  return (
    <div className="flex flex-col items-center select-none">
      {/* Moldura do Vídeo com Canvas Nativo do Revideo */}
      <div
        className={`relative ${containerClass} rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black flex items-center justify-center group`}
      >
        {/* Container do Canvas 2D renderizado pelo Stage do Revideo */}
        <div ref={canvasContainerRef} className="w-full h-full flex items-center justify-center" />

        {/* Loading inicial do motor */}
        {!isReady && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-2 text-white text-xs font-semibold">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            Compilando Projeto Revideo 2D...
          </div>
        )}

        {/* Overlay de Play no Centro (quando pausado) */}
        {!isPlaying && isReady && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity cursor-pointer z-30"
          >
            <div className="w-16 h-16 rounded-full bg-white/95 text-black flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
              <Play className="w-7 h-7 ml-1 fill-black" />
            </div>
          </button>
        )}

        {/* Barra de Controles Inferior NLE */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex flex-col gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
          {/* Barra de Progresso com Scrubber */}
          <div
            onClick={handleSeek}
            className="w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all"
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-75"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
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
                  if (playerRef.current) {
                    playerRef.current.requestSeek(0);
                    setCurrentTime(0);
                  }
                }}
                className="hover:text-white transition-colors p-1"
                title="Reiniciar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (playerRef.current) {
                    playerRef.current.playback.currentScene?.adjustVolume(isMuted ? 1 : 0);
                  }
                }}
                className="hover:text-white transition-colors p-1"
                title={isMuted ? 'Ativar Som' : 'Mutar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="font-mono text-[11px] text-white/70">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-bold">
                Revideo Engine 60fps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
