import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://www.thesecondspring.org';
const PUBLICATION_NAME = 'The Second Spring';
const LANGUAGE = 'en';

// Google News only wants articles published in roughly the last 48 hours.
const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function newsUrlEntry(loc: string, pubDate: Date, title: string): string {
  return `
  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${PUBLICATION_NAME}</news:name>
        <news:language>${LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate.toISOString()}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
    </news:news>
  </url>`;
}

export const GET: APIRoute = async () => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - NEWS_WINDOW_MS);

  const isRecentAndLive = (pubDate: Date) => pubDate <= now && pubDate >= cutoff;

  const women = (await getCollection('blog'))
    .filter(p => isRecentAndLive(p.data.pubDate))
    .map(p => ({ loc: `${SITE}/blog/${p.slug}`, pubDate: p.data.pubDate, title: p.data.title }));

  const men = (await getCollection('wind-blog'))
    .filter(p => isRecentAndLive(p.data.pubDate))
    .map(p => ({ loc: `${SITE}/wind/blog/${p.slug}`, pubDate: p.data.pubDate, title: p.data.title }));

  const longevity = (await getCollection('longevity-blog'))
    .filter(p => isRecentAndLive(p.data.pubDate))
    .map(p => ({ loc: `${SITE}/longevity/blog/${p.slug}`, pubDate: p.data.pubDate, title: p.data.title }));

  const entries = [...women, ...men, ...longevity].sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  for (const entry of entries) {
    xml += newsUrlEntry(entry.loc, new Date(entry.pubDate), entry.title);
  }

  xml += `\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800', // 30 min, news content is time-sensitive
    },
  });
};
