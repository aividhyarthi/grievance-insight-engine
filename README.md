# India AI Content Compliance Checker

**by AI Vidhyarthi** — India's first student-led AI literacy initiative

An AI-powered tool that checks whether your AI-generated content complies with India's **IT Rules 2026** and **Digital Personal Data Protection (DPDP) Act 2023**.

---

## The Problem

India now has strict rules for AI-generated content — watermarking, fact-checking, consent, bias audits, and more. But most creators, startups, and students have **no idea** if their content is compliant. Reading 100+ pages of legal text isn't practical.

## The Solution

Paste your AI-generated content, select the content type, and get an **instant compliance report** with:

- Overall compliance score (0-100)
- Rule-by-rule breakdown with pass/fail status
- Specific recommendations to fix violations
- Risk level assessment (Low / Medium / High / Critical)

---

## Rules Covered

| Rule | What It Checks |
|------|---------------|
| IT Rules 2026 - Watermarking | AI content must be clearly labeled/watermarked |
| IT Rules 2026 - Fact-checking | Claims must be verifiable, sources cited |
| IT Rules 2026 - Consent | Personal data requires explicit consent |
| IT Rules 2026 - Grievance | Must have grievance redressal mechanism |
| DPDP Act - Data Minimization | Collect only necessary personal data |
| DPDP Act - Purpose Limitation | Data used only for stated purpose |
| DPDP Act - Bias & Fairness | Content must not discriminate |

---

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **AI Engine**: Groq API (Llama 3.3 70B)
- **Build**: Vite
- **Deploy**: Railway / Render ready

---

## Run Locally

```bash
# Clone
git clone https://github.com/aividhyarthi/india-ai-guidelines.git
cd india-ai-guidelines

# Install
npm install

# Set up environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# Run
npm run dev
```

Open `http://localhost:5000` in your browser.

---

## Deploy on Railway

1. Fork this repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select this repo
4. Add environment variable: `GROQ_API_KEY` = your key from [console.groq.com](https://console.groq.com)
5. Deploy → Generate Domain → Done

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | API key from Groq Cloud |
| `PORT` | No | Server port (default: 5000) |

---

## Screenshots

> Upload screenshots after deployment to showcase the UI

---

## About AI Vidhyarthi

**AI Vidhyarthi** is India's first student-led AI literacy initiative, founded by **Rudra Prasad Kasturi** (Chief Strategy & Growth Leader — ex-Google partner, Times Internet, Cars24). We build practical AI tools that solve real Indian problems.

### Other Projects
- [AEO Audit Tool](https://github.com/aividhyarthi/aeo-audit-tool) — AI-powered Answer Engine Optimization auditor

---

## License

MIT
