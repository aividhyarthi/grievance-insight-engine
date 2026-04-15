import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Investors — HerMidlife",
  description:
    "HerMidlife is Australia's first fully integrated platform for midlife women's care, launching 30 May 2026. A $793M government tailwind, 3.4M underserved women, and a doctor-led team building the category leader.",
};

const marketStats = [
  {
    number: "3.4M",
    label: "TAM — Australian Women",
    description: "Currently in perimenopause or menopause, actively seeking support",
    source: "Senate Select Committee on Menopause, 2024",
  },
  {
    number: "5.1M",
    label: "Women aged 40–65",
    description: "Australia's broader midlife women's population",
    source: "ABS Population Estimates, 2024",
  },
  {
    number: "$17.3B",
    label: "Global Menopause Market",
    description: "Projected to reach $27.4B by 2030 at 6.9% CAGR",
    source: "Grand View Research, 2024",
  },
  {
    number: "$1.2B",
    label: "FemTech VC Funding",
    description: "Global venture capital into women's health in 2024",
    source: "PitchBook / FemTech Analytics",
  },
];

const tailwindStats = [
  {
    number: "$793M",
    label: "Federal Investment",
    description:
      "Albanese Government's landmark 5-year Women's Health Package — the largest in Australian history",
    source: "2025–26 Federal Budget",
  },
  {
    number: "71K+",
    label: "Medicare Assessments",
    description:
      "Women who accessed new Medicare menopause health assessments in the first 12 months",
    source: "MBS Online, 2026",
  },
  {
    number: "0",
    label: "GP Training Programs",
    description:
      "Mandatory accredited menopause training requirements for Australian GPs today",
    source: "Senate Inquiry Report, 2024",
  },
  {
    number: "1st",
    label: "National Awareness Week",
    description:
      "Menopause formally recognised as a workplace health issue for the first time in 2025",
    source: "Australian Government, 2025",
  },
];

const painPoints = [
  {
    stat: "70%",
    label: "feel dismissed",
    description: "Women who say their GP dismissed or minimised perimenopause symptoms",
  },
  {
    stat: "80%",
    label: "unmet need",
    description: "Women who want personalised midlife care but don't currently receive it",
  },
  {
    stat: "1 in 2",
    label: "impacted at work",
    description: "Women who say perimenopause symptoms affect their job performance",
  },
  {
    stat: "$17B",
    label: "workforce loss",
    description: "Estimated annual earnings lost by Australian women due to untreated symptoms",
    source: "Jean Hailes Foundation, 2023",
  },
];

const pillars = [
  {
    title: "Doctor-led care",
    description:
      "Every consultation is led by a clinician trained in perimenopause, HRT, and midlife health — not triaged by algorithms.",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    title: "Integrated platform",
    description:
      "Clinical care, emotional support, education, community, and continuous follow-up — in one place, not scattered across apps.",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  },
  {
    title: "AI-powered continuity",
    description:
      "Symptom tracking, personalised insights, and longitudinal care — designed to support women for years, not just a single visit.",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18 9.75l.608 2.296a3 3 0 002.122 2.122L23.025 15l-2.295.609a3 3 0 00-2.121 2.121L18 20.25l-.608-2.52a3 3 0 00-2.121-2.121L12.975 15l2.296-.609a3 3 0 002.121-2.121L18 9.75z",
  },
  {
    title: "B2B workplace layer",
    description:
      "Corporate wellness programs that help employers retain midlife women — addressing the $17B annual workforce loss head-on.",
    icon: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z",
  },
];

