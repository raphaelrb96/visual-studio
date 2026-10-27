import { StylePreset } from '@/types/studio';

export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: 'dark_vox',
    name: 'Dark Vox',
    description: 'Estilo dinâmico inspirado em canais de mídia investigativa e ensaios visuais modernos.',
    previewImageUrl: '/presets/dark-vox.png',
    theme: {
      backgroundColor: '#0a0e17',
      primaryTextColor: '#f8fafc',
      highlightTextColor: '#6366f1',
      fontFamily: 'Inter, sans-serif',
      cardStyle: 'glassmorphism',
    },
  },
  {
    id: 'kinetic_yellow',
    name: 'Kinetic Yellow',
    description: 'Alto impacto e retenção extrema com tipografia expressiva e contraste elétrico amarelo e preto.',
    previewImageUrl: '/presets/kinetic-yellow.png',
    theme: {
      backgroundColor: '#050505',
      primaryTextColor: '#ffffff',
      highlightTextColor: '#facc15',
      fontFamily: 'Montserrat, sans-serif',
      cardStyle: 'neon_border',
    },
  },
  {
    id: 'cyber_news',
    name: 'Cyber News',
    description: 'Linguagem futurista com tons ciano, grades de dados e estética tech contemporânea.',
    previewImageUrl: '/presets/cyber-news.png',
    theme: {
      backgroundColor: '#070c18',
      primaryTextColor: '#e2e8f0',
      highlightTextColor: '#06b6d4',
      fontFamily: 'Space Grotesk, sans-serif',
      cardStyle: 'neon_border',
    },
  },
  {
    id: 'minimal_clean',
    name: 'Minimalist Clean',
    description: 'Minimalismo elegante, espaçamento cirúrgico e sofisticação para marcas e negócios.',
    previewImageUrl: '/presets/minimal-clean.png',
    theme: {
      backgroundColor: '#0f172a',
      primaryTextColor: '#f8fafc',
      highlightTextColor: '#10b981',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      cardStyle: 'flat_dark',
    },
  },
  {
    id: 'neon_purple',
    name: 'Neon Velocity',
    description: 'Paleta ultra vibrante com gradientes púrpura e violeta, perfeita para entretenimento e storytelling.',
    previewImageUrl: '/presets/neon-purple.png',
    theme: {
      backgroundColor: '#0c071e',
      primaryTextColor: '#ffffff',
      highlightTextColor: '#a855f7',
      fontFamily: 'Outfit, sans-serif',
      cardStyle: 'glassmorphism',
    },
  },
];

export const getPresetById = (id: string): StylePreset => {
  return DEFAULT_STYLE_PRESETS.find((p) => p.id === id) || DEFAULT_STYLE_PRESETS[0];
};
