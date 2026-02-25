interface Props {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to tools
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: February 2026</p>
      </div>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
          <p className="text-gray-600">
            Rudra Kasturi Inc, operating under AppStudioX Entertainment Pvt. Limited ("we," "our," or "us"),
            is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our AEO Audit Tool and related services (the "Service").
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
          <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">2.1 Information You Provide</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and password (stored in hashed form).</li>
            <li><strong>Audit Data:</strong> URLs you submit for auditing, competitor URLs, and any HTML content you paste for analysis.</li>
            <li><strong>Payment Information:</strong> If you subscribe to a paid plan, payment details are processed securely by Stripe. We do not store your credit card numbers.</li>
            <li><strong>Communications:</strong> Any messages you send to us via email or the chat assistant.</li>
          </ul>

          <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">2.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li><strong>Usage Data:</strong> Pages viewed, features used, audit frequency, and interaction patterns.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution.</li>
            <li><strong>Log Data:</strong> IP address, access times, and referring URLs.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>To provide, operate, and maintain the Service</li>
            <li>To process your audit requests and generate reports</li>
            <li>To manage your account and subscriptions</li>
            <li>To send you audit reports, notifications, and service updates</li>
            <li>To improve and personalize the Service</li>
            <li>To detect, prevent, and address technical issues or abuse</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Data Sharing & Disclosure</h2>
          <p className="text-gray-600">We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
            <li><strong>Service Providers:</strong> Stripe (payments), hosting providers, and email delivery services necessary to operate the Service.</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government request.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Security</h2>
          <p className="text-gray-600">
            We implement industry-standard security measures including HTTPS encryption, hashed passwords,
            secure API tokens, and regular security reviews. However, no method of electronic transmission
            or storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Data Retention</h2>
          <p className="text-gray-600">
            We retain your account information for as long as your account is active. Audit data is retained
            according to your plan tier (30 days for Starter, unlimited for Professional and Enterprise).
            You may request deletion of your account and associated data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your Rights</h2>
          <p className="text-gray-600">Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Cookies & Tracking</h2>
          <p className="text-gray-600">
            We use essential cookies for authentication and session management. We do not use third-party
            advertising cookies. Local storage is used to maintain your session and preferences.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Third-Party Websites</h2>
          <p className="text-gray-600">
            When you submit a URL for auditing, our Service fetches and analyzes publicly available content
            from that website. We do not collect data from users of those third-party websites. The audit
            process only accesses publicly available information similar to how search engine crawlers operate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Children's Privacy</h2>
          <p className="text-gray-600">
            Our Service is not directed to children under 13. We do not knowingly collect personal information
            from children. If you believe we have collected data from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of any material changes
            by posting the new policy on this page and updating the "Last updated" date. Your continued use
            of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Contact Us</h2>
          <p className="text-gray-600">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-2 bg-gray-50 rounded-lg p-4 text-gray-700">
            <p><strong>Rudra Kasturi Inc</strong></p>
            <p>AppStudioX Entertainment Pvt. Limited</p>
            <p className="mt-2">
              Email: <a href="mailto:contact@appstudiox.com" className="text-brand-600 hover:underline">contact@appstudiox.com</a>
            </p>
            <p>
              LinkedIn: <a href="https://linkedin.com/company/appstudiox-entertainment-pvt-limited/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">AppStudioX Entertainment Pvt. Limited</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
