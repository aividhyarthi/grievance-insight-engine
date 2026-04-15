const team = [
  {
    name: "Dr. Archana Singh",
    role: "CEO",
    description: "Leading HerMidlife's vision to transform perimenopause care for Australian women through technology and compassion.",
    gradient: "from-rose via-rose-dark to-plum",
    initials: "AS",
    photo: "/dr-archana.jpeg",
  },
  {
    name: "Dr. Padma Gadiyar",
    role: "CBO",
    description: "Driving business growth and partnerships to bring HerMidlife's care platform to women across Australia.",
    gradient: "from-sage via-sage-dark to-plum",
    initials: "DP",
    photo: "/dr-padma.jpeg",
  },
  {
    name: "Mr. Rudra Kasturi",
    role: "CSO",
    description: "Shaping the strategic direction and building the technology foundation that powers HerMidlife's AI-driven care.",
    gradient: "from-gold via-terracotta to-rose-dark",
    initials: "RK",
    photo: "/rudra.jpeg",
  },
];

export default function Team() {
  return (
    <section id="team" className="py-20 sm:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-on-scroll text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Our Team
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            The people behind
            <br />
            <span className="text-gradient">HerMidlife</span>
          </h2>
          <p className="mt-6 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            A team united by a shared belief: every Australian woman deserves access
            to expert midlife care.
          </p>
        </div>

        <div className="stagger-children grid sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {team.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="relative mx-auto w-36 h-36 mb-6">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${member.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="relative w-36 h-36 rounded-full object-cover shadow-xl group-hover:scale-105 transition-transform ring-4 ring-white"
                  />
                ) : (
                  <div className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-3xl font-bold shadow-xl group-hover:scale-105 transition-transform ring-4 ring-white`}>
                    {member.initials}
                  </div>
                )}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">{member.name}</h3>
              <p className="text-sm font-semibold text-rose mt-1 mb-4">{member.role}</p>
              <p className="text-sm text-foreground/60 leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/team"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-lg"
          >
            Meet the Full Team
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
