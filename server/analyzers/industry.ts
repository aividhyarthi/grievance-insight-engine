import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

// ===== Industry Detection =====

export type IndustryType =
  | 'real-estate'
  | 'medical'
  | 'edtech'
  | 'auto'
  | 'reviews'
  | null;

export interface IndustryDetection {
  industry: IndustryType;
  label: string;
  confidence: number;
  signals: string[];
}

interface IndustrySignals {
  id: IndustryType;
  label: string;
  schemaTypes: string[];
  urlPatterns: RegExp[];
  htmlPatterns: RegExp[];
  textPatterns: RegExp[];
  platforms: { name: string; pattern: RegExp }[];
}

const INDUSTRY_DEFINITIONS: IndustrySignals[] = [
  {
    id: 'real-estate',
    label: 'Real Estate',
    schemaTypes: ['RealEstateListing', 'RealEstateAgent', 'Residence', 'Apartment', 'House', 'SingleFamilyResidence', 'ApartmentComplex', 'Accommodation'],
    urlPatterns: [
      /\b(flat|flats|apartment|villa|plot|property|properties|house|bhk|real[\s-]?estate)\b/i,
      /\b(rent|sale|buy|lease|pg|hostel|paying[\s-]?guest)\b.*\b(flat|apartment|house|room|property)\b/i,
      /\b(sector|locality|colony|nagar|vihar|enclave|heights|towers?)\b/i,
      /\b(sqft|sq\.?\s*ft|carpet[\s-]?area|built[\s-]?up)\b/i,
    ],
    htmlPatterns: [
      /class="[^"]*(?:property|listing|flat|apartment|bhk|real-?estate)[^"]*"/i,
      /data-(?:property|listing|flat|bhk)/i,
      /(?:bedroom|bathroom|balcon|floor[\s-]?plan|carpet[\s-]?area|built[\s-]?up[\s-]?area)/i,
    ],
    textPatterns: [
      /\d+\s*BHK/i,
      /(?:carpet|built[\s-]?up|super[\s-]?built[\s-]?up)\s*area/i,
      /(?:sq\.?\s*ft|square\s*feet|sqft)/i,
      /floor[\s-]?plan/i,
      /(?:rera|rera\s*id|rera\s*no)/i,
      /(?:possession|handover)\s*(?:date|by|in)/i,
      /(?:builder|developer|promoter)/i,
      /(?:amenities|swimming\s*pool|clubhouse|gym|parking)/i,
      /(?:price\s*per\s*sq|rate\s*per\s*sq)/i,
    ],
    platforms: [
      { name: 'Magicbricks', pattern: /magicbricks\.com/i },
      { name: '99acres', pattern: /99acres\.com/i },
      { name: 'Housing.com', pattern: /housing\.com/i },
      { name: 'NoBroker', pattern: /nobroker\.in/i },
      { name: 'CommonFloor', pattern: /commonfloor\.com/i },
      { name: 'Square Yards', pattern: /squareyards\.com/i },
      { name: 'PropTiger', pattern: /proptiger\.com/i },
      { name: 'Zillow', pattern: /zillow\.com/i },
      { name: 'Realtor.com', pattern: /realtor\.com/i },
      { name: 'Redfin', pattern: /redfin\.com/i },
      { name: 'Trulia', pattern: /trulia\.com/i },
      { name: 'Rightmove', pattern: /rightmove\.co\.uk/i },
      { name: 'Zoopla', pattern: /zoopla\.co\.uk/i },
    ],
  },
  {
    id: 'medical',
    label: 'Medical / Health',
    schemaTypes: ['MedicalCondition', 'Drug', 'MedicalClinic', 'Physician', 'Hospital', 'MedicalOrganization', 'MedicalWebPage', 'MedicalEntity', 'MedicalProcedure'],
    urlPatterns: [
      /\b(health|medical|clinic|hospital|doctor|symptom|treatment|disease|medicine|pharma)\b/i,
      /\b(fertility|pregnancy|ovulation|prenatal|postnatal|ivf|surrogacy)\b/i,
      /\b(diagnosis|therapy|wellness|cure|remedy|prescription)\b/i,
    ],
    htmlPatterns: [
      /class="[^"]*(?:medical|health|symptom|doctor|clinic|hospital)[^"]*"/i,
      /(?:medical[\s-]?disclaimer|health[\s-]?disclaimer|consult[\s-]?(?:a|your)[\s-]?doctor)/i,
    ],
    textPatterns: [
      /(?:consult\s*(?:a|your)\s*(?:doctor|physician|healthcare|medical))/i,
      /(?:medical\s*(?:advice|disclaimer|information|professional))/i,
      /(?:side\s*effects?|dosage|contraindication|drug\s*interaction)/i,
      /(?:symptoms?\s*(?:include|of|are)|diagnosis|prognosis)/i,
      /(?:FDA|WHO|CDC|ICMR|NIH|AYUSH)\s*(?:approved|recommend|guideline)/i,
      /(?:peer[\s-]?reviewed|clinical[\s-]?trial|evidence[\s-]?based|randomized[\s-]?controlled)/i,
      /(?:MBBS|MD|MS|FRCS|FRCOG|DNB|DM)\b/,
      /(?:ovulation|fertility|pregnancy\s*test|hCG|progesterone|estrogen)/i,
    ],
    platforms: [
      { name: 'Premom', pattern: /premom\.(in|com)/i },
      { name: 'WebMD', pattern: /webmd\.com/i },
      { name: 'Healthline', pattern: /healthline\.com/i },
      { name: 'Mayo Clinic', pattern: /mayoclinic\.org/i },
      { name: 'Practo', pattern: /practo\.com/i },
      { name: '1mg', pattern: /1mg\.com/i },
      { name: 'PharmEasy', pattern: /pharmeasy\.in/i },
      { name: 'Lybrate', pattern: /lybrate\.com/i },
      { name: 'MedlinePlus', pattern: /medlineplus\.gov/i },
      { name: 'Cleveland Clinic', pattern: /clevelandclinic\.org/i },
      { name: 'Apollo', pattern: /apollo(?:247|hospitals|pharmacy)/i },
    ],
  },
  {
    id: 'edtech',
    label: 'EdTech / Education',
    schemaTypes: ['Course', 'EducationalOrganization', 'CollegeOrUniversity', 'LearningResource', 'CreativeWork', 'ScholarlyArticle'],
    urlPatterns: [
      /\b(course|learn|education|tutorial|training|certification|degree|diploma)\b/i,
      /\b(class|lesson|module|curriculum|syllabus|exam|test[\s-]?prep)\b/i,
      /\b(enroll|admission|scholarship|university|college|school|institute)\b/i,
    ],
    htmlPatterns: [
      /class="[^"]*(?:course|lesson|curriculum|enroll|module)[^"]*"/i,
      /(?:enroll\s*now|start\s*learning|join\s*(?:course|class)|register\s*now)/i,
    ],
    textPatterns: [
      /(?:enroll|enrollment|registration)\s*(?:now|open|deadline)/i,
      /(?:curriculum|syllabus|course\s*content|learning\s*outcome)/i,
      /(?:instructor|professor|faculty|teacher|mentor|tutor)/i,
      /(?:certificate|certification|accredited|recognized\s*by)/i,
      /(?:semester|trimester|academic\s*year|batch)/i,
      /(?:online\s*(?:course|class|learning|degree)|e[\s-]?learning|MOOC)/i,
      /(?:placement|career\s*support|job\s*guarantee|internship)/i,
      /(?:AICTE|UGC|NAAC|NIRF|QS\s*ranking)/i,
    ],
    platforms: [
      { name: 'Byju\'s', pattern: /byjus\.com/i },
      { name: 'Unacademy', pattern: /unacademy\.com/i },
      { name: 'Coursera', pattern: /coursera\.org/i },
      { name: 'Udemy', pattern: /udemy\.com/i },
      { name: 'edX', pattern: /edx\.org/i },
      { name: 'Khan Academy', pattern: /khanacademy\.org/i },
      { name: 'Vedantu', pattern: /vedantu\.com/i },
      { name: 'upGrad', pattern: /upgrad\.com/i },
      { name: 'Simplilearn', pattern: /simplilearn\.com/i },
      { name: 'LinkedIn Learning', pattern: /linkedin\.com\/learning/i },
      { name: 'Skillshare', pattern: /skillshare\.com/i },
      { name: 'Pluralsight', pattern: /pluralsight\.com/i },
      { name: 'Great Learning', pattern: /greatlearning\.in/i },
      { name: 'Scaler', pattern: /scaler\.com/i },
    ],
  },
  {
    id: 'auto',
    label: 'Automotive',
    schemaTypes: ['Vehicle', 'Car', 'AutoDealer', 'AutoRepair', 'MotorizedBicycle', 'MotorVehicle'],
    urlPatterns: [
      /\b(car|cars|vehicle|auto|automobile|bike|motorcycle|scooter|suv|sedan|hatchback)\b/i,
      /\b(dealer|showroom|test[\s-]?drive|emi|on[\s-]?road[\s-]?price)\b/i,
      /\b(mileage|fuel[\s-]?efficiency|engine|horsepower|torque|cc|bhp)\b/i,
    ],
    htmlPatterns: [
      /class="[^"]*(?:vehicle|car|bike|auto|dealer|showroom)[^"]*"/i,
      /(?:test[\s-]?drive|book[\s-]?(?:now|test)|emi[\s-]?calculator)/i,
    ],
    textPatterns: [
      /(?:on[\s-]?road\s*price|ex[\s-]?showroom\s*price|emi\s*(?:starts?|from))/i,
      /(?:mileage|fuel[\s-]?(?:efficiency|economy|type)|kmpl|km\/l)/i,
      /(?:engine\s*(?:capacity|type|cc)|(?:\d+)\s*cc|bhp|torque|nm)/i,
      /(?:transmission|gear|manual|automatic|amt|cvt|dct|imt)/i,
      /(?:variant|trim|base\s*model|top\s*model|mid\s*variant)/i,
      /(?:test\s*drive|showroom|dealer|service\s*center)/i,
      /(?:safety\s*rating|ncap|airbag|abs|ebd|esc|traction\s*control)/i,
      /(?:resale|exchange|second[\s-]?hand|pre[\s-]?owned|used\s*(?:car|bike|vehicle))/i,
      /(?:km\s*driven|ownership|registration\s*(?:year|number))/i,
    ],
    platforms: [
      { name: 'Cars24', pattern: /cars24\.com/i },
      { name: 'CarDekho', pattern: /cardekho\.com/i },
      { name: 'CarWale', pattern: /carwale\.com/i },
      { name: 'ZigWheels', pattern: /zigwheels\.com/i },
      { name: 'BikeWale', pattern: /bikewale\.com/i },
      { name: 'BikeDekho', pattern: /bikedekho\.com/i },
      { name: 'Spinny', pattern: /spinny\.com/i },
      { name: 'Droom', pattern: /droom\.in/i },
      { name: 'Autocar India', pattern: /autocarindia\.com/i },
      { name: 'CarAndBike', pattern: /carandbike\.com/i },
      { name: 'AutoTrader', pattern: /autotrader\.(com|co\.uk)/i },
      { name: 'Cars.com', pattern: /cars\.com/i },
      { name: 'CarGurus', pattern: /cargurus\.com/i },
      { name: 'KBB', pattern: /kbb\.com/i },
      { name: 'Edmunds', pattern: /edmunds\.com/i },
      { name: 'TrueCar', pattern: /truecar\.com/i },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews / Comparisons',
    schemaTypes: ['Review', 'AggregateRating', 'Rating', 'CriticReview', 'UserReview'],
    urlPatterns: [
      /\b(review|reviews|best|top[\s-]?\d+|comparison|vs|versus|compare)\b/i,
      /\b(rating|rated|rank|ranking|roundup|pick|choice|recommendation)\b/i,
    ],
    htmlPatterns: [
      /class="[^"]*(?:review|rating|compare|pros|cons|verdict)[^"]*"/i,
      /(?:star[\s-]?rating|out\s*of\s*(?:5|10)|rating[\s-]?bar)/i,
      /(?:pros[\s-]?(?:and|&)[\s-]?cons|advantages|disadvantages)/i,
    ],
    textPatterns: [
      /(?:pros?\s*(?:and|&)\s*cons?|advantages\s*(?:and|&)\s*disadvantages)/i,
      /(?:verdict|bottom[\s-]?line|our[\s-]?(?:pick|choice|recommendation|rating|verdict))/i,
      /(?:we\s*(?:tested|reviewed|compared|evaluated|rated|ranked))/i,
      /(?:editor'?s?\s*(?:pick|choice|rating)|staff\s*pick)/i,
      /(?:best\s*(?:overall|budget|premium|for|in\s*\d{4}))/i,
      /(?:comparison\s*(?:table|chart)|head[\s-]?to[\s-]?head|side[\s-]?by[\s-]?side)/i,
      /(?:score|scored)\s*\d+(?:\.\d+)?\s*(?:out\s*of|\/)\s*(?:5|10|100)/i,
      /(?:independently\s*(?:tested|reviewed)|hands[\s-]?on\s*(?:review|testing))/i,
      /(?:affiliate|commission|we\s*may\s*earn)/i,
    ],
    platforms: [
      { name: 'TOI Reviews', pattern: /toireviews\.com/i },
      { name: 'Gadgets 360', pattern: /gadgets360\.com/i },
      { name: 'The Verge', pattern: /theverge\.com/i },
      { name: 'TechRadar', pattern: /techradar\.com/i },
      { name: 'CNET', pattern: /cnet\.com/i },
      { name: 'Tom\'s Guide', pattern: /tomsguide\.com/i },
      { name: 'Wirecutter', pattern: /nytimes\.com\/wirecutter/i },
      { name: 'PCMag', pattern: /pcmag\.com/i },
      { name: 'GSMArena', pattern: /gsmarena\.com/i },
      { name: '91mobiles', pattern: /91mobiles\.com/i },
      { name: 'Digit', pattern: /digit\.in/i },
      { name: 'MySmartPrice', pattern: /mysmartprice\.com/i },
      { name: 'TrustRadius', pattern: /trustradius\.com/i },
      { name: 'G2', pattern: /g2\.com/i },
      { name: 'Capterra', pattern: /capterra\.com/i },
    ],
  },
];

export function detectIndustry(ctx: AnalysisContext): IndustryDetection {
  const { $, html, url } = ctx;
  const bodyText = $('body').clone().find('script, style, noscript, svg').remove().end().text().slice(0, 15000);

  // Extract all JSON-LD types for schema matching
  const jsonLdTypes = new Set<string>();
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).text();
    if (text) {
      try {
        const parsed = JSON.parse(text);
        extractTypes(parsed, jsonLdTypes);
      } catch { /* skip */ }
    }
  });
  // Also check microdata
  $('[itemtype]').each((_, el) => {
    const itemtype = $(el).attr('itemtype') || '';
    const m = itemtype.match(/schema\.org\/(\w+)/i);
    if (m) jsonLdTypes.add(m[1]);
  });

  let bestMatch: IndustryDetection = { industry: null, label: '', confidence: 0, signals: [] };

  for (const def of INDUSTRY_DEFINITIONS) {
    let score = 0;
    const signals: string[] = [];

    // Platform match (strongest signal)
    for (const platform of def.platforms) {
      if (platform.pattern.test(url) || platform.pattern.test(html)) {
        score += 5;
        signals.push(`Platform: ${platform.name}`);
        break;
      }
    }

    // Schema type match
    for (const schemaType of def.schemaTypes) {
      if (jsonLdTypes.has(schemaType)) {
        score += 3;
        signals.push(`Schema: ${schemaType}`);
      }
    }

    // URL pattern match
    let urlMatches = 0;
    for (const pattern of def.urlPatterns) {
      if (pattern.test(url)) {
        urlMatches++;
        if (urlMatches <= 2) signals.push(`URL pattern: ${pattern.source.slice(0, 40)}`);
      }
    }
    score += Math.min(urlMatches * 2, 4);

    // HTML pattern match
    let htmlMatches = 0;
    for (const pattern of def.htmlPatterns) {
      if (pattern.test(html)) htmlMatches++;
    }
    score += Math.min(htmlMatches, 3);
    if (htmlMatches > 0) signals.push(`${htmlMatches} HTML pattern(s)`);

    // Text content match
    let textMatches = 0;
    for (const pattern of def.textPatterns) {
      if (pattern.test(bodyText)) textMatches++;
    }
    score += Math.min(textMatches, 5);
    if (textMatches > 0) signals.push(`${textMatches} content pattern(s)`);

    const confidence = Math.min(100, Math.round((score / 15) * 100));

    if (score >= 5 && confidence > bestMatch.confidence) {
      bestMatch = { industry: def.id, label: def.label, confidence, signals };
    }
  }

  return bestMatch;
}

