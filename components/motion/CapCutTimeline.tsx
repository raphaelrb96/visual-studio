'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MoveLeft,
  MoveRight,
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
    reorderScenes,
  } = useStudioStore();

  const totalDuration = getTotalDuration() || 20;
  const trackRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Estados de Trimming / Redimensionamento de duração da cena arrastando as bordas
  const [isResizing, setIsResizing] = useState<{
    sceneId: string;
    edge: 'start' | 'end';
    startX: number;
    initialDur: number;
  } | null>(null);

  // Estados de Drag & Drop para reordenar cenas livremente
  const [draggedSceneIndex, setDraggedSceneIndex] = useState<number | null>(null);

  // Atalhos profissionais de teclado (Space = Play/Pause, Setas = Seek, Delete = Excluir)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignora se estiver digitando em campos de texto
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(Math.max(0, currentTime - (e.shiftKey ? 1.0 : 0.2)));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(Math.min(totalDuration, currentTime + (e.shiftKey ? 1.0 : 0.2)));
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedSceneId && manifest.scenes.length > 1) {
          e.preventDefault();
          removeScene(selectedSceneId);
        }
      } else if (e.key === 'k' || e.key === 'K') {
        setIsPlaying(!isPlaying);
      } else if (e.key === 'j' || e.key === 'J') {
        setCurrentTime(Math.max(0, currentTime - 1.0));
      } else if (e.key === 'l' || e.key === 'L') {
        setCurrentTime(Math.min(totalDuration, currentTime + 1.0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, totalDuration, selectedSceneId, manifest.scenes.length, setIsPlaying, setCurrentTime, removeScene]);

  // Scrubbing suave por clique ou arraste
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

  // Manipulador de Trimming (arrastar borda direita para aumentar ou diminuir a duração da cena)
  const handleStartResize = (
    e: React.MouseEvent,
    sceneId: string,
    edge: 'start' | 'end',
    initialDur: number
  ) => {
    e.stopPropagation();
    setIsResizing({
      sceneId,
      edge,
      startX: e.clientX,
      initialDur,
    });
  };

  useEffect(() => {
    if (!isResizing || !trackRef.current) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = trackRef.current!.getBoundingClientRect();
      const pixelsPerSecond = rect.width / totalDuration;
      const deltaX = e.clientX - isResizing.startX;
      const deltaSec = deltaX / pixelsPerSecond;

      const newDur = Math.max(1.8, Math.min(18.0, Number((isResizing.initialDur + deltaSec).toFixed(1))));
      updateScene(isResizing.sceneId, { durationSec: newDur });
    };

    const onMouseUp = () => {
      setIsResizing(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, totalDuration, updateScene]);

  // Cortar / Dividir a cena atual na posição exata da agulha playhead
  const handleSplitActiveScene = () => {
    const targetId = selectedSceneId || manifest.scenes[0]?.id;
    const idx = manifest.scenes.findIndex((s: ScriptScene) => s.id === targetId);
    if (idx === -1) return;
    const current = manifest.scenes[idx];

    // Calcula onde a agulha está em relação ao início desta cena
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
    const textPart1 = words.slice(0, halfWords).join(' ') || current.text;
    const textPart2 = words.slice(halfWords).join(' ') || current.text;

    const updatedCurrent: ScriptScene = {
      ...current,
      durationSec: firstDur,
      text: textPart1,
      compiledCustomHtml: undefined,
      compiledGsapScript: undefined,
    };

    const clonedSecondHalf: ScriptScene = {
      ...current,
      id: `scene-split-${Date.now()}`,
      sceneIndex: idx + 1,
      durationSec: secondDur,
      text: textPart2,
      compiledCustomHtml: undefined,
      compiledGsapScript: undefined,
    };

    const nextScenes = [...manifest.scenes];
    nextScenes.splice(idx, 1, updatedCurrent, clonedSecondHalf);
    const reindexed = nextScenes.map((s, i) => ({ ...s, sceneIndex: i }));
    setScenes(reindexed);
    selectScene(clonedSecondHalf.id);
  };

  // Duplicar cena selecionada
  const handleDuplicateScene = () => {
    const targetId = selectedSceneId || manifest.scenes[0]?.id;
    const idx = manifest.scenes.findIndex((s: ScriptScene) => s.id === targetId);
    if (idx === -1) return;
    const current = manifest.scenes[idx];
    const copy: ScriptScene = {
      ...current,
      id: `scene-dup-${Date.now()}`,
      sceneIndex: idx + 1,
    };
    const nextScenes = [...manifest.scenes];
    nextScenes.splice(idx + 1, 0, copy);
    setScenes(nextScenes.map((s, i) => ({ ...s, sceneIndex: i })));
    selectScene(copy.id);
  };

  // Mover cena selecionada para a esquerda ou direita
  const handleMoveScene = (direction: -1 | 1) => {
    const targetId = selectedSceneId || manifest.scenes[0]?.id;
    const idx = manifest.scenes.findIndex((s: ScriptScene) => s.id === targetId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= manifest.scenes.length) return;
    reorderScenes(idx, targetIdx);
  };

  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <div
      className={`h-full flex flex-col justify-between bg-[#080b14] border border-white/10 rounded-2xl shadow-2xl p-3 sm:p-4 select-none overflow-hidden ${className}`}
    >
      {/* BARRA DE FERRAMENTAS PROFISSIONAL NLE (ESTILO CAPCUT PRO / PREMIERE) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botão Play / Pause com feedback neon */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-white shadow-lg flex items-center gap-2 text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
            title="Play / Pause (Barra de Espaço)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Resetar / Voltar ao Início */}
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            title="Voltar ao início"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-[1px] bg-white/10 mx-1" />

          {/* Dividir (Split) na Agulha */}
          <button
            type="button"
            onClick={handleSplitActiveScene}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500 text-slate-200 flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm"
            title="Cortar cena na agulha (Split)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dividir</span>
          </button>

          {/* Mover Cena selecionada para esquerda / direita */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => handleMoveScene(-1)}
              className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              title="Mover cena para a esquerda"
            >
              <MoveLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleMoveScene(1)}
              className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border-l border-slate-700"
              title="Mover cena para a direita"
            >
              <MoveRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Duplicar Cena */}
          <button
            type="button"
            onClick={handleDuplicateScene}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 text-xs font-semibold transition-colors"
            title="Duplicar cena selecionada"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Duplicar</span>
          </button>

          {/* Adicionar Cena */}
          <button
            type="button"
            onClick={() => addScene()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 text-xs font-bold transition-all"
            title="Adicionar nova cena à timeline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Cena</span>
          </button>

          {/* Excluir Cena */}
          <button
            type="button"
            onClick={() => selectedSceneId && removeScene(selectedSceneId)}
            disabled={manifest.scenes.length <= 1}
            className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-colors"
            title="Excluir cena selecionada (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Dica Rápida de Atalho */}
          <span className="hidden md:inline-block text-[11px] text-gray-500 font-mono">
            Espaço: Play • Arraste as bordas para esticar/encurtar
          </span>

          {/* Timecode Digital Preciso */}
          <div className="px-3 py-1.5 rounded-xl bg-black/80 border border-slate-800 font-mono text-xs font-black text-cyan-400 flex items-center gap-1">
            <span>{currentTime.toFixed(2)}s</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">{totalDuration.toFixed(2)}s</span>
          </div>

          {/* Zoom da Timeline */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 px-1.5">{zoomLevel.toFixed(1)}x</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(3.0, Number((z + 0.25).toFixed(2))))}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA MULTIPISTA COM SCROLL E LARGURA DINÂMICA */}
      <div className="space-y-2 relative overflow-x-auto pb-1 mt-1">
        <div style={{ width: `${zoomLevel * 100}%`, minWidth: '720px' }} className="space-y-2">
          {/* Régua de Tempo Interativa */}
          <div
            onClick={handleScrubMouseDown}
            className="h-6 flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 border-b border-slate-800/80 cursor-pointer bg-slate-950/40 rounded-t-lg"
          >
            <span>00:00s</span>
            <span>{(totalDuration * 0.2).toFixed(1)}s</span>
            <span>{(totalDuration * 0.4).toFixed(1)}s</span>
            <span>{(totalDuration * 0.6).toFixed(1)}s</span>
            <span>{(totalDuration * 0.8).toFixed(1)}s</span>
            <span>{totalDuration.toFixed(1)}s</span>
          </div>

          {/* Caixa das 4 Trilhas com Agulha Playhead Central */}
          <div
            ref={trackRef}
            onMouseDown={handleScrubMouseDown}
            className="relative rounded-2xl bg-[#05070e] p-2.5 border border-slate-800/80 space-y-2.5 cursor-pointer overflow-hidden shadow-inner"
          >
            {/* AGULHA / PLAYHEAD VERMELHA NEON VERTICAL */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none transition-all duration-75 shadow-[0_0_12px_rgba(244,63,94,1)]"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="w-3.5 h-3.5 bg-rose-500 rounded-full -ml-[6px] -mt-1 shadow-[0_0_12px_rgba(244,63,94,1)] border-2 border-white" />
            </div>

            {/* PISTA 1: 3D & MOTION GRAPHICS (TRILHA PRINCIPAL COM RESIZE DAS BORDAS E DRAG & DROP) */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Box className="w-3.5 h-3.5" /> 3D &amp; Motion
              </span>
              <div className="flex-1 flex gap-1.5 h-11">
                {manifest.scenes.map((sc: ScriptScene, idx: number) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  const elementId = `3d-${sc.id}`;
                  const isElementSelected = selectedElementId === elementId || selectedSceneId === sc.id;

                  return (
                    <div
                      key={sc.id}
                      draggable
                      onDragStart={() => setDraggedSceneIndex(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedSceneIndex !== null && draggedSceneIndex !== idx) {
                          reorderScenes(draggedSceneIndex, idx);
                          setDraggedSceneIndex(null);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(elementId, 'motion');
                        selectScene(sc.id);
                      }}
                      className={`h-full rounded-xl px-2 flex items-center justify-between overflow-hidden border transition-all cursor-grab active:cursor-grabbing relative group ${
                        isElementSelected
                          ? 'bg-cyan-600/35 border-cyan-400 ring-2 ring-cyan-400/80 shadow-[0_0_16px_rgba(34,211,238,0.6)]'
                          : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-400/70 hover:bg-slate-800/80'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                      title={`Cena #${idx + 1}: ${sc.templateId || sc.componentType || 'Motion'} (${sc.durationSec.toFixed(1)}s) • Arraste a borda para redimensionar`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <GripVertical className="w-3 h-3 text-cyan-500/60 shrink-0 group-hover:text-cyan-300" />
                        <span className="text-[11px] font-mono font-black text-cyan-300 truncate">
                          #{idx + 1} {sc.templateId || sc.componentType || 'Motion'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-cyan-400">
                          {sc.durationSec.toFixed(1)}s
                        </span>
                      </div>

                      {/* ALÇA DIREITA DE TRIMMING (REDIMENSIONAR DURAÇÃO DA CENA) */}
                      <div
                        onMouseDown={(e) => handleStartResize(e, sc.id, 'end', sc.durationSec)}
                        className="absolute right-0 top-0 bottom-0 w-2.5 bg-cyan-400/0 hover:bg-cyan-400 active:bg-cyan-300 cursor-ew-resize transition-colors flex items-center justify-center group-hover:bg-cyan-500/30"
                        title="Arraste para aumentar ou diminuir a duração desta cena"
                      >
                        <div className="w-[2px] h-4 bg-cyan-200/60 rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PISTA 2: B-ROLL MÍDIA & IMAGENS */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Film className="w-3.5 h-3.5" /> B-Roll Mídia
              </span>
              <div className="flex-1 flex gap-1.5 h-12">
                {manifest.scenes.map((sc: ScriptScene, idx: number) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  const elementId = `broll-${sc.id}`;
                  const isElementSelected = selectedElementId === elementId;

                  return (
                    <div
                      key={elementId}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(elementId, 'broll');
                        selectScene(sc.id);
                      }}
                      className={`h-full rounded-xl p-2 flex items-center justify-between overflow-hidden relative group transition-all border cursor-pointer ${
                        isElementSelected
                          ? 'bg-indigo-600/35 border-indigo-400 ring-2 ring-indigo-400/80 shadow-[0_0_16px_rgba(129,140,248,0.6)]'
                          : 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-indigo-500/30 hover:border-indigo-400'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                      title={`B-Roll #${idx + 1}: Clique para alterar imagem ou vídeo de fundo`}
                    >
                      {sc.brollImageUrl && (
                        <img
                          src={sc.brollImageUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
                        />
                      )}
                      <div className="relative z-10 truncate">
                        <span className="text-[10px] font-mono text-white font-bold block truncate">
                          Mídia #{idx + 1}
                        </span>
                        <span className="text-[9px] text-slate-300 truncate block">
                          {sc.componentProps?.headline || sc.text.slice(0, 22)}
                        </span>
                      </div>
                      <span className="relative z-10 text-[9px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-cyan-300 shrink-0 ml-1">
                        {sc.durationSec.toFixed(1)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PISTA 3: LEGENDAS DINÂMICAS WORD-BY-WORD */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Subtitles className="w-3.5 h-3.5" /> Legendas
              </span>
              <div className="flex-1 flex gap-1.5 h-8">
                {manifest.scenes.map((sc: ScriptScene, idx: number) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  const elementId = `sub-${sc.id}`;
                  const isElementSelected = selectedElementId === elementId;

                  return (
                    <div
                      key={elementId}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(elementId, 'subtitle');
                        selectScene(sc.id);
                      }}
                      className={`h-full rounded-xl px-2.5 flex items-center justify-between text-[10px] font-bold truncate transition-all cursor-pointer border ${
                        isElementSelected
                          ? 'bg-amber-500/35 border-amber-300 ring-2 ring-amber-300 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                          : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-400'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                      title={`Legenda #${idx + 1}: "${sc.text}" (Clique para editar o texto)`}
                    >
                      <span className="truncate">Legenda: &ldquo;{sc.text.slice(0, 26)}...&rdquo;</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PISTA 4: VOZ NEURAL + SOUND DESIGN SFX */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Volume2 className="w-3.5 h-3.5" /> Voz &amp; SFX
              </span>
              <div className="flex-1 flex gap-1.5 h-8">
                {manifest.scenes.map((sc: ScriptScene, idx: number) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  const elementId = `aud-${sc.id}`;
                  const isElementSelected = selectedElementId === elementId;

                  return (
                    <div
                      key={elementId}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectElement(elementId, 'audio');
                        selectScene(sc.id);
                      }}
                      className={`h-full rounded-xl px-2.5 flex items-center justify-between text-[10px] font-mono truncate transition-all cursor-pointer border ${
                        isElementSelected
                          ? 'bg-emerald-500/35 border-emerald-300 ring-2 ring-emerald-300 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                          : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:border-emerald-400'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                      title={`Áudio/Voz #${idx + 1}: Efeito SFX (${sc.sfxType || 'impact'})`}
                    >
                      <span className="truncate">Áudio #{idx + 1}: SFX {sc.sfxType || 'impact'}</span>
                      <span className="text-emerald-400">♫</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
