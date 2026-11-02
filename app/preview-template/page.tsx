'use client';

import React, { useState, useEffect } from 'react';
import { buildMontarEDigitarVoandoHtml } from '@/lib/design-systems/templates/montar-e-digitar-voando';
import { Play, Pause, RotateCcw, ArrowLeft, Sparkles, Layers, Eye } from 'lucide-react';
import Link from 'next/link';

export default function PreviewTemplatePage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  // Compila a página de demonstração autônoma do template exato
  const templateBundle = React.useMemo(() => {
    const procedural = buildMontarEDigitarVoandoHtml({
      headline: 'Enquadre o movimento.\nCrie a cena.',
      subheadline: 'Demonstração de layout cinemático de alta precisão.',
      ctaText: 'COMEÇAR AGORA',
      tag: 'LAYOUT DINÂMICO',
      highlightColor: '#e4c58a',
      imageSrc: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1080&q=80',
      durationSec: 5.6,
    }, 0);

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
      ${procedural.html}
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
    }
    window.addEventListener('resize', autoFitCanvas);
    document.addEventListener('DOMContentLoaded', autoFitCanvas);
    setTimeout(autoFitCanvas, 50);

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

    ${procedural.gsap}

    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.type === 'PLAY') masterTl.play();
      if (e.data.type === 'PAUSE') masterTl.pause();
      if (e.data.type === 'RESTART') masterTl.restart();
      if (e.data.type === 'SEEK') masterTl.time(e.data.time);
    });
  </script>
</body>
</html>`;
  }, []);

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
            href="/dashboard"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Voltar à Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Catálogo de Templates • Montar &amp; Digitar Voando</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1920x1080 (16:9 Nativo)
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Duração: 5.6s (168 quadros a 30fps) • 2 Etapas Semânticas</p>
          </div>
        </div>

        {/* Controles de Reprodução */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs text-amber-400 bg-black/60 px-2.5 py-1 rounded border border-white/10">
            {currentTime.toFixed(2)}s / 5.60s
          </div>

          <button
            type="button"
            onClick={restart}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play
              </>
            )}
          </button>

          <Link
            href="/create"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> Criar Vídeo com Este Template
          </Link>
        </div>
      </header>

      {/* Grid de Apresentação: Preview Interativa + Miniatura em GIF */}
      <div className="flex-1 bg-black flex flex-col lg:flex-row overflow-hidden">
        {/* Lado Esquerdo: Player do Canvas em Tempo Real */}
        <div className="flex-1 p-4 flex items-center justify-center bg-[#07090e] border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
          <div className="w-full h-full max-w-full max-h-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#090b10]">
            <iframe
              ref={iframeRef}
              srcDoc={templateBundle}
              className="w-full h-full border-none pointer-events-auto"
              title="Preview Interativo do Template"
            />
          </div>
        </div>

        {/* Lado Direito: Detalhes Técnicos & Miniatura GIF */}
        <div className="w-full lg:w-96 bg-[#0c101d] p-5 overflow-y-auto space-y-5 shrink-0">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
              Prévia Visual do Template
            </span>
            <h2 className="text-xl font-extrabold text-white">Montar &amp; Digitar Voando</h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Em uma grade escura vazia, esqueletos estruturais surgem de todas as direções e se encaixam; em seguida, o texto voa do espaço 3D girando caractere por caractere.
            </p>
          </div>

          {/* Miniatura em GIF */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
              Loop em GIF (Animação Contínua)
            </span>
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-lg">
              <img
                src="/templates/montar-e-digitar-voando.gif"
                alt="Montar e Digitar Voando GIF"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Especificações Técnicas */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-gray-400">Duração:</span>
              <span className="font-mono text-white font-bold">5.6s (168f)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-gray-400">Resolução Nativa:</span>
              <span className="font-mono text-white font-bold">1920 × 1080</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1.5">
              <span className="text-gray-400">Física do Texto:</span>
              <span className="font-mono text-amber-300 font-bold">3D Perspective (900px)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Paleta de Destaque:</span>
              <span className="font-mono text-amber-400 font-bold">#e4c58a (Dourado)</span>
            </div>
          </div>

          <Link
            href="/create"
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all block text-center"
          >
            Usar no Meu Vídeo
          </Link>
        </div>
      </div>
    </div>
  );
}
