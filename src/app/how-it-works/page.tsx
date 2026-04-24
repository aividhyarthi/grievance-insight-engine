import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Your path to feeling like yourself again. Complete a health assessment, consult a specialist doctor, receive a personalised plan, and get ongoing care and support.",
};

const steps = [
  {
    step: "01",
    title: "Complete Your Health Assessment",
    description:
      "A guided intake that maps your hormonal health, lifestyle, and symptoms — creating a personalised profile your care team can act on immediately.",
    color: "from-rose to-rose-dark",
    image:
      "https://images.pexels.com/photos/4266931/pexels-photo-4266931.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    imageAlt: "Doctor reviewing health assessment on tablet with patient",
  },
  {
    step: "02",
    title: "Consult With a Specialist Doctor",
    description:
      "Connect with a midlife-trained GP via telehealth. No more being told it's just stress. Get real answers and a clear diagnosis — same day.",
    color: "from-plum to-rose-dark",
    image:
      "https://images.pexels.com/photos/5336963/pexels-photo-5336963.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    imageAlt: "Specialist doctor talking with patient in consultation",
  },
  {
    step: "03",
    title: "Receive Your Personalised Plan",
    description:
      "A care plan tailored to you — covering hormones, mental health, nutrition, and lifestyle. With prescriptions and medication delivered to your door.",
    color: "from-sage-dark to-sage",
    image:
      "https://images.pexels.com/photos/5327584/pexels-photo-5327584.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    imageAlt: "Doctor checking on patient and reviewing personalised care plan",
  },
  {
    step: "04",
    title: "Ongoing Care & Support",
    description:
      "Follow-ups, progress tracking, plan adjustments, and messaging with your care team. Because this journey doesn't end after one appointment.",
    color: "from-gold to-terracotta",
    image:
      "https://images.pexels.com/photos/8413204/pexels-photo-8413204.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    imageAlt: "Doctor and patient having follow-up conversation in office",
  },
];

const differentiators = [
  {
    title: "You're heard",
    description:
      "We listen — without judgement. Your symptoms are real, your experience matters, and we take the time to understand your full story.",
    icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
    bg: "bg-blush",
    icon_color: "text-rose-dark",
    border: "border-rose-light",
  },
  {
    title: "Truly personalised",
    description:
      "Your plan is built around your body, lifestyle, and culture. No cookie-cutter approaches — because every woman's experience is different.",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
    bg: "bg-lavender-light",
    icon_color: "text-plum",
    border: "border-lavender",
  },
  {
    title: "Everything in one place",
    description:
      "Doctors, dietitians, psychologists, prescriptions, and follow-ups — all coordinated in one seamless platform. No more fragmented care.",
    icon: "M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z",
    bg: "bg-sage-light",
    icon_color: "text-sage-dark",
    border: "border-sage",
  },
  {
    title: "Continuous support",
    description:
      "Your care doesn't end after one appointment. Progress tracking, plan adjustments, messaging with your care team — we're here for the long haul.",
    icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182",
    bg: "bg-beige-light",
    icon_color: "text-gold",
    border: "border-gold-light",
  },
];

export default function HowItWorksPage() {
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
            How It Works
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Your path to feeling
            <br />
            <span className="text-gradient">like yourself again</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            One platform. One care team. One clear plan.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="stagger-children space-y-14">
            {steps.map((step, i) => (
              <div
                key={step.step}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="flex items-start gap-5">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-xl font-bold shadow-lg shrink-0`}
                    >
                      {step.step}
                    </div>
                    <div>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                        {step.title}
                      </h2>
                      <p className="text-foreground/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={i % 2 === 1 ? "md:order-1" : ""}>
                  <img
                    src={step.image}
                    alt={step.imageAlt}
                    className="rounded-2xl shadow-lg object-cover object-top w-full h-[220px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HerMidlife */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-on-scroll text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
              Why HerMidlife
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Care that feels different —
              <br />
              <span className="text-gradient">
                because it&apos;s built around you
              </span>
            </h2>
          </div>

          <div className="stagger-children grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className={`${item.bg} border ${item.border} rounded-3xl p-8 card-lift`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-white/60 ${item.icon_color} flex items-center justify-center mb-5`}
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
                      d={item.icon}
                    />
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

          {/* Cultural sensitivity */}
          <div className="animate-on-scroll mt-12 max-w-4xl mx-auto">
            <div className="bg-beige-light rounded-3xl overflow-hidden border border-champagne grid md:grid-cols-2 gap-0">
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  Holistic care for women&apos;s midlife health
                </h3>
                <p className="text-lg text-foreground/60 leading-relaxed">
                  We understand that culture, lifestyle, and beliefs shape your
                  health. Your care plan reflects <em>you</em> — fully.
                  Multicultural sensitivity isn&apos;t an add-on; it&apos;s built
                  into everything we do.
                </p>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.pexels.com/photos/4266938/pexels-photo-4266938.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
                  alt="Doctor and patient reviewing health plan together on tablet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 gradient-cta opacity-85" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-28 text-center">
          <div className="animate-on-scroll text-white">
            <p className="font-display text-lg sm:text-xl italic text-white/70 mb-6">
              You don&apos;t have to navigate this alone.
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Ready to feel like yourself again?
            </h2>
            <a
              href="/contact"
              className="group inline-flex items-center justify-center px-10 py-5 rounded-full text-lg font-semibold bg-white text-rose-dark hover:bg-cream transition-colors shadow-xl"
            >
              Join the Waiting List
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

      <Footer />
    </div>
  );
}
