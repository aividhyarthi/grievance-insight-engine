import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Talk to Your GP",
  description:
    "How to have a productive conversation with your GP about perimenopause — what to say, what to ask, and how to find a menopause-trained doctor.",
};

const openers = [
  {
    label: "If you think it might be perimenopause",
    text: "I have been experiencing [symptoms] and I am wondering if this could be perimenopause. I would like to understand what is happening and what my options are.",
  },
  {
    label: "If you have been dismissed before",
    text: "I have been struggling with [symptoms] for [time period] and I would really like to properly explore whether hormones could be contributing. I would like to have a thorough conversation about this today.",
  },
  {
    label: "If you want to discuss MHT",
    text: "I have been reading about Menopausal Hormone Therapy and I would like to know if it might be appropriate for me, given my symptoms and health history. Can we discuss the options?",
  },
  {
    label: "If you are unsure what is wrong",
    text: "I have not been feeling like myself. I am experiencing [symptoms]. I would like to check whether perimenopause could be contributing, and also whether we should rule out anything else like thyroid issues.",
  },
];

const questions = [
  "Do you think I could be in perimenopause?",
  "Are there any tests you would recommend — and what will they or will they not tell us?",
  "What are my treatment options for [your main symptom]?",
  "Can you explain the benefits and risks of MHT for someone in my situation?",
  "Are there non-hormonal options I should know about?",
  "Is there anything in my health history that affects which options are appropriate for me?",
  "Should I track my symptoms between now and my next appointment? What should I note?",
  "Is there a menopause specialist or gynaecologist you would recommend if I need a referral?",
  "Are there any tests you would recommend to rule out other causes (thyroid, iron, etc.)?",
  "When should I come back to review how things are going?",
];

const resources = [
  {
    icon: "🌍",
    name: "International Menopause Society",
    note: "imsociety.org — The global professional body. Publishes international consensus statements and maintains links to national member societies worldwide.",
  },
  {
    icon: "🏛️",
    name: "The Menopause Society",
    note: "menopause.org — Formerly NAMS. Its 2022 hormone therapy position statement is one of the most widely cited references in the field, and it has a clinician finder.",
  },
  {
    icon: "📘",
    name: "NICE guideline NG23",
    note: "nice.org.uk — The UK national guideline on menopause identification and management. Freely readable, and the source of the guidance against routine FSH testing over age 45.",
  },
  {
    icon: "🇬🇧",
    name: "British Menopause Society",
    note: "thebms.org.uk — Practical, regularly updated tools and patient factsheets, including clear summaries of hormone therapy risks and benefits.",
  },
  {
    icon: "🇮🇳",
    name: "Indian Menopause Society",
    note: "indianmenopausesociety.org — Regional guidance and clinician directories relevant to South Asian women, where average menopause age is typically earlier.",
  },
  {
    icon: "🇦🇺",
    name: "Australasian Menopause Society",
    note: "ams.asn.au — Well-regarded plain-language patient information sheets and a Find a Doctor tool for menopause-trained clinicians.",
  },
];

