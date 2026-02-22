"""
app.py — Flask web application for the SEO Audit Tool.

Run locally:   python app.py
Deploy:        gunicorn app:app --workers 2 --timeout 120
"""

from __future__ import annotations

import os
import tempfile
import uuid

from flask import Flask, render_template, request, send_file, redirect, url_for

from seo_audit.crawler import fetch_page
from seo_audit.engine import run_audit
from seo_audit.outputs.ai_narratives import generate_all
from seo_audit.outputs.excel_report import save_excel
from seo_audit.outputs.json_report import to_dict
from seo_audit.site_types.profiles import SiteType

import json

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "seo-audit-dev-key-change-in-prod")

# In-memory cache for download links (keyed by job_id)
# For production, replace with Redis or filesystem cache
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


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html", site_types=SITE_TYPE_LABELS)


@app.route("/audit", methods=["POST"])
def audit():
    url = request.form.get("url", "").strip()
    site_type = request.form.get("site_type", "generic")
    no_ai = request.form.get("no_ai") == "1"

    if not url:
        return render_template("index.html", site_types=SITE_TYPE_LABELS,
                               error="Please enter a URL to audit.")

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # Fetch page
    page = fetch_page(url, timeout=20)
    if page.error:
        return render_template("index.html", site_types=SITE_TYPE_LABELS,
                               error=f"Could not reach {url} — {page.error}")

    # Run full 12-category audit
    result = run_audit(page, site_type=site_type)

    # AI narratives (skipped if no key or user opts out)
    if not no_ai:
        generate_all(result, page)

    # Cache for downloads
    job_id = uuid.uuid4().hex[:10]
    _cache[job_id] = result

    return render_template(
        "results.html",
        result=result,
        job_id=job_id,
        site_types=SITE_TYPE_LABELS,
        Severity=__import__("seo_audit.categories.base", fromlist=["Severity"]).Severity,
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


@app.route("/health")
def health():
    return {"status": "ok"}, 200


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
