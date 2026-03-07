"""
Google Places API fetcher.

Handles two operations:
  1. Text search  – find the best-matching Place ID for a business query
  2. Place details – fetch full GMB-relevant fields for that Place ID

Requires a Google Places API key with the Places API (New) or Places API enabled.
Set it via env var GOOGLE_PLACES_API_KEY or pass it explicitly.
"""

import os
import requests
from typing import Optional

PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"

# Fields we pull from the Places Details endpoint – covers all GMB audit signals
DETAIL_FIELDS = ",".join([
    "place_id",
    "name",
    "formatted_address",
    "international_phone_number",
    "website",
    "rating",
    "user_ratings_total",
    "opening_hours",
    "photos",
    "types",
    "business_status",
    "editorial_summary",
    "price_level",
    "reviews",
    "url",                    # Google Maps URL for the listing
    "permanently_closed",
])


class PlacesFetcher:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GOOGLE_PLACES_API_KEY", "")
        if not self.api_key:
            raise ValueError(
                "Google Places API key is required.\n"
                "Set env var GOOGLE_PLACES_API_KEY=<your-key> or pass api_key=<key> to PlacesFetcher."
            )

    def find_place(self, query: str) -> dict:
        """
        Run a text-search to find the most relevant Place ID for `query`.
        Returns the raw API response dict.
        """
        params = {
            "input": query,
            "inputtype": "textquery",
            "fields": "place_id,name,formatted_address",
            "key": self.api_key,
        }
        resp = requests.get(PLACES_SEARCH_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            raise RuntimeError(f"Places findplacefromtext error: {data.get('status')} – {data.get('error_message','')}")
        return data

    def get_details(self, place_id: str) -> dict:
        """
        Fetch full GMB-relevant details for a given Place ID.
        Returns the raw API response dict.
        """
        params = {
            "place_id": place_id,
            "fields": DETAIL_FIELDS,
            "key": self.api_key,
        }
        resp = requests.get(PLACES_DETAILS_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        if data.get("status") not in ("OK",):
            raise RuntimeError(f"Places details error: {data.get('status')} – {data.get('error_message','')}")
        return data.get("result", {})

    def fetch(self, business_query: str) -> dict:
        """
        High-level: search for `business_query`, pick the top result, return full details.
        Returns a dict with keys: place_id, name, candidate_address, details
        """
        search_data = self.find_place(business_query)
        candidates = search_data.get("candidates", [])
        if not candidates:
            raise ValueError(f"No Google Places results found for: '{business_query}'")

        top = candidates[0]
        place_id = top["place_id"]
        details = self.get_details(place_id)
        return {
            "place_id": place_id,
            "search_name": top.get("name"),
            "search_address": top.get("formatted_address"),
            "details": details,
        }
