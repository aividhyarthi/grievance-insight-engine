"""
crawler.py — Fetches page HTML and extracts raw DOM data for SEO analysis.
"""

from __future__ import annotations

import time
import urllib.parse
from dataclasses import dataclass, field
from typing import Optional

import requests
from bs4 import BeautifulSoup


DEFAULT_TIMEOUT = 15  # seconds
USER_AGENT = (
    "Mozilla/5.0 (compatible; SEOAuditBot/1.0; "
    "+https://github.com/aividhyarthi/grievance-insight-engine)"
)


@dataclass
class PageData:
    url: str
    status_code: int
    load_time_ms: float
    html: str
    soup: BeautifulSoup
    response_headers: dict = field(default_factory=dict)
    error: Optional[str] = None

    # Convenience properties ─────────────────────────────────────────────────

    @property
    def title(self) -> str:
        tag = self.soup.find("title")
        return tag.get_text(strip=True) if tag else ""

    @property
    def meta_description(self) -> str:
        tag = self.soup.find("meta", attrs={"name": "description"})
        return tag.get("content", "").strip() if tag else ""

    @property
    def meta_keywords(self) -> str:
        tag = self.soup.find("meta", attrs={"name": "keywords"})
        return tag.get("content", "").strip() if tag else ""

    @property
    def canonical_url(self) -> str:
        tag = self.soup.find("link", attrs={"rel": "canonical"})
        return tag.get("href", "").strip() if tag else ""

    @property
    def robots_meta(self) -> str:
        tag = self.soup.find("meta", attrs={"name": "robots"})
        return tag.get("content", "").strip() if tag else ""

    @property
    def lang(self) -> str:
        tag = self.soup.find("html")
        return tag.get("lang", "").strip() if tag else ""

    @property
    def h1_tags(self) -> list[str]:
        return [t.get_text(strip=True) for t in self.soup.find_all("h1")]

    @property
    def h2_tags(self) -> list[str]:
        return [t.get_text(strip=True) for t in self.soup.find_all("h2")]

    @property
    def h3_tags(self) -> list[str]:
        return [t.get_text(strip=True) for t in self.soup.find_all("h3")]

    @property
    def images(self) -> list[dict]:
        results = []
        for img in self.soup.find_all("img"):
            results.append(
                {
                    "src": img.get("src", ""),
                    "alt": img.get("alt", ""),
                    "loading": img.get("loading", ""),
                }
            )
        return results

    @property
    def links(self) -> list[dict]:
        results = []
        base = urllib.parse.urlparse(self.url)
        for a in self.soup.find_all("a", href=True):
            href = a["href"].strip()
            parsed = urllib.parse.urlparse(href)
            is_internal = (not parsed.netloc) or (parsed.netloc == base.netloc)
            results.append(
                {
                    "href": href,
                    "text": a.get_text(strip=True),
                    "rel": a.get("rel", []),
                    "internal": is_internal,
                }
            )
        return results

    @property
    def open_graph(self) -> dict:
        og = {}
        for tag in self.soup.find_all("meta", attrs={"property": True}):
            prop = tag.get("property", "")
            if prop.startswith("og:"):
                og[prop] = tag.get("content", "")
        return og

    @property
    def twitter_card(self) -> dict:
        tc = {}
        for tag in self.soup.find_all("meta", attrs={"name": True}):
            name = tag.get("name", "")
            if name.startswith("twitter:"):
                tc[name] = tag.get("content", "")
        return tc

    @property
    def structured_data(self) -> list[str]:
        return [
            tag.string.strip()
            for tag in self.soup.find_all("script", attrs={"type": "application/ld+json"})
            if tag.string
        ]

    @property
    def word_count(self) -> int:
        body = self.soup.find("body")
        if not body:
            return 0
        text = body.get_text(separator=" ", strip=True)
        return len(text.split())

    @property
    def content_text(self) -> str:
        """Visible body text (trimmed to 3 000 chars for AI prompt safety)."""
        body = self.soup.find("body")
        if not body:
            return ""
        return body.get_text(separator=" ", strip=True)[:3000]


def fetch_page(url: str, timeout: int = DEFAULT_TIMEOUT) -> PageData:
    """
    Fetch *url* and return a :class:`PageData` instance.
    Never raises; errors are captured in ``PageData.error``.
    """
    headers = {"User-Agent": USER_AGENT}
    try:
        start = time.perf_counter()
        resp = requests.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        elapsed_ms = (time.perf_counter() - start) * 1000

        soup = BeautifulSoup(resp.text, "html.parser")
        return PageData(
            url=resp.url,  # final URL after redirects
            status_code=resp.status_code,
            load_time_ms=round(elapsed_ms, 1),
            html=resp.text,
            soup=soup,
            response_headers=dict(resp.headers),
        )
    except requests.exceptions.RequestException as exc:
        return PageData(
            url=url,
            status_code=0,
            load_time_ms=0.0,
            html="",
            soup=BeautifulSoup("", "html.parser"),
            error=str(exc),
        )
