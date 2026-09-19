// Shared "Most Searched Topics" interlinking data — one keyword cluster group
// per topic, each keyword's anchor text pointing at exactly one pillar URL so
// internal link equity concentrates on a single page per keyword instead of
// splitting across many loosely-related posts.
//
// Used by: the blog post sidebar (primary cluster + one related cluster) and
// the blog homepage (all clusters, full width).

export interface TopicLink {
  kw: string;
  url: string;
}

export interface TopicGroup {
  label: string;
  /** Lowercase tags used to detect which cluster a given post's tags belong to. */
  matchTags: string[];
  links: TopicLink[];
}

/** Pick the primary cluster for a post (best tag-overlap match) plus one related cluster. */
export function pickPostGroups(groups: TopicGroup[], postTags: string[] | undefined): TopicGroup[] {
  const lower = (postTags || []).map((t) => t.toLowerCase());
  let primaryIdx = 0;
  let bestScore = -1;
  groups.forEach((g, i) => {
    const score = g.matchTags.filter((mt) => lower.includes(mt)).length;
    if (score > bestScore) {
      bestScore = score;
      primaryIdx = i;
    }
  });
  const relatedIdx = (primaryIdx + 1) % groups.length;
  return [groups[primaryIdx], groups[relatedIdx]];
}

export const WOMEN_TOPICS: TopicGroup[] = [
  {
    label: 'Symptoms',
    matchTags: ['symptoms', 'hot flashes', 'joint pain', 'hair loss', 'signs'],
    links: [
      { kw: 'perimenopause symptoms', url: '/guide/symptoms' },
      { kw: 'first signs of perimenopause', url: '/blog/first-signs-of-perimenopause' },
      { kw: 'seven signs of perimenopause', url: '/blog/seven-signs-of-perimenopause' },
      { kw: 'perimenopause vs menopause', url: '/blog/perimenopause-vs-menopause-difference' },
      { kw: 'perimenopause joint pain', url: '/blog/perimenopause-joint-pain' },
      { kw: 'perimenopause hair loss', url: '/blog/what-causes-hair-loss-in-perimenopause' },
    ],
  },
  {
    label: 'Hormones & HRT',
    matchTags: ['hormones', 'hrt', 'oestrogen', 'progesterone'],
    links: [
      { kw: 'perimenopause HRT', url: '/blog/testosterone-hrt-for-women' },
      { kw: 'common HRT myths debunked', url: '/blog/common-hrt-myths-debunked' },
      { kw: 'starting HRT in perimenopause', url: '/blog/starting-hrt-while-still-getting-periods' },
      { kw: 'birth control vs HRT', url: '/blog/birth-control-vs-hrt-perimenopause' },
      { kw: 'oestrogen dominance', url: '/blog/oestrogen-dominance-what-it-means-does-it-hold-up' },
      { kw: 'doctors refusing HRT', url: '/blog/doctors-refusing-hrt-how-to-push-back' },
    ],
  },
  {
    label: 'Sleep',
    matchTags: ['sleep', 'fatigue', 'insomnia'],
    links: [
      { kw: 'perimenopause sleep problems', url: '/blog/insomnia-sleep-problems-perimenopause' },
      { kw: 'snoring and sleep apnea', url: '/blog/snoring-sleep-apnea-perimenopause' },
      { kw: 'magnesium for perimenopause sleep', url: '/blog/magnesium-rich-indian-foods-perimenopause-sleep-cramps' },
      { kw: 'restless legs in perimenopause', url: '/blog/restless-legs-perimenopause' },
      { kw: 'perimenopause fatigue', url: '/blog/natural-remedies-perimenopause-fatigue' },
      { kw: 'why perimenopause causes early waking', url: '/blog/why-does-everyone-wake-up-at-3am-perimenopause' },
    ],
  },
  {
    label: 'Mind & Mood',
    matchTags: ['mental health', 'anxiety', 'mood swings', 'brain fog', 'depression', 'mood'],
    links: [
      { kw: 'perimenopause brain fog', url: '/blog/brain-fog-vs-adhd-perimenopause' },
      { kw: 'perimenopause anxiety', url: '/blog/perimenopause-anxiety-mood-swings' },
      { kw: 'perimenopause rage', url: '/blog/nobody-told-me-about-the-rage' },
      { kw: 'misdiagnosed perimenopause', url: '/blog/misdiagnosed-perimenopause-adhd-stress-depression' },
      { kw: 'brain fog at work', url: '/blog/brain-fog-at-work-managing-cognitive-symptoms' },
      { kw: 'perimenopause and ADHD', url: '/blog/why-perimenopause-hits-adhd-women-earlier-harder' },
    ],
  },
  {
    label: 'Weight & Body',
    matchTags: ['weight gain', 'metabolism', 'blood sugar'],
    links: [
      { kw: 'perimenopause weight gain', url: '/blog/perimenopause-weight-gain-belly-fat' },
      { kw: 'muscle loss in perimenopause', url: '/blog/muscle-loss-body-composition-perimenopause' },
      { kw: 'perimenopause sugar cravings', url: '/blog/perimenopause-sugar-cravings' },
      { kw: 'perimenopause appetite changes', url: '/blog/perimenopause-appetite-changes-hunger-swings' },
      { kw: 'perimenopause bloating', url: '/blog/can-perimenopause-cause-bloating' },
      { kw: 'testosterone testing in women', url: '/blog/testosterone-testing-in-women-perimenopause' },
    ],
  },
  {
    label: 'Relationships & Life',
    matchTags: ['relationships', 'working women', 'community', 'family'],
    links: [
      { kw: 'perimenopause and marriage', url: '/blog/when-your-husband-doesnt-believe-perimenopause' },
      { kw: 'dating in perimenopause', url: '/blog/dating-remarriage-perimenopause-starting-over-40s' },
      { kw: 'perimenopause at work', url: '/blog/fear-of-losing-your-job-perimenopause' },
      { kw: 'sandwich generation perimenopause', url: '/blog/sandwich-generation-perimenopause-teens-ageing-parents' },
      { kw: 'perimenopause and in-laws', url: '/blog/explaining-perimenopause-to-in-laws-extended-family' },
      { kw: 'single in perimenopause', url: '/blog/single-or-divorced-perimenopause-without-partner-support' },
    ],
  },
];

