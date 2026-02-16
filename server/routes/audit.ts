import { Router, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { runAudit } from '../services/orchestrator.js';
import { optionalAuth, type AuthRequest } from '../auth.js';
import { queries } from '../db.js';

export const auditRouter = Router();

const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  );

const AuditSchema = z.object({
  url: urlSchema,
  competitors: z.array(urlSchema).max(2).optional(),
});

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

auditRouter.post('/audit', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = AuditSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid URL',
        details: parsed.error.errors[0]?.message,
      });
      return;
    }

    const userId = req.user?.userId;
    const today = getTodayDate();

    // Run audits: main site + competitors (in parallel)
    const competitorUrls = (parsed.data.competitors || []).filter(Boolean);
    const allUrls = [parsed.data.url, ...competitorUrls];

    const reports = await Promise.all(allUrls.map((u) => runAudit(u)));
    const mainReport = reports[0];
    const competitorReports = reports.slice(1);

    // Track usage and save audit for logged-in users
    if (userId) {
      queries.incrementUsage.run(userId, today);

      const auditId = uuid();
      queries.saveAudit.run(
        auditId,
        userId,
        parsed.data.url,
        mainReport.overallScore,
        mainReport.grade,
        JSON.stringify({ ...mainReport, competitors: competitorReports })
      );

      res.json({
        ...mainReport,
        competitors: competitorReports,
        _auditId: auditId,
      });
      return;
    }

    // Anonymous user - just return the reports
    res.json({
      ...mainReport,
      competitors: competitorReports,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit failed';
    console.error('Audit error:', message);
    res.status(500).json({
      error: 'Audit failed',
      details: message,
    });
  }
});

// GET /api/audits - list user's past audits
auditRouter.get('/audits', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const audits = queries.getAuditsByUser.all(req.user.userId, limit, offset);
    const total = (queries.countAuditsByUser.get(req.user.userId) as { total: number })?.total || 0;

    res.json({
      audits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('List audits error:', err);
    res.status(500).json({ error: 'Failed to list audits' });
  }
});

// GET /api/audits/:id - get specific audit report
auditRouter.get('/audits/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const audit = queries.getAuditById.get(req.params.id, req.user.userId) as Record<string, unknown> | undefined;
    if (!audit) {
      res.status(404).json({ error: 'Audit not found' });
      return;
    }

    const report = JSON.parse(audit.report_json as string);
    res.json(report);
  } catch (err) {
    console.error('Get audit error:', err);
    res.status(500).json({ error: 'Failed to get audit' });
  }
});
