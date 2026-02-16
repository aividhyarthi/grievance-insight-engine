import { useState } from 'react';
import type { AuditReport } from '../shared/types';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { AuditForm } from './components/AuditForm';
import { ReportDashboard } from './components/ReportDashboard';
import { ComparisonView } from './components/ComparisonView';
import { Footer } from './components/Footer';
import { AuthPage } from './components/AuthPage';
import { DashboardPage } from './components/DashboardPage';

type Page = 'audit' | 'dashboard';

export default function App() {
  const { user, token } = useAuth();
  const [page, setPage] = useState<Page>('audit');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleAudit = async (url: string, competitors: string[]) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const body: Record<string, unknown> = { url };
      if (competitors.length > 0) body.competitors = competitors;

      const res = await fetch('/api/audit', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Audit failed');
      }

      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistoryReport = (historyReport: AuditReport) => {
    setReport(historyReport);
    setPage('audit');
  };

  const hasCompetitors = report?.competitors && report.competitors.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onLoginClick={() => setShowAuth(true)}
        onDashboardClick={() => setPage('dashboard')}
        onLogoClick={() => { setPage('audit'); setReport(null); setError(null); }}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {page === 'dashboard' && user ? (
          <DashboardPage
            onViewReport={handleViewHistoryReport}
            onBack={() => setPage('audit')}
          />
        ) : (
          <>
            <AuditForm onSubmit={handleAudit} loading={loading} />

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-red-500 text-xl mr-3">!</span>
                  <div>
                    <h3 className="text-red-800 font-semibold">Audit Failed</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-12 flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-200 border-t-brand-600"></div>
                <p className="mt-4 text-gray-600 text-lg">Analyzing website{hasCompetitors ? 's' : ''}...</p>
                <p className="mt-1 text-gray-400 text-sm">
                  Checking AI bot access, content quality, structured data, and more
                </p>
              </div>
            )}

            {report && !loading && (
              <>
                {hasCompetitors && (
                  <ComparisonView report={report} />
                )}
                <ReportDashboard report={report} />
              </>
            )}
          </>
        )}
      </main>
      <Footer />

      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
    </div>
  );
}
