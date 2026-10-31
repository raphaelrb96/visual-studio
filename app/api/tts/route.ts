import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * GET /api/tts?text=...&voice=...
 * Gera áudio MP3 de voz neural humana real em Português (Azure Speech / Edge TTS)
 * Zero som robótico do Google Tradutor!
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const voiceParam = searchParams.get('voice') || 'antonio';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Texto obrigatório' }, { status: 400 });
    }

    // Vozes neurais brasileiras ultra realistas
    const voiceMap: Record<string, string> = {
      antonio: 'pt-BR-AntonioNeural',
      francisca: 'pt-BR-FranciscaNeural',
      nicolau: 'pt-BR-NicolauNeural',
      thalita: 'pt-BR-ThalitaNeural',
    };

    const selectedVoice = voiceMap[voiceParam.toLowerCase()] || 'pt-BR-AntonioNeural';

    const tempFileName = `tts_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.mp3`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    const tts = new EdgeTTS({ voice: selectedVoice });
    await tts.ttsPromise(text.trim().slice(0, 500), tempFilePath);

    if (!fs.existsSync(tempFilePath)) {
      throw new Error('Falha ao gerar arquivo de áudio neural');
    }

    const audioBuffer = fs.readFileSync(tempFilePath);

    // Limpa o arquivo temporário
    fs.unlink(tempFilePath, () => {});

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Erro na rota TTS Neural:', error);
    return NextResponse.json(
      { error: 'Falha ao sintetizar voz neural humana' },
      { status: 500 }
    );
  }
}
