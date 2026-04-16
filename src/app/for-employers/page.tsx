import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "For Employers",
  description:
    "Partner with HerMidlife to provide world-class midlife health support for your employees. Improve retention, wellbeing, and productivity.",
};

const offerings = [
  {
    title: "Midlife Health Programs",
    description:
      "Comprehensive employee wellness programs covering perimenopause, menopause, and midlife health — reducing absenteeism and improving retention.",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    title: "Expert Webinars & Workshops",
    description:
      "Engaging, evidence-based sessions led by specialist doctors — educating your workforce on midlife health and breaking stigma in the workplace.",
    icon: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  },
  {
    title: "Subscription Care Plans",
    description:
      "Give your team access to personalised, ongoing midlife care — telehealth consults, care coordination, medication delivery, and continuous support.",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
];

const outcomes = [
  {
    metric: "Retention",
    description:
      "Reduce turnover from midlife women leaving the workforce",
  },
  {
    metric: "Wellbeing",
    description:
      "Support employees through a critical, often-invisible health stage",
  },
  {
    metric: "Productivity",
    description:
      "Address the impact — 1 in 2 women say symptoms affect work",
  },
  {
    metric: "Culture",
    description:
      "Build a workplace that truly supports all stages of life",
  },
];

const stats = [
  { number: "1 in 2", label: "women say menopause symptoms affect their work" },
  { number: "$17B", label: "annual cost to Australian employers" },
  { number: "25%", label: "of women consider leaving work due to symptoms" },
  { number: "900K", label: "Australian women aged 45–55 in the workforce" },
];

export default function ForEmployersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-16 sm:pt-48 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[10%] w-40 h-40 rounded-full bg-sage/15 blur-2xl" />
          <div className="float-shape-reverse absolute top-32 right-[12%] w-52 h-52 rounded-full bg-lavender/15 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark mb-3">
            For Employers &amp; Partners
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Support the women
            <br />
            <span className="text-gradient-sage">in your workplace</span>
          </h1>
          <p className="mt-4 text-base font-semibold text-sage-dark italic">
            Australia is finally investing in Women&apos;s Health.
          </p>
          <p className="mt-4 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Partner with HerMidlife to provide world-class midlife health
            support for your employees. Improve retention, wellbeing, and
            productivity.
          </p>
        </div>
      </section>

      {/* The business case */}
      <section className="py-20 sm:py-28 bg-foreground text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(143,170,139,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(201,164,92,0.1),transparent_50%)]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-on-scroll text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-sage-light mb-3">
              The Business Case
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              Midlife health is a workforce issue
            </h2>
          </div>

          <div className="stagger-children grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div
                key={s.number}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm card-lift"
              >
                <div className="stat-glow text-3xl sm:text-4xl font-display font-bold text-sage-light mb-2">
                  {s.number}
                </div>
                <p className="text-sm text-white/60 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section className="py-20 sm:py-28 bg-sage-light/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark mb-3">
              What We Offer
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Tailored corporate wellness
            </h2>
          </div>

          <div className="stagger-children grid md:grid-cols-3 gap-6">
            {offerings.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-8 border border-sage/20 card-lift group"
              >
                <div className="w-14 h-14 rounded-2xl bg-sage/10 text-sage-dark flex items-center justify-center mb-6 group-hover:bg-sage-dark group-hover:text-white transition-colors">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sage/20 shadow-sm">
              <h3 className="font-display text-xl font-bold text-foreground mb-6 text-center">
                What partnership delivers
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {outcomes.map((item) => (
                  <div key={item.metric} className="flex items-start gap-3">
                    <span className="mt-1 w-6 h-6 rounded-full bg-sage-light flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <div>
                      <span className="font-semibold text-foreground">{item.metric}:</span>{" "}
                      <span className="text-foreground/60">{item.description}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <a
                  href="/contact?inquiry=corporate"
                  className="inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold text-white gradient-cta-sage hover:opacity-90 transition-opacity shadow-md"
                >
                  Partner With Us
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="animate-on-scroll mt-10 text-center">
            <p className="text-sm text-foreground/40 italic leading-relaxed">
              &ldquo;The Australian Government expects employers to provide
              appropriate support to employees experiencing symptoms of
              perimenopause and menopause.&rdquo;
            </p>
            <p className="mt-2 text-xs text-foreground/30 font-medium">
              — APS Circular 2025/02, Australian Public Service Commission
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
