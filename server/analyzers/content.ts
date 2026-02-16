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

  // ===== BOILERPLATE % DETECTION =====
  const boilerplateResult = detectBoilerplate($);
  const boilerplatePct = boilerplateResult.boilerplatePercent;

  if (boilerplatePct <= 30) {
    findings.push({
      id: 'boilerplate-low',
      title: `Low boilerplate: ${boilerplatePct}% of page is chrome`,
      description: `Only ${boilerplatePct}% of the page text is boilerplate (navigation, headers, footers, sidebars). ${100 - boilerplatePct}% is unique content. AI bots get mostly useful content.`,
      severity: 'pass',
      category: 'boilerplate',
      details: {
        boilerplatePercent: boilerplatePct,
        uniqueContentPercent: 100 - boilerplatePct,
        boilerplateWords: boilerplateResult.boilerplateWords,
        uniqueWords: boilerplateResult.uniqueWords,
        totalWords: boilerplateResult.totalWords,
      },
    });
  } else if (boilerplatePct <= 60) {
    findings.push({
      id: 'boilerplate-moderate',
      title: `Moderate boilerplate: ${boilerplatePct}% of page is chrome`,
      description: `${boilerplatePct}% of visible text is boilerplate content (nav, footer, sidebar, etc.). Only ${100 - boilerplatePct}% is unique content. AI bots may extract repetitive elements instead of your key content.`,
      severity: 'warning',
      category: 'boilerplate',
      details: {
        boilerplatePercent: boilerplatePct,
        uniqueContentPercent: 100 - boilerplatePct,
        boilerplateWords: boilerplateResult.boilerplateWords,
        uniqueWords: boilerplateResult.uniqueWords,
      },
      recommendation: 'Increase unique content relative to repeated page chrome. Simplify navigation, reduce footer bloat, and add more substantive content to the main body.',
    });
  } else {
    findings.push({
      id: 'boilerplate-high',
      title: `High boilerplate: ${boilerplatePct}% of page is chrome`,
      description: `${boilerplatePct}% of the page text is boilerplate (navigation, footers, sidebars, cookie banners). Only ${100 - boilerplatePct}% is actual unique content. AI bots see mostly repeated page chrome instead of useful content.`,
      severity: 'fail',
      category: 'boilerplate',
      details: {
        boilerplatePercent: boilerplatePct,
        uniqueContentPercent: 100 - boilerplatePct,
        boilerplateWords: boilerplateResult.boilerplateWords,
        uniqueWords: boilerplateResult.uniqueWords,
      },
      recommendation: 'This page has very little unique content relative to its boilerplate. Add more substantive main body content, or reduce the amount of repeated navigation/footer text.',
    });
  }

  // ===== AI vs HUMAN CONTENT DETECTION =====
  if (wordCount >= 100) {
    const aiSignals = detectAIContent(visibleText, sentences);

    if (aiSignals.score >= 70) {
      findings.push({
        id: 'ai-content-likely-ai',
        title: `Content appears AI-generated (${aiSignals.score}% confidence)`,
        description: `Multiple heuristic signals suggest this content may be AI-generated: ${aiSignals.signals.join(', ')}. AI engines may deprioritize content they detect as AI-written, preferring original human expertise.`,
        severity: 'warning',
        category: 'ai-content',
        details: {
          aiScore: aiSignals.score,
          signals: aiSignals.signals,
          signalDetails: aiSignals.details,
        },
        recommendation: 'If using AI-generated content, add personal expertise, unique data, real examples, and original analysis to make it more authoritative. AI engines value E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).',
      });
    } else if (aiSignals.score >= 40) {
      findings.push({
        id: 'ai-content-mixed',
        title: `Content has some AI-like patterns (${aiSignals.score}% confidence)`,
        description: `Some patterns common in AI-generated content were detected: ${aiSignals.signals.join(', ')}. This could be AI-assisted or just formal writing style.`,
        severity: 'info',
        category: 'ai-content',
        details: {
          aiScore: aiSignals.score,
          signals: aiSignals.signals,
        },
      });
    } else {
      findings.push({
        id: 'ai-content-likely-human',
        title: `Content appears human-written (${100 - aiSignals.score}% confidence)`,
        description: 'The content does not exhibit strong patterns typically associated with AI-generated text. This is positive for E-E-A-T signals.',
        severity: 'pass',
        category: 'ai-content',
        details: {
          aiScore: aiSignals.score,
          humanScore: 100 - aiSignals.score,
        },
      });
    }
  }

  return findings;
}

