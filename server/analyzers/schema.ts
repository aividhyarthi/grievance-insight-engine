import type { Finding } from '../../shared/types.js';
import { GEO_SCHEMA_TYPES } from '../../shared/constants.js';
import type { AnalysisContext } from '../services/orchestrator.js';

// Decode common HTML entities that cheerio may inject into JSON-LD content
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&apos;/g, "'");
}

// Attempt to parse JSON with various fallbacks for messy real-world JSON-LD
function safeJsonParse(text: string): unknown | null {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch { /* fallthrough */ }

  // Try after decoding HTML entities
  try {
    return JSON.parse(decodeHtmlEntities(text));
  } catch { /* fallthrough */ }

  // Try stripping HTML comments and CDATA
  try {
    const cleaned = text
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<!\[CDATA\[/g, '')
      .replace(/\]\]>/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch { /* fallthrough */ }

  // Try fixing trailing commas (common CMS bug)
  try {
    const fixed = text
      .replace(/,\s*}/g, '}')
      .replace(/,\s*\]/g, ']');
    return JSON.parse(decodeHtmlEntities(fixed));
  } catch { /* fallthrough */ }

  return null;
}

// Extract @type from a schema object, handling string, array, and namespaced types
function extractSchemaTypes(obj: unknown, types: Set<string>): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach((item) => extractSchemaTypes(item, types));
    return;
  }

  const record = obj as Record<string, unknown>;

  // Handle @type
  if (typeof record['@type'] === 'string') {
    // Strip namespace prefix (e.g., "schema:Product" -> "Product")
    const rawType = record['@type'];
    const cleanType = rawType.includes(':') ? rawType.split(':').pop()! : rawType;
    types.add(cleanType);
  } else if (Array.isArray(record['@type'])) {
    for (const t of record['@type']) {
      if (typeof t === 'string') {
        const cleanType = t.includes(':') ? t.split(':').pop()! : t;
        types.add(cleanType);
      }
    }
  }

  // Recurse into @graph
  if (record['@graph'] && Array.isArray(record['@graph'])) {
    (record['@graph'] as unknown[]).forEach((item) => extractSchemaTypes(item, types));
  }

  // Recurse into nested objects that might contain @type (e.g., author, publisher, offers)
  for (const [key, value] of Object.entries(record)) {
    if (key.startsWith('@')) continue; // skip @context, @id, etc.
    if (value && typeof value === 'object') {
      extractSchemaTypes(value, types);
    }
  }
}

// Extract microdata schema types from itemtype attributes
function extractMicrodataTypes($: import('cheerio').CheerioAPI): Set<string> {
  const types = new Set<string>();

  $('[itemtype]').each((_, el) => {
    const itemtype = $(el).attr('itemtype') || '';
    // itemtype is typically a full URL like "http://schema.org/Product"
    // or "https://schema.org/RealEstateListing"
    const matches = itemtype.match(/schema\.org\/(\w+)/i);
    if (matches) {
      types.add(matches[1]);
    }
    // Also handle multiple types separated by space
    const parts = itemtype.trim().split(/\s+/);
    for (const part of parts) {
      const m = part.match(/schema\.org\/(\w+)/i);
      if (m) types.add(m[1]);
    }
  });

  return types;
}

// Extract RDFa schema types
function extractRdfaTypes($: import('cheerio').CheerioAPI): Set<string> {
  const types = new Set<string>();

  $('[typeof]').each((_, el) => {
    const typeVal = $(el).attr('typeof') || '';
    // Can be "schema:Product" or "Product" or full URL
    const parts = typeVal.trim().split(/\s+/);
    for (const part of parts) {
      if (part.includes('schema.org/')) {
        const m = part.match(/schema\.org\/(\w+)/i);
        if (m) types.add(m[1]);
      } else if (part.includes(':')) {
        const name = part.split(':').pop();
        if (name) types.add(name);
      } else if (/^[A-Z]/.test(part)) {
        types.add(part);
      }
    }
  });

  return types;
}

