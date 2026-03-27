"""
crawler.py — Fetches page HTML and extracts raw DOM data for SEO analysis.

JS Rendering:
  When `PLAYWRIGHT_ENABLED=1` is set (or playwright is importable and a
  browser is installed), pages that look like client-side-rendered SPAs are
  automatically re-fetched using a headless Chromium browser so that the full
  rendered DOM is analysed — not just the skeleton HTML.

  Without Playwright the tool still works but will report thin content on
  React/Next.js/Vue pages and flag the JS rendering gap in the audit.
"""

from __future__ import annotations

import os
import re
import time
import urllib.parse
from dataclasses import dataclass, field
from typing import Optional

import requests
from bs4 import BeautifulSoup


DEFAULT_TIMEOUT = 15  # seconds

# Realistic Chrome browser User-Agent — sites like Nykaa, Flipkart, Amazon
# detect and block custom bot UAs and serve skeleton HTML or challenge pages.
# Using a real browser UA ensures we receive the same HTML Google would see.
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)

# Full set of headers a real Chrome browser sends.
# Missing these causes many sites to return bot-detection pages or skeleton HTML.
BROWSER_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
}

# ── Playwright optional import ────────────────────────────────────────────────
_PLAYWRIGHT_AVAILABLE = False
try:
    from playwright.sync_api import sync_playwright  # type: ignore
    # Quick check that a browser binary is actually installed
    import subprocess
    _check = subprocess.run(
        ["python3", "-m", "playwright", "install", "--dry-run", "chromium"],
        capture_output=True, timeout=5,
    )
    _PLAYWRIGHT_AVAILABLE = True
except Exception:
    pass

# Allow explicit opt-in/out via env var
_FORCE_PLAYWRIGHT = os.environ.get("PLAYWRIGHT_ENABLED", "").lower() in ("1", "true", "yes")
_FORCE_REQUESTS  = os.environ.get("PLAYWRIGHT_DISABLED", "").lower() in ("1", "true", "yes")

# ── JS framework / SPA detection ──────────────────────────────────────────────
_JS_FRAMEWORK_RE = re.compile(
    r'(__NEXT_DATA__|__NUXT__|ng-version|data-reactroot|data-v-app|'
    r'<div[^>]+id=["\'](__next|app|root|vue-app|angular-app)["\']|'
    r'window\.__INITIAL_STATE__|window\.__REDUX_STATE__|'
    r'React\.createElement|ReactDOM\.render)',
    re.I,
)

_BODY_WORD_THRESHOLD = 150   # fewer visible words → suspect JS rendering
_SCRIPT_TAG_THRESHOLD = 8    # more script tags → likely SPA


_BOT_BLOCK_RE = re.compile(
    r"(captcha|robot.check|access.denied|are you a human|"
    r"security.check|cloudflare|ddos.protection|"
    r"enable javascript|please enable js|"
    r"403.forbidden|blocked|unusual.traffic)",
    re.I,
)


def _is_bot_blocked(html: str, soup: BeautifulSoup, status: int) -> bool:
    """
    Returns True when the site appears to have detected us as a bot and
    returned a challenge/block page instead of the real content.
    """
    if status in (403, 429, 503):
        return True
    body = soup.find("body")
    body_text = body.get_text(" ", strip=True) if body else ""
    # Very short body + block signal words
    if len(body_text.split()) < 80 and _BOT_BLOCK_RE.search(body_text):
        return True
    # Title is a bot challenge
    title_tag = soup.find("title")
    if title_tag and _BOT_BLOCK_RE.search(title_tag.get_text()):
        return True
    return False


def _needs_js_render(html: str, soup: BeautifulSoup) -> bool:
    """
    Returns True if the page looks like it needs JavaScript to show its real
    content — i.e. the requests-fetched HTML is likely a skeleton.
    """
    # Detected JS framework signature
    if _JS_FRAMEWORK_RE.search(html[:50_000]):
        # Only flag if visible body text is thin
        body = soup.find("body")
        if body:
            words = body.get_text(" ", strip=True).split()
            scripts = body.find_all("script")
            if len(words) < _BODY_WORD_THRESHOLD or len(scripts) > _SCRIPT_TAG_THRESHOLD:
                return True
    return False


@dataclass
class PageData:
    url: str
    status_code: int
    load_time_ms: float
    html: str
    soup: BeautifulSoup
    response_headers: dict = field(default_factory=dict)
    error: Optional[str] = None
    skip_psi: bool = False  # Skip PSI API call for secondary/batch pages
    js_rendered: bool = False    # True when fetched via Playwright headless browser
    js_heavy: bool = False       # True when JS framework detected but NOT rendered

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


def parse_raw_html(html: str, url: str = "pasted-html") -> PageData:
    """
    Build a PageData from raw HTML string (no HTTP request).
    Useful for auditing pasted HTML, staging pages, or login-gated content.
    Response-header-based checks (HSTS, compression, cache) will be skipped.
    """
    soup = BeautifulSoup(html, "html.parser")
    return PageData(
        url=url if url else "pasted-html",
        status_code=200,
        load_time_ms=0.0,
        html=html,
        soup=soup,
        response_headers={},
    )


_NAV_SKIP_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf", ".zip",
    ".css", ".js", ".xml", ".txt", ".ico", ".mp4", ".mp3", ".woff", ".woff2",
}
_NAV_SKIP_SCHEMES = {"mailto:", "tel:", "javascript:", "#"}


