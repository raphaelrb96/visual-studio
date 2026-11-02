import { create } from 'zustand';
import { 
  VideoManifest, 
  ScriptScene, 
  AspectRatio, 
  RenderJob,
  JobStatus,
  TimelineTrack,
  TrackClip
} from '@/types/studio';
import { TimelineElement } from '@/types/timeline-elements';
import { DEFAULT_STYLE_PRESETS } from '@/lib/presets';

interface StudioState {
  manifest: VideoManifest;
  isPlaying: boolean;
  currentTime: number;
  currentSceneIndex: number;
  selectedSceneId: string | null;
  selectedElementId: string | null;
  selectedElementType: string | null;
  playbackSpeed: number;
  currentJob: RenderJob | null;

  setPreset: (presetId: string) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setFullNarration: (narration: string, audioUrl?: string) => void;
  setScenes: (scenes: ScriptScene[]) => void;
  updateScene: (sceneId: string, updates: Partial<ScriptScene>) => void;
  addScene: (afterIndex?: number) => void;
  removeScene: (sceneId: string) => void;
  reorderScenes: (startIndex: number, endIndex: number) => void;
  selectScene: (sceneId: string | null) => void;
  selectElement: (elementId: string | null, elementType?: string | null) => void;
  updateElementProps: (elementId: string, updates: Record<string, any>) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setAudioConfig: (audio: Partial<VideoManifest['audio']>) => void;
  setSubtitleConfig: (subtitles: Partial<VideoManifest['subtitles']>) => void;
  setCurrentJob: (job: RenderJob | null) => void;
  updateJobProgress: (progress: number, message: string, status?: JobStatus) => void;
  getTotalDuration: () => number;

  // Gerenciamento de Pistas Infinitas Livres
  addTrack: (trackType?: TimelineTrack['type'], name?: string) => string;
  removeTrack: (trackId: string) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
  addClipToTrack: (trackId: string, clip: Omit<TrackClip, 'id' | 'trackId'>) => string;
  updateClip: (clipId: string, updates: Partial<TrackClip>) => void;
  removeClip: (clipId: string) => void;
  moveClip: (clipId: string, targetTrackId: string, newStartSec: number) => void;
}

const DEFAULT_SCENES: ScriptScene[] = [
  {
    id: 'sc-1',
    sceneIndex: 0,
    text: 'Quase ninguém te conta isso, mas 90 por cento dos negócios perdem vendas todos os dias por não postarem vídeos.',
    durationSec: 5.0,
    templateId: 'assemble-then-type-flyin',
    componentType: 'assemble-then-type-flyin' as any,
    audioUrl: '/api/tts?text=Quase%20ningu%C3%A9m%20te%20conta%20isso%2C%20mas%2090%20por%20cento%20dos%20neg%C3%B3cios%20perdem%20vendas%20todos%20os%20dias%20por%20n%C3%A3o%20postarem%20v%C3%ADdeos.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'impact',
    componentProps: {
      headline: '90% PERDEM VENDAS DIARIAMENTE',
      subtext: 'O poder da retenção automática nas redes sociais',
      highlightWords: ['90%', 'vendas', 'vídeos'],
      badge: 'MOTION STUDIO',
    },
  },
  {
    id: 'sc-2',
    sceneIndex: 1,
    text: 'Mais de 84 por cento do tráfego digital atual é dominado pelo consumo de vídeos curtos verticais.',
    durationSec: 4.5,
    templateId: 'flying-words',
    componentType: 'flying-words' as any,
    audioUrl: '/api/tts?text=Mais%20de%2084%20por%20cento%20do%20tr%C3%A1fego%20digital%20atual%20%C3%A9%20dominado%20pelo%20consumo%20de%20v%C3%ADdeos%20curtos%20verticais.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'whoosh',
    componentProps: {
      headline: '84% DO TRÁFEGO É VERTICAL',
      subtext: 'Reels, Shorts e TikTok geram 3.5x mais conversão',
      number: 84,
      suffix: '%',
      prefix: '+',
      label: 'Atenção no Formato Vertical',
    },
  },
  {
    id: 'sc-3',
    sceneIndex: 2,
    text: 'Com o nosso gerador automático, você transforma uma simples frase em um vídeo profissional em segundos.',
    durationSec: 4.5,
    templateId: 'card-stack',
    componentType: 'card-stack' as any,
    audioUrl: '/api/tts?text=Com%20o%20nosso%20gerador%20autom%C3%A1tico%2C%20voc%C3%AA%20transforma%20uma%20simples%20frase%20em%20um%20v%C3%ADdeo%20profissional%20em%20segundos.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'pop',
    componentProps: {
      headline: 'PRONTO EM SEGUNDOS',
      subtext: 'Voz neural + Legendas dinâmicas + B-Roll HD',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1080&q=85',
    },
  },
  {
    id: 'sc-4',
    sceneIndex: 3,
    text: 'Digite o seu tema ao lado, clique em gerar vídeo e baixe seu arquivo pronto para postar.',
    durationSec: 4.5,
    templateId: 'spotlight-hero-card',
    componentType: 'spotlight-hero-card' as any,
    audioUrl: '/api/tts?text=Digite%20o%20seu%20tema%20ao%20lado%2C%20clique%20em%20gerar%20v%C3%ADdeo%20e%20baixe%20seu%20arquivo%20pronto%20para%20postar.&lang=pt-BR',
    brollImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1080&q=85',
    sfxType: 'rise',
    componentProps: {
      headline: 'GERE SEU VÍDEO AGORA',
      subtext: '100% automático e sem edição manual',
      buttonText: 'Gerar Meu Vídeo Agora',
      accentColor: '#eab308',
    },
  },
];

