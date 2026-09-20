# Daily blog auto-publish — Life Begins After 40 (longevity vertical) — instructions for the firing session

You are firing as a scheduled daily job with no memory of any prior conversation. This file is your complete brief. Read it fully before doing anything.

## What to do, every time you fire

1. Make sure you're on branch `claude/perimenopause-chat-app-kgml4` of `aividhyarthi/grievance-insight-engine`, up to date with origin. Pull immediately before writing anything, and again immediately before your final push, to reduce collision risk with the other daily jobs (women's and men's) that also write to this same branch around the same time.
2. Look at `tmp/longevity-blog/*.md` — read every `title:` and `tags:` line (frontmatter only, not full bodies) to see what's already been covered. Do not write a post that duplicates or near-duplicates an existing one.
3. Pick 5 topics for today, in priority order:
   - First, draw from the **Gap List** below until it's exhausted (cross off each one used, edit this file to move it from "Not yet written" to "Written" with the filename, so the next run doesn't repeat it).
   - Once the Gap List is exhausted, generate new topics yourself in the same spirit as the existing 9 posts and the Gap List entries: practical, evidence-aware healthspan/longevity topics for Indian readers, balancing modern research with Indian/Ayurvedic tradition where genuinely relevant. Keep checking against existing post titles as you go so you don't duplicate your own earlier work.
4. Write 5 full blog posts as markdown files in `tmp/longevity-blog/`, following the House Style section below exactly.
5. `git add`, commit, and push to `origin claude/perimenopause-chat-app-kgml4`. Use retry with backoff (2s, 4s, 8s, 16s) on push failure. If the push is rejected as non-fast-forward (another daily job pushed in the meantime), `git pull --rebase` and retry, up to 3 times, before giving up.
6. Do not touch any other files in the repo unless you are updating the Gap List tracking in this file.
7. End your turn with a short plain-text summary of the 5 titles written.

## House style (non-negotiable)

- **Author**: `"Journal Desk"` always.
- **pubDate**: full timestamps, staggered 2 hours apart across the 5 posts, not just today's date. Get the current UTC time (`date -u +%Y-%m-%dT%H:%M:%SZ`) and use that exact timestamp for post 1, then +2h for post 2, +4h for post 3, +6h for post 4, +8h for post 5. The site hides any post whose `pubDate` is still in the future, so pushing all 5 at once with staggered future timestamps is what makes them appear spaced out through the day. Write the frontmatter value as the full ISO string, e.g. `pubDate: 2026-09-06T09:00:00Z`, not a bare date.
- **No em dashes ever.** Zero tolerance. Before finishing each file, run `grep -c "—" <file>` and confirm it returns 0. Use commas, colons, semicolons, or parentheses instead.
- **No brand names** for supplements, foods, or products, use generic terms.
- **"Doctor", never "GP".**
- **On Ayurveda**: be respectful and genuinely informative, not dismissive, but always frame it as complementary to (not a replacement for) modern medical care. Never suggest a specific unregulated herbal product or dosage, and note that a qualified Ayurvedic practitioner should be consulted for personalised guidance.
- **India-specific throughout**: reference Indian food traditions, healthcare realities, climate, where relevant. India-specific emergency/mental-health resources when relevant: emergency = 112, mental health = iCall 9152987821 (Mon-Sat 8am-10pm) — that's an en dash in the time range, which is fine, only em dashes (—) are banned.
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
  For `image`, reuse a photo ID already used elsewhere in `tmp/longevity-blog/*.md` that thematically fits (grep `^image:` across existing posts) rather than guessing a new Unsplash ID blind, since an invalid ID renders broken. Slight image reuse across posts is fine.
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
  3. **4-6 `##` sections** with descriptive, conversational headings that read like real questions or statements a reader would search for (e.g. "Does walking actually count as exercise?" not just "Movement"), each with `###` sub-headings where a section covers more than one idea, and **bold labels** at the start of key paragraphs (not every paragraph, just the ones stating a key claim).
  4. At least **one table** somewhere in the body where genuinely useful (a comparison, a range of numbers, a step-by-step checklist with a status column). Use standard markdown table syntax. Don't force a table where one doesn't fit naturally, a 2-column list is not a table.
  5. **At least one `.ig` infographic block** in every post (not optional anymore), placed where a visual breaks up the densest section of text, using the syntax below.
  6. **`## Frequently Asked Questions`** section at the end, 3-4 Q&A pairs, **bold question** on its own line followed by a 2-4 sentence answer. Pick questions a reader would actually type into a search engine.
  7. Closing paragraph, then horizontal rule, then this exact closing line in italics:
  `*Life Begins After 40 is an information resource, not a medical provider. For personal advice, speak with your doctor. Write to us at thesecondspringofficial@gmail.com*`
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
- Medical/health claims should stay confident but appropriately hedged ("can", "may", "for many people"), never absolute, always pointing toward a doctor for any specific health concern or diagnosis. Never suggest a specific supplement dosage or unregulated product.
- **Tags matter beyond categorisation**: the site automatically surfaces related articles across all three verticals (women's, men's, longevity) by matching tags. When a topic genuinely overlaps with a universal midlife theme (sleep, stress, weight/body composition, brain fog, mood, fatigue), include that as one of your tags even alongside more longevity-specific tags, so readers get a genuinely relevant cross-link, not a forced one. Don't add a cross-cutting tag if the post doesn't actually substantively cover that theme.

