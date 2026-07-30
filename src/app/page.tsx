import Header from "@/components/Header";
import Footer from "@/components/Footer";

const globalNumbers = [
  {
    number: "1.1B",
    label: "women postmenopausal by 2025",
    source: "World Health Organization",
  },
  {
    number: "~47M",
    label: "women reach menopause each year",
    source: "Global demographic estimates",
  },
  {
    number: "75–80%",
    label: "experience vasomotor symptoms",
    source: "SWAN cohort · Menopause Society",
  },
  {
    number: "<25%",
    label: "of symptomatic women receive treatment",
    source: "International survey data",
  },
];

const pillars = [
  {
    title: "Understand what is happening",
    body: "Perimenopause has more than forty recognised symptoms and no single diagnostic test. We explain the physiology in plain language — what fluctuating oestrogen actually does to your brain, bones, heart, sleep and mood — so the picture finally makes sense.",
    href: "/perimenopause",
    cta: "Read the guide",
    iconPath:
      "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    accent: "from-blush to-rose-light/40",
    iconBg: "bg-rose/10 text-rose-dark",
    linkColor: "text-rose-dark",
  },
  {
    title: "Recognise it in yourself",
    body: "A symptom library with prevalence data, the physiological mechanism behind each symptom, what genuinely helps, and the red flags that need investigating rather than reassurance. Written to be useful in a consulting room, not just reassuring on a phone.",
    href: "/perimenopause/library",
    cta: "Browse the symptom library",
    iconPath:
      "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    accent: "from-lavender-light to-lavender/30",
    iconBg: "bg-lavender/20 text-plum",
    linkColor: "text-plum",
  },
  {
    title: "Get taken seriously",
    body: "Most women who are dismissed are dismissed because the consultation was too short and too vague. We give you the staging framework, the specific language, and the questions that turn a ten-minute appointment into a real clinical conversation.",
    href: "/perimenopause/talk-to-gp",
    cta: "Prepare for your appointment",
    iconPath:
      "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    accent: "from-sage-light to-sage/20",
    iconBg: "bg-sage/20 text-sage-dark",
    linkColor: "text-sage-dark",
  },
];

const stages = [
  {
    stage: "Late reproductive",
    age: "Often late 30s – early 40s",
    detail:
      "Cycles are still regular but subtly shorter. Early-follicular FSH begins to rise. Many women first notice sleep and mood changes here — and are told nothing is wrong.",
  },
  {
    stage: "Early perimenopause",
    age: "Variable onset",
    detail:
      "Persistent cycle-length variability of seven days or more. Oestrogen swings widely rather than falling steadily — which is why symptoms come and go, and why a single blood test is so often unhelpful.",
  },
  {
    stage: "Late perimenopause",
    age: "Typically 1–3 years",
    detail:
      "Intervals of sixty days or more between periods. Vasomotor symptoms usually peak in this window and in the two years following the final period.",
  },
  {
    stage: "Postmenopause",
    age: "From 12 months after the final period",
    detail:
      "Hot flushes gradually settle for most women. Genitourinary changes and bone loss do not — both are progressive without treatment, which is why long-term care matters more than short-term relief.",
  },
];

