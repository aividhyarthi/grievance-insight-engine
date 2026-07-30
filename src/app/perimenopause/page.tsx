import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Perimenopause",
  description:
    "What perimenopause actually is, why it is so often missed, and what the evidence says about treatment. A sourced, plain-language reference for women worldwide and the clinicians who care for them.",
};

const scale = [
  {
    number: "1.1B",
    label: "Women postmenopausal by 2025",
    detail:
      "The World Health Organization estimates that more than a billion women worldwide will be postmenopausal by 2025 — roughly one in eight people alive.",
    source: "World Health Organization",
  },
  {
    number: "~47M",
    label: "Reach menopause each year",
    detail:
      "Tens of millions of women pass through this transition annually. It is one of the largest predictable health events in the human population.",
    source: "Global demographic estimates",
  },
  {
    number: "7.4 yrs",
    label: "Median symptom duration",
    detail:
      "The SWAN cohort found vasomotor symptoms persist for a median of 7.4 years — and beyond ten years when they begin in early perimenopause.",
    source: "SWAN cohort, JAMA Internal Medicine 2015",
  },
  {
    number: "<25%",
    label: "Receive any treatment",
    detail:
      "Across international surveys, the large majority of women with bothersome symptoms are never offered effective treatment. This is the gap.",
    source: "International survey data",
  },
];

const ageByRegion = [
  { region: "North America & Europe", age: "50–52 years" },
  { region: "Latin America", age: "≈ 48–50 years" },
  { region: "Middle East & North Africa", age: "≈ 47–49 years" },
  { region: "South & Southeast Asia", age: "≈ 46–48 years" },
  { region: "Sub-Saharan Africa", age: "≈ 48–50 years" },
];

const systems = [
  {
    title: "Brain and mood",
    body: "Oestrogen modulates serotonin, noradrenaline and GABA signalling, and oestrogen receptors are dense in the hippocampus and prefrontal cortex. Fluctuation — not simply decline — destabilises mood regulation and verbal memory. Risk of depressive symptoms roughly doubles during the transition compared with the premenopausal years. For most women, verbal memory performance recovers postmenopause.",
    tag: "Neurological",
    tone: "bg-lavender-light/60 border-lavender/40 text-plum",
  },
  {
    title: "Thermoregulation",
    body: "Falling oestrogen narrows the hypothalamic thermoneutral zone and upregulates KNDy neurons in the hypothalamus, so small changes in core temperature trigger a full heat-dissipation response. This is the mechanism behind hot flushes and night sweats, and it is the target of the newer non-hormonal neurokinin-3 receptor antagonists.",
    tag: "Hormonal",
    tone: "bg-blush border-rose-light text-rose-dark",
  },
  {
    title: "Bone",
    body: "Bone loss accelerates sharply in the year before the final period and continues for two to three years afterwards, with women losing a substantial proportion of lifetime bone density in that window. This phase is silent — there are no symptoms until fracture. It is also the phase where intervention has the greatest effect.",
    tag: "Skeletal",
    tone: "bg-sage-light border-sage text-sage-dark",
  },
  {
    title: "Cardiovascular",
    body: "Oestrogen influences vascular tone, lipid handling and insulin sensitivity. Across the transition, LDL cholesterol and visceral adiposity typically rise while insulin sensitivity falls. Cardiovascular disease is the leading cause of death in women globally, and midlife is when risk trajectory is set — making this the most consequential and least discussed part of the transition.",
    tag: "Cardiometabolic",
    tone: "bg-beige-light border-champagne text-gold",
  },
  {
    title: "Genitourinary",
    body: "The vulva, vagina, urethra and bladder are all oestrogen-dependent tissues. Reduced oestrogen causes thinning, reduced elasticity and altered pH — collectively termed genitourinary syndrome of menopause, affecting a large majority of postmenopausal women. Critically, unlike hot flushes this is progressive and does not improve with time. Low-dose vaginal oestrogen is highly effective and minimally absorbed systemically.",
    tag: "Urogenital",
    tone: "bg-blush border-rose-light text-rose-dark",
  },
  {
    title: "Sleep",
    body: "Progesterone has sedative activity through allopregnanolone at GABA-A receptors; declining levels alone disrupt sleep architecture, independently of night sweats. Insomnia prevalence rises substantially across the transition. Sleep loss then amplifies brain fog, mood instability, pain sensitivity and appetite dysregulation — which is why sleep is usually the highest-yield thing to treat first.",
    tag: "Physical",
    tone: "bg-sage-light border-sage text-sage-dark",
  },
];

