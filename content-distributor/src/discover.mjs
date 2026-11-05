/**
 * Finds article URLs on a site (from its sitemap or RSS/Atom feed) and
 * downloads the readable text of a page.
 */

const UA = 'content-distributor/0.1 (+personal content distribution)';

async function getText(url, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

const decode = (s) =>
  String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();

const tag = (block, name) => {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decode(m[1]) : '';
};

/** Parse a sitemap (or sitemap index) XML string into [{url, lastmod}]. */
export function parseSitemap(xml) {
  const entries = [];
  for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const url = tag(m[1], 'loc');
    if (url) entries.push({ url, lastmod: tag(m[1], 'lastmod') || null });
  }
  const children = [];
  for (const m of xml.matchAll(/<sitemap>([\s\S]*?)<\/sitemap>/gi)) {
    const loc = tag(m[1], 'loc');
    if (loc) children.push(loc);
  }
  return { entries, children };
}

/** Parse RSS 2.0 or Atom XML string into [{url, lastmod}]. */
export function parseFeed(xml) {
  const entries = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const url = tag(m[1], 'link');
    if (url) entries.push({ url, lastmod: tag(m[1], 'pubDate') || tag(m[1], 'dc:date') || null });
  }
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)) {
    const href = m[1].match(/<link[^>]*href="([^"]+)"/i);
    if (href) {
      entries.push({
        url: decode(href[1]),
        lastmod: tag(m[1], 'updated') || tag(m[1], 'published') || null,
      });
    }
  }
  return entries;
}

/** Return the site's article list, newest first when dates are available. */
export async function listArticles(site) {
  let entries = [];
  if (site.feed) {
    entries = parseFeed(await getText(site.feed));
  } else if (site.sitemap) {
    const root = parseSitemap(await getText(site.sitemap));
    entries = root.entries;
    for (const child of root.children.slice(0, 10)) {
      try {
        entries.push(...parseSitemap(await getText(child)).entries);
      } catch (e) {
        console.warn(`  (skipped child sitemap ${child}: ${e.message})`);
      }
    }
  } else {
    throw new Error(`Site "${site.id}" needs a "sitemap" or "feed" in config.json`);
  }

  const paths = site.only_paths || [];
  const siteHost = new URL(site.sitemap || site.feed).host;
  entries = entries.filter((e) => {
    let u;
    try {
      u = new URL(e.url);
    } catch {
      return false;
    }
    if (u.host !== siteHost) return false;
    if (u.pathname === '/' || u.pathname === '') return false;
    return paths.length === 0 || paths.some((p) => u.pathname.startsWith(p));
  });

  // Newest first. Entries without dates keep sitemap order, reversed
  // (sitemaps usually list oldest first).
  const dated = entries.filter((e) => e.lastmod && !Number.isNaN(Date.parse(e.lastmod)));
  if (dated.length === entries.length && entries.length > 0) {
    entries.sort((a, b) => Date.parse(b.lastmod) - Date.parse(a.lastmod));
  } else {
    entries.reverse();
  }
  // Remove duplicates, keep order.
  const seen = new Set();
  return entries.filter((e) => (seen.has(e.url) ? false : seen.add(e.url)));
}

const stripTags = (html) =>
  decode(
    String(html)
      .replace(/<(script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ');

const meta = (html, key) => {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
    'i'
  );
  const m = html.match(re);
  return m ? decode(m[1] || m[2] || '') : '';
};

/** Download a page and extract title, description and readable body text. */
export async function fetchArticle(url) {
  const html = await getText(url);
  const title =
    meta(html, 'og:title') || decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const description = meta(html, 'og:description') || meta(html, 'description');
  const container =
    (html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  const text = stripTags(container).slice(0, 9000);
  return { url, title, description, text };
}
