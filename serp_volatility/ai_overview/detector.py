"""
AI Overview detector.

Given a keyword + target URL, queries the SERP API and determines:
  - Is AI Overview present?
  - Is the target URL cited in the AI Overview?
  - Which competitor domain/URL is the top citation?

Works with Serper.dev (primary) and can be extended to other providers.
"""

import json
import re
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

import requests

from ..keyword_sources.base import KeywordEntry


class AIOverviewDetector:
    """
    Detects AI Overview presence and citation data for a list of keywords.
    Uses Serper.dev API (cheapest option, $0.30/1K).
    """

    SERPER_URL = "https://google.serper.dev/search"

    def __init__(self, api_key: str, country: str = "in", language: str = "en"):
        self.api_key = api_key
        self.country = country
        self.language = language

    def check_keywords(
        self,
        entries: list[KeywordEntry],
        on_progress=None,
    ) -> list[KeywordEntry]:
        """
        Run AI Overview check for each keyword entry.
        Updates entries in-place and returns them.

        Args:
            entries: list of KeywordEntry objects
            on_progress: optional callback(current, total) for progress tracking
        """
        total = len(entries)
        for i, entry in enumerate(entries):
            if on_progress:
                on_progress(i, total)
            self._check_one(entry)

        if on_progress:
            on_progress(total, total)

        return entries

    def _check_one(self, entry: KeywordEntry) -> None:
        """Fetch SERP for one keyword and populate AI Overview fields."""
        try:
            data = self._fetch_serp(entry.keyword)
            entry.ai_overview_present = self._has_ai_overview(data)
            entry.last_checked = datetime.now(timezone.utc)

            if entry.ai_overview_present:
                citations = self._extract_citations(data)
                target_domain = self._domain(entry.target_url) if entry.target_url else None

                entry.you_cited = False
                for cite_url in citations:
                    if target_domain and self._domain(cite_url) == target_domain:
                        entry.you_cited = True
                        entry.your_cited_url = cite_url
                        break

                # First competitor citation (not your domain)
                for cite_url in citations:
                    if target_domain and self._domain(cite_url) != target_domain:
                        entry.competitor_cited_domain = self._domain(cite_url)
                        entry.competitor_cited_url = cite_url
                        break
                    elif not target_domain:
                        entry.competitor_cited_domain = self._domain(cite_url)
                        entry.competitor_cited_url = cite_url
                        break
            else:
                entry.you_cited = False

        except Exception as e:
            # Don't crash the whole batch on one failure
            entry.ai_overview_present = None
            entry.you_cited = None

    def _fetch_serp(self, keyword: str) -> dict:
        response = requests.post(
            self.SERPER_URL,
            headers={
                "X-API-KEY": self.api_key,
                "Content-Type": "application/json",
            },
            json={
                "q": keyword,
                "gl": self.country,
                "hl": self.language,
                "num": 10,
            },
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    def _has_ai_overview(data: dict) -> bool:
        """Detect AI Overview presence in Serper API response."""
        # Serper returns aiOverview key when AI Overview is present
        if data.get("aiOverview"):
            return True
        # Some responses nest it inside answerBox
        answer_box = data.get("answerBox", {})
        if answer_box.get("type") == "ai_overview":
            return True
        return False

    @staticmethod
    def _extract_citations(data: dict) -> list[str]:
        """
        Extract URLs cited in the AI Overview.
        Serper includes source links in aiOverview.sources or similar.
        """
        urls = []

        ai_overview = data.get("aiOverview", {})
        if not ai_overview:
            return urls

        # Serper format: aiOverview.sources = [{link, title}, ...]
        for source in ai_overview.get("sources", []):
            url = source.get("link") or source.get("url")
            if url:
                urls.append(url)

        # Fallback: links inside aiOverview text
        if not urls:
            text = json.dumps(ai_overview)
            urls = re.findall(r'https?://[^\s\'"<>]+', text)

        return urls

    @staticmethod
    def _domain(url: Optional[str]) -> Optional[str]:
        if not url:
            return None
        try:
            domain = urlparse(url).netloc
            return domain.lstrip("www.")
        except Exception:
            return None
