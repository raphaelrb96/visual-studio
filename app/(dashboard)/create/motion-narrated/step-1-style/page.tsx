'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { DEFAULT_STYLE_PRESETS } from '@/lib/presets';
import { AspectRatio } from '@/types/studio';
import {
  Sparkles,
  ArrowRight,
  Check,
  Smartphone,
  Monitor,
  Square,
  Palette,
} from 'lucide-react';

export default function Step1StylePage() {
  const router = useRouter();
  const { manifest, setPreset, setAspectRatio } = useStudioStore();

  const handleNext = () => {
    router.push('/create/motion-narrated/step-2-script');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Wizard Progress Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Passo 1 de 4 • Estilo Visual</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Identidade Visual & Preset
          </h1>
          <p className="text-sm text-slate-400">
            Selecione a atmosfera visual e a proporção de tela do vídeo
          </p>
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 self-start md:self-auto"
        >
          <span>Avançar para Roteiro</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
          Proporção da Tela (Aspect Ratio)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              ratio: '9:16' as AspectRatio,
              label: 'Vertical (9:16)',
              desc: 'TikTok, Reels, Shorts',
              icon: Smartphone,
            },
            {
              ratio: '16:9' as AspectRatio,
              label: 'Horizontal (16:9)',
              desc: 'YouTube, Web, TV',
              icon: Monitor,
            },
            {
              ratio: '1:1' as AspectRatio,
              label: 'Quadrado (1:1)',
              desc: 'Feed Instagram, LinkedIn',
              icon: Square,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = manifest.aspectRatio === item.ratio;

            return (
              <button
                key={item.ratio}
                onClick={() => setAspectRatio(item.ratio)}
                className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{item.label}</span>
                  <span className="text-xs text-slate-400 block">{item.desc}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-indigo-400 ml-auto flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Presets Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Vitrine de Presets Visuais</span>
            </h2>
            <p className="text-xs text-slate-400">
              Paletas de alto contraste e tipografia ajustada para retenção
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEFAULT_STYLE_PRESETS.map((preset) => {
            const isSelected = manifest.presetId === preset.id;

            return (
              <div
                key={preset.id}
                onClick={() => setPreset(preset.id)}
                className={`cursor-pointer rounded-3xl overflow-hidden border-2 transition-all duration-300 p-5 flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_25px_rgba(99,102,241,0.3)] scale-[1.02]'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                {/* Visual Preview Box */}
                <div
                  className="w-full h-36 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden mb-4 shadow-inner border border-white/10"
                  style={{ backgroundColor: preset.theme.backgroundColor }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${preset.theme.highlightTextColor}22`,
                        color: preset.theme.highlightTextColor,
                        border: `1px solid ${preset.theme.highlightTextColor}44`,
                      }}
                    >
                      {preset.theme.cardStyle}
                    </span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="text-center my-auto">
                    <span
                      className="text-base font-extrabold tracking-tight block"
                      style={{
                        color: preset.theme.primaryTextColor,
                        fontFamily: preset.theme.fontFamily,
                      }}
                    >
                      Visual Motion{' '}
                      <span style={{ color: preset.theme.highlightTextColor }}>
                        Code
                      </span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div
                      className="h-2 flex-1 rounded-full"
                      style={{ backgroundColor: preset.theme.highlightTextColor }}
                    />
                    <div className="h-2 w-8 rounded-full bg-white/20" />
                  </div>
                </div>

                {/* Preset Details */}
                <div>
                  <h3 className="text-base font-bold text-white flex items-center justify-between">
                    <span>{preset.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {preset.theme.fontFamily.split(',')[0]}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">
                    BG: {preset.theme.backgroundColor}
                  </span>
                  <span
                    className="font-bold font-mono px-2 py-0.5 rounded"
                    style={{
                      color: preset.theme.highlightTextColor,
                      backgroundColor: `${preset.theme.highlightTextColor}15`,
                    }}
                  >
                    Destaque
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
