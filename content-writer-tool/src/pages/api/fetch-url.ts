import type { APIRoute } from 'astro';

// ── Strip HTML tags from a string ────────────────────────────────────────────
function stripHtml(s: string): string {
  return s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s{2,}/g, ' ').trim();
}

// ── Full recursive deep find (string/number) ─────────────────────────────────
function deepFind(obj: unknown, keys: string[], depth = 0): string {
  if (!obj || typeof obj !== 'object' || depth > 6) return '';
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = deepFind(item, keys, depth + 1);
      if (r) return r;
    }
    return '';
  }
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in o) {
      const v = o[k];
      if (typeof v === 'string' && v.trim().length > 0) return stripHtml(v.trim());
      if (typeof v === 'number' && v > 0) return String(v);
    }
  }
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object') {
      const r = deepFind(v, keys, depth + 1);
      if (r) return r;
    }
  }
  return '';
}

// ── Full recursive deep find for arrays of strings ───────────────────────────
function deepFindArray(obj: unknown, keys: string[], depth = 0): string[] {
  if (!obj || typeof obj !== 'object' || depth > 6) return [];
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = deepFindArray(item, keys, depth + 1);
      if (r.length) return r;
    }
    return [];
  }
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    if (k in o && Array.isArray(o[k])) {
      const arr = o[k] as unknown[];
      if (!arr.length) continue;
      const flat = arr.map(item => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object' && item !== null) {
          const i = item as Record<string, unknown>;
          return (i.name || i.value || i.text || i.title || i.label || i.displayName || '')?.toString().trim() || '';
        }
        return String(item);
      }).filter(s => s.length > 1);
      if (flat.length) return flat;
    }
  }
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object') {
      const r = deepFindArray(v, keys, depth + 1);
      if (r.length) return r;
    }
  }
  return [];
}

// ── Key-value pair array extraction ─────────────────────────────────────────
// Handles patterns like: [{key:"Ingredients",value:"..."}, {heading:"How To Use",content:"..."}]
function extractFromKVArray(arr: unknown[], targetKeyPatterns: string[]): string {
  if (!Array.isArray(arr)) return '';
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    // key field: key, heading, name, label, title, type, tab
    const keyField = (o.key || o.heading || o.name || o.label || o.title || o.type || o.tab || '').toString().toLowerCase().replace(/\s+/g, '');
    // value field: value, content, description, text, body, html, data
    const valField = (o.value || o.content || o.description || o.text || o.body || o.html || o.data || '').toString().trim();
    if (!keyField || !valField || valField.length < 3) continue;
    if (targetKeyPatterns.some(p => keyField.includes(p.replace(/\s+/g, '')))) {
      return stripHtml(valField);
    }
  }
  return '';
}

// ── Recursively find any KV-pair array and extract from it ───────────────────
function deepExtractKV(obj: unknown, targetKeyPatterns: string[], depth = 0): string {
  if (!obj || typeof obj !== 'object' || depth > 6) return '';
  if (Array.isArray(obj)) {
    // Try this array directly as a KV array
    const r = extractFromKVArray(obj, targetKeyPatterns);
    if (r) return r;
    // Recurse into items
    for (const item of obj) {
      const r2 = deepExtractKV(item, targetKeyPatterns, depth + 1);
      if (r2) return r2;
    }
    return '';
  }
  const o = obj as Record<string, unknown>;
  for (const v of Object.values(o)) {
    if (Array.isArray(v)) {
      const r = extractFromKVArray(v, targetKeyPatterns);
      if (r) return r;
    }
    if (v && typeof v === 'object') {
      const r = deepExtractKV(v, targetKeyPatterns, depth + 1);
      if (r) return r;
    }
  }
  return '';
}

// ── Same as deepExtractKV but collects all items from matching arrays ─────────
function deepExtractKVArray(obj: unknown, targetKeyPatterns: string[], depth = 0): string[] {
  if (!obj || typeof obj !== 'object' || depth > 6) return [];
  if (Array.isArray(obj)) {
    const r = extractFromKVArray(obj, targetKeyPatterns);
    if (r) return [r];
    for (const item of obj) {
      const r2 = deepExtractKVArray(item, targetKeyPatterns, depth + 1);
      if (r2.length) return r2;
    }
    return [];
  }
  const o = obj as Record<string, unknown>;
  for (const v of Object.values(o)) {
    if (Array.isArray(v)) {
      const r = extractFromKVArray(v, targetKeyPatterns);
      if (r) return [r];
    }
    if (v && typeof v === 'object') {
      const r2 = deepExtractKVArray(v, targetKeyPatterns, depth + 1);
      if (r2.length) return r2;
    }
  }
  return [];
}

