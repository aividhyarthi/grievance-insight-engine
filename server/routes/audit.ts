import { Router, type Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { runAudit } from '../services/orchestrator.js';
import { optionalAuth, type AuthRequest } from '../auth.js';
import { queries } from '../db.js';

export const auditRouter = Router();

const FREE_DAILY_LIMIT = 3;

const AuditSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
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

    // Check usage limits for logged-in users
    if (userId) {
      const user = queries.getUserById.get(userId) as Record<string, unknown> | undefined;
      const plan = (user?.plan as string) || 'free';

      if (plan === 'free') {
        const usage = queries.getUsageToday.get(userId, today) as { count: number } | undefined;
        const usedToday = usage?.count || 0;

        if (usedToday >= FREE_DAILY_LIMIT) {
          res.status(429).json({
            error: 'Daily limit reached',
            details: `Free plan allows ${FREE_DAILY_LIMIT} audits per day. Upgrade to Pro for unlimited audits.`,
            limitReached: true,
            used: usedToday,
            limit: FREE_DAILY_LIMIT,
          });
          return;
        }
      }
    }

    // Run the audit
    const report = await runAudit(parsed.data.url);

    // Track usage and save audit for logged-in users
    if (userId) {
      queries.incrementUsage.run(userId, today);

      const auditId = uuid();
      queries.saveAudit.run(
        auditId,
        userId,
        parsed.data.url,
        report.overallScore,
        report.grade,
        JSON.stringify(report)
      );

      // Attach audit ID and usage info to response
      const user = queries.getUserById.get(userId) as Record<string, unknown> | undefined;
      const plan = (user?.plan as string) || 'free';
      const usage = queries.getUsageToday.get(userId, today) as { count: number } | undefined;

      res.json({
        ...report,
        _auditId: auditId,
        _usage: plan === 'free' ? {
          used: usage?.count || 0,
          limit: FREE_DAILY_LIMIT,
          plan,
        } : { plan },
      });
      return;
    }

    // Anonymous user - just return the report (no saving)
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
