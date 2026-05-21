import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let body: { url?: string };
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid request.' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }

  const { url } = body;
  if (!url?.trim()) return new Response(JSON.stringify({ error: 'URL is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const cleanUrl = url.trim();

  // ── Strategy 1: Jina AI Reader — handles JS-rendered pages ───────────────
  // r.jina.ai renders the page with a real browser and returns clean text
  try {
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), 15000);
    const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
      signal: ctrl1.signal,
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown',
      },
    });
    clearTimeout(t1);

    if (jinaRes.ok) {
      const jinaText = await jinaRes.text();

      // Jina returns: Title: ...\nURL Source: ...\nMarkdown Content:\n...
      const titleMatch = jinaText.match(/^Title:\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : '';

      // Strip the Jina header lines, get the actual content
      const contentStart = jinaText.indexOf('Markdown Content:');
      const markdownContent = contentStart > -1
        ? jinaText.slice(contentStart + 'Markdown Content:'.length).trim()
        : jinaText;

      // Extract headings from markdown
      const h1s = (markdownContent.match(/^# (.+)$/gm) || []).map(h => h.replace(/^# /, '').trim()).slice(0, 2);
      const h2s = (markdownContent.match(/^## (.+)$/gm) || []).map(h => h.replace(/^## /, '').trim()).filter(Boolean).slice(0, 8);

      // Clean body text — remove markdown symbols, get readable text
      const bodyText = markdownContent
        .replace(/!\[.*?\]\(.*?\)/g, '')   // remove images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
        .replace(/#{1,6}\s/g, '')           // remove heading markers
        .replace(/[*_`~]/g, '')             // remove formatting
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, 2000);

      return new Response(JSON.stringify({
        success: true,
        source: 'jina',
        title: title || h1s[0] || '',
        description: bodyText.slice(0, 300),
        headings: h2s,
        bodyText,
        brand: '',
        price: '',
        sku: '',
        category: '',
        features: [],
        keywords: '',
        metaDesc: bodyText.slice(0, 160),
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch { /* fall through to direct fetch */ }

  // ── Strategy 2: Direct HTML fetch + JSON-LD extraction ───────────────────
  try {
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 10000);
    const directRes = await fetch(cleanUrl, {
      signal: ctrl2.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(t2);

    if (!directRes.ok) {
      return new Response(JSON.stringify({ error: `Page returned ${directRes.status}. Try pasting the product details manually into Box 4.` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const html = await directRes.text();

    // JSON-LD product data
    interface ProductData { name?: string; description?: string; brand?: string; price?: string; sku?: string; category?: string; features?: string[]; }
    let pd: ProductData = {};
    const jsonLdBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const block of jsonLdBlocks) {
      try {
        const parsed = JSON.parse(block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim());
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item['@type'] === 'Product' || item.name) {
            pd.name        = pd.name        || item.name        || '';
            pd.description = pd.description || item.description || '';
            pd.brand       = pd.brand       || item.brand?.name || item.brand || '';
            pd.sku         = pd.sku         || item.sku         || '';
            pd.category    = pd.category    || item.category    || '';
            if (item.offers) { const o = Array.isArray(item.offers) ? item.offers[0] : item.offers; pd.price = pd.price || o?.price?.toString() || ''; }
            if (item.additionalProperty) { const props = Array.isArray(item.additionalProperty) ? item.additionalProperty : [item.additionalProperty]; pd.features = props.map((p: {name?: string; value?: string}) => `${p.name}: ${p.value}`).filter(Boolean); }
          }
        }
      } catch { /* skip */ }
    }

    const get = (p: RegExp) => { const m = html.match(p); return m ? m[1].trim() : ''; };
    const ogTitle   = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i) || get(/<meta[^>]+content=["']([^"']{1,200})["'][^>]+property=["']og:title["']/i);
    const ogDesc    = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,400})["']/i) || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+property=["']og:description["']/i);
    const metaDesc  = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,400})["']/i) || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+name=["']description["']/i);
    const pageTitle = get(/<title[^>]*>([^<]{1,150})<\/title>/i);
    const keywords  = get(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']{1,300})["']/i);
    const h1s       = (html.match(/<h1[^>]*>([^<]{2,150})<\/h1>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 2);
    const h2s       = (html.match(/<h2[^>]*>([^<]{2,150})<\/h2>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 8);

    const bodyText = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<nav[\s\S]*?<\/nav>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 2000);

    return new Response(JSON.stringify({
      success: true,
      source: 'direct',
      title:       pd.name     || ogTitle  || h1s[0] || pageTitle || '',
      description: pd.description || ogDesc || metaDesc || '',
      brand:       pd.brand    || '',
      price:       pd.price    || '',
      sku:         pd.sku      || '',
      category:    pd.category || '',
      features:    pd.features || [],
      keywords,
      headings:    h2s,
      bodyText,
      metaDesc:    metaDesc || ogDesc || '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg.includes('abort') ? 'Timed out. Try pasting product details into Box 4 manually.' : `Could not fetch page. Try pasting the product details into Box 4 manually.` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
