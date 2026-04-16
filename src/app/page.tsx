import Header from "@/components/Header";
import Footer from "@/components/Footer";

const trustStats = [
  { number: "3.4M", label: "Women affected", color: "text-rose-dark" },
  { number: "71K+", label: "Sought help", color: "text-sage-dark" },
  { number: "$793M", label: "Gov investment", color: "text-gold" },
  { number: "0", label: "Accredited programs", color: "text-plum" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="gradient-hero pt-32 pb-28 sm:pt-44 sm:pb-40 wave-separator relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="float-shape absolute top-16 left-[8%] w-36 h-36 rounded-full bg-rose/10 blur-2xl" />
            <div className="float-shape-reverse absolute top-32 right-[12%] w-44 h-44 rounded-full bg-lavender/15 blur-2xl" />
            <div className="pulse-shape absolute bottom-24 left-[25%] w-52 h-52 rounded-full bg-sage/10 blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-champagne mb-10">
                  <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                  <span className="text-sm font-medium text-foreground/60">
                    Doctor-Led Care for Australian Women
                  </span>
                </div>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground tracking-tight">
                  Finally, a place where
                  <br />
                  <span className="text-gradient italic">
                    women are heard and not judged.
                  </span>
                </h1>

                <p className="mt-8 text-lg sm:text-xl text-foreground/60 max-w-2xl leading-relaxed">
                  Doctor-led, personalised care for perimenopause, menopause and
                  beyond — designed around{" "}
                  <em className="text-foreground/80 not-italic font-medium">
                    you
                  </em>
                  .
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <a
                    href="/contact"
                    className="group inline-flex items-center justify-center px-10 py-4 rounded-full text-lg font-semibold text-white gradient-cta hover:opacity-90 transition-all shadow-xl shadow-rose/20 hover:shadow-2xl hover:shadow-rose/25 hover:-translate-y-0.5"
                  >
                    Start Your Care Journey
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
                    href="/how-it-works"
                    className="inline-flex items-center justify-center px-10 py-4 rounded-full text-lg font-semibold text-rose-dark bg-white/70 backdrop-blur-sm border-2 border-rose/20 hover:border-rose hover:bg-white transition-all"
                  >
                    See How It Works
                  </a>
                </div>

                <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-foreground/50">
                  {[
                    { label: "Evidence-Based", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
                    { label: "Doctor-Led", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
                    { label: "Continuous Support", icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={t.icon} />
                      </svg>
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-rose-light/30 to-lavender-light/30 rounded-[2rem] blur-2xl" aria-hidden="true" />
                  <img
                    src="https://images.pexels.com/photos/4584638/pexels-photo-4584638.jpeg?auto=compress&cs=tinysrgb&w=700&h=800&fit=crop"
                    alt="Confident mature woman smiling"
                    className="relative rounded-3xl object-cover object-top w-full h-[540px] shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── EMOTIONAL TRUTH ─────────────────────────────────── */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-on-scroll text-center max-w-3xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-4">
                We hear you
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-8">
                You&apos;ve been told it&apos;s
                <br />
                <span className="text-gradient italic">
                  &ldquo;just stress.&rdquo;
                </span>
              </h2>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  '"It\'s just stress."',
                  '"Your tests are normal."',
                  '"This is part of ageing."',
                ].map((quote) => (
                  <span
                    key={quote}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-light/40 text-foreground/60 text-sm font-medium border border-rose-light"
                  >
                    <svg className="w-3.5 h-3.5 text-rose-dark shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="italic">{quote}</span>
                  </span>
                ))}
              </div>

              <p className="text-xl text-foreground/80 leading-relaxed mb-2">
                But you still don&apos;t feel like yourself.
              </p>
              <p className="text-lg text-foreground/60 leading-relaxed mb-8">
                At HerMidlife, we don&apos;t dismiss your symptoms. We
                understand them, and treat them with a patient-first approach.
              </p>
              <a
                href="/perimenopause"
                className="inline-flex items-center gap-2 text-rose-dark font-semibold hover:text-plum transition-colors"
              >
                Learn about perimenopause
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ── WHAT WE DO (3 pillars) ──────────────────────────── */}
        <section className="py-20 sm:py-28 bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-on-scroll text-center mb-14">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Everything you need,
                <br />
                <span className="text-gradient">in one place</span>
              </h2>
            </div>

            <div className="stagger-children grid md:grid-cols-3 gap-6">
              <a
                href="/what-we-treat"
                className="bg-gradient-to-br from-blush to-rose-light/40 rounded-3xl p-8 border border-white/60 card-lift group block"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose/10 text-rose-dark flex items-center justify-center mb-6">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  Specialist Midlife Care
                </h3>
                <p className="text-foreground/60 leading-relaxed mb-4">
                  Perimenopause, menopause, HRT, mental health, weight, sleep,
                  heart health, thyroid — the full spectrum, not just hormones.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-dark group-hover:text-plum transition-colors">
                  See what we treat
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>

              <a
                href="/how-it-works"
                className="bg-gradient-to-br from-lavender-light to-lavender/30 rounded-3xl p-8 border border-white/60 card-lift group block"
              >
                <div className="w-14 h-14 rounded-2xl bg-lavender/20 text-plum flex items-center justify-center mb-6">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  Truly Personalised
                </h3>
                <p className="text-foreground/60 leading-relaxed mb-4">
                  A guided health assessment, specialist consultation, personalised
                  plan, and ongoing care. All from one team who knows your story.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-plum group-hover:text-rose-dark transition-colors">
                  See how it works
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>

              <a
                href="/for-employers"
                className="bg-gradient-to-br from-sage-light to-sage/20 rounded-3xl p-8 border border-white/60 card-lift group block"
              >
                <div className="w-14 h-14 rounded-2xl bg-sage/20 text-sage-dark flex items-center justify-center mb-6">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  For Employers
                </h3>
                <p className="text-foreground/60 leading-relaxed mb-4">
                  Corporate wellness programs, expert webinars, and subscription
                  care plans. Support the women driving your business.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-sage-dark group-hover:text-plum transition-colors">
                  Learn more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ── TRUST STATS STRIP ───────────────────────────────── */}
        <section className="py-16 sm:py-20 bg-foreground text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,114,122,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(143,170,139,0.12),transparent_50%)]" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="stagger-children grid grid-cols-2 lg:grid-cols-4 gap-4">
              {trustStats.map((s) => (
                <div
                  key={s.number}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm card-lift"
                >
                  <div className={`stat-glow text-3xl sm:text-4xl font-display font-bold ${s.color} mb-1`}>
                    {s.number}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-white/40">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <p className="animate-on-scroll text-center mt-8 text-sm text-white/40">
              Sources: Australian Government Senate Inquiry 2024, MBS Online 2026, 2025-26 Federal Budget
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────�� */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/5876503/pexels-photo-5876503.jpeg?auto=compress&cs=tinysrgb&w=1400&h=600&fit=crop"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-cta opacity-85" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_50%)]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-28">
            <div className="animate-on-scroll max-w-3xl mx-auto text-center text-white">
              <p className="font-display text-lg sm:text-xl italic text-white/70 mb-6">
                You don&apos;t have to navigate this alone.
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Care that listens,
                <br />
                understands, and stays.
              </h2>
              <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
                The first fully integrated platform for personalised midlife care
                — combining medical expertise, emotional understanding, and
                continuous support.
              </p>
              <a
                href="/contact"
                className="group inline-flex items-center justify-center mt-10 px-10 py-5 rounded-full text-lg font-semibold bg-white text-rose-dark hover:bg-cream transition-colors shadow-xl"
              >
                Start Your Care Journey
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
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
