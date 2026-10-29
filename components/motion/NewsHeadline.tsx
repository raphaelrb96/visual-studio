'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack, hyperInterpolate } from '@/lib/hyperframe';
import { Newspaper, Flame, ExternalLink } from 'lucide-react';

interface NewsHeadlineProps {
  portalName?: string;
  headline?: string;
  dateStr?: string;
  badge?: string;
  preset: StylePreset;
  progress?: number;
}

export const NewsHeadline: React.FC<NewsHeadlineProps> = ({
  portalName = 'THE WALL STREET JOURNAL',
  headline = 'EMPRESAS QUE NÃO AUTOMATIZAM VÍDEOS PERDEM 70% DO VALOR DE MERCADO',
  dateStr = 'Edição Especial 2026',
  badge = 'NOTÍCIA URGENTE',
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;

  const entry = Math.min(1, (progress || 0) / 0.28);
  const scale = hyperEaseOutBack(entry);
  const translateY = hyperInterpolate(entry, [0, 1], [40, 0]);

  return (
    <div
      className="w-full flex items-center justify-center p-4 select-none"
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <div className="w-full max-w-sm rounded-3xl p-6 bg-slate-950/95 backdrop-blur-2xl border-2 border-red-500/60 shadow-[0_25px_60px_rgba(239,68,68,0.35)] space-y-4">
        {/* Faixa Superior de Breaking News */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-white" />
            {badge}
          </span>
          <span className="text-[10px] font-mono text-slate-400">{dateStr}</span>
        </div>

        {/* Nome do Portal em Tipografia Jornalística */}
        <div className="border-b-2 border-slate-800 pb-2 flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-slate-400" />
          <span className="font-serif text-xs font-black tracking-widest text-slate-300 uppercase">
            {portalName}
          </span>
        </div>

        {/* Manchete Explosiva */}
        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight drop-shadow">
          {headline}
        </h2>

        {/* Marca d'água / Rodapé Jornalístico */}
        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Relatório de Mercado Exclusivo</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
