import * as cheerio from 'cheerio';
import type { AuditReport, CategoryResult, Finding, PageMetadata, CategoryId } from '../../shared/types.js';
import { CATEGORY_WEIGHTS, NON_ECOMMERCE_WEIGHTS, PUBLISHER_WEIGHTS, INDUSTRY_WEIGHTS, CATEGORY_INFO } from '../../shared/constants.js';
import { fetchPage, fetchRobotsTxt } from './fetcher.js';
import { analyzeRobots } from '../analyzers/robots.js';
import { analyzeSchema } from '../analyzers/schema.js';
import { analyzeContent } from '../analyzers/content.js';
import { analyzeHeadings } from '../analyzers/headings.js';
import { analyzeMetaTags } from '../analyzers/meta-tags.js';
import { analyzeBranding } from '../analyzers/branding.js';
import { analyzeTechnical } from '../analyzers/technical.js';
import { analyzeLinks } from '../analyzers/links.js';
import { analyzeCrawlability } from '../analyzers/crawlability.js';
import { analyzeCitability } from '../analyzers/citability.js';
import { analyzeVoiceSearch } from '../analyzers/voice-search.js';
import { analyzeFreshness } from '../analyzers/freshness.js';
import { analyzeIntent } from '../analyzers/intent.js';
import { analyzeOffSite } from '../analyzers/off-site.js';
import { analyzeAIOverview } from '../analyzers/ai-overview.js';
import { analyzeEcommerce, detectEcommerce } from '../analyzers/ecommerce.js';
import { analyzePublisher, detectPublisher } from '../analyzers/publisher.js';
import { analyzeIndustry, detectIndustry } from '../analyzers/industry.js';

export interface AnalysisContext {
  url: string;
  html: string;
  $: cheerio.CheerioAPI;
  robotsTxt: string | null;
  responseHeaders: Record<string, string>;
  responseTime: number;
  statusCode: number;
  contentLength: number;
}

type AnalyzerFn = (ctx: AnalysisContext) => Finding[];

// Core analyzers always run (findings go to content/html/js/speed based on finding.category)
const coreAnalyzers: Array<{ name: string; fn: AnalyzerFn }> = [
  { name: 'robots', fn: analyzeRobots },
  { name: 'schema', fn: analyzeSchema },
  { name: 'content', fn: analyzeContent },
  { name: 'headings', fn: analyzeHeadings },
  { name: 'meta-tags', fn: analyzeMetaTags },
  { name: 'branding', fn: analyzeBranding },
  { name: 'technical', fn: analyzeTechnical },
  { name: 'links', fn: analyzeLinks },
  { name: 'crawlability', fn: analyzeCrawlability },
  { name: 'citability', fn: analyzeCitability },
  { name: 'voice-search', fn: analyzeVoiceSearch },
  { name: 'freshness', fn: analyzeFreshness },
  { name: 'intent', fn: analyzeIntent },
  { name: 'off-site', fn: analyzeOffSite },
  { name: 'ai-overview', fn: analyzeAIOverview },
];

// Conditional analyzers run only when site type is detected
const conditionalAnalyzers: Record<string, { detect: string; fn: AnalyzerFn }> = {
  ecommerce: { detect: 'ecommerce', fn: analyzeEcommerce },
  publisher: { detect: 'publisher', fn: analyzePublisher },
  industry: { detect: 'industry', fn: analyzeIndustry },
};

function computeScore(findings: Finding[]): number {
  const scoreable = findings.filter((f) => f.severity !== 'info');
  if (scoreable.length === 0) return 100;

  const points = scoreable.reduce((sum, f) => {
    if (f.severity === 'pass') return sum + 1;
    if (f.severity === 'warning') return sum + 0.5;
    return sum; // fail = 0
  }, 0);

  return Math.round((points / scoreable.length) * 100);
}

function getGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export async function runAudit(url: string): Promise<AuditReport> {
  // Fetch page and robots.txt in parallel
  const [pageResult, robotsTxt] = await Promise.all([
    fetchPage(url),
    fetchRobotsTxt(url),
  ]);

  const $ = cheerio.load(pageResult.html);

  const ctx: AnalysisContext = {
    url,
    html: pageResult.html,
    $,
    robotsTxt,
    responseHeaders: pageResult.headers,
    responseTime: pageResult.responseTime,
    statusCode: pageResult.statusCode,
    contentLength: pageResult.contentLength,
  };

  // Detect site type
  const ecomDetection = detectEcommerce(ctx);
  const publisherDetection = detectPublisher(ctx);
  const industryDetection = detectIndustry(ctx);
  const isEcommerce = ecomDetection.isEcommerce;
  const isPublisher = publisherDetection.isPublisher;
  const isIndustry = industryDetection.industry !== null;

  // Choose weights based on site type
  let weights: Record<CategoryId, number>;
  if (isEcommerce && isPublisher && isIndustry) {
    weights = { ...CATEGORY_WEIGHTS, industry: 0.07 };
  } else if (isEcommerce && isIndustry) {
    weights = { ...CATEGORY_WEIGHTS, publisher: 0, industry: 0.07 };
  } else if (isPublisher && isIndustry) {
    weights = { ...PUBLISHER_WEIGHTS, industry: 0.10 };
  } else if (isEcommerce && isPublisher) {
    weights = { ...CATEGORY_WEIGHTS, industry: 0 };
  } else if (isEcommerce) {
    weights = { ...CATEGORY_WEIGHTS, publisher: 0, industry: 0 };
  } else if (isPublisher) {
    weights = { ...PUBLISHER_WEIGHTS, industry: 0 };
  } else if (isIndustry) {
    weights = INDUSTRY_WEIGHTS;
  } else {
    weights = NON_ECOMMERCE_WEIGHTS;
  }

  // ===== Run all core analyzers and collect findings =====
  const allFindings: Finding[] = [];

  for (const analyzer of coreAnalyzers) {
    try {
      const findings = analyzer.fn(ctx);
      allFindings.push(...findings);
    } catch (err) {
      console.error(`Analyzer ${analyzer.name} failed:`, err);
      // Don't add error findings for core analyzers - they'd go into unknown categories
    }
  }

  // ===== Run conditional analyzers =====
  if (isEcommerce) {
    try {
      const findings = analyzeEcommerce(ctx);
      if (findings.length > 0) allFindings.push(...findings);
    } catch (err) {
      console.error('Analyzer ecommerce failed:', err);
    }
  }

  if (isPublisher) {
    try {
      const findings = analyzePublisher(ctx);
      if (findings.length > 0) allFindings.push(...findings);
    } catch (err) {
      console.error('Analyzer publisher failed:', err);
    }
  }

  if (isIndustry) {
    try {
      const findings = analyzeIndustry(ctx);
      if (findings.length > 0) allFindings.push(...findings);
    } catch (err) {
      console.error('Analyzer industry failed:', err);
    }
  }

  // ===== Group findings by category =====
  const findingsByCategory = new Map<CategoryId, Finding[]>();
  for (const finding of allFindings) {
    const catId = finding.category as CategoryId;
    if (!findingsByCategory.has(catId)) {
      findingsByCategory.set(catId, []);
    }
    findingsByCategory.get(catId)!.push(finding);
  }

  // ===== Build category results =====
  // Define the display order for categories
  const categoryOrder: CategoryId[] = [
    'bot-access', 'content', 'schema', 'technical', 'meta-tags', 'branding',
    'headings', 'links', 'crawlability', 'boilerplate', 'ai-content',
    'citability', 'voice-search', 'freshness', 'intent', 'off-site', 'ai-overview',
    'ecommerce', 'publisher', 'industry',
  ];

  const categories: CategoryResult[] = [];

  for (const catId of categoryOrder) {
    const findings = findingsByCategory.get(catId);
    if (!findings || findings.length === 0) continue;

    // Skip conditional categories that weren't detected
    if (catId === 'ecommerce' && !isEcommerce) continue;
    if (catId === 'publisher' && !isPublisher) continue;
    if (catId === 'industry' && !isIndustry) continue;

    const info = CATEGORY_INFO[catId];
    if (!info) continue;

    // For industry category, override the display name with the detected industry
    let categoryName = info.name;
    let categoryIcon = info.icon;
    if (catId === 'industry' && industryDetection.industry) {
      const iconMap: Record<string, string> = {
        'real-estate': '🏠',
        'medical': '🏥',
        'edtech': '🎓',
        'auto': '🚗',
        'reviews': '⭐',
      };
      categoryName = `${industryDetection.label} AEO`;
      categoryIcon = iconMap[industryDetection.industry] || '🏢';
    }

    categories.push({
      id: catId,
      name: categoryName,
      icon: categoryIcon,
      score: computeScore(findings),
      weight: weights[catId],
      findings,
    });
  }

  // Compute overall score (only from categories with weight > 0)
  const scoredCategories = categories.filter((cat) => cat.weight > 0);
  const totalWeight = scoredCategories.reduce((sum, cat) => sum + cat.weight, 0);
  const overallScore = totalWeight > 0
    ? Math.round(
        scoredCategories.reduce((sum, cat) => sum + cat.score * (cat.weight / totalWeight), 0)
      )
    : 0;

  // Compute summary
  const summary = {
    totalFindings: allFindings.length,
    passes: allFindings.filter((f) => f.severity === 'pass').length,
    warnings: allFindings.filter((f) => f.severity === 'warning').length,
    failures: allFindings.filter((f) => f.severity === 'fail').length,
    infos: allFindings.filter((f) => f.severity === 'info').length,
  };

  // Extract page metadata
  const metadata: PageMetadata = {
    title: $('title').text() || null,
    description: $('meta[name="description"]').attr('content') || null,
    canonical: $('link[rel="canonical"]').attr('href') || null,
    ogTags: extractOgTags($),
    responseTime: pageResult.responseTime,
    contentLength: pageResult.contentLength,
    statusCode: pageResult.statusCode,
    finalUrl: pageResult.finalUrl,
  };

  return {
    url,
    fetchedAt: new Date().toISOString(),
    overallScore,
    grade: getGrade(overallScore),
    categories,
    metadata,
    summary,
  };
}

function extractOgTags($: cheerio.CheerioAPI): Record<string, string> {
  const tags: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const prop = $(el).attr('property');
    const content = $(el).attr('content');
    if (prop && content) {
      tags[prop] = content;
    }
  });
  return tags;
}
