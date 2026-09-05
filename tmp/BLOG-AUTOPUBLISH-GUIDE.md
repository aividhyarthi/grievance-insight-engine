# Daily blog auto-publish — instructions for the firing session

You are firing as a scheduled daily job with no memory of any prior conversation. This file is your complete brief. Read it fully before doing anything.

## What to do, every time you fire

1. Make sure you're on branch `claude/perimenopause-chat-app-kgml4` of `aividhyarthi/grievance-insight-engine`, up to date with origin.
2. Look at `tmp/blog/*.md` — read every `title:` and `tags:` line (frontmatter only, not full bodies) to see what's already been covered. Do not write a post that duplicates or near-duplicates an existing one.
3. Pick 5 topics for today, in priority order:
   - First, draw from the **Gap List** below until it's exhausted (cross off each one used — edit this file to move it from "Not yet written" to "Written" with the filename, so the next run doesn't repeat it).
   - Once the Gap List is exhausted, generate new topics yourself in the same spirit: read the **Reddit Signal** section below for the flavour of real questions Indian and global perimenopausal women actually ask, and write fresh angles inspired by that pattern (not verbatim Reddit titles — proper SEO-style blog titles). Keep checking against existing post titles as you go so you don't duplicate your own earlier work.
   - Prioritise the categories marked high-value in the Gap List (HRT, doctors/dismissal, brain fog specifics, identity, "nobody told me" format) over already-saturated categories (see "Do not revisit" list below).
4. Write 5 full blog posts as markdown files in `tmp/blog/`, following the House Style section below exactly.
5. `git add` the new files, commit, and push to `origin claude/perimenopause-chat-app-kgml4`. Use retry with backoff (2s, 4s, 8s, 16s) on push failure, same as this repo's other automation.
6. Do not touch any other files in the repo unless you are updating the Gap List tracking in this file.
7. End your turn with a short plain-text summary of the 5 titles written (this will be visible in session history, not sent anywhere — no need to notify anyone).

## House style (non-negotiable)

