import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

// Helper: safely get JSON-LD text from script blocks (avoids cheerio HTML entity encoding)
function getJsonLdRawText($: import('cheerio').CheerioAPI): string {
  const blocks: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).text(); // .text() avoids HTML entity encoding unlike .html()
    if (text) blocks.push(text);
  });
  return blocks.join(' ');
}

function safeParseJsonLd($: import('cheerio').CheerioAPI): unknown[] {
  const results: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).text();
    if (text) {
      try { results.push(JSON.parse(text)); } catch {
        // Try with entity decode
        try {
          const decoded = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          results.push(JSON.parse(decoded));
        } catch { /* skip */ }
      }
    }
  });
  return results;
}

// Signals that indicate an e-commerce website
// IMPORTANT: Only include strong e-commerce signals - avoid generic patterns
// that match news sites, blogs, or other non-ecommerce pages
const ECOMMERCE_SIGNALS = {
  // Only STRONG e-commerce schema types (not BreadcrumbList, Review, AggregateRating - those are generic)
  schemaTypes: ['Product', 'Offer', 'AggregateOffer', 'ItemList'],
  metaPatterns: [
    /og:type.*product/i,
    /product:price/i,
    /product:availability/i,
  ],
  // These must be in BUTTON/LINK context, not just anywhere in body text
  actionPatterns: [
    /add[\s-]?to[\s-]?cart/i,
    /add[\s-]?to[\s-]?bag/i,
    /add[\s-]?to[\s-]?basket/i,
  ],
  // Checked only in href attributes, not body text
  cartLinkPatterns: [
    /\/cart\b/i,
    /\/basket\b/i,
    /\/checkout\b/i,
    /[?&]action=add/i,
  ],
  platforms: [
    { name: 'Shopify', patterns: [/cdn\.shopify\.com/i, /myshopify\.com/i] },
    { name: 'WooCommerce', patterns: [/woocommerce/i, /wc-block/i, /wp-content.*woo/i] },
    { name: 'Magento', patterns: [/magento/i, /varien/i] },
    { name: 'BigCommerce', patterns: [/bigcommerce/i] },
    { name: 'PrestaShop', patterns: [/prestashop/i] },
    { name: 'OpenCart', patterns: [/opencart/i] },
    { name: 'Squarespace Commerce', patterns: [/squarespace.*commerce/i] },
    { name: 'Wix Stores', patterns: [/wixstores/i] },
    // Indian e-commerce platforms
    { name: 'Nykaa', patterns: [/nykaa\.com/i] },
    { name: 'Flipkart', patterns: [/flipkart\.com/i, /fkapi/i] },
    { name: 'Myntra', patterns: [/myntra\.com/i] },
    { name: 'Amazon India', patterns: [/amazon\.in/i] },
    { name: 'Meesho', patterns: [/meesho\.com/i] },
    { name: 'AJIO', patterns: [/ajio\.com/i] },
    { name: 'Tata CLiQ', patterns: [/tatacliq\.com/i] },
    // International platforms
    { name: 'Etsy', patterns: [/etsy\.com/i] },
    { name: 'eBay', patterns: [/ebay\.com/i] },
    { name: 'Amazon', patterns: [/amazon\.(com|co\.uk|de|fr|es|it|ca|com\.au)/i] },
    { name: 'Walmart', patterns: [/walmart\.com/i] },
    { name: 'Target', patterns: [/target\.com/i] },
  ],
};

// Sites that should NEVER be classified as e-commerce
const NON_ECOMMERCE_DOMAINS = [
  /timesofindia\./i, /indiatimes\.com/i, /ndtv\.com/i, /thehindu\.com/i,
  /hindustantimes\.com/i, /indianexpress\.com/i, /news18\.com/i,
  /bbc\.(com|co\.uk)/i, /cnn\.com/i, /reuters\.com/i, /theguardian\.com/i,
  /nytimes\.com/i, /washingtonpost\.com/i, /forbes\.com/i, /bloomberg\.com/i,
  /medium\.com/i, /substack\.com/i, /wikipedia\.org/i,
  /webmd\.com/i, /healthline\.com/i, /mayoclinic\.org/i, /practo\.com/i,
  /premom\.(in|com)/i, /1mg\.com/i, /lybrate\.com/i,
  /coursera\.org/i, /udemy\.com/i, /edx\.org/i, /khanacademy\.org/i,
  /byjus\.com/i, /unacademy\.com/i, /upgrad\.com/i,
  /toireviews\.com/i, /cnet\.com/i, /theverge\.com/i, /techradar\.com/i,
  /gsmarena\.com/i, /pcmag\.com/i, /91mobiles\.com/i,
];

