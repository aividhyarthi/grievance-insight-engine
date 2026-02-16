import { STATUS_LABELS, SEVERITY_LABELS } from '@shared/constants';
import type { ComplianceStatus } from '@shared/types';

export function StatusBadge({ status }: { status: ComplianceStatus }) {
  const info = STATUS_LABELS[status] || STATUS_LABELS.needs_review;
  return (
    <span className={`badge ${info.bgColor} ${info.color}`}>
      {info.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const info = SEVERITY_LABELS[severity] || SEVERITY_LABELS.info;
  return (
    <span className={`text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}

export function VerdictBadge({ verdict, confidence }: { verdict: string; confidence: number }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    ai_generated: { label: 'AI Generated', bg: 'bg-red-100', text: 'text-red-700' },
    ai_modified: { label: 'AI Modified', bg: 'bg-orange-100', text: 'text-orange-700' },
    uncertain: { label: 'Uncertain', bg: 'bg-amber-100', text: 'text-amber-700' },
    likely_human: { label: 'Likely Human', bg: 'bg-green-100', text: 'text-green-700' },
  };
  const c = config[verdict] || config.uncertain;
  return (
    <span className={`badge ${c.bg} ${c.text}`}>
      {c.label} ({confidence}%)
    </span>
  );
}

export function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const colorMap: Record<string, string> = {
    'A+': 'from-green-500 to-emerald-600',
    'A': 'from-green-500 to-emerald-600',
    'B': 'from-blue-500 to-cyan-600',
    'C': 'from-yellow-500 to-amber-600',
    'D': 'from-orange-500 to-red-500',
    'F': 'from-red-600 to-red-800',
  };
  const gradient = colorMap[grade] || colorMap['F'];

  return (
    <div className="flex items-center gap-3">
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
        <span className="text-white font-bold text-xl">{grade}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{score}/100</div>
        <div className="text-xs text-gray-500">Compliance Score</div>
      </div>
    </div>
  );
}
