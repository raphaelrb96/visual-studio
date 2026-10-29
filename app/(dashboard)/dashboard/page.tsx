'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Clock,
  Sparkles,
  ArrowRight,
  Play,
  Download,
  Trash2,
  ExternalLink,
  PlusCircle,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/app/lib/AuthContext';
import { getUserVideos, getUserCredits, deleteDocument, VideoRecord, UserCredits } from '@/app/lib/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [userVids, userCreds] = await Promise.all([
        getUserVideos(user.uid),
        getUserCredits(user.uid),
      ]);
      setVideos(userVids);
      setCredits(userCreds);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Deseja realmente excluir este vídeo?')) return;
    try {
      await deleteDocument('videos', id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert('Erro ao excluir vídeo');
    }
  };

  const readyCount = videos.filter((v) => v.status === 'ready').length;
  const processingCount = videos.filter((v) => v.status === 'processing').length;

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-r from-indigo-950 via-slate-900 to-[#0e1628] border border-indigo-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel de Produção em Tempo Real</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Olá, {user?.displayName || 'Criador'}! Vamos gerar novos vídeos hoje?
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Seu saldo atual:{' '}
            <strong className="text-white">
              {credits ? `${credits.availableCredits} de ${credits.totalCredits} vídeos restantes` : 'Carregando...'}
            </strong>{' '}
            neste mês.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Gerar Novo Vídeo</span>
            </Link>
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              <span>Ver Meus Vídeos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Produzido</span>
            <Film className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{videos.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Vídeos gerados na conta</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prontos para Download</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{readyCount}</p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Disponíveis em 1080p Full HD</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Na Fila de Render</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{processingCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Processando na nuvem</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Créditos Restantes</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {credits ? credits.availableCredits : '...'}
          </p>
          <span className="text-[11px] text-amber-400/90 mt-1 block">
            Plano: {credits?.plan === 'free' ? 'Gratuito (Teste)' : credits?.plan || 'Ativo'}
          </span>
        </div>
      </div>

      {/* Lista de Vídeos Recentes (Dados Reais do Firestore) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-400" />
              <span>Vídeos Recentes</span>
            </h2>
            <p className="text-xs text-slate-400">Vídeos gerados e salvos no seu perfil</p>
          </div>
          <Link
            href="/videos"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm text-slate-400 font-medium">Carregando seus vídeos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-dashed border-slate-700/80">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-4">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Nenhum vídeo gerado ainda</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
              Você ainda não gerou vídeos na sua conta. Escolha um modelo e gere seu primeiro vídeo em segundos!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Meu Primeiro Vídeo</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {videos.slice(0, 6).map((video) => (
              <div
                key={video.id}
                className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
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

                  <h3 className="text-sm font-bold text-white line-clamp-2 mb-1 group-hover:text-indigo-300 transition-colors">
                    {video.title || 'Vídeo sem título'}
                  </h3>
                  <p className="text-xs text-slate-400">{video.preset || 'Estilo Dinâmico'}</p>
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
                        title="Baixar MP4"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
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
    </div>
  );
}
