import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url } = body;
  if (!url?.trim()) {
    return new Response(JSON.stringify({ error: 'URL is required.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);

    // Use real browser headers to avoid being blocked
    const res = await fetch(url.trim(), {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });
    clearTimeout(t);

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Page returned status ${res.status}. This site may be blocking automated access.` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const html = await res.text();

    // ── 1. Extract JSON-LD structured data (best source for product info) ──
    interface ProductData {
      name?: string;
      description?: string;
      brand?: string;
      price?: string;
      sku?: string;
      category?: string;
      features?: string[];
      ingredients?: string;
    }
    let productData: ProductData = {};
    const jsonLdBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const block of jsonLdBlocks) {
      try {
        const jsonStr = block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
        const parsed = JSON.parse(jsonStr);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          const type = item['@type'] || '';
          if (['Product', 'ItemPage', 'WebPage'].includes(type) || item.name || item.description) {
            productData.name        = productData.name        || item.name        || '';
            productData.description = productData.description || item.description || '';
            productData.brand       = productData.brand       || item.brand?.name || item.brand || '';
            productData.sku         = productData.sku         || item.sku         || item.mpn   || '';
            productData.category    = productData.category    || item.category    || '';
            if (item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              productData.price = productData.price || offer?.price?.toString() || offer?.priceSpecification?.price?.toString() || '';
            }
            if (item.additionalProperty) {
              const props = Array.isArray(item.additionalProperty) ? item.additionalProperty : [item.additionalProperty];
              productData.features = props.map((p: {name?: string; value?: string}) => `${p.name}: ${p.value}`).filter(Boolean);
            }
          }
        }
      } catch { /* skip malformed JSON-LD */ }
    }

    // ── 2. Extract Open Graph & meta tags ──────────────────────────────────
    const get = (pattern: RegExp) => { const m = html.match(pattern); return m ? m[1].trim() : ''; };

    const ogTitle       = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i)
                       || get(/<meta[^>]+content=["']([^"']{1,200})["'][^>]+property=["']og:title["']/i);
    const ogDesc        = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,400})["']/i)
                       || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+property=["']og:description["']/i);
    const metaDesc      = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,400})["']/i)
                       || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+name=["']description["']/i);
    const pageTitle     = get(/<title[^>]*>([^<]{1,150})<\/title>/i);
    const keywords      = get(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']{1,300})["']/i)
                       || get(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']keywords["']/i);

    // ── 3. Extract headings from the page ─────────────────────────────────
    const h1s = (html.match(/<h1[^>]*>([^<]{2,150})<\/h1>/gi) || [])
      .map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 3);
    const h2s = (html.match(/<h2[^>]*>([^<]{2,150})<\/h2>/gi) || [])
      .map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 6);

    // ── 4. Extract readable body text ─────────────────────────────────────
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 1200);

    // ── 5. Build the summary ──────────────────────────────────────────────
    const title       = productData.name || ogTitle || h1s[0] || pageTitle || '';
    const description = productData.description || ogDesc || metaDesc || '';

    return new Response(
      JSON.stringify({
        success:     true,
        title,
        description,
        brand:       productData.brand    || '',
        price:       productData.price    || '',
        sku:         productData.sku      || '',
        category:    productData.category || '',
        features:    productData.features || [],
        keywords:    keywords             || '',
        headings:    h2s,
        bodyText,
        metaDesc:    metaDesc             || ogDesc || '',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const friendly = msg.includes('abort')
      ? 'Request timed out — the page took too long to respond.'
      : `Could not fetch this URL. The site may be blocking automated access. (${msg})`;
    return new Response(JSON.stringify({ error: friendly }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
};