// ── Extract all KV pair headings from tabs/productDetails arrays ──────────────
function extractAllKVSections(obj: unknown, depth = 0): Array<{key: string; value: string}> {
  if (!obj || typeof obj !== 'object' || depth > 6) return [];
  const results: Array<{key: string; value: string}> = [];
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const o = item as Record<string, unknown>;
        const keyField = (o.key || o.heading || o.tab || o.label || o.type || '').toString().trim();
        const valField = (o.value || o.content || o.description || o.text || o.body || o.html || '').toString().trim();
        if (keyField && valField && valField.length > 10) {
          results.push({ key: keyField, value: stripHtml(valField) });
        }
      }
    }
    if (results.length > 1) return results; // found a valid KV array
    for (const item of obj) {
      const r = extractAllKVSections(item, depth + 1);
      if (r.length > 1) return r;
    }
  } else {
    const o = obj as Record<string, unknown>;
    for (const [, v] of Object.entries(o)) {
      if (Array.isArray(v)) {
        const r = extractAllKVSections(v, depth + 1);
        if (r.length > 1) return r;
      } else if (v && typeof v === 'object') {
        const r = extractAllKVSections(v, depth + 1);
        if (r.length > 1) return r;
      }
    }
  }
  return results;
}

// ── Extract review summary ────────────────────────────────────────────────────
interface ReviewSummary {
  rating: string; count: string; pros: string[]; cons: string[]; topReviews: string[];
}
function extractReviews(obj: unknown, depth = 0): ReviewSummary {
  const result: ReviewSummary = { rating: '', count: '', pros: [], cons: [], topReviews: [] };
  if (!obj || typeof obj !== 'object' || depth > 6) return result;

  result.rating = result.rating || deepFind(obj, ['rating', 'averageRating', 'average_rating', 'avgRating', 'ratingValue', 'stars', 'overallRating']);
  result.count  = result.count  || deepFind(obj, ['reviewCount', 'review_count', 'totalReviews', 'total_reviews', 'ratingsCount', 'noOfRatings', 'numRatings', 'ratingCount']);
  result.pros   = result.pros.length   ? result.pros   : deepFindArray(obj, ['pros', 'positiveTags', 'positive_tags', 'liked', 'goodPoints', 'likedAspects']);
  result.cons   = result.cons.length   ? result.cons   : deepFindArray(obj, ['cons', 'negativeTags', 'negative_tags', 'disliked', 'badPoints', 'dislikedAspects']);

  // Top review texts
  const reviewArr = deepFindArray(obj, ['reviews', 'reviewList', 'review_list', 'reviewItems', 'topReviews', 'customerReviews']);
  if (reviewArr.length) result.topReviews = reviewArr.slice(0, 3);

  return result;
}

// ── Parse any e-commerce JSON blob ───────────────────────────────────────────
interface ParsedProduct {
  title: string; brand: string; price: string; mrp: string; sku: string;
  category: string; description: string; ingredients: string;
  highlights: string[]; features: string[]; keyIngredients: string[];
  howToUse: string; reviewRating: string; reviewCount: string;
  reviewPros: string[]; reviewCons: string[]; topReviews: string[];
  allSections: Array<{key: string; value: string}>;
  bodyText: string;
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

  const title = deepFind(data, ['title', 'name', 'productName', 'product_name', 'displayName', 'display_name', 'productTitle', 'itemName']);
  if (!title) return null;

