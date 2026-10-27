'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';

interface CardFraseProps {
  headline?: string;
  subtext?: string;
  text?: string;
  highlightWords?: string[];
  badge?: string;
  preset: StylePreset;
  progress?: number; // 0 to 1 representing scene progress
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

  // Format highlighted text
  const displayText = text || headline;
  const renderHighlightedText = () => {
    if (!highlightWords || highlightWords.length === 0) {
      return <span>{displayText}</span>;
    }

    const words = displayText.split(' ');
    return words.map((word, idx) => {
      const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase();
      const isHighlighted = highlightWords.some(
        (hw) => hw.toLowerCase() === cleanWord
      );

      if (isHighlighted) {
        return (
          <span
            key={idx}
            className="inline-block transition-transform duration-300 transform scale-105 font-black px-1.5 py-0.5 rounded-lg"
            style={{
              color: theme.highlightTextColor,
              textShadow: `0 0 25px ${theme.highlightTextColor}88`,
            }}
          >
            {word}{' '}
          </span>
        );
      }
      return <span key={idx}>{word} </span>;
    });
  };

  const getCardStyleClass = () => {
    switch (theme.cardStyle) {
      case 'glassmorphism':
        return 'bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]';
      case 'neon_border':
        return `bg-black/90 border-2 shadow-[0_0_30px_rgba(6,182,212,0.35)]`;
      case 'minimal_light':
        return 'bg-slate-900/90 border border-slate-700/80 shadow-2xl';
      case 'flat_dark':
      default:
        return 'bg-slate-900/95 border border-slate-800 shadow-xl';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-6 text-center select-none animate-scale-in">
      {badge && (
        <div
          className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition-all"
          style={{
            backgroundColor: `${theme.highlightTextColor}22`,
            color: theme.highlightTextColor,
            border: `1px solid ${theme.highlightTextColor}55`,
            boxShadow: `0 0 15px ${theme.highlightTextColor}33`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.highlightTextColor }} />
          {badge}
        </div>
      )}

      <div
        className={`w-full max-w-sm rounded-2xl p-6 transition-all duration-500 ${getCardStyleClass()}`}
        style={{
          borderColor: theme.cardStyle === 'neon_border' ? theme.highlightTextColor : undefined,
        }}
      >
        <h2
          className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug break-words"
          style={{
            color: theme.primaryTextColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {renderHighlightedText()}
        </h2>

        {subtext && (
          <p
            className="mt-4 text-sm md:text-base font-medium opacity-80 leading-relaxed"
            style={{ color: theme.primaryTextColor }}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
