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

## Automated Blog Publishing Pipeline

`blog_automation/` — A fully automated content engine that finds trending topics, writes SEO-optimised blogs using Claude AI, generates images, and publishes across your website and social media — on a configurable schedule.

### How it works

```
Every N hours (configurable: 1h / 5h / 24h)
       │
       ▼
1. Topic Discovery
   ├── Google Trends (geo-targeted)
   ├── Custom URLs / client sites (scraped)
   └── LinkedIn hashtags
       │
       ▼ (Claude AI scores niche relevance)
2. Content Generation (Claude API)
   ├── Research outline
   ├── Full blog post (800–1500 words, HTML)
   ├── SEO: meta title, description, focus keyword, schema markup
   ├── AEO: FAQ section + FAQPage JSON-LD schema
   └── Social captions (Twitter / LinkedIn / Instagram)
       │
       ▼
3. Image Generation
   ├── Blog header image (DALL-E 3 / Stability AI / Unsplash)
   └── Social media square image
       │
       ▼
4. Publish to WordPress (REST API)
   ├── Uploads featured image
   ├── Creates/assigns categories & tags
   └── Injects JSON-LD schema into post
       │
       ▼
5. Post to Social Media
   ├── Twitter/X (with image)
   ├── LinkedIn (article share)
   └── Instagram (image + caption)
```

### Quick Start

```bash
cd blog_automation

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run once
python main.py

# Run on schedule (as set in config.yaml — default: every 24h)
python main.py --schedule

# Run every 5 hours
python main.py --schedule --interval 5

# Dry run (generates content, no publishing)
python main.py --dry-run

# Force a specific topic
python main.py --topic "AI Agents in Education"
```

### Configuration

Edit `blog_automation/config.yaml` to set:

| Setting | What it controls |
|---|---|
| `schedule.interval_hours` | How often to run (1, 5, or 24 hours) |
| `topic_sources.google_trends.geo` | Country for Google Trends (IN, US, GB…) |
| `topic_sources.custom_urls.sources` | Client or niche sites to scrape for topics |
| `content.tone` | Writing style / voice of your website |
| `content.blog.min_words` / `max_words` | Blog length |
| `image.provider` | `openai` (DALL-E 3), `stability`, or `placeholder` |
| `wordpress.site_url` | Your WordPress site URL |
| `social_media.twitter.enabled` | Toggle each platform on/off |

### Required API Keys

| Key | Purpose | Required? |
|---|---|---|
| `ANTHROPIC_API_KEY` | Blog writing + topic scoring | Yes |
| `OPENAI_API_KEY` | DALL-E 3 image generation | If using OpenAI images |
| `STABILITY_API_KEY` | Stability AI image generation | If using Stability |
| `WP_USERNAME` + `WP_APP_PASSWORD` | WordPress publishing | If publishing to WP |
| `TWITTER_API_KEY` etc. | Twitter/X posting | If enabling Twitter |
| `LINKEDIN_ACCESS_TOKEN` | LinkedIn posting | If enabling LinkedIn |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram posting | If enabling Instagram |

---

## Team
**AI Vidhyarthi** – India’s first student-led AI literacy initiative  
Founded by **Rudra Prasad Kasturi**, Chief Strategy & Growth Leader (ex-Google partner, Times Internet, Cars24).

---

## 🔗 Project Links
- Kaggle Notebook: [link]  
- Looker Studio Dashboard: [link]  
- Executive Summary (PDF): [docs/executive_summary.pdf](docs/executive_summary.pdf)  

---
