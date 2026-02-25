import asyncio
import os
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from models import ScanRequest, ScanResponse, SuggestRequest, ScheduleRequest, KYOBRRequest
from database import (
    init_db, create_scan, update_scan_status, save_citations,
    get_scan, get_scan_results, get_all_scans, get_domain_trends,
    create_schedule, get_all_schedules, get_due_schedules,
    update_schedule_run, toggle_schedule, delete_schedule,
    save_kyobr_scan, get_kyobr_history, get_kyobr_scan,
)
from demo_engine import generate_demo_results

load_dotenv()

app = FastAPI(title="AEO Citation Tracker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.on_event("startup")
async def startup():
    init_db()
    asyncio.create_task(_schedule_checker())


@app.get("/")
async def serve_index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


# ─── API Status ───────────────────────────────────────────────────────────────

@app.get("/api/status")
async def api_status():
    return {
        "perplexity": bool(os.getenv("PERPLEXITY_API_KEY")),
        "serpapi": bool(os.getenv("SERPAPI_KEY")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
        "gemini": bool(os.getenv("GEMINI_API_KEY")),
        "deepseek": bool(os.getenv("DEEPSEEK_API_KEY")),
        "demo_mode": not any([
            os.getenv("PERPLEXITY_API_KEY"),
            os.getenv("SERPAPI_KEY"),
            os.getenv("OPENAI_API_KEY"),
        ]) or os.getenv("FORCE_DEMO_MODE", "").lower() == "true",
    }


# ─── Scan Endpoints ───────────────────────────────────────────────────────────

@app.post("/api/scan", response_model=ScanResponse)
async def start_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    if not request.keywords:
        raise HTTPException(status_code=400, detail="At least one keyword is required")
    if not request.target_url:
        raise HTTPException(status_code=400, detail="Target URL is required")

    scan_id = str(uuid.uuid4())[:8].upper()
    create_scan(scan_id, request)
    background_tasks.add_task(_run_scan, scan_id, request)

    from datetime import datetime
    return ScanResponse(
        scan_id=scan_id,
        status="running",
        created_at=datetime.utcnow().isoformat(),
    )


async def _run_scan(scan_id: str, request: ScanRequest):
    """Background task: run scan (demo or real API) and save results."""
    try:
        use_demo = _should_use_demo(request)

        # Simulate realistic scan delay (even in demo — makes UX feel authentic)
        await asyncio.sleep(2.5 + len(request.keywords) * 0.4)

        if use_demo:
            results = generate_demo_results(request)
        else:
            results = await _run_real_scan(request)

        save_citations(scan_id, results)
        update_scan_status(scan_id, "completed")

    except Exception as e:
        print(f"[Scan {scan_id}] Error: {e}")
        update_scan_status(scan_id, "failed")


async def _run_real_scan(request: ScanRequest) -> dict:
    """Route to real API scrapers based on available keys."""
    from scrapers.perplexity_scraper import query_perplexity_api
    from scrapers.serpapi_client import get_google_ai_overview
    from demo_engine import generate_demo_results, _get_domain

    target_domain = _get_domain(request.target_url)
    competitor_domains = [_get_domain(u) for u in request.competitor_urls]
    all_domains = [target_domain] + competitor_domains

    citations = []
    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    serpapi_key = os.getenv("SERPAPI_KEY")

    for keyword in request.keywords:
        if "perplexity" in request.engines and perplexity_key:
            try:
                sources = query_perplexity_api(keyword, target_domain, perplexity_key)
                for s in sources:
                    if s["domain"] in all_domains:
                        citations.append({
                            "keyword": keyword,
                            "engine": "perplexity",
                            "engine_name": "Perplexity AI",
                            "engine_color": "#20B2AA",
                            "cited_url": s["url"],
                            "cited_domain": s["domain"],
                            "is_target": s["is_target"],
                            "position": s["position"],
                            "citation_count": 1,
                            "sentiment": s["sentiment"],
                            "snippet": s["snippet"],
                            "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
                        })
            except Exception as e:
                print(f"Perplexity API error for '{keyword}': {e}")

        if "google_ai_overview" in request.engines and serpapi_key:
            try:
                sources = get_google_ai_overview(keyword, target_domain, serpapi_key)
                for s in sources:
                    if s["domain"] in all_domains:
                        citations.append({
                            "keyword": keyword,
                            "engine": "google_ai_overview",
                            "engine_name": "Google AI Overview",
                            "engine_color": "#4285F4",
                            "cited_url": s["url"],
                            "cited_domain": s["domain"],
                            "is_target": s["is_target"],
                            "position": s["position"],
                            "citation_count": 1,
                            "sentiment": s["sentiment"],
                            "snippet": s["snippet"],
                            "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
                        })
            except Exception as e:
                print(f"SerpAPI error for '{keyword}': {e}")

        # For engines without keys, fall back to demo
        missing_engines = [
            e for e in request.engines
            if e not in ("perplexity" if perplexity_key else [], "google_ai_overview" if serpapi_key else [])
        ]
        if missing_engines:
            fallback_req = ScanRequest(
                target_url=request.target_url,
                competitor_urls=request.competitor_urls,
                keywords=[keyword],
                engines=missing_engines,
                use_demo=True,
            )
            fallback = generate_demo_results(fallback_req)
            citations.extend(fallback["citations"])

    return {
        "citations": citations,
        "target_domain": target_domain,
        "competitor_domains": competitor_domains,
        "keywords": request.keywords,
        "engines": request.engines,
    }


def _should_use_demo(request: ScanRequest) -> bool:
    if os.getenv("FORCE_DEMO_MODE", "").lower() == "true":
        return True
    if request.use_demo:
        return True
    has_any_key = any([
        os.getenv("PERPLEXITY_API_KEY"),
        os.getenv("SERPAPI_KEY"),
        os.getenv("OPENAI_API_KEY"),
    ])
    return not has_any_key


@app.get("/api/scan/{scan_id}")
async def get_scan_status(scan_id: str):
    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@app.get("/api/scan/{scan_id}/results")
async def get_results(scan_id: str):
    scan = get_scan(scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    if scan["status"] == "running":
        return {"status": "running", "scan_id": scan_id}
    results = get_scan_results(scan_id)
    if not results:
        raise HTTPException(status_code=404, detail="Results not found")
    return results


@app.get("/api/trends/{domain:path}")
async def domain_trends(domain: str):
    return {"domain": domain, "scans": get_domain_trends(domain)}


@app.get("/api/scans")
async def list_scans():
    return get_all_scans()


@app.delete("/api/scan/{scan_id}")
async def delete_scan(scan_id: str):
    import sqlite3
    from database import get_conn
    conn = get_conn()
    conn.execute("DELETE FROM citations WHERE scan_id=?", (scan_id,))
    conn.execute("DELETE FROM scans WHERE scan_id=?", (scan_id,))
    conn.commit()
    conn.close()
    return {"deleted": scan_id}


# ─── Schedules ────────────────────────────────────────────────────────────────

def _next_run_time(frequency: str) -> str:
    from datetime import timedelta
    from datetime import datetime as dt
    delta = {"daily": timedelta(days=1), "weekly": timedelta(weeks=1), "monthly": timedelta(days=30)}.get(frequency, timedelta(weeks=1))
    return (dt.utcnow() + delta).isoformat()


@app.post("/api/schedules")
async def create_schedule_endpoint(req: ScheduleRequest):
    if not req.keywords:
        raise HTTPException(status_code=400, detail="At least one keyword required")
    schedule_id = str(uuid.uuid4())[:8].upper()
    next_run = _next_run_time(req.frequency)
    create_schedule(schedule_id, req.target_url, req.competitor_urls, req.keywords, req.engines, req.frequency, next_run)
    return {"schedule_id": schedule_id, "next_run_at": next_run}


@app.get("/api/schedules")
async def list_schedules():
    return get_all_schedules()


@app.patch("/api/schedules/{schedule_id}/toggle")
async def toggle_schedule_endpoint(schedule_id: str, active: bool):
    toggle_schedule(schedule_id, active)
    return {"schedule_id": schedule_id, "is_active": active}


@app.delete("/api/schedules/{schedule_id}")
async def delete_schedule_endpoint(schedule_id: str):
    delete_schedule(schedule_id)
    return {"deleted": schedule_id}


async def _schedule_checker():
    """Background task: check for due schedules every 60 s and fire scans."""
    while True:
        await asyncio.sleep(60)
        try:
            for sched in get_due_schedules():
                scan_id = str(uuid.uuid4())[:8].upper()
                req = ScanRequest(
                    target_url=sched["target_url"],
                    competitor_urls=__import__("json").loads(sched["competitor_urls"]),
                    keywords=__import__("json").loads(sched["keywords"]),
                    engines=__import__("json").loads(sched["engines"]),
                    use_demo=_should_use_demo(ScanRequest(
                        target_url=sched["target_url"],
                        keywords=__import__("json").loads(sched["keywords"]),
                    )),
                )
                create_scan(scan_id, req)
                update_schedule_run(sched["schedule_id"], scan_id, _next_run_time(sched["frequency"]))
                asyncio.create_task(_run_scan(scan_id, req))
                print(f"[Scheduler] Fired scan {scan_id} for {sched['target_url']} ({sched['frequency']})")
        except Exception as e:
            print(f"[Scheduler] Error: {e}")


# ─── Keyword Suggestions ──────────────────────────────────────────────────────

@app.post("/api/suggest-keywords")
async def suggest_keywords(body: SuggestRequest):
    url = body.url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    page_text = _fetch_page_text(url)
    openai_key = os.getenv("OPENAI_API_KEY")

    if openai_key:
        try:
            keywords = _suggest_via_openai(url, page_text, openai_key)
            return {"keywords": keywords, "source": "ai"}
        except Exception as e:
            print(f"OpenAI suggest error: {e}")

    return {"keywords": _suggest_demo(url, page_text), "source": "demo"}


def _fetch_page_text(url: str) -> str:
    """Fetch a page and extract title, meta description, and headings."""
    import re
    import requests as req
    try:
        resp = req.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0 (compatible; AEOBot/1.0)"})
        html = resp.text[:40000]

        title_m = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
        title = re.sub(r'<[^>]+>', '', title_m.group(1)).strip() if title_m else ""

        desc_m = re.search(
            r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']{0,300})["\']',
            html, re.IGNORECASE
        ) or re.search(
            r'<meta[^>]+content=["\']([^"\']{0,300})["\'][^>]+name=["\']description["\']',
            html, re.IGNORECASE
        )
        description = desc_m.group(1).strip() if desc_m else ""

        headings = re.findall(r'<h[123][^>]*>(.*?)</h[123]>', html, re.IGNORECASE | re.DOTALL)
        headings_text = " | ".join(re.sub(r'<[^>]+>', '', h).strip() for h in headings[:10])

        return "\n".join(p for p in [title, description, headings_text] if p)[:2000]
    except Exception:
        return ""


def _suggest_via_openai(url: str, page_text: str, api_key: str) -> list:
    """Call OpenAI to generate AEO keyword suggestions for the given site."""
    import json, re
    import requests as req

    prompt = (
        "You are an AEO (Answer Engine Optimization) expert. "
        "Analyze this website and generate exactly 15 search queries that:\n"
        "1. Users would type into AI engines like Perplexity, ChatGPT, or Google AI Overview\n"
        "2. The website could realistically appear as a citation for\n"
        "3. Mix brand queries (mentioning the site) and generic category queries\n\n"
        f"Website: {url}\n"
        f"Page content:\n{page_text}\n\n"
        "Return ONLY a valid JSON array of 15 strings. No explanation, no markdown."
    )

    resp = req.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 700,
            "temperature": 0.7,
        },
        timeout=20,
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"].strip()
    match = re.search(r'\[.*\]', content, re.DOTALL)
    return json.loads(match.group(0) if match else content)


def _suggest_demo(url: str, page_text: str) -> list:
    """Generate smart keyword suggestions from domain name + niche detection."""
    from urllib.parse import urlparse

    parsed = urlparse(url if url.startswith("http") else "https://" + url)
    raw_domain = parsed.netloc.replace("www.", "") or url.split("/")[0]
    brand = raw_domain.split(".")[0].replace("-", " ").replace("_", " ").title()

    text_lower = (page_text + " " + url).lower()

    if any(w in text_lower for w in ["seo", "ranking", "backlink", "keyword research", "search engine optimization"]):
        niche = "seo"
    elif any(w in text_lower for w in ["marketing", "campaign", "lead generation", "email marketing", "conversion"]):
        niche = "marketing"
    elif any(w in text_lower for w in ["saas", "software", "platform", "api", "developer"]):
        niche = "software"
    elif any(w in text_lower for w in ["ecommerce", "shopify", "online store", "woocommerce", "shop"]):
        niche = "ecommerce"
    elif any(w in text_lower for w in ["finance", "investing", "crypto", "banking", "fintech", "loan"]):
        niche = "finance"
    elif any(w in text_lower for w in ["health", "fitness", "medical", "nutrition", "wellness"]):
        niche = "health"
    elif any(w in text_lower for w in ["agency", "freelance", "design studio", "branding", "creative"]):
        niche = "agency"
    elif any(w in text_lower for w in ["ai tool", "machine learning", "llm", "chatbot", "generative ai"]):
        niche = "ai"
    else:
        niche = "general"

    base = [
        f"what is {brand}?",
        f"how does {brand} work?",
        f"is {brand} worth it?",
        f"best alternatives to {brand}",
        f"{brand} review 2025",
        f"how to get started with {brand}",
        f"what makes {brand} different from competitors?",
        f"{brand} pricing compared",
        f"who uses {brand}?",
        f"how to use {brand} effectively",
    ]

    extras = {
        "seo": [
            "what is the best SEO tool for agencies in 2025?",
            "how to track keyword rankings automatically?",
            "what is AEO and how to optimize for AI search?",
            "best tools to monitor Google AI Overview citations",
            "how to improve website authority and get cited in AI answers",
        ],
        "marketing": [
            "what is the best marketing automation platform?",
            "how to increase leads with AI tools in 2025?",
            "best CRM software for growing businesses",
            "how to automate email marketing campaigns?",
            "best multi-channel marketing tools 2025",
        ],
        "software": [
            "best SaaS tools for small businesses in 2025",
            "how to integrate third-party software with existing stack?",
            "what is the best no-code development platform?",
            "how to choose the right project management software?",
            "best API-first platforms for developers 2025",
        ],
        "ecommerce": [
            "best ecommerce platform for small businesses 2025",
            "how to increase online store conversion rates?",
            "what is the best Shopify alternative?",
            "how to reduce cart abandonment in ecommerce?",
            "best tools for ecommerce SEO and AI visibility",
        ],
        "finance": [
            "best personal finance apps 2025",
            "how to manage business finances with software?",
            "what is the best invoicing tool for freelancers?",
            "how to automate financial reporting?",
            "best fintech tools for startups",
        ],
        "health": [
            "best health tracking apps in 2025",
            "how to improve wellness with technology?",
            "what is the best fitness tracking platform?",
            "how to personalize health recommendations with AI?",
            "best apps for mental health and wellness",
        ],
        "agency": [
            "best project management tools for agencies 2025",
            "how to scale a digital agency efficiently?",
            "what is the best white-label software for agencies?",
            "how to manage multiple clients and projects?",
            "best CRM for digital marketing agencies",
        ],
        "ai": [
            "best AI tools for businesses in 2025",
            "how to implement AI in your existing workflow?",
            "what is the difference between different AI models?",
            "how to build a chatbot for customer service?",
            "best AI platforms for non-technical users",
        ],
        "general": [
            f"what are the top solutions like {brand} in 2025?",
            f"how to choose the best platform for your needs?",
            f"is {brand} right for small businesses?",
            f"best tools compared: {brand} and alternatives",
            f"how to get the most out of {brand}?",
        ],
    }.get(niche, [])

    return (base + extras)[:15]


# ─── KYOBR — Know Your Own Brand Reviews ──────────────────────────────────────

# Platform → source_type classification
_PLATFORM_TYPE = {
    "Perplexity AI":       "ai_engine",
    "Google AI Overview":  "ai_engine",
    "ChatGPT Search":      "ai_engine",
    "ChatGPT":             "ai_engine",
    "Google Gemini":       "ai_engine",
    "DeepSeek":            "ai_engine",
    "Reddit":              "forum",
    "Quora":               "forum",
    "MouthShut":           "forum",
    "Consumer Complaints": "forum",
    "Trustpilot":          "review_platform",
    "Google Reviews":      "review_platform",
    "App Store":           "review_platform",
    "Play Store":          "review_platform",
    "Amazon Reviews":      "review_platform",
    "Practo":              "review_platform",
    "JustDial":            "review_platform",
    "Zomato":              "review_platform",
    "Swiggy":              "review_platform",
    "TripAdvisor":         "review_platform",
    "G2":                  "review_platform",
    "Capterra":            "review_platform",
    "Twitter/X":           "social",
    "Facebook":            "social",
    "LinkedIn":            "social",
    "Instagram":           "social",
}

_TIMEFRAME_LABEL = {"24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days"}


def _detect_business_type(brand: str, hint: str = None) -> str:
    """Infer the industry from a brand name or an explicit caller-supplied hint."""
    valid = {"healthcare", "education", "media", "restaurant", "finance", "saas", "ecommerce"}
    if hint and hint in valid:
        return hint
    b = brand.lower()
    if any(k in b for k in ["hospital", "clinic", "health", "medical", "pharma", "doctor", "care", "dental", "eye", "wellness", "apollo", "fortis", "aiims", "max"]):
        return "healthcare"
    if any(k in b for k in ["college", "university", "school", "academy", "institute", "edu", "learning", "coaching", "campus", "iit", "iim", "nit"]):
        return "education"
    if any(k in b for k in ["blog", "news", "media", "magazine", "times", "post", "journal", "press", "daily", "wire", "herald", "digest", "tribune"]):
        return "media"
    if any(k in b for k in ["restaurant", "cafe", "food", "kitchen", "bistro", "grill", "pizza", "burger", "diner", "eats", "bites", "zomato", "swiggy"]):
        return "restaurant"
    if any(k in b for k in ["bank", "finance", "fintech", "insurance", "loan", "credit", "invest", "capital", "wealth", "pay", "wallet", "paytm", "razorpay"]):
        return "finance"
    if any(k in b for k in ["tech", "software", "app", "platform", "cloud", "digital", "systems", "solutions", "labs", "studio", "dev", "saas", "ai"]):
        return "saas"
    return "ecommerce"


# Industry-specific complaint templates — keyed by business type
# Each entry: { "platforms_by_cat": {...}, "templates": { cat_key: (cat_label, [(text, severity), ...]) } }
# Use {B} as a placeholder for brand.title() — filled at call time.
_INDUSTRY_TEMPLATES = {
    "ecommerce": {
        "platforms_by_cat": {
            "customer_service": ["Reddit", "Twitter/X", "Trustpilot", "Google Reviews"],
            "product_quality":  ["Amazon Reviews", "Trustpilot", "Reddit", "Google Reviews"],
            "pricing":          ["Trustpilot", "Reddit", "Quora", "Facebook"],
            "delivery":         ["Twitter/X", "Reddit", "Trustpilot", "Consumer Complaints"],
            "refunds":          ["Trustpilot", "Consumer Complaints", "Reddit", "MouthShut"],
            "tech":             ["App Store", "Play Store", "Reddit", "Twitter/X"],
        },
        "templates": {
            "customer_service": ("Customer Service", [
                ("{B}'s customer support is extremely slow — users report waiting 3–7 business days with many queries going unanswered entirely.", "high"),
                ("Support agents at {B} give inconsistent answers — the same question gets different responses depending on who you speak to.", "medium"),
                ("{B}'s live chat frequently disconnects mid-conversation, forcing customers to repeat their issue from scratch.", "medium"),
            ]),
            "product_quality": ("Product Quality", [
                ("Items from {B} don't match photos or descriptions — buyers frequently report products arriving in noticeably worse condition.", "high"),
                ("Counterfeit or substandard products are a recurring complaint about {B} despite their stated verification process.", "high"),
                ("Quality from {B} is inconsistent — some customers are satisfied while others receive defective or incorrect items.", "medium"),
            ]),
            "pricing": ("Pricing & Fees", [
                ("{B} is criticised for hidden fees revealed only at checkout — processing and convenience charges not shown upfront.", "high"),
                ("Prices on {B} are inflated 15–25% above market value, especially for resale goods where comparisons are easy.", "medium"),
                ("Surprise post-purchase charges are common on {B} — customers report being billed extra days after a transaction.", "high"),
            ]),
            "delivery": ("Delivery & Logistics", [
                ("Delivery delays of 2–3× the promised timeline are the top complaint about {B} across Reddit, Trustpilot, and consumer forums.", "high"),
                ("Packages from {B} arrive damaged — and the company refuses to take responsibility — a frequently cited issue in reviews.", "medium"),
                ("Tracking information for {B} shipments is often inaccurate or not updated for 48–72 hours, leaving customers in the dark.", "medium"),
            ]),
            "refunds": ("Returns & Refunds", [
                ("Getting a refund from {B} is described as 'nearly impossible' by verified reviewers — many wait 30+ days for money back.", "high"),
                ("{B}'s return policy is too restrictive — legitimate requests are frequently rejected with vague, unhelpful reasons.", "high"),
                ("{B}'s refund process requires excessive documentation; customers report needing 5+ support contacts for a single refund.", "medium"),
            ]),
            "tech": ("App & Website", [
                ("{B}'s mobile app crashes during checkout — users lose orders and must restart, a top complaint in App Store reviews.", "high"),
                ("Random account suspensions on {B} with no explanation and difficulty reaching support are frequently reported.", "medium"),
                ("{B}'s website slows significantly during high-traffic periods — session errors reported during sales and peak hours.", "medium"),
            ]),
        },
    },
    "healthcare": {
        "platforms_by_cat": {
            "patient_care":        ["Google Reviews", "Practo", "JustDial", "Facebook"],
            "appointment_booking": ["Google Reviews", "Practo", "Facebook", "Twitter/X"],
            "billing_insurance":   ["Consumer Complaints", "Google Reviews", "Reddit", "Facebook"],
            "staff_quality":       ["Google Reviews", "Practo", "Facebook", "MouthShut"],
            "waiting_time":        ["Google Reviews", "Facebook", "Twitter/X", "Practo"],
            "hygiene":             ["Google Reviews", "Facebook", "MouthShut", "Consumer Complaints"],
        },
        "templates": {
            "patient_care": ("Patient Care Quality", [
                ("Doctors at {B} spend under 5 minutes per consultation — patients feel rushed, unheard, and inadequately examined.", "high"),
                ("Patients report misdiagnosis or delayed diagnosis at {B}, citing insufficient examination and lack of follow-up care.", "high"),
                ("Post-treatment guidance at {B} is poorly managed — patients struggle to get test results explained or follow-up appointments.", "medium"),
            ]),
            "appointment_booking": ("Appointment Booking", [
                ("Getting an appointment at {B} is 'a nightmare' — patients wait 3–4 weeks even for urgent consultations.", "high"),
                ("{B}'s online booking system crashes and shows wrong availability, forcing patients to call and wait on hold.", "medium"),
                ("Walk-in patients at {B} are turned away despite visible availability, due to rigid appointment-only policies.", "medium"),
            ]),
            "billing_insurance": ("Billing & Insurance", [
                ("Patients receive unexpected bills from {B} months after treatment — charges not pre-approved or covered by insurance.", "high"),
                ("{B}'s billing is criticised for lack of transparency — itemized bills are hard to get and frequently contain errors.", "high"),
                ("Insurance claim processing at {B} takes 60–90 days, far exceeding industry standards and causing financial stress.", "medium"),
            ]),
            "staff_quality": ("Staff & Doctor Quality", [
                ("Nursing staff at {B} are reported as dismissive and slow to respond to patient concerns or call bells.", "medium"),
                ("Doctors at {B} appear overworked and distracted — poor patient-physician communication is a recurring complaint.", "high"),
                ("Administrative staff at {B} are described as rude and unhelpful when patients navigate complex procedures.", "medium"),
            ]),
            "waiting_time": ("Wait Times", [
                ("Emergency patients at {B} wait 4–6 hours before being seen — far exceeding acceptable emergency care response times.", "high"),
                ("Scheduled appointments at {B} run 1–2 hours late with no communication to waiting patients.", "medium"),
                ("Pharmacy wait times at {B} are consistently reported as 45–60 minutes for prescription fulfillment.", "medium"),
            ]),
            "hygiene": ("Hygiene & Cleanliness", [
                ("Patients report {B}'s facilities are unclean — dusty waiting areas, unhygienic restrooms, poorly sanitized equipment.", "high"),
                ("Infection control at {B} is questioned — patients observed staff not following standard hygiene protocols.", "high"),
                ("General upkeep at {B} is described as 'below hospital-grade standard' by multiple recent visitors.", "medium"),
            ]),
        },
    },
    "education": {
        "platforms_by_cat": {
            "course_quality":         ["Google Reviews", "Quora", "Reddit", "Facebook"],
            "faculty_responsiveness": ["Google Reviews", "Quora", "Reddit", "Facebook"],
            "admission_process":      ["Google Reviews", "Facebook", "Quora", "Reddit"],
            "campus_facilities":      ["Google Reviews", "Facebook", "MouthShut", "Reddit"],
            "placement_support":      ["Quora", "Reddit", "LinkedIn", "Google Reviews"],
            "fee_transparency":       ["Consumer Complaints", "Google Reviews", "Reddit", "Facebook"],
        },
        "templates": {
            "course_quality": ("Course & Curriculum Quality", [
                ("Course content at {B} is outdated — syllabi haven't been updated in 3–5 years, especially in tech and business programs.", "high"),
                ("Practical training at {B} is severely lacking — students report 80% theory and only 20% hands-on learning.", "high"),
                ("Graduates of {B} say skills taught don't match industry requirements, making job hunting difficult post-completion.", "medium"),
            ]),
            "faculty_responsiveness": ("Faculty & Teaching Quality", [
                ("Faculty at {B} are frequently unavailable outside class — students struggle to get academic guidance or mentoring.", "high"),
                ("Several professors at {B} are described as unengaged, reading directly from slides with poor knowledge transfer.", "medium"),
                ("Part-time faculty outnumber permanent staff at {B}, leading to inconsistent teaching quality and high turnover.", "medium"),
            ]),
            "admission_process": ("Admission Process", [
                ("The admission process at {B} is opaque — selection criteria are unclear and rejected applicants receive no feedback.", "medium"),
                ("{B} made verbal admission promises not honored in the formal offer letter, causing significant distress.", "high"),
                ("Documentation requirements for {B} admission are excessive and poorly communicated, causing repeated delays.", "medium"),
            ]),
            "campus_facilities": ("Campus Facilities", [
                ("{B}'s library has outdated books, limited journal access, and insufficient seating during exam periods.", "medium"),
                ("Hostel facilities at {B} are poorly rated — overcrowding, inadequate maintenance, slow complaint resolution.", "high"),
                ("Sports and recreational facilities at {B} are in disrepair with limited booking availability for students.", "medium"),
            ]),
            "placement_support": ("Placement & Career Support", [
                ("Placement statistics at {B} are disputed by alumni — claimed 90%+ rates are far from actual figures.", "high"),
                ("Career services at {B} are passive — a basic job portal with no active recruiter relationships or alumni network.", "high"),
                ("Companies visiting {B} for campus recruitment are limited and offer packages well below industry benchmarks.", "medium"),
            ]),
            "fee_transparency": ("Fee Structure & Transparency", [
                ("{B} adds fees after admission — development, exam, and activity charges not mentioned in the original offer letter.", "high"),
                ("Scholarship information at {B} is poorly communicated — many eligible students miss out due to lack of awareness.", "medium"),
                ("{B}'s refund policy for early withdrawal is unfair — students receive little to no refund regardless of timing.", "high"),
            ]),
        },
    },
    "media": {
        "platforms_by_cat": {
            "content_quality":     ["Reddit", "Twitter/X", "Facebook", "Quora"],
            "subscription_issues": ["Consumer Complaints", "Reddit", "Twitter/X", "App Store"],
            "website_performance": ["App Store", "Play Store", "Reddit", "Twitter/X"],
            "ad_experience":       ["Reddit", "Twitter/X", "Facebook", "Quora"],
            "comment_moderation":  ["Reddit", "Twitter/X", "Facebook", "Quora"],
        },
        "templates": {
            "content_quality": ("Content Quality & Accuracy", [
                ("{B} is criticised for factual errors — several high-profile mistakes published without corrections or retractions.", "high"),
                ("Content on {B} is clickbait-driven, prioritizing page views over accurate or substantive reporting.", "high"),
                ("Editorial standards at {B} have declined — errors in grammar, fact-checking, and source attribution are increasing.", "medium"),
            ]),
            "subscription_issues": ("Subscription & Paywall Issues", [
                ("Canceling a {B} subscription is deliberately difficult — the process is buried and customer service is unresponsive.", "high"),
                ("{B}'s paywall is aggressive — free limits reset inconsistently and billing continues after cancellation requests.", "high"),
                ("Subscribers report {B} raises prices without notice, and billing disputes are hard to resolve.", "medium"),
            ]),
            "website_performance": ("Website & App Performance", [
                ("{B}'s website is dominated by ads — autoplay videos and pop-ups make reading nearly impossible.", "high"),
                ("Page loading on {B} is significantly slower than competitors, especially on mobile — readers abandon articles.", "medium"),
                ("{B}'s app has poor ratings for crashes, login issues, and offline content not loading as advertised.", "medium"),
            ]),
            "ad_experience": ("Ad Experience", [
                ("The volume of ads on {B} is described as 'unreadable' — full-page interstitials and mid-article ads dominate.", "high"),
                ("Even paid subscribers to {B} see ads, contradicting the ad-free promise made at sign-up.", "high"),
                ("Ad targeting on {B} is intrusive — users report privacy concerns about undisclosed tracking practices.", "medium"),
            ]),
            "comment_moderation": ("Comment Moderation & Community", [
                ("Comment sections on {B} are toxic and poorly moderated — harassment goes unchecked for days.", "medium"),
                ("{B} deletes legitimate comments while leaving inflammatory ones — users allege bias in moderation.", "high"),
                ("Community engagement on {B} is declining — readers suspect shadowbanning of popular contributors.", "medium"),
            ]),
        },
    },
    "restaurant": {
        "platforms_by_cat": {
            "food_quality":        ["Zomato", "Google Reviews", "TripAdvisor", "Facebook"],
            "hygiene_cleanliness": ["Google Reviews", "Facebook", "MouthShut", "Consumer Complaints"],
            "service_speed":       ["Google Reviews", "Zomato", "Facebook", "Twitter/X"],
            "delivery_experience": ["Zomato", "Swiggy", "Google Reviews", "Twitter/X"],
            "pricing_value":       ["Google Reviews", "Zomato", "Facebook", "Quora"],
        },
        "templates": {
            "food_quality": ("Food Quality", [
                ("Food from {B} doesn't match menu descriptions — customers report undersized portions, wrong ingredients, poor presentation.", "high"),
                ("Food safety concerns at {B} are serious — customers report foreign objects found in food and food-borne illness.", "high"),
                ("Quality at {B} is wildly inconsistent — excellent on some visits and unacceptable on others, with no apparent quality control.", "medium"),
            ]),
            "hygiene_cleanliness": ("Hygiene & Cleanliness", [
                ("{B}'s kitchen and dining area hygiene is questioned — pest activity, unclean tables, and poor food handling reported.", "high"),
                ("Health inspection concerns at {B} include food storage temperature violations and cross-contamination risks.", "high"),
                ("Restroom hygiene at {B} is frequently cited as unacceptable — a recurring complaint in Google and Zomato reviews.", "medium"),
            ]),
            "service_speed": ("Service Speed & Staff", [
                ("Wait times at {B} are excessive — customers report 45–60 minutes for food even during off-peak hours.", "high"),
                ("Staff at {B} are inattentive and poorly trained — wrong orders, missed requests, and rude responses are common.", "medium"),
                ("Order accuracy at {B} is low — missing items and incorrect orders are repeatedly reported for dine-in and delivery.", "medium"),
            ]),
            "delivery_experience": ("Delivery Experience", [
                ("Delivery orders from {B} arrive cold or in damaged packaging — temperature maintenance is a major complaint.", "high"),
                ("Delivery times from {B} are consistently 2–3× the estimate with no updates or communication.", "medium"),
                ("Online orders to {B} are frequently lost — customers are charged with no delivery and face poor support.", "high"),
            ]),
            "pricing_value": ("Pricing & Value", [
                ("Prices at {B} have risen significantly without improvement in quality or portions — value for money is poor.", "medium"),
                ("{B} adds hidden charges — packaging fees and service charges not shown upfront add 20–30% to the bill.", "high"),
                ("Value at {B} is poor compared to similar establishments — smaller portions at higher prices are a common complaint.", "medium"),
            ]),
        },
    },
    "finance": {
        "platforms_by_cat": {
            "transaction_failures": ["Consumer Complaints", "Twitter/X", "App Store", "Google Reviews"],
            "customer_support":     ["Consumer Complaints", "Twitter/X", "Google Reviews", "Reddit"],
            "hidden_charges":       ["Consumer Complaints", "Reddit", "Quora", "Google Reviews"],
            "account_issues":       ["Consumer Complaints", "Twitter/X", "Reddit", "Google Reviews"],
            "loan_process":         ["Consumer Complaints", "Reddit", "Google Reviews", "Quora"],
        },
        "templates": {
            "transaction_failures": ("Transaction & Payment Issues", [
                ("{B} transactions fail with money debited but not credited — resolution takes 5–7 business days with little support.", "high"),
                ("International transfers through {B} are delayed 3–5 days beyond stated timelines, causing financial losses for customers.", "high"),
                ("Duplicate charges are a recurring issue with {B} — multiple debits for a single transaction with slow resolution.", "medium"),
            ]),
            "customer_support": ("Customer Support", [
                ("{B}'s helpline is inaccessible — average hold times of 45–60 minutes are reported for urgent account issues.", "high"),
                ("Fraud complaints at {B} are handled poorly — unauthorized transactions take weeks to reverse.", "high"),
                ("Chat support at {B} is scripted and unhelpful — complex issues require multiple escalations over weeks.", "medium"),
            ]),
            "hidden_charges": ("Hidden Charges & Fees", [
                ("{B} imposes undisclosed fees — account maintenance, transaction, and penalty charges customers were never warned about.", "high"),
                ("Interest rates on {B} products are misleading — advertised rates differ significantly from effective annual rates.", "high"),
                ("Early repayment penalties on {B} loans are excessive and not prominently disclosed during the application process.", "medium"),
            ]),
            "account_issues": ("Account Management", [
                ("{B} freezes accounts without prior notice — customers lose fund access for days with minimal communication.", "high"),
                ("KYC updates at {B} are bureaucratic — multiple branch visits required for simple document changes.", "medium"),
                ("Account closure at {B} is deliberately difficult — formal requests are ignored or dragged out indefinitely.", "medium"),
            ]),
            "loan_process": ("Loan & Credit Process", [
                ("{B} rejects loan applications without any explanation — applicants have no clarity or recourse after rejection.", "medium"),
                ("{B}'s loan disbursal takes 15–20 days despite advertising 'instant' or 'same-day' approvals.", "high"),
                ("Loan restructuring at {B} during financial hardship is nearly impossible — support is minimal and processes are rigid.", "high"),
            ]),
        },
    },
    "saas": {
        "platforms_by_cat": {
            "product_bugs":          ["Reddit", "Twitter/X", "App Store", "G2"],
            "customer_support":      ["Reddit", "G2", "Capterra", "Twitter/X"],
            "pricing_model":         ["Reddit", "G2", "Capterra", "Quora"],
            "onboarding_complexity": ["Reddit", "G2", "App Store", "Quora"],
            "downtime_reliability":  ["Twitter/X", "Reddit", "G2", "Consumer Complaints"],
        },
        "templates": {
            "product_bugs": ("Product Reliability & Bugs", [
                ("{B} has critical bugs affecting core workflows — data loss incidents and broken features in recent releases.", "high"),
                ("{B} experiences unexpected downtime 3–4 times monthly, directly impacting operations for paying customers.", "high"),
                ("Bug fixes at {B} are extremely slow — issues filed 6–12 months ago remain open with little communication.", "medium"),
            ]),
            "customer_support": ("Customer Support Quality", [
                ("{B}'s support response times are unacceptable — enterprise customers wait 5–7 days on critical issues.", "high"),
                ("Support at {B} lacks technical depth — agents can't resolve issues and escalations rarely reach engineers.", "medium"),
                ("Documentation at {B} is incomplete and outdated — users waste hours on issues that should be in the knowledge base.", "medium"),
            ]),
            "pricing_model": ("Pricing & Value", [
                ("{B}'s pricing increased 40–60% over two years with no significant new features — a top grievance for long-term customers.", "high"),
                ("Seat-based pricing at {B} is punitive for growing teams — costs scale far faster than the value delivered.", "high"),
                ("Feature gating at {B} is excessive — essential capabilities are locked behind premium tiers, making the base plan unusable.", "medium"),
            ]),
            "onboarding_complexity": ("Onboarding & Usability", [
                ("{B}'s onboarding is overly complex — new users face a steep learning curve with insufficient guided setup.", "medium"),
                ("The UI/UX at {B} grows more complex with each update — simple tasks now require significantly more steps.", "medium"),
                ("Migration to {B} is poorly supported — data import tools are limited and professional migration services are expensive.", "high"),
            ]),
            "downtime_reliability": ("Uptime & Reliability", [
                ("{B} has failed its 99.9% uptime SLA multiple times — breaches are rarely acknowledged or compensated.", "high"),
                ("Scheduled maintenance at {B} consistently overruns — 1-hour windows extend to 4–6 hours, impacting global customers.", "medium"),
                ("API reliability at {B} is a major concern — rate limits and intermittent errors are poorly documented.", "medium"),
            ]),
        },
    },
}

# Industry-specific query hints for live API calls
_INDUSTRY_QUERY_HINTS = {
    "healthcare": "as a hospital, clinic, or healthcare provider",
    "education":  "as a college, university, or educational institution",
    "media":      "as a news website, blog, or media platform",
    "restaurant": "as a restaurant, food delivery, or dining service",
    "finance":    "as a bank, fintech, or financial services provider",
    "saas":       "as a software platform or SaaS product",
    "ecommerce":  "as an online store or e-commerce platform",
}

# Industry-specific regex patterns for categorizing live API responses
_INDUSTRY_CAT_PATTERNS = {
    "ecommerce": {
        r"service|support|staff|agent|response|customer care": ("customer_service", "Customer Service"),
        r"quality|defect|fake|counterfeit|damage|broken|condition": ("product_quality", "Product Quality"),
        r"price|fee|charge|hidden|expensive|cost|billing": ("pricing", "Pricing & Fees"),
        r"deliver|ship|delay|late|courier|logistics": ("delivery", "Delivery & Logistics"),
        r"refund|return|cancel|money back": ("refunds", "Returns & Refunds"),
        r"app|website|crash|login|technical|slow|error|bug": ("tech", "App & Website"),
    },
    "healthcare": {
        r"patient|care|doctor|treatment|diagnosis|consultation|medication": ("patient_care", "Patient Care Quality"),
        r"appointment|book|schedule|availability|slot": ("appointment_booking", "Appointment Booking"),
        r"bill|charge|insurance|fee|cost|payment|claim": ("billing_insurance", "Billing & Insurance"),
        r"staff|nurse|physician|rude|attitude|behavior|communication": ("staff_quality", "Staff & Doctor Quality"),
        r"wait|waiting|time|delay|queue|hours": ("waiting_time", "Wait Times"),
        r"hygiene|clean|sanitize|infection|dirty|pest": ("hygiene", "Hygiene & Cleanliness"),
    },
    "education": {
        r"course|curriculum|syllabus|teach|lecture|class|content": ("course_quality", "Course & Curriculum Quality"),
        r"faculty|professor|teacher|mentor|response|available|office": ("faculty_responsiveness", "Faculty & Teaching Quality"),
        r"admission|apply|application|process|criteria|selection": ("admission_process", "Admission Process"),
        r"campus|hostel|facility|lab|library|infrastructure|canteen": ("campus_facilities", "Campus Facilities"),
        r"placement|job|career|recruit|intern|employ|package": ("placement_support", "Placement & Career Support"),
        r"fee|cost|charge|money|refund|scholarship|financial": ("fee_transparency", "Fee Structure & Transparency"),
    },
    "media": {
        r"content|article|accuracy|fact|error|mislead|wrong": ("content_quality", "Content Quality & Accuracy"),
        r"subscription|paywall|cancel|billing|charge|renew": ("subscription_issues", "Subscription & Paywall Issues"),
        r"website|app|load|crash|speed|performance|mobile": ("website_performance", "Website & App Performance"),
        r"ad|advertisement|popup|intrusive|banner|autoplay": ("ad_experience", "Ad Experience"),
        r"comment|moderat|community|censor|ban|delete": ("comment_moderation", "Comment Moderation & Community"),
    },
    "restaurant": {
        r"food|taste|quality|portion|ingredient|menu|dish": ("food_quality", "Food Quality"),
        r"hygiene|clean|sanitize|pest|dirty|health inspection": ("hygiene_cleanliness", "Hygiene & Cleanliness"),
        r"service|staff|waiter|rude|slow|wait|order": ("service_speed", "Service Speed & Staff"),
        r"deliver|delivery|cold|packaging|late|wrong order": ("delivery_experience", "Delivery Experience"),
        r"price|cost|expensive|value|charge|hidden|overpriced": ("pricing_value", "Pricing & Value"),
    },
    "finance": {
        r"transaction|payment|transfer|failed|debit|credit|bounce": ("transaction_failures", "Transaction & Payment Issues"),
        r"support|helpline|response|service|agent|hold": ("customer_support", "Customer Support"),
        r"fee|charge|hidden|interest|penalty|rate|undisclosed": ("hidden_charges", "Hidden Charges & Fees"),
        r"account|freeze|suspend|access|kyc|close|block": ("account_issues", "Account Management"),
        r"loan|credit|disbursal|reject|emi|interest|mortgage": ("loan_process", "Loan & Credit Process"),
    },
    "saas": {
        r"bug|crash|error|broken|feature|issue|glitch|data loss": ("product_bugs", "Product Reliability & Bugs"),
        r"support|ticket|response|agent|helpdesk|escalat": ("customer_support", "Customer Support Quality"),
        r"price|cost|tier|plan|expensive|billing|seat|license": ("pricing_model", "Pricing & Value"),
        r"onboard|setup|complex|difficult|ui|ux|learn|migrate": ("onboarding_complexity", "Onboarding & Usability"),
        r"downtime|outage|uptime|slow|latency|reliability|sla": ("downtime_reliability", "Uptime & Reliability"),
    },
}


@app.post("/api/kyobr")
async def kyobr_search(body: KYOBRRequest):
    brand = body.brand.strip()
    if not brand:
        raise HTTPException(status_code=400, detail="Brand name required")

    timeframe    = body.timeframe if body.timeframe in ("24h", "7d", "30d") else "7d"
    competitors  = [c.strip() for c in body.competitors if c.strip()][:4]
    biz_type     = body.business_type  # may be None — detection runs inside helpers

    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    has_any_live   = bool(perplexity_key or os.getenv("OPENAI_API_KEY") or
                          os.getenv("GEMINI_API_KEY") or os.getenv("DEEPSEEK_API_KEY"))

    async def _scan_one(b: str) -> dict:
        if has_any_live:
            try:
                return await _kyobr_real(b, timeframe, biz_type)
            except Exception as e:
                print(f"[KYOBR] Real API error for '{b}': {e}")
        return _kyobr_demo(b, timeframe, biz_type)

    primary = await _scan_one(brand)

    competitor_data = {}
    for comp in competitors:
        competitor_data[comp] = await _scan_one(comp)

    result = {**primary, "competitor_data": competitor_data}

    import uuid
    scan_id = str(uuid.uuid4())[:8].upper()
    save_kyobr_scan(scan_id, brand, timeframe, result)
    result["scan_id"] = scan_id

    return result


@app.get("/api/kyobr/history/{brand:path}")
async def kyobr_history(brand: str, limit: int = 20):
    return get_kyobr_history(brand, limit)


@app.get("/api/kyobr/scan/{scan_id}")
async def kyobr_get_scan(scan_id: str):
    data = get_kyobr_scan(scan_id)
    if not data:
        raise HTTPException(status_code=404, detail="Scan not found")
    return data


async def _kyobr_real(brand: str, timeframe: str = "7d", business_type_hint: str = None) -> dict:
    """Query available AI engines for real negative brand feedback."""
    import requests as req, re

    industry   = _detect_business_type(brand, business_type_hint)
    hint_phrase = _INDUSTRY_QUERY_HINTS.get(industry, "")
    tf_phrase   = {"24h": "in the last 24 hours", "7d": "in the last 7 days", "30d": "in the last 30 days"}.get(timeframe, "recently")
    cat_map     = _INDUSTRY_CAT_PATTERNS.get(industry, _INDUSTRY_CAT_PATTERNS["ecommerce"])
    ind_data    = _INDUSTRY_TEMPLATES.get(industry, _INDUSTRY_TEMPLATES["ecommerce"])

    raw: list[tuple[str, str]] = []   # (text, engine_name)
    engines_queried: list[str] = []

    # ── 1. Perplexity ──────────────────────────────────────────────────────────
    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    if perplexity_key:
        for q in [
            f"What are the most common complaints and negative reviews about {brand} {hint_phrase} from real customers {tf_phrase}?",
            f"What problems and criticisms do users most frequently report about {brand} {hint_phrase} {tf_phrase}?",
        ]:
            try:
                resp = await __import__("asyncio").get_event_loop().run_in_executor(
                    None, lambda _q=q: req.post(
                        "https://api.perplexity.ai/chat/completions",
                        headers={"Authorization": f"Bearer {perplexity_key}", "Content-Type": "application/json"},
                        json={"model": "sonar", "messages": [
                            {"role": "system", "content": "List only specific, factual negative complaints from real user reviews. Be concise and structured."},
                            {"role": "user", "content": _q},
                        ], "max_tokens": 600},
                        timeout=20,
                    ))
                if resp.ok:
                    raw.append((resp.json()["choices"][0]["message"]["content"], "Perplexity AI"))
            except Exception as e:
                print(f"[KYOBR] Perplexity error: {e}")
        if any(src == "Perplexity AI" for _, src in raw):
            engines_queried.append("Perplexity AI")

    # ── 2. ChatGPT (OpenAI) ────────────────────────────────────────────────────
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            q = (f"List the most common complaints and negative reviews about {brand} {hint_phrase} "
                 f"from real customers {tf_phrase}. Be specific and factual.")
            resp = await __import__("asyncio").get_event_loop().run_in_executor(
                None, lambda: req.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
                    json={"model": "gpt-4o-mini", "messages": [
                        {"role": "system", "content": "List specific, factual negative complaints from real user reviews. Be concise."},
                        {"role": "user", "content": q},
                    ], "max_tokens": 600, "temperature": 0.3},
                    timeout=20,
                ))
            if resp.ok:
                raw.append((resp.json()["choices"][0]["message"]["content"], "ChatGPT"))
                engines_queried.append("ChatGPT")
        except Exception as e:
            print(f"[KYOBR] ChatGPT error: {e}")

    # ── 3. Google Gemini ───────────────────────────────────────────────────────
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            q = (f"What are the most common complaints and negative reviews about {brand} {hint_phrase} "
                 f"from real customers {tf_phrase}?")
            resp = await __import__("asyncio").get_event_loop().run_in_executor(
                None, lambda: req.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}",
                    headers={"Content-Type": "application/json"},
                    json={"contents": [{"parts": [{"text": q}]}],
                          "generationConfig": {"maxOutputTokens": 600}},
                    timeout=20,
                ))
            if resp.ok:
                parts = resp.json().get("candidates", [{}])[0].get("content", {}).get("parts", [])
                text  = " ".join(p.get("text", "") for p in parts).strip()
                if text:
                    raw.append((text, "Google Gemini"))
                    engines_queried.append("Google Gemini")
        except Exception as e:
            print(f"[KYOBR] Gemini error: {e}")

    # ── 4. DeepSeek ───────────────────────────────────────────────────────────
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    if deepseek_key:
        try:
            q = (f"What are the most common complaints and negative reviews about {brand} {hint_phrase} "
                 f"from real customers {tf_phrase}?")
            resp = await __import__("asyncio").get_event_loop().run_in_executor(
                None, lambda: req.post(
                    "https://api.deepseek.com/chat/completions",
                    headers={"Authorization": f"Bearer {deepseek_key}", "Content-Type": "application/json"},
                    json={"model": "deepseek-chat", "messages": [
                        {"role": "system", "content": "List specific, factual negative complaints from real user reviews. Be concise."},
                        {"role": "user", "content": q},
                    ], "max_tokens": 600, "temperature": 0.3},
                    timeout=20,
                ))
            if resp.ok:
                raw.append((resp.json()["choices"][0]["message"]["content"], "DeepSeek"))
                engines_queried.append("DeepSeek")
        except Exception as e:
            print(f"[KYOBR] DeepSeek error: {e}")

    # ── Parse all responses ────────────────────────────────────────────────────
    reviews: list[dict] = []
    for text, engine_name in raw:
        lines = [l.strip() for l in re.split(r'\n+|•|\d+\.', text) if len(l.strip()) > 40]
        for line in lines[:4]:
            cat_key, cat_name = "general", "General"
            for pattern, (k, n) in cat_map.items():
                if re.search(pattern, line.lower()):
                    cat_key, cat_name = k, n
                    break
            severity  = "high" if any(w in line.lower() for w in ["serious", "worst", "terrible", "fraud", "scam", "never", "always", "dangerous", "fail"]) else "medium"
            platforms = ind_data["platforms_by_cat"].get(cat_key, ["Google Reviews", "Reddit"])
            platform  = platforms[len(reviews) % len(platforms)]
            reviews.append({
                "category":     cat_name,
                "category_key": cat_key,
                "text":         line,
                "severity":     severity,
                "platform":     platform,
                "source_type":  _PLATFORM_TYPE.get(platform, "forum"),
                "mentions":     None,
                "found_by":     engine_name,
            })

    if not reviews:
        return _kyobr_demo(brand, timeframe, business_type_hint)

    return _build_kyobr_response(brand, reviews, timeframe, "live", industry, engines_queried)


