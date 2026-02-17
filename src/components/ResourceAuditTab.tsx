import { useState } from 'react';
import type { ResourceAuditResult, ResourceItem, ResourceVerdict } from '../../shared/types';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getVerdictColor(verdict: ResourceVerdict) {
  switch (verdict) {
    case 'critical': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' };
    case 'deferrable': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' };
    case 'removable': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
  }
}

function getCrawlerBadge(advice: string) {
  switch (advice) {
    case 'allow': return { color: 'bg-green-100 text-green-700', label: 'Allow' };
    case 'block-safe': return { color: 'bg-yellow-100 text-yellow-700', label: 'Safe to Block' };
    case 'block-recommended': return { color: 'bg-red-100 text-red-700', label: 'Block Recommended' };
    default: return { color: 'bg-gray-100 text-gray-600', label: advice };
  }
}

function BudgetMeter({ used, limit }: { used: number; limit: number }) {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Google 2MB Crawl Budget</h3>
        <span className="text-sm font-mono text-gray-600">{formatSize(used)} / {formatSize(limit)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        {percent}% of Googlebot's 2MB HTML crawl limit used. Inline JS/CSS count against this budget.
      </p>
    </div>
  );
}

function SummaryCards({ result }: { result: ResourceAuditResult }) {
  const { summary, inlineResources } = result;
  const cards = [
    { label: 'Total Resources', value: summary.totalResources, sub: `${summary.totalJs} JS + ${summary.totalCss} CSS`, icon: '📦', color: 'bg-blue-50 border-blue-200' },
    { label: 'Render-Blocking', value: summary.renderBlocking, sub: 'Block page paint', icon: '🚫', color: summary.renderBlocking > 5 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200' },
    { label: '3rd-Party', value: summary.thirdParty, sub: `of ${summary.totalResources} total`, icon: '🌐', color: summary.thirdParty > summary.firstParty ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200' },
    { label: 'Safe to Remove', value: summary.removable, sub: 'No content impact', icon: '🗑️', color: summary.removable > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200' },
    { label: 'Can Defer', value: summary.deferrable, sub: 'Load after render', icon: '⏳', color: summary.deferrable > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200' },
    { label: 'Inline Bloat', value: formatSize(inlineResources.inlineJsSizeBytes + inlineResources.inlineCssSizeBytes), sub: `${inlineResources.inlineJsCount} JS + ${inlineResources.inlineCssCount} CSS`, icon: '📜', color: (inlineResources.inlineJsSizeBytes + inlineResources.inlineCssSizeBytes) > 200 * 1024 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-4 ${card.color}`}>
          <div className="text-2xl mb-1">{card.icon}</div>
          <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          <div className="text-sm font-medium text-gray-700">{card.label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}

function ResourceRow({ resource, index }: { resource: ResourceItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const verdict = getVerdictColor(resource.verdict);
  const crawler = getCrawlerBadge(resource.crawlerAdvice);

  // Truncate URL for display
  const shortUrl = resource.url.length > 80 ? resource.url.slice(0, 77) + '...' : resource.url;

  return (
    <div className={`border-b border-gray-100 last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-50 flex items-center gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Index */}
        <span className="text-xs font-mono text-gray-400 w-6 flex-shrink-0">{index + 1}</span>

        {/* Type badge */}
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
          resource.type === 'js' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {resource.type}
        </span>

        {/* Party badge */}
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
          resource.party === '1st-party' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-700'
        }`}>
          {resource.party === '1st-party' ? '1st' : '3rd'}
        </span>

        {/* URL */}
        <span className="text-sm text-gray-700 truncate flex-1 font-mono" title={resource.url}>
          {shortUrl}
        </span>

        {/* Render-blocking indicator — color depends on verdict context */}
        {resource.renderBlocking && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
            resource.verdict === 'critical'
              ? 'bg-gray-100 text-gray-500'          // Expected for critical resources — not alarming
              : resource.verdict === 'deferrable'
              ? 'bg-orange-100 text-orange-700'       // Should be deferred — moderate concern
              : 'bg-red-100 text-red-700'             // Removable + blocking = bad
          }`}>
            {resource.verdict === 'critical' ? 'RENDER-BLOCKING' : 'BLOCKING'}
          </span>
        )}

        {/* Verdict badge */}
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded flex-shrink-0 ${verdict.badge}`}>
          {resource.verdict}
        </span>

        {/* Crawler advice */}
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${crawler.color}`}>
          {crawler.label}
        </span>

        {/* Expand icon */}
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {expanded && (
        <div className={`px-4 py-3 mx-4 mb-3 rounded-lg ${verdict.bg} ${verdict.border} border`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-medium text-gray-800 mb-1">Resource Details</p>
              <p className="text-xs text-gray-600 break-all mb-2">{resource.url}</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><span className="font-medium">Domain:</span> {resource.domain}</p>
                <p><span className="font-medium">Category:</span> {resource.categoryLabel}</p>
                <p><span className="font-medium">Location:</span> {'<' + resource.location + '>'}</p>
                {resource.type === 'js' && (
                  <p><span className="font-medium">Loading:</span> {resource.hasAsync ? 'async' : resource.hasDefer ? 'defer' : 'synchronous (blocking)'}</p>
                )}
                {resource.renderBlocking && (
                  <p className={`mt-1 ${resource.verdict === 'critical' ? 'text-gray-500' : 'text-orange-600'}`}>
                    <span className="font-medium">Render-blocking:</span>{' '}
                    {resource.verdict === 'critical'
                      ? 'Yes — but this is normal for critical CSS/JS. The browser needs this to paint the page.'
                      : 'Yes — this delays page rendering. Consider adding async/defer or moving to the end of <body>.'}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className={`font-medium mb-1 ${verdict.text}`}>
                {resource.verdict === 'critical' ? '✅ Verdict: Keep' :
                 resource.verdict === 'deferrable' ? '⚠️ Verdict: Defer' :
                 '🗑️ Verdict: Remove/Defer'}
              </p>
              <p className="text-xs text-gray-600 mb-3">{resource.verdictReason}</p>

              <p className="font-medium text-gray-800 mb-1">Crawler Advice</p>
              <p className="text-xs text-gray-600">{resource.crawlerAdviceReason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type FilterType = 'all' | 'js' | 'css';
type FilterParty = 'all' | '1st-party' | '3rd-party';
type FilterVerdict = 'all' | 'critical' | 'deferrable' | 'removable';

export function ResourceAuditTab() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResourceAuditResult | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterParty, setFilterParty] = useState<FilterParty>('all');
  const [filterVerdict, setFilterVerdict] = useState<FilterVerdict>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = url.trim();
    if (!finalUrl) return;
    if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/resource-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || 'Audit failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = result?.resources.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterParty !== 'all' && r.party !== filterParty) return false;
    if (filterVerdict !== 'all' && r.verdict !== filterVerdict) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header & Form */}
      <div className="text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Page Resource Audit
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Analyze every JS & CSS file on your page. Find what's blocking renders,
            wasting your 2MB crawl budget, and what crawlers should block.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to audit resources (e.g., example.com)"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl text-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            >
              {loading ? 'Scanning...' : 'Scan Resources'}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
          {['JS/CSS Audit', 'Render-Blocking Check', '2MB Budget', '1st vs 3rd Party', 'Crawler Block Advice', 'CWV Impact'].map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-500 text-xl mr-3">!</span>
            <div>
              <h3 className="text-red-800 font-semibold">Scan Failed</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-12 flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-200 border-t-brand-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Scanning page resources...</p>
          <p className="mt-1 text-gray-400 text-sm">Analyzing JS, CSS, render-blocking, and third-party scripts</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Report header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Resource Audit for</p>
                <h2 className="text-xl font-bold text-gray-900 break-all">{result.url}</h2>
                <p className="text-sm text-gray-400 mt-1">{new Date(result.fetchedAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">HTML Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatSize(result.htmlSizeBytes)}</p>
              </div>
            </div>
          </div>

          {/* 2MB Budget Meter */}
          <BudgetMeter used={result.crawlBudgetUsed} limit={result.crawlBudgetLimit} />

          {/* Summary Cards */}
          <SummaryCards result={result} />

          {/* Inline Resource Warning */}
          {(result.inlineResources.inlineJsSizeBytes > 100 * 1024 || result.inlineResources.inlineCssSizeBytes > 100 * 1024) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-2xl flex-shrink-0">⚠️</span>
                <div>
                  <h4 className="font-semibold text-yellow-800">Heavy Inline Code Detected</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {result.inlineResources.inlineJsSizeBytes > 100 * 1024 &&
                      `${formatSize(result.inlineResources.inlineJsSizeBytes)} of inline JavaScript (${result.inlineResources.inlineJsCount} blocks) is embedded in your HTML. `}
                    {result.inlineResources.inlineCssSizeBytes > 100 * 1024 &&
                      `${formatSize(result.inlineResources.inlineCssSizeBytes)} of inline CSS (${result.inlineResources.inlineCssCount} blocks) is embedded in your HTML. `}
                    This eats into your 2MB Googlebot crawl budget. Move these to external files.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {result.summary.removable > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-2xl flex-shrink-0">🎯</span>
                <div>
                  <h4 className="font-semibold text-red-800">Quick Wins: {result.summary.removable} Resource(s) Can Be Removed</h4>
                  <p className="text-sm text-red-700 mt-1">
                    These resources have zero impact on your content rendering. Removing them will improve
                    Core Web Vitals (LCP, FID, CLS) and reduce page load time.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.resources
                      .filter((r) => r.verdict === 'removable')
                      .map((r) => (
                        <span key={r.url} className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          <span className="font-medium">{r.categoryLabel}</span>
                          <span className="text-red-400">({r.domain})</span>
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Filter:</span>

              {/* Type filter */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(['all', 'js', 'css'] as FilterType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      filterType === t ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : t.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Party filter */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(['all', '1st-party', '3rd-party'] as FilterParty[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterParty(p)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      filterParty === p ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p === 'all' ? 'All Parties' : p === '1st-party' ? '1st Party' : '3rd Party'}
                  </button>
                ))}
              </div>

              {/* Verdict filter */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {(['all', 'critical', 'deferrable', 'removable'] as FilterVerdict[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setFilterVerdict(v)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      filterVerdict === v ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {v === 'all' ? 'All Verdicts' : v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-400 ml-auto">
                {filteredResources.length} of {result.resources.length} resources
              </span>
            </div>

            {/* Resource Table Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="w-6">#</span>
              <span className="w-10">Type</span>
              <span className="w-10">Party</span>
              <span className="flex-1">URL</span>
              <span className="w-16 text-center">Status</span>
              <span className="w-16 text-center">Verdict</span>
              <span className="w-24 text-center">Crawler</span>
              <span className="w-4"></span>
            </div>

            {/* Resource Rows */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource, i) => (
                  <ResourceRow key={resource.url + i} resource={resource} index={i} />
                ))
              ) : (
                <div className="p-8 text-center text-gray-400">
                  No resources match the current filters.
                </div>
              )}
            </div>
          </div>

          {/* Crawler robots.txt Suggestions */}
          <CrawlerSuggestions resources={result.resources} />

          {/* Legend */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Legend</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Verdict</p>
                <div className="space-y-1.5">
                  <p><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span><span className="font-medium">Critical</span> - Required for page rendering. Keep it.</p>
                  <p><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span><span className="font-medium">Deferrable</span> - Can be loaded after initial render (async/defer).</p>
                  <p><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5"></span><span className="font-medium">Removable</span> - No impact on content. Safe to remove or lazy-load.</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Crawler Advice</p>
                <div className="space-y-1.5">
                  <p><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span><span className="font-medium">Allow</span> - Let crawlers access this resource.</p>
                  <p><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span><span className="font-medium">Safe to Block</span> - Can be blocked in robots.txt without SEO impact.</p>
                  <p><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5"></span><span className="font-medium">Block Recommended</span> - Wastes crawl budget. Block it.</p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Why This Matters</p>
                <div className="space-y-1.5">
                  <p>AI bots (GPTBot, ClaudeBot, PerplexityBot) don't execute JS - they only see raw HTML.</p>
                  <p>Googlebot WRS executes JS but has a 2MB HTML crawl limit.</p>
                  <p>3rd-party JS wastes crawl budget and hurts Core Web Vitals.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function CrawlerSuggestions({ resources }: { resources: ResourceItem[] }) {
  const blockRecommended = resources.filter((r) => r.crawlerAdvice === 'block-recommended');
  const blockSafe = resources.filter((r) => r.crawlerAdvice === 'block-safe');

  if (blockRecommended.length === 0 && blockSafe.length === 0) return null;

  // Group by domain for robots.txt suggestions
  const domainMap = new Map<string, { paths: Set<string>; advice: string }>();
  for (const r of [...blockRecommended, ...blockSafe]) {
    try {
      const parsed = new URL(r.url);
      const domain = parsed.hostname;
      if (!domainMap.has(domain)) {
        domainMap.set(domain, { paths: new Set(), advice: r.crawlerAdvice });
      }
      domainMap.get(domain)!.paths.add(parsed.pathname);
    } catch {
      // skip invalid URLs
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Crawler Block Suggestions for robots.txt
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Add these rules to your robots.txt to save Googlebot crawl budget.
        AI bots don't execute JS anyway, so blocking JS files won't affect them.
      </p>

      <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-200 overflow-x-auto">
        <p className="text-gray-500"># === Resource Audit Suggestions ===</p>
        <p className="text-gray-500"># Block 3rd-party scripts that waste crawl budget</p>
        <br />
        <p className="text-green-400">User-agent: *</p>
        {Array.from(domainMap.entries()).map(([domain, data]) => (
          <div key={domain}>
            <p className="text-gray-500 mt-1"># {domain} ({data.advice === 'block-recommended' ? 'Recommended' : 'Safe to block'})</p>
            {Array.from(data.paths).slice(0, 3).map((path) => (
              <p key={path} className="text-yellow-300">Disallow: {path.startsWith('/') ? path : `/${path}`}</p>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Note: These are suggestions based on URL patterns. Test changes in Google Search Console before deploying.
        Blocking CSS files may cause rendering issues in Google's cached view.
      </p>
    </div>
  );
}
