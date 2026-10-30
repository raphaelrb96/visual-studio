/**
 * Tipagens Oficiais do Catálogo de Modelos Revideo
 */

export type RevideoTemplateId =
  // 1. Ganchos & Retenção
  | 'hormozi_bold'
  | 'alerta_urgente'
  | 'pergunta_provocativa'
  | 'segredo_revelado'
  // 2. Notícias & Conteúdo Social
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

export interface RevideoSceneVariables {
  id: string;
  templateId: RevideoTemplateId;
  durationSec: number;
  text: string;
  tag?: string;
  highlightWord?: string;
  brollUrl?: string;
  brollUrlSecondary?: string;
  audioUrl?: string;
  sfx?: string;
  primaryColor?: string;
  highlightColor?: string;
  statValue?: number | string;
  statLabel?: string;
  barsData?: Array<{ label: string; value: number }>;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  ctaText?: string;
  subText?: string;
}

export interface RevideoVideoProjectConfig {
  id: string;
  title: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  fps?: number;
  bgMusicUrl?: string;
  bgMusicVolume?: number;
  scenes: RevideoSceneVariables[];
}

export interface TemplateMetadata {
  id: RevideoTemplateId;
  name: string;
  category: 'Gancho & Retenção' | 'Social & Notícia' | 'Dados & Métricas' | 'Mídia & B-Roll' | 'Conversão & CTA';
  description: string;
  recommendedDuration: number;
  tags: string[];
}

