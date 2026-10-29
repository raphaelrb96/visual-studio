'use client';

import React, { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/app/lib/AuthContext';
import { getUserVideos, deleteDocument, VideoRecord } from '@/app/lib/firestore';

export default function VideosPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'ready' | 'processing' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getUserVideos(user.uid);
        setVideos(data);
      } catch (err) {
        console.error('Erro ao listar vídeos:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este vídeo?')) return;
    try {
      await deleteDocument('videos', id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch {
      alert('Erro ao excluir vídeo');
    }
  };

  const filtered = videos.filter((v) => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Film className="w-7 h-7 text-indigo-400" />
            <span>Meus Vídeos</span>
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie, visualize e baixe todos os vídeos produzidos na sua conta
          </p>
        </div>

        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Novo Vídeo</span>
        </Link>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'ready', 'processing', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab === 'all' ? 'Todos' : tab === 'ready' ? 'Prontos' : tab === 'processing' ? 'Renderizando' : 'Rascunhos'}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="glass-panel rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
          <p className="text-sm text-slate-400">Carregando seus vídeos salvos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-16 text-center border border-dashed border-slate-800">
          <Film className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum vídeo encontrado</h3>
          <p className="text-xs text-slate-400 mb-6">
            {search ? 'Nenhum resultado para os termos da busca.' : 'Você ainda não possui vídeos neste status.'}
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Vídeo Agora</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {video.format || '9:16'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      video.status === 'ready'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : video.status === 'processing'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {video.status === 'ready' ? 'Pronto' : video.status === 'processing' ? 'Processando' : 'Rascunho'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-2 mb-1">{video.title}</h3>
                <p className="text-xs text-slate-400">{video.preset || 'Padrão'}</p>
              </div>

              <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {video.createdAt ? new Date(video.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
                </span>
                <div className="flex items-center gap-2">
                  {video.videoUrl && (
                    <a
                      href={video.videoUrl}
                      download
                      className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                      title="Download MP4"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
