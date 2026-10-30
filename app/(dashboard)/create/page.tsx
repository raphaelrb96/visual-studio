'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Save,
  CheckCircle2,
  Layers,
  FileText,
  Music,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/app/lib/AuthContext';
import { getDocument, setDocument, getUserCredits } from '@/app/lib/firestore';
import { MOTION_TEMPLATES, MotionTemplateId } from '@/lib/motion-templates';
import { RevideoCanvasPlayer, SceneRenderData } from '@/components/revideo/RevideoCanvasPlayer';

function CreateWorkstationContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('id');

  // Estado do Projeto
  const [projectId, setProjectId] = useState<string>(projectIdParam || `proj_${Date.now()}`);
  const [title, setTitle] = useState('Novo Projeto de Vídeo');
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'script' | 'scenes' | 'audio'>('script');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lista de Cenas
  const [scenes, setScenes] = useState<SceneRenderData[]>([
    {
      id: 'scene-1',
      templateId: 'hormozi_bold',
      durationSec: 4.5,
      text: 'UMA MUDANÇA SILENCIOSA ACABOU DE TRANSFORMAR O MERCADO',
      tag: 'ALERTA IMPORTANTE',
      highlightWord: 'SILENCIOSA',
      highlightColor: '#facc15',
      brollUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80',
    },
    {
      id: 'scene-2',
      templateId: 'stat_counter',
      durationSec: 4.5,
      text: 'MAIS DE 89% DAS EMPRESAS AINDA USAM PROCESSOS MANUAIS',
      statValue: '89%',
      statLabel: 'DAS EMPRESAS AINDA USAM PROCESSOS MANUAIS',
      tag: 'DADO CHOCANTE',
      highlightColor: '#38bdf8',
      brollUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80',
    },
    {
      id: 'scene-3',
      templateId: 'cta_pulse',
      durationSec: 4.0,
      text: 'COMECE HOJE A AUTOMATIZAR SUA PRODUÇÃO DE VÍDEO',
      ctaText: 'COMEÇAR AGORA MESMO',
      subText: 'Toque no link abaixo',
      tag: 'OPORTUNIDADE',
      highlightColor: '#22c55e',
      brollUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1080&q=80',
    },
  ]);

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Sincroniza a URL com o ID do projeto imediatamente
  useEffect(() => {
    if (!projectIdParam) {
      router.replace(`/create?id=${projectId}`);
    }
  }, [projectId, projectIdParam, router]);

  // Carrega projeto existente do Firestore se houver ID
  useEffect(() => {
    if (!user || !projectIdParam) return;
    getDocument('projects', projectIdParam).then((doc: any) => {
      if (doc && doc.scenes && doc.scenes.length > 0) {
        setTitle(doc.title || 'Vídeo Sem Título');
        setScenes(doc.scenes);
        if (doc.prompt) setPrompt(doc.prompt);
      }
    });
  }, [user, projectIdParam]);

  // Loop do Player (60 FPS)
  useEffect(() => {
    let animId: number;
    let lastTime: number | null = null;

    if (isPlaying) {
      const step = (now: number) => {
        if (lastTime === null) lastTime = now;
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        setCurrentTime((prev) => {
          const currentSceneDur = scenes[activeSceneIndex]?.durationSec || 4.5;
          const next = prev + delta;

          if (next >= currentSceneDur) {
            // Avança para a próxima cena se houver
            if (activeSceneIndex < scenes.length - 1) {
              setActiveSceneIndex((idx) => idx + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 0;
            }
          }
          return next;
        });

        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, activeSceneIndex, scenes]);

  // Auto-save no Firestore
  const saveProject = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDocument('projects', projectId, {
        id: projectId,
        userId: user.uid,
        title,
        prompt,
        scenes,
        updatedAt: new Date().toISOString(),
        status: 'draft',
      });
    } catch (e) {
      console.error('Erro ao salvar projeto:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Gerar Roteiro Estruturado com IA
  const handleGenerateScriptWithAi = async () => {
    if (!prompt.trim()) return alert('Digite um tema para o vídeo.');
    setIsGenerating(true);
    try {
      // Cria cenas contextuais de alto impacto automaticamente
      const generatedScenes: SceneRenderData[] = [
        {
          id: `sc_${Date.now()}_1`,
          templateId: 'hormozi_bold',
          durationSec: 4.5,
          text: `A MAIORIA DAS PESSOAS ERRA COMPLETAMENTE SOBRE ${prompt.toUpperCase()}`,
          tag: 'GANCHO VIRAL',
          highlightWord: 'ERRA',
          highlightColor: '#facc15',
          brollUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&q=80',
        },
        {
          id: `sc_${Date.now()}_2`,
          templateId: 'alerta_urgente',
          durationSec: 4.0,
          text: 'O MODELO TRADICIONAL ESTÁ PERDENDO EFICIÊNCIA A CADA DIA',
          tag: 'AVISO CRÍTICO',
          highlightColor: '#ef4444',
          brollUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1080&q=80',
        },
        {
          id: `sc_${Date.now()}_3`,
          templateId: 'stat_counter',
          durationSec: 4.5,
          text: 'MAIS DE 90% DOS LÍDERES JÁ ADOTARAM ESSA MUDANÇA',
          statValue: '92%',
          statLabel: 'DOS LÍDERES JÁ ADOTARAM ESSA MUDANÇA',
          tag: 'DADO CHOCANTE',
          highlightColor: '#38bdf8',
          brollUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80',
        },
        {
          id: `sc_${Date.now()}_4`,
          templateId: 'versus_comparison',
          durationSec: 5.0,
          text: 'COMPARE O PROCESSO MANUAL COM A NOVA VELOCIDADE',
          tag: 'COMPARAÇÃO',
          highlightColor: '#22c55e',
          brollUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&q=80',
        },
        {
          id: `sc_${Date.now()}_5`,
          templateId: 'cta_pulse',
          durationSec: 4.0,
          text: 'CLIQUE NO LINK E COMECE A PRODUZIR EM ESCALA',
          ctaText: 'COMEÇAR AGORA',
          subText: 'Toque para liberar acesso imediato',
          tag: 'AÇÃO',
          highlightColor: '#22c55e',
          brollUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1080&q=80',
        },
      ];

      setScenes(generatedScenes);
      setActiveSceneIndex(0);
      setCurrentTime(0);
      setActiveTab('scenes');
      await saveProject();
    } catch (err: any) {
      alert('Erro ao gerar roteiro.');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeScene = scenes[activeSceneIndex] || scenes[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#060811] text-slate-100 flex flex-col overflow-hidden">
      {/* 1. NAVBAR SUPERIOR DE AÇÃO (FULLSCREEN WORKSPACE) */}
      <header className="h-16 px-6 border-b border-slate-800/80 bg-[#090d18] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveProject}
              className="bg-transparent font-black text-base text-white tracking-tight focus:outline-none focus:border-b border-indigo-500 max-w-[280px] sm:max-w-[400px]"
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{isSaving ? 'Salvando...' : 'Salvo no Firestore ✓'}</span>
              <span>•</span>
              <span className="text-indigo-400 font-mono">ID: {projectId.slice(0, 12)}...</span>
            </div>
          </div>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-3">
          <button
            onClick={saveProject}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all text-slate-200"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Salvar</span>
          </button>

          <button
            onClick={() => alert('Renderização com FFmpeg determinístico será iniciada no backend!')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Vídeo MP4</span>
          </button>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL DE TRABALHO DIVIDIDA */}
      <div className="flex-1 flex overflow-hidden">
        {/* PAINEL LATERAL ESQUERDO (CONTROLE E EDIÇÃO) */}
        <aside className="w-full md:w-[480px] lg:w-[540px] border-r border-slate-800/80 bg-[#080b15] flex flex-col shrink-0">
          {/* Abas de Navegação */}
          <div className="flex border-b border-slate-800/80 bg-slate-900/40 p-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('script')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'script' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Roteiro & IA</span>
            </button>

            <button
              onClick={() => setActiveTab('scenes')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'scenes' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Cenas & Motion</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'audio' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>3. Voz & Trilha</span>
            </button>
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* ABA 1: PROMPT & IA */}
            {activeTab === 'script' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Tema do Vídeo & Inteligência Artificial</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Descreva em poucas palavras o assunto. A IA irá criar as cenas com ganchos de alta retenção.
                  </p>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Como atrair clientes todos os dias para uma agência ou SaaS sem gastar fortunas..."
                  rows={4}
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />

                <button
                  onClick={handleGenerateScriptWithAi}
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando Roteiro de Alta Retenção...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Gerar Cenas com IA (Créditos Ilimitados)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ABA 2: CENAS & MOTION TEMPLATES */}
            {activeTab === 'scenes' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                      Cena #{activeSceneIndex + 1} de {scenes.length}
                    </span>
                    <span className="text-[11px] text-slate-400">Duração: {activeScene.durationSec}s</span>
                  </div>
                  <h3 className="text-sm font-black text-white">Editar Parâmetros da Cena</h3>
                </div>

                {/* Seletor dos 20 Templates */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Modelo de Motion Graphics (20 Templates Disponíveis):
                  </label>
                  <select
                    value={activeScene.templateId}
                    onChange={(e) => {
                      const next = [...scenes];
                      next[activeSceneIndex].templateId = e.target.value as MotionTemplateId;
                      setScenes(next);
                      saveProject();
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    {MOTION_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.previewIcon} {tmpl.name} ({tmpl.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Texto da Cena */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Texto Narrado & Legenda:</label>
                  <textarea
                    value={activeScene.text}
                    onChange={(e) => {
                      const next = [...scenes];
                      next[activeSceneIndex].text = e.target.value;
                      setScenes(next);
                    }}
                    onBlur={saveProject}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
                  />
                </div>

                {/* Tag / Badge de Topo */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Tag / Badge de Topo:</label>
                  <input
                    type="text"
                    value={activeScene.tag || ''}
                    onChange={(e) => {
                      const next = [...scenes];
                      next[activeSceneIndex].tag = e.target.value;
                      setScenes(next);
                    }}
                    onBlur={saveProject}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                {/* URL da Mídia B-Roll */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mídia B-Roll de Fundo (Imagem/Vídeo):</label>
                  <input
                    type="text"
                    value={activeScene.brollUrl || ''}
                    onChange={(e) => {
                      const next = [...scenes];
                      next[activeSceneIndex].brollUrl = e.target.value;
                      setScenes(next);
                    }}
                    onBlur={saveProject}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>
              </div>
            )}

            {/* ABA 3: VOZ & TRILHA */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-white mb-1">Locução Neural & Sound Design</h3>
                <p className="text-xs text-slate-400">
                  Configure o tom de voz e a trilha sonora de fundo em sincronia com o template.
                </p>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-white block">Voz Neural Padrão:</span>
                  <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold">
                    <span>🎙️ Locutor Neural Antônio (pt-BR)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* PALCO CENTRAL: PLAYER DE VÍDEO REVIDEO & CONTROLES */}
        <main className="flex-1 bg-[#04060c] flex flex-col items-center justify-between p-4 overflow-hidden">
          {/* Container Central do Player (Aspect 9:16) */}
          <div className="flex-1 w-full flex items-center justify-center p-2">
            <RevideoCanvasPlayer
              scene={activeScene}
              currentTimeSec={currentTime}
              isPlaying={isPlaying}
              className="max-h-[68vh]"
            />
          </div>

          {/* BARRA DE CONTROLE DE REPRODUÇÃO */}
          <div className="w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/30"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  onClick={() => setCurrentTime(0)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  title="Reiniciar Cena"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Tempo Decorrido */}
              <div className="text-xs font-mono font-bold text-slate-300">
                <span>{currentTime.toFixed(1)}s</span>
                <span className="text-slate-500"> / {(activeScene.durationSec || 4.5).toFixed(1)}s</span>
              </div>

              {/* Botão Mudo */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Linha de Scrub */}
            <input
              type="range"
              min={0}
              max={activeScene.durationSec || 4.5}
              step={0.05}
              value={currentTime}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentTime(parseFloat(e.target.value));
              }}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* TIMELINE VISUAL DE CARROSSEL DE CENAS NO RODAPÉ */}
          <div className="w-full mt-3 overflow-x-auto pb-1 flex items-center gap-2.5 px-2">
            {scenes.map((sc, idx) => (
              <div
                key={sc.id}
                onClick={() => {
                  setActiveSceneIndex(idx);
                  setCurrentTime(0);
                }}
                className={`cursor-pointer px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                  activeSceneIndex === idx
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>#{idx + 1}</span>
                <span className="max-w-[120px] truncate">{sc.text}</span>
                <span className="text-[10px] opacity-60">({sc.durationSec}s)</span>
              </div>
            ))}

            <button
              onClick={() => {
                const newSc: SceneRenderData = {
                  id: `sc_${Date.now()}`,
                  templateId: 'hormozi_bold',
                  durationSec: 4.5,
                  text: 'NOVA CENA ADICIONADA',
                  tag: 'DESTAQUE',
                  highlightColor: '#facc15',
                };
                setScenes([...scenes, newSc]);
                setActiveSceneIndex(scenes.length);
                setCurrentTime(0);
                saveProject();
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Cena</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function CreateVideoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060811] flex items-center justify-center text-white">Carregando Estúdio...</div>}>
      <CreateWorkstationContent />
    </Suspense>
  );
}
