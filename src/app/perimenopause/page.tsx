import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Perimenopause",
  description:
    "What is perimenopause? Why does it start? Why are so many women dismissed? HerMidlife explains the transition, the symptoms, and what you can actually do about it.",
};

const symptoms = [
  { name: "Irregular periods", category: "Hormonal" },
  { name: "Hot flushes & night sweats", category: "Hormonal" },
  { name: "Sleep disruption", category: "Physical" },
  { name: "Weight gain (especially around the middle)", category: "Physical" },
  { name: "Fatigue & low energy", category: "Physical" },
  { name: "Joint & muscle pain", category: "Physical" },
  { name: "Anxiety & panic attacks", category: "Emotional" },
  { name: "Brain fog & poor concentration", category: "Emotional" },
  { name: "Mood swings & irritability", category: "Emotional" },
  { name: "Low mood or depression", category: "Emotional" },
  { name: "Low libido", category: "Other" },
  { name: "Heart palpitations", category: "Other" },
  { name: "Dry skin, hair thinning", category: "Other" },
  { name: "Urinary changes", category: "Other" },
  { name: "Headaches & migraines", category: "Other" },
];

export default function PerimenopausePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-16 sm:pt-48 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[10%] w-40 h-40 rounded-full bg-rose/10 blur-2xl" />
          <div className="float-shape-reverse absolute top-32 right-[12%] w-52 h-52 rounded-full bg-lavender/15 blur-3xl" />
          <div className="pulse-shape absolute bottom-10 left-[30%] w-56 h-56 rounded-full bg-sage/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Understanding Perimenopause
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Something feels off —
            <br />
            <span className="text-gradient italic">and you&apos;re not imagining it</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Perimenopause is the 4–10 year transition before menopause. It can start
            in your mid-30s. Most women aren&apos;t told about it until they&apos;re
            deep inside it.
          </p>
        </div>
      </section>

      {/* The problem — emotional truth */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-4">
                We hear you
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-8">
                You&apos;ve been told it&apos;s
                <br />
                <span className="text-gradient italic">&ldquo;just stress.&rdquo;</span>
              </h2>

              <div className="space-y-4 mb-8">
                {[
                  '"It\'s just stress."',
                  '"Your tests are normal."',
                  '"This is part of ageing."',
                ].map((quote) => (
                  <div key={quote} className="flex items-start gap-3">
                    <span className="mt-1 w-6 h-6 rounded-full bg-rose-light/60 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-rose-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                    <p className="text-lg text-foreground/60 italic">{quote}</p>
                  </div>
                ))}
              </div>

              <p className="text-xl text-foreground/80 leading-relaxed mb-2">
                But you still don&apos;t feel like yourself.
              </p>
              <p className="text-lg text-foreground/60 leading-relaxed">
                At HerMidlife, we don&apos;t dismiss your symptoms. We understand
                them, name them, and treat them with a patient-first approach.
              </p>
            </div>

            {/* Stats */}
            <div className="animate-on-scroll">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "70%", desc: "of women feel dismissed by their doctor", color: "bg-blush border-rose-light" },
                  { stat: "5 yrs", desc: "average wait for a correct diagnosis", color: "bg-lavender-light border-lavender" },
                  { stat: "1 in 2", desc: "women say symptoms affect their work", color: "bg-sage-light border-sage" },
                  { stat: "10 yrs", desc: "is how long perimenopause can last", color: "bg-beige-light border-champagne" },
                ].map((item) => (
                  <div
                    key={item.stat}
                    className={`${item.color} border rounded-2xl p-6 text-center card-lift`}
                  >
                    <div className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
                      {item.stat}
                    </div>
                    <p className="text-sm text-foreground/60 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is perimenopause */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              What actually happens
              <br />
              <span className="text-gradient">during perimenopause</span>
            </h2>
          </div>

          <div className="animate-on-scroll space-y-6 max-w-3xl mx-auto">
            <p className="text-lg text-foreground/70 leading-relaxed">
              Perimenopause begins when your ovaries gradually start producing less
              oestrogen and progesterone. Unlike menopause (which is a single point in
              time — 12 months without a period), perimenopause is a <strong className="text-foreground">transition
              that can last years</strong>.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed">
              During this time, hormone levels don&apos;t decline steadily — they
              fluctuate wildly. This is why symptoms come and go, why some months
              feel normal and others feel impossible, and why standard blood tests
              often come back &quot;normal&quot; even when you feel anything but.
            </p>
            <p className="text-lg text-foreground/70 leading-relaxed">
              The average age of menopause in Australia is <strong className="text-foreground">51</strong>, but
              perimenopause can begin <strong className="text-foreground">10–15 years earlier</strong>.
              That means women in their late 30s and early 40s are often deep
              in hormonal transition — without knowing it.
            </p>
          </div>
        </div>
      </section>

      {/* Symptoms */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
              Symptoms
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              More than just hot flushes
            </h2>
            <p className="mt-4 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
              There are over 40 documented symptoms of perimenopause. Here are the
              most common ones women experience:
            </p>
          </div>

          <div className="stagger-children grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {symptoms.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-3 bg-lavender-light/40 rounded-2xl px-5 py-4 border border-lavender/30"
              >
                <svg className="w-5 h-5 text-plum shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span className="text-foreground/75 font-medium">{s.name}</span>
              </div>
            ))}
          </div>

          <div className="animate-on-scroll mt-10 text-center">
            <p className="text-foreground/50 text-sm">
              Experiencing some of these? You&apos;re not going crazy.{" "}
              <a href="/contact" className="text-plum font-semibold underline">
                Talk to us
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* CTA — event + care */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="animate-on-scroll rounded-3xl p-8 sm:p-10 gradient-card border border-rose-light/50 card-lift">
              <p className="text-xs font-bold uppercase tracking-widest text-rose mb-3">
                Free Event · 30 May
              </p>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                Why your body feels different after 35
              </h3>
              <p className="text-foreground/60 leading-relaxed mb-6">
                Join us at Point Cook for a free community event on perimenopause,
                hormonal health, and midlife. Expert doctors, real conversation,
                complimentary lunch.
              </p>
              <a
                href="/events/perimenopause-point-cook"
                className="inline-flex items-center gap-2 text-rose-dark font-semibold hover:text-plum transition-colors"
              >
                Learn more & register
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="animate-on-scroll rounded-3xl p-8 sm:p-10 gradient-card-sage border border-sage/30 card-lift">
              <p className="text-xs font-bold uppercase tracking-widest text-sage-dark mb-3">
                Get Care
              </p>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                Ready to feel like yourself again?
              </h3>
              <p className="text-foreground/60 leading-relaxed mb-6">
                Book a consultation with a midlife-trained GP who will actually listen.
                Telehealth across Australia — no referral needed.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-sage-dark font-semibold hover:text-plum transition-colors"
              >
                Start your care journey
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
