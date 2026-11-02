'use client';

import React from 'react';

interface TemplatePreviewItemProps {
  templateId: string;
  name?: string;
  badge?: string;
  categoryName?: string;
  previewGif?: string;
  className?: string;
}

/**
 * Renderiza o GIF horizontal (16:9) de alta fidelidade para todos os templates do catálogo.
 */
export const MotionTemplateSquarePreview: React.FC<TemplatePreviewItemProps> = ({
  templateId,
  name = 'Motion Template',
  previewGif,
  className = '',
}) => {
  const [hasError, setHasError] = React.useState(false);
  const gifSrc = previewGif || `/templates/previews/${templateId}.gif`;

  return (
    <div className={`w-full h-full relative overflow-hidden bg-[#090b10] flex items-center justify-center ${className}`}>
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={gifSrc}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-4 text-gray-500 space-y-1">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
            16:9
          </div>
          <span className="text-xs font-medium text-gray-400">{name}</span>
        </div>
      )}
    </div>
  );
};
