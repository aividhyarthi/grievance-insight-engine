"""
site_crawler.py — Multi-page site crawler.

Strategy:
  1. Fetch /sitemap.xml (and sitemap index entries) for a structured URL list.
  2. If sitemap is absent / empty, extract links from the homepage.
  3. Crawl up to `max_pages` same-domain URLs concurrently (5 workers).
  4. Run the full 12-category audit on each page.
  5. Return a SiteCrawlResult aggregating everything.
"""

from __future__ import annotations

import re
import time
import urllib.parse
import xml.etree.ElementTree as ET
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from typing import Optional

import requests

from .crawler import fetch_page, PageData, USER_AGENT, DEFAULT_TIMEOUT
from .engine import run_audit
from .outputs.models import AuditResult
from .site_types.profiles import SiteType, SiteProfile, get_profile
from .categories.base import Finding, Severity


# ─── URL helpers ──────────────────────────────────────────────────────────────

def _normalise(url: str, base: str) -> Optional[str]:
    """
    Make *url* absolute, strip fragment, and return None if it's off-domain
    or points to a non-HTML resource.
    """
    parsed_base = urllib.parse.urlparse(base)
    parsed = urllib.parse.urlparse(url)

    # Resolve relative URLs
    if not parsed.scheme:
        url = urllib.parse.urljoin(base, url)
        parsed = urllib.parse.urlparse(url)

    # Must be same domain
    if parsed.netloc and parsed.netloc != parsed_base.netloc:
        return None

    # Skip non-HTML resources
    skip_exts = re.compile(
        r"\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|tar|gz|mp4|mp3|avi|css|js|"
        r"woff|woff2|ttf|eot|ico|xml|json|txt|csv)$",
        re.I,
    )
    if skip_exts.search(parsed.path):
        return None

    # Skip query-heavy URLs (faceted nav etc.)
    if parsed.query and len(parsed.query) > 100:
        return None

    # Remove fragment
    clean = urllib.parse.urlunparse(
        (parsed.scheme, parsed.netloc, parsed.path.rstrip("/") or "/",
         parsed.params, parsed.query, "")
    )
    return clean


def _sitemap_urls(base_url: str, timeout: int = DEFAULT_TIMEOUT) -> list[str]:
    """
    Try to fetch sitemap.xml (and any sitemap index entries).
    Returns a list of page URLs found, deduplicated.
    """
    headers = {"User-Agent": USER_AGENT}
    candidates = [
        base_url.rstrip("/") + "/sitemap.xml",
        base_url.rstrip("/") + "/sitemap_index.xml",
        base_url.rstrip("/") + "/sitemap-index.xml",
    ]
    # Also check robots.txt for Sitemap: directive
    try:
        robots = requests.get(
            base_url.rstrip("/") + "/robots.txt", headers=headers, timeout=timeout
        ).text
        for line in robots.splitlines():
            if line.lower().startswith("sitemap:"):
                candidates.insert(0, line.split(":", 1)[1].strip())
    except Exception:
        pass

    NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls: list[str] = []
    visited_sitemaps: set[str] = set()

    def _parse_sitemap(sitemap_url: str) -> None:
        if sitemap_url in visited_sitemaps:
            return
        visited_sitemaps.add(sitemap_url)
        try:
            resp = requests.get(sitemap_url, headers=headers, timeout=timeout)
            if resp.status_code != 200:
                return
            root = ET.fromstring(resp.content)
            tag = root.tag.lower()

            if "sitemapindex" in tag:
                # Sitemap index — recurse into child sitemaps
                for sm in root.findall("sm:sitemap/sm:loc", NS):
                    _parse_sitemap(sm.text.strip())
            else:
                # Regular sitemap — collect <loc> entries
                for loc in root.findall("sm:url/sm:loc", NS):
                    urls.append(loc.text.strip())
        except Exception:
            pass

    for c in candidates:
        _parse_sitemap(c)
        if urls:
            break

    return list(dict.fromkeys(urls))  # deduplicate preserving order


# ─── SiteCrawlResult ──────────────────────────────────────────────────────────

