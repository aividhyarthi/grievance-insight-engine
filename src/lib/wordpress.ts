const WP_API_BASE = 'https://blog.rudrakasturi.com/wp-json/wp/v2';

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  categories: number[];
  tags: number[];
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>;
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export async function getPosts(page = 1, perPage = 20): Promise<{ posts: WPPost[]; totalPages: number }> {
  const res = await fetch(
    `${WP_API_BASE}/posts?page=${page}&per_page=${perPage}&_embed=true`,
  );

  if (!res.ok) {
    throw new Error(`WordPress API error: ${res.status}`);
  }

  const posts: WPPost[] = await res.json();
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);

  return { posts, totalPages };
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(
    `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed=true`,
  );

  if (!res.ok) {
    throw new Error(`WordPress API error: ${res.status}`);
  }

  const posts: WPPost[] = await res.json();
  return posts[0] || null;
}

export async function getCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${WP_API_BASE}/categories?per_page=50`);

  if (!res.ok) {
    throw new Error(`WordPress API error: ${res.status}`);
  }

  return res.json();
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getFirstTag(post: WPPost): string | null {
  const terms = post._embedded?.['wp:term'];
  if (terms && terms[1] && terms[1][0]) {
    return terms[1][0].name;
  }
  if (terms && terms[0] && terms[0][0]) {
    return terms[0][0].name;
  }
  return null;
}

export function getFeaturedImage(post: WPPost): string | null {
  const media = post._embedded?.['wp:featuredmedia'];
  if (media && media[0]) {
    return media[0].source_url;
  }
  return null;
}
