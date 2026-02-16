import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { queries } from '../db.js';
import type { DashboardStats, ApiResponse, ContentType, ScanResult } from '../../shared/types.js';

export const dashboardRouter = Router();

// ─── GET /api/dashboard — Get dashboard statistics ───────────────────────────

dashboardRouter.get('/', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const userId = user.id;

    // Total scans
    const totalRow = queries.getTotalScans.get(userId) as any;
    const totalScans = totalRow?.count || 0;

    // Status counts
    const statusRows = queries.getStatusCounts.all(userId) as any[];
    let compliantCount = 0;
    let nonCompliantCount = 0;
    let needsReviewCount = 0;
    for (const row of statusRows) {
      if (row.compliance_status === 'compliant') compliantCount = row.count;
      else if (row.compliance_status === 'non_compliant') nonCompliantCount = row.count;
      else if (row.compliance_status === 'needs_review') needsReviewCount = row.count;
    }

    const complianceRate = totalScans > 0 ? Math.round((compliantCount / totalScans) * 100) : 0;

    // Content type breakdown
    const typeRows = queries.getContentTypeCounts.all(userId) as any[];
    const scansByContentType: Record<ContentType, number> = { image: 0, video: 0, audio: 0, text: 0 };
    for (const row of typeRows) {
      scansByContentType[row.content_type as ContentType] = row.count;
    }

    // Scans by day (last 30 days)
    const dayRows = queries.getScansByDay.all(userId) as any[];
    const scansByDay = dayRows.map((r: any) => ({ date: r.date, count: r.count }));

    // Recent scans
    const recentRows = queries.getRecentScans.all(userId) as any[];
    const recentScans: ScanResult[] = recentRows.map((row: any) => ({
      id: row.id,
      scanRequest: {
        contentType: row.content_type,
        fileName: row.file_name,
        sourceUrl: row.source_url,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        labels: JSON.parse(row.labels || '[]'),
        publisherName: row.publisher_name,
        platformName: row.platform_name,
      },
      detection: JSON.parse(row.detection_json),
      compliance: JSON.parse(row.compliance_json),
      createdAt: row.created_at,
      processingTimeMs: row.processing_time_ms,
    }));

    // Top violations
    const violationRows = queries.getTopViolations.all(userId) as any[];
    const violationCounts: Record<string, { ruleName: string; count: number }> = {};
    for (const row of violationRows) {
      const compliance = JSON.parse(row.compliance_json);
      for (const check of compliance.ruleChecks || []) {
        if (check.status === 'non_compliant') {
          if (!violationCounts[check.ruleId]) {
            violationCounts[check.ruleId] = { ruleName: check.ruleName, count: 0 };
          }
          violationCounts[check.ruleId].count++;
        }
      }
    }
    const topViolations = Object.entries(violationCounts)
      .map(([ruleId, v]) => ({ ruleId, ruleName: v.ruleName, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats: DashboardStats = {
      totalScans,
      compliantCount,
      nonCompliantCount,
      needsReviewCount,
      complianceRate,
      scansByContentType,
      scansByDay,
      topViolations,
      recentScans,
    };

    res.json({ success: true, data: stats } satisfies ApiResponse<DashboardStats>);
  } catch (err: any) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Server error' } satisfies ApiResponse);
  }
});
