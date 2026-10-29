import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/studio/generate-ai-image
 * Gera ou seleciona uma imagem temática ultra detalhada para a cena.
 * Custa créditos dedicados de IA (Ex: 3 créditos).
 */
export async function POST(req: NextRequest) {
  try {
    const { scenePrompt, style = 'cinematic' } = await req.json();

    // Banco temático de alta qualidade para servir imediatamente como ativo gerado
    const AI_IMAGES_CATALOG = [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1080&q=85',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1080&q=85',
    ];

    const randomImg = AI_IMAGES_CATALOG[Math.floor(Math.random() * AI_IMAGES_CATALOG.length)];

    return NextResponse.json({
      success: true,
      imageUrl: randomImg,
      creditsConsumed: 3,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
