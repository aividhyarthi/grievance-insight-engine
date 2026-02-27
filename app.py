"""
app.py — Flask web application for the Appstudiox SEO Auditing Tool.

Run locally:   python app.py
Deploy:        gunicorn app:app --workers 2 --timeout 120
"""

from __future__ import annotations

import os
import tempfile
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed

from flask import Flask, render_template, request, send_file, redirect, url_for

from seo_audit.crawler import fetch_page, parse_raw_html
from seo_audit.engine import run_audit
from seo_audit.outputs.ai_narratives import generate_all
from seo_audit.outputs.excel_report import save_excel
from seo_audit.outputs.json_report import to_dict
from seo_audit.site_types.profiles import SiteType

import json

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "seo-audit-dev-key-change-in-prod")

# In-memory cache for download links (keyed by job_id)
_cache: dict[str, object] = {}

SITE_TYPE_LABELS = {
    "generic":      "Generic / Unknown",
    "news":         "News / Media",
    "product":      "Product (B2B/B2C)",
    "ecommerce":    "E-Commerce",
    "saas":         "SaaS Company",
    "news_product": "News + Product (Hybrid)",
    "events":       "Events Website",
}

_Severity = __import__("seo_audit.categories.base", fromlist=["Severity"]).Severity


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _audit_competitor(url: str, site_type: str) -> object | None:
    """Fetch + audit a single competitor URL. Returns None on failure."""
    try:
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        page = fetch_page(url, timeout=15)
        if page.error:
            return None
        return run_audit(page, site_type=site_type)
    except Exception:
        return None


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html", site_types=SITE_TYPE_LABELS)


@app.route("/audit", methods=["POST"])
def audit():
    input_mode = request.form.get("input_mode", "url")
    site_type  = request.form.get("site_type", "generic")
    no_ai      = request.form.get("no_ai") == "1"

    # ── Fetch / parse the main page ──────────────────────────────────────────
    if input_mode == "html":
        html_content = request.form.get("html_content", "").strip()
        raw_url      = request.form.get("html_url", "").strip() or "pasted-html"
        if not html_content:
            return render_template("index.html", site_types=SITE_TYPE_LABELS,
                                   error="Please paste some HTML to audit.")
        if not raw_url.startswith(("http://", "https://", "pasted")):
            raw_url = "https://" + raw_url
        page = parse_raw_html(html_content, raw_url)
    else:
        url = request.form.get("url", "").strip()
        if not url:
            return render_template("index.html", site_types=SITE_TYPE_LABELS,
                                   error="Please enter a URL to audit.")
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        page = fetch_page(url, timeout=20)
        if page.error:
            return render_template("index.html", site_types=SITE_TYPE_LABELS,
                                   error=f"Could not reach {url} — {page.error}")

    # ── Run full 12-category audit on main site ───────────────────────────────
    result = run_audit(page, site_type=site_type)

    # ── Competitor audits (up to 3, run in parallel) ──────────────────────────
    comp_urls = [
        request.form.get("comp1", "").strip(),
        request.form.get("comp2", "").strip(),
        request.form.get("comp3", "").strip(),
    ]
    comp_results = []
    non_empty = [(i, u) for i, u in enumerate(comp_urls) if u]
    if non_empty:
        ordered = [None, None, None]
        with ThreadPoolExecutor(max_workers=3) as ex:
            futures = {ex.submit(_audit_competitor, u, site_type): i for i, u in non_empty}
            for fut in as_completed(futures):
                idx = futures[fut]
                try:
                    ordered[idx] = fut.result()
                except Exception:
                    ordered[idx] = None
        comp_results = ordered  # list of AuditResult | None, aligned with comp_urls[0..2]
    else:
        comp_results = [None, None, None]

    # ── AI narratives (main site only, skipped if no key or opted out) ────────
    if not no_ai:
        generate_all(result, page)

    # ── Cache for downloads ───────────────────────────────────────────────────
    job_id = uuid.uuid4().hex[:10]
    _cache[job_id] = result
    _cache[job_id + "_comps"] = list(zip(comp_urls, comp_results))

    return render_template(
        "results.html",
        result=result,
        job_id=job_id,
        site_types=SITE_TYPE_LABELS,
        Severity=_Severity,
        comp_pairs=list(zip(comp_urls, comp_results)),  # [(url, result|None), ...]
        input_mode=input_mode,
    )


@app.route("/download/excel/<job_id>")
def download_excel(job_id):
    result = _cache.get(job_id)
    if not result:
        return "Report not found or expired.", 404
    tmp = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
    tmp.close()
    try:
        save_excel(result, tmp.name)
    except ImportError:
        return "openpyxl not installed on server.", 500
    return send_file(
        tmp.name,
        as_attachment=True,
        download_name="seo_audit.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@app.route("/download/json/<job_id>")
def download_json(job_id):
    result = _cache.get(job_id)
    if not result:
        return "Report not found or expired.", 404
    data = json.dumps(to_dict(result), indent=2, ensure_ascii=False)
    tmp = tempfile.NamedTemporaryFile(suffix=".json", delete=False, mode="w", encoding="utf-8")
    tmp.write(data)
    tmp.close()
    return send_file(tmp.name, as_attachment=True, download_name="seo_audit.json",
                     mimetype="application/json")


@app.route("/report/<job_id>")
def proposal_report(job_id):
    result = _cache.get(job_id)
    if not result:
        return "Report not found or expired. Please run a new audit.", 404
    comp_pairs = _cache.get(job_id + "_comps", [])
    return render_template(
        "proposal_report.html",
        result=result,
        job_id=job_id,
        Severity=_Severity,
        comp_pairs=comp_pairs,
    )


@app.route("/health")
def health():
    return {"status": "ok"}, 200


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
