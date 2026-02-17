import { Router, type Response } from 'express';
import { z } from 'zod';
import { fetchPage } from '../services/fetcher.js';
import { analyzeResources } from '../analyzers/resource-audit.js';
import { optionalAuth, type AuthRequest } from '../auth.js';

export const resourceAuditRouter = Router();

const ResourceAuditSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
});

resourceAuditRouter.post('/resource-audit', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = ResourceAuditSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid URL',
        details: parsed.error.errors[0]?.message,
      });
      return;
    }

    const pageResult = await fetchPage(parsed.data.url);
    const result = analyzeResources(pageResult.html, pageResult.finalUrl || parsed.data.url);

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