function extractTypes(obj: unknown, types: Set<string>): void {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) { obj.forEach((i) => extractTypes(i, types)); return; }
  const r = obj as Record<string, unknown>;
  if (typeof r['@type'] === 'string') types.add(r['@type']);
  else if (Array.isArray(r['@type'])) (r['@type'] as string[]).forEach((t) => types.add(t));
  if (Array.isArray(r['@graph'])) (r['@graph'] as unknown[]).forEach((i) => extractTypes(i, types));
  for (const [k, v] of Object.entries(r)) {
    if (!k.startsWith('@') && v && typeof v === 'object') extractTypes(v, types);
  }
}

// ===== Industry-Specific AEO Checks =====

export function analyzeIndustry(ctx: AnalysisContext): Finding[] {
  const detection = detectIndustry(ctx);
  if (!detection.industry) return [];

  const findings: Finding[] = [];

  // Report detection
  findings.push({
    id: 'ind-detected',
    title: `${detection.label} site detected (${detection.confidence}% confidence)`,
    description: `This page was identified as a ${detection.label} site. Running industry-specific AEO checks.`,
    severity: 'info',
    category: 'industry',
    details: { industry: detection.industry, confidence: detection.confidence, signals: detection.signals },
  });

  // Run industry-specific checks
  switch (detection.industry) {
    case 'real-estate': return [...findings, ...analyzeRealEstate(ctx)];
    case 'medical': return [...findings, ...analyzeMedical(ctx)];
    case 'edtech': return [...findings, ...analyzeEdTech(ctx)];
    case 'auto': return [...findings, ...analyzeAuto(ctx)];
    case 'reviews': return [...findings, ...analyzeReviews(ctx)];
    default: return findings;
  }
}

