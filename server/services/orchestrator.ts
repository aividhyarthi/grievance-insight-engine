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

const analyzers: Record<string, AnalyzerFn> = {
  'bot-access': analyzeRobots,
  'schema': analyzeSchema,
  'content': analyzeContent,
  'headings': analyzeHeadings,
  'meta-tags': analyzeMetaTags,
  'branding': analyzeBranding,
  'technical': analyzeTechnical,
  'links': analyzeLinks,
  'crawlability': analyzeCrawlability,
  'ecommerce': analyzeEcommerce,
  'publisher': analyzePublisher,
  'industry': analyzeIndustry,
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
  // Start from base weights, then layer on specialized weights
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

  // Run all analyzers
  const categories: CategoryResult[] = [];

  for (const [categoryId, analyzerFn] of Object.entries(analyzers)) {
    const id = categoryId as CategoryId;

    // Skip conditional categories when not detected
    if (id === 'ecommerce' && !isEcommerce) continue;
    if (id === 'publisher' && !isPublisher) continue;
    if (id === 'industry' && !isIndustry) continue;

    let findings: Finding[] = [];

    try {
      findings = analyzerFn(ctx);
    } catch (err) {
      console.error(`Analyzer ${categoryId} failed:`, err);
      findings = [
        {
          id: `${categoryId}-error`,
          title: `${CATEGORY_INFO[id].name} analysis failed`,
          description: 'An error occurred during analysis.',
          severity: 'info',
          category: id,
        },
      ];
    }

    // Skip categories with no findings
    if (findings.length === 0 && (id === 'ecommerce' || id === 'publisher' || id === 'industry')) {
      continue;
    }

    // For industry category, override the display name with the detected industry
    let categoryName = CATEGORY_INFO[id].name;
    let categoryIcon = CATEGORY_INFO[id].icon;
    if (id === 'industry' && industryDetection.industry) {
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
      id,
      name: categoryName,
      icon: categoryIcon,
      score: computeScore(findings),
      weight: weights[id],
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
  const allFindings = categories.flatMap((c) => c.findings);
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
