"""
Unified data model for keywords from any source.
All keyword sources (GSC, Excel, URL) produce KeywordEntry objects.
"""

from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

# CTR benchmarks by SERP position (Backlinko/AWR studies)
CTR_BENCHMARKS = {
    1: 0.316, 2: 0.158, 3: 0.110, 4: 0.082, 5: 0.065,
    6: 0.052, 7: 0.043, 8: 0.036, 9: 0.030, 10: 0.026,
    11: 0.019, 12: 0.016, 13: 0.014, 14: 0.012, 15: 0.010,
    16: 0.009, 17: 0.008, 18: 0.007, 19: 0.006, 20: 0.005,
}

# AI Overview reduces CTR by ~60% for positions 1-3 (conservative estimate)
AI_OVERVIEW_CTR_REDUCTION = 0.60


@dataclass
class KeywordEntry:
    """A single keyword being tracked — regardless of how it was added."""

    # Core fields (always present)
    keyword: str
    source: str           # "gsc" | "excel" | "url_input"
    target_url: Optional[str] = None

    # GSC data (populated after GSC enrichment)
    impressions: Optional[int] = None        # monthly impressions
    clicks: Optional[int] = None             # monthly clicks
    ctr: Optional[float] = None              # actual CTR (0.0 - 1.0)
    position: Optional[float] = None         # average position

    # AI Overview data (populated after SERP scraping)
    ai_overview_present: Optional[bool] = None
    you_cited: Optional[bool] = None         # is your target_url cited?
    your_cited_url: Optional[str] = None     # exact URL cited (may differ from target_url)
    competitor_cited_domain: Optional[str] = None  # top competitor domain cited
    competitor_cited_url: Optional[str] = None

    # Tracking metadata
    last_checked: Optional[datetime] = None
    gsc_date_range: Optional[str] = None     # e.g. "last_28_days"

    def expected_ctr(self) -> Optional[float]:
        """Benchmark CTR for this keyword's current position (no AI Overview)."""
        if self.position is None:
            return None
        pos = max(1, min(20, round(self.position)))
        return CTR_BENCHMARKS.get(pos, 0.005)

    def traffic_loss_monthly(self) -> Optional[int]:
        """
        Estimated monthly visits lost due to AI Overview.
        Only meaningful when ai_overview_present=True and we have GSC data.
        """
        if not self.ai_overview_present:
            return 0
        if self.impressions is None or self.position is None:
            return None
        benchmark = self.expected_ctr()
        if benchmark is None:
            return None
        # Actual CTR gap vs benchmark
        actual = self.ctr or 0.0
        gap = max(0.0, benchmark - actual)
        return round(gap * self.impressions)

    def expected_monthly_traffic(self) -> Optional[int]:
        """What monthly traffic should look like without AI Overview."""
        if self.impressions is None or self.position is None:
            return None
        benchmark = self.expected_ctr()
        if benchmark is None:
            return None
        return round(benchmark * self.impressions)

    def to_dict(self) -> dict:
        return {
            "keyword": self.keyword,
            "source": self.source,
            "target_url": self.target_url,
            "impressions": self.impressions,
            "clicks": self.clicks,
            "ctr_pct": round(self.ctr * 100, 2) if self.ctr is not None else None,
            "position": round(self.position, 1) if self.position is not None else None,
            "ai_overview": self.ai_overview_present,
            "you_cited": self.you_cited,
            "your_cited_url": self.your_cited_url,
            "competitor_cited": self.competitor_cited_domain,
            "expected_ctr_pct": round(self.expected_ctr() * 100, 2) if self.expected_ctr() else None,
            "traffic_loss_monthly": self.traffic_loss_monthly(),
            "expected_monthly_traffic": self.expected_monthly_traffic(),
            "last_checked": self.last_checked.isoformat() if self.last_checked else None,
        }


class KeywordSource:
    """Base interface for keyword sources."""

    def load(self) -> list[KeywordEntry]:
        raise NotImplementedError
