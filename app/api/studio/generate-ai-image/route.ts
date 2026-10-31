import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/studio/generate-ai-image
 * Gera uma imagem IA 100% contextual e exclusiva baseada no prompt visual da cena.
 */
export async function POST(req: NextRequest) {
  try {
    const { scenePrompt, style = 'cinematic dark moody 8k photorealistic', aspectRatio = '9:16' } = await req.json();

    const cleanPrompt = (scenePrompt || 'cinematic abstract technology background').trim();
    const width = aspectRatio === '16:9' ? 1280 : aspectRatio === '1:1' ? 1080 : 1080;
    const height = aspectRatio === '16:9' ? 720 : aspectRatio === '1:1' ? 1080 : 1920;
    const seed = Math.floor(Math.random() * 999999);

    const enrichedPrompt = `${cleanPrompt}, ${style}, dramatic lighting, high contrast, no text, professional cinematography`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      enrichedPrompt
    )}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return NextResponse.json({
      success: true,
      imageUrl,
      seed,
      creditsConsumed: 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
