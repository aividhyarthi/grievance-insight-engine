"""
Serper.dev SERP collector — cheapest option at $0.30/1K queries.
"""

import json
import requests
from datetime import datetime, timezone

from .base import BaseSerpCollector, SerpFeature, SerpResult


class SerperCollector(BaseSerpCollector):
    """Collect SERP data using Serper.dev API."""

    def fetch_serp(
        self,
        keyword: str,
        category: str,
        device: str = "desktop",
        num_results: int = 20,
    ) -> tuple[list[SerpResult], list[SerpFeature]]:
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

        if device == "mobile":
            payload["type"] = "search"
            headers["X-Device"] = "mobile"

        response = requests.post(
            self.config.serp_api.serper_api_url,
            headers=headers,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()

        now = datetime.now(timezone.utc)
        results = []

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

        # AI Overview (answerBox with type "ai_overview", or dedicated key)
        ai_overview = data.get("aiOverview") or data.get("ai_overview")
        if ai_overview:
            add("ai_overview", extra={"source": "serper"})
        elif data.get("answerBox", {}).get("type") == "ai_overview":
            add("ai_overview")

        # Featured Snippet / Answer Box (non-AI)
        answer_box = data.get("answerBox")
        if answer_box and not ai_overview:
            snippet_type = answer_box.get("type", "snippet")
            add("featured_snippet", extra={"type": snippet_type, "title": answer_box.get("title", "")})

        # Knowledge Panel
        if data.get("knowledgeGraph"):
            kg = data["knowledgeGraph"]
            add("knowledge_panel", extra={"title": kg.get("title", ""), "type": kg.get("type", "")})

        # Top Stories
        top_stories = data.get("topStories", [])
        if top_stories:
            add("top_stories", count=len(top_stories))

        # People Also Ask
        paa = data.get("peopleAlsoAsk", [])
        if paa:
            add("people_also_ask", count=len(paa))

        # Shopping
        shopping = data.get("shopping", [])
        if shopping:
            add("shopping", count=len(shopping))

        # Image Pack
        images = data.get("images", [])
        if images:
            add("image_pack", count=len(images))

        # Videos
        videos = data.get("videos", [])
        if videos:
            add("video", count=len(videos))

        # Local Pack
        places = data.get("places", [])
        if places:
            add("local_pack", count=len(places))

        return features
