'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MOTION_TEMPLATES } from '@/lib/motion-templates';
import { buildMontarEDigitarVoandoHtml } from '@/lib/design-systems/templates/montar-e-digitar-voando';
import { buildFlyingWordsHtml } from '@/lib/design-systems/templates/flying-words';
import { buildCardStackHtml } from '@/lib/design-systems/templates/card-stack';
import { buildSpotlightHeroHtml } from '@/lib/design-systems/templates/spotlight-hero-card';
import { Play, Pause, RotateCcw, ArrowLeft, Sparkles, Layers, CheckCircle2, Video } from 'lucide-react';
import Link from 'next/link';

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = String(params?.id || 'assemble-then-type-flyin');
  const templateMeta = MOTION_TEMPLATES.find((t) => t.id === templateId) || MOTION_TEMPLATES[0];

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  // Renderiza a engine procedural correspondente ou o render nativo
  const proceduralDoc = React.useMemo(() => {
    let proc: { html: string; gsap: string } | null = null;

    if (templateId === 'assemble-then-type-flyin') {
      proc = buildMontarEDigitarVoandoHtml({
        headline: 'ENQUADRE O MOVIMENTO.\nCRIE A CENA.',
        subheadline: 'Demonstração de layout cinemático de alta precisão.',
        ctaText: 'COMEÇAR AGORA',
        tag: 'MOTION STUDIO',
        highlightColor: '#e4c58a',
        imageSrc: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80',
        durationSec: 5.6,
        aspectRatio: '16:9',
      }, 0);
    } else if (templateId === 'flying-words') {
      proc = buildFlyingWordsHtml({
        headline: 'MOVIMENTO CINEMÁTICO',
        subheadline: 'HIPERVELOCIDADE & PROFUNDIDADE 3D',
        tag: 'MOTION STUDIO',
        highlightColor: '#60a5fa',
        aspectRatio: '16:9',
      });
    } else if (templateId === 'card-stack') {
      proc = buildCardStackHtml({
        headline: 'ESTRUTURA & MOTION',
        subheadline: 'COLEÇÃO DE COMPONENTES EM LEQUE 3D',
        tag: 'MOTION STUDIO',
        highlightColor: '#6366f1',
        aspectRatio: '16:9',
      });
    } else if (templateId === 'spotlight-hero-card') {
      proc = buildSpotlightHeroHtml({
        headline: 'O FOCO CENTRAL.',
        subheadline: 'PRODUTO EM DESTAQUE CINEMÁTICO',
        tag: 'MOTION STUDIO',
        highlightColor: '#f59e0b',
        aspectRatio: '16:9',
      });
    }

    if (!proc) return null;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #090b10;
      font-family: 'Inter', sans-serif;
      color: #ffffff;
    }
    #viewport-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    #canvas-root {
      width: 1920px;
      height: 1080px;
      position: absolute;
      transform-origin: center center;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div id="viewport-container">
    <div id="canvas-root">
      ${proc.html}
    </div>
  </div>

  <script>
    function autoFitCanvas() {
      const root = document.getElementById('canvas-root');
      if (!root) return;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const scale = Math.min(winW / 1920, winH / 1080);
      root.style.transform = 'scale(' + scale + ')';
      root.style.left = ((winW - 1920) / 2) + 'px';
      root.style.top = ((winH - 1080) / 2) + 'px';
    }
    window.addEventListener('resize', autoFitCanvas);
    document.addEventListener('DOMContentLoaded', autoFitCanvas);
    setTimeout(autoFitCanvas, 30);
    setTimeout(autoFitCanvas, 150);

    const START_SEC = 0;
    const masterTl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.0,
      onUpdate: function() {
        try {
          window.parent.postMessage({ type: 'TEMPLATE_TIME', time: this.time() }, '*');
        } catch(e) {}
      }
    });

    ${proc.gsap}

    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.type === 'PLAY') masterTl.play();
      if (e.data.type === 'PAUSE') masterTl.pause();
      if (e.data.type === 'RESTART') masterTl.restart();
    });
  </script>
