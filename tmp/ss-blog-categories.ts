// Shared blog category definitions — used by the Journal index (/blog) and the
// category landing pages (/blog/category/[category]). Keeping this in one place
// ensures the "See all" links and the category pages always agree.

export interface BlogCategory {
  slug: string;
  label: string;
  icon: string;
  desc: string;
  tags: string[];
}

export const CATEGORIES: BlogCategory[] = [
  {
    slug: 'natural-remedies',
    label: 'Natural Remedies',
    icon: '🌿',
    desc: 'Evidence-based lifestyle and natural approaches to managing perimenopause symptoms.',
    tags: ['natural remedies', 'lifestyle', 'supplements'],
  },
  {
    slug: 'symptoms',
    label: 'Symptoms Explained',
    icon: '🔬',
    desc: 'Deep dives into individual perimenopause symptoms — what causes them and what to do.',
    tags: [
      'symptoms', 'breast pain', 'hair loss', 'fibroids', 'spotting',
      'water retention', 'libido', 'hot flashes', 'fatigue', 'brain fog',
      'allergy', 'immune system', 'histamine', 'skin', 'flushing', 'rosacea',
      'vasomotor', 'mastalgia', 'nipple pain', 'breast',
    ],
  },
  {
    slug: 'body-pain',
    label: 'Body & Pain',
    icon: '🦴',
    desc: 'Joint pain, hip pain, abdominal cramps, ear pain — how oestrogen affects every part of the body.',
    tags: [
      'joint pain', 'hip pain', 'ear pain', 'abdominal pain', 'pelvic pain',
      'back pain', 'inflammation', 'musculoskeletal', 'TMJ', 'tinnitus',
      'arthralgia', 'bloating', 'gut', 'cramps', 'ovulation pain', 'mittelschmerz',
      'muscle aches',
    ],
  },
  {
    slug: 'cycles-bleeding',
    label: 'Cycles & Bleeding',
    icon: '🩸',
    desc: 'Heavy periods, irregular cycles, spotting, ovulation changes — navigating the shift.',
    tags: [
      'cycles', 'bleeding', 'ovulation', 'spotting', 'anovulation',
      'blood clots', 'heavy periods', 'blood sugar', 'hunger', 'perimenopause basics',
      'fertility', 'contraception',
    ],
  },
  {
    slug: 'sexual-intimate-health',
    label: 'Sexual & Intimate Health',
    icon: '💛',
    desc: 'Vaginal dryness, painful sex, libido, and intimacy — practical, honest answers.',
    tags: [
      'vaginal dryness', 'gsm', 'sexual health', 'intimacy', 'libido',
      'urinary symptoms', 'nipple pain', 'breast',
    ],
  },
  {
    slug: 'mental-health',
    label: 'Mental Health & Mood',
    icon: '🧠',
    desc: 'Mood swings, anxiety, depression, and brain fog — understanding the hormonal brain.',
    tags: ['mental health', 'depression', 'anxiety', 'mood swings', 'brain fog', 'mood'],
  },
  {
    slug: 'understanding',
    label: 'Understanding Perimenopause',
    icon: '📖',
    desc: 'What perimenopause is, when it starts, how to recognise it, and what to expect.',
    tags: [
      'basics', 'india', 'signs', 'hormones', 'oestrogen', 'progesterone',
      'perimenopause basics', 'ovulation', 'fertility', 'contraception',
    ],
  },
  {
    slug: 'life',
    label: 'Life with Perimenopause',
    icon: '💼',
    desc: 'Relationships, work, pregnancy questions, and navigating Indian life during perimenopause.',
    tags: [
      'working women', 'relationships', 'pregnancy', 'when to see doctor', 'community',
      'sexual health', 'intimacy',
    ],
  },
];

export function getCategory(slug: string): BlogCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Does a post (its tags) belong to the given category? */
export function postInCategory(postTags: string[] | undefined, cat: BlogCategory): boolean {
  if (!Array.isArray(postTags)) return false;
  return postTags.some((t) => cat.tags.includes(t.toLowerCase()));
}

/** All posts in a category (caller passes already-sorted posts). */
export function postsForCategory<T extends { data: { tags?: string[] } }>(
  posts: T[],
  cat: BlogCategory,
): T[] {
  return posts.filter((p) => postInCategory(p.data.tags, cat));
}

export const POSTS_PER_PAGE = 10;
