'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Search,
  Filter,
  Play,
  Download,
  Trash2,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

export default function VideosPage() {
  const [filter, setFilter] = useState<'all' | 'ready' | 'processing' | 'draft'>('all');
  const [search, setSearch] = useState('');

  const videos = [
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
    {
      id: 'vid-5',
      title: 'Acelerando Vendas com Motion Graphics',
      preset: 'Neon Velocity',
      format: '9:16',
      duration: '00:28.0',
      status: 'ready',
      createdAt: '22 de Out, 09:30',
      thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const filtered = videos.filter((v) => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Biblioteca de Vídeos</h1>
          <p className="text-sm text-slate-400">Gerencie todos os seus vídeos gerados e rascunhos</p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Vídeo</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou preset..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          {(['all', 'ready', 'processing', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'Todos' : tab === 'ready' ? 'Prontos' : tab === 'processing' ? 'Renderizando' : 'Rascunhos'}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((video) => (
          <div
            key={video.id}
            className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between group"
          >
            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute top-2.5 left-2.5">
                {video.status === 'ready' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Pronto (MP4)
                  </span>
                )}
                {video.status === 'processing' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                    Processando
                  </span>
                )}
                {video.status === 'draft' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-500/20 text-slate-300 border border-slate-500/40">
                    Rascunho
                  </span>
                )}
              </div>
              <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/90">
                {video.format} • {video.duration}
              </div>
            </div>

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
  );
}
