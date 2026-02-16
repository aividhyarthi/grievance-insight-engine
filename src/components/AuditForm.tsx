import { useState } from 'react';

interface Props {
  onSubmit: (url: string, competitors: string[]) => void;
  loading: boolean;
}

function normalizeUrl(raw: string): string {
  let u = raw.trim();
  if (u && !u.startsWith('http')) u = `https://${u}`;
  return u;
}

export function AuditForm({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState('');
  const [showCompetitors, setShowCompetitors] = useState(false);
  const [comp1, setComp1] = useState('');
  const [comp2, setComp2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) return;

    const competitors = [normalizeUrl(comp1), normalizeUrl(comp2)].filter(
      (c) => c && c !== finalUrl
    );
    onSubmit(finalUrl, competitors);
  };

  return (
    <div className="text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Is your website AI-ready?
        </h2>
        <p className="mt-3 text-lg text-gray-600">
          Audit your website for Answer Engine Optimization (AEO) and
          Generative Engine Optimization (GEO). Check how Google AI,
          ChatGPT, Claude, and Perplexity see your content.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-2xl mx-auto"
      >
        {/* Main URL */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your website URL (e.g., example.com)"
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl text-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md whitespace-nowrap"
          >
            {loading ? 'Auditing...' : 'Audit Website'}
          </button>
        </div>

        {/* Competitor toggle */}
        {!showCompetitors ? (
          <button
            type="button"
            onClick={() => setShowCompetitors(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Compare with competitors (up to 2)
          </button>
        ) : (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Competitor URLs (optional)
              </h4>
              <button
                type="button"
                onClick={() => { setShowCompetitors(false); setComp1(''); setComp2(''); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Remove
              </button>
            </div>
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-xs font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded">1</span>
                </div>
                <input
                  type="text"
                  value={comp1}
                  onChange={(e) => setComp1(e.target.value)}
                  placeholder="Competitor 1 URL (e.g., competitor.com)"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-xs font-bold text-brand-500 bg-brand-50 px-1.5 py-0.5 rounded">2</span>
                </div>
                <input
                  type="text"
                  value={comp2}
                  onChange={(e) => setComp2(e.target.value)}
                  placeholder="Competitor 2 URL (e.g., another-competitor.com)"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  disabled={loading}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              We'll audit all sites and show a side-by-side comparison
            </p>
          </div>
        )}
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
        {[
          'AI Bot Access',
          'Content Quality',
          'Schema Markup',
          'Technical SEO',
          'Meta Tags & OG',
          'E-E-A-T Signals',
          'Heading Structure',
          'Link Profile',
          'Crawlability',
          'Boilerplate Detection',
          'AI Content Check',
          'E-Commerce AEO',
          'Publisher AEO',
          'Industry Verticals',
        ].map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-gray-100 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
