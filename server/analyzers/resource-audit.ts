import * as cheerio from 'cheerio';
import type {
  ResourceItem,
  ResourceType,
  ResourceParty,
  ResourceCategory,
  ResourceVerdict,
  ResourceAuditResult,
} from '../../shared/types.js';

// ===== Known 3rd-party domain patterns =====

const CATEGORY_PATTERNS: Array<{ pattern: RegExp; category: ResourceCategory; label: string }> = [
  // Tag Managers (check first - GTM loads other scripts)
  { pattern: /googletagmanager\.com/i, category: 'tag-manager', label: 'Google Tag Manager' },
  { pattern: /tags\.tiqcdn\.com|tealium/i, category: 'tag-manager', label: 'Tealium' },
  { pattern: /cdn\.segment\.com|segment\.io/i, category: 'tag-manager', label: 'Segment' },

  // Analytics
  { pattern: /google-analytics\.com|analytics\.js|gtag\/js/i, category: 'analytics', label: 'Google Analytics' },
  { pattern: /googletagservices\.com/i, category: 'analytics', label: 'Google Tag Services' },
  { pattern: /hotjar\.com|static\.hotjar/i, category: 'analytics', label: 'Hotjar' },
  { pattern: /mixpanel\.com/i, category: 'analytics', label: 'Mixpanel' },
  { pattern: /cdn\.amplitude\.com|amplitude/i, category: 'analytics', label: 'Amplitude' },
  { pattern: /heap-analytics|heapanalytics/i, category: 'analytics', label: 'Heap' },
  { pattern: /plausible\.io/i, category: 'analytics', label: 'Plausible' },
  { pattern: /cdn\.usefathom|usefathom/i, category: 'analytics', label: 'Fathom' },
  { pattern: /matomo\.(org|cloud)|piwik/i, category: 'analytics', label: 'Matomo' },
  { pattern: /clarity\.ms/i, category: 'analytics', label: 'Microsoft Clarity' },
  { pattern: /newrelic\.com|nr-data/i, category: 'analytics', label: 'New Relic' },
  { pattern: /cloudflareinsights/i, category: 'analytics', label: 'Cloudflare Analytics' },

  // Ads
  { pattern: /googlesyndication\.com|adsbygoogle|pagead/i, category: 'ads', label: 'Google Ads/AdSense' },
  { pattern: /doubleclick\.net/i, category: 'ads', label: 'DoubleClick (Google Ads)' },
  { pattern: /amazon-adsystem/i, category: 'ads', label: 'Amazon Ads' },
  { pattern: /criteo\.com|criteo\.net/i, category: 'ads', label: 'Criteo' },
  { pattern: /taboola\.com/i, category: 'ads', label: 'Taboola' },
  { pattern: /outbrain\.com/i, category: 'ads', label: 'Outbrain' },
  { pattern: /media\.net/i, category: 'ads', label: 'Media.net' },
  { pattern: /adnxs\.com/i, category: 'ads', label: 'AppNexus/Xandr' },

  // Tracking / Pixels
  { pattern: /facebook\.net|fbevents|connect\.facebook/i, category: 'tracking', label: 'Facebook/Meta Pixel' },
  { pattern: /snap\.licdn\.com|linkedin/i, category: 'tracking', label: 'LinkedIn Insight Tag' },
  { pattern: /bat\.bing\.com/i, category: 'tracking', label: 'Bing UET Tag' },
  { pattern: /ads-twitter\.com|t\.co\/i\/adsct/i, category: 'tracking', label: 'Twitter/X Pixel' },
  { pattern: /pinterest\.com\/ct/i, category: 'tracking', label: 'Pinterest Tag' },
  { pattern: /tiktok\.com\/i18n/i, category: 'tracking', label: 'TikTok Pixel' },
  { pattern: /fullstory\.com/i, category: 'tracking', label: 'FullStory' },
  { pattern: /mouseflow\.com/i, category: 'tracking', label: 'Mouseflow' },
  { pattern: /crazyegg\.com/i, category: 'tracking', label: 'Crazy Egg' },
  { pattern: /smartlook/i, category: 'tracking', label: 'Smartlook' },
  { pattern: /logrocket/i, category: 'tracking', label: 'LogRocket' },

  // Social Widgets
  { pattern: /platform\.twitter\.com|widgets\.js/i, category: 'social', label: 'Twitter/X Widget' },
  { pattern: /platform\.instagram/i, category: 'social', label: 'Instagram Widget' },
  { pattern: /apis\.google\.com\/js\/platform/i, category: 'social', label: 'Google Platform' },
  { pattern: /addthis\.com/i, category: 'social', label: 'AddThis' },
  { pattern: /sharethis\.com/i, category: 'social', label: 'ShareThis' },

  // Chat / Support
  { pattern: /intercom\.io|intercomcdn/i, category: 'chat-support', label: 'Intercom' },
  { pattern: /drift\.com|driftt/i, category: 'chat-support', label: 'Drift' },
  { pattern: /zendesk\.com|zdassets/i, category: 'chat-support', label: 'Zendesk' },
  { pattern: /tawk\.to/i, category: 'chat-support', label: 'Tawk.to' },
  { pattern: /livechat|livechatinc/i, category: 'chat-support', label: 'LiveChat' },
  { pattern: /crisp\.chat/i, category: 'chat-support', label: 'Crisp' },
  { pattern: /freshdesk\.com|freshchat/i, category: 'chat-support', label: 'Freshdesk/Freshchat' },
  { pattern: /hubspot\.com/i, category: 'chat-support', label: 'HubSpot' },

  // Fonts
  { pattern: /fonts\.googleapis\.com/i, category: 'font', label: 'Google Fonts' },
  { pattern: /use\.typekit\.net|typekit/i, category: 'font', label: 'Adobe Typekit' },
  { pattern: /fontawesome/i, category: 'font', label: 'Font Awesome' },
  { pattern: /fonts\.gstatic\.com/i, category: 'font', label: 'Google Fonts (static)' },

  // Consent / Cookie
  { pattern: /cookiebot|consent/i, category: 'consent', label: 'Cookie Consent' },
  { pattern: /onetrust\.com/i, category: 'consent', label: 'OneTrust' },
  { pattern: /quantcast\.com|quantserve/i, category: 'consent', label: 'Quantcast' },
  { pattern: /trustarc/i, category: 'consent', label: 'TrustArc' },
  { pattern: /cookielaw\.org/i, category: 'consent', label: 'CookieLaw' },

  // Video
  { pattern: /youtube\.com\/iframe_api|ytimg/i, category: 'video', label: 'YouTube' },
  { pattern: /player\.vimeo\.com/i, category: 'video', label: 'Vimeo' },
  { pattern: /wistia\.com/i, category: 'video', label: 'Wistia' },
  { pattern: /vidyard/i, category: 'video', label: 'Vidyard' },

  // Performance / Monitoring
  { pattern: /sentry\.io|sentry-cdn/i, category: 'performance', label: 'Sentry' },
  { pattern: /bugsnag/i, category: 'performance', label: 'Bugsnag' },
  { pattern: /datadog/i, category: 'performance', label: 'Datadog' },
  { pattern: /speedcurve/i, category: 'performance', label: 'SpeedCurve' },

  // CDN Libraries (common frameworks delivered via CDN)
  { pattern: /cdnjs\.cloudflare\.com/i, category: 'cdn-library', label: 'cdnjs' },
  { pattern: /cdn\.jsdelivr\.net/i, category: 'cdn-library', label: 'jsDelivr' },
  { pattern: /unpkg\.com/i, category: 'cdn-library', label: 'unpkg' },
  { pattern: /ajax\.googleapis\.com/i, category: 'cdn-library', label: 'Google Hosted Libraries' },
  { pattern: /code\.jquery\.com/i, category: 'cdn-library', label: 'jQuery CDN' },
  { pattern: /stackpath\.bootstrapcdn|maxcdn\.bootstrapcdn/i, category: 'cdn-library', label: 'Bootstrap CDN' },
  { pattern: /cloudflare\.com\/ajax/i, category: 'cdn-library', label: 'Cloudflare CDN' },

  // Framework markers (for JS files that look like framework bundles)
  { pattern: /react|preact/i, category: 'framework', label: 'React' },
  { pattern: /_next\//i, category: 'framework', label: 'Next.js' },
  { pattern: /_nuxt\//i, category: 'framework', label: 'Nuxt.js' },
  { pattern: /vue\.(min\.)?js/i, category: 'framework', label: 'Vue.js' },
  { pattern: /angular/i, category: 'framework', label: 'Angular' },
  { pattern: /svelte/i, category: 'framework', label: 'Svelte' },
  { pattern: /gatsby/i, category: 'framework', label: 'Gatsby' },
  { pattern: /webpack|chunk|bundle/i, category: 'framework', label: 'App Bundle' },
];

function getDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function resolveUrl(src: string, pageUrl: string): string {
  try {
    return new URL(src, pageUrl).href;
  } catch {
    return src;
  }
}

function isFirstParty(resourceUrl: string, pageDomain: string): boolean {
  const resourceDomain = getDomain(resourceUrl);
  if (!resourceDomain) return true; // relative URL = 1st party

  // Same domain or subdomain
  if (resourceDomain === pageDomain) return true;
  if (resourceDomain.endsWith(`.${pageDomain}`)) return true;
  if (pageDomain.endsWith(`.${resourceDomain}`)) return true;

  // Check root domain match (e.g., cdn.example.com vs example.com)
  const getRoot = (d: string) => {
    const parts = d.split('.');
    return parts.length >= 2 ? parts.slice(-2).join('.') : d;
  };
  return getRoot(resourceDomain) === getRoot(pageDomain);
}

function classifyResource(url: string): { category: ResourceCategory; label: string } {
  for (const rule of CATEGORY_PATTERNS) {
    if (rule.pattern.test(url)) {
      return { category: rule.category, label: rule.label };
    }
  }
  return { category: 'unknown', label: 'Unknown' };
}

function getVerdict(
  item: { type: ResourceType; party: ResourceParty; category: ResourceCategory; renderBlocking: boolean }
): { verdict: ResourceVerdict; reason: string } {
  const { type, party, category, renderBlocking } = item;

  // 1st-party critical resources
  if (party === '1st-party') {
    if (type === 'css' && renderBlocking) {
      return { verdict: 'critical', reason: 'First-party render-blocking CSS needed for initial page display' };
    }
    if (category === 'framework') {
      return { verdict: 'critical', reason: 'Application framework bundle - required for page functionality' };
    }
    if (type === 'css') {
      return { verdict: 'critical', reason: 'First-party stylesheet - likely needed for page styling' };
    }
    if (category === 'site-core' || category === 'unknown') {
      return { verdict: 'deferrable', reason: 'First-party script - review if it can be deferred or loaded async' };
    }
  }

  // Category-based verdicts
  switch (category) {
    case 'analytics':
      return { verdict: 'deferrable', reason: 'Analytics script - defer load, not needed for rendering. AI bots ignore this.' };
    case 'ads':
      return { verdict: 'removable', reason: 'Ad script - not needed for content rendering. Significantly impacts CWV. Safe to remove for crawler view.' };
    case 'tracking':
      return { verdict: 'removable', reason: 'Tracking pixel/script - zero impact on content. Remove or defer for better CWV scores.' };
    case 'social':
      return { verdict: 'removable', reason: 'Social widget - not needed for core content. Loads heavy external resources.' };
    case 'chat-support':
      return { verdict: 'deferrable', reason: 'Chat/support widget - defer until user interaction. Heavy JS payload.' };
    case 'tag-manager':
      return { verdict: 'deferrable', reason: 'Tag manager - loads additional scripts. Defer or audit what it loads.' };
    case 'font':
      if (type === 'css') {
        return { verdict: 'deferrable', reason: 'Font stylesheet - can use font-display:swap and preload critical fonts instead.' };
      }
      return { verdict: 'deferrable', reason: 'Font resource - consider self-hosting for faster load.' };
    case 'video':
      return { verdict: 'deferrable', reason: 'Video player - lazy-load and defer until user scrolls to video.' };
    case 'consent':
      return { verdict: 'deferrable', reason: 'Cookie consent script - needed for compliance but can be loaded after critical content.' };
    case 'performance':
      return { verdict: 'deferrable', reason: 'Performance monitoring - defer to load after page renders.' };
    case 'cdn-library':
      if (renderBlocking) {
        return { verdict: 'deferrable', reason: 'CDN library loaded render-blocking. Consider self-hosting or adding async/defer.' };
      }
      return { verdict: 'deferrable', reason: 'CDN-hosted library - evaluate if actually used. Consider self-hosting.' };
    case 'framework':
      return { verdict: 'critical', reason: 'Framework/app bundle - required for page functionality.' };
    default:
      if (party === '3rd-party') {
        return { verdict: 'deferrable', reason: 'Third-party resource - review if needed for core content rendering.' };
      }
      return { verdict: 'deferrable', reason: 'Review this resource - determine if it\'s needed for initial page render.' };
  }
}

function getCrawlerAdvice(
  item: { party: ResourceParty; category: ResourceCategory; type: ResourceType; verdict: ResourceVerdict }
): { advice: 'allow' | 'block-safe' | 'block-recommended'; reason: string } {
  // AI bots don't execute JS - so JS files don't matter for content visibility
  // But Googlebot WRS does execute JS, so blocking JS can affect Google rendering

  if (item.type === 'css') {
    if (item.party === '1st-party') {
      return { advice: 'allow', reason: 'Googlebot needs CSS for rendering. Blocking CSS causes layout issues in Google cache.' };
    }
    if (item.category === 'font') {
      return { advice: 'allow', reason: 'Font CSS helps Googlebot render text correctly.' };
    }
    return { advice: 'block-safe', reason: 'Third-party CSS unlikely to affect content rendering for crawlers.' };
  }

  // JS files
  switch (item.category) {
    case 'framework':
      return { advice: 'allow', reason: 'Framework JS needed for Googlebot WRS to render dynamic content. Allow crawling.' };
    case 'analytics':
    case 'tracking':
      return { advice: 'block-recommended', reason: 'Analytics/tracking JS wastes Googlebot crawl budget. Safe to block - no content impact.' };
    case 'ads':
      return { advice: 'block-recommended', reason: 'Ad scripts waste crawl budget and slow Googlebot rendering. Block via robots.txt.' };
    case 'social':
      return { advice: 'block-recommended', reason: 'Social widgets add no SEO value. Block to save crawl budget.' };
    case 'chat-support':
      return { advice: 'block-safe', reason: 'Chat widgets add no content for crawlers. Safe to block.' };
    case 'tag-manager':
      return { advice: 'block-safe', reason: 'Tag managers load tracking scripts. Can be blocked but check if it loads critical scripts.' };
    case 'video':
      return { advice: 'block-safe', reason: 'Video player JS not needed for content indexing. Video should have schema markup instead.' };
    case 'consent':
      return { advice: 'block-safe', reason: 'Cookie consent not relevant for crawlers. Safe to block.' };
    case 'performance':
      return { advice: 'block-recommended', reason: 'Monitoring scripts waste crawl budget. No content impact.' };
    case 'cdn-library':
      return { advice: 'allow', reason: 'CDN library may be needed for rendering. Allow unless confirmed unnecessary.' };
    default:
      if (item.party === '1st-party') {
        return { advice: 'allow', reason: 'First-party JS may be needed for Googlebot rendering. Allow by default.' };
      }
      return { advice: 'block-safe', reason: 'Unknown third-party JS. Review and block if not needed for content rendering.' };
  }
}

export function analyzeResources(html: string, pageUrl: string): ResourceAuditResult {
  const $ = cheerio.load(html);
  const pageDomain = getDomain(pageUrl);
  const htmlSizeBytes = new TextEncoder().encode(html).byteLength;
  const CRAWL_BUDGET_LIMIT = 2 * 1024 * 1024; // 2MB

  const resources: ResourceItem[] = [];

  // ===== Analyze external JS (<script src="...">) =====
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    const type = $(el).attr('type') || '';
    if (!src) return;
    if (type === 'application/ld+json' || type === 'application/json') return;

    const absoluteUrl = resolveUrl(src, pageUrl);
    const party = isFirstParty(absoluteUrl, pageDomain) ? '1st-party' : '3rd-party';
    const { category, label } = party === '1st-party'
      ? { category: 'site-core' as ResourceCategory, label: 'Site JavaScript' }
      : classifyResource(absoluteUrl);

    const hasAsync = $(el).attr('async') !== undefined;
    const hasDefer = $(el).attr('defer') !== undefined;
    const isInHead = $(el).parents('head').length > 0;
    const renderBlocking = isInHead && !hasAsync && !hasDefer;

    const verdictInfo = getVerdict({ type: 'js', party, category, renderBlocking });
    const crawlerInfo = getCrawlerAdvice({ party, category, type: 'js', verdict: verdictInfo.verdict });

    resources.push({
      url: absoluteUrl,
      type: 'js',
      party,
      category,
      categoryLabel: label,
      verdict: verdictInfo.verdict,
      verdictReason: verdictInfo.reason,
      renderBlocking,
      sizeBytes: null, // Would need HEAD request to get
      location: isInHead ? 'head' : 'body',
      hasAsync,
      hasDefer,
      domain: getDomain(absoluteUrl),
      crawlerAdvice: crawlerInfo.advice,
      crawlerAdviceReason: crawlerInfo.reason,
    });
  });

  // ===== Analyze external CSS (<link rel="stylesheet">) =====
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    const absoluteUrl = resolveUrl(href, pageUrl);
    const party = isFirstParty(absoluteUrl, pageDomain) ? '1st-party' : '3rd-party';
    const { category, label } = party === '1st-party'
      ? { category: 'site-core' as ResourceCategory, label: 'Site Stylesheet' }
      : classifyResource(absoluteUrl);

    const media = $(el).attr('media') || '';
    const isInHead = $(el).parents('head').length > 0;
    // CSS is render-blocking unless media is print-only or disabled
    const renderBlocking = isInHead && media !== 'print' && media !== 'not all';

    const verdictInfo = getVerdict({ type: 'css', party, category, renderBlocking });
    const crawlerInfo = getCrawlerAdvice({ party, category, type: 'css', verdict: verdictInfo.verdict });

    resources.push({
      url: absoluteUrl,
      type: 'css',
      party,
      category,
      categoryLabel: label,
      verdict: verdictInfo.verdict,
      verdictReason: verdictInfo.reason,
      renderBlocking,
      sizeBytes: null,
      location: isInHead ? 'head' : 'body',
      hasAsync: false,
      hasDefer: false,
      domain: getDomain(absoluteUrl),
      crawlerAdvice: crawlerInfo.advice,
      crawlerAdviceReason: crawlerInfo.reason,
    });
  });

  // ===== Analyze inline resources =====
  let inlineJsCount = 0;
  let inlineJsSizeBytes = 0;
  let inlineCssCount = 0;
  let inlineCssSizeBytes = 0;

  $('script:not([src])').each((_, el) => {
    const type = $(el).attr('type') || '';
    if (type === 'application/ld+json' || type === 'application/json') return;
    const content = $(el).html() || '';
    if (content.trim().length > 0) {
      inlineJsCount++;
      inlineJsSizeBytes += new TextEncoder().encode(content).byteLength;
    }
  });

  $('style').each((_, el) => {
    const content = $(el).html() || '';
    if (content.trim().length > 0) {
      inlineCssCount++;
      inlineCssSizeBytes += new TextEncoder().encode(content).byteLength;
    }
  });

  // ===== Build summary =====
  const totalJs = resources.filter((r) => r.type === 'js').length;
  const totalCss = resources.filter((r) => r.type === 'css').length;
  const firstParty = resources.filter((r) => r.party === '1st-party').length;
  const thirdParty = resources.filter((r) => r.party === '3rd-party').length;
  const renderBlocking = resources.filter((r) => r.renderBlocking).length;
  const critical = resources.filter((r) => r.verdict === 'critical').length;
  const deferrable = resources.filter((r) => r.verdict === 'deferrable').length;
  const removable = resources.filter((r) => r.verdict === 'removable').length;

  // Estimate savings from removable + deferrable 3rd party
  // We can't know actual file sizes without fetching, but inline sizes contribute to 2MB budget
  const estimatedSavingsBytes = inlineJsSizeBytes + inlineCssSizeBytes;

  // ===== Build category breakdown =====
  const categoryMap = new Map<ResourceCategory, { label: string; count: number; verdict: ResourceVerdict }>();
  for (const res of resources) {
    const existing = categoryMap.get(res.category);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(res.category, { label: res.categoryLabel, count: 1, verdict: res.verdict });
    }
  }

  const verdictBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    label: data.label,
    count: data.count,
    verdict: data.verdict,
  }));

  // Sort: removable first, then deferrable, then critical
  const verdictOrder: Record<ResourceVerdict, number> = { removable: 0, deferrable: 1, critical: 2 };
  verdictBreakdown.sort((a, b) => verdictOrder[a.verdict] - verdictOrder[b.verdict]);

  return {
    url: pageUrl,
    fetchedAt: new Date().toISOString(),
    htmlSizeBytes,
    crawlBudgetUsed: htmlSizeBytes,
    crawlBudgetLimit: CRAWL_BUDGET_LIMIT,
    resources,
    inlineResources: {
      inlineJsCount,
      inlineJsSizeBytes,
      inlineCssCount,
      inlineCssSizeBytes,
    },
    summary: {
      totalResources: resources.length,
      totalJs,
      totalCss,
      firstParty,
      thirdParty,
      renderBlocking,
      critical,
      deferrable,
      removable,
      estimatedSavingsBytes,
    },
    verdictBreakdown,
  };
}
