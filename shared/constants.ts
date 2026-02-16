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
// 4 core buckets: Content, HTML, JS, Speed + conditional: ecommerce, publisher, industry
// E-commerce weight is dynamically applied only when site is detected as e-commerce
export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  'content': 0.20,
  'html': 0.25,
  'js': 0.15,
  'speed': 0.15,
  'ecommerce': 0.10,
  'publisher': 0.08,
  'industry': 0.07,
};

// Weights when site is NOT e-commerce and NOT publisher (base weights)
export const NON_ECOMMERCE_WEIGHTS: Record<CategoryId, number> = {
  'content': 0.25,
  'html': 0.30,
  'js': 0.20,
  'speed': 0.25,
  'ecommerce': 0,
  'publisher': 0,
  'industry': 0,
};

// Weights when site is publisher (no ecommerce)
export const PUBLISHER_WEIGHTS: Record<CategoryId, number> = {
  'content': 0.22,
  'html': 0.25,
  'js': 0.15,
  'speed': 0.18,
  'ecommerce': 0,
  'publisher': 0.15,
  'industry': 0,
};

// Weights when industry vertical is detected
export const INDUSTRY_WEIGHTS: Record<CategoryId, number> = {
  'content': 0.22,
  'html': 0.25,
  'js': 0.15,
  'speed': 0.18,
  'ecommerce': 0,
  'publisher': 0,
  'industry': 0.15,
};

// ===== Category Display Info =====
export const CATEGORY_INFO: Record<CategoryId, { name: string; icon: string; description: string }> = {
  'content': {
    name: 'Content',
    icon: '📝',
    description: 'Content quality, readability, boilerplate ratio, freshness, and AI content detection',
  },
  'html': {
    name: 'HTML',
    icon: '🏗️',
    description: 'Bot access, structured data, meta tags, headings, links, and markup visible to all crawlers',
  },
  'js': {
    name: 'JavaScript',
    icon: '⚡',
    description: 'Client-side rendering, framework detection, script analysis, and what AI bots miss without JS',
  },
  'speed': {
    name: 'Speed',
    icon: '🚀',
    description: 'Response time, page size, crawl limits, compression, caching, and delivery performance',
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
