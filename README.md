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

## 👥 Team
**AI Vidhyarthi** – India’s first student-led AI literacy initiative  
Founded by **Rudra Prasad Kasturi**, Chief Strategy & Growth Leader (ex-Google partner, Times Internet, Cars24).

---

## 🔗 Project Links
- Kaggle Notebook: [link]  
- Looker Studio Dashboard: [link]  
- Executive Summary (PDF): [docs/executive_summary.pdf](docs/executive_summary.pdf)  

---
