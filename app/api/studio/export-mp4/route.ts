import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { EdgeTTS } from 'node-edge-tts';

const execFileAsync = promisify(execFile);

/**
 * POST /api/studio/export-mp4
 * Recebe o stream de vídeo gravado pelo navegador (WebM/MP4) + texto da narração ou áudio,
 * executa o FFmpeg nativo instalado na máquina com libx264 + yuv420p + aac + faststart,
 * e devolve um arquivo .mp4 100% compatível com Windows Media Player, WhatsApp, Instagram e TikTok.
 */
export async function POST(req: NextRequest) {
  const tempFiles: string[] = [];

  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File | null;
    const narrationText = String(formData.get('narrationText') || '').trim();
    const voiceId = String(formData.get('voiceId') || 'antonio').trim();

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Arquivo de vídeo não enviado para conversão.' },
        { status: 400 }
      );
    }

    const tmpDir = os.tmpdir();
    const jobId = `vs_export_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const inputVideoPath = path.join(tmpDir, `${jobId}_input.webm`);
    const ttsAudioPath = path.join(tmpDir, `${jobId}_narration.mp3`);
    const outputMp4Path = path.join(tmpDir, `${jobId}_output.mp4`);

    tempFiles.push(inputVideoPath, ttsAudioPath, outputMp4Path);

    // 1. Salva o stream gravado em disco
    const videoArrayBuffer = await videoFile.arrayBuffer();
    fs.writeFileSync(inputVideoPath, Buffer.from(videoArrayBuffer));

    // 2. Gera o áudio neural limpo da narração para muxing de alta qualidade se houver texto
    let hasCleanTts = false;
    if (narrationText.length > 2) {
      try {
        const voiceMap: Record<string, string> = {
          antonio: 'pt-BR-AntonioNeural',
          francisca: 'pt-BR-FranciscaNeural',
          nicolau: 'pt-BR-NicolauNeural',
          thalita: 'pt-BR-ThalitaNeural',
        };
        const selectedVoice = voiceMap[voiceId.toLowerCase()] || 'pt-BR-AntonioNeural';
        const tts = new EdgeTTS({ voice: selectedVoice });
        await tts.ttsPromise(narrationText.slice(0, 1200), ttsAudioPath);
        if (fs.existsSync(ttsAudioPath) && fs.statSync(ttsAudioPath).size > 200) {
          hasCleanTts = true;
        }
      } catch (ttsErr) {
        console.warn('Aviso ao sintetizar TTS dedicado para o MP4:', ttsErr);
      }
    }

    // 3. Executa FFmpeg para gerar MP4 H.264 (yuv420p) + AAC universal
    const ffmpegArgs: string[] = ['-y', '-i', inputVideoPath];

    if (hasCleanTts) {
      ffmpegArgs.push(
        '-i',
        ttsAudioPath,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '20',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-shortest',
        '-movflags',
        '+faststart',
        outputMp4Path
      );
    } else {
      ffmpegArgs.push(
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '20',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-movflags',
        '+faststart',
        outputMp4Path
      );
    }

    await execFileAsync('ffmpeg', ffmpegArgs, { timeout: 120000 });

    if (!fs.existsSync(outputMp4Path)) {
      throw new Error('FFmpeg não produziu o arquivo MP4 de saída.');
    }

    const mp4Buffer = fs.readFileSync(outputMp4Path);

    return new NextResponse(mp4Buffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="video_final.mp4"`,
        'Content-Length': String(mp4Buffer.byteLength),
      },
    });
  } catch (error: any) {
    console.error('Erro na transcodificação FFmpeg /api/studio/export-mp4:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao codificar arquivo MP4 H.264.' },
      { status: 500 }
    );
  } finally {
    for (const file of tempFiles) {
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (e) {}
    }
  }
}
