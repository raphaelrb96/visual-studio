/**
 * Gerenciador de Áudio & Trilha Sonora Ambiente
 * Remove ruídos procedurais artificiais e foca na clareza sonora da voz neural e música de fundo elegante.
 */

import { SfxType } from '@/types/studio';

class StudioSoundEngine {
  public playSfx(_type: SfxType = 'none', _volume = 0.1) {
    // Desativado: nenhum ruído procedural artificial
  }
}

export const soundEngine = new StudioSoundEngine();

export interface AmbientTrackOption {
  id: string;
  label: string;
  name: string;
  mood: string;
  url: string;
}

export const AMBIENT_TRACKS: AmbientTrackOption[] = [
  {
    id: 'none',
    label: 'Sem Trilha Musical (Voz Pura & Cristalina)',
    name: 'Sem Trilha Musical',
    mood: 'Voz Pura',
    url: '',
  },
  {
    id: 'cinematic_tension',
    label: 'Documentário Investigativo (Suave)',
    name: 'Investigative Tension',
    mood: 'Documentário / Vox',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: 'lofi_focus',
    label: 'Minimal Lo-Fi (Negócios / Foco)',
    name: 'Minimal Focus',
    mood: 'Negócios / Finanças',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3',
  },
];
