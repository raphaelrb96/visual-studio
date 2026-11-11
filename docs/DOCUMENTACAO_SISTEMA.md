# Documentação Técnica e Arquitetura do Sistema: Visual Studio SaaS

> **Versão:** 1.0.0 (Release 2026)  
> **Stack Base:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Zustand, Firebase (Auth & Firestore), GSAP 3, Google Gemini 2.5 Flash, Edge TTS e Puppeteer/Canvas Exporter.

---

## 1. Visão Geral da Plataforma

O **Visual Studio SaaS** é uma plataforma automatizada de criação, roteirização, animação e renderização de vídeos curtos de alta retenção (formato TikTok, Reels, YouTube Shorts, além de 16:9 e 1:1). 

A plataforma adota o conceito de **Video-as-Code** acoplado a **Generative Motion Graphics**:
1. O usuário fornece o tema ou ideia de vídeo.
2. O motor de inteligência artificial (Google Gemini 2.5 Flash) concebe um roteiro estruturado com locução contínua.
3. Para cada cena, a IA seleciona o template mais adequado da biblioteca interna de Motion Graphics (ao invés de engessar o vídeo todo em um único layout).
4. O motor compila animações vetoriais interativas (HTML5, SVG e timelines GSAP 3) sincronizadas com síntese de voz neural (Edge TTS).
5. O editor (NLE) permite manipular visualmente legendas, elementos gráficos, tempos de cena e exportar o arquivo MP4 final.

---

## 2. Mapa de Telas (Frontend / UI)

```
app/
├── (auth)/
│   ├── login/page.tsx               # Login e autenticação
│   ├── register/page.tsx            # Cadastro de usuários
│   └── signout/page.tsx             # Encerramento de sessão
├── (dashboard)/
│   ├── dashboard/page.tsx           # Visão geral de estatísticas e atalhos rápidos
│   ├── videos/page.tsx              # Meus Vídeos & Projetos (listagem, filtros e ações em lote)
│   ├── create/page.tsx              # Assistente de Criação em 3 Etapas & Estúdio NLE Integrado
│   ├── templates/page.tsx           # Catálogo oficial de templates de cena
│   │   └── [id]/page.tsx            # Detalhes de anatomia e preview do template
│   ├── presets/page.tsx             # Temas de Cores e Identidade Visual (Presets)
│   └── settings/page.tsx            # Configurações de conta e preferências
├── about/page.tsx                   # Página institucional sobre o sistema
├── contact/page.tsx                 # Canal de suporte/contato
├── privacy/page.tsx                 # Termos de privacidade
└── terms/page.tsx                   # Termos de serviço
```

---

## 3. Especificação Detalhada das Telas

### 3.1. Autenticação & Acesso

#### `/login`
- **Função:** Autenticação de usuários cadastrados via e-mail/senha ou Google OAuth.
- **Componentes & Recursos:**
  - Formulário com validação de credenciais.
  - Integração com `useAuth()` e Firebase Authentication.
  - Redirecionamento automático pós-login para `/videos` ou `/create`.
  - Tratamento de mensagens de erro amigáveis em português (ex: senha incorreta, usuário inexistente).

#### `/register`
- **Função:** Cadastro de novos usuários na plataforma.
- **Componentes & Recursos:**
  - Criação de credencial no Firebase Auth.
  - Inicialização do documento do usuário no Firestore (`users/{uid}`), atribuindo plano gratuito inicial, limite de projetos e créditos.

#### `/signout`
- **Função:** Limpeza de tokens de sessão, estado de autenticação e redirecionamento para a página inicial.

---

### 3.2. Painel & Gestão de Projetos

#### `/dashboard`
- **Função:** Visão executiva com métricas de produção.
- **Componentes & Recursos:**
  - Contador de vídeos produzidos, rascunhos salvos e taxa média de retenção estimada.
  - Atalho de 1 clique para "Criar Novo Vídeo".
  - Cards com os últimos 3 projetos editados para retomada imediata.

