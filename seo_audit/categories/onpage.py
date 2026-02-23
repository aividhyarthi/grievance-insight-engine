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
    title = page.title
    if not title:
        f.append(Finding("On-Page", "Title tag", Severity.CRITICAL,
            "No <title> tag found.",
            "Add a unique, keyword-rich title (50–60 chars).",
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
    desc = page.meta_description
    if not desc:
        f.append(Finding("On-Page", "Meta description", Severity.CRITICAL,
            "No meta description found — Google will auto-generate one, often poorly.",
            "Write a compelling 150–160 char description with a clear call-to-action.",
            impact="High", effort="Quick Win"))
    elif len(desc) < 70:
        f.append(Finding("On-Page", "Meta description length", Severity.WARNING,
            f"Too short ({len(desc)} chars). Under-utilised SERP real estate — low CTR risk.",
            "Expand to 150–160 characters with a keyword + benefit + CTA.",
            impact="Medium", effort="Quick Win"))
    elif len(desc) > 160:
        f.append(Finding("On-Page", "Meta description length", Severity.WARNING,
            f"Too long ({len(desc)} chars) — Google truncates after ~160 chars.",
            "Shorten to ≤160 characters; put the most compelling copy first.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("On-Page", "Meta description", Severity.PASS,
            f"Meta description OK ({len(desc)} chars)."))

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
    canon = page.canonical_url
    if not canon:
        f.append(Finding("On-Page", "Canonical URL", Severity.WARNING,
            "No canonical link tag — every URL variation (www/non-www, trailing slash, UTM) "
            "may be treated as a duplicate.",
            "Add <link rel='canonical' href='...complete-preferred-URL...'> to all pages.",
            impact="Medium", effort="Quick Win"))
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
            f"Missing OG tags: {', '.join(missing_og)}.",
            "Add full OG tags — Facebook, LinkedIn, Slack, and WhatsApp all use these for link previews.",
            impact="Medium", effort="Quick Win"))
    else:
        # Check OG image is set to something non-trivial
        og_img = og.get("og:image", "")
        if og_img and len(og_img) > 5:
            f.append(Finding("On-Page", "Open Graph tags", Severity.PASS,
                "All core Open Graph tags present including og:image."))
        else:
            f.append(Finding("On-Page", "Open Graph tags", Severity.WARNING,
                "og:image tag present but value appears empty or invalid.",
                "Set og:image to an absolute URL of a 1200×630 px image for optimal social sharing.",
                impact="Medium", effort="Quick Win"))

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
