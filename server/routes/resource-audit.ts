import { Router, type Response } from 'express';
import { z } from 'zod';
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

    if (parsed.data.mode === 'url') {
      const pageResult = await fetchPage(parsed.data.url);
      html = pageResult.html;
      pageUrl = pageResult.finalUrl || parsed.data.url;
    } else {
      html = parsed.data.html;
      pageUrl = parsed.data.baseUrl || 'https://example.com';
    }

    const result = analyzeResources(html, pageUrl);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Resource audit failed';
    console.error('Resource audit error:', message);
    res.status(500).json({
      error: 'Resource audit failed',
      details: message,
    });
  }
});
