import { create } from 'zustand';
import { 
  VideoManifest, 
  ScriptScene, 
  AspectRatio, 
  RenderJob,
  JobStatus 
} from '@/types/studio';
import { DEFAULT_STYLE_PRESETS } from '@/lib/presets';

interface StudioState {
  manifest: VideoManifest;
  isPlaying: boolean;
  currentTime: number;
  currentSceneIndex: number;
  selectedSceneId: string | null;
  playbackSpeed: number;
  currentJob: RenderJob | null;

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
    text: 'Quase ninguém te conta isso, mas 90 por cento dos negócios perdem vendas todos os dias por não postarem vídeos.',
    durationSec: 4.5,
    componentType: 'CardFrase',
    audioUrl: '/api/tts?text=Quase%20ningu%C3%A9m%20te%20conta%20isso%2C%20mas%2090%20por%20cento%20dos%20neg%C3%B3cios%20perdem%20vendas%20todos%20os%20dias%20por%20n%C3%A3o%20postarem%20v%C3%ADdeos.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'impact',
    componentProps: {
      headline: '90% PERDEM VENDAS DIARIAMENTE',
      subtext: 'O poder da retenção automática nas redes sociais',
      highlightWords: ['90%', 'vendas', 'vídeos'],
      badge: 'SEGREDO DO MERCADO',
    },
  },
  {
    id: 'sc-2',
    sceneIndex: 1,
    text: 'Mais de 84 por cento do tráfego digital atual é dominado pelo consumo de vídeos curtos verticais.',
    durationSec: 4.2,
    componentType: 'StatCounter',
    audioUrl: '/api/tts?text=Mais%20de%2084%20por%20cento%20do%20tr%C3%A1fego%20digital%20atual%20%C3%A9%20dominado%20pelo%20consumo%20de%20v%C3%ADdeos%20curtos%20verticais.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'whoosh',
    componentProps: {
      number: 84,
      suffix: '%',
      prefix: '+',
      label: 'Atenção no Formato Vertical',
      description: 'Reels, Shorts e TikTok geram 3.5x mais conversão',
    },
  },
  {
    id: 'sc-3',
    sceneIndex: 2,
    text: 'Com o nosso gerador automático, você transforma uma simples frase em um vídeo profissional em segundos.',
    durationSec: 4.4,
    componentType: 'MediaBroll',
    audioUrl: '/api/tts?text=Com%20o%20nosso%20gerador%20autom%C3%A1tico%2C%20voc%C3%AA%20transforma%20uma%20simples%20frase%20em%20um%20v%C3%ADdeo%20profissional%20em%20segundos.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'pop',
    componentProps: {
      overlayText: 'PRONTO EM MENOS DE 60 SEGUNDOS',
      caption: 'Voz neural + Legendas dinâmicas + B-Roll HD',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1080&q=85',
    },
  },
  {
    id: 'sc-4',
    sceneIndex: 3,
    text: 'Digite o seu tema ao lado, clique em gerar vídeo e baixe seu arquivo pronto para postar.',
    durationSec: 4.0,
    componentType: 'CTAButton',
    audioUrl: '/api/tts?text=Digite%20o%20seu%20tema%20ao%20lado%2C%20clique%20em%20gerar%20v%C3%ADdeo%20e%20baixe%20seu%20arquivo%20pronto%20para%20postar.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'rise',
    componentProps: {
      buttonText: 'Gerar Meu Vídeo Agora',
      subcaption: '100% automático e sem edição manual',
      accentColor: '#eab308',
    },
  },
];

const INITIAL_MANIFEST: VideoManifest = {
  title: 'Vídeo Sem Título',
  version: '2.0',
  jobId: `job_${Date.now()}`,
  userId: 'user_default',
  videoType: 'viral_hormozi',
  presetId: DEFAULT_STYLE_PRESETS[1]?.id || 'kinetic_yellow',
  aspectRatio: '9:16',
  resolution: { width: 1080, height: 1920 },
  audio: {
    voiceTone: 'energetic',
    ttsVoiceId: 'pt-BR-AntonioNeural',
    bgMusicUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    bgMusicVolume: 0.14,
    sfxEnabled: true,
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
        scenes: state.manifest.scenes.map((sc: ScriptScene) =>
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
      audioUrl: '/api/tts?text=Insira%20aqui%20o%20roteiro%20da%20nova%20cena...&lang=pt-BR',
      brollImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
      sfxType: 'whoosh',
      componentProps: {
        headline: 'NOVO DESTAQUE',
        subtext: 'Personalize o texto desta cena',
        highlightWords: ['Destaque'],
        badge: 'PASSO',
      },
    };

    const updated = [...manifest.scenes];
    updated.splice(targetIdx, 0, newScene);
    const reindexed = updated.map((sc: ScriptScene, i: number) => ({ ...sc, sceneIndex: i }));

    set((state) => ({
      manifest: { ...state.manifest, scenes: reindexed },
      selectedSceneId: newScene.id,
    }));
  },

  removeScene: (sceneId: string) => {
    const { manifest } = get();
    if (manifest.scenes.length <= 1) return;
    const filtered = manifest.scenes
      .filter((s: ScriptScene) => s.id !== sceneId)
      .map((sc: ScriptScene, i: number) => ({ ...sc, sceneIndex: i }));

    set((state) => ({
      manifest: { ...state.manifest, scenes: filtered },
      selectedSceneId: filtered[0]?.id || null,
    }));
  },

  reorderScenes: (startIndex: number, endIndex: number) => {
    const { manifest } = get();
    const result = Array.from(manifest.scenes);
    const [removed] = result.splice(startIndex, 1);
    if (!removed) return;
    result.splice(endIndex, 0, removed);
    const reindexed = result.map((sc: ScriptScene, i: number) => ({ ...sc, sceneIndex: i }));

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
    return manifest.scenes.reduce((acc: number, sc: ScriptScene) => acc + (sc.durationSec || 0), 0);
  },
}));
