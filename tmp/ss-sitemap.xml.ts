import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://www.thesecondspring.org';

// Static pages with their priority and change frequency
const staticPages = [
  { path: '/',                          changefreq: 'weekly',  priority: '1.0' },
  { path: '/perimenopause',             changefreq: 'monthly', priority: '0.9' },
  { path: '/perimenopause-explained',   changefreq: 'monthly', priority: '0.8' },
  { path: '/guide',                     changefreq: 'monthly', priority: '0.8' },
  { path: '/guide/symptoms',            changefreq: 'monthly', priority: '0.8' },
  { path: '/guide/topics',              changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/faqs',                changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/talk-to-doctor',      changefreq: 'monthly', priority: '0.7' },
  { path: '/quiz',                      changefreq: 'monthly', priority: '0.8' },
  { path: '/chat',                      changefreq: 'monthly', priority: '0.8' },
  { path: '/blog',                      changefreq: 'weekly',  priority: '0.8' },
  { path: '/how-it-works',              changefreq: 'monthly', priority: '0.7' },
  { path: '/team',                      changefreq: 'monthly', priority: '0.6' },
  { path: '/for-employers',             changefreq: 'monthly', priority: '0.6' },
  { path: '/events',                    changefreq: 'weekly',  priority: '0.6' },
  { path: '/contact',                   changefreq: 'yearly',  priority: '0.5' },
];

// Individual symptom pages
const symptomSlugs = [
  'mood-swings',
  'sleep-problems',
  'hot-flashes',
  'brain-fog',
  'irregular-periods',
  'anxiety',
  'joint-pain',
  'low-libido',
  'skin-hair',
  'heart-palpitations',
];

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

function urlEntry(
  loc: string,
  opts: { lastmod?: string; changefreq?: string; priority?: string } = {}
): string {
  return `
  <url>
    <loc>${loc}</loc>${opts.lastmod ? `\n    <lastmod>${opts.lastmod}</lastmod>` : ''}${opts.changefreq ? `\n    <changefreq>${opts.changefreq}</changefreq>` : ''}${opts.priority ? `\n    <priority>${opts.priority}</priority>` : ''}
  </url>`;
}

export const GET: APIRoute = async () => {
  const today = formatDate(new Date());

  // Fetch all blog posts
  const posts = await getCollection('blog');
  posts.sort((a, b) =>
    new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime()
  );

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

  // Static pages
  for (const page of staticPages) {
    xml += urlEntry(`${SITE}${page.path}`, {
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // Individual symptom pages
  for (const slug of symptomSlugs) {
    xml += urlEntry(`${SITE}/guide/symptoms/${slug}`, {
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  // Journal / blog posts
  for (const post of posts) {
    xml += urlEntry(`${SITE}/blog/${post.slug}`, {
      lastmod: formatDate(post.data.pubDate),
      changefreq: 'yearly',
      priority: '0.7',
    });
  }

  xml += `\n</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // cache for 1 hour
    },
  });
};
