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

// JS framework markers that indicate the page relies on client-side rendering
const CSR_FRAMEWORK_MARKERS = [
  // React
  { pattern: /data-reactroot/i, name: 'React' },
  { pattern: /data-react-helmet/i, name: 'React Helmet' },
  { pattern: /__NEXT_DATA__/i, name: 'Next.js' },
  { pattern: /_next\/static/i, name: 'Next.js' },
  // Vue / Nuxt
  { pattern: /__NUXT__/i, name: 'Nuxt.js' },
  { pattern: /data-v-[a-f0-9]+/i, name: 'Vue.js' },
  { pattern: /id="__nuxt"/i, name: 'Nuxt.js' },
  // Angular
  { pattern: /ng-app/i, name: 'Angular' },
  { pattern: /ng-version/i, name: 'Angular' },
  { pattern: /_nghost/i, name: 'Angular' },
  // Svelte / SvelteKit
  { pattern: /__sveltekit/i, name: 'SvelteKit' },
  // Gatsby
  { pattern: /___gatsby/i, name: 'Gatsby' },
  // Generic SPA
  { pattern: /__INITIAL_STATE__/i, name: 'SPA (State Hydration)' },
  { pattern: /window\.__data/i, name: 'SPA (Client Data)' },
  { pattern: /window\.__PRELOADED_STATE__/i, name: 'SPA (Preloaded State)' },
  { pattern: /window\.__APP_DATA__/i, name: 'SPA (App Data)' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Count scripts using regex as fallback (handles cases where cheerio parsing may miss scripts)
function countScriptsViaRegex(html: string): { external: number; inline: number; totalSrcUrls: string[] } {
  const scriptTagRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  const srcRegex = /\bsrc\s*=\s*["']([^"']+)["']/i;
  const jsonTypeRegex = /\btype\s*=\s*["'](application\/(?:ld\+)?json)["']/i;

  let external = 0;
  let inline = 0;
  const totalSrcUrls: string[] = [];
  let match;

  while ((match = scriptTagRegex.exec(html)) !== null) {
    const tag = match[0];
    // Skip JSON scripts (ld+json, application/json)
    if (jsonTypeRegex.test(tag)) continue;

    const srcMatch = srcRegex.exec(tag);
    if (srcMatch) {
      external++;
      totalSrcUrls.push(srcMatch[1]);
    } else {
      // Check if there's actual JS content (not just whitespace)
      const content = match[1]?.trim();
      if (content && content.length > 0) {
        inline++;
      }
    }
  }

  return { external, inline, totalSrcUrls };
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

  // Use both cheerio and regex to count scripts (regex catches cases cheerio misses)
  const cheerioExternalScripts: Array<{ src: string; type: string }> = [];
  const cheerioInlineScripts: Array<{ length: number; type: string }> = [];
  let totalInlineJsSize = 0;
  let renderBlockingScripts = 0;

  $('script').each((_, el) => {
    const src = $(el).attr('src');
    const type = $(el).attr('type') || 'text/javascript';
    const hasAsync = $(el).attr('async') !== undefined;
    const hasDefer = $(el).attr('defer') !== undefined;

    if (type === 'application/ld+json' || type === 'application/json') return;

    if (src) {
      cheerioExternalScripts.push({ src, type });
      // Scripts without async/defer in <head> are render-blocking
      if (!hasAsync && !hasDefer) {
        const isInHead = $(el).parents('head').length > 0;
        if (isInHead) renderBlockingScripts++;
      }
    } else {
      const content = $(el).html() || '';
      if (content.trim().length > 0) {
        const size = new TextEncoder().encode(content).byteLength;
        cheerioInlineScripts.push({ length: size, type });
        totalInlineJsSize += size;
      }
    }
  });

  // Regex-based counting as fallback/verification
  const regexCounts = countScriptsViaRegex(html);

  // Use the higher count between cheerio and regex (catches edge cases)
  const externalScriptCount = Math.max(cheerioExternalScripts.length, regexCounts.external);
  const inlineScriptCount = Math.max(cheerioInlineScripts.length, regexCounts.inline);
  const totalScriptCount = externalScriptCount + inlineScriptCount;

  // Detect JS frameworks in the HTML
  const detectedFrameworks: string[] = [];
  for (const marker of CSR_FRAMEWORK_MARKERS) {
    if (marker.pattern.test(html)) {
      if (!detectedFrameworks.includes(marker.name)) {
        detectedFrameworks.push(marker.name);
      }
    }
  }

  // ===== CSR / SSR DETECTION =====
  // Extract body text (what AI bots actually see)
  const bodyText = $('body').clone().find('script, style, noscript, svg').remove().end().text().replace(/\s+/g, ' ').trim();
  const contentBytes = new TextEncoder().encode(bodyText).byteLength;
  const bodyTextLength = bodyText.length;

  // Check for SPA root containers
  const hasAppRoot = $('#root').length > 0 || $('#app').length > 0 || $('#__next').length > 0 ||
    $('#__nuxt').length > 0 || $('[id*="app"]').first().children().length <= 2 ||
    $('#___gatsby').length > 0;

  // Detect CSR: has framework + app root + low content relative to page size
  const isLikelyCSR = hasAppRoot && detectedFrameworks.length > 0 && bodyTextLength < 1000;
  const isHeavyCSR = hasAppRoot && detectedFrameworks.length > 0 && bodyTextLength < 500;

  // Detect if the page content is mostly JS-dependent
  const jsContentRatio = htmlSizeBytes > 0 ? (totalInlineJsSize / htmlSizeBytes) : 0;
  const hasMinimalContent = bodyTextLength < 200;

  if (isHeavyCSR || (hasMinimalContent && totalScriptCount > 3)) {
    findings.push({
      id: 'crawl-csr-critical',
      title: `Client-side rendered (CSR) page - AI bots see almost no content`,
      description: `This page relies heavily on JavaScript for rendering. The raw HTML contains only ${bodyTextLength} characters of readable text${detectedFrameworks.length > 0 ? ` (framework: ${detectedFrameworks.join(', ')})` : ''}. AI bots like GPTBot, ClaudeBot, and PerplexityBot do NOT execute JavaScript - they see a nearly blank page.`,
      severity: 'fail',
      category: 'crawlability',
      recommendation: 'Switch to Server-Side Rendering (SSR) or Static Site Generation (SSG). Use Next.js, Nuxt, or implement pre-rendering so product/content data is in the raw HTML that AI bots receive.',
      details: { bodyTextLength, detectedFrameworks, totalScripts: totalScriptCount },
    });
  } else if (isLikelyCSR) {
    findings.push({
      id: 'crawl-csr-warning',
      title: `Partially client-side rendered - limited content for AI bots`,
      description: `The page uses ${detectedFrameworks.join(', ')} and has limited text content in the raw HTML (${bodyTextLength} chars). Some content may not be visible to AI bots that don't execute JavaScript.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Ensure critical content (product info, descriptions, prices) is server-side rendered. AI bots should see your key content without executing JS.',
      details: { bodyTextLength, detectedFrameworks },
    });
  } else if (detectedFrameworks.length > 0 && bodyTextLength > 1000) {
    findings.push({
      id: 'crawl-ssr-good',
      title: `Server-side rendered: ${detectedFrameworks.join(', ')} with ${bodyTextLength} chars of content`,
      description: `The page uses ${detectedFrameworks.join(', ')} but renders content server-side. AI bots can see ${bodyTextLength} characters of readable text in the raw HTML.`,
      severity: 'pass',
      category: 'crawlability',
      details: { bodyTextLength, detectedFrameworks },
    });
  }

  // ===== SCRIPT SUMMARY =====
  // AI bots skip JavaScript - report what they see vs what they miss
  const scriptSummaryParts: string[] = [];
  scriptSummaryParts.push(`${externalScriptCount} external + ${inlineScriptCount} inline JS`);
  if (detectedFrameworks.length > 0) {
    scriptSummaryParts.push(`Framework: ${detectedFrameworks.join(', ')}`);
  }

  findings.push({
    id: 'crawl-js-summary',
    title: scriptSummaryParts.join(' | '),
    description: `The page loads ${externalScriptCount} external JavaScript files and ${inlineScriptCount} inline scripts${detectedFrameworks.length > 0 ? ` (${detectedFrameworks.join(', ')})` : ''}. Most AI bots (GPTBot, ClaudeBot, PerplexityBot) do NOT execute JavaScript - they only see raw HTML content. Only Googlebot's Web Rendering Service (WRS) executes JS.`,
    severity: totalScriptCount > 30 ? 'warning' : 'info',
    category: 'crawlability',
    details: {
      externalScripts: externalScriptCount,
      inlineScripts: inlineScriptCount,
      cheerioExternal: cheerioExternalScripts.length,
      cheerioInline: cheerioInlineScripts.length,
      regexExternal: regexCounts.external,
      regexInline: regexCounts.inline,
      totalInlineJsSize: formatSize(totalInlineJsSize),
      detectedFrameworks,
      sampleScriptSrcs: regexCounts.totalSrcUrls.slice(0, 5),
    },
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
  } else if (externalScriptCount > 0) {
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
  const totalSize = htmlSizeBytes;
  const contentRatio = totalSize > 0 ? Math.round((contentBytes / totalSize) * 100) : 0;

  if (contentRatio < 10) {
    findings.push({
      id: 'crawl-low-content-ratio',
      title: `Very low content-to-code ratio: ${contentRatio}%`,
      description: `Only ${contentRatio}% of your HTML is actual readable content (${formatSize(contentBytes)} of ${formatSize(totalSize)}). The rest is code (JS, CSS, markup). AI bots see mostly code instead of content.`,
      severity: 'fail',
      category: 'crawlability',
      recommendation: 'Increase the proportion of actual content in your HTML. Move inline JS/CSS to external files and reduce unnecessary markup. For CSR apps, switch to SSR.',
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

  // ===== AI BOT "WHAT THEY SEE" SUMMARY =====
  // This is the key insight - how much real content do AI bots get?
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 50) {
    findings.push({
      id: 'crawl-ai-sees-nothing',
      title: `AI bots see only ${wordCount} words on this page`,
      description: `Without executing JavaScript, AI bots (GPTBot, ClaudeBot, PerplexityBot) can only read ${wordCount} words from the raw HTML. This is extremely low and means your content is essentially invisible to AI answer engines. The page likely uses client-side rendering (CSR).`,
      severity: 'fail',
      category: 'crawlability',
      recommendation: 'Implement Server-Side Rendering (SSR) so product names, descriptions, prices, and key content are in the initial HTML response.',
      details: { wordCount, bodyTextLength },
    });
  } else if (wordCount < 200) {
    findings.push({
      id: 'crawl-ai-sees-little',
      title: `AI bots see only ${wordCount} words (limited content)`,
      description: `AI bots can read ${wordCount} words from the raw HTML. This is relatively low - much of your content may be loaded via JavaScript and invisible to AI bots.`,
      severity: 'warning',
      category: 'crawlability',
      recommendation: 'Ensure critical content is server-side rendered. Check if product details, descriptions, and key information appear in the HTML source (View Source, not Inspect Element).',
      details: { wordCount, bodyTextLength },
    });
  } else {
    findings.push({
      id: 'crawl-ai-sees-content',
      title: `AI bots can read ${wordCount} words from raw HTML`,
      description: `AI bots can extract ${wordCount} words from the raw HTML without JavaScript. This is a good amount of readable content.`,
      severity: 'pass',
      category: 'crawlability',
      details: { wordCount, bodyTextLength },
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
