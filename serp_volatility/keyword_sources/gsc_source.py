"""
GSC keyword source — pulls top keywords from Google Search Console.
"""

from .base import KeywordEntry, KeywordSource
from ..gsc.client import GSCClient


class GSCKeywordSource(KeywordSource):
    """Pull top keywords directly from a GSC property."""

    def __init__(
        self,
        client: GSCClient,
        site_url: str,
        days: int = 28,
        min_impressions: int = 10,
        max_keywords: int = 1000,
    ):
        self.client = client
        self.site_url = site_url
        self.days = days
        self.min_impressions = min_impressions
        self.max_keywords = max_keywords

    def load(self) -> list[KeywordEntry]:
        return self.client.get_keywords(
            site_url=self.site_url,
            days=self.days,
            min_impressions=self.min_impressions,
            max_keywords=self.max_keywords,
        )
