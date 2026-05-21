import type { APIRoute } from 'astro';

// ── Deep key search helpers ───────────────────────────────────────────────────
function deepFind(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== 'object') return '';
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in o) {
      const v = o[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
      if (typeof v === 'number') return String(v);
    }
  }
  // recurse one level
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const found = deepFind(v, keys);
      if (found) return found;
    }
  }
  return '';
}

function deepFindArray(obj: unknown, keys: string[]): string[] {
  if (!obj || typeof obj !== 'object') return [];
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in o && Array.isArray(o[k])) {
      const arr = o[k] as unknown[];
      const flat = arr.map(item =>
        typeof item === 'string' ? item.trim() :
        typeof item === 'object' && item !== null ? (
          (item as Record<string, unknown>)['name']?.toString() ||
          (item as Record<string, unknown>)['value']?.toString() ||
          (item as Record<string, unknown>)['text']?.toString() ||
          (item as Record<string, unknown>)['title']?.toString() ||
          (item as Record<string, unknown>)['label']?.toString() ||
          (item as Record<string, unknown>)['displayName']?.toString() || ''
        ) : String(item)
      ).filter(s => s && s.length > 1);
      if (flat.length) return flat;
    }
  }
  // recurse one level
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const found = deepFindArray(v, keys);
      if (found.length) return found;
    }
  }
  return [];
}

// ── Parse any e-commerce JSON blob ───────────────────────────────────────────
interface ParsedProduct {
  title: string; brand: string; price: string; mrp: string; sku: string;
  category: string; description: string; ingredients: string;
  highlights: string[]; features: string[]; keyIngredients: string[];
  howToUse: string; reviewRating: string; reviewCount: string; bodyText: string;
}

function parseEcommerceJson(raw: string): ParsedProduct | null {
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return null; }

  const root = parsed as Record<string, unknown>;
  // Unwrap common wrapper layers
  const data = (
    root.data && typeof root.data === 'object' ? root.data :
    root.product && typeof root.product === 'object' ? root.product :
    root.item && typeof root.item === 'object' ? root.item :
    root.result && typeof root.result === 'object' ? root.result :
    root.response && typeof root.response === 'object' ? root.response :
    root
  ) as Record<string, unknown>;

  const title = deepFind(data, ['title', 'name', 'productName', 'product_name', 'displayName', 'display_name', 'productTitle']);
  if (!title) return null;

  const brand    = deepFind(data, ['brandName', 'brand_name', 'brand', 'manufacturer', 'manufacturerName', 'brandDisplayName']);
  const price    = deepFind(data, ['price', 'sellingPrice', 'selling_price', 'salePrice', 'sale_price', 'discountedPrice', 'offerPrice', 'offer_price', 'sp']);
  const mrp      = deepFind(data, ['mrp', 'MRP', 'originalPrice', 'original_price', 'listPrice', 'maxPrice', 'max_price', 'regularPrice', 'basePrice']);
  const sku      = deepFind(data, ['sku', 'SKU', 'productId', 'product_id', 'productCode', 'product_code', 'itemId', 'id']);
  const category = deepFind(data, ['category', 'categoryName', 'category_name', 'primaryCategory', 'categoryPath', 'breadcrumb']);

  const description = deepFind(data, [
    'description', 'shortDescription', 'short_description', 'productDescription',
    'product_description', 'longDescription', 'long_description', 'summary', 'overview', 'about',
    'productOverview', 'productInfo', 'aboutProduct',
  ]);

  const ingredients = deepFind(data, [
    'ingredients', 'keyIngredients', 'key_ingredients', 'ingredientsList', 'ingredients_list',
    'formula', 'composition', 'activeIngredients', 'active_ingredients', 'ingredientsInfo',
    'productIngredients', 'fullIngredients',
  ]);

  const keyIngredients = deepFindArray(data, [
    'keyIngredients', 'key_ingredients', 'activeIngredients', 'active_ingredients',
    'heroIngredients', 'hero_ingredients', 'starIngredients',
  ]);

  const highlights = deepFindArray(data, [
    'highlights', 'keyHighlights', 'key_highlights', 'keyBenefits', 'key_benefits',
    'bulletPoints', 'bullet_points', 'usps', 'USPs', 'productHighlights',
    'claims', 'benefits', 'sellingPoints',
  ]);

  const features = deepFindArray(data, [
    'features', 'featureList', 'feature_list', 'specifications', 'specs',
    'productDetails', 'product_details', 'additionalInfo', 'attributes',
    'productAttributes', 'technicalDetails',
  ]);

  const howToUse = deepFind(data, [
    'howToUse', 'how_to_use', 'usage', 'directions', 'application', 'instructions',
    'usageInstructions', 'usage_instructions', 'steps', 'applicationMethod', 'directionForUse',
  ]);

  const reviewRating = deepFind(data, [
    'rating', 'averageRating', 'average_rating', 'avgRating', 'avg_rating',
    'productRating', 'overallRating', 'stars', 'ratingValue',
  ]);
  const reviewCount = deepFind(data, [
    'reviewCount', 'review_count', 'numReviews', 'num_reviews', 'totalReviews', 'total_reviews',
    'ratingsCount', 'ratings_count', 'ratingCount', 'noOfRatings', 'reviewsTotal',
  ]);

  // Build readable body text
  const lines: string[] = [];
  if (title)        lines.push(`Product: ${title}`);
  if (brand)        lines.push(`Brand: ${brand}`);
  if (price)        lines.push(`Price: ₹${price}`);
  if (mrp && mrp !== price) lines.push(`MRP: ₹${mrp}`);
  if (category)     lines.push(`Category: ${category}`);
  if (sku)          lines.push(`ID/SKU: ${sku}`);
  if (reviewRating) lines.push(`Rating: ${reviewRating}★${reviewCount ? ` from ${reviewCount} reviews` : ''}`);
  if (description)  lines.push(`\nDescription:\n${description.slice(0, 700)}`);
  if (keyIngredients.length) lines.push(`\nKey Ingredients: ${keyIngredients.join(', ')}`);
  if (ingredients)  lines.push(`\nIngredients: ${ingredients.slice(0, 600)}`);
  if (highlights.length)    lines.push(`\nHighlights:\n- ${highlights.slice(0, 12).join('\n- ')}`);
  if (features.length)      lines.push(`\nFeatures:\n- ${features.slice(0, 10).join('\n- ')}`);
  if (howToUse)             lines.push(`\nHow to Use:\n${howToUse.slice(0, 500)}`);

  return {
    title, brand, price, mrp, sku, category, description,
    ingredients, highlights, features, keyIngredients, howToUse,
    reviewRating, reviewCount,
    bodyText: lines.join('\n').slice(0, 4000),
  };
}