// ===== Boilerplate Detection =====
function detectBoilerplate($: import('cheerio').CheerioAPI): {
  boilerplatePercent: number;
  boilerplateWords: number;
  uniqueWords: number;
  totalWords: number;
} {
  // Get total visible text
  const $totalClone = $.root().clone();
  $totalClone.find('script, style, noscript, svg, iframe').remove();
  const totalText = $totalClone.text().replace(/\s+/g, ' ').trim();
  const totalWords = totalText.split(/\s+/).filter((w) => w.length > 0).length;

  if (totalWords === 0) {
    return { boilerplatePercent: 0, boilerplateWords: 0, uniqueWords: 0, totalWords: 0 };
  }

  // Count words in boilerplate regions
  const boilerplateSelectors = [
    'nav', 'header', 'footer',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.nav', '.navbar', '.navigation', '.menu', '.sidebar', '.aside',
    '.footer', '.header', '.top-bar', '.bottom-bar',
    '[class*="cookie"]', '[class*="consent"]', '[class*="gdpr"]', '[class*="banner"]',
    '[class*="sidebar"]', '[class*="widget"]', '[class*="social-share"]',
    '[class*="breadcrumb"]', '[class*="pagination"]',
    '[id*="cookie"]', '[id*="consent"]', '[id*="footer"]', '[id*="header"]',
    '[id*="sidebar"]', '[id*="nav"]',
  ];

  let boilerplateWords = 0;
  const counted = new Set<number>();

  for (const selector of boilerplateSelectors) {
    $(selector).each((idx, el) => {
      // Simple dedup by element index to avoid double-counting nested elements
      const key = $(el).parents().length * 10000 + idx;
      if (counted.has(key)) return;
      counted.add(key);

      const $el = $(el).clone();
      $el.find('script, style, noscript, svg').remove();
      const text = $el.text().replace(/\s+/g, ' ').trim();
      boilerplateWords += text.split(/\s+/).filter((w) => w.length > 0).length;
    });
  }

  // Cap at totalWords (nested counting can sometimes over-count)
  boilerplateWords = Math.min(boilerplateWords, totalWords);
  const uniqueWords = totalWords - boilerplateWords;
  const boilerplatePercent = Math.round((boilerplateWords / totalWords) * 100);

  return { boilerplatePercent, boilerplateWords, uniqueWords, totalWords };
}

