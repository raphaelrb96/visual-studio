/**
 * Catálogo Oficial com os 20 Templates / Modelos de Motion Graphics (Retenção Máxima)
 */

export type MotionTemplateId =
  // 1. Ganchos & Retenção (0s a 4s)
  | 'hormozi_bold'
  | 'alerta_urgente'
  | 'pergunta_provocativa'
  | 'segredo_revelado'
  // 2. Notícias & Prova Social
  | 'news_headline'
  | 'tweet_card'
  | 'chat_simulation'
  | 'quote_autoridade'
  // 3. Dados & Métricas (Vox Style)
  | 'stat_counter'
  | 'grafico_barras'
  | 'versus_comparison'
  | 'timeline_progress'
  // 4. Mídia & B-Rolls
  | 'ken_burns_cinematic'
  | 'split_collage'
  | 'broll_spotlight'
  | 'card_frase_impacto'
  // 5. Conversão & CTA
  | 'cta_pulse'
  | 'ranking_top3'
  | 'lista_passos'
  | 'minimal_luxury';

export interface MotionTemplateConfig {
  id: MotionTemplateId;
  name: string;
  category: 'Gancho & Retenção' | 'Social & Notícia' | 'Dados & Métricas' | 'Mídia & B-Roll' | 'Conversão & CTA';
  description: string;
  badge: string;
  defaultHighlightColor: string;
  recommendedDuration: number;
  previewIcon: string;
}