def _kyobr_demo(brand: str, timeframe: str = "7d", business_type_hint: str = None) -> dict:
    """Generate industry-specific demo feedback — different templates for hospital vs college vs blog etc."""
    import random, hashlib

    industry  = _detect_business_type(brand, business_type_hint)
    ind_data  = _INDUSTRY_TEMPLATES.get(industry, _INDUSTRY_TEMPLATES["ecommerce"])
    seed      = int(hashlib.md5((brand.lower() + timeframe).encode()).hexdigest()[:8], 16)
    rng       = random.Random(seed)
    B         = brand.title()

    # Fill brand name into template strings
    filled: dict[str, tuple[str, list]] = {}
    for cat_key, (cat_name, items) in ind_data["templates"].items():
        filled[cat_key] = (cat_name, [(txt.replace("{B}", B), sev) for txt, sev in items])

    # AI engines to show as the source — cycle through them so every issue
    # clearly shows an AI engine that surfaced the complaint
    _AI_ENGINES = ["Perplexity AI", "ChatGPT", "Google Gemini", "DeepSeek", "Google AI Overview"]

    keys = list(filled.keys())
    rng.shuffle(keys)
    reviews = []
    for i, cat_key in enumerate(keys[:5 + rng.randint(0, 1)]):
        cat_name, items = filled[cat_key]
        text, severity  = rng.choice(items)
        # First 5 issues: one AI engine each (cycling) — shows real engine coverage
        # Any extra issue: fall back to an industry-specific platform
        if i < len(_AI_ENGINES):
            platform = _AI_ENGINES[i]
        else:
            fallback_platforms = ind_data["platforms_by_cat"].get(cat_key, ["Google Reviews", "Reddit"])
            platform = rng.choice(fallback_platforms)
        reviews.append({
            "category":     cat_name,
            "category_key": cat_key,
            "text":         text,
            "severity":     severity,
            "platform":     platform,
            "source_type":  _PLATFORM_TYPE.get(platform, "forum"),
            "mentions":     rng.randint(28, 420) if severity == "high" else rng.randint(8, 90),
        })

    reviews.sort(key=lambda r: 0 if r["severity"] == "high" else 1)

    demo_engines = _AI_ENGINES
    return _build_kyobr_response(brand, reviews, timeframe, "demo", industry, demo_engines)


