# Content Distributor

Turns every new article on your websites into a **LinkedIn post** and an **X thread**, written in your voice.

```
New article on your site → Claude writes the posts → saved as a draft → (you approve) → posted
```

## The two modes

| Mode | What happens | When to use |
|---|---|---|
| **review** (default) | Writes drafts. Posts **nothing**. | Start here. |
| **auto** | Writes drafts and posts straight away. | Once you trust the quality. |

Each site has its own mode in `config.json` (`"mode": "review"` or `"mode": "auto"`).

### How to review and approve (no code needed)
1. Drafts appear in GitHub in the folder `content-distributor/drafts/<site>/`. Open one, read it, and edit the text directly in GitHub if you want.
2. To post what you approved: GitHub → **Actions** → **Content distributor** → **Run workflow** → choose **publish**.
3. To stop a draft from being posted, open it and change `"status": "draft"` to `"status": "skipped"`.

A draft marked `needs_edit` failed a quality check (too long, banned phrase). Fix the text, change the status to `draft`, then publish.

## One-time setup

### 1. Claude key (required)
GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
- `ANTHROPIC_API_KEY` = your Anthropic API key.

### 2. X (Twitter) keys (only needed for posting)
Create an app at developer.x.com with **Read and Write** permission, then add 4 secrets:
`X_PERSONAL_API_KEY`, `X_PERSONAL_API_SECRET`, `X_PERSONAL_ACCESS_TOKEN`, `X_PERSONAL_ACCESS_SECRET`

### 3. LinkedIn token (only needed for posting)
Create an app at linkedin.com/developers, add the products **"Share on LinkedIn"** and **"Sign In with LinkedIn using OpenID Connect"**, generate a token with the scopes `openid profile w_member_social`, and add the secret:
`LINKEDIN_PERSONAL_ACCESS_TOKEN`

LinkedIn tokens expire after about 60 days. When posting starts failing with a 401 error, make a new token and replace the secret.

You can do all of this later. Review mode needs only step 1.

## Adding another website
Open `config.json`, copy one block inside `"sites"`, and change:
- `id` (short name, no spaces), `name`
- `sitemap` (e.g. `https://yoursite.com/sitemap.xml`) or `feed` (an RSS link)
- `only_paths` (e.g. `["/blog/"]` to only pick article pages; `[]` for all pages)
- `post_to` (which accounts it posts to)
- `voice` (how the posts should sound)

## Adding another account (e.g. a second personal profile or another X account)
In `config.json` under `"accounts"`, add a new entry with a `secret_prefix` of your choice, then add secrets named `<PREFIX>_ACCESS_TOKEN` (and for X the four keys, as above). Add its name to a site's `post_to`. No other change is needed.

Note: LinkedIn **company pages** are not supported yet. Posting to a page needs a different kind of author and extra LinkedIn permissions. Ask for it when you need it.

## What it does on the first run
It does not flood your feed. For each site it picks only the **latest 2** articles (`max_per_run`) and ignores the rest. After that, only genuinely new articles are picked up.

## Schedule
Runs daily at 09:00 IST. You can also run it manually from the **Actions** tab.

## Running on your own computer (optional)
```
cd content-distributor
npm install
ANTHROPIC_API_KEY=... npm run review
```
