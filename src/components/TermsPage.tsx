interface Props {
  onBack: () => void;
}

export function TermsPage({ onBack }: Props) {
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
        <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: February 2026</p>
      </div>

      <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing or using the AEO Audit Tool and related services ("Service") operated by Rudra Kasturi Inc,
            under AppStudioX Entertainment Pvt. Limited ("Company," "we," "our"), you agree to be bound by these
            Terms & Conditions ("Terms"). If you do not agree to these Terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Description of Service</h2>
          <p className="text-gray-600">
            The Service provides AI Answer Engine Optimization (AEO) auditing tools that analyze websites for
            compatibility with AI-powered answer engines including Google AI Overviews, ChatGPT, Claude, Perplexity,
            and others. Features include:
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
            <li>AEO Audit — analysis of AI bot access, content quality, structured data, and more</li>
            <li>Resource Audit — technical analysis of JS/CSS resources, third-party dependencies, and performance</li>
            <li>Competitor Comparison — side-by-side audit reports</li>
            <li>PDF Export & Email Reports — downloadable and shareable audit reports</li>
            <li>AI Strategy Chat Assistant — conversational support for AEO strategy questions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. User Accounts</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>You must provide accurate and complete information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activities that occur under your account.</li>
            <li>You must notify us immediately of any unauthorized use of your account.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Subscriptions & Payment</h2>
          <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">4.1 Paid Plans</h3>
          <p className="text-gray-600">
            Paid subscriptions (Starter, Professional, Enterprise) are billed on a monthly or annual basis.
            All payments are processed securely through Stripe. Prices are listed in both USD and INR.
          </p>

          <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">4.2 Pay-As-You-Go</h3>
          <p className="text-gray-600">
            Pay-As-You-Go credits are non-refundable and do not expire. Volume discounts are applied
            automatically based on the number of credits purchased.
          </p>

          <h3 className="text-base font-medium text-gray-800 mt-3 mb-1">4.3 Cancellation & Refunds</h3>
          <p className="text-gray-600">
            You may cancel your subscription at any time through your account settings or the Stripe billing portal.
            Monthly subscriptions can be cancelled with no lock-in. Annual subscriptions are billed upfront;
            cancellation takes effect at the end of the current billing period. Refunds for annual plans are
            handled on a case-by-case basis. Contact us at contact@appstudiox.com for refund requests.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Acceptable Use</h2>
          <p className="text-gray-600">You agree not to:</p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Submit URLs for the purpose of attacking, exploiting, or disrupting third-party websites</li>
            <li>Use automated scripts or bots to excessively access the Service beyond your plan limits</li>
            <li>Reverse-engineer, decompile, or attempt to extract source code from the Service</li>
            <li>Resell, sublicense, or commercially redistribute the Service or audit reports without our written permission</li>
            <li>Circumvent or attempt to circumvent usage limits, authentication, or security measures</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Intellectual Property</h2>
          <p className="text-gray-600">
            The Service, including its design, features, code, audit methodologies, scoring algorithms, and branding,
            is the intellectual property of Rudra Kasturi Inc / AppStudioX Entertainment Pvt. Limited. You may not
            copy, modify, or distribute any part of the Service without our written consent.
          </p>
          <p className="text-gray-600 mt-2">
            Audit reports generated for your websites are yours to use for internal purposes and may be shared
            with your team or clients. White-label reports (available on Professional and Enterprise plans) may
            be used for client-facing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Audit Data & Accuracy</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li>Audit results are based on publicly available website data at the time of scanning.</li>
            <li>Scores and recommendations are generated using automated analysis and may not capture every nuance of your website.</li>
            <li>We do not guarantee specific search rankings, AI citation rates, or traffic outcomes from implementing audit recommendations.</li>
            <li>Audit data is provided "as-is" for informational purposes and should be used as guidance alongside professional SEO/AEO expertise.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. One-Time Audit Reports</h2>
          <p className="text-gray-600">
            One-Time Audit Reports (Basic, Standard, Premium) are delivered as professional PDF reports.
            Delivery timelines vary by package complexity. The Premium package includes a 30-minute consultation call.
            Deliverables are as described on the pricing page at the time of purchase.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Limitation of Liability</h2>
          <p className="text-gray-600">
            To the maximum extent permitted by applicable law, Rudra Kasturi Inc / AppStudioX Entertainment Pvt. Limited
            shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but
            not limited to loss of profits, data, business opportunities, or goodwill, arising out of or in connection
            with your use of the Service.
          </p>
          <p className="text-gray-600 mt-2">
            Our total liability for any claims arising from or related to the Service shall not exceed the amount
            you paid to us in the twelve (12) months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Disclaimer of Warranties</h2>
          <p className="text-gray-600">
            The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.
            We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.
            We make no guarantees regarding the accuracy, reliability, or completeness of audit results.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Indemnification</h2>
          <p className="text-gray-600">
            You agree to indemnify and hold harmless Rudra Kasturi Inc, AppStudioX Entertainment Pvt. Limited,
            and their officers, directors, employees, and agents from any claims, damages, losses, or expenses
            (including legal fees) arising from your use of the Service, violation of these Terms, or infringement
            of any third-party rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Modifications to Terms</h2>
          <p className="text-gray-600">
            We reserve the right to modify these Terms at any time. Material changes will be communicated via
            email or a notice within the Service. Your continued use of the Service after such changes constitutes
            acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Governing Law</h2>
          <p className="text-gray-600">
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes
            arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction
            of the courts in Hyderabad, Telangana, India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">14. Severability</h2>
          <p className="text-gray-600">
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited
            or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">15. Contact Us</h2>
          <p className="text-gray-600">
            For questions about these Terms & Conditions, please contact us at:
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
