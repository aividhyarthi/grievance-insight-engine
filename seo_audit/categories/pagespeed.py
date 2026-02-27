"""
pagespeed.py — Pagespeed & Core Web Vitals checks.

Two-layer approach:
  1. Google PageSpeed Insights API (real CWV scores from Lighthouse).
     Called automatically when a live URL is provided.
     Set PAGESPEED_API_KEY env-var for higher rate limits (free key from Google Cloud).
  2. HTML proxy checks — render-blocking resources, lazy loading, compression, fonts.
     Always run as supplementary signals.
"""

from __future__ import annotations

import os
import re

try:
    import requests as _req
    _HAS_REQUESTS = True
except ImportError:
    _HAS_REQUESTS = False

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


_PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

# Core Web Vitals thresholds (Google-defined)
_LCP_GOOD = 2500    # ms
_LCP_POOR = 4000    # ms
_CLS_GOOD = 0.1
_CLS_POOR = 0.25
_TBT_GOOD = 200     # ms (proxy for INP)
_TBT_POOR = 600     # ms
_FCP_GOOD = 1800    # ms
_FCP_POOR = 3000    # ms
_PERF_GOOD = 90     # 0-100
_PERF_NEEDS = 50


def _call_psi(url: str, strategy: str = "mobile") -> dict | None:
    """
    Hit the Google PageSpeed Insights v5 API.
    Returns the full JSON response or None on failure.
    No API key needed for occasional use; set PAGESPEED_API_KEY for higher quotas.
    """
    if not _HAS_REQUESTS:
        return None
    if not url or url == "pasted-html" or not url.startswith("http"):
        return None

    params: dict = {"url": url, "strategy": strategy, "category": "performance"}
    api_key = os.environ.get("PAGESPEED_API_KEY", "").strip()
    if api_key:
        params["key"] = api_key

    try:
        resp = _req.get(_PSI_ENDPOINT, params=params, timeout=30)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        pass
    return None


def _metric(audits: dict, key: str) -> tuple[float | None, str]:
    """Extract (numericValue, displayValue) from a Lighthouse audit entry."""
    a = audits.get(key, {})
    return a.get("numericValue"), a.get("displayValue", "n/a")


