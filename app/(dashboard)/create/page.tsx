'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  Play,
  RotateCcw,
  Download,
  Save,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Film,
  Mic,
  Sliders,
  Type,
  Music,
  Check,
  AlertCircle,
  Loader2,
  Layers,
  Scissors,
  Copy,
  Volume2,
} from 'lucide-react';
import { useAuth } from '@/app/lib/AuthContext';
import { getDocument, setDocument, addDocument } from '@/app/lib/firestore';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { HyperFramesLivePlayer } from '@/components/hyperframe/HyperFramesLivePlayer';
import { buildMasterVideoHtml } from '@/lib/motion-compiler';
import { CapCutTimeline } from '@/components/motion/CapCutTimeline';
import { DEFAULT_STYLE_PRESETS, getPresetById } from '@/lib/presets';
import { renderManifestToVideoBlob } from '@/lib/video-exporter';
import { ScriptScene, AspectRatio } from '@/types/studio';

// Sugestões de temas de alta retenção para 1 clique
const INSPIRATION_PROMPTS = [
  '3 Erros Financeiros Graves que 90% dos Jovens Cometem Antes dos 30 Anos',
  'Por Que a Inteligência Artificial Vai Mudar Seu Trabalho em 2026',
  'O Hábito Matinal de 15 Minutos Usado Pelos Empreendedores Mais Produtivos',
  'A Diferença Brutal Entre Quem Constrói Negócios Digitais e Quem Continua no CLT',
];

// Vozes Neurais Humanas (Azure Speech / Edge TTS)
const VOICES = [
  {
    id: 'antonio',
    name: 'Antonio',
    desc: 'Masculina • Firme & Imponente (Documentário / Negócios)',
    icon: '🎙️',
  },
  {
    id: 'francisca',
    name: 'Francisca',
    desc: 'Feminina • Elegante & Clara (Notícias / Educação)',
    icon: '🎙️',
  },
  {
    id: 'nicolau',
    name: 'Nicolau',
    desc: 'Masculina • Jovem & Ágil (Viral / Hormozi / TikTok)',
    icon: '⚡',
  },
  {
    id: 'thalita',
    name: 'Thalita',
    desc: 'Feminina • Dinâmica & Expressiva (Dicas / Lifestyle)',
    icon: '✨',
  },
];

