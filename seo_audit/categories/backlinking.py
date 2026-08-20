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
            "Link-earning potential signals (from HTML) + backlink audit items "
            "requiring Ahrefs / SEMrush / Google Search Console."
        ),
    )
    f = report.findings
    soup = page.soup
    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)

    # ── Link-earning content assets ───────────────────────────────────────────
    has_data = bool(re.search(r"\d+\s*(%|percent|million|billion|thousand)", body_text, re.I))
    has_research = bool(re.search(
        r"\b(study|survey|research|report|whitepaper|data|findings|benchmark)\b", body_text, re.I))
    has_tool = bool(soup.find_all(attrs={
        "class": re.compile(r"calculator|tool|widget|quiz|generator", re.I)}))
    has_infographic = bool(
        soup.find_all("img", attrs={"class": re.compile(r"infographic", re.I)})
        or re.search(r"infographic", body_text, re.I)
    )
    has_resource = bool(
        soup.find(attrs={"class": re.compile(r"(resource|glossary|guide|template|checklist)", re.I)})
        or re.search(r"\b(glossary|comprehensive guide|ultimate guide|free template|checklist)\b",
                     body_text, re.I)
    )
    has_case_study = bool(
        soup.find(attrs={"class": re.compile(r"(case.study|success.story|results)", re.I)})
        or re.search(r"\b(case study|success story|how .+ achieved|results.*increased)\b",
                     body_text, re.I)
    )

    link_magnets = {
        "original data/stats": has_data,
        "research/report": has_research,
        "interactive tool": has_tool,
        "infographic": has_infographic,
        "resource/glossary/guide": has_resource,
        "case study": has_case_study,
    }
    found_magnets = [k for k, v in link_magnets.items() if v]
    found_count = len(found_magnets)

    if found_count >= 3:
        f.append(Finding("Backlinking", "Linkable asset signals", Severity.PASS,
            f"{found_count} link-magnet signal(s) detected: {', '.join(found_magnets)}."))
    elif found_count >= 1:
        f.append(Finding("Backlinking", "Linkable asset signals", Severity.WARNING,
            f"Only {found_count} link-earning content type(s) found: {', '.join(found_magnets)}.",
            "Pages that earn backlinks naturally contain: original data, free tools, "
            "comprehensive guides, or case studies. Add more of these content types.",
            impact="High", effort="Long-term"))
    else:
        f.append(Finding("Backlinking", "Linkable asset signals", Severity.WARNING,
            "No obvious link-magnet content detected.",
            "Create original research, data studies, free tools, or comprehensive guides — "
            "these are the content types that naturally attract backlinks at scale.",
            impact="High", effort="Long-term"))

    # ── Content depth for link earning ────────────────────────────────────────
    word_count = len(body_text.split())
    if word_count >= 2000:
        f.append(Finding("Backlinking", "Content depth for link earning", Severity.PASS,
            f"Long-form content ({word_count} words) — "
            "pages over 2,000 words earn significantly more backlinks on average."))
    elif word_count >= 1000:
        f.append(Finding("Backlinking", "Content depth for link earning", Severity.INFO,
            f"Moderate content depth ({word_count} words). "
            "Long-form content (2,000+ words) earns 3× more backlinks than short articles.",
            "Expand with deeper analysis, more examples, data points, and a comprehensive FAQ.",
            impact="High", effort="Long-term"))
    else:
        f.append(Finding("Backlinking", "Content depth for link earning", Severity.WARNING,
            f"Shallow content ({word_count} words). Short pages rarely earn organic backlinks.",
            "Invest in long-form, comprehensive content — be the definitive resource on the topic.",
            impact="High", effort="Long-term"))

    # ── Resource page / glossary ──────────────────────────────────────────────
    resource_page = bool(
        re.search(r"\b(resources|tools|glossary|templates|downloads|free)\b", page.url.lower())
        or soup.find("h1", string=re.compile(r"\b(resources|tools|glossary|guide)\b", re.I))
    )
    if resource_page:
        f.append(Finding("Backlinking", "Resource/hub page", Severity.PASS,
            "Page appears to be a resource hub, tool collection, or glossary — "
            "these page types earn 4× more backlinks than standard articles."))
    else:
        f.append(Finding("Backlinking", "Resource/hub page", Severity.INFO,
            "No resource hub or glossary page detected.",
            "Create a free resources or tools page — resource hubs attract links from sites "
            "that want to reference useful content for their audiences.",
            impact="Medium", effort="Long-term"))

    # ── Guest post / contributor signals ─────────────────────────────────────
    guest_signals = bool(
        re.search(
            r"\b(guest post|write for us|contribute|submit.?an article|"
            r"editorial guidelines|become a contributor)\b", body_text, re.I)
        or soup.find(attrs={"class": re.compile(r"(guest|contributor|author.bio)", re.I)})
    )
    if guest_signals:
        f.append(Finding("Backlinking", "Guest post / contributor signals", Severity.PASS,
            "Editorial contribution programme signals detected — "
            "these attract natural backlinks and author mentions from contributors."))

    # ── Citation / reference signals ─────────────────────────────────────────
    citation_cues = soup.find_all(attrs={
        "class": re.compile(r"cite|citation|reference|source|footnote|bibliography", re.I)
    })
    ref_links = [
        l for l in page.links
        if not l["internal"]
        and any(ha in l.get("href", "")
                for ha in ["wikipedia.org", ".gov", ".edu", "pubmed", "ncbi"])
    ]
    if citation_cues or ref_links:
        f.append(Finding("Backlinking", "Citation / reference signals", Severity.PASS,
            f"{len(citation_cues)} citation element(s) and {len(ref_links)} authoritative "
            "source link(s) found. Well-referenced content earns more backlinks."))
    else:
        f.append(Finding("Backlinking", "Citation / reference signals", Severity.INFO,
            "No citation or authoritative reference elements found.",
            "Include references to authoritative sources (gov, edu, research papers). "
            "Content that cites credible sources is seen as more trustworthy and link-worthy.",
            impact="Medium", effort="Medium"))

    # ── External data flags ───────────────────────────────────────────────────
    ext_checks = [
        ("Total referring domains",
         "Check in Ahrefs/SEMrush. Target: growing month-over-month. "
         "Diversified referring domains matter more than raw link count."),
        ("Dofollow vs nofollow ratio",
         "Healthy profile: ~60–70% dofollow. Very high nofollow% = low equity passing."),
        ("Anchor text distribution",
         "Check in Ahrefs. >50% exact-match brand/keyword anchors = over-optimisation risk."),
        ("Lost / broken backlinks",
         "Find in Ahrefs 'Lost links' report. Reclaim via 301 redirects or email outreach."),
        ("Competitor backlink gap",
         "Use Ahrefs Link Intersect to find domains linking to competitors but not you."),
        ("Link velocity (new links/month)",
         "Sudden spikes can trigger Google review. Steady organic growth is the safest pattern."),
        ("Toxic/spam backlinks",
         "Use Google Disavow Tool after identifying toxic links in Ahrefs/SEMrush toxicity report."),
    ]
    for name, rec in ext_checks:
        f.append(Finding("Backlinking", name, Severity.INFO,
            "Requires Ahrefs / SEMrush / Google Search Console data — not auditable via crawl.",
            rec,
            impact="High", effort="Medium",
            external_data_needed=True))

    return report
