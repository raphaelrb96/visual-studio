import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { synthesizeSceneVoice } from './services/tts';
import { generateAssSubtitles } from './services/whisper';
import { compileHyperframesSequence } from './services/hyperframes';
import { executeFFmpegMux } from './services/ffmpeg';
import { uploadRenderedVideo } from './services/storage';

const app = express();
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 8080;

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'visual-studio-render-worker',
    timestamp: new Date().toISOString(),
    ffmpeg: true,
    scaleToZero: true,
  });
});

app.post('/render', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const manifest = req.body;

  if (!manifest || !manifest.scenes || manifest.scenes.length === 0) {
    return res.status(400).json({ error: 'VideoManifest inválido ou sem cenas.' });
  }

  const jobId = manifest.jobId || `job_${Date.now()}`;
  console.log(`[Worker] Iniciando pipeline de renderização para o Job: ${jobId}`);

  // Create temporary working directory for the job
  const tempDir = path.join(os.tmpdir(), `vs_render_${jobId}`);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // -------------------------------------------------------------
    // ETAPA 1: Síntese de Voz (TTS)
    // -------------------------------------------------------------
    console.log(`[Etapa 1/3] Sintetizando voz das cenas (${manifest.audio?.ttsVoiceId || 'pt-BR-AntonioNeural'})...`);
    const audioResults = [];
    for (const sc of manifest.scenes) {
      const audio = await synthesizeSceneVoice(
        sc.id,
        sc.text,
        manifest.audio?.ttsVoiceId || 'pt-BR-AntonioNeural',
        tempDir
      );
      audioResults.push(audio);
    }

    // -------------------------------------------------------------
    // ETAPA 2: Geração de Legendas Alinhadas (Whisper ASS)
    // -------------------------------------------------------------
    console.log(`[Etapa 2/3] Alinhamento Whisper e composição do arquivo ASS...`);
    const assSubtitlePath = path.join(tempDir, 'subtitles.ass');
    await generateAssSubtitles(
      manifest.scenes.map((s: any) => ({
        id: s.id,
        text: s.text,
        durationSec: s.durationSec,
      })),
      manifest.subtitles?.style || 'kinetic_word',
      assSubtitlePath
    );

    // -------------------------------------------------------------
    // ETAPA 3: Compilação HyperFrames (HTML/CSS -> Frames)
    // -------------------------------------------------------------
    console.log(`[Etapa 3/3] Compilando componentes React/HTML no HyperFrames a 60 FPS...`);
    const framesPattern = await compileHyperframesSequence(
      manifest.scenes,
      manifest.presetId,
      {
        resolution: manifest.resolution || { width: 1080, height: 1920 },
        fps: 60,
        totalDuration: manifest.scenes.reduce((acc: number, sc: any) => acc + sc.durationSec, 0),
      },
      tempDir
    );

    // -------------------------------------------------------------
    // ETAPA 4: Execução FFmpeg (Muxing Áudio + Vídeo + Legendas)
    // -------------------------------------------------------------
    console.log(`[FFmpeg] Renderizando MP4 final com aceleração...`);
    const outputMp4Path = path.join(tempDir, `render_${jobId}.mp4`);
    await executeFFmpegMux({
      framesPattern,
      fps: 60,
      voiceAudioPath: audioResults[0]?.audioPath || '',
      bgMusicVolume: manifest.audio?.bgMusicVolume || 0.12,
      subtitlesAssPath: assSubtitlePath,
      outputPath: outputMp4Path,
    });

    // -------------------------------------------------------------
    // ETAPA 5: Upload no Google Cloud Storage (GCS)
    // -------------------------------------------------------------
    console.log(`[Storage] Fazendo upload do MP4 no bucket GCS...`);
    const gcsUrl = await uploadRenderedVideo(outputMp4Path, `${jobId}.mp4`);

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[Worker] Job ${jobId} finalizado com sucesso em ${elapsedSeconds}s! URL: ${gcsUrl}`);

    // Clean temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      // ignore cleanup errors
    }

    return res.json({
      success: true,
      jobId,
      status: 'completed',
      elapsedSeconds: parseFloat(elapsedSeconds),
      videoUrl: gcsUrl,
    });
  } catch (error: any) {
    console.error(`[Worker] Falha durante renderização do job ${jobId}:`, error);
    return res.status(500).json({
      success: false,
      jobId,
      status: 'failed',
      error: error.message || 'Erro interno no container worker',
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Visual Studio Cloud Run Worker rodando na porta ${PORT}`);
});
