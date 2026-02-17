import { Router, type Response } from 'express';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import { fetchPage } from '../services/fetcher.js';
import { analyzeResources } from '../analyzers/resource-audit.js';
import { optionalAuth, type AuthRequest } from '../auth.js';

export const resourceAuditRouter = Router();

const urlValidator = z
  .string()
  .url('Please enter a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  );

// Mode 1: Fetch URL and analyze
// Mode 2: Accept raw HTML code + optional base URL for resolving relative paths
const ResourceAuditSchema = z.union([
  z.object({
    mode: z.literal('url'),
    url: urlValidator,
  }),
  z.object({
    mode: z.literal('html'),
    html: z.string().min(10, 'HTML code is too short'),
    baseUrl: z.string().optional(),
  }),
]);

/**
 * Try to auto-detect the page URL from the HTML itself.
 * Checks: <base href>, <link rel="canonical">, <meta property="og:url">, then
 * falls back to the first absolute http(s) URL found in script src or link href.
 */
function detectBaseUrlFromHtml(html: string): string | null {
  const $ = cheerio.load(html);

  // 1. <base href="...">
  const baseHref = $('base[href]').attr('href');
  if (baseHref && /^https?:\/\//i.test(baseHref)) {
    return baseHref.replace(/\/+$/, '');
  }

  // 2. <link rel="canonical" href="...">
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical && /^https?:\/\//i.test(canonical)) {
    try {
      const u = new URL(canonical);
      return `${u.protocol}//${u.hostname}`;
    } catch { /* skip */ }
  }

  // 3. <meta property="og:url" content="...">
  const ogUrl = $('meta[property="og:url"]').attr('content');
  if (ogUrl && /^https?:\/\//i.test(ogUrl)) {
    try {
      const u = new URL(ogUrl);
      return `${u.protocol}//${u.hostname}`;
    } catch { /* skip */ }
  }

  // 4. First absolute URL from script[src] or link[href]
  let firstAbsolute: string | null = null;
  $('script[src], link[href]').each((_, el) => {
    if (firstAbsolute) return;
    const src = $(el).attr('src') || $(el).attr('href') || '';
    if (/^https?:\/\//i.test(src)) {
      try {
        const u = new URL(src);
        // Skip known CDN/3rd-party domains — we want the site's own domain
        const host = u.hostname.toLowerCase();
        const cdnDomains = [
          'cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'unpkg.com',
          'ajax.googleapis.com', 'fonts.googleapis.com', 'fonts.gstatic.com',
          'code.jquery.com', 'stackpath.bootstrapcdn.com', 'maxcdn.bootstrapcdn.com',
          'googletagmanager.com', 'google-analytics.com', 'www.googletagmanager.com',
          'www.google-analytics.com', 'connect.facebook.net', 'platform.twitter.com',
        ];
        if (!cdnDomains.some((cdn) => host === cdn || host.endsWith(`.${cdn}`))) {
          firstAbsolute = `${u.protocol}//${u.hostname}`;
        }
      } catch { /* skip */ }
    }
  });

  return firstAbsolute;
}

resourceAuditRouter.post('/resource-audit', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = ResourceAuditSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid input',
        details: parsed.error.errors[0]?.message,
      });
      return;
    }

    let html: string;
    let pageUrl: string;
    let inputMode: 'url' | 'html';
    let baseUrlSource: 'provided' | 'auto-detected' | 'fallback' | undefined;

    if (parsed.data.mode === 'url') {
      inputMode = 'url';
      const pageResult = await fetchPage(parsed.data.url);
      html = pageResult.html;
      pageUrl = pageResult.finalUrl || parsed.data.url;
    } else {
      inputMode = 'html';
      html = parsed.data.html;

      if (parsed.data.baseUrl) {
        pageUrl = parsed.data.baseUrl;
        baseUrlSource = 'provided';
      } else {
        const detected = detectBaseUrlFromHtml(html);
        if (detected) {
          pageUrl = detected;
          baseUrlSource = 'auto-detected';
        } else {
          pageUrl = 'https://example.com';
          baseUrlSource = 'fallback';
        }
      }
    }

    const result = analyzeResources(html, pageUrl);
    res.json({ ...result, inputMode, baseUrlSource });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Resource audit failed';
    console.error('Resource audit error:', message);
    res.status(500).json({
      error: 'Resource audit failed',
      details: message,
    });
  }
});
