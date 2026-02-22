"""
analyzer.py — Rule-based SEO checks that produce structured findings.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

from .crawler import PageData


class Severity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"
    PASS = "pass"


@dataclass
class Finding:
    category: str
    check: str
    severity: Severity
    detail: str
    recommendation: Optional[str] = None


@dataclass
class SEOReport:
    url: str
    status_code: int
    load_time_ms: float
    findings: list[Finding] = field(default_factory=list)
    score: int = 0           # 0–100, computed after checks
    ai_insights: str = ""    # populated by ai_insights module

    @property
    def critical_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.CRITICAL)

    @property
    def warning_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.WARNING)

    @property
    def pass_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.PASS)

    def compute_score(self) -> int:
        """
        Simple weighted score:
          - Each CRITICAL deducts 15 pts
          - Each WARNING  deducts  5 pts
          - Floor at 0
        """
        base = 100
        base -= self.critical_count * 15
        base -= self.warning_count * 5
        self.score = max(0, base)
        return self.score


# ─── individual check helpers ─────────────────────────────────────────────────

def _check_title(page: PageData) -> list[Finding]:
    findings = []
    title = page.title
    if not title:
        findings.append(Finding(
            category="Title Tag",
            check="Title presence",
            severity=Severity.CRITICAL,
            detail="Page has no <title> tag.",
            recommendation="Add a descriptive <title> tag (50–60 characters).",
        ))
    elif len(title) < 30:
        findings.append(Finding(
            category="Title Tag",
            check="Title length",
            severity=Severity.WARNING,
            detail=f"Title is too short ({len(title)} chars): "{title}"",
            recommendation="Expand the title to 50–60 characters for better SERP display.",
        ))
    elif len(title) > 60:
        findings.append(Finding(
            category="Title Tag",
            check="Title length",
            severity=Severity.WARNING,
            detail=f"Title is too long ({len(title)} chars): "{title}"",
            recommendation="Shorten the title to under 60 characters to avoid truncation.",
        ))
    else:
        findings.append(Finding(
            category="Title Tag",
            check="Title length",
            severity=Severity.PASS,
            detail=f"Title length OK ({len(title)} chars).",
        ))
    return findings


def _check_meta_description(page: PageData) -> list[Finding]:
    findings = []
    desc = page.meta_description
    if not desc:
        findings.append(Finding(
            category="Meta Description",
            check="Description presence",
            severity=Severity.CRITICAL,
            detail="No meta description found.",
            recommendation="Add a meta description of 150–160 characters summarising the page.",
        ))
    elif len(desc) < 70:
        findings.append(Finding(
            category="Meta Description",
            check="Description length",
            severity=Severity.WARNING,
            detail=f"Meta description too short ({len(desc)} chars).",
            recommendation="Expand to 150–160 characters to improve CTR.",
        ))
    elif len(desc) > 160:
        findings.append(Finding(
            category="Meta Description",
            check="Description length",
            severity=Severity.WARNING,
            detail=f"Meta description too long ({len(desc)} chars) — will be truncated in SERPs.",
            recommendation="Shorten to under 160 characters.",
        ))
    else:
        findings.append(Finding(
            category="Meta Description",
            check="Description length",
            severity=Severity.PASS,
            detail=f"Meta description length OK ({len(desc)} chars).",
        ))
    return findings


def _check_headings(page: PageData) -> list[Finding]:
    findings = []
    h1s = page.h1_tags
    if not h1s:
        findings.append(Finding(
            category="Headings",
            check="H1 presence",
            severity=Severity.CRITICAL,
            detail="No <h1> tag found on the page.",
            recommendation="Add exactly one descriptive <h1> tag.",
        ))
    elif len(h1s) > 1:
        findings.append(Finding(
            category="Headings",
            check="H1 uniqueness",
            severity=Severity.WARNING,
            detail=f"Multiple <h1> tags found ({len(h1s)}): {h1s}",
            recommendation="Use only one <h1> per page.",
        ))
    else:
        findings.append(Finding(
            category="Headings",
            check="H1 presence",
            severity=Severity.PASS,
            detail=f"Single <h1> found: "{h1s[0]}"",
        ))

    if not page.h2_tags:
        findings.append(Finding(
            category="Headings",
            check="H2 presence",
            severity=Severity.WARNING,
            detail="No <h2> tags found.",
            recommendation="Use <h2> tags to structure page sections.",
        ))
    else:
        findings.append(Finding(
            category="Headings",
            check="H2 presence",
            severity=Severity.PASS,
            detail=f"{len(page.h2_tags)} <h2> tag(s) found.",
        ))
    return findings


def _check_images(page: PageData) -> list[Finding]:
    findings = []
    images = page.images
    missing_alt = [img for img in images if not img["alt"]]
    no_lazy = [img for img in images if img["loading"] not in ("lazy", "eager")]

    if images:
        if missing_alt:
            findings.append(Finding(
                category="Images",
                check="Alt text",
                severity=Severity.CRITICAL,
                detail=f"{len(missing_alt)} image(s) missing alt text.",
                recommendation="Add descriptive alt attributes to all images for accessibility and SEO.",
            ))
        else:
            findings.append(Finding(
                category="Images",
                check="Alt text",
                severity=Severity.PASS,
                detail=f"All {len(images)} image(s) have alt text.",
            ))

        if no_lazy:
            findings.append(Finding(
                category="Images",
                check="Lazy loading",
                severity=Severity.INFO,
                detail=f"{len(no_lazy)} image(s) without explicit loading attribute.",
                recommendation="Add loading=\"lazy\" to below-the-fold images to improve page speed.",
            ))
    else:
        findings.append(Finding(
            category="Images",
            check="Images",
            severity=Severity.INFO,
            detail="No images found on the page.",
        ))
    return findings


def _check_links(page: PageData) -> list[Finding]:
    findings = []
    links = page.links
    internal = [l for l in links if l["internal"]]
    external = [l for l in links if not l["internal"]]
    no_follow_ext = [l for l in external if "nofollow" not in l["rel"]]
    empty_text = [l for l in links if not l["text"]]

    findings.append(Finding(
        category="Links",
        check="Internal links",
        severity=Severity.PASS if internal else Severity.WARNING,
        detail=f"{len(internal)} internal link(s), {len(external)} external link(s).",
        recommendation=None if internal else "Add internal links to improve crawlability.",
    ))

    if empty_text:
        findings.append(Finding(
            category="Links",
            check="Anchor text",
            severity=Severity.WARNING,
            detail=f"{len(empty_text)} link(s) have empty anchor text.",
            recommendation="Ensure all links have descriptive anchor text.",
        ))
    else:
        findings.append(Finding(
            category="Links",
            check="Anchor text",
            severity=Severity.PASS,
            detail="All links have anchor text.",
        ))
    return findings


def _check_performance(page: PageData) -> list[Finding]:
    findings = []
    ms = page.load_time_ms

    if ms == 0:
        return findings  # page fetch failed, skip

    if ms < 1000:
        sev = Severity.PASS
        note = f"Fast load time ({ms} ms)."
    elif ms < 3000:
        sev = Severity.WARNING
        note = f"Moderate load time ({ms} ms). Target < 1 s."
    else:
        sev = Severity.CRITICAL
        note = f"Slow load time ({ms} ms). This hurts Core Web Vitals."

    findings.append(Finding(
        category="Performance",
        check="Server response time",
        severity=sev,
        detail=note,
        recommendation=(
            "Reduce TTFB by enabling caching, CDN, and server-side optimisations."
            if sev != Severity.PASS else None
        ),
    ))
    return findings


def _check_https(page: PageData) -> list[Finding]:
    if page.url.startswith("https://"):
        return [Finding(
            category="Security",
            check="HTTPS",
            severity=Severity.PASS,
            detail="Page is served over HTTPS.",
        )]
    return [Finding(
        category="Security",
        check="HTTPS",
        severity=Severity.CRITICAL,
        detail="Page is NOT served over HTTPS.",
        recommendation="Obtain an SSL certificate and redirect all HTTP traffic to HTTPS.",
    )]


def _check_canonical(page: PageData) -> list[Finding]:
    canon = page.canonical_url
    if not canon:
        return [Finding(
            category="Canonicalization",
            check="Canonical URL",
            severity=Severity.WARNING,
            detail="No canonical <link> tag found.",
            recommendation="Add <link rel=\"canonical\" href=\"...\"> to avoid duplicate content issues.",
        )]
    return [Finding(
        category="Canonicalization",
        check="Canonical URL",
        severity=Severity.PASS,
        detail=f"Canonical URL set: {canon}",
    )]


def _check_open_graph(page: PageData) -> list[Finding]:
    og = page.open_graph
    required = ["og:title", "og:description", "og:image", "og:url"]
    missing = [k for k in required if k not in og]
    if missing:
        return [Finding(
            category="Social / Open Graph",
            check="Open Graph tags",
            severity=Severity.WARNING,
            detail=f"Missing OG tags: {', '.join(missing)}",
            recommendation="Add complete Open Graph meta tags for better social sharing previews.",
        )]
    return [Finding(
        category="Social / Open Graph",
        check="Open Graph tags",
        severity=Severity.PASS,
        detail="All core Open Graph tags present.",
    )]


def _check_structured_data(page: PageData) -> list[Finding]:
    schemas = page.structured_data
    if not schemas:
        return [Finding(
            category="Structured Data",
            check="JSON-LD Schema",
            severity=Severity.INFO,
            detail="No JSON-LD structured data found.",
            recommendation="Add Schema.org markup (e.g. Organization, Article, BreadcrumbList) to enable rich results.",
        )]
    return [Finding(
        category="Structured Data",
        check="JSON-LD Schema",
        severity=Severity.PASS,
        detail=f"{len(schemas)} JSON-LD block(s) detected.",
    )]


def _check_content(page: PageData) -> list[Finding]:
    wc = page.word_count
    if wc == 0:
        return [Finding(
            category="Content",
            check="Word count",
            severity=Severity.CRITICAL,
            detail="No body text detected.",
            recommendation="Ensure the page has readable content for search engines to index.",
        )]
    elif wc < 300:
        return [Finding(
            category="Content",
            check="Word count",
            severity=Severity.WARNING,
            detail=f"Low word count ({wc} words). Thin content may rank poorly.",
            recommendation="Expand content to at least 300 words.",
        )]
    return [Finding(
        category="Content",
        check="Word count",
        severity=Severity.PASS,
        detail=f"Word count OK ({wc} words).",
    )]


def _check_lang(page: PageData) -> list[Finding]:
    lang = page.lang
    if not lang:
        return [Finding(
            category="Accessibility / Internationalisation",
            check="HTML lang attribute",
            severity=Severity.WARNING,
            detail="<html> tag is missing a lang attribute.",
            recommendation="Add lang=\"en\" (or appropriate language code) to the <html> element.",
        )]
    return [Finding(
        category="Accessibility / Internationalisation",
        check="HTML lang attribute",
        severity=Severity.PASS,
        detail=f"HTML lang set to \"{lang}\".",
    )]


def _check_robots(page: PageData) -> list[Finding]:
    robots = page.robots_meta.lower()
    if "noindex" in robots:
        return [Finding(
            category="Indexability",
            check="Robots meta tag",
            severity=Severity.CRITICAL,
            detail=f"Page has robots meta: \"{page.robots_meta}\" — it will NOT be indexed.",
            recommendation="Remove noindex directive if you want this page to appear in search results.",
        )]
    return [Finding(
        category="Indexability",
        check="Robots meta tag",
        severity=Severity.PASS,
        detail=f"Robots meta: \"{page.robots_meta or 'not set (defaults to index, follow)'}\"",
    )]


def _check_status(page: PageData) -> list[Finding]:
    if page.error:
        return [Finding(
            category="Reachability",
            check="HTTP status",
            severity=Severity.CRITICAL,
            detail=f"Page could not be fetched: {page.error}",
            recommendation="Ensure the URL is publicly reachable.",
        )]
    code = page.status_code
    if 200 <= code < 300:
        sev = Severity.PASS
        detail = f"HTTP {code} — page is reachable."
    elif 300 <= code < 400:
        sev = Severity.INFO
        detail = f"HTTP {code} redirect."
    elif code in (404, 410):
        sev = Severity.CRITICAL
        detail = f"HTTP {code} — page not found."
    else:
        sev = Severity.WARNING
        detail = f"Unexpected HTTP status: {code}"

    return [Finding(
        category="Reachability",
        check="HTTP status",
        severity=sev,
        detail=detail,
    )]


# ─── main entry point ─────────────────────────────────────────────────────────

CHECKS = [
    _check_status,
    _check_https,
    _check_title,
    _check_meta_description,
    _check_headings,
    _check_images,
    _check_links,
    _check_performance,
    _check_canonical,
    _check_open_graph,
    _check_structured_data,
    _check_content,
    _check_lang,
    _check_robots,
]


def analyze(page: PageData) -> SEOReport:
    """Run all SEO checks against *page* and return a scored :class:`SEOReport`."""
    report = SEOReport(
        url=page.url,
        status_code=page.status_code,
        load_time_ms=page.load_time_ms,
    )
    for check_fn in CHECKS:
        report.findings.extend(check_fn(page))
    report.compute_score()
    return report
