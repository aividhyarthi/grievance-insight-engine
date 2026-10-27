# Retrofit Guide — SEO/AEO + Tone Pass on Existing Posts

Started 2026-10-27. This replaces the old daily new-post creation job (now
disabled). No new posts are being written. Instead, this is a slow,
judicious pass over the existing ~967 posts (439 Her Midlife, 264 His
Midlife, 264 Life Begins After 40), oldest-first, fixing what's actually
weak rather than rewriting everything mechanically.

## Pace

5 posts per day, total, picked in order from `tmp/RETROFIT-QUEUE.txt`
(oldest pubDate first, across all three verticals combined). Not 5 per
vertical — 5 total.

## What to check on each post

For each of the 5 posts, read the full file and assess:

1. **SEO title** (the `title` frontmatter field, used as the page `<title>`
   and H1): does it contain the actual target keyword phrase a reader would
   search, placed early? Is it specific rather than generic?
2. **Meta description** (the `description` frontmatter field): does it
   contain the keyword naturally, read like a reason to click (not just a
   restated title), and stay roughly 140-160 characters?
3. **H1 / body**: does the opening paragraph and first H2 reinforce the
   primary keyword? Is the body written as a direct, warm address to
   someone currently going through this, not a detached "Journal Desk
   explains X" third-person explainer? Rewrite passages that read like a
   press release rather than a conversation with the reader — "you" not
   "women experience" or "one may find."
4. **FAQ section**: are the questions phrases a real person would type into
   Google (voice-search / "People Also Ask" style), and are the answers
   direct, short first sentence doing the work (good for AEO/answer boxes)?
5. **Interlinking**: does the body link to at least 1-2 other relevant posts
   on the site (beyond the automatic sidebar widget), using descriptive
   anchor text, not "click here"?

**Only edit what's genuinely weak.** If a post already does all five of
these well, leave it alone, don't force changes for the sake of touching it.
Record it in the done log as "reviewed, no changes needed" rather than
padding the diff.

## House style (unchanged)

Zero em dashes, no brand/drug names, "doctor"/"gynaecologist" never "GP",
India context (₹, emergency=112, iCall 9152987821), no false medical
credentials in bylines. See each vertical's `BLOG-AUTOPUBLISH-GUIDE*.md`
for full house style if anything is unclear.

## When you edit a post

- Set `updatedDate: YYYY-MM-DD` (today) in the frontmatter — this is what
  drives the sitemap's `lastmod` and the article schema's `dateModified`,
  so only set it on posts that actually got real content changes, not on
  posts you reviewed and left alone.
- The `author` field is already a real name (bulk-reassigned 2026-10-27) —
  leave it as-is unless the post's topic genuinely doesn't match the
  assigned writer's beat.
- Re-run the zero-em-dash check on anything you touch.

## Process each day

1. Read `tmp/RETROFIT-QUEUE.txt`, take the top 5 lines.
2. For each, do the assessment above and edit only what needs it.
3. Remove those 5 lines from the top of `RETROFIT-QUEUE.txt`.
4. Append one line per post to `tmp/RETROFIT-DONE.md` noting what changed
   (or "reviewed, no changes needed").
5. Commit and push to `origin claude/perimenopause-chat-app-kgml4`.
6. Send a brief summary to the user.
