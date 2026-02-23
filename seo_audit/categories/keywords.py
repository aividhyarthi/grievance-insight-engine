"""
keywords.py — Keyword Research / Usage checks.
Covers: primary keyword in title/H1/meta, keyword density, keyword in URL,
        H2 keyword coverage, top keyword visibility in findings,
        semantic diversity, LSI depth, secondary keyword in meta.
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
    "also","just","very","can","get","got","use","used","make","made",
    "about","more","than","then","when","what","which","who","how","all",
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
        description="Keyword presence, density, semantic coverage, and H2-level topical signals.",
    )
    f = report.findings

    body = page.soup.find("body")
    body_text = body.get_text(separator=" ", strip=True) if body else ""

    if not body_text:
        f.append(Finding("Keywords", "Keyword analysis", Severity.CRITICAL,
            "No body text to analyse.",
            impact="High", effort="Medium"))
        return report

    # ── Top keywords — surfaced as a finding so user can validate ────────────
    top_kw = _extract_keywords(body_text)
    if not top_kw:
        f.append(Finding("Keywords", "Keyword extraction", Severity.WARNING,
            "Could not extract meaningful keywords from page content.",
            impact="High", effort="Medium"))
        return report

    top_display = ", ".join(f"{w} ({c}×)" for w, c in top_kw[:8])
    f.append(Finding("Keywords", "Detected top keywords", Severity.INFO,
        f"Most frequent meaningful terms: {top_display}.",
        "Verify these reflect the page's intended topic. If the wrong keyword dominates, "
        "rebalance the content to foreground the target term.",
        impact="High", effort="Medium"))

    primary_kw, _primary_count = top_kw[0]
    secondary_kw = top_kw[1][0] if len(top_kw) > 1 else None

    # Store in notes for other modules / reports
    report.notes = "Top keywords: " + ", ".join(f"{w}({c})" for w, c in top_kw[:10])

    # ── Primary keyword in title ──────────────────────────────────────────────
    title = page.title.lower()
    if primary_kw in title:
        # Extra signal: keyword near start of title is stronger
        title_words = title.split()
        pos = next((i for i, w in enumerate(title_words) if primary_kw in w), len(title_words))
        position_note = " (near start — strong signal)" if pos < 3 else " (towards end — move earlier if possible)"
        f.append(Finding("Keywords", "Primary keyword in title", Severity.PASS,
            f"'{primary_kw}' present in title{position_note}."))
    else:
        f.append(Finding("Keywords", "Primary keyword in title", Severity.WARNING,
            f"Primary keyword '{primary_kw}' not found in title tag.",
            "Include the primary keyword within the first 3 words of the title for maximum signal.",
            impact="High", effort="Quick Win"))

    # ── Primary keyword in H1 ─────────────────────────────────────────────────
    h1_text = " ".join(page.h1_tags).lower()
    if primary_kw in h1_text:
        f.append(Finding("Keywords", "Primary keyword in H1", Severity.PASS,
            f"'{primary_kw}' found in H1."))
    else:
        f.append(Finding("Keywords", "Primary keyword in H1", Severity.WARNING,
            f"'{primary_kw}' not in H1.",
            "Include primary keyword in H1 — it's the strongest on-page relevance signal after title.",
            impact="High", effort="Quick Win"))

    # ── Primary keyword in meta description ──────────────────────────────────
    meta = page.meta_description.lower()
    if primary_kw in meta:
        f.append(Finding("Keywords", "Keyword in meta description", Severity.PASS,
            f"'{primary_kw}' in meta description — Google may bold it in SERPs."))
    else:
        f.append(Finding("Keywords", "Keyword in meta description", Severity.INFO,
            f"'{primary_kw}' absent from meta description.",
            "Naturally include the primary keyword in the meta description — Google may bold it for matched queries.",
            impact="Medium", effort="Quick Win"))

    # ── Secondary keyword in meta description ────────────────────────────────
    if secondary_kw and secondary_kw not in meta and primary_kw in meta:
        f.append(Finding("Keywords", "Secondary keyword in meta description", Severity.INFO,
            f"Secondary keyword '{secondary_kw}' not in meta description.",
            "Including a secondary keyword in the meta description widens the query surface "
            "without extra effort.",
            impact="Low", effort="Quick Win"))

    # ── Keyword density ───────────────────────────────────────────────────────
    density = _density(primary_kw, body_text)
    if density < 0.5:
        f.append(Finding("Keywords", "Keyword density", Severity.WARNING,
            f"'{primary_kw}' density: {density}% (below 0.5%). "
            "Under-optimised — Google may not associate this page strongly with the term.",
            "Increase natural usage; try including it in headings, intro, and conclusion.",
            impact="Medium", effort="Medium"))
    elif density > 3.0:
        f.append(Finding("Keywords", "Keyword density", Severity.WARNING,
            f"'{primary_kw}' density: {density}% — possible keyword stuffing. "
            "Over-repetition can trigger Google quality filters.",
            "Reduce repetition; replace some instances with synonyms and related terms.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Keywords", "Keyword density", Severity.PASS,
            f"'{primary_kw}' density: {density}% — within the healthy 0.5–3% range."))

    # ── Keyword in URL ────────────────────────────────────────────────────────
    url_lower = page.url.lower()
    kw_slug = primary_kw.replace(" ", "-")
    if primary_kw in url_lower or kw_slug in url_lower:
        f.append(Finding("Keywords", "Keyword in URL", Severity.PASS,
            f"'{primary_kw}' present in URL slug."))
    else:
        # Check if any top-3 keyword appears in URL
        alt_in_url = [kw for kw, _ in top_kw[1:4] if kw in url_lower or kw.replace(" ", "-") in url_lower]
        if alt_in_url:
            f.append(Finding("Keywords", "Keyword in URL", Severity.INFO,
                f"Primary keyword '{primary_kw}' not in URL, but '{alt_in_url[0]}' is.",
                "Ideally the URL slug matches the primary keyword exactly — consider this for new pages.",
                impact="Low", effort="Long-term"))
        else:
            f.append(Finding("Keywords", "Keyword in URL", Severity.INFO,
                f"No top keyword found in URL slug.",
                "Include the primary keyword in the URL path for cleaner relevance signals.",
                impact="Medium", effort="Long-term"))

    # ── H2 keyword coverage ────────────────────────────────────────────────────
    h2_text = " ".join(page.h2_tags).lower()
    top5_kws = [kw for kw, _ in top_kw[:5]]
    kws_in_h2 = [kw for kw in top5_kws if kw in h2_text]

    if not h2_text:
        f.append(Finding("Keywords", "H2 keyword coverage", Severity.WARNING,
            "No H2 tags found — missing topical signal across page sections.",
            "Add H2 subheadings that incorporate secondary keywords and related terms.",
            impact="Medium", effort="Quick Win"))
    elif not kws_in_h2:
        f.append(Finding("Keywords", "H2 keyword coverage", Severity.WARNING,
            f"None of the top 5 keywords ({', '.join(top5_kws)}) appear in any H2 heading.",
            "Include key topical terms in H2 headings — they tell Google what each section covers.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Keywords", "H2 keyword coverage", Severity.PASS,
            f"H2 headings contain: {', '.join(kws_in_h2)} — good topical signal across sections."))

    # ── Keyword in first 100 words ────────────────────────────────────────────
    first_100 = " ".join(body_text.split()[:100]).lower()
    if primary_kw in first_100:
        f.append(Finding("Keywords", "Keyword in opening content", Severity.PASS,
            f"'{primary_kw}' appears in first 100 words — strong relevance signal."))
    else:
        f.append(Finding("Keywords", "Keyword in opening content", Severity.INFO,
            f"'{primary_kw}' not in first 100 words.",
            "Front-load the primary keyword near the top of the body — "
            "Google weights early-document signals more heavily.",
            impact="Medium", effort="Quick Win"))

    # ── Semantic / LSI keyword diversity ─────────────────────────────────────
    vocab_size = len(set(re.findall(r"[a-z]{4,}", body_text.lower())))
    word_count = len(body_text.split())
    # Adjust threshold by content length
    vocab_threshold = 80 + max(0, (word_count - 400) // 50)
    if vocab_size < vocab_threshold:
        f.append(Finding("Keywords", "Semantic keyword diversity", Severity.WARNING,
            f"Limited vocabulary ({vocab_size} unique meaningful words). "
            "Topical authority depends on covering a topic's full semantic field.",
            "Expand content with LSI/related terms: use Answer The Public or Google's 'People Also Ask' "
            "to find related concepts to cover.",
            impact="Medium", effort="Long-term"))
    else:
        f.append(Finding("Keywords", "Semantic keyword diversity", Severity.PASS,
            f"Good vocabulary depth ({vocab_size} unique meaningful words)."))

    return report
