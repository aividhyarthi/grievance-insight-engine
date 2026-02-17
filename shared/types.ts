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
  | 'boilerplate'
  | 'ai-content'
  | 'ecommerce'
  | 'publisher'
  | 'industry';

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
  competitors?: AuditReport[];
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

// ===== Resource Audit Types =====

export type ResourceType = 'js' | 'css';
export type ResourceParty = '1st-party' | '3rd-party';
export type ResourceVerdict = 'critical' | 'deferrable' | 'removable';
export type ResourceCategory =
  | 'framework'
  | 'analytics'
  | 'ads'
  | 'tracking'
  | 'social'
  | 'chat-support'
  | 'font'
  | 'cdn-library'
  | 'tag-manager'
  | 'video'
  | 'consent'
  | 'performance'
  | 'site-core'
  | 'unknown';

export interface ResourceItem {
  url: string;
  type: ResourceType;
  party: ResourceParty;
  category: ResourceCategory;
  categoryLabel: string;
  verdict: ResourceVerdict;
  verdictReason: string;
  renderBlocking: boolean;
  sizeBytes: number | null;
  location: 'head' | 'body';
  hasAsync: boolean;
  hasDefer: boolean;
  domain: string;
  crawlerAdvice: 'allow' | 'block-safe' | 'block-recommended';
  crawlerAdviceReason: string;
}

export interface ResourceAuditResult {
  url: string;
  fetchedAt: string;
  htmlSizeBytes: number;
  crawlBudgetUsed: number;
  crawlBudgetLimit: number;
  resources: ResourceItem[];
  inlineResources: {
    inlineJsCount: number;
    inlineJsSizeBytes: number;
    inlineCssCount: number;
    inlineCssSizeBytes: number;
  };
  summary: {
    totalResources: number;
    totalJs: number;
    totalCss: number;
    firstParty: number;
    thirdParty: number;
    renderBlocking: number;
    critical: number;
    deferrable: number;
    removable: number;
    estimatedSavingsBytes: number;
  };
  verdictBreakdown: {
    category: ResourceCategory;
    label: string;
    count: number;
    verdict: ResourceVerdict;
  }[];
}
