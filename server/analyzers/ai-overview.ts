import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeAIOverview(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;

  const $content = $('body').clone();
  $content.find('script, style, nav, footer, header, noscript, svg, iframe').remove();
  const visibleText = $content.text().replace(/\s+/g, ' ').trim();

  // ===== 1. Featured Snippet-ready content formats =====

  // a) Paragraph snippets (25-60 words — Google AI Overview sweet spot)
  const firstParagraphs: Array<{ text: string; wordCount: number }> = [];
  $content.find('p').each((_, el) => {
    if (firstParagraphs.length >= 5) return;
    const text = $(el).text().trim();
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 15) {
      firstParagraphs.push({ text, wordCount });
    }
  });

  const snippetReadyParagraphs = firstParagraphs.filter(p => p.wordCount >= 25 && p.wordCount <= 60);

  if (snippetReadyParagraphs.length >= 2) {
    findings.push({
      id: 'aio-paragraph-snippets',
      title: `${snippetReadyParagraphs.length} snippet-ready paragraphs`,
      description: 'Multiple concise paragraphs (25-60 words) found — ideal for featured snippet extraction by Google AI Overviews and ChatGPT.',
      severity: 'pass',
      category: 'ai-overview',
      details: { count: snippetReadyParagraphs.length },
    });
  } else {
    findings.push({
      id: 'aio-no-snippet-paragraphs',
      title: 'No snippet-optimized paragraphs',
      description: 'No concise 25-60 word paragraphs found. Featured snippets and AI Overviews prefer extracting brief, self-contained answer paragraphs.',
      severity: 'warning',
      category: 'ai-overview',
      recommendation: 'Write at least one 25-60 word paragraph that directly and concisely answers the page\'s main question.',
    });
  }

  // b) List snippets
  const qualityLists: Array<{ type: string; items: number }> = [];
  $content.find('ol, ul').each((_, el) => {
    const items = $(el).children('li').length;
    if (items >= 3) {
      qualityLists.push({ type: $(el).is('ol') ? 'ordered' : 'unordered', items });
    }
  });

  if (qualityLists.length >= 1) {
    const totalItems = qualityLists.reduce((sum, l) => sum + l.items, 0);
    findings.push({
      id: 'aio-list-snippets',
      title: `${qualityLists.length} list(s) ready for snippet extraction`,
      description: `Found ${qualityLists.length} well-structured list(s) with ${totalItems} total items. Lists are frequently extracted for AI Overview "step" and "list" snippet formats.`,
      severity: 'pass',
      category: 'ai-overview',
      details: { lists: qualityLists },
    });
  } else {
    findings.push({
      id: 'aio-no-lists',
      title: 'No snippet-ready lists',
      description: 'No lists with 3+ items found. Ordered and unordered lists are commonly extracted by Google AI Overviews for step-by-step and list-format answers.',
      severity: 'info',
      category: 'ai-overview',
      recommendation: 'Add structured lists (steps, features, tips) with 3+ items to target list-format AI snippets.',
    });
  }

  // c) Table snippets
  let qualityTableCount = 0;
  $content.find('table').each((_, el) => {
    const rows = $(el).find('tr').length;
    if (rows >= 2 && $(el).find('th').length > 0) qualityTableCount++;
  });

  if (qualityTableCount >= 1) {
    findings.push({
      id: 'aio-table-snippets',
      title: `${qualityTableCount} table(s) ready for snippet extraction`,
      description: 'Structured tables with headers found. Tables are extracted by AI Overviews for comparison and data-rich answers.',
      severity: 'pass',
      category: 'ai-overview',
    });
  }

  // ===== 2. Question heading + immediate answer pattern =====
  let qaPatternCount = 0;
  $content.find('h2, h3').each((_, el) => {
    const headingText = $(el).text().trim();
    const isQuestion = headingText.endsWith('?') ||
      /^(what|how|why|when|where|who|which|can|does|is|are|do|should)\b/i.test(headingText);

    if (isQuestion) {
      const nextP = $(el).next('p');
      if (nextP.length > 0) {
        const answerWords = nextP.text().trim().split(/\s+/).length;
        if (answerWords >= 15 && answerWords <= 80) qaPatternCount++;
      }
    }
  });

  if (qaPatternCount >= 3) {
    findings.push({
      id: 'aio-qa-pattern',
      title: `${qaPatternCount} question-answer patterns for AI extraction`,
      description: 'Multiple question headings followed by concise answer paragraphs — the gold standard format for AI Overview selection.',
      severity: 'pass',
      category: 'ai-overview',
      details: { count: qaPatternCount },
    });
  } else if (qaPatternCount >= 1) {
    findings.push({
      id: 'aio-qa-some',
      title: `${qaPatternCount} question-answer pattern(s)`,
      description: 'Some question-answer patterns found. More of this format increases chances of AI Overview selection.',
      severity: 'info',
      category: 'ai-overview',
    });
  } else {
    findings.push({
      id: 'aio-no-qa-pattern',
      title: 'No question-answer extraction patterns',
      description: 'No "question heading + direct answer paragraph" patterns found. This is the most common format AI Overviews extract.',
      severity: 'warning',
      category: 'ai-overview',
      recommendation: 'Structure content as H2/H3 questions followed immediately by a 15-80 word answer paragraph.',
    });
  }

  // ===== 3. Direct answer in first 150 words =====
  const first150Words = visibleText.split(/\s+/).slice(0, 150).join(' ');
  const directAnswerPatterns = [
    /(?:^|\.\s+)(?:\w+\s+){0,5}(?:is|are|was|were|refers? to|means?|describes?|provides?|offers?|helps?|allows?|enables?|includes?)\s+/i,
    /(?:^|\.\s+)(?:this|the|a|an)\s+\w+\s+(?:is|are|was)\s+/i,
    /(?:^|\.\s+)(?:here|below|following)\s+(?:is|are)\s+/i,
    /(?:^|\.\s+)(?:you can|you should|to\s+\w+,?\s+you)\s+/i,
    /(?:^|\.\s+)(?:the (?:best|top|most|main|key|primary))\s+/i,
  ];
  const hasDirectAnswer = directAnswerPatterns.some(p => p.test(first150Words));

  if (hasDirectAnswer) {
    findings.push({
      id: 'aio-early-answer',
      title: 'Direct answer within opening content',
      description: 'A definition, explanation, or direct answer appears early in the content. AI Overviews prioritize pages that answer the query quickly.',
      severity: 'pass',
      category: 'ai-overview',
    });
  } else {
    findings.push({
      id: 'aio-no-early-answer',
      title: 'No direct answer in opening content',
      description: 'The opening content doesn\'t contain a clear definition or direct answer. AI Overviews prefer pages that provide the answer upfront.',
      severity: 'warning',
      category: 'ai-overview',
      recommendation: 'Start your content with a clear, direct answer to the main question within the first paragraph.',
    });
  }

  // ===== 4. nosnippet / max-snippet checks =====
  const robotsMeta = $('meta[name="robots"]').attr('content') || '';
  const hasNoSnippet = robotsMeta.includes('nosnippet');
  const maxSnippetMatch = /max-snippet\s*:\s*(\d+)/i.exec(robotsMeta);
  const dataNoSnippetCount = $('[data-nosnippet]').length;

  if (hasNoSnippet) {
    findings.push({
      id: 'aio-nosnippet-blocks',
      title: 'nosnippet blocks AI Overview extraction',
      description: 'The nosnippet meta directive prevents search engines and AI Overviews from showing any text snippet from this page.',
      severity: 'fail',
      category: 'ai-overview',
      recommendation: 'Remove the nosnippet directive to allow AI Overviews to cite your content.',
    });
  }

  if (maxSnippetMatch) {
    const limit = parseInt(maxSnippetMatch[1]);
    if (limit < 160) {
      findings.push({
        id: 'aio-max-snippet-low',
        title: `max-snippet limited to ${limit} characters`,
        description: `Snippet length is restricted to ${limit} characters. AI Overviews may need more text to form a complete answer.`,
        severity: 'warning',
        category: 'ai-overview',
        recommendation: 'Increase or remove max-snippet limit to allow AI Overviews sufficient text.',
      });
    } else {
      findings.push({
        id: 'aio-max-snippet-ok',
        title: `max-snippet set to ${limit} characters`,
        description: `Snippet length allows up to ${limit} characters — sufficient for AI Overview extraction.`,
        severity: 'pass',
        category: 'ai-overview',
      });
    }
  }

  if (dataNoSnippetCount > 0) {
    findings.push({
      id: 'aio-data-nosnippet',
      title: `${dataNoSnippetCount} element(s) marked data-nosnippet`,
      description: `${dataNoSnippetCount} elements are hidden from AI snippets via data-nosnippet. Ensure key content is not excluded.`,
      severity: 'info',
      category: 'ai-overview',
      details: { count: dataNoSnippetCount },
    });
  }

  // ===== 5. High-value schema types for AI Overviews =====
  const aioSchemaTypes = [
    { type: 'FAQPage', impact: 'FAQ rich results and AI Overview Q&A' },
    { type: 'HowTo', impact: 'Step-by-step AI Overview panels' },
    { type: 'Article', impact: 'News/content AI Overview citations' },
    { type: 'Product', impact: 'Shopping AI Overview panels' },
    { type: 'Review', impact: 'Review aggregation in AI answers' },
    { type: 'Recipe', impact: 'Recipe AI Overview cards' },
    { type: 'VideoObject', impact: 'Video carousel in AI Overviews' },
  ];

  const foundSchemas: Array<{ type: string; impact: string }> = [];
  for (const schema of aioSchemaTypes) {
    if (html.includes(`"${schema.type}"`) || html.includes(`"@type":"${schema.type}"`)) {
      foundSchemas.push(schema);
    }
  }

  if (foundSchemas.length >= 2) {
    findings.push({
      id: 'aio-rich-schemas',
      title: `${foundSchemas.length} AI Overview-boosting schema types`,
      description: `Found high-impact schemas: ${foundSchemas.map(s => s.type).join(', ')}. These trigger rich results and increase AI Overview selection probability.`,
      severity: 'pass',
      category: 'ai-overview',
      details: { schemas: foundSchemas },
    });
  } else if (foundSchemas.length === 1) {
    findings.push({
      id: 'aio-one-schema',
      title: `1 AI Overview schema: ${foundSchemas[0].type}`,
      description: `${foundSchemas[0].type} schema found (${foundSchemas[0].impact}). Adding more schema types broadens AI Overview eligibility.`,
      severity: 'info',
      category: 'ai-overview',
    });
  } else {
    findings.push({
      id: 'aio-no-overview-schemas',
      title: 'No AI Overview-optimized schemas',
      description: 'No FAQPage, HowTo, Article, Product, or other high-impact schema types found. These schemas significantly increase AI Overview selection.',
      severity: 'warning',
      category: 'ai-overview',
      recommendation: 'Add FAQPage, HowTo, or Article schema (whichever fits your content) to boost AI Overview eligibility.',
    });
  }

  // ===== 6. Content length sweet spot =====
  const wordCount = visibleText.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 800 && wordCount <= 3000) {
    findings.push({
      id: 'aio-content-length',
      title: `Content length optimal for AI Overviews (${wordCount} words)`,
      description: 'Content length is in the 800-3000 word sweet spot. AI Overviews tend to cite comprehensive but focused pages.',
      severity: 'pass',
      category: 'ai-overview',
    });
  } else if (wordCount < 300) {
    findings.push({
      id: 'aio-content-too-thin',
      title: `Content too thin for AI Overview (${wordCount} words)`,
      description: 'Very short content is rarely selected for AI Overviews. AI engines need enough substance to extract a meaningful answer.',
      severity: 'warning',
      category: 'ai-overview',
      recommendation: 'Expand content to at least 800 words with comprehensive topic coverage.',
    });
  } else if (wordCount > 5000) {
    findings.push({
      id: 'aio-content-very-long',
      title: `Very long content (${wordCount} words)`,
      description: 'Extremely long content may be harder for AI engines to extract a focused answer from. Ensure key answers are clearly highlighted.',
      severity: 'info',
      category: 'ai-overview',
      recommendation: 'Add a summary/TL;DR section and use clear question-format headings so AI can easily find key answers.',
    });
  }

  // ===== 7. Citation-readiness =====
  const citationPatterns = [
    /\bsource\s*:/i, /\baccording to\b/i,
    /\bresearch (?:shows?|suggests?|indicates?|finds?)\b/i,
    /\bstud(?:y|ies) (?:show|suggest|indicate|find|found)\b/i,
    /\b(?:data|statistics|report) from\b/i,
    /\[\d+\]/,
  ];

  let citationCount = 0;
  for (const pattern of citationPatterns) {
    const matches = visibleText.match(new RegExp(pattern, 'gi'));
    if (matches) citationCount += matches.length;
  }

  if (citationCount >= 3) {
    findings.push({
      id: 'aio-citations',
      title: `${citationCount} source citations/references found`,
      description: 'Content cites sources and references data. AI Overviews prefer content that demonstrates research-backed authority.',
      severity: 'pass',
      category: 'ai-overview',
      details: { count: citationCount },
    });
  } else if (citationCount === 0) {
    findings.push({
      id: 'aio-no-citations',
      title: 'No source citations found',
      description: 'No citations, source references, or research claims found. AI Overviews prefer content that backs claims with evidence.',
      severity: 'info',
      category: 'ai-overview',
      recommendation: 'Add source citations ("According to...", "Research shows...") and link to authoritative references.',
    });
  }

  return findings;
}