const roadmap = [
  {
    when: "30 May 2026",
    title: "Community launch — Point Cook",
    status: "upcoming",
    description:
      "First free community event in Victoria. Doctor-led education on perimenopause, mood, sleep, and hormonal health. The public launch of the HerMidlife brand.",
  },
  {
    when: "Q2–Q3 2026",
    title: "Telehealth consultations go live",
    status: "planned",
    description:
      "Book-a-doctor functionality launches nationally. Medicare-backed assessments and personalised care plans for women across Australia.",
  },
  {
    when: "Q3 2026",
    title: "Corporate pilot programs",
    status: "planned",
    description:
      "First enterprise wellness partnerships — workplace education, symptom screening, and care navigation for midlife employees.",
  },
  {
    when: "Q4 2026",
    title: "Continuous care & community",
    status: "planned",
    description:
      "Symptom tracking, patient community, follow-up care loops, and AI-assisted insights. Beginning the transition from single visits to longitudinal midlife care.",
  },
];

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-24 sm:pt-48 sm:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[8%] w-44 h-44 rounded-full bg-rose/10 blur-3xl" />
          <div className="float-shape-reverse absolute top-32 right-[10%] w-60 h-60 rounded-full bg-lavender/15 blur-3xl" />
          <div className="pulse-shape absolute bottom-10 left-[25%] w-52 h-52 rounded-full bg-sage/10 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-champagne mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-plum">
              Pre-launch · Investor Overview
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight max-w-4xl">
            Building the category leader in
            <br />
            <span className="text-gradient">Australian midlife women&apos;s care.</span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-foreground/70 leading-relaxed max-w-3xl">
            3.4 million Australian women are in perimenopause or menopause right now.
            70% say they feel dismissed by their GP. The federal government just
            committed <strong className="text-foreground">$793M</strong> to women&apos;s
            health — the largest investment in Australian history.
          </p>

          <p className="mt-5 font-display text-xl sm:text-2xl italic text-plum max-w-3xl">
            HerMidlife is the first fully integrated platform built for this moment. Launching{" "}
            <span className="not-italic font-bold text-rose-dark">30 May 2026.</span>
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-start gap-4">
            <a
              href="/contact?inquiry=investor"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base sm:text-lg font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-xl"
            >
              Request Investor Deck
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="mailto:listen@hermidlife.org?subject=Investor%20meeting%20request%20%E2%80%94%20HerMidlife"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-semibold text-plum bg-white hover:bg-lavender-light/60 transition-colors border border-lavender/40 shadow-sm"
            >
              Email the Founders
            </a>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
              The Problem
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Australia&apos;s largest
              <br />
              <span className="text-gradient">underserved health market.</span>
            </h2>
            <p className="mt-6 text-lg text-foreground/60 leading-relaxed">
              Midlife women&apos;s health has been systematically overlooked by the
              healthcare system, by employers, and by technology. The data is
              staggering — and so is the opportunity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {painPoints.map((p) => (
              <div
                key={p.label}
                className="bg-blush/40 border border-rose-light rounded-3xl p-7"
              >
                <div className="font-display text-5xl font-bold text-rose-dark mb-2 stat-glow">
                  {p.stat}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">
                  {p.label}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {p.description}
                </p>
                {p.source && (
                  <p className="mt-3 text-[10px] uppercase tracking-wide text-foreground/35 font-medium">
                    {p.source}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The opportunity — market sizing */}
      <section className="py-20 sm:py-28 bg-foreground text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,114,122,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(143,170,139,0.12),transparent_50%)]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose-light mb-3">
              The Market
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              A massive, tailwind-driven
              <br />
              category ready to be defined.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {marketStats.map((s) => (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm card-lift"
              >
                <div className="font-display text-4xl sm:text-5xl font-bold text-rose-light mb-1 stat-glow">
                  {s.number}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                  {s.label}
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{s.description}</p>
                <p className="mt-4 text-[10px] uppercase tracking-wide text-white/30 font-medium">
                  {s.source}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 backdrop-blur-sm">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-light mb-3">
                  TAM
                </p>
                <p className="font-display text-3xl font-bold mb-2">3.4M women</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Australian women currently experiencing perimenopause and menopause
                  symptoms — the total addressable market.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-light mb-3">
                  SAM
                </p>
                <p className="font-display text-3xl font-bold mb-2">~1.5M women</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Women actively seeking care, education, or telehealth solutions today.
                  At an average annual wallet of ~$1,000 AUD per woman, this is a{" "}
                  <strong className="text-white/80">~$1.5B AUD</strong> serviceable market.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-light mb-3">
                  SOM
                </p>
                <p className="font-display text-3xl font-bold mb-2">0.5% = ~$7.5M ARR</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Capturing just half a percent of SAM within 3 years is a realistic
                  beachhead. Bull case: 2% capture = ~$30M ARR by Year 3.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The timing / tailwind */}
      <section className="py-20 sm:py-28 bg-lavender-light/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
              Why Now
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              The biggest tailwind
              <br />
              in Australian women&apos;s health.
            </h2>
            <p className="mt-6 text-lg text-foreground/60 leading-relaxed">
              For the first time, Australian policy, capital, and public awareness
              are aligning around midlife women&apos;s health. This is a once-in-a-decade
              market window.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tailwindStats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-3xl p-7 border border-lavender/30 shadow-sm card-lift"
              >
                <div className="font-display text-5xl font-bold text-plum mb-1 stat-glow">
                  {s.number}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">
                  {s.label}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {s.description}
                </p>
                <p className="mt-4 text-[10px] uppercase tracking-wide text-foreground/35 font-medium">
                  {s.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The solution / pillars */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
              The Solution
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Australia&apos;s first fully
              <br />
              <span className="text-gradient">integrated midlife platform.</span>
            </h2>
            <p className="mt-6 text-lg text-foreground/60 leading-relaxed">
              We combine what today lives in five separate places — your GP, your
              psychologist, your pharmacy, your wellness apps, and your friend group —
              into a single, continuous, doctor-led experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="bg-gradient-to-br from-cream to-blush/40 border border-champagne/60 rounded-3xl p-8 card-lift"
              >
                <div className="w-14 h-14 rounded-2xl bg-white text-rose-dark flex items-center justify-center mb-5 shadow-sm">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={p.icon} />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {p.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Traction / roadmap */}
      <section className="py-20 sm:py-28 bg-lavender-light/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
              Where We Are
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Pre-launch.
              <br />
              <span className="text-gradient">Launching 30 May 2026.</span>
            </h2>
            <p className="mt-6 text-lg text-foreground/60 leading-relaxed">
              We&apos;re building in the open and going to market with a free
              community event in Point Cook, Victoria — the moment Australia sees
              HerMidlife for the first time.
            </p>
          </div>

          <div className="space-y-5">
            {roadmap.map((item, i) => (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-7 sm:p-8 border border-lavender/30 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6"
              >
                <div className="shrink-0 sm:w-48">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === "upcoming"
                          ? "bg-rose animate-pulse"
                          : "bg-lavender"
                      }`}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground/40">
                      {item.status === "upcoming" ? "Next" : "Planned"}
                    </span>
                  </div>
                  <p className="font-display text-xl font-bold text-plum">{item.when}</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="shrink-0 hidden sm:block">
                  <span className="font-display text-4xl font-bold text-foreground/10">
                    0{i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/events/perimenopause-point-cook"
              className="inline-flex items-center gap-2 text-plum hover:text-rose-dark font-semibold transition-colors"
            >
              See the 30 May launch event details
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            The Team
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            Doctor-led. Builder-led.
            <br />
            <span className="text-gradient-sage">Australia-focused.</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed mb-10">
            Two practising clinicians and a seasoned product leader — united by the
            belief that every Australian woman deserves to be heard.
          </p>

          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
          >
            Meet the Founders
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* The ask / CTA */}
      <section className="gradient-event relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 right-[10%] w-80 h-80 rounded-full bg-rose/15 blur-3xl" />
          <div className="absolute bottom-10 left-[15%] w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-28 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-light mb-6">
            The Ask
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
            Partner with us to define a category.
          </h2>
          <p className="font-display text-lg sm:text-xl italic text-gold-light max-w-2xl mx-auto mb-10">
            We&apos;re meeting mission-aligned investors ahead of our 30 May launch.
            If you believe Australian women deserve better — let&apos;s talk.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact?inquiry=investor"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base sm:text-lg font-semibold bg-white text-plum hover:bg-gold-light transition-colors shadow-2xl"
            >
              Request Investor Deck
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="mailto:listen@hermidlife.org?subject=Investor%20meeting%20request%20%E2%80%94%20HerMidlife"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-semibold text-white bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 transition-colors"
            >
              listen@hermidlife.org
            </a>
          </div>

          <p className="mt-10 text-xs font-semibold tracking-[0.3em] uppercase text-gold-light">
            Her Midlife · Empower · Educate · Transform
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