## Ongoing content pillars: foods, homeopathy, Ayurveda, supplements

Starting 2026-09-20, these four pillars get steady recurring coverage. This vertical already has real depth on foods and Ayurveda (check `tmp/longevity-blog/*.md` titles before picking a "foods" or "Ayurveda" topic here, several angles like fermented foods, traditional breakfast, cooking oils, ashwagandha/tulsi/amla, and abhyanga/padabhyanga are already written), so the main gaps to close are **homeopathy** (no coverage as of 2026-09-19, now getting built up, see below) and deeper **supplements** coverage beyond the existing general overview. When picking 5 topics for a batch, include at least one pillar post roughly every few batches until each has genuine depth, and keep adding fresh, non-duplicate foods/Ayurveda angles alongside the Gap List / fresh-topic work above.

- **Foods**: specific, practical food and nutrition angles for longevity and healthy ageing, checked against existing posts to avoid duplication. Seed topics not yet covered: "Fibre and gut health for longevity: how much Indian adults actually need", "Micronutrient gaps common in Indian diets after 40, and how to close them", "Portion size and mindful eating for longevity: practical habits, not rules".
- **Homeopathy**: what homeopathic remedies and approaches Indian readers commonly explore for ageing-related concerns (energy, joint pain, sleep, general vitality), written factually and evidence-aware, never promotional. Be explicit that high-quality scientific evidence for homeopathy specifically is limited and contested, that it should never be framed as treating or reversing ageing-related decline or as a replacement for medical diagnosis and care, and that a doctor remains essential for any specific health concern. Never name or recommend a specific remedy, brand, or dosage; describe the landscape (what people try, why, what the evidence situation actually is) rather than endorsing outcomes. Seed topics: "Homeopathy for healthy ageing: what people try, and what the evidence actually says", "Homeopathy versus Ayurveda: how they differ, and what each actually has evidence for".
- **Ayurveda**: continue building on the existing Ayurveda coverage (abhyanga, ashwagandha/tulsi/amla) with fresh, non-duplicate angles, framed as complementary to (not a replacement for) modern medical care. Note that a qualified Ayurvedic practitioner should be consulted for personalised guidance, and never suggest a specific unregulated herbal product or dosage. Seed topics: "Dinacharya, the Ayurvedic daily routine, for longevity: what it is and whether it holds up", "Triphala for digestion and longevity: traditional use versus current evidence", "Ayurvedic doshas and healthy ageing: does the framework hold up".
- **Supplements**: an existing overview post (`supplements-worth-considering-honest-look.md`) already covers the general landscape, so new posts here should go deeper on specific, named supplements rather than repeat that survey. Evidence-aware and honest: separate supplements with genuine evidence behind them (e.g. vitamin D, omega-3, magnesium) from "anti-ageing" or "longevity" blends marketed heavily with weak evidence, flag that India's supplement market is loosely regulated so quality and purity vary by brand, always say to tell your doctor before starting any supplement (interaction risk with existing medications, especially relevant given the site's own polypharmacy post), and never name or recommend a specific brand or dosage. Seed topics: "Supplement quality and regulation in India: what to check before you buy", "Omega-3 supplements and longevity: what the evidence actually shows", "Collagen supplements and ageing skin and joints: what the evidence shows", "NAD+ boosters and 'longevity supplements': hype versus evidence", "Multivitamins after 50: are they actually worth it".

