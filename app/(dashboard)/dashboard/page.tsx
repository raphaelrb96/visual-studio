'use client';

import React from 'react';
import Link from 'next/link';
import {
  Film,
  Clock,
  HardDrive,
  Sparkles,
  ArrowRight,
  Play,
  Download,
  Trash2,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface MockVideo {
  id: string;
  title: string;
  preset: string;
  format: '9:16' | '16:9';
  duration: string;
  status: 'ready' | 'processing' | 'draft';
  createdAt: string;
  thumbnail: string;
}

const MOCK_VIDEOS: MockVideo[] = [
  {
    id: 'vid-1',
    title: 'A Maior Revolução de IA nos Negócios',
    preset: 'Dark Vox',
    format: '9:16',
    duration: '00:17.5',
    status: 'ready',
    createdAt: 'Hoje, 14:32',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vid-2',
    title: 'Top 5 Estratégias de Vídeo Vertical',
    preset: 'Kinetic Yellow',
    format: '9:16',
    duration: '00:32.0',
    status: 'ready',
    createdAt: 'Ontem, 19:15',
    thumbnail: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vid-3',
    title: 'Distribuição e Audiência em 2026',
    preset: 'Cyber News',
    format: '16:9',
    duration: '00:45.0',
    status: 'processing',
    createdAt: 'Ontem, 11:20',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vid-4',
    title: 'Roteiro de VSL Programático',
    preset: 'Minimalist Clean',
    format: '9:16',
    duration: '00:15.0',
    status: 'draft',
    createdAt: '24 de Out, 18:04',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Quick Action Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-r from-indigo-950 via-slate-900 to-[#0e1628] border border-indigo-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scale to Zero • Custo Próximo de Zero</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Crie vídeos com código e renderização determinística a 60 FPS
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Gere roteiros estruturados via Gemini, visualize no Canvas e exporte em MP4 de alta resolução com Cloud Run e FFmpeg nativo.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Criar Novo Vídeo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/presets"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-white font-semibold text-sm transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Explorar Presets</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Vídeos Gerados (Mês)
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight font-mono">24</div>
          <span className="text-xs text-emerald-400 font-semibold mt-2 inline-block">
            +38% em relação ao mês anterior
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Minutos Renderizados
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight font-mono">14.8 min</div>
          <span className="text-xs text-slate-400 font-medium mt-2 inline-block">
            Tempo médio de render: 4.2s por cena
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Armazenamento GCS
            </span>
            <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight font-mono">428 MB</div>
          <span className="text-xs text-slate-400 font-medium mt-2 inline-block">
            Bucket /renders & /raw_assets
          </span>
        </div>
      </div>

      {/* Recent Videos Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Vídeos Recentes</h2>
            <p className="text-xs text-slate-400">Projetos criados recentemente e status de exportação</p>
          </div>
          <Link
            href="/videos"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_VIDEOS.map((video) => (
            <div
              key={video.id}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5">
                  {video.status === 'ready' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Pronto (MP4)
                    </span>
                  )}
                  {video.status === 'processing' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                      Renderizando
                    </span>
                  )}
                  {video.status === 'draft' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-500/20 text-slate-300 border border-slate-500/40">
                      Rascunho
                    </span>
                  )}
                </div>

                {/* Format & Duration */}
                <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/90">
                  {video.format} • {video.duration}
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Preset: {video.preset}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-1 line-clamp-1 leading-snug">
                    {video.title}
                  </h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">{video.createdAt}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href="/create/motion-narrated/step-3-editor"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    <Play className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Abrir Editor</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    {video.status === 'ready' && (
                      <button
                        title="Download MP4"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      title="Excluir"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
