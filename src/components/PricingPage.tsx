import { useAuth } from '../contexts/AuthContext';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

const CHECK_ICON = (
  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const DASH_ICON = (
  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

interface PlanTier {
  name: string;
  monthlyINR: string;
  monthlyUSD: string;
  annualINR: string;
  annualUSD: string;
  urlScans: string;
  highlight?: boolean;
  badge?: string;
  features: { text: string; included: boolean }[];
}

const PLANS: PlanTier[] = [
  {
    name: 'Starter',
    monthlyINR: '999',
    monthlyUSD: '12',
    annualINR: '799',
    annualUSD: '10',
    urlScans: '50 URL scans/month',
    features: [
      { text: 'AEO Audit (full)', included: true },
      { text: 'Resource Audit (full)', included: true },
      { text: 'HTML paste mode (unlimited)', included: true },
      { text: 'Score, actions & robots.txt suggestions', included: true },
      { text: 'PDF export & email reports', included: true },
      { text: 'Audit history (30 days)', included: true },
      { text: 'Competitor comparison (1 vs 1)', included: true },
      { text: 'Bulk URL scanning', included: false },
    ],
  },
  {
    name: 'Professional',
    monthlyINR: '2,999',
    monthlyUSD: '35',
    annualINR: '2,499',
    annualUSD: '29',
    urlScans: '300 URL scans/month',
    highlight: true,
    badge: 'Most Popular',
    features: [
      { text: 'AEO Audit (full + all industries)', included: true },
      { text: 'Resource Audit (full)', included: true },
      { text: 'HTML paste mode (unlimited)', included: true },
      { text: 'Score, actions & robots.txt suggestions', included: true },
      { text: 'PDF export & white-label reports', included: true },
      { text: 'Audit history (unlimited)', included: true },
      { text: 'Competitor comparison (1 vs 4)', included: true },
      { text: 'Bulk URL scanning (up to 25 sites)', included: true },
    ],
  },
  {
    name: 'Enterprise',
    monthlyINR: '7,999',
    monthlyUSD: '99',
    annualINR: '6,499',
    annualUSD: '79',
    urlScans: '2,000 URL scans/month',
    features: [
      { text: 'Everything in Professional', included: true },
      { text: 'Unlimited domains', included: true },
      { text: 'API access', included: true },
      { text: 'Team seats (5 users)', included: true },
      { text: 'Weekly monitoring & alerts', included: true },
      { text: 'Historical trend tracking', included: true },
      { text: 'Slack & email notifications', included: true },
      { text: 'Priority support', included: true },
    ],
  },
];

const PAYG_TIERS = [
  { range: '1 - 10 audits', inr: '49', usd: '0.60' },
  { range: '11 - 50 audits', inr: '39', usd: '0.45' },
  { range: '51 - 200 audits', inr: '29', usd: '0.35' },
  { range: '200+ audits', inr: '19', usd: '0.25' },
];

const REPORT_PACKAGES = [
  { name: 'Basic', urls: '5 pages', inr: '4,999', usd: '59', deliverable: 'PDF report + action items' },
  { name: 'Standard', urls: '25 pages', inr: '14,999', usd: '179', deliverable: 'PDF + robots.txt + priority fixes' },
  { name: 'Premium', urls: '100 pages', inr: '39,999', usd: '479', deliverable: 'Full site audit + implementation guide + 30-min call' },
];

export function PricingPage({ onLogin, onBack }: Props) {
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
        alert(data.error || 'Stripe is not configured. Contact admin.');
      }
    } catch {
      alert('Failed to start checkout.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to tools
      </button>

      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Every plan includes both AEO Audit and Resource Audit tools.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 flex flex-col ${
              plan.highlight
                ? 'border-brand-500 bg-brand-50/30 shadow-lg ring-2 ring-brand-500/20'
                : 'border-gray-200 bg-white shadow-sm'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold uppercase bg-brand-600 text-white rounded-full">
                {plan.badge}
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{plan.urlScans}</p>
            </div>

            {/* Price */}
            <div className="mb-1">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">${plan.monthlyUSD}</span>
                {plan.monthlyUSD !== '0' && <span className="text-sm text-gray-500">/mo</span>}
              </div>
              {plan.monthlyUSD !== '0' && (
                <p className="text-xs text-gray-400 mt-0.5">
                  or ${plan.annualUSD}/mo billed annually
                </p>
              )}
            </div>
            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-gray-600">INR {plan.monthlyINR}</span>
                {plan.monthlyINR !== '0' && <span className="text-xs text-gray-400">/mo</span>}
              </div>
              {plan.monthlyINR !== '0' && (
                <p className="text-xs text-gray-400">
                  or INR {plan.annualINR}/mo billed annually
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f.text} className="flex items-start gap-2 text-sm">
                  {f.included ? CHECK_ICON : DASH_ICON}
                  <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={user ? handleUpgrade : onLogin}
              className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                plan.highlight
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {user ? 'Get Started' : 'Sign Up & Get Started'}
            </button>
          </div>
        ))}
      </div>

      {/* Pay-As-You-Go */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pay-As-You-Go</h2>
          <p className="text-gray-600 mt-1">Don't need a subscription? Buy audit credits in bulk.</p>
        </div>
        <div className="max-w-lg mx-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">Volume</th>
                <th className="text-right py-2 font-semibold text-gray-700">INR/audit</th>
                <th className="text-right py-2 font-semibold text-gray-700">USD/audit</th>
              </tr>
            </thead>
            <tbody>
              {PAYG_TIERS.map((tier) => (
                <tr key={tier.range} className="border-b border-gray-100">
                  <td className="py-2.5 text-gray-700">{tier.range}</td>
                  <td className="py-2.5 text-right font-medium text-gray-900">INR {tier.inr}</td>
                  <td className="py-2.5 text-right font-medium text-gray-900">${tier.usd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* One-Time Audit Reports */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">One-Time Audit Reports</h2>
          <p className="text-gray-600 mt-1">Need a professional audit report delivered to you? We'll do the work.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REPORT_PACKAGES.map((pkg) => (
            <div key={pkg.name} className="rounded-xl border border-gray-200 p-5 text-center">
              <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{pkg.urls}</p>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">${pkg.usd}</p>
                <p className="text-sm text-gray-500">INR {pkg.inr}</p>
              </div>
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">{pkg.deliverable}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ / Trust */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-sm">
          <div>
            <p className="font-semibold text-gray-800 mb-1">What counts as a URL scan?</p>
            <p className="text-gray-600">Each time you enter a URL and click "Scan" or "Audit" counts as one scan. Pasting HTML code does not count against your limit.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Can I cancel anytime?</p>
            <p className="text-gray-600">Yes. All paid plans are month-to-month with no lock-in. Annual plans are billed upfront at a discounted rate.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Do you support Indian payment methods?</p>
            <p className="text-gray-600">Yes. We accept UPI, Indian debit/credit cards, net banking, and international cards via Stripe.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">What's included in both audits?</p>
            <p className="text-gray-600">AEO Audit checks AI bot access, structured data, and content quality. Resource Audit analyzes JS/CSS bloat, render-blocking, and crawl budget usage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
