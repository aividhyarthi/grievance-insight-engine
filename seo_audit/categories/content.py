"""
content.py — SEO Content checks.
Covers: word count, readability, content freshness, duplicate title/meta,
        paragraph structure, lists, content-to-code ratio, wall-of-text
        detection, media richness, and title vs H1 duplication.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def _flesch_kincaid_estimate(text: str) -> float:
    """Rough Flesch Reading Ease estimate (higher = easier; 60–70 is ideal)."""
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
        description="Content quality, depth, readability, and structural signals.",
    )
    f = report.findings
    soup = page.soup

    body = soup.find("body")
    body_text = body.get_text(separator=" ", strip=True) if body else ""
    words = body_text.split()
    word_count = len(words)

    # ── Word Count ────────────────────────────────────────────────────────────
    if word_count == 0:
        f.append(Finding("Content", "Word count", Severity.CRITICAL,
            "No visible body text detected — Google cannot index meaningful content.",
            "Ensure the page has substantive, server-rendered text content.",
            impact="High", effort="Medium"))
        return report
    elif word_count < 300:
        f.append(Finding("Content", "Word count", Severity.CRITICAL,
            f"Thin content ({word_count} words). Google actively downgrades thin pages.",
            "Expand to at least 600 words with unique, genuinely helpful content.",
            impact="High", effort="Medium"))
    elif word_count < 600:
        f.append(Finding("Content", "Word count", Severity.WARNING,
            f"Below-average content depth ({word_count} words).",
            "Aim for 800–1,500 words on informational pages; cover the topic comprehensively.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Content", "Word count", Severity.PASS,
            f"Good content depth ({word_count} words)."))

    # ── Wall-of-text detection ────────────────────────────────────────────────
    # Long content with no H2/H3 is hard to scan and signals poor structure
    h2_count = len(soup.find_all("h2"))
    h3_count = len(soup.find_all("h3"))
    if word_count > 500 and (h2_count + h3_count) == 0:
        f.append(Finding("Content", "Wall-of-text — no subheadings", Severity.WARNING,
            f"{word_count} words of content with zero H2/H3 subheadings. "
            "Users abandon dense unbroken text; Google rewards structured content.",
            "Break content into sections with descriptive H2/H3 headings every 150–300 words.",
            impact="High", effort="Quick Win"))
    elif word_count > 1000 and h2_count < 2:
        f.append(Finding("Content", "Heading coverage", Severity.INFO,
            f"{word_count} words but only {h2_count} H2 heading(s). "
            "Long-form content should have multiple clear sections.",
            "Add subheadings every 200–300 words to aid scanning and long-tail keyword coverage.",
            impact="Medium", effort="Quick Win"))

    # ── Long paragraph ratio ──────────────────────────────────────────────────
    paragraphs = soup.find_all("p")
    long_paras = [p for p in paragraphs if len(p.get_text().split()) > 100]
    if len(long_paras) > 2:
        f.append(Finding("Content", "Long paragraphs", Severity.INFO,
            f"{len(long_paras)} paragraph(s) exceed 100 words — dense blocks deter readers.",
            "Break long paragraphs at natural topic shifts; aim for 40–80 words per paragraph.",
            impact="Medium", effort="Medium"))

    # ── Readability ───────────────────────────────────────────────────────────
    fk = _flesch_kincaid_estimate(body_text[:5000])
    if fk < 40:
        f.append(Finding("Content", "Readability", Severity.WARNING,
            f"Flesch Reading Ease ~{fk} — content is complex (college level or above). "
            "Most web content should score 60+.",
            "Simplify sentences, avoid jargon, use active voice, and break up complex ideas.",
            impact="Medium", effort="Long-term"))
    elif fk > 80:
        f.append(Finding("Content", "Readability", Severity.INFO,
            f"Flesch score ~{fk} — very easy to read. Ensure sufficient depth for the topic.",
            impact="Low", effort="Medium"))
    else:
        f.append(Finding("Content", "Readability", Severity.PASS,
            f"Readability score ~{fk} — good balance of clarity and depth."))

    # ── Title vs H1 duplication ───────────────────────────────────────────────
    title = page.title
    h1_tags = page.h1_tags
    if title and h1_tags and title.strip().lower() == h1_tags[0].strip().lower():
        f.append(Finding("Content", "Title mirrors H1 exactly", Severity.INFO,
            f"Title tag and H1 are character-for-character identical: '{title}'.",
            "They can share the primary keyword, but should differ: the title should be "
            "click-optimised for SERPs; the H1 should contextualise the page on arrival.",
            impact="Low", effort="Quick Win"))

    # ── Duplicate Title / Meta ────────────────────────────────────────────────
    meta_desc = page.meta_description
    if title and meta_desc and title.lower().strip() == meta_desc.lower().strip():
        f.append(Finding("Content", "Title ≠ Meta description", Severity.WARNING,
            "Title and meta description are character-for-character identical.",
            "Write distinct, complementary copy: title = keyword-focused; meta = benefit + CTA.",
            impact="Medium", effort="Quick Win"))
    elif title and meta_desc:
        f.append(Finding("Content", "Title ≠ Meta description", Severity.PASS,
            "Title and meta description are distinct."))

    # ── Paragraph structure ───────────────────────────────────────────────────
    if len(paragraphs) < 3:
        f.append(Finding("Content", "Paragraph structure", Severity.WARNING,
            f"Only {len(paragraphs)} <p> tag(s). Content may be un-structured or rendered via divs.",
            "Break content into clear <p> paragraphs — essential for accessibility and readability.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Content", "Paragraph structure", Severity.PASS,
            f"{len(paragraphs)} paragraphs found."))

    # ── Lists & visual structure ──────────────────────────────────────────────
    lists = soup.find_all(["ul", "ol"])
    if not lists:
        f.append(Finding("Content", "Lists/bullet points", Severity.INFO,
            "No bullet or numbered lists detected.",
            "Use <ul>/<ol> lists to improve scannability and featured snippet eligibility — "
            "Google frequently pulls lists into rich results.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Content", "Lists/bullet points", Severity.PASS,
            f"{len(lists)} list(s) found — good for featured snippets and scannability."))

    # ── Media richness ────────────────────────────────────────────────────────
    images = page.images
    has_video = bool(
        soup.find("video")
        or soup.find("iframe", src=re.compile(r"(youtube|vimeo|wistia)", re.I))
    )
    if word_count > 600 and not images and not has_video:
        f.append(Finding("Content", "Media richness", Severity.WARNING,
            f"Long-form content ({word_count} words) with no images or video. "
            "Text-only pages have higher bounce rates and lower dwell time.",
            "Add relevant images, charts, or an embedded video to break up text and boost engagement.",
            impact="Medium", effort="Medium"))
    elif images or has_video:
        media_types = []
        if images:
            media_types.append(f"{len(images)} image(s)")
        if has_video:
            media_types.append("video")
        f.append(Finding("Content", "Media richness", Severity.PASS,
            f"Content includes: {', '.join(media_types)}."))

    # ── Content-to-HTML ratio ─────────────────────────────────────────────────
    html_len = len(page.html)
    text_len = len(body_text)
    ratio = round(text_len / html_len * 100, 1) if html_len else 0
    if ratio < 10:
        f.append(Finding("Content", "Content-to-code ratio", Severity.CRITICAL,
            f"Only {ratio}% of page bytes are visible text — heavy markup/script bloat.",
            "Move inline scripts and styles to external files to improve content ratio and caching.",
            impact="High", effort="Medium"))
    else:
        f.append(Finding("Content", "Content-to-code ratio", Severity.PASS,
            f"Content-to-code ratio: {ratio}%"))

    # ── Date / Freshness signals ──────────────────────────────────────────────
    date_meta = (
        soup.find("meta", attrs={"property": "article:modified_time"})
        or soup.find("meta", attrs={"property": "article:published_time"})
        or soup.find("meta", attrs={"name": "date"})
    )
    time_tags = soup.find_all("time")
    if not date_meta and not time_tags:
        f.append(Finding("Content", "Content freshness signals", Severity.INFO,
            "No article date meta tags or <time> elements found.",
            "Add article:published_time / article:modified_time meta tags and a visible <time> element "
            "to signal freshness to Google — critical for news, blog, and review content.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Content", "Content freshness signals", Severity.PASS,
            "Article date signals present (meta or <time> element)."))

    return report
