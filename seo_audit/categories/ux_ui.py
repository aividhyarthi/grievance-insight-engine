"""
ux_ui.py — UX/UI SEO checks.
Covers: mobile viewport, touch targets, CTA presence, inline styles,
        404 error detection, footer, semantic HTML5, skip navigation,
        form/lead-gen presence, intrusive popup/interstitial signal,
        multimedia richness.
"""

from __future__ import annotations

import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="UX / UI",
        description=(
            "User experience signals that affect dwell time, bounce rate, and Core Web Vitals. "
            "Google uses UX quality as a ranking signal via Page Experience."
        ),
    )
    f = report.findings
    soup = page.soup
    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)

    # ── Viewport / Mobile-friendliness ────────────────────────────────────────
    vp = soup.find("meta", attrs={"name": "viewport"})
    if not vp:
        f.append(Finding("UX/UI", "Mobile viewport", Severity.CRITICAL,
            "No viewport meta tag — Google will flag this page as not mobile-friendly.",
            "Add <meta name='viewport' content='width=device-width, initial-scale=1'>",
            impact="High", effort="Quick Win"))
    else:
        content = vp.get("content", "").lower()
        if "user-scalable=no" in content or "maximum-scale=1" in content:
            f.append(Finding("UX/UI", "Mobile viewport", Severity.WARNING,
                "Viewport disables user pinch-to-zoom — a Google accessibility violation.",
                "Remove user-scalable=no and maximum-scale constraints entirely.",
                impact="Medium", effort="Quick Win"))
        else:
            f.append(Finding("UX/UI", "Mobile viewport", Severity.PASS,
                f"Viewport set correctly: {content}"))

    # ── Touch-friendly buttons ────────────────────────────────────────────────
    small_buttons = []
    for btn in soup.find_all(["button", "a"]):
        style = btn.get("style", "")
        if re.search(r"(width|height)\s*:\s*([0-9]+)px", style):
            dims = re.findall(r"(?:width|height)\s*:\s*([0-9]+)px", style)
            if any(int(d) < 44 for d in dims):
                small_buttons.append(btn)
    if small_buttons:
        f.append(Finding("UX/UI", "Touch target size", Severity.WARNING,
            f"{len(small_buttons)} element(s) with inline size <44px detected. "
            "Undersized tap targets cause mis-taps on mobile — a CLS/accessibility issue.",
            "Ensure all tap targets are at least 44×44 CSS pixels (Google/Apple recommendation).",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("UX/UI", "Touch target size", Severity.PASS,
            "No obviously undersized touch targets detected via inline styles."))

    # ── CTA / conversion elements ─────────────────────────────────────────────
    cta_pattern = re.compile(
        r"\b(buy|shop|order|subscribe|sign up|sign-up|register|get started|try|"
        r"book|enquire|contact us|download|start free|free trial|demo|request|"
        r"claim|join|apply)\b", re.I)
    cta_elements = [
        b for b in soup.find_all(["button", "a"])
        if cta_pattern.search(b.get_text())
    ]
    if not cta_elements:
        f.append(Finding("UX/UI", "Call-to-action presence", Severity.WARNING,
            "No clear CTA buttons or links found. Users have no guided next step.",
            "Add at least one prominent, action-oriented CTA (e.g. 'Get Started', 'Book Demo') "
            "above the fold and again at the end of the page.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("UX/UI", "Call-to-action presence", Severity.PASS,
            f"{len(cta_elements)} CTA element(s) detected."))

    # ── Intrusive popup / interstitial detection ──────────────────────────────
    # Google penalises pages with intrusive interstitials that cover main content
    popup_signals = soup.find_all(attrs={
        "class": re.compile(r"(popup|modal|overlay|interstitial|cookie.banner|newsletter.popup)", re.I)
    })
    popup_ids = soup.find_all(attrs={
        "id": re.compile(r"(popup|modal|overlay|cookie)", re.I)
    })
    all_popups = list(set(popup_signals + popup_ids))
    if len(all_popups) > 0:
        # Distinguish cookie consent (acceptable) from content-blocking overlays
        cookie_only = all(
            re.search(r"cookie|gdpr|consent", str(p.get("class", "")) + str(p.get("id", "")), re.I)
            for p in all_popups
        )
        if cookie_only:
            f.append(Finding("UX/UI", "Popup / interstitial", Severity.INFO,
                f"Cookie consent popup detected ({len(all_popups)} element(s)). "
                "Cookie banners are acceptable to Google.",
                "Ensure the consent banner does not cover main content before user interaction.",
                impact="Low", effort="Quick Win"))
        else:
            f.append(Finding("UX/UI", "Intrusive popup / interstitial", Severity.WARNING,
                f"{len(all_popups)} popup/modal/overlay element(s) detected. "
                "Full-page interstitials that block content are penalised by Google's Page Experience update.",
                "Replace intrusive popups with inline banners, slide-ins, or bottom bars. "
                "Never block the main content before the user can read it.",
                impact="Medium", effort="Medium"))

    # ── Form / lead-gen presence ──────────────────────────────────────────────
    forms = soup.find_all("form")
    if forms:
        form_types = []
        for form in forms:
            form_text = form.get_text(separator=" ", strip=True).lower()
            if re.search(r"(search|q\b)", form_text) or form.find("input", attrs={"type": "search"}):
                form_types.append("search")
            elif re.search(r"(contact|message|enquiry|enquire)", form_text):
                form_types.append("contact")
            elif re.search(r"(subscribe|newsletter|email)", form_text):
                form_types.append("newsletter")
            elif re.search(r"(sign.?up|register|create.account)", form_text):
                form_types.append("registration")
            else:
                form_types.append("other")
        f.append(Finding("UX/UI", "Form presence", Severity.PASS,
            f"{len(forms)} form(s) detected: {', '.join(dict.fromkeys(form_types))}."))
    else:
        f.append(Finding("UX/UI", "Form presence", Severity.INFO,
            "No forms detected. Forms are key for lead capture and user engagement.",
            "Consider adding a contact form, newsletter signup, or search form relevant to the page.",
            impact="Low", effort="Medium"))

    # ── Multimedia richness ───────────────────────────────────────────────────
    has_video = bool(
        soup.find("video")
        or soup.find("iframe", src=re.compile(r"(youtube|vimeo|wistia|loom)", re.I))
    )
    image_count = len(page.images)
    word_count = len(body_text.split())

    if word_count > 400 and not has_video and image_count < 2:
        f.append(Finding("UX/UI", "Multimedia richness", Severity.INFO,
            "Content-rich page with minimal media (< 2 images, no video). "
            "Visual media increases time-on-page and reduces bounce rate.",
            "Add at least 2–3 relevant images and consider an explainer video.",
            impact="Medium", effort="Medium"))
    else:
        media_parts = []
        if image_count:
            media_parts.append(f"{image_count} image(s)")
        if has_video:
            media_parts.append("video")
        if media_parts:
            f.append(Finding("UX/UI", "Multimedia richness", Severity.PASS,
                f"Page includes: {', '.join(media_parts)}."))

    # ── Inline CSS heavy ──────────────────────────────────────────────────────
    inline_styles = soup.find_all(style=True)
    if len(inline_styles) > 30:
        f.append(Finding("UX/UI", "Inline styles", Severity.INFO,
            f"{len(inline_styles)} elements with inline styles. "
            "Heavy inline CSS prevents browser caching and can contribute to CLS.",
            "Move repeated inline styles to a CSS class in an external stylesheet.",
            impact="Low", effort="Medium"))

    # ── 404 / Error page ──────────────────────────────────────────────────────
    if page.status_code == 404:
        f.append(Finding("UX/UI", "404 page", Severity.CRITICAL,
            "Page returns 404. Users and crawlers hit a dead end — high bounce, wasted crawl budget.",
            "Create a helpful custom 404 page with navigation links, search, and a clear message.",
            impact="High", effort="Medium"))

    # ── Footer presence ───────────────────────────────────────────────────────
    footer = soup.find("footer")
    if not footer:
        f.append(Finding("UX/UI", "Footer element", Severity.INFO,
            "No <footer> tag found.",
            "Add a semantic <footer> with navigation, legal links, and contact info — "
            "a trust signal for users and crawlers.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("UX/UI", "Footer element", Severity.PASS,
            "Footer element present."))

    # ── Semantic HTML5 ────────────────────────────────────────────────────────
    semantic_tags = ["header", "main", "article", "section", "aside", "nav", "footer"]
    found_semantic = [t for t in semantic_tags if soup.find(t)]
    if len(found_semantic) < 3:
        f.append(Finding("UX/UI", "Semantic HTML5 structure", Severity.WARNING,
            f"Only {len(found_semantic)} semantic element(s) found "
            f"({', '.join(found_semantic) or 'none'}).",
            "Use HTML5 semantic tags (<main>, <article>, <section>, <aside>) for better "
            "accessibility, crawlability, and Googlebot comprehension.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("UX/UI", "Semantic HTML5 structure", Severity.PASS,
            f"Good semantic structure: {', '.join(found_semantic)}"))

    # ── Skip navigation link (accessibility) ─────────────────────────────────
    skip_link = (
        soup.find("a", href="#main-content")
        or soup.find("a", href="#main")
        or soup.find("a", attrs={"class": re.compile(r"skip", re.I)})
    )
    if not skip_link:
        f.append(Finding("UX/UI", "Skip navigation link", Severity.INFO,
            "No 'skip to content' link found.",
            "Add a skip link for keyboard/screen reader users — "
            "also a positive accessibility signal for Google.",
            impact="Low", effort="Quick Win"))
    else:
        f.append(Finding("UX/UI", "Skip navigation link", Severity.PASS,
            "Skip navigation link present."))

    return report