def _psi_findings(page: PageData, f: list) -> bool:
    """
    Run PSI API and append real CWV findings.
    Returns True if PSI data was successfully obtained.
    """
    data = _call_psi(page.url)
    if not data:
        return False

    lhr = data.get("lighthouseResult", {})
    audits = lhr.get("audits", {})
    categories = lhr.get("categories", {})

    # ── Overall Performance Score ─────────────────────────────────────────────
    perf_score = categories.get("performance", {}).get("score")
    if perf_score is not None:
        score_pct = round(perf_score * 100)
        if score_pct >= _PERF_GOOD:
            sev = Severity.PASS
        elif score_pct >= _PERF_NEEDS:
            sev = Severity.WARNING
        else:
            sev = Severity.CRITICAL
        f.append(Finding("Pagespeed", "Google Lighthouse performance score", sev,
            f"Mobile performance score: {score_pct}/100.",
            "Focus on the individual CWV issues below to lift this score." if score_pct < _PERF_GOOD else None,
            impact="High", effort="Medium"))

    # ── Largest Contentful Paint (LCP) ────────────────────────────────────────
    lcp_val, lcp_disp = _metric(audits, "largest-contentful-paint")
    if lcp_val is not None:
        if lcp_val <= _LCP_GOOD:
            sev, rec = Severity.PASS, None
        elif lcp_val <= _LCP_POOR:
            sev = Severity.WARNING
            rec = ("Optimise the hero image or heading that triggers LCP: "
                   "preload it, serve WebP, and reduce server TTFB.")
        else:
            sev = Severity.CRITICAL
            rec = ("LCP is critically slow — users stare at a blank screen. "
                   "Prioritise: image compression, CDN, critical CSS inlining, "
                   "and preloading the LCP element.")
        f.append(Finding("Pagespeed", "Largest Contentful Paint (LCP)", sev,
            f"LCP: {lcp_disp} (Good ≤2.5 s · Needs improvement ≤4 s · Poor >4 s).",
            rec, impact="High", effort="Medium"))

    # ── Cumulative Layout Shift (CLS) ─────────────────────────────────────────
    cls_val, cls_disp = _metric(audits, "cumulative-layout-shift")
    if cls_val is not None:
        if cls_val <= _CLS_GOOD:
            sev, rec = Severity.PASS, None
        elif cls_val <= _CLS_POOR:
            sev = Severity.WARNING
            rec = ("Reserve explicit width/height on images and iframes. "
                   "Avoid injecting content above the fold after load.")
        else:
            sev = Severity.CRITICAL
            rec = ("High layout shift damages UX and Google ranking. "
                   "Set explicit dimensions on all images, ads, and dynamic widgets.")
        f.append(Finding("Pagespeed", "Cumulative Layout Shift (CLS)", sev,
            f"CLS: {cls_disp} (Good ≤0.1 · Needs improvement ≤0.25 · Poor >0.25).",
            rec, impact="High", effort="Medium"))

    # ── Total Blocking Time (TBT) — best Lighthouse proxy for INP/FID ─────────
    tbt_val, tbt_disp = _metric(audits, "total-blocking-time")
    if tbt_val is not None:
        if tbt_val <= _TBT_GOOD:
            sev, rec = Severity.PASS, None
        elif tbt_val <= _TBT_POOR:
            sev = Severity.WARNING
            rec = ("Break up long JavaScript tasks (>50 ms). "
                   "Defer non-critical scripts and remove unused JS bundles.")
        else:
            sev = Severity.CRITICAL
            rec = ("Main thread is severely blocked — the page feels frozen on click. "
                   "Audit JS with Chrome DevTools, split large bundles, and defer third-party scripts.")
        f.append(Finding("Pagespeed", "Total Blocking Time / Interactivity (TBT)", sev,
            f"TBT: {tbt_disp} (Good ≤200 ms · Poor >600 ms).",
            rec, impact="High", effort="Long-term"))

    # ── First Contentful Paint (FCP) ──────────────────────────────────────────
    fcp_val, fcp_disp = _metric(audits, "first-contentful-paint")
    if fcp_val is not None:
        if fcp_val <= _FCP_GOOD:
            sev, rec = Severity.PASS, None
        elif fcp_val <= _FCP_POOR:
            sev = Severity.WARNING
            rec = "Inline critical CSS, preload the hero font, and reduce initial server response time."
        else:
            sev = Severity.CRITICAL
            rec = ("Users wait >3 s before seeing anything. "
                   "Eliminate render-blocking resources and inline critical above-fold styles.")
        f.append(Finding("Pagespeed", "First Contentful Paint (FCP)", sev,
            f"FCP: {fcp_disp} (Good ≤1.8 s · Poor >3 s).",
            rec, impact="High", effort="Medium"))

    # ── Speed Index ───────────────────────────────────────────────────────────
    si_val, si_disp = _metric(audits, "speed-index")
    if si_val is not None and si_val > 3400:
        f.append(Finding("Pagespeed", "Speed Index", Severity.WARNING,
            f"Speed Index: {si_disp} (target <3.4 s). Visual load feels slow.",
            "Reduce render-blocking CSS/JS and optimise image delivery order.",
            impact="Medium", effort="Medium"))

    # ── Top PSI Opportunities ─────────────────────────────────────────────────
    opportunity_keys = [
        ("render-blocking-resources", "Eliminate render-blocking resources"),
        ("uses-optimized-images",     "Properly size/compress images"),
        ("unused-javascript",         "Remove unused JavaScript"),
        ("unused-css-rules",          "Remove unused CSS"),
        ("uses-text-compression",     "Enable text compression (gzip/Brotli)"),
        ("efficient-animated-content","Use video formats for animated images"),
        ("uses-long-cache-ttl",       "Serve static assets with long cache TTL"),
        ("uses-rel-preconnect",       "Preconnect to required origins"),
    ]
    opportunities = []
    for key, label in opportunity_keys:
        audit = audits.get(key, {})
        savings = audit.get("details", {}).get("overallSavingsMs")
        if savings and savings > 250:
            opportunities.append(f"{label} (~{round(savings)} ms saving)")

    if opportunities:
        f.append(Finding("Pagespeed", "PSI optimisation opportunities", Severity.WARNING,
            f"{len(opportunities)} specific optimisation(s) flagged by Google Lighthouse:",
            " | ".join(opportunities),
            impact="High", effort="Medium"))
    else:
        f.append(Finding("Pagespeed", "PSI optimisation opportunities", Severity.PASS,
            "No significant optimisation opportunities flagged by Google Lighthouse."))

    return True


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Pagespeed",
        description=(
            "Performance signals affecting Core Web Vitals and user experience. "
            "Uses Google PageSpeed Insights API for real Lighthouse scores on live URLs."
        ),
    )
    f = report.findings
    soup = page.soup

    # ── Layer 1: Google PSI API (real CWV data) ───────────────────────────────
    psi_available = _psi_findings(page, f)

    if not psi_available:
        if page.url == "pasted-html":
            f.append(Finding("Pagespeed", "Real CWV data", Severity.INFO,
                "PageSpeed Insights requires a live URL — running HTML-only proxy checks below.",
                "Audit a live URL to get real Lighthouse scores (LCP, CLS, TBT).",
                impact="High", effort="Quick Win"))
        else:
            f.append(Finding("Pagespeed", "Real CWV data", Severity.INFO,
                "Google PageSpeed Insights API was not reachable — HTML proxy checks only.",
                "Set PAGESPEED_API_KEY env variable or ensure network access for real CWV data.",
                impact="Medium", effort="Quick Win"))

    # ── Layer 2: HTML proxy checks (always run as supplementary) ─────────────

    # Server fetch time (our crawler's latency — rough directional proxy for TTFB)
    ms = page.load_time_ms
    if ms > 0:
        if ms < 600:
            f.append(Finding("Pagespeed", "Fetch response time", Severity.PASS,
                f"Fast: {ms} ms from our crawler (network-inclusive; not a precise TTFB)."))
        elif ms < 2000:
            f.append(Finding("Pagespeed", "Fetch response time", Severity.WARNING,
                f"Moderate: {ms} ms. This includes network but suggests slow TTFB.",
                "Enable server-side caching, CDN, and Brotli compression.",
                impact="High", effort="Medium"))
        else:
            f.append(Finding("Pagespeed", "Fetch response time", Severity.CRITICAL,
                f"Slow: {ms} ms — almost certainly a high LCP contributor.",
                "Investigate server performance: database queries, un-cached responses, memory limits.",
                impact="High", effort="Medium"))

    # Render-blocking scripts
    blocking_scripts = [
        s for s in soup.find_all("script", src=True)
        if not s.get("async") and not s.get("defer") and s.get("type") != "module"
    ]
    head_blocking = [s for s in blocking_scripts if s.find_parent("head")]
    if head_blocking:
        f.append(Finding("Pagespeed", "Render-blocking scripts in <head>", Severity.WARNING,
            f"{len(head_blocking)} synchronous <script src> tag(s) inside <head> block first paint.",
            "Move to end of <body> or add defer. Only truly critical scripts belong in <head>.",
            impact="High", effort="Quick Win"))
    elif blocking_scripts:
        f.append(Finding("Pagespeed", "Synchronous scripts", Severity.INFO,
            f"{len(blocking_scripts)} synchronous <script> tag(s) — not in <head> but still block parser.",
            "Add defer attribute to all non-critical scripts.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Pagespeed", "Render-blocking scripts", Severity.PASS,
            "All external scripts use async or defer — no render-blocking JS detected."))

    # Render-blocking CSS
    stylesheets = [
        l for l in soup.find_all("link", rel=True)
        if "stylesheet" in (l.get("rel") or []) and l.get("media") != "print"
    ]
    if len(stylesheets) > 4:
        f.append(Finding("Pagespeed", "Render-blocking CSS", Severity.WARNING,
            f"{len(stylesheets)} CSS stylesheets loaded in <head> — each one blocks first paint.",
            "Inline critical CSS; defer non-critical stylesheets with media='print' + JS swap or a bundler.",
            impact="High", effort="Long-term"))
    elif stylesheets:
        f.append(Finding("Pagespeed", "Render-blocking CSS", Severity.PASS,
            f"{len(stylesheets)} stylesheet(s) — within acceptable range."))

    # Image lazy loading (with above-fold awareness)
    images = page.images
    if images:
        # Heuristic: first 2 images in DOM order are likely above the fold.
        # Note: actual fold position depends on CSS/viewport — treat these as signals, not absolutes.
        above_fold_lazy = [img for img in images[:2] if img["loading"] == "lazy"]
        below_fold_no_lazy = [img for img in images[2:] if img["loading"] not in ("lazy", "eager")]
        if above_fold_lazy:
            f.append(Finding("Pagespeed", "LCP image possibly lazy-loaded", Severity.WARNING,
                f"{len(above_fold_lazy)} of the first 2 image(s) in the DOM have loading='lazy' — "
                "if these are above the fold, this delays the Largest Contentful Paint (LCP).",
                "Avoid lazy-loading images that appear in the initial viewport. "
                "Use loading='eager' (or omit the attribute) for hero/above-fold images.",
                impact="High", effort="Quick Win"))
        if below_fold_no_lazy:
            f.append(Finding("Pagespeed", "Image lazy loading", Severity.WARNING,
                f"{len(below_fold_no_lazy)} image(s) beyond the first 2 are missing loading='lazy'.",
                "Add loading='lazy' to images below the fold to defer their download "
                "and reduce initial page weight.",
                impact="Medium", effort="Quick Win"))
        if not above_fold_lazy and not below_fold_no_lazy:
            f.append(Finding("Pagespeed", "Image lazy loading", Severity.PASS,
                "Lazy-loading strategy looks correct — first images are eager, remainder are lazy."))

    # Modern image formats
    jpg_png = [img for img in images if re.search(r"\.(jpe?g|png)(\?|$)", img["src"], re.I)]
    webp_avif = [img for img in images if re.search(r"\.(webp|avif)(\?|$)", img["src"], re.I)]
    if jpg_png and not webp_avif:
        f.append(Finding("Pagespeed", "Modern image formats", Severity.WARNING,
            f"{len(jpg_png)} JPEG/PNG image(s) detected, 0 WebP/AVIF. "
            "WebP saves ~30%, AVIF ~50% vs JPEG at equivalent quality.",
            "Convert images to WebP (broad browser support) or AVIF with <picture> fallback.",
            impact="Medium", effort="Medium"))
    elif jpg_png and webp_avif:
        f.append(Finding("Pagespeed", "Modern image formats", Severity.INFO,
            f"Mix: {len(webp_avif)} WebP/AVIF + {len(jpg_png)} legacy JPEG/PNG.",
            "Migrate remaining JPEG/PNG to WebP or AVIF for full weight savings.",
            impact="Low", effort="Medium"))
    elif not jpg_png and images:
        f.append(Finding("Pagespeed", "Modern image formats", Severity.PASS,
            f"All {len(webp_avif)} image(s) use modern WebP/AVIF format."))

    # Image file size — check for missing width/height and missing srcset
    if images:
        all_img_tags = soup.find_all("img", src=True)
        no_dimensions = [
            img for img in all_img_tags
            if not img.get("width") and not img.get("height") and not img.get("srcset")
        ]
        if no_dimensions:
            f.append(Finding("Pagespeed", "Image file size", Severity.CRITICAL,
                f"{len(no_dimensions)} image(s) have no explicit width/height or srcset — "
                "browser must download full-size images for all viewports, wasting bandwidth.",
                "Add width and height attributes to every <img>, and use srcset/sizes for "
                "responsive delivery so mobile devices receive appropriately sized images.",
                impact="High", effort="Medium"))
        else:
            f.append(Finding("Pagespeed", "Image file size", Severity.PASS,
                "All images have explicit dimensions or srcset for responsive delivery."))

    # Image file name — check for auto-generated or non-descriptive filenames
    _generic_img_name = re.compile(
        r"/(?:img|image|photo|pic|dsc|screenshot|unnamed|untitled|thumb|"
        r"attachment|placeholder|banner|slide|picture|capture|frame)[-_]?\d*"
        r"\.(jpe?g|png|webp|gif|avif)(?:\?|$)",
        re.I,
    )
    if images:
        poorly_named = [img for img in images if _generic_img_name.search(img["src"])]
        if poorly_named:
            example = poorly_named[0]["src"].split("/")[-1].split("?")[0]
            f.append(Finding("Pagespeed", "Image file name", Severity.CRITICAL,
                f"{len(poorly_named)} image(s) have auto-generated or non-descriptive filenames "
                f"(e.g. '{example}').",
                "Rename images with keyword-relevant, descriptive filenames "
                "(e.g. 'dubai-office-interior.webp' instead of 'img001.jpg') — "
                "Google uses filenames as an image search relevance signal.",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("Pagespeed", "Image file name", Severity.PASS,
                "Image filenames appear descriptive — no auto-generated names detected."))

    # Resource hints
    preloads = soup.find_all("link", rel=lambda r: r and "preload" in r)
    prefetches = soup.find_all("link", rel=lambda r: r and "prefetch" in r)
    dns_prefetch = soup.find_all("link", rel=lambda r: r and "dns-prefetch" in r)
    preconnects = soup.find_all("link", rel=lambda r: r and "preconnect" in r)

    if not preloads and not preconnects and not dns_prefetch:
        f.append(Finding("Pagespeed", "Resource hints", Severity.INFO,
            "No preload, preconnect, or dns-prefetch hints found.",
            "Add <link rel='preload'> for the LCP image/font; "
            "<link rel='preconnect'> for critical third-party origins (fonts, analytics, CDN).",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Pagespeed", "Resource hints", Severity.PASS,
            f"{len(preloads)} preload, {len(prefetches)} prefetch, "
            f"{len(preconnects)} preconnect, {len(dns_prefetch)} dns-prefetch hints."))

    # Compression
    encoding = page.response_headers.get("Content-Encoding", "")
    if not encoding:
        f.append(Finding("Pagespeed", "Gzip/Brotli compression", Severity.WARNING,
            "No Content-Encoding header — HTML is likely sent uncompressed.",
            "Enable Brotli (preferred) or gzip on your web server/CDN. Typical text savings: 70–80%.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Pagespeed", "Gzip/Brotli compression", Severity.PASS,
            f"Compression active: {encoding}"))

    # Google Fonts loading strategy
    font_links = soup.find_all("link", href=re.compile(r"fonts\.(gstatic|googleapis)\.com"))
    font_preconnects = soup.find_all(
        "link",
        attrs={"rel": lambda r: r and "preconnect" in r,
               "href": re.compile(r"fonts\.(gstatic|googleapis)\.com")})
    if font_links and not font_preconnects:
        f.append(Finding("Pagespeed", "Google Fonts preconnect missing", Severity.WARNING,
            "Google Fonts loaded without a preconnect hint — font request is delayed by DNS + TLS.",
            "Add: <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>",
            impact="Medium", effort="Quick Win"))
    elif font_links and font_preconnects:
        f.append(Finding("Pagespeed", "Font loading", Severity.PASS,
            "Google Fonts with preconnect — optimal loading order."))
    else:
        f.append(Finding("Pagespeed", "Font loading", Severity.PASS,
            "No render-blocking Google Fonts detected."))

    # Large inline scripts (hurt caching)
    inline_scripts = soup.find_all("script", src=False)
    large_inline = [s for s in inline_scripts if len(s.get_text()) > 5000]
    if len(large_inline) > 2:
        f.append(Finding("Pagespeed", "Large inline scripts", Severity.INFO,
            f"{len(large_inline)} inline <script> block(s) exceed 5 KB — cannot be cached by the browser.",
            "Extract large inline scripts to external files to enable browser caching and parallel loading.",
            impact="Low", effort="Medium"))

    return report
