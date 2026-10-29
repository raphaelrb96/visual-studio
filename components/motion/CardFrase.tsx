'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack, hyperInterpolate } from '@/lib/hyperframe';

interface CardFraseProps {
  headline?: string;
  subtext?: string;
  text?: string;
  highlightWords?: string[];
  badge?: string;
  preset: StylePreset;
  progress?: number;
}

export const CardFrase: React.FC<CardFraseProps> = ({
  headline = 'DESTAQUE PRINCIPAL',
  subtext,
  text,
  highlightWords = [],
  badge,
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;

  // Física HyperFrame: escala elástica pop-in e rotação sutil nos primeiros 30% da cena
  const entryPhase = Math.min(1, (progress || 0) / 0.32);
  const scale = hyperEaseOutBack(entryPhase);
  const opacity = Math.min(1, entryPhase * 1.5);
  const subtleRotation = hyperInterpolate(entryPhase, [0, 1], [-2.5, 0]);

  // Texto formatado com palavras em destaque
  const displayText = text || headline;
  const renderHighlightedText = () => {
    if (!highlightWords || highlightWords.length === 0) {
      return <span>{displayText}</span>;
    }

    const words = displayText.split(/\s+/);
    return words.map((word, idx) => {
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase();
      const isHighlighted = highlightWords.some((hw) => hw.toLowerCase() === cleanWord);

      if (isHighlighted) {
        return (
          <span
            key={idx}
            className="inline-block font-black px-2 py-0.5 rounded-xl mx-1 shadow-lg transform scale-105"
            style={{
              backgroundColor: `${theme.highlightTextColor}30`,
              color: theme.highlightTextColor,
              border: `1.5px solid ${theme.highlightTextColor}70`,
              textShadow: `0 0 25px ${theme.highlightTextColor}`,
            }}
          >
            {word}
          </span>
        );
      }
      return <span key={idx}>{word} </span>;
    });
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center p-4 text-center select-none"
      style={{
        transform: `scale(${scale}) rotate(${subtleRotation}deg)`,
        opacity,
      }}
    >
      {badge && (
        <div
          className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-xl"
          style={{
            backgroundColor: `${theme.highlightTextColor}25`,
            color: theme.highlightTextColor,
            border: `1.5px solid ${theme.highlightTextColor}60`,
            boxShadow: `0 0 25px ${theme.highlightTextColor}40`,
          }}
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.highlightTextColor }} />
          <span>{badge}</span>
        </div>
      )}

      {/* Card Cinético com Vidro Fosco e Borda de Destaque */}
      <div
        className="w-full max-w-sm rounded-3xl p-7 transition-all duration-300 relative overflow-hidden bg-slate-900/90 backdrop-blur-2xl border-2 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
        style={{
          borderColor: theme.highlightTextColor,
          boxShadow: `0 0 40px ${theme.highlightTextColor}30, 0 20px 60px rgba(0,0,0,0.85)`,
        }}
      >
        {/* Luz de topo interna */}
        <div
          className="absolute top-0 inset-x-0 h-1"
          style={{ backgroundColor: theme.highlightTextColor }}
        />

        <h2
          className="text-2xl md:text-3xl font-black tracking-tight leading-tight uppercase drop-shadow-md"
          style={{
            color: theme.primaryTextColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {renderHighlightedText()}
        </h2>

        {subtext && (
          <p className="mt-3 text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