const misconceptions = [
  {
    said: "“Your bloods are normal.”",
    truth:
      "Hormone levels fluctuate too widely during perimenopause for a single sample to be diagnostic. NICE guidance advises against relying on FSH to diagnose menopause in women over 45.",
  },
  {
    said: "“You’re too young for this.”",
    truth:
      "Perimenopause commonly begins in the early 40s and sometimes the late 30s. Premature ovarian insufficiency affects roughly 1 in 100 women before the age of 40.",
  },
  {
    said: "“It’s anxiety — try an antidepressant.”",
    truth:
      "Risk of depressive symptoms approximately doubles during the transition, and the hormonal contribution is well documented. Antidepressants may genuinely help, but the hormonal driver should be assessed rather than skipped.",
  },
  {
    said: "“HRT causes breast cancer.”",
    truth:
      "The 2002 WHI findings have been substantially reinterpreted since publication. For most healthy women under 60, or within ten years of menopause onset, benefits generally outweigh risks when symptoms are bothersome.",
  },
  {
    said: "“Just wait — it will pass.”",
    truth:
      "Vasomotor symptoms last a median of roughly seven years. Genitourinary symptoms and accelerated bone loss do not resolve on their own and warrant active management.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="gradient-hero pt-28 pb-20 sm:pt-40 sm:pb-28 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="float-shape absolute top-16 left-[6%] w-36 h-36 rounded-full bg-sage/12 blur-2xl" />
            <div className="float-shape-reverse absolute top-32 right-[10%] w-44 h-44 rounded-full bg-lavender/15 blur-2xl" />
            <div className="pulse-shape absolute bottom-20 left-[22%] w-52 h-52 rounded-full bg-rose/10 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-champagne mb-8">
                  <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                  <span className="text-sm font-medium text-foreground/60">
                    Evidence-based perimenopause guidance, for women everywhere
                  </span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold leading-[1.08] text-foreground tracking-tight">
                  You are not imagining it.
                  <br />
                  <span className="text-gradient italic">
                    And you are not alone in it.
                  </span>
                </h1>

                <p className="mt-7 text-lg sm:text-xl text-foreground/65 max-w-xl leading-relaxed">
                  Perimenopause affects more than a billion women, lasts years,
                  and has no single test that confirms it. HerMidlife explains
                  what is actually happening in your body — clearly, accurately,
                  and without minimising any of it.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <a
                    href="/perimenopause"
                    className="group inline-flex items-center justify-center px-8 py-4 rounded-full text-base sm:text-lg font-semibold text-white gradient-cta hover:opacity-90 transition-all shadow-xl shadow-sage-dark/15 hover:-translate-y-0.5"
                  >
                    Start with the guide
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
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
                    href="/perimenopause/library"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base sm:text-lg font-semibold text-sage-dark bg-white/80 backdrop-blur-sm border-2 border-sage/25 hover:border-sage hover:bg-white transition-all"
                  >
                    Check your symptoms
                  </a>
                </div>

                <p className="mt-8 text-sm text-foreground/45 leading-relaxed max-w-lg">
                  Free to read. No sign-up required. Clinical claims on this site
                  are attributed to a named guideline or peer-reviewed source.
                </p>
              </div>

              {/* Editorial evidence panel */}
              <div className="relative">
                <div
                  className="absolute -inset-5 bg-gradient-to-br from-sage/15 via-lavender/15 to-rose/10 rounded-[2.5rem] blur-2xl"
                  aria-hidden="true"
                />
                <div className="relative bg-white/85 backdrop-blur-md rounded-[2rem] border border-white/70 shadow-2xl overflow-hidden">
                  <div className="gradient-cta px-7 py-5 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-1">
                      The global picture
                    </p>
                    <p className="font-display text-xl font-bold leading-snug">
                      Midlife is not a niche.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-y divide-champagne/70">
                    {globalNumbers.map((n) => (
                      <div key={n.label} className="p-6">
                        <div className="font-display text-3xl sm:text-[2.1rem] font-bold text-sage-dark leading-none mb-2">
                          {n.number}
                        </div>
                        <p className="text-sm text-foreground/70 leading-snug mb-2">
                          {n.label}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-foreground/35 font-semibold leading-snug">
                          {n.source}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="px-7 py-5 bg-beige-light/70 border-t border-champagne/70">
                    <p className="text-sm text-foreground/60 leading-relaxed">
                      A billion women, years of symptoms each, and a treatment gap
                      that has never been closed. That gap is what this platform
                      exists to address.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE DISMISSAL PROBLEM ───────────────────────────── */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-start">
              <div className="animate-on-scroll">
                <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-4">
                  Why this keeps happening
                </p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.12] mb-7">
                  The problem is rarely the woman.
                  <br />
                  <span className="text-gradient italic">
                    It is usually the test.
                  </span>
                </h2>

                <div className="space-y-5 text-foreground/70 leading-relaxed text-lg">
                  <p>
                    During perimenopause, oestrogen does not decline in a smooth
                    line. It fluctuates — sometimes reaching levels higher than in
                    your twenties, sometimes dropping sharply within the same
                    cycle. Follicle-stimulating hormone swings alongside it.
                  </p>
                  <p>
                    A blood test captures one moment inside that volatility. This
                    is precisely why{" "}
                    <strong className="text-foreground">
                      NICE guideline NG23 advises diagnosing perimenopause and
                      menopause on symptoms alone in women over 45
                    </strong>
                    , without FSH testing. A &ldquo;normal&rdquo; result does not
                    mean nothing is happening. It means the test was the wrong
                    instrument for the question.
                  </p>
                  <p>
                    Combine that with consultations of ten to fifteen minutes and
                    limited menopause teaching in most medical curricula, and the
                    pattern women describe worldwide stops being surprising.
                  </p>
                </div>

                <div className="mt-8 rounded-2xl bg-beige-light border border-champagne p-6">
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    <strong className="text-foreground">
                      What this means practically:
                    </strong>{" "}
                    if you are over 45 with characteristic symptoms and cycle
                    changes, you are entitled to a clinical conversation about
                    treatment — regardless of what a hormone panel showed.
                  </p>
                </div>
              </div>

              <div className="animate-on-scroll lg:pt-16">
                <div className="rounded-3xl border border-champagne bg-cream overflow-hidden shadow-sm">
                  <div className="px-7 py-5 border-b border-champagne bg-white">
                    <p className="font-display text-lg font-bold text-foreground">
                      What women are told
                    </p>
                    <p className="text-sm text-foreground/50 mt-1">
                      — and what the evidence actually says
                    </p>
                  </div>
                  <div className="divide-y divide-champagne">
                    {misconceptions.map((row) => (
                      <div key={row.said} className="px-7 py-5">
                        <p className="font-display text-base italic text-rose-dark mb-2">
                          {row.said}
                        </p>
                        <p className="text-sm text-foreground/65 leading-relaxed">
                          {row.truth}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT WE DO ──────────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-on-scroll max-w-2xl mb-14">
              <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark mb-3">
                What HerMidlife does
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.12]">
                A reference you can trust,
                <br />
                <span className="text-gradient">and actually use.</span>
              </h2>
              <p className="mt-5 text-lg text-foreground/60 leading-relaxed">
                Three things, done properly, rather than a dozen done thinly.
              </p>
            </div>

            <div className="stagger-children grid md:grid-cols-3 gap-6">
              {pillars.map((p) => (
                <a
                  key={p.title}
                  href={p.href}
                  className={`bg-gradient-to-br ${p.accent} rounded-3xl p-8 border border-white/60 card-lift group block`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${p.iconBg} flex items-center justify-center mb-6`}
                  >
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={p.iconPath}
                      />
                    </svg>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-foreground/65 leading-relaxed mb-5 text-[15px]">
                    {p.body}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${p.linkColor}`}
                  >
                    {p.cta}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE TRANSITION, STAGED ──────────────────────────── */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-on-scroll max-w-2xl mb-14">
              <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
                The transition, staged
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-[1.12]">
                Perimenopause is not one event.
                <br />
                <span className="text-gradient-sage">It has stages.</span>
              </h2>
              <p className="mt-5 text-lg text-foreground/60 leading-relaxed">
                Clinicians stage the transition using the STRAW&nbsp;+10
                framework. Knowing roughly where you sit changes which symptoms
                are expected, which investigations are worthwhile, and which
                treatments are appropriate.
              </p>
            </div>

            <div className="space-y-4">
              {stages.map((s, i) => (
                <div
                  key={s.stage}
                  className="animate-on-scroll flex flex-col sm:flex-row gap-5 sm:gap-8 rounded-3xl border border-champagne bg-cream p-7 sm:p-8"
                >
                  <div className="sm:w-56 shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display text-2xl font-bold text-sage/40">
                        0{i + 1}
                      </span>
                      <h3 className="font-display text-lg font-bold text-foreground leading-tight">
                        {s.stage}
                      </h3>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 sm:ml-11">
                      {s.age}
                    </p>
                  </div>
                  <p className="flex-1 text-foreground/70 leading-relaxed">
                    {s.detail}
                  </p>
                </div>
              ))}
            </div>

            <p className="animate-on-scroll mt-8 text-sm text-foreground/45 leading-relaxed">
              Framework: Stages of Reproductive Aging Workshop (STRAW&nbsp;+10),
              Harlow et al., 2012 — the international standard for staging
              reproductive ageing.
            </p>
          </div>
        </section>

        {/* ── FOR CLINICIANS ──────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-foreground text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(122,168,122,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,rgba(154,172,207,0.12),transparent_55%)]" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div className="animate-on-scroll">
                <p className="text-sm font-semibold uppercase tracking-wider text-sage-light mb-3">
                  For clinicians
                </p>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.12]">
                  Built to be useful
                  <br />
                  inside the consultation.
                </h2>
                <p className="mt-6 text-lg text-white/60 leading-relaxed">
                  Much patient-facing menopause content is either too vague to act
                  on or quietly wrong. Ours is written so a GP can hand it over
                  without hesitation — and so a patient arrives having already
                  done the useful part of the history.
                </p>

                <div className="mt-9 space-y-4">
                  {[
                    "Symptom entries carry prevalence figures, the physiological mechanism, and explicit red flags requiring investigation.",
                    "Guidance is aligned to NICE NG23 and Menopause Society position statements, with sources named on the page.",
                    "Patients are directed toward staging and structured history-taking — never toward self-diagnosis or self-prescribing.",
                    "Route and formulation nuances (transdermal versus oral, micronised progesterone, low-dose vaginal oestrogen) are represented accurately.",
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-3">
                      <span className="mt-1 w-6 h-6 rounded-full bg-sage/25 flex items-center justify-center shrink-0">
                        <svg
                          className="w-3.5 h-3.5 text-sage-light"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </span>
                      <p className="text-white/70 leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <a
                    href="/perimenopause/talk-to-gp"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-semibold bg-white text-sage-dark hover:bg-cream transition-colors shadow-lg"
                  >
                    See the consultation guide
                    <svg
                      className="w-4 h-4"
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
                    href="/careers"
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-full text-base font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/25 hover:bg-white/20 transition-colors"
                  >
                    Join the clinical network
                  </a>
                </div>
              </div>

              <div className="animate-on-scroll">
                <div className="rounded-3xl bg-white/5 border border-white/12 backdrop-blur-sm p-8 sm:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage-light mb-6">
                    The evidence we work from
                  </p>
                  <ul className="space-y-5">
                    {[
                      {
                        t: "NICE NG23",
                        d: "Menopause: identification and management. Diagnosis on symptoms alone over age 45; FSH not recommended for diagnosis in that group.",
                      },
                      {
                        t: "The Menopause Society — 2022 position statement",
                        d: "For healthy women under 60, or within ten years of menopause onset, hormone therapy benefits generally outweigh risks for bothersome vasomotor symptoms and prevention of bone loss.",
                      },
                      {
                        t: "SWAN longitudinal cohort",
                        d: "Median total vasomotor symptom duration of approximately 7.4 years, exceeding ten years where onset occurs in early perimenopause.",
                      },
                      {
                        t: "STRAW +10 — Harlow et al., 2012",
                        d: "International staging framework for reproductive ageing, used throughout this site.",
                      },
                      {
                        t: "World Health Organization",
                        d: "Population scale, cardiovascular and skeletal consequences, and the global treatment gap.",
                      },
                    ].map((r) => (
                      <li key={r.t}>
                        <p className="font-semibold text-white/90 text-[15px] leading-snug mb-1">
                          {r.t}
                        </p>
                        <p className="text-sm text-white/55 leading-relaxed">
                          {r.d}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ───────────────────────────────────────── */}
        <section className="py-20 sm:py-28 gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="float-shape absolute top-10 right-[12%] w-48 h-48 rounded-full bg-sage/12 blur-3xl" />
            <div className="float-shape-reverse absolute bottom-10 left-[14%] w-40 h-40 rounded-full bg-lavender/15 blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <p className="font-display text-lg sm:text-xl italic text-foreground/50 mb-5">
              You should not have to become an expert to be believed.
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.12]">
              But until that changes,
              <br />
              <span className="text-gradient">here is the knowledge.</span>
            </h2>
            <p className="mt-6 text-lg text-foreground/60 leading-relaxed max-w-xl mx-auto">
              Free, sourced, and written for the woman living it — and for the
              clinician she is about to see.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/perimenopause"
                className="group inline-flex items-center justify-center px-9 py-4 rounded-full text-lg font-semibold text-white gradient-cta hover:opacity-90 transition-all shadow-xl hover:-translate-y-0.5"
              >
                Start reading
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
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
                href="/contact"
                className="inline-flex items-center justify-center px-9 py-4 rounded-full text-lg font-semibold text-sage-dark bg-white/80 backdrop-blur-sm border-2 border-sage/25 hover:border-sage hover:bg-white transition-all"
              >
                Get in touch
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
