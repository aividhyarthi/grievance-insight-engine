"use client";

import { useState } from "react";
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

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiry, setInquiry] = useState<Inquiry>("general");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedLabel =
      inquiryOptions.find((o) => o.value === inquiry)?.label ?? "General question";
    const subject = `[${selectedLabel}] ${name} — HerMidlife contact form`;
    const body = `Name: ${name}\nEmail: ${email}\nEnquiry type: ${selectedLabel}\n\nMessage:\n${message}`;
    const mailto = `mailto:listen@hermidlife.org?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  };

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
            Get in Touch
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            We&apos;d love to
            <br />
            <span className="text-gradient">hear from you</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re looking for care, want to partner with us, or are
            curious about what we&apos;re building — drop us a line and we&apos;ll
            be in touch.
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">
                      Email
                    </p>
                    <a
                      href="mailto:listen@hermidlife.org"
                      className="font-display text-lg font-bold text-foreground hover:text-rose transition-colors"
                    >
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">
                      Based in
                    </p>
                    <p className="font-display text-lg font-bold text-foreground">
                      Melbourne, Australia
                    </p>
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-1">
                      Response time
                    </p>
                    <p className="font-display text-lg font-bold text-foreground">
                      Within 2 business days
                    </p>
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
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                    Your name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-5 py-3 rounded-2xl bg-white border border-champagne text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose transition-all"
                  />
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
                    className="w-full px-5 py-3 rounded-2xl bg-white border border-champagne text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose transition-all"
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
                    className="w-full px-5 py-3 rounded-2xl bg-white border border-champagne text-foreground focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose transition-all"
                  >
                    {inquiryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">
                    Your message
                  </label>
                  <textarea
                    id="message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Tell us a bit about what you're looking for..."
                    className="w-full px-5 py-3 rounded-2xl bg-white border border-champagne text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-rose/40 focus:border-rose transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
                >
                  Send Message
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>

                {sent && (
                  <div className="rounded-2xl p-4 bg-sage-light/60 border border-sage/30 text-sage-dark text-sm">
                    Your email app should have opened with your message ready to send.
                    If it didn&apos;t, please write to{" "}
                    <a
                      href="mailto:listen@hermidlife.org"
                      className="font-semibold underline"
                    >
                      listen@hermidlife.org
                    </a>{" "}
                    directly.
                  </div>
                )}

                <p className="text-xs text-foreground/40 text-center">
                  By sending a message you agree to HerMidlife contacting you about your
                  enquiry. We&apos;ll never share your details.
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
