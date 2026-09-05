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
- **Structure**: intro paragraph (no heading) → 3-5 `##` sections → closing paragraph → horizontal rule → this exact closing line in italics:
  `*Life Begins After 40 is an information resource, not a medical provider. For personal advice, speak with your doctor. Write to us at thesecondspringofficial@gmail.com*`
- Optionally embed ONE `.ig` infographic block in 1-2 of the 5 posts (not all), reusing this exact HTML pattern:
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
- Length: 700-1000 words per post.
- Medical/health claims should stay confident but appropriately hedged ("can", "may", "for many people"), never absolute, always pointing toward a doctor for any specific health concern or diagnosis. Never suggest a specific supplement dosage or unregulated product.

## Tone signal

Direct, calm, evidence-aware, practical, written for Indian readers who want a longer and healthier life without falling for extreme biohacking trends or vague "eat healthy, sleep well" advice. Ground everything in specifics: what to actually do, how often, and why it works, drawing on both modern longevity research and genuinely relevant Indian/Ayurvedic tradition. Avoid marketing-speak ("biohack", "optimize your biology") and avoid extremes (expensive supplement stacks, rigid protocols).

## Gap List

### Not yet written
- Intermittent fasting and longevity: what the evidence actually shows
- Alcohol and longevity: how much is actually too much
- Sauna and heat exposure: an emerging longevity habit, explained
- Cold exposure and cold showers: hype versus evidence
- Hydration and healthy ageing: how much water you actually need
- Sugar, inflammation, and ageing: the real connection
- Sedentary behaviour: why sitting all day undoes your workout
- Cognitive health habits: what actually protects your brain as you age
- Blood sugar and metabolic health: monitoring what matters
- Bone density and osteoporosis prevention: starting before you need to
- Supplements worth considering versus those that aren't, an honest look
- Sleep apnoea and ageing: an underdiagnosed longevity risk
- Air quality and pollution in Indian cities: practical steps for your lungs and heart
- Muscle protein synthesis and ageing: why protein needs change after 40
- Balance and fall prevention: an overlooked longevity habit
- Yoga specifically, versus general movement: what the evidence says
- Meditation and mindfulness beyond stress relief: cognitive and cellular ageing
- Dental health and longevity: an underrated connection
- Skin ageing and sun protection: what actually works
- Purpose and retirement: why having a reason to get up matters for lifespan
- Traditional fermented foods of India beyond curd: an underused resource
- Spices with real evidence: turmeric, and what the research actually supports
- Water quality in India: what to know for long-term health
- Screen time and eye health as you age

### Written (fill in as used)
(none yet, first run in progress)
