import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CATEGORIES } from '../lib/blog-categories';

const SITE = 'https://www.thesecondspring.org';

// Static pages with their priority and change frequency
const staticPages = [
  { path: '/',                          changefreq: 'weekly',  priority: '0.9' },
  { path: '/spring',                    changefreq: 'weekly',  priority: '1.0' },
  { path: '/perimenopause',             changefreq: 'monthly', priority: '0.9' },
  { path: '/perimenopause-explained',   changefreq: 'monthly', priority: '0.8' },
  { path: '/menopause',                 changefreq: 'monthly', priority: '0.8' },
  { path: '/guide',                     changefreq: 'monthly', priority: '0.8' },
  { path: '/guide/symptoms',            changefreq: 'monthly', priority: '0.8' },
  { path: '/guide/topics',              changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/faqs',                changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/talk-to-doctor',      changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/sleep',               changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/mood-memory',         changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/hair-skin',           changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/sexual-wellness',     changefreq: 'monthly', priority: '0.7' },
  { path: '/guide/weight',              changefreq: 'monthly', priority: '0.7' },
  { path: '/quiz',                      changefreq: 'monthly', priority: '0.8' },
  { path: '/blog',                      changefreq: 'weekly',  priority: '0.8' },
  { path: '/community',                 changefreq: 'weekly',  priority: '0.7' },
  { path: '/how-it-works',              changefreq: 'monthly', priority: '0.7' },
  { path: '/team',                      changefreq: 'monthly', priority: '0.6' },
  { path: '/for-employers',             changefreq: 'monthly', priority: '0.6' },
  { path: '/events',                    changefreq: 'weekly',  priority: '0.6' },
  { path: '/contact',                   changefreq: 'yearly',  priority: '0.5' },
  { path: '/myths',                     changefreq: 'monthly', priority: '0.7' },
  { path: '/wind',                      changefreq: 'weekly',  priority: '1.0' },
  { path: '/wind/how-it-works',         changefreq: 'monthly', priority: '0.8' },
  { path: '/wind/quiz',                 changefreq: 'monthly', priority: '0.8' },
  { path: '/wind/guide',                changefreq: 'monthly', priority: '0.8' },
  { path: '/wind/guide/symptoms',       changefreq: 'monthly', priority: '0.7' },
  { path: '/wind/guide/energy',         changefreq: 'monthly', priority: '0.7' },
  { path: '/wind/guide/muscle',         changefreq: 'monthly', priority: '0.7' },
  { path: '/wind/guide/mood',           changefreq: 'monthly', priority: '0.7' },
  { path: '/wind/guide/sleep',          changefreq: 'monthly', priority: '0.7' },
  { path: '/wind/guide/sexual-health',  changefreq: 'monthly', priority: '0.7' },
  { path: '/wind/guide/talk-to-doctor', changefreq: 'monthly', priority: '0.7' },
  { path: '/wind/blog',                 changefreq: 'weekly',  priority: '0.8' },
  { path: '/longevity',                 changefreq: 'weekly',  priority: '1.0' },
  { path: '/longevity/blog',            changefreq: 'weekly',  priority: '0.8' },
  { path: '/longevity/guide',           changefreq: 'monthly', priority: '0.8' },
  { path: '/longevity/guide/food',          changefreq: 'monthly', priority: '0.7' },
  { path: '/longevity/guide/movement',      changefreq: 'monthly', priority: '0.7' },
  { path: '/longevity/guide/sleep-rhythm',  changefreq: 'monthly', priority: '0.7' },
  { path: '/longevity/guide/mind-stress',   changefreq: 'monthly', priority: '0.7' },
  { path: '/longevity/guide/ayurveda',      changefreq: 'monthly', priority: '0.7' },
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

  // Fetch all blog posts that are actually live (not scheduled for later)
  const now = new Date();
  const posts = (await getCollection('blog')).filter(p => p.data.pubDate <= now);
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

  // Blog category landing pages
  for (const cat of CATEGORIES) {
    xml += urlEntry(`${SITE}/blog/category/${cat.slug}`, {
      lastmod: today,
      changefreq: 'weekly',
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

  // Second Wind journal posts
  const windPosts = (await getCollection('wind-blog')).filter(p => p.data.pubDate <= now);
  for (const post of windPosts) {
    xml += urlEntry(`${SITE}/wind/blog/${post.slug}`, {
      lastmod: formatDate(post.data.pubDate),
      changefreq: 'yearly',
      priority: '0.7',
    });
  }

  // Longevity journal posts
  const longevityPosts = (await getCollection('longevity-blog')).filter(p => p.data.pubDate <= now);
  for (const post of longevityPosts) {
    xml += urlEntry(`${SITE}/longevity/blog/${post.slug}`, {
      lastmod: formatDate(post.data.pubDate),
      changefreq: 'yearly',
      priority: '0.7',
    });
  }

  // Community Q&A threads
  const community = await getCollection('community');
  for (const entry of community) {
    xml += urlEntry(`${SITE}/community/${entry.slug}`, {
      lastmod: formatDate(entry.data.date),
      changefreq: 'monthly',
      priority: '0.6',
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
