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
- **Structure**: intro paragraph (no heading) → 3-5 `##` sections → closing paragraph → horizontal rule → this exact closing line in italics:
  `*His Midlife is an information resource, not a medical provider. For personal advice, speak with your doctor. Write to us at thesecondspringofficial@gmail.com*`
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
- Medical claims should stay confident but appropriately hedged ("can", "may", "for many men"), never absolute, always pointing toward a doctor for personal decisions or diagnosis. Never suggest self-treating with supplements or unprescribed hormones.

## Tone signal

Direct, calm, evidence-aware, respectful, written for Indian men navigating midlife hormonal changes who may feel embarrassed, dismissed, or confused about what's happening to them. Avoid marketing-speak ("unlock your best self", "biohack") and avoid alarmism. Name specific, concrete symptoms and situations (a man noticing he's weaker at the gym than last year, a man too embarrassed to bring up libido with his doctor, a man whose wife has noticed he's more irritable) rather than vague generalities.

## Gap List

### Not yet written
- Sleep apnoea and testosterone: the connection most men don't know about
- Alcohol and testosterone: how much is actually too much
- Cortisol and testosterone: why chronic stress lowers your levels
- Protein intake after 40: how much you actually need and why it changes
- Diabetes, metabolic syndrome, and low testosterone: the shared root cause
- Heart health and testosterone: what the connection really is
- Understanding your testosterone blood test: what the numbers actually mean
- Testosterone replacement therapy: risks, benefits, and who it's actually for
- Natural ways to support testosterone: what has real evidence and what doesn't
- Hair loss and skin changes in andropause: what's hormonal, what's just ageing
- Snoring and your partner: why sleep issues affect more than just you
- Comparing yourself to your younger self: the psychology of midlife physical change
- Getting your doctor to take you seriously: a practical advocacy guide
- Cost of testosterone testing and treatment in India: what to expect
- Joint pain and inflammation in midlife men: is testosterone involved
- Motivation and goal-setting when your body doesn't respond like it used to
- Depression in men: the andropause link nobody talks about
- Relationship and intimacy changes: talking to your partner about what's happening
- Workplace performance and energy: managing a demanding job with declining energy
- Building a morning routine that actually supports hormonal health

### Written (fill in as used)
(none yet, first run in progress)
