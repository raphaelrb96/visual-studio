import { makeProject, all, chain, waitFor, easeOutBack, easeInOutCubic, easeOutQuad } from '@revideo/core';
import { makeScene2D, Txt, Rect, Img, Circle, Audio, View2D } from '@revideo/2d';
import type { Project } from '@revideo/core';
import { ScriptScene, AspectRatio } from '@/types/studio';

/**
 * Construtor Oficial de Vídeo-as-Code (Revideo Puro)
 * Transforma o roteiro e os componentes da IA em um Projeto Real do Revideo
 * Renderizado diretamente no Canvas 2D pelo motor oficial do Revideo (@revideo/core e @revideo/player-react).
 */
export function buildRevideoProject(
  scenes: ScriptScene[],
  aspectRatio: AspectRatio = '9:16'
): Project {
  const isVertical = aspectRatio === '9:16';
  const width = isVertical ? 1080 : aspectRatio === '16:9' ? 1920 : 1080;
  const height = isVertical ? 1920 : aspectRatio === '16:9' ? 1080 : 1080;

  const revideoScenes = scenes.map((sc, idx) => {
    return makeScene2D(`scene_${idx + 1}`, function* (view: View2D) {
      const dur = Math.max(3.5, Number(sc.durationSec) || 4.5);

      // 1. Áudio da Narração Neural (se presente)
      if (sc.audioUrl) {
        const voiceAudio = new Audio({
          src: sc.audioUrl,
        });
        view.add(voiceAudio);
      }

      // 2. Imagem de Fundo Cinematográfica (B-Roll) com efeito Ken Burns do Revideo
      if (sc.brollImageUrl) {
        const bgImg = new Img({
          src: sc.brollImageUrl,
          width: width * 1.15,
          height: height * 1.15,
          scale: 1.0,
          zIndex: 0,
        });
        view.add(bgImg);

        // Zoom contínuo suave no Revideo
        yield bgImg.scale(1.12, dur);
      } else {
        const bgRect = new Rect({
          width,
          height,
          fill: '#080d1a',
          zIndex: 0,
        });
        view.add(bgRect);
      }

      // 3. Vinheta Cinematográfica Escura para Contraste
      const vignette = new Rect({
        width,
        height,
        fill: 'rgba(5, 8, 16, 0.48)',
        zIndex: 1,
      });
      view.add(vignette);

      // 4. Componente de Motion Graphics Puro do Revideo
      const compType = sc.componentType || 'CardFrase';

      if (compType === 'StatCounter') {
        const card = new Rect({
          width: isVertical ? 860 : 960,
          height: isVertical ? 480 : 380,
          y: isVertical ? -80 : -40,
          fill: 'rgba(15, 23, 42, 0.88)',
          stroke: '#facc15',
          lineWidth: 4,
          radius: 36,
          scale: 0,
          zIndex: 10,
        });

        const numberTxt = new Txt({
          text: `${sc.componentProps?.number || 84}${sc.componentProps?.suffix || '%'}`,
          fill: '#facc15',
          fontSize: isVertical ? 130 : 110,
          fontWeight: 900,
          fontFamily: 'Montserrat, sans-serif',
          y: -40,
        });

        const labelTxt = new Txt({
          text: sc.componentProps?.label || 'CRESCIMENTO DE RETENÇÃO',
          fill: '#ffffff',
          fontSize: isVertical ? 32 : 28,
          fontWeight: 800,
          fontFamily: 'Montserrat, sans-serif',
          y: 70,
        });

        card.add(numberTxt);
        card.add(labelTxt);
        view.add(card);

        yield* card.scale(1, 0.5, easeOutBack);
      } else if (compType === 'GraficoBarras') {
        const container = new Rect({
          width: isVertical ? 880 : 980,
          height: isVertical ? 500 : 400,
          y: isVertical ? -80 : -40,
          fill: 'rgba(15, 23, 42, 0.88)',
          stroke: '#38bdf8',
          lineWidth: 3,
          radius: 32,
          scale: 0,
          zIndex: 10,
        });

        const barTitle = new Txt({
          text: sc.componentProps?.title || 'DESEMPENHO DO MERCADO',
          fill: '#ffffff',
          fontSize: 28,
          fontWeight: 800,
          fontFamily: 'Montserrat, sans-serif',
          y: -170,
        });
        container.add(barTitle);

        const bars = sc.componentProps?.bars || [
          { label: 'Método Manual', value: 24, formatted: '24%' },
          { label: 'Vídeo Animado', value: 92, formatted: '92%' },
        ];

        const bar1 = new Rect({
          width: 520,
          height: 38,
          fill: '#ef4444',
          radius: 12,
          x: -40,
          y: -40,
          scale: 0,
        });
        const bar1Txt = new Txt({
          text: `${bars[0]?.label || 'Comum'}: ${bars[0]?.formatted || '24%'}`,
          fill: '#ffffff',
          fontSize: 22,
          fontWeight: 700,
          x: 0,
        });
        bar1.add(bar1Txt);
        container.add(bar1);

        const bar2 = new Rect({
          width: 700,
          height: 48,
          fill: '#22c55e',
          radius: 12,
          x: 40,
          y: 50,
          scale: 0,
        });
        const bar2Txt = new Txt({
          text: `${bars[1]?.label || 'Nossa IA'}: ${bars[1]?.formatted || '92%'}`,
          fill: '#ffffff',
          fontSize: 24,
          fontWeight: 900,
          x: 0,
        });
        bar2.add(bar2Txt);
        container.add(bar2);

        view.add(container);

        yield* container.scale(1, 0.45, easeOutBack);
        yield* all(bar1.scale(1, 0.4), bar2.scale(1, 0.45, easeOutBack));
      } else if (compType === 'VersusComparison') {
        const leftBox = new Rect({
          width: isVertical ? 410 : 460,
          height: isVertical ? 440 : 360,
          x: isVertical ? -225 : -250,
          y: isVertical ? -80 : -40,
          fill: 'rgba(239, 68, 68, 0.16)',
          stroke: '#ef4444',
          lineWidth: 3,
          radius: 28,
          scale: 0,
          zIndex: 10,
        });

        const leftTxt = new Txt({
          text: sc.componentProps?.leftTitle || 'O JEITO ANTIGO',
          fill: '#f87171',
          fontSize: 26,
          fontWeight: 800,
          fontFamily: 'Montserrat, sans-serif',
          y: -130,
        });
        leftBox.add(leftTxt);

        const rightBox = new Rect({
          width: isVertical ? 410 : 460,
          height: isVertical ? 440 : 360,
          x: isVertical ? 225 : 250,
          y: isVertical ? -80 : -40,
          fill: 'rgba(34, 197, 94, 0.16)',
          stroke: '#22c55e',
          lineWidth: 3,
          radius: 28,
          scale: 0,
          zIndex: 10,
        });

        const rightTxt = new Txt({
          text: sc.componentProps?.rightTitle || 'NOSSO MÉTODO',
          fill: '#4ade80',
          fontSize: 26,
          fontWeight: 800,
          fontFamily: 'Montserrat, sans-serif',
          y: -130,
        });
        rightBox.add(rightTxt);

        view.add(leftBox);
        view.add(rightBox);

        yield* all(
          leftBox.scale(1, 0.5, easeOutBack),
          rightBox.scale(1, 0.5, easeOutBack)
        );
      } else if (compType === 'NewsHeadline') {
        const newsCard = new Rect({
          width: isVertical ? 860 : 960,
          height: isVertical ? 380 : 320,
          y: isVertical ? -100 : -60,
          fill: 'rgba(255, 255, 255, 0.96)',
          radius: 24,
          scale: 0,
          zIndex: 10,
        });

        const portalTxt = new Txt({
          text: sc.componentProps?.portalName || 'NOTÍCIA EXCLUSIVA',
          fill: '#dc2626',
          fontSize: 22,
          fontWeight: 900,
          fontFamily: 'Montserrat, sans-serif',
          y: -110,
        });

        const headTxt = new Txt({
          text: sc.componentProps?.headline || sc.text.slice(0, 45).toUpperCase(),
          fill: '#0f172a',
          fontSize: isVertical ? 34 : 30,
          fontWeight: 900,
          fontFamily: 'Montserrat, sans-serif',
          width: 780,
          textWrap: true,
          y: 10,
        });

        newsCard.add(portalTxt);
        newsCard.add(headTxt);
        view.add(newsCard);

        yield* newsCard.scale(1, 0.45, easeOutBack);
      } else if (compType === 'CTAButton') {
        const ctaBtn = new Rect({
          width: isVertical ? 720 : 800,
          height: 140,
          y: isVertical ? -60 : -30,
          fill: '#facc15',
          radius: 70,
          scale: 0,
          zIndex: 10,
        });

        const btnTxt = new Txt({
          text: sc.componentProps?.buttonText || 'COMECE AGORA MESMO',
          fill: '#000000',
          fontSize: 34,
          fontWeight: 900,
          fontFamily: 'Montserrat, sans-serif',
        });

        ctaBtn.add(btnTxt);
        view.add(ctaBtn);

        yield* ctaBtn.scale(1, 0.5, easeOutBack);
        // Pulso
        yield* ctaBtn.scale(1.08, 0.4, easeInOutCubic);
        yield* ctaBtn.scale(1.0, 0.4, easeInOutCubic);
      } else {
        // Padrão: CardFrase (Frase de Alto Impacto Cinética)
        const textCard = new Rect({
          width: isVertical ? 860 : 960,
          height: isVertical ? 360 : 300,
          y: isVertical ? -90 : -50,
          fill: 'rgba(15, 23, 42, 0.85)',
          stroke: '#ffffff',
          lineWidth: 2,
          radius: 32,
          scale: 0,
          zIndex: 10,
        });

        const headlineTxt = new Txt({
          text: sc.componentProps?.headline || sc.text.slice(0, 50).toUpperCase(),
          fill: '#ffffff',
          fontSize: isVertical ? 36 : 30,
          fontWeight: 900,
          fontFamily: 'Montserrat, sans-serif',
          width: 760,
          textWrap: true,
        });

        textCard.add(headlineTxt);
        view.add(textCard);

        yield* textCard.scale(1, 0.45, easeOutBack);
      }

      // 5. Legendas Dinâmicas Sincronizadas no Terço Inferior do Revideo
      const subCard = new Rect({
        width: isVertical ? 900 : 1200,
        height: 180,
        y: isVertical ? 520 : 360,
        fill: 'rgba(0, 0, 0, 0.72)',
        radius: 28,
        scale: 0,
        zIndex: 20,
      });

      const subTxt = new Txt({
        text: sc.text,
        fill: '#facc15',
        fontSize: isVertical ? 34 : 28,
        fontWeight: 900,
        fontFamily: 'Montserrat, sans-serif',
        width: isVertical ? 840 : 1100,
        textWrap: true,
        textAlign: 'center',
      });

      subCard.add(subTxt);
      view.add(subCard);

      yield* subCard.scale(1, 0.35, easeOutBack);

      // Espera até completar o tempo total da cena
      const remainingTime = Math.max(1.0, dur - 1.5);
      yield* waitFor(remainingTime);
    });
  });

  return makeProject({
    name: 'visual_studio_revideo_project',
    scenes: revideoScenes,
    settings: {
      shared: {
        size: { x: width, y: height },
      },
    },
  });
}
