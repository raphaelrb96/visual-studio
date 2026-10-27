import { create } from 'zustand';
import { 
  VideoManifest, 
  ScriptScene, 
  AspectRatio, 
  ComponentType, 
  RenderJob,
  JobStatus 
} from '@/types/studio';
import { DEFAULT_STYLE_PRESETS } from '@/lib/presets';

interface StudioState {
  // Video Manifest Core
  manifest: VideoManifest;
  
  // Player & Editor State
  isPlaying: boolean;
  currentTime: number;
  currentSceneIndex: number;
  selectedSceneId: string | null;
  playbackSpeed: number;
  
  // Render Job State
  currentJob: RenderJob | null;

  // Actions
  setPreset: (presetId: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setScenes: (scenes: ScriptScene[]) => void;
  updateScene: (sceneId: string, updates: Partial<ScriptScene>) => void;
  addScene: (afterIndex?: number) => void;
  removeScene: (sceneId: string) => void;
  reorderScenes: (startIndex: number, endIndex: number) => void;
  selectScene: (sceneId: string | null) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setAudioConfig: (audio: Partial<VideoManifest['audio']>) => void;
  setSubtitleConfig: (subtitles: Partial<VideoManifest['subtitles']>) => void;
  setCurrentJob: (job: RenderJob | null) => void;
  updateJobProgress: (progress: number, message: string, status?: JobStatus) => void;
  getTotalDuration: () => number;
}

const DEFAULT_SCENES: ScriptScene[] = [
  {
    id: 'sc-1',
    sceneIndex: 0,
    text: 'A maior revolução na criação de vídeos com código acaba de chegar.',
    durationSec: 4.5,
    componentType: 'CardFrase',
    componentProps: {
      headline: 'A MAIOR REVOLUÇÃO',
      subtext: 'Renderização programática de alto nível',
      highlightWords: ['revolução', 'código'],
      badge: 'NOVA ERA',
    },
  },
  {
    id: 'sc-2',
    sceneIndex: 1,
    text: 'Mais de 84% do tráfego digital atual é dominado pelo consumo de vídeos curtos.',
    durationSec: 4.0,
    componentType: 'StatCounter',
    componentProps: {
      number: 84,
      suffix: '%',
      prefix: '',
      label: 'Consumo Global de Conteúdo',
      description: 'Formatos verticais 9:16 geram 3.5x mais retenção',
    },
  },
  {
    id: 'sc-3',
    sceneIndex: 2,
    text: 'Compare a distribuição de formatos: o vídeo vertical superou todos os canais tradicionais.',
    durationSec: 5.0,
    componentType: 'GraficoPizza',
    componentProps: {
      title: 'Distribuição de Formatos 2026',
      slices: [
        { label: 'Reels / Shorts', value: 58, color: '#6366f1' },
        { label: 'TikTok Native', value: 27, color: '#06b6d4' },
        { label: 'Outros Canais', value: 15, color: '#facc15' },
      ],
    },
  },
  {
    id: 'sc-4',
    sceneIndex: 3,
    text: 'Produza vídeos em escala com custo próximo a zero e automação total.',
    durationSec: 4.0,
    componentType: 'CTAButton',
    componentProps: {
      buttonText: 'Começar Agora Gratuitamente',
      subcaption: 'Sem necessidade de editar na mão',
      accentColor: '#6366f1',
    },
  },
];

const INITIAL_MANIFEST: VideoManifest = {
  version: '1.0',
  jobId: `job_${Date.now()}`,
  userId: 'user_default',
  videoType: 'motion_narrated',
  presetId: DEFAULT_STYLE_PRESETS[0].id,
  aspectRatio: '9:16',
  resolution: { width: 1080, height: 1920 },
  audio: {
    ttsVoiceId: 'pt-BR-AntonioNeural',
    bgMusicUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    bgMusicVolume: 0.12,
  },
  scenes: DEFAULT_SCENES,
  subtitles: {
    enabled: true,
    style: 'kinetic_word',
  },
};

export const useStudioStore = create<StudioState>((set, get) => ({
  manifest: INITIAL_MANIFEST,
  isPlaying: false,
  currentTime: 0,
  currentSceneIndex: 0,
  selectedSceneId: DEFAULT_SCENES[0].id,
  playbackSpeed: 1.0,
  currentJob: null,

  setPreset: (presetId: string) => {
    set((state) => ({
      manifest: { ...state.manifest, presetId },
    }));
  },

  setAspectRatio: (aspectRatio: AspectRatio) => {
    const resolution = 
      aspectRatio === '9:16' ? { width: 1080, height: 1920 } :
      aspectRatio === '16:9' ? { width: 1920, height: 1080 } :
      { width: 1080, height: 1080 };

    set((state) => ({
      manifest: {
        ...state.manifest,
        aspectRatio,
        resolution,
      },
    }));
  },

  setScenes: (scenes: ScriptScene[]) => {
    set((state) => ({
      manifest: { ...state.manifest, scenes },
      currentTime: 0,
      currentSceneIndex: 0,
      selectedSceneId: scenes[0]?.id || null,
    }));
  },

  updateScene: (sceneId: string, updates: Partial<ScriptScene>) => {
    set((state) => ({
      manifest: {
        ...state.manifest,
        scenes: state.manifest.scenes.map((sc) =>
          sc.id === sceneId ? { ...sc, ...updates } : sc
        ),
      },
    }));
  },

  addScene: (afterIndex?: number) => {
    const { manifest } = get();
    const targetIdx = afterIndex !== undefined ? afterIndex + 1 : manifest.scenes.length;
    const newScene: ScriptScene = {
      id: `sc-${Date.now()}`,
      sceneIndex: targetIdx,
      text: 'Insira aqui o roteiro da nova cena...',
      durationSec: 3.5,
      componentType: 'CardFrase',
      componentProps: {
        headline: 'NOVO DESTAQUE',
        subtext: 'Personalize o texto desta cena',
        highlightWords: ['Destaque'],
        badge: 'PASSO',
      },
    };

    const updated = [...manifest.scenes];
    updated.splice(targetIdx, 0, newScene);
    const reindexed = updated.map((sc, i) => ({ ...sc, sceneIndex: i }));

    set((state) => ({
      manifest: { ...state.manifest, scenes: reindexed },
      selectedSceneId: newScene.id,
    }));
  },

  removeScene: (sceneId: string) => {
    const { manifest } = get();
    if (manifest.scenes.length <= 1) return; // Keep at least 1 scene
    const filtered = manifest.scenes
      .filter((s) => s.id !== sceneId)
      .map((sc, i) => ({ ...sc, sceneIndex: i }));

    set((state) => ({
      manifest: { ...state.manifest, scenes: filtered },
      selectedSceneId: filtered[0]?.id || null,
    }));
  },

  reorderScenes: (startIndex: number, endIndex: number) => {
    const { manifest } = get();
    const result = Array.from(manifest.scenes);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const reindexed = result.map((sc, i) => ({ ...sc, sceneIndex: i }));

    set((state) => ({
      manifest: { ...state.manifest, scenes: reindexed },
    }));
  },

  selectScene: (sceneId: string | null) => {
    set({ selectedSceneId: sceneId });
  },

  setCurrentTime: (time: number) => {
    const { manifest } = get();
    let accumulated = 0;
    let foundIndex = 0;

    for (let i = 0; i < manifest.scenes.length; i++) {
      const sceneDur = manifest.scenes[i].durationSec;
      if (time >= accumulated && time <= accumulated + sceneDur) {
        foundIndex = i;
        break;
      }
      accumulated += sceneDur;
      if (i === manifest.scenes.length - 1) {
        foundIndex = i;
      }
    }

    set({
      currentTime: Math.max(0, time),
      currentSceneIndex: foundIndex,
      selectedSceneId: manifest.scenes[foundIndex]?.id || null,
    });
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setAudioConfig: (audio: Partial<VideoManifest['audio']>) => {
    set((state) => ({
      manifest: {
        ...state.manifest,
        audio: { ...state.manifest.audio, ...audio },
      },
    }));
  },

  setSubtitleConfig: (subtitles: Partial<VideoManifest['subtitles']>) => {
    set((state) => ({
      manifest: {
        ...state.manifest,
        subtitles: { ...state.manifest.subtitles, ...subtitles },
      },
    }));
  },

  setCurrentJob: (job: RenderJob | null) => set({ currentJob: job }),

  updateJobProgress: (progress: number, message: string, status?: JobStatus) => {
    set((state) => {
      if (!state.currentJob) return state;
      return {
        currentJob: {
          ...state.currentJob,
          progressPercent: progress,
          currentStepMessage: message,
          status: status || state.currentJob.status,
        },
      };
    });
  },

  getTotalDuration: () => {
    const { manifest } = get();
    return manifest.scenes.reduce((acc, sc) => acc + sc.durationSec, 0);
  },
}));
