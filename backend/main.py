import asyncio
import os
import uuid
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from models import ScanRequest, ScanResponse
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
