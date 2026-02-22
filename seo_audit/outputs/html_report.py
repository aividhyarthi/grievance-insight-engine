"""
html_report.py — Full multi-section HTML report.

Generates a single-file HTML report with tabs:
  1. Executive Summary / Proposal
  2. Detailed Findings (by category)
  3. Roadmap (prioritised action plan)
  4. Traffic Strategy
"""

from __future__ import annotations

import re
from pathlib import Path

from ..categories.base import Severity
from .models import AuditResult


_SEV_COLOR = {
    Severity.CRITICAL: "#e53e3e",
    Severity.WARNING:  "#d69e2e",
    Severity.INFO:     "#3182ce",
    Severity.PASS:     "#38a169",
}
_SEV_BG = {
    Severity.CRITICAL: "#fff5f5",
    Severity.WARNING:  "#fffff0",
    Severity.INFO:     "#ebf8ff",
    Severity.PASS:     "#f0fff4",
}


def _score_color(s: int) -> str:
    return "#38a169" if s >= 70 else ("#d69e2e" if s >= 45 else "#e53e3e")


def _md_to_html(text: str) -> str:
    """Minimal Markdown → HTML conversion."""
    text = re.sub(r"^#### (.+)$", r"<h4>\1</h4>", text, flags=re.MULTILINE)
    text = re.sub(r"^### (.+)$", r"<h3>\1</h3>", text, flags=re.MULTILINE)
    text = re.sub(r"^## (.+)$", r"<h2>\1</h2>", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"^- (.+)$", r"<li>\1</li>", text, flags=re.MULTILINE)
    text = re.sub(r"(<li>.*?</li>\n?)+", lambda m: f"<ul>{m.group(0)}</ul>", text, flags=re.DOTALL)
    text = text.replace("\n\n", "<br><br>").replace("\n", " ")
    return text


# ─── Section renderers ────────────────────────────────────────────────────────

def _summary_cards(result: AuditResult) -> str:
    sc = _score_color(result.overall_score)
    return f"""
    <div class="cards">
      <div class="card-stat">
        <div class="val" style="color:{sc};">{result.overall_score}</div>
        <div class="lbl">Overall Score</div>
      </div>
      <div class="card-stat">
        <div class="val" style="color:#e53e3e;">{len(result.critical_findings)}</div>
        <div class="lbl">Critical Issues</div>
      </div>
      <div class="card-stat">
        <div class="val" style="color:#d69e2e;">{len(result.warning_findings)}</div>
        <div class="lbl">Warnings</div>
      </div>
      <div class="card-stat">
        <div class="val" style="color:#3182ce;">{len(result.quick_wins)}</div>
        <div class="lbl">Quick Wins</div>
      </div>
      <div class="card-stat">
        <div class="val">{result.profile.label}</div>
        <div class="lbl">Site Type</div>
      </div>
    </div>"""


def _category_score_table(result: AuditResult) -> str:
    rows = []
    for cr in result.category_reports:
        sc = _score_color(cr.score)
        bar = cr.score
        rows.append(f"""
        <tr>
          <td style="padding:8px 12px;font-weight:600;">{cr.name}</td>
          <td style="padding:8px 12px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="flex:1;background:#e2e8f0;border-radius:4px;height:10px;">
                <div style="width:{bar}%;background:{sc};height:10px;border-radius:4px;"></div>
              </div>
              <span style="color:{sc};font-weight:700;min-width:38px;">{cr.score}/100</span>
            </div>
          </td>
          <td style="padding:8px 12px;color:#e53e3e;">{cr.critical_count} critical</td>
          <td style="padding:8px 12px;color:#d69e2e;">{cr.warning_count} warnings</td>
        </tr>""")
    return f"""
    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
      <thead><tr style="background:#edf2f7;">
        <th style="padding:10px 12px;text-align:left;">Category</th>
        <th style="padding:10px 12px;text-align:left;">Score</th>
        <th style="padding:10px 12px;text-align:left;">Critical</th>
        <th style="padding:10px 12px;text-align:left;">Warnings</th>
      </tr></thead>
      <tbody>{"".join(rows)}</tbody>
    </table>"""