// ===== REAL ESTATE =====
function analyzeRealEstate(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;
  const bodyText = $('body').clone().find('script, style, noscript').remove().end().text();
  const jsonLdText = getJsonLdText($);

  // 1. Property listing schema
  const hasPropertySchema = /RealEstateListing|Residence|Apartment|House|SingleFamilyResidence|Place|Product/i.test(jsonLdText) ||
    /itemtype.*schema\.org\/(Residence|Apartment|House|Product|Place)/i.test(html);

  if (hasPropertySchema) {
    findings.push({
      id: 'ind-re-schema',
      title: 'Property listing schema found',
      description: 'Structured data for property listings helps AI engines provide detailed answers about property features, pricing, and location.',
      severity: 'pass',
      category: 'industry',
    });
  } else {
    findings.push({
      id: 'ind-re-no-schema',
      title: 'No property listing schema',
      description: 'No RealEstateListing, Residence, or Apartment schema found. AI engines like Google AI Overviews use structured property data for real estate queries.',
      severity: 'fail',
      category: 'industry',
      recommendation: 'Add RealEstateListing or Residence schema with property details (price, area, bedrooms, location, images).',
    });
  }

  // 2. Price information
  const hasPrice = /₹[\d,.\s]+(?:lakh|lac|cr|crore)?|(?:price|cost)\s*[:]\s*₹?[\d,.]+|\$[\d,.]+/i.test(bodyText) ||
    /"price"|"offers"|"priceRange"/i.test(jsonLdText);
  if (hasPrice) {
    findings.push({ id: 'ind-re-price', title: 'Property pricing information visible', description: 'Price information is present. AI engines need pricing to answer "how much" queries.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-re-no-price', title: 'No property pricing visible', description: 'No clear pricing found. "How much does a flat cost in..." is a top real estate AI query. Without pricing, your page can\'t answer it.', severity: 'fail', category: 'industry', recommendation: 'Display property price prominently with structured data markup.' });
  }

  // 3. Area/size information
  const hasArea = /(?:\d+[\s,]*(?:sq\.?\s*ft|sqft|square\s*feet|sq\.?\s*m|sqm|sq\.?\s*yd))/i.test(bodyText) ||
    /(?:carpet|built[\s-]?up|super[\s-]?built[\s-]?up)\s*area/i.test(bodyText);
  if (hasArea) {
    findings.push({ id: 'ind-re-area', title: 'Property area/size information found', description: 'Area measurements are present. This helps AI engines answer size-related queries.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-re-no-area', title: 'No property area information', description: 'No carpet/built-up area found. Size is a critical factor in property search queries.', severity: 'warning', category: 'industry', recommendation: 'Add carpet area, built-up area, and plot size with units (sq ft/sq m).' });
  }

  // 4. Location details
  const hasLocation = /(?:locality|location|address|sector|pin[\s-]?code|zip|near|proximity|landmark)/i.test(bodyText) &&
    /"address"|"geo"|"location"|"areaServed"|"containedInPlace"/i.test(jsonLdText + html);
  const hasLocationText = /(?:sector|locality|area|city|district|state|pincode)\s*[:]\s*\S+/i.test(bodyText);

  if (hasLocation) {
    findings.push({ id: 'ind-re-location', title: 'Structured location data found', description: 'Location is structured for AI extraction. This helps answer "flats near..." or "properties in..." queries.', severity: 'pass', category: 'industry' });
  } else if (hasLocationText) {
    findings.push({ id: 'ind-re-location-text', title: 'Location present but not structured', description: 'Location info exists in text but not in structured data. AI bots may miss it.', severity: 'warning', category: 'industry', recommendation: 'Add PostalAddress or GeoCoordinates schema for the property location.' });
  } else {
    findings.push({ id: 'ind-re-no-location', title: 'No location data found', description: 'No structured or clear location information. Location is the #1 factor in real estate search.', severity: 'fail', category: 'industry', recommendation: 'Add detailed location with locality, city, state, pincode, and geo coordinates.' });
  }

  // 5. BHK / configuration
  const hasBHK = /\d+\s*BHK/i.test(bodyText) || /(?:bedroom|bathroom|balcon|configuration)/i.test(bodyText);
  if (hasBHK) {
    findings.push({ id: 'ind-re-bhk', title: 'Property configuration (BHK/rooms) found', description: 'Room configuration is present. "2 BHK in..." or "3 bedroom apartment..." are top AI queries.', severity: 'pass', category: 'industry' });
  }

  // 6. Images gallery
  const propertyImages = $('img[src*="property"], img[src*="flat"], img[src*="apartment"], img[alt*="property"], img[alt*="flat"], img[alt*="bedroom"], img[alt*="kitchen"], img[alt*="bathroom"]');
  const allImages = $('article img, main img, .listing img, [class*="gallery"] img, [class*="slider"] img, [class*="carousel"] img');
  const totalImages = Math.max(propertyImages.length, allImages.length);

  if (totalImages >= 5) {
    findings.push({ id: 'ind-re-images', title: `${totalImages}+ property images found`, description: 'Multiple property images available. Visual content increases engagement and AI snippet selection.', severity: 'pass', category: 'industry' });
  } else if (totalImages >= 1) {
    findings.push({ id: 'ind-re-few-images', title: `Only ${totalImages} property image(s)`, description: 'Property listings with 5+ images perform better. Add more photos of rooms, amenities, and surroundings.', severity: 'warning', category: 'industry' });
  }

  // 7. RERA information (India-specific)
  const hasRERA = /rera\s*(?:id|no|number|registration|reg)/i.test(bodyText);
  if (hasRERA) {
    findings.push({ id: 'ind-re-rera', title: 'RERA registration found', description: 'RERA compliance is visible. This is a trust signal for Indian real estate - AI engines recognize regulatory compliance.', severity: 'pass', category: 'industry' });
  } else if (/\.in|india|noida|mumbai|bangalore|delhi|hyderabad|pune|chennai|kolkata|gurgaon|gurugram/i.test(ctx.url + bodyText.slice(0, 3000))) {
    findings.push({ id: 'ind-re-no-rera', title: 'No RERA information (India)', description: 'No RERA registration found. RERA is mandatory for Indian real estate and is a strong trust/compliance signal for AI engines.', severity: 'warning', category: 'industry', recommendation: 'Add RERA registration number prominently on the listing page.' });
  }

  // 8. Amenities section
  const hasAmenities = /(?:amenities|facilities|features)\s*(?:include|:|\n)/i.test(bodyText) ||
    $('[class*="amenity"], [class*="amenities"], [class*="facility"], [class*="features"]').length > 0;
  if (hasAmenities) {
    findings.push({ id: 'ind-re-amenities', title: 'Amenities section found', description: 'Amenities listing helps AI answer queries like "flats with swimming pool in..." or "gated community apartments..."', severity: 'pass', category: 'industry' });
  }

  // 9. Floor plan
  const hasFloorPlan = /floor[\s-]?plan/i.test(bodyText) || $('img[alt*="floor plan"], img[src*="floor"], [class*="floor-plan"]').length > 0;
  if (hasFloorPlan) {
    findings.push({ id: 'ind-re-floorplan', title: 'Floor plan available', description: 'Floor plans help users and AI engines understand property layout. This increases content depth.', severity: 'pass', category: 'industry' });
  }

  return findings;
}

