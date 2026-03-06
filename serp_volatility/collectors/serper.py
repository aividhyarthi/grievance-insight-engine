"""
Serper.dev SERP collector — cheapest option at $0.30/1K queries.
"""

import requests
from datetime import datetime, timezone

from .base import BaseSerpCollector, SerpResult


class SerperCollector(BaseSerpCollector):
    """Collect SERP data using Serper.dev API."""

    def fetch_serp(
        self,
        keyword: str,
        category: str,
        device: str = "desktop",
        num_results: int = 20,
    ) -> list[SerpResult]:
        headers = {
            "X-API-KEY": self.config.serp_api.api_key,
            "Content-Type": "application/json",
        }

        payload = {
            "q": keyword,
            "gl": self.config.country_code,
            "hl": self.config.language,
            "num": num_results,
        }

        # Serper doesn't have a direct mobile param, but we can set the
        # user agent type via the 'type' or device header
        if device == "mobile":
            payload["type"] = "search"
            # Serper uses a separate endpoint or param for mobile — we pass it
            # as a header hint; actual mobile SERP may need the paid tier
            headers["X-Device"] = "mobile"

        response = requests.post(
            self.config.serp_api.serper_api_url,
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()

        results = []
        now = datetime.now(timezone.utc)

        for item in data.get("organic", [])[:num_results]:
            position = item.get("position", 0)
            url = item.get("link", "")
            results.append(
                SerpResult(
                    keyword=keyword,
                    category=category,
                    position=position,
                    url=url,
                    title=item.get("title", ""),
                    domain=self._extract_domain(url),
                    device=device,
                    collected_at=now,
                    snippet=item.get("snippet"),
                )
            )

        return results
