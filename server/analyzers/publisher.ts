import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

// Signals that indicate a publisher/content/news site
const PUBLISHER_SIGNALS = {
  schemaTypes: ['Article', 'NewsArticle', 'BlogPosting', 'WebPage', 'TechArticle', 'ScholarlyArticle', 'Report'],
  urlPatterns: [
    /\/blog\//i,
    /\/article[s]?\//i,
    /\/news\//i,
    /\/post[s]?\//i,
    /\/stories?\//i,
    /\/\d{4}\/\d{2}\//i,  // /2024/01/ date-based URLs
    /\/insights?\//i,
    /\/resources?\//i,
    /\/guides?\//i,
    /\/learn\//i,
  ],
  htmlPatterns: [
    /class="[^"]*article[^"]*"/i,
    /class="[^"]*post-content[^"]*"/i,
    /class="[^"]*entry-content[^"]*"/i,
    /class="[^"]*blog[^"]*"/i,
    /role="article"/i,
    /<article\b/i,
  ],
};

interface PublisherDetection {
  isPublisher: boolean;
  confidence: number;
  signals: string[];
  contentType: string | null; // 'article', 'blog', 'news', etc.
}

export function detectPublisher(ctx: AnalysisContext): PublisherDetection {
  const { $, html, url } = ctx;
  const signals: string[] = [];
  let score = 0;
  let contentType: string | null = null;

  // Check for Article schema
  const jsonLdBlocks: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (text) jsonLdBlocks.push(text);
  });
  const jsonLdText = jsonLdBlocks.join(' ');

  for (const schemaType of PUBLISHER_SIGNALS.schemaTypes) {
    if (jsonLdText.includes(`"${schemaType}"`) || jsonLdText.includes(`"@type":"${schemaType}"`) || jsonLdText.includes(`"@type": "${schemaType}"`)) {
      score += 3;
      signals.push(`${schemaType} schema detected`);
      if (!contentType) {
        if (/News/i.test(schemaType)) contentType = 'news';
        else if (/Blog/i.test(schemaType)) contentType = 'blog';
        else contentType = 'article';
      }
    }
  }

  // Check URL patterns
  for (const pattern of PUBLISHER_SIGNALS.urlPatterns) {
    if (pattern.test(url)) {
      score += 2;
      signals.push(`Publisher URL pattern: ${pattern.source}`);
      if (!contentType) contentType = 'article';
    }
  }

  // Check HTML patterns
  for (const pattern of PUBLISHER_SIGNALS.htmlPatterns) {
    if (pattern.test(html)) {
      score += 1;
      signals.push('Article HTML structure detected');
      break;
    }
  }

  // Check for <article> tag
  if ($('article').length > 0) {
    score += 2;
    signals.push('<article> HTML element found');
  }

  // Check for author/byline
  if ($('[class*="author"], [rel="author"], [itemprop="author"]').length > 0 ||
      /by\s+[A-Z][a-z]+\s+[A-Z]/i.test($('body').text().slice(0, 3000))) {
    score += 2;
    signals.push('Author byline detected');
  }

  // Check for publish date
  if ($('time[datetime], [class*="publish"], [class*="date"], [itemprop="datePublished"]').length > 0) {
    score += 1;
    signals.push('Publication date detected');
  }

  // Check for category/tag pages
  if (/\/category\//i.test(url) || /\/tag\//i.test(url) || /\/topic\//i.test(url)) {
    score += 2;
    signals.push('Category/tag page');
    if (!contentType) contentType = 'category';
  }

  // Check for CMS markers
  if (/wp-content/i.test(html) || /wordpress/i.test(html)) {
    score += 1;
    signals.push('WordPress CMS detected');
  }
  if (/ghost\.io/i.test(html) || /ghost-/i.test(html)) {
    score += 1;
    signals.push('Ghost CMS detected');
  }
  if (/medium\.com/i.test(url) || /substack/i.test(url)) {
    score += 2;
    signals.push('Publishing platform detected');
  }

  const confidence = Math.min(100, Math.round((score / 12) * 100));

  return {
    isPublisher: score >= 4,
    confidence,
    signals,
    contentType,
  };
}

