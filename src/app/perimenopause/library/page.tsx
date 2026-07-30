import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Symptom Library",
  description:
    "Common perimenopause symptoms explained — approximate prevalence, the physiological mechanism, what the evidence says helps, and the red flags that need medical review.",
};

type Symptom = {
  icon: string;
  name: string;
  tag: string;
  tagColor: string;
  prevalence: string;
  why: string;
  helps: string;
  gp: string;
};

const symptoms: Symptom[] = [
  {
    icon: "🔥",
    name: "Hot Flushes",
    tag: "Vasomotor",
    tagColor: "bg-blush text-rose-dark",
    prevalence: "≈ 75–80% of women",
    why: "Falling oestrogen narrows the hypothalamic thermoneutral zone and upregulates KNDy neurons in the temperature-control centre. A small rise in core temperature that would previously go unnoticed now triggers a full heat-dissipation response — flushing, sweating and skin vasodilation.",
    helps: "Layered clothing, cool ambient temperature, and identifying personal triggers (alcohol, caffeine, spicy food, warm rooms). Where symptoms are bothersome, hormone therapy is the most effective treatment; SSRIs, SNRIs, gabapentin and the newer neurokinin-3 antagonists are alternatives. CBT reduces the distress and impact of flushes even when frequency is unchanged.",
    gp: "Symptoms are disrupting sleep, work or daily life. Effective treatment exists — persisting without it is not necessary.",
  },
  {
    icon: "🌙",
    name: "Night Sweats",
    tag: "Vasomotor",
    tagColor: "bg-blush text-rose-dark",
    prevalence: "Very common alongside flushes",
    why: "The same thermoregulatory mechanism as hot flushes, occurring during sleep. Because each episode causes a partial awakening, night sweats fragment sleep architecture even when a woman does not fully wake — which is why daytime fatigue can be severe despite apparently adequate hours in bed.",
    helps: "A cool bedroom, breathable natural-fibre bedding and layered nightwear that can be removed. Reducing alcohol in the evening has a measurable effect. Treating the underlying vasomotor symptoms usually resolves the sleep disruption too.",
    gp: "Sleep is repeatedly disrupted. Also mention drenching night sweats with weight loss or fever, which need separate investigation.",
  },
  {
    icon: "📅",
    name: "Irregular Periods",
    tag: "Cycle",
    tagColor: "bg-blush text-rose-dark",
    prevalence: "Near-universal during the transition",
    why: "As the follicle pool depletes, ovulation becomes intermittent. Cycles typically shorten first, then become variable by seven days or more, and eventually skip. Anovulatory cycles produce little progesterone, so the endometrium is exposed to unopposed oestrogen — which is why bleeding can become notably heavier before it stops.",
    helps: "Tracking cycle length and flow gives your clinician the single most useful piece of information for staging the transition. Heavy bleeding is treatable — the levonorgestrel intrauterine system, tranexamic acid and hormonal options are all effective.",
    gp: "Bleeding between periods, after sex, soaking through protection hourly, lasting beyond seven days, or any bleeding at all after twelve months without a period. Postmenopausal bleeding always requires investigation.",
  },
  {
    icon: "🧠",
    name: "Brain Fog",
    tag: "Cognitive",
    tagColor: "bg-lavender-light text-plum",
    prevalence: "≈ 40–60% report cognitive change",
    why: "Oestrogen receptors are dense in the hippocampus and prefrontal cortex, and oestrogen supports glucose metabolism and synaptic function in those regions. Measurable dips in verbal memory and processing speed occur during perimenopause. Sleep fragmentation compounds the effect substantially.",
    helps: "Sleep is the highest-yield target — treating night sweats and insomnia often improves cognition markedly. Aerobic and resistance exercise, reducing alcohol, and managing vasomotor symptoms all contribute. Reassuringly, longitudinal data indicate cognitive performance generally recovers after the transition.",
    gp: "Cognitive change is progressive, affects orientation or word-finding severely, or is out of proportion to other symptoms — thyroid function, B12, iron and mood should be assessed.",
  },
  {
    icon: "😰",
    name: "Anxiety",
    tag: "Emotional",
    tagColor: "bg-lavender-light text-plum",
    prevalence: "Commonly reported; often new-onset",
    why: "Oestrogen modulates serotonin and noradrenaline signalling, while progesterone's metabolite allopregnanolone acts on GABA-A receptors — the same target as anxiolytic medication. When both fluctuate unpredictably, the nervous system loses a stabilising input. New-onset anxiety in the early forties, without a corresponding life stressor, is a recognised presentation.",
    helps: "Understanding the biological basis is genuinely therapeutic — many women describe relief simply at being told it is not a character failing. CBT has strong evidence. Regular exercise, reduced caffeine and alcohol, and treating sleep disruption all help. Where symptoms are hormonally driven, hormone therapy may improve them; where they are established, SSRIs or SNRIs may be more appropriate.",
    gp: "Anxiety is affecting your functioning or relationships, includes panic attacks, or comes with low mood. Both hormonal and psychological contributions should be assessed — not one instead of the other.",
  },
  {
    icon: "😔",
    name: "Low Mood & Depression",
    tag: "Emotional",
    tagColor: "bg-lavender-light text-plum",
    prevalence: "Risk approximately doubles",
    why: "Longitudinal cohorts show the risk of clinically significant depressive symptoms roughly doubles during the menopause transition compared with the premenopausal years. Vulnerability is higher in women with previous depression, premenstrual mood sensitivity, or postnatal depression — a history of hormone-sensitive mood change is the strongest predictor.",
    helps: "Effective options include psychological therapy, antidepressants, and — for mood that is clearly linked to the hormonal transition — hormone therapy, which has evidence for depressive symptoms in perimenopause specifically. Exercise and sleep treatment are meaningful adjuncts.",
    gp: "Promptly, if mood is persistently low, you have lost interest in things you valued, or you have any thoughts of self-harm. This is treatable and should not be waited out.",
  },
  {
    icon: "😤",
    name: "Mood Swings & Irritability",
    tag: "Emotional",
    tagColor: "bg-lavender-light text-plum",
    prevalence: "Among the most commonly reported",
    why: "Rapid oestrogen fluctuation destabilises the neurotransmitter systems governing emotional regulation, while intermittent ovulation removes the steadying influence of progesterone. Women frequently describe reactions that feel disproportionate and out of character — the change in emotional threshold is real, not imagined.",
    helps: "Naming the hormonal connection reduces the self-blame that often accompanies these symptoms. Consistent sleep, regular exercise, reduced alcohol, and treating co-occurring vasomotor symptoms all help. Cycle tracking alongside mood often reveals a pattern that guides treatment.",
    gp: "Irritability is damaging relationships or work, or is accompanied by persistent low mood or anxiety.",
  },
  {
    icon: "💤",
    name: "Sleep Disruption",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    prevalence: "≈ 40–60% during the transition",
    why: "Two mechanisms operate together. Declining progesterone reduces allopregnanolone-mediated GABA activity, which directly disturbs sleep architecture. Separately, night sweats fragment sleep. Many women wake reliably in the early hours — a pattern that often appears before any other recognised symptom.",
    helps: "CBT for insomnia is the recommended first-line treatment and outperforms sedatives over the long term. Consistent sleep and wake times, a cool dark room, no alcohol within three hours of bed, and limiting late caffeine all matter. Treating night sweats where present is essential.",
    gp: "Sleep problems persist beyond a few weeks. Mention loud snoring, witnessed pauses in breathing, or unrefreshing sleep despite adequate hours — obstructive sleep apnoea rises after menopause and is frequently missed in women.",
  },
  {
    icon: "🌸",
    name: "Vaginal Dryness & Discomfort",
    tag: "Urogenital",
    tagColor: "bg-blush text-rose-dark",
    prevalence: "≈ 50–70% postmenopause",
    why: "The vulva, vagina, urethra and bladder are all oestrogen-dependent. Reduced oestrogen thins the epithelium, decreases blood flow and elasticity, and raises vaginal pH — together termed genitourinary syndrome of menopause. Unlike hot flushes, this is progressive: it does not improve with time and typically worsens without treatment.",
    helps: "Non-hormonal vaginal moisturisers used regularly (not only before sex) and good lubricants help symptomatically. Low-dose vaginal oestrogen is highly effective, has minimal systemic absorption, does not require added progestogen, and can generally be continued long-term. Vaginal DHEA and oral ospemifene are alternatives where available.",
    gp: "Raise it — this is among the most treatable and most under-treated symptoms in medicine. Also report bleeding, unusual discharge, or recurrent urinary tract infections.",
  },
  {
    icon: "🚻",
    name: "Urinary Changes",
    tag: "Urogenital",
    tagColor: "bg-blush text-rose-dark",
    prevalence: "Common and under-reported",
    why: "The urethra and bladder trigone share the same oestrogen dependence as vaginal tissue. Declining oestrogen contributes to urgency, increased frequency, nocturia and recurrent urinary tract infections. Pelvic floor changes from earlier childbirth often become symptomatic in this period as tissue support reduces.",
    helps: "Low-dose vaginal oestrogen reduces recurrent urinary tract infections and improves urgency. Supervised pelvic floor muscle training has strong evidence for stress incontinence and should be offered before surgical options. Bladder training helps urgency.",
    gp: "Any blood in the urine, pain on passing urine, recurrent infections, or incontinence affecting your daily life. None of this is an inevitable consequence of age.",
  },
  {
    icon: "😓",
    name: "Fatigue",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    prevalence: "Very commonly reported",
    why: "Usually multifactorial: fragmented sleep, the metabolic effects of falling oestrogen, iron deficiency from heavy perimenopausal bleeding, and mood symptoms compounding one another. Fatigue that does not improve with rest is the presentation most likely to be dismissed and most likely to have a treatable cause.",
    helps: "Address sleep first, since it is usually the largest single contributor. Regular exercise improves fatigue despite feeling counterintuitive. Where periods have been heavy, iron studies are important — iron deficiency without anaemia still causes significant fatigue.",
    gp: "Fatigue is significant or persistent. Reasonable baseline tests include full blood count, ferritin, thyroid function, HbA1c and vitamin D.",
  },
  {
    icon: "🦴",
    name: "Joint & Muscle Aches",
    tag: "Musculoskeletal",
    tagColor: "bg-sage-light text-sage-dark",
    prevalence: "Reported by roughly half of women",
    why: "Oestrogen has anti-inflammatory activity and receptors are present in joint tissue, cartilage and tendon. Falling levels are associated with new or worsening aches, morning stiffness and tendon problems — frequently in hands, knees, shoulders and hips. Frozen shoulder shows a notable peak in this age group.",
    helps: "Progressive resistance training is the strongest intervention — it addresses joint pain, muscle mass and bone density simultaneously. Low-impact aerobic activity, adequate protein, and maintaining a healthy weight all help. Some women report improvement in joint symptoms on hormone therapy.",
    gp: "Pain is localised to one joint with swelling, redness or heat; there is morning stiffness lasting over an hour; or symptoms are progressive — inflammatory arthritis also commonly presents in this age group in women.",
  },
  {
    icon: "⚖️",
    name: "Weight & Body Shape Change",
    tag: "Cardiometabolic",
    tagColor: "bg-beige-light text-gold",
    prevalence: "Body composition change is near-universal",
    why: "Two distinct processes are often conflated. Age-related loss of muscle mass reduces resting metabolic rate. Separately, falling oestrogen shifts fat storage from hips and thighs toward the abdomen and reduces insulin sensitivity. Visceral fat gain can therefore occur even at stable weight — which is why the scale can mislead.",
    helps: "Resistance training is the highest-yield intervention because it preserves the muscle mass driving metabolic rate. Adequate protein supports that. Reducing alcohol helps sleep, visceral fat and vasomotor symptoms together. Restrictive dieting tends to accelerate muscle loss and is counterproductive here.",
    gp: "Weight change is rapid or unexplained. Given rising cardiometabolic risk across the transition, blood pressure, lipids and HbA1c are worth checking regardless.",
  },
  {
    icon: "💓",
    name: "Heart Palpitations",
    tag: "Cardiometabolic",
    tagColor: "bg-beige-light text-gold",
    prevalence: "Commonly reported, often with flushes",
    why: "Oestrogen influences vascular tone and autonomic regulation. Palpitations frequently accompany the sympathetic surge of a hot flush, and many women notice them most at night. They are usually benign in this context — but that determination belongs to a clinician, not to a website.",
    helps: "Reducing caffeine, alcohol and nicotine; managing stress; maintaining hydration. Treating vasomotor symptoms often reduces flush-associated palpitations.",
    gp: "Always mention palpitations. Seek urgent assessment for palpitations with chest pain, breathlessness, fainting or near-fainting, or a persistently fast irregular pulse — atrial fibrillation becomes more common with age and is treatable.",
  },
  {
    icon: "🫦",
    name: "Reduced Libido",
    tag: "Sexual health",
    tagColor: "bg-blush text-rose-dark",
    prevalence: "Frequently reported",
    why: "Rarely a single cause. Androgen levels decline gradually with age, but the larger contributors are usually pain from genitourinary changes, fatigue, disrupted sleep, low mood, medication effects (notably SSRIs) and relationship context. Treating pain and exhaustion often restores desire without any hormonal intervention aimed at libido itself.",
    helps: "Address the contributors first — vaginal comfort, sleep, mood, and reviewing medications. Psychosexual therapy has good evidence. Where distressing low desire persists after those are addressed, the 2019 Global Consensus Position Statement supports a trial of testosterone in postmenopausal women, though it is off-label in most countries.",
    gp: "It is affecting your wellbeing or relationship, or sex is painful. Painful sex has a specific, effective treatment and should never be accepted as normal.",
  },
  {
    icon: "🤕",
    name: "Headaches & Migraines",
    tag: "Neurological",
    tagColor: "bg-lavender-light text-plum",
    prevalence: "Often worsen during perimenopause",
    why: "Migraine is strongly oestrogen-sensitive, and it is oestrogen withdrawal rather than absolute level that most reliably triggers attacks. The erratic swings of perimenopause therefore often worsen existing migraine or produce it for the first time. Many women improve after menopause once levels stabilise.",
    helps: "Consistent sleep and meals, hydration, and identifying personal triggers. Where hormone therapy is used, continuous transdermal delivery is generally preferred over cyclical or oral routes because it avoids the withdrawal peaks that provoke attacks. Standard migraine preventives remain appropriate.",
    gp: "Headache is sudden and severe, differs in character from your usual pattern, comes with visual loss, weakness, confusion or fever, or wakes you from sleep. Migraine with aura is also relevant to contraceptive and hormone therapy choices, so mention it explicitly.",
  },
  {
    icon: "💇‍♀️",
    name: "Hair & Skin Changes",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    prevalence: "Very common",
    why: "Oestrogen supports collagen synthesis, skin hydration and the hair growth phase. Skin collagen declines measurably in the years around menopause, causing dryness and reduced elasticity. Scalp hair may thin diffusely as the relative androgen balance shifts, while facial hair can increase for the same reason.",
    helps: "Consistent emollients and daily sun protection; adequate protein and iron; gentle hair handling. Confirmed iron or thyroid deficiency should be corrected. Topical minoxidil has evidence for female pattern hair loss.",
    gp: "Hair loss is rapid, patchy, or associated with scalp scarring or inflammation — these have different causes and treatments. Ferritin and thyroid function are worth checking.",
  },
  {
    icon: "🦷",
    name: "Oral & Dental Changes",
    tag: "Physical",
    tagColor: "bg-sage-light text-sage-dark",
    prevalence: "Under-recognised",
    why: "Oral mucosa is oestrogen-responsive. Reduced oestrogen is associated with dry mouth, burning mouth sensation, altered taste, and increased susceptibility to gum inflammation. Reduced saliva also raises decay risk. This connection is rarely mentioned to women and often surprises them.",
    helps: "Diligent oral hygiene, staying hydrated, sugar-free saliva substitutes for dry mouth, and telling your dentist you are in the menopause transition so care can be adjusted.",
    gp: "See a dentist for persistent dry mouth, bleeding gums or oral pain. Report any mouth ulcer that has not healed within three weeks.",
  },
];

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="gradient-hero pt-40 pb-14 sm:pt-48 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="float-shape absolute top-24 left-[8%] w-36 h-36 rounded-full bg-sage/12 blur-2xl" />
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
          <p className="mt-5 text-lg text-foreground/65 max-w-2xl mx-auto leading-relaxed">
            {symptoms.length} common perimenopause symptoms with approximate
            prevalence, the physiological mechanism behind each one, what the
            evidence says helps, and the findings that need medical review rather
            than reassurance.
          </p>
          <div className="mt-6 inline-flex items-start gap-2 px-5 py-3 rounded-2xl bg-white/70 border border-champagne text-sm text-foreground/60 max-w-xl text-left">
            <svg className="w-4 h-4 text-rose shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              General health information, not personal medical advice. Prevalence
              figures are approximate and vary between populations and studies.
            </span>
          </div>
        </div>
      </section>

      {/* Tag legend */}
      <div className="bg-white border-b border-champagne/60 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 flex-wrap text-sm text-foreground/60">
          <span className="font-semibold text-foreground mr-1">Categories:</span>
          {[
            { l: "Vasomotor / Cycle / Urogenital", c: "bg-blush text-rose-dark" },
            { l: "Cognitive / Emotional / Neurological", c: "bg-lavender-light text-plum" },
            { l: "Physical / Musculoskeletal", c: "bg-sage-light text-sage-dark" },
            { l: "Cardiometabolic", c: "bg-beige-light text-gold" },
          ].map((t) => (
            <span
              key={t.l}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${t.c}`}
            >
              {t.l}
            </span>
          ))}
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
                    <h3 className="font-display text-lg font-bold text-foreground leading-snug">
                      {s.name}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${s.tagColor}`}
                  >
                    {s.tag}
                  </span>
                </div>

                <div className="rounded-xl bg-beige-light border border-champagne/70 px-3.5 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 mb-0.5">
                    Approximate prevalence
                  </p>
                  <p className="text-sm font-semibold text-sage-dark">
                    {s.prevalence}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-rose mb-1">
                    Why it happens
                  </p>
                  <p className="text-sm text-foreground/65 leading-relaxed">{s.why}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sage-dark mb-1">
                    What the evidence says helps
                  </p>
                  <p className="text-sm text-foreground/65 leading-relaxed">{s.helps}</p>
                </div>

                <div className="mt-auto pt-3 border-t border-champagne/60">
                  <p className="text-xs font-bold uppercase tracking-wider text-plum mb-1">
                    See a clinician if
                  </p>
                  <p className="text-sm text-foreground/65 leading-relaxed">{s.gp}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-champagne bg-white p-7 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">
              Sources
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Prevalence and mechanism drawn from the SWAN longitudinal cohort,
              NICE guideline NG23 (Menopause: identification and management), The
              Menopause Society 2022 position statement on hormone therapy, and
              the 2019 Global Consensus Position Statement on testosterone therapy
              for women. Figures are approximate and differ across populations,
              definitions and study designs. Medicine availability, licensing and
              brand names vary by country.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-white border-t border-champagne/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-xl font-bold text-foreground mb-1">
              Want to go deeper?
            </p>
            <p className="text-foreground/60 text-sm">
              Our topic guides explain the underlying mechanisms in more detail.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/perimenopause/guides"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white gradient-cta hover:opacity-90 transition-opacity shadow-md"
            >
              Topic Guides
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/perimenopause/talk-to-gp"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-sage-dark border-2 border-sage/30 hover:bg-sage-light/50 transition-colors"
            >
              Talk to Your GP
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
