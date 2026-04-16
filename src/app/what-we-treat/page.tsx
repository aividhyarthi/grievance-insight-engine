import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "What We Treat",
  description:
    "HerMidlife provides whole-health care for the whole of midlife — perimenopause, menopause, HRT, mental health, weight, sleep, heart and bone health, thyroid, and more.",
};

const conditions = [
  {
    title: "Perimenopause & Menopause",
    description:
      "Comprehensive care from the first symptom through post-menopause. We manage the full spectrum of hormonal change — not just hot flushes, but the 40+ symptoms most women aren't told about.",
    detail:
      "Perimenopause can start as early as your mid-30s. We help you understand what's happening, confirm where you are in the transition, and build a plan that evolves with you.",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    color: "from-blush to-rose-light/40",
    iconBg: "bg-rose/10 text-rose-dark",
  },
  {
    title: "Hormone Therapy (HRT / MHT)",
    description:
      "Evidence-based hormone therapy management tailored to your needs, following Australasian Menopause Society guidelines.",
    detail:
      "We assess your risk profile, discuss options openly, prescribe where appropriate, and monitor your response over time. With medication delivery to your door.",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0012 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
    color: "from-lavender-light to-lavender/30",
    iconBg: "bg-lavender/20 text-plum",
  },
  {
    title: "Mental Health & Mood",
    description:
      "Anxiety, brain fog, mood swings, irritability — we address the emotional and cognitive impacts that are so often dismissed or misdiagnosed.",
    detail:
      "Up to 70% of perimenopausal women experience mood changes. We distinguish what's hormonal from what needs separate support, and treat both.",
    icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
    color: "from-beige-light to-champagne/40",
    iconBg: "bg-gold/10 text-gold",
  },
  {
    title: "Weight & Metabolism",
    description:
      "Hormonal changes fundamentally alter how your body stores and uses energy. We help you understand and manage it — not fight it.",
    detail:
      "Insulin resistance, cortisol shifts, and declining oestrogen all contribute. We address root causes, not just calories.",
    icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
    color: "from-sage-light to-sage/20",
    iconBg: "bg-sage/20 text-sage-dark",
  },
  {
    title: "Heart & Bone Health",
    description:
      "Cardiovascular and osteoporosis risk increase significantly after menopause. Proactive screening and prevention, built into your care plan.",
    detail:
      "1 in 3 women over 50 are affected by osteoporosis. Heart disease is the leading cause of death in Australian women. We screen early.",
    icon: "M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z",
    color: "from-blush to-rose-light/30",
    iconBg: "bg-coral/10 text-terracotta",
  },
  {
    title: "Thyroid & Gut Health",
    description:
      "Thyroid dysfunction and gut changes are common in midlife, often overlapping with perimenopause symptoms. We test, diagnose, and treat holistically.",
    detail:
      "Thyroid issues affect 1 in 8 women. Symptoms mimic perimenopause — fatigue, weight gain, brain fog. We rule it in or out.",
    icon: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    color: "from-lavender-light to-beige-light",
    iconBg: "bg-lavender/15 text-plum",
  },
  {
    title: "Low Libido",
    description:
      "An important part of your wellbeing that deserves honest, judgement-free conversation and proper treatment.",
    detail:
      "Sexual health changes are one of the most common — and least discussed — impacts of midlife hormonal change. We talk about it openly.",
    icon: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
    color: "from-beige-light to-champagne/40",
    iconBg: "bg-gold/10 text-gold",
  },
  {
    title: "Sleep & Energy",
    description:
      "Chronic fatigue and disrupted sleep are hallmarks of perimenopause. We address root causes, not just symptoms.",
    detail:
      "Poor sleep accelerates ageing, worsens mood, and impacts every other symptom. Fixing it is often the first step in feeling like yourself again.",
    icon: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
    color: "from-sage-light to-sage/20",
    iconBg: "bg-sage/15 text-sage-dark",
  },
];

export default function WhatWeTreatPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-16 sm:pt-48 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[10%] w-40 h-40 rounded-full bg-rose/10 blur-2xl" />
          <div className="float-shape-reverse absolute top-32 right-[12%] w-52 h-52 rounded-full bg-lavender/15 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark mb-3">
            What We Treat
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Whole-health care for
            <br />
            <span className="text-gradient">the whole of midlife</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Not just hormones. We treat the full spectrum of midlife health
            — because everything is connected.
          </p>
        </div>
      </section>

      {/* Conditions grid */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll grid sm:grid-cols-2 gap-6">
            {conditions.map((c) => (
              <div
                key={c.title}
                className={`bg-gradient-to-br ${c.color} rounded-3xl p-8 border border-white/60 card-lift group`}
              >
                <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center mb-6`}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
                  </svg>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-3">
                  {c.title}
                </h2>
                <p className="text-foreground/70 leading-relaxed mb-3">
                  {c.description}
                </p>
                <p className="text-sm text-foreground/50 leading-relaxed">
                  {c.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Not sure? */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll rounded-3xl p-10 sm:p-14 gradient-hero border border-champagne/50 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Not sure what&apos;s going on?
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto mb-8 leading-relaxed">
              That&apos;s exactly why we exist. Many midlife symptoms get misdiagnosed
              as stress, anxiety, or burnout. Our job is to help you untangle
              what&apos;s hormonal, what&apos;s lifestyle, and what needs further investigation.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
            >
              Talk to Us
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
