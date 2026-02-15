import { useAuth } from '../contexts/AuthContext';

interface Props {
  reason: 'limit' | 'export';
  onClose: () => void;
  onLogin: () => void;
}

export function UpgradePrompt({ reason, onClose, onLogin }: Props) {
  const { user, token } = useAuth();

  const handleUpgrade = async () => {
    if (!token) {
      onLogin();
      return;
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Stripe is not configured. Contact the admin.');
      }
    } catch {
      alert('Failed to start checkout.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 text-center">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {reason === 'limit' ? (
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {reason === 'limit' ? 'Daily Limit Reached' : 'Pro Feature'}
        </h3>
        <p className="text-gray-600 mb-6">
          {reason === 'limit'
            ? 'You\'ve used all 3 free audits for today. Upgrade to Pro for unlimited audits.'
            : 'PDF export and email reports are available on the Pro plan.'}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <h4 className="font-semibold text-gray-900 mb-3">Pro Plan - $29/month</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Unlimited audits per day
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              PDF export & email reports
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Full audit history & comparison
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              All industry-specific checks
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={user ? handleUpgrade : onLogin}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
          >
            {user ? 'Upgrade to Pro' : 'Sign Up & Upgrade'}
          </button>
        </div>
      </div>
    </div>
  );
}
