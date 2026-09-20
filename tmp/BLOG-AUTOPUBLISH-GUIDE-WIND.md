# Daily blog auto-publish — His Midlife (men's vertical) — instructions for the firing session

You are firing as a scheduled daily job with no memory of any prior conversation. This file is your complete brief. Read it fully before doing anything.

## What to do, every time you fire

1. Make sure you're on branch `claude/perimenopause-chat-app-kgml4` of `aividhyarthi/grievance-insight-engine`, up to date with origin. Pull immediately before writing anything, and again immediately before your final push, to reduce collision risk with the other daily jobs (women's and longevity) that also write to this same branch around the same time.
2. Look at `tmp/wind-blog/*.md` — read every `title:` and `tags:` line (frontmatter only, not full bodies) to see what's already been covered. Do not write a post that duplicates or near-duplicates an existing one.
3. Pick 5 topics for today, in priority order:
   - First, draw from the **Gap List** below until it's exhausted (cross off each one used, edit this file to move it from "Not yet written" to "Written" with the filename, so the next run doesn't repeat it).
   - Once the Gap List is exhausted, generate new topics yourself in the same spirit as the existing 9 posts and the Gap List entries: practical, specific, andropause/testosterone-decline topics relevant to Indian men in midlife. Keep checking against existing post titles as you go so you don't duplicate your own earlier work.
4. Write 5 full blog posts as markdown files in `tmp/wind-blog/`, following the House Style section below exactly.
5. `git add`, commit, and push to `origin claude/perimenopause-chat-app-kgml4`. Use retry with backoff (2s, 4s, 8s, 16s) on push failure. If the push is rejected as non-fast-forward (another daily job pushed in the meantime), `git pull --rebase` and retry, up to 3 times, before giving up.
6. Do not touch any other files in the repo unless you are updating the Gap List tracking in this file.
7. End your turn with a short plain-text summary of the 5 titles written.

## House style (non-negotiable)

- **Author**: `"Journal Desk"` always.
- **pubDate**: full timestamps, staggered 2 hours apart across the 5 posts, not just today's date. Get the current UTC time (`date -u +%Y-%m-%dT%H:%M:%SZ`) and use that exact timestamp for post 1, then +2h for post 2, +4h for post 3, +6h for post 4, +8h for post 5. The site hides any post whose `pubDate` is still in the future, so pushing all 5 at once with staggered future timestamps is what makes them appear spaced out through the day. Write the frontmatter value as the full ISO string, e.g. `pubDate: 2026-09-06T09:00:00Z`, not a bare date.
- **No em dashes ever.** Zero tolerance. Before finishing each file, run `grep -c "—" <file>` and confirm it returns 0. Use commas, colons, semicolons, or parentheses instead.
- **No brand or drug names.** Use "testosterone replacement therapy (TRT)" or "topical testosterone gel" generically, never trade names.
- **"Doctor", never "GP".**
- **Terminology is critical**: the primary medical terms are "andropause" or "late-onset hypogonadism (LOH)." Do NOT use the phrase "male menopause" at all, in any post, ever, even to debunk it. That debunking has already been done once on this site (in an existing myths post) and the site-wide rule is that phrase appears at most once total across the entire site, and that quota is used up. Just don't reference it, use andropause/LOH only.
- **India-specific throughout**: reference Indian healthcare realities, joint-family dynamics, cost of care, where relevant. India-specific emergency/mental-health resources when relevant: emergency = 112, mental health = iCall 9152987821 (Mon-Sat 8am-10pm) — that's an en dash in the time range, which is fine, only em dashes (—) are banned.
- **Frontmatter fields**, in this exact order:
  ```yaml
  ---
  title: "..."
  description: "... (1-2 sentences, matches meta description length)"
  pubDate: YYYY-MM-DDTHH:MM:SSZ
  author: "Journal Desk"
  tags: ["tag1", "tag2", "tag3"]
  readTime: "X min read"
  featured: false
  image: "https://images.unsplash.com/photo-XXXXXXX?w=1200&h=675&fit=crop&q=80"
  imageAlt: "..."
  ---
  ```
  For `image`, reuse a photo ID already used elsewhere in `tmp/wind-blog/*.md` that thematically fits (grep `^image:` across existing posts) rather than guessing a new Unsplash ID blind, since an invalid ID renders broken. Slight image reuse across posts is fine.
