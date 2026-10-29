'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { MotionPlayer } from '@/components/motion/MotionPlayer';
import { formatTime } from '@/lib/utils';
import { ComponentType } from '@/types/studio';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Volume2,
  Mic,
  Subtitles,
  Sliders,
  Type,
  PieChart,
  BarChart2,
  Hash,
  Image as ImageIcon,
  MousePointerClick,
  ChevronLeft,
} from 'lucide-react';

const COMPONENT_OPTIONS: { type: ComponentType; label: string; icon: any }[] = [
  { type: 'CardFrase', label: 'Card Frase Cinético', icon: Type },
  { type: 'StatCounter', label: 'Contador de Impacto', icon: Hash },
  { type: 'GraficoPizza', label: 'Gráfico Pizza / Donut', icon: PieChart },
  { type: 'GraficoBarras', label: 'Gráfico de Barras', icon: BarChart2 },
  { type: 'MediaBroll', label: 'B-Roll & Visual Cinematográfico', icon: ImageIcon },
  { type: 'CTAButton', label: 'Botão de Conversão (CTA)', icon: MousePointerClick },
];

const TTS_VOICES = [
  { id: 'pt-BR-AntonioNeural', name: 'Antônio (Neural - Enérgico & Firme)' },
  { id: 'pt-BR-FranciscaNeural', name: 'Francisca (Neural - Fluida & Expressiva)' },
  { id: 'pt-BR-DonatoNeural', name: 'Donato (Neural - Calmo & Didático)' },
  { id: 'pt-BR-ElzaNeural', name: 'Elza (Neural - Jovem & Dinâmica)' },
];