export const MEN_TOPICS: TopicGroup[] = [
  {
    label: 'Symptoms',
    matchTags: ['symptoms', 'signs'],
    links: [
      { kw: 'andropause symptoms', url: '/wind/guide/symptoms' },
      { kw: 'low testosterone symptoms by decade', url: '/wind/blog/andropause-symptoms-by-decade-40s-50s-60s' },
      { kw: 'andropause myths debunked', url: '/wind/blog/andropause-testosterone-myths-debunked' },
      { kw: 'when doctors dismiss your symptoms', url: '/wind/blog/doctors-dismiss-symptoms-as-stress' },
      { kw: 'midlife health checkup after 40', url: '/wind/blog/midlife-health-checkup-after-40-testosterone' },
      { kw: 'depression in men and andropause', url: '/wind/blog/depression-in-men-andropause-link' },
    ],
  },
  {
    label: 'Testing & Treatment',
    matchTags: ['testing', 'treatment', 'trt'],
    links: [
      { kw: 'testosterone replacement therapy', url: '/wind/blog/testosterone-replacement-therapy-risks-benefits' },
      { kw: 'understanding your testosterone blood test', url: '/wind/blog/understanding-testosterone-blood-test-numbers' },
      { kw: 'cost of testosterone testing in India', url: '/wind/blog/cost-of-testosterone-testing-treatment-india' },
      { kw: 'talking to your doctor about testosterone', url: '/wind/blog/talking-to-doctor-testosterone-test' },
      { kw: 'why men avoid blood tests', url: '/wind/blog/avoiding-blood-tests-health-anxiety-testosterone' },
      { kw: 'natural ways to support testosterone', url: '/wind/blog/natural-ways-to-support-testosterone' },
    ],
  },
  {
    label: 'Energy',
    matchTags: ['fatigue', 'energy', 'stress'],
    links: [
      { kw: 'testosterone and fatigue', url: '/wind/blog/testosterone-fatigue-what-helps' },
      { kw: 'cortisol and testosterone', url: '/wind/blog/cortisol-stress-and-testosterone' },
      { kw: 'protein intake after 40', url: '/wind/blog/protein-intake-after-40' },
      { kw: 'alcohol and testosterone', url: '/wind/blog/alcohol-and-testosterone-how-much-is-too-much' },
      { kw: 'long commutes and testosterone', url: '/wind/blog/long-commutes-traffic-stress-testosterone' },
      { kw: 'vitamin D and testosterone', url: '/wind/blog/vitamin-d-supplementation-testosterone-when-it-helps' },
    ],
  },
  {
    label: 'Muscle',
    matchTags: ['muscle', 'strength', 'weight'],
    links: [
      { kw: 'testosterone and muscle loss', url: '/wind/guide/muscle' },
      { kw: 'gym injuries after 40', url: '/wind/blog/gym-injuries-recovery-time-after-40' },
      { kw: 'creatine after 40', url: '/wind/blog/creatine-after-40-testosterone-evidence' },
      { kw: 'bone density and testosterone', url: '/wind/blog/bone-density-osteoporosis-testosterone-men' },
      { kw: 'zinc and testosterone', url: '/wind/blog/zinc-rich-indian-foods-testosterone' },
      { kw: 'healthy fats and testosterone', url: '/wind/blog/healthy-fats-ghee-nuts-testosterone' },
    ],
  },
  {
    label: 'Sleep',
    matchTags: ['sleep'],
    links: [
      { kw: 'sleep and testosterone', url: '/wind/blog/sleep-testosterone-two-way-link' },
      { kw: 'snoring and your partner', url: '/wind/blog/snoring-and-your-partner' },
      { kw: 'shift work and testosterone', url: '/wind/blog/long-haul-drivers-shift-work-testosterone' },
      { kw: 'jet lag and testosterone', url: '/wind/blog/business-travel-jet-lag-testosterone' },
      { kw: 'hot flashes in men', url: '/wind/blog/hot-flashes-night-sweats-temperature-regulation-andropause-men' },
      { kw: 'magnesium and testosterone', url: '/wind/blog/magnesium-supplements-testosterone-evidence' },
    ],
  },
  {
    label: 'Relationships',
    matchTags: ['relationships', 'intimacy', 'libido', 'family'],
    links: [
      { kw: 'libido and intimacy in midlife', url: '/wind/guide/sexual-health' },
      { kw: 'talking to your partner about andropause', url: '/wind/blog/relationship-intimacy-changes-talking-to-partner' },
      { kw: 'second marriages in midlife', url: '/wind/blog/second-marriages-blended-families-midlife-testosterone' },
      { kw: 'single and divorced men in midlife', url: '/wind/blog/single-divorced-men-midlife-andropause-without-partner' },
      { kw: "supporting your wife's menopause", url: '/wind/blog/supporting-wife-menopause-while-managing-andropause' },
      { kw: 'fatherhood after 40', url: '/wind/blog/fatherhood-after-40-fertility-family-planning' },
    ],
  },
];

