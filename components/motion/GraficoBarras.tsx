'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';

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
    { label: 'Vídeo Tradicional', value: 35, formatted: '35%' },
    { label: 'Motion Programático', value: 92, formatted: '92%' },
    { label: 'VSL Simples', value: 48, formatted: '48%' },
  ],
  preset,
  progress = 1,
}) => {
  const { theme } = preset;
  const maxValue = Math.max(...bars.map((b) => b.value), 100);

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center select-none animate-scale-in">
      <div className="w-full max-w-sm rounded-2xl p-6 bg-white/[0.05] backdrop-blur-xl border border-white/10 shadow-2xl">
        <h3
          className="text-lg md:text-xl font-bold tracking-tight mb-6"
          style={{
            color: theme.primaryTextColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {title}
        </h3>

        <div className="space-y-4">
          {bars.map((bar, idx) => {
            const barProgress = Math.min(1, Math.max(0, progress * 1.4));
            const widthPercent = (bar.value / maxValue) * 100 * barProgress;
            const isHighlight = idx === 1;

            return (
              <div key={idx} className="space-y-1.5 text-left">
                <div className="flex justify-between text-xs font-semibold">
                  <span style={{ color: theme.primaryTextColor }}>{bar.label}</span>
                  <span
                    className="font-mono font-bold"
                    style={{
                      color: isHighlight ? theme.highlightTextColor : '#94a3b8',
                    }}
                  >
                    {bar.formatted || `${bar.value}`}
                  </span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-[2px]">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(4, widthPercent)}%`,
                      backgroundColor: isHighlight ? theme.highlightTextColor : '#06b6d4',
                      boxShadow: isHighlight
                        ? `0 0 12px ${theme.highlightTextColor}`
                        : undefined,
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