def extract_nav_links(page: "PageData", limit: int = 10) -> list[str]:
    """
    Extract unique internal page URLs from navigation elements on a page.
    Looks in <nav>, <header>, and elements with nav/menu class names first,
    then falls back to all links. Used for automatic multi-page site auditing.
    """
    if not page.url or page.url == "pasted-html" or page.error:
        return []

    base = urllib.parse.urlparse(page.url)
    if not base.netloc:
        return []

    primary_clean = urllib.parse.urlunparse(
        (base.scheme, base.netloc, base.path.rstrip("/") or "/", "", "", "")
    )

    soup = page.soup

    # Priority: nav/header containers first, then all links as fallback
    nav_containers = (
        soup.find_all("nav")
        + soup.find_all("header")
        + soup.find_all(class_=lambda c: c and any(
            kw in " ".join(c if isinstance(c, list) else [c]).lower()
            for kw in ["nav", "menu", "header", "navbar"]
        ))
    )
    search_scope = nav_containers if nav_containers else [soup]

    seen: set[str] = set()
    results: list[str] = []

    for container in search_scope:
        for a in container.find_all("a", href=True):
            href = a["href"].strip()
            if not href or any(href.startswith(s) for s in _NAV_SKIP_SCHEMES):
                continue

            abs_url = urllib.parse.urljoin(page.url, href)
            parsed = urllib.parse.urlparse(abs_url)

            # Internal links only
            if parsed.netloc != base.netloc:
                continue

            # Skip non-HTML file types
            path_lower = parsed.path.lower()
            if any(path_lower.endswith(ext) for ext in _NAV_SKIP_EXTENSIONS):
                continue

            # Normalise: strip query params, fragments, trailing slash
            clean = urllib.parse.urlunparse(
                (parsed.scheme, parsed.netloc, parsed.path.rstrip("/") or "/", "", "", "")
            )

            if clean == primary_clean or clean in seen:
                continue

            seen.add(clean)
            results.append(clean)

            if len(results) >= limit:
                return results

    return results


def _fetch_with_playwright(url: str, timeout: int = DEFAULT_TIMEOUT) -> PageData:
    """
    Render the page using Playwright headless Chromium and return fully rendered HTML.
    Only called when _PLAYWRIGHT_AVAILABLE is True.
    """
    try:
        from playwright.sync_api import sync_playwright  # type: ignore
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(
                user_agent=USER_AGENT,
                viewport={"width": 1280, "height": 900},
                locale="en-US",
                extra_http_headers={
                    "Accept-Language": "en-US,en;q=0.9",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                },
            )
            page = ctx.new_page()
            start = time.perf_counter()
            resp = page.goto(url, wait_until="networkidle", timeout=timeout * 1000)
            # Extra wait for lazy-loaded content to settle
            page.wait_for_timeout(1500)
            html = page.content()
            elapsed_ms = (time.perf_counter() - start) * 1000
            final_url = page.url
            status = resp.status if resp else 200
            headers = dict(resp.all_headers()) if resp else {}
            browser.close()

        soup = BeautifulSoup(html, "html.parser")
        return PageData(
            url=final_url,
            status_code=status,
            load_time_ms=round(elapsed_ms, 1),
            html=html,
            soup=soup,
            response_headers=headers,
            js_rendered=True,
        )
    except Exception as exc:
        # Playwright failed — fall back to requests
        return PageData(
            url=url, status_code=0, load_time_ms=0.0,
            html="", soup=BeautifulSoup("", "html.parser"),
            error=f"Playwright render failed: {exc}",
        )


def fetch_page(url: str, timeout: int = DEFAULT_TIMEOUT) -> PageData:
    """
    Fetch *url* and return a :class:`PageData` instance.

    Strategy:
    1. Always fetch first with requests (fast, cheap).
    2. If the result looks like a JS-rendered SPA skeleton (thin text, React/
       Next.js/Vue/Angular detected) AND Playwright is available, re-fetch
       with a headless browser to get the fully rendered DOM.
    3. If Playwright is not available and the page is JS-heavy, set
       PageData.js_heavy=True so the audit can flag the limitation.

    Never raises; errors are captured in ``PageData.error``.
    """
    try:
        start = time.perf_counter()
        session = requests.Session()
        resp = session.get(
            url,
            headers=BROWSER_HEADERS,
            timeout=timeout,
            allow_redirects=True,
        )
        elapsed_ms = (time.perf_counter() - start) * 1000
        soup = BeautifulSoup(resp.text, "html.parser")
        page_data = PageData(
            url=resp.url,
            status_code=resp.status_code,
            load_time_ms=round(elapsed_ms, 1),
            html=resp.text,
            soup=soup,
            response_headers=dict(resp.headers),
        )
    except requests.exceptions.RequestException as exc:
        return PageData(
            url=url, status_code=0, load_time_ms=0.0,
            html="", soup=BeautifulSoup("", "html.parser"),
            error=str(exc),
        )

    # ── Bot-block detection ───────────────────────────────────────────────────
    if _is_bot_blocked(page_data.html, page_data.soup, page_data.status_code):
        page_data.error = (
            "BOT_BLOCKED: The site returned a bot-detection challenge or access-denied "
            "page instead of real content. Results will be inaccurate. "
            "Use Playwright rendering (PLAYWRIGHT_ENABLED=1) for sites with strict bot protection."
        )
        return page_data

    # ── JS rendering decision ─────────────────────────────────────────────────
    if _FORCE_REQUESTS:
        return page_data

    if _needs_js_render(page_data.html, page_data.soup):
        if (_PLAYWRIGHT_AVAILABLE or _FORCE_PLAYWRIGHT) and not _FORCE_REQUESTS:
            # Re-fetch with full headless browser rendering
            rendered = _fetch_with_playwright(url, timeout)
            if not rendered.error:
                return rendered
            # Playwright failed — fall through to requests result
        # Mark that JS rendering was needed but not done
        page_data.js_heavy = True

    return page_data
