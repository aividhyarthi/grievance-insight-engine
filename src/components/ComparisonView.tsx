import type { AuditReport } from '../../shared/types';
import { ScoreGauge } from './ScoreGauge';

interface Props {
  report: AuditReport;
  onSelectSite?: (index: number) => void;
  activeTab?: number;
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50';
  if (score >= 60) return 'bg-yellow-50';
  if (score >= 40) return 'bg-orange-50';
  return 'bg-red-50';
}

function diffBadge(main: number, comp: number) {
  const diff = main - comp;
  if (diff === 0) return <span className="text-xs text-gray-400">tie</span>;
  if (diff > 0)
    return <span className="text-xs font-semibold text-green-600">+{diff}</span>;
  return <span className="text-xs font-semibold text-red-600">{diff}</span>;
}

export function ComparisonView({ report, onSelectSite, activeTab = 0 }: Props) {
  const competitors = report.competitors || [];
  if (competitors.length === 0) return null;

  const allSites = [report, ...competitors];

  // Gather all unique category IDs across all reports
  const categoryMap = new Map<string, { name: string; icon: string }>();
  for (const site of allSites) {
    for (const cat of site.categories) {
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, { name: cat.name, icon: cat.icon });
      }
    }
  }

  return (
    <div className="mt-10 space-y-6">
      {/* Comparison Header */}
      <div className="bg-gradient-to-r from-brand-50 to-indigo-50 rounded-xl border border-brand-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Competitor Comparison
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Side-by-side AEO scores — click any site to see its full report below
        </p>

        {/* Overall scores row — clickable */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${allSites.length}, minmax(0, 1fr))` }}>
          {allSites.map((site, i) => {
            const host = getHostname(site.url);
            const isMain = i === 0;
            const isActive = i === activeTab;
            return (
              <button
                key={site.url}
                onClick={() => onSelectSite?.(i)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? 'border-brand-500 bg-white shadow-md ring-2 ring-brand-200'
                    : isMain
                      ? 'border-brand-300 bg-white shadow-sm hover:shadow-md hover:border-brand-400'
                      : 'border-gray-200 bg-white/70 hover:shadow-md hover:border-gray-300'
                }`}
              >
                {isMain && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full mb-2">
                    Your Site
                  </span>
                )}
                <ScoreGauge score={site.overallScore} grade={site.grade} size="lg" />
                <p className="mt-3 text-sm font-semibold text-gray-900 text-center break-all">
                  {host}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {site.summary.passes} passed, {site.summary.failures} failed
                </p>
                {isActive && (
                  <span className="mt-2 text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Viewing details
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category-by-category comparison table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h4 className="font-bold text-gray-900">Score Breakdown by Category</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-semibold text-gray-700">Category</th>
                {allSites.map((site, i) => (
                  <th
                    key={site.url}
                    className={`text-center px-4 py-3 font-semibold cursor-pointer hover:bg-gray-100 transition-colors ${
                      i === activeTab ? 'bg-brand-50/50 text-brand-700' : 'text-gray-700'
                    }`}
                    onClick={() => onSelectSite?.(i)}
                  >
                    {i === 0 ? (
                      <span className="text-brand-600">{getHostname(site.url)}</span>
                    ) : (
                      getHostname(site.url)
                    )}
                    {i === activeTab && (
                      <div className="w-1 h-1 bg-brand-500 rounded-full mx-auto mt-1" />
                    )}
                  </th>
                ))}
                {competitors.length === 1 && (
                  <th className="text-center px-4 py-3 font-semibold text-gray-500">Diff</th>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Overall row */}
              <tr className="border-b border-gray-100 bg-gray-50/50 font-semibold">
                <td className="px-6 py-3 text-gray-900">Overall Score</td>
                {allSites.map((site, i) => (
                  <td
                    key={site.url}
                    className={`text-center px-4 py-3 cursor-pointer ${scoreColor(site.overallScore)} ${
                      i === activeTab ? 'bg-brand-50/30' : ''
                    }`}
                    onClick={() => onSelectSite?.(i)}
                  >
                    {site.overallScore}
                    <span className="text-gray-400 font-normal text-xs ml-1">({site.grade})</span>
                  </td>
                ))}
                {competitors.length === 1 && (
                  <td className="text-center px-4 py-3">
                    {diffBadge(report.overallScore, competitors[0].overallScore)}
                  </td>
                )}
              </tr>

              {/* Category rows */}
              {Array.from(categoryMap.entries()).map(([catId, info]) => {
                const scores = allSites.map((site) => {
                  const cat = site.categories.find((c) => c.id === catId);
                  return cat?.score ?? null;
                });

                return (
                  <tr key={catId} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-gray-700">
                      <span className="mr-2">{info.icon}</span>
                      {info.name}
                    </td>
                    {scores.map((score, i) => (
                      <td
                        key={i}
                        className={`text-center px-4 py-3 cursor-pointer ${
                          i === activeTab ? 'bg-brand-50/30' : ''
                        }`}
                        onClick={() => onSelectSite?.(i)}
                      >
                        {score !== null ? (
                          <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${scoreBg(score)} ${scoreColor(score)}`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-gray-300">--</span>
                        )}
                      </td>
                    ))}
                    {competitors.length === 1 && (
                      <td className="text-center px-4 py-3">
                        {scores[0] !== null && scores[1] !== null
                          ? diffBadge(scores[0], scores[1])
                          : <span className="text-gray-300">--</span>
                        }
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