- **Author**: `"Journal Desk"` always.
- **pubDate**: full timestamps, staggered 2 hours apart across the 5 posts, not just today's date. Get the current UTC time (`date -u +%Y-%m-%dT%H:%M:%SZ`) and use that exact timestamp for post 1, then +2h for post 2, +4h for post 3, +6h for post 4, +8h for post 5 (e.g. if you start at `2026-09-05T02:13:00Z`, the five values are `02:13:00Z`, `04:13:00Z`, `06:13:00Z`, `08:13:00Z`, `10:13:00Z` on the same date). The site hides any post whose `pubDate` is still in the future, so pushing all 5 at once with staggered future timestamps is what makes them appear spaced out through the day without needing 5 separate runs. Write the frontmatter value as the full ISO string, e.g. `pubDate: 2026-09-05T04:13:00Z`, not a bare date.
- **No em dashes ever.** Zero tolerance — this has been a recurring, explicitly-flagged problem. Before finishing each file, run `grep -c "—" <file>` and confirm it returns 0. Use commas, colons, semicolons, or parentheses instead, whatever reads most naturally.
- **No brand or drug names.** Refer to "HRT" / "hormone therapy" generically, generic/chemical drug-class names are fine (e.g. "semaglutide-based medications") but never trade names (no "Ozempic", "Wegovy", "Mounjaro", etc.).
- **"Doctor" or "gynaecologist", never "GP".**
- **India-specific throughout**: weave in "In the Indian context" callouts, use ₹ where money comes up, reference Indian healthcare realities, joint-family dynamics, etc. India-specific emergency/mental-health resources when relevant: emergency = 112, mental health = iCall 9152987821 (Mon–Sat 8am-10pm) — note that's an en dash in the time range, which is fine, only em dashes (—) are banned, not en dashes (–).
- **No links to `/chat`** — that page was removed. Use `/quiz` (free symptom check), `/community`, or `/guide` for calls to action instead, worked naturally into the body, not just tacked on as a final CTA (the post template already auto-adds a "You're Not Alone" closing section with quiz/community links and the emergency resources, so you don't need to duplicate that at the end of every post).
- **Frontmatter fields**, in this exact order:
  ```yaml
  ---
  title: "..."
  description: "... (1-2 sentences, matches meta description length)"
  pubDate: YYYY-MM-DDTHH:MM:SSZ
  author: "Journal Desk"
  tags: ["tag1", "tag2", "tag3"]
  readTime: "X min read"
  image: "https://images.unsplash.com/photo-XXXXXXXXXX-XXXXXXXXXXXX?w=1200&h=675&fit=crop&q=80"
  imageAlt: "..."
  ---
  ```
  For `image`, reuse a photo ID already used elsewhere in `tmp/blog/*.md` that thematically fits (grep `^image:` across existing posts) rather than guessing a new Unsplash ID blind, since an invalid ID renders broken. Slight image reuse across posts is fine and already happens throughout the site.
- **Tags**: check `tmp/ss-blog-categories.ts` for the registered category tag lists and include at least one matching tag where the topic genuinely fits a category (helps the post surface on category pages), but don't force a mismatched tag just to fit.
- **Structure**: intro paragraph(s) → at least one `.ig` infographic block (see syntax below) → sectioned body with `##`/`###` headings and **bold labels** → "In the Indian context" notes woven in naturally → FAQ section (`## Frequently Asked Questions` with **bold question** / answer pairs) at the end.
- **`.ig` component syntax** (copy this pattern, don't invent new classes):
  ```html
  <div class="ig">
  <div class="ig-head">Section Title</div>
  <div class="ig-body">
  <div class="ig-steps">
  <div class="ig-step"><div class="ig-step-num">1</div><div class="ig-step-text"><strong>Point</strong>. Explanation.</div></div>
  </div>
  </div>
  </div>
  ```
  Other valid inner layouts: `.ig-row` with `<span class="ig-fill-green">`/`ig-fill-peach`/`ig-fill-muted` label pills for a 2-3-way comparison list, or `.ig-cols` with two `.ig-col` blocks (`<p class="ig-col-title green">` / `peach`) for a side-by-side "this vs that" comparison. Pick whichever fits the content, don't force steps where a comparison table fits better.
- Medical claims should stay in the same register as existing posts: confident but appropriately hedged ("can", "may", "for many women"), never absolute, always pointing toward a doctor/gynaecologist for personal decisions.

## Do not revisit (already well/over-covered)

Periods/menstrual basics, body pain (joint/back/hip), skin/hair/nails basics, vaginal/urinary basics, GI symptoms basics, heart/circulation basics, exercise/fitness basics, food/nutrition basics, the general "less obvious symptoms" list. Check existing titles before assuming a sub-angle within these is still open, some may be, but they're lower priority than the gap list below.

## Gap List

### Not yet written
- Brain fog at work: managing cognitive symptoms on the job
- Cognitive symptoms with "normal" hormone tests, why it still happens
- Finding a menopause specialist in India: a practical guide
- Testosterone HRT for women: does it help and how to get it
- Starting HRT while still getting periods
- SSRIs vs HRT for perimenopause mood symptoms: how to decide
- When antidepressants aren't working, could it be hormonal
- Misdiagnosed: when perimenopause gets called ADHD, stress, or depression
- Nobody told me brain fog would feel like this
- Nobody told me about the rage
- Feeling older overnight: perimenopause and the fear of aging
- Feeling disconnected from your own body
- Perimenopause with regular periods: is that possible
- Why symptoms come and go: good months, bad months
- Bleeding after sex in perimenopause: causes and when to worry
- How do you know you've had your last period (retrospective diagnosis)
- Muscle loss and body composition changes in perimenopause
- Low libido and the estrogen-testosterone link
- Testosterone in women: what it does and when testing matters
- Estrogen dominance: what the term means and whether it holds up
- Birth control vs HRT in perimenopause
- Pregnancy scares in perimenopause: why they happen, what to do
- Miscarriage risk and perimenopause: what the data shows
- Fear of losing your job: perimenopause, performance, and confidence at work
- Explaining perimenopause to in-laws and extended family (Indian joint-family angle)
- Why does everyone wake up at 3am? The science of early perimenopause waking
- The rage nobody warns you about: irritability and anger in perimenopause
- Perimenopause and loneliness: why friendships change
- Low ferritin and iron deficiency: the fatigue cause doctors miss
- Heart palpitations in perimenopause: when it's hormonal, when to worry
- What actually works for the 3am wake-up (practical sleep guide)
- Why perimenopause hits women with ADHD earlier and harder

### Written (fill in as used)
- Brain fog vs ADHD: how to tell the difference (`tmp/blog/brain-fog-vs-adhd-perimenopause.md`)
- Doctors refusing HRT: what to do and how to push back (`tmp/blog/doctors-refusing-hrt-how-to-push-back.md`)
- "You're too young for menopause": responding to medical dismissal (`tmp/blog/too-young-for-menopause-medical-dismissal.md`)
- Nobody told me HRT was even an option (`tmp/blog/nobody-told-me-hrt-was-an-option.md`)
- Common HRT myths, debunked (`tmp/blog/common-hrt-myths-debunked.md`)

## Reddit signal (for tone and future topic generation, not for direct topic scraping once the list above is exhausted)

Real Redditors in r/Perimenopause describe symptoms in blunt, specific, often funny-because-otherwise-you'd-cry language: forgetting the word "wrist" and calling it a "hand ankle", waking at exactly 3am with no idea why, wanting to "run away to a cottage in a bog", losing interest in friendships and relationships, being told by a doctor they're "too young" or having symptoms coded as something else entirely, feeling like they've become a different, angrier, more exhausted version of themselves. The recurring themes with the most repeated posts (signal of real demand): brain fog and word-finding specifically, the 3am wake-up, doctors dismissing or misdiagnosing symptoms, weight gain that doesn't respond to diet/exercise, and HRT experiences (both positive and frustrated). When generating new topics past the Gap List, match this register: specific, validating, willing to name the embarrassing or frightening version of a symptom rather than the clinical-sounding one, while keeping the actual post itself warm, clear, and India-contextualised per house style above.
