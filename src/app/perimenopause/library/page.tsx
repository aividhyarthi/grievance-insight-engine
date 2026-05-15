import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Symptom Library",
  description:
    "Plain-language explanations of 15 common perimenopause symptoms — what causes them, what may help, and when to see your GP.",
};

const symptoms = [
  {
    icon: "🔥",
    name: "Hot Flushes",
    tag: "Hormonal",
    tagColor: "bg-blush text-rose-dark",
    why: "Fluctuating oestrogen affects your hypothalamus — your brain's thermostat. It misreads your body temperature and triggers a heat response.",
    helps: "Dress in layers, avoid known triggers (alcohol, caffeine, spicy food), keep rooms cool. Ask your GP about MHT or non-hormonal options.",
    gp: "If hot flushes are disrupting your daily life or sleep significantly.",
  },
  {
    icon: "🌙",
    name: "Night Sweats",
    tag: "Hormonal",
    tagColor: "bg-blush text-rose-dark",
    why: "The same mechanism as hot flushes — but during sleep. You may wake drenched in sweat repeatedly through the night.",
    helps: "Cooling bedding, sleeping in layers, keeping your room below 18°C, reducing evening alcohol.",
    gp: "If night sweats are frequent and disrupting your sleep — this is very treatable.",
  },
  {
    icon: "📅",
    name: "Irregular Periods",
    tag: "Hormonal",
    tagColor: "bg-blush text-rose-dark",
    why: "As ovulation becomes less predictable, cycles become irregular — shorter, longer, heavier, lighter, or skipping entirely.",
    helps: "Track your cycle with an app or diary. Understanding your pattern helps you and your GP assess where you are in the transition.",
    gp: "If bleeding is extremely heavy, between periods, or you have pain. Always check unusual bleeding with your GP.",
  },
  {
    icon: "🧠",
    name: "Brain Fog",
    tag: "Cognitive",
    tagColor: "bg-lavender-light text-plum",
    why: "Oestrogen supports brain function. As levels fluctuate, many women experience difficulty concentrating, word-finding issues, or feeling mentally slow.",
    helps: "Sleep is the biggest lever — poor sleep worsens brain fog significantly. Regular exercise and reducing alcohol also help.",
    gp: "If cognitive changes feel severe or are affecting your work and relationships.",
  },
  {
    icon: "😤",
    name: "Mood Swings & Irritability",
    tag: "Emotional",
    tagColor: "bg-lavender-light text-plum",
    why: "Oestrogen and progesterone influence serotonin and other mood chemicals. As they fluctuate, emotional regulation becomes harder — often feeling out of character.",
    helps: "Naming the hormonal connection is powerful. Regular exercise, good sleep, reducing stimulants, and talking therapy all help.",
    gp: "If mood changes are severe, persistent, or concerning to you or those around you.",
  },
  {
    icon: "😰",
    name: "Anxiety",
    tag: "Emotional",
    tagColor: "bg-lavender-light text-plum",
    why: "New or worsening anxiety during perimenopause is very common and directly linked to hormonal changes — not just life stress.",
    helps: "Understanding the hormonal link is the first step. Breathwork, mindfulness, reducing caffeine, and physical activity can all help.",
    gp: "If anxiety is impacting your daily life — there are good treatment options available.",
  },
  {
    icon: "💤",
    name: "Sleep Disruption",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Progesterone supports deep sleep. As it declines, many women start waking at 3am or lose deep restorative sleep — even before other symptoms appear.",
    helps: "Consistent bed/wake times, cool dark room, no alcohol within 3 hours of bed, limiting caffeine after 2pm.",
    gp: "If sleep disruption is persistent and affecting your health and functioning.",
  },
  {
    icon: "😓",
    name: "Fatigue",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "A combination of poor sleep, hormonal shifts, and the metabolic impact of oestrogen decline can cause persistent tiredness that rest does not fully fix.",
    helps: "Prioritise sleep, exercise regularly (even short walks help), eat iron-rich foods if periods are heavy.",
    gp: "If fatigue is severe — your GP may want to check thyroid, iron levels, and vitamin D.",
  },
  {
    icon: "💔",
    name: "Heart Palpitations",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Oestrogen plays a role in cardiovascular function. Fluctuating levels can cause the heart to feel like it is racing, fluttering, or skipping — particularly around hot flushes.",
    helps: "Reducing caffeine and alcohol, managing stress, staying hydrated can reduce frequency.",
    gp: "Always mention palpitations to your GP, especially if frequent or accompanied by chest pain or faintness.",
  },
  {
    icon: "🦴",
    name: "Joint & Muscle Aches",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Oestrogen has an anti-inflammatory effect on joints. As levels fall, many women notice new or worsening aches — particularly in knees, hips, and hands.",
    helps: "Low-impact exercise (swimming, walking, yoga), anti-inflammatory foods, staying hydrated, maintaining a healthy weight.",
    gp: "If joint pain is severe, localised to one joint, or comes with swelling or redness.",
  },
  {
    icon: "⚖️",
    name: "Weight Changes",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Metabolic rate slows and fat distribution shifts — often from hips to abdomen — as oestrogen declines. This is physiological, not simply a lifestyle issue.",
    helps: "Strength training (maintains muscle mass and metabolic rate), a protein-rich diet, reducing processed foods and alcohol, adequate sleep.",
    gp: "If weight gain is rapid or unexpected, worth checking thyroid and metabolic function.",
  },
  {
    icon: "🌸",
    name: "Vaginal Dryness",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Oestrogen keeps vaginal tissues lubricated and elastic. As levels fall, the vaginal wall thins and dries — causing discomfort, particularly during sex.",
    helps: "Over-the-counter vaginal moisturisers used regularly (not just during sex) and lubricants can help. Localised oestrogen therapy is very effective.",
    gp: "This is very treatable — do not put up with it. Bring it up with your GP.",
  },
  {
    icon: "🫦",
    name: "Reduced Libido",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Testosterone (women have it too) declines during perimenopause and can reduce sexual desire. Vaginal dryness, fatigue, and mood changes compound this.",
    helps: "Addressing contributing factors (sleep, mood, vaginal comfort) often helps. Open communication with your partner and GP matters.",
    gp: "If reduced libido is affecting your relationship or wellbeing — your GP can discuss options including testosterone therapy.",
  },
  {
    icon: "💇‍♀️",
    name: "Hair & Skin Changes",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Oestrogen supports hair growth and skin elasticity. As levels fall, some women notice hair thinning or skin becoming drier.",
    helps: "Gentle hair care, a diet rich in protein and iron, and good skincare. Discuss significant hair loss with your GP.",
    gp: "If hair loss is rapid or patchy — worth checking thyroid and iron levels too.",
  },
  {
    icon: "🤕",
    name: "Headaches & Migraines",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    why: "Many women find headaches worsen during perimenopause due to oestrogen fluctuations. Others experience new headaches for the first time.",
    helps: "Staying hydrated, consistent sleep, identifying and avoiding personal triggers, and managing stress.",
    gp: "If headaches are severe, frequent, or changing in character — especially with neurological symptoms.",
  },
];

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-48 pb-14 sm:pt-56 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-24 left-[8%] w-36 h-36 rounded-full bg-rose/10 blur-2xl" />
          <div className="float-shape-reverse absolute top-36 right-[10%] w-48 h-48 rounded-full bg-lavender/15 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Symptom Library
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            What you might be feeling —
            <br />
            <span className="text-gradient italic">and why</span>
          </h1>
          <p className="mt-5 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            15 common perimenopause symptoms explained in plain language. What causes
            them, what may help, and when to see your GP.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blush/60 border border-rose-light/50 text-sm text-foreground/60">
            <svg className="w-4 h-4 text-rose shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            General information only — always talk to your GP about your symptoms.
          </div>
        </div>
      </section>

      {/* Tag legend */}
      <div className="bg-white border-b border-champagne/60 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 flex-wrap text-sm text-foreground/60">
          <span className="font-semibold text-foreground">Categories:</span>
          <span className="px-3 py-1 rounded-full bg-blush text-rose-dark text-xs font-semibold">Hormonal</span>
          <span className="px-3 py-1 rounded-full bg-lavender-light text-plum text-xs font-semibold">Cognitive / Emotional</span>
          <span className="px-3 py-1 rounded-full bg-sage-light text-sage-dark text-xs font-semibold">Physical</span>
        </div>
      </div>

      {/* Symptom grid */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {symptoms.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-3xl p-6 border border-champagne/80 card-lift flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <h3 className="font-display text-lg font-bold text-foreground">{s.name}</h3>
                  </div>
                  <span className={`shrink-0 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${s.tagColor}`}>
                    {s.tag}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose mb-1">Why it happens</p>
                  <p className="text-sm text-foreground/65 leading-relaxed">{s.why}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage-dark mb-1">What may help</p>
                  <p className="text-sm text-foreground/65 leading-relaxed">{s.helps}</p>
                </div>

                <div className="mt-auto pt-3 border-t border-champagne/60">
                  <p className="text-xs font-bold uppercase tracking-wider text-plum mb-1">See your GP if</p>
                  <p className="text-sm text-foreground/65 leading-relaxed">{s.gp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-white border-t border-champagne/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-xl font-bold text-foreground mb-1">Want to go deeper?</p>
            <p className="text-foreground/60 text-sm">Our topic guides explain the underlying causes in more detail.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="/perimenopause/guides" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-md">
              Topic Guides
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="/perimenopause/talk-to-gp" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-rose-dark border-2 border-rose-light hover:bg-blush transition-colors">
              Talk to Your GP
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
