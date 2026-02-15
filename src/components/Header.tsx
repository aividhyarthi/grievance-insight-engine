import { useAuth } from '../contexts/AuthContext';

interface Props {
  onLoginClick?: () => void;
  onDashboardClick?: () => void;
  onLogoClick?: () => void;
}

export function Header({ onLoginClick, onDashboardClick, onLogoClick }: Props) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm print:shadow-none print:border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onLogoClick}>
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
          <div className="flex items-center space-x-4 print:hidden">
            {user ? (
              <>
                <button
                  onClick={onDashboardClick}
                  className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
                >
                  My Audits
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-brand-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 leading-tight">
                      {user.plan === 'pro' ? 'Pro' : 'Free'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
