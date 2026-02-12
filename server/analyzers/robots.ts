import robotsParser from 'robots-parser';
import type { Finding } from '../../shared/types.js';
import { AI_BOTS } from '../../shared/constants.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeRobots(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { robotsTxt, url, $ } = ctx;

  // Check if robots.txt exists
  if (!robotsTxt) {
    findings.push({
      id: 'robots-missing',
      title: 'No robots.txt found',
      description:
        'The website does not have a robots.txt file. While this means all bots can crawl freely, having an explicit robots.txt shows intentional bot management.',
      severity: 'warning',
      category: 'bot-access',
      recommendation:
        'Create a robots.txt file to explicitly manage AI bot access and include a sitemap reference.',
    });

    // Without robots.txt, all bots are allowed
    AI_BOTS.forEach((bot) => {
      findings.push({
        id: `bot-${bot.userAgent}-allowed-default`,
        title: `${bot.name} (${bot.company}) - Allowed (no robots.txt)`,
        description: `${bot.name} can crawl your site because no robots.txt restrictions exist.`,
        severity: 'pass',
        category: 'bot-access',
        details: { bot: bot.name, company: bot.company, status: 'allowed' },
      });
    });
  } else {
    const robots = robotsParser(`${new URL(url).origin}/robots.txt`, robotsTxt);

    // Check sitemap
    const sitemaps = robots.getSitemaps();
    if (sitemaps.length > 0) {
      findings.push({
        id: 'robots-sitemap-found',
        title: 'Sitemap declared in robots.txt',
        description: `Found ${sitemaps.length} sitemap(s) declared: ${sitemaps.join(', ')}`,
        severity: 'pass',
        category: 'bot-access',
        details: { sitemaps },
      });
    } else {
      findings.push({
        id: 'robots-sitemap-missing',
        title: 'No sitemap in robots.txt',
        description:
          'No sitemap is declared in robots.txt. Sitemaps help AI bots discover and prioritize your content.',
        severity: 'warning',
        category: 'bot-access',
        recommendation:
          'Add a Sitemap directive to robots.txt pointing to your XML sitemap.',
      });
    }

    // Check each AI bot
    let blockedCount = 0;
    let allowedCount = 0;

    AI_BOTS.forEach((bot) => {
      const isAllowed = robots.isAllowed(url, bot.userAgent);
      if (isAllowed) {
        allowedCount++;
        findings.push({
          id: `bot-${bot.userAgent}-allowed`,
          title: `${bot.name} (${bot.company}) - Allowed`,
          description: `${bot.name} is allowed to crawl this page. Purpose: ${bot.purpose}`,
          severity: 'pass',
          category: 'bot-access',
          details: {
            bot: bot.name,
            company: bot.company,
            userAgent: bot.userAgent,
            status: 'allowed',
          },
        });
      } else {
        blockedCount++;
        findings.push({
          id: `bot-${bot.userAgent}-blocked`,
          title: `${bot.name} (${bot.company}) - BLOCKED`,
          description: `${bot.name} is blocked from crawling this page by robots.txt. This means your content will not appear in ${bot.company}'s AI-powered features.`,
          severity: 'fail',
          category: 'bot-access',
          details: {
            bot: bot.name,
            company: bot.company,
            userAgent: bot.userAgent,
            status: 'blocked',
          },
          recommendation: `Consider allowing ${bot.name} in robots.txt if you want visibility in ${bot.company}'s AI products.`,
        });
      }
    });

    // Summary finding
    if (blockedCount === AI_BOTS.length) {
      findings.push({
        id: 'robots-all-blocked',
        title: 'ALL AI bots are blocked',
        description: `All ${AI_BOTS.length} major AI bots are blocked by robots.txt. Your content will not appear in any AI-powered search or answer engine.`,
        severity: 'fail',
        category: 'bot-access',
        recommendation:
          'Review your robots.txt and selectively allow AI bots that align with your business goals.',
      });
    } else if (blockedCount > 0) {
      findings.push({
        id: 'robots-partial-block',
        title: `${blockedCount} of ${AI_BOTS.length} AI bots blocked`,
        description: `${allowedCount} bots allowed, ${blockedCount} bots blocked. Selective blocking may reduce your visibility in some AI platforms.`,
        severity: 'warning',
        category: 'bot-access',
        details: { allowed: allowedCount, blocked: blockedCount },
      });
    }
  }

  // Check for noai/noimageai meta tags in HTML
  const noAiMeta = $('meta[name="robots"]').attr('content') || '';
  if (noAiMeta.includes('noai') || noAiMeta.includes('noimageai')) {
    findings.push({
      id: 'meta-noai',
      title: 'noai/noimageai meta directive found',
      description:
        'The page contains a "noai" or "noimageai" meta robots directive, which tells AI systems not to use this content for training or image generation.',
      severity: 'warning',
      category: 'bot-access',
      recommendation:
        'Remove the noai/noimageai directive if you want AI systems to reference your content.',
    });
  }

  if (noAiMeta.includes('nosnippet')) {
    findings.push({
      id: 'meta-nosnippet',
      title: 'nosnippet directive found',
      description:
        'The page has a "nosnippet" meta robots directive. This prevents search engines (and AI overviews) from showing any text snippet from your page.',
      severity: 'warning',
      category: 'bot-access',
      recommendation:
        'Remove nosnippet if you want your content to appear as snippets in AI overviews and search results.',
    });
  }

  return findings;
}
