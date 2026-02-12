import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

// Google's documented file size limits (2025/2026)
// Source: https://developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers#file-size-limits
const GOOGLE_LIMITS = {
  googlebot: {
    html: 2 * 1024 * 1024,        // 2 MB for HTML (Search-specific)
    css: 2 * 1024 * 1024,         // 2 MB per CSS file
    js: 2 * 1024 * 1024,          // 2 MB per JS file
    pdf: 64 * 1024 * 1024,        // 64 MB for PDFs
  },
  general: {
    default: 15 * 1024 * 1024,    // 15 MB general crawler default
  },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function analyzeCrawlability(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html, contentLength, responseHeaders, responseTime, url } = ctx;

  // ===== GOOGLE CRAWL SIZE LIMITS =====

  const htmlSizeBytes = new TextEncoder().encode(html).byteLength;

  // Check against Googlebot 2MB limit
  if (htmlSizeBytes > GOOGLE_LIMITS.googlebot.html) {
    const overBy = htmlSizeBytes - GOOGLE_LIMITS.googlebot.html;
    findings.push({
      id: 'crawl-html-exceeds-2mb',
      title: `HTML exceeds Googlebot 2MB limit (${formatSize(htmlSizeBytes)})`,
      description: `Your page HTML is ${formatSize(htmlSizeBytes)}, exceeding Googlebot's 2MB crawl limit for Search by ${formatSize(overBy)}. Googlebot will TRUNCATE your page - content beyond 2MB will be silently dropped and NOT indexed. This can cause missing content in Google AI Overviews.`,
      severity: 'fail',
      category: 'crawlability',
      recommendation: 'Reduce HTML size below 2MB. Remove inline CSS/JS, minimize DOM nodes, lazy-load below-fold content, and move data to API calls instead of embedding in HTML.',
      details: { htmlSizeBytes, limitBytes: GOOGLE_LIMITS.googlebot.html, overByBytes: overBy },
    });
  } else if (htmlSizeBytes > GOOGLE_LIMITS.googlebot.html * 0.75) {
    // Warning at 75% of limit (1.5MB)
    const percentUsed = Math.round((htmlSizeBytes / GOOGLE_LIMITS.googlebot.html) * 100);
    findings.push({
      id: 'crawl-html-near-2mb',
      title: `HTML approaching Googlebot 2MB limit (${formatSize(htmlSizeBytes)} - ${percentUsed}% used)`,
      description: `Your page HTML is ${formatSize(htmlSizeBytes)}, approaching Googlebot's 2MB crawl limit. If the page grows further, content may be truncated.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Monitor page size growth. Consider optimizing HTML to stay well under 2MB.',
      details: { htmlSizeBytes, percentUsed },
    });
  } else {
    findings.push({
      id: 'crawl-html-size-ok',
      title: `HTML size: ${formatSize(htmlSizeBytes)} (within 2MB Googlebot limit)`,
      description: `Page HTML is ${formatSize(htmlSizeBytes)}, well within Googlebot's 2MB crawl limit and the general 15MB crawler limit. AI bots can fully read your page.`,
      severity: 'pass',
      category: 'crawlability',
      details: { htmlSizeBytes, googlebotLimit: GOOGLE_LIMITS.googlebot.html, generalLimit: GOOGLE_LIMITS.general.default },
    });
  }

  // Check against general 15MB limit (for non-Google AI bots)
  if (htmlSizeBytes > GOOGLE_LIMITS.general.default) {
    findings.push({
      id: 'crawl-html-exceeds-15mb',
      title: `HTML exceeds general 15MB crawler limit`,
      description: `Your page exceeds even the general 15MB limit used by Google's broader crawling infrastructure (Gemini, Shopping, etc.). Content will be heavily truncated across all Google products.`,
      severity: 'fail',
      category: 'crawlability',
      recommendation: 'Urgently reduce page size. This level of HTML bloat affects ALL crawlers.',
    });
  }

  // ===== JAVASCRIPT ANALYSIS FOR AI BOTS =====

  const externalScripts: Array<{ src: string; type: string }> = [];
  const inlineScripts: Array<{ length: number; type: string }> = [];
  let totalInlineJsSize = 0;
  let renderBlockingScripts = 0;

  $('script').each((_, el) => {
    const src = $(el).attr('src');
    const type = $(el).attr('type') || 'text/javascript';
    const async = $(el).attr('async') !== undefined;
    const defer = $(el).attr('defer') !== undefined;

    if (type === 'application/ld+json' || type === 'application/json') return;

    if (src) {
      externalScripts.push({ src, type });
      // Scripts without async/defer in <head> are render-blocking
      if (!async && !defer) {
        const isInHead = $(el).parents('head').length > 0;
        if (isInHead) renderBlockingScripts++;
      }
    } else {
      const content = $(el).html() || '';
      const size = new TextEncoder().encode(content).byteLength;
      inlineScripts.push({ length: size, type });
      totalInlineJsSize += size;
    }
  });

  // JS-to-HTML content ratio
  const bodyText = $('body').clone().find('script, style, noscript, svg').remove().end().text().replace(/\s+/g, ' ').trim();
  const contentBytes = new TextEncoder().encode(bodyText).byteLength;
  const totalJsScriptTags = externalScripts.length + inlineScripts.length;

  // AI bots skip JavaScript - report what they see vs what they miss
  findings.push({
    id: 'crawl-js-summary',
    title: `${externalScripts.length} external + ${inlineScripts.length} inline JS files`,
    description: `The page loads ${externalScripts.length} external JavaScript files and ${inlineScripts.length} inline scripts. Most AI bots (GPTBot, ClaudeBot, PerplexityBot) do NOT execute JavaScript - they only see raw HTML content.`,
    severity: 'info',
    category: 'crawlability',
    details: { externalScripts: externalScripts.length, inlineScripts: inlineScripts.length, totalInlineJsSize: formatSize(totalInlineJsSize) },
  });

  // Render-blocking scripts
  if (renderBlockingScripts > 0) {
    findings.push({
      id: 'crawl-render-blocking-js',
      title: `${renderBlockingScripts} render-blocking script(s) in <head>`,
      description: `${renderBlockingScripts} JavaScript file(s) in <head> without async/defer attributes block page rendering. Even Googlebot's Web Rendering Service must wait for these before seeing content.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Add async or defer attributes to scripts in <head>, or move them to end of <body>.',
      details: { renderBlockingScripts },
    });
  } else if (externalScripts.length > 0) {
    findings.push({
      id: 'crawl-no-render-blocking',
      title: 'No render-blocking scripts detected',
      description: 'All external scripts use async/defer or are placed in <body>. This is optimal for AI bot crawling speed.',
      severity: 'pass',
      category: 'crawlability',
    });
  }

  // Inline JS bloat check (affects HTML size budget)
  if (totalInlineJsSize > 500 * 1024) {
    findings.push({
      id: 'crawl-inline-js-bloat',
      title: `Large inline JavaScript: ${formatSize(totalInlineJsSize)}`,
      description: `${formatSize(totalInlineJsSize)} of inline JavaScript is embedded in the HTML. This eats into your 2MB Googlebot crawl budget without adding readable content for AI bots.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Move inline JavaScript to external files so it doesn\'t count against the HTML size limit.',
      details: { inlineJsSize: totalInlineJsSize },
    });
  }

  // ===== CSS ANALYSIS =====
  const externalCSS = $('link[rel="stylesheet"]').length;
  const inlineStyles = $('style').length;
  let totalInlineCssSize = 0;

  $('style').each((_, el) => {
    const content = $(el).html() || '';
    totalInlineCssSize += new TextEncoder().encode(content).byteLength;
  });

  if (totalInlineCssSize > 300 * 1024) {
    findings.push({
      id: 'crawl-inline-css-bloat',
      title: `Large inline CSS: ${formatSize(totalInlineCssSize)}`,
      description: `${formatSize(totalInlineCssSize)} of inline CSS is embedded in the HTML, consuming your crawl size budget. Move styles to external CSS files.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Extract inline CSS to external stylesheet files.',
      details: { inlineCssSize: totalInlineCssSize },
    });
  }

  // ===== CONTENT-TO-CODE RATIO =====
  const codeSize = totalInlineJsSize + totalInlineCssSize;
  const totalSize = htmlSizeBytes;
  const contentRatio = totalSize > 0 ? Math.round((contentBytes / totalSize) * 100) : 0;

  if (contentRatio < 10) {
    findings.push({
      id: 'crawl-low-content-ratio',
      title: `Very low content-to-code ratio: ${contentRatio}%`,
      description: `Only ${contentRatio}% of your HTML is actual readable content. The rest is code (JS, CSS, markup). AI bots see mostly code instead of content.`,
      severity: 'fail',
      category: 'crawlability',
      recommendation: 'Increase the proportion of actual content in your HTML. Move inline JS/CSS to external files and reduce unnecessary markup.',
      details: { contentRatio, contentBytes, totalHtmlBytes: totalSize },
    });
  } else if (contentRatio < 25) {
    findings.push({
      id: 'crawl-moderate-content-ratio',
      title: `Low content-to-code ratio: ${contentRatio}%`,
      description: `${contentRatio}% of your HTML is readable content. A higher ratio means AI bots get more useful content per crawl.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Optimize HTML by moving inline scripts/styles to external files.',
      details: { contentRatio },
    });
  } else {
    findings.push({
      id: 'crawl-good-content-ratio',
      title: `Good content-to-code ratio: ${contentRatio}%`,
      description: `${contentRatio}% of your HTML is readable content, giving AI bots efficient access to your content.`,
      severity: 'pass',
      category: 'crawlability',
      details: { contentRatio },
    });
  }

  // ===== AI BOT SPEED/PERFORMANCE =====

  // Response time for AI bots
  if (responseTime <= 500) {
    findings.push({
      id: 'crawl-speed-excellent',
      title: `Excellent bot response time: ${responseTime}ms`,
      description: `Server responds in ${responseTime}ms. AI bots like GPTBot and ClaudeBot have strict timeout limits (typically 5-10 seconds). Your fast response ensures complete crawling.`,
      severity: 'pass',
      category: 'crawlability',
      details: { responseTime },
    });
  } else if (responseTime <= 2000) {
    findings.push({
      id: 'crawl-speed-ok',
      title: `Acceptable bot response time: ${responseTime}ms`,
      description: `Server responds in ${responseTime}ms. While within limits, faster responses improve crawl efficiency and allow AI bots to crawl more of your pages.`,
      severity: 'pass',
      category: 'crawlability',
      details: { responseTime },
    });
  } else if (responseTime <= 5000) {
    findings.push({
      id: 'crawl-speed-slow',
      title: `Slow response for AI bots: ${responseTime}ms`,
      description: `Server takes ${responseTime}ms to respond. AI bots may reduce crawl frequency for slow sites, meaning less of your content gets indexed.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Optimize server response time. Use caching, CDN, database optimization, or server-side rendering pre-caching.',
      details: { responseTime },
    });
  } else {
    findings.push({
      id: 'crawl-speed-critical',
      title: `Critical: Very slow response (${responseTime}ms)`,
      description: `Server takes ${(responseTime / 1000).toFixed(1)} seconds to respond. AI bots are likely timing out or abandoning crawls of your pages entirely.`,
      severity: 'fail',
      category: 'crawlability',
      recommendation: 'Urgently improve server response time. AI bots typically timeout after 5-10 seconds. Consider CDN, caching, server upgrades, or pre-rendering.',
      details: { responseTime },
    });
  }

  // ===== COMPRESSION =====
  const contentEncoding = responseHeaders['content-encoding'] || '';
  if (contentEncoding.includes('gzip') || contentEncoding.includes('br') || contentEncoding.includes('deflate')) {
    findings.push({
      id: 'crawl-compression-ok',
      title: `Compression enabled: ${contentEncoding}`,
      description: `Response is compressed using ${contentEncoding}. This reduces transfer time for AI bots crawling your page. Note: Google's size limits apply to UNCOMPRESSED data.`,
      severity: 'pass',
      category: 'crawlability',
      details: { encoding: contentEncoding },
    });
  } else {
    findings.push({
      id: 'crawl-no-compression',
      title: 'No response compression detected',
      description: 'The server response does not appear to use gzip or Brotli compression. Compression reduces download time for AI bots without affecting content.',
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Enable gzip or Brotli compression on your server to speed up AI bot crawling.',
    });
  }

  // ===== CACHING HEADERS =====
  const cacheControl = responseHeaders['cache-control'] || '';
  const etag = responseHeaders['etag'] || '';
  const lastModified = responseHeaders['last-modified'] || '';

  if (cacheControl || etag || lastModified) {
    const hasCacheDuration = /max-age=\d+/.test(cacheControl) && !cacheControl.includes('max-age=0');
    if (hasCacheDuration) {
      findings.push({
        id: 'crawl-caching-good',
        title: 'Cache headers configured',
        description: 'Proper caching headers are set. This allows AI bots to use conditional requests (If-Modified-Since, ETag) to avoid re-downloading unchanged pages.',
        severity: 'pass',
        category: 'crawlability',
      });
    } else {
      findings.push({
        id: 'crawl-caching-partial',
        title: 'Partial caching headers',
        description: 'Some caching headers exist but without meaningful max-age. Proper caching reduces AI bot crawl overhead.',
        severity: 'info',
        category: 'crawlability',
      });
    }
  } else {
    findings.push({
      id: 'crawl-no-caching',
      title: 'No caching headers',
      description: 'No Cache-Control, ETag, or Last-Modified headers detected. AI bots must re-download the full page on every crawl.',
      severity: 'info',
      category: 'crawlability',
      recommendation: 'Add appropriate Cache-Control and ETag headers to optimize AI bot crawl efficiency.',
    });
  }

  // ===== RESOURCE HINTS =====
  const preconnects = $('link[rel="preconnect"]').length;
  const prefetches = $('link[rel="prefetch"]').length;
  const preloads = $('link[rel="preload"]').length;
  const dnsPrefetches = $('link[rel="dns-prefetch"]').length;
  const totalHints = preconnects + prefetches + preloads + dnsPrefetches;

  if (totalHints > 0) {
    findings.push({
      id: 'crawl-resource-hints',
      title: `${totalHints} resource hint(s) found`,
      description: `Page uses ${preconnects} preconnect, ${preloads} preload, ${prefetches} prefetch, ${dnsPrefetches} dns-prefetch hints. While AI bots don't use these, they indicate performance-conscious development.`,
      severity: 'info',
      category: 'crawlability',
      details: { preconnects, prefetches, preloads, dnsPrefetches },
    });
  }

  // ===== LAZY LOADING =====
  const lazyImages = $('img[loading="lazy"]').length;
  const totalImages = $('img').length;
  const eagerImages = $('img[loading="eager"]').length;

  if (totalImages > 0) {
    if (lazyImages > 0) {
      findings.push({
        id: 'crawl-lazy-loading',
        title: `${lazyImages} of ${totalImages} images use lazy loading`,
        description: `${lazyImages} images use native lazy loading. This reduces initial HTML payload size, helping stay within crawl size limits. AI bots typically see the img tags but may not load the actual images.`,
        severity: 'pass',
        category: 'crawlability',
        details: { lazyImages, totalImages, eagerImages },
      });
    }
  }

  // ===== iFrame content (hidden from AI bots) =====
  const iframes = $('iframe').length;
  if (iframes > 0) {
    findings.push({
      id: 'crawl-iframes',
      title: `${iframes} iframe(s) detected`,
      description: `Page contains ${iframes} iframe(s). Content inside iframes is NOT visible to most AI bots - they cannot crawl across iframe boundaries.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'If important content is in iframes, consider embedding it directly in the page HTML instead.',
      details: { iframes },
    });
  }

  return findings;
}
