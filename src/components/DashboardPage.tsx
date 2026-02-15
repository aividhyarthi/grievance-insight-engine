import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { AuditReport } from '../../shared/types';

interface AuditSummary {
  id: string;
  url: string;
  overall_score: number;
  grade: string;
  created_at: string;
}

interface Props {
  onViewReport: (report: AuditReport) => void;
  onBack: () => void;
}

export function DashboardPage({ onViewReport, onBack }: Props) {
  const { user, token } = useAuth();
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchAudits = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/audits?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAudits(data.audits);
        setPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  const handleViewReport = async (auditId: string) => {
    if (!token) return;
    setLoadingReport(auditId);
    try {
      const res = await fetch(`/api/audits/${auditId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const report = await res.json();
        onViewReport(report);
      }
    } catch {
      // ignore
    } finally {
      setLoadingReport(null);
    }
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-600 bg-green-50 border-green-200' :
    score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
    score >= 40 ? 'text-orange-600 bg-orange-50 border-orange-200' :
    'text-red-600 bg-red-50 border-red-200';

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Stripe is not configured yet.');
      }
    } catch {
      alert('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={onBack} className="text-sm text-brand-600 hover:text-brand-700 mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Audit
          </button>
          <h2 className="text-2xl font-bold text-gray-900">My Audits</h2>
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} audit{pagination.total !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            user?.plan === 'pro'
              ? 'bg-brand-100 text-brand-700 border border-brand-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
          </span>
          {user?.plan !== 'pro' && (
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* Pro upsell for free users */}
      {user?.plan !== 'pro' && (
        <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Upgrade to Pro - $29/month</h3>
              <p className="text-sm text-gray-600 mt-1">
                Unlimited audits, PDF export, email reports, and full audit history.
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg whitespace-nowrap transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Audit list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-200 border-t-brand-600"></div>
        </div>
      ) : audits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No audits yet</h3>
          <p className="text-gray-500 mb-4">Run your first audit to see results here.</p>
          <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg">
            Run an Audit
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="text-sm font-medium text-gray-900 truncate block max-w-xs">
                      {audit.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${scoreColor(audit.overall_score)}`}>
                      {audit.overall_score}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="text-sm font-semibold text-gray-700">{audit.grade}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="text-sm text-gray-500">
                      {new Date(audit.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleViewReport(audit.id)}
                      disabled={loadingReport === audit.id}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                    >
                      {loadingReport === audit.id ? 'Loading...' : 'View Report'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => fetchAudits(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchAudits(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
