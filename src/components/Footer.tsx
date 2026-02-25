interface Props {
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
}

const EMAILS = [
  { label: 'AI & Product', email: 'ai@appstudiox.com' },
  { label: 'AEO Strategy', email: 'aeo@appstudiox.com' },
  { label: 'SEO', email: 'seo@appstudiox.com' },
  { label: 'Social Media', email: 'social@appstudiox.com' },
  { label: 'Growth Strategy', email: 'strategy@appstudiox.com' },
  { label: 'General', email: 'contact@appstudiox.com' },
];

export function Footer({ onPrivacyClick, onTermsClick }: Props) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 print:bg-white print:text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">Rudra Kasturi Inc</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              AEO Auditor, Resource Auditor & Insights. Optimizing websites for AI Answer Engines — Google AI Overviews, ChatGPT, Claude, Perplexity & more.
            </p>
            <p className="text-xs text-gray-500">
              An initiative by AI Vidhyarthi — India's first student-led AI literacy initiative.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Get In Touch</h4>
            <div className="space-y-2">
              {EMAILS.map((item) => (
                <div key={item.email} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <div>
                    <span className="text-gray-500 text-xs block">{item.label}</span>
                    <a href={`mailto:${item.email}`} className="text-gray-300 hover:text-white transition-colors">
                      {item.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Connect</h4>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/appstudiox-entertainment-pvt-limited/?originalSubdomain=in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors mb-6"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              AppStudioX Entertainment Pvt. Limited
            </a>

            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3 mt-6">Legal</h4>
            <div className="space-y-2">
              <button
                onClick={onPrivacyClick}
                className="block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={onTermsClick}
                className="block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Rudra Kasturi Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Checks: Google AI Overviews, ChatGPT, Claude, Perplexity & more
          </p>
        </div>
      </div>
    </footer>
  );
}
