export type VideoType = 
  | 'motion_narrated' 
  | 'smart_clips' 
  | 'avatar_lipsync' 
  | 'data_motion' 
  | 'chat_story' 
  | 'motion_ads';

export type AspectRatio = '9:16' | '16:9' | '1:1';

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
  | 'CTAButton';

export interface ScriptScene {
  id: string;
  sceneIndex: number;
  text: string;
  durationSec: number;
  componentType: ComponentType;
  componentProps: Record<string, any>;
  audioUrl?: string;
}

export interface VideoManifest {
  version: '1.0';
  jobId: string;
  userId: string;
  videoType: VideoType;
  presetId: string;
  aspectRatio: AspectRatio;
  resolution: { width: number; height: number };
  audio: {
    ttsVoiceId: string;
    bgMusicUrl?: string;
    bgMusicVolume: number; // Ex: 0.12 (12%)
  };
  scenes: ScriptScene[];
  subtitles: {
    enabled: boolean;
    style: 'kinetic_word' | 'karaoke_highlight' | 'classic_bottom';
  };
}

export type JobStatus = 
  | 'draft'
  | 'queued' 
  | 'synthesizing_audio' 
  | 'compiling_hyperframes' 
  | 'encoding_ffmpeg' 
  | 'completed' 
  | 'failed';

export interface RenderJob {
  id: string;
  userId: string;
  manifest: VideoManifest;
  status: JobStatus;
  progressPercent: number;
  currentStepMessage: string;
  createdAt: string;
  completedAt?: string;
  outputVideoUrl?: string;
  error?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: 'free' | 'pro' | 'agency';
  creditsRemaining: number;
  totalVideosGenerated: number;
  cloudMinutesRendered: number;
  gcsStorageUsedMb: number;
}