#### `/videos` (Meus Vídeos & Projetos)
- **Função:** Gerenciador central de todos os projetos de vídeo do usuário.
- **Componentes & Recursos:**
  - **Ordenação Automática:** Sempre prioriza os projetos **mais recentemente atualizados no topo** (`updatedAt` decrescente, com fallback para `createdAt`).
  - **Carimbo Completo de Data e Hora:**
    - `🕒 Atualizado: DD/MM/AAAA às HH:mm`
    - `📅 Criado em: DD/MM/AAAA às HH:mm`
  - **Barra de Filtros:** Filtragem rápida por status (`Todos`, `Vídeo Pronto`, `Processando`, `Rascunho`).
  - **Busca Textual:** Campo de pesquisa instantânea por título do projeto.
  - **Ações em Lote (Bulk Actions):**
    - Seleção múltipla com caixas de marcação (checkboxes).
    - Botão "Excluir Selecionados" em lote com modal de confirmação.
  - **Ações Rápidas por Card:**
    - Botão "Abrir": Retoma o projeto instantaneamente no estúdio `/create?id={id}`.
    - Botão "Download MP4": Download direto do vídeo gerado (quando disponível).
    - Botão "Excluir individual": Exclusão definitiva do projeto.

---

### 3.3. Motor de Criação & Estúdio (`/create`)

A tela `/create` opera em dois modos:
1. **Modo Assistente (Onboarding em 3 Etapas):** Concepção estruturada do vídeo com IA.
2. **Modo Estúdio NLE (Editor Visual Completo):** Manipulação fina de timeline, cenas e exportação.

#### Modo Assistente: As 3 Etapas de Criação (100% Primeira Dobra)

1. **Etapa 1: Nome do Projeto & Formato:**
   - **Título do Projeto:** Nome identificador do arquivo.
   - **Formato da Tela:**
     - `9:16 Vertical` (Reels, TikTok & Shorts - Otimizado para retenção mobile).
     - `16:9 Horizontal` (YouTube & Widescreen).
     - `1:1 Quadrado` (Feed Instagram e LinkedIn).
   - *Design Compacto:* Todos os cards e botões ficam visíveis na primeira dobra, sem rolagem vertical.

2. **Etapa 2: Conteúdo, Tom, Duração & Voz Neural:**
   - **Assunto/Roteiro:** Textarea livre para digitar a ideia + botões rápidos de 1 clique com sugestões de temas virais comprovados.
   - **⏱️ Duração em Segundos:**
     - `15s` (Shorts Ultra Rápido ~ 3 cenas).
     - `30s` (Padrão Viral ~ 5 cenas).
     - `45s` (História Dinâmica ~ 7 cenas).
     - `60s` (Narrativa Completa ~ 9 cenas).
   - **🎭 Tom do Roteiro:**
     - *Didático & Educativo* (Estilo Vox / Kurzgesagt).
     - *Storytelling & Suspense* (Estilo MagnatesMedia).
     - *Direto ao Ponto / Tapa na Cara* (Estilo Alex Hormozi).
     - *Conversão & Vendas* (Estrutura AIDA).
     - *Urgente / Noticioso* (Breaking News).
   - **🎨 Tema & Estilo Visual (Preset):** Paleta de cores (Kinetic Yellow, Cyberpunk Neon, Minimal Dark, etc.) ou criação de tema personalizado.
   - **🎙️ Voz Neural Humana:** Modelos de voz Azure/Edge TTS (`Antonio`, `Francisca`, `Nicolau`, `Thalita`).
   - **Geração Inteligente:** Botão com chamada direta ao Gemini 2.5 Flash. Fim do loading falso: o progresso reflete as fases reais da requisição.

