export default function Hero() {
  return (
    <section className="gradient-hero pt-32 pb-28 sm:pt-44 sm:pb-40 wave-separator relative">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="float-shape absolute top-16 left-[8%] w-36 h-36 rounded-full bg-rose/10 blur-2xl" />
        <div className="float-shape-reverse absolute top-32 right-[12%] w-44 h-44 rounded-full bg-lavender/15 blur-2xl" />
        <div className="pulse-shape absolute bottom-24 left-[25%] w-52 h-52 rounded-full bg-sage/10 blur-3xl" />
        <div className="float-shape absolute bottom-16 right-[8%] w-28 h-28 rounded-full bg-gold/10 blur-xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — text content */}
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
              Doctor-led, personalised care for perimenopause, menopause and beyond
              — designed around <em className="text-foreground/80 not-italic font-medium">you</em>.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="group inline-flex items-center justify-center px-10 py-4 rounded-full text-lg font-semibold text-white gradient-cta hover:opacity-90 transition-all shadow-xl shadow-rose/20 hover:shadow-2xl hover:shadow-rose/25 hover:-translate-y-0.5"
              >
                Join the Waiting List
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-10 py-4 rounded-full text-lg font-semibold text-rose-dark bg-white/70 backdrop-blur-sm border-2 border-rose/20 hover:border-rose hover:bg-white transition-all"
              >
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-foreground/50">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Evidence-Based
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Doctor-Led
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Continuous Support
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                Culturally Aware
              </div>
            </div>
          </div>

          {/* Right — hero image */}
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
  );
}
