import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeIntent(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $ } = ctx;

  const $content = $('body').clone();
  $content.find('script, style, nav, footer, header, noscript, svg, iframe').remove();
  const visibleText = $content.text().replace(/\s+/g, ' ').trim();

  // ===== 1. Query intent coverage =====
  const intentTypes: Record<string, { patterns: RegExp[]; label: string }> = {
    informational: {
      patterns: [
        /\bwhat (?:is|are|does|do)\b/i, /\bhow (?:to|do|does|can|did)\b/i,
        /\bwhy (?:is|are|do|does|did)\b/i, /\bwhen (?:is|are|do|does|should)\b/i,
        /\bwho (?:is|are|was)\b/i, /\bguide\b/i, /\bdefinition\b/i,
      ],
      label: 'Informational',
    },
    navigational: {
      patterns: [
        /\blogin\b/i, /\bsign (?:in|up)\b/i, /\bdashboard\b/i,
        /\bmy account\b/i, /\bcontact\b/i, /\bsupport\b/i,
      ],
      label: 'Navigational',
    },
    transactional: {
      patterns: [
        /\bbuy\b/i, /\bpurchase\b/i, /\bpric(?:e|ing)\b/i,
        /\bsubscri(?:be|ption)\b/i, /\bfree trial\b/i, /\bdownload\b/i,
        /\badd to cart\b/i, /\bget started\b/i,
      ],
      label: 'Transactional',
    },
    comparison: {
      patterns: [
        /\bvs\.?\b/i, /\bversus\b/i, /\bcompare[d]?\b/i, /\bcomparison\b/i,
        /\balternative[s]?\b/i, /\bbest\b/i, /\btop \d+\b/i,
        /\bdifference between\b/i, /\bpros and cons\b/i,
      ],
      label: 'Comparison',
    },
  };

  const detectedIntents: string[] = [];
  for (const [, config] of Object.entries(intentTypes)) {
    if (config.patterns.some(p => p.test(visibleText))) {
      detectedIntents.push(config.label);
    }
  }

  if (detectedIntents.length >= 2) {
    findings.push({
      id: 'intent-multi-intent',
      title: `Covers ${detectedIntents.length} intent types: ${detectedIntents.join(', ')}`,
      description: `Content addresses multiple search intents (${detectedIntents.join(', ')}). This broadens the range of AI queries that can cite your page.`,
      severity: 'pass',
      category: 'intent',
      details: { intents: detectedIntents },
    });
  } else if (detectedIntents.length === 1) {
    findings.push({
      id: 'intent-single-intent',
      title: `Single intent detected: ${detectedIntents[0]}`,
      description: `Content primarily serves ${detectedIntents[0].toLowerCase()} intent. Consider expanding to cover related intents for broader AI coverage.`,
      severity: 'info',
      category: 'intent',
    });
  } else {
    findings.push({
      id: 'intent-unclear',
      title: 'No clear search intent detected',
      description: 'Content does not clearly address informational, transactional, comparison, or navigational queries. AI engines match content to user intent — unclear intent reduces citation chances.',
      severity: 'warning',
      category: 'intent',
      recommendation: 'Structure content around specific user questions and intents. Use headings like "What is...", "How to...", "Best..." to signal intent.',
    });
  }

  // ===== 2. Natural language / long-tail query matching =====
  const longTailPatterns = [
    /\bhow (?:do|can|to) (?:I|you|we)\b/i, /\bwhat (?:is|are) the best\b/i,
    /\bwhat happens (?:if|when)\b/i, /\bshould I\b/i,
    /\bis it (?:safe|worth|possible|better)\b/i, /\bcan I\b/i,
    /\bdo I need\b/i, /\bhow (?:much|many|long|often)\b/i,
    /\bwhat(?:'s| is) the difference\b/i, /\bwhere (?:can|do|should) I\b/i,
  ];

  let longTailCount = 0;
  for (const pattern of longTailPatterns) {
    const matches = visibleText.match(new RegExp(pattern, 'gi'));
    if (matches) longTailCount += matches.length;
  }

  if (longTailCount >= 5) {
    findings.push({
      id: 'intent-long-tail',
      title: `${longTailCount} natural language query phrases`,
      description: 'Content uses many conversational, long-tail phrases that match how users query AI assistants. Excellent for intent matching.',
      severity: 'pass',
      category: 'intent',
      details: { count: longTailCount },
    });
  } else if (longTailCount >= 2) {
    findings.push({
      id: 'intent-some-long-tail',
      title: `${longTailCount} natural language query phrases`,
      description: 'Some conversational query phrases found. More would improve alignment with how users ask AI engines questions.',
      severity: 'info',
      category: 'intent',
    });
  } else {
    findings.push({
      id: 'intent-no-long-tail',
      title: 'Content lacks natural language queries',
      description: '70% of users now search using natural language. Content should include phrases like "How do I...", "What is the best...", "Should I..." to match AI query patterns.',
      severity: 'warning',
      category: 'intent',
      recommendation: 'Add headings and content that mirror natural language questions users ask AI assistants.',
    });
  }

  // ===== 3. PAA-style question headings =====
  const questionHeadings: string[] = [];
  $content.find('h2, h3, h4').each((_, el) => {
    const text = $(el).text().trim();
    if (text.endsWith('?') || /^(what|how|why|when|where|who|which|can|does|is|are|do|should|will|would)\b/i.test(text)) {
      questionHeadings.push(text);
    }
  });

  if (questionHeadings.length >= 5) {
    findings.push({
      id: 'intent-paa-rich',
      title: `${questionHeadings.length} PAA-style question headings`,
      description: 'Multiple question-format headings detected. This format directly maps to "People Also Ask" boxes and AI engine queries.',
      severity: 'pass',
      category: 'intent',
      details: { questions: questionHeadings.slice(0, 5) },
    });
  } else if (questionHeadings.length >= 2) {
    findings.push({
      id: 'intent-paa-some',
      title: `${questionHeadings.length} PAA-style question headings`,
      description: 'Some question-format headings found. Adding more would improve PAA and AI query coverage.',
      severity: 'info',
      category: 'intent',
    });
  } else {
    findings.push({
      id: 'intent-paa-none',
      title: 'No question-format headings for PAA',
      description: 'No headings phrased as questions. Question headings directly target "People Also Ask" results and AI engine answer extraction.',
      severity: 'warning',
      category: 'intent',
      recommendation: 'Convert key section headings to question format: "What is X?", "How does Y work?", "Why is Z important?"',
    });
  }

  // ===== 4. Topic depth / topical authority =====
  const headingTexts: string[] = [];
  $content.find('h2, h3').each((_, el) => {
    headingTexts.push($(el).text().trim().toLowerCase());
  });

  const wordCount = visibleText.split(/\s+/).filter(w => w.length > 0).length;
  const uniqueHeadingTopics = new Set(headingTexts.map(h => h.split(/\s+/).slice(0, 3).join(' ')));

  if (uniqueHeadingTopics.size >= 5 && wordCount >= 800) {
    findings.push({
      id: 'intent-topic-depth',
      title: 'Strong topical depth detected',
      description: `${uniqueHeadingTopics.size} distinct subtopics across ${wordCount} words. Comprehensive topic coverage builds topical authority for AI engines.`,
      severity: 'pass',
      category: 'intent',
      details: { subtopics: uniqueHeadingTopics.size, wordCount },
    });
  } else if (uniqueHeadingTopics.size >= 3 && wordCount >= 400) {
    findings.push({
      id: 'intent-topic-moderate',
      title: 'Moderate topical coverage',
      description: `${uniqueHeadingTopics.size} subtopics across ${wordCount} words. Deeper coverage would strengthen topical authority.`,
      severity: 'info',
      category: 'intent',
    });
  } else if (wordCount < 400) {
    findings.push({
      id: 'intent-topic-thin',
      title: 'Insufficient topic depth',
      description: 'Content is too thin to establish topical authority. AI engines prefer comprehensive, in-depth content that fully covers a topic.',
      severity: 'warning',
      category: 'intent',
      recommendation: 'Expand content with more subtopics, examples, and related questions. Aim for 800+ words with 5+ distinct sections.',
    });
  }

  // ===== 5. Related content section =====
  const relatedTopicIndicators = [
    /\brelated (?:topics?|articles?|posts?|resources?)\b/i,
    /\bsee also\b/i, /\bfurther reading\b/i,
    /\byou may also like\b/i, /\blearn more about\b/i,
  ];

  if (relatedTopicIndicators.some(p => p.test(visibleText))) {
    findings.push({
      id: 'intent-related-content',
      title: 'Related content/topics section found',
      description: 'A "Related topics" or "Further reading" section detected. This signals topical breadth and helps AI engines understand content relationships.',
      severity: 'pass',
      category: 'intent',
    });
  }

  return findings;
}
