import type { Finding } from '../../shared/types.js';
import type { AnalysisContext } from '../services/orchestrator.js';

export function analyzeVoiceSearch(ctx: AnalysisContext): Finding[] {
  const findings: Finding[] = [];
  const { $, html } = ctx;

  // ===== 1. Speakable Schema Markup =====
  const hasSpeakableSchema =
    html.includes('"speakable"') ||
    html.includes('"Speakable"') ||
    html.includes('"SpeakableSpecification"');

  if (hasSpeakableSchema) {
    findings.push({
      id: 'voice-speakable-schema',
      title: 'Speakable schema markup found',
      description: 'Speakable schema (SpeakableSpecification) is present, marking sections suitable for voice/audio playback by assistants like Google Assistant and Alexa.',
      severity: 'pass',
      category: 'voice-search',
    });
  } else {
    findings.push({
      id: 'voice-no-speakable',
      title: 'No Speakable schema markup',
      description: 'No SpeakableSpecification schema found. Speakable markup tells voice assistants which sections of your page are suitable for audio readout.',
      severity: 'warning',
      category: 'voice-search',
      recommendation: 'Add Speakable schema (JSON-LD) pointing to your page\'s most important summary paragraphs using CSS selectors or xPath.',
    });
  }

  // ===== 2. Conversational Q&A patterns =====
  const $content = $('body').clone();
  $content.find('script, style, nav, footer, header, noscript').remove();
  const visibleText = $content.text().replace(/\s+/g, ' ').trim();
  const sentences = visibleText.split(/[.!?]+/).filter(s => s.trim().length > 10);

  let conversationalQACount = 0;
  for (let i = 0; i < sentences.length - 1; i++) {
    const current = sentences[i].trim();
    const next = sentences[i + 1].trim();
    if (current.endsWith('?') || /^(what|how|why|when|where|who|which|can|does|is|are)\b/i.test(current)) {
      if (next.length > 20 && !next.endsWith('?')) {
        conversationalQACount++;
      }
    }
  }

  if (conversationalQACount >= 3) {
    findings.push({
      id: 'voice-conversational-qa',
      title: `${conversationalQACount} conversational Q&A patterns`,
      description: 'Multiple question-answer patterns found. This conversational structure maps well to voice search queries.',
      severity: 'pass',
      category: 'voice-search',
      details: { count: conversationalQACount },
    });
  } else if (conversationalQACount >= 1) {
    findings.push({
      id: 'voice-some-qa',
      title: `${conversationalQACount} conversational Q&A pattern(s)`,
      description: 'Some Q&A patterns found but more would improve voice search compatibility.',
      severity: 'info',
      category: 'voice-search',
    });
  } else {
    findings.push({
      id: 'voice-no-qa',
      title: 'No conversational Q&A patterns',
      description: 'No question-answer patterns detected. Voice assistants prefer content that directly answers natural language questions.',
      severity: 'warning',
      category: 'voice-search',
      recommendation: 'Structure some content as explicit Q&A pairs — ask a question then immediately answer it in the next sentence/paragraph.',
    });
  }

  // ===== 3. Voice-friendly snippet length (20-50 words) =====
  let voiceFriendlySnippets = 0;
  $content.find('p').each((_, el) => {
    const text = $(el).text().trim();
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 20 && wordCount <= 50) {
      voiceFriendlySnippets++;
    }
  });

  if (voiceFriendlySnippets >= 3) {
    findings.push({
      id: 'voice-friendly-snippets',
      title: `${voiceFriendlySnippets} voice-friendly paragraphs`,
      description: 'Multiple paragraphs are in the 20-50 word range ideal for voice assistant readouts. Google Assistant and Alexa prefer this concise format.',
      severity: 'pass',
      category: 'voice-search',
      details: { count: voiceFriendlySnippets },
    });
  } else {
    findings.push({
      id: 'voice-no-friendly-snippets',
      title: 'Few voice-friendly paragraphs',
      description: 'Most paragraphs are outside the 20-50 word sweet spot for voice readouts. Voice assistants need concise, standalone answers.',
      severity: 'warning',
      category: 'voice-search',
      recommendation: 'Add concise 20-50 word paragraphs that directly answer common questions — ideal for voice extraction.',
    });
  }

  // ===== 4. Natural language headings =====
  let naturalHeadings = 0;
  let keywordStuffedHeadings = 0;
  $content.find('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length === 0) return;
    const hasStuffingSignals = /[|,]{2,}/.test(text) || (text.split(/\s+/).length > 10 && !text.endsWith('?'));
    if (hasStuffingSignals) {
      keywordStuffedHeadings++;
    } else if (/^(how|what|why|when|where|who|which|can|does|is|are|should|will|do)\b/i.test(text) || text.split(/\s+/).length <= 8) {
      naturalHeadings++;
    }
  });

  if (naturalHeadings >= 3 && keywordStuffedHeadings === 0) {
    findings.push({
      id: 'voice-natural-headings',
      title: 'Headings use natural language',
      description: `${naturalHeadings} headings use natural, conversational phrasing. Voice queries mirror how people speak, and natural headings align better.`,
      severity: 'pass',
      category: 'voice-search',
    });
  } else if (keywordStuffedHeadings >= 2) {
    findings.push({
      id: 'voice-stuffed-headings',
      title: `${keywordStuffedHeadings} keyword-heavy heading(s)`,
      description: 'Some headings appear keyword-stuffed rather than natural language. Voice search queries are conversational — headings should match.',
      severity: 'warning',
      category: 'voice-search',
      recommendation: 'Rephrase headings as natural questions or short phrases that match how people actually speak.',
    });
  }

  // ===== 5. FAQ section + schema combination =====
  const hasFAQSchema = html.includes('"FAQPage"') || html.includes('"faqpage"');
  const hasFAQSection = $content.find('h2, h3').toArray().some(el => {
    const text = $(el).text().toLowerCase();
    return /faq|frequently asked|common questions/.test(text);
  });

  if (hasFAQSchema && hasFAQSection) {
    findings.push({
      id: 'voice-faq-optimized',
      title: 'FAQ section with schema — excellent for voice',
      description: 'FAQ section with FAQPage schema detected. This is the strongest signal for voice assistant answer extraction.',
      severity: 'pass',
      category: 'voice-search',
    });
  } else if (hasFAQSection) {
    findings.push({
      id: 'voice-faq-no-schema',
      title: 'FAQ section found but no FAQPage schema',
      description: 'An FAQ section exists but lacks FAQPage schema markup. Adding schema would significantly boost voice search visibility.',
      severity: 'warning',
      category: 'voice-search',
      recommendation: 'Add FAQPage JSON-LD schema for your FAQ section to maximize voice assistant extraction.',
    });
  }

  // ===== 6. Local intent signals (voice search is 3x more likely to be local) =====
  const hasLocalSignals =
    html.includes('"LocalBusiness"') ||
    /\b(near me|nearby|local|directions|hours|open now|address)\b/i.test(visibleText) ||
    $('address').length > 0;
  const hasLocalSchema =
    html.includes('"LocalBusiness"') ||
    html.includes('"openingHours"') ||
    html.includes('"geo"');

  if (hasLocalSignals && hasLocalSchema) {
    findings.push({
      id: 'voice-local-optimized',
      title: 'Local + voice search optimized',
      description: 'Local business signals with schema markup detected. Voice searches are 3x more likely to be local — this page is well-positioned.',
      severity: 'pass',
      category: 'voice-search',
    });
  } else if (hasLocalSignals && !hasLocalSchema) {
    findings.push({
      id: 'voice-local-no-schema',
      title: 'Local content without LocalBusiness schema',
      description: 'Local signals found but no LocalBusiness schema. Voice searches are heavily local — add schema for better voice visibility.',
      severity: 'warning',
      category: 'voice-search',
      recommendation: 'Add LocalBusiness schema with address, openingHours, and geo coordinates for voice search optimization.',
    });
  }

  return findings;
}
