'use client';

import React, { useRef, useEffect } from 'react';
import { MotionTemplateId, MOTION_TEMPLATES } from '@/lib/motion-templates';

export interface SceneRenderData {
  id: string;
  templateId: MotionTemplateId;
  durationSec: number;
  text: string;
  tag?: string;
  highlightWord?: string;
  highlightColor?: string;
  brollUrl?: string;
  audioUrl?: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  statValue?: string;
  statLabel?: string;
  ctaText?: string;
  subText?: string;
}

interface RevideoCanvasPlayerProps {
  scene: SceneRenderData;
  currentTimeSec: number;
  isPlaying: boolean;
  className?: string;
}

/**
 * RevideoCanvasPlayer: Motor de Renderização de Canvas 2D Determinístico a 60 FPS
 * Executa qualquer um dos 20 templates com máxima fluidez e compatibilidade com WebCodecs e Puppeteer.
 */
export const RevideoCanvasPlayer: React.FC<RevideoCanvasPlayerProps> = ({
  scene,
  currentTimeSec,
  isPlaying,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  const templateMeta = MOTION_TEMPLATES.find((t) => t.id === scene.templateId) || MOTION_TEMPLATES[0];
  const highlightColor = scene.highlightColor || templateMeta.defaultHighlightColor;

  // Carregamento de imagens
  useEffect(() => {
    const urls = [scene.brollUrl, scene.authorAvatar].filter(Boolean) as string[];
    urls.forEach((url) => {
      if (!imageCacheRef.current[url]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          imageCacheRef.current[url] = img;
        };
      }
    });
  }, [scene.brollUrl, scene.authorAvatar]);

  // Loop de Renderização no Canvas (1080x1920)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const t = Math.max(0, currentTimeSec);
    const dur = scene.durationSec || 4.5;
    const progress = Math.min(1, t / dur);

    // Limpa o canvas
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, W, H);

    // 1. Fundo B-Roll com Efeito Ken Burns (Zoom 1.0 -> 1.15)
    const brollImg = scene.brollUrl ? imageCacheRef.current[scene.brollUrl] : null;
    if (brollImg && brollImg.complete && brollImg.naturalWidth > 0) {
      const scale = 1.0 + progress * 0.15;
      const imgW = W * scale;
      const imgH = H * scale;
      const offsetX = (W - imgW) / 2;
      const offsetY = (H - imgH) / 2;

      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.drawImage(brollImg, offsetX, offsetY, imgW, imgH);
      ctx.restore();
    }

    // 2. Vinheta Escura Cinematográfica Gradiente
    const grad = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 900);
    grad.addColorStop(0, 'rgba(5, 7, 15, 0.4)');
    grad.addColorStop(1, 'rgba(3, 4, 10, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Função auxiliar para desenhar cantos arredondados
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // 3. Renderização Dinâmica Baseada no Template
    const templateId = scene.templateId || 'hormozi_bold';

    // A) Badge Superior de Contexto
    const badgeText = (scene.tag || templateMeta.badge).toUpperCase();
    ctx.save();
    const badgeW = Math.min(800, ctx.measureText(badgeText).width * 2.5 + 80);
    const badgeH = 70;
    const badgeX = (W - badgeW) / 2;
    const badgeY = 220;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(badgeX, badgeY, badgeW, badgeH, 35);
    ctx.fill();

    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 3;
    roundRect(badgeX, badgeY, badgeW, badgeH, 35);
    ctx.stroke();

    ctx.font = '900 28px Inter, sans-serif';
    ctx.fillStyle = highlightColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, W / 2, badgeY + badgeH / 2);
    ctx.restore();

    // B) Conteúdo Central
    if (templateId === 'stat_counter') {
      // Template de Estatística Vox
      ctx.save();
      ctx.font = '900 160px Inter, sans-serif';
      ctx.fillStyle = highlightColor;
      ctx.textAlign = 'center';
      ctx.shadowColor = highlightColor;
      ctx.shadowBlur = 35;
      ctx.fillText(scene.statValue || '89%', W / 2, H / 2 - 40);

      ctx.font = '800 48px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      const labelLines = wrapText(ctx, (scene.statLabel || scene.text).toUpperCase(), 860);
      labelLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, H / 2 + 100 + i * 65);
      });
      ctx.restore();
    } else if (templateId === 'tweet_card') {
      // Template Tweet / X
      ctx.save();
      const cardW = 900;
      const cardH = 500;
      const cardX = (W - cardW) / 2;
      const cardY = H / 2 - cardH / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      roundRect(cardX, cardY, cardW, cardH, 36);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      roundRect(cardX, cardY, cardW, cardH, 36);
      ctx.stroke();

      // Autor
      ctx.font = '800 34px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(scene.authorName || 'Estrategista Viral', cardX + 130, cardY + 70);

      ctx.font = '600 26px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(scene.authorHandle || '@growth_master', cardX + 130, cardY + 110);

      // Verificado
      ctx.fillStyle = '#1d9bf0';
      ctx.font = '900 28px Inter, sans-serif';
      ctx.fillText('✓', cardX + 130 + ctx.measureText(scene.authorName || 'Estrategista Viral').width + 12, cardY + 70);

      // Texto do Tweet
      ctx.font = '600 44px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      const tweetLines = wrapText(ctx, scene.text, cardW - 100);
      tweetLines.forEach((line, i) => {
        ctx.fillText(line, cardX + 50, cardY + 200 + i * 62);
      });
      ctx.restore();
    } else if (templateId === 'cta_pulse') {
      // Template Botão de Ação CTA
      ctx.save();
      const pulse = 1.0 + Math.sin(t * 6) * 0.04;
      const btnW = 760 * pulse;
      const btnH = 130 * pulse;
      const btnX = (W - btnW) / 2;
      const btnY = H / 2 - 50;

      ctx.fillStyle = highlightColor;
      ctx.shadowColor = highlightColor;
      ctx.shadowBlur = 40;
      roundRect(btnX, btnY, btnW, btnH, 40);
      ctx.fill();

      ctx.font = '900 38px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText((scene.ctaText || scene.text).toUpperCase(), W / 2, btnY + btnH / 2);

      ctx.font = '600 32px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(scene.subText || 'Toque no link abaixo agora', W / 2, btnY + btnH + 60);
      ctx.restore();
    } else {
      // Template Padrão Hormozi Viral Bold
      ctx.save();
      ctx.font = '900 66px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 6;

      const lines = wrapText(ctx, scene.text.toUpperCase(), 920);
      const totalH = lines.length * 84;
      const startY = H / 2 - totalH / 2 + 50;

      lines.forEach((line, i) => {
        // Se a linha contém a palavra destacada, realça a cor
        if (scene.highlightWord && line.includes(scene.highlightWord.toUpperCase())) {
          ctx.fillStyle = highlightColor;
        } else {
          ctx.fillStyle = '#ffffff';
        }
        ctx.fillText(line, W / 2, startY + i * 84);
      });
      ctx.restore();
    }

    // 4. Barra de Progresso da Cena no Rodapé
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(80, H - 120, W - 160, 8);

    ctx.fillStyle = highlightColor;
    ctx.fillRect(80, H - 120, (W - 160) * progress, 8);
  }, [scene, currentTimeSec, templateMeta, highlightColor]);

  return (
    <div className={`relative aspect-[9/16] max-h-[82vh] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
};

// Utilitário para quebra de texto em múltiplas linhas no Canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
