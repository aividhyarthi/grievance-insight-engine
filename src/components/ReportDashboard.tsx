import { useState } from 'react';
import type { AuditReport, CategoryResult } from '../../shared/types';
import { ScoreGauge } from './ScoreGauge';
import { CategoryCard } from './CategoryCard';
import { CategoryDetail } from './CategoryDetail';
import { BotAccessTable } from './BotAccessTable';
import { SummaryBar } from './SummaryBar';

interface Props {
  report: AuditReport;
}

export function ReportDashboard({ report }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleCategoryClick = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  // Separate bot-access for special rendering
  const botAccessCategory = report.categories.find((c) => c.id === 'bot-access');
  const otherCategories = report.categories.filter((c) => c.id !== 'bot-access');

  return (
    <div className="mt-10 space-y-8">
      {/* Header with URL and timestamp */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Audit Report for</p>
            <h2 className="text-xl font-bold text-gray-900 break-all">
              {report.metadata.finalUrl || report.url}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {new Date(report.fetchedAt).toLocaleString()} | HTTP{' '}
              {report.metadata.statusCode} |{' '}
              {report.metadata.responseTime}ms response
            </p>
          </div>
          <ScoreGauge score={report.overallScore} grade={report.grade} size="lg" />
        </div>
      </div>

      {/* Summary Bar */}
      <SummaryBar summary={report.summary} />

      {/* AI Bot Access Section (special) */}
      {botAccessCategory && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{botAccessCategory.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {botAccessCategory.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Can AI bots crawl and index your content?
                  </p>
                </div>
              </div>
              <ScoreGauge
                score={botAccessCategory.score}
                grade=""
                size="sm"
              />
            </div>
          </div>
          <BotAccessTable findings={botAccessCategory.findings} />
          <CategoryDetail
            category={botAccessCategory}
            excludeBotFindings
          />
        </div>
      )}

      {/* Other Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherCategories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            expanded={expandedCategory === cat.id}
            onClick={() => handleCategoryClick(cat.id)}
          />
        ))}
      </div>

      {/* Expanded Category Detail */}
      {expandedCategory && (
        <CategoryDetailPanel
          category={otherCategories.find((c) => c.id === expandedCategory)!}
          onClose={() => setExpandedCategory(null)}
        />
      )}

      {/* Recommendations */}
      <RecommendationsPanel categories={report.categories} />
    </div>
  );
}

function CategoryDetailPanel({
  category,
  onClose,
}: {
  category: CategoryResult;
  onClose: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <CategoryDetail category={category} />
    </div>
  );
}

function RecommendationsPanel({
  categories,
}: {
  categories: CategoryResult[];
}) {
  const allFindings = categories.flatMap((c) => c.findings);
  const failures = allFindings.filter(
    (f) => f.severity === 'fail' && f.recommendation
  );
  const warnings = allFindings.filter(
    (f) => f.severity === 'warning' && f.recommendation
  );

  if (failures.length === 0 && warnings.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Recommendations
      </h3>

      {failures.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-3">
            Critical Issues ({failures.length})
          </h4>
          <div className="space-y-3">
            {failures.map((f) => (
              <div
                key={f.id}
                className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100"
              >
                <span className="text-red-500 mt-0.5 flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-red-800">{f.title}</p>
                  <p className="text-sm text-red-700 mt-1">
                    {f.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-3">
            Improvements ({warnings.length})
          </h4>
          <div className="space-y-3">
            {warnings.slice(0, 10).map((f) => (
              <div
                key={f.id}
                className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100"
              >
                <span className="text-yellow-500 mt-0.5 flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-medium text-yellow-800">{f.title}</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {f.recommendation}
                  </p>
                </div>
              </div>
            ))}
            {warnings.length > 10 && (
              <p className="text-sm text-gray-500 italic">
                +{warnings.length - 10} more improvements...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
