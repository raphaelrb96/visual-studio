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
  Palette,
} from 'lucide-react';
import { useAuth } from '@/app/lib/AuthContext';
import { getDocument, setDocument, addDocument } from '@/app/lib/firestore';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { HyperFramesLivePlayer } from '@/components/hyperframe/HyperFramesLivePlayer';
import { buildMasterVideoHtml } from '@/lib/motion-compiler';
import { CapCutTimeline } from '@/components/motion/CapCutTimeline';
import { DEFAULT_STYLE_PRESETS, getPresetById } from '@/lib/presets';
import { MOTION_TEMPLATES } from '@/lib/motion-templates';
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
    isPlaying,
    currentTime,
    setCurrentTime,
    setIsPlaying,
    setScenes,
    setPreset,
    setAspectRatio,
    setFullNarration,
    selectScene,
    selectedSceneId,
    selectedElementId,
    selectedElementType,
    selectElement,
    updateScene,
  } = useStudioStore();

  // Fluxo de Criação em 4 Etapas:
  // Etapa 1: Nome do projeto e Formato de Tela (irreversível, sem botão de voltar na etapa 2)
  // Etapa 2: Assunto/Roteiro do Vídeo, Tema Visual e Voz Neural
  // Etapa 3: Seleção do Modelo/Template de Motion Graphics com Prévia
  // Etapa 4: Roteiro & Cenas (Narração Contínua Global + Cenas com Resumo & Prompt Visual)
  const [creationStep, setCreationStep] = useState<1 | 2 | 3 | 4>(1);

  // Estados locais
  const [projectId, setProjectId] = useState<string | null>(projectIdParam);
  const [hasActiveProject, setHasActiveProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState('Meu Vídeo Viral');
  const [promptInput, setPromptInput] = useState('');
  const [aspectRatioSelection, setAspectRatioSelection] = useState<AspectRatio>('9:16');
  const [presetSelection, setPresetSelection] = useState('kinetic_yellow');
  const [templateSelection, setTemplateSelection] = useState('hormozi_bold');
  const [voiceSelection, setVoiceSelection] = useState('antonio');

  // Roteiro estruturado gerado pela IA para revisão na Etapa 4
  const [generatedScriptData, setGeneratedScriptData] = useState<{
    fullNarration: string;
    fullAudioUrl?: string;
    scenes: ScriptScene[];
  }>({
    fullNarration: '',
    fullAudioUrl: '',
    scenes: [],
  });
  const [isPlayingFullAudio, setIsPlayingFullAudio] = useState(false);
  const [audioPlayerRef, setAudioPlayerRef] = useState<HTMLAudioElement | null>(null);

  // Temas dinâmicos (pré-definidos + temas criados pelo usuário)
  const [availablePresets, setAvailablePresets] = useState(DEFAULT_STYLE_PRESETS);
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customHighlightColor, setCustomHighlightColor] = useState('#facc15');
  const [customBgColor, setCustomBgColor] = useState('#050505');

  // Carrega temas customizados salvos no localStorage se houver
  useEffect(() => {
    try {
      const saved = localStorage.getItem('visual_studio_custom_themes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailablePresets([...DEFAULT_STYLE_PRESETS, ...parsed]);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar temas locais:', e);
    }
  }, []);

  // Salvar novo tema customizado
  const handleCreateCustomTheme = () => {
    if (!customThemeName.trim()) return;
    const newId = `custom_${Date.now()}`;
    const newTheme: any = {
      id: newId,
      name: customThemeName.trim(),
      description: 'Tema personalizado criado pelo usuário',
      previewImageUrl: '/presets/custom.png',
      theme: {
        backgroundColor: customBgColor,
        primaryTextColor: '#ffffff',
        highlightTextColor: customHighlightColor,
        fontFamily: 'Inter, sans-serif',
        cardStyle: 'glassmorphism',
      },
    };

    const updated = [...availablePresets, newTheme];
    setAvailablePresets(updated);
    setPresetSelection(newId);
    setShowCustomThemeModal(false);
    setCustomThemeName('');

    try {
      const customsOnly = updated.filter((p) => p.id.startsWith('custom_'));
      localStorage.setItem('visual_studio_custom_themes', JSON.stringify(customsOnly));
    } catch (e) {}
  };

  // Estados de loading e feedback
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [sceneProgressList, setSceneProgressList] = useState<
    Array<{ idx: number; label: string; status: 'pending' | 'active' | 'done' }>
  >([]);
  const [isRecompilingScene, setIsRecompilingScene] = useState(false);
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

  // ETAPA 3 -> ETAPA 4: GERAÇÃO DO ROTEIRO E CENAS COM IA
  const handleGenerateScriptAndScenes = async () => {
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    setSceneProgressList([]);
    setGenerationProgress(18);
    setGenerationStage('Concepcionando roteiro de retenção e prompts visuais de cada cena...');

    try {
      const res = await fetch('/api/studio/generate-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput.trim(),
          aspectRatio: aspectRatioSelection,
          presetId: presetSelection,
          styleMode: templateSelection,
          voiceId: voiceSelection,
          targetDurationSec: 25,
          targetSceneCount: 5,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao gerar o roteiro com IA');
      }

      setGenerationProgress(68);
      setGenerationStage('Sintetizando locução unificada e alinhando prompts de cenas...');
      const data = await res.json();
      const generatedScenes = data.scenes || [];

      if (generatedScenes.length === 0) {
        throw new Error('Nenhuma cena gerada pela IA');
      }

      const title = data.title || promptInput.slice(0, 42);
      setProjectTitle(title);

      const scriptPayload = {
        fullNarration: data.fullNarration || generatedScenes.map((s: ScriptScene) => s.text).join(' '),
        fullAudioUrl: data.fullAudioUrl || `/api/tts?text=${encodeURIComponent((data.fullNarration || '').slice(0, 1000))}&voice=${encodeURIComponent(voiceSelection)}`,
        scenes: generatedScenes,
      };

      setGeneratedScriptData(scriptPayload);

      // Injeta no store para já estar sincronizado
      setScenes(generatedScenes);
      setPreset(data.presetId || presetSelection);
      setAspectRatio(data.aspectRatio || aspectRatioSelection);
      setFullNarration(scriptPayload.fullNarration, scriptPayload.fullAudioUrl);
      selectScene(generatedScenes[0].id);

      setGenerationProgress(100);
      // Avança para a Etapa 4 (Revisão de Roteiro e Cenas)
      setCreationStep(4);
    } catch (err: any) {
      console.error('Erro na geração do roteiro:', err);
      alert('Houve uma falha ao gerar o roteiro com IA. Tente novamente em alguns segundos.');
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
      setGenerationProgress(0);
    }
  };

  // ETAPA 4 -> ESTÚDIO: ABRIR NO EDITOR E COMPILAR VÍDEO COM IA CENA A CENA (SEQUENCIAL COM PROGRESS BAR)
  const handleOpenStudio = async () => {
    const scenesToCompile = generatedScriptData.scenes || [];
    const total = scenesToCompile.length;
    if (total === 0) return;

    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationStage(`Gerando cena 1 de ${total}...`);
    setSceneProgressList(
      scenesToCompile.map((s, i) => ({
        idx: i,
        label: `Cena ${i + 1}: ${(s.summary || s.text || '').slice(0, 48)}...`,
        status: i === 0 ? 'active' : 'pending',
      }))
    );

    try {
      const activePreset = availablePresets.find((p) => p.id === presetSelection) || availablePresets[0] || DEFAULT_STYLE_PRESETS[0];
      const hlColor = activePreset.theme.highlightTextColor || '#facc15';
      const textColor = activePreset.theme.primaryTextColor || '#ffffff';
      const bgColor = activePreset.theme.backgroundColor || '#050505';

      const compiledScenes: ScriptScene[] = [];

      // Compila cada cena sequencialmente para atualizar a barra de progresso em tempo real e evitar rate-limit
      for (let idx = 0; idx < total; idx++) {
        const scene = scenesToCompile[idx];
        const startPct = Math.round((idx / total) * 85) + 5;
        setGenerationProgress(startPct);
        setGenerationStage(`Gerando cena ${idx + 1} de ${total} com IA...`);
        setSceneProgressList((prev) =>
          prev.map((item, i) => ({
            ...item,
            status: i < idx ? 'done' : i === idx ? 'active' : 'pending',
          }))
        );

        let compiledResult: ScriptScene = scene;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8500);

        try {
          const compRes = await fetch('/api/studio/compile-scene', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              scene,
              sceneIndex: idx,
              aspectRatio: aspectRatioSelection,
              highlightColor: hlColor,
              primaryTextColor: textColor,
              backgroundColor: bgColor,
              templateId: scene.templateId || scene.componentType || templateSelection,
            }),
          });

          if (compRes.ok) {
            const compData = await compRes.json();
            if (compData.compiledScene) {
              compiledResult = compData.compiledScene;
            }
          }
        } catch (sceneErr) {
          console.warn(`Timeout/Fallback na compilação da cena #${idx + 1}:`, sceneErr);
        } finally {
          clearTimeout(timeoutId);
        }

        compiledScenes.push(compiledResult);

        const donePct = Math.round(((idx + 1) / total) * 85) + 8;
        setGenerationProgress(Math.min(95, donePct));
        setSceneProgressList((prev) =>
          prev.map((item, i) => ({
            ...item,
            status: i <= idx ? 'done' : 'pending',
          }))
        );
      }

      setGenerationProgress(98);
      setGenerationStage('Finalizando estúdio e montando timeline no HyperFrames...');

      // Atualiza o store com as cenas contendo o HTML5/SVG + GSAP 3 real gerado
      setScenes(compiledScenes);
      setGeneratedScriptData((prev) => ({ ...prev, scenes: compiledScenes }));

      let newId = `project_${Date.now()}`;
      try {
        const payload = {
          title: projectTitle,
          prompt: promptInput,
          aspectRatio: aspectRatioSelection,
          presetId: presetSelection,
          voiceId: voiceSelection,
          fullNarration: generatedScriptData.fullNarration,
          fullAudioUrl: generatedScriptData.fullAudioUrl,
          scenes: compiledScenes,
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

      setGenerationProgress(100);
      // Transiciona para o Estúdio
      setHasActiveProject(true);
    } catch (e) {
      console.error('Erro ao abrir estúdio:', e);
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
      setGenerationProgress(0);
      setSceneProgressList([]);
    }
  };

  // Recompila uma cena específica diretamente de dentro do Estúdio quando o usuário edita o prompt ou template
  const handleRecompileSingleScene = async (targetScene: ScriptScene) => {
    if (!targetScene || isRecompilingScene) return;
    setIsRecompilingScene(true);
    try {
      const activePreset =
        availablePresets.find((p) => p.id === manifest.presetId) ||
        availablePresets[0] ||
        DEFAULT_STYLE_PRESETS[0];
      const idx = manifest.scenes.findIndex((s) => s.id === targetScene.id);
      const res = await fetch('/api/studio/compile-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene: targetScene,
          sceneIndex: idx >= 0 ? idx : 0,
          aspectRatio: manifest.aspectRatio,
          highlightColor: activePreset.theme.highlightTextColor || '#facc15',
          primaryTextColor: activePreset.theme.primaryTextColor || '#ffffff',
          backgroundColor: activePreset.theme.backgroundColor || '#050505',
          templateId: targetScene.templateId || targetScene.componentType || templateSelection,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.compiledScene) {
          updateScene(targetScene.id, {
            compiledCustomHtml: data.compiledScene.compiledCustomHtml,
            compiledGsapScript: data.compiledScene.compiledGsapScript,
          });
        }
      }
    } catch (err) {
      console.error('Erro ao recompilar cena:', err);
    } finally {
      setIsRecompilingScene(false);
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
  const currentTheme = availablePresets.find((p) => p.id === manifest.presetId) || availablePresets[0] || DEFAULT_STYLE_PRESETS[0];

  const hyperframesHtml = React.useMemo(() => {
    return buildMasterVideoHtml({
      projectId: projectId || 'proj-preview',
      title: projectTitle,
      aspectRatio: manifest.aspectRatio,
      fullNarration: manifest.fullNarration,
      fullAudioUrl: manifest.fullAudioUrl,
      scenes: manifest.scenes.map((s, idx) => {
        const sceneTemplate = (s.templateId || s.componentType || templateSelection || 'hormozi_bold') as any;
        const p = s.componentProps || {};

        return {
          id: s.id,
          sceneIndex: idx,
          templateId: sceneTemplate,
          durationSec: Number(s.durationSec) || 4.5,
          text: s.text || '',
          tag: p.badge || 'RETENÇÃO',
          headline: p.headline || s.text.slice(0, 42).toUpperCase(),
          subText: p.subtext || p.subText || '',
          highlightWord: p.highlightWords?.[0] || 'DESTAQUE',
          highlightColor: currentTheme.theme.highlightTextColor || '#facc15',
          brollUrl: s.brollImageUrl || p.imageUrl,
          audioUrl: s.audioUrl || `/api/tts?text=${encodeURIComponent(s.text || '')}&voice=${voiceSelection}`,
          statValue: p.number ? `${p.number}${p.suffix || '%'}` : '84%',
          statLabel: p.label || 'Taxa de Retenção',
          barsData: p.bars || [
            { label: 'Método Manual', value: 24, displayValue: '24%' },
            { label: 'Com HyperFrame', value: 92, displayValue: '92%' },
          ],
          versusData: {
            leftTitle: p.leftTitle || 'O JEITO ANTIGO',
            leftItems: p.leftItems || [p.leftDesc || 'Demorado e sem retenção'],
            rightTitle: p.rightTitle || 'COM HYPERFRAME',
            rightItems: p.rightItems || [p.rightDesc || 'Pronto em segundos com IA'],
          },
          authorName: p.authorName || 'Autoridade do Setor',
          authorHandle: p.authorHandle || '@expert_viral',
          ctaText: p.buttonText || 'Quero Começar Agora',
          compiledCustomHtml: s.compiledCustomHtml,
          compiledGsapScript: s.compiledGsapScript,
        };
      }),
    });
  }, [manifest.scenes, manifest.aspectRatio, manifest.presetId, manifest.fullNarration, manifest.fullAudioUrl, projectTitle, projectId, voiceSelection, templateSelection, currentTheme]);

  // =========================================================================
  // CENÁRIO 1: TELA LIMPA DE CRIAÇÃO (EM 2 ETAPAS SISTEMÁTICAS)
  // =========================================================================
  if (!hasActiveProject) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-3xl mx-auto w-full pt-4 pb-12">
          {/* Header Superior */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/videos"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Meus Vídeos
            </Link>

            {/* Stepper Indicador (4 Etapas) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    creationStep === 1
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {creationStep > 1 ? '✓' : '1'}
                </span>
                <span className={creationStep === 1 ? 'text-white' : 'text-gray-400'}>
                  Projeto
                </span>
              </div>
              <div className="w-3 sm:w-4 h-0.5 bg-white/10" />
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    creationStep === 2
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : creationStep > 2
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {creationStep > 2 ? '✓' : '2'}
                </span>
                <span className={creationStep === 2 ? 'text-white' : 'text-gray-400'}>
                  Tema &amp; Voz
                </span>
              </div>
              <div className="w-3 sm:w-4 h-0.5 bg-white/10" />
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    creationStep === 3
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : creationStep > 3
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {creationStep > 3 ? '✓' : '3'}
                </span>
                <span className={creationStep === 3 ? 'text-white' : 'text-gray-400'}>
                  Template
                </span>
              </div>
              <div className="w-3 sm:w-4 h-0.5 bg-white/10" />
              <div className="flex items-center gap-1 text-[11px] font-semibold">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    creationStep === 4
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  4
                </span>
                <span className={creationStep === 4 ? 'text-white' : 'text-gray-400'}>
                  Roteiro &amp; Cenas
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Créditos Ilimitados
            </span>
          </div>

          {/* Loading com Barra de Progresso Real e Status Cena por Cena */}
          {isGenerating ? (
            <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-8 sm:p-10 text-center shadow-2xl flex flex-col items-center my-8">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Sparkles className="w-8 h-8 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-1.5">Construindo seu vídeo com IA...</h3>
              <p className="text-indigo-400 font-bold text-base mb-5">
                {generationStage || 'Processando...'}
              </p>

              {/* Barra de Progresso 0% a 100% */}
              <div className="w-full max-w-md space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Progresso da Compilação</span>
                  <span className="text-emerald-400 font-bold">{generationProgress}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.max(5, generationProgress)}%` }}
                  />
                </div>
              </div>

              {/* Lista de Status Cena por Cena */}
              {sceneProgressList.length > 0 && (
                <div className="w-full max-w-md bg-[#07090e] border border-white/10 rounded-xl p-4 space-y-2.5 text-left mb-5">
                  {sceneProgressList.map((item) => (
                    <div
                      key={item.idx}
                      className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg border transition-all ${
                        item.status === 'done'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : item.status === 'active'
                          ? 'bg-indigo-500/15 border-indigo-500/50 text-white font-semibold'
                          : 'bg-white/[0.02] border-white/5 text-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        {item.status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : item.status === 'active' ? (
                          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-gray-600 inline-block shrink-0" />
                        )}
                        <span className="truncate">
                          {item.status === 'active'
                            ? `Gerando cena ${item.idx + 1}...`
                            : item.status === 'done'
                            ? `Cena ${item.idx + 1} compilada com sucesso`
                            : `Cena ${item.idx + 1} aguardando`}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase shrink-0">
                        {item.status === 'done' ? 'Pronto' : item.status === 'active' ? 'Ativo' : 'Fila'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 max-w-md">
                Compilando gráficos vetoriais SVG, tipografia cinética 3D, animações GSAP contínuas e locução neural humana para o HyperFrames.
              </p>
            </div>
          ) : creationStep === 1 ? (
            /* ========================================================================= */
            /* ETAPA 1: NOME DO PROJETO E FORMATO DE VÍDEO                              */
            /* ========================================================================= */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <Film className="w-3.5 h-3.5" />
                  Etapa 1 de 2 • Configuração Fundamental
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Nome do Projeto &amp; Formato
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                  Defina o título do seu vídeo e a proporção de tela ideal para a plataforma onde você vai publicar.
                </p>
              </div>

              {/* Campo: Nome do Projeto */}
              <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-3">
                <label className="block text-sm font-semibold text-gray-200">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Ex: Como Criar Vídeos Automáticos em 2026"
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base transition-all font-medium"
                />
                <span className="text-xs text-gray-400">
                  Esse nome identificará seu projeto na lista de vídeos e na renderização final.
                </span>
              </div>

              {/* Campo: Formato do Vídeo */}
              <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <label className="block text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Film className="w-4 h-4 text-indigo-400" />
                  Escolha o Formato do Vídeo
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: '9:16',
                      title: '9:16 Vertical',
                      subtitle: 'Reels, TikTok & Shorts',
                      desc: 'Otimizado para retenção mobile extrema',
                      icon: '📱',
                      badge: 'Mais Recomendado',
                    },
                    {
                      id: '16:9',
                      title: '16:9 Horizontal',
                      subtitle: 'YouTube & Web',
                      desc: 'Formato clássico para vídeos longos e aulas',
                      icon: '🖥️',
                      badge: 'Widescreen',
                    },
                    {
                      id: '1:1',
                      title: '1:1 Quadrado',
                      subtitle: 'Feed Instagram & LinkedIn',
                      desc: 'Equilíbrio visual para posts estáticos e carrossel',
                      icon: '⏹️',
                      badge: 'Feed Clássico',
                    },
                  ].map((fmt) => {
                    const isSelected = aspectRatioSelection === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setAspectRatioSelection(fmt.id as any)}
                        className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between h-44 relative group ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-600/20'
                            : 'bg-[#07090e] border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{fmt.icon}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isSelected
                                  ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300'
                                  : 'bg-white/5 border-white/10 text-gray-400'
                              }`}
                            >
                              {fmt.badge}
                            </span>
                          </div>
                          <div className="font-bold text-base text-white">{fmt.title}</div>
                          <div className="text-xs text-indigo-300 font-medium mb-1">
                            {fmt.subtitle}
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-400 leading-tight">
                          {fmt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Avançar para a Etapa 2 */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!projectTitle.trim()}
                  onClick={() => setCreationStep(2)}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <span>Continuar para Roteiro &amp; Tema</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : creationStep === 2 ? (
            /* ========================================================================= */
            /* ETAPA 2: ASSUNTO/ROTEIRO, TEMA VISUAL (PRESET) E VOZ NEURAL (DROP MENUS)  */
            /* ========================================================================= */
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Etapa 2 de 3 • Assunto, Tema &amp; Voz Neural
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Conteúdo &amp; Identidade do Vídeo
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                  Escreva seu roteiro ou ideia, escolha a voz do narrador e defina o tema visual do vídeo.
                </p>
              </div>

              {/* Input Principal do Prompt com Sugestões de 1 Clique */}
              <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-200">
                    Assunto Principal ou Roteiro do Vídeo
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Descreva o tema ou escolha a sugestão recomendada abaixo
                  </span>
                </div>

                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ex: 3 erros financeiros graves que a maioria das pessoas comete e como evitar para construir riqueza antes dos 30..."
                  rows={4}
                  className="w-full bg-[#07090e] border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base resize-none transition-all"
                />

                {/* Botões Grandes e Rápidos de Sugestão de Prompt */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Sugestões de Temas Virais (Clique no botão para preencher)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {INSPIRATION_PROMPTS.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPromptInput(item)}
                        className={`text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-start gap-2.5 group ${
                          promptInput === item
                            ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-500 shadow-lg shadow-indigo-600/20'
                            : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 text-gray-300 hover:text-white'
                        }`}
                      >
                        <span className="text-base leading-none mt-0.5">💡</span>
                        <div className="flex-1">
                          <span className="line-clamp-2 leading-relaxed">{item}</span>
                        </div>
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {promptInput === item ? 'Selecionado ✓' : 'Inserir'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configurações em Drop Menus: Tema do Vídeo e Voz Neural */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Drop Menu 1: Tema do Vídeo (Paleta de Cores e Estilo Visual) */}
                <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-yellow-400" /> Tema &amp; Estilo Visual
                    </span>
                    <Link
                      href="/presets"
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Criar Novo Tema
                    </Link>
                  </div>
                  <select
                    value={presetSelection}
                    onChange={(e) => setPresetSelection(e.target.value)}
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {availablePresets.map((prs) => (
                      <option key={prs.id} value={prs.id} className="bg-[#0f121d] text-white">
                        {prs.name} {prs.id.startsWith('custom_') ? '• (Meu Tema)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="truncate">
                      {availablePresets.find((p) => p.id === presetSelection)?.description}
                    </span>
                    <Link
                      href="/presets"
                      className="text-[11px] text-gray-400 hover:text-white shrink-0 ml-2 underline"
                      title="Abrir editor completo de identidade visual"
                    >
                      Personalizar Temas
                    </Link>
                  </div>
                </div>

                {/* Drop Menu 2: Voz Neural Humana */}
                <div className="bg-[#0f121d] border border-white/10 rounded-2xl p-5 space-y-3">
                  <label className="text-sm font-semibold text-gray-200 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-emerald-400" /> Voz Neural Humana
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">Azure Neural</span>
                  </label>
                  <select
                    value={voiceSelection}
                    onChange={(e) => setVoiceSelection(e.target.value)}
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3.5 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {VOICES.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#0f121d] text-white">
                        {v.icon} {v.name} • {v.desc.split('•')[1] || v.desc}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-400">
                    {VOICES.find((v) => v.id === voiceSelection)?.desc}
                  </div>
                </div>
              </div>

              {/* Botão para Avançar para a Etapa 3 (Sem botão de voltar para a Etapa 1) */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!promptInput.trim()}
                  onClick={() => setCreationStep(3)}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <span>Continuar para Seleção de Templates</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : creationStep === 3 ? (
            /* ========================================================================= */
            /* ETAPA 3: CATÁLOGO DE TEMPLATES COM PRÉVIAS VISUAIS                        */
            /* ========================================================================= */
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                  <Film className="w-3.5 h-3.5" />
                  Etapa 3 de 4 • Catálogo de Templates com Prévia
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Escolha o Template de Motion Graphics
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                  Mais de 20 modelos de alto impacto cinematográfico. Escolha o estilo visual para a IA conceber seu roteiro e cenas.
                </p>
              </div>

              {/* Grid de Templates com Prévia Visual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[440px] overflow-y-auto p-1">
                {MOTION_TEMPLATES.map((tpl) => {
                  const isSelected = templateSelection === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setTemplateSelection(tpl.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-48 relative group ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-600/25'
                          : 'bg-[#0f121d] border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{tpl.previewIcon}</span>
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider"
                            style={{ color: tpl.defaultHighlightColor }}
                          >
                            {tpl.category}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-white mb-1">{tpl.name}</div>
                        <div className="text-[11px] text-gray-400 leading-snug line-clamp-2">
                          {tpl.description}
                        </div>
                      </div>

                      {/* Footer do Card com Badge e Duração */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-mono font-semibold" style={{ color: tpl.defaultHighlightColor }}>
                          {tpl.badge}
                        </span>
                        <span className="font-mono">~{tpl.recommendedDuration}s/bloco</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões de Ação da Etapa 3: Avança para Etapa 4 (Roteiro & Cenas) */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreationStep(2)}
                  className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm transition-colors border border-white/10"
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  disabled={!promptInput.trim()}
                  onClick={handleGenerateScriptAndScenes}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Gerar Roteiro e Cenas com IA
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* ETAPA 4: REVISÃO DE ROTEIRO & CENAS (NARRAÇÃO INDIVIDUAL + PROMPTS CENA) */
            /* ========================================================================= */
            <div className="space-y-8 animate-in fade-in slide-in-from-right-2">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Etapa 4 de 4 • Roteiro Concebido &amp; Prompts Visuais
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Roteiro &amp; Cenas Visuais
                </h1>
                <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                  A IA gerou a narração completa e individual para todo o vídeo e concebeu o resumo e o prompt visual de cada cena para o Canva.
                </p>
              </div>

              {/* SEÇÃO 1: NARRAÇÃO COMPLETA E INDIVIDUAL DO VÍDEO (ÁUDIO CONTÍNUO) */}
              <div className="bg-[#0f121d] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                      🎙️
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        Narração Completa do Vídeo
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                          Áudio Único &amp; Contínuo
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Voz neural humana: <span className="text-emerald-400 font-semibold">{VOICES.find((v) => v.id === voiceSelection)?.name}</span> • O locutor fala sem interrupções mecânicas
                      </p>
                    </div>
                  </div>

                  {/* Botão de Ouvir a Narração Completa */}
                  {generatedScriptData.fullAudioUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!audioPlayerRef) {
                          const a = new Audio(generatedScriptData.fullAudioUrl);
                          a.onended = () => setIsPlayingFullAudio(false);
                          setAudioPlayerRef(a);
                          a.play();
                          setIsPlayingFullAudio(true);
                        } else {
                          if (isPlayingFullAudio) {
                            audioPlayerRef.pause();
                            setIsPlayingFullAudio(false);
                          } else {
                            audioPlayerRef.play();
                            setIsPlayingFullAudio(true);
                          }
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 shrink-0 self-start sm:self-center"
                    >
                      <Volume2 className="w-4 h-4" />
                      {isPlayingFullAudio ? 'Pausar Locução' : 'Ouvir Narração Completa'}
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={generatedScriptData.fullNarration}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setGeneratedScriptData((prev) => ({ ...prev, fullNarration: newText }));
                      setFullNarration(newText);
                    }}
                    placeholder="Texto completo da narração..."
                    className="w-full bg-[#07090e] border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium leading-relaxed resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>Você pode ajustar o texto corrido antes de abrir o editor.</span>
                    <span>{generatedScriptData.fullNarration.split(/\s+/).filter(Boolean).length} palavras</span>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: LISTA DE CENAS VISUAIS (RESUMO DA CENA & PROMPT DA CENA) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Cenas &amp; Layout Visual no Canva ({generatedScriptData.scenes.length} Cenas)
                  </h3>
                  <span className="text-xs text-gray-400">
                    Sincronizadas sobre a narração
                  </span>
                </div>

                <div className="space-y-3">
                  {generatedScriptData.scenes.map((scene, idx) => {
                    return (
                      <div
                        key={scene.id || idx}
                        className="bg-[#0f121d] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/40 transition-all space-y-3"
                      >
                        {/* Header da Cena */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                              CENA {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className="text-xs font-semibold text-gray-400">
                              Componente: <span className="text-white">{scene.componentType || 'CardFrase'}</span>
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
                            ~{scene.durationSec.toFixed(1)}s
                          </span>
                        </div>

                        {/* Grid Limpo e Editável: Resumo da Cena & Prompt Visual da Cena */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Coluna 1: Resumo da Cena */}
                          <div className="bg-[#07090e] border border-white/5 rounded-xl p-3.5 space-y-1.5">
                            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                              Resumo da Cena
                            </span>
                            <textarea
                              rows={3}
                              value={scene.summary || scene.text}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = generatedScriptData.scenes.map((s, i) =>
                                  i === idx ? { ...s, summary: val } : s
                                );
                                setGeneratedScriptData((prev) => ({ ...prev, scenes: updated }));
                                setScenes(updated);
                              }}
                              className="w-full bg-transparent text-xs text-gray-200 font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500/50 rounded p-1 resize-none"
                            />
                          </div>

                          {/* Coluna 2: Prompt Visual da Cena */}
                          <div className="bg-[#07090e] border border-white/5 rounded-xl p-3.5 space-y-1.5">
                            <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider block">
                              Prompt Visual da Cena (Direção de Animação IA)
                            </span>
                            <textarea
                              rows={3}
                              value={
                                scene.visualPrompt ||
                                scene.visualNotes ||
                                'Movimento cinético suave com foco no elemento principal e iluminação dinâmica.'
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = generatedScriptData.scenes.map((s, i) =>
                                  i === idx ? { ...s, visualPrompt: val, visualNotes: val } : s
                                );
                                setGeneratedScriptData((prev) => ({ ...prev, scenes: updated }));
                                setScenes(updated);
                              }}
                              className="w-full bg-transparent text-xs text-gray-200 font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-yellow-500/50 rounded p-1 resize-none"
                            />
                          </div>
                        </div>

                        {/* Trecho Falado nesta Cena */}
                        <div className="text-[11px] text-gray-400 pt-1 flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold shrink-0">Trecho da fala:</span>
                          <span className="italic truncate">&quot;{scene.text}&quot;</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botões de Ação da Etapa 4 */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreationStep(3)}
                  className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm transition-colors border border-white/10"
                >
                  ← Mudar Template
                </button>
                <button
                  type="button"
                  onClick={handleOpenStudio}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:opacity-95 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Abrir no Editor &amp; Compilar Vídeo no HyperFrames
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
              isPlaying={isPlaying}
              currentTime={currentTime}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onPlaybackEnded={() => setIsPlaying(false)}
              className="max-h-[calc(100vh-340px)] w-auto max-w-full"
            />
          </div>
        </div>

        {/* Coluna Direita: Inspetor do Elemento Selecionado no Canva */}
        <div className="w-full lg:w-[400px] shrink-0 bg-[#0c101d] flex flex-col h-full border-t lg:border-t-0 border-white/10 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {selectedElementType === 'motion' && 'Elemento: Motion Graphic 3D'}
                {selectedElementType === 'broll' && 'Elemento: Mídia B-Roll'}
                {selectedElementType === 'subtitle' && 'Elemento: Legenda Dinâmica'}
                {selectedElementType === 'audio' && 'Elemento: Áudio & Efeitos SFX'}
                {!selectedElementType && `Elemento: Bloco #${selectedScene ? selectedScene.sceneIndex + 1 : 1}`}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                Item independente na timeline e no canvas
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded-lg">
              {selectedScene?.durationSec || 5}s
            </span>
          </div>

          {selectedScene && (
            <div className="space-y-4">
              {/* Quando o elemento selecionado for Motion Graphic ou Visual */}
              {(!selectedElementType || selectedElementType === 'motion') && (
                <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">Configuração do Componente Visual</span>
                    <span className="text-[10px] text-cyan-400/80 uppercase font-mono">Trilha 3D</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Template de Animação no Canva
                    </label>
                    <select
                      value={selectedScene.templateId || selectedScene.componentType || 'hormozi_bold'}
                      onChange={(e) => {
                        const newTpl = e.target.value;
                        const updated = {
                          ...selectedScene,
                          templateId: newTpl,
                          componentType: newTpl,
                          compiledCustomHtml: undefined,
                          compiledGsapScript: undefined,
                        };
                        updateScene(selectedScene.id, {
                          templateId: newTpl,
                          componentType: newTpl,
                          compiledCustomHtml: undefined,
                          compiledGsapScript: undefined,
                        });
                        handleRecompileSingleScene(updated);
                      }}
                      className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {MOTION_TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id} className="bg-[#0f121d]">
                          {tpl.previewIcon} {tpl.name} ({tpl.category})
                        </option>
                      ))}
                    </select>
                  </div>

                    {/* Prompt Visual da Cena & Botão de Recompilar com IA */}
                    <div className="pt-2 border-t border-cyan-500/20 space-y-2">
                      <label className="text-[11px] font-bold text-yellow-400 block">
                        Prompt Visual desta Cena (IA)
                      </label>
                      <textarea
                        rows={3}
                        value={selectedScene.visualPrompt || selectedScene.visualNotes || ''}
                        onChange={(e) =>
                          updateScene(selectedScene.id, {
                            visualPrompt: e.target.value,
                            visualNotes: e.target.value,
                          })
                        }
                        placeholder="Descreva os elementos animados, efeitos 3D, gráficos e transições desta cena..."
                        className="w-full bg-[#07090e] border border-white/10 rounded-xl p-2.5 text-xs text-gray-200 focus:outline-none focus:border-yellow-500 resize-none"
                      />
                      <button
                        type="button"
                        disabled={isRecompilingScene}
                        onClick={() => handleRecompileSingleScene(selectedScene)}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
                      >
                        {isRecompilingScene ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Gerando Animação da Cena...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Recompilar Animação desta Cena com IA
                          </>
                        )}
                      </button>

                      {/* Visualizador de Código Real Gerado pela IA */}
                      {selectedScene.compiledCustomHtml && (
                        <details className="mt-2 text-left bg-black/50 border border-cyan-500/30 rounded-xl overflow-hidden group">
                          <summary className="p-2.5 text-[11px] font-mono text-cyan-400 font-bold cursor-pointer hover:bg-cyan-950/40 flex items-center justify-between">
                            <span>🔍 Ver Código HTML/SVG da IA</span>
                            <span className="text-[10px] text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <div className="p-3 border-t border-cyan-500/20 space-y-2 bg-[#05070e]">
                            <div className="text-[10px] text-gray-400 font-mono">HTML5 / SVG Injetado no Canvas:</div>
                            <pre className="text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-36 p-2 rounded bg-black/70 border border-white/5 whitespace-pre-wrap">
                              {selectedScene.compiledCustomHtml}
                            </pre>
                            {selectedScene.compiledGsapScript && (
                              <>
                                <div className="text-[10px] text-gray-400 font-mono pt-1">Script de Animação GSAP 3:</div>
                                <pre className="text-[10px] font-mono text-amber-300 overflow-x-auto max-h-36 p-2 rounded bg-black/70 border border-white/5 whitespace-pre-wrap">
                                  {selectedScene.compiledGsapScript}
                                </pre>
                              </>
                            )}
                          </div>
                        </details>
                      )}
                    </div>

                  {/* Propriedades Específicas do Componente Selecionado */}
                  {selectedScene.componentType === 'StatCounter' && (
                    <div className="pt-2 border-t border-cyan-500/20 space-y-2">
                      <span className="text-[11px] font-bold text-yellow-400 block">
                        Contador de Métricas
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
                    <div className="pt-2 border-t border-cyan-500/20 space-y-2">
                      <span className="text-[11px] font-bold text-cyan-400 block">
                        Comparativo Lado a Lado
                      </span>
                      <div>
                        <span className="text-[10px] text-gray-400">Lado Esquerdo (Problema)</span>
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
                        <span className="text-[10px] text-gray-400">Lado Direito (Solução)</span>
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
                </div>
              )}

              {/* Quando o elemento selecionado for B-Roll ou Imagem */}
              {(!selectedElementType || selectedElementType === 'broll') && (
                <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">Camada de Mídia (B-Roll de Fundo)</span>
                    <span className="text-[10px] text-indigo-400/80 uppercase font-mono">Trilha B-Roll</span>
                  </div>
                  {selectedScene.brollImageUrl ? (
                    <div className="w-full h-28 rounded-xl overflow-hidden bg-black border border-white/10 relative">
                      <img
                        src={selectedScene.brollImageUrl}
                        alt="Fundo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                      Nenhuma imagem associada
                    </div>
                  )}
                  <input
                    type="text"
                    value={selectedScene.brollImageUrl || ''}
                    placeholder="URL da Imagem / B-Roll..."
                    onChange={(e) => updateScene(selectedScene.id, { brollImageUrl: e.target.value })}
                    className="w-full bg-[#07090e] border border-white/10 rounded-lg p-2 text-xs text-white placeholder-gray-500"
                  />
                </div>
              )}

              {/* Quando o elemento selecionado for Legendas */}
              {(!selectedElementType || selectedElementType === 'subtitle') && (
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">Legenda Pop Karaoke</span>
                    <span className="text-[10px] text-amber-400/80 uppercase font-mono">Trilha Legendas</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Texto da Legenda
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
                      className="w-full bg-[#07090e] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                      placeholder="Texto exibido e falado na legenda..."
                    />
                  </div>
                </div>
              )}

              {/* Quando o elemento selecionado for Áudio ou Voz */}
              {(!selectedElementType || selectedElementType === 'audio') && (
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">Áudio Neural &amp; Efeitos Sonoros</span>
                    <span className="text-[10px] text-emerald-400/80 uppercase font-mono">Trilha Voz/SFX</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedScene.audioUrl) {
                        const audio = new Audio(selectedScene.audioUrl);
                        audio.play().catch(() => {});
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-semibold text-emerald-200 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    Reproduzir Áudio Neural do Elemento
                  </button>
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