</body>
</html>`;
  }, [templateId]);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'TEMPLATE_TIME') {
        setCurrentTime(e.data.time);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      iframeRef.current?.contentWindow?.postMessage({ type: 'PAUSE' }, '*');
      setIsPlaying(false);
    } else {
      iframeRef.current?.contentWindow?.postMessage({ type: 'PLAY' }, '*');
      setIsPlaying(true);
    }
  };

  const restart = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'RESTART' }, '*');
    setIsPlaying(true);
  };

  return (
    <div className="h-screen w-screen bg-[#07090e] text-white flex flex-col overflow-hidden select-none">
      {/* Header com Navegação */}
      <header className="h-14 border-b border-white/10 bg-[#0c101d] px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Voltar ao Catálogo de Templates"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{templateMeta.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1920x1080 (16:9 Nativo)
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Duração recomendada: {templateMeta.duration} • Categoria: {templateMeta.categoryName}
            </p>
          </div>
        </div>

        {/* Ações e Controles */}
        <div className="flex items-center gap-3">
          {proceduralDoc && (
            <>
              <div className="font-mono text-xs text-amber-400 bg-black/60 px-2.5 py-1 rounded border border-white/10">
                {currentTime.toFixed(2)}s / {templateMeta.duration}
              </div>

              <button
                type="button"
                onClick={restart}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Reiniciar Animação"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                  isPlaying
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPlaying ? 'Pausar' : 'Play'}
              </button>
            </>
          )}

          <Link
            href={`/create?initialTemplate=${templateMeta.id}`}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Usar este Modelo na Abertura
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal: Player Central 16:9 e Barra Lateral Técnica */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualizador 16:9 Fullscreen Cinematográfico */}
        <div className="flex-1 bg-[#04060a] flex items-center justify-center p-6 relative">
          <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden border border-white/10 bg-[#090b10] shadow-2xl relative flex items-center justify-center">
            {proceduralDoc ? (
              <iframe
                ref={iframeRef}
                srcDoc={proceduralDoc}
                title={templateMeta.name}
                className="w-full h-full border-0 select-none"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={templateMeta.previewGif || `/templates/previews/${templateMeta.id}.gif`}
                alt={templateMeta.name}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* Sidebar com Ficha Técnica & Anatomia do Motion */}
        <aside className="w-96 border-l border-white/10 bg-[#0a0d18] p-6 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                {templateMeta.badge}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{templateMeta.name}</h2>
              <p className="text-xs text-gray-400 leading-relaxed mt-2">{templateMeta.description}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Video className="w-4 h-4" />
                <span>Como este template se integra ao seu vídeo:</span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Este modelo é uma <strong>Receita de Cena de Alta Retenção</strong>. Ele é aplicado estrategicamente a uma das cenas do seu roteiro (como a cena de abertura ou transição chave), garantindo dinamismo visual sem quebrar o ritmo da locução.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                Especificações Técnicas
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5 text-gray-300">
                  <span className="text-gray-500">Categoria:</span>
                  <span className="font-semibold">{templateMeta.categoryName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5 text-gray-300">
                  <span className="text-gray-500">Duração Recomendada:</span>
                  <span className="font-semibold text-amber-400">{templateMeta.duration}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5 text-gray-300">
                  <span className="text-gray-500">Proporções Suportadas:</span>
                  <span className="font-semibold">16:9 • 9:16 • 1:1</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-300">
                  <span className="text-gray-500">Motor de Render:</span>
                  <span className="font-semibold text-emerald-400">HTML5 + GSAP 3D</span>
                </div>
              </div>
            </div>
          </div>

          <Link
            href={`/create?initialTemplate=${templateMeta.id}`}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Criar Vídeo com Este Estilo
          </Link>
        </aside>
      </div>
    </div>
  );
}
