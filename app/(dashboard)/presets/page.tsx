'use client';

import React, { useState } from 'react';
import { DEFAULT_STYLE_PRESETS } from '@/lib/presets';
import { StylePreset } from '@/types/studio';
import {
  Palette,
  Plus,
  Type,
  Sparkles,
  Layers,
  Save,
  Check,
} from 'lucide-react';

export default function PresetsPage() {
  const [presets, setPresets] = useState<StylePreset[]>(DEFAULT_STYLE_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(DEFAULT_STYLE_PRESETS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateCurrent = (field: string, value: string) => {
    setSelectedPreset((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setPresets((prev) =>
      prev.map((p) => (p.id === selectedPreset.id ? selectedPreset : p))
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-400" />
            <span>Gerenciador de Identidade Visual & Presets</span>
          </h1>
          <p className="text-sm text-slate-400">
            Personalize cores, tipografia e estilos de card para sua marca
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Preset Salvo!' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Presets List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
            Biblioteca de Temas
          </label>
          <div className="space-y-2.5">
            {presets.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.theme.highlightTextColor }}
                    />
                    <div>
                      <span className="text-sm font-bold text-white block">{preset.name}</span>
                      <span className="text-xs text-slate-400">{preset.theme.fontFamily.split(',')[0]}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-black/40 text-slate-400">
                    {preset.theme.cardStyle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preset Inspector & Preview (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center justify-between">
            <span>Editando: {selectedPreset.name}</span>
            <span className="text-xs font-mono text-slate-400">{selectedPreset.id}</span>
          </h2>

          {/* Color pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Cor de Fundo (Background)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedPreset.theme.backgroundColor}
                  onChange={(e) => handleUpdateCurrent('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedPreset.theme.backgroundColor}
                  onChange={(e) => handleUpdateCurrent('backgroundColor', e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Cor de Destaque (Highlight)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedPreset.theme.highlightTextColor}
                  onChange={(e) => handleUpdateCurrent('highlightTextColor', e.target.value)}
                  className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedPreset.theme.highlightTextColor}
                  onChange={(e) => handleUpdateCurrent('highlightTextColor', e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Font selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Família Tipográfica
            </label>
            <select
              value={selectedPreset.theme.fontFamily}
              onChange={(e) => handleUpdateCurrent('fontFamily', e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="Inter, sans-serif">Inter (Modern & Clean)</option>
              <option value="Montserrat, sans-serif">Montserrat (Bold & Punchy)</option>
              <option value="Space Grotesk, sans-serif">Space Grotesk (Tech & Cyber)</option>
              <option value="Outfit, sans-serif">Outfit (Rounded Display)</option>
              <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Corporate Elegant)</option>
            </select>
          </div>

          {/* Card Style selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Estilo do Card
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['glassmorphism', 'flat_dark', 'neon_border', 'minimal_light'] as const).map(
                (style) => (
                  <button
                    key={style}
                    onClick={() => handleUpdateCurrent('cardStyle', style)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold capitalize text-center ${
                      selectedPreset.theme.cardStyle === style
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    {style.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Live Preview do Card
            </label>
            <div
              className="w-full h-44 rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden"
              style={{
                backgroundColor: selectedPreset.theme.backgroundColor,
                fontFamily: selectedPreset.theme.fontFamily,
              }}
            >
              <div
                className="p-5 rounded-2xl max-w-sm w-full border"
                style={{
                  backgroundColor:
                    selectedPreset.theme.cardStyle === 'glassmorphism'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.6)',
                  borderColor:
                    selectedPreset.theme.cardStyle === 'neon_border'
                      ? selectedPreset.theme.highlightTextColor
                      : 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span
                  className="text-lg font-black block"
                  style={{ color: selectedPreset.theme.primaryTextColor }}
                >
                  Vídeo com{' '}
                  <span style={{ color: selectedPreset.theme.highlightTextColor }}>
                    Código Nativo
                  </span>
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Pré-visualização do tema configurado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
