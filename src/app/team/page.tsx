import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Our Team — HerMidlife Founders",
  description:
    "Meet the founders of HerMidlife — Dr Archana Singh, Dr Padma Gadiyar, and Rudra Kasturi. A team united by a shared belief that every Australian woman deserves expert midlife care.",
};

type Founder = {
  name: string;
  role: string;
  title: string;
  photo: string;
  initials: string;
  gradient: string;
  linkedin: string;
  bio: string[];
  focus: string[];
};

const founders: Founder[] = [
  {
    name: "Dr Archana Singh",
    role: "CEO & Co-Founder",
    title: "Chief Executive Officer",
    photo: "/dr-archana.jpeg",
    initials: "AS",
    gradient: "from-rose via-rose-dark to-plum",
    linkedin: "https://www.linkedin.com/in/dr-archana-singh-19a62361/",
    bio: [
      "Dr Archana Singh is the visionary founder of HerMidlife, setting the strategic direction for Australia's first fully integrated midlife care platform. With years of clinical experience in women's health, Archana has seen first-hand how perimenopause and menopause are repeatedly dismissed, misdiagnosed, or quietly endured — and she's rebuilding the experience from the ground up.",
      "Her mission is simple: every Australian woman over 35 deserves to walk into a consult and feel heard, not hurried. Under her leadership, HerMidlife combines evidence-based medical care, emotional understanding, and continuous digital support into one seamless journey.",
    ],
    focus: [
      "Clinical leadership & care model",
      "Women's health advocacy",
      "Evidence-based protocols",
      "Doctor-led product design",
    ],
  },
  {
    name: "Dr Padma Gadiyar",
    role: "CBO & Co-Founder",
    title: "Chief Business Officer",
    photo: "/dr-padma.jpeg",
    initials: "PG",
    gradient: "from-sage via-sage-dark to-plum",
    linkedin: "https://www.linkedin.com/in/drpadmagadiyar/",
    bio: [
      "Dr Padma Gadiyar leads business growth, partnerships, and go-to-market strategy at HerMidlife. A qualified doctor with a deep commercial instinct, Padma bridges the worlds of clinical care and business — translating medical insight into sustainable, scalable operations.",
      "She is responsible for building HerMidlife's partner network of clinicians, allied health professionals, corporate wellness programs, and community organisations across Australia. Padma believes midlife women's health is not a niche — it's one of the largest, most underserved markets in healthcare today.",
    ],
    focus: [
      "Partnerships & clinician network",
      "Corporate wellness programs",
      "Go-to-market & growth",
      "Operational excellence",
    ],
  },
  {
    name: "Rudra Kasturi",
    role: "CSO & Co-Founder",
    title: "Chief Strategy Officer",
    photo: "/rudra.jpeg",
    initials: "RK",
    gradient: "from-gold via-terracotta to-rose-dark",
    linkedin: "https://www.linkedin.com/in/rudrakasturi",
    bio: [
      "Rudra Kasturi shapes the strategic direction and technology foundation that powers HerMidlife's AI-driven care platform. A seasoned technology leader and entrepreneur, Rudra brings deep experience in building digital products at scale — and an obsession with using technology to make healthcare more human, not less.",
      "At HerMidlife, Rudra leads product, engineering, and AI strategy — ensuring every feature the team ships is grounded in real clinical workflows and designed to give women faster, clearer, more compassionate care.",
    ],
    focus: [
      "Product & engineering",
      "AI and data strategy",
      "Technology architecture",
      "Investor & partner relations",
    ],
  },
];

export default function TeamPage() {
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

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Meet the Founders
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            The people behind
            <br />
            <span className="text-gradient">HerMidlife</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            A team united by a shared belief: every Australian woman deserves access
            to expert midlife care, compassion, and continuous support — without
            having to fight for it.
          </p>
        </div>
      </section>

      {/* Founder cards */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {founders.map((founder, idx) => (
            <div
              key={founder.name}
              className={`grid md:grid-cols-5 gap-10 items-start ${idx % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}
            >
              {/* Photo */}
              <div className="md:col-span-2">
                <div className="relative max-w-sm mx-auto md:mx-0">
                  <div
                    className={`absolute -inset-4 rounded-[2rem] bg-gradient-to-br ${founder.gradient} opacity-20 blur-2xl`}
                  />
                  <img
                    src={founder.photo}
                    alt={founder.name}
                    className="relative rounded-[2rem] w-full aspect-[3/4] object-cover shadow-2xl ring-4 ring-white"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose mb-2">
                  {founder.role}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-1">
                  {founder.name}
                </h2>
                <p className="text-base text-foreground/50 mb-6">{founder.title}</p>

                <div className="space-y-4 text-foreground/75 leading-relaxed mb-8">
                  {founder.bio.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-3">
                    Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {founder.focus.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-lavender-light/60 text-plum border border-lavender/40"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#0A66C2] text-white hover:bg-[#084a94] transition-colors shadow-md"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 sm:py-28 bg-lavender-light/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Building the future of
            <br />
            <span className="text-gradient-sage">midlife care in Australia</span>
          </h2>
          <p className="mt-6 text-lg text-foreground/60 leading-relaxed">
            Whether you&apos;re a clinician, a corporate partner, an investor, or a
            woman looking for better care — we&apos;d love to hear from you.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
            >
              Get in Touch
            </Link>
            <Link
              href="/#about"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold text-plum bg-white hover:bg-lavender-light/60 transition-colors border border-lavender/40"
            >
              Learn About HerMidlife
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
