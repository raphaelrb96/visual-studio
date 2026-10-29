'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/AuthContext';
import {
  getUserCredits,
  deductUserCredits,
  saveProjectState,
  UserCredits,
} from '@/app/lib/firestore';
import {
  ProjectStep,
  ScriptScene,
  AspectRatio,
  VideoType,
  ComponentType,
  SfxType,
  CameraMotionType,
  TransitionType,
  CREDIT_COSTS,
} from '@/types/studio';
import { DEFAULT_STYLE_PRESETS } from '@/lib/presets';
import { MotionPlayer } from '@/components/motion/MotionPlayer';
import { CapCutTimeline } from '@/components/motion/CapCutTimeline';
import { useStudioStore } from '@/lib/store/useStudioStore';
import { renderManifestToVideoBlob } from '@/lib/video-exporter';
import { soundEngine } from '@/lib/sound-effects';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Smartphone,
  Monitor,
  Film,
  Scissors,
  UserCheck,
  Loader2,
  Wand2,
  Coins,
  Image as ImageIcon,
  Volume2,
  Play,
  Pause,
  Download,
  Layers,
  Search,
  Lock,
  FileVideo,
  Clock,
  Sliders,
  Plus,
  Trash2,
  Code2,
  Box,
  Music,
  Eye,
} from 'lucide-react';

const VIDEO_TYPES = [
  {
    id: 'motion_narrated' as VideoType,
    title: 'Animações (Motion Design)',
    desc: 'HyperFrames cinéticos em código, objetos 3D reais (WebGL), dados animados e colagens B-Roll com movimento parallax de alta retenção.',
    icon: Film,
    available: true,
  },
  {
    id: 'smart_clips' as VideoType,
    title: 'Cortes Curtos',
    desc: 'Cortes rápidos e virais com legendas dinâmicas coloridas palavra-por-palavra (Word-by-Word) e trilha sonora imersiva.',
    icon: Scissors,
    available: false,
  },
  {
    id: 'avatar_ia' as VideoType,
    title: 'Avatar IA',
    desc: 'Avatar realista falante como único elemento central do vídeo, com sincronia labial neural e visual limpo de estúdio.',
    icon: UserCheck,
    available: false,
  },
  {
    id: 'clipes_ia' as VideoType,
    title: 'Clipes IA',
    desc: 'Vídeos cinematográficos completos com cenas e visuais 100% gerados por inteligência artificial.',
    icon: Sparkles,
    available: false,
  },
];

const STEPS_NAV: { step: ProjectStep; label: string; desc: string }[] = [
  { step: 1, label: '1. Tipo, Formato & Projeto', desc: 'Definição Irreversível' },
  { step: 2, label: '2. Ideia, Duração & Tema', desc: 'Prompt, Tempo e Cenas' },
  { step: 3, label: '3. Roteiro & Direção', desc: 'Atributos de Cena e IA' },
  { step: 4, label: '4. Galeria & Collage B-Roll', desc: 'Múltiplas Mídias por Cena' },
  { step: 5, label: '5. Vozes, SFX & Compilação', desc: 'Manifesto ThreeJS + HyperFrame' },
  { step: 6, label: '6. Editor NLE Avançado', desc: 'Inspector, Código e Render' },
];

const ALL_COMPONENT_TYPES: { id: ComponentType; label: string }[] = [
  { id: 'Object3DShowcase', label: 'Objeto 3D WebGL (Three.js)' },
  { id: 'CollageBroll', label: 'Colagem B-Roll Multi-Camadas (Parallax)' },
  { id: 'NewsHeadline', label: 'Manchete Urgente de Jornal' },
  { id: 'CardFrase', label: 'Card Cinético de Impacto' },
  { id: 'StatCounter', label: 'Contador Numérico Elástico' },
  { id: 'VersusComparison', label: 'Comparativo Lado a Lado (Versus)' },
  { id: 'ChatSimulation', label: 'Simulação de Chat / WhatsApp' },
  { id: 'TweetCard', label: 'Post Viral X / Twitter 3D' },
  { id: 'QuoteCard', label: 'Citação de Autoridade Dourada' },
  { id: 'GraficoBarras', label: 'Gráfico de Barras Animado' },
  { id: 'GraficoPizza', label: 'Gráfico de Pizza Percentual' },
  { id: 'MediaBroll', label: 'B-Roll Cinematográfico Full' },
  { id: 'CTAButton', label: 'Chamada para Ação (CTA Final)' },
];

const ALL_SFX_OPTIONS: { id: SfxType; label: string; desc: string }[] = [
  { id: 'whoosh', label: 'Whoosh Aero', desc: 'Transição rápida de ar para cortes ágeis' },
  { id: 'impact', label: 'Sub Impact', desc: 'Grave profundo de cinema para manchetes' },
  { id: 'cinematic_boom', label: 'Cinematic Boom', desc: 'Explosão sub-grave estilo trailer' },
  { id: 'pop', label: 'Elastic Pop', desc: 'Bolha elástica para entrada de cards e textos' },
  { id: 'cash', label: 'Cash Register', desc: 'Tilintar metálico de dinheiro / riqueza' },
  { id: 'glitch', label: 'Digital Glitch', desc: 'Interferência cibernética de dados' },
  { id: 'typing', label: 'Keyboard Typing', desc: 'Teclas mecânicas para chat e textos' },
  { id: 'rise', label: 'Tension Riser', desc: 'Subida de frequência para chamada final' },
  { id: 'none', label: 'Sem Efeito (Mudo)', desc: 'Apenas locução limpa na troca de cena' },
];

const ALL_CAMERA_MOTIONS: { id: CameraMotionType; label: string }[] = [
  { id: 'zoom_in', label: 'Zoom In Progressivo (Ken Burns)' },
  { id: 'zoom_out', label: 'Zoom Out Revelação' },
  { id: 'float_3d', label: 'Flutuação Orbital 3D' },
  { id: 'pan_right', label: 'Panorâmica Lateral Direita' },
  { id: 'pan_left', label: 'Panorâmica Lateral Esquerda' },
  { id: 'static', label: 'Câmera Fixa Estúdio' },
];

const ALL_TRANSITIONS: { id: TransitionType; label: string }[] = [
  { id: 'spring_slide', label: 'Mola Elástica (Spring Slide)' },
  { id: 'flash_zoom', label: 'Flash Branco + Zoom Punch' },
  { id: 'glitch_cut', label: 'Corte Glitch Cyberpunk' },
  { id: 'fade', label: 'Dissolver Suave (Crossfade)' },
  { id: 'cut', label: 'Corte Seco Direto' },
];