const INITIAL_MANIFEST: VideoManifest = {
  id: 'manifest_default',
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
  selectedElementId: `3d-${DEFAULT_SCENES[0].id}`,
  selectedElementType: 'motion',
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

  setFullNarration: (fullNarration: string, fullAudioUrl?: string) => {
    set((state) => ({
      manifest: {
        ...state.manifest,
        fullNarration,
        ...(fullAudioUrl ? { fullAudioUrl } : {}),
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

  selectElement: (elementId: string | null, elementType: string | null = null) => {
    set({
      selectedElementId: elementId,
      selectedElementType: elementType,
      // Se o elemento pertencer a uma cena específica, seleciona a cena para contexto mas mantém foco no elemento
      selectedSceneId: elementId ? elementId.replace(/^(3d|broll|sub|aud)-/, '') : null,
    });
  },

  updateElementProps: (elementId: string, updates: Record<string, any>) => {
    const { manifest } = get();
    const sceneId = elementId.replace(/^(3d|broll|sub|aud)-/, '');
    set({
      manifest: {
        ...manifest,
        scenes: manifest.scenes.map((sc) => {
          if (sc.id !== sceneId) return sc;
          return {
            ...sc,
            ...updates,
            componentProps: {
              ...(sc.componentProps || {}),
              ...(updates.componentProps || {}),
            },
          };
        }),
      },
    });
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
    // Se houver pistas customizadas, a duração total é o maior endSec de qualquer clipe
    if (manifest.tracks && manifest.tracks.length > 0) {
      let maxEnd = 0;
      manifest.tracks.forEach((tr) => {
        tr.clips.forEach((c) => {
          const end = (c.startSec || 0) + (c.durationSec || 0);
          if (end > maxEnd) maxEnd = end;
        });
      });
      if (maxEnd > 0) return Number(maxEnd.toFixed(2));
    }
    return manifest.scenes.reduce((acc: number, sc: ScriptScene) => acc + (sc.durationSec || 0), 0);
  },

  addTrack: (trackType = 'motion', name) => {
    const { manifest } = get();
    const tracks = manifest.tracks ? [...manifest.tracks] : [];
    const count = tracks.filter((t) => t.type === trackType).length + 1;
    const defaultName = name || `${trackType.toUpperCase()} ${count}`;
    const newId = `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newTrack: TimelineTrack = {
      id: newId,
      name: defaultName,
      type: trackType,
      clips: [],
    };

    set({
      manifest: {
        ...manifest,
        tracks: [...tracks, newTrack],
      },
    });

    return newId;
  },

  removeTrack: (trackId: string) => {
    const { manifest } = get();
    if (!manifest.tracks) return;
    set({
      manifest: {
        ...manifest,
        tracks: manifest.tracks.filter((t) => t.id !== trackId),
      },
    });
  },

  reorderTracks: (startIndex: number, endIndex: number) => {
    const { manifest } = get();
    if (!manifest.tracks) return;
    const result = Array.from(manifest.tracks);
    const [removed] = result.splice(startIndex, 1);
    if (!removed) return;
    result.splice(endIndex, 0, removed);
    set({
      manifest: {
        ...manifest,
        tracks: result,
      },
    });
  },

  addClipToTrack: (trackId: string, clipData: Omit<TrackClip, 'id' | 'trackId'>) => {
    const { manifest } = get();
    const tracks = manifest.tracks ? [...manifest.tracks] : [];
    const clipId = `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newClip: TrackClip = {
      name: clipData.name || 'Novo Clipe',
      type: clipData.type || 'motion',
      startSec: typeof clipData.startSec === 'number' ? clipData.startSec : 0,
      durationSec: typeof clipData.durationSec === 'number' ? clipData.durationSec : 4,
      ...clipData,
      id: clipId,
      trackId,
    };

    const updated = tracks.map((tr) => {
      if (tr.id === trackId) {
        return {
          ...tr,
          clips: [...tr.clips, newClip],
        };
      }
      return tr;
    });

    set({
      manifest: {
        ...manifest,
        tracks: updated,
      },
    });

    return clipId;
  },

  updateClip: (clipId: string, updates: Partial<TrackClip>) => {
    const { manifest } = get();
    if (!manifest.tracks) return;

    const updated = manifest.tracks.map((tr) => ({
      ...tr,
      clips: tr.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
    }));

    set({
      manifest: {
        ...manifest,
        tracks: updated,
      },
    });
  },

  removeClip: (clipId: string) => {
    const { manifest } = get();
    if (!manifest.tracks) return;

    const updated = manifest.tracks.map((tr) => ({
      ...tr,
      clips: tr.clips.filter((c) => c.id !== clipId),
    }));

    set({
      manifest: {
        ...manifest,
        tracks: updated,
      },
    });
  },

  moveClip: (clipId: string, targetTrackId: string, newStartSec: number) => {
    const { manifest } = get();
    if (!manifest.tracks) return;

    let targetClip: TrackClip | null = null;

    // Remove clipe da faixa de origem
    const withoutClip = manifest.tracks.map((tr) => {
      const found = tr.clips.find((c) => c.id === clipId);
      if (found) {
        targetClip = { ...found, trackId: targetTrackId, startSec: Math.max(0, newStartSec) };
        return { ...tr, clips: tr.clips.filter((c) => c.id !== clipId) };
      }
      return tr;
    });

    if (!targetClip) return;

    // Adiciona na faixa de destino
    const withClip = withoutClip.map((tr) => {
      if (tr.id === targetTrackId) {
        return { ...tr, clips: [...tr.clips, targetClip!] };
      }
      return tr;
    });

    set({
      manifest: {
        ...manifest,
        tracks: withClip,
      },
    });
  },
}));
