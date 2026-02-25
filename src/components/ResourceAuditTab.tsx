import { useState, useCallback } from 'react';
import type { ResourceAuditResult, ResourceItem, ResourceVerdict } from '../../shared/types';
import { ScoreGauge } from './ScoreGauge';

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

// ===== Resource Health Score =====
function computeResourceScore(result: ResourceAuditResult): { score: number; grade: string } {
  let score = 100;
  const { summary, inlineResources, htmlSizeBytes, crawlBudgetLimit } = result;
  const total = summary.totalResources || 1;

  // Removable resources: -5 per removable (max -30)
  score -= Math.min(30, summary.removable * 5);

  // Deferrable render-blocking: count non-critical render-blocking resources, -4 each (max -20)
  const deferrableBlocking = result.resources.filter(
    (r) => r.renderBlocking && r.verdict !== 'critical'
  ).length;
  score -= Math.min(20, deferrableBlocking * 4);

  // 3rd-party ratio: if >60% of resources are 3rd-party, deduct up to -15
  const thirdPartyRatio = summary.thirdParty / total;
  if (thirdPartyRatio > 0.6) score -= Math.min(15, Math.round((thirdPartyRatio - 0.6) * 50));

  // Inline bloat: if inline JS+CSS > 200KB, deduct up to -10
  const inlineTotalKB = (inlineResources.inlineJsSizeBytes + inlineResources.inlineCssSizeBytes) / 1024;
  if (inlineTotalKB > 200) score -= Math.min(10, Math.round((inlineTotalKB - 200) / 50));

  // Crawl budget usage: if HTML > 70% of 2MB, deduct up to -15
  const budgetPercent = htmlSizeBytes / crawlBudgetLimit;
  if (budgetPercent > 0.7) score -= Math.min(15, Math.round((budgetPercent - 0.7) * 50));

  // Too many total resources: >40 = warning, >60 = bad
  if (total > 60) score -= 10;
  else if (total > 40) score -= 5;

  score = Math.max(0, Math.min(100, score));

  let grade: string;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';

  return { score, grade };
}

// ===== Priority Actions (plain-English, no jargon) =====
interface PriorityAction {
  priority: number;
  icon: string;
  title: string;
  description: string;
  impact: string;
  impactColor: string;
}

