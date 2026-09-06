// Cross-vertical "related articles" matching, shared by all three blog slug
// templates (women's /blog, men's /wind/blog, longevity's /longevity/blog).
// Keeps same-vertical matches first (closer topical fit is more likely there),
// then fills remaining slots with cross-vertical matches on overlapping tags,
// since many midlife-health themes (sleep, stress, weight, brain fog, mood,
// libido) genuinely span all three verticals.

export type Vertical = 'women' | 'men' | 'longevity';

export const VERTICAL_META: Record<Vertical, { base: string; label: string }> = {
  women: { base: '/blog', label: 'Her Midlife' },
  men: { base: '/wind/blog', label: 'His Midlife' },
  longevity: { base: '/longevity/blog', label: 'Life Begins After 40' },
};

export interface RelatedCandidate {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  readTime: string;
  author: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  vertical: Vertical;
  url: string;
  sameVertical: boolean;
  score: number;
}

interface EntryLike {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    readTime: string;
    author: string;
    tags: string[];
    image?: string;
    imageAlt?: string;
  };
}

function norm(s: string): string {
  return s.toLowerCase().trim();
}

/** Score how related two tag lists are. Exact match scores higher than a fuzzy substring match. */
function tagOverlapScore(currentTags: string[], otherTags: string[]): number {
  const currentSet = new Set(currentTags.map(norm));
  let score = 0;
  for (const raw of otherTags) {
    const t = norm(raw);
    if (currentSet.has(t)) {
      score += 2;
    } else if ([...currentSet].some((c) => c.length > 3 && (c.includes(t) || t.includes(c)))) {
      score += 1;
    }
  }
  return score;
}

/**
 * Find related posts across all three verticals.
 * `collections` maps each vertical to its already-fetched, already-rendered-eligible
 * (pubDate <= now) post entries. `current` is the post currently being viewed.
 */
export function findRelated(
  current: EntryLike,
  currentVertical: Vertical,
  collections: Record<Vertical, EntryLike[]>,
  max = 3,
): RelatedCandidate[] {
  const all: RelatedCandidate[] = [];

  (Object.keys(collections) as Vertical[]).forEach((vertical) => {
    for (const p of collections[vertical]) {
      if (vertical === currentVertical && p.slug === current.slug) continue;
      const score = tagOverlapScore(current.data.tags, p.data.tags);
      if (score <= 0) continue;
      all.push({
        slug: p.slug,
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        readTime: p.data.readTime,
        author: p.data.author,
        tags: p.data.tags,
        image: p.data.image,
        imageAlt: p.data.imageAlt,
        vertical,
        url: `${VERTICAL_META[vertical].base}/${p.slug}`,
        sameVertical: vertical === currentVertical,
        score,
      });
    }
  });

  all.sort((a, b) => {
    if (a.sameVertical !== b.sameVertical) return a.sameVertical ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return b.pubDate.valueOf() - a.pubDate.valueOf();
  });

  return all.slice(0, max);
}
