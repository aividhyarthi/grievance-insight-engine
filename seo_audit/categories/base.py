"""
base.py — Shared data structures for all SEO category checks.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Severity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"
    PASS = "pass"


@dataclass
class Finding:
    category: str
    check: str
    severity: Severity
    detail: str
    recommendation: Optional[str] = None
    impact: Optional[str] = None          # "High / Medium / Low" traffic impact
    effort: Optional[str] = None          # "Quick Win / Medium / Long-term"
    external_data_needed: bool = False    # True if needs Ahrefs/SEMrush etc.


@dataclass
class CategoryReport:
    name: str
    description: str
    findings: list[Finding] = field(default_factory=list)
    notes: str = ""

    @property
    def critical_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.CRITICAL)

    @property
    def warning_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.WARNING)

    @property
    def pass_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == Severity.PASS)

    @property
    def score(self) -> int:
        """0–100 score for this category."""
        base = 100
        base -= self.critical_count * 15
        base -= self.warning_count * 5
        return max(0, base)
