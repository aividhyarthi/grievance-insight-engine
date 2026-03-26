"""
urlquality.py — URL Structure & Quality checks.
Covers: underscores vs hyphens, mixed case, URL length, non-ASCII characters,
        spaces in paths, double slashes, URL depth, session IDs / excessive
        query parameters, and trailing-slash consistency with canonical.

Sources: Cars24 SEO Checklist (URL STRUCTURE section), SEO Automation
         Checklist CARS24 (URL Structure category).
"""

from __future__ import annotations

import re
import urllib.parse as _up

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData

# Session-like parameter names that create crawl budget disasters
_SESSION_PARAM_RE = re.compile(
    r"(session|sid|ssid|phpsessid|jsessionid|token|auth|csrf|nonce)", re.I
)


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="URL Quality",
        description="URL structure signals that affect crawlability, duplicate content, and rankings.",
    )
    f = report.findings

    url = page.url
    parsed = _up.urlparse(url)
    path = parsed.path  # e.g. /used-cars/mumbai/

    # ── Underscores in URL path ───────────────────────────────────────────────
    if "_" in path:
        f.append(Finding("URL Quality", "Underscores in URL", Severity.WARNING,
            f"URL path uses underscores: '{path}'. "
            "Google treats underscores as word-joiners — 'used_cars' is read as one "
            "compound word 'usedcars', losing keyword signal for both 'used' and 'cars'.",
            "Replace all underscores with hyphens: /used-cars-dubai/ not /used_cars_dubai/",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("URL Quality", "URL word separators", Severity.PASS,
            "No underscores in URL path — hyphens used correctly."))

    # ── Mixed / uppercase letters ─────────────────────────────────────────────
    if path != path.lower():
        f.append(Finding("URL Quality", "Mixed-case URL", Severity.WARNING,
            f"URL contains uppercase letters: '{path}'. "
            "Uppercase creates duplicate pages — '/Products/' and '/products/' "
            "are different URLs to crawlers and split link equity.",
            "Enforce lowercase URLs at the server level (301 redirect uppercase → lowercase).",
            impact="High", effort="Quick Win"))
    else:
        f.append(Finding("URL Quality", "URL case", Severity.PASS,
            "URL is all-lowercase — no mixed-case duplicate risk."))

    # ── URL total length ──────────────────────────────────────────────────────
    url_len = len(url)
    if url_len > 115:
        f.append(Finding("URL Quality", "URL too long", Severity.WARNING,
            f"URL is {url_len} characters — exceeds the 115-char guideline. "
            "Long URLs get truncated in SERPs, are hard to share, and usually "
            "indicate unnecessarily deep site architecture.",
            "Flatten the URL structure and use short, keyword-rich slugs (target ≤75 chars).",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("URL Quality", "URL length", Severity.PASS,
            f"URL length is {url_len} characters — within best practice limits."))

    # ── Non-ASCII characters in URL path ─────────────────────────────────────
    has_non_ascii = False
    try:
        path.encode("ascii")
    except UnicodeEncodeError:
        has_non_ascii = True
    # Also catch percent-encoded multi-byte sequences (%C3%A9, %D8%AF, etc.)
    if not has_non_ascii and re.search(r"%[89A-Fa-f][0-9A-Fa-f]", path):
        has_non_ascii = True

    if has_non_ascii:
        f.append(Finding("URL Quality", "Non-ASCII characters in URL", Severity.WARNING,
            f"URL path contains non-ASCII or percent-encoded multi-byte characters. "
            "These appear as garbled text in SERPs and social shares, and can cause "
            "indexing inconsistencies with some crawlers.",
            "Use transliterated ASCII slugs: /dubai-used-cars/ instead of /دبي-سيارات/",
            impact="Medium", effort="Medium"))

    # ── Spaces in URL path ────────────────────────────────────────────────────
    if "%20" in path or ("+") in path:
        f.append(Finding("URL Quality", "Spaces in URL path", Severity.CRITICAL,
            f"URL path contains encoded spaces (%20 or +): '{path}'. "
            "Spaces indicate slugs were not properly created — they break copy-paste "
            "sharing and signal poor technical setup.",
            "Replace spaces with hyphens at the slug generation level.",
            impact="High", effort="Quick Win"))

    # ── Double slashes in path ────────────────────────────────────────────────
    if "//" in path:
        f.append(Finding("URL Quality", "Double slashes in URL", Severity.WARNING,
            f"URL path contains double slashes: '{path}'. "
            "Double slashes create URL variants and indicate a routing/CMS bug.",
            "Fix the URL routing rule so no path contains //. "
            "Redirect existing double-slash URLs to single-slash versions.",
            impact="Medium", effort="Quick Win"))

    # ── URL path depth ────────────────────────────────────────────────────────
    segments = [s for s in path.split("/") if s]
    depth = len(segments)
    if depth > 5:
        f.append(Finding("URL Quality", "Deep URL structure", Severity.WARNING,
            f"URL has {depth} path segments: '{path}'. "
            "Pages buried deep in the site architecture receive less PageRank from "
            "the homepage and are crawled less frequently by Googlebot.",
            "Flatten site hierarchy. Important pages should be reachable in ≤4 clicks "
            "from the homepage and have ≤4 path segments.",
            impact="Medium", effort="Long-term"))
    elif depth > 0:
        f.append(Finding("URL Quality", "URL depth", Severity.PASS,
            f"URL depth is {depth} path segment(s) — within the recommended 4-level limit."))

    # ── Session IDs and excessive query parameters ────────────────────────────
    qs = parsed.query
    if qs:
        params = _up.parse_qs(qs)
        session_params = [k for k in params if _SESSION_PARAM_RE.search(k)]
        if session_params:
            f.append(Finding("URL Quality", "Session ID in URL", Severity.CRITICAL,
                f"URL contains session/token parameter(s): {session_params}. "
                "Session parameters generate millions of unique duplicate pages, "
                "destroying crawl budget and triggering duplicate content penalties.",
                "Store sessions in cookies only. Block session parameter URLs in robots.txt "
                "and add a canonical tag pointing to the clean parameter-free URL.",
                impact="High", effort="Medium"))
        elif len(params) > 3:
            f.append(Finding("URL Quality", "Excessive query parameters", Severity.WARNING,
                f"URL has {len(params)} query parameters: {list(params.keys())}. "
                "Parameter-heavy URLs from filters and facets can create thousands of "
                "near-duplicate pages that dilute crawl budget.",
                "Add a canonical tag on filter/facet pages pointing to the base category URL. "
                "Block parameter URLs from crawlers via robots.txt where appropriate.",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("URL Quality", "Query parameters", Severity.INFO,
                f"URL has {len(params)} query parameter(s): {list(params.keys())}. "
                "Ensure a self-referencing canonical tag is set to the preferred URL.",
                impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("URL Quality", "URL cleanliness", Severity.PASS,
            "Clean URL — no query parameters."))

    # ── Trailing slash vs canonical consistency ───────────────────────────────
    canonical = page.canonical_url
    if canonical and path:
        url_has_slash = path.endswith("/")
        cp = _up.urlparse(canonical).path
        canon_has_slash = cp.endswith("/")
        if url_has_slash != canon_has_slash and cp not in ("", "/"):
            f.append(Finding("URL Quality", "Trailing slash inconsistency", Severity.INFO,
                f"URL {'has' if url_has_slash else 'lacks'} a trailing slash but the canonical "
                f"{'lacks' if url_has_slash else 'has'} one. "
                "This creates two indexable versions of every page.",
                "Pick one convention (trailing slash or no slash) and apply it everywhere. "
                "Redirect the non-canonical form via 301.",
                impact="Medium", effort="Quick Win"))

    return report
