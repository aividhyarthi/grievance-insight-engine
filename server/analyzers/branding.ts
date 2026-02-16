import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeBranding(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, url } = ctx;

  const domain = new URL(url).hostname.replace(/^www\./, '');
  const brandCandidates = domain
    .split('.')
    .slice(0, -1)
    .map((s) => s.replace(/-/g, ' '));

  // Extract visible text for analysis
  const $body = $('body').clone();
  $body.find('script, style, noscript').remove();
  const bodyText = $body.text().toLowerCase();

  // ===== Brand Mentions =====
  const title = $('title').text().toLowerCase();
  const h1 = $('h1').first().text().toLowerCase();
  const brandInTitle = brandCandidates.some((b) => title.includes(b.toLowerCase()));
  const brandInH1 = brandCandidates.some((b) => h1.includes(b.toLowerCase()));

  if (brandInTitle) {
    findings.push({
      id: 'brand-in-title',
      title: 'Brand name in page title',
      description:
        'Your brand name appears in the title tag. This strengthens brand association in AI citations.',
      severity: 'pass',
      category: 'html',
    });
  } else {
    findings.push({
      id: 'brand-not-in-title',
      title: 'Brand name not in title',
      description:
        'Your brand name does not appear in the page title. AI engines use the title for attribution.',
      severity: 'warning',
      category: 'html',
      recommendation: 'Include your brand name in the page title for stronger AI attribution.',
    });
  }

  // ===== About Page Link =====
  let hasAboutLink = false;
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase();
    if (
      href.includes('/about') ||
      text.includes('about us') ||
      text.includes('about ')
    ) {
      hasAboutLink = true;
    }
  });

  if (hasAboutLink) {
    findings.push({
      id: 'brand-about-link',
      title: 'About page link found',
      description:
        'A link to an "About" page was found. About pages are key E-E-A-T signals for AI engines to verify your authority.',
      severity: 'pass',
      category: 'html',
    });
  } else {
    findings.push({
      id: 'brand-no-about',
      title: 'No About page link',
      description:
        'No link to an About/About Us page found. About pages establish brand authority and E-E-A-T trust signals.',
      severity: 'warning',
      category: 'html',
      recommendation: 'Add a visible link to your About Us page.',
    });
  }

  // ===== Contact Information =====
  let hasContactLink = false;
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase();
    if (
      href.includes('/contact') ||
      href.startsWith('tel:') ||
      href.startsWith('mailto:') ||
      text.includes('contact us') ||
      text.includes('contact ')
    ) {
      hasContactLink = true;
    }
  });

  if (hasContactLink) {
    findings.push({
      id: 'brand-contact',
      title: 'Contact information found',
      description:
        'Contact page link, email, or phone number found. This signals legitimacy and trustworthiness to AI engines.',
      severity: 'pass',
      category: 'html',
    });
  } else {
    findings.push({
      id: 'brand-no-contact',
      title: 'No contact information',
      description:
        'No contact page link, email, or phone number found. Contact info is an E-E-A-T trust signal.',
      severity: 'warning',
      category: 'html',
      recommendation: 'Add visible contact information or a link to a Contact page.',
    });
  }

  // ===== Author Attribution =====
  const authorMeta = $('meta[name="author"]').attr('content');
  const hasAuthorByline =
    $('[class*="author"], [rel="author"], [itemprop="author"]').length > 0;
  const hasPersonSchema = ctx.html.includes('"@type":"Person"') || ctx.html.includes('"@type": "Person"');

  if (authorMeta || hasAuthorByline || hasPersonSchema) {
    findings.push({
      id: 'brand-author',
      title: 'Author attribution found',
      description: `Author information detected${authorMeta ? `: "${authorMeta}"` : ''}. Author attribution strengthens E-E-A-T and helps AI engines credit content sources.`,
      severity: 'pass',
      category: 'html',
    });
  } else {
    findings.push({
      id: 'brand-no-author',
      title: 'No author attribution',
      description:
        'No author meta tag, byline, or Person schema found. Author attribution is a strong E-E-A-T signal for content authority.',
      severity: 'warning',
      category: 'html',
      recommendation:
        'Add author attribution via meta tag, visible byline, and/or Person schema.',
    });
  }

  // ===== Social Media Profiles =====
  const socialPatterns = [
    { name: 'LinkedIn', pattern: /linkedin\.com/ },
    { name: 'Twitter/X', pattern: /twitter\.com|x\.com/ },
    { name: 'Facebook', pattern: /facebook\.com/ },
    { name: 'Instagram', pattern: /instagram\.com/ },
    { name: 'YouTube', pattern: /youtube\.com/ },
    { name: 'GitHub', pattern: /github\.com/ },
  ];

  const foundSocials: string[] = [];
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    socialPatterns.forEach((social) => {
      if (social.pattern.test(href) && !foundSocials.includes(social.name)) {
        foundSocials.push(social.name);
      }
    });
  });

  if (foundSocials.length >= 2) {
    findings.push({
      id: 'brand-social-profiles',
      title: `${foundSocials.length} social profiles linked`,
      description: `Social media profiles found: ${foundSocials.join(', ')}. Multiple social profiles strengthen brand identity in AI knowledge graphs.`,
      severity: 'pass',
      category: 'html',
      details: { profiles: foundSocials },
    });
  } else if (foundSocials.length === 1) {
    findings.push({
      id: 'brand-social-limited',
      title: `Only 1 social profile linked (${foundSocials[0]})`,
      description:
        'Only one social media profile is linked. Multiple profiles help AI engines build a comprehensive brand entity.',
      severity: 'info',
      category: 'html',
      recommendation: 'Link to more social media profiles (LinkedIn, Twitter, YouTube, etc.).',
    });
  } else {
    findings.push({
      id: 'brand-no-social',
      title: 'No social profiles linked',
      description:
        'No social media profile links found. Social profiles help AI engines verify brand identity and build your entity graph.',
      severity: 'warning',
      category: 'html',
      recommendation: 'Add links to your official social media profiles.',
    });
  }

  // ===== Trust Signals =====
  const trustPatterns = [
    /certified|certification/i,
    /award[s]?[\s-]?winning/i,
    /years?\s+of\s+experience/i,
    /trusted\s+by/i,
    /featured\s+(in|on)/i,
    /as\s+seen\s+(in|on)/i,
    /accredited/i,
    /licensed/i,
  ];

  const trustSignals = trustPatterns.filter((p) => p.test(bodyText));
  if (trustSignals.length >= 2) {
    findings.push({
      id: 'brand-trust-signals',
      title: `${trustSignals.length} trust signal(s) detected`,
      description:
        'Multiple trust and authority signals found in the content. These strengthen E-E-A-T for AI engines.',
      severity: 'pass',
      category: 'html',
      details: { count: trustSignals.length },
    });
  } else if (trustSignals.length === 1) {
    findings.push({
      id: 'brand-trust-limited',
      title: 'Limited trust signals',
      description:
        'Some trust/authority signals found, but more would strengthen your E-E-A-T profile.',
      severity: 'info',
      category: 'html',
    });
  }

  // ===== Privacy/Terms Links =====
  let hasPrivacy = false;
  let hasTerms = false;
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase();
    if (href.includes('privacy') || text.includes('privacy')) hasPrivacy = true;
    if (href.includes('terms') || text.includes('terms')) hasTerms = true;
  });

  if (hasPrivacy && hasTerms) {
    findings.push({
      id: 'brand-legal-pages',
      title: 'Privacy & Terms pages linked',
      description: 'Links to Privacy Policy and Terms pages found. These are trust signals for AI engines.',
      severity: 'pass',
      category: 'html',
    });
  } else if (hasPrivacy || hasTerms) {
    findings.push({
      id: 'brand-legal-partial',
      title: `Missing ${!hasPrivacy ? 'Privacy Policy' : 'Terms of Service'}`,
      description: 'One of the key legal pages is missing. Both Privacy Policy and Terms are expected trust signals.',
      severity: 'info',
      category: 'html',
      recommendation: `Add a link to your ${!hasPrivacy ? 'Privacy Policy' : 'Terms of Service'} page.`,
    });
  }

  return findings;
}
