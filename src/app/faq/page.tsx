"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type FaqItem = {
  q: string;
  a: React.ReactNode;
};

const patientFaqs: FaqItem[] = [
  {
    q: "What is perimenopause and how is it different from menopause?",
    a: (
      <>
        Perimenopause is the transition phase leading up to menopause — it can
        begin as early as your mid-30s and typically lasts between 4 and 10
        years. During this time, hormone levels fluctuate unpredictably, which
        is why symptoms can feel so confusing. Menopause itself is a single
        point in time — the day you have gone 12 consecutive months without a
        period. Everything after that is post-menopause.
      </>
    ),
  },
  {
    q: "How do I know if I'm in perimenopause?",
    a: (
      <>
        Common early signs include changes in your menstrual cycle, disrupted
        sleep, brain fog, mood changes, anxiety, joint pain, fatigue, hot
        flushes, and reduced libido. Because symptoms vary so widely, many
        women don&apos;t realise they&apos;re in perimenopause until they talk
        to a clinician who specialises in it. A HerMidlife consultation
        includes a structured symptom review to give you clarity.
      </>
    ),
  },
  {
    q: "Do I need a referral to access HerMidlife?",
    a: (
      <>
        No — you can book directly with us. If your care plan benefits from
        involving your GP or a specialist, we&apos;ll help coordinate that
        with your consent.
      </>
    ),
  },
  {
    q: "Are your consultations Medicare-rebatable?",
    a: (
      <>
        Where clinically appropriate, our consultations with Australian-
        registered GPs attract Medicare rebates. We&apos;ll confirm
        eligibility and out-of-pocket costs clearly before you book, so there
        are no surprises.
      </>
    ),
  },
  {
    q: "What does a typical HerMidlife consultation look like?",
    a: (
      <>
        Your first consultation is a longer, unhurried appointment (45–60
        minutes) where a clinician listens to your full history, reviews your
        symptoms, and builds a personalised plan. Follow-ups are shorter but
        continuous — we stay with you through the transition rather than
        seeing you once and sending you away.
      </>
    ),
  },
  {
    q: "Can I get HRT (MHT) through HerMidlife?",
    a: (
      <>
        Yes, where clinically appropriate. Our clinicians are trained in
        evidence-based menopausal hormone therapy and follow current
        Australasian Menopause Society guidelines. HRT is one of many tools —
        your plan may also include lifestyle, nutrition, sleep, and mental
        health support.
      </>
    ),
  },
  {
    q: "What if I'm not sure whether my symptoms are perimenopause-related?",
    a: (
      <>
        That&apos;s exactly why we exist. Many midlife symptoms get
        misdiagnosed as stress, anxiety, or burnout. Our job is to help you
        untangle what&apos;s hormonal, what&apos;s lifestyle, and what needs
        further investigation — without dismissing you.
      </>
    ),
  },
  {
    q: "How much does it cost?",
    a: (
      <>
        Pricing depends on the consultation type and whether Medicare rebates
        apply. We publish clear pricing at the time of booking. Our goal is
        to make high-quality midlife care financially accessible — not a
        luxury product.
      </>
    ),
  },
  {
    q: "Is HerMidlife available across Australia?",
    a: (
      <>
        Yes. We deliver care via secure telehealth to women across Australia,
        with our team based in Melbourne. In-person events and community
        gatherings are currently running in Victoria, with more locations to
        follow.
      </>
    ),
  },
  {
    q: "Is my information private?",
    a: (
      <>
        Absolutely. We handle your personal and health information in line
        with the Australian Privacy Principles under the Privacy Act 1988
        (Cth). Health information is treated as sensitive information and
        access is restricted to your clinicians and authorised staff. See our{" "}
        <a href="/privacy" className="text-plum underline font-semibold">
          Privacy Policy
        </a>{" "}
        for full details.
      </>
    ),
  },
];

const partnerFaqs: FaqItem[] = [
  {
    q: "What stage is HerMidlife at?",
    a: (
      <>
        HerMidlife is a pre-launch Australian women&apos;s health platform,
        launching <strong>30 May 2026</strong> in Melbourne with our first
        free community event in Point Cook. We are actively speaking with
        aligned investors, clinical partners, and employers.
      </>
    ),
  },
  {
    q: "What is your business model?",
    a: (
      <>
        A blended model: direct-to-consumer clinical consultations (with
        Medicare rebates where applicable), subscription-based continuous
        care, and B2B corporate wellness programs for employers who want to
        retain and support women aged 35–55 in their workforce.
      </>
    ),
  },
  {
    q: "How is HerMidlife different from existing women's health apps?",
    a: (
      <>
        Most women&apos;s health apps are either fertility-focused or offer
        light-touch content. HerMidlife is doctor-led, clinically integrated,
        and purpose-built for the perimenopause-to-post-menopause transition
        — a 10+ year window that existing platforms largely ignore. We
        combine continuous clinical care with AI-assisted continuity so
        women don&apos;t have to re-tell their story every visit.
      </>
    ),
  },
  {
    q: "What is your competitive moat?",
    a: (
      <>
        Three layers: (1) a clinically-credentialed founding team with deep
        GP and women&apos;s health expertise, (2) an integrated B2C + B2B
        model that most international entrants can&apos;t replicate in
        Australia without local clinical partnerships, and (3) a community
        and trust flywheel built from the ground up in-market.
      </>
    ),
  },
  {
    q: "How can I invest or partner with HerMidlife?",
    a: (
      <>
        We&apos;d love to hear from you. You can request our investor deck
        or open a conversation via our{" "}
        <a
          href="/contact?inquiry=investor"
          className="text-plum underline font-semibold"
        >
          contact page
        </a>{" "}
        (select &quot;Investor enquiry&quot;), or email us directly at{" "}
        <a
          href="mailto:listen@hermidlife.org"
          className="text-plum underline font-semibold"
        >
          listen@hermidlife.org
        </a>
        .
      </>
    ),
  },
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-2xl border border-champagne/60 bg-white overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-cream/40 transition-colors"
            >
              <span className="font-display text-base sm:text-lg font-bold text-foreground">
                {item.q}
              </span>
              <span
                className={`shrink-0 w-8 h-8 rounded-full bg-rose/10 text-rose-dark flex items-center justify-center transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden="true"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 text-foreground/70 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function FaqPage() {
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
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Frequently Asked Questions
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Answers to the things
            <br />
            <span className="text-gradient">women actually ask</span>
          </h1>
          <p className="mt-6 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Email us at{" "}
            <a
              href="mailto:listen@hermidlife.org"
              className="text-plum font-semibold underline"
            >
              listen@hermidlife.org
            </a>{" "}
            and a real person will reply.
          </p>
        </div>
      </section>

      {/* Patient FAQs */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-2">
              For patients
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Your care, clearly explained
            </h2>
          </div>
          <FaqAccordion items={patientFaqs} />
        </div>
      </section>

      {/* Partner FAQs */}
      <section className="py-20 sm:py-24 bg-cream/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-2">
              For partners &amp; investors
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Building the category leader
            </h2>
          </div>
          <FaqAccordion items={partnerFaqs} />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-10 sm:p-14 gradient-hero border border-champagne/50 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Still have questions?
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto mb-8 leading-relaxed">
              We read every message personally. Whether you&apos;re looking
              for care, want to partner with us, or are curious about
              what we&apos;re building — we&apos;d love to hear from you.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
              >
                Contact Us
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </a>
              <a
                href="mailto:listen@hermidlife.org"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-foreground bg-white border border-champagne hover:border-rose transition-colors"
              >
                Email us directly
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
