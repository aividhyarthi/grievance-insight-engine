import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeFreshness(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html, responseHeaders } = ctx;

  const now = new Date();

  // ===== 1. Structured date metadata =====
  const publishedTime = $('meta[property="article:published_time"]').attr('content')
    || $('meta[name="date"]').attr('content')
    || $('meta[name="DC.date"]').attr('content');

  const modifiedTime = $('meta[property="article:modified_time"]').attr('content')
    || $('meta[property="og:updated_time"]').attr('content')
    || $('meta[name="last-modified"]').attr('content');

  const timeElements: string[] = [];
  $('time[datetime]').each((_, el) => {
    const dt = $(el).attr('datetime');
    if (dt) timeElements.push(dt);
  });

  let schemaDatePublished: string | null = null;
  let schemaDateModified: string | null = null;
  const datePublishedMatch = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  const dateModifiedMatch = html.match(/"dateModified"\s*:\s*"([^"]+)"/);
  if (datePublishedMatch) schemaDatePublished = datePublishedMatch[1];
  if (dateModifiedMatch) schemaDateModified = dateModifiedMatch[1];

  const pubDateStr = schemaDatePublished || publishedTime || timeElements[0] || null;
  const modDateStr = schemaDateModified || modifiedTime || null;
  const pubDate = pubDateStr ? new Date(pubDateStr) : null;
  const modDate = modDateStr ? new Date(modDateStr) : null;

  // ===== Publication date =====
  if (pubDate && !isNaN(pubDate.getTime())) {
    const ageMonths = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (ageMonths <= 6) {
      findings.push({
        id: 'freshness-recent-publish',
        title: `Recently published (${ageMonths} months ago)`,
        description: `Content was published ${pubDate.toISOString().split('T')[0]}. Fresh content is strongly preferred by AI answer engines.`,
        severity: 'pass',
        category: 'freshness',
        details: { publishDate: pubDateStr, ageMonths },
      });
    } else if (ageMonths <= 18) {
      findings.push({
        id: 'freshness-moderate-age',
        title: `Published ${ageMonths} months ago`,
        description: `Content was published ${pubDate.toISOString().split('T')[0]}. While not stale, more recent content gets priority in AI answers.`,
        severity: 'info',
        category: 'freshness',
        details: { publishDate: pubDateStr, ageMonths },
      });
    } else {
      findings.push({
        id: 'freshness-old-content',
        title: `Content is ${ageMonths} months old`,
        description: `Published on ${pubDate.toISOString().split('T')[0]} (${Math.floor(ageMonths / 12)}+ years ago). AI engines deprioritize dated content. 70%+ of AI-cited pages were updated within 12 months.`,
        severity: 'warning',
        category: 'freshness',
        details: { publishDate: pubDateStr, ageMonths },
        recommendation: 'Update and republish with fresh information, or add a "Last Updated" date showing recent review.',
      });
    }
  } else {
    findings.push({
      id: 'freshness-no-publish-date',
      title: 'No publication date found',
      description: 'No published date detected in meta tags, schema, or <time> elements. AI engines use publication dates to assess relevance and freshness.',
      severity: 'fail',
      category: 'freshness',
      recommendation: 'Add article:published_time meta tag and datePublished in your JSON-LD schema. Show a visible date on the page.',
    });
  }

  // ===== Modification date =====
  if (modDate && !isNaN(modDate.getTime())) {
    const modAgeMonths = Math.floor((now.getTime() - modDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (modAgeMonths <= 3) {
      findings.push({
        id: 'freshness-recently-updated',
        title: `Recently updated (${modAgeMonths} months ago)`,
        description: `Content was last modified ${modDate.toISOString().split('T')[0]}. Regularly updated content signals ongoing accuracy to AI engines.`,
        severity: 'pass',
        category: 'freshness',
        details: { modifiedDate: modDateStr, modAgeMonths },
      });
    } else if (modAgeMonths <= 12) {
      findings.push({
        id: 'freshness-update-moderate',
        title: `Last updated ${modAgeMonths} months ago`,
        description: `Content was last modified ${modDate.toISOString().split('T')[0]}. Consider refreshing to maintain AI engine confidence.`,
        severity: 'info',
        category: 'freshness',
        details: { modifiedDate: modDateStr, modAgeMonths },
      });
    }
  } else if (pubDate) {
    findings.push({
      id: 'freshness-no-modified-date',
      title: 'No modification date found',
      description: 'Publication date exists but no dateModified/article:modified_time. Adding a modification date signals that content is actively maintained.',
      severity: 'warning',
      category: 'freshness',
      recommendation: 'Add article:modified_time meta tag and dateModified in JSON-LD schema. Show "Last updated" date on page.',
    });
  }

  // ===== 2. HTTP freshness headers =====
  const lastModifiedHeader = responseHeaders['last-modified'];
  const etag = responseHeaders['etag'];

  if (lastModifiedHeader) {
    findings.push({
      id: 'freshness-http-last-modified',
      title: 'HTTP Last-Modified header present',
      description: `Server reports Last-Modified: ${lastModifiedHeader}. This helps crawlers determine if content changed since their last visit.`,
      severity: 'pass',
      category: 'freshness',
      details: { lastModified: lastModifiedHeader },
    });
  }

  if (etag) {
    findings.push({
      id: 'freshness-etag',
      title: 'ETag header present',
      description: 'Server provides an ETag for conditional requests. This enables efficient re-crawling by AI bots.',
      severity: 'pass',
      category: 'freshness',
    });
  }

  if (!lastModifiedHeader && !etag) {
    findings.push({
      id: 'freshness-no-http-signals',
      title: 'No HTTP freshness headers',
      description: 'No Last-Modified or ETag headers found. These help AI crawlers efficiently determine if content has changed.',
      severity: 'info',
      category: 'freshness',
      recommendation: 'Configure your server to send Last-Modified and/or ETag headers for efficient crawling.',
    });
  }

  // ===== 3. Visible freshness indicators on page =====
  const bodyText = $('body').text();
  const visibleDatePatterns = [
    /(?:last\s+)?updated\s*(?:on|:)?\s*\w+\.?\s+\d{1,2},?\s+\d{4}/i,
    /(?:reviewed|revised|edited)\s*(?:on|:)?\s*\w+\.?\s+\d{1,2},?\s+\d{4}/i,
    /(?:published|posted)\s*(?:on|:)?\s*\w+\.?\s+\d{1,2},?\s+\d{4}/i,
  ];
  const hasVisibleUpdateDate = visibleDatePatterns.some(p => p.test(bodyText));

  if (hasVisibleUpdateDate) {
    findings.push({
      id: 'freshness-visible-date',
      title: 'Visible date shown on page',
      description: 'A visible publication or update date is shown to users. This builds trust and signals freshness to both users and AI engines.',
      severity: 'pass',
      category: 'freshness',
    });
  } else {
    findings.push({
      id: 'freshness-no-visible-date',
      title: 'No visible date on page',
      description: 'No visible "Updated", "Published", or "Reviewed" date found in page content. Users and AI engines both value visible freshness signals.',
      severity: 'warning',
      category: 'freshness',
      recommendation: 'Display a "Last Updated: [date]" or "Published: [date]" near the top of your content.',
    });
  }

  // ===== 4. Temporal references in content =====
  const currentYear = now.getFullYear();
  const lastYear = currentYear - 1;
  const yearPattern = new RegExp(`\\b(${currentYear}|${lastYear})\\b`, 'g');
  const yearMatches = bodyText.match(yearPattern);
  const recentYearMentions = yearMatches ? yearMatches.length : 0;

  const oldYearPattern = /\b(201[0-8])\b/g;
  const oldYearMatches = bodyText.match(oldYearPattern);
  const oldYearMentions = oldYearMatches ? oldYearMatches.length : 0;

  if (recentYearMentions >= 2) {
    findings.push({
      id: 'freshness-current-year-refs',
      title: `References current/recent year ${recentYearMentions} times`,
      description: `Content mentions ${currentYear} or ${lastYear} multiple times, signaling it covers current information.`,
      severity: 'pass',
      category: 'freshness',
      details: { recentYearMentions },
    });
  }

  if (oldYearMentions >= 3 && recentYearMentions === 0) {
    findings.push({
      id: 'freshness-outdated-year-refs',
      title: 'Content references outdated years only',
      description: `Content mentions years from 2010-2018 (${oldYearMentions} times) but not ${currentYear}/${lastYear}. This signals potentially outdated information to AI engines.`,
      severity: 'warning',
      category: 'freshness',
      details: { oldYearMentions },
      recommendation: `Update references to include ${currentYear} data and statistics where applicable.`,
    });
  }

  // ===== 5. Evergreen content signals =====
  const evergreenIndicators = [
    /\b(ultimate guide|complete guide|comprehensive guide|definitive guide)\b/i,
    /\b(everything you need to know|beginner'?s guide|step.by.step)\b/i,
  ];
  const isEvergreenStyle = evergreenIndicators.some(p => p.test(bodyText));

  if (isEvergreenStyle && modDate) {
    findings.push({
      id: 'freshness-evergreen-maintained',
      title: 'Evergreen content with update date',
      description: 'This appears to be evergreen/guide content and has a modification date. AI engines value maintained evergreen content highly.',
      severity: 'pass',
      category: 'freshness',
    });
  } else if (isEvergreenStyle && !modDate) {
    findings.push({
      id: 'freshness-evergreen-no-update',
      title: 'Evergreen content without update signal',
      description: 'This appears to be evergreen/guide content but has no modification date. Regularly updating and showing "Last Updated" builds AI trust.',
      severity: 'warning',
      category: 'freshness',
      recommendation: 'Add dateModified schema and a visible "Last Updated" date. Review and update this content periodically.',
    });
  }

  return findings;
}
