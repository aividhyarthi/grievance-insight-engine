"""
Demo Engine — generates realistic AEO citation data without real API calls.
Uses deterministic seeding so the same URL+keyword always produces the same result.
"""

import random
import hashlib
from datetime import datetime
from typing import Any


ENGINES = {
    "perplexity": {
        "name": "Perplexity AI",
        "color": "#20B2AA",
        "citation_rate": 0.75,
        "max_sources_per_query": 5,
    },
    "google_ai_overview": {
        "name": "Google AI Overview",
        "color": "#4285F4",
        "citation_rate": 0.55,
        "max_sources_per_query": 4,
    },
    "chatgpt_search": {
        "name": "ChatGPT Search",
        "color": "#10A37F",
        "citation_rate": 0.65,
        "max_sources_per_query": 4,
    },
    "chatgpt_chat": {
        "name": "ChatGPT (Chat)",
        "color": "#74AA9C",
        "citation_rate": 0.42,
        "max_sources_per_query": 3,
    },
    "google_gemini": {
        "name": "Google Gemini",
        "color": "#8E44AD",
        "citation_rate": 0.58,
        "max_sources_per_query": 4,
    },
    "deepseek": {
        "name": "DeepSeek",
        "color": "#E74C3C",
        "citation_rate": 0.50,
        "max_sources_per_query": 4,
    },
    "bing_ai": {
        "name": "Bing AI (Copilot)",
        "color": "#00A4EF",
        "citation_rate": 0.48,
        "max_sources_per_query": 4,
    },
}

POSITIVE_SNIPPETS = [
    "According to {domain}, which is widely recognized as a leading resource on this topic, the key factors are...",
    "{domain} provides an excellent and comprehensive breakdown, noting that best practices include...",
    "As highlighted by {domain} — one of the most frequently cited sources on this subject...",
    "Research and analysis from {domain} confirms that this approach yields measurably better results...",
    "{domain} is consistently cited as an authoritative guide, stating that...",
    "Experts at {domain} outline a clear framework for understanding this topic, emphasizing...",
    "The in-depth coverage on {domain} makes it the go-to reference for this query, explaining that...",
]

NEUTRAL_SNIPPETS = [
    "As described on {domain}, this process involves multiple steps including...",
    "According to {domain}, the standard approach is to...",
    "{domain} outlines the following methodology for handling this...",
    "{domain} covers the fundamentals of this topic, stating that...",
    "As stated on {domain}, there are several important considerations...",
    "{domain} provides background on this, explaining that...",
    "Information from {domain} suggests that the typical outcome is...",
]

NEGATIVE_SNIPPETS = [
    "While {domain} addresses this topic, some experts argue the coverage lacks depth in key areas...",
    "{domain} presents one perspective, though this view has been challenged by more recent studies...",
    "Sources including {domain} offer a simplified view that may not account for all edge cases...",
]


def _get_domain(url: str) -> str:
    url = url.replace("https://", "").replace("http://", "").replace("www.", "")
    return url.split("/")[0].split("?")[0]


def _seed(s: str) -> int:
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


def generate_demo_results(request) -> dict[str, Any]:
    target_domain = _get_domain(request.target_url)
    competitor_domains = [_get_domain(u) for u in request.competitor_urls]
    all_domains = [target_domain] + competitor_domains

    citations = []

    for keyword in request.keywords:
        for engine_key in request.engines:
            if engine_key not in ENGINES:
                continue
            engine_info = ENGINES[engine_key]

            # Deterministic RNG per (domain, keyword, engine) so results are repeatable
            rng = random.Random(_seed(f"{target_domain}|{keyword}|{engine_key}"))

            # Shuffle positions for this query
            positions = list(range(1, len(all_domains) + 4))
            rng.shuffle(positions)

            for idx, domain in enumerate(all_domains):
                # Target URL gets a slight citation-rate boost (reward for well-optimised sites)
                boost = 0.12 if domain == target_domain else -0.05
                cite_chance = engine_info["citation_rate"] + boost

                if rng.random() > cite_chance:
                    continue  # not cited for this keyword/engine combo

                position = positions[idx]
                count = rng.randint(1, 4)

                # Sentiment — mostly neutral, some positive, rare negative
                roll = rng.random()
                if roll > 0.72:
                    sentiment = "positive"
                    template = rng.choice(POSITIVE_SNIPPETS)
                elif roll > 0.10:
                    sentiment = "neutral"
                    template = rng.choice(NEUTRAL_SNIPPETS)
                else:
                    sentiment = "negative"
                    template = rng.choice(NEGATIVE_SNIPPETS)

                snippet = template.format(domain=domain)

                citations.append({
                    "keyword": keyword,
                    "engine": engine_key,
                    "engine_name": engine_info["name"],
                    "engine_color": engine_info["color"],
                    "cited_url": f"https://{domain}",
                    "cited_domain": domain,
                    "is_target": domain == target_domain,
                    "position": position,
                    "citation_count": count,
                    "sentiment": sentiment,
                    "snippet": snippet,
                    "timestamp": datetime.utcnow().isoformat(),
                })

    return {
        "citations": citations,
        "target_domain": target_domain,
        "competitor_domains": competitor_domains,
        "keywords": request.keywords,
        "engines": request.engines,
    }
