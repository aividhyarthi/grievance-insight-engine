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
  'bot-access': 0.13,
  'content': 0.12,
  'schema': 0.10,
  'technical': 0.08,
  'meta-tags': 0.07,
  'branding': 0.07,
  'headings': 0.04,
  'links': 0.04,
  'crawlability': 0.13,
  'ecommerce': 0.07,
  'publisher': 0.08,
  'industry': 0.07,
};

// Weights when site is NOT e-commerce and NOT publisher (base weights)
export const NON_ECOMMERCE_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.16,
  'content': 0.16,
  'schema': 0.12,
  'technical': 0.10,
  'meta-tags': 0.08,
  'branding': 0.08,
  'headings': 0.05,
  'links': 0.05,
  'crawlability': 0.15,
  'ecommerce': 0,
  'publisher': 0,
  'industry': 0,
};

// Weights when site is publisher (no ecommerce)
export const PUBLISHER_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.12,
  'content': 0.12,
  'schema': 0.10,
  'technical': 0.08,
  'meta-tags': 0.07,
  'branding': 0.08,
  'headings': 0.05,
  'links': 0.05,
  'crawlability': 0.13,
  'ecommerce': 0,
  'publisher': 0.13,
  'industry': 0,
};

// Weights when industry vertical is detected
export const INDUSTRY_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.12,
  'content': 0.11,
  'schema': 0.10,
  'technical': 0.08,
  'meta-tags': 0.07,
  'branding': 0.07,
  'headings': 0.04,
  'links': 0.04,
  'crawlability': 0.12,
  'ecommerce': 0,
  'publisher': 0,
  'industry': 0.13,
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
