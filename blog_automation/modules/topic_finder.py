"""
Topic Finder Module
-------------------
Finds trending topics from:
  1. Google Trends (via pytrends)
  2. Custom URLs / client sites (web scraping)
  3. LinkedIn hashtags (via API)

Returns a ranked list of topics relevant to the configured niche.
"""

import logging
import re
import time
from dataclasses import dataclass, field
from typing import Optional

import anthropic
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class Topic:
    title: str
    source: str
    score: float = 0.0          # Relevance score 0-1
    trend_score: float = 0.0   # Raw trending score
    related_terms: list[str] = field(default_factory=list)
    url: str = ""
    summary: str = ""


class TopicFinder:
    def __init__(self, config: dict):
        self.config = config
        self.topic_cfg = config.get("topic_sources", {})
        self.content_cfg = config.get("content", {})
        self.niche = self.content_cfg.get("niche", "technology")
        self._client = anthropic.Anthropic()

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def find_best_topic(self) -> Optional[Topic]:
        """
        Collect topics from all enabled sources, score them for niche
        relevance, and return the single best topic to write about.
        """
        all_topics: list[Topic] = []

        if self.topic_cfg.get("google_trends", {}).get("enabled"):
            all_topics.extend(self._fetch_google_trends())

        if self.topic_cfg.get("custom_urls", {}).get("enabled"):
            all_topics.extend(self._fetch_custom_urls())

        if self.topic_cfg.get("linkedin", {}).get("enabled"):
            all_topics.extend(self._fetch_linkedin())

        if not all_topics:
            logger.warning("No topics found from any source.")
            return None

        logger.info("Found %d raw topics — scoring for niche relevance…", len(all_topics))
        scored = self._score_topics(all_topics)
        best = scored[0] if scored else None

        if best:
            logger.info("Best topic selected: '%s' (score=%.2f, source=%s)",
                        best.title, best.score, best.source)
        return best

    # ------------------------------------------------------------------ #
    # Google Trends                                                        #
    # ------------------------------------------------------------------ #

    def _fetch_google_trends(self) -> list[Topic]:
        try:
            from pytrends.request import TrendReq
        except ImportError:
            logger.error("pytrends not installed. Run: pip install pytrends")
            return []

        cfg = self.topic_cfg["google_trends"]
        topics: list[Topic] = []

        try:
            pt = TrendReq(hl="en-US", tz=330)
            trending = pt.trending_searches(pn=self._geo_to_country(cfg.get("geo", "US")))
            raw_list = trending[0].tolist()[:cfg.get("num_topics", 10)]

            for title in raw_list:
                try:
                    pt.build_payload([title], timeframe=cfg.get("timeframe", "now 1-d"),
                                     geo=cfg.get("geo", "US"), cat=cfg.get("category", 0))
                    related = pt.related_queries()
                    related_terms = []
                    if title in related and related[title]["top"] is not None:
                        related_terms = related[title]["top"]["query"].tolist()[:5]
                    topics.append(Topic(
                        title=title,
                        source="google_trends",
                        trend_score=1.0,
                        related_terms=related_terms,
                    ))
                    time.sleep(0.5)   # Be polite to Google's API
                except Exception as e:
                    logger.debug("Could not get related queries for '%s': %s", title, e)
                    topics.append(Topic(title=title, source="google_trends", trend_score=1.0))

            logger.info("Google Trends: fetched %d topics", len(topics))
        except Exception as e:
            logger.error("Google Trends fetch failed: %s", e)

        return topics

    def _geo_to_country(self, geo: str) -> str:
        mapping = {
            "IN": "india", "US": "united_states", "GB": "united_kingdom",
            "AU": "australia", "CA": "canada",
        }
        return mapping.get(geo.upper(), "united_states")

    # ------------------------------------------------------------------ #
    # Custom URLs / Web Scraping                                           #
    # ------------------------------------------------------------------ #

    def _fetch_custom_urls(self) -> list[Topic]:
        sources = self.topic_cfg.get("custom_urls", {}).get("sources", [])
        topics: list[Topic] = []
        headers = {"User-Agent": "Mozilla/5.0 (compatible; BlogBot/1.0)"}

        for source in sources:
            name = source.get("name", source["url"])
            url = source["url"]
            try:
                resp = requests.get(url, headers=headers, timeout=15)
                resp.raise_for_status()
                soup = BeautifulSoup(resp.text, "html.parser")

                # Extract article/headline titles
                headlines = self._extract_headlines(soup, url)
                for headline, link in headlines[:10]:
                    topics.append(Topic(
                        title=headline,
                        source=f"custom:{name}",
                        url=link or url,
                        trend_score=0.8,
                    ))
                logger.info("Custom URL '%s': fetched %d headlines", name, len(headlines[:10]))
            except Exception as e:
                logger.error("Failed to scrape '%s': %s", url, e)

        return topics

    def _extract_headlines(self, soup: BeautifulSoup, base_url: str) -> list[tuple[str, str]]:
        """Extract (title, url) pairs from a page using multiple strategies."""
        results: list[tuple[str, str]] = []
        seen: set[str] = set()

        # Strategy 1: article tags with headings
        for article in soup.find_all("article")[:15]:
            for tag in ["h1", "h2", "h3"]:
                h = article.find(tag)
                if h:
                    text = h.get_text(strip=True)
                    a = h.find("a") or article.find("a")
                    href = a["href"] if a and a.get("href") else ""
                    if text and text not in seen and len(text) > 20:
                        seen.add(text)
                        results.append((text, self._abs_url(href, base_url)))

        # Strategy 2: top-level h2/h3 inside links
        if not results:
            for tag in ["h1", "h2", "h3"]:
                for h in soup.find_all(tag)[:20]:
                    text = h.get_text(strip=True)
                    a = h.find("a")
                    href = a["href"] if a and a.get("href") else ""
                    if text and text not in seen and len(text) > 20:
                        seen.add(text)
                        results.append((text, self._abs_url(href, base_url)))

        return results

    def _abs_url(self, href: str, base: str) -> str:
        if not href:
            return base
        if href.startswith("http"):
            return href
        from urllib.parse import urljoin
        return urljoin(base, href)

    # ------------------------------------------------------------------ #
    # LinkedIn                                                             #
    # ------------------------------------------------------------------ #

    def _fetch_linkedin(self) -> list[Topic]:
        """
        Fetches LinkedIn posts for configured hashtags.
        Requires a LinkedIn access token with r_liteprofile + w_member_social scopes.
        """
        import os
        token = os.getenv("LINKEDIN_ACCESS_TOKEN")
        if not token:
            logger.warning("LINKEDIN_ACCESS_TOKEN not set — skipping LinkedIn source.")
            return []

        hashtags = self.topic_cfg.get("linkedin", {}).get("hashtags", [])
        topics: list[Topic] = []
        headers = {"Authorization": f"Bearer {token}"}

        for tag in hashtags[:5]:
            try:
                url = (
                    f"https://api.linkedin.com/v2/socialActions?q=hashtag"
                    f"&hashtag={tag}&count=5"
                )
                resp = requests.get(url, headers=headers, timeout=10)
                if resp.ok:
                    data = resp.json()
                    for item in data.get("elements", []):
                        text = item.get("specificContent", {}) \
                                   .get("com.linkedin.ugc.ShareContent", {}) \
                                   .get("shareCommentary", {}) \
                                   .get("text", "")
                        if text and len(text) > 30:
                            topics.append(Topic(
                                title=text[:120],
                                source="linkedin",
                                trend_score=0.7,
                            ))
            except Exception as e:
                logger.error("LinkedIn fetch for #%s failed: %s", tag, e)

        return topics

    # ------------------------------------------------------------------ #
    # AI-powered Relevance Scoring                                         #
    # ------------------------------------------------------------------ #

    def _score_topics(self, topics: list[Topic]) -> list[Topic]:
        """
        Use Claude to score each topic's relevance to the configured niche
        and return them sorted best-first.
        """
        if not topics:
            return []

        topic_list = "\n".join(
            f"{i+1}. {t.title} (source: {t.source})"
            for i, t in enumerate(topics)
        )

        prompt = f"""You are an expert content strategist for a website in this niche:
"{self.niche}"

Here are trending topics discovered from various sources:
{topic_list}

For each topic, rate its relevance to the niche on a scale of 0.0 to 1.0.
Also check: Is this topic something a blog post could add genuine value to?

Respond ONLY with a JSON array like:
[
  {{"index": 1, "score": 0.9, "reason": "Directly relevant to AI education"}},
  {{"index": 2, "score": 0.3, "reason": "Too political, not niche-relevant"}},
  ...
]
Include ALL {len(topics)} topics.
"""
        try:
            response = self._client.messages.create(
                model="claude-opus-4-5",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            import json
            raw = response.content[0].text.strip()
            # Extract JSON from response
            json_match = re.search(r"\[.*\]", raw, re.DOTALL)
            if json_match:
                scores = json.loads(json_match.group())
                for item in scores:
                    idx = item["index"] - 1
                    if 0 <= idx < len(topics):
                        topics[idx].score = float(item.get("score", 0))

            # Sort by combined score (niche relevance × trend strength)
            topics.sort(key=lambda t: t.score * (0.5 + 0.5 * t.trend_score), reverse=True)

        except Exception as e:
            logger.error("AI topic scoring failed: %s — using raw trend scores", e)
            topics.sort(key=lambda t: t.trend_score, reverse=True)

        return topics
