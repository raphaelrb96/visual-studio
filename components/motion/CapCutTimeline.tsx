'use client';

import React, { useRef, useState } from 'react';
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
    setCurrentTime,
    setIsPlaying,
    getTotalDuration,
    selectScene,
    addScene,
    removeScene,
    updateScene,
    setScenes,
  } = useStudioStore();

  const totalDuration = getTotalDuration() || 20;
  const trackRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(ratio * totalDuration);
  };

  // Cortar / Dividir a cena atual em 2 cenas na posição da agulha ou ao meio
  const handleSplitActiveScene = () => {
    const targetId = selectedSceneId || manifest.scenes[0]?.id;
    const idx = manifest.scenes.findIndex((s: ScriptScene) => s.id === targetId);
    if (idx === -1) return;
    const current = manifest.scenes[idx];
    if (current.durationSec < 2.2) return alert('A cena já é muito curta para ser dividida.');

    const halfDur = Number((current.durationSec / 2).toFixed(1));
    const words = current.text.split(' ');
    const halfWords = Math.max(1, Math.floor(words.length / 2));
    const textPart1 = words.slice(0, halfWords).join(' ');
    const textPart2 = words.slice(halfWords).join(' ') || current.text;

    const updatedCurrent: ScriptScene = {
      ...current,
      durationSec: halfDur,
      text: textPart1,
    };

    const clonedSecondHalf: ScriptScene = {
      ...current,
      id: `scene-split-${Date.now()}`,
      sceneIndex: idx + 1,
      durationSec: halfDur,
      text: textPart2,
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

  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <div className={`rounded-3xl bg-[#090e1a]/95 border border-white/10 shadow-2xl p-4 sm:p-5 space-y-3 ${className}`}>
      {/* Barra de Ferramentas NLE Estilo CapCut Pro */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 text-xs font-bold transition-all"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isPlaying ? 'Pausar' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Voltar ao início"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-5 w-[1px] bg-slate-800 mx-1" />

          {/* Ferramentas de Corte / Duplicar / Nova Cena / Excluir */}
          <button
            type="button"
            onClick={handleSplitActiveScene}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            title="Dividir Cena ao Meio (Split)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dividir (Split)</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicateScene}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            title="Duplicar Cena"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span>Duplicar</span>
          </button>

          <button
            type="button"
            onClick={() => addScene()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
            title="Adicionar Nova Cena"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Cena</span>
          </button>

          <button
            type="button"
            onClick={() => selectedSceneId && removeScene(selectedSceneId)}
            disabled={manifest.scenes.length <= 1}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-colors"
            title="Excluir Cena Selecionada"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Timecode Digital */}
          <div className="px-3 py-1 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs font-black text-cyan-400">
            {currentTime.toFixed(2)}s <span className="text-slate-600">/</span> {totalDuration.toFixed(2)}s
          </div>

          {/* Controle de Zoom */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1">{zoomLevel.toFixed(2)}x</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA MULTIPISTA (4 TRILHAS SIMULTÂNEAS) */}
      <div className="space-y-2 relative select-none overflow-x-auto pb-1">
        <div style={{ width: `${zoomLevel * 100}%`, minWidth: '640px' }} className="space-y-2">
          {/* Régua de Tempo */}
          <div className="h-5 flex items-center justify-between text-[10px] font-mono text-slate-500 px-2 border-b border-slate-800/60">
            <span>00:00s</span>
            <span>{(totalDuration * 0.2).toFixed(1)}s</span>
            <span>{(totalDuration * 0.4).toFixed(1)}s</span>
            <span>{(totalDuration * 0.6).toFixed(1)}s</span>
            <span>{(totalDuration * 0.8).toFixed(1)}s</span>
            <span>{totalDuration.toFixed(1)}s</span>
          </div>

          {/* Trilhas Multipistas com Agulha Playhead */}
          <div
            ref={trackRef}
            onClick={handleScrub}
            className="relative rounded-2xl bg-slate-950 p-2.5 border border-slate-800 space-y-2 cursor-pointer overflow-hidden"
          >
            {/* AGULHA / PLAYHEAD VERMELHA VERTICAL */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none transition-all duration-75"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="w-3 h-3 bg-rose-500 rounded-full -ml-[5px] -mt-1 shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
            </div>

            {/* PISTA 1: THREE.JS 3D & COMPONENTES HYPERFRAME */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Box className="w-3.5 h-3.5" /> 3D &amp; Motion
              </span>
              <div className="flex-1 flex gap-1 h-10">
                {manifest.scenes.map((sc: ScriptScene, idx: number) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  const isSelected = selectedSceneId === sc.id;
                  return (
                    <div
                      key={`3d-${sc.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectScene(sc.id);
                      }}
                      className={`h-full rounded-lg px-2 flex items-center justify-between overflow-hidden border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-400/60'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span className="text-[10px] font-mono font-bold text-cyan-300 truncate">
                        {sc.componentType}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 ml-1 shrink-0">
                        {sc.cameraMotion || 'zoom_in'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PISTA 2: COLAGEM B-ROLL & IMAGENS (MULTI-LAYER) */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Film className="w-3.5 h-3.5" /> B-Roll Collage
              </span>
              <div className="flex-1 flex gap-1 h-14">
                {manifest.scenes.map((sc: ScriptScene, idx: number) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  const isSelected = selectedSceneId === sc.id;
                  const collageCount = sc.collageImages?.length || (sc.brollImageUrl ? 1 : 0);

                  return (
                    <div
                      key={sc.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectScene(sc.id);
                      }}
                      className={`h-full rounded-xl p-2 flex items-center justify-between overflow-hidden relative group transition-all border ${
                        isSelected
                          ? 'bg-indigo-950/90 border-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                          : 'bg-gradient-to-r from-indigo-950/60 to-slate-900 border-indigo-500/30 hover:border-indigo-400'
                      }`}
                      style={{ width: `${widthPercent}%` }}
                    >
                      {sc.brollImageUrl && (
                        <img
                          src={sc.brollImageUrl}
                          alt="Thumb"
                          className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
                        />
                      )}
                      <div className="relative z-10 truncate">
                        <span className="text-[10px] font-mono text-white font-bold block">
                          Cena #{idx + 1} • {collageCount} mídias
                        </span>
                        <span className="text-[10px] text-slate-300 truncate block">
                          {sc.text}
                        </span>
                      </div>
                      <span className="relative z-10 text-[9px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-cyan-300 shrink-0 ml-1">
                        {sc.durationSec}s
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
              <div className="flex-1 flex gap-1 h-7">
                {manifest.scenes.map((sc: ScriptScene) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  return (
                    <div
                      key={`sub-${sc.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectScene(sc.id);
                      }}
                      className="h-full rounded-lg bg-amber-950/40 border border-amber-500/40 px-2 flex items-center justify-between text-[10px] text-amber-300 font-bold truncate"
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span className="truncate">Word-by-Word: &ldquo;{sc.text.slice(0, 22)}...&rdquo;</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PISTA 4: VOZ NEURAL + SOUND DESIGN SFX */}
            <div className="flex items-center gap-2">
              <span className="w-24 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Volume2 className="w-3.5 h-3.5" /> Voz + SFX
              </span>
              <div className="flex-1 flex gap-1 h-7">
                {manifest.scenes.map((sc: ScriptScene) => {
                  const widthPercent = (sc.durationSec / totalDuration) * 100;
                  return (
                    <div
                      key={`aud-${sc.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectScene(sc.id);
                      }}
                      className="h-full rounded-lg bg-emerald-950/40 border border-emerald-500/40 px-2 flex items-center justify-between text-[10px] text-emerald-300 font-mono truncate"
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span>SFX: {sc.sfxType || 'whoosh'}</span>
                      <span>♫</span>
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
