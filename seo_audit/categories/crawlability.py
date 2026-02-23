"""
crawlability.py — Crawlability & Indexability checks.
Covers: robots.txt validation, XML sitemap detection and validation,
        news sitemap, redirect chain detection on current page,
        broken hash-anchor links, and sampled internal link 404 checks.

All external HTTP requests use short timeouts and are skipped gracefully
when the page is a local HTML paste (url == 'pasted-html').
"""

from __future__ import annotations

import re
import urllib.parse

try:
    import requests as _req
    _HAS_REQUESTS = True
except ImportError:
    _HAS_REQUESTS = False

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


_USER_AGENT = (
    "Mozilla/5.0 (compatible; SEOAuditBot/1.0; "
    "+https://github.com/aividhyarthi/grievance-insight-engine)"
)
_HEADERS = {"User-Agent": _USER_AGENT}


# ── Tiny HTTP helpers ─────────────────────────────────────────────────────────

def _head_status(url: str, timeout: int = 6) -> int:
    """HEAD request → status code, or 0 on error."""
    if not _HAS_REQUESTS:
        return 0
    try:
        r = _req.head(url, headers=_HEADERS, timeout=timeout, allow_redirects=True)
        return r.status_code
    except Exception:
        return 0


def _get_text(url: str, timeout: int = 10) -> tuple[int, str]:
    """GET request → (status_code, body_text), or (0, '') on error."""
    if not _HAS_REQUESTS:
        return 0, ""
    try:
        r = _req.get(url, headers=_HEADERS, timeout=timeout, allow_redirects=True)
        return r.status_code, r.text
    except Exception:
        return 0, ""


def _domain_root(url: str) -> str:
    """Return scheme + netloc, e.g. 'https://example.com'."""
    p = urllib.parse.urlparse(url)
    return f"{p.scheme}://{p.netloc}"


def _is_live_url(page: PageData) -> bool:
    return bool(page.url and page.url.startswith("http") and page.url != "pasted-html")


# ── Robots.txt ────────────────────────────────────────────────────────────────

def _check_robots(page: PageData, f: list, root: str) -> str:
    """
    Fetch and validate robots.txt.
    Returns the raw robots.txt text (for sitemap extraction).
    """
    robots_url = f"{root}/robots.txt"
    status, text = _get_text(robots_url)

    if status == 0:
        f.append(Finding("Crawlability", "robots.txt — reachability", Severity.WARNING,
            f"robots.txt not reachable at {robots_url} (network error).",
            "Ensure robots.txt is publicly accessible at the domain root.",
            impact="Medium", effort="Quick Win"))
        return ""

    if status == 404:
        f.append(Finding("Crawlability", "robots.txt — missing", Severity.WARNING,
            f"robots.txt returns 404 at {robots_url}.",
            "Create a robots.txt file at the domain root. Without it, crawlers use defaults "
            "and you cannot reference your sitemap.",
            impact="Medium", effort="Quick Win"))
        return ""

    if status != 200:
        f.append(Finding("Crawlability", "robots.txt — HTTP error", Severity.WARNING,
            f"robots.txt at {robots_url} returned HTTP {status}.",
            "Ensure robots.txt serves with HTTP 200.",
            impact="Medium", effort="Quick Win"))
        return ""

    # robots.txt exists — validate content
    lines = [l.strip() for l in text.splitlines()]
    has_user_agent = any(l.lower().startswith("user-agent:") for l in lines)
    disallow_all = any(
        l.lower().startswith("disallow:") and l.split(":", 1)[1].strip() == "/"
        for l in lines
    )
    has_sitemap_ref = any(l.lower().startswith("sitemap:") for l in lines)

    if not has_user_agent:
        f.append(Finding("Crawlability", "robots.txt — malformed", Severity.WARNING,
            f"robots.txt at {robots_url} has no User-agent directive — file may be malformed.",
            "A valid robots.txt must have at least: 'User-agent: *' followed by Allow/Disallow rules.",
            impact="Medium", effort="Quick Win"))
    elif disallow_all:
        f.append(Finding("Crawlability", "robots.txt — blocks all crawlers", Severity.CRITICAL,
            f"robots.txt at {robots_url} contains 'Disallow: /' — "
            "this blocks ALL search engine crawlers from the entire site.",
            "Remove or restrict the global Disallow: / rule. Only use it on staging/dev environments.",
            impact="High", effort="Quick Win"))
    else:
        # Check for suspicious disallow rules on important paths
        disallow_values = [
            l.split(":", 1)[1].strip()
            for l in lines
            if l.lower().startswith("disallow:")
        ]
        suspicious = [d for d in disallow_values if d in ("/", "/api", "/product", "/shop", "/blog")]
        if suspicious:
            f.append(Finding("Crawlability", "robots.txt — suspicious disallow rules", Severity.WARNING,
                f"robots.txt at {robots_url} disallows: {', '.join(suspicious)}.",
                "Review these paths — disallowing /blog, /product, or /shop prevents SEO indexing.",
                impact="High", effort="Quick Win"))
        else:
            f.append(Finding("Crawlability", "robots.txt", Severity.PASS,
                f"robots.txt present and valid at {robots_url}."))

    if not has_sitemap_ref:
        f.append(Finding("Crawlability", "robots.txt — sitemap reference", Severity.INFO,
            f"robots.txt at {robots_url} has no 'Sitemap:' directive.",
            "Add 'Sitemap: https://yourdomain.com/sitemap.xml' to robots.txt — "
            "helps Google discover your sitemap without a Search Console submission.",
            impact="Medium", effort="Quick Win"))

    return text


