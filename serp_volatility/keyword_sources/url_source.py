"""
URL keyword source — finds all keywords a specific page ranks for via GSC.
"""

from .base import KeywordEntry, KeywordSource
from ..gsc.client import GSCClient


class URLKeywordSource(KeywordSource):
    """
    Given a page URL, discover all keywords it ranks for in GSC.
    The user pastes a URL; we return real Google data for that page.
    """

    def __init__(
        self,
        client: GSCClient,
        site_url: str,
        page_url: str,
        days: int = 28,
        max_keywords: int = 100,
    ):
        self.client = client
        self.site_url = site_url
        self.page_url = page_url
        self.days = days
        self.max_keywords = max_keywords

    def load(self) -> list[KeywordEntry]:
        return self.client.get_keywords_for_url(
            site_url=self.site_url,
            page_url=self.page_url,
            days=self.days,
            max_keywords=self.max_keywords,
        )
