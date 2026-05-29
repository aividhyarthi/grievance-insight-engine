/**
 * Pull recent AI-related headlines (all sectors + government/policy) from
 * Google News RSS — no API key required. Returns a compact, de-duplicated
 * list of "Headline — Source" lines from the last few days, or '' on failure.
 *
 * Configured via config.news.queries (search terms) and config.news.max_items.
 */

const stripTags = (s) =>
  String(s)
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function parseItems(xml) {
  const items = [];
  const blocks = xml.split(/<item>/i).slice(1);
  for (const b of blocks) {
    const title = stripTags((b.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const pub = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
    const source = stripTags((b.match(/<source[^>]*>([\s\S]*?)<\/source>/i) || [])[1] || '');
    if (title) items.push({ title, ts: pub ? Date.parse(pub) : NaN, source });
  }
  return items;
}

async function fetchFeed(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; x-growth-engine/0.1)' },
    });
    clearTimeout(t);
    if (!res.ok) return [];
    return parseItems(await res.text());
  } catch {
    clearTimeout(t);
    return [];
  }
}

export async function fetchNews(config) {
  const news = config.news;
  if (!news?.queries?.length) return '';
  const maxItems = news.max_items ?? 12;
  const maxAgeDays = news.max_age_days ?? 4;
  const cutoff = Date.now() - maxAgeDays * 86400_000;

  const all = (await Promise.all(news.queries.map(fetchFeed))).flat();

  // Keep recent items (or items with no parseable date), de-dupe by headline.
  const seen = new Set();
  const picked = [];
  for (const it of all.sort((a, b) => (b.ts || 0) - (a.ts || 0))) {
    if (!Number.isNaN(it.ts) && it.ts < cutoff) continue;
    const key = it.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    // Google News titles already end with "- Source"; only append if missing.
    const hasSource = it.source && it.title.includes(it.source);
    picked.push(hasSource || !it.source ? it.title : `${it.title} — ${it.source}`);
    if (picked.length >= maxItems) break;
  }
  return picked.map((h) => `- ${h}`).join('\n');
}
