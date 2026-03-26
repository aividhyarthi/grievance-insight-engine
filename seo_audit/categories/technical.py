"""
technical.py — Technical SEO checks.
Covers: HTTPS, HTTP status, HSTS (with max-age validation), structured data
        (existence + type-specific field checks), viewport, doctype, charset,
        hreflang, X-Robots-Tag, Cache-Control (value intelligence).
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def _hsts_max_age(hsts_value: str) -> int | None:
    """Parse max-age from HSTS header value. Returns seconds or None."""
    m = re.search(r"max-age\s*=\s*(\d+)", hsts_value, re.I)
    return int(m.group(1)) if m else None


def _cache_control_is_positive(cc: str) -> bool:
    """Returns True if Cache-Control actually enables caching (not just present)."""
    cc_lower = cc.lower()
    # These directives actively prevent caching
    blocking = {"no-store", "no-cache", "must-revalidate", "max-age=0"}
    if any(b in cc_lower for b in blocking):
        return False
    return bool(re.search(r"max-age\s*=\s*[1-9]\d*", cc_lower) or "s-maxage" in cc_lower)


def _extract_schema_types(page) -> list[str]:
    types = []
    for s in page.structured_data:
        m = re.search(r'"@type"\s*:\s*"([^"]+)"', s)
        if m:
            types.append(m.group(1))
    return types


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Technical SEO",
        description="Crawlability, indexability, and server-level signals.",
    )
    f = report.findings

    # ── HTTP Status ───────────────────────────────────────────────────────────
    if page.error:
        f.append(Finding("Technical", "Reachability", Severity.CRITICAL,
            f"Page unreachable: {page.error}",
            "Ensure the URL is publicly accessible without authentication or firewall blocks.",
            impact="High", effort="Quick Win"))
        return report

    code = page.status_code
    if 200 <= code < 300:
        f.append(Finding("Technical", "HTTP status", Severity.PASS,
            f"HTTP {code} — page is reachable."))
    elif 300 <= code < 400:
        f.append(Finding("Technical", "HTTP redirect", Severity.INFO,
            f"HTTP {code}. Each redirect hop adds latency and can lose a small amount of link equity.",
            "Keep redirect chains to ≤2 hops; prefer 301 over 302 for permanent moves.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Technical", "HTTP status", Severity.CRITICAL,
            f"HTTP {code} — page is returning an error.",
            "Fix the server error or broken URL immediately.",
            impact="High", effort="Quick Win"))

    # ── HTTPS ─────────────────────────────────────────────────────────────────
    if page.url.startswith("https://"):
        f.append(Finding("Technical", "HTTPS", Severity.PASS,
            "Page served over HTTPS."))
    else:
        f.append(Finding("Technical", "HTTPS", Severity.CRITICAL,
            "Page served over HTTP (insecure). Google uses HTTPS as a ranking signal.",
            "Install an SSL/TLS certificate and redirect all HTTP → HTTPS via 301.",
            impact="High", effort="Medium"))

    # ── HSTS header — presence AND max-age ───────────────────────────────────
    hsts = page.response_headers.get("Strict-Transport-Security", "")
    if page.url.startswith("https://"):
        if not hsts:
            f.append(Finding("Technical", "HSTS header", Severity.WARNING,
                "HSTS header not set — browsers will not enforce HTTPS on repeat visits.",
                "Add: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
                impact="Medium", effort="Quick Win"))
        else:
            max_age = _hsts_max_age(hsts)
            if max_age is None:
                f.append(Finding("Technical", "HSTS header", Severity.WARNING,
                    f"HSTS header present but max-age is missing or unparseable: '{hsts}'",
                    "Set max-age to at least 31536000 (1 year) per Google's recommendation.",
                    impact="Low", effort="Quick Win"))
            elif max_age < 15768000:  # < 6 months
                f.append(Finding("Technical", "HSTS header", Severity.INFO,
                    f"HSTS max-age is only {max_age:,}s ({round(max_age/86400)} days). "
                    "Google requires ≥18 weeks (10,886,400 s) for HSTS preload list.",
                    "Increase to max-age=31536000 (1 year) for full preload eligibility.",
                    impact="Low", effort="Quick Win"))
            else:
                f.append(Finding("Technical", "HSTS header", Severity.PASS,
                    f"HSTS: max-age={max_age:,}s ({round(max_age/86400)} days) — strong setting."))

    # ── Multiple <head> sections (HTML structure bug) ─────────────────────────
    all_heads = page.soup.find_all("head")
    if len(all_heads) > 1:
        f.append(Finding("Technical", "Multiple <head> sections", Severity.CRITICAL,
            f"{len(all_heads)} <head> sections found in the HTML. "
            "Browsers only process the first <head> — meta tags, canonical, and schema "
            "in secondary head sections are invisible to crawlers.",
            "Merge all <head> content into a single <head> section. "
            "Usually caused by a CMS template or plugin conflict.",
            impact="High", effort="Quick Win"))

    # ── Structured Data / JSON-LD ─────────────────────────────────────────────
    schemas = page.structured_data
    if not schemas:
        f.append(Finding("Technical", "Structured data (JSON-LD)", Severity.CRITICAL,
            "No JSON-LD schema found.",
            "Add Schema.org markup (Organization, WebPage, BreadcrumbList) at minimum.",
            impact="High", effort="Medium"))
    else:
        types = _extract_schema_types(page)
        f.append(Finding("Technical", "Structured data (JSON-LD)", Severity.PASS,
            f"{len(schemas)} JSON-LD block(s). Types: {', '.join(types) or 'unknown'}"))

        # Validate critical field presence for common types
        schema_text = " ".join(schemas)
        issues = []
        if "Product" in types:
            if '"price"' not in schema_text and '"offers"' not in schema_text:
                issues.append("Product schema missing 'offers/price'")
            if '"availability"' not in schema_text:
                issues.append("Product schema missing 'availability'")
        if "Organization" in types or "LocalBusiness" in types:
            if '"name"' not in schema_text:
                issues.append("Organization schema missing 'name'")
            if '"url"' not in schema_text:
                issues.append("Organization schema missing 'url'")
        if "FAQPage" in types:
            if '"acceptedAnswer"' not in schema_text:
                issues.append("FAQPage schema missing 'acceptedAnswer' — invalid markup")
        if "Article" in types or "NewsArticle" in types:
            if '"datePublished"' not in schema_text:
                issues.append("Article schema missing 'datePublished'")
            if '"author"' not in schema_text:
                issues.append("Article schema missing 'author'")

        if issues:
            f.append(Finding("Technical", "Structured data field validation", Severity.CRITICAL,
                f"Schema field issues detected: {'; '.join(issues)}.",
                "Fix these to pass Google's Rich Results Test and maintain rich result eligibility.",
                impact="High", effort="Medium"))

        # ── BreadcrumbList schema ─────────────────────────────────────────────
        # Only flag if the page has a visible breadcrumb nav but no schema markup
        schema_text = " ".join(schemas)
        has_breadcrumb_schema = "BreadcrumbList" in schema_text
        breadcrumb_nav = (
            page.soup.find("nav", attrs={"aria-label": re.compile(r"breadcrumb", re.I)})
            or page.soup.find(attrs={"class": re.compile(r"breadcrumb", re.I)})
            or page.soup.find(attrs={"id": re.compile(r"breadcrumb", re.I)})
        )
        if breadcrumb_nav and not has_breadcrumb_schema:
            f.append(Finding("Technical", "BreadcrumbList schema missing", Severity.WARNING,
                "A breadcrumb navigation element was detected but no BreadcrumbList JSON-LD schema found. "
                "Google uses BreadcrumbList schema to display breadcrumbs in SERPs — "
                "missing it loses rich result display and site hierarchy signals.",
                "Add BreadcrumbList JSON-LD schema mirroring the visible breadcrumb nav. "
                "Each breadcrumb item needs 'name' and 'item' (URL) properties.",
                impact="Medium", effort="Quick Win"))
        elif has_breadcrumb_schema:
            f.append(Finding("Technical", "BreadcrumbList schema", Severity.PASS,
                "BreadcrumbList JSON-LD schema present."))

        # ── VideoObject schema when video is embedded ─────────────────────────
        has_video_schema = "VideoObject" in schema_text
        has_embedded_video = bool(
            page.soup.find("video")
            or page.soup.find("iframe", src=re.compile(r"(youtube|vimeo|wistia|loom)", re.I))
        )
        if has_embedded_video and not has_video_schema:
            f.append(Finding("Technical", "VideoObject schema missing", Severity.INFO,
                "An embedded video (YouTube/Vimeo/HTML5) was found but no VideoObject JSON-LD schema. "
                "VideoObject schema enables Google Video rich results — thumbnails, duration, "
                "and video carousels in search.",
                "Add VideoObject schema with: name, description, thumbnailUrl, uploadDate, "
                "duration, and embedUrl/contentUrl.",
                impact="Medium", effort="Quick Win"))
        elif has_video_schema:
            f.append(Finding("Technical", "VideoObject schema", Severity.PASS,
                "VideoObject JSON-LD schema present for embedded video content."))

    # ── Viewport Meta ─────────────────────────────────────────────────────────
    viewport = page.soup.find("meta", attrs={"name": "viewport"})
    if not viewport:
        f.append(Finding("Technical", "Viewport meta tag", Severity.CRITICAL,
            "No viewport meta tag — Google will classify this page as not mobile-friendly.",
            "Add <meta name='viewport' content='width=device-width, initial-scale=1'>",
            impact="High", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "Viewport meta tag", Severity.PASS,
            f"Viewport: {viewport.get('content', 'set')}"))

    # ── Doctype ───────────────────────────────────────────────────────────────
    if page.html and not page.html.strip().lower().startswith("<!doctype"):
        f.append(Finding("Technical", "HTML Doctype", Severity.WARNING,
            "Missing DOCTYPE declaration — browser may enter quirks mode.",
            "Add <!DOCTYPE html> as the very first line of the document.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "HTML Doctype", Severity.PASS,
            "DOCTYPE present."))

    # ── Charset ───────────────────────────────────────────────────────────────
    charset_tag = page.soup.find("meta", attrs={"charset": True})
    charset_http = page.soup.find("meta", attrs={"http-equiv": re.compile("content-type", re.I)})
    if not charset_tag and not charset_http:
        f.append(Finding("Technical", "Charset declaration", Severity.WARNING,
            "No charset meta tag found — character encoding is ambiguous.",
            "Add <meta charset='UTF-8'> immediately after the opening <head> tag.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "Charset declaration", Severity.PASS,
            "Charset declared."))

    # ── Hreflang ─────────────────────────────────────────────────────────────
    hreflang = page.soup.find_all("link", attrs={"hreflang": True})
    if not hreflang:
        f.append(Finding("Technical", "Hreflang tags", Severity.INFO,
            "No hreflang tags found. Required if the site targets multiple languages or regions.",
            "Add hreflang annotations for each language/region variant and include an x-default.",
            impact="Medium", effort="Long-term"))
    else:
        # Check for x-default
        has_default = any(l.get("hreflang") == "x-default" for l in hreflang)
        if not has_default:
            f.append(Finding("Technical", "Hreflang tags", Severity.INFO,
                f"{len(hreflang)} hreflang tag(s) found but no x-default. "
                "x-default tells Google which URL to show for unlisted locales.",
                "Add <link rel='alternate' hreflang='x-default' href='...'>",
                impact="Low", effort="Quick Win"))
        else:
            f.append(Finding("Technical", "Hreflang tags", Severity.PASS,
                f"{len(hreflang)} hreflang tag(s) including x-default."))

    # ── X-Robots-Tag header ───────────────────────────────────────────────────
    x_robots = page.response_headers.get("X-Robots-Tag", "")
    if "noindex" in x_robots.lower():
        f.append(Finding("Technical", "X-Robots-Tag header", Severity.CRITICAL,
            f"X-Robots-Tag: {x_robots} — page is blocked from indexing via HTTP header.",
            "Remove noindex from the X-Robots-Tag header (often set in server config or CDN).",
            impact="High", effort="Quick Win"))
    elif x_robots:
        f.append(Finding("Technical", "X-Robots-Tag header", Severity.INFO,
            f"X-Robots-Tag: {x_robots}"))

    # ── Cache-Control — value intelligence ───────────────────────────────────
    cache = page.response_headers.get("Cache-Control", "")
    if not cache:
        f.append(Finding("Technical", "Cache-Control header", Severity.WARNING,
            "No Cache-Control header — browsers and CDNs cannot cache the page reliably.",
            "Set Cache-Control: public, max-age=3600 (or higher for stable pages) to enable caching.",
            impact="Medium", effort="Medium"))
    elif not _cache_control_is_positive(cache):
        f.append(Finding("Technical", "Cache-Control header", Severity.WARNING,
            f"Cache-Control set to '{cache}' — this actively prevents caching on every visit.",
            "For public pages, use max-age=3600 or higher. Reserve no-store for private/dynamic content.",
            impact="Medium", effort="Medium"))
    else:
        # Extract max-age for context
        ma = re.search(r"max-age\s*=\s*(\d+)", cache, re.I)
        if ma:
            seconds = int(ma.group(1))
            days = round(seconds / 86400, 1)
            f.append(Finding("Technical", "Cache-Control header", Severity.PASS,
                f"Cache-Control: {cache} (cached for {days} day(s))."))
        else:
            f.append(Finding("Technical", "Cache-Control header", Severity.PASS,
                f"Cache-Control: {cache}"))

    # ── Favicon ───────────────────────────────────────────────────────────────
    favicon = (
        page.soup.find("link", rel="icon")
        or page.soup.find("link", rel="shortcut icon")
        or page.soup.find("link", rel="apple-touch-icon")
    )
    if not favicon:
        f.append(Finding("Technical", "Favicon", Severity.WARNING,
            "No favicon found — browsers show a blank tab icon, reducing brand recognition in search results and tabs.",
            "Add <link rel='icon' href='/favicon.ico'> (or .png/.svg) inside <head>.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "Favicon", Severity.PASS,
            f"Favicon present: {favicon.get('href', 'set')}."))

    # ── Mixed content (HTTP resources on HTTPS page) ──────────────────────────
    if page.url.startswith("https://"):
        http_resources = [
            tag.get("src") for tag in page.soup.find_all(
                ["img", "script", "iframe"], src=re.compile(r"^http://", re.I))
        ] + [
            tag.get("href") for tag in page.soup.find_all(
                "link", href=re.compile(r"^http://", re.I))
        ]
        http_resources = [r for r in http_resources if r]
        http_links = [
            a["href"] for a in page.soup.find_all("a", href=re.compile(r"^http://", re.I))
        ]
        if http_resources:
            f.append(Finding("Technical", "Mixed content", Severity.CRITICAL,
                f"{len(http_resources)} resource(s) (scripts/images/styles) loaded over HTTP "
                "on an HTTPS page — browsers block mixed content, breaking functionality.",
                "Update all resource src/href values to HTTPS or protocol-relative URLs (//).",
                impact="High", effort="Quick Win"))
        elif http_links:
            f.append(Finding("Technical", "Mixed content", Severity.WARNING,
                f"{len(http_links)} outbound link(s) point to HTTP URLs — may trigger browser security warnings.",
                "Update outbound links to HTTPS where available.",
                impact="Low", effort="Medium"))
        else:
            f.append(Finding("Technical", "Mixed content", Severity.PASS,
                "No HTTP resources or links detected — page content is fully served over HTTPS."))

    # ── Content-Security-Policy ───────────────────────────────────────────────
    csp = page.response_headers.get("Content-Security-Policy", "")
    if not csp:
        f.append(Finding("Technical", "Content-Security-Policy (CSP)", Severity.WARNING,
            "No Content-Security-Policy header — the page has no protection against "
            "cross-site scripting (XSS) injection attacks.",
            "Add a CSP header: Content-Security-Policy: default-src 'self'. "
            "Use csp-evaluator.withgoogle.com to iteratively tighten.",
            impact="Medium", effort="Long-term"))
    else:
        weak = []
        if "'unsafe-inline'" in csp:
            weak.append("'unsafe-inline'")
        if "'unsafe-eval'" in csp:
            weak.append("'unsafe-eval'")
        if weak:
            f.append(Finding("Technical", "Content-Security-Policy (CSP)", Severity.WARNING,
                f"CSP present but contains {', '.join(weak)} — significantly weakening XSS protection.",
                "Replace unsafe directives with nonce- or hash-based CSP allowlists.",
                impact="Medium", effort="Long-term"))
        else:
            f.append(Finding("Technical", "Content-Security-Policy (CSP)", Severity.PASS,
                "CSP header present with no unsafe-inline or unsafe-eval directives."))

    # ── Clickjacking protection ───────────────────────────────────────────────
    xfo = page.response_headers.get("X-Frame-Options", "")
    csp_frame_ancestors = "frame-ancestors" in csp.lower() if csp else False
    if not xfo and not csp_frame_ancestors:
        f.append(Finding("Technical", "Clickjacking protection (X-Frame-Options)", Severity.WARNING,
            "No X-Frame-Options header or CSP frame-ancestors directive — "
            "the page can be embedded in third-party iframes, enabling clickjacking attacks.",
            "Add: X-Frame-Options: SAMEORIGIN  (or CSP: frame-ancestors 'self')",
            impact="Medium", effort="Quick Win"))
    else:
        protection = xfo or "CSP frame-ancestors"
        f.append(Finding("Technical", "Clickjacking protection (X-Frame-Options)", Severity.PASS,
            f"Clickjacking protection in place ({protection})."))

    # ── Cross-Origin-Opener-Policy ────────────────────────────────────────────
    coop = page.response_headers.get("Cross-Origin-Opener-Policy", "")
    if not coop:
        f.append(Finding("Technical", "Cross-Origin-Opener-Policy (COOP)", Severity.INFO,
            "No COOP header — the browsing context can be shared with cross-origin popups, "
            "potentially exposing the page to side-channel timing attacks.",
            "Add: Cross-Origin-Opener-Policy: same-origin",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("Technical", "Cross-Origin-Opener-Policy (COOP)", Severity.PASS,
            f"COOP header set: {coop}"))

    # ── <head> tag hygiene ────────────────────────────────────────────────────
    head = page.soup.find("head")
    if head:
        if head.find("noscript"):
            f.append(Finding("Technical", "<noscript> in <head>", Severity.WARNING,
                "<noscript> tag found inside <head> — can interfere with Googlebot's rendering "
                "and cause parser errors in strict HTML mode.",
                "Move all <noscript> tags to <body>.",
                impact="Low", effort="Quick Win"))
        else:
            f.append(Finding("Technical", "<noscript> in <head>", Severity.PASS,
                "No <noscript> tags inside <head>."))

        _VALID_HEAD_TAGS = {
            "title", "meta", "link", "script", "style", "base", "noscript", "template",
        }
        invalid_in_head = [
            tag.name for tag in head.find_all(True, recursive=False)
            if tag.name and tag.name.lower() not in _VALID_HEAD_TAGS
        ]
        if invalid_in_head:
            examples = ", ".join(f"<{t}>" for t in invalid_in_head[:4])
            f.append(Finding("Technical", "Invalid elements in <head>", Severity.WARNING,
                f"Non-permitted HTML element(s) found inside <head>: {examples}. "
                "Browsers silently move these to <body>, causing unpredictable layout.",
                "Only <title>, <meta>, <link>, <script>, and <style> belong inside <head>.",
                impact="Low", effort="Quick Win"))
        else:
            f.append(Finding("Technical", "Invalid elements in <head>", Severity.PASS,
                "<head> contains only valid HTML elements."))

    return report
