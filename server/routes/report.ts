import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { queries } from '../db.js';
import type { ScanResult, ApiResponse } from '../../shared/types.js';

export const reportRouter = Router();

// ─── GET /api/report/:id — Get a single scan report ─────────────────────────

reportRouter.get('/:id', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const scan = queries.getScanById.get(req.params.id) as any;

    if (!scan) {
      res.status(404).json({ success: false, error: 'Scan not found' } satisfies ApiResponse);
      return;
    }

    // Users can only see their own scans (admins/regulators can see all)
    if (scan.user_id !== user.id && user.role !== 'admin' && user.role !== 'regulator') {
      res.status(403).json({ success: false, error: 'Access denied' } satisfies ApiResponse);
      return;
    }

    const result = formatScanRow(scan);
    res.json({ success: true, data: result } satisfies ApiResponse<ScanResult>);
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Server error' } satisfies ApiResponse);
  }
});

// ─── GET /api/report — List user's scan history ──────────────────────────────

reportRouter.get('/', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const scans = queries.getScansByUser.all(user.id, limit, offset) as any[];
    const countRow = queries.getScanCountByUser.get(user.id) as any;
    const total = countRow?.count || 0;

    const results = scans.map(formatScanRow);

    res.json({
      success: true,
      data: {
        scans: results,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    } satisfies ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Server error' } satisfies ApiResponse);
  }
});

function formatScanRow(row: any): ScanResult {
  return {
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
  };
}
