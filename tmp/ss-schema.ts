// Centralised JSON-LD structured-data helpers for Her Midlife.
// Every builder returns a plain schema.org node (no @context). The Layout
// collects the global nodes + any page-specific nodes into a single @graph.

export const SITE_URL = 'https://www.thesecondspring.org';
export const SITE_NAME = 'Her Midlife';
export const SITE_LOGO = `${SITE_URL}/favicon.svg`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

/** Turn a path or absolute URL into an absolute URL on the canonical domain. */
export function abs(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Strip HTML tags and collapse whitespace — for use inside JSON-LD text fields. */
export function plain(html: string): string {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: SITE_LOGO },
    description:
      "India's first private companion for women navigating perimenopause — honest, science-backed support for Indian women.",
    email: 'thesecondspringofficial@gmail.com',
    areaServed: 'IN',
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'en-IN',
    publisher: { '@id': ORG_ID },
  };
}

export interface Crumb {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export interface ArticleInput {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  section?: string;
  keywords?: string[];
}

export function articleSchema(a: ArticleInput) {
  const isNamedAuthor = a.authorName && a.authorName !== SITE_NAME && a.authorName !== 'Journal Desk';
  return {
    '@type': 'BlogPosting',
    '@id': `${abs(a.url)}#article`,
    headline: a.title,
    description: a.description,
    ...(a.image ? { image: [abs(a.image)] } : {}),
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    author: isNamedAuthor
      ? { '@type': 'Person', name: a.authorName }
      : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(a.url) },
    ...(a.section ? { articleSection: a.section } : {}),
    ...(a.keywords && a.keywords.length ? { keywords: a.keywords.join(', ') } : {}),
    isPartOf: { '@id': SITE_ID },
    inLanguage: 'en-IN',
  };
}

export interface QA {
  question: string;
  answer: string;
}

export function faqSchema(faqs: QA[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: plain(f.question),
      acceptedAnswer: { '@type': 'Answer', text: plain(f.answer) },
    })),
  };
}

/**
 * Extract Q&A pairs from a post's raw markdown body, for FAQPage structured
 * data. House style puts a "## Frequently Asked Questions" heading before
 * the Q&A blocks, but the Q&A formatting itself has varied across the site's
 * history: a bold question followed by its answer on the next line, a bold
 * question followed by its answer after a blank line, a bold question with
 * the answer inline on the same line, or a "###" heading used as the
 * question. This parser accepts all four. A trailing, non-bold wrap-up
 * paragraph (common after the last Q&A pair, before the --- disclaimer
 * rule) is skipped naturally since it matches none of the question shapes.
 */
export function parseFaqFromBody(body: string): QA[] {
  if (!body) return [];
  const headingMatch = body.match(/##\s*Frequently Asked Questions\s*\n([\s\S]*?)(?:\n---|\n##\s|$)/i);
  if (!headingMatch) return [];
  const blocks = headingMatch[1].split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const faqs: QA[] = [];
  let pendingQuestion: string | null = null;
  const clean = (q: string) => q.trim().replace(/^Q[:.]?\s*/i, '');
  for (const block of blocks) {
    const inline = block.match(/^\*\*(.+?)\*\*\s*(\S[\s\S]*)$/);
    if (inline && inline[1].trim().endsWith('?')) {
      faqs.push({ question: clean(inline[1]), answer: inline[2].trim() });
      pendingQuestion = null;
      continue;
    }
    const boldOnly = block.match(/^\*\*(.+?)\*\*\s*$/);
    if (boldOnly && boldOnly[1].trim().endsWith('?')) {
      pendingQuestion = clean(boldOnly[1]);
      continue;
    }
    const headingOnly = block.match(/^#{2,4}\s*(.+?)\s*$/);
    if (headingOnly && headingOnly[1].trim().endsWith('?')) {
      pendingQuestion = clean(headingOnly[1]);
      continue;
    }
    if (pendingQuestion) {
      faqs.push({ question: pendingQuestion, answer: block.trim() });
      pendingQuestion = null;
    }
  }
  return faqs;
}

export interface ListItemInput {
  name: string;
  url: string;
}

export function itemListSchema(items: ListItemInput[]) {
  return {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: abs(it.url),
    })),
  };
}

export interface CollectionPageInput {
  name: string;
  description: string;
  url: string;
  items?: ListItemInput[];
}

export function collectionPageSchema(c: CollectionPageInput) {
  return {
    '@type': 'CollectionPage',
    '@id': `${abs(c.url)}#webpage`,
    name: c.name,
    description: c.description,
    url: abs(c.url),
    isPartOf: { '@id': SITE_ID },
    inLanguage: 'en-IN',
    ...(c.items && c.items.length
      ? { mainEntity: itemListSchema(c.items) }
      : {}),
  };
}

export interface WebPageInput {
  name: string;
  description: string;
  url: string;
}

export function webPageSchema(p: WebPageInput) {
  return {
    '@type': 'WebPage',
    '@id': `${abs(p.url)}#webpage`,
    name: p.name,
    description: p.description,
    url: abs(p.url),
    isPartOf: { '@id': SITE_ID },
    inLanguage: 'en-IN',
  };
}

/** A community question/answer thread → DiscussionForumPosting. */
export interface DiscussionInput {
  question: string;
  description: string;
  url: string;
  authorName: string;
  datePublished: string;
  answerText?: string;
  answeredBy?: string;
  replyCount?: number;
}

export function discussionSchema(d: DiscussionInput) {
  return {
    '@type': 'DiscussionForumPosting',
    '@id': `${abs(d.url)}#discussion`,
    headline: plain(d.question),
    text: plain(d.description),
    url: abs(d.url),
    datePublished: d.datePublished,
    author: { '@type': 'Person', name: d.authorName },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(d.url) },
    isPartOf: { '@id': SITE_ID },
    inLanguage: 'en-IN',
    ...(typeof d.replyCount === 'number'
      ? { commentCount: d.replyCount }
      : {}),
    ...(d.answerText
      ? {
          comment: [
            {
              '@type': 'Comment',
              text: plain(d.answerText),
              author: { '@type': 'Organization', name: d.answeredBy || SITE_NAME },
            },
          ],
        }
      : {}),
  };
}