const NEURAL_VOICES = [
  { id: 'pt-BR-AntonioNeural', name: 'Antônio (Masculino)', tone: 'Enérgico & Comercial', speed: '1.1x', desc: 'Ideal para vídeos estilo Alex Hormozi, VSLs e retenção rápida' },
  { id: 'pt-BR-FranciscaNeural', name: 'Francisca (Feminino)', tone: 'Expressiva & Moderna', speed: '1.05x', desc: 'Perfeita para Reels dinâmicos, tutoriais e lifestyle' },
  { id: 'pt-BR-DonatoNeural', name: 'Donato (Masculino)', tone: 'Grave & Documentário', speed: '1.0x', desc: 'Tom de autoridade profunda estilo Vox e MagnatesMedia' },
  { id: 'pt-BR-ThalitaNeural', name: 'Thalita (Feminino)', tone: 'Executiva & Corporativa', speed: '1.05x', desc: 'Comunicação clara, confiante e persuasiva para B2B' },
  { id: 'pt-BR-FabioNeural', name: 'Fábio (Masculino)', tone: 'Narrador Cinematográfico', speed: '0.98x', desc: 'Cadência dramática ideal para storytelling e mistério' },
  { id: 'pt-BR-BrendaNeural', name: 'Brenda (Feminino)', tone: 'Jovem & Viral TikTok', speed: '1.15x', desc: 'Ritmo acelerado de alta conversão para criativos curtos' },
];

