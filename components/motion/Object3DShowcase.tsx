'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { Hyper3DCanvas } from './Hyper3DCanvas';
import { hyperEaseOutBack } from '@/lib/hyperframe';

interface Object3DShowcaseProps {
  objectType?: 'coin' | 'diamond' | 'shield' | 'chart';
  title?: string;
  subtitle?: string;
  badge?: string;
  preset: StylePreset;
  progress?: number;
}

export const Object3DShowcase: React.FC<Object3DShowcaseProps> = ({
  objectType = 'coin',
  title = 'LUCRO E ESCALA AUTOMÁTICA',
  subtitle = 'Ativos renderizados em 3D em tempo real',
  badge = 'MODELO 3D REAL',
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;
  const entry = Math.min(1, (progress || 0) / 0.28);
  const scale = hyperEaseOutBack(entry);

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-4 text-center select-none"
      style={{ transform: `scale(${scale})` }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 bg-slate-950/90 backdrop-blur-2xl border-2 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col items-center"
        style={{
          borderColor: theme.highlightTextColor,
          boxShadow: `0 0 35px ${theme.highlightTextColor}30`,
        }}
      >
        <span
          className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 inline-block"
          style={{
            backgroundColor: `${theme.highlightTextColor}20`,
            color: theme.highlightTextColor,
            border: `1.5px solid ${theme.highlightTextColor}50`,
          }}
        >
          {badge}
        </span>

        {/* OBJETO 3D FÍSICO COM THREE.JS RENDERIZANDO WEBGL */}
        <Hyper3DCanvas
          type={objectType}
          accentColor={theme.highlightTextColor}
          progress={progress}
        />

        <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1 leading-snug">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-2 text-xs text-slate-300 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
