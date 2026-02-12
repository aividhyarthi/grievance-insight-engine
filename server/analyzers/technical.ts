import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeTechnical(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html, responseHeaders, responseTime, statusCode, url, contentLength } = ctx;

  // ===== HTTPS Check =====
  if (url.startsWith('https://')) {
    findings.push({
      id: 'tech-https',
      title: 'HTTPS enabled',
      description: 'The page is served over HTTPS, which is required for trust by AI engines.',
      severity: 'pass',
      category: 'technical',
    });
  } else {
    findings.push({
      id: 'tech-no-https',
      title: 'Not using HTTPS',
      description:
        'The page is not served over HTTPS. Most AI bots and search engines penalize or skip non-HTTPS pages.',
      severity: 'fail',
      category: 'technical',
      recommendation: 'Enable HTTPS with a valid SSL certificate.',
    });
  }

  // ===== Response Time =====
  if (responseTime <= 1000) {
    findings.push({
      id: 'tech-speed-fast',
      title: `Fast response: ${responseTime}ms`,
      description: 'Server response time is excellent. Fast pages are preferred by AI crawlers.',
      severity: 'pass',
      category: 'technical',
      details: { responseTime },
    });
  } else if (responseTime <= 3000) {
    findings.push({
      id: 'tech-speed-ok',
      title: `Moderate response: ${responseTime}ms`,
      description:
        'Server response time is acceptable but could be improved. AI bots may time out on slow pages.',
      severity: 'warning',
      category: 'technical',
      details: { responseTime },
      recommendation: 'Optimize server response time to under 1 second.',
    });
  } else {
    findings.push({
      id: 'tech-speed-slow',
      title: `Slow response: ${responseTime}ms`,
      description:
        'Server response time is slow. AI bots may skip or incompletely index slow-responding pages.',
      severity: 'fail',
      category: 'technical',
      details: { responseTime },
      recommendation: 'Improve server performance. Consider caching, CDN, or server optimization.',
    });
  }

  // ===== Page Size =====
  const sizeKB = Math.round(contentLength / 1024);
  if (sizeKB > 3000) {
    findings.push({
      id: 'tech-large-page',
      title: `Large page size: ${sizeKB}KB`,
      description:
        'Page HTML is very large. AI bots may truncate or skip large pages during crawling.',
      severity: 'warning',
      category: 'technical',
      recommendation: 'Reduce page size by optimizing HTML, removing unused content, or lazy-loading.',
    });
  } else {
    findings.push({
      id: 'tech-page-size',
      title: `Page size: ${sizeKB}KB`,
      description: 'Page size is within acceptable limits for AI bot crawling.',
      severity: 'pass',
      category: 'technical',
      details: { sizeKB },
    });
  }

  // ===== JavaScript Analysis =====
  const externalScripts = $('script[src]').length;
  const inlineScripts = $('script:not([src]):not([type="application/ld+json"])').length;
  const totalScripts = externalScripts + inlineScripts;

  if (totalScripts > 20) {
    findings.push({
      id: 'tech-excessive-js',
      title: `Heavy JavaScript: ${totalScripts} scripts`,
      description: `${externalScripts} external + ${inlineScripts} inline scripts. Excessive JavaScript can prevent AI bots from seeing your content since most do not execute JS.`,
      severity: 'warning',
      category: 'technical',
      details: { externalScripts, inlineScripts, totalScripts },
      recommendation:
        'Reduce JavaScript dependencies. Ensure content is in the initial HTML, not loaded via JS.',
    });
  } else {
    findings.push({
      id: 'tech-js-count',
      title: `${totalScripts} script(s) on page`,
      description: `${externalScripts} external, ${inlineScripts} inline scripts. JavaScript count is reasonable.`,
      severity: 'pass',
      category: 'technical',
      details: { externalScripts, inlineScripts },
    });
  }

  // ===== Client-Side Rendering Detection =====
  const bodyText = $('body')
    .clone()
    .find('script, style, noscript')
    .remove()
    .end()
    .text()
    .replace(/\s+/g, ' ')
    .trim();

  const hasAppRoot =
    ($('#root').length > 0 || $('#app').length > 0 || $('#__next').length > 0) &&
    bodyText.length < 200;

  const hasSPAFramework =
    html.includes('__NEXT_DATA__') ||
    html.includes('__NUXT__') ||
    html.includes('ng-app') ||
    html.includes('data-reactroot');

  if (hasAppRoot) {
    findings.push({
      id: 'tech-csr-detected',
      title: 'Client-side rendered (CSR) page detected',
      description:
        'The page appears to rely on client-side JavaScript rendering (SPA). Most AI bots (GPTBot, ClaudeBot, PerplexityBot) do NOT execute JavaScript, meaning they may see a blank page.',
      severity: 'fail',
      category: 'technical',
      recommendation:
        'Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) so content is visible in the raw HTML. Consider Next.js, Nuxt, or pre-rendering.',
    });
  } else if (hasSPAFramework && bodyText.length > 200) {
    findings.push({
      id: 'tech-ssr-detected',
      title: 'Server-side rendered framework detected',
      description:
        'A JavaScript framework with SSR is detected (Next.js, Nuxt, etc.) and content is present in the HTML. AI bots can see your content.',
      severity: 'pass',
      category: 'technical',
    });
  }

  // ===== Noscript Fallback =====
  const noscript = $('noscript');
  if (noscript.length > 0) {
    const noscriptText = noscript.text().trim();
    if (noscriptText.length > 50) {
      findings.push({
        id: 'tech-noscript-content',
        title: 'Noscript fallback with content',
        description:
          'The page has <noscript> tags with meaningful fallback content for non-JS environments.',
        severity: 'pass',
        category: 'technical',
      });
    }
  }

  // ===== Image Alt Text =====
  const images = $('img');
  const totalImages = images.length;
  let imagesWithAlt = 0;
  let imagesWithEmptyAlt = 0;
  let imagesNoAlt = 0;

  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined) {
      imagesNoAlt++;
    } else if (alt.trim() === '') {
      imagesWithEmptyAlt++;
    } else {
      imagesWithAlt++;
    }
  });

  if (totalImages > 0) {
    if (imagesNoAlt > 0) {
      findings.push({
        id: 'tech-img-no-alt',
        title: `${imagesNoAlt} image(s) missing alt text`,
        description: `${imagesNoAlt} of ${totalImages} images have no alt attribute. AI bots cannot interpret images without alt text.`,
        severity: 'warning',
        category: 'technical',
        details: { totalImages, imagesWithAlt, imagesNoAlt, imagesWithEmptyAlt },
        recommendation: 'Add descriptive alt text to all meaningful images.',
      });
    } else {
      findings.push({
        id: 'tech-img-alt-ok',
        title: `All ${totalImages} images have alt attributes`,
        description: 'All images have alt text, making visual content accessible to AI bots.',
        severity: 'pass',
        category: 'technical',
        details: { totalImages, imagesWithAlt },
      });
    }
  }

  // ===== X-Robots-Tag Header =====
  const xRobots = responseHeaders['x-robots-tag'];
  if (xRobots) {
    if (xRobots.includes('noindex') || xRobots.includes('nosnippet')) {
      findings.push({
        id: 'tech-x-robots-restrictive',
        title: `Restrictive X-Robots-Tag: ${xRobots}`,
        description:
          'The server sends an X-Robots-Tag header that may prevent AI engines from indexing or showing snippets.',
        severity: 'fail',
        category: 'technical',
        recommendation: 'Review the X-Robots-Tag header and remove noindex/nosnippet if AI visibility is desired.',
      });
    } else {
      findings.push({
        id: 'tech-x-robots',
        title: `X-Robots-Tag: ${xRobots}`,
        description: 'X-Robots-Tag header is present.',
        severity: 'info',
        category: 'technical',
      });
    }
  }

  // ===== Status Code =====
  if (statusCode === 200) {
    findings.push({
      id: 'tech-status-ok',
      title: 'HTTP 200 OK',
      description: 'Page returns a successful HTTP status code.',
      severity: 'pass',
      category: 'technical',
    });
  } else if (statusCode >= 300 && statusCode < 400) {
    findings.push({
      id: 'tech-redirect',
      title: `Redirect: HTTP ${statusCode}`,
      description: 'The page redirects. Multiple redirects can slow AI bot crawling.',
      severity: 'warning',
      category: 'technical',
    });
  } else if (statusCode >= 400) {
    findings.push({
      id: 'tech-error-status',
      title: `Error: HTTP ${statusCode}`,
      description: `The page returns an HTTP ${statusCode} error. AI bots will not index error pages.`,
      severity: 'fail',
      category: 'technical',
    });
  }

  // ===== Charset =====
  const charset = $('meta[charset]').attr('charset') ||
    $('meta[http-equiv="Content-Type"]').attr('content');
  if (charset) {
    findings.push({
      id: 'tech-charset',
      title: 'Character encoding declared',
      description: 'Character encoding is properly declared, preventing text rendering issues for AI bots.',
      severity: 'pass',
      category: 'technical',
    });
  }

  return findings;
}
