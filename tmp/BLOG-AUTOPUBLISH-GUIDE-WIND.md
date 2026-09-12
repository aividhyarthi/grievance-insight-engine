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