@dataclass
class SiteCrawlResult:
    base_url: str
    site_type: SiteType
    profile: SiteProfile
    page_results: list[AuditResult] = field(default_factory=list)
    crawl_errors: list[tuple[str, str]] = field(default_factory=list)  # (url, error)

    # ── Aggregate stats ────────────────────────────────────────────────────────

    @property
    def pages_audited(self) -> int:
        return len(self.page_results)

    @property
    def overall_score(self) -> int:
        if not self.page_results:
            return 0
        return round(sum(r.overall_score for r in self.page_results) / len(self.page_results))

    @property
    def all_critical(self) -> list[tuple[str, Finding]]:
        return [(r.url, f) for r in self.page_results for f in r.critical_findings]

    @property
    def all_warnings(self) -> list[tuple[str, Finding]]:
        return [(r.url, f) for r in self.page_results for f in r.warning_findings]

    @property
    def all_quick_wins(self) -> list[tuple[str, Finding]]:
        return [(r.url, f) for r in self.page_results for f in r.quick_wins]

    @property
    def category_avg_scores(self) -> dict[str, int]:
        """Average score per category across all pages."""
        totals: dict[str, list[int]] = {}
        for result in self.page_results:
            for cr in result.category_reports:
                totals.setdefault(cr.name, []).append(cr.score)
        return {k: round(sum(v) / len(v)) for k, v in totals.items()}

    @property
    def top_issues(self) -> list[tuple[str, int]]:
        """
        Most common failing checks across the site.
        Returns [(check_name, count)] sorted descending.
        """
        checks = Counter()
        for _, f in self.all_critical + self.all_warnings:
            checks[f"{f.category} — {f.check}"] += 1
        return checks.most_common(15)

    @property
    def pages_with_critical(self) -> int:
        return sum(1 for r in self.page_results if r.critical_findings)

    @property
    def score_distribution(self) -> dict[str, int]:
        """How many pages fall into each score band."""
        bands = {"0–29": 0, "30–49": 0, "50–69": 0, "70–84": 0, "85–100": 0}
        for r in self.page_results:
            s = r.overall_score
            if s < 30:      bands["0–29"] += 1
            elif s < 50:    bands["30–49"] += 1
            elif s < 70:    bands["50–69"] += 1
            elif s < 85:    bands["70–84"] += 1
            else:           bands["85–100"] += 1
        return bands


# ─── Crawler ──────────────────────────────────────────────────────────────────

def crawl_site(
    base_url: str,
    site_type: SiteType | str = SiteType.GENERIC,
    max_pages: int = 20,
    max_workers: int = 4,
    timeout: int = DEFAULT_TIMEOUT,
    progress_cb=None,  # optional callable(current, total, url)
) -> SiteCrawlResult:
    """
    Crawl *base_url* and audit up to *max_pages* pages.

    Args:
        base_url:    Root URL of the site (e.g. https://example.com)
        site_type:   SiteType or string value
        max_pages:   Maximum pages to audit (default 20)
        max_workers: Concurrent fetch workers (default 4)
        timeout:     Per-request timeout in seconds
        progress_cb: Optional callback(current_int, total_int, url_str)

    Returns:
        SiteCrawlResult
    """
    if not base_url.startswith(("http://", "https://")):
        base_url = "https://" + base_url

    profile = get_profile(site_type)
    result = SiteCrawlResult(
        base_url=base_url,
        site_type=profile.site_type,
        profile=profile,
    )

    # ── 1. Collect candidate URLs ─────────────────────────────────────────────
    print(f"  Checking sitemap.xml…", flush=True)
    urls = _sitemap_urls(base_url, timeout=timeout)

    if not urls:
        # Fall back: crawl homepage and collect all internal links
        print(f"  No sitemap found — collecting links from homepage…", flush=True)
        home_page = fetch_page(base_url, timeout=timeout)
        if home_page.error:
            result.crawl_errors.append((base_url, home_page.error))
            return result

        home_links = [
            n for l in home_page.links
            if l["internal"]
            for n in [_normalise(l["href"], base_url)]
            if n
        ]
        urls = list(dict.fromkeys([base_url] + home_links))
    else:
        # Always include the homepage even if not in sitemap
        if base_url not in urls and base_url.rstrip("/") not in urls:
            urls.insert(0, base_url)

    # Filter to same-domain, remove duplicates, cap at max_pages
    filtered: list[str] = []
    seen: set[str] = set()
    for u in urls:
        norm = _normalise(u, base_url)
        if norm and norm not in seen:
            seen.add(norm)
            filtered.append(norm)
        if len(filtered) >= max_pages:
            break

    total = len(filtered)
    print(f"  Queued {total} URL(s) to audit…", flush=True)

    # ── 2. Concurrent fetch + audit ───────────────────────────────────────────
    completed = 0

    def _audit_one(url: str) -> tuple[str, AuditResult | None, str]:
        """Returns (url, result_or_None, error_str)."""
        page = fetch_page(url, timeout=timeout)
        if page.error:
            return url, None, page.error
        audit = run_audit(page, site_type=site_type)
        # Brief pause to be polite
        time.sleep(0.3)
        return url, audit, ""

    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = {pool.submit(_audit_one, u): u for u in filtered}
        for future in as_completed(futures):
            url, audit, err = future.result()
            completed += 1
            if progress_cb:
                progress_cb(completed, total, url)
            if err:
                result.crawl_errors.append((url, err))
            elif audit:
                result.page_results.append(audit)

    # Sort pages by score ascending (worst first)
    result.page_results.sort(key=lambda r: r.overall_score)
    return result
