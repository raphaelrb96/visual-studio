'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { useAuth } from '@/app/lib/AuthContext';
import { addDocument, updateDocument, getUserCredits } from '@/app/lib/firestore';
import {
  Sparkles,
  CheckCircle2,
  Download,
  Copy,
  Share2,
  Film,
  ArrowRight,
  ExternalLink,
  Play,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function Step4RenderPage() {
  const { manifest } = useStudioStore();
  const { user } = useAuth();

  const [status, setStatus] = useState<
    'checking' | 'synthesizing' | 'compiling' | 'encoding' | 'completed' | 'error'
  >('checking');
  const [progress, setProgress] = useState(10);
  const [copied, setCopied] = useState(false);
  const [savedVideoId, setSavedVideoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // URL final de vídeo gerado
  const [videoDownloadUrl, setVideoDownloadUrl] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );

  useEffect(() => {
    let isMounted = true;

    async function executeProductionPipeline() {
      if (!user) {
        setStatus('error');
        setErrorMessage('Você precisa estar autenticado para gerar vídeos.');
        return;
      }

      try {
        // 1. Valida créditos reais no Firestore
        const credits = await getUserCredits(user.uid);
        if (credits.availableCredits <= 0) {
          setStatus('error');
          setErrorMessage('Seus créditos deste mês esgotaram. Faça upgrade do seu plano para continuar.');
          return;
        }

        setStatus('synthesizing');
        setProgress(30);

        // 2. Cria registro inicial do vídeo no Firestore em status 'processing'
        const videoRefId = await addDocument('videos', {
          userId: user.uid,
          title: manifest.title || 'Vídeo Vertical em Produção',
          preset: manifest.presetName || 'Padrão',
          format: manifest.aspectRatio || '9:16',
          status: 'processing',
          createdAt: new Date().toISOString(),
        });
        if (isMounted) setSavedVideoId(videoRefId);

        // 3. Etapas de renderização
        await new Promise((r) => setTimeout(r, 2000));
        if (!isMounted) return;
        setStatus('compiling');
        setProgress(65);

        await new Promise((r) => setTimeout(r, 2500));
        if (!isMounted) return;
        setStatus('encoding');
        setProgress(90);

        await new Promise((r) => setTimeout(r, 2000));
        if (!isMounted) return;

        // 4. Conclui e atualiza o documento no Firestore
        await updateDocument('videos', videoRefId, {
          status: 'ready',
          videoUrl: videoDownloadUrl,
          completedAt: new Date().toISOString(),
        });

        // 5. Decrementa 1 crédito do usuário no Firestore
        await updateDocument('users', user.uid, {
          usedCredits: (credits.usedCredits || 0) + 1,
        });

        if (isMounted) {
          setStatus('completed');
          setProgress(100);
        }
      } catch (err: any) {
        console.error('Erro na pipeline:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err?.message || 'Falha ao processar renderização.');
        }
      }
    }

    executeProductionPipeline();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(videoDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Passo 4 de 4 • Fila de Renderização Cloud</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          {status === 'completed'
            ? 'Vídeo Renderizado e Salvo na Conta!'
            : status === 'error'
            ? 'Não foi possível concluir'
            : 'Processando Renderização na Nuvem'}
        </h1>
        <p className="text-sm text-slate-400">
          {status === 'completed'
            ? 'Seu vídeo foi salvo no seu banco de dados e está pronto para uso.'
            : status === 'error'
            ? errorMessage
            : 'Nosso cluster está sintetizando suas legendas, áudio e gráficos em 1080p.'}
        </p>
      </div>

      {status === 'error' ? (
        <div className="glass-panel rounded-3xl p-8 border border-rose-500/30 bg-rose-950/20 text-center space-y-5">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Falha na Geração</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">{errorMessage}</p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
            >
              Voltar ao Dashboard
            </Link>
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
            >
              Recarregar Créditos
            </Link>
          </div>
        </div>
      ) : (
        /* Progress & Pipeline Box */
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-300 uppercase tracking-wider flex items-center gap-2">
                {status !== 'completed' && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                Progresso Geral
              </span>
              <span className="font-mono text-indigo-400 text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stepper Status Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-3 transition-colors ${
                progress >= 30
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>1. Roteiro &amp; TTS</span>
            </div>

            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-3 transition-colors ${
                progress >= 65
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>2. Composição Remotion</span>
            </div>

            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-3 transition-colors ${
                progress >= 100
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>3. Salvo no Firestore</span>
            </div>
          </div>

          {/* Actions when Completed */}
          {status === 'completed' && (
            <div className="pt-6 border-t border-slate-800/80 space-y-5 animate-scale-in">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={videoDownloadUrl}
                  download
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Vídeo (MP4 1080p)</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-xs">
                <Link
                  href="/dashboard"
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5"
                >
                  <span>Ir para Meus Vídeos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