3. **Etapa 3: Roteiro, Cenas & Direção Motion:**
   - **Narração Contínua Unificada:** Roteiro corrido e fluido com reprodutor de áudio integrado para ouvir a voz neural gerada antes de compilar.
   - **Distribuição Dinâmica de Templates:** A IA atribui um template específico para cada cena de acordo com a cadência (abertura impactante, dados, comparativos, CTA).
   - **Personalização de Cada Cena:**
     - Seletor rápido para trocar o template atribuído pela IA para qualquer outro da biblioteca oficial.
     - Campo de texto da fala editável.
     - Campo de prompt visual complementar para guiar os elementos gráficos.
   - **Botão Final "Gerar Vídeo & Abrir Estúdio":** Compilação paralela em blocos de 3 cenas (evita timeouts e sobrecarga de contexto).

#### Modo Estúdio NLE (Editor Completo Pós-Geração)

- **Top Bar:** Nome do projeto editável, status de salvamento no Firestore, botão de salvar rascunho e botão de exportar MP4.
- **Área Central (Player Cinemático HyperFrames):**
  - Preview interativo em tempo real via HTML5 Canvas + GSAP 3.
  - Reprodução contínua com sincronismo preciso entre áudio neural e legendas palavra por palavra (`Word-by-word`).
  - Barra de transporte (Play, Pause, Restart, Timecode atual e total).
- **Painel Lateral Direito (Inspetor de Cena):**
  - Configuração do template da cena selecionada.
  - Edição de títulos (`headline`), subtítulos e badges.
  - Edição de métricas numéricas, porcentagens e dados de gráficos de barras ou comparativo versus.
  - Botão de recompilar cena isolada com IA.
- **Painel Inferior (CapCut Timeline Multipista Redimensionável):**
  - Timeline com splitter vertical que pode ser arrastado para cima ou para baixo.
  - **Pista 1 (Cenas & Motion):** Blocos de cena proporcionais ao tempo com transições.
  - **Pista 2 (Locução Neural):** Faixa de áudio contínua.
  - **Pista 3 (Legendas Dinâmicas):** Bloco sincronizado de legendas cinéticas.
  - Playhead deslizante para navegação frame a frame.

---

### 3.4. Catálogo de Templates (`/templates` e `/templates/[id]`)

- **`/templates`:**
  - Vitrine completa com os 124 templates oficiais categorizados (Tipografia Cinética, SaaS & UI, Dados & Dashboards, Transições, Câmera 3D, Fechamentos & CTA).
  - Filtro por categoria e busca por nome.
  - Cada card exibe preview animado em GIF correspondente ao movimento real do template, badges de energia e tempo estimado.
- **`/templates/[id]`:**
  - Página de detalhes da anatomia do template.
  - Exibe prévia ampliada, parâmetros aceitos (cores, imagens, títulos, dados), descrição da mecânica física e botão "Usar este Template" que direciona para a criação.

---

### 3.5. Identidade Visual & Presets (`/presets`)

- **Função:** Gerenciamento dos estilos visuais globais da marca.
- **Componentes:**
  - Lista de estilos padrão do sistema (cores de fundo, texto primário, cor de realce neon, fontes).
  - Editor de temas customizados (salvos em `localStorage` e vinculados aos projetos no Firestore).

---

## 4. Backend, APIs e Pipeline de Processamento

Todas as rotas de backend são implementadas como **Route Handlers** no Next.js (`app/api/.../route.ts`).

### 4.1. Mapa de Rotas de API

```
app/api/
├── auth/
│   ├── token/route.ts                 # Validação de sessão e claims JWT
│   └── logout/route.ts                # Revogação de cookies de autenticação
├── tts/route.ts                       # Síntese neural de voz (Edge TTS)
├── media/
│   └── search/route.ts                # Busca de imagens contextuais Unsplash / Pexels
├── script/
│   └── generate/route.ts              # Geração legada de roteiros em formato estruturado
└── studio/
    ├── generate-complete/route.ts     # Roteirização + Seleção Inteligente de Templates (Gemini 2.5 Flash)
    ├── compile-scene/route.ts         # Compilador Code-to-Video de cena individual (HTML5/SVG + GSAP)
    ├── generate-blueprint/route.ts    # Motor de direção de arte e roteirização avançada
    ├── refine-script/route.ts         # Refinamento de texto e copywriting
    └── export-mp4/route.ts            # Renderização de vídeo em servidor via Puppeteer / FFmpeg
```

