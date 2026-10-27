'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';

interface StatCounterProps {
  number?: number | string;
  prefix?: string;
  suffix?: string;
  label?: string;
  description?: string;
  preset: StylePreset;
  progress?: number;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  number = 84,
  prefix = '',
  suffix = '%',
  label = 'Aumento de Retenção',
  description = 'Medido em mais de 10.000 vídeos processados',
  preset,
  progress = 1,
}) => {
  const { theme } = preset;

  // Compute interpolated value if numeric
  const numericVal = typeof number === 'number' ? number : parseFloat(String(number).replace(/[^0-9.-]+/g, '')) || 0;
  const currentCount = Math.round(numericVal * Math.min(1, Math.max(0, progress * 1.5)));

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center select-none animate-scale-in">
      <div className="w-full max-w-sm rounded-2xl p-8 bg-white/[0.06] backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <span
          className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 rounded-full mb-3 inline-block"
          style={{
            backgroundColor: `${theme.highlightTextColor}20`,
            color: theme.highlightTextColor,
            border: `1px solid ${theme.highlightTextColor}40`,
          }}
        >
          Métrica Chave
        </span>

        {/* Big Number */}
        <div
          className="my-3 text-5xl md:text-6xl font-black tracking-tighter flex items-center justify-center gap-1"
          style={{
            color: theme.highlightTextColor,
            textShadow: `0 0 35px ${theme.highlightTextColor}66`,
            fontFamily: theme.fontFamily,
          }}
        >
          {prefix && <span className="text-3xl md:text-4xl">{prefix}</span>}
          <span>{currentCount}</span>
          {suffix && <span className="text-3xl md:text-4xl">{suffix}</span>}
        </div>

        {/* Metric Label */}
        <h4
          className="text-base md:text-lg font-bold leading-tight"
          style={{ color: theme.primaryTextColor }}
        >
          {label}
        </h4>

        {/* Progress bar animation */}
        <div className="w-full bg-white/10 h-2 rounded-full my-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(5, (currentCount / (numericVal || 100)) * 100))}%`,
              backgroundColor: theme.highlightTextColor,
              boxShadow: `0 0 12px ${theme.highlightTextColor}`,
            }}
          />
        </div>

        {/* Context description */}
        {description && (
          <p className="text-xs md:text-sm font-medium opacity-70 leading-relaxed text-slate-300">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
