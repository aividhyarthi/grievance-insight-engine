import type { Finding } from '../../shared/types.js';
import { GEO_SCHEMA_TYPES } from '../../shared/constants.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeSchema(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $ } = ctx;

  // Extract JSON-LD blocks
  const jsonLdBlocks: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        jsonLdBlocks.push(parsed);
      } catch {
        findings.push({
          id: `schema-jsonld-invalid-${findings.length}`,
          title: 'Invalid JSON-LD markup',
          description:
            'A <script type="application/ld+json"> block contains invalid JSON. AI bots cannot parse this structured data.',
          severity: 'fail',
          category: 'schema',
          recommendation:
            'Fix the JSON syntax in your JSON-LD block. Use a JSON validator to check for errors.',
        });
      }
    }
  });

  if (jsonLdBlocks.length === 0) {
    // Check for microdata
    const hasMicrodata =
      $('[itemscope]').length > 0 || $('[itemtype]').length > 0;

    if (hasMicrodata) {
      findings.push({
        id: 'schema-microdata-found',
        title: 'Microdata markup detected',
        description:
          'The page uses Microdata (itemscope/itemtype) for structured data. JSON-LD is preferred by search engines and AI bots for easier parsing.',
        severity: 'warning',
        category: 'schema',
        recommendation:
          'Consider migrating from Microdata to JSON-LD format, which is recommended by Google.',
      });
    } else {
      findings.push({
        id: 'schema-none',
        title: 'No structured data found',
        description:
          'The page has no JSON-LD or Microdata markup. Structured data helps AI bots understand your content context, entity relationships, and answer-worthiness.',
        severity: 'fail',
        category: 'schema',
        recommendation:
          'Add JSON-LD structured data. Start with Organization, WebPage, and content-specific types like Article, FAQPage, or HowTo.',
      });
    }
  } else {
    findings.push({
      id: 'schema-jsonld-found',
      title: `${jsonLdBlocks.length} JSON-LD block(s) found`,
      description: `The page has ${jsonLdBlocks.length} valid JSON-LD structured data block(s).`,
      severity: 'pass',
      category: 'schema',
      details: { count: jsonLdBlocks.length },
    });
  }

  // Analyze detected schema types
  const detectedTypes = new Set<string>();
  function extractTypes(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(extractTypes);
      return;
    }
    const record = obj as Record<string, unknown>;
    if (typeof record['@type'] === 'string') {
      detectedTypes.add(record['@type']);
    } else if (Array.isArray(record['@type'])) {
      (record['@type'] as string[]).forEach((t) => detectedTypes.add(t));
    }
    if (record['@graph'] && Array.isArray(record['@graph'])) {
      (record['@graph'] as unknown[]).forEach(extractTypes);
    }
  }

  jsonLdBlocks.forEach(extractTypes);

  if (detectedTypes.size > 0) {
    findings.push({
      id: 'schema-types-detected',
      title: `Schema types: ${[...detectedTypes].join(', ')}`,
      description: `Detected ${detectedTypes.size} schema type(s) on this page.`,
      severity: 'info',
      category: 'schema',
      details: { types: [...detectedTypes] },
    });

    // Check for high-value GEO types
    const geoTypes = [...detectedTypes].filter((t) =>
      GEO_SCHEMA_TYPES.includes(t)
    );
    const missingGeoTypes = GEO_SCHEMA_TYPES.filter(
      (t) => !detectedTypes.has(t)
    );

    if (geoTypes.length > 0) {
      findings.push({
        id: 'schema-geo-types',
        title: `${geoTypes.length} GEO-relevant schema type(s)`,
        description: `Found high-value schema types for AI/GEO: ${geoTypes.join(', ')}. These help AI engines understand and cite your content.`,
        severity: 'pass',
        category: 'schema',
        details: { geoTypes },
      });
    }

    // Check for Organization schema
    if (!detectedTypes.has('Organization') && !detectedTypes.has('LocalBusiness')) {
      findings.push({
        id: 'schema-no-org',
        title: 'No Organization schema',
        description:
          'No Organization or LocalBusiness schema found. This schema helps AI engines identify your brand and connect your content to your entity.',
        severity: 'warning',
        category: 'schema',
        recommendation:
          'Add Organization schema with name, logo, url, and sameAs (social profiles).',
      });
    }

    // Check for Article/BlogPosting/WebPage
    const hasContentType = ['Article', 'NewsArticle', 'BlogPosting', 'WebPage'].some(
      (t) => detectedTypes.has(t)
    );
    if (!hasContentType) {
      findings.push({
        id: 'schema-no-content-type',
        title: 'No page content schema type',
        description:
          'No Article, BlogPosting, or WebPage schema found. These schemas help AI understand the nature and structure of your page content.',
        severity: 'warning',
        category: 'schema',
        recommendation:
          'Add Article or WebPage schema with headline, datePublished, author, and description.',
      });
    }

    // Check for FAQPage schema (highly valuable for AEO)
    if (detectedTypes.has('FAQPage')) {
      findings.push({
        id: 'schema-faq',
        title: 'FAQPage schema detected',
        description:
          'FAQPage schema is present, which is highly valuable for AEO. AI engines can directly extract Q&A pairs from this markup.',
        severity: 'pass',
        category: 'schema',
      });
    }

    // Check for BreadcrumbList
    if (!detectedTypes.has('BreadcrumbList')) {
      findings.push({
        id: 'schema-no-breadcrumb',
        title: 'No BreadcrumbList schema',
        description:
          'BreadcrumbList schema helps AI bots understand page hierarchy and site structure.',
        severity: 'info',
        category: 'schema',
        recommendation: 'Add BreadcrumbList schema to clarify page position within your site.',
      });
    }

    // Validate key schema properties
    jsonLdBlocks.forEach((block) => {
      validateSchemaProperties(block, findings);
    });
  }

  return findings;
}