export const TEMPLATE_CATALOG: TemplateMetadata[] = [
  // 1. Ganchos & Retenção
  {
    id: 'hormozi_bold',
    name: 'Hormozi Viral Bold',
    category: 'Gancho & Retenção',
    description: 'Tipografia cinética pesada palavra por palavra com destaque em amarelo neon e B-roll em zoom.',
    recommendedDuration: 4.5,
    tags: ['viral', 'gancho', 'hormozi', 'alta retenção'],
  },
  {
    id: 'alerta_urgente',
    name: 'Alerta Vermelho Urgente',
    category: 'Gancho & Retenção',
    description: 'Badge piscante de aviso crítico com iluminação vermelha e revelação de texto em choque.',
    recommendedDuration: 4.0,
    tags: ['urgente', 'alerta', 'perigo', 'notícia'],
  },
  {
    id: 'pergunta_provocativa',
    name: 'Pergunta Provocativa',
    category: 'Gancho & Retenção',
    description: 'Frase interrogativa com ponto de interrogação elástico gigante e zoom focado no espectador.',
    recommendedDuration: 4.5,
    tags: ['pergunta', 'curiosidade', 'engajamento'],
  },
  {
    id: 'segredo_revelado',
    name: 'Segredo / Blackout Reveal',
    category: 'Gancho & Retenção',
    description: 'Texto coberto por tarja de censura que é destravada em sincronia com o som de glitch.',
    recommendedDuration: 5.0,
    tags: ['segredo', 'curiosidade', 'revelação'],
  },

  // 2. Notícias & Conteúdo Social
  {
    id: 'news_headline',
    name: 'Breaking News Vox',
    category: 'Social & Notícia',
    description: 'Headline de telejornal investigativo com faixa inferior animada e logo de transmissão ao vivo.',
    recommendedDuration: 5.0,
    tags: ['notícia', 'jornalismo', 'documentário'],
  },
  {
    id: 'tweet_card',
    name: 'Tweet / Post Viral X',
    category: 'Social & Notícia',
    description: 'Card idêntico ao Twitter/X com foto de perfil, verificado azul e animação de pop-up flutuante.',
    recommendedDuration: 5.5,
    tags: ['twitter', 'tweet', 'social', 'prova social'],
  },
  {
    id: 'chat_simulation',
    name: 'Chat iMessage / WhatsApp',
    category: 'Social & Notícia',
    description: 'Balões de conversa que surgem com som de notificação para contar histórias de clientes.',
    recommendedDuration: 6.0,
    tags: ['chat', 'whatsapp', 'storytelling'],
  },
  {
    id: 'quote_autoridade',
    name: 'Citação de Autoridade',
    category: 'Social & Notícia',
    description: 'Aspas douradas elegantes no topo com citação central e assinatura do autor no rodapé.',
    recommendedDuration: 5.0,
    tags: ['frase', 'autoridade', 'podcast', 'luxo'],
  },

  // 3. Dados & Métricas (Vox Style)
  {
    id: 'stat_counter',
    name: 'Contador de Impacto (0% a 99%)',
    category: 'Dados & Métricas',
    description: 'Dígito numérico gigante que conta rapidamente até o número final com efeito de mola.',
    recommendedDuration: 4.5,
    tags: ['números', 'estatística', 'dados', 'vox'],
  },
  {
    id: 'grafico_barras',
    name: 'Gráfico de Barras Animado',
    category: 'Dados & Métricas',
    description: 'Barras verticais que sobem dinamicamente comparando resultados de forma visual e clara.',
    recommendedDuration: 5.5,
    tags: ['gráfico', 'crescimento', 'finanças', 'vendas'],
  },
  {
    id: 'versus_comparison',
    name: 'Versus (Antes vs Depois)',
    category: 'Dados & Métricas',
    description: 'Divisão de tela com raio central comparando o método antigo (fracasso) com o novo (sucesso).',
    recommendedDuration: 5.0,
    tags: ['versus', 'comparativo', 'antes depois'],
  },
  {
    id: 'timeline_progress',
    name: 'Barra de Progresso & Marcos',
    category: 'Dados & Métricas',
    description: 'Linha temporal conectando etapas chave com pontos brilhantes para guias e tutoriais.',
    recommendedDuration: 5.0,
    tags: ['passo a passo', 'timeline', 'progresso'],
  },

  // 4. Mídia & B-Rolls
  {
    id: 'ken_burns_cinematic',
    name: 'Cinema Ken Burns Pan',
    category: 'Mídia & B-Roll',
    description: 'Movimento horizontal lento de câmera sobre imagem em altíssima resolução com gradiente escuro.',
    recommendedDuration: 4.5,
    tags: ['cinematográfico', 'filme', 'broll', 'elegante'],
  },
  {
    id: 'split_collage',
    name: 'Colagem Dupla Multi-Camadas',
    category: 'Mídia & B-Roll',
    description: 'Duas mídias em diagonal ou tela dividida com efeito parallax em velocidades opostas.',
    recommendedDuration: 5.0,
    tags: ['colagem', 'estilo moderno', 'dinâmico'],
  },
  {
    id: 'broll_spotlight',
    name: 'Spotlight com Luz Central',
    category: 'Mídia & B-Roll',
    description: 'Foco de luz circular iluminando a imagem com sombra periférica e texto em profundidade.',
    recommendedDuration: 4.5,
    tags: ['foco', 'spotlight', 'detalhe'],
  },
  {
    id: 'card_frase_impacto',
    name: 'Card Flutuante Glassmorphism',
    category: 'Mídia & B-Roll',
    description: 'Card translúcido com efeito de vidro fosco, bordas neon e texto centralizado de alto impacto.',
    recommendedDuration: 4.0,
    tags: ['card', 'glass', 'moderno'],
  },

  // 5. Conversão & CTA
  {
    id: 'cta_pulse',
    name: 'Botão de Ação Pulsante (CTA)',
    category: 'Conversão & CTA',
    description: 'Botão 3D arredondado com pulso contínuo, seta indicativa e chamada direta para clique/link.',
    recommendedDuration: 4.5,
    tags: ['cta', 'conversão', 'clique', 'final'],
  },
  {
    id: 'ranking_top3',
    name: 'Ranking Top 3 em Pódio',
    category: 'Conversão & CTA',
    description: 'Pódio animado destacando itens numerados (#1, #2, #3) com badges coloridas.',
    recommendedDuration: 6.0,
    tags: ['ranking', 'top 3', 'lista', 'melhores'],
  },
  {
    id: 'lista_passos',
    name: 'Checklist / Lista de Passos',
    category: 'Conversão & CTA',
    description: 'Ícones de verificação verdes (checkmarks) que aparecem um a um conforme o áudio avança.',
    recommendedDuration: 5.5,
    tags: ['checklist', 'passos', 'dicas'],
  },
  {
    id: 'minimal_luxury',
    name: 'Minimal Black & Gold',
    category: 'Conversão & CTA',
    description: 'Estética minimalista preta e dourada com linhas finas e tipografia serifada de prestígio.',
    recommendedDuration: 5.0,
    tags: ['luxo', 'minimalista', 'ouro', 'podcast'],
  },
];
