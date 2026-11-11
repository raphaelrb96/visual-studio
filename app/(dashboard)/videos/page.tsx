'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Film,
  Search,
  Download,
  Trash2,
  PlusCircle,
  Loader2,
  Edit3,
  CheckSquare,
  Square,
  AlertTriangle,
  X,
  Clock,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/app/lib/AuthContext';
import { getUserVideos, deleteDocument, VideoRecord } from '@/app/lib/firestore';

export default function VideosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'ready' | 'processing' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de Múltipla Seleção
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const loadVideos = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUserVideos(user.uid);
      setVideos(data);
      setSelectedIds([]);
    } catch (err) {
      console.error('Erro ao listar vídeos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [user]);

  // Toggle de seleção de um único vídeo
  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Selecionar todos os vídeos exibidos no filtro atual
  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((v) => v.id));
    }
  };

  // Exclusão individual
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir este projeto/vídeo?')) return;
    try {
      await deleteDocument('projects', id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch {
      alert('Erro ao excluir projeto');
    }
  };

  // Exclusão em Lote (Bulk Delete)
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Tem certeza de que deseja excluir os ${selectedIds.length} vídeos/projetos selecionados? Essa ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    setIsDeletingBulk(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteDocument('projects', id)));
      setVideos((prev) => prev.filter((v) => !selectedIds.includes(v.id)));
      setSelectedIds([]);
    } catch (err) {
      alert('Ocorreu um erro ao excluir alguns projetos selecionados.');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const filtered = videos
    .filter((v) => {
      if (filter !== 'all' && v.status !== filter) return false;
      if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Film className="w-7 h-7 text-indigo-400" />
            <span>Meus Vídeos & Projetos</span>
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie, continue editando rascunhos e visualize vídeos concluídos
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

      {/* Barra de Filtros, Busca e Ações em Lote */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtros por Status */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {(
              [
                { key: 'all', label: 'Todos' },
                { key: 'ready', label: 'Prontos' },
                { key: 'processing', label: 'Renderizando' },
                { key: 'draft', label: 'Rascunhos' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filter === t.key
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Botão Selecionar Todos */}
          {filtered.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 font-semibold transition-all"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-500" />
              )}
              <span>{isAllSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
            </button>
          )}
        </div>

        {/* Campo de Busca */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* BARRA FLUTUANTE DE AÇÃO EM LOTE (QUANDO HOUVER SELEÇÃO) */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900/90 to-slate-900/90 border border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">
              {selectedIds.length}
            </span>
            <div>
              <span className="font-bold text-white block">
                {selectedIds.length === 1
                  ? '1 item selecionado'
                  : `${selectedIds.length} itens selecionados`}
              </span>
              <span className="text-xs text-rose-300/80">
                Você pode excluir todos de uma vez
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancelar</span>
            </button>

            <button
              onClick={handleDeleteSelected}
              disabled={isDeletingBulk}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {isDeletingBulk ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Selecionados ({selectedIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Grid de Vídeos / Projetos */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum projeto ou vídeo encontrado</h3>
          <p className="text-xs text-slate-400 mb-6">
            {search ? 'Nenhum resultado para os termos da busca.' : 'Você ainda não possui projetos salvos.'}
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
          {filtered.map((video) => {
            const isSelected = selectedIds.includes(video.id);

            return (
              <div
                key={video.id}
                onClick={() => router.push(`/create?id=${video.id}`)}
                className={`group cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between relative ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Checkbox de Seleção */}
                      <button
                        type="button"
                        onClick={(e) => toggleSelect(e, video.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          isSelected
                            ? 'text-indigo-400 bg-indigo-600/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={isSelected ? 'Desmarcar' : 'Selecionar'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {video.aspectRatio || video.format || '9:16'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        video.status === 'ready'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : video.status === 'processing' || video.status === 'rendering'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {video.status === 'ready'
                        ? 'Vídeo Pronto'
                        : video.status === 'processing' || video.status === 'rendering'
                        ? 'Processando'
                        : 'Rascunho (Editar)'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {video.duration ? `${Math.round(video.duration)}s de duração` : 'Projeto em edição'}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-col gap-0.5 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>
                        Atualizado: {formatDateTime(video.updatedAt) || formatDateTime(video.createdAt) || 'Hoje'}
                      </span>
                    </span>
                    {video.createdAt && (
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>Criado em: {formatDateTime(video.createdAt)}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-semibold group-hover:underline mr-1">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Abrir</span>
                    </span>

                    {video.videoUrl && (
                      <a
                        href={video.videoUrl}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                        title="Download MP4"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, video.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                      title="Excluir projeto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
