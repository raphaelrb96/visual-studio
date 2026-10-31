'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';

interface MediaBrollProps {
  mediaUrl?: string;
  overlayText?: string;
  caption?: string;
  preset: StylePreset;
  progress?: number;
}

export const MediaBroll: React.FC<MediaBrollProps> = ({
  mediaUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  overlayText = 'Visão de Futuro e Inovação',
  caption = 'Captação cinematográfica 4K',
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-2xl select-none">
      {/* Background Image with subtle Ken Burns zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url(${mediaUrl})`,
          transform: `scale(${1.05 + progress * 0.1})`,
        }}
      />

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />

      {/* Text Card content */}
      <div className="relative z-10 p-6 text-center max-w-sm">
        <span
          className="inline-block px-3 py-1 text-xs uppercase tracking-widest font-black rounded-full mb-3"
          style={{
            backgroundColor: `${theme.highlightTextColor}33`,
            color: theme.highlightTextColor,
            border: `1px solid ${theme.highlightTextColor}66`,
          }}
        >
          {caption}
        </span>
        <h2
          className="text-2xl md:text-3xl font-black leading-tight drop-shadow-lg"
          style={{
            color: theme.primaryTextColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {overlayText}
        </h2>
      </div>
    </div>
  );
};
