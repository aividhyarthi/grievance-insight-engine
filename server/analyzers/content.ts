import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeContent(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $ } = ctx;

  // Extract visible text (strip scripts, styles, nav, footer, header)
  const $clone = $.root().clone();
  $clone.find('script, style, nav, footer, header, noscript, svg, iframe').remove();
  const visibleText = $clone.text().replace(/\s+/g, ' ').trim();
  const wordCount = visibleText.split(/\s+/).filter((w) => w.length > 0).length;

  // Word count check
  if (wordCount < 100) {
    findings.push({
      id: 'content-very-thin',
      title: `Very thin content (${wordCount} words)`,
      description:
        'The page has very little text content. AI engines need substantial content to understand and cite your page. This may indicate a JS-rendered page where content is loaded dynamically.',
      severity: 'fail',
      category: 'content',
      recommendation:
        'Ensure important content is rendered server-side. Aim for at least 300+ words of substantive content.',
    });
  } else if (wordCount < 300) {
    findings.push({
      id: 'content-thin',
      title: `Thin content (${wordCount} words)`,
      description:
        'The page has limited text content. AI engines prefer pages with comprehensive, detailed information (300+ words).',
      severity: 'warning',
      category: 'content',
      recommendation:
        'Expand your content with more detail, examples, or supporting information.',
    });
  } else {
    findings.push({
      id: 'content-adequate',
      title: `Content length: ${wordCount} words`,
      description: `The page has ${wordCount} words of visible content, which provides adequate substance for AI analysis.`,
      severity: 'pass',
      category: 'content',
      details: { wordCount },
    });
  }

  // Check for question-phrased headings (PAA optimization)
  const questionHeadings: string[] = [];
  $('h1, h2, h3, h4').each((_, el) => {
    const text = $(el).text().trim();
    if (
      text.endsWith('?') ||
      /^(what|how|why|when|where|who|which|can|does|is|are|do|should|will|would)\b/i.test(
        text
      )
    ) {
      questionHeadings.push(text);
    }
  });

  if (questionHeadings.length > 0) {
    findings.push({
      id: 'content-question-headings',
      title: `${questionHeadings.length} question-format heading(s)`,
      description: `Found headings phrased as questions: "${questionHeadings.slice(0, 3).join('", "')}". These align with "People Also Ask" and AI answer patterns.`,
      severity: 'pass',
      category: 'content',
      details: { questions: questionHeadings },
    });
  } else {
    findings.push({
      id: 'content-no-question-headings',
      title: 'No question-format headings',
      description:
        'No headings are phrased as questions. Question-phrased headings (e.g., "What is...", "How to...") align with how users query AI engines and increase chances of being featured.',
      severity: 'warning',
      category: 'content',
      recommendation:
        'Add question-format headings (H2/H3) that match common user queries related to your topic.',
    });
  }

  // Check for answer-ready paragraphs (40-60 word paragraphs that concisely answer questions)
  let answerReadyCount = 0;
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    const words = text.split(/\s+/).length;
    if (words >= 30 && words <= 80) {
      answerReadyCount++;
    }
  });

  if (answerReadyCount >= 3) {
    findings.push({
      id: 'content-answer-ready',
      title: `${answerReadyCount} answer-ready paragraphs`,
      description:
        'Multiple paragraphs are in the 30-80 word sweet spot for AI answer extraction. AI engines prefer concise, self-contained paragraphs for featured snippets.',
      severity: 'pass',
      category: 'content',
      details: { count: answerReadyCount },
    });
  } else {
    findings.push({
      id: 'content-few-answer-ready',
      title: 'Few answer-ready paragraphs',
      description:
        'Most paragraphs are too short or too long for optimal AI extraction. Paragraphs of 30-80 words are ideal for AI answer snippets.',
      severity: 'warning',
      category: 'content',
      recommendation:
        'Structure key information into concise 30-80 word paragraphs that directly answer specific questions.',
    });
  }

  // Check for lists (ordered/unordered) - preferred by AI for extraction
  const listCount = $('ul, ol').length;
  const listItemCount = $('li').length;

  if (listCount > 0) {
    findings.push({
      id: 'content-lists-found',
      title: `${listCount} list(s) with ${listItemCount} items`,
      description:
        'Lists are present on the page. AI engines frequently extract and present information from lists in their answers.',
      severity: 'pass',
      category: 'content',
      details: { listCount, listItemCount },
    });
  } else {
    findings.push({
      id: 'content-no-lists',
      title: 'No lists found',
      description:
        'The page does not contain any ordered or unordered lists. Lists are a preferred format for AI extraction and featured snippets.',
      severity: 'info',
      category: 'content',
      recommendation:
        'Add bulleted or numbered lists to present key points, steps, or features.',
    });
  }

  // Check for tables
  const tableCount = $('table').length;
  if (tableCount > 0) {
    findings.push({
      id: 'content-tables-found',
      title: `${tableCount} table(s) found`,
      description:
        'Tables are present, which AI engines can extract for comparison data, specifications, and structured information.',
      severity: 'pass',
      category: 'content',
      details: { tableCount },
    });
  }

  // Check for definition lists (dl/dt/dd) - often used for FAQs
  const dlCount = $('dl').length;
  if (dlCount > 0) {
    findings.push({
      id: 'content-definition-lists',
      title: `${dlCount} definition list(s) found`,
      description:
        'Definition lists are present, which can represent FAQ-like Q&A patterns that AI engines can extract.',
      severity: 'pass',
      category: 'content',
    });
  }

  // Check for date/freshness indicators
  const datePatterns =
    /(?:published|updated|modified|date|posted)\s*:?\s*\w+\s+\d{1,2},?\s+\d{4}/i;
  const hasDateIndicator = datePatterns.test(visibleText);
  const hasTimeMeta =
    $('time[datetime]').length > 0 ||
    $('meta[property="article:published_time"]').length > 0 ||
    $('meta[property="article:modified_time"]').length > 0;

  if (hasDateIndicator || hasTimeMeta) {
    findings.push({
      id: 'content-freshness',
      title: 'Content freshness indicators found',
      description:
        'The page includes date/timestamp information, signaling content freshness to AI engines. Fresh content is prioritized in AI answers.',
      severity: 'pass',
      category: 'content',
    });
  } else {
    findings.push({
      id: 'content-no-freshness',
      title: 'No content freshness indicators',
      description:
        'No visible dates or time metadata found. AI engines consider content freshness when selecting sources.',
      severity: 'warning',
      category: 'content',
      recommendation:
        'Add visible "Last updated" dates and article:modified_time meta tags.',
    });
  }

  // Simple readability check
  const sentences = visibleText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 10);
  const avgSentenceLength =
    sentences.length > 0
      ? Math.round(
          sentences.reduce(
            (sum, s) => sum + s.trim().split(/\s+/).length,
            0
          ) / sentences.length
        )
      : 0;

  if (avgSentenceLength > 0) {
    if (avgSentenceLength > 25) {
      findings.push({
        id: 'content-readability-hard',
        title: `Long sentences (avg ${avgSentenceLength} words)`,
        description:
          'Average sentence length is high. AI engines prefer clear, concise writing that is easy to extract and summarize.',
        severity: 'warning',
        category: 'content',
        details: { avgSentenceLength },
        recommendation:
          'Simplify sentences to an average of 15-20 words for better AI readability.',
      });
    } else {
      findings.push({
        id: 'content-readability-good',
        title: `Good readability (avg ${avgSentenceLength} words/sentence)`,
        description:
          'Content has appropriate sentence lengths for AI consumption.',
        severity: 'pass',
        category: 'content',
        details: { avgSentenceLength },
      });
    }
  }

  return findings;
}
