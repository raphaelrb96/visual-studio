export type VideoType = 
  | 'motion_narrated' 
  | 'smart_clips' 
  | 'avatar_ia' 
  | 'clipes_ia';

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

export type ComponentType = 
  | 'CardFrase' 
  | 'GraficoPizza' 
  | 'GraficoBarras' 
  | 'StatCounter' 
  | 'MediaBroll' 
  | 'CTAButton'
  | 'TweetCard'
  | 'NewsHeadline'
  | 'ChatSimulation'
  | 'QuoteCard'
  | 'VersusComparison'
  | 'Object3DShowcase'
  | 'CollageBroll';

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
  componentType: ComponentType;
  componentProps: Record<string, any>;
  audioUrl?: string;
  brollVideoUrl?: string;
  brollImageUrl?: string;
  collageImages?: string[];
  sfxType?: SfxType;
  cameraMotion?: CameraMotionType;
  transition?: TransitionType;
  visualNotes?: string;
  hyperframeConfig?: {
    physicsDamping?: number;
    physicsStiffness?: number;
    threeJsObject?: 'coin' | 'diamond' | 'shield' | 'cube';
    lightColor?: string;
    customHtmlOverlay?: string;
  };
  wordTimestamps?: WordTimestamp[];
}

export interface VideoProject {
  id: string;
  userId: string;
  title: string;
  currentStep: ProjectStep;
  prompt: string;
  videoType: VideoType;
  aspectRatio: AspectRatio;
  presetId: string;
  scenes: ScriptScene[];
  audio: {
    voiceTone: 'energetic' | 'deep' | 'calm' | 'authoritative';
    ttsVoiceId: string;
    bgMusicVolume: number;
    sfxEnabled: boolean;
  };
  subtitles: {
    enabled: boolean;
    style: 'kinetic_word' | 'karaoke_highlight' | 'classic_bottom';
  };
  totalCreditsConsumed: number;
  status: 'draft' | 'ready' | 'processing';
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCostTable {
  generateScript: number;
  refineScriptWithAi: number;
  generateAiImage: number;
  generateTtsSpeech: number;
  finalRender: number;
}

export const CREDIT_COSTS: CreditCostTable = {
  generateScript: 2,
  refineScriptWithAi: 1,
  generateAiImage: 3,
  generateTtsSpeech: 2,
  finalRender: 5,
};

export type JobStatus = 'queued' | 'rendering' | 'done' | 'failed';

export interface RenderJob {
  id: string;
  projectId: string;
  status: JobStatus;
  progress: number;
  stage: string;
  outputUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoManifest {
  version?: string;
  jobId?: string;
  userId?: string;
  videoType?: string;
  resolution?: { width: number; height: number };
  title: string;
  presetName?: string;
  aspectRatio: AspectRatio;
  presetId: string;
  scenes: ScriptScene[];
  audio: {
    voiceTone: 'energetic' | 'deep' | 'calm' | 'authoritative';
    ttsVoiceId: string;
    bgMusicVolume: number;
    bgMusicUrl?: string;
    sfxEnabled: boolean;
  };
  subtitles: {
    enabled: boolean;
    style: 'kinetic_word' | 'karaoke_highlight' | 'classic_bottom';
  };
}
