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

An AI-powered command-line SEO auditor built on top of this repo.
It crawls any public URL, runs 14 rule-based checks, scores the page, and uses **Claude** to generate prioritised, actionable recommendations.

### Checks performed

| Category | Checks |
|---|---|
| Reachability | HTTP status code |
| Security | HTTPS enforcement |
| Title Tag | Presence, length (50–60 chars) |
| Meta Description | Presence, length (150–160 chars) |
| Headings | H1 uniqueness, H2 structure |
| Images | Alt text, lazy loading |
| Links | Internal links, anchor text |
| Performance | Server response time |
| Canonicalization | `<link rel="canonical">` |
| Social / Open Graph | og:title, og:description, og:image, og:url |
| Structured Data | JSON-LD presence |
| Content | Word count (thin content detection) |
| Internationalisation | HTML `lang` attribute |
| Indexability | Robots meta tag (noindex detection) |

### Outputs

- **Terminal** — colour-coded findings + score summary + AI narrative
- **HTML report** — self-contained, shareable audit page (`seo_report.html`)
- **JSON report** — machine-readable, CI-friendly (`--json report.json`)

### Quickstart

```bash
# Install dependencies
pip install -r requirements.txt

# Run an audit (AI insights require ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-ant-...
python main.py https://example.com

# Save reports
python main.py https://example.com --output report.html --json report.json

# Skip AI (no API key needed)
python main.py https://example.com --no-ai
```

### Module layout

```
seo_audit/
  __init__.py       package marker
  crawler.py        HTTP fetch + BeautifulSoup DOM extraction
  analyzer.py       14 rule-based SEO checks → SEOReport + score
  ai_insights.py    Claude API call for narrative recommendations
  reporter.py       HTML + JSON report generators
main.py             CLI entry point (argparse)
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
