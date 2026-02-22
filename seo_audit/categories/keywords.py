"""
keywords.py — Keyword Research / Usage checks.
Covers: primary keyword in title/H1/meta, keyword density, keyword in URL,
        LSI/semantic diversity, keyword stuffing detection.
"""

from __future__ import annotations

import re
from collections import Counter

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


_STOP_WORDS = {
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "by","from","is","was","are","were","be","been","being","have","has",
    "had","do","does","did","will","would","could","should","may","might",
    "this","that","these","those","it","its","we","our","you","your",
    "they","their","he","she","his","her","as","if","so","not","no","up",
}


def _extract_keywords(text: str, top_n: int = 20) -> list[tuple[str, int]]:
    words = re.findall(r"[a-z]{3,}", text.lower())
    meaningful = [w for w in words if w not in _STOP_WORDS]
    return Counter(meaningful).most_common(top_n)


def _density(word: str, text: str) -> float:
    total = len(text.split())
    if total == 0:
        return 0.0
    count = len(re.findall(rf"\b{re.escape(word)}\b", text, re.I))
    return round(count / total * 100, 2)


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Keyword Research & Usage",
        description="Keyword presence, density, and semantic coverage across the page.",
    )
    f = report.findings

    body = page.soup.find("body")
    body_text = body.get_text(separator=" ", strip=True) if body else ""

    if not body_text:
        f.append(Finding("Keywords", "Keyword analysis", Severity.CRITICAL,
            "No body text to analyse.",
            impact="High", effort="Medium"))
        return report

    # ── Top keywords ──────────────────────────────────────────────────────────
    top_kw = _extract_keywords(body_text)
    report.notes = "Top keywords: " + ", ".join(f"{w}({c})" for w, c in top_kw[:10])

    if not top_kw:
        f.append(Finding("Keywords", "Keyword extraction", Severity.WARNING,
            "Could not extract meaningful keywords from page content.",
            impact="High", effort="Medium"))
        return report

    primary_kw, primary_count = top_kw[0]

    # ── Primary keyword in title ──────────────────────────────────────────────
    title = page.title.lower()
    if primary_kw in title:
        f.append(Finding("Keywords", "Primary keyword in title", Severity.PASS,
            f"Primary keyword '{primary_kw}' present in title."))
    else:
        f.append(Finding("Keywords", "Primary keyword in title", Severity.WARNING,
            f"Primary keyword '{primary_kw}' not found in title tag.",
            "Include primary keyword near the start of the title.",
            impact="High", effort="Quick Win"))

    # ── Primary keyword in H1 ─────────────────────────────────────────────────
    h1_text = " ".join(page.h1_tags).lower()
    if primary_kw in h1_text:
        f.append(Finding("Keywords", "Primary keyword in H1", Severity.PASS,
            f"'{primary_kw}' found in H1."))
    else:
        f.append(Finding("Keywords", "Primary keyword in H1", Severity.WARNING,
            f"'{primary_kw}' not in H1.",
            "Include primary keyword in H1 heading.",
            impact="High", effort="Quick Win"))

    # ── Primary keyword in meta description ──────────────────────────────────
    meta = page.meta_description.lower()
    if primary_kw in meta:
        f.append(Finding("Keywords", "Keyword in meta description", Severity.PASS,
            f"'{primary_kw}' in meta description."))
    else:
        f.append(Finding("Keywords", "Keyword in meta description", Severity.INFO,
            f"'{primary_kw}' absent from meta description.",
            "Naturally include primary keyword in meta description.",
            impact="Medium", effort="Quick Win"))

    # ── Keyword density ───────────────────────────────────────────────────────
    density = _density(primary_kw, body_text)
    if density < 0.5:
        f.append(Finding("Keywords", "Keyword density", Severity.WARNING,
            f"'{primary_kw}' density: {density}% (below 0.5%). Under-optimised.",
            "Use the primary keyword more naturally throughout the content.",
            impact="Medium", effort="Medium"))
    elif density > 3.0:
        f.append(Finding("Keywords", "Keyword density", Severity.WARNING,
            f"'{primary_kw}' density: {density}% — possible keyword stuffing.",
            "Reduce repetition; use synonyms and related terms instead.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Keywords", "Keyword density", Severity.PASS,
            f"'{primary_kw}' density: {density}% — within 0.5–3% target."))

    # ── Keyword in URL ────────────────────────────────────────────────────────
    url_lower = page.url.lower()
    if primary_kw in url_lower or primary_kw.replace(" ", "-") in url_lower:
        f.append(Finding("Keywords", "Keyword in URL", Severity.PASS,
            f"'{primary_kw}' present in URL."))
    else:
        f.append(Finding("Keywords", "Keyword in URL", Severity.INFO,
            f"'{primary_kw}' not in URL slug.",
            "Consider including the primary keyword in the URL path.",
            impact="Medium", effort="Long-term"))

    # ── Semantic / LSI keywords ───────────────────────────────────────────────
    vocab_size = len(set(re.findall(r"[a-z]{4,}", body_text.lower())))
    if vocab_size < 80:
        f.append(Finding("Keywords", "Semantic keyword diversity", Severity.WARNING,
            f"Limited vocabulary ({vocab_size} unique words). Topical authority may be weak.",
            "Expand content with LSI/related terms to cover the topic comprehensively.",
            impact="Medium", effort="Long-term"))
    else:
        f.append(Finding("Keywords", "Semantic keyword diversity", Severity.PASS,
            f"Good vocabulary depth ({vocab_size} unique meaningful words)."))

    # ── Keyword in first 100 words ────────────────────────────────────────────
    first_100 = " ".join(body_text.split()[:100]).lower()
    if primary_kw in first_100:
        f.append(Finding("Keywords", "Keyword in opening content", Severity.PASS,
            f"'{primary_kw}' appears in first 100 words."))
    else:
        f.append(Finding("Keywords", "Keyword in opening content", Severity.INFO,
            f"'{primary_kw}' not in first 100 words.",
            "Front-load the primary keyword near the top of the page content.",
            impact="Medium", effort="Quick Win"))

    return report