### Pillar topics written (fill in as used)
One-off kickoff batch, 2026-09-19, to build out homeopathy coverage from zero (leaned heavily homeopathy per user request, plus one fresh Ayurveda angle):
- Homeopathy for Healthy Ageing: What People Try, and What the Evidence Actually Says -> `homeopathy-healthy-ageing-what-evidence-says.md` (seed topic, used)
- Homeopathy Versus Ayurveda: How They Differ, and What Each Actually Has Evidence For -> `homeopathy-versus-ayurveda-evidence-comparison.md` (seed topic, used)
- Homeopathy for Joint Pain, Sleep, and Low Energy: Looking at the Evidence Behind Common Uses -> `homeopathy-joint-pain-sleep-energy-evidence.md`
- Is It Safe to Combine Homeopathy With Your Regular Medicines? -> `homeopathy-combining-regular-medicines-safety.md`
- Ayurvedic Doshas and Healthy Ageing: Does the Framework Hold Up? -> `ayurvedic-doshas-healthy-ageing-framework.md` (seed topic, used)

Still open from this section's seed list for future batches: "Fibre and gut health for longevity: how much Indian adults actually need" (note: general gut microbiome piece already exists, `gut-health-longevity.md`, but fibre-specific angle is still fresh), "Micronutrient gaps common in Indian diets after 40", "Portion size and mindful eating for longevity", "Dinacharya..." (note: a dinacharya/agni/ritucharya piece already exists, `ayurveda-modern-longevity-science.md`, check it before reusing this seed), "Triphala for digestion and longevity: traditional use versus current evidence" (still open, genuinely fresh).

Batch 2026-09-20, two more homeopathy angles added:
- Homeopathy for Coughs, Colds, and Minor Ailments: India's First-Aid Habit, Examined -> `homeopathic-first-aid-acute-use-india.md`
- The Placebo Effect, Explained: Why It Matters When You Weigh Up Homeopathy and Other Remedies -> `placebo-effect-explained-homeopathy-evidence.md`

