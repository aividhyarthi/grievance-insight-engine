"""
geo.py — Generative Engine Optimization (GEO) checks.
GEO = making content authoritative, entity-rich, and citable enough
that LLMs (ChatGPT, Gemini, Perplexity, Claude) include it in
generated responses and recommendations.

Covers: entity markup, author/organisation signals, E-E-A-T signals,
        citation-worthy statistics/data, brand name clarity, About/Contact
        page signals, review platform links, Wikipedia/Wikidata sameAs.
"""

from __future__ import annotations

import json
import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


_REVIEW_PLATFORMS = re.compile(
    r"(g2\.com|capterra\.com|trustpilot\.com|trustradius\.com|"
    r"getapp\.com|producthunt\.com|clutch\.co|glassdoor\.com|"
    r"tripadvisor\.com|yelp\.com)", re.I
)

_HIGH_AUTHORITY_KNOWLEDGE = re.compile(
    r"(wikipedia\.org|wikidata\.org|dbpedia\.org|freebase\.com)", re.I
)


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="GEO — Generative Engine Optimization",
        description=(
            "Signals that influence whether AI assistants (ChatGPT, Perplexity, Gemini, Claude) "
            "cite or recommend this page in AI-generated answers."
        ),
    )
    f = report.findings
    soup = page.soup
    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)
    links = page.links

    # ── Organization schema ───────────────────────────────────────────────────
    org_schema = any(
        "Organization" in s or "LocalBusiness" in s or "Corporation" in s
        for s in page.structured_data
    )
    if org_schema:
        f.append(Finding("GEO", "Organisation schema", Severity.PASS,
            "Organization/Business JSON-LD found — helps LLMs establish a knowledge entity for your brand."))
    else:
        f.append(Finding("GEO", "Organisation schema", Severity.WARNING,
            "No Organization or LocalBusiness schema found.",
            "Add Organization schema with: name, url, logo, description, sameAs (social + Wikipedia). "
            "This is how LLMs build their understanding of who you are.",
            impact="High", effort="Medium"))

    # ── SameAs — with Wikipedia/Wikidata priority check ──────────────────────
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
        has_knowledge_graph = any(_HIGH_AUTHORITY_KNOWLEDGE.search(url) for url in same_as)
        if has_knowledge_graph:
            f.append(Finding("GEO", "sameAs social profiles", Severity.PASS,
                f"sameAs profiles including knowledge-graph sources: {', '.join(same_as[:4])} "
                f"— Wikipedia/Wikidata links are the highest-trust GEO signal."))
        else:
            f.append(Finding("GEO", "sameAs social profiles", Severity.INFO,
                f"sameAs profiles found ({', '.join(same_as[:4])}) but no Wikipedia or Wikidata link.",
                "Adding a Wikipedia or Wikidata sameAs URL is the single strongest signal "
                "for LLMs to recognise your brand as a trusted entity.",
                impact="High", effort="Long-term"))
    else:
        f.append(Finding("GEO", "sameAs social profiles", Severity.INFO,
            "No sameAs links in any schema.",
            "Add sameAs to Organization schema: LinkedIn, Twitter/X, Wikipedia, Wikidata.",
            impact="Medium", effort="Quick Win"))

    # ── Author/Person schema ──────────────────────────────────────────────────
    author_schema = any("Person" in s or '"author"' in s for s in page.structured_data)
    author_html = (
        soup.find(attrs={"class": re.compile(r"author|byline", re.I)})
        or soup.find("a", rel=lambda r: r and "author" in r)
    )
    if author_schema or author_html:
        f.append(Finding("GEO", "Author/Person entity", Severity.PASS,
            "Author signal found — contributes to E-E-A-T and GEO authority "
            "(LLMs weight authored content more heavily)."))
    else:
        f.append(Finding("GEO", "Author/Person entity", Severity.INFO,
            "No author entity signal detected.",
            "Add author bylines with Person schema (name, jobTitle, url, sameAs). "
            "Named human authors increase the probability of LLM citation.",
            impact="Medium", effort="Medium"))

    # ── Statistics / data citations ───────────────────────────────────────────
    stats = re.findall(
        r"\d+[\.,]?\d*\s*(%|percent|million|billion|thousand|users|customers|studies|respondents)",
        body_text, re.I)
    source_refs = re.findall(
        r"\b(according to|sourced from|reported by|based on|study by|research by|per)\b",
        body_text, re.I)
    if len(stats) >= 2 or source_refs:
        f.append(Finding("GEO", "Data/statistics citations", Severity.PASS,
            f"{len(stats)} statistic(s) and {len(source_refs)} source attribution(s) found — "
            "LLMs strongly prefer citing factual, sourced content."))
    else:
        f.append(Finding("GEO", "Data/statistics citations", Severity.INFO,
            "Few or no quantified statistics or attributed sources found.",
            "Include specific data points, percentages, and cite their sources (e.g. 'According to Gartner…'). "
            "LLMs use quantified, attributed claims as citation anchors.",
            impact="Medium", effort="Long-term"))

    # ── Review platform links ─────────────────────────────────────────────────
    review_links = [l for l in links if _REVIEW_PLATFORMS.search(l.get("href", ""))]
    if review_links:
        platforms = list({_REVIEW_PLATFORMS.search(l["href"]).group(1) for l in review_links})
        f.append(Finding("GEO", "Review platform presence", Severity.PASS,
            f"Links to review platforms: {', '.join(platforms)}. "
            "Third-party reviews are strong social-proof signals LLMs reference."))
    else:
        f.append(Finding("GEO", "Review platform presence", Severity.INFO,
            "No links to third-party review platforms (G2, Trustpilot, Capterra, etc.) found.",
            "Link to and actively cultivate reviews on relevant platforms — "
            "LLMs frequently cite these as independent validation of credibility.",
            impact="Medium", effort="Long-term"))

    # ── Testimonials / social proof on page ───────────────────────────────────
    testimonial_signals = soup.find_all(attrs={
        "class": re.compile(r"(testimonial|review|case.study|client|quote)", re.I)
    })
    blockquotes = soup.find_all("blockquote")
    if testimonial_signals or len(blockquotes) >= 2:
        f.append(Finding("GEO", "Social proof content", Severity.PASS,
            f"Testimonial/review/quote content detected — "
            "third-party validation increases GEO citability."))
    else:
        f.append(Finding("GEO", "Social proof content", Severity.INFO,
            "No testimonial, case study, or quote content detected.",
            "Add named customer testimonials or case studies — LLMs weight third-party endorsements "
            "as evidence of real-world authority.",
            impact="Low", effort="Medium"))

    # ── About / Trust pages ───────────────────────────────────────────────────
    about_link = any(re.search(r"/about|/who-we-are|/our-story|/company", l["href"], re.I) for l in links)
    contact_link = any(re.search(r"/contact|/get-in-touch|/reach-us", l["href"], re.I) for l in links)
    privacy_link = any(re.search(r"/privacy|/terms|/legal", l["href"], re.I) for l in links)

    if about_link and contact_link:
        f.append(Finding("GEO", "About & Contact pages", Severity.PASS,
            "About and Contact pages linked — essential E-E-A-T trust signals for LLM citation."))
    else:
        missing = [p for p, has in [("About", about_link), ("Contact", contact_link)] if not has]
        f.append(Finding("GEO", "About & Contact pages", Severity.WARNING,
            f"Missing links to: {', '.join(missing)} page(s).",
            "Ensure About and Contact pages exist and are reachable in nav/footer — "
            "LLMs check these to verify organisational legitimacy.",
            impact="Medium", effort="Quick Win"))

    if not privacy_link:
        f.append(Finding("GEO", "Privacy / Terms pages", Severity.INFO,
            "No Privacy Policy or Terms link found.",
            "Privacy Policy and Terms pages are E-E-A-T trust anchors — required by Google QRG.",
            impact="Low", effort="Quick Win"))

    # ── Brand entity clarity ──────────────────────────────────────────────────
    title = page.title
    h1s = page.h1_tags
    if title and h1s:
        f.append(Finding("GEO", "Brand entity clarity", Severity.PASS,
            "Title and H1 present — brand/entity signals detectable by LLMs."))
    else:
        f.append(Finding("GEO", "Brand entity clarity", Severity.WARNING,
            "Weak brand entity signals (missing title or H1).",
            "Ensure brand name appears consistently in title, H1, and schema.org name field.",
            impact="Medium", effort="Quick Win"))

    # ── Expertise signals ─────────────────────────────────────────────────────
    expertise_signals = re.compile(
        r"\b(research|study|survey|report|founded|years of experience|"
        r"certified|award|published|expert|specialist|founder|CEO|CTO|"
        r"PhD|professor|analyst|chartered|accredited|recognised)\b", re.I
    )
    expertise_count = len(expertise_signals.findall(body_text[:5000]))
    if expertise_count >= 3:
        f.append(Finding("GEO", "E-E-A-T expertise signals", Severity.PASS,
            f"{expertise_count} expertise/authority signal(s) found — "
            "LLMs use these to assess source credibility before citing."))
    else:
        f.append(Finding("GEO", "E-E-A-T expertise signals", Severity.WARNING,
            "Weak expertise signals in content.",
            "Include verifiable credentials: years of experience, certifications, awards, "
            "published research, or named expert contributors with credentials.",
            impact="High", effort="Long-term"))

    return report
