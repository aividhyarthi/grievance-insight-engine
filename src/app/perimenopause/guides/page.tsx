import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Topic Guides",
  description:
    "Six in-depth guides covering hormones, periods, mental health, sleep, lifestyle, and navigating Australian healthcare during perimenopause.",
};

const guides = [
  {
    num: "01",
    icon: "🔬",
    title: "Hormones 101",
    desc: "What oestrogen and progesterone actually do — and what happens when they start to change.",
    topics: [
      "What oestrogen does beyond reproduction",
      "How progesterone supports sleep and calm",
      "Why levels fluctuate rather than simply decline",
      "The difference between perimenopause and menopause",
      "Why blood tests are often inconclusive",
    ],
    body: [
      "Oestrogen is not just a reproductive hormone. It affects your brain, bones, cardiovascular system, skin, joints, and mood. When it starts to fluctuate — and fluctuation is the key word in perimenopause — the whole body notices.",
      "Progesterone declines earlier and more steeply than oestrogen in many women. It is the hormone most associated with calm and sleep quality, which is why sleep is often the first casualty of perimenopause.",
      "The transition is not linear. Oestrogen can spike unpredictably high before falling, which is why some women experience symptoms of both oestrogen excess (breast tenderness, bloating) and oestrogen deficiency (hot flushes, dryness) at different times — or even simultaneously.",
    ],
  },
  {
    num: "02",
    icon: "📅",
    title: "Your Periods — What's Changing",
    desc: "Cycles getting shorter, longer, heavier, or unpredictable? Here is what is happening and what to watch for.",
    topics: [
      "Why cycles become irregular in perimenopause",
      "What normal variation looks like",
      "Heavy or flooding periods — when to act",
      "Spotting and bleeding between periods",
      "How to track your cycle effectively",
    ],
    body: [
      "As ovulation becomes less predictable, the menstrual cycle loses its regularity. Cycles may shorten to 21 days or extend past 45. Periods may become lighter and shorter, or dramatically heavier with clotting.",
      "Heavy periods are very common in perimenopause and can lead to iron deficiency and exhaustion. A period that requires changing a pad or tampon every hour for two or more consecutive hours, or that contains large clots, warrants a GP visit.",
      "Bleeding between periods, after sex, or after 12 months of no periods should always be discussed with your GP — these symptoms need to be evaluated, not assumed to be perimenopause.",
    ],
  },
  {
    num: "03",
    icon: "💙",
    title: "Mental Health & Mood",
    desc: "The direct link between hormones and anxiety, low mood, and emotional sensitivity — and why it is so often missed.",
    topics: [
      "How oestrogen affects serotonin and mood",
      "New anxiety that appears from nowhere",
      "Low mood versus clinical depression",
      "Irritability and emotional sensitivity",
      "When to seek mental health support",
    ],
    body: [
      "Oestrogen influences the production and metabolism of serotonin, dopamine, and GABA — the brain chemicals that regulate mood, calm, and pleasure. When oestrogen fluctuates, these systems are destabilised.",
      "This is why perimenopause can bring on anxiety, low mood, or emotional reactivity in women who have never experienced these things before. It is biological, not a character flaw.",
      "The perimenopausal rage many women describe — a sudden, disproportionate response to things that previously did not bother them — is a recognised phenomenon linked to hormonal volatility and sleep deprivation. If low mood persists for more than two weeks, please speak to your GP. Perimenopause is associated with increased risk of depression, and there are effective treatments available.",
    ],
  },
  {
    num: "04",
    icon: "😴",
    title: "Sleep — Why It Is Disrupted",
    desc: "The hormonal reasons behind poor sleep in perimenopause, and practical strategies grounded in evidence.",
    topics: [
      "Why progesterone decline affects sleep first",
      "The night sweats cycle that worsens everything",
      "Sleep hygiene that actually makes a difference",
      "The role of alcohol and caffeine",
      "When to discuss sleep with your GP",
    ],
    body: [
      "Progesterone has a sedative quality — it helps you reach deep sleep. As it declines in perimenopause, many women begin waking at 3am or find it hard to reach deep, restorative sleep, even before other symptoms appear.",
      "Add night sweats to the mix and you have a perfect storm. The chronic sleep deprivation that results compounds every other symptom: it worsens brain fog, mood instability, fatigue, and metabolic function.",
      "Evidence-based sleep strategies that help: consistent wake time (even on weekends), keeping your bedroom below 18°C, no alcohol within 3 hours of bed, limiting caffeine after 2pm, and not lying awake in bed for more than 20 minutes. If sleep disruption is severe, your GP can discuss options including addressing night sweats directly.",
    ],
  },
  {
    num: "05",
    icon: "🏃‍♀️",
    title: "Lifestyle & Self-Care",
    desc: "Evidence-based changes that genuinely make a difference to symptoms — and the myths to ignore.",
    topics: [
      "Exercise: what type matters and why",
      "Nutrition and the metabolic shift",
      "Alcohol — the underestimated contributor",
      "Stress and cortisol in perimenopause",
      "What actually works versus popular myths",
    ],
    body: [
      "Strength training 2–3 times per week is one of the most powerful tools in perimenopause — it helps preserve muscle mass, support bone density, regulate mood, improve sleep, and manage weight. Cardiovascular exercise supports heart health. Yoga and pilates can help with stress and pelvic floor function.",
      "Nutrition shifts matter: protein becomes more important for muscle maintenance, and many women find that refined carbohydrates and alcohol amplify symptoms. Phytoestrogens (found in soy, flaxseed, legumes) may help some women with mild symptoms — evidence is mixed, but they are safe to include.",
      "Alcohol is worth an honest look. It fragments sleep, triggers hot flushes, and contributes to anxiety and low mood — three areas already under pressure in perimenopause. Even 2–3 drinks a week can have a measurable impact on symptom burden for some women.",
    ],
  },
  {
    num: "06",
    icon: "🩺",
    title: "Navigating Healthcare in Australia",
    desc: "How to work with your GP, what to ask about, and what treatment options exist in the Australian context.",
    topics: [
      "How to raise perimenopause with your GP",
      "Menopausal Hormone Therapy (MHT) — the current evidence",
      "Non-hormonal treatment options",
      "The menopause management Medicare item",
      "Finding a menopause specialist in Australia",
    ],
    body: [
      "Many GPs are knowledgeable about perimenopause — but many women still report being dismissed or undertreated. Being informed and specific about your symptoms makes a significant difference. Come prepared with a written list.",
      "MHT (Menopausal Hormone Therapy — the current Australian term for HRT) has undergone a major rehabilitation in the evidence base since the 2002 WHI study. For most healthy women under 60 and within 10 years of menopause, current evidence suggests benefits outweigh risks. Your GP can advise based on your individual health profile.",
      "Under Medicare, GPs can claim a specific item number for perimenopause and menopause management consultations. It is worth asking whether this applies to your appointment. The Australasian Menopause Society (ams.asn.au) also has a Find a Doctor tool for locating GPs with specific menopause training.",
    ],
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-48 pb-14 sm:pt-56 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-24 right-[8%] w-40 h-40 rounded-full bg-lavender/15 blur-2xl" />
          <div className="pulse-shape absolute bottom-8 left-[20%] w-52 h-52 rounded-full bg-sage/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Topic Guides
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Go deeper on
            <br />
            <span className="text-gradient italic">what matters to you</span>
          </h1>
          <p className="mt-5 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Six guides written in plain language — covering the topics women ask
            about most during perimenopause.
          </p>
        </div>
      </section>

      {/* Guides */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          {guides.map((g) => (
            <div
              key={g.num}
              className="bg-white rounded-3xl border border-champagne/80 overflow-hidden card-lift"
            >
              {/* Guide header */}
              <div className="gradient-card border-b border-champagne/60 px-8 py-6 flex items-start gap-5">
                <div className="text-4xl shrink-0">{g.icon}</div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-rose mb-1">
                    Guide {g.num}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    {g.title}
                  </h2>
                  <p className="text-foreground/60 leading-relaxed text-sm">{g.desc}</p>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6 grid sm:grid-cols-2 gap-8">
                {/* Topics */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose mb-3">
                    What this guide covers
                  </p>
                  <ul className="space-y-2">
                    {g.topics.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-foreground/65 leading-snug">
                        <svg className="w-4 h-4 text-rose shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Body text */}
                <div className="space-y-3">
                  {g.body.map((para, i) => (
                    <p key={i} className="text-sm text-foreground/65 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white border-t border-champagne/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-xl font-bold text-foreground mb-1">Have a specific question?</p>
            <p className="text-foreground/60 text-sm">Check our FAQs or get tips on talking to your GP.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="/perimenopause/faq" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-md">
              FAQs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
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
