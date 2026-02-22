"""
content.py — SEO Content checks.
Covers: word count, readability signals, content freshness,
        duplicate title/meta, thin content, content-to-code ratio.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def _flesch_kincaid_estimate(text: str) -> float:
    """Rough Flesch Reading Ease estimate (higher = easier, 60–70 is ideal)."""
    sentences = max(1, len(re.split(r"[.!?]+", text)))
    words = text.split()
    if not words:
        return 0.0
    syllables = sum(_count_syllables(w) for w in words)
    avg_sentence_len = len(words) / sentences
    avg_syllables = syllables / len(words)
    score = 206.835 - 1.015 * avg_sentence_len - 84.6 * avg_syllables
    return round(max(0.0, min(100.0, score)), 1)


def _count_syllables(word: str) -> int:
    word = word.lower().strip(".,!?;:'\"")
    vowels = re.findall(r"[aeiouy]+", word)
    return max(1, len(vowels))


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="SEO Content",
        description="Content quality, depth, and readability signals.",
    )
    f = report.findings

    body = page.soup.find("body")
    body_text = body.get_text(separator=" ", strip=True) if body else ""
    words = body_text.split()
    word_count = len(words)

    # ── Word Count ────────────────────────────────────────────────────────────
    if word_count == 0:
        f.append(Finding("Content", "Word count", Severity.CRITICAL,
            "No visible body text detected.",
            "Ensure page has substantive, crawlable content.",
            impact="High", effort="Medium"))
        return report
    elif word_count < 300:
        f.append(Finding("Content", "Word count", Severity.CRITICAL,
            f"Thin content ({word_count} words). Google penalises thin pages.",
            "Expand content to at least 600 words with genuine value.",
            impact="High", effort="Medium"))
    elif word_count < 600:
        f.append(Finding("Content", "Word count", Severity.WARNING,
            f"Below average content depth ({word_count} words).",
            "Aim for 800–1,500 words for informational pages.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Content", "Word count", Severity.PASS,
            f"Good content depth ({word_count} words)."))

    # ── Readability ───────────────────────────────────────────────────────────
    fk = _flesch_kincaid_estimate(body_text[:5000])
    if fk < 40:
        f.append(Finding("Content", "Readability", Severity.WARNING,
            f"Flesch score ~{fk} — content may be too complex for general audiences.",
            "Simplify sentences and avoid jargon where possible.",
            impact="Medium", effort="Long-term"))
    elif fk > 80:
        f.append(Finding("Content", "Readability", Severity.INFO,
            f"Flesch score ~{fk} — content is very easy to read. Ensure depth.",
            impact="Low", effort="Medium"))
    else:
        f.append(Finding("Content", "Readability", Severity.PASS,
            f"Readability score ~{fk} — good balance of clarity and depth."))

    # ── Duplicate Title / Meta ────────────────────────────────────────────────
    title = page.title
    meta_desc = page.meta_description
    if title and meta_desc and title.lower() == meta_desc.lower():
        f.append(Finding("Content", "Title ≠ Meta Description", Severity.WARNING,
            "Title and meta description are identical.",
            "Write distinct, complementary copy for each.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Content", "Title ≠ Meta Description", Severity.PASS,
            "Title and meta description are distinct."))

    # ── Paragraph structure ───────────────────────────────────────────────────
    paragraphs = page.soup.find_all("p")
    if len(paragraphs) < 3:
        f.append(Finding("Content", "Paragraph structure", Severity.WARNING,
            f"Only {len(paragraphs)} <p> tag(s). Content may not be well-structured.",
            "Break content into clear paragraphs using <p> tags.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Content", "Paragraph structure", Severity.PASS,
            f"{len(paragraphs)} paragraphs found."))

    # ── Lists & visual structure ──────────────────────────────────────────────
    lists = page.soup.find_all(["ul", "ol"])
    if not lists:
        f.append(Finding("Content", "Lists/bullet points", Severity.INFO,
            "No bullet lists detected.",
            "Use <ul>/<ol> lists to improve scannability and feature snippet eligibility.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Content", "Lists/bullet points", Severity.PASS,
            f"{len(lists)} list(s) found — good for featured snippets."))

    # ── Content-to-HTML ratio ─────────────────────────────────────────────────
    html_len = len(page.html)
    text_len = len(body_text)
    ratio = round(text_len / html_len * 100, 1) if html_len else 0
    if ratio < 10:
        f.append(Finding("Content", "Content-to-code ratio", Severity.WARNING,
            f"Only {ratio}% of page is text content. Heavy code/markup bloat.",
            "Reduce inline scripts/styles; move to external files.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Content", "Content-to-code ratio", Severity.PASS,
            f"Content-to-code ratio: {ratio}%"))

    # ── Date/Freshness signals ────────────────────────────────────────────────
    time_tags = page.soup.find_all(["time", "meta"])
    date_meta = page.soup.find("meta", attrs={"property": "article:modified_time"}) or \
                page.soup.find("meta", attrs={"property": "article:published_time"})
    if not date_meta:
        f.append(Finding("Content", "Content freshness signals", Severity.INFO,
            "No article:published_time / article:modified_time meta found.",
            "Add article date meta tags to signal freshness to Google.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Content", "Content freshness signals", Severity.PASS,
            "Article date meta tag present."))

    return report
