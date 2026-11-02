export type VideoType = string;

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type ProjectStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  theme: {
    backgroundColor: string;
    primaryTextColor: string;
    highlightTextColor: string;
    fontFamily: string;
    cardStyle: 'glassmorphism' | 'flat_dark' | 'neon_border' | 'minimal_light';
  };
}

export type ComponentType = string;

export interface WordTimestamp {
  word: string;
  startSec: number;
  endSec: number;
}

export type SfxType = 'whoosh' | 'pop' | 'impact' | 'rise' | 'glitch' | 'cash' | 'cinematic_boom' | 'typing' | 'none';

export type CameraMotionType = 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'float_3d' | 'static';

export type TransitionType = 'cut' | 'spring_slide' | 'flash_zoom' | 'glitch_cut' | 'fade';

export interface ScriptScene {
  id: string;
  sceneIndex: number;
  text: string;
  durationSec: number;
  // Timing individual por faixa para edição livre assíncrona estilo CapCut
  motionStartSec?: number;
  motionDurationSec?: number;
  mediaStartSec?: number;
  mediaDurationSec?: number;
  subtitleStartSec?: number;
  subtitleDurationSec?: number;
  audioStartSec?: number;
  audioDurationSec?: number;
  summary?: string;
  visualPrompt?: string;
  compiledCustomHtml?: string;
  compiledGsapScript?: string;
  componentType?: string;
  componentProps?: Record<string, any>;
  audioUrl?: string;
  brollVideoUrl?: string;
  brollImageUrl?: string;
  collageImages?: string[];
  sfxType?: SfxType;
  cameraMotion?: CameraMotionType;
  transition?: TransitionType;
  visualNotes?: string;
  wordTimestamps?: WordTimestamp[];
  [key: string]: any;
}

export interface TrackClip {
  id: string;
  trackId: string;
  name: string;
  startSec: number;
  durationSec: number;
  type: 'motion' | 'media' | 'subtitle' | 'audio' | 'overlay' | 'sfx' | 'sticker' | 'effect';
  content?: string;
  url?: string;
  templateId?: string;
  componentProps?: Record<string, any>;
  customHtml?: string;
  customGsap?: string;
  color?: string;
  isMuted?: boolean;
  isLocked?: boolean;
  [key: string]: any;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'motion' | 'media' | 'subtitle' | 'audio' | 'overlay' | 'sfx' | 'sticker' | 'effect' | 'custom';
  color?: string;
  icon?: string;
  isLocked?: boolean;
  isMuted?: boolean;
  isSolo?: boolean;
  clips: TrackClip[];
}

export interface VideoProject {
  id: string;
  userId: string;
  title: string;
  currentStep?: ProjectStep;
  prompt?: string;
  fullNarration?: string;
  fullAudioUrl?: string;
  videoType?: VideoType;
  aspectRatio: AspectRatio;
  presetId?: string;
  scenes: ScriptScene[];
  // Pistas infinitas e irrestritas NLE
  tracks?: TimelineTrack[];
  audio: {
    voiceTone?: 'energetic' | 'deep' | 'calm' | 'authoritative';
    ttsVoiceId?: string;
    bgMusicVolume?: number;
    bgMusicUrl?: string;
    sfxEnabled?: boolean;
    [key: string]: any;
  };
  subtitles?: any;
  status?: 'draft' | 'compiling' | 'rendering' | 'ready' | 'failed';
  videoUrl?: string;
  renderProgress?: number;
  errorMessage?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
  version?: string;
  jobId?: string;
  [key: string]: any;
}

export type VideoManifest = VideoProject;
export type JobStatus = 'queued' | 'rendering' | 'ready' | 'failed';
export interface RenderJob {
  id: string;
  projectId: string;
  status: JobStatus;
  progress: number;
  videoUrl?: string;
}

export const CREDIT_COSTS = {
  generateScript: 1,
  refineScriptWithAi: 1,
  generateVoiceover: 2,
  generateAiImage: 3,
  compileManifest: 2,
  renderFinalVideo: 5,
};

export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: 'hormozi_bold',
    name: 'Hormozi Viral Bold',
    description: 'Fundo escuro profundo, tipografia condensada e destaques amarelos de alto impacto.',
    previewImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    theme: {
      backgroundColor: '#090a0f',
      primaryTextColor: '#ffffff',
      highlightTextColor: '#facc15',
      fontFamily: 'Inter, sans-serif',
      cardStyle: 'glassmorphism',
    },
  },
  {
    id: 'vox_documentary',
    name: 'Vox Documentary & Data',
    description: 'Estética investigativa com infográficos, mapas limpos e paleta ciano moderna.',
    previewImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    theme: {
      backgroundColor: '#080d1a',
      primaryTextColor: '#f8fafc',
      highlightTextColor: '#38bdf8',
      fontFamily: 'Inter, sans-serif',
      cardStyle: 'flat_dark',
    },
  },
  {
    id: 'finance_luxury',
    name: 'Magnates Luxury Gold',
    description: 'Visual cinematográfico escuro com dourado premium e efeitos de profundidade.',
    previewImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&auto=format&fit=crop&q=80',
    theme: {
      backgroundColor: '#050508',
      primaryTextColor: '#ffffff',
      highlightTextColor: '#eab308',
      fontFamily: 'Inter, sans-serif',
      cardStyle: 'neon_border',
    },
  },
];