function getPriorityActions(result: ResourceAuditResult): PriorityAction[] {
  const actions: PriorityAction[] = [];
  const { summary, resources, inlineResources, htmlSizeBytes, crawlBudgetLimit } = result;

  // 1. Removable resources
  if (summary.removable > 0) {
    const removableLabels = [...new Set(resources.filter((r) => r.verdict === 'removable').map((r) => r.categoryLabel))];
    actions.push({
      priority: 1,
      icon: '🗑️',
      title: `Remove ${summary.removable} unnecessary script${summary.removable > 1 ? 's' : ''}`,
      description: `Your page loads ${removableLabels.join(', ')} that have zero impact on what visitors see. These only slow down your page.`,
      impact: 'High — directly improves page speed and Google ranking',
      impactColor: 'text-red-600',
    });
  }

  // 2. Render-blocking non-critical
  const blockingDeferrable = resources.filter((r) => r.renderBlocking && r.verdict !== 'critical');
  if (blockingDeferrable.length > 0) {
    actions.push({
      priority: 2,
      icon: '⚡',
      title: `Fix ${blockingDeferrable.length} render-blocking resource${blockingDeferrable.length > 1 ? 's' : ''}`,
      description: `${blockingDeferrable.length} script${blockingDeferrable.length > 1 ? 's' : ''} in your page header ${blockingDeferrable.length > 1 ? 'are' : 'is'} forcing the browser to wait before showing content. Adding "async" or "defer" lets the page paint faster.`,
      impact: 'High — directly improves Largest Contentful Paint (LCP)',
      impactColor: 'text-red-600',
    });
  }

  // 3. Heavy inline code
  const inlineTotalKB = (inlineResources.inlineJsSizeBytes + inlineResources.inlineCssSizeBytes) / 1024;
  if (inlineTotalKB > 200) {
    actions.push({
      priority: 3,
      icon: '📦',
      title: `Move ${Math.round(inlineTotalKB)}KB of inline code to external files`,
      description: `Large chunks of code are embedded directly in your HTML. This eats into Google's 2MB crawl limit and makes every page load transfer redundant code.`,
      impact: 'Medium — reduces HTML size and improves cacheability',
      impactColor: 'text-yellow-600',
    });
  }

  // 4. Too many 3rd-party scripts
  if (summary.thirdParty > summary.firstParty && summary.thirdParty > 5) {
    actions.push({
      priority: 4,
      icon: '🌐',
      title: `Audit ${summary.thirdParty} third-party scripts`,
      description: `Your page loads more third-party code (${summary.thirdParty}) than your own code (${summary.firstParty}). Each third-party script adds latency, privacy risk, and dependencies on external servers.`,
      impact: 'Medium — reduces security risk and improves reliability',
      impactColor: 'text-yellow-600',
    });
  }

  // 5. Crawl budget concern
  const budgetPercent = Math.round((htmlSizeBytes / crawlBudgetLimit) * 100);
  if (budgetPercent > 70) {
    actions.push({
      priority: 5,
      icon: '🕷️',
      title: `Reduce HTML size (${budgetPercent}% of Google's limit)`,
      description: `Your page HTML uses ${budgetPercent}% of Google's 2MB crawl budget. If it exceeds the limit, Google may not see all your content, which can hurt your search visibility.`,
      impact: budgetPercent > 90 ? 'High — risk of content being cut off by Google' : 'Medium — approaching Google crawl limit',
      impactColor: budgetPercent > 90 ? 'text-red-600' : 'text-yellow-600',
    });
  }

  // 6. Block wasteful resources for crawlers
  const blockRecommended = resources.filter((r) => r.crawlerAdvice === 'block-recommended').length;
  if (blockRecommended > 0) {
    actions.push({
      priority: 6,
      icon: '🤖',
      title: `Block ${blockRecommended} resource${blockRecommended > 1 ? 's' : ''} from search engine crawlers`,
      description: `Analytics, tracking, and ad scripts waste Googlebot's crawl budget. Block them in robots.txt so crawlers spend time on your actual content instead.`,
      impact: 'Medium — saves crawl budget for important pages',
      impactColor: 'text-yellow-600',
    });
  }

  // If nothing found, add a positive action
  if (actions.length === 0) {
    actions.push({
      priority: 1,
      icon: '✅',
      title: 'Your page resources look well-optimized',
      description: 'No major issues found. Your page loads efficiently with a good balance of first-party and third-party resources.',
      impact: 'No action needed',
      impactColor: 'text-green-600',
    });
  }

  return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

// ===== Executive Summary with plain-English sentences =====
function getExecutiveSummary(result: ResourceAuditResult, score: number): string[] {
  const lines: string[] = [];
  const { summary, resources } = result;

  // Line 1: Overall health
  if (score >= 80) {
    lines.push(`Your page loads ${summary.totalResources} resources efficiently. Resource management is strong — your site is well-positioned for fast loading and AI bot crawling.`);
  } else if (score >= 60) {
    lines.push(`Your page loads ${summary.totalResources} external resources. There are some optimization opportunities that could improve page speed and search engine visibility.`);
  } else {
    lines.push(`Your page loads ${summary.totalResources} external resources, and several are hurting your page speed and search visibility. Immediate action is recommended.`);
  }

  // Line 2: Biggest issue
  if (summary.removable > 0 && summary.removable >= summary.deferrable) {
    const removableNames = [...new Set(resources.filter((r) => r.verdict === 'removable').map((r) => r.categoryLabel))];
    lines.push(`${summary.removable} resource${summary.removable > 1 ? 's' : ''} (${removableNames.slice(0, 3).join(', ')}) can be removed entirely — ${summary.removable > 1 ? 'they don\'t' : 'it doesn\'t'} contribute to what visitors see on the page.`);
  } else if (summary.deferrable > 0) {
    lines.push(`${summary.deferrable} resource${summary.deferrable > 1 ? 's' : ''} can be deferred to load after the page content appears, which would make the page feel significantly faster to visitors.`);
  } else {
    lines.push(`All resources on this page are properly optimized. No unnecessary scripts or stylesheets were detected.`);
  }

  // Line 3: 3rd party insight
  if (summary.thirdParty > 0) {
    const thirdPct = Math.round((summary.thirdParty / (summary.totalResources || 1)) * 100);
    lines.push(`${thirdPct}% of resources come from third-party services. ${thirdPct > 50 ? 'This is high — each external service adds load time and risk of downtime impacting your site.' : 'This is a reasonable ratio of external dependencies.'}`);
  }

  return lines;
}

// ===== Executive Summary Panel Component =====
function ExecutiveSummary({ result }: { result: ResourceAuditResult }) {
  const { score, grade } = computeResourceScore(result);
  const summaryLines = getExecutiveSummary(result, score);
  const priorities = getPriorityActions(result);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Top: Score + Summary */}
      <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
        {/* Score Gauge */}
        <div className="flex-shrink-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center mb-2">Resource Health</p>
          <ScoreGauge score={score} grade={grade} size="lg" />
        </div>

        {/* Plain-English Summary */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Executive Summary</h3>
          <div className="space-y-2">
            {summaryLines.map((line, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
            ))}
          </div>

          {/* Quick stat chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              {result.summary.critical} Critical (Keep)
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
              {result.summary.deferrable} Deferrable
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
              {result.summary.removable} Removable
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {result.summary.renderBlocking} Render-Blocking
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Priority Actions */}
      <div className="border-t border-gray-100 bg-gray-50/50 p-6">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
          Top Priority Actions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorities.map((action, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{action.icon}</span>
                <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                  #{i + 1}
                </span>
              </div>
              <h5 className="text-sm font-semibold text-gray-900 mb-1">{action.title}</h5>
              <p className="text-xs text-gray-600 leading-relaxed flex-1">{action.description}</p>
              <p className={`text-xs font-medium mt-3 ${action.impactColor}`}>
                {action.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

function ResourceRow({ resource, index, forceExpand }: { resource: ResourceItem; index: number; forceExpand?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isExpanded = forceExpand || expanded;
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
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isExpanded && (
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

type InputMode = 'url' | 'code';
type FilterType = 'all' | 'js' | 'css';
type FilterParty = 'all' | '1st-party' | '3rd-party';
type FilterVerdict = 'all' | 'critical' | 'deferrable' | 'removable';

export function ResourceAuditTab() {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResourceAuditResult | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterParty, setFilterParty] = useState<FilterParty>('all');
  const [filterVerdict, setFilterVerdict] = useState<FilterVerdict>('all');
  const [printMode, setPrintMode] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleExportPDF = useCallback(() => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  }, []);

  const buildEmailBody = useCallback(() => {
    if (!result) return '';
    const { score, grade } = computeResourceScore(result);
    const summaryLines = getExecutiveSummary(result, score);
    const priorities = getPriorityActions(result);

    let body = `RESOURCE AUDIT REPORT\n`;
    body += `${'='.repeat(50)}\n\n`;
    body += `URL: ${result.url}\n`;
    body += `Date: ${new Date(result.fetchedAt).toLocaleString()}\n`;
    body += `Resource Health Score: ${score}/100 (${grade})\n`;
    body += `HTML Size: ${formatSize(result.htmlSizeBytes)}\n\n`;

    body += `EXECUTIVE SUMMARY\n${'-'.repeat(30)}\n`;
    summaryLines.forEach((line) => { body += `${line}\n\n`; });

    body += `OVERVIEW\n${'-'.repeat(30)}\n`;
    body += `Total Resources: ${result.summary.totalResources} (${result.summary.totalJs} JS + ${result.summary.totalCss} CSS)\n`;
    body += `First-Party: ${result.summary.firstParty} | Third-Party: ${result.summary.thirdParty}\n`;
    body += `Render-Blocking: ${result.summary.renderBlocking}\n`;
    body += `Critical (Keep): ${result.summary.critical} | Deferrable: ${result.summary.deferrable} | Removable: ${result.summary.removable}\n`;
    body += `Crawl Budget Used: ${Math.round((result.htmlSizeBytes / result.crawlBudgetLimit) * 100)}% of 2MB\n\n`;

    body += `TOP PRIORITY ACTIONS\n${'-'.repeat(30)}\n`;
    priorities.forEach((a, i) => {
      body += `${i + 1}. ${a.title}\n`;
      body += `   ${a.description}\n`;
      body += `   Impact: ${a.impact}\n\n`;
    });

    body += `ALL RESOURCES\n${'-'.repeat(30)}\n`;
    result.resources.forEach((r, i) => {
      body += `${i + 1}. [${r.type.toUpperCase()}] [${r.party}] [${r.verdict.toUpperCase()}] ${r.url}\n`;
      body += `   Category: ${r.categoryLabel} | Crawler: ${r.crawlerAdvice}\n`;
      if (r.renderBlocking) body += `   ⚠ Render-blocking\n`;
      body += `\n`;
    });

    // Crawler block suggestions
    const blockResources = result.resources.filter((r) => r.crawlerAdvice === 'block-recommended' || r.crawlerAdvice === 'block-safe');
    if (blockResources.length > 0) {
      body += `ROBOTS.TXT SUGGESTIONS\n${'-'.repeat(30)}\n`;
      body += `User-agent: *\n`;
      blockResources.forEach((r) => {
        try {
          const parsed = new URL(r.url);
          body += `Disallow: ${parsed.pathname} # ${r.crawlerAdvice}\n`;
        } catch { /* skip */ }
      });
      body += `\n`;
    }

    body += `${'='.repeat(50)}\n`;
    body += `Generated by Rudra Kasturi Inc - AEO Auditor, Resource Auditor & Insights\n`;

    return body;
  }, [result]);

  const openMailto = useCallback(() => {
    if (!result) return;
    const { score, grade } = computeResourceScore(result);
    const subject = encodeURIComponent(`Rudra Kasturi Inc | Resource Audit Report - ${result.url} (Score: ${score}/100, Grade: ${grade})`);
    const encodedBody = encodeURIComponent(buildEmailBody());
    const mailto = emailAddress
      ? `mailto:${emailAddress}?subject=${subject}&body=${encodedBody}`
      : `mailto:?subject=${subject}&body=${encodedBody}`;
    window.open(mailto, '_blank');
    setShowEmailModal(false);
  }, [emailAddress, result, buildEmailBody]);

  const handleSendEmail = useCallback(async () => {
    if (!emailAddress.trim() || !result) return;
    setEmailSending(true);
    try {
      const { score, grade } = computeResourceScore(result);
      const res = await fetch('/api/report/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailAddress,
          report: {
            url: result.url,
            overallScore: score,
            grade,
            fetchedAt: result.fetchedAt,
            textBody: buildEmailBody(),
          },
          type: 'resource-audit',
        }),
      });
      if (res.ok) {
        setEmailSent(true);
        setTimeout(() => { setShowEmailModal(false); setEmailSent(false); }, 2000);
      } else {
        openMailto();
      }
    } catch {
      openMailto();
    } finally {
      setEmailSending(false);
    }
  }, [emailAddress, result, buildEmailBody, openMailto]);

  const canSubmit = inputMode === 'url' ? url.trim().length > 0 : htmlCode.trim().length > 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let body: Record<string, string>;

      if (inputMode === 'url') {
        let finalUrl = url.trim();
        if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;
        body = { mode: 'url', url: finalUrl };
      } else {
        body = { mode: 'html', html: htmlCode };
        if (baseUrl.trim()) {
          let finalBase = baseUrl.trim();
          if (!finalBase.startsWith('http')) finalBase = `https://${finalBase}`;
          body.baseUrl = finalBase;
        }
      }

      const res = await fetch('/api/resource-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

        {/* Input mode toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-lg bg-gray-100 p-0.5">
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === 'url'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Enter URL
            </button>
            <button
              type="button"
              onClick={() => setInputMode('code')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === 'code'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Paste HTML Code
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 max-w-2xl mx-auto">
          {inputMode === 'url' ? (
            /* URL mode */
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
                disabled={loading || !canSubmit}
                className="px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl text-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md whitespace-nowrap"
              >
                {loading ? 'Scanning...' : 'Scan Resources'}
              </button>
            </div>
          ) : (
            /* Code paste mode */
            <div className="space-y-3 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Paste your page HTML source code
                </label>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder={"<!DOCTYPE html>\n<html>\n<head>\n  <script src=\"...\"></script>\n  <link rel=\"stylesheet\" href=\"...\">\n</head>\n<body>...</body>\n</html>"}
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-y"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Right-click on any page &rarr; "View Page Source" &rarr; Select All &rarr; Copy &rarr; Paste here
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <label className="block text-sm font-medium text-amber-800 mb-1.5">
                  Base URL <span className="text-amber-600 font-normal">(strongly recommended for accurate results)</span>
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g., https://example.com"
                  className="w-full px-4 py-3 border border-amber-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all bg-white"
                  disabled={loading}
                />
                <p className="mt-1.5 text-xs text-amber-600">
                  Without the base URL, relative paths can't be resolved and all resources may appear as 1st-party. We'll try to auto-detect from your HTML, but providing it ensures accuracy.
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl text-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {loading ? 'Scanning...' : 'Analyze HTML Code'}
              </button>
            </div>
          )}
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
          {/* HTML mode warning banner */}
          {result.inputMode === 'html' && (
            <div className={`rounded-xl border p-4 ${
              result.baseUrlSource === 'fallback'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">
                  {result.baseUrlSource === 'fallback' ? '⚠️' : 'ℹ️'}
                </span>
                <div>
                  <h4 className={`font-semibold ${
                    result.baseUrlSource === 'fallback' ? 'text-orange-800' : 'text-blue-800'
                  }`}>
                    {result.baseUrlSource === 'fallback'
                      ? 'Limited Analysis — No Base URL Detected'
                      : 'HTML Mode — Static Analysis Only'}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    result.baseUrlSource === 'fallback' ? 'text-orange-700' : 'text-blue-700'
                  }`}>
                    {result.baseUrlSource === 'fallback'
                      ? 'Could not detect the page\'s real domain. All resources are showing as 1st-party and relative URLs may not resolve correctly. For accurate results, provide the Base URL or use the "Enter URL" mode to fetch the live page.'
                      : result.baseUrlSource === 'auto-detected'
                      ? `Base URL auto-detected as "${result.url}" from the HTML. Resources loaded dynamically by JavaScript at runtime are not included — only what\'s in the raw HTML source. For a complete audit, use "Enter URL" mode.`
                      : `Using provided base URL. Note: Resources loaded dynamically by JavaScript at runtime are not included — only what\'s in the raw HTML source. For a complete audit, use "Enter URL" mode.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Resource Audit for</p>
                <h2 className="text-xl font-bold text-gray-900 break-all">{result.url}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(result.fetchedAt).toLocaleString()}
                  {result.inputMode === 'html' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      HTML paste mode
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">HTML Size</p>
                  <p className="text-2xl font-bold text-gray-900">{formatSize(result.htmlSizeBytes)}</p>
                </div>
                {/* Export Buttons */}
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    title="Export to PDF (Print)"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export PDF
                  </button>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-brand-300 text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                    title="Email Report"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Email Modal */}
          {showEmailModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Email Resource Audit Report</h3>
                {emailSent ? (
                  <div className="text-center py-4">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-700 font-medium">Report sent!</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="team@company.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowEmailModal(false)}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSending || !emailAddress.trim()}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50"
                      >
                        {emailSending ? 'Sending...' : 'Send Email'}
                      </button>
                      <button
                        onClick={openMailto}
                        className="px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg"
                        title="Open in email client"
                      >
                        Open in Mail
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Executive Summary — CXO-friendly */}
          <ExecutiveSummary result={result} />

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
            <div className={printMode ? '' : 'max-h-[600px] overflow-y-auto'}>
              {filteredResources.length > 0 ? (
                filteredResources.map((resource, i) => (
                  <ResourceRow key={resource.url + i} resource={resource} index={i} forceExpand={printMode} />
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
