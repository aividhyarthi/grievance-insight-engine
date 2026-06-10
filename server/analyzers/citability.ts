import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeCitability(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $ } = ctx;

  const $content = $('body').clone();
  $content.find('script, style, nav, footer, header, noscript, svg, iframe, [role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  // ===== 1. Self-contained sections (heading + content pairs) =====
  const sections: Array<{ heading: string; wordCount: number }> = [];
  $content.find('h2, h3').each((_, el) => {
    const heading = $(el).text().trim();
    let sectionText = '';
    let next = $(el).next();
    while (next.length > 0 && !next.is('h1, h2, h3')) {
      sectionText += ' ' + next.text().trim();
      next = next.next();
    }
    const wordCount = sectionText.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (heading && wordCount > 0) {
      sections.push({ heading, wordCount });
    }
  });

  const selfContainedSections = sections.filter(s => s.wordCount >= 30 && s.wordCount <= 300);
  const tooShortSections = sections.filter(s => s.wordCount < 30 && s.wordCount > 0);
  const tooLongSections = sections.filter(s => s.wordCount > 300);

  if (sections.length === 0) {
    findings.push({
      id: 'citability-no-sections',
      title: 'No identifiable content sections',
      description: 'No heading+content section pairs found. AI engines extract individual sections — content should be organized under clear headings with self-contained text.',
      severity: 'fail',
      category: 'citability',
      recommendation: 'Organize content into sections with H2/H3 headings, each followed by 30-300 words of self-contained text that can be understood without reading other sections.',
    });
  } else if (selfContainedSections.length >= 3) {
    findings.push({
      id: 'citability-good-sections',
      title: `${selfContainedSections.length} citable sections found`,
      description: `${selfContainedSections.length} of ${sections.length} sections are well-sized (30-300 words) for AI extraction. These can be independently quoted as answers.`,
      severity: 'pass',
      category: 'citability',
      details: { total: sections.length, citable: selfContainedSections.length },
    });
  } else {
    findings.push({
      id: 'citability-few-sections',
      title: `Only ${selfContainedSections.length} citable section(s)`,
      description: `Only ${selfContainedSections.length} of ${sections.length} sections are in the ideal 30-300 word range for AI extraction. ${tooShortSections.length} too short, ${tooLongSections.length} too long.`,
      severity: 'warning',
      category: 'citability',
      recommendation: 'Restructure content so each section under an H2/H3 heading contains 30-300 words of self-contained information.',
    });
  }

  // ===== 2. Summary / TL;DR presence =====
  let hasSummary = false;
  $content.find('h2, h3, h4, strong, b').each((_, el) => {
    const text = $(el).text().toLowerCase().trim();
    if (/(?:tl;?dr|summary|key takeaway|in short|at a glance|overview|quick answer|bottom line)/i.test(text)) {
      hasSummary = true;
    }
  });

  const firstParagraphs: string[] = [];
  $content.find('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.split(/\s+/).length >= 20 && firstParagraphs.length < 3) {
      firstParagraphs.push(text);
    }
  });

  if (hasSummary) {
    findings.push({
      id: 'citability-summary-present',
      title: 'Summary/TL;DR section found',
      description: 'A summary or key takeaway section was detected. This gives AI engines a concise, citable answer to extract directly.',
      severity: 'pass',
      category: 'citability',
    });
  } else if (firstParagraphs.length > 0 && firstParagraphs[0].split(/\s+/).length >= 30) {
    findings.push({
      id: 'citability-lead-paragraph',
      title: 'Lead paragraph can serve as summary',
      description: 'The first substantial paragraph could serve as a citable summary, but a dedicated TL;DR or summary section would be stronger.',
      severity: 'info',
      category: 'citability',
      recommendation: 'Add an explicit "Key Takeaways" or "TL;DR" section near the top for direct AI extraction.',
    });
  } else {
    findings.push({
      id: 'citability-no-summary',
      title: 'No summary or key takeaway section',
      description: 'No TL;DR, summary, or key takeaway section found. AI engines prefer pages with a concise summary they can cite directly.',
      severity: 'warning',
      category: 'citability',
      recommendation: 'Add a "Key Takeaways", "TL;DR", or summary section near the top of your content.',
    });
  }

  // ===== 3. Definition patterns =====
  const visibleText = $content.text();
  const definitionPattern = /(?:^|\.\s+)([A-Z][^.]{5,50})\s+(?:is|are|refers? to|means?|describes?)\s+[^.]{20,}/gm;
  const definitionMatches = visibleText.match(definitionPattern);
  const definitionCount = definitionMatches ? definitionMatches.length : 0;

  if (definitionCount >= 3) {
    findings.push({
      id: 'citability-definitions',
      title: `${definitionCount} definition-style sentences found`,
      description: 'Multiple clear definition sentences detected (e.g., "X is..."). These are highly citable by AI engines answering "What is X?" queries.',
      severity: 'pass',
      category: 'citability',
      details: { count: definitionCount },
    });
  } else if (definitionCount >= 1) {
    findings.push({
      id: 'citability-few-definitions',
      title: `${definitionCount} definition-style sentence(s)`,
      description: 'Some definition-style sentences found. More clear definitions increase your citability for "What is..." queries.',
      severity: 'info',
      category: 'citability',
    });
  }

  // ===== 4. Standalone fact density =====
  let factDenseParagraphs = 0;
  $content.find('p').each((_, el) => {
    const text = $(el).text().trim();
    const hasNumbers = /\d+%|\$[\d,.]+|\d{4}|\d+\s*(million|billion|thousand|percent)/i.test(text);
    const hasSpecificClaims = /(?:according to|research shows|studies show|data from|reported that|found that)/i.test(text);
    if ((hasNumbers || hasSpecificClaims) && text.split(/\s+/).length >= 15) {
      factDenseParagraphs++;
    }
  });

  if (factDenseParagraphs >= 3) {
    findings.push({
      id: 'citability-fact-dense',
      title: `${factDenseParagraphs} fact-rich paragraphs`,
      description: 'Multiple paragraphs contain specific data, statistics, or cited claims. Fact-dense content is preferred by AI engines for authoritative answers.',
      severity: 'pass',
      category: 'citability',
      details: { count: factDenseParagraphs },
    });
  } else if (factDenseParagraphs === 0) {
    findings.push({
      id: 'citability-no-facts',
      title: 'No fact-dense paragraphs detected',
      description: 'No paragraphs with specific data, statistics, or cited claims found. AI engines prefer content backed by concrete facts and figures.',
      severity: 'warning',
      category: 'citability',
      recommendation: 'Add specific data points, statistics, percentages, or cited claims to strengthen citability.',
    });
  }

  // ===== 5. Table of contents / anchor links =====
  const tocLinks = $content.find('a[href^="#"]').length;
  if (tocLinks >= 3) {
    findings.push({
      id: 'citability-toc',
      title: 'Table of contents / anchor links found',
      description: `${tocLinks} internal anchor links detected, suggesting a table of contents. This helps AI engines navigate to specific sections for extraction.`,
      severity: 'pass',
      category: 'citability',
      details: { anchorLinks: tocLinks },
    });
  }

  return findings;
}
