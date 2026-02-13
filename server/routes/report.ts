import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
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

// Generate clean HTML email from report data
function generateReportHTML(report: AuditReport): string {
  const scoreColor = report.overallScore >= 80 ? '#22c55e' :
    report.overallScore >= 60 ? '#eab308' :
    report.overallScore >= 40 ? '#f97316' : '#ef4444';

  const failures = report.categories.flatMap((c) => c.findings).filter((f) => f.severity === 'fail');
  const warnings = report.categories.flatMap((c) => c.findings).filter((f) => f.severity === 'warning');
  const passes = report.categories.flatMap((c) => c.findings).filter((f) => f.severity === 'pass');

  let categoriesHtml = report.categories.map((cat) => {
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

  let issuesHtml = '';
  if (failures.length > 0) {
    issuesHtml += `
      <h3 style="color: #dc2626; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px;">
        Critical Issues (${failures.length})
      </h3>
    `;
    failures.forEach((f) => {
      issuesHtml += `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
          <strong style="color: #991b1b;">${f.title}</strong>
          ${f.recommendation ? `<p style="color: #b91c1c; font-size: 13px; margin: 6px 0 0;">${f.recommendation}</p>` : ''}
        </div>
      `;
    });
  }

  if (warnings.length > 0) {
    issuesHtml += `
      <h3 style="color: #ca8a04; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px;">
        Warnings (${warnings.length})
      </h3>
    `;
    warnings.slice(0, 10).forEach((f) => {
      issuesHtml += `
        <div style="background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
          <strong style="color: #92400e;">${f.title}</strong>
          ${f.recommendation ? `<p style="color: #a16207; font-size: 13px; margin: 6px 0 0;">${f.recommendation}</p>` : ''}
        </div>
      `;
    });
    if (warnings.length > 10) {
      issuesHtml += `<p style="color: #6b7280; font-size: 13px; font-style: italic;">+${warnings.length - 10} more warnings...</p>`;
    }
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px;">

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

    <!-- Category Scores -->
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 16px; font-size: 16px; color: #111827;">Category Scores</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${categoriesHtml}
      </table>
    </div>

    <!-- Issues & Recommendations -->
    ${issuesHtml ? `
    <div style="background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 8px; font-size: 16px; color: #111827;">Issues & Recommendations</h2>
      ${issuesHtml}
    </div>
    ` : ''}

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

    // Try to send via nodemailer if available and SMTP is configured
    try {
      // Dynamic import to avoid hard dependency (nodemailer is optional)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodemailer: any = await (Function('return import("nodemailer")')());
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const fromEmail = process.env.SMTP_FROM || 'noreply@aeo-audit.com';

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
    } catch {
      // nodemailer not installed or SMTP failed - return HTML for mailto fallback
      res.status(200).json({
        sent: false,
        html,
        message: 'Email sending failed. Use the "Open in Mail" option.',
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    res.status(500).json({ error: message });
  }
});