export const MOTION_TEMPLATES: MotionTemplateConfig[] = [
  // 1. Ganchos & Retenção
  {
    id: 'hormozi_bold',
    name: 'Hormozi Viral Bold',
    category: 'Gancho & Retenção',
    description: 'Tipografia condensada ultra-pesada com palavra falada em Amarelo Neon e B-Roll em zoom contínuo.',
    badge: 'ALERTA VIRAL',
    defaultHighlightColor: '#facc15',
    recommendedDuration: 4.5,
    previewIcon: '⚡',
  },
  {
    id: 'alerta_urgente',
    name: 'Alerta Vermelho Urgente',
    category: 'Gancho & Retenção',
    description: 'Badge piscante de aviso crítico com iluminação vermelha, vinheta de perigo e revelação em choque.',
    badge: '⚠️ ATENÇÃO CRÍTICA',
    defaultHighlightColor: '#ef4444',
    recommendedDuration: 4.0,
    previewIcon: '🚨',
  },
  {
    id: 'pergunta_provocativa',
    name: 'Pergunta Provocativa',
    category: 'Gancho & Retenção',
    description: 'Ponto de interrogação gigante elástico com iluminação roxa e foco na dor oculta do público.',
    badge: 'VOCÊ SABIA?',
    defaultHighlightColor: '#a855f7',
    recommendedDuration: 4.5,
    previewIcon: '❓',
  },
  {
    id: 'segredo_revelado',
    name: 'Segredo / Censura Revelada',
    category: 'Gancho & Retenção',
    description: 'Tarja preta de censura com som de glitch que se destrava para revelar um fato proibido.',
    badge: 'CONFIDENCIAL',
    defaultHighlightColor: '#f59e0b',
    recommendedDuration: 5.0,
    previewIcon: '🔒',
  },

  // 2. Notícias & Prova Social
  {
    id: 'news_headline',
    name: 'Breaking News Vox',
    category: 'Social & Notícia',
    description: 'Tarja de telejornal investigativo ao vivo com ticker animado no rodapé e logo de transmissão.',
    badge: '🔴 PLANTÃO URGENTE',
    defaultHighlightColor: '#38bdf8',
    recommendedDuration: 5.0,
    previewIcon: '📰',
  },
  {
    id: 'tweet_card',
    name: 'Tweet / Post Viral X',
    category: 'Social & Notícia',
    description: 'Card flutuante estilo Twitter/X com selo de verificado azul, avatar do autor e métricas virais.',
    badge: 'X / TWITTER',
    defaultHighlightColor: '#1d9bf0',
    recommendedDuration: 5.5,
    previewIcon: '🐦',
  },
  {
    id: 'chat_simulation',
    name: 'Chat iMessage / WhatsApp',
    category: 'Social & Notícia',
    description: 'Balões de conversa em sequência com som de digitação e entrega para contar histórias reais.',
    badge: 'CONVERSA REAL',
    defaultHighlightColor: '#22c55e',
    recommendedDuration: 6.0,
    previewIcon: '💬',
  },
  {
    id: 'quote_autoridade',
    name: 'Citação de Autoridade',
    category: 'Social & Notícia',
    description: 'Aspas douradas gigantes com texto serifado elegante e assinatura do autor no rodapé.',
    badge: 'AUTORIDADE',
    defaultHighlightColor: '#eab308',
    recommendedDuration: 5.0,
    previewIcon: '✍️',
  },

  // 3. Dados & Métricas (Vox Style)
  {
    id: 'stat_counter',
    name: 'Contador de Impacto (0 a 99%)',
    category: 'Dados & Métricas',
    description: 'Número gigante com contagem acelerada e mola de parada destacando porcentagens de impacto.',
    badge: 'DADO CHOCANTE',
    defaultHighlightColor: '#38bdf8',
    recommendedDuration: 4.5,
    previewIcon: '📈',
  },
  {
    id: 'grafico_barras',
    name: 'Gráfico de Barras Animado',
    category: 'Dados & Métricas',
    description: 'Barras verticais que sobem comparando métodos ultrapassados com a nova engrenagem.',
    badge: 'ESTATÍSTICA',
    defaultHighlightColor: '#6366f1',
    recommendedDuration: 5.5,
    previewIcon: '📊',
  },
  {
    id: 'versus_comparison',
    name: 'Versus (Antes vs Depois)',
    category: 'Dados & Métricas',
    description: 'Divisão com cards comparativos: Card vermelho (erro comum) vs Card verde (solução comprovada).',
    badge: 'COMPARAÇÃO BRUTAL',
    defaultHighlightColor: '#22c55e',
    recommendedDuration: 5.0,
    previewIcon: '⚔️',
  },
  {
    id: 'timeline_progress',
    name: 'Barra de Progresso & Timeline',
    category: 'Dados & Métricas',
    description: 'Linha do tempo interativa conectando passos sucessivos com nós iluminados.',
    badge: 'PASSO A PASSO',
    defaultHighlightColor: '#06b6d4',
    recommendedDuration: 5.0,
    previewIcon: '⏳',
  },

  // 4. Mídia & B-Rolls
  {
    id: 'ken_burns_cinematic',
    name: 'Cinema Ken Burns Pan',
    category: 'Mídia & B-Roll',
    description: 'Movimento cinematográfico suave de aproximação em altíssima resolução com granulação sutil.',
    badge: 'CINEMATOGRÁFICO',
    defaultHighlightColor: '#f8fafc',
    recommendedDuration: 4.5,
    previewIcon: '🎥',
  },
  {
    id: 'split_collage',
    name: 'Colagem Dupla Multi-Camadas',
    category: 'Mídia & B-Roll',
    description: 'Duas imagens de alta resolução em diagonal com velocidades de movimento opostas e vinheta.',
    badge: 'COLAGEM B-ROLL',
    defaultHighlightColor: '#818cf8',
    recommendedDuration: 5.0,
    previewIcon: '🖼️',
  },
  {
    id: 'broll_spotlight',
    name: 'Spotlight com Luz Central',
    category: 'Mídia & B-Roll',
    description: 'Holofote de luz no centro da mídia com bordas escuras profundas e texto destacado.',
    badge: 'EM FOCO',
    defaultHighlightColor: '#fbbf24',
    recommendedDuration: 4.5,
    previewIcon: '🔦',
  },
  {
    id: 'card_frase_impacto',
    name: 'Card Flutuante Glassmorphism',
    category: 'Mídia & B-Roll',
    description: 'Card translúcido com efeito de vidro fosco, bordas brilhantes e sombra volumétrica.',
    badge: 'DESTAQUE',
    defaultHighlightColor: '#38bdf8',
    recommendedDuration: 4.5,
    previewIcon: '💎',
  },

  // 5. Conversão & CTA
  {
    id: 'cta_pulse',
    name: 'Botão de Ação Pulsante (CTA)',
    category: 'Conversão & CTA',
    description: 'Botão de conversão com pulso contínuo convidando o espectador a clicar no link da bio.',
    badge: 'AÇÃO IMEDIATA',
    defaultHighlightColor: '#22c55e',
    recommendedDuration: 4.5,
    previewIcon: '🔥',
  },
  {
    id: 'ranking_top3',
    name: 'Ranking Top 3 em Pódio',
    category: 'Conversão & CTA',
    description: 'Pódio animado com medalhas ouro, prata e bronze revelando os melhores métodos.',
    badge: 'TOP 3',
    defaultHighlightColor: '#eab308',
    recommendedDuration: 6.0,
    previewIcon: '🏆',
  },
  {
    id: 'lista_passos',
    name: 'Checklist / Lista de Passos',
    category: 'Conversão & CTA',
    description: 'Checklist interativo com ícones de verificação verdes que acendem conforme a narração avança.',
    badge: 'CHECKLIST PRÁTICO',
    defaultHighlightColor: '#10b981',
    recommendedDuration: 5.5,
    previewIcon: '✅',
  },
  {
    id: 'minimal_luxury',
    name: 'Minimal Black & Gold',
    category: 'Conversão & CTA',
    description: 'Estética de altíssimo padrão com preto absoluto, dourado metálico e tipografia serifada.',
    badge: 'ALTA RENDA / LUXO',
    defaultHighlightColor: '#eab308',
    recommendedDuration: 5.0,
    previewIcon: '👑',
  },
];
