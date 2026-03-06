"""
SerpAPI collector — most established provider, supports India locations.
"""

import json
import requests
from datetime import datetime, timezone

from .base import BaseSerpCollector, SerpFeature, SerpResult


class SerpAPICollector(BaseSerpCollector):
    """Collect SERP data using SerpAPI."""

    def fetch_serp(
        self,
        keyword: str,
        category: str,
        device: str = "desktop",
        num_results: int = 20,
    ) -> tuple[list[SerpResult], list[SerpFeature]]:
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

        now = datetime.now(timezone.utc)
        results = []

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

        features = self._parse_features(data, keyword, category, device, now)
        return results, features

    def _parse_features(
        self, data: dict, keyword: str, category: str, device: str, now: datetime
    ) -> list[SerpFeature]:
        features = []

        def add(feature_type: str, count: int = 1, extra: dict = None):
            features.append(SerpFeature(
                keyword=keyword,
                category=category,
                device=device,
                feature_type=feature_type,
                collected_at=now,
                count=count,
                feature_data=json.dumps(extra) if extra else None,
            ))

        # AI Overview
        if data.get("ai_overview"):
            add("ai_overview", extra={"source": "serpapi"})

        # Answer Box / Featured Snippet
        answer_box = data.get("answer_box")
        if answer_box and not data.get("ai_overview"):
            add("featured_snippet", extra={"type": answer_box.get("type", "snippet"), "title": answer_box.get("title", "")})

        # Knowledge Graph
        if data.get("knowledge_graph"):
            kg = data["knowledge_graph"]
            add("knowledge_panel", extra={"title": kg.get("title", ""), "type": kg.get("type", "")})

        # Top Stories
        top_stories = data.get("top_stories", [])
        if top_stories:
            add("top_stories", count=len(top_stories))

        # People Also Ask
        paa = data.get("related_questions", [])
        if paa:
            add("people_also_ask", count=len(paa))

        # Shopping
        shopping = data.get("shopping_results", [])
        if shopping:
            add("shopping", count=len(shopping))

        # Image Pack
        images = data.get("images_results", [])
        if images:
            add("image_pack", count=len(images))

        # Videos
        videos = data.get("inline_videos", [])
        if videos:
            add("video", count=len(videos))

        # Local Pack
        local = data.get("local_results", {}).get("places", [])
        if local:
            add("local_pack", count=len(local))

        return features
