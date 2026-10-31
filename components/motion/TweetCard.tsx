'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack, hyperInterpolate } from '@/lib/hyperframe';
import { Check, ShieldCheck, Heart, Share2, MessageCircle } from 'lucide-react';

interface TweetCardProps {
  authorName?: string;
  authorHandle?: string;
  avatarUrl?: string;
  tweetText?: string;
  metrics?: { likes: string; retweets: string };
  preset: StylePreset;
  progress?: number;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  authorName = 'Alex Hormozi',
  authorHandle = '@AlexHormozi',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  tweetText = 'Se você não usa vídeos verticais para vender em 2026, você simplesmente não existe para o mercado.',
  metrics = { likes: '14.2K', retweets: '3.8K' },
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;

  const entry = Math.min(1, (progress || 0) / 0.3);
  const scale = hyperEaseOutBack(entry);
  const rotateX = hyperInterpolate(entry, [0, 1], [15, 0]);

  return (
    <div
      className="w-full flex items-center justify-center p-4 select-none"
      style={{
        transform: `perspective(800px) scale(${scale}) rotateX(${rotateX}deg)`,
      }}
    >
      <div className="w-full max-w-sm rounded-3xl p-6 bg-black/90 backdrop-blur-2xl border-2 border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-4">
        {/* Header do Perfil */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">{authorName}</span>
                <span className="w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-[10px] text-black font-black">
                  ✓
                </span>
              </div>
              <span className="text-xs text-slate-400">{authorHandle}</span>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-400">𝕏 Post</span>
        </div>

        {/* Texto do Post */}
        <p className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
          &ldquo;{tweetText}&rdquo;
        </p>

        {/* Métricas de Engajamento */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span className="flex items-center gap-1 text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-rose-400" /> {metrics.likes}
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Share2 className="w-3.5 h-3.5" /> {metrics.retweets}
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <MessageCircle className="w-3.5 h-3.5" /> Comentários
          </span>
        </div>
      </div>
    </div>
  );
};