export const LONGEVITY_TOPICS: TopicGroup[] = [
  {
    label: 'Foods',
    matchTags: ['food', 'diet', 'nutrition'],
    links: [
      { kw: 'longevity diet India', url: '/longevity/blog/indian-food-longevity' },
      { kw: 'traditional Indian breakfast and metabolism', url: '/longevity/blog/traditional-indian-breakfast-metabolic-health' },
      { kw: 'cooking oil choices and heart health', url: '/longevity/blog/cooking-oil-choices-heart-health' },
      { kw: 'gut health and longevity', url: '/longevity/blog/gut-health-longevity' },
      { kw: 'intermittent fasting and longevity', url: '/longevity/blog/intermittent-fasting-longevity' },
      { kw: 'sugar, inflammation, and ageing', url: '/longevity/blog/sugar-inflammation-ageing' },
    ],
  },
  {
    label: 'Ayurveda',
    matchTags: ['ayurveda'],
    links: [
      { kw: 'Ayurveda for longevity', url: '/longevity/blog/ayurveda-modern-longevity-science' },
      { kw: 'ashwagandha, tulsi, and amla', url: '/longevity/blog/ashwagandha-tulsi-amla-evidence' },
      { kw: 'abhyanga oil massage', url: '/longevity/blog/abhyanga-ayurvedic-oil-massage-evidence' },
      { kw: 'Ayurvedic doshas and healthy ageing', url: '/longevity/blog/ayurvedic-doshas-healthy-ageing-framework' },
      { kw: 'padabhyanga foot care', url: '/longevity/blog/foot-care-reflexology-padabhyanga-longevity' },
      { kw: 'seasonal Ayurvedic detox', url: '/longevity/blog/seasonal-detox-traditions-evidence' },
    ],
  },
  {
    label: 'Supplements',
    matchTags: ['supplements'],
    links: [
      { kw: 'longevity supplements', url: '/longevity/blog/supplements-worth-considering-honest-look' },
      { kw: 'omega-3 supplements and longevity', url: '/longevity/blog/omega-3-supplements-longevity-evidence' },
      { kw: 'collagen supplements', url: '/longevity/blog/collagen-supplements-skin-joints-evidence' },
      { kw: 'magnesium supplements', url: '/longevity/blog/magnesium-supplements-sleep-muscles-stress' },
      { kw: 'creatine after 40', url: '/longevity/blog/creatine-older-adults-longevity-evidence' },
      { kw: 'NAD+ boosters: hype vs evidence', url: '/longevity/blog/nad-boosters-longevity-supplements-hype-evidence' },
    ],
  },
  {
    label: 'Movement',
    matchTags: ['movement', 'exercise', 'fitness'],
    links: [
      { kw: 'exercise for longevity', url: '/longevity/guide/movement' },
      { kw: 'grip strength longevity marker', url: '/longevity/blog/grip-strength-longevity-marker' },
      { kw: 'traditional Indian dance forms as exercise', url: '/longevity/blog/traditional-indian-dance-forms-exercise-ageing' },
      { kw: 'road safety and reaction time', url: '/longevity/blog/road-safety-reaction-time-longevity' },
      { kw: 'sedentary behaviour and sitting', url: '/longevity/blog/sedentary-behaviour-sitting-longevity' },
      { kw: 'balance and fall prevention', url: '/longevity/blog/balance-fall-prevention-longevity-habit' },
    ],
  },
  {
    label: 'Sleep',
    matchTags: ['sleep'],
    links: [
      { kw: 'sleep and healthy ageing', url: '/longevity/guide/sleep-rhythm' },
      { kw: 'afternoon napping and siesta', url: '/longevity/blog/afternoon-napping-health-siesta' },
      { kw: 'sleep apnoea and ageing', url: '/longevity/blog/sleep-apnoea-ageing-longevity-risk' },
      { kw: 'pranayama breathing for longevity', url: '/longevity/blog/pranayama-breathing-longevity' },
      { kw: 'jet lag and travel fatigue after 50', url: '/longevity/blog/jet-lag-travel-fatigue-after-50' },
      { kw: 'monsoon seasonal health transitions', url: '/longevity/blog/monsoon-summer-seasonal-health-transitions-india' },
    ],
  },
  {
    label: 'Mind',
    matchTags: ['mind', 'stress', 'cognitive'],
    links: [
      { kw: 'stress and healthy ageing', url: '/longevity/guide/mind-stress' },
      { kw: 'cognitive health and brain ageing', url: '/longevity/blog/cognitive-health-brain-ageing' },
      { kw: 'purpose and retirement', url: '/longevity/blog/purpose-retirement-longevity' },
      { kw: 'journaling for longevity', url: '/longevity/blog/journaling-longevity-brain-stress' },
      { kw: 'loneliness and solitude', url: '/longevity/blog/loneliness-solitude-longevity' },
      { kw: 'creative hobbies and brain health', url: '/longevity/blog/creative-hobbies-flow-longevity-brain' },
    ],
  },
];
