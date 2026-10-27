# Visual Studio — Cloud Run Rendering Worker

Serviço conteinerizado de renderização determinística e serverless para **Video as Code**.

## Arquitetura do Worker

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GCP CLOUD RUN WORKER (CONTAINER)                     │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
  1. FIRESTORE TRIGGER  ──► O Worker detecta job status = 'queued'
                                     │
  2. AUDIO SYNTHESIS    ──► Sintetiza áudio da cena (Edge TTS / Fish-Speech)
                                     │
  3. WHISPER TIMESTAMP  ──► Extrai aliamento de palavras (Word-level timestamps)
                            e compõe arquivo de legendas .ass
                                     │
  4. HYPERFRAMES COMP   ──► Compila os componentes HTML/Tailwind em frames
                                     │
  5. FFMPEG EXECUTION   ──► Executa o FFmpeg para mesclar áudio + vídeo + legendas
                                     │
  6. GCS UPLOAD         ──► Faz o upload do MP4 e atualiza job status = 'completed'
```

## Como Fazer o Deploy no Google Cloud Run (Scale to Zero)

1. **Configurar o Projeto GCP**:
   ```bash
   gcloud config set project SEU_PROJETO_ID
   ```

2. **Fazer o Build da Imagem no Artifact Registry ou Cloud Build**:
   ```bash
   gcloud builds submit --tag gcr.io/SEU_PROJETO_ID/visual-studio-worker:latest .
   ```

3. **Fazer o Deploy no Cloud Run**:
   ```bash
   gcloud run deploy visual-studio-render-worker \
     --image gcr.io/SEU_PROJETO_ID/visual-studio-worker:latest \
     --platform managed \
     --region southamerica-east1 \
     --allow-unauthenticated \
     --memory 4Gi \
     --cpu 2 \
     --timeout 900 \
     --min-instances 0 \
     --max-instances 10 \
     --set-env-vars GCS_BUCKET_NAME=visual-studio-renders
   ```

> `--min-instances 0` garante custo **ZERO** quando nenhum vídeo estiver sendo renderizado (Scale to Zero real).
