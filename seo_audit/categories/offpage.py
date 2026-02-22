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


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="SEO Off-Page",
        description=(
            "Off-page authority signals. Many checks here require external tools "
            "(Ahrefs, SEMrush, Moz) — flagged accordingly."
        ),
    )
    f = report.findings
    soup = page.soup
    links = page.links

    # ── Social proof links ────────────────────────────────────────────────────
    social_domains = re.compile(
        r"(twitter\.com|x\.com|linkedin\.com|facebook\.com|instagram\.com|"
        r"youtube\.com|pinterest\.com|tiktok\.com)", re.I)
    social_links = [l for l in links if social_domains.search(l["href"])]
    if social_links:
        platforms = list({social_domains.search(l["href"]).group(1) for l in social_links})
        f.append(Finding("Off-Page", "Social profile links", Severity.PASS,
            f"Links to social platforms: {', '.join(platforms)}"))
    else:
        f.append(Finding("Off-Page", "Social profile links", Severity.WARNING,
            "No links to social media profiles detected.",
            "Link to official social profiles to strengthen brand entity signals.",
            impact="Medium", effort="Quick Win"))

    # ── Press / Media mentions ────────────────────────────────────────────────
    press_signals = soup.find_all(
        attrs={"class": re.compile(r"press|media|featured.in|as.seen", re.I)})
    press_text = re.search(
        r"\b(as seen in|featured in|press|media coverage|award)\b",
        (soup.find("body") or soup).get_text(), re.I)
    if press_signals or press_text:
        f.append(Finding("Off-Page", "Press / media signals", Severity.PASS,
            "Press or 'as seen in' section detected — good trust signal for off-page authority."))
    else:
        f.append(Finding("Off-Page", "Press / media signals", Severity.INFO,
            "No press or media mention section.",
            "Add 'As seen in' logos or press coverage section to signal authority.",
            impact="Medium", effort="Medium"))

    # ── Outbound link quality ─────────────────────────────────────────────────
    external = [l for l in links if not l["internal"]]
    high_authority = ["wikipedia.org", "gov", "edu", ".ac.", "bbc.com", "reuters.com",
                      "forbes.com", "techcrunch.com", "nature.com", "pubmed"]
    authoritative_refs = [
        l for l in external
        if any(ha in l["href"] for ha in high_authority)
    ]
    if authoritative_refs:
        f.append(Finding("Off-Page", "Outbound authority links", Severity.PASS,
            f"{len(authoritative_refs)} link(s) to high-authority sources."))
    else:
        f.append(Finding("Off-Page", "Outbound authority links", Severity.INFO,
            "No links to high-authority external sources detected.",
            "Cite authoritative references (gov, edu, Wikipedia) to boost content credibility.",
            impact="Low", effort="Medium"))

    # ── Flags requiring external tools ───────────────────────────────────────
    ext_tool_checks = [
        ("Domain Authority / Rating", "Use Moz or Ahrefs to check DA/DR. Target DA>40 for competitive niches."),
        ("Backlink profile volume", "Use Ahrefs/SEMrush to audit total referring domains and dofollow ratio."),
        ("Toxic / spammy backlinks", "Run a backlink toxicity check in Ahrefs or SEMrush; disavow harmful links."),
        ("Branded search volume", "Check Google Search Console for branded queries — rising trend = strong off-page authority."),
        ("NAP consistency (local SEO)", "Verify Name, Address, Phone is consistent across all local directories (GMB, Yelp, Justdial)."),
        ("Google Business Profile", "Ensure GBP listing is claimed, verified, and has recent reviews."),
    ]
    for check_name, rec in ext_tool_checks:
        f.append(Finding("Off-Page", check_name, Severity.INFO,
            f"⚠ Requires external tool — cannot be audited via crawl.",
            rec,
            impact="High", effort="Medium",
            external_data_needed=True))

    return report