// ===== MEDICAL / HEALTH =====
function analyzeMedical(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;
  const bodyText = $('body').clone().find('script, style, noscript').remove().end().text();
  const jsonLdText = getJsonLdText($);

  // 1. Medical disclaimer (CRITICAL for YMYL)
  const hasDisclaimer = /(?:medical\s*disclaimer|health\s*disclaimer|not\s*(?:a\s*)?substitute\s*for\s*(?:professional\s*)?medical|consult\s*(?:a|your)\s*(?:doctor|physician|healthcare\s*provider|medical\s*professional))/i.test(bodyText);
  if (hasDisclaimer) {
    findings.push({ id: 'ind-med-disclaimer', title: 'Medical disclaimer present', description: 'A medical disclaimer is visible. This is CRITICAL for YMYL (Your Money Your Life) content. Google specifically checks health pages for disclaimers.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-med-no-disclaimer', title: 'No medical disclaimer found', description: 'No medical disclaimer detected. Health content is YMYL (Your Money Your Life) - Google and AI engines require clear disclaimers that content is not a substitute for professional medical advice.', severity: 'fail', category: 'industry', recommendation: 'Add a prominent medical disclaimer: "This content is for informational purposes only and is not a substitute for professional medical advice. Consult your doctor."' });
  }

  // 2. Author credentials
  const hasMedicalAuthor = /(?:MBBS|MD|MS|FRCS|FRCOG|DNB|DM|Dr\.\s*[A-Z]|reviewed\s*by\s*(?:Dr\.|doctor)|medically\s*reviewed|fact[\s-]?checked\s*by)/i.test(bodyText);
  if (hasMedicalAuthor) {
    findings.push({ id: 'ind-med-author', title: 'Medical professional credentials found', description: 'Author/reviewer has medical credentials (MD, MBBS, etc.). This is the strongest E-E-A-T signal for health content and critical for AI engine trust.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-med-no-author', title: 'No medical credentials visible', description: 'No medical professional credentials found (MD, MBBS, etc.). Google\'s YMYL guidelines require health content to show author expertise. AI engines heavily weight medical authority.', severity: 'fail', category: 'industry', recommendation: 'Show author\'s medical qualifications prominently. Add "Medically reviewed by Dr. [Name], [Qualification]" with link to their profile.' });
  }

  // 3. Medical review date
  const hasReviewDate = /(?:(?:medically\s*)?reviewed\s*(?:on|:)|last\s*(?:updated|reviewed|verified)|fact[\s-]?checked\s*on)/i.test(bodyText);
  if (hasReviewDate) {
    findings.push({ id: 'ind-med-review-date', title: 'Medical review/update date present', description: 'Content shows when it was medically reviewed. Freshness is critical for health content - outdated medical advice is dangerous.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-med-no-review-date', title: 'No medical review date', description: 'No "medically reviewed" or "last updated" date found. Health content must show recency for AI engine trust.', severity: 'warning', category: 'industry', recommendation: 'Add "Medically reviewed on [date]" and "Last updated: [date]" prominently.' });
  }

  // 4. Citations to medical sources
  const medicalSources = /(?:pubmed|ncbi|nih\.gov|who\.int|cdc\.gov|lancet|bmj\.com|nejm\.org|nature\.com|springer|wiley|cochrane|medline)/i;
  const hasMedicalCitations = medicalSources.test(html);
  const hasReferences = /(?:references?|sources?|bibliography|citations?)\s*(?:\n|:)/i.test(bodyText);

  if (hasMedicalCitations) {
    findings.push({ id: 'ind-med-citations', title: 'Medical source citations found (PubMed/NIH/WHO)', description: 'Links to peer-reviewed medical sources found. This is the gold standard for health content credibility in AI answers.', severity: 'pass', category: 'industry' });
  } else if (hasReferences) {
    findings.push({ id: 'ind-med-refs', title: 'References section found', description: 'A references section exists. Ensure it links to peer-reviewed medical sources for maximum AI trust.', severity: 'warning', category: 'industry', recommendation: 'Link references to PubMed, NIH, WHO, or peer-reviewed journals for maximum credibility.' });
  } else {
    findings.push({ id: 'ind-med-no-citations', title: 'No medical citations or references', description: 'No medical source citations found. Health content without evidence-based references is flagged as low-quality by AI engines.', severity: 'fail', category: 'industry', recommendation: 'Add a References section with links to PubMed, NIH, WHO, or peer-reviewed medical journals that support your claims.' });
  }

  // 5. Medical schema
  const hasMedicalSchema = /MedicalCondition|Drug|MedicalClinic|Physician|Hospital|MedicalOrganization|MedicalWebPage/i.test(jsonLdText + html);
  if (hasMedicalSchema) {
    findings.push({ id: 'ind-med-schema', title: 'Medical schema markup found', description: 'Medical-specific schema helps AI engines understand conditions, treatments, and provide accurate health answers.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-med-no-schema', title: 'No medical schema markup', description: 'No MedicalCondition, Drug, or MedicalWebPage schema found. Medical schema helps AI engines provide structured health answers.', severity: 'warning', category: 'industry', recommendation: 'Add MedicalCondition or MedicalWebPage schema with relevant medical properties.' });
  }

  // 6. Content structure for health queries
  const hasSymptomsSection = /(?:symptoms?|signs?\s*(?:and|&)\s*symptoms?|warning\s*signs?)/i.test(bodyText);
  const hasTreatmentSection = /(?:treatment|therapy|remedies|management|how\s*to\s*treat)/i.test(bodyText);
  const hasCausesSection = /(?:causes?|risk\s*factors?|etiology|pathogenesis)/i.test(bodyText);

  const medicalSections = [hasSymptomsSection, hasTreatmentSection, hasCausesSection].filter(Boolean).length;
  if (medicalSections >= 2) {
    findings.push({ id: 'ind-med-structure', title: `Well-structured health content (${medicalSections}/3 key sections)`, description: 'Content covers symptoms, causes, and/or treatment - the key sections AI engines extract for health queries.', severity: 'pass', category: 'industry' });
  } else if (medicalSections === 1) {
    findings.push({ id: 'ind-med-partial-structure', title: 'Partial health content structure', description: 'Only 1 of 3 key health sections found (symptoms, causes, treatment). Comprehensive coverage improves AI answer selection.', severity: 'warning', category: 'industry', recommendation: 'Add separate sections for Symptoms, Causes/Risk Factors, and Treatment/Management.' });
  }

  return findings;
}

