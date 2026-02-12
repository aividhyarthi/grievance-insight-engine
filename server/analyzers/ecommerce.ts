import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

// Signals that indicate an e-commerce website
const ECOMMERCE_SIGNALS = {
  schemaTypes: ['Product', 'Offer', 'AggregateOffer', 'ItemList', 'BreadcrumbList', 'Review', 'AggregateRating'],
  metaPatterns: [
    /og:type.*product/i,
    /product:price/i,
    /product:availability/i,
  ],
  htmlPatterns: [
    /add[\s-]?to[\s-]?cart/i,
    /buy[\s-]?now/i,
    /add[\s-]?to[\s-]?bag/i,
    /add[\s-]?to[\s-]?basket/i,
    /checkout/i,
    /shopping[\s-]?cart/i,
  ],
  platforms: [
    { name: 'Shopify', patterns: [/shopify/i, /cdn\.shopify\.com/i, /myshopify\.com/i] },
    { name: 'WooCommerce', patterns: [/woocommerce/i, /wc-block/i, /wp-content.*woo/i] },
    { name: 'Magento', patterns: [/magento/i, /mage/i, /varien/i] },
    { name: 'BigCommerce', patterns: [/bigcommerce/i] },
    { name: 'PrestaShop', patterns: [/prestashop/i] },
    { name: 'OpenCart', patterns: [/opencart/i] },
    { name: 'Squarespace Commerce', patterns: [/squarespace.*commerce/i, /sqsp/i] },
    { name: 'Wix Stores', patterns: [/wix.*stores/i, /wixstores/i] },
  ],
  pricePatterns: [
    /\$\d+[\.,]?\d*/,
    /€\d+[\.,]?\d*/,
    /£\d+[\.,]?\d*/,
    /₹\d+[\.,]?\d*/,
    /price/i,
    /data-price/i,
  ],
};

interface EcommerceDetection {
  isEcommerce: boolean;
  confidence: number;
  signals: string[];
  platform: string | null;
}

export function detectEcommerce(ctx: AnalysisContext): EcommerceDetection {
  const { $, html } = ctx;
  const signals: string[] = [];
  let score = 0;
  let platform: string | null = null;

  // Check for Product schema
  const jsonLdBlocks: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (text) jsonLdBlocks.push(text);
  });
  const jsonLdText = jsonLdBlocks.join(' ');

  for (const schemaType of ECOMMERCE_SIGNALS.schemaTypes) {
    if (jsonLdText.includes(`"${schemaType}"`) || jsonLdText.includes(`"@type":"${schemaType}"`) || jsonLdText.includes(`"@type": "${schemaType}"`)) {
      if (schemaType === 'Product' || schemaType === 'Offer') {
        score += 3;
        signals.push(`${schemaType} schema detected`);
      } else {
        score += 1;
        signals.push(`${schemaType} schema detected`);
      }
    }
  }

  // Check microdata for Product
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

  // Check for e-commerce action patterns (add to cart, buy now, etc.)
  const bodyText = $('body').text();
  const bodyHtml = $('body').html() || '';
  for (const pattern of ECOMMERCE_SIGNALS.htmlPatterns) {
    if (pattern.test(bodyText) || pattern.test(bodyHtml)) {
      score += 2;
      signals.push(`E-commerce action found: ${pattern.source}`);
    }
  }

  // Check for e-commerce platform
  for (const plat of ECOMMERCE_SIGNALS.platforms) {
    for (const pattern of plat.patterns) {
      if (pattern.test(html)) {
        platform = plat.name;
        score += 3;
        signals.push(`Platform detected: ${plat.name}`);
        break;
      }
    }
    if (platform) break;
  }

  // Check for price patterns in HTML attributes
  if ($('[class*="price"], [data-price], [itemprop="price"]').length > 0) {
    score += 2;
    signals.push('Price elements detected');
  }

  // Check for cart/checkout links
  let hasCartLink = false;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (/cart|basket|checkout/i.test(href)) {
      hasCartLink = true;
    }
  });
  if (hasCartLink) {
    score += 2;
    signals.push('Cart/checkout links detected');
  }

  // Check for product listing patterns
  if ($('[class*="product"], [data-product], [class*="item-card"], [class*="product-card"]').length >= 2) {
    score += 2;
    signals.push('Product listing elements detected');
  }

  // Confidence: 0-100 based on score (threshold at 5 for "is ecommerce")
  const confidence = Math.min(100, Math.round((score / 15) * 100));

  return {
    isEcommerce: score >= 5,
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

  // Report detection
  findings.push({
    id: 'ecom-detected',
    title: `E-commerce site detected${detection.platform ? ` (${detection.platform})` : ''} (${detection.confidence}% confidence)`,
    description: `This page was identified as an e-commerce site. The following e-commerce-specific AEO checks were performed.`,
    severity: 'info',
    category: 'ecommerce',
    details: { platform: detection.platform, confidence: detection.confidence, signals: detection.signals },
  });

  // ===== Product Schema =====
  const jsonLdBlocks: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).html();
    if (text) {
      try {
        jsonLdBlocks.push(JSON.parse(text));
      } catch { /* skip invalid */ }
    }
  });

  const allJsonLdText = JSON.stringify(jsonLdBlocks);
  const hasProductSchema = allJsonLdText.includes('"Product"') || $('[itemtype*="schema.org/Product"]').length > 0;
  const hasOfferSchema = allJsonLdText.includes('"Offer"') || allJsonLdText.includes('"AggregateOffer"');
  const hasReviewSchema = allJsonLdText.includes('"Review"') || allJsonLdText.includes('"AggregateRating"');

  if (hasProductSchema) {
    findings.push({
      id: 'ecom-product-schema',
      title: 'Product schema markup found',
      description: 'Product structured data is present. AI engines like Google AI Overviews, ChatGPT, and Perplexity use this to display rich product information in answers.',
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

    // Check for availability
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

  if (totalProductImages > 0 && productImagesNoAlt > 0) {
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
