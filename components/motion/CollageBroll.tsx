'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack, hyperInterpolate } from '@/lib/hyperframe';

interface CollageBrollProps {
  headline?: string;
  badge?: string;
  images?: string[];
  preset: StylePreset;
  progress?: number;
}

export const CollageBroll: React.FC<CollageBrollProps> = ({
  headline = 'O ECOSSISTEMA QUE DOMINA O MERCADO',
  badge = 'COLAGEM B-ROLL CINEMATOGRÁFICA',
  images = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  ],
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;

  // Movimentos de recorte e flutuação em camadas independentes (estilo Vox / MagnatesMedia)
  const p = progress || 0;
  const rot1 = hyperInterpolate(p, [0, 1], [-8, -4]);
  const rot2 = hyperInterpolate(p, [0, 1], [6, 10]);
  const translateY = hyperInterpolate(p, [0, 1], [15, -10]);
  const scaleCenter = 1.05 + Math.sin(p * Math.PI) * 0.08;

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 select-none">
      {/* Título Superior */}
      <div className="mb-4 text-center z-20">
        <span
          className="text-[10px] font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1.5 inline-block shadow-lg"
          style={{
            backgroundColor: `${theme.highlightTextColor}25`,
            color: theme.highlightTextColor,
            border: `1.5px solid ${theme.highlightTextColor}60`,
          }}
        >
          {badge}
        </span>
        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight drop-shadow-md">
          {headline}
        </h3>
      </div>

      {/* Camadas da Colagem (3 Cards em Paralaxe) */}
      <div className="relative w-full max-w-[320px] h-[220px] flex items-center justify-center">
        {/* Camada Esquerda (Recorte com Rotação) */}
        <div
          className="absolute w-36 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-transform"
          style={{
            left: '10px',
            transform: `rotate(${rot1}deg) translateY(${translateY * 0.8}px)`,
            zIndex: 10,
          }}
        >
          <img
            src={images[0] || images[images.length - 1]}
            alt="Colagem 1"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Camada Direita (Recorte com Rotação Inversa) */}
        <div
          className="absolute w-36 h-48 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-transform"
          style={{
            right: '10px',
            transform: `rotate(${rot2}deg) translateY(${-translateY * 0.7}px)`,
            zIndex: 11,
          }}
        >
          <img
            src={images[1] || images[0]}
            alt="Colagem 2"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Camada Central em Destaque Neon */}
        <div
          className="relative w-40 h-52 rounded-2xl overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-20"
          style={{
            borderColor: theme.highlightTextColor,
            boxShadow: `0 0 35px ${theme.highlightTextColor}40, 0 20px 50px rgba(0,0,0,0.9)`,
            transform: `scale(${scaleCenter})`,
          }}
        >
          <img
            src={images[2] || images[0]}
            alt="Colagem 3"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: theme.highlightTextColor,
                color: '#000000',
              }}
            >
              FOCO EM RETENÇÃO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
