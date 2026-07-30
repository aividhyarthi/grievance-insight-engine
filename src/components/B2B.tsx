const offerings = [
  {
    title: "Midlife Health Programs",
    description: "Comprehensive employee wellness programs covering perimenopause, menopause, and midlife health — reducing absenteeism and improving retention.",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    title: "Expert Webinars & Workshops",
    description: "Engaging, evidence-based sessions led by specialist doctors — educating your workforce on midlife health and breaking stigma in the workplace.",
    icon: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z",
  },
  {
    title: "Subscription Care Plans",
    description: "Give your team access to personalised, ongoing midlife care — telehealth consults, care coordination, medication delivery, and continuous support.",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
];

const outcomes = [
  { metric: "Retention", description: "Reduce turnover from midlife women leaving the workforce" },
  { metric: "Wellbeing", description: "Support employees through a critical, often-invisible health stage" },
  { metric: "Productivity", description: "Address the impact — 1 in 2 women say symptoms affect work" },
  { metric: "Culture", description: "Build a workplace that truly supports all stages of life" },
];

export default function B2B() {
  return (
    <section id="b2b" className="py-20 sm:py-32 bg-sage-light/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with image */}
        <div className="animate-on-scroll grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sage-dark mb-3">
              For Employers & Partners
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Support the women
              <br />
              <span className="text-gradient-sage">in your workplace</span>
            </h2>
            <p className="mt-4 text-base font-semibold text-sage-dark italic">
              The world is finally investing in Women&apos;s Health.
            </p>
            <p className="mt-4 text-lg text-foreground/60 leading-relaxed">
              Partner with HerMidlife to provide world-class midlife health support
              for your employees. Improve retention, wellbeing, and productivity.
            </p>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://images.pexels.com/photos/3810793/pexels-photo-3810793.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
              alt="Women collaborating at a meeting in the workplace"
              className="rounded-3xl shadow-xl object-cover w-full h-[300px]"
            />
          </div>
        </div>

        <div className="stagger-children grid md:grid-cols-3 gap-6 mb-14">
          {offerings.map((item) => (
            <div key={item.title} className="bg-white rounded-3xl p-8 border border-sage/20 card-lift group">
              <div className="w-14 h-14 rounded-2xl bg-sage/10 text-sage-dark flex items-center justify-center mb-6 group-hover:bg-sage-dark group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
              <p className="text-foreground/60 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Outcomes */}
        <div className="animate-on-scroll max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sage/20">
            <h3 className="font-display text-xl font-bold text-foreground mb-6 text-center">
              What partnership delivers
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {outcomes.map((item) => (
                <div key={item.metric} className="flex items-start gap-3">
                  <span className="mt-1 w-6 h-6 rounded-full bg-sage-light flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <div>
                    <span className="font-semibold text-foreground">{item.metric}:</span>{" "}
                    <span className="text-foreground/60">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="mailto:listen@hermidlife.org"
                className="inline-flex items-center px-8 py-3 rounded-full text-sm font-semibold text-white gradient-cta-sage hover:opacity-90 transition-opacity shadow-md"
              >
                Partner With Us
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
