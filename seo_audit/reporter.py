"""
reporter.py — Renders an SEOReport as a JSON dict or a self-contained HTML file.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from .analyzer import SEOReport, Severity


# ─── JSON ─────────────────────────────────────────────────────────────────────

def to_dict(report: SEOReport) -> dict:
    return {
        "url": report.url,
        "status_code": report.status_code,
        "load_time_ms": report.load_time_ms,
        "score": report.score,
        "summary": {
            "critical": report.critical_count,
            "warnings": report.warning_count,
            "passed": report.pass_count,
        },
        "ai_insights": report.ai_insights,
        "findings": [
            {
                "category": f.category,
                "check": f.check,
                "severity": f.severity.value,
                "detail": f.detail,
                "recommendation": f.recommendation,
            }
            for f in report.findings
        ],
    }


def save_json(report: SEOReport, path: str | Path) -> None:
    Path(path).write_text(json.dumps(to_dict(report), indent=2, ensure_ascii=False))


# ─── HTML ─────────────────────────────────────────────────────────────────────

_SEVERITY_COLOR = {
    Severity.CRITICAL: "#e53e3e",
    Severity.WARNING: "#d69e2e",
    Severity.INFO: "#3182ce",
    Severity.PASS: "#38a169",
}

_SEVERITY_BG = {
    Severity.CRITICAL: "#fff5f5",
    Severity.WARNING: "#fffff0",
    Severity.INFO: "#ebf8ff",
    Severity.PASS: "#f0fff4",
}


def _score_color(score: int) -> str:
    if score >= 80:
        return "#38a169"
    if score >= 50:
        return "#d69e2e"
    return "#e53e3e"


def _findings_rows(report: SEOReport) -> str:
    rows = []
    for f in report.findings:
        color = _SEVERITY_COLOR[f.severity]
        bg = _SEVERITY_BG[f.severity]
        rec_html = (
            f'<br><small style="color:#555;"><b>Fix:</b> {f.recommendation}</small>'
            if f.recommendation
            else ""
        )
        rows.append(f"""
        <tr style="background:{bg};">
          <td style="padding:8px 12px;color:{color};font-weight:600;white-space:nowrap;">
            {f.severity.value.upper()}
          </td>
          <td style="padding:8px 12px;">{f.category}</td>
          <td style="padding:8px 12px;">{f.check}</td>
          <td style="padding:8px 12px;">{f.detail}{rec_html}</td>
        </tr>""")
    return "\n".join(rows)


def _ai_section(report: SEOReport) -> str:
    if not report.ai_insights:
        return ""
    # Very basic Markdown → HTML (bold, italic, headings, lists)
    import re
    text = report.ai_insights
    text = re.sub(r"^#### (.+)$", r"<h4>\1</h4>", text, flags=re.MULTILINE)
    text = re.sub(r"^### (.+)$", r"<h3>\1</h3>", text, flags=re.MULTILINE)
    text = re.sub(r"^## (.+)$", r"<h2>\1</h2>", text, flags=re.MULTILINE)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"^- (.+)$", r"<li>\1</li>", text, flags=re.MULTILINE)
    text = re.sub(r"(<li>.*</li>\n?)+", r"<ul>\g<0></ul>", text, flags=re.DOTALL)
    text = text.replace("\n\n", "<br><br>")
    return f"""
    <section style="margin-top:40px;">
      <h2 style="font-size:1.3rem;color:#2d3748;">AI-Powered Insights</h2>
      <div style="background:#fafafa;border:1px solid #e2e8f0;border-radius:8px;
                  padding:20px 24px;line-height:1.7;color:#2d3748;">
        {text}
      </div>
    </section>"""


def to_html(report: SEOReport) -> str:
    score = report.score
    sc = _score_color(score)
    findings_html = _findings_rows(report)
    ai_html = _ai_section(report)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SEO Audit — {report.url}</title>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{
      margin: 0; padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f7fafc; color: #2d3748; font-size: 15px;
    }}
    .card {{
      max-width: 1000px; margin: 0 auto;
      background: #fff; border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,.08); padding: 32px;
    }}
    h1 {{ font-size: 1.6rem; margin: 0 0 4px; }}
    .url {{ color: #718096; font-size: 0.9rem; word-break: break-all; }}
    .meta {{ display: flex; gap: 24px; margin: 24px 0; flex-wrap: wrap; }}
    .stat {{ text-align: center; }}
    .stat .val {{ font-size: 2.4rem; font-weight: 700; line-height: 1; }}
    .stat .lbl {{ font-size: 0.78rem; color: #718096; margin-top: 4px; }}
    table {{
      width: 100%; border-collapse: collapse; margin-top: 24px;
      font-size: 0.9rem;
    }}
    thead tr {{ background: #edf2f7; }}
    th {{ text-align: left; padding: 10px 12px; font-weight: 600; }}
    td {{ vertical-align: top; border-bottom: 1px solid #e2e8f0; }}
    @media (max-width: 600px) {{
      .meta {{ flex-direction: column; }}
      table, thead, tbody, th, td, tr {{ display: block; }}
      thead {{ display: none; }}
      td::before {{ content: attr(data-label); font-weight: 600; margin-right: 6px; }}
    }}
  </style>
</head>
<body>
<div class="card">
  <h1>SEO Audit Report</h1>
  <p class="url">{report.url}</p>

  <div class="meta">
    <div class="stat">
      <div class="val" style="color:{sc};">{score}</div>
      <div class="lbl">SEO Score / 100</div>
    </div>
    <div class="stat">
      <div class="val" style="color:#e53e3e;">{report.critical_count}</div>
      <div class="lbl">Critical Issues</div>
    </div>
    <div class="stat">
      <div class="val" style="color:#d69e2e;">{report.warning_count}</div>
      <div class="lbl">Warnings</div>
    </div>
    <div class="stat">
      <div class="val" style="color:#38a169;">{report.pass_count}</div>
      <div class="lbl">Passed Checks</div>
    </div>
    <div class="stat">
      <div class="val">{report.load_time_ms} ms</div>
      <div class="lbl">Load Time</div>
    </div>
    <div class="stat">
      <div class="val">{report.status_code}</div>
      <div class="lbl">HTTP Status</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Severity</th><th>Category</th><th>Check</th><th>Detail / Fix</th>
      </tr>
    </thead>
    <tbody>
      {findings_html}
    </tbody>
  </table>

  {ai_html}

  <p style="margin-top:40px;font-size:0.78rem;color:#a0aec0;text-align:center;">
    Generated by <b>SEO Audit Tool</b> · Grievance Insight Engine project
  </p>
</div>
</body>
</html>"""


def save_html(report: SEOReport, path: str | Path) -> None:
    Path(path).write_text(to_html(report), encoding="utf-8")
