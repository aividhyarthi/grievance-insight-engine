"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Inquiry =
  | "general"
  | "care"
  | "partnership"
  | "corporate"
  | "press"
  | "investor";

const inquiryOptions: { value: Inquiry; label: string }[] = [
  { value: "general", label: "General question" },
  { value: "care", label: "I'm looking for care" },
  { value: "partnership", label: "Clinical / partnership enquiry" },
  { value: "corporate", label: "Corporate wellness programs" },
  { value: "press", label: "Press & media" },
  { value: "investor", label: "Investor enquiry" },
];

const timelineOptions = [
  "As soon as possible",
  "Within the next month",
  "In the next 3 months",
  "Just exploring for now",
];

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiry, setInquiry] = useState<Inquiry>("care");
  const [challenges, setChallenges] = useState("");
  const [beta, setBeta] = useState("");
  const [timeline, setTimeline] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("inquiry");
    if (q && inquiryOptions.some((o) => o.value === q)) {
      setInquiry(q as Inquiry);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLabel =
      inquiryOptions.find((o) => o.value === inquiry)?.label ?? "General question";
    const fullName = `${firstName} ${lastName}`.trim();
    const subject = `[Waiting List] ${fullName} — HerMidlife`;
    const body = [
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Enquiry type: ${selectedLabel}`,
      ``,
      `Top 3 challenges:`,
      challenges,
      ``,
      `Open to beta group: ${beta}`,
      `How soon looking for support: ${timeline}`,
      message ? `\nAdditional message:\n${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const mailto = `mailto:listen@hermidlife.org?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  };

  const inputClass =
    "w-full px-5 py-3 rounded-2xl bg-white border border-champagne text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose transition-all";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-20 sm:pt-48 sm:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-20 left-[10%] w-40 h-40 rounded-full bg-rose/10 blur-2xl" />
          <div className="float-shape-reverse absolute top-32 right-[12%] w-52 h-52 rounded-full bg-lavender/15 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Be the First
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Join the
            <br />
            <span className="text-gradient">waiting list</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            HerMidlife is launching soon. Join our waiting list to be among the
            first to access doctor-led, personalised midlife care — or reach out
            about partnerships and investment.
          </p>
        </div>
      </section>

      {/* Form + info */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Left — info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Talk to us directly
                </h2>
                <p className="text-foreground/60 leading-relaxed">
                  The fastest way to reach the HerMidlife team is by email. We read
                  every message personally and reply within two business days.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-rose/10 text-rose-dark flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">Email</p>
                    <a href="mailto:listen@hermidlife.org" className="font-display text-lg font-bold text-foreground hover:text-rose transition-colors">
                      listen@hermidlife.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-sage/15 text-sage-dark flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">Based in</p>
                    <p className="font-display text-lg font-bold text-foreground">Melbourne, Australia</p>
                    <p className="text-sm text-foreground/50">Serving women across Australia</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">Response time</p>
                    <p className="font-display text-lg font-bold text-foreground">Within 2 business days</p>
                    <p className="text-sm text-foreground/50">Mon–Fri, Melbourne time</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl p-6 bg-lavender-light/40 border border-lavender/30">
                <p className="font-display text-base font-bold text-foreground mb-2">
                  Looking for urgent medical care?
                </p>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  HerMidlife is not an emergency service. If you need urgent medical
                  help, please call <strong>000</strong> or contact your local GP.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <div className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="bg-cream rounded-3xl p-8 sm:p-10 border border-champagne/40 shadow-sm space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-foreground mb-2">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-foreground mb-2">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                    Contact number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="04XX XXX XXX"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="inquiry" className="block text-sm font-semibold text-foreground mb-2">
                    What&apos;s this about?
                  </label>
                  <select
                    id="inquiry"
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value as Inquiry)}
                    className={inputClass}
                  >
                    {inquiryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="challenges" className="block text-sm font-semibold text-foreground mb-2">
                    What are your top 3 challenges right now?
                  </label>
                  <textarea
                    id="challenges"
                    required
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    rows={3}
                    placeholder="e.g. sleep disruption, weight gain, anxiety, brain fog..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label htmlFor="beta" className="block text-sm font-semibold text-foreground mb-2">
                    Would you be open to joining our beta group of menopause trailblazers?
                  </label>
                  <select
                    id="beta"
                    required
                    value={beta}
                    onChange={(e) => setBeta(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="Yes, absolutely!">Yes, absolutely!</option>
                    <option value="Maybe — tell me more">Maybe — tell me more</option>
                    <option value="Not right now">Not right now</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="timeline" className="block text-sm font-semibold text-foreground mb-2">
                    How soon are you looking for support?
                  </label>
                  <select
                    id="timeline"
                    required
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>Select a timeline</option>
                    {timelineOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                    Anything else you&apos;d like to share?{" "}
                    <span className="font-normal text-foreground/40">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Tell us anything else on your mind..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
                >
                  Join the Waiting List
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>

                {sent && (
                  <div className="rounded-2xl p-4 bg-sage-light/60 border border-sage/30 text-sage-dark text-sm">
                    Your email app should have opened with your details ready to send.
                    If it didn&apos;t, please write to{" "}
                    <a href="mailto:listen@hermidlife.org" className="font-semibold underline">
                      listen@hermidlife.org
                    </a>{" "}
                    directly.
                  </div>
                )}

                <p className="text-xs text-foreground/40 text-center">
                  By joining the waiting list you agree to HerMidlife contacting you.
                  We&apos;ll never share your details.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