export default function Step3EditorPage() {
  const router = useRouter();
  const {
    manifest,
    isPlaying,
    currentTime,
    currentSceneIndex,
    selectedSceneId,
    setCurrentTime,
    togglePlay,
    updateScene,
    addScene,
    removeScene,
    selectScene,
    setAudioConfig,
    setSubtitleConfig,
    getTotalDuration,
  } = useStudioStore();

  const totalDuration = getTotalDuration();
  const activeScene =
    manifest.scenes.find((sc: any) => sc.id === selectedSceneId) || manifest.scenes[0];

  const [activeInspectorTab, setActiveInspectorTab] = useState<'scene' | 'audio' | 'subtitles'>('scene');

  // Handle Timeline Scrubbing
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(clickRatio * totalDuration);
  };

  const handleProceedToRender = () => {
    router.push('/create/motion-narrated/step-4-render');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/create/motion-narrated/step-2-script')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Editor Canvas & Timeline</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                60 FPS LIVE
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {manifest.scenes.length} Cenas • {formatTime(totalDuration)} Duração Total
            </p>
          </div>
        </div>

        <button
          onClick={handleProceedToRender}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Renderizar Vídeo Final (MP4)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Workspace (Inspector + Viewport Player) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left Inspector Panel (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-3xl border border-white/10 flex flex-col overflow-hidden">
          {/* Inspector Header Tabs */}
          <div className="flex items-center border-b border-slate-800 p-2 gap-1 bg-slate-900/60">
            <button
              onClick={() => setActiveInspectorTab('scene')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeInspectorTab === 'scene'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Cena Ativa</span>
            </button>
            <button
              onClick={() => setActiveInspectorTab('audio')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeInspectorTab === 'audio'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voz & Trilha</span>
            </button>
            <button
              onClick={() => setActiveInspectorTab('subtitles')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeInspectorTab === 'subtitles'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span>Legendas</span>
            </button>
          </div>

          {/* Inspector Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeInspectorTab === 'scene' && activeScene && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    EDITANDO CENA #{activeScene.sceneIndex + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">Duração:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1.5"
                      max="15"
                      value={activeScene.durationSec}
                      onChange={(e) =>
                        updateScene(activeScene.id, {
                          durationSec: parseFloat(e.target.value) || 3.5,
                        })
                      }
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-mono"
                    />
                    <span className="text-xs text-slate-500">s</span>
                  </div>
                </div>

                {/* Component Type Dropdown */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Componente Visual
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPONENT_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = activeScene.componentType === opt.type;

                      return (
                        <button
                          key={opt.type}
                          onClick={() =>
                            updateScene(activeScene.id, { componentType: opt.type })
                          }
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs font-semibold truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Narrator Text Input */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Roteiro Falado (TTS / Legendas)
                  </label>
                  <textarea
                    rows={3}
                    value={activeScene.text}
                    onChange={(e) =>
                      updateScene(activeScene.id, { text: e.target.value })
                    }
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Component Specific Props */}
                {activeScene.componentType === 'CardFrase' && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Título em Destaque (Headline)
                      </label>
                      <input
                        type="text"
                        value={activeScene.componentProps.headline || ''}
                        onChange={(e) =>
                          updateScene(activeScene.id, {
                            componentProps: {
                              ...activeScene.componentProps,
                              headline: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Etiqueta / Badge Superior
                      </label>
                      <input
                        type="text"
                        value={activeScene.componentProps.badge || ''}
                        onChange={(e) =>
                          updateScene(activeScene.id, {
                            componentProps: {
                              ...activeScene.componentProps,
                              badge: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {activeScene.componentType === 'StatCounter' && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Número
                        </label>
                        <input
                          type="number"
                          value={activeScene.componentProps.number || 85}
                          onChange={(e) =>
                            updateScene(activeScene.id, {
                              componentProps: {
                                ...activeScene.componentProps,
                                number: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Sufixo (ex: %, x, M)
                        </label>
                        <input
                          type="text"
                          value={activeScene.componentProps.suffix || '%'}
                          onChange={(e) =>
                            updateScene(activeScene.id, {
                              componentProps: {
                                ...activeScene.componentProps,
                                suffix: e.target.value,
                              },
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Rótulo da Métrica
                      </label>
                      <input
                        type="text"
                        value={activeScene.componentProps.label || ''}
                        onChange={(e) =>
                          updateScene(activeScene.id, {
                            componentProps: {
                              ...activeScene.componentProps,
                              label: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}

                {activeScene.componentType === 'CTAButton' && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        value={activeScene.componentProps.buttonText || ''}
                        onChange={(e) =>
                          updateScene(activeScene.id, {
                            componentProps: {
                              ...activeScene.componentProps,
                              buttonText: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeInspectorTab === 'audio' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Voz Sintética (Edge TTS / Neural)
                  </label>
                  <div className="space-y-2">
                    {TTS_VOICES.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setAudioConfig({ ttsVoiceId: v.id })}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          manifest.audio.ttsVoiceId === v.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{v.name}</span>
                        {manifest.audio.ttsVoiceId === v.id && (
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Volume Trilha Sonora de Fundo
                    </label>
                    <span className="text-xs font-mono text-indigo-400 font-bold">
                      {Math.round(manifest.audio.bgMusicVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={manifest.audio.bgMusicVolume}
                    onChange={(e) =>
                      setAudioConfig({ bgMusicVolume: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeInspectorTab === 'subtitles' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Habilitar Legendas na Renderização
                  </span>
                  <button
                    onClick={() =>
                      setSubtitleConfig({ enabled: !manifest.subtitles.enabled })
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      manifest.subtitles.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        manifest.subtitles.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Estilo de Legenda Dinâmica
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'kinetic_word' as const,
                        name: 'Kinetic Word (Palavra Ativa Destacada)',
                        desc: 'Formato viral do TikTok com zoom e cor na palavra sincronizada',
                      },
                      {
                        id: 'karaoke_highlight' as const,
                        name: 'Karaoke Highlight (Preenchimento Contínuo)',
                        desc: 'Barra fluida acompanhando o ritmo da voz',
                      },
                      {
                        id: 'classic_bottom' as const,
                        name: 'Classic Bottom (Faixa Tradicional)',
                        desc: 'Legenda estática limpa na base do vídeo',
                      },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSubtitleConfig({ style: st.id })}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                          manifest.subtitles.style === st.id
                            ? 'bg-indigo-600/20 border-indigo-500'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">
                          {st.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-1">
                          {st.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right Viewport Player (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/10 p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <MotionPlayer className="w-full h-full max-h-[500px]" />
        </div>
      </div>

      {/* Bottom Timeline Tracker & Transport Bar */}
      <div className="glass-panel rounded-3xl p-4 border border-white/10 space-y-3">
        {/* Controls Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={() => setCurrentTime(0)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="font-mono text-xs font-bold text-slate-300">
              <span className="text-indigo-400">{formatTime(currentTime)}</span>
              <span className="text-slate-600 mx-1">/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => addScene()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Cena</span>
            </button>
          </div>
        </div>

        {/* Timeline Blocks & Scrubber Ruler */}
        <div
          onClick={handleTimelineClick}
          className="relative h-14 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center p-1.5 cursor-pointer overflow-hidden select-none"
        >
          {/* Playhead indicator bar */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none transition-all shadow-[0_0_10px_#f43f5e]"
            style={{
              left: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%`,
            }}
          >
            <div className="w-3 h-3 bg-rose-500 rounded-full -ml-[5px] -mt-0.5 shadow-md" />
          </div>

          {/* Scene Blocks */}
          <div className="w-full h-full flex gap-1">
            {manifest.scenes.map((sc: any, idx: number) => {
              const widthRatio = (sc.durationSec / totalDuration) * 100;
              const isSelected = selectedSceneId === sc.id;

              return (
                <div
                  key={sc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectScene(sc.id);
                  }}
                  className={`h-full rounded-xl p-2 flex flex-col justify-between transition-all relative border ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-400 text-white'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                  style={{ width: `${widthRatio}%` }}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                    <span>#{idx + 1} {sc.componentType}</span>
                    <span>{sc.durationSec}s</span>
                  </div>
                  <span className="text-[10px] truncate block opacity-75 font-medium">
                    {sc.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
