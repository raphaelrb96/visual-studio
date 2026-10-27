# 🎬 Visual Studio — Video as Code Micro-SaaS

> Micro-SaaS headless e modular de **Video as Code** (Motion Graphics programático) para criação de vídeos verticais ($9:16$) e horizontais ($16:9$) com React, HyperFrames, Tailwind CSS, Firebase e GCP Cloud Run.

---

## ⚡ Diferenciais do Sistema

1. **Custo Próximo de Zero (Scale to Zero)**: Infraestrutura serverless conteinerizada no Cloud Run desce para 0 instâncias quando ociosa.
2. **Preview Instantâneo a 60 FPS**: Renderização client-side em tempo real no Canvas React com CSS/Tailwind antes da exportação final.
3. **Script Engine com Gemini**: Geração automática de roteiros já pareados com componentes visuais matematicamente estruturados.
4. **Exportação Determinística MP4**: FFmpeg nativo combinando frames rasterizados no HyperFrames, áudio sintetizado e legendas cinéticas (.ass).

---

## 🛠️ Stack Tecnológica

- **Front-end / UI**: Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS, Lucide React, Zustand.
- **Back-end / Serverless**: Firebase Auth, Firebase Firestore (Database & Realtime Queue), GCP Cloud Run.
- **Storage**: Google Cloud Storage (GCS) / Firebase Storage (`/raw_assets`, `/renders`).
- **Motores de Mídia & IA**:
  - **Video as Code**: HyperFrames (Renderizador HTML/CSS/GSAP para MP4).
  - **Transcrição & Legendas**: OpenAI Whisper (alinhamento palavra a palavra).
  - **Voz Sintética (TTS)**: Edge TTS / Neural Voices.
  - **LLM Orchestrator**: Google Gemini (`@google/generative-ai`).

---

## 🗺️ Sitemap de Rotas

```
/app
├── (auth)/
│   ├── login/page.tsx                # Tela de Login (Email/Senha + Google Auth)
│   └── register/page.tsx             # Tela de Cadastro de Usuários
│
├── (dashboard)/
│   ├── layout.tsx                    # Shell Principal (Sidebar & Header Global)
│   ├── page.tsx                      # Dashboard Principal (Métricas & Recentes)
│   ├── videos/page.tsx               # Biblioteca & Histórico de Vídeos
│   │
│   ├── create/
│   │   ├── page.tsx                  # Passo 1: Seleção do Tipo Global de Vídeo
│   │   │
│   │   └── motion-narrated/          # Fluxo 1: Motion Narrado (MVP Core)
│   │       ├── step-1-style/page.tsx # Passo 2: Vitrine de Templates & Presets
│   │       ├── step-2-script/page.tsx# Passo 3: Script Engine (IA / Text Input)
│   │       ├── step-3-editor/page.tsx# Passo 4: Editor Canvas Player & Timeline
│   │       └── step-4-render/page.tsx# Passo 5: Fila de Renderização & Exportação
│   │
│   ├── presets/page.tsx              # Gerenciador de Identidade Visual & Fonts
│   └── settings/page.tsx             # Configurações de Conta e Chaves de API
```

---

## 🎨 Componentes de Motion Graphics (`components/motion/`)

- `MotionPlayer.tsx`: Viewport de reprodução a 60 FPS com timeline scrubber, proporções dinâmicas e legendas cinéticas.
- `CardFrase.tsx`: Tipografia cinética de impacto com realce de palavras-chave e efeitos de vidro/neon.
- `GraficoPizza.tsx`: Gráfico donut SVG animado com fatias coloridas e percentuais.
- `StatCounter.tsx`: Contador numérico animado com escala dinâmica e barra de progresso.
- `GraficoBarras.tsx`: Barras de crescimento comparativas com métricas formatadas.
- `MediaBroll.tsx`: Transições visuais de fundo com efeito Ken Burns e overlays gradientes.
- `CTAButton.tsx`: Botão de chamada para ação pulsante com brilho dinâmico.

---

## 🚀 Como Executar Localmente

### 1. Iniciar o Next.js Studio

```bash
cd visual-studio
npm run dev
```

Acesse: `http://localhost:3000`

### 2. Iniciar o Worker de Renderização (Opcional Localmente)

```bash
cd visual-studio/worker
npm install
npm run dev
```
O serviço estará pronto em `http://localhost:8080`.
