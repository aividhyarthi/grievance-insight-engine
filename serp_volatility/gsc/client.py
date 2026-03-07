"""
Google Search Console API client.

Handles:
  - Listing verified sites
  - Pulling top keywords for a site (with filters)
  - Pulling keywords for a specific URL (page-level filter)
"""

from datetime import date, timedelta
from typing import Optional
from urllib.parse import urlparse

from .auth import GSCAuth
from ..keyword_sources.base import KeywordEntry


DEFAULT_DATE_RANGE_DAYS = 28
MAX_ROWS_PER_REQUEST = 25000  # GSC API limit


class GSCClient:
    def __init__(self, auth: Optional[GSCAuth] = None):
        self.auth = auth or GSCAuth()
        self._service = None

    @property
    def service(self):
        if self._service is None:
            creds = self.auth.get_credentials()
            self._service = GSCAuth.build_service(creds)
        return self._service

    def list_sites(self) -> list[str]:
        """Return all verified GSC properties for this account."""
        response = self.service.sites().list().execute()
        return [
            entry["siteUrl"]
            for entry in response.get("siteEntry", [])
            if entry.get("permissionLevel") in ("siteFullUser", "siteOwner", "siteRestrictedUser")
        ]

    def get_keywords(
        self,
        site_url: str,
        days: int = DEFAULT_DATE_RANGE_DAYS,
        min_impressions: int = 10,
        max_keywords: int = 1000,
        device: str = "web",
    ) -> list[KeywordEntry]:
        """
        Pull top keywords for a GSC property.
        Returns KeywordEntry list with GSC metrics filled in.
        """
        start_date, end_date = self._date_range(days)

        request_body = {
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": ["query", "page"],
            "dimensionFilterGroups": [],
            "rowLimit": min(max_keywords, MAX_ROWS_PER_REQUEST),
            "startRow": 0,
        }

        if device != "web":
            request_body["dimensionFilterGroups"] = [{
                "filters": [{"dimension": "device", "operator": "equals", "expression": device}]
            }]

        response = self.service.searchanalytics().query(
            siteUrl=site_url, body=request_body
        ).execute()

        entries = []
        for row in response.get("rows", []):
            impressions = row.get("impressions", 0)
            if impressions < min_impressions:
                continue
            keys = row.get("keys", [])
            keyword = keys[0] if len(keys) > 0 else ""
            page_url = keys[1] if len(keys) > 1 else None

            entries.append(KeywordEntry(
                keyword=keyword,
                source="gsc",
                target_url=page_url,
                impressions=impressions,
                clicks=row.get("clicks", 0),
                ctr=row.get("ctr", 0.0),
                position=row.get("position"),
                gsc_date_range=f"last_{days}_days",
            ))

        return entries

    def get_keywords_for_url(
        self,
        site_url: str,
        page_url: str,
        days: int = DEFAULT_DATE_RANGE_DAYS,
        max_keywords: int = 100,
    ) -> list[KeywordEntry]:
        """
        Pull all keywords for a specific page URL.
        This is the core of the "URL input" keyword source.
        """
        start_date, end_date = self._date_range(days)

        # Normalise the page URL for GSC filter
        page_filter = self._normalise_url(page_url)

        request_body = {
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": ["query"],
            "dimensionFilterGroups": [{
                "filters": [{
                    "dimension": "page",
                    "operator": "equals",
                    "expression": page_filter,
                }]
            }],
            "rowLimit": min(max_keywords, MAX_ROWS_PER_REQUEST),
        }

        response = self.service.searchanalytics().query(
            siteUrl=site_url, body=request_body
        ).execute()

        entries = []
        for row in response.get("rows", []):
            keys = row.get("keys", [])
            keyword = keys[0] if keys else ""
            entries.append(KeywordEntry(
                keyword=keyword,
                source="url_input",
                target_url=page_url,
                impressions=row.get("impressions", 0),
                clicks=row.get("clicks", 0),
                ctr=row.get("ctr", 0.0),
                position=row.get("position"),
                gsc_date_range=f"last_{days}_days",
            ))

        return entries

    def enrich_keywords(
        self,
        site_url: str,
        entries: list[KeywordEntry],
        days: int = DEFAULT_DATE_RANGE_DAYS,
    ) -> list[KeywordEntry]:
        """
        For Excel-uploaded keywords that have no GSC data yet,
        query GSC to fill in impressions/clicks/CTR/position.
        """
        if not entries:
            return entries

        start_date, end_date = self._date_range(days)

        # Build a lookup: (keyword, url) → entry index
        lookup: dict[tuple, int] = {}
        for i, e in enumerate(entries):
            lookup[(e.keyword.lower(), e.target_url or "")] = i

        # Batch query: get data for all keywords at once
        request_body = {
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": ["query", "page"],
            "rowLimit": MAX_ROWS_PER_REQUEST,
        }

        response = self.service.searchanalytics().query(
            siteUrl=site_url, body=request_body
        ).execute()

        for row in response.get("rows", []):
            keys = row.get("keys", [])
            kw = keys[0].lower() if keys else ""
            page = keys[1] if len(keys) > 1 else ""

            # Try exact match first
            idx = lookup.get((kw, page))
            if idx is None:
                # Try keyword-only match (ignore URL)
                for (k, _), i in lookup.items():
                    if k == kw:
                        idx = i
                        break

            if idx is not None:
                e = entries[idx]
                e.impressions = row.get("impressions", 0)
                e.clicks = row.get("clicks", 0)
                e.ctr = row.get("ctr", 0.0)
                e.position = row.get("position")
                e.gsc_date_range = f"last_{days}_days"

        return entries

    @staticmethod
    def _date_range(days: int) -> tuple[str, str]:
        end = date.today() - timedelta(days=2)  # GSC data lags ~2 days
        start = end - timedelta(days=days - 1)
        return start.isoformat(), end.isoformat()

    @staticmethod
    def _normalise_url(url: str) -> str:
        """Ensure URL has scheme for GSC API."""
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        return url
