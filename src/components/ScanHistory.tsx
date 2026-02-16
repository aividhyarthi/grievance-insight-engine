import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, VerdictBadge } from './ComplianceBadge';
import type { ScanResult } from '@shared/types';

interface PaginatedResponse {
  scans: ScanResult[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function ScanHistory() {
  const { token } = useAuth();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/report?page=${page}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, [page, token]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `${data.pagination.total} total scans` : 'Loading...'}
          </p>
        </div>
        <Link to="/scan" className="btn-primary">New Scan</Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : !data || data.scans.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No scans yet.</p>
          <Link to="/scan" className="text-primary-600 underline text-sm mt-2 block">Run your first scan</Link>
        </div>
      ) : (
        <>
          <div className="card divide-y divide-gray-50">
            {data.scans.map((scan) => (
              <Link
                key={scan.id}
                to={`/scan/${scan.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold uppercase ${
                    scan.scanRequest.contentType === 'image' ? 'bg-purple-100 text-purple-600' :
                    scan.scanRequest.contentType === 'video' ? 'bg-blue-100 text-blue-600' :
                    scan.scanRequest.contentType === 'audio' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {scan.scanRequest.contentType.slice(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {scan.scanRequest.fileName || 'Text scan'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(scan.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                      {scan.scanRequest.publisherName && ` \u00b7 ${scan.scanRequest.publisherName}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <VerdictBadge verdict={scan.detection.overallVerdict} confidence={scan.detection.overallConfidence} />
                  <StatusBadge status={scan.compliance.overallStatus} />
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">
                    {scan.compliance.grade}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data!.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages}
                className="btn-secondary text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