def _findings_section(result: AuditResult) -> str:
    sections = []
    for cr in result.category_reports:
        rows = []
        for f in cr.findings:
            color = _SEV_COLOR[f.severity]
            bg = _SEV_BG[f.severity]
            rec_html = (
                f'<br><small style="color:#555;"><b>Fix:</b> {f.recommendation}</small>'
                if f.recommendation else ""
            )
            effort_badge = (
                f'<span style="font-size:0.7rem;background:#ebf8ff;color:#2b6cb0;'
                f'padding:1px 6px;border-radius:10px;margin-left:6px;">{f.effort}</span>'
                if f.effort else ""
            )
            impact_badge = (
                f'<span style="font-size:0.7rem;background:#fef3c7;color:#92400e;'
                f'padding:1px 6px;border-radius:10px;margin-left:4px;">Impact: {f.impact}</span>'
                if f.impact else ""
            )
            ext_badge = (
                '<span style="font-size:0.7rem;background:#faf5ff;color:#6b21a8;'
                'padding:1px 6px;border-radius:10px;margin-left:4px;">Needs ext. tool</span>'
                if f.external_data_needed else ""
            )
            rows.append(f"""
            <tr style="background:{bg};">
              <td style="padding:7px 10px;color:{color};font-weight:600;white-space:nowrap;font-size:0.8rem;">
                {f.severity.value.upper()}
              </td>
              <td style="padding:7px 10px;font-size:0.85rem;">{f.check}{effort_badge}{impact_badge}{ext_badge}</td>
              <td style="padding:7px 10px;font-size:0.85rem;">{f.detail}{rec_html}</td>
            </tr>""")

        sc = _score_color(cr.score)
        sections.append(f"""
        <div style="margin-bottom:32px;">
          <h3 style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            {cr.name}
            <span style="font-size:0.9rem;color:{sc};font-weight:700;">{cr.score}/100</span>
          </h3>
          <p style="color:#718096;font-size:0.85rem;margin:0 0 10px;">{cr.description}</p>
          <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
            <thead><tr style="background:#edf2f7;">
              <th style="padding:8px 10px;text-align:left;width:90px;">Severity</th>
              <th style="padding:8px 10px;text-align:left;width:240px;">Check</th>
              <th style="padding:8px 10px;text-align:left;">Detail / Recommendation</th>
            </tr></thead>
            <tbody>{"".join(rows)}</tbody>
          </table>
        </div>""")
    return "".join(sections)


def _custom_checklist(result: AuditResult) -> str:
    checks = result.profile.custom_checks
    if not checks:
        return ""
    items = "".join(
        f'<li style="margin-bottom:8px;"><b>{name}</b> — {rec}</li>'
        for name, rec in checks
    )
    return f"""
    <div style="margin-top:24px;">
      <h3>{result.profile.label} — Site-Type Checklist</h3>
      <ul style="line-height:1.8;">{items}</ul>
    </div>"""


def _roadmap_section(result: AuditResult) -> str:
    quick_wins = result.quick_wins
    high_impact = [f for f in result.high_impact_items if f not in quick_wins]
    long_term = [
        f for f in result.all_findings
        if f.effort == "Long-term" and f.severity in (Severity.CRITICAL, Severity.WARNING)
    ]

    def _item(f) -> str:
        color = _SEV_COLOR[f.severity]
        return (
            f'<li style="margin-bottom:10px;">'
            f'<span style="color:{color};font-weight:600;">[{f.severity.value.upper()}]</span> '
            f'<b>{f.category} — {f.check}</b><br>'
            f'<span style="color:#4a5568;">{f.detail}</span>'
            + (f'<br><em style="color:#2b6cb0;">Fix: {f.recommendation}</em>' if f.recommendation else "")
            + "</li>"
        )

    qw_html = "".join(_item(f) for f in quick_wins[:10]) if quick_wins else "<li>No quick wins identified.</li>"
    hi_html = "".join(_item(f) for f in high_impact[:10]) if high_impact else "<li>No additional high-impact items.</li>"
    lt_html = "".join(_item(f) for f in long_term[:10]) if long_term else "<li>No long-term items.</li>"

    ai_section = ""
    if result.ai_roadmap:
        ai_section = f"""
        <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-top:24px;">
          <h3>AI-Generated Roadmap Recommendations</h3>
          {_md_to_html(result.ai_roadmap)}
        </div>"""

    return f"""
    <div>
      <div style="background:#fff5f5;border-left:4px solid #e53e3e;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
        <h3 style="margin:0 0 12px;color:#c53030;">Phase 1 — Quick Wins (Week 1–2)</h3>
        <p style="color:#718096;font-size:0.85rem;margin:0 0 12px;">
          High-impact fixes that can be deployed immediately.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">{qw_html}</ul>
      </div>

      <div style="background:#fffff0;border-left:4px solid #d69e2e;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
        <h3 style="margin:0 0 12px;color:#b7791f;">Phase 2 — High Impact (Month 1–2)</h3>
        <p style="color:#718096;font-size:0.85rem;margin:0 0 12px;">
          Structural improvements with significant ranking/traffic impact.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">{hi_html}</ul>
      </div>

      <div style="background:#ebf8ff;border-left:4px solid #3182ce;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
        <h3 style="margin:0 0 12px;color:#2b6cb0;">Phase 3 — Long-Term Growth (Month 3–6)</h3>
        <p style="color:#718096;font-size:0.85rem;margin:0 0 12px;">
          Content, authority, and UX investments for compounding gains.
        </p>
        <ul style="line-height:1.8;padding-left:20px;">{lt_html}</ul>
      </div>

      {ai_section}
    </div>"""


