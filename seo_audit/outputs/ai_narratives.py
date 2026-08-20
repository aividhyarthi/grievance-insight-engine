"""
ai_narratives.py — Claude-powered narratives for all three report sections.
Generates: Client Proposal, Roadmap, and Traffic Strategy.
"""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import AuditResult
    from ..crawler import PageData


def _findings_summary(result: "AuditResult") -> str:
    lines = [
        f"URL: {result.url}",
        f"Site type: {result.profile.label}",
        f"Overall score: {result.overall_score}/100",
        f"Critical issues: {len(result.critical_findings)}",
        f"Warnings: {len(result.warning_findings)}",
        "",
        "=== TOP CRITICAL ISSUES ===",
    ]
    for f in result.critical_findings[:8]:
        lines.append(f"- [{f.category}] {f.check}: {f.detail}")
        if f.recommendation:
            lines.append(f"  Fix: {f.recommendation}")

    lines += ["", "=== TOP WARNINGS ==="]
    for f in result.warning_findings[:8]:
        lines.append(f"- [{f.category}] {f.check}: {f.detail}")

    lines += ["", "=== CATEGORY SCORES ==="]
    for cr in result.category_reports:
        lines.append(f"- {cr.name}: {cr.score}/100")

    return "\n".join(lines)


_PROPOSAL_SYSTEM = """\
You are a senior SEO consultant writing a concise executive summary proposal for a client.
The client is non-technical. Write in plain, professional language.
Structure your response as:
1. **Executive Summary** (2–3 sentences on overall health)
2. **Top 3 Issues** (brief, non-jargon explanation of why each hurts the business)
3. **Expected Impact** (what improving these issues could mean for traffic/revenue)
4. **Our Recommendation** (1 sentence compelling call-to-action)
Keep the total under 400 words. No bullet points inside the numbered sections — use short paragraphs.
"""

_ROADMAP_SYSTEM = """\
You are a senior SEO strategist creating a prioritised action roadmap.
Based on the audit findings, create a phased roadmap:
- **Phase 1 — Quick Wins (Week 1–2):** List 3–5 fast fixes with highest ROI.
- **Phase 2 — Core Improvements (Month 1–2):** List 3–5 structural changes.
- **Phase 3 — Long-Term Growth (Month 3–6):** List 3–5 compounding investments.
For each item state: what to do, why it matters, and rough effort level.
Be specific and actionable. Keep total under 500 words.
"""

_TRAFFIC_SYSTEM = """\
You are a growth-focused SEO and content strategist.
Based on the site type and audit findings, create a traffic strategy with:
1. **Primary Traffic Channels** to focus on (organic search, social, referral etc.)
2. **Top 3 Content Opportunities** — specific content types/topics to create
3. **Quick Traffic Wins** — 3 things they can do in the next 30 days
4. **6-Month Traffic Goal** — a realistic, data-informed growth target
Be specific to the site type. Avoid generic advice. Keep under 450 words.
"""


def _call_claude(system: str, user_content: str) -> str:
    try:
        import anthropic
    except ImportError:
        return ""

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return ""

    client = anthropic.Anthropic(api_key=api_key)
    msg = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=700,
        system=system,
        messages=[{"role": "user", "content": user_content}],
    )
    return msg.content[0].text.strip()


def generate_all(result: "AuditResult", page: "PageData") -> None:
    """
    Populate result.ai_proposal, result.ai_roadmap, result.ai_traffic_strategy.
    Mutates result in-place. Safe to call even without API key (fields stay empty).
    """
    summary = _findings_summary(result)
    page_snippet = (
        (page.soup.find("body") or page.soup).get_text(separator=" ", strip=True)[:1000]
    )
    context = f"{summary}\n\n=== PAGE CONTENT SNIPPET ===\n{page_snippet}"

    result.ai_proposal = _call_claude(_PROPOSAL_SYSTEM, context)
    result.ai_roadmap = _call_claude(_ROADMAP_SYSTEM, summary)
    result.ai_traffic_strategy = _call_claude(
        _TRAFFIC_SYSTEM,
        f"Site type: {result.profile.label}\n{summary}"
    )
