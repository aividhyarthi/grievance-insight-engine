# BeforeLawyer
**India's Open Legal Case Research Library**

[![Instagram](https://img.shields.io/badge/@beforelawyer-E4405F?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/beforelawyer/)

## About

**BeforeLawyer** is an open legal case research library built for lawyers, law students, judges, and senior advocates. It provides:

- **70+ Landmark Cases** — Indian & international, with full case briefs, arguments, judge observations, and timelines
- **Legal Glossary** — 100+ terms covering criminal, civil, constitutional, and procedural law (updated for BNS/BNSS/BSA)
- **Analytics Dashboard** — Interactive charts on case types, court distribution, outcomes, and trends
- **Young Lawyer Toolkit** — Case brief templates for every case type
- **Court Info** — Current judges (SC & all HCs), court proceedings guide, court holidays
- **Lawyer Resources** — Curated links to official legal databases and tools

## Tech Stack

- **Backend**: Python / Flask / SQLAlchemy
- **Frontend**: Vanilla HTML/CSS/JS with Chart.js
- **Database**: SQLite (auto-seeded on first run)
- **Deployment**: Railway / Heroku / any WSGI server

## Quick Start

```bash
pip install -r requirements.txt
python run.py
# Open http://localhost:5000
```

## Repo Structure

- `beforelawyer/` — Flask app, models, seed data, templates, static assets
- `beforelawyer/indian_cases.py` — 50 curated Indian landmark cases
- `beforelawyer/seed_data.py` — International cases, glossary, templates, enrichment data
- `notebooks/` — Demo notebook (Kaggle export)
- `run.py` — Development server entry point
- `wsgi.py` — Production WSGI entry point

## Team

**AI Vidhyarthi** — India's first student-led AI literacy initiative
Founded by **Rudra Prasad Kasturi**, Chief Strategy & Growth Leader.

## Follow Us

- Instagram: [@beforelawyer](https://www.instagram.com/beforelawyer/)
