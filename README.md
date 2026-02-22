# Grievance Insight Engine  
**AI Vidhyarthi Submission – BigQuery AI Hackathon**

## 🔍 Project Overview
India’s universities and local bodies receive thousands of unstructured complaints (text tickets, PDFs, voice notes, images) that often go unread and unresolved.  
The **Grievance Insight Engine** uses **BigQuery AI multimodal analysis** to transform this data into structured insights for faster resolution, accountability, and trust.

- **Text/PDFs** → Extract issue type, urgency, applicant details
- **Audio (multi-language)** → Transcribe & categorize
- **Images** → Caption & classify problems (e.g., broken infrastructure)
- **Vector search** → Retrieve similar past cases and recommended solutions
- **Dashboards** → Track trends, sentiment, and bottlenecks

---

## 🚀 Why BigQuery AI
- **ObjectRef** → Register multimodal data (text, PDF, audio, image)
- **AI.GENERATE_TABLE** → Convert unstructured inputs into structured SQL tables
- **Vector Search** → Find similar complaints and resolutions
- **SQL-first workflow** → Minimal engineering overhead, accessible for students

---

## 🛠️ Repo Contents
- `notebooks/` – Demo notebook (Kaggle export)
- `data/` – Small sample dataset (dummy tickets, PDFs, audio, images)
- `diagrams/` – Architecture flow diagram
- `docs/` – Executive summary proposal PDF
- `seo_audit/` – **SEO Audit Tool** (see below)
- `main.py` – CLI entry point for the SEO Audit Tool
- `requirements.txt` – Python dependencies

---

## 📊 Architecture
![Architecture Diagram](diagrams/architecture_flow.png)

**Pipeline:**  
Data sources → Cloud Storage → BigQuery (ObjectRef) → AI.GENERATE_TABLE → Vector Search → Looker Studio Dashboard

---

## 📈 Expected Impact
- 30% faster grievance resolution in pilot campuses  
- 85%+ categorization accuracy (labeled sample)  
- Cost < ₹150 per 1,000 records processed  
- Scalable across education, health, and governance

---

## 📚 How to Run
1. Open `notebooks/grievance_insight_engine_demo.ipynb` in Kaggle or Colab.  
2. Run all cells to see:  
   - Data ingestion examples  
   - BigQuery AI calls (`AI.GENERATE_TABLE`)  
   - Vector search queries  
   - Output structured tables  
3. (Optional) Connect BigQuery tables to Looker Studio to view dashboard.

---

---

## SEO Audit Tool

AI-powered command-line SEO auditor. Crawls any URL, runs **12 category checks**, scores the page 0–100, and uses **Claude** to generate three AI-written reports: Client Proposal, Prioritised Roadmap, and Traffic Strategy. Fully site-type-aware (news, ecommerce, SaaS, events, and more).

### 12 Audit Categories

| # | Category | What It Checks |
|---|---|---|
| 1 | **SEO On-Page** | Title, meta description, headings, canonical, robots, OG tags, alt text |
| 2 | **Technical SEO** | HTTPS, HSTS, schema/JSON-LD, viewport, doctype, charset, hreflang, cache headers |
| 3 | **SEO Content** | Word count, readability, paragraph structure, freshness signals, content/code ratio |
| 4 | **SEO Interlinking** | Internal link count, anchor text quality, breadcrumbs, nofollow on internals |
| 5 | **Pagespeed** | Server response time, render-blocking resources, lazy loading, compression, font hints |
| 6 | **Keyword Research & Usage** | Primary keyword in title/H1/URL, density, semantic diversity, first-100-words |
| 7 | **UX / UI** | Mobile viewport, touch targets, CTAs, semantic HTML5, skip nav, footer |
| 8 | **Product SEO** | Product/Offer/Review schema, breadcrumb schema, availability, FAQ on product pages |
| 9 | **AEO (Answer Engine Opt.)** | FAQPage schema, question headings, definition sentences, HowTo, tables, Speakable |
| 10 | **GEO (Generative Engine Opt.)** | Organization schema, sameAs profiles, E-E-A-T signals, About/Contact pages |
| 11 | **SEO Off-Page** | Social profile links, press signals, authoritative outbound links + tool-flag items |
| 12 | **SEO Backlinking** | Link-earning assets, content depth, citation signals + Ahrefs/SEMrush flag items |

### Site Types

Pass `--site-type` to weight categories correctly for your site:

| Type | Flag | Emphasis |
|---|---|---|
| News / Media | `news` | Content freshness, AEO, Technical SEO |
| Product (B2B/B2C) | `product` | Product schema, UX, Keywords |
| E-Commerce | `ecommerce` | Product SEO, Pagespeed, Interlinking |
| SaaS Company | `saas` | AEO, GEO, Content, Backlinking |
| News + Product (hybrid) | `news_product` | Content, AEO, Product schema |
| Events | `events` | Event schema, Technical SEO, UX |
| Generic | `generic` | All categories equal weight |

### 3 Output Formats

| Format | What's in it |
|---|---|
| **Client Proposal** | Executive summary, top critical issues explained for non-technical stakeholders, expected impact |
| **Roadmap** | Phase 1: Quick Wins (week 1–2) / Phase 2: Core fixes (month 1–2) / Phase 3: Long-term (month 3–6) |
| **Traffic Strategy** | Site-type-specific channel priorities, content opportunities, 30-day quick wins |

All three sections appear as tabs in the HTML report and are AI-written by Claude when `ANTHROPIC_API_KEY` is set.

### Quickstart

```bash
pip install -r requirements.txt

export ANTHROPIC_API_KEY=sk-ant-...

# Basic audit
python main.py https://example.com

# With site type + all outputs
python main.py https://example.com --site-type ecommerce --output report.html --json report.json

# SaaS site, no AI
python main.py https://example.com --site-type saas --no-ai

# See all warnings in terminal
python main.py https://example.com --verbose
```

### Module layout

```
seo_audit/
  crawler.py                HTTP fetch + BeautifulSoup DOM extraction
  engine.py                 Orchestrates all 12 categories → AuditResult
  categories/
    base.py                 Finding, Severity, CategoryReport dataclasses
    onpage.py               On-Page SEO checks
    technical.py            Technical SEO checks
    content.py              Content quality checks
    interlinking.py         Internal link structure checks
    pagespeed.py            Performance / Core Web Vitals proxy checks
    keywords.py             Keyword usage & density checks
    ux_ui.py                UX/UI signal checks
    product_seo.py          Product schema & e-commerce checks
    aeo.py                  Answer Engine Optimization checks
    geo.py                  Generative Engine Optimization checks
    offpage.py              Off-page & social signal checks
    backlinking.py          Backlink potential & external tool flags
  site_types/
    profiles.py             SiteType enum + 6 weighted site profiles
  outputs/
    models.py               AuditResult dataclass (holds all reports)
    html_report.py          Tabbed HTML report (Proposal / Findings / Roadmap / Traffic)
    json_report.py          Machine-readable JSON export
    ai_narratives.py        Claude API — generates all 3 narrative sections
main.py                     CLI entry point (argparse)
```

---

## 👥 Team
**AI Vidhyarthi** – India’s first student-led AI literacy initiative  
Founded by **Rudra Prasad Kasturi**, Chief Strategy & Growth Leader (ex-Google partner, Times Internet, Cars24).

---

## 🔗 Project Links
- Kaggle Notebook: [link]  
- Looker Studio Dashboard: [link]  
- Executive Summary (PDF): [docs/executive_summary.pdf](docs/executive_summary.pdf)  

---