// ===== AI Content Detection (Heuristic) =====
function detectAIContent(
  text: string,
  sentences: string[]
): { score: number; signals: string[]; details: Record<string, unknown> } {
  const signals: string[] = [];
  const details: Record<string, unknown> = {};
  let score = 0;

  // 1. Common AI filler phrases
  const aiPhrases = [
    /\bit(?:'s| is) (?:important|worth|crucial|essential) to note\b/i,
    /\bin today(?:'s|s) (?:digital|fast-paced|modern|competitive|evolving) (?:landscape|world|era|age)\b/i,
    /\blet(?:'s|s|us) (?:dive|delve|explore|take a (?:closer )?look)\b/i,
    /\bnavigating the (?:complex|evolving|dynamic)\b/i,
    /\bunlock(?:ing)? the (?:power|potential|secrets|key)\b/i,
    /\bin conclusion\b/i,
    /\bfurthermore\b/i,
    /\bmoreover\b/i,
    /\bnevertheless\b/i,
    /\bit(?:'s| is) (?:no secret|widely known|commonly understood)\b/i,
    /\bwhen it comes to\b/i,
    /\bat the end of the day\b/i,
    /\bin the realm of\b/i,
    /\bone (?:might|could|may) argue\b/i,
    /\bthat being said\b/i,
    /\bto sum(?:marize)? up\b/i,
    /\bplay(?:s)? a (?:crucial|vital|pivotal|key|significant) role\b/i,
    /\bgame[\s-]?changer\b/i,
    /\bseamless(?:ly)?\b/i,
    /\bleverage\b/i,
    /\brobust\b/i,
    /\bholistic\b/i,
  ];

  let aiPhraseCount = 0;
  for (const pattern of aiPhrases) {
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      aiPhraseCount += matches.length;
    }
  }

  if (aiPhraseCount >= 5) {
    score += 30;
    signals.push(`${aiPhraseCount} AI-typical phrases`);
  } else if (aiPhraseCount >= 3) {
    score += 20;
    signals.push(`${aiPhraseCount} AI-typical phrases`);
  } else if (aiPhraseCount >= 1) {
    score += 8;
    signals.push(`${aiPhraseCount} AI-typical phrase(s)`);
  }
  details.aiPhraseCount = aiPhraseCount;

  // 2. Sentence length uniformity (AI tends to write uniform-length sentences)
  if (sentences.length >= 5) {
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length);
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);
    const coeffOfVariation = mean > 0 ? (stdDev / mean) * 100 : 0;

    details.sentenceLengthStdDev = Math.round(stdDev * 10) / 10;
    details.sentenceLengthCoeffOfVariation = Math.round(coeffOfVariation);

    // Very low variation = likely AI (humans vary more)
    if (coeffOfVariation < 25) {
      score += 20;
      signals.push('Very uniform sentence lengths');
    } else if (coeffOfVariation < 35) {
      score += 10;
      signals.push('Fairly uniform sentence lengths');
    }
  }

  // 3. Paragraph structure uniformity (AI writes paragraphs of similar length)
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 50);
  if (paragraphs.length >= 4) {
    const paraLengths = paragraphs.map((p) => p.trim().split(/\s+/).length);
    const paraMean = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
    const paraVariance = paraLengths.reduce((sum, len) => sum + Math.pow(len - paraMean, 2), 0) / paraLengths.length;
    const paraStdDev = Math.sqrt(paraVariance);
    const paraCoeffOfVariation = paraMean > 0 ? (paraStdDev / paraMean) * 100 : 0;

    if (paraCoeffOfVariation < 30) {
      score += 15;
      signals.push('Uniform paragraph lengths');
    }
  }

  // 4. Excessive use of transition words at start of sentences
  const transitionStarts = [
    /^(?:additionally|furthermore|moreover|however|consequently|therefore|thus|hence|meanwhile|subsequently|notably|importantly|interestingly|ultimately|essentially)/i,
  ];

  let transitionCount = 0;
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    for (const pattern of transitionStarts) {
      if (pattern.test(trimmed)) {
        transitionCount++;
        break;
      }
    }
  }

  const transitionRatio = sentences.length > 0 ? transitionCount / sentences.length : 0;
  if (transitionRatio > 0.3) {
    score += 15;
    signals.push('Excessive transition words');
  } else if (transitionRatio > 0.2) {
    score += 8;
    signals.push('Frequent transition words');
  }
  details.transitionRatio = Math.round(transitionRatio * 100);

  // 5. Lack of personal pronouns (AI tends to avoid I/we/my)
  const personalPronouns = (text.match(/\b(I|we|my|our|me|us|I've|I'm|we've|we're)\b/g) || []).length;
  const wordsInText = text.split(/\s+/).length;
  const personalPronounRatio = wordsInText > 0 ? personalPronouns / wordsInText : 0;

  if (personalPronounRatio < 0.002 && wordsInText > 200) {
    score += 10;
    signals.push('No personal voice/pronouns');
  }
  details.personalPronounRatio = Math.round(personalPronounRatio * 1000) / 10;

  // Cap at 100
  score = Math.min(score, 100);

  return { score, signals, details };
}
