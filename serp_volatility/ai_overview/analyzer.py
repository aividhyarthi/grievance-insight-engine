"""
AI Overview impact analyzer.

Aggregates KeywordEntry data into summary metrics:
  - Total keywords tracked
  - % with AI Overview present
  - Estimated monthly traffic loss
  - Which competitors are winning AI Overview citations
"""

from collections import Counter
from typing import Optional

import pandas as pd

from ..keyword_sources.base import KeywordEntry


class AIOverviewAnalyzer:
    """Compute summary stats and DataFrames from a list of KeywordEntry objects."""

    def __init__(self, entries: list[KeywordEntry]):
        self.entries = entries

    def summary(self) -> dict:
        """High-level KPI dict for the dashboard header."""
        total = len(self.entries)
        checked = [e for e in self.entries if e.ai_overview_present is not None]
        with_aio = [e for e in checked if e.ai_overview_present]
        you_cited = [e for e in with_aio if e.you_cited]

        total_loss = sum(
            e.traffic_loss_monthly() or 0
            for e in with_aio
            if e.impressions is not None
        )
        total_expected = sum(
            e.expected_monthly_traffic() or 0
            for e in self.entries
            if e.impressions is not None
        )

        return {
            "total_keywords": total,
            "checked": len(checked),
            "ai_overview_count": len(with_aio),
            "ai_overview_pct": round(len(with_aio) / len(checked) * 100, 1) if checked else 0,
            "you_cited_count": len(you_cited),
            "you_cited_pct": round(len(you_cited) / len(with_aio) * 100, 1) if with_aio else 0,
            "monthly_traffic_loss": total_loss,
            "monthly_expected_traffic": total_expected,
            "traffic_loss_pct": round(total_loss / total_expected * 100, 1) if total_expected else 0,
        }

    def competitor_citations(self, top_n: int = 10) -> pd.DataFrame:
        """Which competitor domains are most cited in AI Overviews for your keywords."""
        domains = [
            e.competitor_cited_domain
            for e in self.entries
            if e.competitor_cited_domain
        ]
        counts = Counter(domains).most_common(top_n)
        return pd.DataFrame(counts, columns=["domain", "ai_overview_citations"])

    def to_dataframe(self) -> pd.DataFrame:
        """Full keyword table as a DataFrame."""
        rows = [e.to_dict() for e in self.entries]
        if not rows:
            return pd.DataFrame()

        df = pd.DataFrame(rows)

        # Friendly column names for display
        col_rename = {
            "keyword": "Keyword",
            "source": "Source",
            "target_url": "Target URL",
            "impressions": "Impressions",
            "clicks": "Clicks",
            "ctr_pct": "Actual CTR %",
            "position": "Avg Position",
            "ai_overview": "AI Overview",
            "you_cited": "You Cited",
            "your_cited_url": "Your Cited URL",
            "competitor_cited": "Competitor Cited",
            "expected_ctr_pct": "Expected CTR %",
            "traffic_loss_monthly": "Traffic Loss/Month",
            "expected_monthly_traffic": "Expected Traffic/Month",
            "last_checked": "Last Checked",
        }
        return df.rename(columns=col_rename)

    def at_risk_keywords(self, min_impressions: int = 100) -> list[KeywordEntry]:
        """
        Keywords with AI Overview present, you NOT cited,
        and meaningful impression volume — the highest priority to fix.
        """
        return [
            e for e in self.entries
            if e.ai_overview_present
            and not e.you_cited
            and (e.impressions or 0) >= min_impressions
        ]
