'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';

interface Slice {
  label: string;
  value: number;
  color?: string;
}

interface GraficoPizzaProps {
  title?: string;
  slices?: Slice[];
  preset: StylePreset;
  progress?: number;
}

export const GraficoPizza: React.FC<GraficoPizzaProps> = ({
  title = 'Distribuição de Métricas',
  slices = [
    { label: 'Segmento A', value: 60, color: '#6366f1' },
    { label: 'Segmento B', value: 25, color: '#06b6d4' },
    { label: 'Segmento C', value: 15, color: '#facc15' },
  ],
  preset,
  progress = 1,
}) => {
  const { theme } = preset;
  const total = slices.reduce((acc, curr) => acc + curr.value, 0) || 100;

  // SVG Donut calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

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

        {/* Donut Chart Container */}
        <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
            {/* Background track */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="22"
              fill="transparent"
            />
            {/* Animated Slices */}
            {slices.map((slice, idx) => {
              const slicePercent = (slice.value / total) * 100;
              const strokeDasharray = `${(slicePercent * circumference) / 100} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent * circumference) / 100);
              accumulatedPercent += slicePercent;

              const sliceColor = slice.color || (idx === 0 ? theme.highlightTextColor : '#06b6d4');

              return (
                <circle
                  key={idx}
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke={sliceColor}
                  strokeWidth="22"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${sliceColor}66)`,
                  }}
                />
              );
            })}
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-2xl font-black tracking-tight"
              style={{ color: theme.primaryTextColor }}
            >
              100%
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 text-slate-400">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2 text-left">
          {slices.map((slice, idx) => {
            const percent = Math.round((slice.value / total) * 100);
            const sliceColor = slice.color || (idx === 0 ? theme.highlightTextColor : '#06b6d4');

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: sliceColor,
                      boxShadow: `0 0 8px ${sliceColor}99`,
                    }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: theme.primaryTextColor }}
                  >
                    {slice.label}
                  </span>
                </div>
                <span
                  className="text-xs font-extrabold font-mono"
                  style={{ color: sliceColor }}
                >
                  {percent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
