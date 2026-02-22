"""
onpage.py — SEO On-Page checks.
Covers: title, meta description, heading hierarchy, canonical, lang,
        robots meta, image alt text, Open Graph, Twitter Card, indexability.
"""

from __future__ import annotations

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="SEO On-Page",
        description="Fundamental on-page signals that search engines read directly.",
    )
    f = report.findings

    # ── Title ────────────────────────────────────────────────────────────────
    title = page.title
    if not title:
        f.append(Finding("On-Page", "Title tag", Severity.CRITICAL,
            "No <title> tag found.",
            "Add a unique, keyword-rich title (50–60 chars).",
            impact="High", effort="Quick Win"))
    elif len(title) < 30:
        f.append(Finding("On-Page", "Title length", Severity.WARNING,
            f"Title too short ({len(title)} chars): '{title}'",
            "Expand to 50–60 characters.",
            impact="Medium", effort="Quick Win"))
    elif len(title) > 60:
        f.append(Finding("On-Page", "Title length", Severity.WARNING,
            f"Title too long ({len(title)} chars) — truncated in SERPs.",
            "Trim to ≤60 characters.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Title tag", Severity.PASS,
            f"Title OK ({len(title)} chars): '{title}'"))

    # ── Meta Description ─────────────────────────────────────────────────────
    desc = page.meta_description
    if not desc:
        f.append(Finding("On-Page", "Meta description", Severity.CRITICAL,
            "No meta description found.",
            "Write a compelling 150–160 char description with a call-to-action.",
            impact="High", effort="Quick Win"))
    elif len(desc) < 70:
        f.append(Finding("On-Page", "Meta description length", Severity.WARNING,
            f"Too short ({len(desc)} chars). Low CTR risk.",
            "Expand to 150–160 characters.",
            impact="Medium", effort="Quick Win"))
    elif len(desc) > 160:
        f.append(Finding("On-Page", "Meta description length", Severity.WARNING,
            f"Too long ({len(desc)} chars) — will be truncated.",
            "Shorten to ≤160 characters.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Meta description", Severity.PASS,
            f"Meta description OK ({len(desc)} chars)."))

    # ── Headings ─────────────────────────────────────────────────────────────
    h1s = page.h1_tags
    if not h1s:
        f.append(Finding("On-Page", "H1 tag", Severity.CRITICAL,
            "No <h1> tag found.",
            "Add one descriptive H1 containing the primary keyword.",
            impact="High", effort="Quick Win"))
    elif len(h1s) > 1:
        f.append(Finding("On-Page", "H1 uniqueness", Severity.WARNING,
            f"{len(h1s)} H1 tags found: {h1s[:3]}",
            "Keep exactly one H1 per page.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "H1 tag", Severity.PASS,
            f"Single H1: '{h1s[0]}'"))

    h2s = page.h2_tags
    if not h2s:
        f.append(Finding("On-Page", "H2 structure", Severity.WARNING,
            "No H2 tags. Content structure is flat.",
            "Use H2 subheadings to organise content and capture long-tail queries.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "H2 structure", Severity.PASS,
            f"{len(h2s)} H2(s) and {len(page.h3_tags)} H3(s) found."))

    # ── Canonical ────────────────────────────────────────────────────────────
    canon = page.canonical_url
    if not canon:
        f.append(Finding("On-Page", "Canonical URL", Severity.WARNING,
            "No canonical link tag.",
            "Add <link rel='canonical'> to prevent duplicate content issues.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Canonical URL", Severity.PASS,
            f"Canonical set: {canon}"))

    # ── Robots Meta ──────────────────────────────────────────────────────────
    robots = page.robots_meta.lower()
    if "noindex" in robots:
        f.append(Finding("On-Page", "Indexability", Severity.CRITICAL,
            f"noindex directive detected: '{page.robots_meta}'",
            "Remove noindex if this page should appear in search results.",
            impact="High", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Indexability", Severity.PASS,
            f"Robots meta: '{page.robots_meta or 'index, follow (default)'}'"))

    # ── Language ─────────────────────────────────────────────────────────────
    lang = page.lang
    if not lang:
        f.append(Finding("On-Page", "HTML lang attribute", Severity.WARNING,
            "<html> tag missing lang attribute.",
            "Add lang='en' (or appropriate locale).",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "HTML lang attribute", Severity.PASS,
            f"lang='{lang}'"))

    # ── Open Graph ───────────────────────────────────────────────────────────
    og = page.open_graph
    required_og = ["og:title", "og:description", "og:image", "og:url"]
    missing_og = [k for k in required_og if k not in og]
    if missing_og:
        f.append(Finding("On-Page", "Open Graph tags", Severity.WARNING,
            f"Missing: {', '.join(missing_og)}",
            "Add full OG tags to improve social sharing appearance.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Open Graph tags", Severity.PASS,
            "All core Open Graph tags present."))

    # ── Twitter Card ─────────────────────────────────────────────────────────
    tc = page.twitter_card
    if not tc:
        f.append(Finding("On-Page", "Twitter Card", Severity.INFO,
            "No Twitter Card meta tags found.",
            "Add twitter:card, twitter:title, twitter:description, twitter:image.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Twitter Card", Severity.PASS,
            f"Twitter Card type: {tc.get('twitter:card', 'set')}"))

    # ── Image Alt Text ───────────────────────────────────────────────────────
    images = page.images
    missing_alt = [img for img in images if not img["alt"]]
    if images:
        if missing_alt:
            f.append(Finding("On-Page", "Image alt text", Severity.CRITICAL,
                f"{len(missing_alt)}/{len(images)} images missing alt text.",
                "Add descriptive alt attributes to all images.",
                impact="High", effort="Medium"))
        else:
            f.append(Finding("On-Page", "Image alt text", Severity.PASS,
                f"All {len(images)} image(s) have alt text."))

    return report
