import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { runAudit } from '../services/orchestrator.js';

export const auditRouter = Router();

const AuditSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
});

auditRouter.post('/audit', async (req: Request, res: Response) => {
  try {
    const parsed = AuditSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid URL',
        details: parsed.error.errors[0]?.message,
      });
      return;
    }

    const report = await runAudit(parsed.data.url);
    res.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit failed';
    console.error('Audit error:', message);
    res.status(500).json({
      error: 'Audit failed',
      details: message,
    });
  }
});
