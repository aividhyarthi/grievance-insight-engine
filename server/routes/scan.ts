import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { queries } from '../db.js';
import { runScan } from '../services/scan-orchestrator.js';
import { providerRegistry } from '../providers/provider-registry.js';
import { SUPPORTED_MIME_TYPES, MAX_FILE_SIZE_MB, MAX_TEXT_LENGTH } from '../../shared/constants.js';
import type { ScanRequest, ScanResult, ApiResponse, ContentType } from '../../shared/types.js';

export const scanRouter = Router();

// ─── File Upload Config ──────────────────────────────────────────────────────

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (SUPPORTED_MIME_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ─── Text Scan Schema ────────────────────────────────────────────────────────

const textScanSchema = z.object({
  textContent: z.string().min(10).max(MAX_TEXT_LENGTH),
  labels: z.array(z.string()).optional(),
  publisherName: z.string().optional(),
  platformName: z.string().optional(),
});

// ─── POST /api/scan/file — Upload & scan a file ─────────────────────────────

scanRouter.post('/file', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const user = (req as any).user;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, error: 'No file uploaded' } satisfies ApiResponse);
      return;
    }

    // Check daily usage limits
    const usageRow = queries.getUsageToday.get(user.id) as any;
    const todayCount = usageRow?.count || 0;
    const limit = user.plan === 'free' ? 10 : user.plan === 'pro' ? 100 : 10000;
    if (todayCount >= limit) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      res.status(429).json({
        success: false,
        error: `Daily scan limit reached (${limit} scans/day on ${user.plan} plan)`,
      } satisfies ApiResponse);
      return;
    }

    const contentType = SUPPORTED_MIME_TYPES[file.mimetype] as ContentType;
    const labels = req.body.labels ? JSON.parse(req.body.labels) : [];

    const scanRequest: ScanRequest = {
      contentType,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      labels,
      publisherName: req.body.publisherName,
      platformName: req.body.platformName,
    };

    // If it's a text file, read its content
    if (contentType === 'text') {
      scanRequest.textContent = fs.readFileSync(file.path, 'utf-8');
    }

    const result = await runScan(scanRequest, file.path);

    // Save to database
    queries.createScan.run(
      result.id, user.id, contentType, file.originalname, file.path, null,
      file.mimetype, file.size, scanRequest.textContent || null,
      scanRequest.publisherName || null, scanRequest.platformName || null,
      JSON.stringify(labels),
      JSON.stringify(result.detection), JSON.stringify(result.compliance),
      result.detection.overallVerdict, result.detection.overallConfidence,
      result.compliance.overallStatus, result.compliance.score,
      result.processingTimeMs,
    );

    queries.incrementUsage.run(user.id);

    res.json({ success: true, data: result } satisfies ApiResponse<ScanResult>);
  } catch (err: any) {
    console.error('Scan error:', err);
    res.status(500).json({ success: false, error: err.message } satisfies ApiResponse);
  }
});

// ─── POST /api/scan/text — Scan text content directly ───────────────────────

scanRouter.post('/text', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const data = textScanSchema.parse(req.body);

    // Check daily usage limits
    const usageRow = queries.getUsageToday.get(user.id) as any;
    const todayCount = usageRow?.count || 0;
    const limit = user.plan === 'free' ? 10 : user.plan === 'pro' ? 100 : 10000;
    if (todayCount >= limit) {
      res.status(429).json({
        success: false,
        error: `Daily scan limit reached (${limit} scans/day on ${user.plan} plan)`,
      } satisfies ApiResponse);
      return;
    }

    const scanRequest: ScanRequest = {
      contentType: 'text',
      textContent: data.textContent,
      labels: data.labels,
      publisherName: data.publisherName,
      platformName: data.platformName,
    };

    const result = await runScan(scanRequest);

    // Save to database
    queries.createScan.run(
      result.id, user.id, 'text', null, null, null,
      'text/plain', data.textContent.length, data.textContent,
      data.publisherName || null, data.platformName || null,
      JSON.stringify(data.labels || []),
      JSON.stringify(result.detection), JSON.stringify(result.compliance),
      result.detection.overallVerdict, result.detection.overallConfidence,
      result.compliance.overallStatus, result.compliance.score,
      result.processingTimeMs,
    );

    queries.incrementUsage.run(user.id);

    res.json({ success: true, data: result } satisfies ApiResponse<ScanResult>);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0].message } satisfies ApiResponse);
      return;
    }
    console.error('Text scan error:', err);
    res.status(500).json({ success: false, error: err.message } satisfies ApiResponse);
  }
});

// ─── GET /api/scan/providers — List detection providers and their status ─────

scanRouter.get('/providers', requireAuth, (_req, res) => {
  res.json({ success: true, data: providerRegistry.getStatus() } satisfies ApiResponse);
});