const treatments = [
  {
    name: "Menopausal hormone therapy (MHT / HRT)",
    line: "First-line for bothersome vasomotor symptoms",
    detail:
      "For healthy women under 60, or within ten years of menopause onset, benefits generally outweigh risks. Route matters: transdermal oestradiol avoids first-pass metabolism and is not associated with the increased venous thromboembolism risk seen with oral preparations. Where a uterus is present, endometrial protection is required — micronised progesterone has a more favourable profile than older synthetic progestins.",
  },
  {
    name: "Low-dose vaginal oestrogen",
    line: "For genitourinary symptoms, at any age",
    detail:
      "Highly effective for dryness, discomfort, painful sex and recurrent urinary tract infections. Systemic absorption is minimal, it does not require added progestogen, and it can generally be used long-term. It is markedly underprescribed relative to how common and how treatable these symptoms are.",
  },
  {
    name: "Non-hormonal pharmacological options",
    line: "Where hormones are contraindicated or unwanted",
    detail:
      "SSRIs and SNRIs, gabapentin, oxybutynin and clonidine all have evidence for vasomotor symptoms. Neurokinin-3 receptor antagonists (fezolinetant, and more recently elinzanetant) act directly on the hypothalamic pathway driving hot flushes and represent the first genuinely new mechanism in decades.",
  },
  {
    name: "Cognitive behavioural therapy",
    line: "Evidence-based, and not a consolation prize",
    detail:
      "CBT has good trial evidence for reducing the impact and distress of hot flushes, for insomnia during the transition, and for low mood. It is recommended in guidelines as an active treatment, not merely as support.",
  },
  {
    name: "Resistance training and protein intake",
    line: "The highest-yield lifestyle intervention",
    detail:
      "Progressive resistance training addresses bone density, muscle mass, insulin sensitivity, mood and sleep simultaneously. Nothing else in the lifestyle category reaches across that many systems at once. Adequate protein supports the muscle-mass response.",
  },
  {
    name: "Testosterone",
    line: "Specific indication, narrow evidence base",
    detail:
      "The 2019 Global Consensus Position Statement supports testosterone for postmenopausal women with hypoactive sexual desire dysfunction where other contributors have been addressed. It is not evidenced for fatigue, mood or cognition, and remains off-label in most countries.",
  },
];

const redFlags = [
  "Bleeding after 12 months of no periods (postmenopausal bleeding) — always requires investigation",
  "Bleeding between periods, after sex, or unusually heavy or prolonged bleeding",
  "New severe headache with neurological symptoms, or a distinct change in headache character",
  "Chest pain, breathlessness on exertion, or palpitations with faintness",
  "Symptoms suggesting menopause before age 40 — this warrants formal assessment for premature ovarian insufficiency",
  "A breast lump, skin change or nipple discharge",
];

