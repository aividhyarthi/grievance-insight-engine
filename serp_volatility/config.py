"""
Configuration for India SERP Volatility Tracker.
"""

import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SerpAPIConfig:
    """Configuration for SERP API providers."""
    provider: str = os.getenv("SERP_PROVIDER", "serper")  # serper, serpapi, dataforseo
    api_key: str = os.getenv("SERP_API_KEY", "")

    # serper.dev specific
    serper_api_url: str = "https://google.serper.dev/search"

    # serpapi specific
    serpapi_url: str = "https://serpapi.com/search"

    # dataforseo specific
    dataforseo_url: str = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced"
    dataforseo_login: str = os.getenv("DATAFORSEO_LOGIN", "")
    dataforseo_password: str = os.getenv("DATAFORSEO_PASSWORD", "")


@dataclass
class TrackerConfig:
    """Main tracker configuration."""
    # Google India settings
    google_domain: str = "google.co.in"
    country_code: str = "in"
    language: str = "en"

    # Tracking settings
    top_n_results: int = 20  # Track top 20 positions
    devices: list = field(default_factory=lambda: ["desktop", "mobile"])

    # Volatility calculation
    volatility_scale_min: float = 0.0
    volatility_scale_max: float = 10.0
    # Normalization factor: max expected average position change
    max_expected_change: float = 10.0

    # Storage
    storage_backend: str = os.getenv("STORAGE_BACKEND", "sqlite")  # sqlite or bigquery
    sqlite_path: str = os.getenv("SQLITE_PATH", "serp_volatility/data/serp_data.db")
    bigquery_project: str = os.getenv("GCP_PROJECT", "")
    bigquery_dataset: str = os.getenv("BQ_DATASET", "serp_volatility")

    # API config
    serp_api: SerpAPIConfig = field(default_factory=SerpAPIConfig)


# Click-through rate estimates by position (for traffic-weighted volatility)
# Based on Backlinko / Advanced Web Ranking CTR studies
CTR_BY_POSITION = {
    1: 0.316,
    2: 0.158,
    3: 0.110,
    4: 0.082,
    5: 0.065,
    6: 0.052,
    7: 0.043,
    8: 0.036,
    9: 0.030,
    10: 0.026,
    11: 0.019,
    12: 0.016,
    13: 0.014,
    14: 0.012,
    15: 0.010,
    16: 0.009,
    17: 0.008,
    18: 0.007,
    19: 0.006,
    20: 0.005,
}

# Indian market categories with seed keywords
CATEGORIES = {
    "education": "Education & Universities",
    "ecommerce": "E-Commerce & Shopping",
    "finance": "Banking & Finance",
    "health": "Health & Medical",
    "news": "News & Media",
    "realestate": "Real Estate & Property",
    "travel": "Travel & Tourism",
    "technology": "Technology & IT",
    "government": "Government & Public Services",
    "jobs": "Jobs & Recruitment",
    "food": "Food & Restaurants",
    "entertainment": "Entertainment & OTT",
    "automobile": "Automobile",
    "telecom": "Telecom & Internet",
    "insurance": "Insurance",
}
