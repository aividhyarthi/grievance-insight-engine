"""
Base class for SERP data collectors.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


# All SERP feature types we track
SERP_FEATURE_TYPES = [
    "ai_overview",       # Google AI Overview / SGE
    "featured_snippet",  # Answer box / featured snippet
    "top_stories",       # News carousel
    "people_also_ask",   # PAA boxes
    "knowledge_panel",   # Knowledge graph card
    "local_pack",        # Local 3-pack map results
    "shopping",          # Shopping carousel / Product Listing Ads
    "image_pack",        # Inline image results
    "video",             # Video results
]


@dataclass
class SerpFeature:
    """A SERP feature detected for a keyword."""
    keyword: str
    category: str
    device: str
    feature_type: str      # one of SERP_FEATURE_TYPES
    collected_at: datetime
    count: int = 1         # number of items (e.g. 5 top stories)
    feature_data: Optional[str] = None  # JSON blob with extra info


@dataclass
class SerpResult:
    """A single SERP result entry."""
    keyword: str
    category: str
    position: int
    url: str
    title: str
    domain: str
    device: str  # desktop or mobile
    collected_at: datetime
    country: str = "IN"
    snippet: Optional[str] = None


class BaseSerpCollector(ABC):
    """Abstract base class for SERP data collection."""

    def __init__(self, config):
        self.config = config

    @abstractmethod
    def fetch_serp(
        self,
        keyword: str,
        category: str,
        device: str = "desktop",
        num_results: int = 20,
    ) -> tuple[list[SerpResult], list[SerpFeature]]:
        """Fetch SERP results + detected features for a keyword targeting India."""
        ...

    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        from urllib.parse import urlparse
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            if domain.startswith("www."):
                domain = domain[4:]
            return domain
        except Exception:
            return url
