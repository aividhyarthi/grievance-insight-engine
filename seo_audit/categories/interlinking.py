"""
interlinking.py — SEO Interlinking checks.
Covers: internal link count, anchor text diversity, broken-looking links,
        nav structure, breadcrumbs, footer links.
"""

from __future__ import annotations

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="SEO Interlinking",
        description="Internal link structure, anchor text quality, and crawl depth signals.",
    )
    f = report.findings

    links = page.links
    internal = [l for l in links if l["internal"]]
    external = [l for l in links if not l["internal"]]

    # ── Internal link count ───────────────────────────────────────────────────
    ic = len(internal)
    if ic == 0:
        f.append(Finding("Interlinking", "Internal links", Severity.CRITICAL,
            "No internal links found. Crawler cannot discover other pages.",
            "Add contextual internal links to key pages.",
            impact="High", effort="Medium"))
    elif ic < 5:
        f.append(Finding("Interlinking", "Internal links", Severity.WARNING,
            f"Only {ic} internal link(s). Thin link structure.",
            "Increase to at least 10–15 contextual internal links.",
            impact="High", effort="Medium"))
    else:
        f.append(Finding("Interlinking", "Internal links", Severity.PASS,
            f"{ic} internal links, {len(external)} external links."))

    # ── Anchor text diversity ─────────────────────────────────────────────────
    anchor_texts = [l["text"].lower().strip() for l in internal if l["text"]]
    generic = [t for t in anchor_texts if t in ("click here", "read more", "here", "learn more", "more")]
    if generic:
        f.append(Finding("Interlinking", "Generic anchor text", Severity.WARNING,
            f"{len(generic)} link(s) use generic anchor text (e.g. 'click here').",
            "Replace with descriptive, keyword-relevant anchor text.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Interlinking", "Generic anchor text", Severity.PASS,
            "No generic anchor text detected."))

    # ── Empty anchor text ─────────────────────────────────────────────────────
    empty = [l for l in links if not l["text"]]
    if empty:
        f.append(Finding("Interlinking", "Empty anchor text", Severity.WARNING,
            f"{len(empty)} link(s) have no anchor text.",
            "Add descriptive text or aria-label to all links.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Interlinking", "Empty anchor text", Severity.PASS,
            "All links have anchor text."))

    # ── Breadcrumbs ───────────────────────────────────────────────────────────
    breadcrumb_schema = any(
        '"BreadcrumbList"' in s for s in page.structured_data
    )
    breadcrumb_nav = page.soup.find(
        ["nav", "ol", "ul"], attrs={"aria-label": lambda v: v and "breadcrumb" in v.lower()}
    ) or page.soup.find(attrs={"class": lambda v: v and "breadcrumb" in " ".join(v).lower()})

    if not breadcrumb_schema and not breadcrumb_nav:
        f.append(Finding("Interlinking", "Breadcrumb navigation", Severity.WARNING,
            "No breadcrumb nav or BreadcrumbList schema found.",
            "Add breadcrumbs and BreadcrumbList JSON-LD for better SERP display.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Interlinking", "Breadcrumb navigation", Severity.PASS,
            "Breadcrumb navigation present."))

    # ── Navigation structure ──────────────────────────────────────────────────
    nav_tags = page.soup.find_all("nav")
    if not nav_tags:
        f.append(Finding("Interlinking", "Navigation <nav> element", Severity.WARNING,
            "No <nav> HTML5 element found.",
            "Wrap primary navigation in a <nav> tag for semantic clarity.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("Interlinking", "Navigation <nav> element", Severity.PASS,
            f"{len(nav_tags)} <nav> element(s) found."))

    # ── Nofollow on internal links ────────────────────────────────────────────
    nf_internal = [
        l for l in internal
        if "nofollow" in (l["rel"] if isinstance(l["rel"], list) else [l["rel"]])
    ]
    if nf_internal:
        f.append(Finding("Interlinking", "Nofollow on internal links", Severity.WARNING,
            f"{len(nf_internal)} internal link(s) have rel=nofollow — wasting PageRank.",
            "Remove nofollow from internal links unless intentional.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Interlinking", "Nofollow on internal links", Severity.PASS,
            "No unnecessary nofollow on internal links."))

    # ── External links: nofollow on sponsored/affiliate ──────────────────────
    ext_no_rel = [l for l in external if not l["rel"]]
    if len(ext_no_rel) > 5:
        f.append(Finding("Interlinking", "External link attributes", Severity.INFO,
            f"{len(ext_no_rel)} external links without rel attribute.",
            "Add rel='nofollow ugc' or rel='sponsored' where appropriate.",
            impact="Low", effort="Quick Win"))

    return report
