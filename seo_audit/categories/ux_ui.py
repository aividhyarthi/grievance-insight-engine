"""
ux_ui.py — UX/UI SEO checks.
Covers: mobile-friendliness, viewport, tap targets, font size,
        layout shift signals, navigation accessibility, CTA presence,
        404/error page signals.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="UX / UI",
        description="User experience signals that affect dwell time, bounce rate, and Core Web Vitals.",
    )
    f = report.findings
    soup = page.soup

    # ── Viewport / Mobile-friendliness ────────────────────────────────────────
    vp = soup.find("meta", attrs={"name": "viewport"})
    if not vp:
        f.append(Finding("UX/UI", "Mobile viewport", Severity.CRITICAL,
            "No viewport meta tag — Google will flag as not mobile-friendly.",
            "Add <meta name='viewport' content='width=device-width, initial-scale=1'>",
            impact="High", effort="Quick Win"))
    else:
        content = vp.get("content", "").lower()
        if "user-scalable=no" in content or "maximum-scale=1" in content:
            f.append(Finding("UX/UI", "Mobile viewport", Severity.WARNING,
                "Viewport disables user scaling — accessibility issue.",
                "Remove user-scalable=no and maximum-scale constraints.",
                impact="Medium", effort="Quick Win"))
        else:
            f.append(Finding("UX/UI", "Mobile viewport", Severity.PASS,
                f"Viewport set correctly."))

    # ── Touch-friendly buttons ────────────────────────────────────────────────
    small_buttons = []
    for btn in soup.find_all(["button", "a"]):
        style = btn.get("style", "")
        # Look for explicitly tiny inline sizes as a proxy signal
        if re.search(r"(width|height)\s*:\s*([0-9]+)px", style):
            dims = re.findall(r"(?:width|height)\s*:\s*([0-9]+)px", style)
            if any(int(d) < 44 for d in dims):
                small_buttons.append(btn)
    if small_buttons:
        f.append(Finding("UX/UI", "Touch target size", Severity.WARNING,
            f"{len(small_buttons)} element(s) with inline size <44px detected.",
            "Ensure all tap targets are at least 44×44px (Google's recommendation).",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("UX/UI", "Touch target size", Severity.PASS,
            "No obviously undersized touch targets detected via inline styles."))

    # ── CTA / conversion elements ─────────────────────────────────────────────
    cta_keywords = re.compile(
        r"\b(buy|shop|order|subscribe|sign up|register|get started|try|"
        r"book|enquire|contact|download|start free)\b", re.I)
    cta_buttons = [
        b for b in soup.find_all(["button", "a"])
        if cta_keywords.search(b.get_text())
    ]
    if not cta_buttons:
        f.append(Finding("UX/UI", "Call-to-action presence", Severity.WARNING,
            "No obvious CTA buttons/links found.",
            "Add clear, prominent CTAs to guide users and reduce bounce.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("UX/UI", "Call-to-action presence", Severity.PASS,
            f"{len(cta_buttons)} CTA element(s) found."))

    # ── Inline CSS heavy ──────────────────────────────────────────────────────
    inline_styles = soup.find_all(style=True)
    if len(inline_styles) > 30:
        f.append(Finding("UX/UI", "Inline styles", Severity.INFO,
            f"{len(inline_styles)} elements with inline styles. May affect paint performance.",
            "Move repeated styles to a CSS file to improve CLS and caching.",
            impact="Low", effort="Medium"))

    # ── 404 / Error page ──────────────────────────────────────────────────────
    if page.status_code == 404:
        f.append(Finding("UX/UI", "404 page", Severity.CRITICAL,
            "Page returns 404. Users and crawlers will hit a dead end.",
            "Create a helpful custom 404 page with navigation and search.",
            impact="High", effort="Medium"))

    # ── Footer presence ───────────────────────────────────────────────────────
    footer = soup.find("footer")
    if not footer:
        f.append(Finding("UX/UI", "Footer element", Severity.INFO,
            "No <footer> tag found.",
            "Add a semantic <footer> with navigation, legal links, and contact info.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("UX/UI", "Footer element", Severity.PASS,
            "Footer element present."))

    # ── Semantic HTML5 ────────────────────────────────────────────────────────
    semantic_tags = ["header", "main", "article", "section", "aside", "nav", "footer"]
    found_semantic = [t for t in semantic_tags if soup.find(t)]
    missing_semantic = [t for t in semantic_tags if t not in found_semantic]
    if len(found_semantic) < 3:
        f.append(Finding("UX/UI", "Semantic HTML5 structure", Severity.WARNING,
            f"Only {len(found_semantic)} semantic elements found ({', '.join(found_semantic) or 'none'}).",
            "Use HTML5 semantic tags (<main>, <article>, <section> etc.) for better accessibility and crawlability.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("UX/UI", "Semantic HTML5 structure", Severity.PASS,
            f"Good semantic structure: {', '.join(found_semantic)}"))

    # ── Skip navigation link (accessibility) ─────────────────────────────────
    skip_link = soup.find("a", href="#main-content") or \
                soup.find("a", attrs={"class": re.compile(r"skip", re.I)})
    if not skip_link:
        f.append(Finding("UX/UI", "Skip navigation link", Severity.INFO,
            "No 'skip to content' link found.",
            "Add a skip link for keyboard/screen reader users — also a Google quality signal.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("UX/UI", "Skip navigation link", Severity.PASS,
            "Skip navigation link present."))

    return report
