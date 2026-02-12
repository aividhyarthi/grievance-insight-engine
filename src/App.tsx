import { useState } from 'react';
import type { AuditReport } from '../shared/types';
import { Header } from './components/Header';
import { AuditForm } from './components/AuditForm';
import { ReportDashboard } from './components/ReportDashboard';
import { Footer } from './components/Footer';

export default function App() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async (url: string) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
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
            <p className="mt-4 text-gray-600 text-lg">Analyzing website...</p>
            <p className="mt-1 text-gray-400 text-sm">
              Checking AI bot access, content quality, structured data, and more
            </p>
          </div>
        )}

        {report && !loading && <ReportDashboard report={report} />}
      </main>
      <Footer />
    </div>
  );
}