---

### 4.2. Especificação dos Endpoints Principais

#### 1. `POST /api/studio/generate-complete`
- **Responsabilidade:** Motor primário de Inteligência Artificial. Recebe a ideia do usuário e entrega o roteiro completo + narração unificada + cenas associadas aos templates ideais.
- **Payload de Entrada:**
  ```json
  {
    "prompt": "3 Erros Financeiros Graves antes dos 30 anos",
    "aspectRatio": "9:16",
    "presetId": "kinetic_yellow",
    "targetDurationSec": 30,
    "scriptTone": "hormozi",
    "voiceId": "antonio"
  }
  ```
- **Fluxo Interno:**
  1. Valida e ajusta a duração alvo (ex: 30s ~ 5 cenas).
  2. Mapeia o tom selecionado em instruções de copywriting profissional (ex: direto ao ponto, didático, etc.).
  3. Alimenta o modelo **`gemini-2.5-flash`** com a amostragem oficial dos templates de Motion Graphics disponíveis no catálogo.
  4. A IA gera a narração contínua e define o `templateId` ideal para cada momento da narrativa.
  5. As cenas são enriquecidas com mídias de B-Roll contextuais e timestamps das palavras.
  6. Para cada cena, gera preventivamente o código HTML5 e script GSAP correspondente.
- **Resposta:**
  ```json
  {
    "success": true,
    "title": "3 Erros Financeiros Críticos",
    "aspectRatio": "9:16",
    "presetId": "kinetic_yellow",
    "voiceId": "antonio",
    "fullNarration": "Se você tem menos de trinta anos e ainda...",
    "fullAudioUrl": "/api/tts?text=...",
    "scenes": [
      {
        "sceneIndex": 0,
        "templateId": "spotlight-hero-card",
        "durationSec": 5.2,
        "text": "Se você tem menos de trinta anos e ainda guarda dinheiro na poupança...",
        "tag": "ALERTA MÁXIMO",
        "headline": "PARE DE PERDER DINHEIRO",
        "subText": "Erros críticos que destroem seu futuro",
        "highlightWord": "DINHEIRO",
        "visualPrompt": "Holofote dramático iluminando o card central...",
        "compiledCustomHtml": "...",
        "compiledGsapScript": "..."
      }
    ]
  }
  ```

---

#### 2. `POST /api/studio/compile-scene`
- **Responsabilidade:** Compilar ou recompilar em tempo real o código de execução (HTML5 + SVG vetorial + Timeline GSAP 3) de uma cena específica.
- **Payload de Entrada:**
  ```json
  {
    "scene": { ... },
    "sceneIndex": 0,
    "aspectRatio": "9:16",
    "highlightColor": "#facc15",
    "primaryTextColor": "#ffffff",
    "backgroundColor": "#050505",
    "templateId": "chart-live-moves",
    "forceAiCustom": false
  }
  ```
- **Fluxo Interno:**
  - Invoca o `buildProceduralMotionScene()` em `lib/scene-motion-generator.ts`.
  - Constrói a estrutura DOM da cena com elementos SVG, molduras 3D de B-Roll, tipografia cinética e orquestração de easing GSAP (`back.out`, `elastic.out`).
  - Se `forceAiCustom: true`, aciona o Gemini 2.5 Flash para escrever código HTML/GSAP personalizado conforme o prompt visual do usuário.

---

#### 3. `GET /api/tts`
- **Responsabilidade:** Síntese de áudio neural humana com streaming.
- **Query Params:**
  - `text`: Texto a ser falado (em formato pt-BR).
  - `voice`: Identificador da voz (`antonio`, `francisca`, `nicolau`, `thalita`).
- **Tecnologia:** `edge-tts-universal` conectada às vozes neurais brasileiras da Microsoft:
  - `pt-BR-AntonioNeural`
  - `pt-BR-FranciscaNeural`
  - `pt-BR-NicolauNeural`
  - `pt-BR-ThalitaNeural`
- **Retorno:** Stream de áudio binário `audio/mpeg` com cabeçalhos de cache otimizados.