Homeopathy now has 6 posts; keep adding occasional homeopathy posts in future batches until the topic list below feels exhausted (e.g. homeopathy for menopause-adjacent symptoms in the women's vertical if relevant there, regulation and training of homeopathic doctors in India as a standalone deep-dive).

One-off kickoff batch, 2026-09-19 (second batch same day), to build out the supplements pillar beyond the existing general overview (`supplements-worth-considering-honest-look.md`) and the vitamin D post (`vitamin-d-sunlight-india.md`), going deep on specific named supplements per user request:
- Omega-3 Supplements and Longevity: What the Evidence Actually Shows -> `omega-3-supplements-longevity-evidence.md` (seed topic, used)
- Collagen Supplements for Skin and Joints: What the Evidence Actually Shows -> `collagen-supplements-skin-joints-evidence.md` (seed topic, used)
- NAD+ Boosters and "Longevity Supplements": Hype Versus Evidence -> `nad-boosters-longevity-supplements-hype-evidence.md` (seed topic, used)
- Magnesium Supplements: What They Can and Cannot Do for Sleep, Muscles, and Stress -> `magnesium-supplements-sleep-muscles-stress.md` (close variant of seed list, used)
- Creatine After 40: An Old Sports Supplement With New Longevity Evidence -> `creatine-older-adults-longevity-evidence.md` (close variant of seed list, used)

Still open from the supplements seed list for future batches: "Supplement quality and regulation in India: what to check before you buy" (still open, genuinely fresh, distinct from the general overview post since it can go deeper on regulatory specifics), "Multivitamins after 50: are they actually worth it" (still open; the general overview post touches multivitamins briefly but a dedicated deep-dive is still fresh). Other close-variant named-supplement angles not yet covered: probiotics/prebiotics for gut and immune health, resveratrol and polyphenol supplements, protein powder/whey for older adults (muscle-protein-synthesis post already covers dietary protein broadly, so a protein-powder-specific supplement angle would need to stay clearly distinct from that), zinc and immune ageing, vitamin B12 as a standalone deep-dive (currently only covered briefly inside the general overview post).

## Tone signal

Direct, calm, evidence-aware, practical, written for Indian readers who want a longer and healthier life without falling for extreme biohacking trends or vague "eat healthy, sleep well" advice. Ground everything in specifics: what to actually do, how often, and why it works, drawing on both modern longevity research and genuinely relevant Indian/Ayurvedic tradition. Avoid marketing-speak ("biohack", "optimize your biology") and avoid extremes (expensive supplement stacks, rigid protocols).

## Gap List

### Not yet written
- Traditional fermented foods of India beyond curd: an underused resource
- Spices with real evidence: turmeric, and what the research actually supports

### Written (fill in as used)
- Yoga versus general movement: what the evidence says -> `yoga-versus-general-movement-evidence.md`
- Meditation and mindfulness beyond stress relief: cognitive and cellular ageing -> `meditation-mindfulness-cognitive-cellular-ageing.md`
- Water quality in India: what to know for long-term health -> `water-quality-india-long-term-health.md`
- Intermittent fasting and longevity: what the evidence actually shows -> `intermittent-fasting-longevity.md`
- Alcohol and longevity: how much is actually too much -> `alcohol-longevity-how-much-too-much.md`
- Sauna and heat exposure: an emerging longevity habit, explained -> `sauna-heat-exposure-longevity.md`
- Cold exposure and cold showers: hype versus evidence -> `cold-exposure-cold-showers-longevity.md`
- Hydration and healthy ageing: how much water you actually need -> `hydration-healthy-ageing.md`
- Sugar, inflammation, and ageing: the real connection -> `sugar-inflammation-ageing.md`
- Sedentary behaviour: why sitting all day undoes your workout -> `sedentary-behaviour-sitting-longevity.md`
- Cognitive health habits: what actually protects your brain as you age -> `cognitive-health-brain-ageing.md`
- Blood sugar and metabolic health: monitoring what matters -> `blood-sugar-metabolic-health-monitoring.md`
- Bone density and osteoporosis prevention: starting before you need to -> `bone-density-osteoporosis-prevention.md`
- Supplements worth considering versus those that aren't, an honest look -> `supplements-worth-considering-honest-look.md`
- Sleep apnoea and ageing: an underdiagnosed longevity risk -> `sleep-apnoea-ageing-longevity-risk.md`
- Air quality and pollution in Indian cities: practical steps for your lungs and heart -> `air-quality-pollution-indian-cities-lungs-heart.md`
- Muscle protein synthesis and ageing: why protein needs change after 40 -> `muscle-protein-synthesis-ageing-protein-needs.md`
- Balance and fall prevention: an overlooked longevity habit -> `balance-fall-prevention-longevity-habit.md`
- Dental health and longevity: an underrated connection -> `dental-health-longevity-connection.md`
- Skin ageing and sun protection: what actually works -> `skin-ageing-sun-protection-longevity.md`
- Screen time and eye health as you age -> `screen-time-eye-health-ageing.md`
- Purpose and retirement: why having a reason to get up matters for lifespan -> `purpose-retirement-longevity.md`
- Decade-by-decade longevity priorities: what changes in your 40s, 50s, and 60s -> `decade-by-decade-longevity-40s-50s-60s.md`
- Hearing loss and ageing: why your ears deserve as much attention as your heart -> `hearing-loss-ageing-longevity.md`
- Grip strength: the simple longevity marker doctors are increasingly watching -> `grip-strength-longevity-marker.md`
- Caring for ageing parents without losing your own health: a guide for the sandwich generation -> `caregiving-ageing-parents-sandwich-generation.md`
- Pranayama for longevity: what the breathing practices actually do to your body -> `pranayama-breathing-longevity.md`
- Monsoon to summer: navigating India's seasonal health transitions for long-term wellbeing -> `monsoon-summer-seasonal-health-transitions-india.md`
- Cataracts and glaucoma: the eye diseases of ageing worth knowing about before symptoms start -> `cataracts-glaucoma-eye-disease-ageing.md`
- Kalaripayattu, mallakhamb, and gada: what India's traditional strength practices get right -> `traditional-indian-strength-practices-longevity.md`
- Jet lag after 50: why travel hits harder as you age, and how to recover faster -> `jet-lag-travel-fatigue-after-50.md`
- Journaling for a longer life: what writing regularly does to your brain and stress levels -> `journaling-longevity-brain-stress.md`
- Encore careers: why starting something new after 50 might add years to your life -> `encore-careers-second-act-after-50.md`
- Kidney health and ageing: why this organ deserves more attention after 40 -> `kidney-health-ageing.md`
- Cooking oil choices and heart health: what the evidence actually supports -> `cooking-oil-choices-heart-health.md`
- Home safety modifications for ageing in place: a practical room-by-room guide -> `home-safety-modifications-ageing-in-place.md`
- Pet ownership and companionship: what the research on longevity actually shows -> `pet-ownership-companionship-longevity.md`
- Digital literacy after 50: staying connected with family without the overwhelm -> `digital-literacy-staying-connected-family.md`
- Liver health and ageing: why this silent organ deserves attention after 40 -> `liver-health-ageing.md`
- Vaccinations after 40: the shots doctors recommend that most Indians skip -> `vaccinations-older-adults-longevity.md`
- Loneliness versus solitude: why the difference matters for how long you live -> `loneliness-solitude-longevity.md`
- Abhyanga: what the evidence actually says about Ayurvedic oil massage -> `abhyanga-ayurvedic-oil-massage-evidence.md`
- Growing your own food: an underrated longevity habit -> `gardening-growing-food-longevity.md`
- Vision health and cataract prevention: the daily habits that actually help -> `vision-health-cataract-prevention-daily-habits.md`
- Religious fasting traditions (Navratri, Ekadashi, Ramzan) and what they share with longevity science -> `religious-fasting-traditions-longevity.md`
- Noise and hearing protection in daily Indian life -> `noise-hearing-protection-daily-life.md`
- Traditional Indian breakfast foods and metabolic health -> `traditional-indian-breakfast-metabolic-health.md`
- Afternoon napping culture and health: what the evidence on siestas actually shows -> `afternoon-napping-health-siesta.md`
- Traditional Indian dance forms (Bharatanatyam, Kathak, Garba) as exercise for healthy ageing -> `traditional-indian-dance-forms-exercise-ageing.md`
- Religious and spiritual community involvement and longevity: what satsang and temple groups do for your health -> `religious-spiritual-community-longevity.md`
- Air travel and cabin pressure: what altitude and flying actually do to an ageing body -> `air-travel-cabin-pressure-ageing-body.md`
- Floor-sitting versus chair-sitting and joint health: which is actually better after 40 -> `floor-sitting-chair-sitting-joint-health.md`
- Post-monsoon detox traditions: what the evidence actually says -> `seasonal-detox-traditions-evidence.md`
- What your nails and skin texture might be telling you about internal health -> `nail-skin-texture-internal-health-indicators.md`
- Caffeine sensitivity and longevity: how tolerance changes after 40 -> `caffeine-sensitivity-longevity-after-40.md`
- Ashwagandha, tulsi, and amla: what the evidence actually says beyond turmeric -> `ashwagandha-tulsi-amla-evidence.md`
- Handwriting and fine motor skills as an early marker of ageing worth watching -> `handwriting-fine-motor-skills-early-marker.md`
- City versus village living: what longevity outcomes in India actually show -> `city-village-living-longevity-india.md`
- Monsoon season joint pain and immunity: why joints ache more in the rains and how to protect yourself -> `monsoon-joint-pain-immunity-arthritis.md`
- Road safety and reaction time after 40: the overlooked longevity factor -> `road-safety-reaction-time-longevity.md`
- Padabhyanga and traditional Indian foot care: what Ayurvedic foot massage and modern podiatry both get right -> `foot-care-reflexology-padabhyanga-longevity.md`
- Creative hobbies and flow states: what a regular creative practice does for your brain as you age -> `creative-hobbies-flow-longevity-brain.md`
- Polypharmacy after 50: why taking more medicines is not automatically safer -> `polypharmacy-medication-review-ageing.md`
