"""
offpage.py — SEO Off-Page checks.
Off-page factors cannot be fully audited by crawling alone.
This module checks what is visible/inferable from the page itself
and flags what requires external tool data (Ahrefs, SEMrush, Moz).
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


_SOCIAL_DOMAINS = re.compile(
    r"(twitter\.com|x\.com|linkedin\.com|facebook\.com|instagram\.com|"
    r"youtube\.com|pinterest\.com|tiktok\.com)", re.I
)

_REVIEW_PLATFORMS = re.compile(
    r"(g2\.com|capterra\.com|trustpilot\.com|trustradius\.com|"
    r"getapp\.com|producthunt\.com|clutch\.co|glassdoor\.com|"
    r"tripadvisor\.com|yelp\.com)", re.I
)

_HIGH_AUTHORITY = [
    "wikipedia.org", ".gov", ".edu", ".ac.", "bbc.com", "reuters.com",
    "forbes.com", "techcrunch.com", "nature.com", "pubmed", "ncbi.nlm",
    "who.int", "un.org", "hbr.org",
]


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="SEO Off-Page",
        description=(
            "Off-page authority signals visible from the page itself. "
            "Many checks require external tools (Ahrefs, SEMrush, Moz) — flagged accordingly."
        ),
    )
    f = report.findings
    soup = page.soup
    links = page.links
    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)

    # ── Social profile links ────────────────────────────────────────────────
    social_links = [l for l in links if _SOCIAL_DOMAINS.search(l.get("href", ""))]
    if social_links:
        platforms = list({_SOCIAL_DOMAINS.search(l["href"]).group(1) for l in social_links})
        f.append(Finding("Off-Page", "Social profile links", Severity.PASS,
            f"Links to social platforms: {', '.join(platforms)}."))
    else:
        f.append(Finding("Off-Page", "Social profile links", Severity.WARNING,
            "No social media profile links detected.",
            "Link to official social profiles — strengthens brand entity signals for both Google and LLMs.",
            impact="Medium", effort="Quick Win"))

    # ── Review platform links (G2, Trustpilot, etc.) ─────────────────────────
    review_links = [l for l in links if _REVIEW_PLATFORMS.search(l.get("href", ""))]
    if review_links:
        platforms = list({_REVIEW_PLATFORMS.search(l["href"]).group(1) for l in review_links})
        f.append(Finding("Off-Page", "Review platform links", Severity.PASS,
            f"Links to review platforms: {', '.join(platforms)}. "
            "Third-party reviews are strong off-page trust signals."))
    else:
        f.append(Finding("Off-Page", "Review platform links", Severity.INFO,
            "No links to third-party review platforms (G2, Trustpilot, Capterra, etc.) detected.",
            "Link to and actively manage your profiles on relevant review platforms — "
            "reviews influence both human CTR and AI engine citations.",
            impact="Medium", effort="Long-term"))

    # ── Press / Media mentions ─────────────────────────────────────────────
    press_signals = soup.find_all(attrs={
        "class": re.compile(r"press|media|featured.in|as.seen|coverage", re.I)
    })
    press_text = re.search(
        r"\b(as seen in|featured in|press coverage|in the news|media coverage|award)\b",
        body_text, re.I
    )
    if press_signals or press_text:
        f.append(Finding("Off-Page", "Press / media signals", Severity.PASS,
            "Press or 'as seen in' section detected — strong off-page trust and authority signal."))
    else:
        f.append(Finding("Off-Page", "Press / media signals", Severity.INFO,
            "No press mentions or 'as seen in' section detected.",
            "Add a media/press section with outlet logos — "
            "signals third-party authority without requiring new backlinks.",
            impact="Medium", effort="Medium"))

    # ── Partnership / client logos ────────────────────────────────────────────
    partner_signals = soup.find_all(attrs={
        "class": re.compile(r"(client|partner|customer|logo|trust.badge|brand)", re.I)
    })
    partner_text = re.search(
        r"\b(trusted by|used by|our clients|our customers|partners)\b", body_text, re.I
    )
    if partner_signals or partner_text:
        f.append(Finding("Off-Page", "Client/partner signals", Severity.PASS,
            "Client or partner logos/references detected — strong social proof and authority signal."))
    else:
        f.append(Finding("Off-Page", "Client/partner signals", Severity.INFO,
            "No client or partner logo/reference section detected.",
            "Add a 'Trusted by' or 'Our Clients' section to signal market authority.",
            impact="Low", effort="Medium"))

    # ── Outbound link quality ─────────────────────────────────────────────────
    external = [l for l in links if not l["internal"]]
    authoritative_refs = [
        l for l in external
        if any(ha in l.get("href", "") for ha in _HIGH_AUTHORITY)
    ]
    if authoritative_refs:
        f.append(Finding("Off-Page", "Outbound authority links", Severity.PASS,
            f"{len(authoritative_refs)} link(s) to high-authority external sources "
            "(gov, edu, Wikipedia, major publications)."))
    else:
        f.append(Finding("Off-Page", "Outbound authority links", Severity.INFO,
            "No links to high-authority external sources detected.",
            "Cite authoritative references (gov, edu, Wikipedia, Gartner, Forbes) — "
            "outbound authority links are a quality signal and increase GEO citability.",
            impact="Low", effort="Medium"))

    # ── Flags requiring external tools ───────────────────────────────────────
    ext_tool_checks = [
        ("Domain Authority / Rating",
         "Use Moz (DA) or Ahrefs (DR) to assess link authority. "
         "Target DA/DR >40 for competitive niches. Rising trend matters more than absolute number."),
        ("Backlink profile volume",
         "Check Ahrefs/SEMrush for referring domain count and dofollow ratio. "
         "Diversified domains > raw link count."),
        ("Toxic / spammy backlinks",
         "Run a toxicity check in Ahrefs or SEMrush. "
         "Disavow confirmed spam using Google's Disavow Tool."),
        ("Branded search volume",
         "Check Google Search Console for branded query impressions. "
         "Rising branded search = strengthening off-page authority."),
        ("NAP consistency (local SEO)",
         "Verify Name, Address, Phone is consistent across all local directories "
         "(Google Business Profile, Yelp, Justdial, Apple Maps)."),
        ("Google Business Profile",
         "Ensure GBP listing is claimed, verified, has recent posts and actively managed reviews."),
        ("Competitor backlink gap",
         "Use Ahrefs Link Intersect to find domains linking to competitors but not you — "
         "these are warm outreach targets."),
    ]
    for check_name, rec in ext_tool_checks:
        f.append(Finding("Off-Page", check_name, Severity.INFO,
            "Requires external tool data — cannot be audited via HTML crawl.",
            rec,
            impact="High", effort="Medium",
            external_data_needed=True))

    return report
