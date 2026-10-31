/**
 * Biblioteca Curada de Mídia Cinematográfica em Alta Definição
 * Fornece backgrounds fotográficos e cinematográficos que SEMPRE carregam instantaneamente (CDN direto)
 * Organizados por nichos de alta retenção (Finanças, Tecnologia, Produtividade, Mistério, Saúde, Negócios)
 */

export interface CuratedAsset {
  id: string;
  category: string;
  title: string;
  url: string;
  fallbackColor: string;
}

export const CURATED_CINEMATIC_ASSETS: CuratedAsset[] = [
  // Finanças & Cripto & Negócios
  {
    id: 'fin-1',
    category: 'financas',
    title: 'Gráfico Financeiro Neon em Tela Escura',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#0f172a',
  },
  {
    id: 'fin-2',
    category: 'financas',
    title: 'Análise de Ações e Gráficos Candlestick',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#020617',
  },
  {
    id: 'fin-3',
    category: 'financas',
    title: 'Cédulas e Moedas Iluminação Dramática',
    url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#172554',
  },
  {
    id: 'fin-4',
    category: 'financas',
    title: 'Centro Financeiro Noturno e Arranha-céus',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#090d16',
  },

  // Tecnologia & IA & Futuro
  {
    id: 'tech-1',
    category: 'tecnologia',
    title: 'Placa de Circuito e Luzes de Servidor',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#030712',
  },
  {
    id: 'tech-2',
    category: 'tecnologia',
    title: 'Código e Interface Hacker Futurista',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#052e16',
  },
  {
    id: 'tech-3',
    category: 'tecnologia',
    title: 'Inteligência Artificial e Redes Neurais Abstratas',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#1e1b4b',
  },
  {
    id: 'tech-4',
    category: 'tecnologia',
    title: 'Túnel de Dados Cibernético em Alta Velocidade',
    url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#0f172a',
  },

  // Produtividade & Carreira & Foco
  {
    id: 'prod-1',
    category: 'produtividade',
    title: 'Homem Focado Trabalhando em Setup Minimalista Noturno',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#18181b',
  },
  {
    id: 'prod-2',
    category: 'produtividade',
    title: 'Caderno de Metas, Café e Relógio Minimalista',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#27272a',
  },
  {
    id: 'prod-3',
    category: 'produtividade',
    title: 'Reunião Estratégica em Sala de Vidro Executiva',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#0c0a09',
  },

  // Mistério & Psicologia & Documentário Investigativo
  {
    id: 'doc-1',
    category: 'misterio',
    title: 'Silhueta Dramática em Corredor Escuro com Fumaça',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#09090b',
  },
  {
    id: 'doc-2',
    category: 'misterio',
    title: 'Documentos Antigos, Lupa e Investigação',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#1c1917',
  },
  {
    id: 'doc-3',
    category: 'misterio',
    title: 'Câmera e Microfone em Gravação de Notícias',
    url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#18181b',
  },

  // Sucesso, Luxo e Estilo de Vida
  {
    id: 'lux-1',
    category: 'luxo',
    title: 'Relógio Suíço de Alta Precisão',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#111827',
  },
  {
    id: 'lux-2',
    category: 'luxo',
    title: 'Supercarro Esportivo Preto com Iluminação de Estúdio',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#030712',
  },
  {
    id: 'lux-3',
    category: 'luxo',
    title: 'Cobertura Penthouse com Vista para Metrópole Noturna',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1080&q=80',
    fallbackColor: '#0f172a',
  },
];

/**
 * Retorna uma mídia cinematográfica relevante com base no texto e nas palavras-chave da cena
 */
export function getContextualMediaForScene(
  text: string,
  keywords: string = '',
  sceneIndex: number = 0
): string {
  const combined = `${text} ${keywords}`.toLowerCase();

  let category = 'produtividade';
  if (
    combined.includes('dinheiro') ||
    combined.includes('finan') ||
    combined.includes('invest') ||
    combined.includes('rico') ||
    combined.includes('dólar') ||
    combined.includes('lucro') ||
    combined.includes('mercado') ||
    combined.includes('cripto') ||
    combined.includes('bitcoin') ||
    combined.includes('economia')
  ) {
    category = 'financas';
  } else if (
    combined.includes('ia') ||
    combined.includes('inteligência artificial') ||
    combined.includes('tecnolog') ||
    combined.includes('código') ||
    combined.includes('software') ||
    combined.includes('robô') ||
    combined.includes('futuro') ||
    combined.includes('digital') ||
    combined.includes('app')
  ) {
    category = 'tecnologia';
  } else if (
    combined.includes('segredo') ||
    combined.includes('mistério') ||
    combined.includes('mentira') ||
    combined.includes('verdade') ||
    combined.includes('investiga') ||
    combined.includes('revel') ||
    combined.includes('oculto') ||
    combined.includes('crime') ||
    combined.includes('perigo')
  ) {
    category = 'misterio';
  } else if (
    combined.includes('luxo') ||
    combined.includes('sucesso') ||
    combined.includes('carro') ||
    combined.includes('mansão') ||
    combined.includes('milion') ||
    combined.includes('liberdade')
  ) {
    category = 'luxo';
  }

  const matchingAssets = CURATED_CINEMATIC_ASSETS.filter((a) => a.category === category);
  if (matchingAssets.length > 0) {
    const selected = matchingAssets[sceneIndex % matchingAssets.length];
    return selected.url;
  }

  return CURATED_CINEMATIC_ASSETS[sceneIndex % CURATED_CINEMATIC_ASSETS.length].url;
}