# ── Sitemap ───────────────────────────────────────────────────────────────────

def _check_sitemap(page: PageData, f: list, root: str, robots_text: str) -> None:
    """Detect and validate the XML sitemap."""

    # Step 1: extract sitemap URLs from robots.txt
    sitemap_urls_from_robots: list[str] = []
    for line in robots_text.splitlines():
        if line.strip().lower().startswith("sitemap:"):
            val = line.split(":", 1)[1].strip()
            if val.startswith("http"):
                sitemap_urls_from_robots.append(val)

    # Step 2: common fallback locations
    fallback_paths = ["/sitemap.xml", "/sitemap_index.xml", "/sitemaps.xml", "/sitemap/sitemap.xml"]
    fallback_urls = [f"{root}{p}" for p in fallback_paths]

    found_sitemap: str | None = None
    is_from_robots = False

    # Prefer robots.txt reference
    for url in sitemap_urls_from_robots:
        status = _head_status(url)
        if status == 200:
            found_sitemap = url
            is_from_robots = True
            break
        elif status != 0:
            f.append(Finding("Crawlability", "Sitemap — broken reference in robots.txt",
                Severity.CRITICAL,
                f"robots.txt references sitemap at {url} but it returns HTTP {status}.",
                "Fix the sitemap URL in robots.txt or ensure the sitemap is served at that location.",
                impact="High", effort="Quick Win"))
            return

    # Fallback scan
    if not found_sitemap:
        for url in fallback_urls:
            status = _head_status(url)
            if status == 200:
                found_sitemap = url
                break

    if not found_sitemap:
        f.append(Finding("Crawlability", "XML sitemap — missing", Severity.CRITICAL,
            f"No sitemap found at common locations: {', '.join(fallback_urls[:3])}... "
            "and none referenced in robots.txt.",
            "Create an XML sitemap and submit it in Google Search Console. "
            "Reference it in robots.txt with: 'Sitemap: https://yourdomain.com/sitemap.xml'",
            impact="High", effort="Medium"))
        return

    source_note = " (referenced in robots.txt)" if is_from_robots else " (found at common location)"
    f.append(Finding("Crawlability", "XML sitemap", Severity.PASS,
        f"Sitemap found: {found_sitemap}{source_note}"))

    # Step 3: validate sitemap content
    sitemap_status, sitemap_text = _get_text(found_sitemap)
    if sitemap_status != 200 or not sitemap_text.strip():
        f.append(Finding("Crawlability", "Sitemap — empty or unreadable", Severity.WARNING,
            f"Sitemap at {found_sitemap} returned HTTP {sitemap_status} or empty body.",
            "Ensure the sitemap is a valid, non-empty XML file.",
            impact="High", effort="Medium"))
        return

    is_index = "<sitemapindex" in sitemap_text
    is_urlset = "<urlset" in sitemap_text

    if not is_index and not is_urlset:
        f.append(Finding("Crawlability", "Sitemap — invalid XML structure", Severity.WARNING,
            f"Sitemap at {found_sitemap} does not contain <sitemapindex> or <urlset> — "
            "may not be a valid XML sitemap.",
            "Validate the sitemap at https://www.xml-sitemaps.com/validate-xml-sitemap.html",
            impact="High", effort="Medium"))
        return

    # Count URLs
    url_count = len(re.findall(r"<url>", sitemap_text))
    sub_count = len(re.findall(r"<sitemap>", sitemap_text))

    if is_index:
        f.append(Finding("Crawlability", "Sitemap index", Severity.PASS,
            f"Sitemap index at {found_sitemap} references {sub_count} child sitemap(s)."))
        # Check for news sitemap reference
        news_ref = bool(re.search(r"news[-_]sitemap|news/sitemap", sitemap_text, re.I))
        if not news_ref:
            f.append(Finding("Crawlability", "News sitemap", Severity.INFO,
                "No news sitemap referenced in sitemap index.",
                "If you publish news/blog content, add a News Sitemap with <news:news> tags "
                "for faster indexing in Google News.",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("Crawlability", "News sitemap", Severity.PASS,
                "News sitemap reference found in sitemap index."))
    else:
        if url_count == 0:
            f.append(Finding("Crawlability", "Sitemap — no URLs", Severity.CRITICAL,
                f"Sitemap at {found_sitemap} has a <urlset> but zero <url> entries.",
                "Regenerate the sitemap — it appears empty. Check your CMS sitemap plugin settings.",
                impact="High", effort="Medium"))
        elif url_count > 50000:
            f.append(Finding("Crawlability", "Sitemap — too large", Severity.WARNING,
                f"Sitemap at {found_sitemap} contains {url_count:,} URLs. "
                "Google's limit is 50,000 URLs per sitemap file.",
                "Split into a sitemap index with multiple child sitemaps (e.g. by category or date).",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("Crawlability", "Sitemap URL count", Severity.PASS,
                f"Sitemap at {found_sitemap} contains {url_count:,} URL(s)."))

        # Check for <lastmod> tags
        has_lastmod = "<lastmod>" in sitemap_text
        if not has_lastmod:
            f.append(Finding("Crawlability", "Sitemap — lastmod missing", Severity.INFO,
                f"Sitemap at {found_sitemap} has no <lastmod> dates.",
                "Add <lastmod> to each URL — helps Google prioritise recently updated pages for recrawling.",
                impact="Low", effort="Medium"))

        # Check for <priority> overuse (all 1.0 = signals lazy setup)
        all_priority_one = re.findall(r"<priority>([^<]+)</priority>", sitemap_text)
        if all_priority_one and all(p.strip() == "1.0" for p in all_priority_one):
            f.append(Finding("Crawlability", "Sitemap — priority abuse", Severity.INFO,
                f"All {len(all_priority_one)} URLs have <priority>1.0</priority>. "
                "Setting every page to maximum priority defeats the purpose.",
                "Reserve priority 1.0 for homepage/key landing pages; use 0.8 for categories, 0.6 for posts.",
                impact="Low", effort="Quick Win"))

        # News sitemap check for standalone sitemap
        has_news_namespace = "news.google.com" in sitemap_text or "<news:" in sitemap_text
        if not has_news_namespace:
            f.append(Finding("Crawlability", "News sitemap", Severity.INFO,
                "Current sitemap is not a News Sitemap.",
                "For news/blog content, create a separate news sitemap with <news:news> tags "
                "for Google News indexing.",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("Crawlability", "News sitemap", Severity.PASS,
                f"News sitemap namespace detected at {found_sitemap}."))


# ── Redirects ─────────────────────────────────────────────────────────────────

def _check_redirects(page: PageData, f: list) -> None:
    """
    Detect redirect-related issues from the current page's data.
    We can't directly count redirect hops here (requests follows them),
    but we can check canonical mismatch and flag the redirect status.
    """
    canon = page.canonical_url
    page_url_norm = page.url.rstrip("/").split("?")[0].split("#")[0]
    canon_norm = canon.rstrip("/").split("?")[0].split("#")[0] if canon else ""

    if page.status_code in (301, 302, 307, 308):
        redirect_type = {301: "Permanent (301)", 302: "Temporary (302)",
                         307: "Temporary (307)", 308: "Permanent (308)"}.get(page.status_code)
        f.append(Finding("Crawlability", "Redirect chain", Severity.INFO,
            f"This URL is itself a redirect ({redirect_type}).",
            "Ensure redirect chains are no longer than 2 hops — each hop adds latency "
            "and can dilute a small amount of link equity.",
            impact="Medium", effort="Medium"))

    elif canon and canon_norm and canon_norm != page_url_norm:
        # Canonical points to a different URL — common sign of redirect or duplicate
        f.append(Finding("Crawlability", "Canonical vs URL mismatch", Severity.WARNING,
            f"Page URL: {page.url}\nCanonical: {canon}\n"
            "Canonical points to a different URL — this page may be treated as a duplicate.",
            "Either redirect this URL to the canonical, or ensure the canonical is intentionally "
            "different (e.g. paginated content).",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Crawlability", "Redirect / canonical consistency", Severity.PASS,
            "No redirect issues detected and canonical URL matches page URL."))


# ── Broken hash anchors ───────────────────────────────────────────────────────

def _check_hash_anchors(page: PageData, f: list) -> None:
    """Check that href='#id' links point to IDs that actually exist on the page."""
    soup = page.soup
    page_ids = {tag.get("id") for tag in soup.find_all(id=True) if tag.get("id")}

    hash_links = [
        l for l in page.links
        if l["href"].startswith("#") and l["href"] != "#" and l["internal"]
    ]
    broken = [l for l in hash_links if l["href"][1:] not in page_ids]

    if broken:
        examples = [l["href"] for l in broken[:5]]
        f.append(Finding("Crawlability", "Broken anchor links (#id)", Severity.WARNING,
            f"{len(broken)} anchor link(s) point to IDs that don't exist on this page: "
            f"{', '.join(examples)}",
            "Ensure every href='#section-id' has a matching id='section-id' element on the page. "
            "Broken anchors cause 'jump to' links to fail silently.",
            impact="Medium", effort="Quick Win"))
    elif hash_links:
        f.append(Finding("Crawlability", "Anchor links (#id)", Severity.PASS,
            f"All {len(hash_links)} on-page anchor link(s) resolve to existing IDs."))


# ── Internal link 404 sampling ────────────────────────────────────────────────

def _check_internal_404s(page: PageData, f: list, root: str) -> None:
    """
    Sample up to 5 internal content links and check for 404s via HEAD requests.
    Skips nav/footer links where possible by preferring links in body <p>/<a> context.
    """
    soup = page.soup

    # Collect internal links from body content (prefer <p> and <article> context)
    content_links: list[str] = []
    body = soup.find("body")
    if body:
        for a in body.find_all("a", href=True):
            href = a["href"].strip()
            if not href or href.startswith("#") or href.startswith("javascript"):
                continue
            # Skip nav/footer links
            if a.find_parent(["nav", "footer", "header"]):
                continue
            # Build absolute URL
            abs_url = urllib.parse.urljoin(page.url, href)
            parsed = urllib.parse.urlparse(abs_url)
            page_parsed = urllib.parse.urlparse(page.url)
            if parsed.netloc == page_parsed.netloc:
                content_links.append(abs_url)

    # Deduplicate and limit to 5
    seen: set[str] = set()
    sampled: list[str] = []
    for url in content_links:
        norm = url.rstrip("/").split("?")[0]
        if norm not in seen:
            seen.add(norm)
            sampled.append(url)
        if len(sampled) >= 5:
            break

    if not sampled:
        return  # Nothing to check

    broken: list[str] = []
    redirects: list[tuple[str, int]] = []
    for url in sampled:
        status = _head_status(url)
        if status == 404:
            broken.append(url)
        elif status in (301, 302, 307, 308):
            redirects.append((url, status))

    if broken:
        f.append(Finding("Crawlability", "Internal links — 404 errors", Severity.CRITICAL,
            f"{len(broken)} internal link(s) returning 404 (from {len(sampled)} sampled):\n"
            + "\n".join(f"  • {u}" for u in broken),
            "Fix or redirect these broken URLs — 404 internal links waste crawl budget "
            "and signal poor site maintenance to Google.",
            impact="High", effort="Quick Win"))
    elif redirects:
        redir_list = [f"{u} → {c}" for u, c in redirects[:3]]
        f.append(Finding("Crawlability", "Internal links — redirect chains", Severity.INFO,
            f"{len(redirects)} sampled internal link(s) redirect:\n" + "\n".join(redir_list),
            "Update internal links to point directly to the final URL — "
            "removes unnecessary redirect hops.",
            impact="Low", effort="Quick Win"))
        f.append(Finding("Crawlability", "Internal links — 404 errors", Severity.PASS,
            f"No 404 errors found in {len(sampled)} sampled internal link(s)."))
    else:
        f.append(Finding("Crawlability", "Internal links — 404 errors", Severity.PASS,
            f"No 404 errors found in {len(sampled)} sampled internal content link(s)."))


# ── Main run function ─────────────────────────────────────────────────────────

def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Crawlability",
        description=(
            "robots.txt validation, XML sitemap detection, redirect chain signals, "
            "broken anchor links, and sampled internal link 404 checks."
        ),
    )
    f = report.findings

    if not _is_live_url(page):
        f.append(Finding("Crawlability", "Live URL required", Severity.INFO,
            "Crawlability checks (robots.txt, sitemap, 404 sampling) require a live URL. "
            "Paste-mode only shows broken hash-anchor checks.",
            impact="High", effort="Quick Win"))
        # Still run hash-anchor check on pasted HTML
        _check_hash_anchors(page, f)
        return report

    root = _domain_root(page.url)

    # Run checks
    robots_text = _check_robots(page, f, root)
    _check_sitemap(page, f, root, robots_text)
    _check_redirects(page, f)
    _check_hash_anchors(page, f)
    _check_internal_404s(page, f, root)

    return report