export function analyzeSchema(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;

  // ===== 1. Extract JSON-LD blocks =====
  const jsonLdBlocks: unknown[] = [];
  const jsonLdParseErrors: string[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    // Try both .html() and .text() - cheerio can encode entities in .html()
    const htmlContent = $(el).html();
    const textContent = $(el).text();

    // Try text content first (more reliable), then html content
    let parsed: unknown | null = null;

    if (textContent) {
      parsed = safeJsonParse(textContent);
    }
    if (!parsed && htmlContent && htmlContent !== textContent) {
      parsed = safeJsonParse(htmlContent);
    }

    if (parsed) {
      jsonLdBlocks.push(parsed);
    } else if (htmlContent || textContent) {
      const snippet = (textContent || htmlContent || '').slice(0, 100);
      jsonLdParseErrors.push(snippet);
    }
  });

  // Report parse errors
  for (let i = 0; i < jsonLdParseErrors.length; i++) {
    findings.push({
      id: `schema-jsonld-invalid-${i}`,
      title: 'Invalid JSON-LD markup',
      description: `A <script type="application/ld+json"> block contains invalid JSON. AI bots cannot parse this structured data. Preview: "${jsonLdParseErrors[i]}..."`,
      severity: 'fail',
      category: 'schema',
      recommendation: 'Fix the JSON syntax in your JSON-LD block. Use Google\'s Rich Results Test to validate.',
    });
  }

  // ===== 2. Extract JSON-LD types =====
  const jsonLdTypes = new Set<string>();
  jsonLdBlocks.forEach((block) => extractSchemaTypes(block, jsonLdTypes));

  // ===== 3. Extract Microdata types =====
  const microdataTypes = extractMicrodataTypes($);

  // ===== 4. Extract RDFa types =====
  const rdfaTypes = extractRdfaTypes($);

  // ===== 5. Combined detection =====
  const allTypes = new Set<string>([...jsonLdTypes, ...microdataTypes, ...rdfaTypes]);
  const formats: string[] = [];
  if (jsonLdBlocks.length > 0) formats.push(`${jsonLdBlocks.length} JSON-LD`);
  if (microdataTypes.size > 0) formats.push('Microdata');
  if (rdfaTypes.size > 0) formats.push('RDFa');

  // Also check for inline schema patterns in raw HTML (fallback for heavily obfuscated or JS-rendered sites)
  const inlineSchemaPatterns = [
    /itemtype\s*=\s*["']https?:\/\/schema\.org\/(\w+)["']/gi,
    /vocab\s*=\s*["']https?:\/\/schema\.org["']/gi,
  ];
  for (const pattern of inlineSchemaPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1]) allTypes.add(match[1]);
    }
  }

  // ===== 6. Report findings =====
  if (formats.length === 0 && allTypes.size === 0) {
    findings.push({
      id: 'schema-none',
      title: 'No structured data found',
      description: 'The page has no JSON-LD, Microdata, or RDFa markup. Structured data helps AI bots understand your content context, entity relationships, and answer-worthiness.',
      severity: 'fail',
      category: 'schema',
      recommendation: 'Add JSON-LD structured data. Start with Organization, WebPage, and content-specific types like Article, FAQPage, Product, or HowTo.',
    });
  } else {
    // Report formats found
    if (jsonLdBlocks.length > 0) {
      findings.push({
        id: 'schema-jsonld-found',
        title: `${jsonLdBlocks.length} JSON-LD block(s) found`,
        description: `The page has ${jsonLdBlocks.length} valid JSON-LD structured data block(s). JSON-LD is the preferred format for AI engines.`,
        severity: 'pass',
        category: 'schema',
        details: { count: jsonLdBlocks.length },
      });
    }

    if (microdataTypes.size > 0) {
      // Microdata is valid but JSON-LD is preferred
      const hasJsonLdToo = jsonLdBlocks.length > 0;
      findings.push({
        id: 'schema-microdata-found',
        title: `Microdata markup detected: ${[...microdataTypes].join(', ')}`,
        description: `The page uses Microdata (itemscope/itemtype) for: ${[...microdataTypes].join(', ')}. ${hasJsonLdToo ? 'JSON-LD is also present, which is good.' : 'JSON-LD is preferred by Google and AI bots for easier parsing.'}`,
        severity: hasJsonLdToo ? 'pass' : 'warning',
        category: 'schema',
        details: { types: [...microdataTypes] },
        recommendation: hasJsonLdToo ? undefined : 'Consider also adding JSON-LD format, which is recommended by Google and easier for AI bots to parse.',
      });
    }

    if (rdfaTypes.size > 0) {
      findings.push({
        id: 'schema-rdfa-found',
        title: `RDFa markup detected: ${[...rdfaTypes].join(', ')}`,
        description: `The page uses RDFa (typeof/property) for: ${[...rdfaTypes].join(', ')}.`,
        severity: 'pass',
        category: 'schema',
        details: { types: [...rdfaTypes] },
      });
    }
  }

  // ===== 7. Analyze detected schema types =====
  if (allTypes.size > 0) {
    findings.push({
      id: 'schema-types-detected',
      title: `Schema types: ${[...allTypes].join(', ')}`,
      description: `Detected ${allTypes.size} schema type(s) on this page across ${formats.join(' + ') || 'HTML attributes'}.`,
      severity: 'info',
      category: 'schema',
      details: { types: [...allTypes], formats },
    });

    // Check for high-value GEO types
    const geoTypes = [...allTypes].filter((t) => GEO_SCHEMA_TYPES.includes(t));

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
    if (!allTypes.has('Organization') && !allTypes.has('LocalBusiness') && !allTypes.has('RealEstateAgent')) {
      findings.push({
        id: 'schema-no-org',
        title: 'No Organization schema',
        description: 'No Organization or LocalBusiness schema found. This schema helps AI engines identify your brand and connect your content to your entity.',
        severity: 'warning',
        category: 'schema',
        recommendation: 'Add Organization schema with name, logo, url, and sameAs (social profiles).',
      });
    }

    // Check for Article/BlogPosting/WebPage
    const hasContentType = ['Article', 'NewsArticle', 'BlogPosting', 'WebPage', 'ItemPage', 'CollectionPage', 'SearchResultsPage'].some(
      (t) => allTypes.has(t)
    );
    if (!hasContentType) {
      findings.push({
        id: 'schema-no-content-type',
        title: 'No page content schema type',
        description: 'No Article, BlogPosting, or WebPage schema found. These schemas help AI understand the nature and structure of your page content.',
        severity: 'warning',
        category: 'schema',
        recommendation: 'Add Article or WebPage schema with headline, datePublished, author, and description.',
      });
    }

    // Check for FAQPage schema (highly valuable for AEO)
    if (allTypes.has('FAQPage')) {
      findings.push({
        id: 'schema-faq',
        title: 'FAQPage schema detected',
        description: 'FAQPage schema is present, which is highly valuable for AEO. AI engines can directly extract Q&A pairs from this markup.',
        severity: 'pass',
        category: 'schema',
      });
    }

    // Check for BreadcrumbList
    if (!allTypes.has('BreadcrumbList')) {
      findings.push({
        id: 'schema-no-breadcrumb',
        title: 'No BreadcrumbList schema',
        description: 'BreadcrumbList schema helps AI bots understand page hierarchy and site structure.',
        severity: 'info',
        category: 'schema',
        recommendation: 'Add BreadcrumbList schema to clarify page position within your site.',
      });
    }

    // Industry-relevant schema recognition
    const industrySchemas: Record<string, string[]> = {
      'Real Estate': ['RealEstateListing', 'RealEstateAgent', 'Residence', 'Apartment', 'House', 'SingleFamilyResidence', 'ApartmentComplex'],
      'Medical/Health': ['MedicalCondition', 'Drug', 'MedicalClinic', 'Physician', 'Hospital', 'MedicalOrganization', 'MedicalWebPage'],
      'Education': ['Course', 'EducationalOrganization', 'CollegeOrUniversity', 'LearningResource'],
      'Automotive': ['Vehicle', 'Car', 'AutoDealer', 'AutoRepair', 'MotorizedBicycle'],
      'Restaurant/Food': ['Restaurant', 'Recipe', 'Menu', 'FoodEstablishment', 'FoodService'],
      'Travel': ['Hotel', 'LodgingBusiness', 'TouristAttraction', 'Flight', 'TravelAction'],
      'Jobs': ['JobPosting', 'Occupation', 'EmployerAggregateRating'],
      'Events': ['Event', 'MusicEvent', 'SportsEvent', 'BusinessEvent'],
      'Finance': ['FinancialProduct', 'BankOrCreditUnion', 'InsuranceAgency'],
      'Software': ['SoftwareApplication', 'MobileApplication', 'WebApplication', 'SoftwareSourceCode'],
    };

    for (const [industry, schemaList] of Object.entries(industrySchemas)) {
      const found = schemaList.filter((s) => allTypes.has(s));
      if (found.length > 0) {
        findings.push({
          id: `schema-industry-${industry.toLowerCase().replace(/[^a-z]/g, '')}`,
          title: `${industry} schema: ${found.join(', ')}`,
          description: `Industry-specific ${industry} schema type(s) detected. These help AI engines provide rich, vertical-specific answers about your content.`,
          severity: 'pass',
          category: 'schema',
          details: { industry, types: found },
        });
      }
    }

    // Validate key schema properties (only for JSON-LD where we have the parsed data)
    jsonLdBlocks.forEach((block) => {
      validateSchemaProperties(block, findings);
    });
  }

  return findings;
}