const BG_MUSIC_TRACKS = [
  { id: 'phonk_drive', name: 'Dark Phonk High-Retention', bpm: '130 BPM', style: 'Hormozi / Finanças', url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3' },
  { id: 'cyber_synth', name: 'Cyberpunk Documentary Pulse', bpm: '115 BPM', style: 'Vox / MagnatesMedia', url: 'https://cdn.freesound.org/previews/586/586854_11861866-lq.mp3' },
  { id: 'minimal_tech', name: 'Deep Tech Corporate Ambient', bpm: '120 BPM', style: 'SaaS / B2B / IA', url: 'https://cdn.freesound.org/previews/648/648382_14157548-lq.mp3' },
  { id: 'lofi_focus', name: 'Warm Lo-Fi Storytelling', bpm: '90 BPM', style: 'Educacional / Cortes', url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3' },
];

export default function GuidedVideoCreationStudio() {
  const { user } = useAuth();
  const {
    manifest,
    isPlaying,
    currentTime,
    selectedSceneId,
    setScenes,
    setPreset,
    setAspectRatio,
    updateScene,
    selectScene,
    setIsPlaying,
    setCurrentTime,
    setAudioConfig,
    setSubtitleConfig,
    getTotalDuration,
  } = useStudioStore();

  const [projectId] = useState<string>(() => `proj_${Date.now()}`);
  const [currentStep, setCurrentStep] = useState<ProjectStep>(1);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);

  // ETAPA 1: TIPO DE VÍDEO, FORMATO & NOME DO PROJETO (IRREVERSÍVEL E SEM VOLTA)
  const [projectName, setProjectName] = useState('Novo Projeto de Vídeo');
  const [selectedVideoType, setSelectedVideoType] = useState<VideoType>('motion_narrated');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('9:16');
  const [isStep1LockedPermanently, setIsStep1LockedPermanently] = useState(false);

  // ETAPA 2: IDEIA, DURAÇÃO (30s, 60s, 90s), QUANTIDADE DE CENAS & TEMA VISUAL
  const [prompt, setPrompt] = useState('Como atrair clientes todos os dias automatizando seus vídeos curtos');
  const [targetDurationSec, setTargetDurationSec] = useState<30 | 60 | 90>(30);
  const [targetSceneCount, setTargetSceneCount] = useState<number>(6);
  const [scenePacingMode, setScenePacingMode] = useState<'dynamic_fast' | 'balanced' | 'cinematic'>('dynamic_fast');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('kinetic_yellow');

  // ETAPA 3: ROTEIRO & ATRIBUTOS RICOS DE CENA
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [aiRefinementText, setAiRefinementText] = useState('');
  const [isRefiningScript, setIsRefiningScript] = useState(false);

  // ETAPA 4: GALERIA DE MÍDIAS & COLAGEM B-ROLL MULTI-IMAGEM POR CENA
  const [searchMediaInput, setSearchMediaInput] = useState('business');
  const [isSearchingMedia, setIsSearchingMedia] = useState(false);
  const [mediaSearchResults, setMediaSearchResults] = useState<any[]>([]);
  const [activeMediaTargetSceneId, setActiveMediaTargetSceneId] = useState<string | null>(null);
  const [generatingAiImageSceneId, setGeneratingAiImageSceneId] = useState<string | null>(null);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');

  // ETAPA 5: VOZES, SONS & COMPILAÇÃO IA DE MANIFESTO THREE.JS / HYPERFRAME
  const [ttsVoiceId, setTtsVoiceId] = useState('pt-BR-AntonioNeural');
  const [selectedBgTrackId, setSelectedBgTrackId] = useState('phonk_drive');
  const [bgMusicVolume, setBgMusicVolume] = useState(0.14);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [isCompilingManifest, setIsCompilingManifest] = useState(false);
  const [compiledHtmlCode, setCompiledHtmlCode] = useState<string>('');

  // ETAPA 6: EDITOR DE VÍDEO NLE AVANÇADO + INSPECTOR + RENDER
  const [editorRightTab, setEditorRightTab] = useState<'inspector' | 'threejs' | 'manifest' | 'subtitles'>('inspector');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('');

  useEffect(() => {
    if (user) {
      getUserCredits(user.uid).then(setUserCredits);
    }
  }, [user]);

  const performMediaSearch = async (term: string) => {
    setIsSearchingMedia(true);
    try {
      const res = await fetch(`/api/media/search?query=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.results) {
        setMediaSearchResults(data.results);
      }
    } catch {
      console.warn('Erro ao buscar mídias');
    } finally {
      setIsSearchingMedia(false);
    }
  };

  useEffect(() => {
    if (currentStep === 4 && mediaSearchResults.length === 0) {
      performMediaSearch(prompt.slice(0, 20) || 'negocios');
    }
    if (currentStep === 4 && !activeMediaTargetSceneId && manifest.scenes[0]) {
      setActiveMediaTargetSceneId(manifest.scenes[0].id);
    }
    if (currentStep === 6 && !selectedSceneId && manifest.scenes[0]) {
      selectScene(manifest.scenes[0].id);
    }
  }, [currentStep, manifest.scenes]);

  const persistStepProgress = async (step: ProjectStep, updatedScenes = manifest.scenes) => {
    if (!user) return;
    try {
      await saveProjectState({
        id: projectId,
        userId: user.uid,
        title: projectName.trim() || prompt.slice(0, 50),
        currentStep: step,
        prompt,
        videoType: selectedVideoType,
        aspectRatio: selectedRatio,
        presetId: selectedPresetId,
        scenes: updatedScenes,
        audio: {
          voiceTone: 'energetic',
          ttsVoiceId,
          bgMusicVolume,
          sfxEnabled,
        },
        subtitles: manifest.subtitles,
        totalCreditsConsumed: 0,
        status: 'draft',
      });
    } catch (e) {
      console.warn('Erro ao salvar progresso:', e);
    }
  };

  // Trava IRREVERSÍVEL da Etapa 1 -> Vai para Etapa 2 e oculta Etapa 1 para sempre neste projeto
  const handleConfirmTypeAndProject = async () => {
    if (!projectName.trim()) {
      return alert('Por favor, informe o nome do seu projeto.');
    }
    setAspectRatio(selectedRatio);
    setIsStep1LockedPermanently(true);
    setCurrentStep(2);
    await persistStepProgress(2);
  };

  // Atualiza duração alvo (30s, 60s, 90s) ajustando automaticamente o número sugerido de cenas
  const handleSelectDuration = (dur: 30 | 60 | 90) => {
    setTargetDurationSec(dur);
    if (dur === 30) setTargetSceneCount(6);
    if (dur === 60) setTargetSceneCount(10);
    if (dur === 90) setTargetSceneCount(14);
  };

  // Transição Etapa 2 -> 3 (Geração do Roteiro e Storyboard com Duração e Quantidade de Cenas)
  const handleProceedToStep3 = async () => {
    if (!prompt.trim()) return alert('Digite a ideia ou tema do seu vídeo');
    if (!user) return alert('Faça login para continuar');

    if (userCredits && userCredits.availableCredits < CREDIT_COSTS.generateScript) {
      return alert(`Você precisa de pelo menos ${CREDIT_COSTS.generateScript} créditos.`);
    }

    setIsGeneratingScript(true);
    try {
      setPreset(selectedPresetId);
      setAspectRatio(selectedRatio);

      const res = await fetch('/api/studio/generate-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          videoType: selectedVideoType,
          styleMode: 'viral_hormozi',
          aspectRatio: selectedRatio,
          presetId: selectedPresetId,
          targetDurationSec,
          targetSceneCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      await deductUserCredits(user.uid, CREDIT_COSTS.generateScript);
      const updatedCreds = await getUserCredits(user.uid);
      setUserCredits(updatedCreds);

      setScenes(data.scenes);
      setCurrentStep(3);
      await persistStepProgress(3, data.scenes);
    } catch (err: any) {
      alert(err?.message || 'Erro ao gerar roteiro');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Refinamento com IA na Etapa 3
  const handleRefineScriptWithAi = async () => {
    if (!aiRefinementText.trim() || !user) return;

    if (userCredits && userCredits.availableCredits < CREDIT_COSTS.refineScriptWithAi) {
      return alert(`Refinar o roteiro consome ${CREDIT_COSTS.refineScriptWithAi} crédito.`);
    }

    setIsRefiningScript(true);
    try {
      const res = await fetch('/api/studio/refine-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentScenes: manifest.scenes,
          instruction: aiRefinementText,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      await deductUserCredits(user.uid, CREDIT_COSTS.refineScriptWithAi);
      const updatedCreds = await getUserCredits(user.uid);
      setUserCredits(updatedCreds);

      setScenes(data.scenes);
      setAiRefinementText('');
      await persistStepProgress(3, data.scenes);
    } catch (err: any) {
      alert(err?.message || 'Falha ao ajustar roteiro');
    } finally {
      setIsRefiningScript(false);
    }
  };

  // Etapa 4: Adicionar imagem à Colagem B-Roll da cena selecionada (ou preencher automaticamente)
  const handleAddImageToSceneCollage = (sceneId: string, imageUrl: string) => {
    const targetScene = manifest.scenes.find((s: ScriptScene) => s.id === sceneId);
    if (!targetScene) return;

    const existingCollage =
      targetScene.collageImages && targetScene.collageImages.length > 0
        ? [...targetScene.collageImages]
        : targetScene.brollImageUrl
        ? [targetScene.brollImageUrl]
        : [];

    const updatedCollage = [...existingCollage, imageUrl].slice(-6); // permite até 6 camadas por cena

    updateScene(sceneId, {
      brollImageUrl: updatedCollage[0] || imageUrl,
      collageImages: updatedCollage,
      componentProps: {
        ...targetScene.componentProps,
        imageUrl: updatedCollage[0] || imageUrl,
        images: updatedCollage,
      },
    });
  };

  // Etapa 4: Remover uma imagem específica da colagem da cena
  const handleRemoveImageFromSceneCollage = (sceneId: string, imgIndex: number) => {
    const targetScene = manifest.scenes.find((s: ScriptScene) => s.id === sceneId);
    if (!targetScene || !targetScene.collageImages) return;

    const nextImgs = targetScene.collageImages.filter((_, idx) => idx !== imgIndex);
    updateScene(sceneId, {
      brollImageUrl: nextImgs[0] || targetScene.brollImageUrl,
      collageImages: nextImgs,
      componentProps: {
        ...targetScene.componentProps,
        images: nextImgs,
      },
    });
  };

  // Etapa 4: Distribuir resultados da galeria automaticamente 1 por cena + 3 para colagem
  const handleAutoFillAllScenesWithSearchResults = () => {
    if (mediaSearchResults.length === 0) return;
    const updated = manifest.scenes.map((sc: ScriptScene, idx: number) => {
      const m1 = mediaSearchResults[idx % mediaSearchResults.length]?.url || sc.brollImageUrl;
      const m2 = mediaSearchResults[(idx + 1) % mediaSearchResults.length]?.url || m1;
      const m3 = mediaSearchResults[(idx + 2) % mediaSearchResults.length]?.url || m1;
      const collage = [m1, m2, m3].filter(Boolean);
      return {
        ...sc,
        brollImageUrl: m1,
        collageImages: collage,
        componentProps: {
          ...sc.componentProps,
          imageUrl: m1,
          images: collage,
        },
      };
    });
    setScenes(updated);
  };

  // Etapa 4: Gerar Imagem IA e adicionar à colagem da cena
  const handleGenerateAiImageForScene = async (sceneId: string, sceneText: string) => {
    if (!user) return;
    if (userCredits && userCredits.availableCredits < CREDIT_COSTS.generateAiImage) {
      return alert(`Gerar imagem por IA consome ${CREDIT_COSTS.generateAiImage} créditos.`);
    }

    setGeneratingAiImageSceneId(sceneId);
    try {
      const res = await fetch('/api/studio/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenePrompt: sceneText }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      await deductUserCredits(user.uid, CREDIT_COSTS.generateAiImage);
      const updatedCreds = await getUserCredits(user.uid);
      setUserCredits(updatedCreds);

      handleAddImageToSceneCollage(sceneId, data.imageUrl);
    } catch {
      alert('Falha ao gerar imagem IA');
    } finally {
      setGeneratingAiImageSceneId(null);
    }
  };

  // Etapa 5 -> Etapa 6: Compilar Manifesto JSON + HTML via IA para Three.js & HyperFrame
  const handleCompileManifestAndEnterEditor = async () => {
    setIsCompilingManifest(true);
    try {
      const selectedTrack = BG_MUSIC_TRACKS.find((t) => t.id === selectedBgTrackId) || BG_MUSIC_TRACKS[0];
      setAudioConfig({
        ttsVoiceId,
        bgMusicUrl: selectedTrack.url,
        bgMusicVolume,
        sfxEnabled,
      });

      const res = await fetch('/api/studio/compile-manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          prompt,
          aspectRatio: selectedRatio,
          presetId: selectedPresetId,
          scenes: manifest.scenes,
          audio: {
            ttsVoiceId,
            bgMusicUrl: selectedTrack.url,
            bgMusicVolume,
            sfxEnabled,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.manifest?.scenes) {
        setScenes(data.manifest.scenes);
        if (data.compiledHtml) {
          setCompiledHtmlCode(data.compiledHtml);
        }
      }

      setCurrentStep(6);
      await persistStepProgress(6, data.manifest?.scenes || manifest.scenes);
    } catch (e) {
      console.warn('Erro ao compilar manifesto:', e);
      setCurrentStep(6);
    } finally {
      setIsCompilingManifest(false);
    }
  };

  // Etapa 6: Renderização Final para Arquivo de Vídeo
  const handleFinalRender = async () => {
    if (!user || isExporting) return;

    if (userCredits && userCredits.availableCredits < CREDIT_COSTS.finalRender) {
      return alert(`Renderizar o vídeo consome ${CREDIT_COSTS.finalRender} créditos.`);
    }

    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(10);
    setExportStage('Iniciando Motor HyperFrame + Three.js WebGL...');

    try {
      const { url } = await renderManifestToVideoBlob(manifest, (pct, stage) => {
        setExportProgress(pct);
        setExportStage(stage);
      });

      await deductUserCredits(user.uid, CREDIT_COSTS.finalRender);
      const updatedCreds = await getUserCredits(user.uid);
      setUserCredits(updatedCreds);

      await saveProjectState({
        id: projectId,
        userId: user.uid,
        currentStep: 6,
        status: 'ready',
        videoUrl: url,
      });

      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.slice(0, 25).replace(/\s+/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert('Erro ao renderizar vídeo.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedEditorScene =
    manifest.scenes.find((s: ScriptScene) => s.id === selectedSceneId) || manifest.scenes[0];

  return (
    <div className="space-y-6 pb-16 max-w-[1440px] mx-auto px-2 sm:px-4">
      {/* Barra de Topo: Créditos Disponíveis & Stepper com Bloqueio Irreversível da Etapa 1 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-[#0c1222] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Saldo da Conta</span>
              <span className="text-base font-black text-white flex items-center gap-1.5">
                {userCredits ? userCredits.availableCredits : '...'}{' '}
                <span className="text-xs font-semibold text-indigo-300">Créditos</span>
              </span>
            </div>
          </div>

          {/* Exibe Resumo Definitivo e Travado do Projeto quando Etapa 1 já foi concluída */}
          {isStep1LockedPermanently && (
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-800">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate max-w-[160px]">{projectName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {selectedRatio}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stepper Horizontal — Etapa 1 fica permanentemente inacessível após confirmada */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
          {STEPS_NAV.map((s) => {
            // Se Etapa 1 já foi confirmada, ela nunca mais pode ser clicada ou aberta
            if (s.step === 1 && isStep1LockedPermanently) {
              return (
                <div
                  key={s.step}
                  title="Etapa 1 concluída e bloqueada permanentemente"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-950 text-slate-600 border border-slate-800/60 cursor-not-allowed select-none opacity-60"
                >
                  <Lock className="w-3 h-3 text-rose-500/70" />
                  <span>{s.label}</span>
                </div>
              );
            }

            const isCurrent = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => isCompleted && s.step > 1 && setCurrentStep(s.step)}
                disabled={!isCompleted && !isCurrent}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : isCompleted
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-slate-900 text-slate-500 opacity-60'
                }`}
              >
                <span>{s.label}</span>
                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          ETAPA 1: TIPO DE VÍDEO, FORMATO & NOME DO PROJETO (IRREVERSÍVEL)
          (Renderizada APENAS se isStep1LockedPermanently === false)
      ══════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 1 && !isStep1LockedPermanently && (
        <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-7 sm:p-9 shadow-2xl space-y-8 animate-scale-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-widest font-bold">Etapa 1 de 6</span>
              <span className="px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold uppercase flex items-center gap-1.5 tracking-wider">
                <Lock className="w-3.5 h-3.5 text-rose-400" /> Definição Única &amp; Irreversível
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Tipo de Vídeo, Formato e Nome do Projeto
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Essas configurações definem a arquitetura do projeto. Após confirmar, você não terá mais acesso a esta etapa neste projeto.
            </p>
          </div>

          {/* 1. Nome do Projeto */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block mb-2 flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-indigo-400" />
              Nome do Projeto
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Campanha de Lançamento Q1 • Reels Viral"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          {/* 2. Seleção de Tipo de Vídeo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                Selecione o Motor de Produção
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIDEO_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedVideoType === type.id;
                const isAvailable = type.available;

                return (
                  <button
                    key={type.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) setSelectedVideoType(type.id);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between group ${
                      !isAvailable
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-900/40 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            !isAvailable
                              ? 'bg-slate-900 text-slate-600'
                              : isSelected
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {!isAvailable && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                            Em breve
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-base font-black transition-colors ${
                          !isAvailable
                            ? 'text-slate-400'
                            : isSelected
                            ? 'text-white'
                            : 'text-slate-200 group-hover:text-cyan-300'
                        }`}
                      >
                        {type.title}
                      </h3>
                      <p className={`text-xs mt-1.5 leading-relaxed ${!isAvailable ? 'text-slate-600' : 'text-slate-400'}`}>
                        {type.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-500">
                        {!isAvailable
                          ? 'Indisponível no momento'
                          : isSelected
                          ? '✓ Motor ativo e selecionado'
                          : 'Clique para selecionar'}
                      </span>
                      {isSelected && isAvailable && (
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Proporção da Tela (Aspect Ratio) - Fixa e Irreversível */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block">
                Proporção da Tela (Aspect Ratio)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  ratio: '9:16' as AspectRatio,
                  label: 'Vertical (9:16)',
                  desc: 'TikTok, Instagram Reels, Shorts e Stories',
                  icon: Smartphone,
                },
                {
                  ratio: '16:9' as AspectRatio,
                  label: 'Horizontal (16:9)',
                  desc: 'YouTube, Web, Apresentações e Aulas',
                  icon: Monitor,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRatio === item.ratio;
                return (
                  <button
                    key={item.ratio}
                    type="button"
                    onClick={() => setSelectedRatio(item.ratio)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
            <Lock className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Atenção:</strong> Ao confirmar abaixo, esta Etapa 1 será encerrada e bloqueada definitivamente. O{' '}
              <strong>Nome do Projeto</strong>, o <strong>Motor de Produção</strong> e a{' '}
              <strong>Proporção ({selectedRatio})</strong> não poderão mais ser editados.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              Custo desta etapa: <strong>Gratuito (0 créditos)</strong>
            </span>

            <button
              type="button"
              onClick={handleConfirmTypeAndProject}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Travar Configuração e Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          ETAPA 2: IDEIA (PROMPT), DURAÇÃO (30s/60s/90s), QUANTIDADE DE CENAS E TEMA
      ══════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-7 sm:p-9 shadow-2xl space-y-8 animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-widest font-bold">Etapa 2 de 6</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Ideia, Duração do Vídeo &amp; Densidade de Cenas
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Defina o prompt, escolha a duração total (30s, 60s ou 90s), a quantidade de cenas e o estilo visual.
              </p>
            </div>
          </div>

          {/* 1. Ideia / Prompt */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block mb-2">
              1. Ideia Central ou Assunto do Vídeo (Prompt)
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: 3 estratégias práticas que empresários usam para atrair clientes com vídeos verticais..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 2. Duração do Vídeo (30s, 60s, 90s) e Quantidade de Cenas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                2. Tempo Total do Vídeo
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { sec: 30 as const, label: '30 Segundos', sub: 'Reels / Shorts Rápido', recScenes: 6 },
                  { sec: 60 as const, label: '60 Segundos', sub: 'Storytelling Completo', recScenes: 10 },
                  { sec: 90 as const, label: '90 Segundos', sub: 'Mini-Doc / VSL Profunda', recScenes: 14 },
                ].map((d) => {
                  const isSelected = targetDurationSec === d.sec;
                  return (
                    <button
                      key={d.sec}
                      type="button"
                      onClick={() => handleSelectDuration(d.sec)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-600/25 border-cyan-400 ring-1 ring-cyan-400 shadow-lg'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base font-black text-white block">{d.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{d.sub}</span>
                      <span className="text-[10px] font-mono text-cyan-400 block mt-2">
                        Sugere {d.recScenes} cenas
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  3. Quantidade &amp; Qualidade das Cenas
                </label>
                <span className="text-xs font-mono font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {targetSceneCount} Cenas (~{(targetDurationSec / targetSceneCount).toFixed(1)}s / cena)
                </span>
              </div>

              <input
                type="range"
                min={4}
                max={16}
                step={1}
                value={targetSceneCount}
                onChange={(e) => setTargetSceneCount(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'dynamic_fast' as const, label: 'Alta Retenção (Hormozi)', desc: 'Trocas rápidas + 3D + Pop SFX' },
                  { id: 'balanced' as const, label: 'Equilibrado (Editorial)', desc: 'Narrativa fluida + Gráficos' },
                  { id: 'cinematic' as const, label: 'Documentário (Vox)', desc: 'Colagens B-Roll + Parallax' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setScenePacingMode(mode.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      scenePacingMode === mode.id
                        ? 'bg-slate-800 border-cyan-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p className="text-[11px] font-bold text-white">{mode.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{mode.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Tema Visual */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 block mb-3">
              4. Tema Visual &amp; Paleta de Cores HyperFrame
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DEFAULT_STYLE_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPresetId(p.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 text-white ring-1 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.theme.highlightTextColor }} />
                      <span className="text-xs font-bold text-white">{p.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Custo para Gerar Roteiro ({targetSceneCount} cenas • {targetDurationSec}s):{' '}
              <strong>{CREDIT_COSTS.generateScript} créditos</strong>
            </span>

            <button
              type="button"
              onClick={handleProceedToStep3}
              disabled={isGeneratingScript}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando {targetSceneCount} Cenas com IA...</span>
                </>
              ) : (
                <>
                  <span>Gerar Roteiro e Storyboard Completo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          ETAPA 3: ROTEIRO E STORYBOARD COM ATRIBUTOS DETALHADOS POR CENA
      ══════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-7 sm:p-9 shadow-2xl space-y-6 animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-widest font-bold">Etapa 3 de 6</span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-1">
                Roteiro, Direção de Arte &amp; Atributos de Cena
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Personalize os atributos técnicos de cada cena: componente HyperFrame, objeto 3D, movimento de câmera, transição, SFX e duração.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 shrink-0">
              {manifest.scenes.length} Cenas • Total: {getTotalDuration().toFixed(1)}s
            </div>
          </div>

          {/* Barra de Refinamento IA */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={aiRefinementText}
              onChange={(e) => setAiRefinementText(e.target.value)}
              placeholder="Ex: 'Deixe o gancho inicial mais agressivo e adicione dados estatísticos na cena 3'..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
            />
            <button
              type="button"
              onClick={handleRefineScriptWithAi}
              disabled={isRefiningScript || !aiRefinementText.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
            >
              {isRefiningScript ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
              <span>Reescrever com IA ({CREDIT_COSTS.refineScriptWithAi} crédito)</span>
            </button>
          </div>

          {/* Lista de Cenas com Múltiplos Atributos Editáveis */}
          <div className="space-y-4">
            {manifest.scenes.map((sc: ScriptScene, idx: number) => (
              <div
                key={sc.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-xs font-black text-indigo-300 font-mono">
                      CENA #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Duração: <strong className="text-white">{sc.durationSec}s</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => soundEngine.playSfx(sc.sfxType || 'whoosh')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 flex items-center gap-1"
                      title="Ouvir preview do efeito sonoro desta cena"
                    >
                      <Volume2 className="w-3 h-3" /> Testar SFX ({sc.sfxType || 'whoosh'})
                    </button>
                  </div>
                </div>

                {/* Texto da Narração */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Locução / Roteiro Falado
                  </label>
                  <textarea
                    rows={2}
                    value={sc.text}
                    onChange={(e) => updateScene(sc.id, { text: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Grade de Atributos da Cena (Componente, Câmera, Transição, SFX, Duração, Headline/3D) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {/* Atributo 1: Componente HyperFrame */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Componente Visual
                    </label>
                    <select
                      value={sc.componentType}
                      onChange={(e) => updateScene(sc.id, { componentType: e.target.value as ComponentType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {ALL_COMPONENT_TYPES.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Atributo 2: Movimento de Câmera */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Movimento de Câmera
                    </label>
                    <select
                      value={sc.cameraMotion || 'zoom_in'}
                      onChange={(e) => updateScene(sc.id, { cameraMotion: e.target.value as CameraMotionType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {ALL_CAMERA_MOTIONS.map((cm) => (
                        <option key={cm.id} value={cm.id}>
                          {cm.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Atributo 3: Transição */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Transição de Entrada
                    </label>
                    <select
                      value={sc.transition || 'spring_slide'}
                      onChange={(e) => updateScene(sc.id, { transition: e.target.value as TransitionType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {ALL_TRANSITIONS.map((tr) => (
                        <option key={tr.id} value={tr.id}>
                          {tr.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Atributo 4: Efeito Sonoro (SFX) */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Gatilho Sonoro (SFX)
                    </label>
                    <select
                      value={sc.sfxType || 'whoosh'}
                      onChange={(e) => updateScene(sc.id, { sfxType: e.target.value as SfxType })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {ALL_SFX_OPTIONS.map((sfx) => (
                        <option key={sfx.id} value={sfx.id}>
                          {sfx.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Atributo 5: Duração em Segundos + Objeto 3D */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Duração (s) &amp; Malha 3D
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step={0.5}
                        min={2}
                        max={15}
                        value={sc.durationSec}
                        onChange={(e) => updateScene(sc.id, { durationSec: Number(e.target.value) || 4 })}
                        className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-cyan-400 font-mono font-bold"
                      />
                      <select
                        value={sc.hyperframeConfig?.threeJsObject || sc.componentProps?.object3d || 'coin'}
                        onChange={(e) =>
                          updateScene(sc.id, {
                            componentProps: { ...sc.componentProps, object3d: e.target.value },
                            hyperframeConfig: {
                              ...sc.hyperframeConfig,
                              threeJsObject: e.target.value as any,
                            },
                          })
                        }
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white"
                      >
                        <option value="coin">3D: Moeda Ouro</option>
                        <option value="diamond">3D: Diamante</option>
                        <option value="shield">3D: Escudo</option>
                        <option value="cube">3D: Cubo Neon</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Diretriz Visual & Headline do Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Headline / Texto em Destaque na Tela
                    </label>
                    <input
                      type="text"
                      value={sc.componentProps?.headline || sc.componentProps?.title || ''}
                      onChange={(e) =>
                        updateScene(sc.id, {
                          componentProps: {
                            ...sc.componentProps,
                            headline: e.target.value,
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder="Título visual sobreposto no componente..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Notas de Direção Visual &amp; Iluminação
                    </label>
                    <input
                      type="text"
                      value={sc.visualNotes || ''}
                      onChange={(e) => updateScene(sc.id, { visualNotes: e.target.value })}
                      placeholder="Diretriz de iluminação e paralaxe..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-2 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Ideia e Tempo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(4);
                persistStepProgress(4);
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30"
            >
              <span>Aprovar Cenas e Ir para Galeria Collage B-Roll</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          ETAPA 4: GALERIA DE MÍDIAS REAIS & COLAGEM MULTI-IMAGEM POR CENA
      ══════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-7 sm:p-9 shadow-2xl space-y-6 animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-widest font-bold">Etapa 4 de 6</span>
              <h1 className="text-2xl font-black text-white tracking-tight mt-1">
                Galeria de Mídias &amp; Colagem B-Roll Multi-Camadas
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Cada cena já vem preenchida com mídias reais e suporta múltiplas imagens para compor o efeito Collage B-Roll em paralaxe.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoFillAllScenesWithSearchResults}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 shrink-0"
            >
              <Layers className="w-4 h-4" />
              <span>Distribuir Galeria em Todas as Cenas (Auto-Collage)</span>
            </button>
          </div>

          {/* Barra de Busca de Mídias Reais + Adição de URL Manual */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-8 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchMediaInput}
                onChange={(e) => setSearchMediaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performMediaSearch(searchMediaInput)}
                placeholder="Buscar fotos e B-Rolls reais (ex: tecnologia, finanças, medicina, escritório, luxo)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => performMediaSearch(searchMediaInput)}
                disabled={isSearchingMedia}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                {isSearchingMedia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </div>

            <div className="lg:col-span-4 p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={customImageUrlInput}
                onChange={(e) => setCustomImageUrlInput(e.target.value)}
                placeholder="Colar URL de imagem externa..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => {
                  const targetId = activeMediaTargetSceneId || manifest.scenes[0]?.id;
                  if (targetId && customImageUrlInput.trim()) {
                    handleAddImageToSceneCollage(targetId, customImageUrlInput.trim());
                    setCustomImageUrlInput('');
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs shrink-0"
              >
                + Injetar
              </button>
            </div>
          </div>

          {/* Resultados da Busca de Mídias (Clique adiciona à colagem da cena ativa) */}
          {mediaSearchResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Banco de Mídias ({mediaSearchResults.length} resultados) — Clique para adicionar à Cena Selecionada:
                </span>
                <span className="text-[11px] font-mono text-cyan-400">
                  Cena Ativa: #{manifest.scenes.findIndex((s: ScriptScene) => s.id === activeMediaTargetSceneId) + 1}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {mediaSearchResults.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      const targetId = activeMediaTargetSceneId || manifest.scenes[0]?.id;
                      if (targetId) {
                        handleAddImageToSceneCollage(targetId, m.url);
                      }
                    }}
                    className="h-24 rounded-xl overflow-hidden relative border border-slate-800 hover:border-cyan-400 group transition-all"
                  >
                    <img
                      src={m.thumb}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-2 py-1 rounded-lg bg-cyan-500 text-slate-950 font-black text-[10px] flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add B-Roll
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cenas com Suas Camadas de Colagem B-Roll (Multi-Imagem por Cena) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {manifest.scenes.map((sc: ScriptScene, idx: number) => {
              const isTargeted = activeMediaTargetSceneId === sc.id;
              const collageList =
                sc.collageImages && sc.collageImages.length > 0
                  ? sc.collageImages
                  : sc.brollImageUrl
                  ? [sc.brollImageUrl]
                  : [];

              return (
                <div
                  key={sc.id}
                  onClick={() => setActiveMediaTargetSceneId(sc.id)}
                  className={`p-5 rounded-2xl bg-slate-900 border transition-all cursor-pointer space-y-3.5 ${
                    isTargeted
                      ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white uppercase">Cena #{idx + 1}</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                        {sc.componentType}
                      </span>
                    </div>
                    <span className="text-cyan-400 font-mono text-[11px] font-bold">
                      {collageList.length} {collageList.length === 1 ? 'elemento' : 'elementos B-Roll'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">&ldquo;{sc.text}&rdquo;</p>

                  {/* Grade de Elementos da Colagem desta Cena */}
                  <div className="grid grid-cols-3 gap-2">
                    {collageList.map((imgUrl, imgIdx) => (
                      <div
                        key={`${sc.id}-img-${imgIdx}`}
                        className="h-24 rounded-xl overflow-hidden bg-slate-950 relative border border-white/10 group/item"
                      >
                        <img src={imgUrl} alt={`Camada ${imgIdx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-cyan-300">
                          Camada #{imgIdx + 1}
                        </span>
                        {collageList.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImageFromSceneCollage(sc.id, imgIdx);
                            }}
                            className="absolute top-1 right-1 p-1 rounded bg-rose-600/90 text-white opacity-0 group-hover/item:opacity-100 transition-opacity"
                            title="Remover camada"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateAiImageForScene(sc.id, sc.text);
                      }}
                      disabled={generatingAiImageSceneId === sc.id}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      {generatingAiImageSceneId === sc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      <span>+ Gerar Camada IA ({CREDIT_COSTS.generateAiImage} créditos)</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateScene(sc.id, { componentType: 'CollageBroll' });
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        sc.componentType === 'CollageBroll'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      Modo Collage
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-2 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Roteiro</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(5);
                persistStepProgress(5);
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30"
            >
              <span>Avançar para Vozes, SFX &amp; Compilador IA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          ETAPA 5: VOZES NEURAIS, BANCO DE SFX & COMPILAÇÃO IA THREE.JS + HYPERFRAME
      ══════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 5 && (
        <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-7 sm:p-9 shadow-2xl space-y-8 animate-scale-in">
          <div>
            <span className="text-xs font-mono uppercase text-indigo-400 tracking-widest font-bold">Etapa 5 de 6</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Estúdio de Voz Neural, Sound Design &amp; Compilação HyperFrame
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Escolha entre 6 locutores neurais, teste os efeitos sonoros procedurais e acione a IA para compilar o Manifesto JSON/HTML compatível com Three.js e HyperFrame.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Seleção Expandida de Locutores Neurais (6 Vozes) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                1. Locutores Neurais de Alta Retenção (6 Vozes PT-BR)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NEURAL_VOICES.map((v) => {
                  const isSelected = ttsVoiceId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setTtsVoiceId(v.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border-cyan-400 ring-1 ring-cyan-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white">{v.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{v.speed}</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-300 block mt-0.5">{v.tone}</span>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{v.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Trilha Musical + Testador de SFX Procedural */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Music className="w-4 h-4 text-indigo-400" />
                  2. Trilha Musical de Fundo (Auto-Ducking)
                </label>

                <div className="space-y-2">
                  {BG_MUSIC_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedBgTrackId(track.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedBgTrackId === track.id
                          ? 'bg-indigo-600/20 border-cyan-400 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{track.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {track.style} • {track.bpm}
                        </p>
                      </div>
                      {selectedBgTrackId === track.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Volume da Música de Fundo</span>
                    <span className="font-mono text-cyan-400">{Math.round(bgMusicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.4}
                    step={0.02}
                    value={bgMusicVolume}
                    onChange={(e) => setBgMusicVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              {/* Mesa de Teste de SFX Procedural */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    3. Sound Design &amp; Efeitos (WebAudio Synth)
                  </label>
                  <input
                    type="checkbox"
                    checked={sfxEnabled}
                    onChange={(e) => setSfxEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400"
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  Clique para ouvir os sintetizadores sonoros aplicados nas transições:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_SFX_OPTIONS.filter((s) => s.id !== 'none').map((sfx) => (
                    <button
                      key={sfx.id}
                      type="button"
                      onClick={() => soundEngine.playSfx(sfx.id)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-cyan-400/50 text-[10px] font-bold text-slate-200 flex items-center justify-center gap-1 transition-all"
                    >
                      <Volume2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{sfx.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-cyan-400 shrink-0" />
              <div>
                <p className="text-xs font-black text-white uppercase">
                  Compilação de Manifesto JSON &amp; HTML para Three.js + HyperFrame
                </p>
                <p className="text-[11px] text-slate-400">
                  Ao clicar em Gerar Vídeo, a IA estrutura as malhas WebGL 3D, curvas de mola e camadas de colagem para o Editor NLE.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-2 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Galeria B-Roll</span>
            </button>

            <button
              type="button"
              onClick={handleCompileManifestAndEnterEditor}
              disabled={isCompilingManifest}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 hover:from-indigo-500 text-white font-black text-sm flex items-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
            >
              {isCompilingManifest ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compilando Manifesto Three.js &amp; HyperFrame com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compilar Manifesto IA &amp; Abrir Editor de Vídeo Avançado</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          ETAPA 6: EDITOR DE VÍDEO NLE AVANÇADO (CAPCUT PRO + INSPECTOR + THREE.JS + CÓDIGO)
      ══════════════════════════════════════════════════════════════════════════ */}
      {currentStep === 6 && (
        <div className="rounded-3xl bg-[#0c1222]/95 border border-white/10 p-5 sm:p-7 shadow-2xl space-y-6 animate-scale-in">
          {/* Header do Editor Profissional */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-emerald-400 tracking-widest font-bold">
                  Etapa 6 de 6 • NLE Studio Pro
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                  Three.js WebGL + HyperFrame 60fps
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {projectName} — Workstation de Edição &amp; Render
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Áudio &amp; Voz</span>
              </button>

              <button
                type="button"
                onClick={handleFinalRender}
                disabled={isExporting}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 shrink-0"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {exportProgress}% • {exportStage}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Renderizar Vídeo Final ({CREDIT_COSTS.finalRender} créditos)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* WORKSTATION SUPERIOR: 3 PAINÉIS (LISTA DE CENAS | MONITOR CENTRAL | INSPECTOR / THREE.JS / MANIFESTO) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* PAINEL ESQUERDO (3 COLUNAS): SEQUÊNCIA DE CENAS & CAMADAS */}
            <div className="lg:col-span-3 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-3 max-h-[520px] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Cenas ({manifest.scenes.length})
                </span>
                <span className="text-[10px] font-mono text-slate-500">{getTotalDuration().toFixed(1)}s</span>
              </div>

              <div className="space-y-2">
                {manifest.scenes.map((sc: ScriptScene, idx: number) => {
                  const isSelected = selectedEditorScene?.id === sc.id;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        selectScene(sc.id);
                        // Move playhead para o início da cena clicada
                        const startSec = manifest.scenes
                          .slice(0, idx)
                          .reduce((acc: number, s: ScriptScene) => acc + s.durationSec, 0);
                        setCurrentTime(startSec + 0.05);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-indigo-950/80 border-cyan-400 ring-1 ring-cyan-400/50'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-950 border border-white/10 shrink-0 relative">
                        {sc.brollImageUrl && (
                          <img src={sc.brollImageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        <span className="absolute bottom-0.5 right-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-cyan-300">
                          {sc.durationSec}s
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-cyan-400">#{idx + 1}</span>
                          <span className="text-[9px] font-mono text-slate-400 truncate ml-1">
                            {sc.componentType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-200 line-clamp-2 mt-0.5 leading-snug">{sc.text}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PAINEL CENTRAL (5 COLUNAS): MONITOR DE PREVIEW EM TEMPO REAL */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/90 border border-slate-800 rounded-2xl p-4 min-h-[520px]">
              <MotionPlayer />

              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPlaying ? 'Pausar Preview' : 'Reproduzir com Áudio & SFX'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                >
                  00:00s
                </button>
              </div>
            </div>

            {/* PAINEL DIREITO (4 COLUNAS): INSPECTOR DE PROPRIEDADES, THREE.JS & CÓDIGO DO MANIFESTO */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-4 max-h-[520px] overflow-y-auto">
              {/* Abas do Inspector */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                {[
                  { id: 'inspector' as const, label: 'Cena', icon: Sliders },
                  { id: 'threejs' as const, label: '3D & Física', icon: Box },
                  { id: 'subtitles' as const, label: 'Legendas', icon: Eye },
                  { id: 'manifest' as const, label: 'Código IA', icon: Code2 },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEditorRightTab(tab.id)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                        editorRightTab === tab.id
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ABA 1: INSPECTOR DE CENA SELECIONADA */}
              {editorRightTab === 'inspector' && selectedEditorScene && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-black text-white uppercase">
                      Propriedades • Cena #{selectedEditorScene.sceneIndex + 1}
                    </span>
                    <span className="font-mono text-[10px] text-cyan-400">{selectedEditorScene.id}</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Componente HyperFrame
                    </label>
                    <select
                      value={selectedEditorScene.componentType}
                      onChange={(e) =>
                        updateScene(selectedEditorScene.id, { componentType: e.target.value as ComponentType })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {ALL_COMPONENT_TYPES.map((ct) => (
                        <option key={ct.id} value={ct.id}>
                          {ct.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Texto Narrado (Sincronizado com Legenda)
                    </label>
                    <textarea
                      rows={3}
                      value={selectedEditorScene.text}
                      onChange={(e) => updateScene(selectedEditorScene.id, { text: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Duração (Segundos)
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        min={2}
                        max={15}
                        value={selectedEditorScene.durationSec}
                        onChange={(e) =>
                          updateScene(selectedEditorScene.id, { durationSec: Number(e.target.value) || 4 })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Som de Transição (SFX)
                      </label>
                      <select
                        value={selectedEditorScene.sfxType || 'whoosh'}
                        onChange={(e) => {
                          const nextSfx = e.target.value as SfxType;
                          updateScene(selectedEditorScene.id, { sfxType: nextSfx });
                          soundEngine.playSfx(nextSfx);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white"
                      >
                        {ALL_SFX_OPTIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Headline / Destaque Visual do Card
                    </label>
                    <input
                      type="text"
                      value={
                        selectedEditorScene.componentProps?.headline ||
                        selectedEditorScene.componentProps?.title ||
                        ''
                      }
                      onChange={(e) =>
                        updateScene(selectedEditorScene.id, {
                          componentProps: {
                            ...selectedEditorScene.componentProps,
                            headline: e.target.value,
                            title: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* ABA 2: MOTOR THREE.JS 3D & FÍSICA HYPERFRAME */}
              {editorRightTab === 'threejs' && selectedEditorScene && (
                <div className="space-y-4 text-xs">
                  <div className="border-b border-slate-800 pb-2">
                    <span className="font-black text-white uppercase block">
                      Parâmetros WebGL Three.js &amp; Física
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Controle em tempo real da malha 3D e elasticidade HyperFrame
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                      Geometria 3D Ativa (WebGL)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'coin', label: 'Moeda Dourada' },
                        { id: 'diamond', label: 'Diamante Cristal' },
                        { id: 'shield', label: 'Escudo Metálico' },
                        { id: 'cube', label: 'Cubo Hiper-Neon' },
                      ].map((obj) => {
                        const activeObj =
                          selectedEditorScene.hyperframeConfig?.threeJsObject ||
                          selectedEditorScene.componentProps?.object3d ||
                          'coin';
                        return (
                          <button
                            key={obj.id}
                            type="button"
                            onClick={() =>
                              updateScene(selectedEditorScene.id, {
                                componentType: 'Object3DShowcase',
                                componentProps: {
                                  ...selectedEditorScene.componentProps,
                                  object3d: obj.id,
                                },
                                hyperframeConfig: {
                                  ...selectedEditorScene.hyperframeConfig,
                                  threeJsObject: obj.id as any,
                                },
                              })
                            }
                            className={`p-2.5 rounded-xl border text-left font-bold text-[11px] transition-all ${
                              activeObj === obj.id
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {obj.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Rigidez da Mola (Spring Stiffness)</span>
                      <span className="font-mono text-cyan-400">
                        {selectedEditorScene.hyperframeConfig?.physicsStiffness || 140}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={240}
                      value={selectedEditorScene.hyperframeConfig?.physicsStiffness || 140}
                      onChange={(e) =>
                        updateScene(selectedEditorScene.id, {
                          hyperframeConfig: {
                            ...selectedEditorScene.hyperframeConfig,
                            physicsStiffness: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                      <span>Amortecimento Cinético (Damping)</span>
                      <span className="font-mono text-cyan-400">
                        {selectedEditorScene.hyperframeConfig?.physicsDamping || 14}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={28}
                      value={selectedEditorScene.hyperframeConfig?.physicsDamping || 14}
                      onChange={(e) =>
                        updateScene(selectedEditorScene.id, {
                          hyperframeConfig: {
                            ...selectedEditorScene.hyperframeConfig,
                            physicsDamping: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Movimento de Câmera Parallax
                    </label>
                    <select
                      value={selectedEditorScene.cameraMotion || 'zoom_in'}
                      onChange={(e) =>
                        updateScene(selectedEditorScene.id, {
                          cameraMotion: e.target.value as CameraMotionType,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {ALL_CAMERA_MOTIONS.map((cm) => (
                        <option key={cm.id} value={cm.id}>
                          {cm.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ABA 3: CONFIGURAÇÃO DE LEGENDAS E TEMA */}
              {editorRightTab === 'subtitles' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-black text-white uppercase">Legendas Dinâmicas &amp; Cores</span>
                    <input
                      type="checkbox"
                      checked={manifest.subtitles.enabled}
                      onChange={(e) => setSubtitleConfig({ enabled: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'kinetic_word' as const, label: 'Word-by-Word Pop (Estilo Hormozi)' },
                      { id: 'karaoke_highlight' as const, label: 'Karaokê Neon Highlight' },
                      { id: 'classic_bottom' as const, label: 'Editorial Documentário' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSubtitleConfig({ style: st.id })}
                        className={`w-full p-2.5 rounded-xl border text-left font-bold transition-all ${
                          manifest.subtitles.style === st.id
                            ? 'bg-indigo-600/20 border-cyan-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                      Trocar Paleta em Tempo Real
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {DEFAULT_STYLE_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPresetId(p.id);
                            setPreset(p.id);
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 ${
                            manifest.presetId === p.id
                              ? 'bg-slate-800 border-cyan-400 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: p.theme.highlightTextColor }}
                          />
                          <span className="text-[10px] font-bold truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 4: MANIFESTO JSON & HTML COMPILADO PELA IA */}
              {editorRightTab === 'manifest' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-black text-cyan-400 uppercase font-mono">
                      Manifesto Three.js + HyperFrame
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Código estruturado pela IA sincronizando WebGL 3D, colagens B-Roll e timestamps de voz:
                  </p>

                  <pre className="p-3 rounded-xl bg-black/90 border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-[300px]">
                    {compiledHtmlCode ||
                      JSON.stringify(
                        {
                          engine: 'hyperframe-threejs-v2.5',
                          aspectRatio: manifest.aspectRatio,
                          totalDurationSec: getTotalDuration(),
                          scenes: manifest.scenes.map((s: ScriptScene) => ({
                            id: s.id,
                            component: s.componentType,
                            durationSec: s.durationSec,
                            cameraMotion: s.cameraMotion,
                            sfx: s.sfxType,
                            collageLayers: s.collageImages?.length || 1,
                            hyperframeConfig: s.hyperframeConfig,
                          })),
                        },
                        null,
                        2
                      )}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* TIMELINE MULTIPISTA CAPCUT PRO (4 TRILHAS + SPLIT + DUPLICATE + ZOOM) */}
          <div className="w-full pt-2">
            <CapCutTimeline />
          </div>
        </div>
      )}
    </div>
  );
}
