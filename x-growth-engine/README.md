# X Growth Engine

Automated X (Twitter) content engine. It **thinks up posts**, writes them in
your voice across two lanes — **AI** and **Politics** — optimizes them for
**AEO/SEO** (so AI answer engines and X search surface and quote you), and
**publishes them on a schedule**.

It ships in **review-first mode**: it generates and saves posts for you to read,
but publishes *nothing* until you opt in. Flip one flag when you trust it.

---

## How it works

```
config.json  →  generate.mjs (Claude)  →  run.mjs  →  xClient.mjs  →  X API
   ▲                                          │
 your voice                              output/*.json (review)
 + stances
```

- `config.json` — your voice, content pillars, **your political stances**, AEO rules, cadence.
- `src/generate.mjs` — turns the config into N ready-to-post tweets/threads.
- `src/run.mjs` — orchestrates: generate → review (default) or publish.
- `src/xClient.mjs` — posts to X (OAuth 1.0a, supports threads).
- `.github/workflows/x-auto-post.yml` — runs it daily at 09:00 IST, hands-off.

---

## What you must do (only you can)

### 1. Fill in your stances — `config.json`
The `lanes.politics.pillars` and `lanes.politics.stances` start as `FILL ME`.
**The engine will refuse to write any political post while those are unfilled** —
it never invents an opinion for you. Replace them with positions you actually
hold. Tune `voice`, `banned_phrases`, and `cadence` to taste.

### 2. Get X API credentials
Create a developer app at <https://developer.x.com> with **Read and Write**
permissions, then generate these four values:
`X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.

> Free tier ≈ 500 posts/month (plenty for ~16/day). Basic is paid.

### 3. Add secrets to GitHub
Repo → **Settings → Secrets and variables → Actions → Secrets**, add:
`ANTHROPIC_API_KEY`, `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.

---

## Running it

**Locally (review only — publishes nothing):**
```bash
cd x-growth-engine
npm install
ANTHROPIC_API_KEY=sk-... npm run review
```
Read the printed posts and the saved `output/posts-*.json`.

**Locally (publish for real):**
```bash
ANTHROPIC_API_KEY=sk-... X_API_KEY=... X_API_SECRET=... \
X_ACCESS_TOKEN=... X_ACCESS_SECRET=... npm run publish
```

**On a schedule (GitHub Actions):**
- It runs daily and, by default, only **generates + uploads** posts as a
  downloadable artifact — nothing goes live.
- To go fully hands-off live: set repo **Variable** `LIVE=true`
  (Settings → Secrets and variables → Actions → Variables).
- Or publish on demand: **Actions → X Auto-Post → Run workflow → publish = true**.

---

## Safety notes

- **Public + irreversible.** That's why it defaults to review. Trust the output
  for a few days before flipping `LIVE=true`.
- **Your name, your views.** Political posts are bounded strictly by the
  `stances` you write. `off_limits` topics are never touched.
- **Rate.** `cadence.posts_per_run` controls volume. Keep it human.
