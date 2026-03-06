"""
SerpAPI collector — most established provider, supports India locations.
"""

import requests
from datetime import datetime, timezone

from .base import BaseSerpCollector, SerpResult


class SerpAPICollector(BaseSerpCollector):
    """Collect SERP data using SerpAPI."""

    def fetch_serp(
        self,
        keyword: str,
        category: str,
        device: str = "desktop",
        num_results: int = 20,
    ) -> list[SerpResult]:
        params = {
            "engine": "google",
            "q": keyword,
            "google_domain": self.config.google_domain,
            "gl": self.config.country_code,
            "hl": self.config.language,
            "num": num_results,
            "api_key": self.config.serp_api.api_key,
        }

        if device == "mobile":
            params["device"] = "mobile"

        response = requests.get(
            self.config.serp_api.serpapi_url,
            params=params,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()

        results = []
        now = datetime.now(timezone.utc)

        for i, item in enumerate(data.get("organic_results", [])[:num_results], 1):
            url = item.get("link", "")
            results.append(
                SerpResult(
                    keyword=keyword,
                    category=category,
                    position=item.get("position", i),
                    url=url,
                    title=item.get("title", ""),
                    domain=self._extract_domain(url),
                    device=device,
                    collected_at=now,
                    snippet=item.get("snippet"),
                )
            )

        return results