// ===== EDTECH / EDUCATION =====
function analyzeEdTech(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;
  const bodyText = $('body').clone().find('script, style, noscript').remove().end().text();
  const jsonLdText = getJsonLdText($);

  // 1. Course schema
  const hasCourseSchema = /Course|EducationalOrganization|LearningResource/i.test(jsonLdText + html);
  if (hasCourseSchema) {
    findings.push({ id: 'ind-edu-schema', title: 'Course/Education schema found', description: 'Educational schema helps AI engines provide structured course information in answers.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-edu-no-schema', title: 'No Course schema', description: 'No Course or EducationalOrganization schema found. Course schema helps AI engines answer "best course for..." queries with structured data.', severity: 'fail', category: 'industry', recommendation: 'Add Course schema with name, description, provider, duration, and coursePrerequisites.' });
  }

  // 2. Course details
  const hasDuration = /(?:duration|weeks?|months?|hours?|semester)\s*[:]\s*[\d]/i.test(bodyText) || /\d+\s*(?:weeks?|months?|hours?)\s*(?:course|program)/i.test(bodyText);
  const hasFees = /(?:fees?|tuition|cost|price|₹|INR|\$|free)\s*[:]\s*[\d₹$]/i.test(bodyText) || /(?:fees?|tuition|price)\s*(?:structure|details)/i.test(bodyText);
  const hasCurriculum = /(?:curriculum|syllabus|module|topic|what\s*you'?ll?\s*learn|course\s*content|learning\s*outcome)/i.test(bodyText);
  const hasInstructor = /(?:instructor|professor|faculty|teacher|mentor|taught\s*by|learn\s*from)/i.test(bodyText);

  const courseDetails = [
    { name: 'Duration', found: hasDuration },
    { name: 'Fees/Pricing', found: hasFees },
    { name: 'Curriculum', found: hasCurriculum },
    { name: 'Instructor', found: hasInstructor },
  ];
  const foundDetails = courseDetails.filter((d) => d.found);
  const missingDetails = courseDetails.filter((d) => !d.found);

  if (foundDetails.length >= 3) {
    findings.push({ id: 'ind-edu-details', title: `Comprehensive course info (${foundDetails.map((d) => d.name).join(', ')})`, description: 'Course page has detailed information. AI engines use these details to compare and recommend courses.', severity: 'pass', category: 'industry' });
  } else if (foundDetails.length > 0) {
    findings.push({ id: 'ind-edu-partial', title: `Course info found: ${foundDetails.map((d) => d.name).join(', ')}`, description: `Missing: ${missingDetails.map((d) => d.name).join(', ')}. Complete course information helps AI engines recommend your course.`, severity: 'warning', category: 'industry', recommendation: `Add ${missingDetails.map((d) => d.name).join(', ')} to make the course page comprehensive for AI engines.` });
  }

  // 3. Accreditation / recognition
  const hasAccreditation = /(?:accredited|recognized|approved|affiliated)\s*(?:by|with|from)/i.test(bodyText) ||
    /(?:AICTE|UGC|NAAC|NIRF|ISO|ABET|AACSB)\s*(?:approved|accredited|recognized)/i.test(bodyText);
  if (hasAccreditation) {
    findings.push({ id: 'ind-edu-accreditation', title: 'Accreditation/recognition found', description: 'Educational accreditation signals quality and trust. AI engines prioritize accredited courses in recommendations.', severity: 'pass', category: 'industry' });
  }

  // 4. Student reviews/testimonials
  const hasReviews = /(?:student\s*(?:review|testimonial|feedback)|alumni|success\s*stor)/i.test(bodyText) ||
    /(?:rating|rated)\s*\d+(?:\.\d+)?\s*(?:out\s*of|\/)\s*5/i.test(bodyText);
  if (hasReviews) {
    findings.push({ id: 'ind-edu-reviews', title: 'Student reviews/testimonials found', description: 'Student reviews provide social proof. AI engines use ratings and reviews to rank course recommendations.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-edu-no-reviews', title: 'No student reviews or ratings', description: 'No student reviews or ratings found. User reviews are a key ranking factor for course recommendations by AI.', severity: 'warning', category: 'industry', recommendation: 'Add student testimonials and aggregate ratings with Review/AggregateRating schema.' });
  }

  // 5. Placement/career info
  const hasPlacement = /(?:placement|career\s*(?:support|outcome|service)|job\s*(?:guarantee|assistance)|average\s*(?:salary|package|CTC)|hiring\s*partner)/i.test(bodyText);
  if (hasPlacement) {
    findings.push({ id: 'ind-edu-placement', title: 'Placement/career info found', description: 'Career outcome data helps AI answer "is this course worth it?" and "placement after..." queries.', severity: 'pass', category: 'industry' });
  }

  // 6. Comparison content (vs other courses)
  const hasComparison = /(?:vs\.?|versus|compared?\s*(?:to|with)|difference\s*between|better\s*than|alternative)/i.test(bodyText);
  if (hasComparison) {
    findings.push({ id: 'ind-edu-comparison', title: 'Comparison content found', description: 'Comparison content helps AI engines answer "X vs Y course" queries directly from your page.', severity: 'pass', category: 'industry' });
  }

  return findings;
}

// ===== AUTOMOTIVE =====
function analyzeAuto(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;
  const bodyText = $('body').clone().find('script, style, noscript').remove().end().text();
  const jsonLdText = getJsonLdText($);

  // 1. Vehicle schema
  const hasVehicleSchema = /Vehicle|Car|AutoDealer|MotorizedBicycle|Product/i.test(jsonLdText);
  if (hasVehicleSchema) {
    findings.push({ id: 'ind-auto-schema', title: 'Vehicle/Auto schema found', description: 'Vehicle schema helps AI engines provide structured answers about car specs, pricing, and comparisons.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-auto-no-schema', title: 'No Vehicle schema', description: 'No Vehicle or Car schema found. Vehicle schema with price, mileage, and specs helps AI answer car shopping queries.', severity: 'warning', category: 'industry', recommendation: 'Add Vehicle schema with make, model, year, price, fuelType, mileageFromOdometer, and vehicleConfiguration.' });
  }

  // 2. Pricing
  const hasPrice = /(?:price|cost|emi|on[\s-]?road|ex[\s-]?showroom)\s*[:₹$]\s*[\d,.]+/i.test(bodyText) ||
    /₹\s*[\d,.]+\s*(?:lakh|lac|cr|crore)?/i.test(bodyText) ||
    /"price"|"offers"|"priceRange"/i.test(jsonLdText);
  if (hasPrice) {
    findings.push({ id: 'ind-auto-price', title: 'Vehicle pricing found', description: 'Pricing information is present. "How much does X car cost?" is a top AI query for automotive.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-auto-no-price', title: 'No vehicle pricing', description: 'No clear pricing (on-road/ex-showroom) found. Price is the #1 query factor for car buyers using AI.', severity: 'fail', category: 'industry', recommendation: 'Display on-road price, ex-showroom price, and EMI options with structured data.' });
  }

  // 3. Specifications
  const specPatterns = [
    { name: 'Engine', pattern: /(?:engine|displacement|cc|cubic\s*cm)\s*[:]\s*[\d]/i },
    { name: 'Mileage', pattern: /(?:mileage|fuel\s*efficiency|kmpl|km\/l)\s*[:]\s*[\d]/i },
    { name: 'Power', pattern: /(?:power|bhp|hp|horsepower|ps)\s*[:]\s*[\d]/i },
    { name: 'Transmission', pattern: /(?:transmission|gear)\s*[:]\s*\S/i },
    { name: 'Safety', pattern: /(?:safety|airbag|ncap|abs|ebd)\s*[:]\s*\S/i },
  ];
  const foundSpecs = specPatterns.filter((s) => s.pattern.test(bodyText));

  if (foundSpecs.length >= 3) {
    findings.push({ id: 'ind-auto-specs', title: `Detailed specs: ${foundSpecs.map((s) => s.name).join(', ')}`, description: 'Comprehensive vehicle specifications found. AI engines use specs to answer comparison and "best car for..." queries.', severity: 'pass', category: 'industry' });
  } else if (foundSpecs.length > 0) {
    const missing = specPatterns.filter((s) => !foundSpecs.includes(s));
    findings.push({ id: 'ind-auto-partial-specs', title: `Some specs found: ${foundSpecs.map((s) => s.name).join(', ')}`, description: `Missing: ${missing.map((s) => s.name).join(', ')}. Complete specs help AI engines compare vehicles accurately.`, severity: 'warning', category: 'industry', recommendation: `Add ${missing.map((s) => s.name).join(', ')} specifications.` });
  }

  // 4. Variants/trim comparison
  const hasVariants = /(?:variant|trim|model)\s*(?:comparison|list|details|price)/i.test(bodyText) ||
    $('table, [class*="variant"], [class*="trim"]').length > 0;
  if (hasVariants) {
    findings.push({ id: 'ind-auto-variants', title: 'Variant/trim information found', description: 'Variant comparison helps AI answer "which variant of X is best?" queries.', severity: 'pass', category: 'industry' });
  }

  // 5. Images
  const carImages = $('img[alt*="car"], img[alt*="vehicle"], img[alt*="exterior"], img[alt*="interior"], img[src*="gallery"], [class*="gallery"] img').length;
  if (carImages >= 5) {
    findings.push({ id: 'ind-auto-images', title: `${carImages}+ vehicle images`, description: 'Multiple vehicle images with alt text help AI engines and users understand the vehicle visually.', severity: 'pass', category: 'industry' });
  }

  // 6. User reviews for used cars
  const hasUserReviews = /(?:owner\s*review|user\s*review|customer\s*review|(?:\d+(?:\.\d+)?)\s*(?:\/5|out\s*of\s*5))/i.test(bodyText);
  if (hasUserReviews) {
    findings.push({ id: 'ind-auto-reviews', title: 'User/owner reviews found', description: 'Owner reviews help AI engines answer "is X car reliable?" and "X car problems" queries.', severity: 'pass', category: 'industry' });
  }

  // 7. EMI calculator
  const hasEMI = /(?:emi\s*calculator|emi\s*(?:starts?\s*(?:at|from)|per\s*month)|monthly\s*(?:installment|payment))/i.test(bodyText);
  if (hasEMI) {
    findings.push({ id: 'ind-auto-emi', title: 'EMI/financing information found', description: 'EMI/financing info helps AI answer "can I afford..." and "monthly payment for..." queries.', severity: 'pass', category: 'industry' });
  }

  return findings;
}

// ===== REVIEWS / COMPARISONS =====
function analyzeReviews(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;
  const bodyText = $('body').clone().find('script, style, noscript').remove().end().text();
  const jsonLdText = getJsonLdText($);

  // 1. Review schema
  const hasReviewSchema = /Review|AggregateRating|CriticReview/i.test(jsonLdText);
  if (hasReviewSchema) {
    findings.push({ id: 'ind-rev-schema', title: 'Review/Rating schema found', description: 'Review schema with ratings helps AI engines display star ratings and review summaries in answers.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-rev-no-schema', title: 'No Review schema', description: 'No Review or AggregateRating schema found. Review schema is critical for review sites - AI engines use it to show ratings in answers.', severity: 'fail', category: 'industry', recommendation: 'Add Review schema with reviewRating, author, and datePublished. Add AggregateRating for aggregate scores.' });
  }

  // 2. Pros and cons structure
  const hasProsConsHTML = $('[class*="pros"], [class*="cons"], [class*="advantage"], [class*="disadvantage"]').length > 0;
  const hasProsConsText = /(?:pros?\s*(?:and|&)\s*cons?|advantages?\s*(?:and|&)\s*disadvantages?)/i.test(bodyText);
  if (hasProsConsHTML || hasProsConsText) {
    findings.push({ id: 'ind-rev-proscons', title: 'Pros & Cons structure found', description: 'Pros/cons structure is the #1 content format AI engines extract for product review queries. This is excellent for AEO.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-rev-no-proscons', title: 'No Pros & Cons section', description: 'No pros/cons structure found. AI engines like Google AI Overviews specifically look for pros/cons to include in review summaries.', severity: 'fail', category: 'industry', recommendation: 'Add a clearly structured Pros & Cons section using lists. Consider using the Pros/Cons snippet markup.' });
  }

  // 3. Rating/score
  const hasRating = /(?:\d+(?:\.\d+)?)\s*(?:\/\s*(?:5|10)|out\s*of\s*(?:5|10))/i.test(bodyText) ||
    $('[class*="rating"], [class*="score"], [class*="star"]').length > 0;
  if (hasRating) {
    findings.push({ id: 'ind-rev-rating', title: 'Numerical rating/score found', description: 'A numerical rating is present. AI engines use numerical scores to compare and rank products in answer summaries.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-rev-no-rating', title: 'No numerical rating or score', description: 'No numerical rating (e.g., 4.5/5) found. AI engines need clear scores to generate "best X" or comparison answers.', severity: 'warning', category: 'industry', recommendation: 'Add a clear numerical rating (e.g., "Rating: 8.5/10") with structured markup.' });
  }

  // 4. Verdict / Bottom line
  const hasVerdict = /(?:verdict|bottom[\s-]?line|final[\s-]?(?:thoughts?|verdict|word)|our[\s-]?(?:take|pick|verdict)|summary|conclusion)/i.test(bodyText);
  if (hasVerdict) {
    findings.push({ id: 'ind-rev-verdict', title: 'Review verdict/summary found', description: 'A verdict or summary section is present. AI engines often extract the verdict as the primary answer for review queries.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-rev-no-verdict', title: 'No review verdict or summary', description: 'No verdict/bottom-line section found. AI engines look for a clear summary statement to feature in answers.', severity: 'warning', category: 'industry', recommendation: 'Add a "Verdict" or "Bottom Line" section with a concise 2-3 sentence summary of your review.' });
  }

  // 5. Comparison table
  const hasTables = $('table').length;
  const hasComparisonClass = $('[class*="comparison"], [class*="compare"], [class*="versus"], [class*="vs"]').length > 0;
  if (hasTables > 0 || hasComparisonClass) {
    findings.push({ id: 'ind-rev-table', title: `Comparison table(s) found (${hasTables} table(s))`, description: 'Comparison tables help AI engines extract side-by-side data for "X vs Y" queries. Tables are highly structured and AI-friendly.', severity: 'pass', category: 'industry' });
  } else {
    findings.push({ id: 'ind-rev-no-table', title: 'No comparison tables', description: 'No comparison tables found. For "X vs Y" queries, AI engines prefer structured table data they can extract directly.', severity: 'warning', category: 'industry', recommendation: 'Add HTML comparison tables with key specs/features side by side.' });
  }

  // 6. Testing methodology
  const hasMethodology = /(?:how\s*we\s*(?:test|review|evaluate|rate|score)|testing\s*(?:methodology|process|criteria)|our\s*(?:review|testing)\s*process|evaluation\s*criteria)/i.test(bodyText);
  if (hasMethodology) {
    findings.push({ id: 'ind-rev-methodology', title: 'Testing methodology disclosed', description: 'Review methodology is transparent. This is an E-E-A-T trust signal that AI engines value for recommending review sources.', severity: 'pass', category: 'industry' });
  }

  // 7. Affiliate disclosure
  const hasAffiliateDisclosure = /(?:affiliate|commission|we\s*(?:may\s*)?(?:earn|receive)|partner[\s-]?link|sponsored|paid\s*partnership)/i.test(bodyText);
  if (hasAffiliateDisclosure) {
    findings.push({ id: 'ind-rev-disclosure', title: 'Affiliate/sponsorship disclosure found', description: 'Transparency about affiliate relationships is a trust signal. FTC and Google require this disclosure for review content.', severity: 'pass', category: 'industry' });
  }

  // 8. Multiple product reviews (roundup check)
  const productHeadings = bodyText.match(/(?:^|\n)\s*\d+[\.\)]\s+(?:best|top)?\s*\w+/gim);
  const isRoundup = productHeadings && productHeadings.length >= 3;
  if (isRoundup) {
    findings.push({ id: 'ind-rev-roundup', title: `Roundup/listicle format (${productHeadings!.length} items)`, description: 'This appears to be a product roundup. AI engines frequently cite roundup articles for "best X" queries.', severity: 'pass', category: 'industry' });
  }

  // 9. Where to buy / pricing
  const hasWhereToBy = /(?:where\s*to\s*buy|check\s*(?:price|latest)|buy\s*(?:on|from|at)|available\s*(?:on|at|from)|(?:amazon|flipkart|best\s*buy)[\s.]*(?:com|in))/i.test(bodyText);
  if (hasWhereToBy) {
    findings.push({ id: 'ind-rev-buy', title: 'Purchase links/pricing found', description: 'Where-to-buy information helps complete the review journey. AI engines may include pricing data in answers.', severity: 'pass', category: 'industry' });
  }

  return findings;
}

// Helper to get all JSON-LD text for pattern matching
function getJsonLdText($: import('cheerio').CheerioAPI): string {
  const blocks: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).text();
    if (text) blocks.push(text);
  });
  return blocks.join(' ');
}
