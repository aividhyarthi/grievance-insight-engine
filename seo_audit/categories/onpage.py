"""
onpage.py — SEO On-Page checks.
Covers: title (length, keyword position, title≠H1), meta description,
        heading hierarchy, canonical, robots meta, language, OG tags,
        Twitter Card, image alt text (presence + quality).
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


_TRIVIAL_ALT_PATTERN = re.compile(
    r"^(image|photo|picture|img|thumbnail|banner|logo|icon|graphic|"
    r"untitled|img\d+|photo\d+|dsc\d+|screenshot|placeholder)$",
    re.I,
)

# Titles that signal a template was never filled in
_GENERIC_TITLE_PATTERN = re.compile(
    r"^(home|index|untitled|welcome|page|default|new page|"
    r"insert title here|title goes here|site title|"
    r"website|my website|my site|coming soon|under construction)$",
    re.I,
)

# Meta descriptions that signal copy-paste placeholder text
_GENERIC_DESC_PATTERN = re.compile(
    r"(description|meta description|add description|insert description|"
    r"your description here|page description|write a description|"
    r"no description|lorem ipsum)",
    re.I,
)

# Weak action verbs that indicate a meta description has a CTA
_CTA_VERBS = re.compile(
    r"\b(learn|discover|explore|get|buy|shop|try|start|find|see|read|"
    r"download|sign up|contact|call|book|request|order|view)\b",
    re.I,
)


def _similarity_ratio(a: str, b: str) -> float:
    """Rough character-level overlap ratio."""
    a, b = a.lower().strip(), b.lower().strip()
    if not a or not b:
        return 0.0
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    return len(shorter) / len(longer) if shorter in longer else 0.0


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="SEO On-Page",
        description="Fundamental on-page signals that search engines read directly.",
    )
    f = report.findings

    # ── Title ────────────────────────────────────────────────────────────────
    # Multiple <title> tags — only the first is used, rest confuse crawlers
    all_titles = page.soup.find_all("title")
    if len(all_titles) > 1:
        f.append(Finding("On-Page", "Multiple <title> tags", Severity.CRITICAL,
            f"{len(all_titles)} <title> tags found — browsers use only the first; "
            "extras confuse crawlers and often indicate a CMS/template bug.",
            "Remove all duplicate <title> tags; keep exactly one.",
            impact="High", effort="Quick Win"))

    title = page.title
    if not title:
        f.append(Finding("On-Page", "Title tag", Severity.CRITICAL,
            "No <title> tag found — Google cannot display this page in search results correctly.",
            "Add a unique, keyword-rich title (50–60 chars).",
            impact="High", effort="Quick Win"))
    elif _GENERIC_TITLE_PATTERN.match(title.strip()):
        f.append(Finding("On-Page", "Title tag — generic/placeholder", Severity.CRITICAL,
            f"Title is a generic placeholder: '{title}' — provides no keyword signal and "
            "destroys click-through rate in search results.",
            "Replace with a descriptive title: Primary Keyword — Supporting Phrase | Brand Name",
            impact="High", effort="Quick Win"))
    elif len(title) < 30:
        f.append(Finding("On-Page", "Title length", Severity.WARNING,
            f"Title too short ({len(title)} chars): '{title}'",
            "Expand to 50–60 characters — include primary keyword + brand.",
            impact="Medium", effort="Quick Win"))
    elif len(title) > 60:
        f.append(Finding("On-Page", "Title length", Severity.WARNING,
            f"Title too long ({len(title)} chars) — SERP will truncate after ~60 chars.",
            "Trim to ≤60 characters; move the most important keyword earlier.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Title tag", Severity.PASS,
            f"Title OK ({len(title)} chars): '{title}'"))

    # Title keyword front-loading — keyword should appear before any separator
    if title:
        separators = ["|", "—", "-", "·", "::", ">>"]
        for sep in separators:
            if sep in title:
                parts = [p.strip() for p in title.split(sep, 1)]
                # Brand-only in the first part is a weak signal
                if len(parts[0]) < 10:
                    f.append(Finding("On-Page", "Title keyword position", Severity.WARNING,
                        f"Title starts with brand/short prefix before '{sep}': '{title}'. "
                        "Google weights the beginning of the title most — lead with the keyword.",
                        "Restructure: Primary Keyword | Brand  (not: Brand | Keyword)",
                        impact="Medium", effort="Quick Win"))
                break

    # URL slug keywords — quick check from the URL path
    import urllib.parse as _urlparse
    path = _urlparse.urlparse(page.url).path.strip("/")
    if path and path not in ("", "/"):
        slug_words = re.split(r"[-_/]+", path.lower())
        slug_words = [w for w in slug_words if len(w) > 2]
        if not slug_words:
            f.append(Finding("On-Page", "URL slug", Severity.WARNING,
                f"URL path contains no readable keywords: '{page.url}'",
                "Use descriptive, hyphenated slugs: /best-seo-agency-dubai/ not /page?id=123",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("On-Page", "URL slug", Severity.PASS,
                f"URL contains keyword slugs: {', '.join(slug_words[:4])}."))

    # ── Title vs H1 duplication ───────────────────────────────────────────────
    h1s = page.h1_tags
    if title and h1s:
        sim = _similarity_ratio(title, h1s[0])
        if sim > 0.9:
            f.append(Finding("On-Page", "Title ≠ H1", Severity.INFO,
                f"Title and H1 are nearly identical: '{title}' / '{h1s[0]}'",
                "Title and H1 can share the primary keyword but should differ in phrasing — "
                "the title sells the click; the H1 sets the page context.",
                impact="Low", effort="Quick Win"))

    # ── Meta Description ─────────────────────────────────────────────────────
    # Multiple meta description tags — only first is used; duplicates signal CMS bugs
    all_meta_descs = page.soup.find_all("meta", attrs={"name": lambda n: n and n.lower() == "description"})
    if len(all_meta_descs) > 1:
        f.append(Finding("On-Page", "Multiple meta description tags", Severity.WARNING,
            f"{len(all_meta_descs)} <meta name='description'> tags found. "
            "Only the first is used; extras usually mean a plugin or template is injecting a duplicate.",
            "Remove all duplicate meta description tags — keep exactly one.",
            impact="Medium", effort="Quick Win"))

    desc = page.meta_description
    if not desc:
        f.append(Finding("On-Page", "Meta description", Severity.CRITICAL,
            "No meta description — Google auto-generates a snippet, often choosing irrelevant text. "
            "This directly reduces click-through rate.",
            "Write a 150–160 char description: keyword + clear benefit + call-to-action.",
            impact="High", effort="Quick Win"))
    elif _GENERIC_DESC_PATTERN.search(desc):
        f.append(Finding("On-Page", "Meta description — placeholder text", Severity.CRITICAL,
            f"Meta description appears to contain placeholder/template text: '{desc[:80]}…'",
            "Replace with a real description: include the primary keyword, a unique benefit, and a CTA.",
            impact="High", effort="Quick Win"))
    elif len(desc) < 70:
        f.append(Finding("On-Page", "Meta description length", Severity.WARNING,
            f"Too short ({len(desc)} chars) — under-utilised SERP real estate reduces CTR.",
            "Expand to 150–160 characters: keyword + benefit + CTA.",
            impact="Medium", effort="Quick Win"))
    elif len(desc) > 160:
        f.append(Finding("On-Page", "Meta description length", Severity.WARNING,
            f"Too long ({len(desc)} chars) — Google truncates after ~160 chars, cutting off your CTA.",
            "Shorten to ≤160 characters; put the most compelling copy first.",
            impact="Medium", effort="Quick Win"))
    else:
        has_cta = bool(_CTA_VERBS.search(desc))
        if not has_cta:
            f.append(Finding("On-Page", "Meta description — missing CTA", Severity.INFO,
                f"Meta description ({len(desc)} chars) has no clear call-to-action.",
                "Add an action phrase (e.g. 'Learn more', 'Get a free quote', 'Shop now') — "
                "CTAs measurably increase click-through rates from the SERP.",
                impact="Medium", effort="Quick Win"))
        else:
            f.append(Finding("On-Page", "Meta description", Severity.PASS,
                f"Meta description OK ({len(desc)} chars) with CTA detected."))

    # ── H1 ────────────────────────────────────────────────────────────────────
    if not h1s:
        f.append(Finding("On-Page", "H1 tag", Severity.CRITICAL,
            "No <h1> tag found.",
            "Add one descriptive H1 containing the primary keyword.",
            impact="High", effort="Quick Win"))
    elif len(h1s) > 1:
        f.append(Finding("On-Page", "H1 uniqueness", Severity.CRITICAL,
            f"{len(h1s)} H1 tags found: {h1s[:3]}",
            "Keep exactly one H1 per page — multiple H1s fragment the primary topic signal.",
            impact="High", effort="Quick Win"))
    else:
        h1 = h1s[0]
        if len(h1) < 10:
            f.append(Finding("On-Page", "H1 tag", Severity.WARNING,
                f"H1 is very short ({len(h1)} chars): '{h1}' — too vague to be a useful topic signal.",
                "Write an H1 of 20–70 characters that describes the page's specific topic.",
                impact="Medium", effort="Quick Win"))
        elif len(h1) > 100:
            f.append(Finding("On-Page", "H1 tag", Severity.INFO,
                f"H1 is very long ({len(h1)} chars). Long H1s can dilute keyword focus.",
                "Shorten H1 to the core topic (20–70 chars) and move supporting detail to body text.",
                impact="Low", effort="Quick Win"))
        else:
            f.append(Finding("On-Page", "H1 tag", Severity.PASS,
                f"Single H1 ({len(h1)} chars): '{h1}'"))

    # ── H2 / H3 structure ─────────────────────────────────────────────────────
    h2s = page.h2_tags
    h3s = page.h3_tags
    if not h2s:
        f.append(Finding("On-Page", "H2 structure", Severity.WARNING,
            "No H2 tags found. Content structure is flat — harder to crawl and scan.",
            "Use H2 subheadings to organise content into logical sections and capture long-tail queries.",
            impact="Medium", effort="Quick Win"))
    else:
        # H3 without H2 (skipped hierarchy)
        if h3s and not h2s:
            f.append(Finding("On-Page", "Heading hierarchy", Severity.WARNING,
                "H3 tags used but no H2 — heading hierarchy is broken.",
                "Always nest H3 within H2 sections; skipping levels confuses crawlers and screen readers.",
                impact="Medium", effort="Quick Win"))
        else:
            f.append(Finding("On-Page", "H2 structure", Severity.PASS,
                f"{len(h2s)} H2(s) and {len(h3s)} H3(s) — good heading structure."))

    # ── Canonical ────────────────────────────────────────────────────────────
    import urllib.parse as _up

    # Multiple canonical tags — any beyond the first are ignored and signal a CMS bug
    all_canonicals = page.soup.find_all("link", attrs={"rel": lambda r: r and "canonical" in r})
    if len(all_canonicals) > 1:
        f.append(Finding("On-Page", "Multiple canonical tags", Severity.CRITICAL,
            f"{len(all_canonicals)} <link rel='canonical'> tags found. "
            "Only the first is used by Google; multiple canonicals indicate a template conflict.",
            "Keep exactly one canonical tag per page.",
            impact="High", effort="Quick Win"))

    # Canonical in <body> instead of <head> — Google ignores body canonicals
    head_tag = page.soup.find("head")
    body_tag = page.soup.find("body")
    if body_tag:
        body_canonicals = body_tag.find_all("link", attrs={"rel": lambda r: r and "canonical" in r})
        if body_canonicals:
            f.append(Finding("On-Page", "Canonical tag in <body>", Severity.CRITICAL,
                "A canonical tag was found inside <body> — Google only processes canonical tags "
                "in <head>. This canonical is effectively invisible to crawlers.",
                "Move the <link rel='canonical'> tag to inside the <head> section.",
                impact="High", effort="Quick Win"))

    canon = page.canonical_url
    if not canon:
        f.append(Finding("On-Page", "Canonical URL", Severity.WARNING,
            "No canonical link tag — every URL variation (www/non-www, trailing slash, UTM) "
            "may be treated as a duplicate by Google.",
            "Add <link rel='canonical' href='full-preferred-URL'> to every page.",
            impact="Medium", effort="Quick Win"))
    else:
        # Fragment (#) in canonical — fragments are not sent to servers and are invalid in canonicals
        if "#" in canon:
            f.append(Finding("On-Page", "Canonical URL contains fragment (#)", Severity.WARNING,
                f"Canonical URL includes a hash fragment: '{canon}'. "
                "Fragments are client-side only — search engines strip them, making this "
                "canonical point to a different URL than intended.",
                "Remove the # and everything after it from the canonical href.",
                impact="Medium", effort="Quick Win"))
        # Cross-domain canonical
        canon_host = _up.urlparse(canon).netloc
        page_host = _up.urlparse(page.url).netloc
        if canon_host and page_host and canon_host != page_host:
            f.append(Finding("On-Page", "Canonical URL — cross-domain", Severity.CRITICAL,
                f"Canonical points to a different domain: '{canon}' — "
                "this surrenders all link equity and indexing to the target domain.",
                "Verify this is intentional (syndication). If not, fix to point to this page's own URL.",
                impact="High", effort="Quick Win"))
        elif not canon.startswith(("http://", "https://")):
            f.append(Finding("On-Page", "Canonical URL — relative", Severity.WARNING,
                f"Canonical is a relative URL: '{canon}' — some crawlers may resolve it incorrectly.",
                "Use an absolute URL including scheme and domain for canonical tags.",
                impact="Low", effort="Quick Win"))
        else:
            f.append(Finding("On-Page", "Canonical URL", Severity.PASS,
                f"Canonical set: {canon}"))

    # ── Robots Meta ──────────────────────────────────────────────────────────
    robots = page.robots_meta.lower()
    if "noindex" in robots:
        f.append(Finding("On-Page", "Indexability", Severity.CRITICAL,
            f"noindex directive detected: '{page.robots_meta}' — page is excluded from Google.",
            "Remove noindex if this page should appear in search results.",
            impact="High", effort="Quick Win"))
    elif "nofollow" in robots:
        f.append(Finding("On-Page", "Robots meta — nofollow", Severity.INFO,
            f"robots meta includes nofollow: '{page.robots_meta}' — outbound PageRank blocked.",
            "Remove nofollow from robots meta unless you specifically want to block all link equity.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Indexability", Severity.PASS,
            f"Robots meta: '{page.robots_meta or 'index, follow (default)'}'"))

    # ── noindex + canonical conflict ──────────────────────────────────────────
    if "noindex" in robots and canon:
        f.append(Finding("On-Page", "noindex + canonical conflict", Severity.CRITICAL,
            f"Page has both a noindex directive AND a canonical tag pointing to '{canon}'. "
            "These are contradictory signals — noindex tells Google to ignore the page, "
            "while canonical tells Google this is the preferred version to index.",
            "Choose one: either remove noindex (if the page should be indexed) or "
            "remove the canonical (if the page should be excluded). Having both confuses crawlers.",
            impact="High", effort="Quick Win"))

    # ── Language ─────────────────────────────────────────────────────────────
    lang = page.lang
    if not lang:
        f.append(Finding("On-Page", "HTML lang attribute", Severity.WARNING,
            "<html> tag missing lang attribute — Google cannot determine content language.",
            "Add lang='en' (or appropriate IETF language tag) to the <html> element.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "HTML lang attribute", Severity.PASS,
            f"lang='{lang}'"))

    # ── Open Graph ───────────────────────────────────────────────────────────
    og = page.open_graph
    required_og = ["og:title", "og:description", "og:image", "og:url"]
    missing_og = [k for k in required_og if k not in og]
    if missing_og:
        f.append(Finding("On-Page", "Open Graph tags", Severity.WARNING,
            f"Missing OG tags: {', '.join(missing_og)}. "
            "Facebook, LinkedIn, Slack, and WhatsApp all use these for link previews.",
            "Add all four core OG tags to every page.",
            impact="Medium", effort="Quick Win"))
    else:
        og_img = og.get("og:image", "")
        if not og_img or len(og_img) < 5:
            f.append(Finding("On-Page", "Open Graph tags — og:image empty", Severity.WARNING,
                "og:image tag present but value is empty or too short.",
                "Set og:image to a full absolute URL of a 1200×630 px image.",
                impact="Medium", effort="Quick Win"))
        elif not og_img.startswith(("http://", "https://")):
            f.append(Finding("On-Page", "Open Graph tags — og:image relative URL", Severity.WARNING,
                f"og:image is a relative URL: '{og_img}' — "
                "social crawlers (Facebook, LinkedIn) cannot resolve relative paths.",
                "Change og:image to an absolute URL: https://yourdomain.com/image.jpg",
                impact="Medium", effort="Quick Win"))
        else:
            f.append(Finding("On-Page", "Open Graph tags", Severity.PASS,
                "All core Open Graph tags present with absolute og:image URL."))

    # og:type — often forgotten; defaults to 'website' but should be set explicitly
    if "og:type" not in og:
        f.append(Finding("On-Page", "og:type tag", Severity.INFO,
            "og:type not set. Without it Facebook defaults to 'website', "
            "which may not match article, product, or video content.",
            "Add og:type: 'website' for homepages, 'article' for blog posts, "
            "'product' for product pages.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "og:type tag", Severity.PASS,
            f"og:type='{og['og:type']}'."))

    # ── Twitter Card ─────────────────────────────────────────────────────────
    tc = page.twitter_card
    if not tc:
        f.append(Finding("On-Page", "Twitter Card", Severity.INFO,
            "No Twitter Card meta tags found.",
            "Add twitter:card, twitter:title, twitter:description, twitter:image — "
            "required for rich link previews on X/Twitter.",
            impact="Low", effort="Quick Win"))
    else:
        card_type = tc.get("twitter:card", "set")
        has_image = "twitter:image" in tc
        if not has_image:
            f.append(Finding("On-Page", "Twitter Card", Severity.INFO,
                f"Twitter Card type '{card_type}' set but twitter:image is missing.",
                "Add twitter:image (1200×628 px) for image-rich link previews.",
                impact="Low", effort="Quick Win"))
        else:
            f.append(Finding("On-Page", "Twitter Card", Severity.PASS,
                f"Twitter Card: {card_type} with image."))

    # ── Image Alt Text — presence and quality ────────────────────────────────
    images = page.images
    if images:
        missing_alt = [img for img in images if not img["alt"].strip()]
        # Flag trivially generic alt texts (img001, photo, image, etc.)
        trivial_alt = [
            img for img in images
            if img["alt"].strip() and _TRIVIAL_ALT_PATTERN.match(img["alt"].strip())
        ]
        # Flag alt text that is just the file name (e.g. alt="product-123.jpg")
        filename_alt = [
            img for img in images
            if img["alt"].strip() and re.search(r"\.(jpe?g|png|webp|gif|svg)$", img["alt"].strip(), re.I)
        ]

        if missing_alt:
            f.append(Finding("On-Page", "Image alt text — missing", Severity.CRITICAL,
                f"{len(missing_alt)}/{len(images)} images have no alt text. "
                "Google cannot interpret imageless content for image search or accessibility.",
                "Add descriptive alt text to every image. Decorative images should use alt=''.",
                impact="High", effort="Medium"))
        elif trivial_alt or filename_alt:
            bad = trivial_alt + filename_alt
            f.append(Finding("On-Page", "Image alt text — quality", Severity.WARNING,
                f"{len(bad)} image(s) have generic or filename-based alt text "
                f"(e.g. '{bad[0]['alt']}').",
                "Replace generic alt text with descriptive language covering the image subject, "
                "context, and (where natural) the page's primary keyword.",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("On-Page", "Image alt text", Severity.PASS,
                f"All {len(images)} image(s) have alt text — and it appears descriptive."))

    return report
