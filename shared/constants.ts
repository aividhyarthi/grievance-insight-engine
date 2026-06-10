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
// E-commerce weight is dynamically applied only when site is detected as e-commerce
export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.10,
  'content': 0.08,
  'schema': 0.07,
  'technical': 0.05,
  'meta-tags': 0.05,
  'branding': 0.05,
  'headings': 0.02,
  'links': 0.02,
  'crawlability': 0.08,
  'boilerplate': 0.04,
  'ai-content': 0.04,
  'citability': 0.06,
  'voice-search': 0.03,
  'freshness': 0.05,
  'intent': 0.05,
  'off-site': 0.04,
  'ai-overview': 0.06,
  'ecommerce': 0.05,
  'publisher': 0.06,
  'industry': 0.05,
};

// Weights when site is NOT e-commerce and NOT publisher (base weights)
export const NON_ECOMMERCE_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.11,
  'content': 0.09,
  'schema': 0.08,
  'technical': 0.06,
  'meta-tags': 0.05,
  'branding': 0.05,
  'headings': 0.03,
  'links': 0.03,
  'crawlability': 0.09,
  'boilerplate': 0.05,
  'ai-content': 0.05,
  'citability': 0.07,
  'voice-search': 0.04,
  'freshness': 0.06,
  'intent': 0.06,
  'off-site': 0.04,
  'ai-overview': 0.07,
  'ecommerce': 0,
  'publisher': 0,
  'industry': 0,
};

// Weights when site is publisher (no ecommerce)
export const PUBLISHER_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.09,
  'content': 0.08,
  'schema': 0.06,
  'technical': 0.05,
  'meta-tags': 0.05,
  'branding': 0.05,
  'headings': 0.03,
  'links': 0.03,
  'crawlability': 0.08,
  'boilerplate': 0.04,
  'ai-content': 0.05,
  'citability': 0.06,
  'voice-search': 0.03,
  'freshness': 0.07,
  'intent': 0.05,
  'off-site': 0.04,
  'ai-overview': 0.06,
  'ecommerce': 0,
  'publisher': 0.10,
  'industry': 0,
};

// Weights when industry vertical is detected
export const INDUSTRY_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.09,
  'content': 0.08,
  'schema': 0.06,
  'technical': 0.05,
  'meta-tags': 0.05,
  'branding': 0.05,
  'headings': 0.02,
  'links': 0.02,
  'crawlability': 0.08,
  'boilerplate': 0.04,
  'ai-content': 0.04,
  'citability': 0.06,
  'voice-search': 0.03,
  'freshness': 0.06,
  'intent': 0.05,
  'off-site': 0.04,
  'ai-overview': 0.06,
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
