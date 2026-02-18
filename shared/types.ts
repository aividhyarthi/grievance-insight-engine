// ─── Content & Media Types ───────────────────────────────────────────────────

export type ContentType = 'image' | 'video' | 'audio' | 'text';

export type MediaFormat =
  | 'jpeg' | 'png' | 'gif' | 'webp' | 'svg' | 'bmp'
  | 'mp4' | 'webm' | 'avi' | 'mov' | 'mkv'
  | 'mp3' | 'wav' | 'ogg' | 'flac' | 'aac'
  | 'txt' | 'html' | 'markdown' | 'pdf';

// ─── Detection ───────────────────────────────────────────────────────────────

export type DetectionVerdict = 'ai_generated' | 'ai_modified' | 'likely_human' | 'uncertain';

export type DetectionProviderName = 'heuristic' | 'hive' | 'huggingface' | 'openai' | 'sensity' | 'arya' | 'resemble' | 'c2pa';

export interface ProviderResult {
  provider: DetectionProviderName;
  verdict: DetectionVerdict;
  confidence: number;           // 0–100
  details: string;
  generativeModel?: string;     // e.g. "DALL-E 3", "Midjourney v6", "ElevenLabs"
  segments?: DetectionSegment[];
  metadata?: Record<string, unknown>;
  processingTimeMs: number;
  error?: string;
}

export interface DetectionSegment {
  startMs?: number;
  endMs?: number;
  startChar?: number;
  endChar?: number;
  verdict: DetectionVerdict;
  confidence: number;
  label?: string;
}

export interface AggregatedDetection {
  overallVerdict: DetectionVerdict;
  overallConfidence: number;     // 0–100
  providerResults: ProviderResult[];
  consensusCount: number;        // how many providers agree
  generativeModel?: string;
}

// ─── Compliance ──────────────────────────────────────────────────────────────

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'needs_review' | 'exempt' | 'not_applicable';

export interface RuleCheck {
  ruleId: string;
  ruleName: string;
  section: string;
  description: string;
  status: ComplianceStatus;
  finding: string;
  recommendation?: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
}

export interface ActionItem {
  step: number;
  priority: 'immediate' | 'short_term' | 'ongoing';
  action: string;
  reason: string;
  ruleIds: string[];
}

export interface ComplianceReport {
  overallStatus: ComplianceStatus;
  score: number;                  // 0–100
  grade: string;                  // A+, A, B, C, D, F
  ruleChecks: RuleCheck[];
  exemptionsApplied: string[];
  actionPlan: ActionItem[];       // Clear next steps for the user
  summary: string;
  generatedAt: string;
}

// ─── Scan ────────────────────────────────────────────────────────────────────

export interface ScanRequest {
  contentType: ContentType;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  textContent?: string;           // for direct text input
  labels?: string[];              // existing labels on the content
  metadata?: Record<string, unknown>;
  publisherName?: string;
  platformName?: string;
}

export interface ScanResult {
  id: string;
  scanRequest: ScanRequest;
  detection: AggregatedDetection;
  compliance: ComplianceReport;
  createdAt: string;
  processingTimeMs: number;
}

// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = 'publisher' | 'regulator' | 'admin';
export type UserPlan = 'free' | 'pro' | 'enterprise';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  organization?: string;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalScans: number;
  compliantCount: number;
  nonCompliantCount: number;
  needsReviewCount: number;
  complianceRate: number;         // percentage
  scansByContentType: Record<ContentType, number>;
  scansByDay: { date: string; count: number }[];
  topViolations: { ruleId: string; ruleName: string; count: number }[];
  recentScans: ScanResult[];
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
