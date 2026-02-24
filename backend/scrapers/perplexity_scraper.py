"""
Perplexity Scraper — two modes:
  1. API mode  : Uses Perplexity pplx-api (set PERPLEXITY_API_KEY in .env)
  2. Web mode  : Playwright headless scraper (no key needed, slower, less reliable)
"""

import os
import re
import json
import requests
from typing import Any


PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"


def query_perplexity_api(keyword: str, target_domain: str, api_key: str) -> list[dict[str, Any]]:
    """Query Perplexity via official API and extract citations."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.1-sonar-small-128k-online",
        "messages": [{"role": "user", "content": keyword}],
        "return_citations": True,
    }
    try:
        resp = requests.post(PERPLEXITY_API_URL, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        citations_raw = data.get("citations", [])
        message = data["choices"][0]["message"]["content"]

        results = []
        for i, url in enumerate(citations_raw):
            domain = _get_domain(url)
            results.append({
                "url": url,
                "domain": domain,
                "position": i + 1,
                "is_target": target_domain in domain,
                "snippet": _extract_snippet(message, domain),
                "sentiment": _classify_sentiment(message, domain),
            })
        return results

    except Exception as e:
        raise RuntimeError(f"Perplexity API error: {e}") from e


def query_perplexity_web(keyword: str, target_domain: str) -> list[dict[str, Any]]:
    """Scrape Perplexity web interface using Playwright (no API key needed)."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError("Playwright not installed. Run: pip install playwright && playwright install chromium")

    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"https://www.perplexity.ai/search?q={requests.utils.quote(keyword)}")
        page.wait_for_timeout(4000)

        # Extract source cards (Perplexity shows these in the sidebar/top)
        source_cards = page.query_selector_all("[data-testid='source-card'], .source-card, a[href*='http']")
        seen = set()
        for i, card in enumerate(source_cards[:6]):
            href = card.get_attribute("href") or ""
            if not href.startswith("http") or href in seen:
                continue
            seen.add(href)
            domain = _get_domain(href)
            results.append({
                "url": href,
                "domain": domain,
                "position": len(results) + 1,
                "is_target": target_domain in domain,
                "snippet": "",
                "sentiment": "neutral",
            })

        browser.close()
    return results


def _get_domain(url: str) -> str:
    url = url.replace("https://", "").replace("http://", "").replace("www.", "")
    return url.split("/")[0].split("?")[0]


def _extract_snippet(text: str, domain: str) -> str:
    # Find sentences mentioning the domain
    sentences = re.split(r"(?<=[.!?])\s+", text)
    for s in sentences:
        if domain in s:
            return s[:200]
    return text[:200] if text else ""


def _classify_sentiment(text: str, domain: str) -> str:
    positive_words = ["leading", "excellent", "comprehensive", "authoritative", "best", "recommended"]
    negative_words = ["criticized", "lacks", "incomplete", "outdated", "misleading"]
    context = text.lower()
    pos = sum(1 for w in positive_words if w in context)
    neg = sum(1 for w in negative_words if w in context)
    if pos > neg:
        return "positive"
    if neg > pos:
        return "negative"
    return "neutral"