- **Structure, in this exact order** (this is AEO/answer-engine-optimised, not just a plain essay, non-negotiable):
  1. **Intro** (no heading): 1-2 short paragraphs that hook the reader and state what the article covers.
  2. **Quick answer box**, immediately after the intro, before the first `##` heading. Directly answers the core question the title implies in plain language, 2-3 sentences, plus 3-5 one-line key-takeaway bullets. Use this exact HTML:
     ```html
     <div class="tldr">
     <p class="tldr-label">Quick Answer</p>
     <p>Direct 2-3 sentence answer to the article's core question, in plain language, no hedging preamble.</p>
     <ul>
     <li>Key takeaway 1</li>
     <li>Key takeaway 2</li>
     <li>Key takeaway 3</li>
     </ul>
     </div>
     ```
  3. **4-6 `##` sections** with descriptive, conversational headings that read like real questions or statements a reader would search for (e.g. "Why does this happen after 40?" not just "Causes"), each with `###` sub-headings where a section covers more than one idea, and **bold labels** at the start of key paragraphs (not every paragraph, just the ones stating a key claim).
  4. At least **one table** somewhere in the body where genuinely useful (a comparison, a range of numbers, a step-by-step checklist with a status column). Use standard markdown table syntax. Don't force a table where one doesn't fit naturally, a 2-column list is not a table.
  5. **At least one `.ig` infographic block** in every post (not optional anymore), placed where a visual breaks up the densest section of text, using the syntax below.
  6. **`## Frequently Asked Questions`** section at the end, 3-4 Q&A pairs, **bold question** on its own line followed by a 2-4 sentence answer. Pick questions a reader would actually type into a search engine.
  7. Closing paragraph, then horizontal rule, then this exact closing line in italics:
  `*His Midlife is an information resource, not a medical provider. For personal advice, speak with your doctor. Write to us at thesecondspringofficial@gmail.com*`
- Reuse this exact HTML pattern for `.ig` blocks:
  ```html
  <div class="ig">
  <div class="ig-head">SHORT ALL-CAPS LABEL</div>
  <div class="ig-body">
  <div class="ig-row"><span class="ig-fill-green">Short label</span><span>Longer explanation sentence</span></div>
  <div class="ig-row"><span class="ig-fill-peach">Short label</span><span>Longer explanation sentence</span></div>
  <div class="ig-row"><span class="ig-fill-muted">Short label</span><span>Longer explanation sentence</span></div>
  </div>
  </div>
  ```
- Length: 900-1300 words per post (the added quick-answer box, table, and FAQ section mean these run a bit longer than before).
- Medical claims should stay confident but appropriately hedged ("can", "may", "for many men"), never absolute, always pointing toward a doctor for personal decisions or diagnosis. Never suggest self-treating with supplements or unprescribed hormones.
- **Tags matter beyond categorisation**: the site automatically surfaces related articles across all three verticals (women's, men's, longevity) by matching tags. When a topic genuinely overlaps with a universal midlife theme (sleep, stress, weight/body composition, brain fog, mood, libido, fatigue), include that as one of your tags even alongside more andropause-specific tags, so readers get a genuinely relevant cross-link, not a forced one. Don't add a cross-cutting tag if the post doesn't actually substantively cover that theme.

## Ongoing content pillars: foods, homeopathy, Ayurveda, supplements

Starting 2026-09-20, these four pillars get steady recurring coverage, not a single one-off post each. When picking 5 topics for a batch, include at least one pillar post roughly every other batch alongside the Gap List / fresh-topic work above, until each pillar has real depth, then keep it topped up as new angles occur to you.

