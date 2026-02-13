import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeMetaTags(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $ } = ctx;

  // ===== Title Tag =====
  const title = $('title').text().trim();
  if (!title) {
    findings.push({
      id: 'meta-no-title',
      title: 'Missing page title',
      description:
        'The page has no <title> tag. Title is one of the most important signals for AI engines to understand page topic.',
      severity: 'fail',
      category: 'meta-tags',
      recommendation: 'Add a descriptive <title> tag of 50-60 characters.',
    });
  } else if (title.length < 20) {
    findings.push({
      id: 'meta-title-short',
      title: `Title too short (${title.length} chars)`,
      description: `Title "${title}" is very short. A descriptive title helps AI engines understand and cite your page.`,
      severity: 'warning',
      category: 'meta-tags',
      recommendation: 'Expand the title to 50-60 characters with descriptive keywords.',
    });
  } else if (title.length > 70) {
    findings.push({
      id: 'meta-title-long',
      title: `Title too long (${title.length} chars)`,
      description: `Title is ${title.length} characters. It may be truncated in search results and AI citations.`,
      severity: 'warning',
      category: 'meta-tags',
      recommendation: 'Shorten the title to 50-60 characters.',
    });
  } else {
    findings.push({
      id: 'meta-title-ok',
      title: `Title tag: "${title.substring(0, 50)}${title.length > 50 ? '...' : ''}"`,
      description: `Title length (${title.length} chars) is within the optimal range.`,
      severity: 'pass',
      category: 'meta-tags',
    });
  }

  // ===== Meta Description =====
  const desc = $('meta[name="description"]').attr('content')?.trim();
  if (!desc) {
    findings.push({
      id: 'meta-no-description',
      title: 'Missing meta description',
      description:
        'No meta description found. AI engines use meta descriptions to understand page content and may display it as a snippet.',
      severity: 'fail',
      category: 'meta-tags',
      recommendation:
        'Add a meta description of 150-160 characters that summarizes the page content.',
    });
  } else if (desc.length < 70) {
    findings.push({
      id: 'meta-description-short',
      title: `Meta description too short (${desc.length} chars)`,
      description:
        'Meta description is shorter than recommended. It may not fully convey the page purpose to AI engines.',
      severity: 'warning',
      category: 'meta-tags',
      recommendation: 'Expand the meta description to 150-160 characters.',
    });
  } else if (desc.length > 170) {
    findings.push({
      id: 'meta-description-long',
      title: `Meta description too long (${desc.length} chars)`,
      description: 'Meta description may be truncated by search engines and AI interfaces.',
      severity: 'warning',
      category: 'meta-tags',
      recommendation: 'Shorten the meta description to 150-160 characters.',
    });
  } else {
    findings.push({
      id: 'meta-description-ok',
      title: 'Meta description is well-formatted',
      description: `Description length (${desc.length} chars) is optimal.`,
      severity: 'pass',
      category: 'meta-tags',
    });
  }

  // ===== Canonical URL =====
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical) {
    findings.push({
      id: 'meta-canonical-ok',
      title: 'Canonical URL set',
      description: `Canonical URL points to: ${canonical}`,
      severity: 'pass',
      category: 'meta-tags',
    });
  } else {
    findings.push({
      id: 'meta-no-canonical',
      title: 'No canonical URL',
      description:
        'No canonical URL is set. This can cause duplicate content issues that confuse AI engines.',
      severity: 'warning',
      category: 'meta-tags',
      recommendation: 'Add a <link rel="canonical"> tag to specify the preferred URL.',
    });
  }

  // ===== OpenGraph Tags =====
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogType = $('meta[property="og:type"]').attr('content');
  const ogUrl = $('meta[property="og:url"]').attr('content');

  const ogPresent = [ogTitle, ogDesc, ogImage, ogType, ogUrl].filter(Boolean);
  if (ogPresent.length >= 4) {
    findings.push({
      id: 'meta-og-complete',
      title: 'OpenGraph tags are complete',
      description: `Found ${ogPresent.length}/5 essential OG tags. These help AI engines and social platforms understand your content for citations.`,
      severity: 'pass',
      category: 'meta-tags',
      details: { ogTitle, ogDesc, ogImage: ogImage ? 'present' : null, ogType, ogUrl },
    });
  } else if (ogPresent.length > 0) {
    const missing: string[] = [];
    if (!ogTitle) missing.push('og:title');
    if (!ogDesc) missing.push('og:description');
    if (!ogImage) missing.push('og:image');
    if (!ogType) missing.push('og:type');
    if (!ogUrl) missing.push('og:url');

    findings.push({
      id: 'meta-og-incomplete',
      title: `Incomplete OpenGraph (${ogPresent.length}/5)`,
      description: `Missing OG tags: ${missing.join(', ')}. Complete OG tags improve how AI engines cite and display your content.`,
      severity: 'warning',
      category: 'meta-tags',
      recommendation: `Add the missing OpenGraph tags: ${missing.join(', ')}`,
      details: { missing },
    });
  } else {
    findings.push({
      id: 'meta-no-og',
      title: 'No OpenGraph tags',
      description:
        'No OpenGraph meta tags found. OG tags help AI engines and social platforms understand and display your content correctly.',
      severity: 'fail',
      category: 'meta-tags',
      recommendation: 'Add og:title, og:description, og:image, og:type, and og:url tags.',
    });
  }

  // ===== Twitter Card =====
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  const twitterTitle = $('meta[name="twitter:title"]').attr('content');
  if (twitterCard) {
    findings.push({
      id: 'meta-twitter-card',
      title: `Twitter Card: ${twitterCard}`,
      description: 'Twitter Card meta tags are present for social sharing.',
      severity: 'pass',
      category: 'meta-tags',
    });
  } else {
    findings.push({
      id: 'meta-no-twitter',
      title: 'No Twitter Card meta tags',
      description:
        'No Twitter Card tags found. These improve content presentation when shared on X/Twitter and may be used by AI engines.',
      severity: 'info',
      category: 'meta-tags',
      recommendation: 'Add twitter:card and twitter:title meta tags.',
    });
  }

  // ===== Language Attribute =====
  const lang = $('html').attr('lang');
  if (lang) {
    findings.push({
      id: 'meta-lang-ok',
      title: `Language: ${lang}`,
      description: `The page declares language as "${lang}", helping AI engines process content in the correct language context.`,
      severity: 'pass',
      category: 'meta-tags',
    });
  } else {
    findings.push({
      id: 'meta-no-lang',
      title: 'No language attribute',
      description:
        'The <html> tag is missing a lang attribute. AI bots use this to understand the content language.',
      severity: 'warning',
      category: 'meta-tags',
      recommendation: 'Add a lang attribute to the <html> tag (e.g., lang="en").',
    });
  }

  // ===== Robots Meta =====
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  if (robotsMeta.includes('noindex')) {
    findings.push({
      id: 'meta-noindex',
      title: 'noindex meta tag detected',
      description:
        'The page has a "noindex" meta robots directive. This tells search engines AND AI bots not to index this page.',
      severity: 'fail',
      category: 'meta-tags',
      recommendation:
        'Remove "noindex" if you want this page to appear in search results and AI answers.',
    });
  }

  // ===== Viewport =====
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    findings.push({
      id: 'meta-no-viewport',
      title: 'No viewport meta tag',
      description:
        'Missing viewport meta tag. This may affect mobile usability, which is a ranking factor considered by AI engines.',
      severity: 'warning',
      category: 'meta-tags',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
    });
  }

  return findings;
}
