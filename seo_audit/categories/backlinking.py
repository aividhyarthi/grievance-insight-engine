"""
backlinking.py — Backlink SEO checks.
Full backlink analysis requires Ahrefs/SEMrush/Moz APIs.
This module checks on-page signals that correlate with link-earning
potential and flags what requires external data collection.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="SEO Backlinking",
        description=(
            "Link-earning potential signals (crawlable) + backlink audit items "
            "requiring Ahrefs / SEMrush / Google Search Console."
        ),
    )
    f = report.findings
    soup = page.soup
    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)

    # ── Link-earning content assets ───────────────────────────────────────────
    has_data = bool(re.search(r"\d+\s*(%|percent|million|billion)", body_text, re.I))
    has_research = bool(re.search(r"\b(study|survey|research|report|whitepaper|data)\b", body_text, re.I))
    has_tool = bool(soup.find_all(attrs={"class": re.compile(r"calculator|tool|widget|quiz", re.I)}))
    has_infographic = bool(soup.find_all("img", attrs={
        "class": re.compile(r"infographic", re.I)}) or
        re.search(r"infographic", body_text, re.I))

    link_magnets = sum([has_data, has_research, has_tool, has_infographic])
    if link_magnets >= 2:
        f.append(Finding("Backlinking", "Linkable asset signals", Severity.PASS,
            f"{link_magnets} link-magnet signal(s): data/stats={has_data}, "
            f"research={has_research}, tool/widget={has_tool}, infographic={has_infographic}"))
    elif link_magnets == 1:
        f.append(Finding("Backlinking", "Linkable asset signals", Severity.WARNING,
            "Limited link-earning content on page.",
            "Create original research, data studies, tools, or infographics to earn natural backlinks.",
            impact="High", effort="Long-term"))
    else:
        f.append(Finding("Backlinking", "Linkable asset signals", Severity.WARNING,
            "No obvious link-magnet content detected.",
            "Invest in original research, free tools, or comprehensive guides to attract backlinks.",
            impact="High", effort="Long-term"))

    # ── Internal content depth ────────────────────────────────────────────────
    word_count = len(body_text.split())
    if word_count >= 1500:
        f.append(Finding("Backlinking", "Content depth for link earning", Severity.PASS,
            f"Long-form content ({word_count} words) — more likely to earn backlinks."))
    else:
        f.append(Finding("Backlinking", "Content depth for link earning", Severity.INFO,
            f"Content is {word_count} words. Long-form 1,500+ word content earns 3× more links.",
            "Expand content depth and add unique insights to make it citation-worthy.",
            impact="High", effort="Long-term"))

    # ── Author / citation credibility ─────────────────────────────────────────
    citation_cues = soup.find_all(attrs={"class": re.compile(r"cite|citation|reference|source", re.I)})
    if citation_cues:
        f.append(Finding("Backlinking", "Citation / reference signals", Severity.PASS,
            f"{len(citation_cues)} citation/reference element(s) found."))
    else:
        f.append(Finding("Backlinking", "Citation / reference signals", Severity.INFO,
            "No citation or reference elements found.",
            "Include references and cite sources — makes your content more trustworthy and link-worthy.",
            impact="Medium", effort="Medium"))

    # ── External data flags ───────────────────────────────────────────────────
    ext_checks = [
        ("Total referring domains", "Check in Ahrefs/SEMrush. Target: growing MoM. Diversified domains > raw link count."),
        ("Dofollow vs nofollow ratio", "Healthy profile: ~60–70% dofollow. Very high nofollow% = low equity passing."),
        ("Anchor text distribution", "Check in Ahrefs. >50% exact-match anchors = over-optimisation risk."),
        ("Lost / broken backlinks", "Find in Ahrefs 'Lost links'. Reclaim via 301 redirects or outreach."),
        ("Competitor backlink gap", "Use Ahrefs Link Intersect to find domains linking to competitors but not you."),
        ("Link velocity (new links/month)", "Sudden spikes can trigger Google review. Steady organic growth is ideal."),
        ("Toxic/spam backlinks", "Use Google Disavow Tool after identifying toxic links in Ahrefs/SEMrush."),
    ]
    for name, rec in ext_checks:
        f.append(Finding("Backlinking", name, Severity.INFO,
            "⚠ Requires Ahrefs / SEMrush / Google Search Console data.",
            rec,
            impact="High", effort="Medium",
            external_data_needed=True))

    return report
