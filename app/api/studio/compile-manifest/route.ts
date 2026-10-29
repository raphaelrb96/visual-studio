import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptScene } from '@/types/studio';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectName = 'Projeto HyperFrame',
      prompt = '',
      aspectRatio = '9:16',
      presetId = 'kinetic_yellow',
      scenes = [] as ScriptScene[],
      audio = {},
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    let compiledScenes: ScriptScene[] = [...scenes];

    if (apiKey && apiKey !== 'YOUR_API_KEY' && scenes.length > 0) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const instruction = `
Você é um Engenheiro de Motion Graphics WebGL (Three.js) e Compilador HyperFrame.
Receba as cenas abaixo e otimize os parâmetros físicos (hyperframeConfig) e componentProps para máxima retenção visual em ${aspectRatio}.

Cenas atuais:
${JSON.stringify(
  scenes.map((s: ScriptScene) => ({
    id: s.id,
    text: s.text,
    componentType: s.componentType,
    sfxType: s.sfxType,
    cameraMotion: s.cameraMotion,
    collageImages: s.collageImages,
    componentProps: s.componentProps,
  }))
)}

Retorne APENAS um JSON com o array "scenes" contendo para cada cena:
- "id": mesmo id
- "hyperframeConfig": {
    "physicsDamping": número entre 10 e 22,
    "physicsStiffness": número entre 110 e 200,
    "threeJsObject": "coin" | "diamond" | "shield" | "cube",
    "lightColor": hex color vibrante,
    "customHtmlOverlay": tag HTML curta com efeito HUD ou telemetria cinética
  }
`;
        const res = await model.generateContent(instruction);
        const rawText = res.response
          .text()
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();
        const parsed = JSON.parse(rawText);
        if (parsed?.scenes && Array.isArray(parsed.scenes)) {
          compiledScenes = scenes.map((sc: ScriptScene, idx: number) => {
            const found = parsed.scenes.find((p: any) => p.id === sc.id) || parsed.scenes[idx];
            return {
              ...sc,
              hyperframeConfig: {
                ...sc.hyperframeConfig,
                ...(found?.hyperframeConfig || {}),
              },
            };
          });
        }
      } catch (e) {
        console.warn('Compilação determinística HyperFrame + Three.js ativada:', e);
      }
    }

    // Enriquece deterministicamente todas as cenas com telemetria HTML/Three.js e colagens
    const finalScenes: ScriptScene[] = compiledScenes.map((sc: ScriptScene, i: number) => {
      const imgs =
        sc.collageImages && sc.collageImages.length > 0
          ? sc.collageImages
          : sc.brollImageUrl
          ? [sc.brollImageUrl]
          : [];

      const threeObjects: Array<'coin' | 'diamond' | 'shield' | 'cube'> = ['coin', 'diamond', 'shield', 'cube'];
      const chosen3D =
        sc.hyperframeConfig?.threeJsObject ||
        sc.componentProps?.object3d ||
        threeObjects[i % threeObjects.length];

      const htmlSnippet = `<div class="hyperframe-node" data-scene="${i + 1}" data-engine="threejs-webgl" data-object="${chosen3D}" data-motion="${sc.cameraMotion || 'zoom_in'}"><!-- Cena #${i + 1}: ${sc.componentType} (${sc.durationSec}s) --></div>`;

      return {
        ...sc,
        collageImages: imgs,
        componentProps: {
          ...sc.componentProps,
          object3d: chosen3D,
          images: imgs.length > 0 ? imgs : sc.componentProps?.images,
          imageUrl: imgs[0] || sc.brollImageUrl || sc.componentProps?.imageUrl,
        },
        hyperframeConfig: {
          physicsDamping: sc.hyperframeConfig?.physicsDamping || 14 + (i % 5),
          physicsStiffness: sc.hyperframeConfig?.physicsStiffness || 145 + (i * 10),
          threeJsObject: chosen3D,
          lightColor: sc.hyperframeConfig?.lightColor || (i % 2 === 0 ? '#38bdf8' : '#eab308'),
          customHtmlOverlay: sc.hyperframeConfig?.customHtmlOverlay || htmlSnippet,
        },
      };
    });

    const compiledHtmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${projectName} — HyperFrame & Three.js Manifest</title>
  <script type="application/json" id="hyperframe-manifest">
${JSON.stringify({ projectName, aspectRatio, presetId, audio, scenes: finalScenes }, null, 2)}
  </script>
</head>
<body data-aspect="${aspectRatio}" data-engine="hyperframe-threejs-v2">
  <div id="webgl-three-stage"></div>
  <div id="hyperframe-kinetic-layer">
    ${finalScenes.map((s) => s.hyperframeConfig?.customHtmlOverlay || '').join('\n    ')}
  </div>
</body>
</html>`;

    return NextResponse.json({
      success: true,
      manifest: {
        version: '2.5-threejs-hyperframe',
        title: projectName,
        aspectRatio,
        presetId,
        audio,
        scenes: finalScenes,
      },
      compiledHtml: compiledHtmlTemplate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Erro ao compilar manifesto HyperFrame' },
      { status: 500 }
    );
  }
}
