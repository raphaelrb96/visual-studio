'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Trash2,
  Sliders,
  RotateCcw,
  ArrowRight,
  Eye,
} from 'lucide-react';

const STORAGE_KEY = 'visual_studio_custom_themes';

export default function PresetsPage() {
  const [presets, setPresets] = useState<StylePreset[]>(DEFAULT_STYLE_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(DEFAULT_STYLE_PRESETS[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');

  // Carrega temas do localStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...DEFAULT_STYLE_PRESETS, ...parsed];
          setPresets(merged);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar temas locais:', e);
    }
  }, []);

  // Atualiza campo do tema selecionado
  const handleUpdateCurrent = (field: string, value: string) => {
    setSelectedPreset((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value,
      },
    }));
  };

  // Salvar alterações no tema atual (ou nos temas customizados)
  const handleSave = () => {
    const updated = presets.map((p) => (p.id === selectedPreset.id ? selectedPreset : p));
    setPresets(updated);

    try {
      // Salva apenas os customizados no localStorage
      const customs = updated.filter((p) => p.id.startsWith('custom_') || !DEFAULT_STYLE_PRESETS.some(d => d.id === p.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
    } catch (e) {
      console.warn('Erro ao salvar temas:', e);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Criar um novo tema personalizado
  const handleCreateNewTheme = () => {
    if (!newThemeName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newPreset: StylePreset = {
      id: newId,
      name: newThemeName.trim(),
      description: 'Tema personalizado para sua identidade visual',
      previewImageUrl: '/presets/custom.png',
      theme: {
        backgroundColor: '#070a12',
        primaryTextColor: '#ffffff',
        highlightTextColor: '#38bdf8',
        fontFamily: 'Inter, sans-serif',
        cardStyle: 'glassmorphism',
      },
    };

    const updated = [...presets, newPreset];
    setPresets(updated);
    setSelectedPreset(newPreset);
    setNewThemeName('');
    setIsCreatingNew(false);

    try {
      const customs = updated.filter((p) => p.id.startsWith('custom_') || !DEFAULT_STYLE_PRESETS.some(d => d.id === p.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
    } catch (e) {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Excluir tema customizado
  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir este tema personalizado?')) return;

    const filtered = presets.filter((p) => p.id !== id);
    setPresets(filtered);
    if (selectedPreset.id === id) {
      setSelectedPreset(filtered[0] || DEFAULT_STYLE_PRESETS[0]);
    }

    try {
      const customs = filtered.filter((p) => p.id.startsWith('custom_') || !DEFAULT_STYLE_PRESETS.some(d => d.id === p.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
    } catch (e) {}
  };

  // Restaurar padrão se for um preset nativo
  const handleResetToDefault = () => {
    const native = DEFAULT_STYLE_PRESETS.find((p) => p.id === selectedPreset.id);
    if (native) {
      setSelectedPreset(native);
    }
  };

  const isCustom = selectedPreset.id.startsWith('custom_') || !DEFAULT_STYLE_PRESETS.some(d => d.id === selectedPreset.id);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-400" />
            <span>Gerenciador de Identidade Visual & Presets</span>
          </h1>
          <p className="text-sm text-slate-400">
            Crie e personalize cores, tipografia e estilos para seus vídeos com preview em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-all"
          >
            <span>Ir para Criador</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Preset Salvo!' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Presets List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
              Biblioteca de Temas ({presets.length})
            </label>
            <button
              onClick={() => setIsCreatingNew(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Tema</span>
            </button>
          </div>

          {/* Modal / Card para Novo Tema */}
          {isCreatingNew && (
            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/40 space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-indigo-300 block">Criar Tema Customizado</span>
              <input
                type="text"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
                placeholder="Nome do tema (ex: Minha Marca Gold)"
                className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  disabled={!newThemeName.trim()}
                  onClick={handleCreateNewTheme}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
                >
                  Criar Agora
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {presets.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              const isPresetCustom = preset.id.startsWith('custom_') || !DEFAULT_STYLE_PRESETS.some(d => d.id === preset.id);

              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: preset.theme.highlightTextColor }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white block">{preset.name}</span>
                        {isPresetCustom && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{preset.theme.fontFamily.split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-black/40 text-slate-400">
                      {preset.theme.cardStyle.replace('_', ' ')}
                    </span>
                    {isPresetCustom && (
                      <button
                        onClick={(e) => handleDeleteCustom(preset.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-opacity"
                        title="Excluir tema personalizado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preset Inspector & Preview (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c101d] rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{selectedPreset.name}</span>
                {isCustom && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Tema do Usuário
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-400 mt-0.5 block">{selectedPreset.description}</span>
            </div>

            {!isCustom && (
              <button
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
                title="Restaurar padrão do tema"
              >
                <RotateCcw className="w-3 h-3" />
                Restaurar
              </button>
            )}
          </div>

          {/* Color pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#07090e] border border-white/10 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Cor de Fundo do Vídeo
              </label>
              <div className="flex items-center gap-3">
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
                  className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="bg-[#07090e] border border-white/10 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Cor de Destaque Neon (Highlight)
              </label>
              <div className="flex items-center gap-3">
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
                  className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Font selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Família Tipográfica
            </label>
            <select
              value={selectedPreset.theme.fontFamily}
              onChange={(e) => handleUpdateCurrent('fontFamily', e.target.value)}
              className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Inter, sans-serif">Inter (Modern & Clean • Padrão)</option>
              <option value="Montserrat, sans-serif">Montserrat (Bold & Punchy • Hormozi)</option>
              <option value="Space Grotesk, sans-serif">Space Grotesk (Tech & Cyber • Futurista)</option>
              <option value="Outfit, sans-serif">Outfit (Display Arredondado • Viral)</option>
              <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Corporativo Elegante)</option>
            </select>
          </div>

          {/* Card Style selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Estilo de Acabamento dos Cards & Molduras
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['glassmorphism', 'flat_dark', 'neon_border', 'minimal_light'] as const).map(
                (style) => (
                  <button
                    key={style}
                    onClick={() => handleUpdateCurrent('cardStyle', style)}
                    className={`p-3 rounded-xl border text-xs font-bold capitalize text-center transition-all ${
                      selectedPreset.theme.cardStyle === style
                        ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
                        : 'bg-[#07090e] border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {style.replace('_', ' ')}
                  </button>
                )
              )}
            </div>
          </div>

          {/* UPGRADED LIVE PREVIEW DO TEMA (CANVAS 9:16 REALÍSTICO COM HUD, MOTION & LEGENDA) */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-400" />
                Pré-visualização do Tema no Player (Cena Real com Motion & Destaque)
              </label>
              <span className="text-[11px] font-mono text-slate-400">9:16 Canvas Simulator</span>
            </div>

            <div
              className="w-full h-80 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-2xl transition-all"
              style={{
                backgroundColor: selectedPreset.theme.backgroundColor,
                fontFamily: selectedPreset.theme.fontFamily,
              }}
            >
              {/* Vignette e Ambient Glow de Fundo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${selectedPreset.theme.highlightTextColor}22 0%, transparent 65%), linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.85) 100%)`,
                }}
              />

              {/* Grid Tech Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />

              {/* Top HUD */}
              <div className="relative z-10 flex items-center justify-between">
                <div
                  className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5"
                  style={{
                    borderColor: selectedPreset.theme.highlightTextColor,
                    color: selectedPreset.theme.highlightTextColor,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: selectedPreset.theme.highlightTextColor }}
                  />
                  <span>IMPACTO VISUAL</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                  CENA 01 // 4.5S
                </span>
              </div>

              {/* Centerpiece Card Simulado */}
              <div className="relative z-10 flex items-center justify-center my-auto">
                <div
                  className="p-6 rounded-2xl max-w-sm w-full text-center border shadow-2xl transition-all"
                  style={{
                    backgroundColor:
                      selectedPreset.theme.cardStyle === 'glassmorphism'
                        ? 'rgba(15, 23, 42, 0.75)'
                        : selectedPreset.theme.cardStyle === 'flat_dark'
                        ? '#090d16'
                        : selectedPreset.theme.cardStyle === 'minimal_light'
                        ? '#ffffff'
                        : 'rgba(10, 14, 26, 0.9)',
                    borderColor:
                      selectedPreset.theme.cardStyle === 'neon_border'
                        ? selectedPreset.theme.highlightTextColor
                        : 'rgba(255, 255, 255, 0.15)',
                    boxShadow:
                      selectedPreset.theme.cardStyle === 'neon_border'
                        ? `0 0 30px ${selectedPreset.theme.highlightTextColor}33`
                        : '0 20px 40px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div
                    className="w-12 h-1 rounded-full mx-auto mb-3"
                    style={{ backgroundColor: selectedPreset.theme.highlightTextColor }}
                  />
                  <h3
                    className="text-xl sm:text-2xl font-black leading-tight uppercase tracking-tight"
                    style={{
                      color:
                        selectedPreset.theme.cardStyle === 'minimal_light'
                          ? '#0f172a'
                          : selectedPreset.theme.primaryTextColor,
                    }}
                  >
                    O NOVO MODELO DE{' '}
                    <span style={{ color: selectedPreset.theme.highlightTextColor }}>
                      ALTA RETENÇÃO
                    </span>
                  </h3>
                  <p
                    className="text-xs mt-2 font-medium"
                    style={{
                      color:
                        selectedPreset.theme.cardStyle === 'minimal_light'
                          ? '#475569'
                          : '#94a3b8',
                    }}
                  >
                    Engrenagem sincronizada com inteligência artificial
                  </p>
                </div>
              </div>

              {/* Bottom Captions Simulado (Karaoke Pop Style) */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">TRANSFORME</span>
                  <span
                    className="text-sm font-black uppercase px-2 py-0.5 rounded shadow-lg"
                    style={{
                      backgroundColor: selectedPreset.theme.highlightTextColor,
                      color: '#000000',
                    }}
                  >
                    IDEIAS
                  </span>
                  <span className="text-xs font-bold text-white uppercase">EM VÍDEOS</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full w-2/3"
                    style={{ backgroundColor: selectedPreset.theme.highlightTextColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
