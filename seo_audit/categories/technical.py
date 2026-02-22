"""
technical.py — Technical SEO checks.
Covers: HTTPS, HTTP status, structured data/schema, hreflang hints,
        viewport meta, sitemap link, robots.txt hint, response headers,
        redirect chain signals, charset, doctype.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Technical SEO",
        description="Crawlability, indexability, and server-level signals.",
    )
    f = report.findings

    # ── HTTP Status ───────────────────────────────────────────────────────────
    if page.error:
        f.append(Finding("Technical", "Reachability", Severity.CRITICAL,
            f"Page unreachable: {page.error}",
            "Ensure the URL is publicly accessible.",
            impact="High", effort="Quick Win"))
        return report  # nothing else useful

    code = page.status_code
    if 200 <= code < 300:
        f.append(Finding("Technical", "HTTP status", Severity.PASS,
            f"HTTP {code} — page is reachable."))
    elif 300 <= code < 400:
        f.append(Finding("Technical", "HTTP redirect", Severity.INFO,
            f"HTTP {code}. Check redirect chain length.",
            "Each hop adds latency. Keep chain to ≤2 redirects.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Technical", "HTTP status", Severity.CRITICAL,
            f"HTTP {code}.",
            "Fix the server error / broken URL.",
            impact="High", effort="Quick Win"))

    # ── HTTPS ─────────────────────────────────────────────────────────────────
    if page.url.startswith("https://"):
        f.append(Finding("Technical", "HTTPS", Severity.PASS, "Page served over HTTPS."))
    else:
        f.append(Finding("Technical", "HTTPS", Severity.CRITICAL,
            "Page served over HTTP (insecure).",
            "Install SSL/TLS certificate and redirect all HTTP → HTTPS.",
            impact="High", effort="Medium"))

    # ── HSTS header ──────────────────────────────────────────────────────────
    hsts = page.response_headers.get("Strict-Transport-Security", "")
    if page.url.startswith("https://") and not hsts:
        f.append(Finding("Technical", "HSTS header", Severity.WARNING,
            "HSTS header not set.",
            "Add Strict-Transport-Security header to enforce HTTPS.",
            impact="Medium", effort="Quick Win"))
    elif hsts:
        f.append(Finding("Technical", "HSTS header", Severity.PASS, "HSTS header present."))

    # ── Structured Data / JSON-LD ─────────────────────────────────────────────
    schemas = page.structured_data
    if not schemas:
        f.append(Finding("Technical", "Structured data (JSON-LD)", Severity.WARNING,
            "No JSON-LD schema found.",
            "Add Schema.org markup (Organization, WebPage, BreadcrumbList etc.).",
            impact="High", effort="Medium"))
    else:
        types = []
        for s in schemas:
            m = re.search(r'"@type"\s*:\s*"([^"]+)"', s)
            if m:
                types.append(m.group(1))
        f.append(Finding("Technical", "Structured data (JSON-LD)", Severity.PASS,
            f"{len(schemas)} JSON-LD block(s). Types: {', '.join(types) or 'unknown'}"))

    # ── Viewport Meta ─────────────────────────────────────────────────────────
    viewport = page.soup.find("meta", attrs={"name": "viewport"})
    if not viewport:
        f.append(Finding("Technical", "Viewport meta tag", Severity.CRITICAL,
            "No viewport meta tag — page is not mobile-friendly.",
            "Add <meta name='viewport' content='width=device-width, initial-scale=1'>",
            impact="High", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "Viewport meta tag", Severity.PASS,
            f"Viewport: {viewport.get('content','set')}"))

    # ── Doctype ───────────────────────────────────────────────────────────────
    if page.html and not page.html.strip().lower().startswith("<!doctype"):
        f.append(Finding("Technical", "HTML Doctype", Severity.WARNING,
            "Missing DOCTYPE declaration.",
            "Add <!DOCTYPE html> as the first line.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "HTML Doctype", Severity.PASS, "DOCTYPE present."))

    # ── Charset ───────────────────────────────────────────────────────────────
    charset_tag = page.soup.find("meta", attrs={"charset": True})
    charset_http = page.soup.find("meta", attrs={"http-equiv": re.compile("content-type", re.I)})
    if not charset_tag and not charset_http:
        f.append(Finding("Technical", "Charset declaration", Severity.WARNING,
            "No charset meta tag found.",
            "Add <meta charset='UTF-8'>.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "Charset declaration", Severity.PASS,
            "Charset declared."))

    # ── Hreflang ─────────────────────────────────────────────────────────────
    hreflang = page.soup.find_all("link", attrs={"hreflang": True})
    if not hreflang:
        f.append(Finding("Technical", "Hreflang tags", Severity.INFO,
            "No hreflang tags. Required if site targets multiple languages/regions.",
            "Add hreflang annotations for each language/region variant.",
            impact="Medium", effort="Long-term"))
    else:
        f.append(Finding("Technical", "Hreflang tags", Severity.PASS,
            f"{len(hreflang)} hreflang tag(s) found."))

    # ── X-Robots-Tag header ───────────────────────────────────────────────────
    x_robots = page.response_headers.get("X-Robots-Tag", "")
    if "noindex" in x_robots.lower():
        f.append(Finding("Technical", "X-Robots-Tag header", Severity.CRITICAL,
            f"X-Robots-Tag: {x_robots} — page blocked from indexing via header.",
            "Remove noindex from X-Robots-Tag header.",
            impact="High", effort="Quick Win"))
    elif x_robots:
        f.append(Finding("Technical", "X-Robots-Tag header", Severity.INFO,
            f"X-Robots-Tag: {x_robots}"))

    # ── Cache-Control ─────────────────────────────────────────────────────────
    cache = page.response_headers.get("Cache-Control", "")
    if not cache:
        f.append(Finding("Technical", "Cache-Control header", Severity.WARNING,
            "No Cache-Control header set.",
            "Configure caching headers to improve repeat-visit performance.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Technical", "Cache-Control header", Severity.PASS,
            f"Cache-Control: {cache}"))

    return report
