import type { CategoryResult, Finding, Severity } from '../../shared/types';

interface Props {
  category: CategoryResult;
  excludeBotFindings?: boolean;
}

const severityConfig: Record<Severity, { bg: string; border: string; icon: string; label: string }> = {
  pass: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    label: 'Pass',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
    label: 'Warning',
  },
  fail: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    label: 'Fail',
  },
  info: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    icon: 'text-gray-400',
    label: 'Tip',
  },
};

function SeverityIcon({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];

  if (severity === 'pass') {
    return (
      <svg className={`w-5 h-5 ${config.icon}`} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (severity === 'fail') {
    return (
      <svg className={`w-5 h-5 ${config.icon}`} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (severity === 'warning') {
    return (
      <svg className={`w-5 h-5 ${config.icon}`} fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg className={`w-5 h-5 ${config.icon}`} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CategoryDetail({ category, excludeBotFindings }: Props) {
  let findings = category.findings;

  // For bot-access category, exclude individual bot findings (shown in table)
  if (excludeBotFindings) {
    findings = findings.filter(
      (f) => !f.id.startsWith('bot-') || f.id === 'robots-all-blocked' || f.id === 'robots-partial-block'
    );
  }

  // Sort: failures first, then warnings, then info, then pass
  const sortOrder: Record<Severity, number> = {
    fail: 0,
    warning: 1,
    info: 2,
    pass: 3,
  };
  const sorted = [...findings].sort(
    (a, b) => sortOrder[a.severity] - sortOrder[b.severity]
  );

  if (sorted.length === 0) return null;

  const scoreableCount = sorted.filter((f) => f.severity !== 'info').length;
  const infoCount = sorted.filter((f) => f.severity === 'info').length;
  const failCount = sorted.filter((f) => f.severity === 'fail').length;
  const warnCount = sorted.filter((f) => f.severity === 'warning').length;
  const passCount = sorted.filter((f) => f.severity === 'pass').length;

  return (
    <div className="p-4 space-y-3">
      {/* Score breakdown summary */}
      <div className="flex flex-wrap items-center gap-3 text-xs pb-3 border-b border-gray-100">
        <span className="font-semibold text-gray-500 uppercase tracking-wider">Score based on:</span>
        {passCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
            {passCount} passed
          </span>
        )}
        {warnCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full font-medium">
            {warnCount} warning{warnCount > 1 ? 's' : ''}
          </span>
        )}
        {failCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-full font-medium">
            {failCount} failed
          </span>
        )}
        {infoCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
            {infoCount} tip{infoCount > 1 ? 's' : ''} (not scored)
          </span>
        )}
      </div>

      {sorted.map((finding) => (
        <FindingRow key={finding.id} finding={finding} />
      ))}
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const config = severityConfig[finding.severity];

  return (
    <div className={`finding-card ${config.bg} ${config.border}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <SeverityIcon severity={finding.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">
              {finding.title}
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                finding.severity === 'pass'
                  ? 'bg-green-100 text-green-700'
                  : finding.severity === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : finding.severity === 'fail'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-500'
              }`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
          {finding.recommendation && (
            <div className="mt-2 flex items-start space-x-1.5">
              <svg
                className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <p className="text-sm text-brand-700 font-medium">
                {finding.recommendation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
