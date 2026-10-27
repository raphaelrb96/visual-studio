'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudioStore } from '@/lib/store/useStudioStore';
import {
  Sparkles,
  ArrowRight,
  Wand2,
  FileText,
  Clock,
  Layers,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ScriptScene } from '@/types/studio';

const TONES = [
  { id: 'Educacional', label: 'Educacional & Didático', desc: 'Explicações claras e baseadas em fatos' },
  { id: 'Polêmico', label: 'Provocativo & Retenção', desc: 'Ganchos contraintuitivos e alto engajamento' },
  { id: 'Vendas', label: 'Conversão & VSL', desc: 'Focado em proposta de valor e chamada para ação' },
  { id: 'Storytelling', label: 'Storytelling Narrativo', desc: 'Jornada imersiva e conexão emocional' },
];

export default function Step2ScriptPage() {
  const router = useRouter();
  const { manifest, setScenes } = useStudioStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  const [topic, setTopic] = useState('Como a automação com Video as Code está eliminando horas de edição manual');
  const [selectedTone, setSelectedTone] = useState('Educacional');
  const [durationSec, setDurationSec] = useState<30 | 60>(30);
  const [manualText, setManualText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate Script via API
  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          tone: selectedTone,
          durationSec,
          aspectRatio: manifest.aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao processar roteiro com IA');
      }

      setScenes(data.scenes);
      router.push('/create/motion-narrated/step-3-editor');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao conectar à API de geração.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert Manual Free-text to scenes
  const handleParseManualText = () => {
    if (!manualText.trim()) return;

    const paragraphs = manualText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 5);

    if (paragraphs.length === 0) return;

    const parsedScenes: ScriptScene[] = paragraphs.map((para, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === paragraphs.length - 1;

      if (isFirst) {
        return {
          id: `sc-manual-${idx}`,
          sceneIndex: idx,
          text: para,
          durationSec: 4.5,
          componentType: 'CardFrase',
          componentProps: {
            headline: 'ATENÇÃO',
            subtext: para.slice(0, 60),
            highlightWords: para.split(' ').slice(0, 2),
            badge: 'INTRODUÇÃO',
          },
        };
      }

      if (isLast) {
        return {
          id: `sc-manual-${idx}`,
          sceneIndex: idx,
          text: para,
          durationSec: 4.0,
          componentType: 'CTAButton',
          componentProps: {
            buttonText: 'Saiba Mais Agora',
            subcaption: para.slice(0, 50),
          },
        };
      }

      return {
        id: `sc-manual-${idx}`,
        sceneIndex: idx,
        text: para,
        durationSec: 4.5,
        componentType: 'CardFrase',
        componentProps: {
          headline: `CENA #${idx + 1}`,
          subtext: para,
          highlightWords: para.split(' ').slice(1, 3),
        },
      };
    });

    setScenes(parsedScenes);
    router.push('/create/motion-narrated/step-3-editor');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Passo 2 de 4 • Script Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Motor de Roteirização
          </h1>
          <p className="text-sm text-slate-400">
            Crie um roteiro pareado com componentes visuais usando Gemini ou cole seu próprio texto
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Gerar com IA</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'manual'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Texto Livre</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab: AI Generator */}
      {activeTab === 'ai' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Tópico, Assunto ou Notícia
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: 3 verdades desconfortáveis sobre inteligência artificial no mercado de trabalho..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
              Tom de Voz
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    selectedTone === tone.id
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold text-white block">{tone.label}</span>
                  <span className="text-xs text-slate-400 block mt-0.5">{tone.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Duration */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
              Duração Alvo do Vídeo
            </label>
            <div className="flex items-center gap-3">
              {[30, 60].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationSec(dur as 30 | 60)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all ${
                    durationSec === dur
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{dur} Segundos ({dur === 30 ? '~4 Cenas' : '~8 Cenas'})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleGenerateScript}
              disabled={isGenerating || !topic.trim()}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Estruturando Cenas com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Cenas & Abrir Canvas</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab: Manual Text */}
      {activeTab === 'manual' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 space-y-6">
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Cole seu Roteiro (Cada linha vira uma cena de motion)
            </label>
            <textarea
              rows={8}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Cole seu roteiro aqui. Cada parágrafo será automaticamente mapeado para uma cena com animações sincronizadas..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handleParseManualText}
              disabled={!manualText.trim()}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Processar Texto & Abrir Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
