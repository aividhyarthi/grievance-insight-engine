"""
Factory function to get the right collector based on config.
"""

from ..config import TrackerConfig
from .base import BaseSerpCollector
from .serper import SerperCollector
from .serpapi import SerpAPICollector


def get_collector(config: TrackerConfig) -> BaseSerpCollector:
    """Return the appropriate SERP collector based on provider config."""
    providers = {
        "serper": SerperCollector,
        "serpapi": SerpAPICollector,
    }

    provider = config.serp_api.provider.lower()
    if provider not in providers:
        raise ValueError(
            f"Unknown SERP provider: {provider}. "
            f"Supported: {', '.join(providers.keys())}"
        )

    return providers[provider](config)
