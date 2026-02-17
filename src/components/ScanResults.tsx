import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, SeverityBadge, VerdictBadge, GradeBadge } from './ComplianceBadge';
import { PROVIDER_INFO } from '@shared/constants';
import type { ScanResult, ActionItem } from '@shared/types';

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  immediate: { label: 'Do Now', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  short_term: { label: 'Do Soon', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ongoing: { label: 'Ongoing', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const RULE_CATEGORY: Record<string, { label: string; icon: string }> = {
  LABEL: { label: 'Labeling', icon: '🏷' },
  META: { label: 'Metadata', icon: '📋' },
  PLAT: { label: 'Platform Obligations', icon: '🏢' },
  PUB: { label: 'Publisher Obligations', icon: '📰' },
};

function getCategoryKey(ruleId: string): string {
  return ruleId.split('-')[0];
}

function ActionPlanSection({ actions, verdict, confidence }: { actions: ActionItem[]; verdict: string; confidence: number }) {
  if (!actions || actions.length === 0) return null;

  const isAI = verdict === 'ai_generated' || verdict === 'ai_modified';
  const isUncertain = verdict === 'uncertain';
  const hasImmediateActions = actions.some((a) => a.priority === 'immediate');
  const hasLimitedAnalysis = actions.some((a) => a.action.toLowerCase().includes('limited analysis'));

  let bannerBg = 'bg-green-50 border-green-200';
  let bannerText = 'text-green-800';
  let bannerTitle = 'All Clear — No Action Needed';
  let bannerSubtitle = 'Content appears human-created and compliant.';

  if (hasImmediateActions && isAI) {
    bannerBg = 'bg-red-50 border-red-300';
    bannerText = 'text-red-800';
    bannerTitle = 'Action Required — AI Content Detected';
    bannerSubtitle = `This content was detected as ${verdict.replace('_', '-')} with ${confidence}% confidence. Follow these steps to become compliant:`;
  } else if (isUncertain) {
    bannerBg = 'bg-amber-50 border-amber-300';
    bannerText = 'text-amber-800';
    bannerTitle = 'Review Needed — AI Detection Uncertain';
    bannerSubtitle = `Detection confidence is ${confidence}%. The content shows some AI patterns. Manual review recommended.`;
  } else if (isAI && !hasImmediateActions) {
    bannerBg = 'bg-blue-50 border-blue-200';
    bannerText = 'text-blue-800';
    bannerTitle = 'AI Content — Mostly Compliant';
    bannerSubtitle = 'AI content detected but key compliance checks are passing. Review ongoing items below.';
  } else if (hasLimitedAnalysis) {
    bannerBg = 'bg-amber-50 border-amber-200';
    bannerText = 'text-amber-800';
    bannerTitle = 'Limited Analysis — Cannot Confirm';
    bannerSubtitle = 'Only metadata-based detection was available. Visual AI analysis requires an API provider to be enabled.';
  }

  return (
    <div className={`rounded-xl border-2 ${bannerBg} p-6`}>
      <h2 className={`text-lg font-bold ${bannerText} mb-1`}>{bannerTitle}</h2>
      <p className={`text-sm ${bannerText} opacity-80 mb-4`}>{bannerSubtitle}</p>

      <div className="space-y-3">
        {actions.map((item) => {
          const config = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.ongoing;
          return (
            <div key={item.step} className={`bg-white rounded-lg border ${config.border} p-4`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                    {item.ruleIds.length > 0 && (
                      <span className="text-xs text-gray-400 font-mono">
                        {item.ruleIds.join(', ')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.reason}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GroupedRuleChecks({ checks }: { checks: ScanResult['compliance']['ruleChecks'] }) {
  // Group checks by category
  const groups: Record<string, typeof checks> = {};
  for (const check of checks) {
    const key = getCategoryKey(check.ruleId);
    if (!groups[key]) groups[key] = [];
    groups[key].push(check);
  }

  // Sort: show failed/review first, then compliant, then N/A
  const statusOrder: Record<string, number> = {
    non_compliant: 0,
    needs_review: 1,
    compliant: 2,
    exempt: 3,
    not_applicable: 4,
  };

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([key, groupChecks]) => {
        const catInfo = RULE_CATEGORY[key] || { label: key, icon: '📄' };
        const sorted = [...groupChecks].sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5));
        const failCount = sorted.filter((c) => c.status === 'non_compliant').length;
        const reviewCount = sorted.filter((c) => c.status === 'needs_review').length;
        const passCount = sorted.filter((c) => c.status === 'compliant').length;
        const naCount = sorted.filter((c) => c.status === 'not_applicable' || c.status === 'exempt').length;

        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{catInfo.icon}</span>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{catInfo.label}</h3>
              <div className="flex gap-1 ml-auto">
                {failCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">{failCount} failed</span>}
                {reviewCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{reviewCount} review</span>}
                {passCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">{passCount} passed</span>}
                {naCount > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{naCount} N/A</span>}
              </div>
            </div>
            <div className="space-y-2">
              {sorted.map((check) => (
                <div key={check.ruleId} className="card p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={check.status} />
                      <SeverityBadge severity={check.severity} />
                      <span className="text-xs text-gray-400 font-mono">{check.ruleId}</span>
                    </div>
                    <span className="text-xs text-gray-400">{check.section}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{check.ruleName}</h4>
                  <p className="text-sm text-gray-600">{check.finding}</p>
                  {check.recommendation && (
                    <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 mt-2">
                      <span className="text-xs font-semibold text-primary-700">Recommendation: </span>
                      <span className="text-xs text-primary-600">{check.recommendation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ScanResults() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'action' | 'compliance' | 'detection'>('action');

  useEffect(() => {
    fetch(`/api/report/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.success) setResult(data.data); })
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">Scan not found</h2>
        <Link to="/scan" className="text-primary-600 underline mt-2 block">Run a new scan</Link>
      </div>
    );
  }

  const { detection, compliance, scanRequest } = result;

  const failedCount = compliance.ruleChecks.filter((c) => c.status === 'non_compliant').length;
  const reviewCount = compliance.ruleChecks.filter((c) => c.status === 'needs_review').length;
  const passedCount = compliance.ruleChecks.filter((c) => c.status === 'compliant').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Scan Report</h1>
            <StatusBadge status={compliance.overallStatus} />
          </div>
          <p className="text-sm text-gray-500">
            {scanRequest.fileName || 'Text content'} &middot;{' '}
            <span className="capitalize">{scanRequest.contentType}</span> &middot;{' '}
            {new Date(result.createdAt).toLocaleString('en-IN')} &middot;{' '}
            {result.processingTimeMs}ms
          </p>
        </div>
        <Link to="/scan" className="btn-secondary text-sm">New Scan</Link>
      </div>

      {/* Score + Detection summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Compliance Score</h3>
          <GradeBadge grade={compliance.grade} score={compliance.score} />
          <div className="flex gap-3 mt-4 text-xs">
            {failedCount > 0 && <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium">{failedCount} Failed</span>}
            {reviewCount > 0 && <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 font-medium">{reviewCount} Review</span>}
            {passedCount > 0 && <span className="px-2 py-1 rounded bg-green-100 text-green-700 font-medium">{passedCount} Passed</span>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">AI Detection</h3>
          <div className="flex items-center gap-3 mb-3">
            <VerdictBadge verdict={detection.overallVerdict} confidence={detection.overallConfidence} />
          </div>
          {detection.generativeModel && (
            <p className="text-sm text-gray-600 mb-2">
              Likely AI model: <span className="font-medium">{detection.generativeModel}</span>
            </p>
          )}
          <p className="text-sm text-gray-500">
            {detection.providerResults.length} provider(s) checked &middot;{' '}
            {detection.consensusCount} agree on verdict
          </p>
          {compliance.exemptionsApplied.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <span className="text-xs font-medium text-blue-700">
                Exemptions applied: {compliance.exemptionsApplied.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('action')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'action' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Next Steps ({compliance.actionPlan?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'compliance' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Compliance ({compliance.ruleChecks.length})
        </button>
        <button
          onClick={() => setActiveTab('detection')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'detection' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Detection ({detection.providerResults.length})
        </button>
      </div>

      {/* Action Plan tab (default) */}
      {activeTab === 'action' && (
        <ActionPlanSection
          actions={compliance.actionPlan || []}
          verdict={detection.overallVerdict}
          confidence={detection.overallConfidence}
        />
      )}

      {/* Compliance checks — grouped by category */}
      {activeTab === 'compliance' && (
        <GroupedRuleChecks checks={compliance.ruleChecks} />
      )}

      {/* Detection details */}
      {activeTab === 'detection' && (
        <div className="space-y-3">
          {detection.providerResults.map((pr, i) => {
            const info = PROVIDER_INFO[pr.provider];
            return (
              <div key={i} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {info?.name || pr.provider}
                    </h4>
                    <p className="text-xs text-gray-400">{info?.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <VerdictBadge verdict={pr.verdict} confidence={pr.confidence} />
                    <span className="text-xs text-gray-400">{pr.processingTimeMs}ms</span>
                  </div>
                </div>

                {pr.error ? (
                  <div className="bg-red-50 rounded-lg p-3 mt-2">
                    <span className="text-xs text-red-600">{pr.error}</span>
                  </div>
                ) : (
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mt-2 whitespace-pre-wrap">
                    {pr.details}
                  </pre>
                )}

                {pr.generativeModel && (
                  <div className="mt-2 text-xs text-gray-500">
                    Detected AI model: <span className="font-medium text-gray-700">{pr.generativeModel}</span>
                  </div>
                )}

                {pr.segments && pr.segments.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-gray-500">Flagged segments:</span>
                    <div className="space-y-1 mt-1">
                      {pr.segments.slice(0, 5).map((seg, j) => (
                        <div key={j} className="text-xs bg-amber-50 rounded p-2">
                          {seg.label && <span className="font-medium text-amber-700">{seg.label}</span>}
                          <span className="text-amber-600 ml-2">({seg.confidence}% confidence)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
