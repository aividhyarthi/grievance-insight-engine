import { useState } from 'react';

interface Props {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function AuditForm({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = url.trim();
    if (finalUrl && !finalUrl.startsWith('http')) {
      finalUrl = `https://${finalUrl}`;
    }
    if (finalUrl) {
      onSubmit(finalUrl);
    }
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
        className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3"
      >
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
            placeholder="Enter website URL (e.g., example.com)"
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
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
        {[
          'AI Bot Access',
          'Content Quality',
          'Schema Markup',
          'Technical SEO',
          'E-E-A-T Signals',
          'Meta Tags',
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