def _build_kyobr_response(brand: str, reviews: list, timeframe: str, source: str,
                           industry: str = "ecommerce", engines_queried: list = None) -> dict:
    """Assemble the final KYOBR response dict with aggregated summary."""
    if engines_queried is None:
        engines_queried = ["Perplexity AI", "ChatGPT", "Google Gemini", "DeepSeek", "Google AI Overview"]
    high  = sum(1 for r in reviews if r["severity"] == "high")
    cats  = list(dict.fromkeys(r["category"] for r in reviews))
    src_counts: dict[str, int] = {}
    for r in reviews:
        src_counts[r["source_type"]] = src_counts.get(r["source_type"], 0) + 1

    return {
        "brand":           brand,
        "timeframe":       timeframe,
        "timeframe_label": _TIMEFRAME_LABEL.get(timeframe, "Last 7 days"),
        "industry_type":   industry,
        "reviews":         reviews,
        "summary": {
            "total_issues":        len(reviews),
            "high_severity":       high,
            "medium_severity":     len(reviews) - high,
            "top_categories":      cats[:3],
            "brand_health":        "poor" if high >= 3 else "concerning" if high >= 2 else "fair",
            "ai_engines_searched": len(engines_queried),
            "engines_queried":     engines_queried,
            "source_breakdown":    src_counts,
        },
        "source": source,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
