const stats = [
  {
    number: "1B+",
    label: "women affected",
    description: "Women globally who will experience perimenopause or menopause by 2025, according to WHO estimates",
    source: "World Health Organization",
    color: "text-rose-dark",
    bg: "bg-blush/60 border-rose-light",
  },
  {
    number: "1 in 3",
    label: "never discussed",
    description: "Women who have never had a conversation with their doctor about menopause symptoms",
    source: "Menopause Society, 2024",
    color: "text-sage-dark",
    bg: "bg-sage-light/60 border-sage",
  },
  {
    number: "$150B",
    label: "productivity lost",
    description: "Estimated global annual economic cost of unmanaged menopause symptoms in the workforce",
    source: "Newson Health Research, 2023",
    color: "text-gold",
    bg: "bg-beige-light border-champagne",
  },
  {
    number: "<1%",
    label: "research funding",
    description: "Share of global health research budget dedicated to menopause and women's midlife health",
    source: "Lancet Women, 2024",
    color: "text-plum",
    bg: "bg-lavender-light/60 border-lavender",
  },
];

export default function TrustStats() {
  return (
    <section className="py-20 sm:py-28 bg-foreground text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(122,168,122,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(154,172,207,0.12),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="animate-on-scroll text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose-light mb-3">
            The Numbers Don&apos;t Lie
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            The world is finally investing in
            <br />
            women&apos;s midlife health
          </h2>
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            You deserve better care. The data proves the demand is real — and growing.
          </p>
        </div>

        <div className="stagger-children grid grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {stats.map((stat) => (
            <div
              key={stat.number}
              className="bg-white/5 border border-white/10 rounded-3xl p-7 text-center backdrop-blur-sm card-lift"
            >
              <div className={`stat-glow text-4xl sm:text-5xl font-display font-bold ${stat.color} mb-1`}>
                {stat.number}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                {stat.label}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{stat.description}</p>
              <p className="mt-4 text-[10px] uppercase tracking-wide text-white/30 font-medium">
                {stat.source}
              </p>
            </div>
          ))}
        </div>

        <div className="animate-on-scroll max-w-2xl mx-auto text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <p className="text-sm text-white/60 leading-relaxed">
              <strong className="text-white/80">80% of women want personalised care but don&apos;t receive it.</strong>{" "}
              1 in 3 women over 50 are affected by osteoporosis, and heart disease risk increases
              significantly after menopause. These aren&apos;t just statistics — they&apos;re a call to action.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
