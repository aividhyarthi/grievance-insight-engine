import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — HerMidlife",
  description:
    "How HerMidlife collects, uses, stores, and protects personal information — aligned with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).",
};

const lastUpdated = "15 April 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="gradient-hero pt-40 pb-16 sm:pt-48 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[10%] w-40 h-40 rounded-full bg-rose/10 blur-2xl" />
          <div className="float-shape-reverse absolute top-32 right-[12%] w-52 h-52 rounded-full bg-lavender/15 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Legal
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg text-foreground/60 max-w-2xl leading-relaxed">
            HerMidlife is committed to protecting your privacy. This policy explains how
            we collect, use, store, and disclose your personal information — aligned
            with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth).
          </p>
          <p className="mt-4 text-sm text-foreground/40">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-5 bg-gold-light/40 border border-gold/30 text-sm text-foreground/70 leading-relaxed mb-12">
            <strong className="text-foreground">Draft — pending legal review.</strong>{" "}
            This policy is provided in good faith and follows Australian Privacy
            Principles, but should be reviewed by qualified Australian legal counsel
            before being relied upon as a final legal instrument.
          </div>

          <div className="prose-custom space-y-10">
            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                1. Who we are
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                HerMidlife (&quot;HerMidlife&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is
                a digital women&apos;s health platform based in Melbourne, Australia. We
                provide education, clinical consultations, and continuous support to
                women navigating perimenopause, menopause, and midlife health. This
                Privacy Policy applies to all information we collect through{" "}
                <a href="https://www.hermidlife.org" className="text-plum underline">
                  www.hermidlife.org
                </a>
                , our sub-domains, forms, events, and related services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                2. What information we collect
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                We collect only the personal information we need to provide our
                services. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/75">
                <li>
                  <strong>Identity information:</strong> your name and contact details
                  (email address, phone number) when you contact us, register for an
                  event, or create an account.
                </li>
                <li>
                  <strong>Health information:</strong> where relevant to a clinical
                  consultation, information you voluntarily share about your symptoms,
                  medical history, medications, and lifestyle. This is considered
                  &quot;sensitive information&quot; under Australian law and is handled
                  with additional protection.
                </li>
                <li>
                  <strong>Usage information:</strong> technical data about your
                  interaction with our website — such as IP address, browser type,
                  pages visited, and referral source — collected via standard analytics
                  tools.
                </li>
                <li>
                  <strong>Communications:</strong> the content of emails, forms, and
                  messages you send to us.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                3. How we collect information
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                We collect personal information directly from you — for example, when
                you submit a contact form, email us, register for an event, book a
                consultation, or engage with our education content. We also collect
                limited technical information automatically through cookies and
                analytics services when you browse our website.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                4. Why we collect information
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                We collect personal information for the primary purposes of:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/75">
                <li>Responding to your enquiries and providing requested services</li>
                <li>Delivering clinical consultations and personalised care</li>
                <li>Sending you information about events, care, and education you have opted into</li>
                <li>Improving our website, services, and content</li>
                <li>Meeting our legal, regulatory, and clinical record-keeping obligations</li>
              </ul>
              <p className="mt-4 text-foreground/75 leading-relaxed">
                We will not use your personal information for any secondary purpose
                unless you would reasonably expect it, you have consented, or it is
                required or authorised by law.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                5. How we store and protect information
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                We store personal information on secure systems protected by reasonable
                technical and organisational safeguards, including encryption in
                transit, access controls, and regular security reviews. Health
                information is handled with additional protection and access is
                restricted to clinicians and authorised staff on a need-to-know basis.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                6. Disclosure to third parties
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                We do not sell, rent, or trade your personal information. We may
                disclose information to trusted service providers that help us operate
                our platform — for example, email delivery, website hosting (Railway),
                analytics, calendar and booking tools, and payment processors — under
                contractual confidentiality obligations. We may also disclose
                information where required by law or in response to a valid legal
                process.
              </p>
              <p className="text-foreground/75 leading-relaxed">
                Some of our service providers may be located outside Australia. Where
                this occurs, we take reasonable steps to ensure those providers handle
                your information in accordance with the APPs or equivalent standards.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                7. Cookies and analytics
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                Our website uses cookies and analytics tools to understand how visitors
                use the site, improve performance, and measure the effectiveness of
                our content. These tools collect de-identified usage data. You can
                disable cookies in your browser settings; some site features may not
                work correctly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                8. Your rights
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                Under Australian privacy law, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/75">
                <li>Request access to the personal information we hold about you</li>
                <li>Request correction of inaccurate or outdated information</li>
                <li>Withdraw consent to marketing communications at any time</li>
                <li>Lodge a complaint about how we handle your information</li>
              </ul>
              <p className="mt-4 text-foreground/75 leading-relaxed">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:listen@hermidlife.org"
                  className="text-plum font-semibold underline"
                >
                  listen@hermidlife.org
                </a>
                . We will respond within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                9. Data retention
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                We retain personal information only for as long as needed to provide
                our services, comply with our legal and clinical record-keeping
                obligations, and resolve disputes. When information is no longer
                needed, we take reasonable steps to destroy or de-identify it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                10. Changes to this policy
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                We may update this Privacy Policy from time to time. The current
                version will always be available on this page, with the &quot;Last
                updated&quot; date clearly shown. Significant changes will be
                communicated via email where appropriate.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                11. Contact us
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                If you have questions, concerns, or a complaint about how we handle
                your personal information, please contact us at{" "}
                <a
                  href="mailto:listen@hermidlife.org"
                  className="text-plum font-semibold underline"
                >
                  listen@hermidlife.org
                </a>
                . If you are not satisfied with our response, you may lodge a complaint
                with the Office of the Australian Information Commissioner (OAIC) at{" "}
                <a
                  href="https://www.oaic.gov.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-plum font-semibold underline"
                >
                  www.oaic.gov.au
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