def _traffic_strategy_section(result: AuditResult) -> str:
    profile_notes = result.profile.traffic_strategy_notes
    profile_items = "".join(f"<li>{n}</li>" for n in profile_notes)

    ai_section = ""
    if result.ai_traffic_strategy:
        ai_section = f"""
        <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-top:24px;">
          <h3>AI-Generated Traffic Strategy</h3>
          {_md_to_html(result.ai_traffic_strategy)}
        </div>"""

    return f"""
    <div>
      <div style="background:#f0fff4;border-left:4px solid #38a169;padding:16px 20px;border-radius:4px;margin-bottom:24px;">
        <h3 style="margin:0 0 12px;color:#276749;">
          Traffic Strategy for: {result.profile.label}
        </h3>
        <ul style="line-height:2;padding-left:20px;">{profile_items}</ul>
      </div>
      {ai_section}
    </div>"""


def _proposal_section(result: AuditResult) -> str:
    criticals = result.critical_findings
    warnings = result.warning_findings

    crit_html = "".join(
        f'<li style="margin-bottom:8px;">'
        f'<b>{f.category} — {f.check}:</b> {f.detail}'
        + (f' <em>(Fix: {f.recommendation})</em>' if f.recommendation else "")
        + '</li>'
        for f in criticals[:8]
    ) or "<li>No critical issues found.</li>"

    warn_html = "".join(
        f'<li style="margin-bottom:6px;"><b>{f.category} — {f.check}:</b> {f.detail}</li>'
        for f in warnings[:8]
    ) or "<li>No warnings found.</li>"

    ai_section = ""
    if result.ai_proposal:
        ai_section = f"""
        <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-top:24px;">
          <h3>AI-Generated Executive Summary</h3>
          {_md_to_html(result.ai_proposal)}
        </div>"""

    score = result.overall_score
    sc = _score_color(score)
    grade = "Needs Immediate Attention" if score < 45 else ("Needs Improvement" if score < 70 else "Good Foundation")

    return f"""
    <div>
      <div style="background:#edf2f7;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0;font-size:1rem;line-height:1.8;">
          This audit analysed <b>{result.url}</b> as a <b>{result.profile.label}</b> site
          across <b>12 SEO categories</b>. The overall SEO score is
          <b style="color:{sc};">{score}/100</b> — <b>{grade}</b>.
          The audit identified <b style="color:#e53e3e;">{len(criticals)} critical issues</b>
          and <b style="color:#d69e2e;">{len(warnings)} warnings</b>.
          Resolving the {len(result.quick_wins)} quick-win items alone could meaningfully
          improve rankings within 2–4 weeks.
        </p>
      </div>

      <h3 style="color:#c53030;">Critical Issues Requiring Immediate Action</h3>
      <ul style="line-height:1.9;padding-left:20px;color:#2d3748;">{crit_html}</ul>

      <h3 style="color:#b7791f;margin-top:24px;">Warnings to Address This Month</h3>
      <ul style="line-height:1.9;padding-left:20px;color:#2d3748;">{warn_html}</ul>

      {_custom_checklist(result)}
      {ai_section}
    </div>"""


