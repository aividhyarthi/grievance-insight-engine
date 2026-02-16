import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeLinks(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, url } = ctx;

  const origin = new URL(url).origin;
  const links: Array<{ href: string; text: string; isInternal: boolean; rel: string }> = [];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    const rel = $(el).attr('rel') || '';

    // Skip anchors, javascript, and empty
    if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    let isInternal = false;
    try {
      const linkUrl = new URL(href, url);
      isInternal = linkUrl.origin === origin;
    } catch {
      isInternal = href.startsWith('/') || href.startsWith('./') || href.startsWith('../');
    }

    links.push({ href, text, isInternal, rel });
  });

  const internalLinks = links.filter((l) => l.isInternal);
  const externalLinks = links.filter((l) => !l.isInternal);

  // ===== Internal Links =====
  if (internalLinks.length > 5) {
    findings.push({
      id: 'links-internal-good',
      title: `${internalLinks.length} internal links`,
      description:
        'Good internal linking helps AI bots discover and understand the relationships between your pages.',
      severity: 'pass',
      category: 'html',
      details: { count: internalLinks.length },
    });
  } else if (internalLinks.length > 0) {
    findings.push({
      id: 'links-internal-few',
      title: `Only ${internalLinks.length} internal link(s)`,
      description:
        'Limited internal linking. More internal links help AI bots crawl your site and understand topic clusters.',
      severity: 'warning',
      category: 'html',
      recommendation:
        'Add more internal links to related pages to improve discoverability.',
    });
  } else {
    findings.push({
      id: 'links-no-internal',
      title: 'No internal links',
      description:
        'No internal links found. This is an isolated page that AI bots cannot use to discover other content on your site.',
      severity: 'fail',
      category: 'html',
      recommendation: 'Add internal links to your important pages.',
    });
  }

  // ===== External/Citation Links =====
  if (externalLinks.length > 0) {
    findings.push({
      id: 'links-external-citations',
      title: `${externalLinks.length} external link(s)`,
      description:
        'External links serve as citations and references, signaling content authority to AI engines. Linking to authoritative sources strengthens E-E-A-T.',
      severity: 'pass',
      category: 'html',
      details: { count: externalLinks.length },
    });
  } else {
    findings.push({
      id: 'links-no-external',
      title: 'No external links',
      description:
        'No external links/citations found. Linking to authoritative external sources demonstrates expertise and improves E-E-A-T.',
      severity: 'info',
      category: 'html',
      recommendation:
        'Consider citing authoritative sources with external links to strengthen your content credibility.',
    });
  }

  // ===== Breadcrumb Navigation =====
  const hasBreadcrumb =
    $('nav[aria-label*="breadcrumb" i]').length > 0 ||
    $('[class*="breadcrumb" i]').length > 0 ||
    $('ol[class*="breadcrumb" i]').length > 0;

  if (hasBreadcrumb) {
    findings.push({
      id: 'links-breadcrumb',
      title: 'Breadcrumb navigation found',
      description:
        'Breadcrumb navigation helps AI bots understand page hierarchy and site structure.',
      severity: 'pass',
      category: 'html',
    });
  } else {
    findings.push({
      id: 'links-no-breadcrumb',
      title: 'No breadcrumb navigation',
      description:
        'No breadcrumb navigation detected. Breadcrumbs help AI engines understand page position within your site.',
      severity: 'info',
      category: 'html',
      recommendation:
        'Add breadcrumb navigation with BreadcrumbList schema markup.',
    });
  }

  // ===== Navigation Structure =====
  const hasMainNav =
    $('nav').length > 0 || $('[role="navigation"]').length > 0;

  if (hasMainNav) {
    findings.push({
      id: 'links-nav-found',
      title: 'Navigation element found',
      description:
        'Semantic <nav> element detected. This helps AI bots understand site structure and primary navigation.',
      severity: 'pass',
      category: 'html',
    });
  } else {
    findings.push({
      id: 'links-no-nav',
      title: 'No semantic navigation',
      description:
        'No <nav> element or role="navigation" found. Semantic navigation helps AI bots understand your site structure.',
      severity: 'warning',
      category: 'html',
      recommendation: 'Wrap your main navigation in a <nav> element.',
    });
  }

  // ===== Dead Link Patterns =====
  let deadLinkPatterns = 0;
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href === '#' || href === 'javascript:void(0)' || href === 'javascript:;') {
      deadLinkPatterns++;
    }
  });

  if (deadLinkPatterns > 3) {
    findings.push({
      id: 'links-dead-patterns',
      title: `${deadLinkPatterns} dead link pattern(s)`,
      description:
        'Multiple links use placeholder patterns (href="#", javascript:void). These provide no value to AI bots crawling your site.',
      severity: 'warning',
      category: 'html',
      recommendation:
        'Replace placeholder links with actual URLs or convert them to buttons.',
    });
  }

  return findings;
}
