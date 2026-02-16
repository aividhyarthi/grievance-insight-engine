import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, VerdictBadge } from './ComplianceBadge';
import type { DashboardStats } from '@shared/types';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Content Compliance</h2>
        <p className="text-gray-500 mb-6">Start by scanning your first piece of content.</p>
        <Link to="/scan" className="btn-primary">Scan Content</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">IT Rules 2026 compliance overview</p>
        </div>
        <Link to="/scan" className="btn-primary">New Scan</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Scans" value={stats.totalScans} />
        <StatCard label="Compliant" value={stats.compliantCount} color="text-green-600" />
        <StatCard label="Non-Compliant" value={stats.nonCompliantCount} color="text-red-600" />
        <StatCard
          label="Compliance Rate"
          value={`${stats.complianceRate}%`}
          color={stats.complianceRate >= 80 ? 'text-green-600' : stats.complianceRate >= 50 ? 'text-amber-600' : 'text-red-600'}
        />
      </div>

      {/* Content type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Scans by Content Type</h3>
          <div className="space-y-3">
            {(['image', 'video', 'audio', 'text'] as const).map((type) => {
              const count = stats.scansByContentType[type] || 0;
              const pct = stats.totalScans > 0 ? (count / stats.totalScans) * 100 : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-14 capitalize">{type}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-primary-500 rounded-full h-2.5 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Violations</h3>
          {stats.topViolations.length === 0 ? (
            <p className="text-sm text-gray-400">No violations recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.topViolations.map((v) => (
                <div key={v.ruleId} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{v.ruleName}</span>
                    <span className="text-xs text-gray-400 ml-2">{v.ruleId}</span>
                  </div>
                  <span className="badge bg-red-100 text-red-700">{v.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent scans */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Scans</h3>
            <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all
            </Link>
          </div>
        </div>
        {stats.recentScans.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No scans yet. <Link to="/scan" className="text-primary-600 underline">Run your first scan</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentScans.map((scan) => (
              <Link
                key={scan.id}
                to={`/scan/${scan.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ContentTypeIcon type={scan.scanRequest.contentType} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {scan.scanRequest.fileName || 'Text scan'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(scan.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VerdictBadge verdict={scan.detection.overallVerdict} confidence={scan.detection.overallConfidence} />
                  <StatusBadge status={scan.compliance.overallStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

function ContentTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    image: 'bg-purple-100 text-purple-600',
    video: 'bg-blue-100 text-blue-600',
    audio: 'bg-amber-100 text-amber-600',
    text: 'bg-gray-100 text-gray-600',
  };
  const cls = icons[type] || icons.text;
  return (
    <div className={`w-9 h-9 rounded-lg ${cls} flex items-center justify-center text-xs font-bold uppercase`}>
      {type.slice(0, 3)}
    </div>
  );
}
