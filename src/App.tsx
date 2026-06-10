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
import { ResourceAuditTab } from './components/ResourceAuditTab';
import { PricingPage } from './components/PricingPage';
import { ClientLogos } from './components/ClientLogos';
import { ChatAgent } from './components/ChatAgent';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';

type Page = 'audit' | 'dashboard' | 'pricing' | 'privacy' | 'terms';
type ToolTab = 'aeo-audit' | 'resource-audit';

function getHostname(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

export default function App() {
  const { user, token } = useAuth();
  const [page, setPage] = useState<Page>('audit');
  const [toolTab, setToolTab] = useState<ToolTab>('aeo-audit');
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleAudit = async (url: string, competitors: string[], htmlInput?: { html: string; baseUrl?: string }) => {
    setLoading(true);
    setError(null);
    setReport(null);
    setActiveTab(0);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      let body: Record<string, unknown>;

      if (htmlInput) {
        body = { mode: 'html', html: htmlInput.html };
        if (htmlInput.baseUrl) body.baseUrl = htmlInput.baseUrl;
      } else {
        body = { url };
        if (competitors.length > 0) body.competitors = competitors;
      }

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
    setActiveTab(0);
    setPage('audit');
  };

  const hasCompetitors = report?.competitors && report.competitors.length > 0;
  const allReports = report ? [report, ...(report.competitors || [])] : [];
  const selectedReport = allReports[activeTab] || report;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onLoginClick={() => setShowAuth(true)}
        onDashboardClick={() => setPage('dashboard')}
        onPricingClick={() => setPage('pricing')}
        onLogoClick={() => { setPage('audit'); setReport(null); setError(null); }}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {page === 'privacy' ? (
          <PrivacyPage onBack={() => setPage('audit')} />
        ) : page === 'terms' ? (
          <TermsPage onBack={() => setPage('audit')} />
        ) : page === 'pricing' ? (
          <PricingPage
            onLogin={() => setShowAuth(true)}
            onBack={() => setPage('audit')}
          />
        ) : page === 'dashboard' && user ? (
          <DashboardPage
            onViewReport={handleViewHistoryReport}
            onBack={() => setPage('audit')}
          />
        ) : (
          <>
            {/* Tool Tab Switcher */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-xl bg-gray-100 p-1 shadow-inner">
                <button
                  onClick={() => setToolTab('aeo-audit')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    toolTab === 'aeo-audit'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1.5">🤖</span>
                  AEO Audit
                </button>
                <button
                  onClick={() => setToolTab('resource-audit')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    toolTab === 'resource-audit'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-1.5">⚡</span>
                  Resource Audit
                </button>
              </div>
            </div>

            {/* AEO Audit Tab */}
            {toolTab === 'aeo-audit' && (
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
                      <ComparisonView report={report} onSelectSite={setActiveTab} activeTab={activeTab} />
                    )}

                    {/* Site selector tabs when competitors present */}
                    {hasCompetitors && (
                      <div className="mt-6 flex items-center gap-2 border-b border-gray-200">
                        {allReports.map((r, i) => (
                          <button
                            key={r.url}
                            onClick={() => setActiveTab(i)}
                            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === i
                                ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {i === 0 && (
                              <span className="inline-block mr-1.5 text-[10px] font-bold uppercase bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                            {getHostname(r.url)}
                            <span className={`ml-2 text-xs font-semibold ${
                              r.overallScore >= 70 ? 'text-green-600' : r.overallScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {r.overallScore}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <ReportDashboard
                      report={selectedReport!}
                      isComparisonMode={hasCompetitors || false}
                      siteLabel={hasCompetitors
                        ? (activeTab === 0 ? 'Your Site' : `Competitor: ${getHostname(allReports[activeTab]?.url || '')}`)
                        : undefined
                      }
                    />
                  </>
                )}
              </>
            )}

            {/* Resource Audit Tab */}
            {toolTab === 'resource-audit' && (
              <ResourceAuditTab />
            )}
          </>
        )}
      </main>
      <Footer
        onPrivacyClick={() => setPage('privacy')}
        onTermsClick={() => setPage('terms')}
      />
      <ChatAgent />

      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
    </div>
  );
}
