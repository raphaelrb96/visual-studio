'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack } from '@/lib/hyperframe';

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

  const numericVal =
    typeof number === 'number'
      ? number
      : parseFloat(String(number).replace(/[^0-9.-]+/g, '')) || 0;

  // Interpolação cinética elástica do contador
  const entryPhase = Math.min(1, (progress || 0) * 1.5);
  const currentCount = Math.round(numericVal * entryPhase);
  const scale = hyperEaseOutBack(Math.min(1, (progress || 0) / 0.35));

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-4 text-center select-none"
      style={{ transform: `scale(${scale})` }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-7 bg-slate-900/90 backdrop-blur-2xl border-2 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden"
        style={{
          borderColor: theme.highlightTextColor,
          boxShadow: `0 0 35px ${theme.highlightTextColor}30`,
        }}
      >
        <span
          className="text-xs uppercase font-black tracking-widest px-3.5 py-1 rounded-full mb-3 inline-block"
          style={{
            backgroundColor: `${theme.highlightTextColor}20`,
            color: theme.highlightTextColor,
            border: `1.5px solid ${theme.highlightTextColor}40`,
          }}
        >
          Métrica Chave
        </span>

        {/* Número Gigante com Brilho Neon */}
        <div
          className="my-2 text-6xl sm:text-7xl font-black tracking-tighter flex items-center justify-center gap-1 font-mono"
          style={{
            color: theme.highlightTextColor,
            textShadow: `0 0 35px ${theme.highlightTextColor}99`,
          }}
        >
          {prefix && <span className="text-4xl opacity-80">{prefix}</span>}
          <span>{currentCount}</span>
          {suffix && <span className="text-4xl opacity-90">{suffix}</span>}
        </div>

        {/* Rótulo */}
        <h4 className="text-sm md:text-base font-extrabold text-white tracking-tight mt-1">
          {label}
        </h4>

        {description && (
          <p className="mt-2 text-xs text-slate-300 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
