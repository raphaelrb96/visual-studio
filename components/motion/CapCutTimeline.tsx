'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { TimelineTrack, TrackClip } from '@/types/studio';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Volume2,
  Subtitles,
  Film,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Copy,
  Box,
  GripVertical,
  Layers,
  Sparkles,
  Music,
  Type,
  Video,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  VolumeX,
} from 'lucide-react';

interface CapCutTimelineProps {
  className?: string;
}

export const CapCutTimeline: React.FC<CapCutTimelineProps> = ({ className = '' }) => {
  const {
    manifest,
    isPlaying,
    currentTime,
    selectedSceneId,
    selectedElementId,
    setCurrentTime,
    setIsPlaying,
    getTotalDuration,
    selectScene,
    selectElement,
    addTrack,
    removeTrack,
    addClipToTrack,
    updateClip,
    removeClip,
    moveClip,
    updateScene,
  } = useStudioStore();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Drag livre de clipe (mudança de tempo e de faixa)
  const [draggedClip, setDraggedClip] = useState<{
    clipId: string;
    sourceTrackId: string;
    startX: number;
    initialStartSec: number;
    dur: number;
  } | null>(null);

  // Resize / Trimming de borda de clipe
  const [isResizingClip, setIsResizingClip] = useState<{
    clipId: string;
    edge: 'start' | 'end';
    startX: number;
    initialDur: number;
    initialStartSec: number;
  } | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const totalDuration = Math.max(1, getTotalDuration());

  // Garante que o projeto tenha pistas infinitas inicializadas a partir das cenas existentes
  const initializedTracks = useMemo<TimelineTrack[]>(() => {
    if (manifest.tracks && manifest.tracks.length > 0) {
      return manifest.tracks;
    }

    // Inicializa as faixas padrão se ainda não existirem no manifest
    let acc = 0;
    const motionClips: TrackClip[] = [];
    const mediaClips: TrackClip[] = [];
    const subClips: TrackClip[] = [];
    const audioClips: TrackClip[] = [];

    manifest.scenes.forEach((sc, idx) => {
      const dur = sc.durationSec || 4.5;
      const sceneStart = acc;
      acc += dur;

      const mStart = typeof sc.motionStartSec === 'number' ? sc.motionStartSec : sceneStart + 0.15;
      const mDur = typeof sc.motionDurationSec === 'number' ? sc.motionDurationSec : dur - 0.3;

      const medStart = typeof sc.mediaStartSec === 'number' ? sc.mediaStartSec : sceneStart;
      const medDur = typeof sc.mediaDurationSec === 'number' ? sc.mediaDurationSec : dur + 0.2;

      const sStart = typeof sc.subtitleStartSec === 'number' ? sc.subtitleStartSec : sceneStart + 0.15;
      const sDur = typeof sc.subtitleDurationSec === 'number' ? sc.subtitleDurationSec : dur - 0.25;

      const aStart = typeof sc.audioStartSec === 'number' ? sc.audioStartSec : sceneStart;
      const aDur = typeof sc.audioDurationSec === 'number' ? sc.audioDurationSec : dur;

      motionClips.push({
        id: `3d-${sc.id}`,
        trackId: 'track-motion-1',
        name: `#${idx + 1} ${sc.templateId || 'Motion 3D'}`,
        startSec: mStart,
        durationSec: mDur,
        type: 'motion',
        templateId: sc.templateId,
        color: '#06b6d4',
      });

      mediaClips.push({
        id: `broll-${sc.id}`,
        trackId: 'track-media-1',
        name: `B-Roll #${idx + 1}`,
        startSec: medStart,
        durationSec: medDur,
        type: 'media',
        url: sc.brollImageUrl,
        color: '#6366f1',
      });

      subClips.push({
        id: `sub-${sc.id}`,
        trackId: 'track-sub-1',
        name: sc.text.slice(0, 24),
        startSec: sStart,
        durationSec: sDur,
        type: 'subtitle',
        content: sc.text,
        color: '#f59e0b',
      });

      audioClips.push({
        id: `aud-${sc.id}`,
        trackId: 'track-audio-1',
        name: `Áudio #${idx + 1} (${sc.sfxType || 'impact'})`,
        startSec: aStart,
        durationSec: aDur,
        type: 'audio',
        url: sc.audioUrl,
        color: '#10b981',
      });
    });

    return [
      { id: 'track-motion-1', name: '3D Motion', type: 'motion', color: '#06b6d4', clips: motionClips },
      { id: 'track-media-1', name: 'Mídia B-Roll', type: 'media', color: '#6366f1', clips: mediaClips },
      { id: 'track-sub-1', name: 'Legendas Cinéticas', type: 'subtitle', color: '#f59e0b', clips: subClips },
      { id: 'track-audio-1', name: 'Áudio Neural & SFX', type: 'audio', color: '#10b981', clips: audioClips },
    ];
  }, [manifest.tracks, manifest.scenes]);

  // Teclas de atalho NLE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const store = useStudioStore.getState();
      const dur = Math.max(1, store.getTotalDuration());

      if (e.code === 'Space') {
        e.preventDefault();
        if (!store.isPlaying && store.currentTime >= dur - 0.2) {
          store.setCurrentTime(0);
        }
        store.setIsPlaying(!store.isPlaying);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        store.setCurrentTime(Math.max(0, store.currentTime - (e.shiftKey ? 1.0 : 0.2)));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        store.setCurrentTime(Math.min(dur, store.currentTime + (e.shiftKey ? 1.0 : 0.2)));
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (store.selectedElementId) {
          e.preventDefault();
          store.removeClip(store.selectedElementId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scrubbing da agulha
  const handleScrubMove = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      setCurrentTime(Number((ratio * totalDuration).toFixed(2)));
    },
    [totalDuration, setCurrentTime]
  );

  const handleScrubMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleScrubMove(e.clientX);
  };

  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(Number((ratio * totalDuration).toFixed(2)));
    setIsScrubbing(true);
  };

  useEffect(() => {
    if (!isScrubbing) return;
    const onMouseMove = (e: MouseEvent) => handleScrubMove(e.clientX);
    const onMouseUp = () => setIsScrubbing(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isScrubbing, handleScrubMove]);

  // Arrastar clipe livremente no eixo do tempo (Horizontal Dragging sem restrição)
  useEffect(() => {
    if (!draggedClip || !trackRef.current) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const pixelsPerSecond = rect.width / totalDuration;
      const deltaX = e.clientX - draggedClip.startX;
      const deltaSec = deltaX / pixelsPerSecond;
      const newStartSec = Math.max(0, Number((draggedClip.initialStartSec + deltaSec).toFixed(2)));

      const sceneId = draggedClip.clipId.replace(/^(3d|broll|sub|aud)-/, '');
      const trackType = draggedClip.clipId.startsWith('3d')
        ? 'motion'
        : draggedClip.clipId.startsWith('broll')
        ? 'media'
        : draggedClip.clipId.startsWith('sub')
        ? 'subtitle'
        : 'audio';

      if (manifest.tracks && manifest.tracks.length > 0) {
        updateClip(draggedClip.clipId, { startSec: newStartSec });
      }
      if (trackType === 'motion') updateScene(sceneId, { motionStartSec: newStartSec });
      if (trackType === 'media') updateScene(sceneId, { mediaStartSec: newStartSec });
      if (trackType === 'subtitle') updateScene(sceneId, { subtitleStartSec: newStartSec });
      if (trackType === 'audio') updateScene(sceneId, { audioStartSec: newStartSec });
    };

    const onMouseUp = () => setDraggedClip(null);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggedClip, totalDuration, manifest.tracks, updateClip, updateScene]);

  // Redimensionar / Trimming de duração individual com o mouse
  useEffect(() => {
    if (!isResizingClip || !trackRef.current) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const pixelsPerSecond = rect.width / totalDuration;
      const deltaX = e.clientX - isResizingClip.startX;
      const deltaSec = deltaX / pixelsPerSecond;

      if (isResizingClip.edge === 'end') {
        const newDur = Math.max(0.5, Number((isResizingClip.initialDur + deltaSec).toFixed(2)));
        const sceneId = isResizingClip.clipId.replace(/^(3d|broll|sub|aud)-/, '');
        const trackType = isResizingClip.clipId.startsWith('3d')
          ? 'motion'
          : isResizingClip.clipId.startsWith('broll')
          ? 'media'
          : isResizingClip.clipId.startsWith('sub')
          ? 'subtitle'
          : 'audio';

        if (manifest.tracks && manifest.tracks.length > 0) {
          updateClip(isResizingClip.clipId, { durationSec: newDur });
        }
        if (trackType === 'motion') updateScene(sceneId, { motionDurationSec: newDur });
        if (trackType === 'media') updateScene(sceneId, { mediaDurationSec: newDur });
        if (trackType === 'subtitle') updateScene(sceneId, { subtitleDurationSec: newDur });
        if (trackType === 'audio') updateScene(sceneId, { audioDurationSec: newDur });
      }
    };

    const onMouseUp = () => setIsResizingClip(null);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizingClip, totalDuration, manifest.tracks, updateClip, updateScene]);

  // Ícone por tipo de pista
  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'motion':
        return <Box className="w-3.5 h-3.5 text-cyan-400" />;
      case 'media':
        return <Film className="w-3.5 h-3.5 text-indigo-400" />;
      case 'subtitle':
        return <Subtitles className="w-3.5 h-3.5 text-amber-400" />;
      case 'audio':
        return <Volume2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'sfx':
        return <Music className="w-3.5 h-3.5 text-pink-400" />;
      case 'sticker':
      case 'overlay':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#07090e] border-t border-white/10 select-none ${className}`}>
      {/* BARRA SUPERIOR DE FERRAMENTAS NLE */}
      <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between bg-[#0b0e18] shrink-0">
        {/* Controles de Reprodução */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!isPlaying && currentTime >= totalDuration - 0.2) {
                setCurrentTime(0);
              }
              setIsPlaying(!isPlaying);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-md transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentTime(0)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Voltar ao início"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Adicionar Nova Pista Livre */}
          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => addTrack('motion', 'Motion Extra')}
              className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/40 text-cyan-300 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Adicionar Pista de Motion"
            >
              <Plus className="w-3 h-3" /> + Pista Motion
            </button>
            <button
              type="button"
              onClick={() => addTrack('media', 'B-Roll Extra')}
              className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/40 text-indigo-300 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Adicionar Pista de Mídia"
            >
              <Plus className="w-3 h-3" /> + Pista Mídia
            </button>
            <button
              type="button"
              onClick={() => addTrack('audio', 'SFX / Áudio')}
              className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
              title="Adicionar Pista de Áudio"
            >
              <Plus className="w-3 h-3" /> + Pista Áudio
            </button>
          </div>
        </div>

        {/* Display de Tempo e Zoom */}
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-black/60 border border-white/10 font-mono text-xs">
            <span className="text-cyan-400 font-bold">{currentTime.toFixed(2)}s</span>
            <span className="text-gray-500 mx-1">/</span>
            <span className="text-gray-400">{totalDuration.toFixed(2)}s</span>
          </div>

          <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
              className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-gray-300 px-1.5">{zoomLevel.toFixed(1)}x</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(3.0, Number((z + 0.25).toFixed(2))))}
              className="p-1 hover:bg-white/10 text-gray-400 hover:text-white rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA MULTIPISTA INFINITA NLE */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-2 bg-[#05070e]">
        <div style={{ width: `${zoomLevel * 100}%`, minWidth: '760px' }} className="space-y-1.5 pb-8">
          {/* Régua de Tempo NLE */}
          <div className="flex items-center gap-2">
            <div className="w-32 shrink-0 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider text-right pr-2 flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">{initializedTracks.length} Faixas</span>
              <span>Régua</span>
            </div>
            <div
              onMouseDown={handleRulerMouseDown}
              className="flex-1 h-6 flex items-center justify-between text-[10px] font-mono text-slate-400 px-2 border border-white/10 cursor-pointer bg-black/40 rounded-lg hover:border-slate-700 transition-colors select-none"
            >
              <span>00:00s</span>
              <span>{(totalDuration * 0.2).toFixed(1)}s</span>
              <span>{(totalDuration * 0.4).toFixed(1)}s</span>
              <span>{(totalDuration * 0.6).toFixed(1)}s</span>
              <span>{(totalDuration * 0.8).toFixed(1)}s</span>
              <span>{totalDuration.toFixed(1)}s</span>
            </div>
          </div>

          {/* Container das Faixas Livres */}
          <div className="rounded-2xl bg-[#080b15] p-2 border border-white/10 shadow-inner space-y-2">
            {initializedTracks.map((track, trackIdx) => (
              <div key={track.id} className="flex gap-2 items-center group">
                {/* Cabeçalho da Faixa */}
                <div className="w-32 shrink-0 h-10 px-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-[11px] font-bold select-none truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    {getTrackIcon(track.type)}
                    <span className="text-gray-200 truncate">{track.name}</span>
                  </div>
                  {initializedTracks.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeTrack(track.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 p-0.5 rounded transition-opacity"
                      title="Excluir faixa"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Área da Pista no Eixo do Tempo */}
                <div
                  ref={trackIdx === 0 ? trackRef : undefined}
                  onMouseDown={handleScrubMouseDown}
                  className="flex-1 h-10 relative rounded-xl border border-white/5 bg-slate-950/80 cursor-pointer overflow-hidden"
                >
                  {/* Agulha Playhead Vertical */}
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none shadow-[0_0_12px_rgba(244,63,94,1)]"
                    style={{ left: `${Math.min(100, Math.max(0, (currentTime / totalDuration) * 100))}%` }}
                  />

                  {/* Clipes Livres da Faixa */}
                  {track.clips.map((clip) => {
                    const startSec = clip.startSec || 0;
                    const dur = clip.durationSec || 4;
                    const leftPct = (startSec / totalDuration) * 100;
                    const widthPct = (dur / totalDuration) * 100;
                    const isSelected = selectedElementId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          selectElement(clip.id, clip.type);
                          setDraggedClip({
                            clipId: clip.id,
                            sourceTrackId: track.id,
                            startX: e.clientX,
                            initialStartSec: startSec,
                            dur,
                          });
                        }}
                        className={`absolute top-0.5 bottom-0.5 rounded-lg px-2 flex items-center justify-between overflow-hidden cursor-grab active:cursor-grabbing border select-none transition-shadow ${
                          isSelected
                            ? 'ring-2 ring-white shadow-[0_0_16px_rgba(255,255,255,0.4)] z-20'
                            : 'hover:brightness-125 z-10'
                        }`}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor:
                            clip.type === 'motion'
                              ? 'rgba(6, 182, 212, 0.45)'
                              : clip.type === 'media'
                              ? 'rgba(99, 102, 241, 0.45)'
                              : clip.type === 'subtitle'
                              ? 'rgba(245, 158, 11, 0.45)'
                              : 'rgba(16, 185, 129, 0.45)',
                          borderColor: clip.color || '#38bdf8',
                        }}
                      >
                        {/* Imagem de Fundo se for mídia */}
                        {clip.type === 'media' && clip.url && (
                          <img
                            src={clip.url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                          />
                        )}

                        <div className="flex items-center gap-1 truncate relative z-10">
                          <GripVertical className="w-3 h-3 text-white/50 shrink-0" />
                          <span className="text-[10px] font-mono font-bold text-white truncate">{clip.name}</span>
                        </div>

                        <span className="text-[9px] font-mono bg-black/60 px-1 rounded text-white/80 relative z-10">
                          {dur.toFixed(1)}s
                        </span>

                        {/* Alça de Trimming na Borda Direita */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsResizingClip({
                              clipId: clip.id,
                              edge: 'end',
                              startX: e.clientX,
                              initialDur: dur,
                              initialStartSec: startSec,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-3 hover:bg-white/40 cursor-ew-resize bg-white/10 flex items-center justify-center z-20"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
