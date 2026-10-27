'use client';

import React from 'react';
import Link from 'next/link';
import {
  Film,
  Scissors,
  UserCheck,
  BarChart3,
  MessageSquare,
  BadgeDollarSign,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface VideoTypeCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  active: boolean;
  href: string;
  badge?: string;
  gradient: string;
}

const VIDEO_TYPES: VideoTypeCard[] = [
  {
    id: 'motion_narrated',
    title: 'Vídeo Narrado (Motion & Visuals)',
    description: 'Roteiro narrado com cards cinéticos, gráficos dinâmicos de dados e retenção programática.',
    icon: Film,
    active: true,
    badge: 'MVP ATIVO',
    href: '/create/motion-narrated/step-1-style',
    gradient: 'from-indigo-600 to-cyan-500',
  },
  {
    id: 'smart_clips',
    title: 'Vídeo de Cortes (Smart Repurpose)',
    description: 'Transforme podcasts longos e vídeos do YouTube em cortes verticais com legendas automáticas.',
    icon: Scissors,
    active: false,
    badge: 'EM BREVE',
    href: '#',
    gradient: 'from-purple-600 to-pink-500',
  },
  {
    id: 'avatar_lipsync',
    title: 'Avatar Dublado (Lipsync)',
    description: 'Apresentadores realistas gerados por IA com dublagem labial sincronizada por áudio.',
    icon: UserCheck,
    active: false,
    badge: 'EM BREVE',
    href: '#',
    gradient: 'from-blue-600 to-indigo-500',
  },
  {
    id: 'data_motion',
    title: 'Data Motion & Rankings',
    description: 'Gráficos de barras em corrida, tabelas comparativas e contadores para conteúdo de dados.',
    icon: BarChart3,
    active: false,
    badge: 'EM BREVE',
    href: '#',
    gradient: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'chat_story',
    title: 'Text & Canvas Storytelling',
    description: 'Simulações de conversas no WhatsApp/iMessage e mensagens de texto com storytelling envolvente.',
    icon: MessageSquare,
    active: false,
    badge: 'EM BREVE',
    href: '#',
    gradient: 'from-amber-600 to-yellow-500',
  },
  {
    id: 'motion_ads',
    title: 'Motion Ads & VSL Showcase',
    description: 'Criativos publicitários de alta conversão para tráfego pago, lançamentos e e-commerce.',
    icon: BadgeDollarSign,
    active: false,
    badge: 'EM BREVE',
    href: '#',
    gradient: 'from-rose-600 to-orange-500',
  },
];

export default function CreateVideoSelectorPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Passo 1 de 5</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Escolha o Formato de Vídeo
        </h1>
        <p className="text-sm text-slate-400">
          Selecione o motor de geração ideal para o objetivo do seu conteúdo
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEO_TYPES.map((type) => {
          const Icon = type.icon;

          if (type.active) {
            return (
              <Link
                key={type.id}
                href={type.href}
                className="group relative glass-panel rounded-3xl p-6 border-2 border-indigo-500/40 hover:border-indigo-500 transition-all duration-300 hover:scale-[1.02] shadow-2xl flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${type.gradient} flex items-center justify-center text-white shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {type.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                    {type.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {type.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-400">
                  <span>Iniciar Criação</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          }

          return (
            <div
              key={type.id}
              className="relative glass-panel rounded-3xl p-6 border border-white/5 opacity-60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {type.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-300">{type.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {type.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs text-slate-500 font-medium">
                Disponível na próxima atualização
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
