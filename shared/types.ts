// ===== Core AEO Audit Report Types =====

export type Severity = 'pass' | 'warning' | 'fail' | 'info';

export type CategoryId =
  | 'bot-access'
  | 'content'
  | 'schema'
  | 'technical'
  | 'meta-tags'
  | 'branding'
  | 'headings'
  | 'links'
  | 'crawlability'
  | 'ecommerce'
  | 'publisher';

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: CategoryId;
  details?: Record<string, unknown>;
  recommendation?: string;
}

export interface CategoryResult {
  id: CategoryId;
  name: string;
  score: number;
  weight: number;
  icon: string;
  findings: Finding[];
}

export interface PageMetadata {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogTags: Record<string, string>;
  responseTime: number;
  contentLength: number;
  statusCode: number;
  finalUrl: string;
}

export interface AuditReport {
  url: string;
  fetchedAt: string;
  overallScore: number;
  grade: string;
  categories: CategoryResult[];
  metadata: PageMetadata;
  summary: {
    totalFindings: number;
    passes: number;
    warnings: number;
    failures: number;
    infos: number;
  };
}

export interface BotInfo {
  name: string;
  userAgent: string;
  company: string;
  purpose: string;
}

export interface AuditRequest {
  url: string;
}

export interface AuditError {
  error: string;
  details?: string;
}