  const brand    = deepFind(data, ['brandName', 'brand_name', 'brand', 'manufacturer', 'manufacturerName', 'brandDisplayName', 'vendorName']);
  const price    = deepFind(data, ['price', 'sellingPrice', 'selling_price', 'salePrice', 'sale_price', 'discountedPrice', 'offerPrice', 'offer_price', 'sp', 'finalPrice']);
  const mrp      = deepFind(data, ['mrp', 'MRP', 'originalPrice', 'original_price', 'listPrice', 'maxPrice', 'max_price', 'regularPrice', 'basePrice', 'strikeThroughPrice']);
  const sku      = deepFind(data, ['sku', 'SKU', 'productId', 'product_id', 'productCode', 'product_code', 'itemId', 'id', 'variantId']);
  const category = deepFind(data, ['category', 'categoryName', 'category_name', 'primaryCategory', 'categoryPath', 'breadcrumb', 'subcategory']);

  // Description — standard fields
  let description = deepFind(data, [
    'description', 'shortDescription', 'short_description', 'productDescription',
    'product_description', 'longDescription', 'long_description', 'summary', 'overview', 'about',
    'productOverview', 'productInfo', 'aboutProduct', 'productSummary',
  ]);
  // Description — from KV arrays (tabs, productDetails, etc.)
  if (!description) description = deepExtractKV(data, ['description', 'about', 'overview', 'summary', 'productinfo', 'productoverview', 'details']);

  // Ingredients — standard fields + KV arrays
  let ingredients = deepFind(data, [
    'ingredients', 'keyIngredients', 'key_ingredients', 'ingredientsList', 'ingredients_list',
    'formula', 'composition', 'activeIngredients', 'active_ingredients', 'ingredientsInfo',
    'productIngredients', 'fullIngredients', 'allIngredients', 'inciList',
  ]);
  if (!ingredients) ingredients = deepExtractKV(data, ['ingredient', 'composition', 'formula', 'incilist', 'fullformula']);

  // Key ingredients (chips) — standard + KV
  let keyIngredients = deepFindArray(data, ['keyIngredients', 'key_ingredients', 'activeIngredients', 'heroIngredients', 'starIngredients', 'benefitIngredients']);
  if (!keyIngredients.length) {
    const kvResult = deepExtractKV(data, ['keyingredient', 'heroingredient', 'staringredient']);
    if (kvResult) keyIngredients = kvResult.split(/[,;|•\n]+/).map(s => s.trim()).filter(s => s.length > 1);
  }

  // How to use — standard + KV
  let howToUse = deepFind(data, [
    'howToUse', 'how_to_use', 'usage', 'directions', 'application', 'instructions',
    'usageInstructions', 'usage_instructions', 'steps', 'applicationMethod', 'directionForUse',
    'howToApply', 'howtouse', 'applicationSteps',
  ]);
  if (!howToUse) howToUse = deepExtractKV(data, ['howtouse', 'howtoapply', 'usage', 'directions', 'application', 'instructions', 'steps']);

  // Highlights / benefits — standard + KV
  let highlights = deepFindArray(data, [
    'highlights', 'keyHighlights', 'key_highlights', 'keyBenefits', 'key_benefits',
    'bulletPoints', 'bullet_points', 'usps', 'USPs', 'productHighlights',
    'claims', 'benefits', 'sellingPoints', 'topHighlights',
  ]);
  if (!highlights.length) {
    const kvResult = deepExtractKV(data, ['highlight', 'benefit', 'usp', 'sellingpoint', 'claim', 'feature']);
    if (kvResult) highlights = kvResult.split(/[\n•]+/).map(s => s.trim()).filter(s => s.length > 2).slice(0, 12);
  }

  // Features / specs
  const features = deepFindArray(data, ['features', 'featureList', 'feature_list', 'specifications', 'specs', 'productDetails', 'product_details', 'attributes', 'productAttributes']);

  // Reviews
  const reviews = extractReviews(data);

  // ── All tabs/sections (catch-all for anything we missed) ──────────────────
  const allSections = extractAllKVSections(data);

  // For sections we didn't find above, try to extract from allSections
  if (!description && allSections.length) {
    const s = allSections.find(s => /description|about|overview|summary/i.test(s.key));
    if (s) description = s.value;
  }
  if (!ingredients && allSections.length) {
    const s = allSections.find(s => /ingredient/i.test(s.key));
    if (s) ingredients = s.value;
  }
  if (!howToUse && allSections.length) {
    const s = allSections.find(s => /how.?to|usage|direction|application|instruction/i.test(s.key));
    if (s) howToUse = s.value;
  }
  if (!highlights.length && allSections.length) {
    const s = allSections.find(s => /highlight|benefit|feature|usp/i.test(s.key));
    if (s) highlights = s.value.split(/[\n•]+/).map(x => x.trim()).filter(x => x.length > 2).slice(0, 10);
  }

