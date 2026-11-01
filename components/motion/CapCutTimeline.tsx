'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { ScriptScene } from '@/types/studio';
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
    selectedElementType,
    setCurrentTime,
    setIsPlaying,
    getTotalDuration,
    selectScene,
    selectElement,
    addScene,
    removeScene,
    updateScene,
    setScenes,
  } = useStudioStore();

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggedClip, setDraggedClip] = useState<{
    sceneId: string;
    trackType: 'motion' | 'media' | 'subtitle' | 'audio';
    startX: number;
    initialStartSec: number;
  } | null>(null);

  const [isResizingClip, setIsResizingClip] = useState<{
    sceneId: string;
    trackType: 'motion' | 'media' | 'subtitle' | 'audio';
    edge: 'start' | 'end';
    startX: number;
    initialDur: number;
    initialStartSec: number;
  } | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const totalDuration = Math.max(1, getTotalDuration());

  // Calcula os offsets acumulados padrão para cada cena
  const sceneOffsets = useMemo(() => {
    let acc = 0;
    const map: Record<string, { startSec: number; durationSec: number }> = {};
    manifest.scenes.forEach((sc) => {
      map[sc.id] = {
        startSec: acc,
        durationSec: sc.durationSec || 4.5,
      };
      acc += sc.durationSec || 4.5;
    });
    return map;
  }, [manifest.scenes]);

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
        if (store.selectedSceneId && store.manifest.scenes.length > 1) {
          e.preventDefault();
          store.removeScene(store.selectedSceneId);
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

  // Arrastar clipe livremente no eixo do tempo (Horizontal Dragging)
  useEffect(() => {
    if (!draggedClip || !trackRef.current) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const pixelsPerSecond = rect.width / totalDuration;
      const deltaX = e.clientX - draggedClip.startX;
      const deltaSec = deltaX / pixelsPerSecond;
      const newStart = Math.max(0, Math.min(totalDuration - 1.0, Number((draggedClip.initialStartSec + deltaSec).toFixed(2))));

      if (draggedClip.trackType === 'motion') {
        updateScene(draggedClip.sceneId, { motionStartSec: newStart });
      } else if (draggedClip.trackType === 'media') {
        updateScene(draggedClip.sceneId, { mediaStartSec: newStart });
      } else if (draggedClip.trackType === 'subtitle') {
        updateScene(draggedClip.sceneId, { subtitleStartSec: newStart });
      } else if (draggedClip.trackType === 'audio') {
        updateScene(draggedClip.sceneId, { audioStartSec: newStart });
      }
    };

    const onMouseUp = () => setDraggedClip(null);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggedClip, totalDuration, updateScene]);

  // Redimensionar clipe individualmente (Trimming por borda)
  useEffect(() => {
    if (!isResizingClip || !trackRef.current) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const pixelsPerSecond = rect.width / totalDuration;
      const deltaX = e.clientX - isResizingClip.startX;
      const deltaSec = deltaX / pixelsPerSecond;

      if (isResizingClip.edge === 'end') {
        const newDur = Math.max(0.8, Math.min(18.0, Number((isResizingClip.initialDur + deltaSec).toFixed(1))));
        if (isResizingClip.trackType === 'motion') {
          updateScene(isResizingClip.sceneId, { motionDurationSec: newDur });
        } else if (isResizingClip.trackType === 'media') {
          updateScene(isResizingClip.sceneId, { mediaDurationSec: newDur });
        } else if (isResizingClip.trackType === 'subtitle') {
          updateScene(isResizingClip.sceneId, { subtitleDurationSec: newDur });
        } else if (isResizingClip.trackType === 'audio') {
          updateScene(isResizingClip.sceneId, { audioDurationSec: newDur });
        }
      }
    };

    const onMouseUp = () => setIsResizingClip(null);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizingClip, totalDuration, updateScene]);

  // Dividir cena ativa no playhead
  const handleSplitActiveScene = () => {
    const targetId = selectedSceneId || manifest.scenes[0]?.id;
    const idx = manifest.scenes.findIndex((s) => s.id === targetId);
    if (idx === -1) return;
    const current = manifest.scenes[idx];

    let accumulated = 0;
    for (let i = 0; i < idx; i++) {
      accumulated += manifest.scenes[i].durationSec;
    }
    const relativeTime = currentTime - accumulated;
    const splitPoint =
      relativeTime > 1.0 && relativeTime < current.durationSec - 1.0
        ? Number(relativeTime.toFixed(1))
        : Number((current.durationSec / 2).toFixed(1));

    if (current.durationSec < 2.0) {
      alert('A cena selecionada é muito curta para ser dividida (mínimo 2.0s).');
      return;
    }

    const firstDur = splitPoint;
    const secondDur = Number((current.durationSec - splitPoint).toFixed(1));
    const words = current.text.split(' ');
    const halfWords = Math.max(1, Math.floor((words.length * (firstDur / current.durationSec))));

    const updatedCurrent: ScriptScene = {
      ...current,
      durationSec: firstDur,
      text: words.slice(0, halfWords).join(' ') || current.text,
      compiledCustomHtml: undefined,
      compiledGsapScript: undefined,
    };

    const clonedSecondHalf: ScriptScene = {
      ...current,
      id: `scene-split-${Date.now()}`,
      sceneIndex: idx + 1,
      durationSec: secondDur,
      text: words.slice(halfWords).join(' ') || current.text,
      compiledCustomHtml: undefined,
      compiledGsapScript: undefined,
    };

    const nextScenes = [...manifest.scenes];
    nextScenes.splice(idx, 1, updatedCurrent, clonedSecondHalf);
    setScenes(nextScenes.map((s, i) => ({ ...s, sceneIndex: i })));
    selectScene(clonedSecondHalf.id);
  };

  return (
    <div className={`bg-[#0a0d18] border-t border-white/10 flex flex-col select-none p-3 ${className}`}>
      {/* Barra de Ferramentas Superior da Timeline */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Play / Pause Principal */}
          <button
            type="button"
            onClick={() => {
              if (!isPlaying && currentTime >= totalDuration - 0.2) {
                setCurrentTime(0);
              }
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-black'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pausar' : 'Play'}</span>
          </button>

          {/* Resetar para o Início */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            title="Voltar ao início (0s)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Dividir Clipe */}
          <button
            type="button"
            onClick={handleSplitActiveScene}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-cyan-500/20"
            title="Dividir cena na agulha"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Dividir</span>
          </button>

          {/* Adicionar Cena */}
          <button
            type="button"
            onClick={() => addScene()}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Bloco</span>
          </button>

          {/* Excluir Cena */}
          <button
            type="button"
            disabled={manifest.scenes.length <= 1}
            onClick={() => selectedSceneId && removeScene(selectedSceneId)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Timecode Digital & Zoom */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-black/60 border border-white/10 font-mono text-xs font-bold text-cyan-400 flex items-center gap-1">
            <span>{currentTime.toFixed(2)}s</span>
            <span className="text-gray-500">/</span>
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

      {/* ÁREA MULTIPISTA COM LARGURA DINÂMICA */}
      <div className="space-y-2 relative overflow-x-auto pb-1 mt-2">
        <div style={{ width: `${zoomLevel * 100}%`, minWidth: '720px' }} className="space-y-2">
          {/* Régua de Tempo */}
          <div className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider text-right pr-2">
              Régua
            </span>
            <div
              onMouseDown={handleRulerMouseDown}
              className="flex-1 h-6 flex items-center justify-between text-[10px] font-mono text-slate-400 px-2 border border-white/10 cursor-pointer bg-black/40 rounded-lg hover:border-slate-700 transition-colors"
            >
              <span>00:00s</span>
              <span>{(totalDuration * 0.25).toFixed(1)}s</span>
              <span>{(totalDuration * 0.5).toFixed(1)}s</span>
              <span>{(totalDuration * 0.75).toFixed(1)}s</span>
              <span>{totalDuration.toFixed(1)}s</span>
            </div>
          </div>

          {/* Container das Pistas */}
          <div className="rounded-2xl bg-[#05070e] p-2.5 border border-white/10 shadow-inner">
            <div className="flex gap-2">
              {/* Rótulos Laterais das Faixas */}
              <div className="w-24 shrink-0 space-y-2 select-none pt-0.5">
                <div className="h-10 flex items-center text-[10px] font-bold text-cyan-400 uppercase tracking-wider gap-1">
                  <Box className="w-3.5 h-3.5" /> 3D Motion
                </div>
                <div className="h-11 flex items-center text-[10px] font-bold text-indigo-400 uppercase tracking-wider gap-1">
                  <Film className="w-3.5 h-3.5" /> Mídia B-Roll
                </div>
                <div className="h-8 flex items-center text-[10px] font-bold text-amber-400 uppercase tracking-wider gap-1">
                  <Subtitles className="w-3.5 h-3.5" /> Legendas
                </div>
                <div className="h-8 flex items-center text-[10px] font-bold text-emerald-400 uppercase tracking-wider gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> Áudio Neural
                </div>
              </div>

              {/* Área das 4 Pistas Livres */}
              <div
                ref={trackRef}
                onMouseDown={handleScrubMouseDown}
                className="flex-1 relative space-y-2 cursor-pointer"
              >
                {/* Agulha Playhead Vertical */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none shadow-[0_0_12px_rgba(244,63,94,1)]"
                  style={{ left: `${Math.min(100, Math.max(0, (currentTime / totalDuration) * 100))}%` }}
                >
                  <div className="w-3.5 h-3.5 bg-rose-500 rounded-full -ml-[6px] -mt-1 border-2 border-white" />
                </div>

                {/* PISTA 1: 3D MOTION LIVRE (POSIÇÃO & DURAÇÃO INDEPENDENTES) */}
                <div className="h-10 relative rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-950/80">
                  {manifest.scenes.map((sc, idx) => {
                    const fallback = sceneOffsets[sc.id] || { startSec: 0, durationSec: 4.5 };
                    const startSec = typeof sc.motionStartSec === 'number' ? sc.motionStartSec : fallback.startSec;
                    const dur = typeof sc.motionDurationSec === 'number' ? sc.motionDurationSec : fallback.durationSec;
                    const leftPct = (startSec / totalDuration) * 100;
                    const widthPct = (dur / totalDuration) * 100;
                    const isSelected = selectedElementId === `3d-${sc.id}` || selectedSceneId === sc.id;

                    return (
                      <div
                        key={`3d-${sc.id}`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          selectElement(`3d-${sc.id}`, 'motion');
                          selectScene(sc.id);
                          setDraggedClip({
                            sceneId: sc.id,
                            trackType: 'motion',
                            startX: e.clientX,
                            initialStartSec: startSec,
                          });
                        }}
                        className={`absolute top-0 bottom-0 rounded-lg px-2 flex items-center justify-between overflow-hidden cursor-grab active:cursor-grabbing border ${
                          isSelected
                            ? 'bg-cyan-600/50 border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.6)] z-20'
                            : 'bg-cyan-950/60 border-cyan-500/30 hover:bg-cyan-900/60 z-10'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <GripVertical className="w-3 h-3 text-cyan-400/60 shrink-0" />
                          <span className="text-[10px] font-mono font-bold text-cyan-200 truncate">
                            #{idx + 1} {sc.templateId || 'Motion'}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono bg-black/60 px-1 rounded text-cyan-300">
                          {dur.toFixed(1)}s
                        </span>
                        {/* Alça de Trimming */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsResizingClip({
                              sceneId: sc.id,
                              trackType: 'motion',
                              edge: 'end',
                              startX: e.clientX,
                              initialDur: dur,
                              initialStartSec: startSec,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 hover:bg-cyan-400 cursor-ew-resize bg-cyan-500/30 flex items-center justify-center"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* PISTA 2: B-ROLL MÍDIA LIVRE */}
                <div className="h-11 relative rounded-xl overflow-hidden border border-indigo-500/20 bg-slate-950/80">
                  {manifest.scenes.map((sc, idx) => {
                    const fallback = sceneOffsets[sc.id] || { startSec: 0, durationSec: 4.5 };
                    const startSec = typeof sc.mediaStartSec === 'number' ? sc.mediaStartSec : fallback.startSec;
                    const dur = typeof sc.mediaDurationSec === 'number' ? sc.mediaDurationSec : fallback.durationSec;
                    const leftPct = (startSec / totalDuration) * 100;
                    const widthPct = (dur / totalDuration) * 100;
                    const isSelected = selectedElementId === `broll-${sc.id}`;

                    return (
                      <div
                        key={`broll-${sc.id}`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          selectElement(`broll-${sc.id}`, 'broll');
                          selectScene(sc.id);
                          setDraggedClip({
                            sceneId: sc.id,
                            trackType: 'media',
                            startX: e.clientX,
                            initialStartSec: startSec,
                          });
                        }}
                        className={`absolute top-0 bottom-0 rounded-lg p-1.5 flex items-center justify-between overflow-hidden cursor-grab active:cursor-grabbing border ${
                          isSelected
                            ? 'bg-indigo-600/50 border-indigo-400 ring-2 ring-indigo-400 shadow-[0_0_16px_rgba(129,140,248,0.6)] z-20'
                            : 'bg-indigo-950/60 border-indigo-500/30 hover:bg-indigo-900/60 z-10'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        {sc.brollImageUrl && (
                          <img
                            src={sc.brollImageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                          />
                        )}
                        <div className="relative z-10 truncate">
                          <span className="text-[10px] font-mono text-white font-bold block truncate">
                            Mídia #{idx + 1}
                          </span>
                        </div>
                        <span className="relative z-10 text-[9px] font-mono bg-black/60 px-1 rounded text-indigo-300">
                          {dur.toFixed(1)}s
                        </span>
                        {/* Alça de Trimming */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsResizingClip({
                              sceneId: sc.id,
                              trackType: 'media',
                              edge: 'end',
                              startX: e.clientX,
                              initialDur: dur,
                              initialStartSec: startSec,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 hover:bg-indigo-400 cursor-ew-resize bg-indigo-500/30 flex items-center justify-center"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* PISTA 3: LEGENDAS LIVRES */}
                <div className="h-8 relative rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950/80">
                  {manifest.scenes.map((sc, idx) => {
                    const fallback = sceneOffsets[sc.id] || { startSec: 0, durationSec: 4.5 };
                    const startSec = typeof sc.subtitleStartSec === 'number' ? sc.subtitleStartSec : fallback.startSec;
                    const dur = typeof sc.subtitleDurationSec === 'number' ? sc.subtitleDurationSec : fallback.durationSec;
                    const leftPct = (startSec / totalDuration) * 100;
                    const widthPct = (dur / totalDuration) * 100;
                    const isSelected = selectedElementId === `sub-${sc.id}`;

                    return (
                      <div
                        key={`sub-${sc.id}`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          selectElement(`sub-${sc.id}`, 'subtitle');
                          selectScene(sc.id);
                          setDraggedClip({
                            sceneId: sc.id,
                            trackType: 'subtitle',
                            startX: e.clientX,
                            initialStartSec: startSec,
                          });
                        }}
                        className={`absolute top-0 bottom-0 rounded-lg px-2 flex items-center justify-between text-[10px] font-bold truncate cursor-grab active:cursor-grabbing border ${
                          isSelected
                            ? 'bg-amber-500/50 text-amber-200 border-amber-300 ring-2 ring-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] z-20'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30 hover:bg-amber-900/60 z-10'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        <span className="truncate">&ldquo;{sc.text.slice(0, 24)}...&rdquo;</span>
                        {/* Alça de Trimming */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsResizingClip({
                              sceneId: sc.id,
                              trackType: 'subtitle',
                              edge: 'end',
                              startX: e.clientX,
                              initialDur: dur,
                              initialStartSec: startSec,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 hover:bg-amber-400 cursor-ew-resize bg-amber-500/30 flex items-center justify-center"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* PISTA 4: ÁUDIO NEURAL & SFX LIVRES */}
                <div className="h-8 relative rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950/80">
                  {manifest.scenes.map((sc, idx) => {
                    const fallback = sceneOffsets[sc.id] || { startSec: 0, durationSec: 4.5 };
                    const startSec = typeof sc.audioStartSec === 'number' ? sc.audioStartSec : fallback.startSec;
                    const dur = typeof sc.audioDurationSec === 'number' ? sc.audioDurationSec : fallback.durationSec;
                    const leftPct = (startSec / totalDuration) * 100;
                    const widthPct = (dur / totalDuration) * 100;
                    const isSelected = selectedElementId === `aud-${sc.id}`;

                    return (
                      <div
                        key={`aud-${sc.id}`}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          selectElement(`aud-${sc.id}`, 'audio');
                          selectScene(sc.id);
                          setDraggedClip({
                            sceneId: sc.id,
                            trackType: 'audio',
                            startX: e.clientX,
                            initialStartSec: startSec,
                          });
                        }}
                        className={`absolute top-0 bottom-0 rounded-lg px-2 flex items-center justify-between text-[10px] font-mono truncate cursor-grab active:cursor-grabbing border ${
                          isSelected
                            ? 'bg-emerald-500/50 text-emerald-200 border-emerald-300 ring-2 ring-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.6)] z-20'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60 z-10'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      >
                        <span className="truncate">Áudio #{idx + 1} ({sc.sfxType || 'impact'})</span>
                        <span className="text-emerald-400">♫</span>
                        {/* Alça de Trimming */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsResizingClip({
                              sceneId: sc.id,
                              trackType: 'audio',
                              edge: 'end',
                              startX: e.clientX,
                              initialDur: dur,
                              initialStartSec: startSec,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2.5 hover:bg-emerald-400 cursor-ew-resize bg-emerald-500/30 flex items-center justify-center"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
