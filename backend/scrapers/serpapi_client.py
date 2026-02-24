"""
SerpAPI Client — fetches Google AI Overview citations.
Free tier: 100 searches/month. Sign up at https://serpapi.com
"""

import requests
from typing import Any


SERPAPI_URL = "https://serpapi.com/search"


def get_google_ai_overview(keyword: str, target_domain: str, api_key: str) -> list[dict[str, Any]]:
    """
    Query SerpAPI for Google search results and extract AI Overview citations.
    Returns a list of cited URLs with position and metadata.
    """
    params = {
        "engine": "google",
        "q": keyword,
        "api_key": api_key,
        "hl": "en",
        "gl": "us",
    }

    try:
        resp = requests.get(SERPAPI_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        raise RuntimeError(f"SerpAPI error: {e}") from e

    results = []

    # AI Overview block (appears as "ai_overview" in SerpAPI response)
    ai_overview = data.get("ai_overview", {})
    sources = ai_overview.get("references", ai_overview.get("sources", []))

    for i, source in enumerate(sources):
        url = source.get("link", source.get("url", ""))
        if not url:
            continue
        domain = _get_domain(url)
        snippet = source.get("snippet", source.get("description", ""))
        results.append({
            "url": url,
            "domain": domain,
            "position": i + 1,
            "is_target": target_domain in domain,
            "snippet": snippet[:300] if snippet else "",
            "sentiment": _classify_sentiment(snippet),
            "source": "google_ai_overview",
        })

    # Fallback: organic results if no AI Overview found
    if not results:
        organic = data.get("organic_results", [])
        for i, item in enumerate(organic[:5]):
            url = item.get("link", "")
            domain = _get_domain(url)
            snippet = item.get("snippet", "")
            results.append({
                "url": url,
                "domain": domain,
                "position": i + 1,
                "is_target": target_domain in domain,
                "snippet": snippet[:300],
                "sentiment": _classify_sentiment(snippet),
                "source": "google_organic",
            })

    return results


def _get_domain(url: str) -> str:
    url = url.replace("https://", "").replace("http://", "").replace("www.", "")
    return url.split("/")[0].split("?")[0]


def _classify_sentiment(text: str) -> str:
    if not text:
        return "neutral"
    text = text.lower()
    positive_words = ["best", "top", "leading", "excellent", "comprehensive", "recommended", "trusted"]
    negative_words = ["avoid", "problem", "issue", "lacks", "poor", "wrong", "fails"]
    pos = sum(1 for w in positive_words if w in text)
    neg = sum(1 for w in negative_words if w in text)
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"