  // ── Build human-readable body text ───────────────────────────────────────
  const lines: string[] = [];
  if (title)        lines.push(`Product: ${title}`);
  if (brand)        lines.push(`Brand: ${brand}`);
  if (price)        lines.push(`Price: ₹${price}`);
  if (mrp && mrp !== price) lines.push(`MRP: ₹${mrp}`);
  if (category)     lines.push(`Category: ${category}`);
  if (sku)          lines.push(`ID/SKU: ${sku}`);
  if (reviews.rating) lines.push(`Rating: ${reviews.rating}★${reviews.count ? ` from ${reviews.count} reviews` : ''}`);
  if (reviews.pros.length)   lines.push(`What customers like: ${reviews.pros.join(', ')}`);
  if (reviews.cons.length)   lines.push(`Common concerns: ${reviews.cons.join(', ')}`);
  if (reviews.topReviews.length) lines.push(`\nCustomer Review Highlights:\n- ${reviews.topReviews.join('\n- ')}`);
  if (description)  lines.push(`\nDescription:\n${description.slice(0, 800)}`);
  if (keyIngredients.length) lines.push(`\nKey Ingredients: ${keyIngredients.join(', ')}`);
  if (ingredients)  lines.push(`\nIngredients: ${ingredients.slice(0, 700)}`);
  if (highlights.length)    lines.push(`\nHighlights / Benefits:\n- ${highlights.slice(0, 12).join('\n- ')}`);
  if (features.length)      lines.push(`\nFeatures:\n- ${features.slice(0, 10).join('\n- ')}`);
  if (howToUse)             lines.push(`\nHow to Use:\n${howToUse.slice(0, 600)}`);
  // Catch-all: include any other tab sections we haven't already covered
  for (const s of allSections) {
    const covered = /ingredient|how.?to|usage|direction|application|description|about|overview|highlight|benefit|feature|usp/i.test(s.key);
    if (!covered && s.value.length > 20) lines.push(`\n${s.key}:\n${s.value.slice(0, 400)}`);
  }

  return {
    title, brand, price, mrp, sku, category, description,
    ingredients, highlights, features, keyIngredients, howToUse,
    reviewRating: reviews.rating, reviewCount: reviews.count,
    reviewPros: reviews.pros, reviewCons: reviews.cons, topReviews: reviews.topReviews,
    allSections,
    bodyText: lines.join('\n').slice(0, 5000),
  };
}

