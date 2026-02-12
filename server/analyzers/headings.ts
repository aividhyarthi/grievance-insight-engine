import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

interface HeadingNode {
  level: number;
  text: string;
  tag: string;
}

export function analyzeHeadings(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $ } = ctx;

  const headings: HeadingNode[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const level = parseInt(tag.replace('h', ''), 10);
    const text = $(el).text().trim();
    if (text.length > 0) {
      headings.push({ level, text, tag });
    }
  });

  // Report heading tree for visualization
  findings.push({
    id: 'headings-tree',
    title: `${headings.length} heading(s) found`,
    description: `The page contains ${headings.length} heading element(s).`,
    severity: 'info',
    category: 'headings',
    details: { headings },
  });

  if (headings.length === 0) {
    findings.push({
      id: 'headings-none',
      title: 'No headings found',
      description:
        'The page has no heading elements (H1-H6). Headings are essential for AI bots to understand content structure and hierarchy.',
      severity: 'fail',
      category: 'headings',
      recommendation:
        'Add a clear heading structure with H1 for the main topic, H2 for sections, and H3 for sub-sections.',
    });
    return findings;
  }

  // Check H1
  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    findings.push({
      id: 'headings-no-h1',
      title: 'No H1 heading',
      description:
        'The page is missing an H1 heading. The H1 is the primary signal for AI bots to understand the main topic of the page.',
      severity: 'fail',
      category: 'headings',
      recommendation: 'Add exactly one H1 heading that clearly describes the page topic.',
    });
  } else if (h1s.length === 1) {
    findings.push({
      id: 'headings-h1-ok',
      title: `H1: "${h1s[0].text.substring(0, 60)}"`,
      description: 'Single H1 heading found, which is the correct structure.',
      severity: 'pass',
      category: 'headings',
    });

    // Check H1 length
    if (h1s[0].text.length < 10) {
      findings.push({
        id: 'headings-h1-short',
        title: 'H1 is very short',
        description: `The H1 heading "${h1s[0].text}" is very short. A descriptive H1 helps AI engines understand your page topic.`,
        severity: 'warning',
        category: 'headings',
        recommendation: 'Use a more descriptive H1 heading that summarizes the page content.',
      });
    } else if (h1s[0].text.length > 100) {
      findings.push({
        id: 'headings-h1-long',
        title: 'H1 is very long',
        description: `The H1 heading is ${h1s[0].text.length} characters. Keep H1s concise for clarity.`,
        severity: 'warning',
        category: 'headings',
        recommendation: 'Shorten the H1 to under 70 characters for maximum clarity.',
      });
    }
  } else {
    findings.push({
      id: 'headings-multiple-h1',
      title: `${h1s.length} H1 headings found`,
      description: `Multiple H1 headings detected. This can confuse AI bots about the primary topic: "${h1s.map((h) => h.text.substring(0, 40)).join('", "')}"`,
      severity: 'warning',
      category: 'headings',
      recommendation: 'Use only one H1 per page and convert others to H2s.',
    });
  }

  // Check hierarchy (no level skipping)
  let hasHierarchyIssue = false;
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    if (curr > prev + 1) {
      hasHierarchyIssue = true;
      findings.push({
        id: `headings-skip-${i}`,
        title: `Heading level skipped: H${prev} → H${curr}`,
        description: `"${headings[i - 1].text.substring(0, 40)}" (H${prev}) is followed by "${headings[i].text.substring(0, 40)}" (H${curr}). Heading levels should not skip (e.g., H2 should come before H3).`,
        severity: 'warning',
        category: 'headings',
      });
      break; // Only report first skip
    }
  }

  if (!hasHierarchyIssue && headings.length > 2) {
    findings.push({
      id: 'headings-hierarchy-ok',
      title: 'Heading hierarchy is correct',
      description:
        'Headings follow a proper hierarchical structure without skipping levels. AI bots can clearly understand the content organization.',
      severity: 'pass',
      category: 'headings',
    });
  }

  // Check for section headings (H2s)
  const h2s = headings.filter((h) => h.level === 2);
  if (h2s.length === 0 && headings.length > 1) {
    findings.push({
      id: 'headings-no-h2',
      title: 'No H2 section headings',
      description:
        'No H2 headings found. H2s are important for defining major content sections that AI bots can parse.',
      severity: 'warning',
      category: 'headings',
      recommendation: 'Add H2 headings to divide content into clear sections.',
    });
  } else if (h2s.length >= 2) {
    findings.push({
      id: 'headings-good-sections',
      title: `${h2s.length} content sections (H2s)`,
      description: `The page has ${h2s.length} H2 section headings, providing good content organization for AI parsing.`,
      severity: 'pass',
      category: 'headings',
    });
  }

  return findings;
}
