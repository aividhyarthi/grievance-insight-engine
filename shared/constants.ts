import type { BotInfo, CategoryId } from './types';

// ===== AI Bot Registry =====
export const AI_BOTS: BotInfo[] = [
  {
    name: 'GPTBot',
    userAgent: 'GPTBot',
    company: 'OpenAI',
    purpose: 'Training data for GPT models',
  },
  {
    name: 'OAI-SearchBot',
    userAgent: 'OAI-SearchBot',
    company: 'OpenAI',
    purpose: 'ChatGPT Search indexing',
  },
  {
    name: 'ChatGPT-User',
    userAgent: 'ChatGPT-User',
    company: 'OpenAI',
    purpose: 'Live browsing in ChatGPT',
  },
  {
    name: 'Google-Extended',
    userAgent: 'Google-Extended',
    company: 'Google',
    purpose: 'Gemini AI training & AI Overviews',
  },
  {
    name: 'Googlebot',
    userAgent: 'Googlebot',
    company: 'Google',
    purpose: 'Google Search indexing (including AI Overviews)',
  },
  {
    name: 'ClaudeBot',
    userAgent: 'ClaudeBot',
    company: 'Anthropic',
    purpose: 'Claude AI training data',
  },
  {
    name: 'PerplexityBot',
    userAgent: 'PerplexityBot',
    company: 'Perplexity',
    purpose: 'Perplexity search & answer engine',
  },
  {
    name: 'CCBot',
    userAgent: 'CCBot',
    company: 'Common Crawl',
    purpose: 'Open dataset used by many LLMs',
  },
  {
    name: 'Bytespider',
    userAgent: 'Bytespider',
    company: 'ByteDance',
    purpose: 'TikTok & AI training',
  },
  {
    name: 'Amazonbot',
    userAgent: 'Amazonbot',
    company: 'Amazon',
    purpose: 'Alexa AI answers',
  },
  {
    name: 'DuckAssistBot',
    userAgent: 'DuckAssistBot',
    company: 'DuckDuckGo',
    purpose: 'DuckAssist AI answers',
  },
  {
    name: 'AppleBot-Extended',
    userAgent: 'Applebot-Extended',
    company: 'Apple',
    purpose: 'Apple Intelligence & Siri',
  },
];

// ===== Scoring Weights =====
// AEO-first weighting: citability, freshness, intent, off-site, ai-overview, voice-search
// collectively carry ~50% because these are what define AEO readiness in 2026.
// Traditional SEO/technical categories support but don't dominate the score.

// E-commerce + publisher + industry all active
export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.06,
  'content': 0.05,
  'schema': 0.05,
  'technical': 0.03,
  'meta-tags': 0.03,
  'branding': 0.03,
  'headings': 0.02,
  'links': 0.02,
  'crawlability': 0.05,
  'boilerplate': 0.02,
  'ai-content': 0.02,
  'citability': 0.08,
  'voice-search': 0.04,
  'freshness': 0.07,
  'intent': 0.06,
  'off-site': 0.05,
  'ai-overview': 0.10,
  'ecommerce': 0.06,
  'publisher': 0.08,
  'industry': 0.06,
};

// Default weights — no e-commerce, no publisher, no industry
export const NON_ECOMMERCE_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.07,
  'content': 0.06,
  'schema': 0.06,
  'technical': 0.04,
  'meta-tags': 0.04,
  'branding': 0.04,
  'headings': 0.02,
  'links': 0.02,
  'crawlability': 0.06,
  'boilerplate': 0.03,
  'ai-content': 0.03,
  'citability': 0.10,
  'voice-search': 0.04,
  'freshness': 0.09,
  'intent': 0.08,
  'off-site': 0.05,
  'ai-overview': 0.12,
  'ecommerce': 0,
  'publisher': 0,
  'industry': 0,
};

// Publisher weights — freshness, ai-overview, citability are critical for content sites
export const PUBLISHER_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.06,
  'content': 0.06,
  'schema': 0.04,
  'technical': 0.03,
  'meta-tags': 0.03,
  'branding': 0.03,
  'headings': 0.02,
  'links': 0.02,
  'crawlability': 0.05,
  'boilerplate': 0.02,
  'ai-content': 0.03,
  'citability': 0.10,
  'voice-search': 0.04,
  'freshness': 0.10,
  'intent': 0.07,
  'off-site': 0.06,
  'ai-overview': 0.12,
  'ecommerce': 0,
  'publisher': 0.10,
  'industry': 0,
};