// ── Try to find a JSON blob inside text ──────────────────────────────────────
function tryExtractJson(text: string): string | null {
  const match = text.match(/(\{[\s\S]{50,}\})/);
  if (!match) return null;
  try { JSON.parse(match[1]); return match[1]; } catch { return null; }
}

export const POST: APIRoute = async ({ request }) => {
  let body: { url?: string };
  try { body = await request.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid request.' }), { status: 400, headers: { 'Content-Type': 'application/json' } }); }

  const { url } = body;
  if (!url?.trim()) return new Response(JSON.stringify({ error: 'URL is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  const cleanUrl = url.trim();

  // ── Strategy 1: Jina AI Reader — handles JS-rendered pages ───────────────
  try {
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), 20000);
    const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
      signal: ctrl1.signal,
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown',
        'X-Timeout': '15',
      },
    });
    clearTimeout(t1);

    if (jinaRes.ok) {
      const jinaText = await jinaRes.text();

      const titleMatch = jinaText.match(/^Title:\s*(.+)$/m);
      const jinaTitle = titleMatch ? titleMatch[1].trim() : '';

      const contentStart = jinaText.indexOf('Markdown Content:');
      const markdownContent = contentStart > -1
        ? jinaText.slice(contentStart + 'Markdown Content:'.length).trim()
        : jinaText;

      // Check if Jina returned JSON (API-driven sites like Nykaa)
      const trimmed = markdownContent.trim();
      const jsonRaw = (trimmed.startsWith('{') || trimmed.startsWith('[')) ? trimmed : tryExtractJson(markdownContent);

      if (jsonRaw) {
        const product = parseEcommerceJson(jsonRaw);
        if (product) {
          return new Response(JSON.stringify({
            success: true,
            source: 'jina-json',
            title:          product.title,
            brand:          product.brand,
            price:          product.price || product.mrp,
            mrp:            product.mrp,
            sku:            product.sku,
            category:       product.category,
            description:    product.description,
            ingredients:    product.ingredients,
            keyIngredients: product.keyIngredients,
            highlights:     product.highlights,
            features:       product.features,
            howToUse:       product.howToUse,
            reviewRating:   product.reviewRating,
            reviewCount:    product.reviewCount,
            headings:       [],
            keywords:       '',
            bodyText:       product.bodyText,
            metaDesc:       product.description.slice(0, 160),
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      // Regular markdown page
      const h1s = (markdownContent.match(/^# (.+)$/gm) || []).map(h => h.replace(/^# /, '').trim()).slice(0, 2);
      const h2s = (markdownContent.match(/^## (.+)$/gm) || []).map(h => h.replace(/^## /, '').trim()).filter(Boolean).slice(0, 8);

      const bodyText = markdownContent
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/#{1,6}\s/g, '')
        .replace(/[*_`~]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, 3500);

      return new Response(JSON.stringify({
        success: true, source: 'jina',
        title: jinaTitle || h1s[0] || '',
        brand: '', price: '', mrp: '', sku: '', category: '',
        description: bodyText.slice(0, 300),
        ingredients: '', keyIngredients: [], highlights: [], features: [],
        howToUse: '', reviewRating: '', reviewCount: '',
        headings: h2s, keywords: '',
        bodyText,
        metaDesc: bodyText.slice(0, 160),
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch { /* fall through */ }

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

    const contentType = directRes.headers.get('content-type') || '';
    const rawText = await directRes.text();

    // If direct response is JSON, parse as product
    if (contentType.includes('application/json') || rawText.trim().startsWith('{')) {
      const product = parseEcommerceJson(rawText);
      if (product) {
        return new Response(JSON.stringify({
          success: true, source: 'direct-json',
          title: product.title, brand: product.brand,
          price: product.price || product.mrp, mrp: product.mrp,
          sku: product.sku, category: product.category,
          description: product.description,
          ingredients: product.ingredients,
          keyIngredients: product.keyIngredients,
          highlights: product.highlights, features: product.features,
          howToUse: product.howToUse,
          reviewRating: product.reviewRating, reviewCount: product.reviewCount,
          headings: [], keywords: '',
          bodyText: product.bodyText,
          metaDesc: product.description.slice(0, 160),
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const html = rawText;

    // JSON-LD extraction
    interface ProductData { name?: string; description?: string; brand?: string; price?: string; sku?: string; category?: string; features?: string[]; }
    let pd: ProductData = {};
    const jsonLdBlocks = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    for (const block of jsonLdBlocks) {
      try {
        const parsedLd = JSON.parse(block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim());
        const items = Array.isArray(parsedLd) ? parsedLd : [parsedLd];
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
    const ogTitle  = get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i) || get(/<meta[^>]+content=["']([^"']{1,200})["'][^>]+property=["']og:title["']/i);
    const ogDesc   = get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,400})["']/i) || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+property=["']og:description["']/i);
    const metaDesc = get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,400})["']/i) || get(/<meta[^>]+content=["']([^"']{1,400})["'][^>]+name=["']description["']/i);
    const pageTitle= get(/<title[^>]*>([^<]{1,150})<\/title>/i);
    const keywords = get(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']{1,300})["']/i);
    const h1s      = (html.match(/<h1[^>]*>([^<]{2,150})<\/h1>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 2);
    const h2s      = (html.match(/<h2[^>]*>([^<]{2,150})<\/h2>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 8);

    const bodyText = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<nav[\s\S]*?<\/nav>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 3500);

    return new Response(JSON.stringify({
      success: true, source: 'direct',
      title:    pd.name     || ogTitle  || h1s[0] || pageTitle || '',
      description: pd.description || ogDesc || metaDesc || '',
      brand:    pd.brand    || '', price: pd.price || '', mrp: '', sku: pd.sku || '', category: pd.category || '',
      ingredients: '', keyIngredients: [], highlights: [],
      features: pd.features || [], howToUse: '', reviewRating: '', reviewCount: '',
      keywords, headings: h2s, bodyText,
      metaDesc: metaDesc || ogDesc || '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg.includes('abort') ? 'Timed out. Try pasting product details into Box 4 manually.' : `Could not fetch page. Try pasting the product details into Box 4 manually.` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
