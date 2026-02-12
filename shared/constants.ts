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
export const CATEGORY_WEIGHTS: Record<CategoryId, number> = {
  'bot-access': 0.20,
  'content': 0.20,
  'schema': 0.15,
  'technical': 0.15,
  'meta-tags': 0.10,
  'branding': 0.10,
  'headings': 0.05,
  'links': 0.05,
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
