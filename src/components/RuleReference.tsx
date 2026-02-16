import { useState } from 'react';
import { COMPLIANCE_RULES, EXEMPTIONS, PENALTY_FRAMEWORK } from '@shared/rules';
import { SeverityBadge } from './ComplianceBadge';

type FilterType = 'all' | 'label' | 'metadata' | 'disclosure' | 'platform' | 'exemption';

export default function RuleReference() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredRules = filter === 'all'
    ? COMPLIANCE_RULES
    : COMPLIANCE_RULES.filter((r) => r.checkType === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">IT Rules 2026 Reference</h1>
        <p className="text-sm text-gray-500 mt-1">
          Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Amendment Rules, 2026 — AI Content Labeling Requirements
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'label', 'metadata', 'disclosure', 'platform'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              filter === f
                ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? `All Rules (${COMPLIANCE_RULES.length})` : f}
          </button>
        ))}
      </div>

      {/* Rules */}
      <div className="space-y-4">
        {filteredRules.map((rule) => (
          <div key={rule.id} className="card p-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{rule.id}</span>
                <SeverityBadge severity={rule.severity} />
                <span className="badge bg-primary-50 text-primary-600 capitalize">{rule.checkType}</span>
              </div>
              <span className="text-xs text-gray-400">{rule.section}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">{rule.name}</h3>
            <p className="text-sm text-gray-600">{rule.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs text-gray-400">Applies to:</span>
              {rule.appliesTo.map((t) => (
                <span key={t} className="badge bg-gray-100 text-gray-600 capitalize">{t}</span>
              ))}
            </div>
            {rule.exemptions.length > 0 && (
              <div className="mt-2 text-xs text-blue-600">
                Exemptions: {rule.exemptions.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exemptions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Exemptions</h2>
        <div className="space-y-4">
          {EXEMPTIONS.map((ex) => (
            <div key={ex.id} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{ex.id}</span>
                <span className="text-xs text-gray-400">{ex.section}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{ex.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{ex.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {ex.examples.map((example, i) => (
                  <span key={i} className="badge bg-gray-100 text-gray-600">{example}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Penalty framework */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Penalty Framework</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(PENALTY_FRAMEWORK).map((penalty) => (
            <div key={penalty.severity} className={`card p-5 ${
              penalty.severity === 'critical' ? 'border-red-200' :
              penalty.severity === 'major' ? 'border-orange-200' : 'border-yellow-200'
            }`}>
              <div className="mb-2">
                <SeverityBadge severity={penalty.severity} />
              </div>
              <p className="text-sm text-gray-600 mb-3">{penalty.consequence}</p>
              <div className="text-xs font-medium text-gray-500">
                Timeline: {penalty.timelineToComply}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