---

#### 4. `POST /api/studio/export-mp4`
- **Responsabilidade:** Converte o manifesto do vídeo compilado em um arquivo de vídeo físico MP4 compatível com todos os players (Windows Media Player, QuickTime, Instagram, TikTok).
- **Estratégia de Renderização:**
  - Instancia o documento HTML mestre compilado por `buildMasterVideoHtml()`.
  - Captura os frames em resolução nativa (1080x1920 para 9:16) a 30 FPS estáveis.
  - Multiplexa os frames visuais com a faixa de áudio neural unificada via FFmpeg usando o codec `libx264` com `yuv420p` e áudio `aac`.
  - Retorna a URL de download ou o arquivo binário do vídeo final.

---

## 5. Estrutura do Banco de Dados (Cloud Firestore)

### Coleção `projects`
Armazena todos os projetos de vídeo criados pelos usuários:

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `string` | ID único do projeto (ex: `project_1731000000000`) |
| `userId` | `string` | UID do usuário proprietário (Firebase Auth) |
| `title` | `string` | Título do projeto / vídeo |
| `prompt` | `string` | Assunto ou roteiro original fornecido |
| `aspectRatio` | `'9:16' \| '16:9' \| '1:1'` | Proporção da tela |
| `presetId` | `string` | Tema de cores aplicado |
| `voiceId` | `string` | ID da voz neural selecionada |
| `fullNarration` | `string` | Texto completo e contínuo da locução |
| `fullAudioUrl` | `string` | URL do arquivo de áudio unificado |
| `status` | `'draft' \| 'processing' \| 'ready'` | Estado do projeto |
| `videoUrl` | `string` (opcional) | URL do MP4 final renderizado |
| `scenes` | `Array<ScriptScene>` | Array estruturado de cenas do vídeo |
| `createdAt` | `string` (ISO 8601) | Data e hora exatas de criação |
| `updatedAt` | `string` (ISO 8601) | Data e hora da última modificação |

### Coleção `users`
Controle de conta e saldo de créditos:

| Campo | Tipo | Descrição |
|---|---|---|
| `uid` | `string` | UID do Firebase Authentication |
| `email` | `string` | E-mail do usuário |
| `displayName` | `string` | Nome de exibição |
| `credits` | `number` | Quantidade de créditos disponíveis |
| `plan` | `'free' \| 'pro' \| 'unlimited'` | Plano de assinatura atual |
| `createdAt` | `string` (ISO 8601) | Data de cadastro |

---

## 6. Fluxo de Execução Ponta a Ponta (End-to-End Pipeline)

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant UI as Frontend (/create)
    participant API as /api/studio/generate-complete
    participant LLM as Google Gemini 2.5 Flash
    participant TTS as /api/tts (Edge TTS)
    participant Engine as Motion Compiler (HTML5 + GSAP)
    participant DB as Cloud Firestore

    User->>UI: 1. Informa Formato, Tema, Duração e Tom
    UI->>API: 2. POST com payload de geração
    API->>LLM: 3. Solicita roteiro contínuo + templates por cena
    LLM-->>API: 4. Retorna JSON estruturado (cenas + templateIds)
    API->>TTS: 5. Gera áudio neural contínuo
    API->>Engine: 6. Compila HTML5/SVG + timelines GSAP de cada cena
    API-->>UI: 7. Entrega manifesto estruturado (Etapa 3 de revisão)
    User->>UI: 8. Revisa roteiro e clica em "Gerar Vídeo & Abrir Estúdio"
    UI->>DB: 9. Salva projeto com createdAt e updatedAt
    UI->>UI: 10. Carrega Estúdio NLE com player HyperFrames interativo
```

---

## 7. Variáveis de Ambiente Necessárias (`.env.local`)

```env
# Google Gemini Generative AI (Modelo gemini-2.5-flash)
GEMINI_API_KEY=sua_chave_gemini_aqui

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id

# Firebase Admin SDK (para operações privilegiadas em servidor)
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@seu_projeto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
