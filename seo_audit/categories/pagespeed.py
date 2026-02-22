"""
pagespeed.py — Pagespeed & Core Web Vitals proxy checks.
Covers: server response time, render-blocking resources, image optimisation
        hints, lazy loading, resource hints (preload/prefetch), compression
        header, font loading strategy.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Pagespeed",
        description="Performance signals affecting Core Web Vitals and user experience.",
    )
    f = report.findings
    soup = page.soup

    # ── Server response time (TTFB proxy) ────────────────────────────────────
    ms = page.load_time_ms
    if ms > 0:
        if ms < 800:
            f.append(Finding("Pagespeed", "Server response time", Severity.PASS,
                f"Fast — {ms} ms (target <800 ms)."))
        elif ms < 2000:
            f.append(Finding("Pagespeed", "Server response time", Severity.WARNING,
                f"Moderate — {ms} ms. Aim for <800 ms.",
                "Enable server-side caching, CDN, and gzip.",
                impact="High", effort="Medium"))
        else:
            f.append(Finding("Pagespeed", "Server response time", Severity.CRITICAL,
                f"Slow — {ms} ms. High impact on Core Web Vitals LCP.",
                "Investigate server performance, use CDN, reduce TTFB.",
                impact="High", effort="Medium"))

    # ── Render-blocking scripts ───────────────────────────────────────────────
    blocking_scripts = [
        s for s in soup.find_all("script", src=True)
        if not s.get("async") and not s.get("defer") and not s.get("type") == "module"
    ]
    if blocking_scripts:
        f.append(Finding("Pagespeed", "Render-blocking scripts", Severity.WARNING,
            f"{len(blocking_scripts)} synchronous <script> tag(s) may block rendering.",
            "Add async or defer attribute to non-critical scripts.",
            impact="High", effort="Quick Win"))
    else:
        f.append(Finding("Pagespeed", "Render-blocking scripts", Severity.PASS,
            "No render-blocking scripts detected."))

    # ── Render-blocking CSS ───────────────────────────────────────────────────
    blocking_css = [
        l for l in soup.find_all("link", rel=True)
        if "stylesheet" in (l.get("rel") or []) and not l.get("media") == "print"
    ]
    if len(blocking_css) > 3:
        f.append(Finding("Pagespeed", "Render-blocking CSS", Severity.WARNING,
            f"{len(blocking_css)} CSS stylesheets loaded in <head>.",
            "Inline critical CSS; load non-critical CSS with media=print trick or async.",
            impact="High", effort="Long-term"))
    else:
        f.append(Finding("Pagespeed", "Render-blocking CSS", Severity.PASS,
            f"{len(blocking_css)} stylesheet(s) — acceptable."))

    # ── Image lazy loading ────────────────────────────────────────────────────
    images = page.images
    if images:
        no_lazy = [img for img in images if img["loading"] not in ("lazy", "eager")]
        if no_lazy:
            f.append(Finding("Pagespeed", "Image lazy loading", Severity.WARNING,
                f"{len(no_lazy)}/{len(images)} images without loading='lazy'.",
                "Add loading='lazy' to all below-the-fold images.",
                impact="Medium", effort="Quick Win"))
        else:
            f.append(Finding("Pagespeed", "Image lazy loading", Severity.PASS,
                "All images have loading attribute set."))

    # ── Modern image formats ──────────────────────────────────────────────────
    jpg_png = [
        img for img in images
        if re.search(r"\.(jpe?g|png)(\?|$)", img["src"], re.I)
    ]
    if len(jpg_png) > 3:
        f.append(Finding("Pagespeed", "Modern image formats", Severity.INFO,
            f"{len(jpg_png)} JPEG/PNG image(s). WebP/AVIF could reduce size by 30–50%.",
            "Convert images to WebP or AVIF with a <picture> fallback.",
            impact="Medium", effort="Medium"))

    # ── Resource hints ────────────────────────────────────────────────────────
    preloads = soup.find_all("link", rel=lambda r: r and "preload" in r)
    prefetches = soup.find_all("link", rel=lambda r: r and "prefetch" in r)
    dns_prefetch = soup.find_all("link", rel=lambda r: r and "dns-prefetch" in r)

    if not preloads and not prefetches and not dns_prefetch:
        f.append(Finding("Pagespeed", "Resource hints", Severity.INFO,
            "No preload, prefetch, or dns-prefetch hints found.",
            "Add <link rel='preload'> for critical fonts/scripts; dns-prefetch for third-party domains.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Pagespeed", "Resource hints", Severity.PASS,
            f"{len(preloads)} preload, {len(prefetches)} prefetch, {len(dns_prefetch)} dns-prefetch hints."))

    # ── Compression ───────────────────────────────────────────────────────────
    encoding = page.response_headers.get("Content-Encoding", "")
    if not encoding:
        f.append(Finding("Pagespeed", "Gzip/Brotli compression", Severity.WARNING,
            "No Content-Encoding header. Response may not be compressed.",
            "Enable gzip or Brotli compression on the web server.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Pagespeed", "Gzip/Brotli compression", Severity.PASS,
            f"Compression: {encoding}"))

    # ── Font loading ──────────────────────────────────────────────────────────
    font_links = soup.find_all("link", href=re.compile(r"fonts\.(gstatic|googleapis)\.com"))
    font_preconnect = soup.find_all("link",
        rel=lambda r: r and "preconnect" in r,
        href=re.compile(r"fonts\.(gstatic|googleapis)\.com"))
    if font_links and not font_preconnect:
        f.append(Finding("Pagespeed", "Google Fonts preconnect", Severity.WARNING,
            "Google Fonts loaded without preconnect hint.",
            "Add <link rel='preconnect' href='https://fonts.gstatic.com'>.",
            impact="Medium", effort="Quick Win"))
    elif not font_links:
        f.append(Finding("Pagespeed", "Font loading", Severity.PASS,
            "No render-blocking Google Fonts detected."))
    else:
        f.append(Finding("Pagespeed", "Font loading", Severity.PASS,
            "Google Fonts with preconnect hint — good."))

    return report