// Industry vertical weights
export const INDUSTRY_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.06,
  'content': 0.06,
  'schema': 0.05,
  'technical': 0.03,
  'meta-tags': 0.03,
  'branding': 0.03,
  'headings': 0.02,
  'links': 0.02,
  'crawlability': 0.05,
  'boilerplate': 0.02,
  'ai-content': 0.03,
  'citability': 0.09,
  'voice-search': 0.04,
  'freshness': 0.08,
  'intent': 0.07,
  'off-site': 0.05,
  'ai-overview': 0.11,
  'ecommerce': 0,
  'publisher': 0,
  'industry': 0.10,
};

// ===== Category Display Info =====
export const CATEGORY_INFO: Record<CategoryId, { name: string; icon: string; description: string }> = {
  'bot-access': {
    name: 'AI Bot Access',
    icon: '🤖',
    description: 'Whether AI bots can crawl and index your content',
  },
  'content': {
    name: 'Content Quality',
    icon: '📝',
    description: 'How well your content is structured for AI consumption',
  },
  'schema': {
    name: 'Structured Data',
    icon: '🏗️',
    description: 'Schema.org markup for machine-readable content',
  },
  'technical': {
    name: 'Technical SEO',
    icon: '⚙️',
    description: 'Technical HTML/JS factors affecting AI bot access',
  },
  'meta-tags': {
    name: 'Meta Tags & OG',
    icon: '🏷️',
    description: 'Title, description, OpenGraph, and social meta tags',
  },
  'branding': {
    name: 'Branding & E-E-A-T',
    icon: '🏆',
    description: 'Brand authority, trust signals, and expertise indicators',
  },
  'headings': {
    name: 'Heading Structure',
    icon: '📑',
    description: 'Heading hierarchy and content organization',
  },
  'links': {
    name: 'Link Profile',
    icon: '🔗',
    description: 'Internal/external links and navigation structure',
  },
  'crawlability': {
    name: 'Crawlability & Speed',
    icon: '🕷️',
    description: 'Google crawl size limits, AI bot speed, JS rendering, and content-to-code ratio',
  },
  'boilerplate': {
    name: 'Boilerplate Content',
    icon: '🧹',
    description: 'How much of the page is boilerplate (nav, footer, sidebar) vs unique content',
  },
  'ai-content': {
    name: 'AI Content Detection',
    icon: '🔍',
    description: 'Whether the content appears AI-generated or human-written based on heuristic signals',
  },
  'citability': {
    name: 'Independent Citability',
    icon: '💬',
    description: 'Whether content sections are self-contained and independently quotable by AI engines',
  },
  'voice-search': {
    name: 'Voice Search & Speakable',
    icon: '🎙️',
    description: 'Optimization for voice assistants (Alexa, Siri, Google Assistant) and speakable schema',
  },
  'freshness': {
    name: 'Content Freshness',
    icon: '🕐',
    description: 'Publication dates, update signals, and temporal relevance for AI engine trust',
  },
  'intent': {
    name: 'Intent Optimization',
    icon: '🎯',
    description: 'How well content matches natural language queries and user search intent',
  },
  'off-site': {
    name: 'Off-Site Signals',
    icon: '🌐',
    description: 'Brand consistency, business listings, cross-platform presence, and external authority',
  },
  'ai-overview': {
    name: 'AI Overview Readiness',
    icon: '✨',
    description: 'Optimization for Google AI Overviews, featured snippets, and AI answer extraction',
  },
  'ecommerce': {
    name: 'E-Commerce AEO',
    icon: '🛒',
    description: 'Product schema, pricing, reviews, and e-commerce-specific AI optimization',
  },
  'publisher': {
    name: 'Publisher AEO',
    icon: '📰',
    description: 'Content originality, citations, author E-E-A-T, and AI content quality signals',
  },
  'industry': {
    name: 'Industry AEO',
    icon: '🏢',
    description: 'Industry-specific AEO checks for Real Estate, Medical, EdTech, Auto, and Reviews sites',
  },
};

// ===== High-value Schema Types for GEO =====
export const GEO_SCHEMA_TYPES = [
  'FAQPage',
  'HowTo',
  'Article',
  'NewsArticle',
  'BlogPosting',
  'WebPage',
  'Organization',
  'Person',
  'BreadcrumbList',
  'Product',
  'Review',
  'LocalBusiness',
  'Event',
  'Recipe',
  'VideoObject',
  'Course',
  'SoftwareApplication',
  'MedicalCondition',
];
