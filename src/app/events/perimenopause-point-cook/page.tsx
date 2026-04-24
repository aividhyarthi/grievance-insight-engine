import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Why Your Body Feels Different After 35 — HerMidlife Event, Point Cook",
  description:
    "Saturday, 30 May at Jamieson Way Community Centre, Point Cook. A free community event on perimenopause, hormonal and midlife health. Mood. Weight. Sleep. Hormones — what no one clearly explains.",
};

const learningPoints = [
  "Why your weight is increasing even when your lifestyle hasn't changed",
  "Why anxiety, mood swings, and low energy suddenly feel uncontrollable",
  "What's really happening to your sleep, metabolism, and hormones",
  "What most doctors don't fully explain about perimenopause",
  "Simple, practical steps you can start immediately to feel better",
  "How to take control of your body instead of feeling confused by it",
];

const gains = [
  "Learn about perimenopause & hormonal changes",
  "Understand your body and emotional wellbeing",
  "Discover practical strategies for better health",
  "Connect with experts and like-minded women",
  "Bridging the gap in midlife women's healthcare",
];

export default function PerimenopausePointCookEvent() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO — dark plum, matches the flyer */}
      <section className="gradient-event relative overflow-hidden">
        {/* Ambient blurred orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-[10%] w-80 h-80 rounded-full bg-rose/20 blur-3xl" />
          <div className="absolute top-40 right-[5%] w-96 h-96 rounded-full bg-plum/40 blur-3xl" />
          <div className="absolute bottom-10 left-[30%] w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 pb-24 sm:pt-40 sm:pb-32">
          <Link
            href="/#events"
            className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-10"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all events
          </Link>

          {/* Colourful top badges */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-rose to-rose-dark text-white shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Free Entry
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-gold to-terracotta text-white shadow-lg">
              Complimentary Lunch
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-sage to-sage-dark text-white shadow-lg">
              Limited Seats
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 backdrop-blur-md text-white border border-white/30">
              For Women 35+
            </span>
          </div>

          {/* Brand mark */}
          <div className="mb-10">
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-[0.15em] text-white uppercase">
              Her Midlife
            </p>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-gold-light mt-2">
              Empower · Educate · Transform
            </p>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-white tracking-tight">
            Why your body feels
            <br />
            <span className="italic" style={{ color: "#f0dcc0" }}>
              different after 35.
            </span>
          </h1>

          <p className="mt-8 font-display text-xl sm:text-2xl italic text-gold-light max-w-3xl">
            Mood. Weight. Sleep. Hormones — what no one clearly explains.
          </p>

          <div className="mt-10 max-w-2xl space-y-5">
            <p className="text-base sm:text-lg text-white/85 leading-relaxed">
              If you&apos;ve been feeling &lsquo;something is off&rsquo; but can&apos;t
              explain it — you&apos;re not alone. This session breaks down what&apos;s
              really happening inside your body during perimenopause, in simple,
              practical terms.
            </p>
            <p className="font-display text-lg sm:text-xl italic text-white border-l-2 border-gold pl-5">
              This is not a lecture. This is clarity you&apos;ve been missing.
            </p>
          </div>

          {/* Event quick-facts */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-3xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-light mb-1.5">
                When
              </p>
              <p className="font-display text-lg font-bold text-white">Saturday, 30 May</p>
              <p className="text-sm text-white/70">11:00 AM – 2:00 PM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-light mb-1.5">
                Where
              </p>
              <p className="font-display text-lg font-bold text-white leading-tight">Point Cook, VIC</p>
              <p className="text-sm text-white/70">Jamieson Way Community Centre</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-light mb-1.5">
                Entry
              </p>
              <p className="font-display text-lg font-bold text-white">FREE</p>
              <p className="text-sm text-white/70">Complimentary lunch</p>
            </div>
          </div>

          <div className="mt-10">
            <a
              href="https://www.eventbrite.com.au/e/her-midlife-tickets-1985653520131?aff=oddtdtcreator"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center px-10 py-4 rounded-full text-base sm:text-lg font-semibold bg-white text-plum hover:bg-gold-light transition-colors shadow-2xl"
            >
              Reserve Your Free Seat
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="mt-4 text-sm text-white/60">
              Limited seats — community hall capacity. Early registrations recommended.
            </p>
          </div>
        </div>
      </section>

      {/* Event Flyer */}
      <section className="bg-white py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="/event-flyer.jpeg"
            alt="HerMidlife — Why Your Body Feels Different After 35 event flyer, Point Cook 30 May"
            className="w-full rounded-3xl shadow-2xl border border-champagne/40"
          />
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
              What you&apos;ll learn
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              The clarity you&apos;ve
              <br />
              <span className="text-gradient">been missing</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {learningPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-lavender-light/50 rounded-3xl p-6 border border-lavender/40"
              >
                <div className="w-10 h-10 rounded-2xl bg-white text-plum flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-foreground/80 leading-relaxed font-medium pt-1.5">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Understanding Perimenopause — second flyer framing */}
      <section className="py-20 sm:py-28 bg-lavender-light/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
              Community Event
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Understanding perimenopause,
              <br />
              <span className="text-gradient">hormonal & midlife health</span>
            </h2>
            <p className="mt-6 text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Join us for an inspiring community event dedicated to supporting women
              through midlife with knowledge, compassion, and real solutions. A free
              event dedicated to women&apos;s health, menopause and hormonal wellbeing.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-lavender/30 shadow-sm max-w-3xl mx-auto">
            <h3 className="font-display text-xl font-bold text-foreground mb-5 text-center">
              What you&apos;ll gain
            </h3>
            <div className="space-y-3">
              {gains.map((gain, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-lavender-light/40 rounded-2xl p-4 border border-lavender-light"
                >
                  <span className="mt-0.5 w-7 h-7 rounded-full bg-plum text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-foreground/80 leading-relaxed pt-0.5">{gain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expert Panel — Speakers */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold mb-3">
              Expert Panel of Guest Speakers
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              Learn from experienced
              <br />
              <span className="text-gradient">doctors & practitioners</span>
            </h2>
            <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl mx-auto">
              Doctors, women&apos;s health experts, clinical practitioners and
              community leaders — sharing practical strategies to help you thrive
              with clarity and confidence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: "Dr. Preeti Khillan",
                role: "Director & Senior Obstetrician-Gynaecologist",
                gradient: "from-rose to-rose-dark",
                initials: "PK",
              },
              {
                name: "Dr. Magdalena Simonis",
                role: "Associate Professor, GP & Health Policy Advisor",
                gradient: "from-plum to-lavender",
                initials: "MS",
              },
              {
                name: "Dr. Jyoti Sharma",
                role: "Obstetrician & Gynaecologist",
                gradient: "from-sage-dark to-sage",
                initials: "JS",
              },
              {
                name: "Jasmine Hill",
                role: "Community Advocate",
                gradient: "from-gold to-terracotta",
                initials: "JH",
              },
              {
                name: "Susan McIntyre",
                role: "Wyndham City Councillor",
                gradient: "from-lavender to-plum",
                initials: "SM",
              },
              {
                name: "Narindeep Kaur",
                role: "Leadership Coach",
                gradient: "from-terracotta to-rose-dark",
                initials: "NK",
              },
              {
                name: "Poornima Peri",
                role: "Global Keynote Speaker & Hormonal Coach",
                gradient: "from-rose to-plum",
                initials: "PP",
              },
              {
                name: "Joanna Wood",
                role: "Counsellor & Midlife Coach",
                gradient: "from-sage to-sage-dark",
                initials: "JW",
              },
              {
                name: "Megan Martin",
                role: "Nutritionist & Health Coach",
                gradient: "from-gold to-gold",
                initials: "MM",
              },
            ].map((speaker) => (
              <div
                key={speaker.name}
                className="bg-lavender-light/40 rounded-3xl p-6 border border-lavender/30 text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${speaker.gradient} text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-lg`}
                >
                  {speaker.initials}
                </div>
                <p className="font-display text-base font-bold text-foreground">
                  {speaker.name}
                </p>
                <p className="text-sm text-foreground/60 mt-1">{speaker.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <div className="bg-rose/5 rounded-3xl p-6 border border-rose-light/40 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose via-rose-dark to-plum text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-lg">
                AS
              </div>
              <p className="font-display text-base font-bold text-foreground">
                Dr. Archana Singh
              </p>
              <p className="text-sm text-rose-dark font-semibold mt-1">Organiser</p>
            </div>
            <div className="bg-sage/5 rounded-3xl p-6 border border-sage/30 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage via-sage-dark to-plum text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-lg">
                PG
              </div>
              <p className="font-display text-base font-bold text-foreground">
                Dr. Padma Gadiyar
              </p>
              <p className="text-sm text-sage-dark font-semibold mt-1">Moderator</p>
            </div>
          </div>
        </div>
      </section>

      {/* Venue */}
      <section className="py-20 sm:py-28 bg-lavender-light/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-lavender/30 shadow-sm">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
                  Venue
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Jamieson Way
                  <br />
                  Community Centre
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  59 Jamieson Way
                  <br />
                  Point Cook, VIC 3030
                  <br />
                  <span className="text-foreground/50">Room: Community Hall</span>
                </p>

                <a
                  href="https://maps.google.com/?q=Jamieson+Way+Community+Centre+Point+Cook+VIC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center mt-5 text-sm font-semibold text-plum hover:text-rose-dark transition-colors"
                >
                  Open in Google Maps
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Saturday, 30 May</p>
                    <p className="text-sm text-foreground/60">11:00 AM – 2:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">FREE entry</p>
                    <p className="text-sm text-foreground/60">Complimentary lunch included</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose/10 text-rose-dark flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Limited seats</p>
                    <p className="text-sm text-foreground/60">Community hall capacity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code — scan to register */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 gradient-cta" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.2),transparent_50%)]" />

            <div className="relative z-10 grid md:grid-cols-2 gap-10 p-8 sm:p-12 items-center">
              <div className="text-white">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 mb-3">
                  Scan to Register
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-5">
                  Secure your seat
                  <br />
                  in seconds.
                </h2>
                <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-6">
                  Point your phone camera at the QR code to register instantly. No
                  forms, no payment — just show up and be seen, heard, and supported.
                </p>
                <ul className="space-y-2.5 text-white/95 text-sm sm:text-base">
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    100% free — no ticket fees
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Complimentary lunch included
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Expert doctors & practitioners
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white rounded-3xl p-6 shadow-2xl">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=https%3A%2F%2Fwww.eventbrite.com.au%2Fe%2Fher-midlife-tickets-1985653520131%3Faff%3Doddtdtcreator"
                    alt="QR code to register for the Point Cook event on Eventbrite"
                    width={280}
                    height={280}
                    className="w-[260px] h-[260px] block"
                  />
                </div>
                <p className="mt-5 text-white font-display text-lg font-bold text-center">
                  Scan with your phone camera
                </p>
                <p className="text-white/80 text-xs uppercase tracking-widest text-center mt-1">
                  Or tap the button below
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — plum gradient matching hero */}
      <section className="gradient-event relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 right-[10%] w-80 h-80 rounded-full bg-rose/15 blur-3xl" />
          <div className="absolute bottom-10 left-[15%] w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-28 text-center">
          <p className="font-display text-lg sm:text-xl italic text-gold-light mb-6">
            Do not ignore what your body is trying to tell you.
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Empower women.
          </h2>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Challenge myths.
          </h2>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-10" style={{ color: "#f0dcc0" }}>
            Lead your best life and shine.
          </h2>

          <a
            href="https://www.eventbrite.com.au/e/her-midlife-tickets-1985653520131?aff=oddtdtcreator"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center px-10 py-5 rounded-full text-lg font-semibold bg-white text-plum hover:bg-gold-light transition-colors shadow-2xl"
          >
            Claim Your FREE Ticket
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>

          <p className="mt-8 text-xs font-semibold tracking-[0.3em] uppercase text-gold-light">
            Her Midlife · Empower · Educate · Transform
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
