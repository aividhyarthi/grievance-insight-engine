const events = [
  {
    type: "Webinars",
    title: "Expert-Led Online Sessions",
    description: "Monthly webinars with specialist doctors covering perimenopause, HRT, mental health, nutrition, and more. Evidence-based, practical, and accessible from anywhere in the world.",
    image: "https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop",
    imageAlt: "Woman sharing her presentation with colleagues",
    color: "border-lavender",
  },
  {
    type: "In-Person Events",
    title: "Premium Community Gatherings",
    description: "Intimate, premium-feel events bringing women together for expert talks, wellness experiences, and genuine connection with others on the same journey.",
    image: "https://images.pexels.com/photos/7952093/pexels-photo-7952093.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop",
    imageAlt: "Joyful group of diverse women standing together",
    color: "border-rose-light",
  },
  {
    type: "Corporate Workshops",
    title: "Workplace Education",
    description: "Tailored workshops for organisations — educating leadership and teams on midlife health, reducing stigma, and building truly supportive workplaces.",
    image: "https://images.pexels.com/photos/15543217/pexels-photo-15543217.jpeg?auto=compress&cs=tinysrgb&w=500&h=300&fit=crop",
    imageAlt: "Women collaborating in a professional meeting room",
    color: "border-champagne",
  },
];

export default function Events() {
  return (
    <section id="events" className="py-20 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-on-scroll text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-plum mb-3">
            Events & Education
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Learn, connect, and feel
            <br />
            <span className="text-gradient">empowered</span>
          </h2>
          <p className="mt-6 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Practical, evidence-based guidance from experts who understand — delivered online and in person.
          </p>
        </div>

        <div className="stagger-children grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {events.map((item) => (
            <div key={item.type} className={`bg-white border ${item.color} rounded-3xl overflow-hidden card-lift shadow-sm`}>
              <img
                src={item.image}
                alt={item.imageAlt}
                className="w-full h-[200px] object-cover object-top"
              />
              <div className="p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-2">{item.type}</p>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
