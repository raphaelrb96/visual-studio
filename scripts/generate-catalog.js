const fs = require('fs');
const path = require('path');

// 1. Read library.json
const libFile = path.resolve('cloned_motions_repo', 'gallery', 'api', 'library.json');
const libData = JSON.parse(fs.readFileSync(libFile, 'utf8'));

// 2. Read translations.js for English descriptions and Chinese titles
const transFile = path.resolve('cloned_motions_repo', 'gallery', 'translations.js');
const transContent = fs.readFileSync(transFile, 'utf8');

function extractMap(blockName, endName) {
  const start = transContent.indexOf(blockName + ': {');
  if (start === -1) return {};
  const end = transContent.indexOf(endName + ': {', start);
  const block = end !== -1 ? transContent.substring(start, end) : transContent.substring(start);
  const regex = /'([a-z0-9-]+)'\s*:\s*'([^']+)'/g;
  const map = {};
  let m;
  while ((m = regex.exec(block)) !== null) {
    map[m[1]] = m[2];
  }
  return map;
}

const cardsZh = extractMap('cardsZh', 'cardsEn');
const cardsEn = extractMap('cardsEn', 'stylesZh');

// Category mapping to Portuguese & slugs
const categoryMap = {
  opening: { name: 'Abertura & Marca', badge: 'ALTA RETENÇÃO' },
  typography: { name: 'Tipografia Cinética', badge: 'CINEMÁTICO' },
  'ui-entrance': { name: 'Interface & SaaS', badge: '3D / MOTION' },
  camera: { name: 'Câmera & Espaço', badge: '3D CINEMÁTICO' },
  effects: { name: 'Efeitos Visuais & Luz', badge: 'ALTA ENERGIA' },
  interaction: { name: 'Demonstração Interativa', badge: 'INTERAÇÃO' },
  transition: { name: 'Transições Dinâmicas', badge: 'TRANSIÇÃO' },
  data: { name: 'Dados & Métricas', badge: 'DASHBOARD' },
  rhythm: { name: 'Ritmo & Montagem', badge: 'RITMO RÁPIDO' },
  outro: { name: 'Fechamento & CTA', badge: 'ENCERRAMENTO' },
};

function formatTitle(id, cat) {
  // Convert kebab-case to Title Case Portuguese Friendly
  const words = id.split('-');
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Build items
const templates = [];

libData.cards.forEach(card => {
  const id = card.name;
  const cat = card.category || 'effects';
  const catInfo = categoryMap[cat] || { name: 'Geral', badge: 'ALTA RETENÇÃO' };
  
  // Format clean name
  let name = formatTitle(id, cat);
  if (id === 'assemble-then-type-flyin') {
    name = 'Montar & Digitar Voando (3D)';
  } else if (id === 'spotlight-hero-card') {
    name = 'Holofote Teatral & Card Hero';
  } else if (id === 'card-stack') {
    name = 'Leque de Cards Dinâmico';
  } else if (id === 'flying-words') {
    name = 'Túnel 3D de Palavras';
  }

  // English/Portuguese clean summary
  const summaryEn = cardsEn[id] || card.intention || card.summary || '';
  const cleanSummary = summaryEn.replace(/video-shotcraft/gi, 'Motion Studio').trim();

  // Extract duration number
  let recommendedDuration = 5.0;
  let duration = '~5.0s';
  if (card.duration) {
    const match = card.duration.match(/([0-9.]+)s/);
    if (match) {
      recommendedDuration = parseFloat(match[1]) || 5.0;
      duration = `~${match[1]}s`;
    }
  }

  // Preview path
  const previewGif = `/templates/previews/${id}.gif`;

  templates.push({
    id,
    name,
    category: cat,
    categoryName: catInfo.name,
    badge: catInfo.badge,
    duration,
    recommendedDuration,
    defaultHighlightColor: '#e4c58a',
    previewIcon: '✨',
    description: cleanSummary || card.summary || 'Animação procedural de alto impacto visual.',
    previewGif,
    hasMotionEngine: id === 'assemble-then-type-flyin',
  });
});

// Output TS file
const tsContent = `// Catálogo Completo de Templates de Vídeo Procedurais & Alta Retenção
// Sincronizado automaticamente com o acervo completo de motions.

export interface MotionTemplate {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  badge: string;
  duration: string;
  recommendedDuration: number;
  defaultHighlightColor: string;
  previewIcon: string;
  description: string;
  previewGif?: string;
  hasMotionEngine?: boolean;
}

export type MotionTemplateId = string;

export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'Todos os Templates' },
  { id: 'opening', label: 'Aberturas & Marca' },
  { id: 'typography', label: 'Tipografia Cinética' },
  { id: 'ui-entrance', label: 'Interface & SaaS' },
  { id: 'camera', label: 'Câmera & Espaço 3D' },
  { id: 'effects', label: 'Efeitos Visuais & Luz' },
  { id: 'interaction', label: 'Demonstrações Interativas' },
  { id: 'transition', label: 'Transições Dinâmicas' },
  { id: 'data', label: 'Dados & Dashboards' },
  { id: 'rhythm', label: 'Ritmo & Montagem' },
  { id: 'outro', label: 'Fechamentos & CTA' },
] as const;

export type TemplateCategoryId = typeof TEMPLATE_CATEGORIES[number]['id'];

export const MOTION_TEMPLATES: MotionTemplate[] = ${JSON.stringify(templates, null, 2)};

export function getTemplateById(id: string): MotionTemplate | undefined {
  return MOTION_TEMPLATES.find(t => t.id === id);
}
`;

fs.writeFileSync(path.resolve('lib', 'motion-templates.ts'), tsContent, 'utf8');
console.log(`Generated lib/motion-templates.ts with ${templates.length} templates across 10 categories!`);