// ── Try to find a JSON blob inside text ──────────────────────────────────────
function tryExtractJson(text: string): string | null {
  const match = text.match(/(\{[\s\S]{100,}\})/);
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

  // ── Strategy 1: Jina AI Reader ────────────────────────────────────────────
  try {
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), 22000);
    const jinaRes = await fetch(`https://r.jina.ai/${cleanUrl}`, {
      signal: ctrl1.signal,
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'markdown',
        'X-Timeout': '18',
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

      // Detect JSON in Jina response
      const trimmed = markdownContent.trim();
      const jsonRaw = (trimmed.startsWith('{') || trimmed.startsWith('[')) ? trimmed : tryExtractJson(markdownContent);

      if (jsonRaw) {
        const product = parseEcommerceJson(jsonRaw);
        if (product) {
          return new Response(JSON.stringify({
            success: true, source: 'jina-json',
            title: product.title, brand: product.brand,
            price: product.price || product.mrp, mrp: product.mrp,
            sku: product.sku, category: product.category,
            description: product.description, ingredients: product.ingredients,
            keyIngredients: product.keyIngredients, highlights: product.highlights,
            features: product.features, howToUse: product.howToUse,
            reviewRating: product.reviewRating, reviewCount: product.reviewCount,
            reviewPros: product.reviewPros, reviewCons: product.reviewCons,
            topReviews: product.topReviews, allSections: product.allSections,
            headings: [], keywords: '',
            bodyText: product.bodyText, metaDesc: product.description.slice(0, 160),
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      // Regular markdown page — extract sections from headings
      const h2s = (markdownContent.match(/^## (.+)$/gm) || []).map(h => h.replace(/^## /, '').trim()).filter(Boolean).slice(0, 8);

      // Extract ingredient / how-to-use sections from markdown headings
      let ingredients = '', howToUse = '', highlights: string[] = [];
      const sections = markdownContent.split(/^#{1,3} /m);
      for (const sec of sections) {
        const heading = sec.split('\n')[0].trim().toLowerCase();
        const content = sec.split('\n').slice(1).join('\n').replace(/[*_`~]/g, '').trim();
        if (!content || content.length < 5) continue;
        if (/ingredient/.test(heading) && !ingredients) ingredients = content.slice(0, 700);
        if (/how.?to|usage|direction|application/.test(heading) && !howToUse) howToUse = content.slice(0, 600);
        if (/highlight|benefit|feature|usp/.test(heading) && !highlights.length) {
          highlights = content.split('\n').map(l => l.replace(/^[-*•\d.]+\s*/, '').trim()).filter(l => l.length > 2).slice(0, 10);
        }
      }

      const bodyText = markdownContent
        .replace(/!\[.*?\]\(.*?\)/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/#{1,6}\s/g, '').replace(/[*_`~]/g, '')
        .replace(/\n{3,}/g, '\n\n').trim().slice(0, 4000);

      return new Response(JSON.stringify({
        success: true, source: 'jina',
        title: jinaTitle || '', brand: '', price: '', mrp: '', sku: '', category: '',
        description: bodyText.slice(0, 400),
        ingredients, keyIngredients: [], highlights, features: [],
        howToUse, reviewRating: '', reviewCount: '',
        reviewPros: [], reviewCons: [], topReviews: [], allSections: [],
        headings: h2s, keywords: '', bodyText,
        metaDesc: bodyText.slice(0, 160),
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch { /* fall through */ }

  // ── Strategy 2: Direct fetch ──────────────────────────────────────────────
  try {
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 12000);
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
      return new Response(JSON.stringify({ error: `Page returned ${directRes.status}. Paste product details into Box 4 manually.` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const contentType = directRes.headers.get('content-type') || '';
    const rawText = await directRes.text();

    if (contentType.includes('application/json') || rawText.trim().startsWith('{')) {
      const product = parseEcommerceJson(rawText);
      if (product) {
        return new Response(JSON.stringify({
          success: true, source: 'direct-json',
          title: product.title, brand: product.brand,
          price: product.price || product.mrp, mrp: product.mrp,
          sku: product.sku, category: product.category,
          description: product.description, ingredients: product.ingredients,
          keyIngredients: product.keyIngredients, highlights: product.highlights,
          features: product.features, howToUse: product.howToUse,
          reviewRating: product.reviewRating, reviewCount: product.reviewCount,
          reviewPros: product.reviewPros, reviewCons: product.reviewCons,
          topReviews: product.topReviews, allSections: product.allSections,
          headings: [], keywords: '',
          bodyText: product.bodyText, metaDesc: product.description.slice(0, 160),
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
        const pl = JSON.parse(block.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim());
        const items = Array.isArray(pl) ? pl : [pl];
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
    const bodyText  = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<nav[\s\S]*?<\/nav>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 4000);

    return new Response(JSON.stringify({
      success: true, source: 'direct',
      title:    pd.name || ogTitle || h1s[0] || pageTitle || '',
      description: pd.description || ogDesc || metaDesc || '',
      brand:    pd.brand || '', price: pd.price || '', mrp: '', sku: pd.sku || '', category: pd.category || '',
      ingredients: '', keyIngredients: [], highlights: [],
      features: pd.features || [], howToUse: '', reviewRating: '', reviewCount: '',
      reviewPros: [], reviewCons: [], topReviews: [], allSections: [],
      keywords, headings: h2s, bodyText, metaDesc: metaDesc || ogDesc || '',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg.includes('abort') ? 'Timed out fetching page. Paste product details into Box 4 manually.' : `Could not fetch page. Paste the product details into Box 4 manually.` }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