function validateSchemaProperties(
  obj: unknown,
  findings: Finding[]
): void {
  if (!obj || typeof obj !== 'object') return;

  const record = obj as Record<string, unknown>;
  const type = record['@type'] as string | undefined;

  if (!type) return;

  // Validate Article-type schemas
  if (['Article', 'NewsArticle', 'BlogPosting'].includes(type)) {
    if (!record.author) {
      findings.push({
        id: `schema-article-no-author`,
        title: `${type} schema missing "author"`,
        description: `The ${type} schema is missing the "author" property. Author attribution is critical for E-E-A-T and AI trust signals.`,
        severity: 'warning',
        category: 'schema',
        recommendation: `Add an "author" property (as a Person or Organization) to your ${type} schema.`,
      });
    }
    if (!record.datePublished) {
      findings.push({
        id: `schema-article-no-date`,
        title: `${type} schema missing "datePublished"`,
        description: `The ${type} schema is missing "datePublished". AI engines use publication dates to assess content freshness.`,
        severity: 'warning',
        category: 'schema',
        recommendation: `Add "datePublished" (and "dateModified") to your ${type} schema.`,
      });
    }
  }

  // Validate Organization schema
  if (type === 'Organization') {
    if (!record.logo) {
      findings.push({
        id: 'schema-org-no-logo',
        title: 'Organization schema missing "logo"',
        description:
          'Your Organization schema is missing a logo. Logos help AI engines visually identify your brand.',
        severity: 'warning',
        category: 'schema',
        recommendation: 'Add a "logo" property with a URL to your brand logo.',
      });
    }
    if (!record.sameAs) {
      findings.push({
        id: 'schema-org-no-sameas',
        title: 'Organization schema missing "sameAs"',
        description:
          'No "sameAs" property found. This property links to your social media profiles, helping AI engines build your brand knowledge graph.',
        severity: 'info',
        category: 'schema',
        recommendation:
          'Add "sameAs" with links to your LinkedIn, Twitter, Facebook, and other official profiles.',
      });
    }
  }

  // Recurse into @graph
  if (record['@graph'] && Array.isArray(record['@graph'])) {
    (record['@graph'] as unknown[]).forEach((item) =>
      validateSchemaProperties(item, findings)
    );
  }
}
