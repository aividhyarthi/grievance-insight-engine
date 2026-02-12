interface Props {
  summary: {
    totalFindings: number;
    passes: number;
    warnings: number;
    failures: number;
    infos: number;
  };
}

export function SummaryBar({ summary }: Props) {
  const total = summary.passes + summary.warnings + summary.failures;
  const passPercent = total > 0 ? (summary.passes / total) * 100 : 0;
  const warnPercent = total > 0 ? (summary.warnings / total) * 100 : 0;
  const failPercent = total > 0 ? (summary.failures / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Audit Summary
        </h3>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">
              <span className="font-bold text-green-600">{summary.passes}</span>{' '}
              Passed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">
              <span className="font-bold text-yellow-600">
                {summary.warnings}
              </span>{' '}
              Warnings
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">
              <span className="font-bold text-red-600">{summary.failures}</span>{' '}
              Failed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-gray-600">
              <span className="font-bold text-blue-600">{summary.infos}</span>{' '}
              Info
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Bar */}
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
        {passPercent > 0 && (
          <div
            className="bg-green-500 h-full transition-all duration-700"
            style={{ width: `${passPercent}%` }}
          />
        )}
        {warnPercent > 0 && (
          <div
            className="bg-yellow-500 h-full transition-all duration-700"
            style={{ width: `${warnPercent}%` }}
          />
        )}
        {failPercent > 0 && (
          <div
            className="bg-red-500 h-full transition-all duration-700"
            style={{ width: `${failPercent}%` }}
          />
        )}
      </div>

      <p className="mt-3 text-sm text-gray-500">
        {summary.totalFindings} total checks across all categories
      </p>
    </div>
  );
}