function validateSchemaProperties(obj: unknown, findings: Finding[]): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    obj.forEach((item) => validateSchemaProperties(item, findings));
    return;
  }

  const record = obj as Record<string, unknown>;
  const type = record['@type'] as string | string[] | undefined;

  // Handle type as array
  const types: string[] = Array.isArray(type) ? type : type ? [type] : [];

  // Validate Article-type schemas
  const articleTypes = ['Article', 'NewsArticle', 'BlogPosting', 'TechArticle', 'ScholarlyArticle'];
  if (types.some((t) => articleTypes.includes(t))) {
    const typeName = types.find((t) => articleTypes.includes(t));
    if (!record.author) {
      findings.push({
        id: `schema-article-no-author`,
        title: `${typeName} schema missing "author"`,
        description: `The ${typeName} schema is missing the "author" property. Author attribution is critical for E-E-A-T and AI trust signals.`,
        severity: 'warning',
        category: 'schema',
        recommendation: `Add an "author" property (as a Person or Organization) to your ${typeName} schema.`,
      });
    }
    if (!record.datePublished) {
      findings.push({
        id: `schema-article-no-date`,
        title: `${typeName} schema missing "datePublished"`,
        description: `The ${typeName} schema is missing "datePublished". AI engines use publication dates to assess content freshness.`,
        severity: 'warning',
        category: 'schema',
        recommendation: `Add "datePublished" (and "dateModified") to your ${typeName} schema.`,
      });
    }
  }

  // Validate Product schemas
  if (types.includes('Product')) {
    const missingProductFields: string[] = [];
    if (!record.name) missingProductFields.push('name');
    if (!record.image) missingProductFields.push('image');
    if (!record.description) missingProductFields.push('description');
    if (!record.offers && !record.offer) missingProductFields.push('offers (pricing)');
    if (missingProductFields.length > 0) {
      findings.push({
        id: 'schema-product-incomplete',
        title: `Product schema missing: ${missingProductFields.join(', ')}`,
        description: `The Product schema is missing key fields. Complete Product schema helps AI engines present rich product information.`,
        severity: 'warning',
        category: 'schema',
        recommendation: `Add these to your Product schema: ${missingProductFields.join(', ')}.`,
      });
    }
  }

  // Validate Organization schema
  if (types.includes('Organization') || types.includes('LocalBusiness')) {
    if (!record.logo) {
      findings.push({
        id: 'schema-org-no-logo',
        title: 'Organization schema missing "logo"',
        description: 'Your Organization schema is missing a logo. Logos help AI engines visually identify your brand.',
        severity: 'warning',
        category: 'schema',
        recommendation: 'Add a "logo" property with a URL to your brand logo.',
      });
    }
    if (!record.sameAs) {
      findings.push({
        id: 'schema-org-no-sameas',
        title: 'Organization schema missing "sameAs"',
        description: 'No "sameAs" property found. This property links to your social media profiles, helping AI engines build your brand knowledge graph.',
        severity: 'info',
        category: 'schema',
        recommendation: 'Add "sameAs" with links to your LinkedIn, Twitter, Facebook, and other official profiles.',
      });
    }
  }

  // Recurse into @graph
  if (record['@graph'] && Array.isArray(record['@graph'])) {
    (record['@graph'] as unknown[]).forEach((item) => validateSchemaProperties(item, findings));
  }
}
