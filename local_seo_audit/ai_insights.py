"""
AI-powered insights via Claude (claude-opus-4-6).

Accepts an AuditResult and returns a structured improvement plan:
  - executive_summary  – 2-3 sentence overall assessment
  - priority_fixes     – top 3 quick-win actions ranked by impact
  - growth_strategy    – medium-term recommendations (30-90 day)
  - competitor_note    – what strong local competitors typically do differently
"""

import os
import json
import anthropic
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .auditor import AuditResult

SYSTEM_PROMPT = """\
You are an expert Local SEO consultant who specialises in Google My Business (GMB) \
optimisation and Google Maps ranking factors. You give clear, actionable advice \
tailored to the specific gaps found in a business's GMB listing audit.

Always structure your response as valid JSON matching exactly this schema:
{
  "executive_summary": "<2-3 sentence plain-English assessment>",
  "priority_fixes": [
    {"rank": 1, "action": "<short title>", "why": "<1-2 sentences>", "how": "<concrete step>"},
    {"rank": 2, "action": "<short title>", "why": "<1-2 sentences>", "how": "<concrete step>"},
    {"rank": 3, "action": "<short title>", "why": "<1-2 sentences>", "how": "<concrete step>"}
  ],
  "growth_strategy": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>"
  ],
  "competitor_note": "<one paragraph on what high-ranking local competitors typically do that this listing is missing>"
}
Do NOT include markdown fences — return raw JSON only."""


def _build_audit_summary(result: "AuditResult") -> str:
    lines = [
        f"Business: {result.business_name}",
        f"Overall SEO Score: {result.overall_score}/100  (Grade: {result.grade})",
        f"Google Maps URL: {result.google_maps_url}",
        "",
        "Signal breakdown:",
    ]
    for s in result.signals:
        status_icon = {"good": "✓", "warn": "⚠", "bad": "✗"}.get(s.status, "?")
        lines.append(
            f"  {status_icon} [{s.score}/{s.max_score}] {s.name}: {s.detail}"
        )
        if s.status != "good":
            lines.append(f"       Tip: {s.recommendation}")
    return "\n".join(lines)


def get_ai_insights(result: "AuditResult", api_key: str | None = None) -> dict:
    """
    Call Claude claude-opus-4-6 to generate an improvement plan for the audited listing.

    Returns a dict with keys:
      executive_summary, priority_fixes, growth_strategy, competitor_note
    """
    key = api_key or os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        raise ValueError(
            "Anthropic API key required for AI insights.\n"
            "Set env var ANTHROPIC_API_KEY=<your-key> or pass api_key=<key>."
        )

    client = anthropic.Anthropic(api_key=key)
    audit_text = _build_audit_summary(result)

    user_message = (
        f"Here is the Local SEO audit for a business listing:\n\n"
        f"{audit_text}\n\n"
        "Based on these findings, provide your expert analysis and improvement plan."
    )

    with client.messages.stream(
        model="claude-opus-4-6",
        max_tokens=2048,
        thinking={"type": "adaptive"},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    ) as stream:
        final = stream.get_final_message()

    # Extract the text block (thinking blocks are separate)
    raw_json = next(
        (block.text for block in final.content if block.type == "text"),
        "{}"
    )

    try:
        return json.loads(raw_json)
    except json.JSONDecodeError:
        # Fallback: return raw text in a structured wrapper
        return {
            "executive_summary": raw_json,
            "priority_fixes": [],
            "growth_strategy": [],
            "competitor_note": "",
        }
