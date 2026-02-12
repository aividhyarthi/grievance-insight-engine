export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                AEO Audit Tool
              </h1>
              <p className="text-xs text-gray-500">
                Answer Engine Optimization Auditor
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>AI Bot Checker</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>GEO Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
}
