/**
 * Biblioteca Curada de Mídia B-Roll Cinematográfica (Vídeos HD e Imagens 4K com CORS livre)
 * Utilizada pelo Agente Diretor de Arte para associar automaticamente cenas reais ao tema do vídeo.
 */

export interface BrollAsset {
  id: string;
  category: 'business' | 'tech' | 'finance' | 'health' | 'marketing' | 'lifestyle';
  keywords: string[];
  videoUrl: string;
  imageUrl: string;
}

export const CURATED_BROLL_ASSETS: BrollAsset[] = [
  {
    id: 'broll-tech-1',
    category: 'tech',
    keywords: ['ia', 'inteligência artificial', 'tecnologia', 'software', 'código', 'automação', 'digital', 'futuro', 'dados'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-futuristic-devices-99786-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
  },
  {
    id: 'broll-business-1',
    category: 'business',
    keywords: ['negócios', 'empresa', 'escritório', 'reunião', 'consultoria', 'clientes', 'gestão', 'liderança', 'equipe'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-people-working-in-a-modern-office-4345-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1080&q=85',
  },
  {
    id: 'broll-finance-1',
    category: 'finance',
    keywords: ['vendas', 'dinheiro', 'lucro', 'faturamento', 'investimento', 'mercado', 'crescimento', 'escala', 'rico', 'resultado'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-4729-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=85',
  },
  {
    id: 'broll-health-1',
    category: 'health',
    keywords: ['médico', 'saúde', 'clínica', 'consultório', 'estética', 'paciente', 'bem-estar', 'fitness', 'treino', 'odonto'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-doctor-looking-at-a-patients-chart-41522-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1080&q=85',
  },
  {
    id: 'broll-marketing-1',
    category: 'marketing',
    keywords: ['marketing', 'anúncio', 'tráfego', 'redes sociais', 'instagram', 'tiktok', 'reels', 'viral', 'conteúdo', 'audiência'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-using-her-smartphone-at-night-41443-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1080&q=85',
  },
  {
    id: 'broll-lifestyle-1',
    category: 'lifestyle',
    keywords: ['liberdade', 'tempo', 'viagem', 'produtividade', 'rotina', 'foco', 'sucesso', 'mente', 'hábito'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1080&q=85',
  },
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1080&q=85',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1080&q=85',
];

/**
 * Seleciona um B-Roll contextualizado para a frase da cena e o índice
 */
export function selectContextualBroll(
  text: string,
  sceneIndex: number
): { videoUrl: string; imageUrl: string; collageImages: string[] } {
  const lower = text.toLowerCase();
  let primaryImageUrl = FALLBACK_IMAGES[sceneIndex % FALLBACK_IMAGES.length];
  let primaryVideoUrl = CURATED_BROLL_ASSETS[sceneIndex % CURATED_BROLL_ASSETS.length].videoUrl;

  for (const asset of CURATED_BROLL_ASSETS) {
    if (asset.keywords.some((kw) => lower.includes(kw))) {
      primaryVideoUrl = asset.videoUrl;
      primaryImageUrl = asset.imageUrl;
      break;
    }
  }

  const secondImg = FALLBACK_IMAGES[(sceneIndex + 1) % FALLBACK_IMAGES.length];
  const thirdImg = FALLBACK_IMAGES[(sceneIndex + 3) % FALLBACK_IMAGES.length];

  return {
    videoUrl: primaryVideoUrl,
    imageUrl: primaryImageUrl,
    collageImages: [primaryImageUrl, secondImg, thirdImg],
  };
}