const COMPONENT_TYPES = [
  { id: 'StatCounter', label: 'Contador de Estatística (% ou Número)' },
  { id: 'GraficoBarras', label: 'Gráfico de Barras Animado' },
  { id: 'VersusComparison', label: 'Comparativo Versus (Lado a Lado)' },
  { id: 'NewsHeadline', label: 'Manchete Urgente de Jornal' },
  { id: 'TweetCard', label: 'Post Viral do X / Twitter' },
  { id: 'ChatSimulation', label: 'Simulação de Chat WhatsApp' },
  { id: 'QuoteCard', label: 'Citação de Autoridade' },
  { id: 'Object3DShowcase', label: 'Objeto 3D WebGL (Moeda, Diamante, Cubo)' },
  { id: 'CardFrase', label: 'Frase de Impacto (Tipografia Cinética)' },
  { id: 'MediaBroll', label: 'Foco no Vídeo / B-Roll com Zoom' },
  { id: 'CTAButton', label: 'Botão de Chamada para Ação (CTA)' },
];

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('id');
  const { user } = useAuth();

  // Store Zustand do Estúdio
  const {
    manifest,
    setScenes,
    setPreset,
    setAspectRatio,
    selectScene,
    selectedSceneId,
    updateScene,
  } = useStudioStore();

  // Estados locais
  const [projectId, setProjectId] = useState<string | null>(projectIdParam);
  const [hasActiveProject, setHasActiveProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Novo Vídeo');
  const [promptInput, setPromptInput] = useState('');
  const [aspectRatioSelection, setAspectRatioSelection] = useState<AspectRatio>('9:16');
  const [presetSelection, setPresetSelection] = useState('kinetic_yellow');
  const [voiceSelection, setVoiceSelection] = useState('antonio');

  // Estados de loading e feedback
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('');

  // Altura customizada da timeline redimensionável (Splitter vertical)
  const [timelineHeight, setTimelineHeight] = useState(250);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);

  // Manipulador de drag para redimensionar a timeline para cima e para baixo
  useEffect(() => {
    if (!isDraggingTimeline) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY;
      // Garante uma altura mínima de 160px e máxima de 50vh para que a timeline nunca desapareça
      const clampedHeight = Math.max(160, Math.min(Math.floor(windowHeight * 0.55), newHeight));
      setTimelineHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      setIsDraggingTimeline(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimeline]);

  // Carrega projeto existente do Firestore caso venha com ?id=... na URL
  useEffect(() => {
    if (!projectIdParam) {
      setHasActiveProject(false);
      return;
    }

    async function loadProject() {
      setIsLoadingInitial(true);
      try {
        const doc = await getDocument('projects', projectIdParam!);
        if (doc && Array.isArray(doc.scenes) && doc.scenes.length > 0) {
          setProjectId(doc.id);
          setProjectTitle(doc.title || 'Meu Vídeo');
          if (doc.aspectRatio) {
            setAspectRatio(doc.aspectRatio);
            setAspectRatioSelection(doc.aspectRatio);
          }
          if (doc.presetId) {
            setPreset(doc.presetId);
            setPresetSelection(doc.presetId);
          }
          setScenes(doc.scenes);
          selectScene(doc.scenes[0].id);
          setHasActiveProject(true);
        }
      } catch (err) {
        console.error('Erro ao carregar projeto existente:', err);
      } finally {
        setIsLoadingInitial(false);
      }
    }

    loadProject();
  }, [projectIdParam, setScenes, setPreset, setAspectRatio, selectScene]);

  // GERAÇÃO COMPLETA DO VÍDEO ANIMADO COM IA
  const handleGenerateVideo = async () => {
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    setGenerationStage('Roteirizando cenas de alta retenção...');

    try {
      // 1. Chama API de geração completa
      const res = await fetch('/api/studio/generate-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput.trim(),
          aspectRatio: aspectRatioSelection,
          presetId: presetSelection,
          voiceId: voiceSelection,
          targetDurationSec: 25,
          targetSceneCount: 5,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao gerar o vídeo com IA');
      }

      setGenerationStage('Construindo animações de infográficos e áudio neural...');
      const data = await res.json();
      const generatedScenes = data.scenes || [];

      if (generatedScenes.length === 0) {
        throw new Error('Nenhuma cena gerada pela IA');
      }

      const title = data.title || promptInput.slice(0, 42);
      setProjectTitle(title);

      // 2. Injeta as cenas geradas no Store do Estúdio
      setScenes(generatedScenes);
      setPreset(data.presetId || presetSelection);
      setAspectRatio(data.aspectRatio || aspectRatioSelection);
      selectScene(generatedScenes[0].id);

      // 3. Salva no Firestore
      setGenerationStage('Finalizando estúdio e timeline de edição...');
      let newId = `project_${Date.now()}`;
      try {
        const payload = {
          title,
          prompt: promptInput,
          aspectRatio: aspectRatioSelection,
          presetId: presetSelection,
          voiceId: voiceSelection,
          scenes: generatedScenes,
          userId: user?.uid || 'guest',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        const createdId = await addDocument('projects', payload);
        if (createdId) {
          newId = createdId;
          setProjectId(newId);
          window.history.replaceState(null, '', `/create?id=${newId}`);
        }
      } catch (saveErr) {
        console.warn('Erro ao salvar no Firestore (projeto rodará na sessão local):', saveErr);
      }

      // Transiciona imediatamente para o Estúdio de Edição com as cenas reais do usuário
      setHasActiveProject(true);
    } catch (err: any) {
      console.error('Erro na geração do vídeo:', err);
      alert('Houve uma falha ao gerar o vídeo. Tente novamente em alguns segundos.');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  // Salvar alterações manuais feitas no Estúdio
  const handleSave = async () => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      await setDocument('projects', projectId, {
        title: projectTitle,
        aspectRatio: manifest.aspectRatio,
        presetId: manifest.presetId,
        scenes: manifest.scenes,
        updatedAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar Vídeo MP4
  const handleExportVideo = async () => {
    if (manifest.scenes.length === 0) return;
    setIsExporting(true);
    setExportProgress(8);
    setExportStage('Carregando áudios neurais e animações...');

    try {
      const result = await renderManifestToVideoBlob(manifest, (percent, stage) => {
        setExportProgress(percent);
        setExportStage(stage);
      });

      const a = document.createElement('a');
      a.href = result.url;
      a.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erro ao exportar MP4:', err);
      alert('Não foi possível concluir a exportação neste momento. Tente novamente.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportStage('');
    }
  };

  // Cena atualmente selecionada na timeline
  const selectedScene =
    manifest.scenes.find((s: ScriptScene) => s.id === selectedSceneId) || manifest.scenes[0];

  // Constrói a composição oficial HyperFrames (HTML + GSAP 3 Seekable)
  const hyperframesHtml = React.useMemo(() => {
    return buildMasterVideoHtml({
      projectId: projectId || 'proj-preview',
      title: projectTitle,
      aspectRatio: manifest.aspectRatio,
      scenes: manifest.scenes.map((s, idx) => ({
        id: s.id,
        sceneIndex: idx,
        templateId: (s.templateId || s.componentType || 'hormozi_bold') as any,
        durationSec: Number(s.durationSec) || 4.5,
        text: s.text || '',
        tag: s.componentProps?.badge || 'RETENÇÃO',
        headline: s.componentProps?.headline || s.text.slice(0, 42).toUpperCase(),
        subText: s.componentProps?.subtext || '',
        highlightWord: s.componentProps?.highlightWords?.[0] || 'DESTAQUE',
        highlightColor: '#facc15',
        brollUrl: s.brollImageUrl || s.componentProps?.imageUrl,
        audioUrl: s.audioUrl || `/api/tts?text=${encodeURIComponent(s.text || '')}&voice=${voiceSelection}`,
        statValue: s.componentProps?.number ? `${s.componentProps.number}${s.componentProps.suffix || '%'}` : '84%',
        statLabel: s.componentProps?.label || 'Taxa de Retenção',
        barsData: s.componentProps?.bars || [
          { label: 'Método Manual', value: 24, displayValue: '24%' },
          { label: 'Com HyperFrame', value: 92, displayValue: '92%' },
        ],
        versusData: {
          leftTitle: s.componentProps?.leftTitle || 'O JEITO ANTIGO',
          leftItems: [s.componentProps?.leftDesc || 'Demorado e sem retenção'],
          rightTitle: s.componentProps?.rightTitle || 'COM HYPERFRAME',
          rightItems: [s.componentProps?.rightDesc || 'Pronto em segundos com IA'],
        },
        ctaText: s.componentProps?.buttonText || 'Quero Começar Agora',
      })),
    });
  }, [manifest.scenes, manifest.aspectRatio, projectTitle, projectId, voiceSelection]);

  // =========================================================================
  // CENÁRIO 1: TELA LIMPA DE CRIAÇÃO (Sem vídeo fake pré-carregado)
  // =========================================================================
  if (!hasActiveProject) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-4xl mx-auto w-full pt-4 pb-12">
          {/* Header Superior */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/videos"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Meus Vídeos
            </Link>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Créditos Ilimitados (Pro)
            </span>
          </div>

          {/* Loading com Progresso de Geração */}
          {isGenerating ? (
            <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-10 text-center shadow-2xl flex flex-col items-center my-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Criando seu vídeo animado com IA...</h3>
              <p className="text-indigo-400 font-medium text-base mb-6 animate-pulse">
                {generationStage}
              </p>
              <p className="text-xs text-gray-500 max-w-md">
                Gerando componentes de motion graphics, contadores de dados, comparativos, voz neural humana do Azure e sincronizando a timeline.
              </p>
            </div>
          ) : (
            /* Formulário de Criação Limpo */
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Geração com Motion Graphics Animados & Timeline CapCut
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Criar Vídeo Animado com IA
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                  Digite sua ideia ou cole seu roteiro. A IA criará o roteiro viral, componentes de motion animados (gráficos, estatísticas, notícias, versus) e abrirá sua timeline completa de edição.
                </p>
              </div>

              {/* Input Principal do Prompt */}
              <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <label className="block text-sm font-semibold text-gray-200">
                  Sobre o que é seu vídeo?
                </label>
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ex: 3 erros financeiros graves que a maioria das pessoas comete e como evitar para construir riqueza antes dos 30..."
                  rows={4}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base resize-none transition-all"
                />

                {/* Sugestões Rápidas de 1 Clique */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-400 font-medium">Ou teste com uma ideia viral pronta:</span>
                  <div className="flex flex-wrap gap-2">
                    {INSPIRATION_PROMPTS.map((promptText, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setPromptInput(promptText)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 transition-all text-left"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configurações de Formato, Preset e Voz */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Formato */}
                <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-5 space-y-3">
                  <span className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400" /> Formato de Tela
                  </span>
                  <div className="space-y-2">
                    {[
                      { id: '9:16', label: '9:16 Vertical (Shorts/TikTok)', sub: 'Recomendado' },
                      { id: '16:9', label: '16:9 Horizontal (YouTube)', sub: 'Aulas e Web' },
                      { id: '1:1', label: '1:1 Quadrado (Feed)', sub: 'Instagram' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setAspectRatioSelection(fmt.id as any)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          aspectRatioSelection === fmt.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-bold">{fmt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estilo Visual Preset */}
                <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-5 space-y-3">
                  <span className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-yellow-400" /> Estilo de Motion
                  </span>
                  <div className="space-y-2">
                    {DEFAULT_STYLE_PRESETS.slice(0, 3).map((prs) => (
                      <button
                        key={prs.id}
                        type="button"
                        onClick={() => setPresetSelection(prs.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          presetSelection === prs.id
                            ? 'bg-yellow-500/20 border-yellow-500 text-white shadow-lg'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-bold">{prs.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{prs.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voz Neural Humana */}
                <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-5 space-y-3">
                  <span className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-400" /> Voz Neural Humana
                  </span>
                  <div className="space-y-2">
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVoiceSelection(v.id)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                          voiceSelection === v.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{v.icon}</span> {v.name}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">{v.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botão de Geração */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!promptInput.trim()}
                  onClick={handleGenerateVideo}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Gerar Vídeo com IA Agora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CENÁRIO 2: ESTÚDIO NLE DE EDIÇÃO COM HYPERFRAMES & CAPCUT TIMELINE FIXA
  // =========================================================================
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#070a12] text-white flex flex-col select-none">
      {/* Top Bar do Estúdio */}
      <header className="h-14 shrink-0 border-b border-white/10 bg-[#0c101d] px-4 sm:px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/videos"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Voltar aos Meus Vídeos"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 max-w-[200px] sm:max-w-md"
            />
            <div className="text-[10px] text-gray-400 px-1">
              {manifest.scenes.length} Cenas Motion • {manifest.aspectRatio}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Novo Vídeo */}
          <button
            onClick={() => {
              if (confirm('Deseja criar um novo vídeo? Suas alterações salvas permanecerão no histórico.')) {
                setHasActiveProject(false);
                setProjectId(null);
                setPromptInput('');
                window.history.replaceState(null, '', '/create');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Vídeo
          </button>

          {/* Salvar */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Salvo!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Salvar
              </>
            )}
          </button>

          {/* Exportar MP4 */}
          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Exportando {exportProgress}%
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" /> Exportar MP4
              </>
            )}
          </button>
        </div>
      </header>

      {/* Modal de Progresso da Exportação */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Renderizando seu vídeo MP4 em 60fps...</h3>
            <p className="text-sm text-gray-400 mb-6">{exportStage}</p>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-mono">{exportProgress}% concluído</span>
          </div>
        </div>
      )}

      {/* Área Central de Trabalho: Workspace Superior (Player + Inspetor) */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Coluna Central: Motor de Renderização Oficial HyperFrames (HTML5 + GSAP 3) */}
        <div className="flex-1 p-2 sm:p-4 flex items-center justify-center bg-[#07090e] border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden relative">
          <div className="w-full h-full max-h-full flex items-center justify-center">
            <HyperFramesLivePlayer
              compositionHtml={hyperframesHtml}
              aspectRatio={manifest.aspectRatio}
              className="max-h-[calc(100vh-340px)] w-auto max-w-full"
            />
          </div>
        </div>

        {/* Coluna Direita: Inspetor da Cena Selecionada */}
        <div className="w-full lg:w-[400px] shrink-0 bg-[#0c101d] flex flex-col h-full border-t lg:border-t-0 border-white/10 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Inspetor de Cena ({selectedScene ? selectedScene.sceneIndex + 1 : 1} de {manifest.scenes.length})
            </span>
            <span className="text-xs font-mono text-gray-400">
              {selectedScene?.durationSec || 5}s
            </span>
          </div>

          {selectedScene && (
            <div className="space-y-4">
              {/* Componente Motion Graphics */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Componente de Motion Graphic
                </label>
                <select
                  value={selectedScene.componentType || 'CardFrase'}
                  onChange={(e) => updateScene(selectedScene.id, { componentType: e.target.value })}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {COMPONENT_TYPES.map((comp) => (
                    <option key={comp.id} value={comp.id} className="bg-[#0f121d]">
                      {comp.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Texto Falado da Narração */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Texto da Narração (Locução Neural)
                </label>
                <textarea
                  value={selectedScene.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    updateScene(selectedScene.id, {
                      text: newText,
                      audioUrl: `/api/tts?text=${encodeURIComponent(newText)}&voice=${voiceSelection}&t=${Date.now()}`,
                    });
                  }}
                  rows={3}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Texto falado pelo narrador nesta cena..."
                />
              </div>

              {/* Botão de Ouvir Voz Neural */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedScene.audioUrl) {
                      const audio = new Audio(selectedScene.audioUrl);
                      audio.play().catch(() => {});
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  Ouvir Narração Desta Cena
                </button>
              </div>

              {/* Propriedades Específicas do Componente Selecionado */}
              {selectedScene.componentType === 'StatCounter' && (
                <div className="p-3 bg-[#07090e] border border-white/10 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-yellow-400 block">
                    Configuração do Contador
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-400">Número</span>
                      <input
                        type="number"
                        value={selectedScene.componentProps?.number || 84}
                        onChange={(e) =>
                          updateScene(selectedScene.id, {
                            componentProps: {
                              ...selectedScene.componentProps,
                              number: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Sufixo</span>
                      <input
                        type="text"
                        value={selectedScene.componentProps?.suffix || '%'}
                        onChange={(e) =>
                          updateScene(selectedScene.id, {
                            componentProps: {
                              ...selectedScene.componentProps,
                              suffix: e.target.value,
                            },
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedScene.componentType === 'VersusComparison' && (
                <div className="p-3 bg-[#07090e] border border-white/10 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-cyan-400 block">
                    Configuração Versus
                  </span>
                  <div>
                    <span className="text-[10px] text-gray-400">Lado Esquerdo (Comum)</span>
                    <input
                      type="text"
                      value={selectedScene.componentProps?.leftTitle || 'MODELO ANTIGO'}
                      onChange={(e) =>
                        updateScene(selectedScene.id, {
                          componentProps: {
                            ...selectedScene.componentProps,
                            leftTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400">Lado Direito (Sua Solução)</span>
                    <input
                      type="text"
                      value={selectedScene.componentProps?.rightTitle || 'NOSSA SOLUÇÃO'}
                      onChange={(e) =>
                        updateScene(selectedScene.id, {
                          componentProps: {
                            ...selectedScene.componentProps,
                            rightTitle: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Imagem de Fundo (B-Roll) */}
              {selectedScene.brollImageUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-300 block">
                    Imagem de Fundo Cinematográfica
                  </span>
                  <div className="w-full h-24 rounded-xl overflow-hidden bg-black border border-white/10 relative">
                    <img
                      src={selectedScene.brollImageUrl}
                      alt="Fundo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DIVIDER SPLITTER REDIMENSIONÁVEL ENTRE WORKSPACE E TIMELINE */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDraggingTimeline(true);
        }}
        className="h-2 w-full bg-[#121626] hover:bg-indigo-500/80 active:bg-indigo-500 cursor-row-resize flex items-center justify-center transition-colors relative z-40 group shrink-0"
        title="Arraste para cima ou para baixo para redimensionar a timeline"
      >
        <div className="w-12 h-1 bg-white/20 group-hover:bg-white rounded-full pointer-events-none transition-colors" />
      </div>

      {/* ÁREA INFERIOR: CAPCUT TIMELINE MULTI-TRACK FIXA SEMPRE VISÍVEL */}
      <div
        style={{ height: `${timelineHeight}px` }}
        className="shrink-0 bg-[#090d18] border-t border-white/10 p-2 sm:p-3 overflow-hidden"
      >
        <CapCutTimeline className="h-full" />
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}
