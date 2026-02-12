import type { CategoryResult } from '../../shared/types';
import { ScoreGauge } from './ScoreGauge';

interface Props {
  category: CategoryResult;
  expanded: boolean;
  onClick: () => void;
}

function getSeverityCounts(category: CategoryResult) {
  const counts = { pass: 0, warning: 0, fail: 0, info: 0 };
  category.findings.forEach((f) => {
    counts[f.severity]++;
  });
  return counts;
}

export function CategoryCard({ category, expanded, onClick }: Props) {
  const counts = getSeverityCounts(category);

  return (
    <div
      className={`category-card ${expanded ? 'ring-2 ring-brand-500 border-brand-400' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {category.findings.length} checks
            </p>
          </div>
        </div>
        <ScoreGauge score={category.score} grade="" size="sm" />
      </div>

      <div className="mt-4 flex items-center space-x-3 text-xs">
        {counts.pass > 0 && (
          <span className="flex items-center space-x-1 text-green-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{counts.pass} passed</span>
          </span>
        )}
        {counts.warning > 0 && (
          <span className="flex items-center space-x-1 text-yellow-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{counts.warning}</span>
          </span>
        )}
        {counts.fail > 0 && (
          <span className="flex items-center space-x-1 text-red-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{counts.fail}</span>
          </span>
        )}
        {counts.info > 0 && (
          <span className="flex items-center space-x-1 text-blue-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>{counts.info}</span>
          </span>
        )}
      </div>

      <div className="mt-3 text-xs text-brand-600 font-medium">
        {expanded ? 'Click to collapse' : 'Click to expand details'}
      </div>
    </div>
  );
}
