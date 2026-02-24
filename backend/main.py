import asyncio
import os
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from models import ScanRequest, ScanResponse, SuggestRequest
from database import init_db, create_scan, update_scan_status, save_citations, get_scan, get_scan_results, get_all_scans
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
