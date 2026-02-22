"""
models.py — The central AuditResult that holds all category reports + metadata.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from ..categories.base import CategoryReport, Finding, Severity
from ..site_types.profiles import SiteProfile, SiteType


@dataclass
class AuditResult:
    url: str
    site_type: SiteType
    profile: SiteProfile
    category_reports: list[CategoryReport] = field(default_factory=list)
    ai_proposal: str = ""         # AI-generated client proposal narrative
    ai_roadmap: str = ""          # AI-generated roadmap narrative
    ai_traffic_strategy: str = "" # AI-generated traffic strategy narrative

    @property
    def all_findings(self) -> list[Finding]:
        return [f for cr in self.category_reports for f in cr.findings]

    @property
    def critical_findings(self) -> list[Finding]:
        return [f for f in self.all_findings if f.severity == Severity.CRITICAL]

    @property
    def warning_findings(self) -> list[Finding]:
        return [f for f in self.all_findings if f.severity == Severity.WARNING]

    @property
    def overall_score(self) -> int:
        if not self.category_reports:
            return 0
        weights = self.profile.category_weights
        total_weight = 0.0
        weighted_sum = 0.0
        for cr in self.category_reports:
            w = weights.get(cr.name, 1.0)
            weighted_sum += cr.score * w
            total_weight += w
        return max(0, min(100, round(weighted_sum / total_weight))) if total_weight else 0

    def get_category(self, name: str) -> Optional[CategoryReport]:
        for cr in self.category_reports:
            if cr.name == name:
                return cr
        return None

    @property
    def quick_wins(self) -> list[Finding]:
        return [
            f for f in self.all_findings
            if f.effort == "Quick Win" and f.severity in (Severity.CRITICAL, Severity.WARNING)
        ]

    @property
    def high_impact_items(self) -> list[Finding]:
        return [
            f for f in self.all_findings
            if f.impact == "High" and f.severity in (Severity.CRITICAL, Severity.WARNING)
        ]
