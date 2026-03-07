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
- `requirements.txt` – (Optional) Dependencies

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

## 🗺️ Local SEO Audit Tool

A standalone tool that audits any Google My Business (GMB) listing and generates an AI-powered improvement report.

### Features
- Fetches live GMB data via the **Google Places API**
- Scores 12 local SEO signals (NAP, reviews, photos, hours, categories, etc.) out of 100
- Generates a **Claude AI** improvement plan with priority fixes and growth strategy
- Outputs a rich terminal report or raw JSON

### Setup

```bash
pip install -r requirements.txt

export GOOGLE_PLACES_API_KEY="your-google-places-api-key"
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

**Getting a Google Places API key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Places API**
3. Create an API key under APIs & Services → Credentials

### Usage

```bash
# Full audit with AI insights
python run_seo_audit.py "Joe's Pizza, Brooklyn NY"

# Skip AI (no Anthropic key needed, faster)
python run_seo_audit.py "Central Park Dentist NYC" --no-ai

# Output raw JSON for integration
python run_seo_audit.py "Starbucks Times Square" --json
```

### Scoring Breakdown

| Signal | Max Points |
|---|---|
| Business Name | 5 |
| Address (NAP) | 10 |
| Phone Number | 8 |
| Website Link | 10 |
| Business Categories | 8 |
| Business Hours | 10 |
| Rating Exists | 5 |
| Review Volume | 15 |
| Rating Quality | 8 |
| Photos | 10 |
| Business Description | 7 |
| Listing Status | 4 |
| **Total** | **100** |

### Files

```
local_seo_audit/
  __init__.py       – Package
  fetcher.py        – Google Places API client
  auditor.py        – SEO scoring engine (12 signals)
  ai_insights.py    – Claude claude-opus-4-6 improvement recommendations
  report.py         – Rich terminal report renderer
run_seo_audit.py    – CLI entry point
requirements.txt    – Python dependencies
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
