'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutExpo } from '@/lib/hyperframe';

interface BarItem {
  label: string;
  value: number;
  formatted?: string;
}

interface GraficoBarrasProps {
  title?: string;
  bars?: BarItem[];
  preset: StylePreset;
  progress?: number;
}

export const GraficoBarras: React.FC<GraficoBarrasProps> = ({
  title = 'Comparativo de Crescimento',
  bars = [
    { label: 'Método Manual', value: 25, formatted: '25%' },
    { label: 'Vídeo Automático IA', value: 94, formatted: '94%' },
  ],
  preset,
  progress = 1,
}) => {
  const { theme } = preset;
  const maxValue = Math.max(...bars.map((b) => b.value), 100);

  // Animação de subida HyperFrame nas barras
  const entryProgress = hyperEaseOutExpo(Math.min(1, (progress || 0) * 1.6));

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 text-center select-none animate-scale-in">
      <div
        className="w-full max-w-sm rounded-3xl p-6 bg-slate-900/90 backdrop-blur-2xl border-2 shadow-2xl relative overflow-hidden"
        style={{ borderColor: `${theme.highlightTextColor}60` }}
      >
        <span
          className="text-[10px] font-mono uppercase tracking-widest font-extrabold px-3 py-1 rounded-full mb-3 inline-block"
          style={{
            backgroundColor: `${theme.highlightTextColor}20`,
            color: theme.highlightTextColor,
            border: `1px solid ${theme.highlightTextColor}40`,
          }}
        >
          Análise Comparativa
        </span>

        <h3 className="text-base sm:text-lg font-black text-white tracking-tight mb-5">
          {title}
        </h3>

        <div className="space-y-4 text-left">
          {bars.map((bar, idx) => {
            const widthPercent = (bar.value / maxValue) * 100 * entryProgress;
            const isHighlight = idx === 1 || bar.value === maxValue;

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={isHighlight ? 'text-white' : 'text-slate-400'}>
                    {bar.label}
                  </span>
                  <span
                    className="font-mono text-sm font-black"
                    style={{ color: isHighlight ? theme.highlightTextColor : '#94a3b8' }}
                  >
                    {bar.formatted || `${bar.value}%`}
                  </span>
                </div>

                <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-150 relative"
                    style={{
                      width: `${Math.max(6, widthPercent)}%`,
                      backgroundColor: isHighlight ? theme.highlightTextColor : '#475569',
                      boxShadow: isHighlight ? `0 0 15px ${theme.highlightTextColor}88` : undefined,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
