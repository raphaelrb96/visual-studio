'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack, hyperInterpolate } from '@/lib/hyperframe';
import { Check, X, ShieldAlert, Award } from 'lucide-react';

interface VersusComparisonProps {
  leftTitle?: string;
  leftDesc?: string;
  rightTitle?: string;
  rightDesc?: string;
  preset: StylePreset;
  progress?: number;
}

export const VersusComparison: React.FC<VersusComparisonProps> = ({
  leftTitle = 'O JEITO COMUM',
  leftDesc = '4 horas editando cortes e gastando rios de dinheiro',
  rightTitle = 'COM O VISUAL STUDIO',
  rightDesc = 'Vídeo 100% pronto em 60s com inteligência artificial',
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;

  const entry = Math.min(1, (progress || 0) / 0.3);
  const scale = hyperEaseOutBack(entry);

  return (
    <div
      className="w-full flex items-center justify-center p-4 select-none"
      style={{ transform: `scale(${scale})` }}
    >
      <div className="w-full max-w-sm rounded-3xl p-5 bg-slate-950/95 backdrop-blur-2xl border-2 border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-3">
        {/* Lado Errado / Vermelho */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <X className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-rose-300 uppercase tracking-wide">{leftTitle}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{leftDesc}</p>
          </div>
        </div>

        {/* Emblema VS Central */}
        <div className="flex justify-center">
          <span className="px-3 py-0.5 rounded-full bg-slate-800 text-white font-black text-[10px] font-mono border border-slate-700">
            VERSUS
          </span>
        </div>

        {/* Lado Certo / Verde Neon */}
        <div
          className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.3)] flex items-start gap-3"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide">{rightTitle}</h4>
            <p className="text-xs text-white font-semibold mt-0.5">{rightDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
