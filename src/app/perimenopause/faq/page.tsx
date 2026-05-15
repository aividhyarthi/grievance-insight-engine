"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "How do I know if I'm in perimenopause?",
    a: "There is no single test that diagnoses perimenopause. It is a clinical diagnosis based on your age, symptoms, and menstrual changes. Blood tests (FSH, oestradiol) can be done but are often inconclusive because hormone levels fluctuate so much during this time. If you are in your 40s and experiencing symptoms like irregular periods, sleep disruption, hot flushes, or mood changes, perimenopause is a likely explanation. Your GP can help you make sense of what you are experiencing.",
  },
  {
    q: "Can perimenopause start in my 30s?",
    a: "Yes. While the average onset is in the mid-to-late 40s, perimenopause can begin in the late 30s for some women. If you experience regular menstrual cycle changes, early symptoms, or have a family history of early menopause, it is worth discussing with your GP. Premature Ovarian Insufficiency (POI) — menopause before age 40 — affects around 1 in 100 women and is a separate, diagnosable condition.",
  },
  {
    q: "How long does perimenopause last?",
    a: "On average, 4 to 10 years — though it varies significantly between individuals. Some women transition relatively quickly (2–3 years); for others it can extend beyond a decade. The transition is complete when you have gone 12 consecutive months without a period, at which point you are considered to have reached menopause.",
  },
  {
    q: "Can I still get pregnant during perimenopause?",
    a: "Yes. Ovulation is irregular, not absent, during perimenopause. You can still conceive, sometimes unpredictably. If you do not wish to become pregnant, contraception is recommended until you have had 12 consecutive months without a period (if you are over 50) or 24 months (if you are under 50). Discuss contraception options with your GP.",
  },
  {
    q: "What is the difference between perimenopause and menopause?",
    a: "Perimenopause is the transitional phase during which your hormones fluctuate and symptoms occur — it can last years. Menopause is a specific point in time: the moment you have gone 12 consecutive months without a period. Most of what women experience symptomatically happens during perimenopause, not after menopause. Post-menopause refers to all years after that 12-month point.",
  },
  {
    q: "Is HRT (hormone replacement therapy) safe?",
    a: "For most healthy women under 60 and within 10 years of their last period, current evidence suggests that MHT (Menopausal Hormone Therapy — the Australian term) has benefits that outweigh risks. The major concerns raised by the 2002 WHI study have been substantially revised. The type, dose, and form of MHT matters — body-identical hormones and transdermal oestrogen carry a different risk profile than older oral formulations. Your GP can advise based on your individual health history.",
  },
  {
    q: "Are my hot flushes actually dangerous?",
    a: "Hot flushes are not dangerous in themselves, but they can be extremely disruptive to quality of life and sleep. Frequent, severe hot flushes are associated with increased cardiovascular risk long-term — which is one of the reasons treating significant symptoms is considered beneficial, not just for comfort. If hot flushes are significantly impacting your life, they are worth treating.",
  },
  {
    q: "Is the brain fog I'm experiencing normal in perimenopause?",
    a: "Yes, cognitive changes — difficulty concentrating, word-finding difficulties, and memory lapses — are very common and genuinely reported by a large proportion of women in perimenopause. They are linked to hormonal fluctuations and, significantly, to sleep deprivation. For most women, cognitive function improves after menopause. If symptoms are severe or progressing rapidly, discuss this with your GP to rule out other causes.",
  },
  {
    q: "I feel anxious in a way I never have before. Is that perimenopause?",
    a: "Very possibly, yes. New-onset anxiety — particularly around the late 30s to mid-40s — is often connected to perimenopause, especially when other symptoms are present. Oestrogen influences serotonin and GABA pathways, and fluctuating levels can destabilise the nervous system. This is not just stress — it has a biological basis. It is also treatable. Please do not dismiss it or wait it out without support.",
  },
  {
    q: "My doctor doesn't seem to take my symptoms seriously. What should I do?",
    a: "Unfortunately, this is a common experience. Some practical approaches: come to your appointment with a written list of symptoms and how they affect your daily life; ask specifically whether perimenopause could be contributing; request a longer appointment so there is time to discuss properly; and ask for a referral to a gynaecologist or menopause specialist if your concerns are not being addressed. The Australasian Menopause Society (ams.asn.au) has a directory of doctors with specific menopause training.",
  },
  {
    q: "What's the difference between perimenopause and thyroid problems?",
    a: "Several perimenopause symptoms overlap with thyroid conditions — particularly fatigue, brain fog, weight changes, mood changes, and irregular periods. Because thyroid problems are more common in women in this age group, your GP may want to check your thyroid function with a blood test. This is a good idea — it is simple to rule out and important if it is contributing to your symptoms.",
  },
  {
    q: "Can lifestyle changes really make a difference?",
    a: "Yes, meaningfully so for many symptoms — though the degree varies between individuals. Strength training is particularly well-evidenced for mood, bone density, metabolic function, and sleep. Reducing alcohol can significantly improve sleep quality, hot flush frequency, and mood. Consistent sleep habits help enormously. These are not replacements for medical treatment in severe cases, but they are powerful additions at any level of symptom burden.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-48 pb-14 sm:pt-56 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-24 left-[10%] w-36 h-36 rounded-full bg-lavender/15 blur-2xl" />
          <div className="pulse-shape absolute bottom-8 right-[15%] w-48 h-48 rounded-full bg-rose/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Frequently Asked Questions
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Questions we
            <br />
            <span className="text-gradient italic">hear most often</span>
          </h1>
          <p className="mt-5 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Straightforward answers to the questions women ask most about
            perimenopause, hormones, and healthcare in Australia.
          </p>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? "border-rose-light shadow-md" : "border-champagne/80 card-lift"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-foreground leading-snug text-base">
                      {faq.q}
                    </span>
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isOpen ? "bg-rose text-white rotate-45" : "bg-blush text-rose"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6">
                      <div className="h-px bg-champagne/60 mb-4" />
                      <p className="text-foreground/65 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 flex items-start gap-3 p-5 rounded-2xl bg-blush/40 border border-rose-light/40">
            <svg className="w-5 h-5 text-rose shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-foreground/65 leading-relaxed">
              <strong className="text-foreground">These answers are general information only.</strong>{" "}
              Your circumstances are individual. Always speak to your GP or a qualified healthcare
              professional for advice specific to your situation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white border-t border-champagne/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-xl font-bold text-foreground mb-1">Still have questions?</p>
            <p className="text-foreground/60 text-sm">Our symptom library and topic guides can help you go into your next appointment well-informed.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="/perimenopause/library" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-md">
              Symptom Library
            </a>
            <a href="/perimenopause/talk-to-gp" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-rose-dark border-2 border-rose-light hover:bg-blush transition-colors">
              Talk to Your GP
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
