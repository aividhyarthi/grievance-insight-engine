"""
Base class for SERP data collectors.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


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
    ) -> list[SerpResult]:
        """Fetch SERP results for a keyword targeting India."""
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
