// Centralised JSON-LD structured-data helpers for The Second Spring.
// Every builder returns a plain schema.org node (no @context). The Layout
// collects the global nodes + any page-specific nodes into a single @graph.

export const SITE_URL = 'https://www.thesecondspring.org';
export const SITE_NAME = 'The Second Spring';
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
  return {
    '@type': 'BlogPosting',
    '@id': `${abs(a.url)}#article`,
    headline: a.title,
    description: a.description,
    ...(a.image ? { image: [abs(a.image)] } : {}),
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    author: { '@type': 'Organization', name: a.authorName || SITE_NAME, url: SITE_URL },
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