- **Foods**: specific, practical food and nutrition angles for andropause and testosterone health. Named foods, specific nutrients, meal timing, Indian dietary staples and how they map to symptoms. Seed topics: "Zinc-rich Indian foods and testosterone: what the evidence actually shows", "Protein timing after 40: does when you eat matter as much as how much", "Healthy fats and testosterone: ghee, nuts, and what the research supports", "Vitamin D deficiency and low testosterone: the connection and what to eat or do about it", "Sugar, insulin resistance, and testosterone: what changes in midlife", "Foods that may worsen belly fat and testosterone decline together".
- **Homeopathy**: what homeopathic remedies and approaches Indian men commonly explore for andropause symptoms, written factually and evidence-aware, never promotional. Be explicit that high-quality scientific evidence for homeopathy specifically is limited and contested, that it should never be framed as treating declining testosterone or as a replacement for medical diagnosis and care, and that a doctor remains essential for anything hormonal. Never name or recommend a specific remedy, brand, or dosage; describe the landscape (what men try, why, what the evidence situation actually is) rather than endorsing outcomes. Seed topics: "Homeopathy for low testosterone and andropause: what men try, and what the evidence actually says", "Should you tell your doctor you're using homeopathic remedies alongside TRT".
- **Ayurveda**: Ayurvedic herbs, concepts, and daily-routine practices relevant to andropause and testosterone health, framed as complementary to (not a replacement for) modern medical care, same evidence-aware register the Life Begins After 40 vertical already uses. Note that a qualified Ayurvedic practitioner should be consulted for personalised guidance, and never suggest a specific unregulated herbal product or dosage. Seed topics: "Ashwagandha and testosterone: what the research actually shows, beyond the supplement marketing", "Shilajit for testosterone: traditional use versus current evidence", "Dinacharya, the Ayurvedic daily routine, for midlife men: what it is and whether it helps energy and testosterone", "Ayurvedic doshas and andropause: does the framework hold up".
- **Supplements**: the existing `natural-ways-to-support-testosterone.md` post is a broad overview, so new posts here should go deeper on specific, named supplements rather than repeat that survey. Evidence-aware and honest: separate supplements with genuine evidence behind them (e.g. vitamin D, zinc, magnesium) from "testosterone booster" products marketed heavily with weak evidence, flag that India's supplement market is loosely regulated so quality and purity vary by brand, always say to tell your doctor before starting any supplement (interaction risk with TRT and other medications), and never name or recommend a specific brand or dosage. Seed topics: "Supplement quality and regulation in India: what men should check before buying", "Creatine after 40: what the evidence actually shows beyond bodybuilding marketing", "Fenugreek and testosterone: what the research actually shows", "'Testosterone booster' supplements: reading the label critically", "Vitamin D supplementation and testosterone: when it actually helps".

