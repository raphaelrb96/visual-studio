export type TrackType = 'motion' | 'media' | 'subtitle' | 'audio';

export interface TimelineElement {
  id: string;
  trackId: string;
  trackType: TrackType;
  name: string;
  startSec: number;
  durationSec: number;
  // Propriedades visuais do Canva / Posicionamento
  type: string; // 'StatCounter' | 'GraficoBarras' | 'VersusComparison' | 'NewsHeadline' | 'TweetCard' | 'CardFrase' | 'BrollImage' | 'AudioVoice' | 'SubtitleWord'
  props: Record<string, any>;
  canvas?: {
    x?: number; // porcentagem ou px
    y?: number;
    scale?: number;
    rotation?: number;
    zIndex?: number;
  };
  // Sincronia de áudio e texto caso pertença a essa trilha
  audioUrl?: string;
  text?: string;
}

export interface SelectedElementRef {
  elementId: string;
  trackType: TrackType;
  sceneId?: string;
}