export default function TalkToGPPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-14 sm:pt-48 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-28 right-[10%] w-44 h-44 rounded-full bg-sage/12 blur-2xl" />
          <div className="float-shape-reverse absolute top-20 left-[12%] w-36 h-36 rounded-full bg-lavender/15 blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-rose mb-3">
            Talk to Your GP
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            How to have a better
            <br />
            <span className="text-gradient italic">conversation with your doctor</span>
          </h1>
          <p className="mt-5 text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            Many women leave GP appointments feeling unheard about perimenopause.
            Being prepared makes an enormous difference.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blush/60 border border-rose-light/50 text-sm text-foreground/60">
            <svg className="w-4 h-4 text-rose shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This guide helps you prepare — it does not replace professional medical advice.
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Before your appointment */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-rose text-white font-bold text-sm flex items-center justify-center shrink-0">1</span>
              <h2 className="font-display text-2xl font-bold text-foreground">Before your appointment</h2>
            </div>
            <p className="text-foreground/60 leading-relaxed mb-6">
              GPs typically have limited appointment time — often 10–15 minutes. Arriving prepared means you use that time well.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: "📝",
                  title: "Write down your symptoms",
                  desc: "List everything you have noticed, including things that seem unrelated. Include when they started, how frequent they are, and how much they affect your daily life. Be specific — waking 3–4 times per night is more useful than sleeping badly.",
                },
                {
                  icon: "📅",
                  title: "Track your cycle first",
                  desc: "If your periods have become irregular, note the dates and flow of your last 3–6 cycles. This helps your GP assess where you might be in the transition. An app or simple diary works fine.",
                },
                {
                  icon: "🕐",
                  title: "Book a longer appointment",
                  desc: "Call ahead and ask for a longer appointment specifically about perimenopause. Many practices offer extended consultations, and some health systems fund them explicitly. Ten minutes is not enough for this conversation.",
                },
                {
                  icon: "👨‍👩‍👧",
                  title: "Know your family history",
                  desc: "If you know when your mother or sisters reached menopause, mention it. Family history of early menopause, breast cancer, heart disease, or osteoporosis is relevant to treatment decisions.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-champagne/80 p-5 card-lift">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What to say */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-rose text-white font-bold text-sm flex items-center justify-center shrink-0">2</span>
              <h2 className="font-display text-2xl font-bold text-foreground">What to say when you walk in</h2>
            </div>
            <p className="text-foreground/60 leading-relaxed mb-6">
              Many women feel awkward raising perimenopause directly. You do not need to. Here are some ways to open the conversation:
            </p>
            <div className="space-y-4">
              {openers.map((item) => (
                <div key={item.label} className="bg-white rounded-2xl border border-champagne/80 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose mb-3">{item.label}</p>
                  <div className="bg-blush/40 rounded-xl px-5 py-4 border border-rose-light/30">
                    <p className="text-foreground/70 leading-relaxed italic text-sm">&ldquo;{item.text}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Questions to ask */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-rose text-white font-bold text-sm flex items-center justify-center shrink-0">3</span>
              <h2 className="font-display text-2xl font-bold text-foreground">Questions worth asking</h2>
            </div>
            <p className="text-foreground/60 leading-relaxed mb-6">
              Save this list to your phone and take it with you.
            </p>
            <div className="bg-white rounded-2xl border border-champagne/80 p-6">
              <ul className="space-y-3">
                {questions.map((q) => (
                  <li key={q} className="flex items-start gap-3 pb-3 border-b border-champagne/50 last:border-0 last:pb-0">
                    <svg className="w-5 h-5 text-rose shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-foreground/70 leading-snug">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* If dismissed */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-lavender text-white font-bold text-sm flex items-center justify-center shrink-0">?</span>
              <h2 className="font-display text-2xl font-bold text-foreground">If you feel dismissed</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "🔄", title: "Seek a second opinion", desc: "You are always entitled to see another GP. If your concerns are not being heard, seeking a second opinion is reasonable — especially for something as significant as perimenopause management." },
                { icon: "🎯", title: "Ask for a specialist referral", desc: "You can ask your GP for a referral to a gynaecologist or a doctor with specific menopause training. This is a reasonable request." },
                { icon: "🔍", title: "Find a menopause-trained clinician", desc: "Several national menopause societies maintain clinician directories — The Menopause Society, the British Menopause Society and the Australasian Menopause Society all have finder tools. These clinicians have completed specific menopause training." },
                { icon: "📄", title: "Bring the guideline with you", desc: "NICE guideline NG23 is publicly readable and states that diagnosis over age 45 should be based on symptoms, not FSH testing. Citing a named guideline changes the tone of a difficult consultation." },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-champagne/80 p-5 card-lift">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted resources */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Trusted resources</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {resources.map((r) => (
                <div key={r.name} className="bg-white rounded-2xl border border-champagne/80 p-5 card-lift">
                  <div className="text-2xl mb-3">{r.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{r.name}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">{r.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final disclaimer */}
          <div className="flex items-start gap-3 p-5 rounded-2xl bg-blush/40 border border-rose-light/40">
            <svg className="w-5 h-5 text-rose shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-foreground/65 leading-relaxed">
              <strong className="text-foreground">Remember:</strong> this guide helps you prepare for a medical conversation — it does not give medical advice. Your GP is the right person to diagnose, investigate, and recommend treatment for your individual situation.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-white border-t border-champagne/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-xl font-bold text-foreground mb-1">Want to learn more first?</p>
            <p className="text-foreground/60 text-sm">Our symptom library and topic guides will help you go in well-informed.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="/perimenopause/library" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-md">
              Symptom Library
            </a>
            <a href="/perimenopause/guides" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-rose-dark border-2 border-rose-light hover:bg-blush transition-colors">
              Topic Guides
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
