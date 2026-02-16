import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, SeverityBadge, VerdictBadge, GradeBadge } from './ComplianceBadge';
import { PROVIDER_INFO } from '@shared/constants';
import type { ScanResult } from '@shared/types';

export default function ScanResults() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compliance' | 'detection'>('compliance');

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
          <p className="text-sm text-gray-600 mt-4">{compliance.summary}</p>
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
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'compliance' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Compliance Checks ({compliance.ruleChecks.length})
        </button>
        <button
          onClick={() => setActiveTab('detection')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'detection' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
          }`}
        >
          Detection Details ({detection.providerResults.length})
        </button>
      </div>

      {/* Compliance checks */}
      {activeTab === 'compliance' && (
        <div className="space-y-3">
          {compliance.ruleChecks.map((check) => (
            <div key={check.ruleId} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={check.status} />
                  <SeverityBadge severity={check.severity} />
                  <span className="text-xs text-gray-400 font-mono">{check.ruleId}</span>
                </div>
                <span className="text-xs text-gray-400">{check.section}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{check.ruleName}</h4>
              <p className="text-sm text-gray-600 mb-2">{check.finding}</p>
              {check.recommendation && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-3 mt-2">
                  <span className="text-xs font-semibold text-primary-700">Recommendation: </span>
                  <span className="text-xs text-primary-600">{check.recommendation}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">{check.description}</p>
            </div>
          ))}
        </div>
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
