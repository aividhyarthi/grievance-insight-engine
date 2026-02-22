"""
geo.py — Generative Engine Optimization (GEO) checks.
GEO = making content authoritative, entity-rich, and citable enough
that LLMs (ChatGPT, Gemini, Perplexity, Claude) include it in
generated responses and recommendations.

Covers: entity markup, author/organisation signals, E-E-A-T signals,
        citation-worthy statistics/data, brand name clarity,
        About/Contact page signals.
"""

from __future__ import annotations

import json
import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="GEO — Generative Engine Optimization",
        description=(
            "Signals that influence whether AI assistants (ChatGPT, Perplexity, Gemini) "
            "cite or recommend this page in AI-generated answers."
        ),
    )
    f = report.findings
    soup = page.soup
    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)

    # ── Organization schema ───────────────────────────────────────────────────
    org_schema = any(
        "Organization" in s or "LocalBusiness" in s or "Corporation" in s
        for s in page.structured_data
    )
    if org_schema:
        f.append(Finding("GEO", "Organisation schema", Severity.PASS,
            "Organization/Business JSON-LD found — helps LLMs identify your brand entity."))
    else:
        f.append(Finding("GEO", "Organisation schema", Severity.WARNING,
            "No Organization or LocalBusiness schema.",
            "Add Organization schema with name, url, logo, sameAs (social profiles).",
            impact="High", effort="Medium"))

    # ── SameAs / social profiles ──────────────────────────────────────────────
    same_as = []
    for raw in page.structured_data:
        try:
            obj = json.loads(raw)
            if isinstance(obj, dict):
                sa = obj.get("sameAs", [])
                if isinstance(sa, list):
                    same_as.extend(sa)
                elif sa:
                    same_as.append(sa)
        except (json.JSONDecodeError, ValueError):
            pass

    if same_as:
        f.append(Finding("GEO", "sameAs social profiles", Severity.PASS,
            f"sameAs profiles: {', '.join(same_as[:4])}"))
    else:
        f.append(Finding("GEO", "sameAs social profiles", Severity.INFO,
            "No sameAs links in schema.",
            "Add sameAs to Organization schema linking to LinkedIn, Twitter, Wikipedia, Wikidata etc.",
            impact="Medium", effort="Quick Win"))

    # ── Author/Person schema ──────────────────────────────────────────────────
    author_schema = any("Person" in s or "author" in s.lower() for s in page.structured_data)
    author_html = soup.find(attrs={"class": re.compile(r"author|byline", re.I)}) or \
                  soup.find("a", rel=lambda r: r and "author" in r)
    if author_schema or author_html:
        f.append(Finding("GEO", "Author/Person entity", Severity.PASS,
            "Author signal found — contributes to E-E-A-T and GEO authority."))
    else:
        f.append(Finding("GEO", "Author/Person entity", Severity.INFO,
            "No author entity signal detected.",
            "Add author bylines with Person schema (name, credentials, profile URL).",
            impact="Medium", effort="Medium"))

    # ── Statistics / data citations ───────────────────────────────────────────
    stats = re.findall(r"\d+[\.,]?\d*\s*(%|percent|million|billion|users|customers)", body_text, re.I)
    if len(stats) >= 2:
        f.append(Finding("GEO", "Data/statistics citations", Severity.PASS,
            f"{len(stats)} statistic/data point(s) found — LLMs prefer citable facts."))
    else:
        f.append(Finding("GEO", "Data/statistics citations", Severity.INFO,
            "Few or no quantified statistics found.",
            "Include specific data points, research citations, and percentages — LLMs cite factual content.",
            impact="Medium", effort="Long-term"))

    # ── About / Trust pages ───────────────────────────────────────────────────
    links = page.links
    about_link = any(re.search(r"/about|/who-we-are|/our-story", l["href"], re.I) for l in links)
    contact_link = any(re.search(r"/contact|/get-in-touch|/reach-us", l["href"], re.I) for l in links)
    privacy_link = any(re.search(r"/privacy|/terms", l["href"], re.I) for l in links)

    if about_link and contact_link:
        f.append(Finding("GEO", "About & Contact pages", Severity.PASS,
            "About and Contact pages linked — good E-E-A-T trust signal."))
    else:
        missing = []
        if not about_link:
            missing.append("About")
        if not contact_link:
            missing.append("Contact")
        f.append(Finding("GEO", "About & Contact pages", Severity.WARNING,
            f"Missing links to: {', '.join(missing)} page(s).",
            "Ensure About and Contact pages exist and are linked in navigation/footer.",
            impact="Medium", effort="Quick Win"))

    if not privacy_link:
        f.append(Finding("GEO", "Privacy / Terms pages", Severity.INFO,
            "No Privacy Policy or Terms link found.",
            "Add Privacy Policy and Terms — required for E-E-A-T and trust.",
            impact="Low", effort="Quick Win"))

    # ── Brand name in content ─────────────────────────────────────────────────
    title = page.title
    h1s = page.h1_tags
    brand_in_title = bool(title)  # heuristic: brand usually in title
    if title and h1s:
        f.append(Finding("GEO", "Brand entity clarity", Severity.PASS,
            "Title and H1 present — brand/entity signals detectable."))
    else:
        f.append(Finding("GEO", "Brand entity clarity", Severity.WARNING,
            "Weak brand entity signals (missing title or H1).",
            "Ensure brand name appears in title, H1, and schema.org name field.",
            impact="Medium", effort="Quick Win"))

    # ── Expertise signals ─────────────────────────────────────────────────────
    expertise_signals = re.compile(
        r"\b(research|study|survey|report|founded|years of experience|"
        r"certified|award|published|expert|specialist|founder|CEO|CTO)\b", re.I)
    expertise_count = len(expertise_signals.findall(body_text[:3000]))
    if expertise_count >= 3:
        f.append(Finding("GEO", "E-E-A-T expertise signals", Severity.PASS,
            f"{expertise_count} expertise/authority signal(s) found in content."))
    else:
        f.append(Finding("GEO", "E-E-A-T expertise signals", Severity.WARNING,
            "Weak expertise signals in content.",
            "Include credentials, years of experience, awards, and cited research.",
            impact="High", effort="Long-term"))

    return report
