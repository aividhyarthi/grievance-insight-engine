import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Careers — Join the HerMidlife Clinical Team",
  description:
    "We're hiring part-time GPs, psychologists, dietitians, sex therapists, nutritionists, gynaecologists, and endocrinologists to join Australia's first integrated midlife women's care platform.",
};

type Role = {
  title: string;
  type: string;
  count: number;
  gradient: string;
  iconPath: string;
  description: string;
  requirements: string[];
  ideal: string;
};

const roles: Role[] = [
  {
    title: "General Practitioner / Nurse Practitioner",
    type: "Part-time",
    count: 3,
    gradient: "from-rose to-rose-dark",
    iconPath:
      "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    description:
      "Telehealth consultations with Australian women navigating perimenopause, menopause, and midlife hormonal health. You'll be part of a multidisciplinary team with clear protocols and genuine clinical support.",
    requirements: [
      "FRACGP or equivalent (GP) / APHRA-registered Nurse Practitioner",
      "Interest or experience in women's health or menopause management",
      "Comfortable with telehealth delivery",
      "Empathetic communication style with diverse patient backgrounds",
    ],
    ideal: "GPs with an interest in hormonal health, HRT, or women's chronic disease management.",
  },
  {
    title: "Psychologist",
    type: "Part-time",
    count: 2,
    gradient: "from-lavender to-plum",
    iconPath:
      "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
    description:
      "Support women dealing with anxiety, depression, mood disruption, and identity shifts during midlife. Work within an integrated care team where your input directly shapes each woman's personalised plan.",
    requirements: [
      "AHPRA-registered Psychologist (General or Clinical)",
      "Experience with anxiety, depression, or women's mental health",
      "Ability to deliver sessions via telehealth",
      "Interest in the intersection of hormonal and psychological health",
    ],
    ideal: "Psychologists with experience in CBT, ACT, or mindfulness-based approaches for midlife women.",
  },
  {
    title: "Dietitian",
    type: "Part-time",
    count: 1,
    gradient: "from-sage to-sage-dark",
    iconPath:
      "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    description:
      "Help women optimise their nutrition during perimenopause and menopause — managing weight changes, metabolic shifts, bone density, and cardiovascular risk through personalised dietary guidance.",
    requirements: [
      "Accredited Practising Dietitian (APD)",
      "Knowledge of nutrition in hormonal and metabolic health",
      "Experience with telehealth or digital health delivery",
      "Cultural sensitivity working with diverse Australian communities",
    ],
    ideal: "APDs with a background in women's health, menopause nutrition, or metabolic conditions.",
  },
  {
    title: "Sex Therapist",
    type: "Part-time",
    count: 1,
    gradient: "from-rose-dark to-plum",
    iconPath:
      "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z",
    description:
      "Address the sexual health and intimacy challenges that affect women during midlife — from libido changes and genitourinary symptoms to relationship impacts and self-image. Work in a non-judgmental, integrated care model.",
    requirements: [
      "Qualified sex therapist with ASSERT, ANZSSP, or equivalent accreditation",
      "Experience discussing sexual health with diverse, multicultural clients",
      "Comfortable working within a medical team and sharing clinical insights",
      "Telehealth delivery experience",
    ],
    ideal: "Therapists experienced in menopause-related sexual dysfunction, body image, and relationship counselling.",
  },
  {
    title: "Nutritionist",
    type: "Part-time",
    count: 1,
    gradient: "from-gold to-terracotta",
    iconPath:
      "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
    description:
      "Provide evidence-based nutrition support as part of a broader holistic care plan — focusing on energy, sleep, gut health, and overall wellbeing during perimenopause and menopause.",
    requirements: [
      "Qualified Nutritionist (relevant tertiary qualification)",
      "Strong understanding of hormonal impacts on metabolism and energy",
      "Experience with group or one-on-one education programs",
      "Telehealth or digital program delivery experience",
    ],
    ideal: "Nutritionists with a background in hormonal or integrative health and a passion for women's wellbeing.",
  },
  {
    title: "Gynaecologist",
    type: "Part-time",
    count: 1,
    gradient: "from-plum to-rose",
    iconPath:
      "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
    description:
      "Provide specialist gynaecological oversight and complex case support within the HerMidlife clinical network — including HRT management, genitourinary conditions, PCOS, and post-menopausal health.",
    requirements: [
      "FRANZCOG or equivalent specialist registration in Australia",
      "Experience in menopausal management and women's reproductive health",
      "Available for telehealth consultations and complex case review",
      "Collaborative approach to multidisciplinary care",
    ],
    ideal: "Gynaecologists with a subspecialty interest in menopause, urogynaecology, or reproductive endocrinology.",
  },
  {
    title: "Endocrinologist",
    type: "Part-time",
    count: 1,
    gradient: "from-sage-dark to-plum",
    iconPath:
      "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
    description:
      "Support complex hormonal presentations including thyroid disorders, insulin resistance, adrenal health, and metabolic syndrome — conditions that frequently intersect with perimenopause and are often missed or mismanaged.",
    requirements: [
      "FRACP (Endocrinology) or equivalent specialist registration",
      "Experience with thyroid, metabolic, and adrenal conditions in women",
      "Willingness to work within a GP-led multidisciplinary model",
      "Telehealth delivery experience preferred",
    ],
    ideal: "Endocrinologists with interest in metabolic health, thyroid management, or the hormonal complexity of midlife.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-20 sm:pt-48 sm:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[8%] w-40 h-40 rounded-full bg-rose/10 blur-2xl" />
          <div className="float-shape-reverse absolute top-32 right-[10%] w-56 h-56 rounded-full bg-lavender/15 blur-3xl" />
          <div className="pulse-shape absolute bottom-10 left-[30%] w-48 h-48 rounded-full bg-sage/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Work With Us
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Clinicians who believe
            <br />
            <span className="text-gradient">women deserve better</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building Australia&apos;s first fully integrated midlife care platform —
            and we need passionate clinicians ready to do medicine differently.
            Flexible, part-time, telehealth-first roles that fit around your life.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/50">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-champagne">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              Telehealth-first
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-champagne">
              <span className="w-2 h-2 rounded-full bg-rose animate-pulse" />
              Part-time &amp; flexible
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-champagne">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Multidisciplinary team
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-champagne">
              <span className="w-2 h-2 rounded-full bg-plum animate-pulse" />
              Australia-wide
            </div>
          </div>
        </div>
      </section>

      {/* Why join */}
      <section className="py-16 sm:py-20 bg-white border-b border-champagne/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                title: "Work that matters",
                body: "Midlife women have been underserved for decades. At HerMidlife you are part of fixing that — with a team that takes clinical care as seriously as you do.",
                bg: "bg-blush",
                border: "border-rose-light",
                icon: "text-rose-dark",
                iconPath: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
              },
              {
                title: "Flexible scheduling",
                body: "All roles are part-time and telehealth-based. You choose your hours within a shared roster — no commute, no waiting rooms, no inflexible shifts.",
                bg: "bg-lavender-light/50",
                border: "border-lavender",
                icon: "text-plum",
                iconPath: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "A real team behind you",
                body: "You won't be working in isolation. Every clinician is supported by our CMO, clear evidence-based protocols, and a multidisciplinary team to collaborate with.",
                bg: "bg-sage-light",
                border: "border-sage",
                icon: "text-sage-dark",
                iconPath: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`${item.bg} border ${item.border} rounded-3xl p-7`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-white/60 ${item.icon} flex items-center justify-center mb-4`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.iconPath} />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-20 sm:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
              Open Positions
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              {roles.reduce((sum, r) => sum + r.count, 0)} roles across
              <br />
              <span className="text-gradient">7 disciplines</span>
            </h2>
            <p className="mt-4 text-foreground/55 max-w-xl mx-auto">
              All positions are part-time and telehealth-delivered. AHPRA registration
              required for all clinical roles.
            </p>
          </div>

          <div className="space-y-6">
            {roles.map((role) => (
              <div
                key={role.title}
                className="bg-white rounded-3xl border border-champagne/60 shadow-sm overflow-hidden"
              >
                <div className="p-7 sm:p-9">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} text-white flex items-center justify-center shrink-0 shadow-md`}
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={role.iconPath} />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-foreground leading-tight">
                          {role.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-lavender-light/60 text-plum border border-lavender/40">
                            {role.type}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sage/10 text-sage-dark border border-sage/30">
                            {role.count} {role.count === 1 ? "position" : "positions"}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose/10 text-rose-dark border border-rose-light/40">
                            Telehealth
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-foreground/70 leading-relaxed mb-6">{role.description}</p>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-3">
                        Requirements
                      </p>
                      <ul className="space-y-2">
                        {role.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2 text-sm text-foreground/65">
                            <svg className="w-4 h-4 shrink-0 mt-0.5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-lavender-light/30 rounded-2xl p-5 border border-lavender/20">
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">
                        Ideal candidate
                      </p>
                      <p className="text-sm text-foreground/65 leading-relaxed">{role.ideal}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-champagne/40">
                    <a
                      href={`mailto:listen@hermidlife.org?subject=${encodeURIComponent(`Application — ${role.title}`)}&body=${encodeURIComponent(`Hi HerMidlife team,\n\nI'd like to apply for the ${role.title} (${role.type}) position.\n\nAbout me:\n\nRegistration / qualifications:\n\nRelevant experience:\n\nWhy HerMidlife:\n`)}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-md"
                    >
                      Apply for this role
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Don&apos;t see your exact role?
            <br />
            <span className="text-gradient-sage">We still want to hear from you.</span>
          </h2>
          <p className="mt-5 text-lg text-foreground/60 leading-relaxed">
            If you&apos;re a clinician passionate about midlife women&apos;s health and want to
            be part of what we&apos;re building, reach out directly. We&apos;re always open
            to the right people.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:listen@hermidlife.org?subject=Clinician%20Expression%20of%20Interest&body=Hi%20HerMidlife%20team%2C%0A%0AI%27m%20interested%20in%20joining%20the%20clinical%20team.%20Here%27s%20a%20bit%20about%20me%3A%0A%0A"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
            >
              Get in Touch
            </a>
            <Link
              href="/team"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold text-plum bg-white hover:bg-lavender-light/60 transition-colors border border-lavender/40"
            >
              Meet the Team
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
