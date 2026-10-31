import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/media/search?query=...
 * Busca imagens reais via Openverse API + Wikimedia Commons API + Geração Contextual IA
 * Nunca retorna imagens fixas desconexas. Todas as imagens correspondem ao tema pesquisado.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = (searchParams.get('query') || 'cinematic technology').trim();

    const results: Array<{
      id: string;
      title: string;
      type: 'image';
      thumb: string;
      url: string;
      source: string;
    }> = [];

    // 1. Busca em tempo real no Openverse (Creative Commons Photography)
    try {
      const ovUrl = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
        rawQuery
      )}&page_size=8&aspect_ratio=tall,wide,square`;
      const ovRes = await fetch(ovUrl, {
        headers: { 'User-Agent': 'VisualStudioPro/2.5' },
        next: { revalidate: 300 },
      });

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        const items = Array.isArray(ovData.results) ? ovData.results : [];
        for (const item of items.slice(0, 5)) {
          if (item.url && typeof item.url === 'string' && item.url.startsWith('http')) {
            results.push({
              id: `ov-${item.id || Math.random().toString(36).slice(2, 8)}`,
              title: item.title ? String(item.title).slice(0, 50) : `${rawQuery} • Stock`,
              type: 'image',
              thumb: item.thumbnail || item.url,
              url: item.url,
              source: 'Stock Real',
            });
          }
        }
      }
    } catch (e) {
      console.warn('Openverse search warning:', e);
    }

    // 2. Busca complementar no Wikimedia Commons (alta resolução)
    if (results.length < 5) {
      try {
        const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=filetype:bitmap%20${encodeURIComponent(
          rawQuery
        )}&gsrlimit=6&prop=imageinfo&iiprop=url&iiurlwidth=1080&format=json`;
        const wikiRes = await fetch(wikiUrl, {
          headers: { 'User-Agent': 'VisualStudioPro/2.5 (https://visualstudio.app)' },
        });
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          const pages = Object.values(wikiData.query?.pages || {}) as any[];
          for (const p of pages) {
            const info = p?.imageinfo?.[0];
            const imgUrl = info?.thumburl || info?.url;
            if (imgUrl && !imgUrl.endsWith('.svg') && !imgUrl.endsWith('.gif')) {
              results.push({
                id: `wiki-${p.pageid}`,
                title: String(p.title || rawQuery).replace(/^File:/i, '').slice(0, 45),
                type: 'image',
                thumb: imgUrl,
                url: imgUrl,
                source: 'Wikimedia HD',
              });
            }
          }
        }
      } catch (e) {
        console.warn('Wikimedia search warning:', e);
      }
    }

    // 3. Adiciona Imagens Cinematográficas Geradas sob Demanda para o termo exato pesquisado
    const aiAngles = [
      { suffix: 'cinematic lighting, dark moody atmosphere, 8k photography, ultra detailed', label: 'Cinema IA #1' },
      { suffix: 'modern editorial photography, dramatic contrast, shallow depth of field, 8k', label: 'Editorial IA #2' },
      { suffix: 'futuristic high contrast visual, professional studio lighting, photorealistic', label: 'Conceito IA #3' },
    ];

    aiAngles.forEach((angle, idx) => {
      const seed = Math.abs(hashCode(`${rawQuery}-${idx}`)) % 99999;
      const fullPrompt = `${rawQuery}, ${angle.suffix}`;
      const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        fullPrompt
      )}?width=1080&height=1350&seed=${seed}&nologo=true`;
      results.push({
        id: `ai-search-${seed}-${idx}`,
        title: `${rawQuery} • ${angle.label}`,
        type: 'image',
        thumb: aiUrl,
        url: aiUrl,
        source: 'IA Generativa',
      });
    });

    return NextResponse.json({
      success: true,
      query: rawQuery,
      results: results.slice(0, 9),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