### Pillar posts written
- Foods: "Zinc-rich Indian foods and testosterone: what the evidence actually shows" -> `zinc-rich-indian-foods-testosterone.md`
- Foods: "Healthy fats and testosterone: ghee, nuts, and what the research supports" -> `healthy-fats-ghee-nuts-testosterone.md`
- Ayurveda: "Ashwagandha and testosterone: what the research actually shows, beyond the supplement marketing" -> `ashwagandha-testosterone-evidence.md`
- Ayurveda: "Dinacharya, the Ayurvedic daily routine, for midlife men: what it is and whether it helps energy and testosterone" -> `dinacharya-ayurvedic-daily-routine-midlife-men.md`
- Homeopathy: "Homeopathy for low testosterone and andropause: what men try, and what the evidence actually says" -> `homeopathy-low-testosterone-andropause-evidence.md`
- Supplements: "Creatine after 40: what the evidence actually shows beyond bodybuilding marketing" -> `creatine-after-40-testosterone-evidence.md`
- Supplements: "Fenugreek and testosterone: what the research actually shows" -> `fenugreek-testosterone-supplement-evidence.md`
- Supplements: "Vitamin D supplementation and testosterone: when it actually helps" -> `vitamin-d-supplementation-testosterone-when-it-helps.md`
- Supplements: "Magnesium supplements and testosterone: what the evidence shows" (close variant of the magnesium seed idea, not yet a dedicated post) -> `magnesium-supplements-testosterone-evidence.md`
- Supplements: "'Testosterone booster' supplements: reading the label critically" (also covers tribulus terrestris and D-aspartic acid as weak-evidence booster ingredients, so those don't need standalone posts) -> `testosterone-booster-supplements-reading-label-critically.md`
- Foods: "Protein timing after 40: does when you eat matter as much as how much" -> `protein-timing-after-40-testosterone.md`

Remaining unused seed topics for future batches: "Vitamin D deficiency and low testosterone: the connection and what to eat or do about it" (foods, note: the supplementation angle on vitamin D is now covered by the supplements-pillar post above, so if picked up this should stay strictly food-source focused, similar to how the zinc food post relates to zinc), "Sugar, insulin resistance, and testosterone: what changes in midlife" (foods), "Foods that may worsen belly fat and testosterone decline together" (foods), "Should you tell your doctor you're using homeopathic remedies alongside TRT" (homeopathy, largely folded into the "what men try" post above via its FAQ, but still open for a dedicated deeper piece), "Shilajit for testosterone: traditional use versus current evidence" (Ayurveda), "Ayurvedic doshas and andropause: does the framework hold up" (Ayurveda), "Supplement quality and regulation in India: what men should check before buying" (supplements, largely folded into the booster-label post above via its regulation section, but still open for a dedicated deeper piece on quality/certification specifically), "Zinc supplementation specifically (as a supplement, distinct from the food-sourced angle in the zinc foods post)" (supplements), "D-aspartic acid" and "Tribulus terrestris" (supplements, both covered as ingredients within the booster-label post's table, but open for standalone deeper pieces if warranted).

## Tone signal

Direct, calm, evidence-aware, respectful, written for Indian men navigating midlife hormonal changes who may feel embarrassed, dismissed, or confused about what's happening to them. Avoid marketing-speak ("unlock your best self", "biohack") and avoid alarmism. Name specific, concrete symptoms and situations (a man noticing he's weaker at the gym than last year, a man too embarrassed to bring up libido with his doctor, a man whose wife has noticed he's more irritable) rather than vague generalities.

## Gap List

### Not yet written
- Sleep apnoea and testosterone: the connection most men don't know about (note: substantially overlaps with existing `sleep-testosterone-two-way-link.md`, which already has a dedicated sleep apnoea section; skip or angle very differently if picked up)
- Getting your doctor to take you seriously: a practical advocacy guide (note: substantially overlaps with existing `talking-to-doctor-testosterone-test.md`; skip or angle very differently, e.g. toward systemic dismissal/stigma rather than the blood-test conversation itself, if picked up)
- Motivation and goal-setting when your body doesn't respond like it used to (note: closely adjacent to `comparing-yourself-to-younger-self-midlife-psychology.md`; angle toward practical goal-setting mechanics, not body-image psychology, if picked up)
- Workplace performance and energy: managing a demanding job with declining energy (note: adjacent to `testosterone-fatigue-what-helps.md`; angle specifically toward workplace/career context, e.g. concentration in meetings, presenteeism, career-stage pressure, not general fatigue causes)
- Building a morning routine that actually supports hormonal health

### Written (fill in as used)
- Why coffee hits differently after 40: caffeine sensitivity and testosterone -> `caffeine-sensitivity-testosterone-midlife-men.md`
- Relocating in midlife: the hidden toll of starting over in a new city or house -> `relocating-cities-homes-midlife-starting-over.md`
- Why your appetite feels different after 40: andropause and your relationship with food -> `appetite-changes-relationship-with-food-midlife-men.md`
- Becoming the decision-maker for your in-laws: finances, healthcare, and the hormonal toll -> `decision-maker-ageing-in-laws-finances-healthcare.md`
- Losing your sense of humor: emotional flatness and andropause -> `losing-sense-of-humor-emotional-flatness-andropause.md`
- Gut health and bloating in midlife men: why digestion changes after 40 -> `gut-health-bloating-digestion-changes-midlife-men.md`
- Wedding season exhaustion: why back-to-back family events hit harder after 40 -> `wedding-season-family-event-fatigue-testosterone.md`
- Why highway driving feels different after 40: reaction time, confidence, and testosterone -> `driving-confidence-reaction-time-highway-midlife-men.md`
- Navigating andropause alone: single and divorced men without a partner at home -> `single-divorced-men-midlife-andropause-without-partner.md`
- Why you keep avoiding that blood test: the fear behind testosterone testing -> `avoiding-blood-tests-health-anxiety-testosterone.md`
- Alcohol and testosterone: how much is actually too much -> `alcohol-and-testosterone-how-much-is-too-much.md`
- Cortisol and testosterone: why chronic stress lowers your levels -> `cortisol-stress-and-testosterone.md`
- Protein intake after 40: how much you actually need and why it changes -> `protein-intake-after-40.md`
- Diabetes, metabolic syndrome, and low testosterone: the shared root cause -> `diabetes-metabolic-syndrome-low-testosterone.md`
- Heart health and testosterone: what the connection really is -> `heart-health-and-testosterone.md`
- Understanding your testosterone blood test: what the numbers actually mean -> `understanding-testosterone-blood-test-numbers.md`
- Testosterone replacement therapy: risks, benefits, and who it's actually for -> `testosterone-replacement-therapy-risks-benefits.md`
- Natural ways to support testosterone: what has real evidence and what doesn't -> `natural-ways-to-support-testosterone.md`
- Hair loss and skin changes in andropause: what's hormonal, what's just ageing -> `hair-loss-skin-changes-andropause.md`
- Snoring and your partner: why sleep issues affect more than just you -> `snoring-and-your-partner.md`
- Comparing yourself to your younger self: the psychology of midlife physical change -> `comparing-yourself-to-younger-self-midlife-psychology.md`
- Cost of testosterone testing and treatment in India: what to expect -> `cost-of-testosterone-testing-treatment-india.md`
- Joint pain and inflammation in midlife men: is testosterone involved -> `joint-pain-inflammation-midlife-testosterone.md`
- Depression in men: the andropause link nobody talks about -> `depression-in-men-andropause-link.md`
- Relationship and intimacy changes: talking to your partner about what's happening -> `relationship-intimacy-changes-talking-to-partner.md`
- Andropause in your 40s, 50s, and 60s: how symptoms and priorities shift -> `andropause-symptoms-by-decade-40s-50s-60s.md`
- Frequent business travel and testosterone: jet lag, time zones, and hormonal health -> `business-travel-jet-lag-testosterone.md`
- Fatherhood after 40: fertility, family planning, and testosterone decline -> `fatherhood-after-40-fertility-family-planning.md`
- Prostate health and testosterone: what every midlife man should know -> `prostate-health-and-testosterone.md`
- Talking to your adult children about what you're going through -> `talking-to-adult-children-about-andropause.md`
- Long-haul drivers, shift workers, and testosterone: the occupational toll of irregular hours -> `long-haul-drivers-shift-work-testosterone.md`
- Fasting, festivals, and testosterone: what men with low levels should know before Navratri or Ramzan -> `fasting-festivals-hormonal-health-andropause.md`
- Financial stress and testosterone: the breadwinner pressure most Indian men never discuss -> `financial-stress-testosterone-breadwinner-pressure.md`
- Retirement and testosterone: the hormonal side of losing a professional identity -> `retirement-transition-testosterone-identity.md`
- The midlife health checkup: what to actually test for after 40, and where testosterone fits in -> `midlife-health-checkup-after-40-testosterone.md`
- Andropause care for NRI and expat Indian men: getting diagnosed and treated abroad -> `nri-expat-men-andropause-care-abroad.md`
- Second marriages and blended families in midlife: testosterone, intimacy, and starting over -> `second-marriages-blended-families-midlife-testosterone.md`
- Hobbies, identity, and testosterone: why what you do for fun matters more after 40 -> `hobbies-identity-testosterone-after-40.md`
- Social isolation and male friendships in midlife: the hormonal cost of losing touch -> `social-isolation-male-friendships-midlife-testosterone.md`
- Chronic pain and testosterone: the two-way connection most men never get told about -> `chronic-pain-and-testosterone-connection.md`
- Caring for ageing parents while your own health is declining: the sandwich generation squeeze -> `sandwich-generation-caring-for-ageing-parents-testosterone.md`
- Career plateau and being passed over for promotion: the hidden hormonal and emotional toll -> `career-plateau-passed-over-promotion-testosterone.md`
- Gym injuries and recovery time after 40: training smart when your body doesn't bounce back -> `gym-injuries-recovery-time-after-40.md`
- Screen time, pornography habits, and libido in midlife: what's actually going on -> `screen-time-porn-habits-libido-midlife.md`
- Long stretches away from family for work: loneliness, marriage strain, and testosterone -> `long-stretches-away-from-family-work-testosterone.md`
- Gum disease and testosterone: the midlife dental health connection nobody told you about -> `dental-gum-health-andropause-testosterone.md`
- Desk job snacking: how sedentary work habits are quietly undermining your testosterone -> `desk-job-snacking-habits-testosterone.md`
- When your wife is the patient: men as primary caregivers for a sick spouse, and their own health -> `men-caregivers-for-sick-spouse-testosterone.md`
- Hair transplants and cosmetic procedures: what's behind the midlife grooming trend in Indian men -> `hair-transplants-cosmetic-procedures-midlife-men.md`
- Long commutes and traffic stress: the hidden cortisol tax on Indian men's testosterone -> `long-commutes-traffic-stress-testosterone.md`
- Blurry menus and tiny text: vision changes in midlife men and what's actually going on -> `vision-changes-reading-glasses-midlife-men.md`
- Why are you suddenly allergic to things in your 40s: the midlife immune shift explained -> `sudden-allergies-in-your-40s.md`
- Why your back hurts more than it used to: posture, desk jobs, and testosterone in midlife -> `posture-back-pain-desk-job-testosterone.md`
- When your doctor says it's just stress: what to do next -> `doctors-dismiss-symptoms-as-stress.md`
- When you're both going through it: supporting your wife's menopause while managing your own andropause -> `supporting-wife-menopause-while-managing-andropause.md`
- Why monsoon season hits harder after 40: joint pain, mood, and testosterone -> `monsoon-season-joint-pain-mood-midlife-testosterone.md`
- Andropause without health insurance: navigating testosterone care in India's out-of-pocket system -> `andropause-without-health-insurance-india.md`
- Bone density and testosterone: the osteoporosis risk men don't know about -> `bone-density-osteoporosis-testosterone-men.md`
- Shaky signatures: handwriting, fine motor confidence, and testosterone in midlife -> `handwriting-signing-documents-fine-motor-confidence-midlife-men.md`
- Do men get hot flashes? Night sweats, temperature regulation, and andropause -> `hot-flashes-night-sweats-temperature-regulation-andropause-men.md`
- Grey beard, changing texture: what's hormonal in midlife grooming, and what's just ageing -> `beard-greying-grooming-changes-midlife-men.md`
- Festival hosting duty: why cooking and entertaining for the family hits harder after 40 -> `festival-hosting-cooking-duties-midlife-men.md`
- Why you can't handle spicy food like you used to: acidity, digestion, and testosterone in midlife -> `spicy-food-tolerance-changes-midlife-men.md`
- Restlessness and fidgeting: why some midlife men feel more nervous energy after 40 -> `restlessness-fidgeting-nervous-energy-midlife-men.md`
