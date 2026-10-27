'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTAButtonProps {
  buttonText?: string;
  subcaption?: string;
  preset: StylePreset;
  progress?: number;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  buttonText = 'Começar Agora Gratuitamente',
  subcaption = 'Transforme scripts em vídeos em segundos',
  preset,
}) => {
  const { theme } = preset;

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center select-none animate-scale-in">
      <div className="w-full max-w-sm rounded-3xl p-8 bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-[0_15px_45px_rgba(0,0,0,0.6)] flex flex-col items-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
          style={{
            backgroundColor: `${theme.highlightTextColor}22`,
            border: `1px solid ${theme.highlightTextColor}66`,
            color: theme.highlightTextColor,
          }}
        >
          <Sparkles className="w-7 h-7 animate-pulse" />
        </div>

        <button
          className="w-full py-4 px-6 rounded-2xl font-black text-base md:text-lg flex items-center justify-center gap-3 transition-transform duration-300 hover:scale-105 active:scale-95 shadow-2xl"
          style={{
            backgroundColor: theme.highlightTextColor,
            color: '#000000',
            boxShadow: `0 0 30px ${theme.highlightTextColor}88`,
          }}
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>

        {subcaption && (
          <p
            className="mt-4 text-xs md:text-sm font-semibold opacity-70"
            style={{ color: theme.primaryTextColor }}
          >
            {subcaption}
          </p>
        )}
      </div>
    </div>
  );
};
