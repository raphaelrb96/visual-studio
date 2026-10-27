'use client';

import React, { useState } from 'react';
import {
  Key,
  Shield,
  Cloud,
  Save,
  Check,
  Server,
  Database,
  Cpu,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [workerUrl, setWorkerUrl] = useState('https://render-worker-xyz.a.run.app');
  const [workerSecret, setWorkerSecret] = useState('••••••••••••••••');
  const [gcsBucket, setGcsBucket] = useState('visual-studio-renders');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Key className="w-6 h-6 text-indigo-400" />
          <span>Configurações & Chaves de API</span>
        </h1>
        <p className="text-sm text-slate-400">
          Gerencie integrações de IA, Cloud Run e infraestrutura serverless
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Key Box */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Gemini Orchestrator</h2>
              <p className="text-xs text-slate-400">
                Utilizado para o motor de roteirização automatizado em JSON estruturado
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Obtenha sua chave no Google AI Studio. (Se omitida, o sistema usa o motor determinístico padrão).
            </span>
          </div>
        </div>

        {/* Cloud Run Worker Service */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">GCP Cloud Run Worker (Renderizador)</h2>
              <p className="text-xs text-slate-400">
                Container Node.js com FFmpeg, HyperFrames e Edge TTS com Scale to Zero
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                URL do Serviço Cloud Run
              </label>
              <input
                type="text"
                value={workerUrl}
                onChange={(e) => setWorkerUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Token Secreto (Bearer Auth)
              </label>
              <input
                type="password"
                value={workerSecret}
                onChange={(e) => setWorkerSecret(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Google Cloud Storage */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Cloud Storage (GCS)</h2>
              <p className="text-xs text-slate-400">
                Buckets para persistência de assets brutos e exportação final dos arquivos MP4
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Bucket de Exportação (/renders)
            </label>
            <input
              type="text"
              value={gcsBucket}
              onChange={(e) => setGcsBucket(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