# ─── Full HTML assembly ────────────────────────────────────────────────────────

def render_html(result: AuditResult) -> str:
    proposal_html = _proposal_section(result)
    findings_html = _findings_section(result)
    roadmap_html = _roadmap_section(result)
    traffic_html = _traffic_strategy_section(result)
    summary_cards = _summary_cards(result)
    cat_scores = _category_score_table(result)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>SEO Audit — {result.url}</title>
  <style>
    *,*::before,*::after{{box-sizing:border-box;}}
    body{{margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
         background:#f7fafc;color:#2d3748;font-size:15px;}}
    .wrap{{max-width:1100px;margin:0 auto;}}
    .header{{background:#1a202c;color:#fff;border-radius:12px;padding:28px 32px;margin-bottom:20px;}}
    .header h1{{margin:0 0 4px;font-size:1.5rem;}}
    .header .url{{color:#a0aec0;font-size:0.85rem;word-break:break-all;}}
    .cards{{display:flex;flex-wrap:wrap;gap:16px;margin:20px 0;}}
    .card-stat{{background:#fff;border-radius:8px;box-shadow:0 1px 6px rgba(0,0,0,.07);
                padding:16px 24px;text-align:center;min-width:120px;}}
    .card-stat .val{{font-size:2rem;font-weight:700;line-height:1;}}
    .card-stat .lbl{{font-size:0.72rem;color:#718096;margin-top:4px;}}
    .tabs{{display:flex;gap:0;border-bottom:2px solid #e2e8f0;margin-bottom:24px;flex-wrap:wrap;}}
    .tab{{padding:10px 20px;cursor:pointer;border:none;background:none;font-size:0.95rem;
          color:#718096;border-bottom:2px solid transparent;margin-bottom:-2px;}}
    .tab.active{{color:#2d3748;font-weight:600;border-bottom-color:#4299e1;}}
    .tab-content{{display:none;}}
    .tab-content.active{{display:block;}}
    .section-card{{background:#fff;border-radius:10px;box-shadow:0 1px 6px rgba(0,0,0,.07);
                   padding:28px 32px;margin-bottom:20px;}}
    h2{{font-size:1.2rem;margin:0 0 16px;}}
    h3{{font-size:1rem;margin:16px 0 10px;}}
    table td{{vertical-align:top;border-bottom:1px solid #e2e8f0;}}
    @media(max-width:600px){{.tabs{{gap:0;}}.tab{{padding:8px 12px;font-size:0.85rem;}}}}
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>SEO Audit Report</h1>
    <div class="url">{result.url}</div>
    <div style="margin-top:8px;font-size:0.8rem;color:#a0aec0;">
      Site type: {result.profile.label} &nbsp;|&nbsp; Generated by SEO Audit Tool
    </div>
  </div>

  {summary_cards}

  <div class="section-card" style="margin-bottom:16px;">
    <h2>Category Scores</h2>
    {cat_scores}
  </div>

  <div class="tabs">
    <button class="tab active" onclick="showTab('proposal',this)">Proposal / Summary</button>
    <button class="tab" onclick="showTab('findings',this)">Detailed Findings</button>
    <button class="tab" onclick="showTab('roadmap',this)">Roadmap</button>
    <button class="tab" onclick="showTab('traffic',this)">Traffic Strategy</button>
  </div>

  <div id="proposal" class="tab-content active section-card">
    <h2>Client Proposal — Audit Summary</h2>
    {proposal_html}
  </div>

  <div id="findings" class="tab-content section-card">
    <h2>Detailed Findings by Category</h2>
    {findings_html}
  </div>

  <div id="roadmap" class="tab-content section-card">
    <h2>High-Level Roadmap</h2>
    {roadmap_html}
  </div>

  <div id="traffic" class="tab-content section-card">
    <h2>Traffic Strategy</h2>
    {traffic_html}
  </div>

  <p style="text-align:center;color:#a0aec0;font-size:0.75rem;margin:24px 0 8px;">
    SEO Audit Tool · AI Vidhyarthi / Grievance Insight Engine project
  </p>
</div>

<script>
function showTab(id, btn) {{
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
}}
</script>
</body>
</html>"""


def save_html(result: AuditResult, path: str | Path) -> None:
    Path(path).write_text(render_html(result), encoding="utf-8")
