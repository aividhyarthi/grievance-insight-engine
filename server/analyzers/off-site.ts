import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeOffSite(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html, url } = ctx;

  let domain: string;
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    domain = '';
  }
  const $body = $('body').clone();
  $body.find('script, style, noscript').remove();
  const bodyText = $body.text().toLowerCase();

  // ===== 1. sameAs / Platform Links =====
  const sameAsMatch = html.match(/"sameAs"\s*:\s*(\[[\s\S]*?\])/);
  let sameAsLinks: string[] = [];
  if (sameAsMatch) {
    try { sameAsLinks = JSON.parse(sameAsMatch[1]); } catch { /* ignore */ }
  }

  const platformPatterns: Array<{ name: string; pattern: RegExp; type: string }> = [
    { name: 'Google Business Profile', pattern: /google\.com\/maps|business\.google\.com|g\.page/i, type: 'listing' },
    { name: 'Yelp', pattern: /yelp\.com/i, type: 'listing' },
    { name: 'BBB', pattern: /bbb\.org/i, type: 'listing' },
    { name: 'Trustpilot', pattern: /trustpilot\.com/i, type: 'review' },
    { name: 'G2', pattern: /g2\.com/i, type: 'review' },
    { name: 'Capterra', pattern: /capterra\.com/i, type: 'review' },
    { name: 'Crunchbase', pattern: /crunchbase\.com/i, type: 'listing' },
    { name: 'Wikipedia', pattern: /wikipedia\.org/i, type: 'knowledge' },
    { name: 'Wikidata', pattern: /wikidata\.org/i, type: 'knowledge' },
    { name: 'LinkedIn', pattern: /linkedin\.com\/company/i, type: 'social' },
    { name: 'Twitter/X', pattern: /(?:twitter|x)\.com\//i, type: 'social' },
    { name: 'Facebook', pattern: /facebook\.com\//i, type: 'social' },
    { name: 'YouTube', pattern: /youtube\.com\/(?:c\/|channel\/|@)/i, type: 'social' },
    { name: 'Instagram', pattern: /instagram\.com\//i, type: 'social' },
    { name: 'GitHub', pattern: /github\.com\//i, type: 'social' },
    { name: 'Apple App Store', pattern: /apps\.apple\.com/i, type: 'listing' },
    { name: 'Google Play', pattern: /play\.google\.com/i, type: 'listing' },
  ];

  const allLinks: string[] = [...sameAsLinks];
  $('a[href]').each((_, el) => { allLinks.push($(el).attr('href') || ''); });

  const foundPlatforms: Array<{ name: string; type: string }> = [];
  for (const platform of platformPatterns) {
    if (allLinks.some(link => platform.pattern.test(link))) {
      foundPlatforms.push({ name: platform.name, type: platform.type });
    }
  }

  const listings = foundPlatforms.filter(p => p.type === 'listing');
  const reviews = foundPlatforms.filter(p => p.type === 'review');
  const knowledge = foundPlatforms.filter(p => p.type === 'knowledge');

  if (listings.length >= 2) {
    findings.push({
      id: 'offsite-business-listings',
      title: `${listings.length} business listing platform(s) linked`,
      description: `Found links to: ${listings.map(l => l.name).join(', ')}. Business listings are key off-site signals that AI engines use to verify entity information.`,
      severity: 'pass',
      category: 'off-site',
      details: { platforms: listings.map(l => l.name) },
    });
  } else if (listings.length === 1) {
    findings.push({
      id: 'offsite-listing-limited',
      title: `Only 1 business listing: ${listings[0].name}`,
      description: 'Only one listing platform linked. Multiple listings (Google Business, Yelp, BBB) strengthen off-site credibility.',
      severity: 'info',
      category: 'off-site',
      recommendation: 'Claim and link to additional business listing platforms relevant to your industry.',
    });
  } else {
    findings.push({
      id: 'offsite-no-listings',
      title: 'No business listing links found',
      description: 'No links to Google Business Profile, Yelp, BBB, or other listing platforms. These are off-site trust signals that AI engines cross-reference.',
      severity: 'warning',
      category: 'off-site',
      recommendation: 'Claim your Google Business Profile and list on relevant platforms. Link to them from your site.',
    });
  }

  if (reviews.length >= 1) {
    findings.push({
      id: 'offsite-review-platforms',
      title: `${reviews.length} review platform(s) linked`,
      description: `Found links to: ${reviews.map(r => r.name).join(', ')}. Third-party review platforms validate your reputation for AI engines.`,
      severity: 'pass',
      category: 'off-site',
    });
  }

  if (knowledge.length > 0) {
    findings.push({
      id: 'offsite-knowledge-base',
      title: `Knowledge base presence: ${knowledge.map(k => k.name).join(', ')}`,
      description: 'Links to Wikipedia/Wikidata found. Presence in knowledge bases significantly boosts AI engine entity recognition.',
      severity: 'pass',
      category: 'off-site',
    });
  }

  // ===== 2. sameAs schema completeness =====
  if (sameAsLinks.length >= 3) {
    findings.push({
      id: 'offsite-sameas-rich',
      title: `Schema sameAs has ${sameAsLinks.length} links`,
      description: 'Organization schema has multiple sameAs URLs. This helps AI engines build a complete entity graph for your brand.',
      severity: 'pass',
      category: 'off-site',
      details: { sameAsCount: sameAsLinks.length },
    });
  } else if (sameAsLinks.length > 0) {
    findings.push({
      id: 'offsite-sameas-limited',
      title: `Schema sameAs has only ${sameAsLinks.length} link(s)`,
      description: 'sameAs property exists but has few links. Add all official profiles for a stronger entity graph.',
      severity: 'info',
      category: 'off-site',
      recommendation: 'Add all official social profiles and listing pages to your Organization schema sameAs array.',
    });
  } else {
    findings.push({
      id: 'offsite-no-sameas',
      title: 'No sameAs in Organization schema',
      description: 'No sameAs property found in structured data. This is the primary way to tell AI engines about your brand\'s presence across the web.',
      severity: 'warning',
      category: 'off-site',
      recommendation: 'Add sameAs to your Organization JSON-LD schema with URLs to all your official profiles and listings.',
    });
  }

  // ===== 3. Brand consistency signals =====
  const title = $('title').text().trim();
  const ogSiteName = $('meta[property="og:site_name"]').attr('content') || '';
  const orgNameMatch = html.match(/"name"\s*:\s*"([^"]+)"[\s\S]*?"@type"\s*:\s*"Organization"/);
  const orgName = orgNameMatch ? orgNameMatch[1] : null;
  const brandNames = [ogSiteName, orgName].filter(Boolean) as string[];

  if (brandNames.length >= 1 && brandNames.some(name => title.toLowerCase().includes(name.toLowerCase()))) {
    findings.push({
      id: 'offsite-brand-consistent',
      title: 'Brand name consistent across signals',
      description: `Brand name "${brandNames[0]}" appears in title, OG tags, and/or schema. Consistent naming helps AI engines confidently identify your entity.`,
      severity: 'pass',
      category: 'off-site',
    });
  } else if (brandNames.length === 0) {
    findings.push({
      id: 'offsite-brand-undefined',
      title: 'Brand name not defined in structured data',
      description: 'No brand name found in og:site_name or Organization schema. AI engines need a clear brand identity to build your entity graph.',
      severity: 'warning',
      category: 'off-site',
      recommendation: 'Set og:site_name meta tag and add Organization schema with your official brand name.',
    });
  }

  // ===== 4. External authority signals on page =====
  const authorityPatterns = [
    { pattern: /\bfeatured (?:in|on)\b/i, label: 'Featured in/on' },
    { pattern: /\bas seen (?:in|on)\b/i, label: 'As seen in/on' },
    { pattern: /\btrusted by\b/i, label: 'Trusted by' },
    { pattern: /\bpartner(?:s|ed)? with\b/i, label: 'Partnered with' },
    { pattern: /\brecognized by\b/i, label: 'Recognized by' },
    { pattern: /\b\d+[,+]?\s*(?:customers?|clients?|users?|companies|businesses)\b/i, label: 'Social proof numbers' },
  ];

  const foundAuthority: string[] = [];
  for (const { pattern, label } of authorityPatterns) {
    if (pattern.test(bodyText)) foundAuthority.push(label);
  }

  if (foundAuthority.length >= 3) {
    findings.push({
      id: 'offsite-authority-strong',
      title: `${foundAuthority.length} external authority signals`,
      description: `Multiple credibility signals found: ${foundAuthority.join(', ')}. These help AI engines assess your brand's off-site reputation.`,
      severity: 'pass',
      category: 'off-site',
      details: { signals: foundAuthority },
    });
  } else if (foundAuthority.length >= 1) {
    findings.push({
      id: 'offsite-authority-some',
      title: `${foundAuthority.length} authority signal(s): ${foundAuthority.join(', ')}`,
      description: 'Some credibility signals found. More social proof strengthens AI engine trust.',
      severity: 'info',
      category: 'off-site',
    });
  } else {
    findings.push({
      id: 'offsite-no-authority',
      title: 'No external authority signals',
      description: 'No "Featured in", "Trusted by", or social proof signals found on page.',
      severity: 'info',
      category: 'off-site',
      recommendation: 'Add press mentions, customer counts, partner logos, or "As seen in" sections to strengthen off-site credibility.',
    });
  }

  // ===== 5. Outbound links to authoritative sources =====
  let authoritativeOutlinks = 0;
  const authorityDomains = [
    /\.gov$/i, /\.edu$/i, /\.org$/i,
    /wikipedia\.org/i, /who\.int/i, /nih\.gov/i,
    /reuters\.com/i, /bbc\.com/i, /nytimes\.com/i,
    /nature\.com/i, /sciencedirect\.com/i, /pubmed/i,
  ];

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    try {
      const baseUrl = url.startsWith('http') ? url : 'https://example.com';
      const linkDomain = new URL(href, baseUrl).hostname;
      if (linkDomain !== domain && authorityDomains.some(p => p.test(linkDomain))) {
        authoritativeOutlinks++;
      }
    } catch { /* invalid URL */ }
  });

  if (authoritativeOutlinks >= 3) {
    findings.push({
      id: 'offsite-authoritative-outlinks',
      title: `${authoritativeOutlinks} links to authoritative sources`,
      description: 'Multiple outbound links to .gov, .edu, .org, or recognized authority sites. Citing authoritative sources signals credibility to AI engines.',
      severity: 'pass',
      category: 'off-site',
    });
  } else if (authoritativeOutlinks >= 1) {
    findings.push({
      id: 'offsite-some-outlinks',
      title: `${authoritativeOutlinks} authoritative outbound link(s)`,
      description: 'Some links to authority sources found. More citations to credible sources strengthen trustworthiness.',
      severity: 'info',
      category: 'off-site',
    });
  } else {
    findings.push({
      id: 'offsite-no-authority-links',
      title: 'No links to authoritative external sources',
      description: 'No outbound links to .gov, .edu, research, or recognized authority sites. Citing credible sources signals trustworthiness to AI engines.',
      severity: 'warning',
      category: 'off-site',
      recommendation: 'Add citations and links to authoritative sources (.gov, .edu, research publications, industry standards).',
    });
  }

  // ===== Overall platform coverage =====
  const totalPlatforms = foundPlatforms.length;
  if (totalPlatforms >= 5) {
    findings.push({
      id: 'offsite-platform-coverage',
      title: `Strong cross-platform presence (${totalPlatforms} platforms)`,
      description: `Your brand links to ${totalPlatforms} external platforms. Broad cross-platform presence strengthens your entity in AI knowledge graphs.`,
      severity: 'pass',
      category: 'off-site',
      details: { total: totalPlatforms, platforms: foundPlatforms.map(p => p.name) },
    });
  } else if (totalPlatforms <= 1) {
    findings.push({
      id: 'offsite-platform-weak',
      title: 'Minimal cross-platform presence',
      description: 'Very few external platform links found. AI engines cross-reference your brand across the web — a stronger presence increases trust.',
      severity: 'warning',
      category: 'off-site',
      recommendation: 'Establish and link to profiles on LinkedIn, Twitter/X, Google Business, and relevant industry platforms.',
    });
  }

  return findings;
}
