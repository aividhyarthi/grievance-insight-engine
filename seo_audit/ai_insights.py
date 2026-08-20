"""
ai_insights.py — Claude-powered narrative SEO recommendations.

Requires ANTHROPIC_API_KEY to be set in the environment.
If the SDK is not installed or the key is missing the function
gracefully returns an empty string so the rest of the tool keeps working.
"""

from __future__ import annotations

import os
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .analyzer import SEOReport
    from .crawler import PageData


_SYSTEM_PROMPT = """\
You are an expert SEO consultant. You will be given a structured SEO audit
report for a webpage and a snippet of the page's visible content.

Your job is to:
1. Highlight the three most impactful issues from the findings.
2. Explain *why* each issue hurts search rankings in plain language.
3. Give one concrete, actionable fix for each issue.
4. Close with a one-sentence "priority action" the site owner should do today.

Format your response in clear Markdown with short paragraphs.
Do not repeat information that is already obvious from the findings table.
Focus on actionable insight, not general SEO theory.
"""


def _build_user_prompt(report: "SEOReport", page: "PageData") -> str:
    lines = [
        f"## SEO Audit — {report.url}",
        f"**Score:** {report.score}/100  |  "
        f"**Critical:** {report.critical_count}  |  "
        f"**Warnings:** {report.warning_count}",
        "",
        "### Findings",
    ]
    for f in report.findings:
        lines.append(
            f"- [{f.severity.upper()}] {f.category} › {f.check}: {f.detail}"
        )

    lines += [
        "",
        "### Page Content Snippet",
        page.content_text or "(no visible body text)",
    ]
    return "\n".join(lines)


def get_ai_insights(report: "SEOReport", page: "PageData") -> str:
    """
    Call Claude to generate a narrative SEO insights section.
    Returns an empty string if the SDK/key is unavailable.
    """
    try:
        import anthropic  # optional dependency
    except ImportError:
        return "(Install `anthropic` and set ANTHROPIC_API_KEY to enable AI insights.)"

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return "(Set ANTHROPIC_API_KEY to enable AI insights.)"

    client = anthropic.Anthropic(api_key=api_key)

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": _build_user_prompt(report, page)}
        ],
    )

    return message.content[0].text.strip()