interface EcommerceDetection {
  isEcommerce: boolean;
  confidence: number;
  signals: string[];
  platform: string | null;
}

export function detectEcommerce(ctx: AnalysisContext): EcommerceDetection {
  const { $, html, url } = ctx;
  const signals: string[] = [];
  let score = 0;
  let platform: string | null = null;

  // NEGATIVE: Known non-ecommerce domains — bail early
  for (const pattern of NON_ECOMMERCE_DOMAINS) {
    if (pattern.test(url)) {
      return { isEcommerce: false, confidence: 0, signals: ['Non-ecommerce domain excluded'], platform: null };
    }
  }

  // NEGATIVE: If page has NewsArticle or Article schema, it's likely NOT ecommerce
  const jsonLdText = getJsonLdRawText($);
  const hasNewsSchema = /"@type"\s*:\s*"(NewsArticle|Article|BlogPosting)"/i.test(jsonLdText);
  if (hasNewsSchema) {
    score -= 4; // Strong negative signal
    signals.push('NewsArticle/Article schema (negative signal)');
  }

  // URL-based detection (strong signal)
  const urlPatterns = [
    { pattern: /\/p\/\d+/i, signal: 'Product URL pattern (/p/ID)' },
    { pattern: /\/product[s]?\//i, signal: 'Product URL pattern (/product/)' },
    { pattern: /\/dp\/[A-Z0-9]+/i, signal: 'Amazon-style product URL (/dp/)' },
    { pattern: /productId=/i, signal: 'Product ID in URL' },
    { pattern: /\/shop\//i, signal: 'Shop URL pattern' },
    { pattern: /\/collection[s]?\//i, signal: 'Collection URL pattern' },
  ];

  for (const { pattern, signal } of urlPatterns) {
    if (pattern.test(url)) {
      score += 2;
      signals.push(signal);
    }
  }

  // Check for Product/Offer schema (strong signal — only PRODUCT-specific types)
  for (const schemaType of ECOMMERCE_SIGNALS.schemaTypes) {
    if (jsonLdText.includes(`"${schemaType}"`) || jsonLdText.includes(`"@type":"${schemaType}"`) || jsonLdText.includes(`"@type": "${schemaType}"`)) {
      if (schemaType === 'Product' || schemaType === 'Offer' || schemaType === 'AggregateOffer') {
        score += 3;
        signals.push(`${schemaType} schema detected`);
      } else {
        score += 1;
        signals.push(`${schemaType} schema detected`);
      }
    }
  }

  // Check microdata for Product specifically
  if ($('[itemtype*="schema.org/Product"]').length > 0 || $('[itemtype*="schema.org/Offer"]').length > 0) {
    score += 3;
    signals.push('Product/Offer microdata detected');
  }

  // Check meta tags
  for (const pattern of ECOMMERCE_SIGNALS.metaPatterns) {
    const metaHtml = $('meta').toString();
    if (pattern.test(metaHtml)) {
      score += 2;
      signals.push('Product meta tags detected');
      break;
    }
  }

  // Check for add-to-cart type buttons (check in buttons/links, not raw body text)
  const buttonAndLinkText = $('button, a, [role="button"], input[type="submit"]')
    .map((_, el) => $(el).text()).get().join(' ');

  for (const pattern of ECOMMERCE_SIGNALS.actionPatterns) {
    if (pattern.test(buttonAndLinkText)) {
      score += 3; // Strong signal — actual cart buttons
      signals.push(`E-commerce button: ${pattern.source}`);
    }
  }

  // Check for "buy now" specifically in buttons/links (not body text where "buy" is common)
  if (/buy[\s-]?now/i.test(buttonAndLinkText)) {
    score += 2;
    signals.push('Buy Now button detected');
  }

  // Check for e-commerce platform
  for (const plat of ECOMMERCE_SIGNALS.platforms) {
    for (const pattern of plat.patterns) {
      if (pattern.test(html)) {
        platform = plat.name;
        score += 4;
        signals.push(`Platform detected: ${plat.name}`);
        break;
      }
    }
    if (platform) break;
  }

  // Check for cart/checkout in href attributes only (not body text)
  let cartLinks = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    for (const pattern of ECOMMERCE_SIGNALS.cartLinkPatterns) {
      if (pattern.test(href)) {
        cartLinks++;
        break;
      }
    }
  });
  if (cartLinks > 0) {
    score += 2;
    signals.push(`${cartLinks} cart/checkout link(s)`);
  }

  // Check for product listing elements (multiple product cards)
  const productCardCount = $('[class*="product-card"], [class*="product-item"], [data-product-id], [class*="product-list"]').length;
  if (productCardCount >= 2) {
    score += 2;
    signals.push(`${productCardCount} product card elements`);
  }

  // Check for price with itemprop only (structured price, not random price text)
  if ($('[itemprop="price"], [data-price]').length > 0) {
    score += 2;
    signals.push('Structured price elements (itemprop/data-price)');
  }

  // Confidence: higher threshold now (7 instead of 5)
  const confidence = Math.min(100, Math.round((Math.max(0, score) / 15) * 100));

  return {
    isEcommerce: score >= 7,
    confidence,
    signals,
    platform,
  };
}

export function analyzeEcommerce(ctx: AnalysisContext): Finding[] {
  const detection = detectEcommerce(ctx);

  // If not an e-commerce site, return empty - these findings won't be shown
  if (!detection.isEcommerce) {
    return [];
  }

  const findings: Finding[] = [];
  const { $, html } = ctx;

  // ===== CSR Detection for E-commerce Pages =====
  // This is critical: schemas may be in raw HTML but actual content (descriptions,
  // ingredients, images) may be JS-rendered and invisible to AI bots.
  const $bodyClone = $('body').clone();
  $bodyClone.find('script, style, noscript, svg, iframe').remove();
  const visibleBodyText = $bodyClone.text().replace(/\s+/g, ' ').trim();
  const visibleWordCount = visibleBodyText.split(/\s+/).filter((w: string) => w.length > 1).length;

  // Detect if page uses a JS framework
  const csrFrameworks: string[] = [];
  if (html.includes('__NEXT_DATA__') || /_next\/static/i.test(html)) csrFrameworks.push('Next.js');
  if (html.includes('__NUXT__') || /id="__nuxt"/i.test(html)) csrFrameworks.push('Nuxt.js');
  if (/data-reactroot/i.test(html) || /data-react-helmet/i.test(html)) csrFrameworks.push('React');
  if (/ng-app/i.test(html) || /ng-version/i.test(html) || /_nghost/i.test(html)) csrFrameworks.push('Angular');
  if (/data-v-[a-f0-9]+/i.test(html)) csrFrameworks.push('Vue.js');
  if (/__sveltekit/i.test(html)) csrFrameworks.push('SvelteKit');

  const hasAppRoot = $('#root').length > 0 || $('#app').length > 0 ||
    $('#__next').length > 0 || $('#__nuxt').length > 0 || $('#___gatsby').length > 0;

  const isLikelyCSR = (hasAppRoot || csrFrameworks.length > 0) && visibleWordCount < 200;
  const isPartialCSR = (hasAppRoot || csrFrameworks.length > 0) && visibleWordCount >= 200 && visibleWordCount < 500;

  // Count product images in raw HTML
  const rawImgCount = $('img').length;
  const rawProductImgCount = $('img[class*="product"], img[data-product], img[itemprop="image"], [class*="product"] img').length;

  // Check if key product content sections exist in raw HTML
  const lowerBody = visibleBodyText.toLowerCase();
  const hasDescriptionInHtml = lowerBody.length > 100 && (
    /description/i.test(lowerBody) ||
    $('[class*="description"], [id*="description"], [itemprop="description"]').text().trim().length > 50
  );
  const hasIngredientsInHtml = $('[class*="ingredient"], [id*="ingredient"]').text().trim().length > 20;
  const hasHowToUseInHtml = $('[class*="how-to"], [class*="howto"], [class*="usage"], [id*="how-to"], [id*="howto"]').text().trim().length > 20;

  if (isLikelyCSR) {
    const frameworkNote = csrFrameworks.length > 0 ? ` (${csrFrameworks.join(', ')} detected)` : '';
    findings.push({
      id: 'ecom-csr-critical',
      title: `Product page is client-side rendered — AI bots see almost no content`,
      description: `This page only has ${visibleWordCount} words in the raw HTML${frameworkNote}. Product descriptions, images, ingredients, and other content are loaded via JavaScript. AI bots (GPTBot, ClaudeBot, PerplexityBot, GoogleBot) do NOT execute JavaScript — they only read the raw HTML. Your schemas may pass, but the actual product content is invisible to AI.`,
      severity: 'fail',
      category: 'ecommerce',
      recommendation: 'Implement Server-Side Rendering (SSR) for product pages so that product descriptions, images, ingredients, and key content are in the initial HTML. Schemas alone are not enough — AI bots need readable content in the HTML.',
      details: { visibleWordCount, csrFrameworks, rawImgCount },
    });
  } else if (isPartialCSR) {
    // Partial CSR — some content in HTML but probably not all product details
    const missingSections: string[] = [];
    if (!hasDescriptionInHtml) missingSections.push('product description');
    if (!hasIngredientsInHtml) missingSections.push('ingredients');
    if (!hasHowToUseInHtml) missingSections.push('how-to-use/usage');

    if (missingSections.length > 0) {
      findings.push({
        id: 'ecom-csr-partial',
        title: `Some product content appears to be JavaScript-rendered`,
        description: `The raw HTML has ${visibleWordCount} words but key product sections may be missing: ${missingSections.join(', ')}. Content loaded via JavaScript is invisible to AI bots. Users see this content, but AI bots do not.`,
        severity: 'warning',
        category: 'ecommerce',
        recommendation: `Ensure these product sections are server-side rendered (present in raw HTML): ${missingSections.join(', ')}. AI bots cannot execute JavaScript to load this content.`,
        details: { visibleWordCount, missingSections, csrFrameworks },
      });
    }
  }

  // Check product images vs raw HTML images
  if ((isLikelyCSR || isPartialCSR) && rawImgCount < 3) {
    findings.push({
      id: 'ecom-images-js-rendered',
      title: `Product images may be JavaScript-rendered (only ${rawImgCount} <img> tag${rawImgCount !== 1 ? 's' : ''} in HTML)`,
      description: `Only ${rawImgCount} image tag${rawImgCount !== 1 ? 's' : ''} found in the raw HTML. Product images are likely loaded via JavaScript and invisible to AI bots. Users see the images, but AI crawlers do not.`,
      severity: rawImgCount === 0 ? 'fail' : 'warning',
      category: 'ecommerce',
      recommendation: 'Ensure product images are in the initial HTML with proper <img> tags, src attributes, and descriptive alt text. AI bots cannot see images injected via JavaScript.',
    });
  }

  // Report detection
  findings.push({
    id: 'ecom-detected',
    title: `E-commerce site detected${detection.platform ? ` (${detection.platform})` : ''} (${detection.confidence}% confidence)`,
    description: `This page was identified as an e-commerce site. Analysis is based on the raw HTML only — the same view AI bots get. Content loaded via JavaScript is not visible to AI crawlers.`,
    severity: 'info',
    category: 'ecommerce',
    details: { platform: detection.platform, confidence: detection.confidence, signals: detection.signals },
  });

  // ===== Product Schema =====
  const jsonLdBlocks = safeParseJsonLd($);
  const allJsonLdText = JSON.stringify(jsonLdBlocks);
  const hasProductSchema = allJsonLdText.includes('"Product"') || $('[itemtype*="schema.org/Product"]').length > 0;
  const hasOfferSchema = allJsonLdText.includes('"Offer"') || allJsonLdText.includes('"AggregateOffer"');
  const hasReviewSchema = allJsonLdText.includes('"Review"') || allJsonLdText.includes('"AggregateRating"');

  if (hasProductSchema) {
    const csrCaveat = isLikelyCSR ? ' However, the page content itself is JS-rendered — schemas alone won\'t help if AI bots can\'t read the actual product content.' : '';
    findings.push({
      id: 'ecom-product-schema',
      title: 'Product schema markup found',
      description: `Product structured data is present. AI engines like Google AI Overviews, ChatGPT, and Perplexity use this to display rich product information in answers.${csrCaveat}`,
      severity: 'pass',
      category: 'ecommerce',
    });

    // Validate Product schema properties
    const productFields = {
      name: /\"name\"/i.test(allJsonLdText),
      description: /\"description\"/i.test(allJsonLdText),
      image: /\"image\"/i.test(allJsonLdText),
      sku: /\"sku\"/i.test(allJsonLdText),
      brand: /\"brand\"/i.test(allJsonLdText),
      offers: hasOfferSchema,
      review: hasReviewSchema,
    };

    const missingFields = Object.entries(productFields)
      .filter(([, present]) => !present)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      findings.push({
        id: 'ecom-product-schema-incomplete',
        title: `Product schema missing: ${missingFields.join(', ')}`,
        description: `Your Product schema is missing important properties. Complete product data helps AI engines provide richer answers about your products.`,
        severity: 'warning',
        category: 'ecommerce',
        recommendation: `Add these properties to your Product schema: ${missingFields.join(', ')}. Google recommends name, image, description, sku, brand, offers (with price & availability), and reviews.`,
        details: { missingFields, presentFields: Object.entries(productFields).filter(([, v]) => v).map(([k]) => k) },
      });
    } else {
      findings.push({
        id: 'ecom-product-schema-complete',
        title: 'Product schema is comprehensive',
        description: 'Your Product schema includes all key properties (name, description, image, SKU, brand, offers, reviews). This maximizes visibility in AI-powered shopping results.',
        severity: 'pass',
        category: 'ecommerce',
      });
    }
  } else {
    findings.push({
      id: 'ecom-no-product-schema',
      title: 'No Product schema markup',
      description: 'No Product structured data found. This is critical for e-commerce AEO - without it, AI engines cannot show rich product details, prices, or availability in their answers.',
      severity: 'fail',
      category: 'ecommerce',
      recommendation: 'Add Product schema (JSON-LD) with name, description, image, sku, brand, offers (price, priceCurrency, availability), and aggregateRating.',
    });
  }

  // ===== Offer/Price Schema =====
  if (hasOfferSchema) {
    findings.push({
      id: 'ecom-offer-schema',
      title: 'Offer/Price schema found',
      description: 'Price and availability data is structured. AI engines can extract and display pricing information in shopping-related answers.',
      severity: 'pass',
      category: 'ecommerce',
    });

    if (allJsonLdText.includes('"availability"')) {
      findings.push({
        id: 'ecom-availability',
        title: 'Product availability status present',
        description: 'Availability (InStock, OutOfStock, etc.) is declared in schema. AI engines use this to filter and recommend available products.',
        severity: 'pass',
        category: 'ecommerce',
      });
    } else {
      findings.push({
        id: 'ecom-no-availability',
        title: 'No availability status in schema',
        description: 'Product availability is not specified. AI engines may not know if your product is in stock.',
        severity: 'warning',
        category: 'ecommerce',
        recommendation: 'Add "availability" property (e.g., "https://schema.org/InStock") to your Offer schema.',
      });
    }
  } else if (hasProductSchema) {
    findings.push({
      id: 'ecom-no-offer',
      title: 'No Offer/Price schema',
      description: 'Product schema exists but no Offer/pricing data. AI engines cannot show price information without structured offer data.',
      severity: 'fail',
      category: 'ecommerce',
      recommendation: 'Add Offer schema with price, priceCurrency, and availability within your Product schema.',
    });
  }

  // ===== Review/Rating Schema =====
  if (hasReviewSchema) {
    findings.push({
      id: 'ecom-reviews-schema',
      title: 'Review/Rating schema found',
      description: 'Reviews and ratings are structured. AI engines display star ratings and review counts in product answers, increasing click-through.',
      severity: 'pass',
      category: 'ecommerce',
    });
  } else {
    findings.push({
      id: 'ecom-no-reviews',
      title: 'No Review/Rating schema',
      description: 'No Review or AggregateRating schema found. Products with reviews and ratings are more likely to be featured in AI shopping answers.',
      severity: 'warning',
      category: 'ecommerce',
      recommendation: 'Add AggregateRating and Review schema to showcase customer ratings in AI-powered results.',
    });
  }

  // ===== Product Images =====
  const productImages = $('img[class*="product"], img[data-product], img[itemprop="image"], [class*="product"] img');
  const totalProductImages = productImages.length;
  let productImagesNoAlt = 0;

  productImages.each((_, el) => {
    const alt = $(el).attr('alt');
    if (!alt || alt.trim() === '') {
      productImagesNoAlt++;
    }
  });

  if (totalProductImages === 0 && (isLikelyCSR || isPartialCSR)) {
    // Don't add a separate finding — already covered by ecom-images-js-rendered above
  } else if (totalProductImages > 0 && productImagesNoAlt > 0) {
    findings.push({
      id: 'ecom-product-img-alt',
      title: `${productImagesNoAlt} product image(s) missing alt text`,
      description: `${productImagesNoAlt} of ${totalProductImages} product images lack descriptive alt text. AI bots rely on alt text to understand product visuals.`,
      severity: 'warning',
      category: 'ecommerce',
      recommendation: 'Add descriptive alt text to product images including product name, key features, and color/size when relevant.',
    });
  } else if (totalProductImages > 0) {
    findings.push({
      id: 'ecom-product-img-ok',
      title: `All ${totalProductImages} product image(s) have alt text`,
      description: 'Product images have descriptive alt text, helping AI bots understand your product visuals.',
      severity: 'pass',
      category: 'ecommerce',
    });
  } else {
    // No product images at all and not CSR — still flag it
    findings.push({
      id: 'ecom-no-product-img',
      title: 'No product images found in HTML',
      description: 'No product images were found in the raw HTML. If images are loaded via JavaScript, AI bots will not see them.',
      severity: 'warning',
      category: 'ecommerce',
      recommendation: 'Ensure product images are present in the initial HTML with descriptive alt text.',
    });
  }

  // ===== BreadcrumbList for Category Navigation =====
  const hasBreadcrumb = allJsonLdText.includes('"BreadcrumbList"') ||
    $('[class*="breadcrumb"]').length > 0 ||
    $('nav[aria-label*="breadcrumb" i]').length > 0;

  if (hasBreadcrumb) {
    findings.push({
      id: 'ecom-breadcrumb',
      title: 'Product breadcrumb navigation found',
      description: 'Breadcrumbs help AI engines understand your product category hierarchy (e.g., Home > Electronics > Phones > iPhone 15).',
      severity: 'pass',
      category: 'ecommerce',
    });
  } else {
    findings.push({
      id: 'ecom-no-breadcrumb',
      title: 'No breadcrumb navigation',
      description: 'No breadcrumb navigation found. Breadcrumbs help AI engines understand product categorization and site structure.',
      severity: 'warning',
      category: 'ecommerce',
      recommendation: 'Add breadcrumb navigation with BreadcrumbList schema markup for product pages.',
    });
  }

  // ===== FAQ/Q&A on Product Pages =====
  const hasFAQ = allJsonLdText.includes('"FAQPage"') ||
    $('[class*="faq"], [class*="FAQ"], [id*="faq"]').length > 0 ||
    $('details, summary').length >= 2;

  if (hasFAQ) {
    findings.push({
      id: 'ecom-faq',
      title: 'Product FAQ section detected',
      description: 'FAQ content on product pages is excellent for AEO. AI engines can extract product Q&As to answer buyer questions directly.',
      severity: 'pass',
      category: 'ecommerce',
    });
  } else {
    findings.push({
      id: 'ecom-no-faq',
      title: 'No FAQ section on product page',
      description: 'No FAQ or Q&A section found. Adding FAQs about the product (shipping, returns, specs, compatibility) helps AI engines answer buyer queries.',
      severity: 'info',
      category: 'ecommerce',
      recommendation: 'Add an FAQ section with FAQPage schema covering common product questions.',
    });
  }

  // ===== Shipping/Returns Info =====
  const bodyText = $('body').text().toLowerCase();
  const hasShippingInfo = /shipping|delivery|free\s+shipping|ships?\s+in/i.test(bodyText);
  const hasReturnsInfo = /return\s+policy|returns?|exchange|refund/i.test(bodyText);

  if (hasShippingInfo && hasReturnsInfo) {
    findings.push({
      id: 'ecom-shipping-returns',
      title: 'Shipping & returns info found',
      description: 'Shipping and returns information is present. AI engines include this in product recommendation answers.',
      severity: 'pass',
      category: 'ecommerce',
    });
  } else if (hasShippingInfo || hasReturnsInfo) {
    findings.push({
      id: 'ecom-partial-policy',
      title: `Missing ${!hasShippingInfo ? 'shipping' : 'returns'} information`,
      description: `${!hasShippingInfo ? 'Shipping/delivery' : 'Returns/refund'} information is missing. Both are important for AI engines answering buyer intent queries.`,
      severity: 'warning',
      category: 'ecommerce',
      recommendation: `Add clear ${!hasShippingInfo ? 'shipping and delivery' : 'returns and refund'} information to your product pages.`,
    });
  } else {
    findings.push({
      id: 'ecom-no-policies',
      title: 'No shipping or returns info visible',
      description: 'No shipping or returns information found on the page. This information helps AI engines provide complete product answers.',
      severity: 'warning',
      category: 'ecommerce',
      recommendation: 'Add clear shipping and returns information on product pages.',
    });
  }

  return findings;
}
