"""
interlinking.py — SEO Interlinking checks.
Covers: internal link count, anchor text quality (generic, topically-empty,
        repetitive, very short), self-referential links, link density,
        nav structure, breadcrumbs, nofollow on internal links, external link attributes.
"""

from __future__ import annotations

import re
import urllib.parse
from collections import Counter

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


# Anchors that communicate zero topic signal
_MEANINGLESS_ANCHORS = {
    "click here", "here", "read more", "more", "learn more",
    "this page", "this", "link", "click", "view", "see here",
    "see more", "more info", "more information", "continue",
    "find out more", "details", "go", "visit",
}

_STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "was", "are", "it", "its",
    "we", "our", "you", "your", "they", "their", "he", "she", "as",
    "if", "so", "not", "no", "up", "be", "been",
}


def _is_meaningful_anchor(text: str) -> bool:
    """Returns True if anchor text carries genuine topical signal."""
    words = re.findall(r"[a-z]{3,}", text.lower())
    return any(w not in _STOP_WORDS for w in words)


def _normalise_url(href: str, base_url: str) -> str:
    """Resolve relative URLs against base for self-link detection."""
    try:
        return urllib.parse.urljoin(base_url, href).rstrip("/").split("?")[0].split("#")[0]
    except Exception:
        return href


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
            "No internal links found — crawler cannot discover other pages from here.",
            "Add contextual internal links to related content and key site sections.",
            impact="High", effort="Medium"))
    elif ic < 5:
        f.append(Finding("Interlinking", "Internal links", Severity.WARNING,
            f"Only {ic} internal link(s) — very thin link structure.",
            "Aim for 10–15 contextual internal links on content pages; "
            "link to category pages, related posts, and pillar content.",
            impact="High", effort="Medium"))
    else:
        f.append(Finding("Interlinking", "Internal links", Severity.PASS,
            f"{ic} internal links, {len(external)} external links."))

    # ── Self-referential links (linking to own page) ──────────────────────────
    page_url_norm = _normalise_url(page.url, page.url)
    self_links = [
        l for l in internal
        if _normalise_url(l["href"], page.url) == page_url_norm
    ]
    if self_links:
        f.append(Finding("Interlinking", "Self-referential links", Severity.CRITICAL,
            f"{len(self_links)} link(s) point back to this same page — "
            "wasted crawl budget and diluted PageRank.",
            "Remove self-links from navigation/body; they add no SEO or UX value.",
            impact="High", effort="Quick Win"))
    else:
        f.append(Finding("Interlinking", "Self-referential links", Severity.PASS,
            "No self-referential links detected."))

    # ── Anchor text quality ───────────────────────────────────────────────────
    anchor_texts = [l["text"].lower().strip() for l in internal if l["text"].strip()]

    # Generic / meaningless anchors
    generic = [t for t in anchor_texts if t in _MEANINGLESS_ANCHORS]
    if generic:
        examples = list(dict.fromkeys(generic))[:4]
        f.append(Finding("Interlinking", "Generic anchor text", Severity.CRITICAL,
            f"{len(generic)} internal link(s) use meaningless anchor text "
            f"(e.g. '{examples[0]}'). These pass zero topical signal to Google.",
            "Replace with descriptive, keyword-relevant anchor text that tells both "
            "users and crawlers what the destination page covers.",
            impact="High", effort="Medium"))
    else:
        f.append(Finding("Interlinking", "Generic anchor text", Severity.PASS,
            "No obviously generic anchor text (click here / read more / here) detected."))

    # Topically empty anchors (not in denylist, but still carry no keyword signal)
    topically_empty = [
        t for t in anchor_texts
        if t not in _MEANINGLESS_ANCHORS and not _is_meaningful_anchor(t)
    ]
    if topically_empty:
        examples = list(dict.fromkeys(topically_empty))[:3]
        f.append(Finding("Interlinking", "Topically empty anchors", Severity.INFO,
            f"{len(topically_empty)} anchor(s) contain only stop-words or very short tokens "
            f"(e.g. '{examples[0]}') — no keyword signal passed to the target page.",
            "Rewrite to include at least one descriptive keyword from the destination page's topic.",
            impact="Low", effort="Medium"))

    # Very short anchors (≤2 chars = icon-only or single character)
    very_short = [t for t in anchor_texts if len(t) <= 2]
    if very_short:
        f.append(Finding("Interlinking", "Very short anchor text", Severity.INFO,
            f"{len(very_short)} link(s) have anchor text ≤2 characters — no semantic value.",
            "Replace icon-only or single-char links with descriptive text or add aria-label.",
            impact="Low", effort="Quick Win"))

    # Over-repeated anchors pointing to (potentially) different destinations
    if anchor_texts:
        anchor_counter = Counter(anchor_texts)
        repeated = {
            a: c for a, c in anchor_counter.items()
            if c >= 3 and a not in _MEANINGLESS_ANCHORS and _is_meaningful_anchor(a)
        }
        if repeated:
            examples = sorted(repeated, key=repeated.get, reverse=True)[:3]
            examples_str = ", ".join('"' + e + '"' for e in examples)
            f.append(Finding("Interlinking", "Over-repeated anchor text", Severity.INFO,
                f"Anchor(s) used 3+ times across different links: {examples_str}.",
                "Vary anchor text for links to different destinations — "
                "identical anchors across multiple links dilute topical signals.",
                impact="Low", effort="Medium"))

    # ── Empty anchor text ─────────────────────────────────────────────────────
    empty = [l for l in links if not l["text"].strip()]
    if empty:
        f.append(Finding("Interlinking", "Empty anchor text", Severity.CRITICAL,
            f"{len(empty)} link(s) have no visible anchor text — "
            "invisible to screen readers and passed over by crawlers.",
            "Add descriptive text or an aria-label to all links.",
            impact="High", effort="Quick Win"))
    else:
        f.append(Finding("Interlinking", "Empty anchor text", Severity.PASS,
            "All links have anchor text."))

    # ── Link density ──────────────────────────────────────────────────────────
    body = page.soup.find("body")
    word_count = len(body.get_text(separator=" ", strip=True).split()) if body else 0
    if word_count > 200 and ic > 0:
        density = round(ic / word_count * 100, 1)
        if density > 3.0:
            f.append(Finding("Interlinking", "Internal link density", Severity.WARNING,
                f"High link density: {density}% ({ic} links per {word_count} words). "
                "Over-linked pages look spammy and dilute PageRank per link.",
                "Keep contextual link density below ~2% of word count on content pages.",
                impact="Medium", effort="Medium"))
        elif density < 0.3 and word_count > 600:
            f.append(Finding("Interlinking", "Internal link density", Severity.INFO,
                f"Low link density ({density}%) for a {word_count}-word page. "
                "Long-form content pages should link out to related pages contextually.",
                "Add 5–10 contextual internal links within the body content.",
                impact="Medium", effort="Medium"))

    # ── Breadcrumbs ───────────────────────────────────────────────────────────
    breadcrumb_schema = any('"BreadcrumbList"' in s for s in page.structured_data)
    breadcrumb_nav = (
        page.soup.find(["nav", "ol", "ul"],
            attrs={"aria-label": lambda v: v and "breadcrumb" in v.lower()})
        or page.soup.find(attrs={"class": lambda v: v and "breadcrumb" in " ".join(v).lower()})
    )
    if not breadcrumb_schema and not breadcrumb_nav:
        f.append(Finding("Interlinking", "Breadcrumb navigation", Severity.WARNING,
            "No breadcrumb nav or BreadcrumbList schema found.",
            "Add breadcrumbs with BreadcrumbList JSON-LD — displays category path in SERPs "
            "and reduces effective crawl depth for deep pages.",
            impact="Medium", effort="Medium"))
    else:
        extra = " + BreadcrumbList schema" if breadcrumb_schema else ""
        f.append(Finding("Interlinking", "Breadcrumb navigation", Severity.PASS,
            f"Breadcrumb navigation present{extra}."))

    # ── Navigation <nav> element ──────────────────────────────────────────────
    nav_tags = page.soup.find_all("nav")
    if not nav_tags:
        f.append(Finding("Interlinking", "Navigation <nav> element", Severity.WARNING,
            "No <nav> HTML5 element found — primary navigation lacks semantic markup.",
            "Wrap primary navigation in a <nav> tag for accessibility and Googlebot clarity.",
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
            f"{len(nf_internal)} internal link(s) carry rel=nofollow — "
            "blocking PageRank flow to your own pages.",
            "Remove nofollow from internal links unless deliberately restricting equity flow "
            "(e.g. login/cart/privacy pages).",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Interlinking", "Nofollow on internal links", Severity.PASS,
            "No unnecessary nofollow on internal links."))

    # ── External link hygiene ─────────────────────────────────────────────────
    ext_no_rel = [l for l in external if not l["rel"]]
    if len(ext_no_rel) > 5:
        f.append(Finding("Interlinking", "External link attributes", Severity.INFO,
            f"{len(ext_no_rel)} external link(s) have no rel attribute.",
            "Add rel='nofollow ugc' to user-generated links and rel='sponsored' to paid/affiliate links.",
            impact="Low", effort="Quick Win"))

    return report
