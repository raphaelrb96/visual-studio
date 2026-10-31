'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack, hyperInterpolate } from '@/lib/hyperframe';
import { Quote, Star } from 'lucide-react';

interface QuoteCardProps {
  quoteText?: string;
  authorName?: string;
  authorRole?: string;
  preset: StylePreset;
  progress?: number;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quoteText = 'A velocidade com que você testa novas ideias de conteúdo define o tamanho do seu faturamento.',
  authorName = 'Steve Jobs',
  authorRole = 'Fundador da Apple',
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
      <div
        className="w-full max-w-sm rounded-3xl p-7 bg-slate-900/90 backdrop-blur-2xl border-2 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative space-y-4"
        style={{ borderColor: theme.highlightTextColor }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: `${theme.highlightTextColor}25`,
            color: theme.highlightTextColor,
          }}
        >
          <Quote className="w-6 h-6" />
        </div>

        <p className="text-lg sm:text-xl font-black text-white italic leading-snug">
          &ldquo;{quoteText}&rdquo;
        </p>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black text-white">{authorName}</h4>
            <span className="text-xs text-slate-400">{authorRole}</span>
          </div>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