export function analyzePublisher(ctx: AnalysisContext): Finding[] {
  const detection = detectPublisher(ctx);

  if (!detection.isPublisher) {
    return [];
  }

  const findings: Finding[] = [];
  const { $, html } = ctx;

  // Report detection
  findings.push({
    id: 'pub-detected',
    title: `Publisher/content page detected${detection.contentType ? ` (${detection.contentType})` : ''} (${detection.confidence}% confidence)`,
    description: 'This page was identified as a publisher/content page. The following publisher-specific AEO checks were performed.',
    severity: 'info',
    category: 'publisher',
    details: { contentType: detection.contentType, confidence: detection.confidence, signals: detection.signals },
  });

  // Parse JSON-LD for article data
  const jsonLdBlocks: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (text) {
      try {
        jsonLdBlocks.push(JSON.parse(text));
      } catch { /* skip */ }
    }
  });
  const allJsonLdText = JSON.stringify(jsonLdBlocks);
  const bodyText = $('body').clone().find('script, style, noscript, svg').remove().end().text();

  // ===== ARTICLE SCHEMA COMPLETENESS =====
  const hasArticleSchema = /\"(Article|NewsArticle|BlogPosting|TechArticle)\"/i.test(allJsonLdText);

  if (hasArticleSchema) {
    findings.push({
      id: 'pub-article-schema',
      title: 'Article schema markup found',
      description: 'Article structured data is present. AI engines use this to understand your content type, author, and publication details for citations in AI-generated answers.',
      severity: 'pass',
      category: 'publisher',
    });

    // Validate article schema fields
    const articleFields: Record<string, boolean> = {
      headline: /"headline"/i.test(allJsonLdText),
      author: /"author"/i.test(allJsonLdText),
      datePublished: /"datePublished"/i.test(allJsonLdText),
      dateModified: /"dateModified"/i.test(allJsonLdText),
      publisher: /"publisher"/i.test(allJsonLdText),
      image: /"image"/i.test(allJsonLdText),
      description: /"description"/i.test(allJsonLdText),
    };

    const missingFields = Object.entries(articleFields).filter(([, v]) => !v).map(([k]) => k);
    const presentFields = Object.entries(articleFields).filter(([, v]) => v).map(([k]) => k);

    if (missingFields.length > 0) {
      const critical = missingFields.filter(f => ['author', 'datePublished', 'headline'].includes(f));
      findings.push({
        id: 'pub-schema-incomplete',
        title: `Article schema missing: ${missingFields.join(', ')}`,
        description: `Your Article schema is missing ${missingFields.length} field(s). ${critical.length > 0 ? `Critical: ${critical.join(', ')} are essential for AI engine citations.` : 'These fields improve how AI engines cite your content.'}`,
        severity: critical.length > 0 ? 'fail' : 'warning',
        category: 'publisher',
        recommendation: `Add these to your Article schema: ${missingFields.join(', ')}. ${critical.includes('author') ? 'Author is critical - Google prioritizes content with clear authorship.' : ''}`,
        details: { missingFields, presentFields },
      });
    } else {
      findings.push({
        id: 'pub-schema-complete',
        title: 'Article schema is comprehensive',
        description: 'All key Article schema fields are present (headline, author, dates, publisher, image). This maximizes your chances of being cited by AI engines.',
        severity: 'pass',
        category: 'publisher',
      });
    }

    // Check dateModified specifically (freshness signal)
    if (articleFields.dateModified) {
      findings.push({
        id: 'pub-date-modified',
        title: 'Content freshness signal (dateModified) present',
        description: 'dateModified is set in schema. AI engines prefer fresh, recently updated content for their answers. This signals that your content is maintained.',
        severity: 'pass',
        category: 'publisher',
      });
    } else {
      findings.push({
        id: 'pub-no-date-modified',
        title: 'No dateModified in schema',
        description: 'dateModified is missing. AI engines use this to determine content freshness. Without it, your content may be perceived as stale.',
        severity: 'warning',
        category: 'publisher',
        recommendation: 'Add dateModified to your Article schema and update it whenever content is revised.',
      });
    }
  } else {
    findings.push({
      id: 'pub-no-article-schema',
      title: 'No Article schema markup',
      description: 'No Article/NewsArticle/BlogPosting schema found. Without this, AI engines have no structured way to identify your author, publication date, or content type. This reduces your chances of being cited.',
      severity: 'fail',
      category: 'publisher',
      recommendation: 'Add Article schema (JSON-LD) with headline, author (with name and URL), datePublished, dateModified, publisher, and image.',
    });
  }

  // ===== AUTHOR / E-E-A-T SIGNALS =====

  // Author byline
  const authorElements = $('[class*="author"], [rel="author"], [itemprop="author"], .byline, .post-author, .article-author');
  const hasVisibleAuthor = authorElements.length > 0;
  const authorText = authorElements.first().text().trim();

  if (hasVisibleAuthor && authorText.length > 2) {
    findings.push({
      id: 'pub-author-visible',
      title: `Author byline visible: "${authorText.slice(0, 50)}${authorText.length > 50 ? '...' : ''}"`,
      description: 'An author byline is visible on the page. Google\'s E-E-A-T guidelines emphasize showing who wrote the content. AI engines like Perplexity and Google AI Overviews cite authors.',
      severity: 'pass',
      category: 'publisher',
    });
  } else {
    // Try to find author from text patterns
    const firstParagraphs = bodyText.slice(0, 5000);
    const bylineMatch = firstParagraphs.match(/(?:by|written by|author[:\s]+)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);

    if (bylineMatch) {
      findings.push({
        id: 'pub-author-text',
        title: `Author found in text: "${bylineMatch[1]}"`,
        description: 'An author name was found in the text, but it\'s not in a structured author element. AI bots may have difficulty extracting this.',
        severity: 'warning',
        category: 'publisher',
        recommendation: 'Wrap the author name in a semantic HTML element with class="author" or itemprop="author" for better AI extraction.',
      });
    } else {
      findings.push({
        id: 'pub-no-author',
        title: 'No author byline found',
        description: 'No author attribution is visible on the page. Content without clear authorship is less likely to be cited by AI engines and scores lower on E-E-A-T.',
        severity: 'fail',
        category: 'publisher',
        recommendation: 'Add a visible author byline with the author\'s name. Link to an author bio page with credentials and expertise.',
      });
    }
  }

  // Author page link
  const authorLinks = $('a[href*="/author/"], a[rel="author"], a[href*="/profile/"], [class*="author"] a');
  if (authorLinks.length > 0) {
    findings.push({
      id: 'pub-author-page-link',
      title: 'Author profile link found',
      description: 'A link to the author\'s profile/bio page exists. This strengthens E-E-A-T and helps AI engines understand author expertise and credibility.',
      severity: 'pass',
      category: 'publisher',
    });
  } else if (hasVisibleAuthor) {
    findings.push({
      id: 'pub-no-author-page',
      title: 'Author name shown but no profile link',
      description: 'The author is named but not linked to a profile page. An author page with bio, credentials, and other articles boosts E-E-A-T for AI engines.',
      severity: 'warning',
      category: 'publisher',
      recommendation: 'Link the author name to a dedicated author page with bio, expertise, qualifications, and links to other articles.',
    });
  }

  // ===== CITATION & SOURCE QUALITY =====
  // This is KEY for AI content detection - AI-generated content typically lacks citations

  const bodyHtml = $('body').html() || '';
  const articleBody = $('article, .post-content, .entry-content, .article-body, [class*="article"], main').text() || bodyText;

  // Count outbound links (citations/sources)
  const outboundLinks: string[] = [];
  const currentDomain = new URL(ctx.url).hostname;
  $('article a[href], .post-content a[href], .entry-content a[href], main a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    try {
      if (href.startsWith('http')) {
        const linkDomain = new URL(href).hostname;
        if (linkDomain !== currentDomain) {
          outboundLinks.push(href);
        }
      }
    } catch { /* skip invalid URLs */ }
  });

  if (outboundLinks.length >= 3) {
    findings.push({
      id: 'pub-citations-good',
      title: `${outboundLinks.length} external source links (citations)`,
      description: `The article links to ${outboundLinks.length} external sources. Well-cited content is more trustworthy and more likely to be featured in AI answers. AI engines prioritize content that references authoritative sources.`,
      severity: 'pass',
      category: 'publisher',
      details: { outboundLinks: outboundLinks.slice(0, 10) },
    });
  } else if (outboundLinks.length > 0) {
    findings.push({
      id: 'pub-citations-few',
      title: `Only ${outboundLinks.length} external source link(s)`,
      description: `The article has ${outboundLinks.length} external link(s). Adding more citations to authoritative sources improves content credibility for AI engines.`,
      severity: 'warning',
      category: 'publisher',
      recommendation: 'Add links to authoritative sources (research papers, official docs, expert sites) that back up your claims.',
      details: { outboundLinks },
    });
  } else {
    findings.push({
      id: 'pub-no-citations',
      title: 'No external source links (zero citations)',
      description: 'The article contains NO outbound links to external sources. This is a major red flag for AI engines - well-researched content cites its sources. Content without citations appears AI-generated or unverified.',
      severity: 'fail',
      category: 'publisher',
      recommendation: 'Add citations to authoritative external sources. Link to research, studies, official documentation, or expert sources that support your claims.',
    });
  }

  // ===== QUOTES & EXPERT OPINIONS =====
  const quoteElements = $('blockquote, q, [class*="quote"], [class*="pullquote"]');
  const hasQuoteMarks = /"[^"]{20,}"/.test(articleBody) || /\u201C[^\u201D]{20,}\u201D/.test(articleBody);

  if (quoteElements.length > 0 || hasQuoteMarks) {
    findings.push({
      id: 'pub-quotes-found',
      title: `Expert quotes/citations found${quoteElements.length > 0 ? ` (${quoteElements.length} blockquote(s))` : ''}`,
      description: 'The article includes quotes or expert opinions. Original quotes from experts are a strong signal of original reporting and are highly valued by AI engines.',
      severity: 'pass',
      category: 'publisher',
    });
  } else {
    findings.push({
      id: 'pub-no-quotes',
      title: 'No expert quotes or citations found',
      description: 'No blockquotes, expert quotes, or cited opinions found. AI-generated content typically lacks original quotes. Including expert perspectives strengthens E-E-A-T.',
      severity: 'warning',
      category: 'publisher',
      recommendation: 'Add expert quotes, interview excerpts, or cited opinions using <blockquote> tags. This signals original reporting.',
    });
  }

  // ===== DATA / STATISTICS =====
  // Check for data, numbers, statistics - signs of well-researched content
  const statPatterns = [
    /\d+%/,                           // percentages
    /\$[\d,.]+\s*(million|billion|trillion|M|B|K)/i,  // monetary figures
    /\d+\.\d+x/,                      // multipliers
    /according to (?:a |the )?(?:study|research|report|survey|data)/i,
    /research (?:shows?|finds?|suggests?|indicates?|reveals?)/i,
    /study (?:shows?|finds?|published|conducted)/i,
    /data (?:shows?|reveals?|suggests?|indicates?)/i,
    /survey (?:of|found|shows?|reveals?)/i,
    /statistics? (?:show|from|indicate)/i,
  ];

  let statCount = 0;
  for (const pattern of statPatterns) {
    if (pattern.test(articleBody)) statCount++;
  }

  if (statCount >= 3) {
    findings.push({
      id: 'pub-data-rich',
      title: `Data-rich content (${statCount} statistical references)`,
      description: 'The article references statistics, research findings, and data points. Data-backed content is more likely to be cited by AI engines in factual answers.',
      severity: 'pass',
      category: 'publisher',
      details: { statCount },
    });
  } else if (statCount >= 1) {
    findings.push({
      id: 'pub-some-data',
      title: `Some data references (${statCount})`,
      description: 'The article has some statistical references. Adding more data points strengthens credibility.',
      severity: 'info',
      category: 'publisher',
      details: { statCount },
    });
  } else {
    findings.push({
      id: 'pub-no-data',
      title: 'No statistics or data references',
      description: 'No statistics, research references, or data points found. Content without factual data appears opinion-based or AI-generated. AI engines prefer data-backed content for factual queries.',
      severity: 'warning',
      category: 'publisher',
      recommendation: 'Include relevant statistics, research findings, or data to support your claims. Reference specific studies or reports.',
    });
  }

  // ===== CONTENT DEPTH / WORD COUNT =====
  const cleanText = articleBody.replace(/\s+/g, ' ').trim();
  const wordCount = cleanText.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 1500) {
    findings.push({
      id: 'pub-content-depth-good',
      title: `In-depth content: ${wordCount} words`,
      description: `The article contains ${wordCount} words. Long-form, comprehensive content is more likely to be used by AI engines for detailed answers. Google AI Overviews favor thorough coverage.`,
      severity: 'pass',
      category: 'publisher',
      details: { wordCount },
    });
  } else if (wordCount >= 600) {
    findings.push({
      id: 'pub-content-depth-moderate',
      title: `Moderate content length: ${wordCount} words`,
      description: `The article has ${wordCount} words. While acceptable, longer and more comprehensive content (1500+ words) tends to perform better in AI answers.`,
      severity: 'info',
      category: 'publisher',
      details: { wordCount },
    });
  } else if (wordCount >= 100) {
    findings.push({
      id: 'pub-content-thin',
      title: `Thin content: only ${wordCount} words`,
      description: `The article has only ${wordCount} words. Thin content is less likely to be cited by AI engines. Google specifically targets thin content in its quality guidelines.`,
      severity: 'warning',
      category: 'publisher',
      recommendation: 'Expand the article with more depth, analysis, examples, and supporting evidence. Aim for at least 800-1500 words for comprehensive coverage.',
      details: { wordCount },
    });
  }

  // ===== AI CONTENT SIGNALS (NEGATIVE) =====
  // Composite check - content that looks AI-generated typically has:
  // - No citations/outbound links
  // - No quotes
  // - No data/stats
  // - No author
  // - Generic structure

  let aiContentScore = 0;
  if (outboundLinks.length === 0) aiContentScore += 2;
  if (quoteElements.length === 0 && !hasQuoteMarks) aiContentScore += 2;
  if (statCount === 0) aiContentScore += 1;
  if (!hasVisibleAuthor) aiContentScore += 2;

  // Check for generic AI content patterns
  const aiPhrases = [
    /in today'?s (?:digital|fast-paced|modern|ever-changing|rapidly evolving)/i,
    /in this (?:comprehensive|complete|ultimate|definitive) guide/i,
    /let'?s (?:dive|delve|explore) (?:in|into|deeper)/i,
    /in conclusion,?\s/i,
    /it'?s (?:worth noting|important to note|crucial to understand)/i,
    /whether you'?re a (?:beginner|seasoned|experienced)/i,
    /look no further/i,
    /the (?:landscape|world) of .{5,30} is (?:constantly |rapidly )?(?:evolving|changing)/i,
    /unlock (?:the (?:power|potential|secrets)|your)/i,
    /game[\s-]?changer/i,
    /revolutioniz(?:e|ing)/i,
    /seamless(?:ly)?/i,
    /elevat(?:e|ing) your/i,
  ];

  let aiPhraseCount = 0;
  for (const pattern of aiPhrases) {
    if (pattern.test(articleBody)) aiPhraseCount++;
  }

  if (aiPhraseCount >= 3) {
    aiContentScore += 2;
  } else if (aiPhraseCount >= 1) {
    aiContentScore += 1;
  }

  // Check for first-person experience (positive - NOT AI)
  const hasFirstPerson = /\bI (?:found|tested|tried|used|believe|think|recommend|noticed|discovered|experienced|interviewed)\b/i.test(articleBody);
  const hasExperience = /(?:in my experience|from my testing|when I tested|I personally|our team|we found|we tested)/i.test(articleBody);

  if (hasFirstPerson || hasExperience) {
    aiContentScore -= 2; // Reduce AI score
    findings.push({
      id: 'pub-first-person',
      title: 'First-person experience detected',
      description: 'The content includes first-person experience ("I tested", "we found"). This is a strong signal of original, experience-based content that AI engines value for E-E-A-T.',
      severity: 'pass',
      category: 'publisher',
    });
  }

  // Final AI content assessment
  if (aiContentScore >= 6) {
    findings.push({
      id: 'pub-ai-content-risk',
      title: 'High risk: Content appears AI-generated',
      description: `Multiple signals suggest this content may be AI-generated: no citations (${outboundLinks.length}), no expert quotes, no data references, ${!hasVisibleAuthor ? 'no author,' : ''} and ${aiPhraseCount} generic AI phrases detected. Google and AI engines are actively downranking AI-generated content without original value.`,
      severity: 'fail',
      category: 'publisher',
      recommendation: 'Add original value: cite external sources, include expert quotes, add data/statistics, show author expertise, and include first-person experience or original analysis.',
      details: { aiContentScore, aiPhraseCount, outboundLinks: outboundLinks.length, hasAuthor: hasVisibleAuthor, hasQuotes: quoteElements.length > 0, hasData: statCount > 0 },
    });
  } else if (aiContentScore >= 4) {
    findings.push({
      id: 'pub-ai-content-warning',
      title: 'Moderate risk: Content lacks original signals',
      description: `The content is missing several signals of original reporting (citations, quotes, data, experience). While not necessarily AI-generated, it may be perceived as low-quality by AI engines.`,
      severity: 'warning',
      category: 'publisher',
      recommendation: 'Strengthen the content with external citations, expert quotes, data references, and first-person experience.',
      details: { aiContentScore, aiPhraseCount },
    });
  } else {
    findings.push({
      id: 'pub-original-content',
      title: 'Content appears original and well-sourced',
      description: 'The content shows strong signals of original reporting: citations, data, author attribution, and/or first-person experience. This type of content is preferred by AI engines.',
      severity: 'pass',
      category: 'publisher',
      details: { aiContentScore },
    });
  }

  // ===== CONTENT FRESHNESS =====
  const publishDateEl = $('time[datetime], [itemprop="datePublished"], [class*="publish-date"], [class*="post-date"]');
  const modifiedDateEl = $('[itemprop="dateModified"], [class*="updated"], [class*="modified"]');

  if (publishDateEl.length > 0) {
    const dateStr = publishDateEl.attr('datetime') || publishDateEl.text().trim();
    findings.push({
      id: 'pub-date-visible',
      title: `Publication date visible: ${dateStr.slice(0, 30)}`,
      description: 'Publication date is visible to readers and bots. This helps AI engines assess content freshness and relevance.',
      severity: 'pass',
      category: 'publisher',
    });

    if (modifiedDateEl.length > 0) {
      findings.push({
        id: 'pub-modified-date',
        title: 'Last modified date present',
        description: 'A "last modified" or "updated" date is shown. This signals to AI engines that content is actively maintained and current.',
        severity: 'pass',
        category: 'publisher',
      });
    }
  } else {
    findings.push({
      id: 'pub-no-date',
      title: 'No publication date visible',
      description: 'No visible publication or last updated date found. AI engines may consider undated content as potentially stale or unreliable.',
      severity: 'warning',
      category: 'publisher',
      recommendation: 'Display the publication date and last updated date prominently. Use <time datetime="..."> for machine readability.',
    });
  }

  // ===== TABLE OF CONTENTS =====
  const hasTOC = $('[class*="toc"], [class*="table-of-contents"], [id*="toc"], nav[aria-label*="content" i]').length > 0;
  const headingCount = $('h2, h3').length;

  if (hasTOC) {
    findings.push({
      id: 'pub-toc',
      title: 'Table of Contents present',
      description: 'A table of contents helps AI engines navigate your article structure and extract specific sections for answers.',
      severity: 'pass',
      category: 'publisher',
    });
  } else if (headingCount >= 5) {
    findings.push({
      id: 'pub-no-toc',
      title: 'No Table of Contents (article has many sections)',
      description: `The article has ${headingCount} sections but no table of contents. A TOC improves navigation and helps AI engines understand content structure.`,
      severity: 'info',
      category: 'publisher',
      recommendation: 'Add a table of contents with anchor links for articles with 5+ sections.',
    });
  }

  // ===== ORIGINAL IMAGES =====
  const images = $('article img, .post-content img, .entry-content img, main img');
  let imagesWithCaption = 0;
  let imagesWithAlt = 0;
  const totalArticleImages = images.length;

  images.each((_, el) => {
    if ($(el).attr('alt')?.trim()) imagesWithAlt++;
    if ($(el).parent('figure').find('figcaption').length > 0 || $(el).next('figcaption').length > 0) {
      imagesWithCaption++;
    }
  });

  if (totalArticleImages > 0) {
    if (imagesWithCaption > 0) {
      findings.push({
        id: 'pub-images-captioned',
        title: `${imagesWithCaption} of ${totalArticleImages} image(s) have captions`,
        description: 'Images with captions provide additional context for AI bots. Captioned images signal original or curated visual content.',
        severity: 'pass',
        category: 'publisher',
      });
    } else {
      findings.push({
        id: 'pub-images-no-captions',
        title: `${totalArticleImages} image(s) but no captions`,
        description: 'Article images lack captions. Adding <figcaption> provides context and signals original content to AI engines.',
        severity: 'info',
        category: 'publisher',
        recommendation: 'Wrap images in <figure> with <figcaption> tags describing the image content.',
      });
    }
  }

  return findings;
}
