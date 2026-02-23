"""
aeo.py — Answer Engine Optimization (AEO) checks.
AEO = optimising content to appear directly in AI answer engines
(Google AI Overviews, Perplexity, ChatGPT search, Bing Copilot).

Covers: FAQ schema, Q&A structure, question-style headings,
        definition/direct-answer sentences, tables, lists,
        HowTo schema, Speakable schema, paragraph conciseness,
        abbreviation/terminology glossary signals.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


# Common question-opener words in headings
_QUESTION_OPENERS = re.compile(
    r"^(what|why|how|when|where|who|which|can|is|are|does|do|should|will)\b",
    re.I,
)


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
        # Validate it has at least one acceptedAnswer
        has_answers = any("acceptedAnswer" in s for s in page.structured_data)
        if has_answers:
            f.append(Finding("AEO", "FAQPage schema", Severity.PASS,
                "FAQPage JSON-LD with acceptedAnswer detected — "
                "eligible for Google FAQ rich result and AI citation."))
        else:
            f.append(Finding("AEO", "FAQPage schema", Severity.WARNING,
                "FAQPage schema found but no 'acceptedAnswer' field — schema is invalid.",
                "Each question in FAQPage must have an acceptedAnswer with text.",
                impact="High", effort="Quick Win"))
    else:
        faq_html = soup.find_all(attrs={"class": re.compile(r"faq|accordion|faq.item", re.I)})
        if faq_html:
            f.append(Finding("AEO", "FAQPage schema", Severity.WARNING,
                "FAQ content found in HTML but no FAQPage JSON-LD schema.",
                "Add FAQPage schema to mark up your Q&A content — "
                "AI engines use schema to extract structured answers.",
                impact="High", effort="Quick Win"))
        else:
            f.append(Finding("AEO", "FAQPage schema", Severity.INFO,
                "No FAQ section or FAQPage schema found.",
                "Add a FAQ section answering the most common user questions with FAQPage schema.",
                impact="High", effort="Medium"))

    # ── Question-style headings ────────────────────────────────────────────────
    all_headings = page.h1_tags + page.h2_tags + page.h3_tags
    # Check both trailing "?" and leading question words
    question_headings = [
        h for h in all_headings
        if h.strip().endswith("?") or _QUESTION_OPENERS.match(h.strip())
    ]
    if question_headings:
        f.append(Finding("AEO", "Question-based headings", Severity.PASS,
            f"{len(question_headings)} question-style heading(s) found — "
            "mirrors how users phrase searches in AI engines."))
    else:
        f.append(Finding("AEO", "Question-based headings", Severity.INFO,
            "No question-style headings (e.g. 'What is X?', 'How to Y').",
            "Rewrite H2/H3 headings to mirror natural-language questions — "
            "this is the primary signal AI engines use to identify answer passages.",
            impact="High", effort="Medium"))

    # ── Definition / direct answer pattern ───────────────────────────────────
    definition_pattern = re.compile(
        r"\b(is|are|means|refers to|defined as|describes|can be defined)\b.{10,120}[.!]", re.I)
    defs = definition_pattern.findall(body_text[:5000])
    if defs:
        f.append(Finding("AEO", "Direct answer / definition sentences", Severity.PASS,
            "Content contains direct-answer sentence patterns — "
            "strong signal for Google AI Overviews and featured snippets."))
    else:
        f.append(Finding("AEO", "Direct answer / definition sentences", Severity.INFO,
            "No clear definition or direct-answer sentences detected in the opening content.",
            "Open each section with a concise 40–60 word answer before elaborating. "
            "Pattern: '[Topic] is [concise definition]...'",
            impact="High", effort="Medium"))

    # ── Tables (comparison/data) ──────────────────────────────────────────────
    tables = soup.find_all("table")
    if tables:
        # Check if tables have headers (properly marked up)
        tables_with_th = [t for t in tables if t.find("th")]
        if tables_with_th:
            f.append(Finding("AEO", "Table markup", Severity.PASS,
                f"{len(tables)} table(s) with <th> headers — "
                "properly structured tables are frequently pulled into AI comparison answers."))
        else:
            f.append(Finding("AEO", "Table markup", Severity.INFO,
                f"{len(tables)} table(s) found but none use <th> header cells.",
                "Add <th scope='col'> header cells to tables for better AI and accessibility parsing.",
                impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("AEO", "Table markup", Severity.INFO,
            "No tables found.",
            "Add comparison tables for spec/pricing/feature content — "
            "frequently pulled into AI answers as structured data.",
            impact="Medium", effort="Medium"))

    # ── Numbered lists (step-by-step) ─────────────────────────────────────────
    ordered_lists = soup.find_all("ol")
    if ordered_lists:
        f.append(Finding("AEO", "Numbered / ordered lists", Severity.PASS,
            f"{len(ordered_lists)} ordered list(s) — "
            "ideal for 'how-to' and 'top N' AI answer extractions."))
    else:
        f.append(Finding("AEO", "Numbered / ordered lists", Severity.INFO,
            "No numbered lists found.",
            "Use numbered lists for step-by-step and ranked content — "
            "high featured snippet and AI answer eligibility.",
            impact="Medium", effort="Medium"))

    # ── HowTo schema ─────────────────────────────────────────────────────────
    howto = any("HowTo" in s for s in page.structured_data)
    if howto:
        f.append(Finding("AEO", "HowTo schema", Severity.PASS,
            "HowTo schema found — eligible for How-to rich results and AI step extraction."))
    else:
        how_to_content = bool(re.search(
            r"\b(how to|step \d|step by step|instructions|guide)\b", body_text, re.I))
        if how_to_content:
            f.append(Finding("AEO", "HowTo schema", Severity.WARNING,
                "How-to content detected but no HowTo schema — missing rich result opportunity.",
                "Add HowTo JSON-LD with step-by-step markup to unlock rich results and AI extraction.",
                impact="High", effort="Medium"))

    # ── Speakable schema ──────────────────────────────────────────────────────
    speakable = any("Speakable" in s for s in page.structured_data)
    if not speakable:
        f.append(Finding("AEO", "Speakable schema", Severity.INFO,
            "No Speakable schema — key passages not marked for voice assistants.",
            "Add Speakable to mark the most answer-worthy passages for Google Assistant and voice AEO.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("AEO", "Speakable schema", Severity.PASS,
            "Speakable schema found — content marked for voice/audio AI extraction."))

    # ── Paragraph conciseness ─────────────────────────────────────────────────
    paragraphs = soup.find_all("p")
    long_paras = [p for p in paragraphs if len(p.get_text().split()) > 120]
    if len(long_paras) > 3:
        f.append(Finding("AEO", "Paragraph conciseness", Severity.INFO,
            f"{len(long_paras)} paragraph(s) exceed 120 words — hard for AI engines to extract cleanly.",
            "Break long paragraphs into ≤80-word chunks; lead with the key point (inverted pyramid style).",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("AEO", "Paragraph conciseness", Severity.PASS,
            "Paragraphs are concise — content is well-structured for AI extraction."))

    # ── Terminology / abbreviation glossary ───────────────────────────────────
    abbr_tags = soup.find_all("abbr")
    if abbr_tags:
        f.append(Finding("AEO", "Abbreviation definitions", Severity.PASS,
            f"{len(abbr_tags)} <abbr> tag(s) used — terminology is properly defined for AI parsers."))
    else:
        # Check if content uses unexplained abbreviations
        abbr_pattern = re.compile(r"\b[A-Z]{2,5}\b")
        abbrs_found = abbr_pattern.findall(body_text[:3000])
        unique_abbrs = set(abbrs_found)
        if len(unique_abbrs) > 3:
            f.append(Finding("AEO", "Abbreviation definitions", Severity.INFO,
                f"{len(unique_abbrs)} potential abbreviations found ({', '.join(list(unique_abbrs)[:5])}) "
                "but none wrapped in <abbr> tags.",
                "Use <abbr title='Full Name'>ABBR</abbr> to define acronyms — "
                "helps AI engines understand technical terminology.",
                impact="Low", effort="Quick Win"))

    return report
