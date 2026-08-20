"""json_report.py — Machine-readable JSON export of AuditResult."""

from __future__ import annotations

import json
from pathlib import Path

from .models import AuditResult


def to_dict(result: AuditResult) -> dict:
    return {
        "url": result.url,
        "site_type": result.site_type.value,
        "overall_score": result.overall_score,
        "summary": {
            "critical": len(result.critical_findings),
            "warnings": len(result.warning_findings),
            "quick_wins": len(result.quick_wins),
        },
        "ai_proposal": result.ai_proposal,
        "ai_roadmap": result.ai_roadmap,
        "ai_traffic_strategy": result.ai_traffic_strategy,
        "categories": [
            {
                "name": cr.name,
                "score": cr.score,
                "critical": cr.critical_count,
                "warnings": cr.warning_count,
                "passed": cr.pass_count,
                "findings": [
                    {
                        "check": f.check,
                        "severity": f.severity.value,
                        "detail": f.detail,
                        "recommendation": f.recommendation,
                        "impact": f.impact,
                        "effort": f.effort,
                        "external_data_needed": f.external_data_needed,
                    }
                    for f in cr.findings
                ],
            }
            for cr in result.category_reports
        ],
        "custom_checklist": [
            {"check": name, "recommendation": rec}
            for name, rec in result.profile.custom_checks
        ],
        "traffic_strategy_notes": result.profile.traffic_strategy_notes,
    }


def save_json(result: AuditResult, path: str | Path) -> None:
    Path(path).write_text(json.dumps(to_dict(result), indent=2, ensure_ascii=False))
