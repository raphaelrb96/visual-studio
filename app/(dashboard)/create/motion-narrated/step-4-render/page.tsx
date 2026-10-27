'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStudioStore } from '@/lib/store/useStudioStore';
import {
  Sparkles,
  CheckCircle2,
  Download,
  Copy,
  Share2,
  RefreshCw,
  Film,
  ArrowRight,
  ExternalLink,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function Step4RenderPage() {
  const { manifest } = useStudioStore();

  const [status, setStatus] = useState<
    'initializing' | 'synthesizing' | 'compiling' | 'encoding' | 'completed'
  >('initializing');
  const [progress, setProgress] = useState(10);
  const [copied, setCopied] = useState(false);

  // Mock output URL on GCS
  const videoDownloadUrl =
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    // Pipeline stage simulation mimicking Cloud Run worker progress
    const t1 = setTimeout(() => {
      setStatus('synthesizing');
      setProgress(35);
    }, 1500);

    const t2 = setTimeout(() => {
      setStatus('compiling');
      setProgress(68);
    }, 3800);

    const t3 = setTimeout(() => {
      setStatus('encoding');
      setProgress(90);
    }, 6200);

    const t4 = setTimeout(() => {
      setStatus('completed');
      setProgress(100);
    }, 8500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

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
            ? 'Vídeo Renderizado com Sucesso!'
            : 'Processando Renderização Serverless'}
        </h1>
        <p className="text-sm text-slate-400">
          Job ID: <span className="font-mono text-indigo-400">{manifest.jobId}</span> • GCP Cloud Run Container Worker
        </p>
      </div>

      {/* Progress & Pipeline Box */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Progresso do Pipeline
            </span>
            <span className="text-xs font-mono font-black text-indigo-400">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 3 Active Pipeline Steps */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              progress >= 35
                ? 'bg-slate-900/90 border-emerald-500/30 text-white'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              {progress > 35 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : progress >= 10 ? (
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-700" />
              )}
              <div>
                <span className="text-xs font-bold block">
                  [1/3] Sintetizando Voz e Gerando Timestamps (Whisper)...
                </span>
                <span className="text-[11px] text-slate-400">
                  Voz: {manifest.audio.ttsVoiceId} • Alinhamento palavra a palavra (.ass)
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {progress > 35 ? 'Concluído' : 'Processando'}
            </span>
          </div>

          {/* Step 2 */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              progress >= 68
                ? 'bg-slate-900/90 border-emerald-500/30 text-white'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              {progress > 68 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : progress >= 35 ? (
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-700" />
              )}
              <div>
                <span className="text-xs font-bold block">
                  [2/3] Compilando HTML/CSS no HyperFrames...
                </span>
                <span className="text-[11px] text-slate-400">
                  Rasterizando frames a 60 FPS • {manifest.resolution.width}x{manifest.resolution.height}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {progress > 68 ? 'Concluído' : progress >= 35 ? 'Executando' : 'Aguardando'}
            </span>
          </div>

          {/* Step 3 */}
          <div
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              progress >= 100
                ? 'bg-slate-900/90 border-emerald-500/30 text-white'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              {progress === 100 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : progress >= 68 ? (
                <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-700" />
              )}
              <div>
                <span className="text-xs font-bold block">
                  [3/3] Encodando MP4 final no FFmpeg (Cloud Run)...
                </span>
                <span className="text-[11px] text-slate-400">
                  Codec H.264 / AAC • Mesclagem de trilha, voz e legendas queimadas
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {progress === 100 ? 'Finalizado' : progress >= 68 ? 'Encodando' : 'Aguardando'}
            </span>
          </div>
        </div>

        {/* Video Completed Player & Actions */}
        {status === 'completed' && (
          <div className="pt-6 border-t border-slate-800 space-y-6 animate-scale-in">
            {/* Player Preview */}
            <div className="rounded-2xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-white/10">
              <video
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
                src={videoDownloadUrl}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={videoDownloadUrl}
                download="video-final.mp4"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Download MP4</span>
              </a>

              <button
                onClick={handleCopyLink}
                className="py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <Link
                href="/dashboard"
                className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Voltar ao Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
