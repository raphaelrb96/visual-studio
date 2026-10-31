'use client';

import React from 'react';
import { StylePreset } from '@/types/studio';
import { hyperEaseOutBack, hyperInterpolate } from '@/lib/hyperframe';
import { MessageCircle, CheckCheck } from 'lucide-react';

interface ChatSimulationProps {
  contactName?: string;
  senderText?: string;
  replyText?: string;
  timeStr?: string;
  preset: StylePreset;
  progress?: number;
}

export const ChatSimulation: React.FC<ChatSimulationProps> = ({
  contactName = 'Cliente Potencial',
  senderText = 'Quanto custa para você produzir os vídeos da minha empresa?',
  replyText = 'Menos de R$ 1 por vídeo e tudo é gerado em 60 segundos!',
  timeStr = '14:32',
  preset,
  progress = 0.5,
}) => {
  const { theme } = preset;

  // Animação de entrada dos balões de conversa
  const msg1Progress = Math.min(1, (progress || 0) / 0.35);
  const msg2Progress = Math.min(1, Math.max(0, ((progress || 0) - 0.35) / 0.45));

  const scale1 = hyperEaseOutBack(msg1Progress);
  const scale2 = hyperEaseOutBack(msg2Progress);

  return (
    <div className="w-full flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm rounded-3xl p-5 bg-[#0b141a]/95 backdrop-blur-2xl border-2 border-emerald-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-4">
        {/* Cabeçalho do Chat */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            {contactName.slice(0, 1)}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">{contactName}</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> online
            </span>
          </div>
        </div>

        {/* Mensagem 1: Pergunta / Dor */}
        <div
          className="flex justify-start transition-all"
          style={{ transform: `scale(${scale1})`, opacity: msg1Progress }}
        >
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 bg-slate-800 text-slate-100 text-xs sm:text-sm font-semibold shadow">
            <p>&ldquo;{senderText}&rdquo;</p>
            <span className="text-[9px] text-slate-400 block text-right mt-1">{timeStr}</span>
          </div>
        </div>

        {/* Mensagem 2: Resposta / Solução Irresistível */}
        {msg2Progress > 0 && (
          <div
            className="flex justify-end transition-all"
            style={{ transform: `scale(${scale2})`, opacity: msg2Progress }}
          >
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm p-3.5 bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-lg">
              <p>&ldquo;{replyText}&rdquo;</p>
              <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200 mt-1">
                <span>{timeStr}</span>
                <CheckCheck className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