export default function PerimenopausePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[10%] w-40 h-40 rounded-full bg-sage/12 blur-2xl" />
          <div className="float-shape-reverse absolute top-32 right-[12%] w-52 h-52 rounded-full bg-lavender/15 blur-3xl" />
          <div className="pulse-shape absolute bottom-10 left-[30%] w-56 h-56 rounded-full bg-rose/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Understanding Perimenopause
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.06] tracking-tight">
            Something feels off —
            <br />
            <span className="text-gradient italic">and you are not imagining it</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/65 max-w-2xl mx-auto leading-relaxed">
            Perimenopause is the transition before menopause. It commonly lasts
            four to eight years, can begin in the late thirties, and affects
            almost every system in the body. Most women are not told about it
            until they are already inside it.
          </p>
        </div>
      </section>

      {/* Global scale */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll max-w-2xl mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark mb-3">
              The global picture
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.12]">
              This is one of the largest
              <br />
              <span className="text-gradient">health events on earth.</span>
            </h2>
            <p className="mt-5 text-lg text-foreground/60 leading-relaxed">
              Perimenopause is not a minority experience or a lifestyle
              complaint. It is a universal biological transition affecting
              roughly half the population — and it remains one of the most
              under-taught areas in medicine.
            </p>
          </div>

          <div className="stagger-children grid sm:grid-cols-2 gap-5">
            {scale.map((s) => (
              <div
                key={s.label}
                className="rounded-3xl border border-champagne bg-cream p-7 sm:p-8 card-lift"
              >
                <div className="font-display text-4xl sm:text-5xl font-bold text-sage-dark mb-2 stat-glow">
                  {s.number}
                </div>
                <p className="text-sm font-bold uppercase tracking-wider text-foreground/45 mb-3">
                  {s.label}
                </p>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  {s.detail}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-foreground/35 font-semibold">
                  {s.source}
                </p>
              </div>
            ))}
          </div>

          {/* Age varies by region */}
          <div className="animate-on-scroll mt-12 rounded-3xl border border-champagne bg-beige-light/60 p-8 sm:p-10">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4 leading-snug">
                  Menopause does not arrive at the same age everywhere
                </h3>
                <p className="text-foreground/70 leading-relaxed mb-4">
                  The figure of 51 comes from Western cohorts and is repeated as
                  though it were universal. It is not. Average age at natural
                  menopause varies meaningfully across regions, influenced by
                  genetics, parity, nutrition, smoking, altitude and
                  socioeconomic factors.
                </p>
                <p className="text-foreground/70 leading-relaxed">
                  This matters clinically. A woman experiencing symptoms at 44
                  may be reassured that she is &ldquo;too young&rdquo; on the
                  basis of a statistic that was never derived from a population
                  like hers.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-4">
                  Approximate mean age at natural menopause
                </p>
                <ul className="divide-y divide-champagne">
                  {ageByRegion.map((r) => (
                    <li
                      key={r.region}
                      className="flex items-baseline justify-between gap-4 py-3"
                    >
                      <span className="text-foreground/75">{r.region}</span>
                      <span className="font-display font-bold text-sage-dark whitespace-nowrap">
                        {r.age}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-foreground/40 leading-relaxed">
                  Indicative ranges synthesised from regional epidemiological
                  reviews. Individual variation is wide, and these figures should
                  not be used to rule a diagnosis in or out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why it is missed */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
              What is actually happening
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-[1.12]">
              Fluctuation, not decline
            </h2>
          </div>

          <div className="animate-on-scroll space-y-6 text-lg text-foreground/70 leading-relaxed">
            <p>
              The common mental model — hormones gradually running down like a
              battery — is wrong, and that error is the source of a great deal of
              misdiagnosis. In perimenopause the ovaries do not fade smoothly.
              As the follicle pool depletes, the feedback loop between the brain
              and the ovaries becomes erratic.
            </p>
            <p>
              Oestradiol can swing to levels{" "}
              <strong className="text-foreground">
                higher than in your twenties
              </strong>{" "}
              and then fall sharply within the same cycle. Follicle-stimulating
              hormone rises, but unevenly. Ovulation becomes intermittent, so
              progesterone — which stabilises mood and supports sleep — becomes
              unreliable well before oestrogen does.
            </p>
            <p>
              This explains the pattern women describe and clinicians frequently
              misread: symptoms that appear and vanish, months that feel normal
              followed by months that feel unmanageable, and blood tests that
              return &ldquo;normal&rdquo; because they sampled one point inside a
              volatile system.
            </p>
            <div className="rounded-2xl bg-white border border-champagne p-7">
              <p className="font-display text-lg font-bold text-foreground mb-3">
                Why guidelines advise against routine FSH testing
              </p>
              <p className="text-base text-foreground/70 leading-relaxed">
                Because FSH fluctuates as much as oestrogen does during the
                transition, a single measurement has poor diagnostic value.{" "}
                <strong className="text-foreground">NICE guideline NG23</strong>{" "}
                recommends diagnosing perimenopause and menopause on the basis of
                symptoms alone in women over 45, without FSH testing. Testing
                retains a role in women under 40, where premature ovarian
                insufficiency must be formally assessed, and has limited value
                between 40 and 45.
              </p>
            </div>
            <p>
              Menopause itself is a single retrospective point: twelve
              consecutive months without a period. Almost everything women
              experience symptomatically happens{" "}
              <strong className="text-foreground">before</strong> that point —
              during perimenopause, when hormones are least stable and
              recognition is least likely.
            </p>
          </div>
        </div>
      </section>

      {/* System by system */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll max-w-2xl mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
              System by system
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.12]">
              Far more than
              <br />
              <span className="text-gradient">hot flushes.</span>
            </h2>
            <p className="mt-5 text-lg text-foreground/60 leading-relaxed">
              Oestrogen receptors are present in the brain, bone, blood vessels,
              skin, gut and urogenital tract. That is why a hormonal transition
              produces symptoms that appear unrelated — and why they are so often
              investigated separately and treated as coincidence.
            </p>
          </div>

          <div className="stagger-children grid md:grid-cols-2 gap-5">
            {systems.map((s) => (
              <div
                key={s.title}
                className="rounded-3xl border border-champagne bg-cream p-7 sm:p-8 card-lift"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="font-display text-xl font-bold text-foreground leading-snug">
                    {s.title}
                  </h3>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${s.tone}`}
                  >
                    {s.tag}
                  </span>
                </div>
                <p className="text-foreground/70 leading-relaxed text-[15px]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <div className="animate-on-scroll mt-10 text-center">
            <a
              href="/perimenopause/library"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
            >
              See all symptoms with prevalence data
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Treatment landscape */}
      <section className="py-20 sm:py-28 bg-foreground text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(122,168,122,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,rgba(154,172,207,0.12),transparent_55%)]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="animate-on-scroll max-w-2xl mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-sage-light mb-3">
              What the evidence supports
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.12]">
              There is more available
              <br />
              than most women are offered.
            </h2>
            <p className="mt-5 text-lg text-white/60 leading-relaxed">
              This is a summary of the treatment landscape so you know what
              exists and what questions to ask. It is not a prescription — every
              option below depends on individual history, and that assessment
              belongs with your clinician.
            </p>
          </div>

          <div className="space-y-4">
            {treatments.map((t, i) => (
              <div
                key={t.name}
                className="animate-on-scroll rounded-3xl bg-white/5 border border-white/12 backdrop-blur-sm p-7 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-3">
                  <span className="font-display text-2xl font-bold text-white/15 shrink-0">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold leading-snug">
                      {t.name}
                    </h3>
                    <p className="text-sm font-semibold text-sage-light mt-1">
                      {t.line}
                    </p>
                  </div>
                </div>
                <p className="text-white/65 leading-relaxed sm:ml-12">
                  {t.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="animate-on-scroll mt-10 rounded-2xl bg-white/5 border border-white/12 p-6">
            <p className="text-sm text-white/55 leading-relaxed">
              Sources: NICE NG23; The Menopause Society 2022 position statement
              on hormone therapy; Global Consensus Position Statement on
              testosterone therapy for women (2019). Availability, licensing and
              naming of individual medicines vary by country.
            </p>
          </div>
        </div>
      </section>

      {/* Red flags */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll rounded-3xl border-2 border-rose-light bg-blush/40 p-8 sm:p-10">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-11 h-11 rounded-2xl bg-rose/15 text-rose-dark flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </span>
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-snug">
                  Not everything is perimenopause
                </h2>
                <p className="text-foreground/60 mt-2 leading-relaxed">
                  Attributing every midlife symptom to hormones causes real harm
                  in the opposite direction. These findings need medical
                  assessment rather than reassurance.
                </p>
              </div>
            </div>

            <ul className="space-y-3">
              {redFlags.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-dark shrink-0" />
                  <span className="text-foreground/75 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 pt-6 border-t border-rose-light text-sm text-foreground/60 leading-relaxed">
              Thyroid disease, iron deficiency, diabetes, obstructive sleep apnoea
              and depression all overlap substantially with perimenopause and are
              common in this age group. A good clinician considers them alongside
              the hormonal picture rather than instead of it.
            </p>
          </div>
        </div>
      </section>

      {/* Where to go next */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Where to go next
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                href: "/perimenopause/library",
                eyebrow: "Symptom Library",
                title: "Find what you are experiencing",
                body: "Every common symptom with prevalence data, mechanism, what helps, and when to seek review.",
                tone: "gradient-card border-rose-light/50",
                link: "text-rose-dark",
              },
              {
                href: "/perimenopause/guides",
                eyebrow: "Topic Guides",
                title: "Go deeper on one area",
                body: "Longer-form guides on hormones, cycles, mental health, sleep, lifestyle and treatment options.",
                tone: "gradient-card-lavender border-lavender/40",
                link: "text-plum",
              },
              {
                href: "/perimenopause/talk-to-gp",
                eyebrow: "Talk to Your GP",
                title: "Prepare for the appointment",
                body: "What to track beforehand, the precise words that change a consultation, and what to ask for.",
                tone: "gradient-card-sage border-sage/30",
                link: "text-sage-dark",
              },
            ].map((c) => (
              <a
                key={c.href}
                href={c.href}
                className={`animate-on-scroll block rounded-3xl p-7 border card-lift group ${c.tone}`}
              >
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">
                  {c.eyebrow}
                </p>
                <h3 className="font-display text-lg font-bold text-foreground mb-3 leading-snug">
                  {c.title}
                </h3>
                <p className="text-sm text-foreground/65 leading-relaxed mb-5">
                  {c.body}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${c.link}`}
                >
                  Read
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>

          <p className="animate-on-scroll mt-12 text-center text-sm text-foreground/45 max-w-2xl mx-auto leading-relaxed">
            This page is general health information, not personal medical advice.
            It is written to help you have a better conversation with a qualified
            clinician — not to replace one.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
