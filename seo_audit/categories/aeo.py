"""
aeo.py — Answer Engine Optimization (AEO) checks.
AEO = optimising content to appear directly in AI answer engines
(Google AI Overviews, Perplexity, ChatGPT search, Bing Copilot).

Covers: FAQ schema, Q&A structure, definition blocks, concise answer
        patterns, table/list formatting, featured snippet readiness.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="AEO — Answer Engine Optimization",
        description=(
            "Signals that help AI answer engines (Google AI Overviews, Perplexity, "
            "ChatGPT search) surface your content as a direct answer."
        ),
    )
    f = report.findings
    soup = page.soup
    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)

    # ── FAQPage schema ────────────────────────────────────────────────────────
    faq_schema = any("FAQPage" in s for s in page.structured_data)
    if faq_schema:
        f.append(Finding("AEO", "FAQPage schema", Severity.PASS,
            "FAQPage JSON-LD detected — eligible for Google FAQ rich result and AI citation."))
    else:
        faq_html = soup.find_all(attrs={"class": re.compile(r"faq|accordion|faq.item", re.I)})
        if faq_html:
            f.append(Finding("AEO", "FAQPage schema", Severity.WARNING,
                "FAQ content found in HTML but no FAQPage schema.",
                "Add FAQPage JSON-LD to mark up your Q&A content for AI engines.",
                impact="High", effort="Quick Win"))
        else:
            f.append(Finding("AEO", "FAQPage schema", Severity.INFO,
                "No FAQ section or FAQPage schema found.",
                "Add a FAQ section answering common user questions with FAQPage schema.",
                impact="High", effort="Medium"))

    # ── Question-style headings ────────────────────────────────────────────────
    all_headings = page.h1_tags + page.h2_tags + page.h3_tags
    question_headings = [h for h in all_headings if h.strip().endswith("?")]
    if question_headings:
        f.append(Finding("AEO", "Question-based headings", Severity.PASS,
            f"{len(question_headings)} question-style heading(s) found — good for AEO."))
    else:
        f.append(Finding("AEO", "Question-based headings", Severity.INFO,
            "No question-style headings (e.g. 'What is X?').",
            "Use question-format H2/H3 headings that mirror search queries.",
            impact="High", effort="Medium"))

    # ── Definition / direct answer pattern ───────────────────────────────────
    definition_pattern = re.compile(
        r"\b(is|are|means|refers to|defined as|describes)\b.{10,120}[.!]", re.I)
    defs = definition_pattern.findall(body_text[:3000])
    if defs:
        f.append(Finding("AEO", "Direct answer / definition sentences", Severity.PASS,
            "Content contains direct-answer sentence patterns — good for featured snippets."))
    else:
        f.append(Finding("AEO", "Direct answer / definition sentences", Severity.INFO,
            "No clear definition/answer sentences detected.",
            "Open sections with a concise 40–60 word answer before elaborating.",
            impact="High", effort="Medium"))

    # ── Tables ────────────────────────────────────────────────────────────────
    tables = soup.find_all("table")
    if tables:
        f.append(Finding("AEO", "Table markup", Severity.PASS,
            f"{len(tables)} table(s) found — good for comparison featured snippets."))
    else:
        f.append(Finding("AEO", "Table markup", Severity.INFO,
            "No tables found.",
            "Add comparison tables for spec/pricing/feature content — frequently pulled into AI answers.",
            impact="Medium", effort="Medium"))

    # ── Numbered lists ────────────────────────────────────────────────────────
    ordered_lists = soup.find_all("ol")
    if ordered_lists:
        f.append(Finding("AEO", "Numbered / ordered lists", Severity.PASS,
            f"{len(ordered_lists)} ordered list(s) — ideal for 'how-to' AI answers."))
    else:
        f.append(Finding("AEO", "Numbered / ordered lists", Severity.INFO,
            "No ordered lists found.",
            "Use numbered lists for step-by-step content — high featured snippet eligibility.",
            impact="Medium", effort="Medium"))

    # ── HowTo schema ─────────────────────────────────────────────────────────
    howto = any("HowTo" in s for s in page.structured_data)
    if howto:
        f.append(Finding("AEO", "HowTo schema", Severity.PASS,
            "HowTo schema found — eligible for How-to rich results and AI extraction."))
    else:
        how_to_content = bool(re.search(r"\b(how to|step \d|step by step)\b", body_text, re.I))
        if how_to_content:
            f.append(Finding("AEO", "HowTo schema", Severity.WARNING,
                "How-to content detected but no HowTo schema.",
                "Add HowTo JSON-LD to unlock rich results and AI answer eligibility.",
                impact="High", effort="Medium"))

    # ── Speakable schema ──────────────────────────────────────────────────────
    speakable = any("Speakable" in s for s in page.structured_data)
    if not speakable:
        f.append(Finding("AEO", "Speakable schema", Severity.INFO,
            "No Speakable schema — missed voice search / audio AI opportunity.",
            "Add Speakable to mark key passages for voice assistants and AEO.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("AEO", "Speakable schema", Severity.PASS,
            "Speakable schema found."))

    # ── Content conciseness ───────────────────────────────────────────────────
    paragraphs = soup.find_all("p")
    long_paras = [p for p in paragraphs if len(p.get_text().split()) > 120]
    if len(long_paras) > 3:
        f.append(Finding("AEO", "Paragraph conciseness", Severity.INFO,
            f"{len(long_paras)} paragraph(s) exceed 120 words — hard for AI to extract.",
            "Break long paragraphs into shorter chunks; lead with the key answer.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("AEO", "Paragraph conciseness", Severity.PASS,
            "Paragraphs are concise — good for AI extraction."))

    return report
