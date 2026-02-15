import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import type { AuditReport } from '../../shared/types.js';

export const reportRouter = Router();

const EmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  report: z.object({
    url: z.string(),
    fetchedAt: z.string(),
    overallScore: z.number(),
    grade: z.string(),
    categories: z.array(z.any()),
    metadata: z.any(),
    summary: z.object({
      totalFindings: z.number(),
      passes: z.number(),
      warnings: z.number(),
      failures: z.number(),
      infos: z.number(),
    }),
  }),
});

// Severity styling for HTML email
const severityStyles: Record<string, { bg: string; border: string; color: string; label: string; icon: string }> = {
  pass: { bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', label: 'PASS', icon: '&#10003;' },
  warning: { bg: '#fefce8', border: '#fde68a', color: '#92400e', label: 'WARNING', icon: '&#9888;' },
  fail: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', label: 'FAIL', icon: '&#10007;' },
  info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', label: 'INFO', icon: '&#8505;' },
};

const severityOrder: Record<string, number> = { fail: 0, warning: 1, info: 2, pass: 3 };

// Generate clean HTML email from report data with FULL details
function generateReportHTML(report: AuditReport): string {
  const scoreColor = report.overallScore >= 80 ? '#22c55e' :
    report.overallScore >= 60 ? '#eab308' :
    report.overallScore >= 40 ? '#f97316' : '#ef4444';

  // Category score overview table
  const categoriesHtml = report.categories.map((cat) => {
    const catColor = cat.score >= 80 ? '#22c55e' : cat.score >= 60 ? '#eab308' : cat.score >= 40 ? '#f97316' : '#ef4444';
    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
          <span style="font-size: 18px;">${cat.icon}</span>
          <strong style="margin-left: 8px;">${cat.name}</strong>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 700; color: white; background: ${catColor}; font-size: 14px;">
            ${cat.score}/100
          </span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; color: #6b7280; font-size: 13px;">
          ${cat.findings.length} checks
        </td>
      </tr>
    `;
  }).join('');

  // Full detailed findings for EACH category
  const categoryDetailsHtml = report.categories.map((cat) => {
    const catColor = cat.score >= 80 ? '#22c55e' : cat.score >= 60 ? '#eab308' : cat.score >= 40 ? '#f97316' : '#ef4444';
    const sortedFindings = [...cat.findings].sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

    const findingsHtml = sortedFindings.map((f) => {
      const style = severityStyles[f.severity] || severityStyles.info;
      return `
        <div style="background: ${style.bg}; border: 1px solid ${style.border}; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="color: ${style.color}; font-size: 14px;">${style.icon}</span>
            <strong style="color: #111827; font-size: 14px;">${f.title}</strong>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: ${style.color}; background: ${style.border};">
              ${style.label}
            </span>
          </div>
          <p style="color: #4b5563; font-size: 13px; margin: 4px 0 0; padding-left: 22px;">${f.description}</p>
          ${f.recommendation ? `<p style="color: ${style.color}; font-size: 13px; margin: 6px 0 0; padding-left: 22px;"><strong>&#8594;</strong> ${f.recommendation}</p>` : ''}
        </div>
      `;
    }).join('');

    return `
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 20px; overflow: hidden;">
      <div style="padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="font-size: 22px; vertical-align: middle;">${cat.icon}</span>
          <strong style="font-size: 16px; color: #111827; margin-left: 8px; vertical-align: middle;">${cat.name}</strong>
          <span style="font-size: 13px; color: #6b7280; margin-left: 8px;">${cat.findings.length} checks</span>
        </div>
        <span style="display: inline-block; padding: 4px 14px; border-radius: 20px; font-weight: 700; color: white; background: ${catColor}; font-size: 15px;">
          ${cat.score}/100
        </span>
      </div>
      <div style="padding: 16px 20px;">
        ${findingsHtml}
      </div>
    </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 720px; margin: 0 auto; padding: 24px;">

    <!-- Header -->
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; text-align: center; margin-bottom: 20px;">
      <h1 style="margin: 0 0 8px; font-size: 24px; color: #111827;">AEO Audit Report</h1>
      <p style="margin: 0 0 4px; color: #6b7280; font-size: 14px;">
        ${report.metadata.finalUrl || report.url}
      </p>
      <p style="margin: 0 0 20px; color: #9ca3af; font-size: 12px;">
        ${new Date(report.fetchedAt).toLocaleString()} | HTTP ${report.metadata.statusCode} | ${report.metadata.responseTime}ms
      </p>

      <!-- Score Circle -->
      <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 8px solid ${scoreColor}; line-height: 104px; text-align: center; margin-bottom: 8px;">
        <span style="font-size: 36px; font-weight: 800; color: ${scoreColor};">${report.overallScore}</span>
      </div>
      <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${scoreColor};">${report.grade}</p>
    </div>

    <!-- Summary -->
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-around; text-align: center;">
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #22c55e;">${report.summary.passes}</div>
          <div style="font-size: 12px; color: #6b7280;">Passed</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #eab308;">${report.summary.warnings}</div>
          <div style="font-size: 12px; color: #6b7280;">Warnings</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${report.summary.failures}</div>
          <div style="font-size: 12px; color: #6b7280;">Failed</div>
        </div>
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${report.summary.infos}</div>
          <div style="font-size: 12px; color: #6b7280;">Info</div>
        </div>
      </div>
    </div>

    <!-- Category Scores Overview -->
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 16px; font-size: 16px; color: #111827;">Category Scores Overview</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${categoriesHtml}
      </table>
    </div>

    <!-- Detailed Findings Per Category -->
    <h2 style="font-size: 18px; color: #111827; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">
      Detailed Findings
    </h2>
    ${categoryDetailsHtml}

    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p>Generated by AEO Audit Tool</p>
    </div>
  </div>
</body>
</html>`;
}

reportRouter.post('/report/email', async (req: Request, res: Response) => {
  try {
    const parsed = EmailSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: parsed.error.errors[0]?.message,
      });
      return;
    }

    const { email, report } = parsed.data;
    const html = generateReportHTML(report as AuditReport);

    // Check for SMTP config in env
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser) {
      // No SMTP config - return HTML for client to use with mailto
      res.status(200).json({
        sent: false,
        html,
        message: 'No SMTP configured. Use the "Open in Mail" option or set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.',
      });
      return;
    }

    // Send via nodemailer with SMTP
    try {
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const fromEmail = process.env.SMTP_FROM || smtpUser;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: `AEO Audit Report - ${report.url} (Score: ${report.overallScore}/100, Grade: ${report.grade})`,
        html,
      });

      res.json({ sent: true, message: 'Report sent successfully' });
    } catch (smtpErr) {
      console.error('SMTP send error:', smtpErr);
      res.status(200).json({
        sent: false,
        html,
        message: 'Email sending failed. Check SMTP credentials. Use the "Open in Mail" option instead.',
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    res.status(500).json({ error: message });
  }
});
