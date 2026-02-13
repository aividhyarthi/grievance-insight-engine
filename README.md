# AEO Audit Tool

**AI Answer Engine Optimization Auditor** by AI Vidhyarthi

Audit any website to see how AI bots (Google AI Overviews, ChatGPT, Claude, Perplexity) read your content. Get a scored report with actionable fixes for content, branding, and technical issues.

---

## One-Click Deploy

### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app) and sign up (free tier available)
2. Click **"New Project"** > **"Deploy from GitHub Repo"**
3. Connect your GitHub and select this repo (`aividhyarthi/grievance-insight-engine`)
4. Select branch: `claude/aeo-audit-tool-pwvzo`
5. Railway auto-detects the config. Click **Deploy**
6. Once deployed, click the generated URL to open your tool

### Option 2: Render

1. Go to [render.com](https://render.com) and sign up (free tier available)
2. Click **"New +"** > **"Web Service"**
3. Connect your GitHub and select this repo
4. Settings will auto-fill from `render.yaml`
5. Click **"Create Web Service"**
6. Wait for build to finish, then click the live URL

### Option 3: Vercel (Alternative)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New Project"** > Import this repo
3. In **Build Settings** set:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/client`
4. Add a **Serverless Function** (see Vercel docs for Express adapter)

> **Note:** Railway and Render are easiest since this app has a backend server. Vercel requires extra config for the API.

---

## What It Checks

| Category | What it audits |
|----------|---------------|
| **AI Bot Access** | robots.txt rules for 12 AI bots (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Amazonbot, etc.) |
| **Content Quality** | Word count, question headings, answer-ready paragraphs, lists/tables, readability, freshness |
| **Structured Data** | JSON-LD schema markup, GEO-relevant types (FAQPage, Article, Organization, HowTo) |
| **Meta Tags & OG** | Title/description, OpenGraph, Twitter Cards, canonical URL, language tag |
| **Technical SEO** | HTTPS, response time, page size, JS payload, CSR vs SSR detection, image alt text |
| **Branding & E-E-A-T** | Brand mentions, About/Contact pages, author attribution, social profiles, trust signals |
| **Heading Structure** | H1 presence, heading hierarchy, section organization |
| **Link Profile** | Internal/external links, breadcrumbs, navigation structure |

---

## How to Use

1. Open the app in your browser
2. Type a website URL (e.g. `example.com`)
3. Click **"Audit Website"**
4. Wait 2-5 seconds
5. Read the report:
   - **Overall Score** (0-100, graded A+ to F)
   - **AI Bot Access Table** (which bots can/can't crawl)
   - **Category Breakdowns** (click each card for details)
   - **Recommendations** (prioritized fixes)

---

## Run Locally (for developers)

```bash
# Clone the repo
git clone https://github.com/aividhyarthi/grievance-insight-engine.git
cd grievance-insight-engine
git checkout claude/aeo-audit-tool-pwvzo

# Install dependencies
npm install

# Start dev mode (frontend + backend)
npm run dev

# Open http://localhost:5173
```

### Production build

```bash
npm run build    # Builds frontend
npm start        # Starts server on port 3001 (serves frontend + API)
```

### Docker

```bash
docker build -t aeo-audit-tool .
docker run -p 3001:3001 aeo-audit-tool
# Open http://localhost:3001
```

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Express.js + TypeScript
- **Analysis:** Cheerio (HTML parsing) + robots-parser
- **No database needed** - audits run on-the-fly

---

## Team

**AI Vidhyarthi** -- India's first student-led AI literacy initiative
Founded by **Rudra Prasad Kasturi**, Chief Strategy & Growth Leader.
