import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/tts?text=...&lang=pt-BR
 * Gera áudio MP3 de voz neural real em Português e retorna como stream audio/mpeg
 * para que não haja bloqueio de CORS e possa ser gravado/mixado diretamente no vídeo final.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const lang = searchParams.get('lang') || 'pt-BR';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Texto obrigatório' }, { status: 400 });
    }

    // Limita em 200 caracteres por segmento de cena para máxima fluidez
    const cleanText = text.trim().slice(0, 240);
    const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanText
    )}&tl=${encodeURIComponent(lang)}&client=tw-ob`;

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`TTS upstream status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Erro na rota TTS:', error);
    return NextResponse.json({ error: 'Falha ao sintetizar voz' }, { status: 500 });
  }
}
