import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — HerMidlife",
  description:
    "The terms that govern your use of the HerMidlife website, educational content, and services. Includes important medical disclaimers and limitation of liability.",
};

const lastUpdated = "15 April 2026";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="mt-6 text-lg text-foreground/60 max-w-2xl leading-relaxed">
            These terms govern your use of the HerMidlife website, educational content,
            and services. Please read them carefully — they include important medical
            and legal disclaimers.
          </p>
          <p className="mt-4 text-sm text-foreground/40">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-5 bg-gold-light/40 border border-gold/30 text-sm text-foreground/70 leading-relaxed mb-12">
            <strong className="text-foreground">Draft — pending legal review.</strong>{" "}
            These terms are provided in good faith as a starting framework and should
            be reviewed by qualified Australian legal counsel before being relied upon
            as a final legal instrument.
          </div>

          <div className="rounded-2xl p-5 bg-rose/10 border border-rose-light text-sm text-foreground/80 leading-relaxed mb-12">
            <strong className="text-rose-dark">Important medical notice.</strong>{" "}
            HerMidlife is not an emergency service. If you are experiencing a medical
            emergency, please call <strong>000</strong> immediately or go to your
            nearest hospital.
          </div>

          <div className="space-y-10">
            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                1. Acceptance of terms
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                By accessing or using the HerMidlife website (
                <a href="https://www.hermidlife.org" className="text-plum underline">
                  www.hermidlife.org
                </a>
                ) or any of our services, you agree to be bound by these Terms of
                Service. If you do not agree with any part of these terms, please do
                not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                2. About HerMidlife
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                HerMidlife is a digital women&apos;s health platform providing
                education, clinical consultations, and continuous support to women
                navigating perimenopause, menopause, and midlife health in Australia.
                We connect you with qualified clinicians and provide educational
                resources informed by current medical evidence.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                3. Medical disclaimer
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                The information provided on the HerMidlife website, including articles,
                videos, events, and other educational content, is for{" "}
                <strong>general informational purposes only</strong>. It is not
                intended as a substitute for professional medical advice, diagnosis,
                or treatment.
              </p>
              <p className="text-foreground/75 leading-relaxed mb-4">
                Always seek the advice of a qualified healthcare professional
                regarding any medical condition or treatment options. Never disregard
                professional medical advice or delay seeking it because of something
                you have read on our website.
              </p>
              <p className="text-foreground/75 leading-relaxed">
                Clinical consultations conducted via HerMidlife are provided by
                qualified clinicians who are solely responsible for the care they
                deliver. HerMidlife does not itself provide medical advice; we
                facilitate access to it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                4. Eligibility
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                You must be at least 18 years of age to create an account or book
                clinical consultations through HerMidlife. By using our services, you
                represent that you meet this requirement and that any information you
                provide is true, accurate, current, and complete.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                5. Your account and responsibilities
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                You are responsible for maintaining the confidentiality of any account
                credentials you create with HerMidlife and for all activities that
                occur under your account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/75">
                <li>Provide accurate, current, and complete information</li>
                <li>Update your information as needed to keep it accurate</li>
                <li>Notify us immediately of any unauthorised use of your account</li>
                <li>Use our services lawfully and respectfully</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                6. Intellectual property
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                All content on the HerMidlife website — including text, graphics,
                logos, images, audio, video, and software — is owned by HerMidlife or
                its licensors and is protected by Australian and international
                copyright, trademark, and other intellectual property laws. You may
                access and use this content for personal, non-commercial purposes
                only. Any other use requires our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                7. User conduct
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                When using HerMidlife services, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/75">
                <li>Use our services for any unlawful purpose</li>
                <li>Interfere with, disrupt, or compromise the integrity or security of our website</li>
                <li>Attempt to gain unauthorised access to any part of our platform</li>
                <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                <li>Upload viruses, malicious code, or harmful content</li>
                <li>Harass, abuse, or harm our staff, clinicians, or other users</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                8. Third-party links and services
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                Our website may contain links to third-party websites or services
                (including Eventbrite, Google Maps, and other integrations) that are
                not owned or controlled by HerMidlife. We are not responsible for the
                content, privacy policies, or practices of any third-party websites or
                services. You access them at your own risk.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                9. Limitation of liability
              </h2>
              <p className="text-foreground/75 leading-relaxed mb-4">
                To the maximum extent permitted by Australian Consumer Law, HerMidlife
                and its founders, employees, contractors, and affiliates shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising out of or in connection with your use of our
                services.
              </p>
              <p className="text-foreground/75 leading-relaxed">
                Nothing in these terms excludes, restricts, or modifies any
                consumer guarantee, right, or remedy conferred on you by the
                Australian Consumer Law that cannot lawfully be excluded, restricted,
                or modified.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                10. Indemnity
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                You agree to indemnify and hold HerMidlife harmless from any claims,
                losses, damages, or expenses (including reasonable legal fees) arising
                out of your breach of these terms, your misuse of our services, or
                your violation of any rights of another party.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                11. Termination
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                We may suspend or terminate your access to our services at any time,
                with or without notice, for any reason — including if we believe you
                have violated these terms. You may also stop using our services at
                any time.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                12. Changes to these terms
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                We may update these Terms of Service from time to time. The current
                version will always be available on this page, with the &quot;Last
                updated&quot; date clearly shown. Your continued use of our services
                after changes are posted constitutes your acceptance of the updated
                terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                13. Governing law
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                These Terms of Service are governed by the laws of Victoria, Australia.
                Any disputes arising out of or in connection with these terms will be
                subject to the exclusive jurisdiction of the courts of Victoria.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                14. Contact us
              </h2>
              <p className="text-foreground/75 leading-relaxed">
                If you have questions about these Terms of Service, please contact us
                at{" "}
                <a
                  href="mailto:listen@hermidlife.org"
                  className="text-plum font-semibold underline"
                >
                  listen@hermidlife.org
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
