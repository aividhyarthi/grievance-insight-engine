"""
product_seo.py — Product SEO checks.
Covers: Product/Offer/Review schema completeness, breadcrumbs, product image
        alt text relevance, product description depth, spec/feature tables,
        price visibility in HTML, multiple images, video content, FAQ section.
Relevant for: e-commerce, SaaS pricing pages, product landing pages.
"""

from __future__ import annotations

import json
import re

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


def _parse_schemas(page: PageData) -> list[dict]:
    parsed = []
    for raw in page.structured_data:
        try:
            parsed.append(json.loads(raw))
        except (json.JSONDecodeError, ValueError):
            pass
    return parsed


def _flatten_types(obj: dict | list, out: list[str] | None = None) -> list[str]:
    """Recursively collect all @type values from a JSON-LD object."""
    if out is None:
        out = []
    if isinstance(obj, dict):
        t = obj.get("@type")
        if isinstance(t, str):
            out.append(t)
        elif isinstance(t, list):
            out.extend(t)
        for v in obj.values():
            _flatten_types(v, out)
    elif isinstance(obj, list):
        for item in obj:
            _flatten_types(item, out)
    return out


def _get_schema_field(schemas: list[dict], schema_type: str, field: str):
    """Return the value of a field from the first schema of the given type."""
    for s in schemas:
        types = _flatten_types(s)
        if schema_type in types:
            return s.get(field)
    return None


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Product SEO",
        description="Schema completeness, on-page content quality, and rich-result eligibility for product pages.",
    )
    f = report.findings
    soup = page.soup
    schemas = _parse_schemas(page)
    schema_types = _flatten_types(schemas)

    body_text = (soup.find("body") or soup).get_text(separator=" ", strip=True)

    # Determine if this looks like a product page
    price_signals = soup.find_all(string=re.compile(r"[$£€₹]\s*[\d,]+"))
    add_to_cart = soup.find_all(attrs={"class": re.compile(r"(cart|buy|add.to|purchase)", re.I)})
    is_product_page = bool(price_signals or add_to_cart or "Product" in schema_types)

    # ── Product schema ─────────────────────────────────────────────────────────
    if "Product" in schema_types:
        f.append(Finding("Product SEO", "Product schema", Severity.PASS,
            "Product JSON-LD schema found."))

        # Price / Offers
        has_price = any("offers" in str(s).lower() or "price" in str(s).lower() for s in schemas)
        if has_price:
            f.append(Finding("Product SEO", "Price in schema", Severity.PASS,
                "Offers/price found in Product schema."))
        else:
            f.append(Finding("Product SEO", "Price in schema", Severity.WARNING,
                "Product schema present but missing Offers/price — not eligible for price rich results.",
                "Add offers.price, offers.priceCurrency, and offers.availability to Product schema.",
                impact="High", effort="Medium"))

        # Review / AggregateRating
        if "AggregateRating" in schema_types or "Review" in schema_types:
            f.append(Finding("Product SEO", "Review/rating schema", Severity.PASS,
                "AggregateRating or Review schema found — eligible for star-rating rich results."))
        else:
            f.append(Finding("Product SEO", "Review/rating schema", Severity.INFO,
                "No review/rating schema. Star ratings in SERPs can lift CTR by 30%+.",
                "Add AggregateRating to Product schema once you have user reviews.",
                impact="High", effort="Medium"))

        # Availability in schema
        has_avail = any("availability" in str(s).lower() for s in schemas)
        if not has_avail:
            f.append(Finding("Product SEO", "Availability in schema", Severity.WARNING,
                "Product schema does not declare availability — required for valid rich results.",
                "Add offers.availability (e.g. 'https://schema.org/InStock') to schema.",
                impact="Medium", effort="Quick Win"))

    elif is_product_page:
        f.append(Finding("Product SEO", "Product schema", Severity.CRITICAL,
            "Product page signals detected (price/buy buttons) but no Product JSON-LD schema found.",
            "Add Product schema with name, description, offers (price, currency, availability). "
            "This is required for Google Shopping integration and price rich results.",
            impact="High", effort="Medium"))
    else:
        f.append(Finding("Product SEO", "Product schema", Severity.INFO,
            "Page does not appear to be a product page — Product schema not required."))

    # ── BreadcrumbList schema ─────────────────────────────────────────────────
    if "BreadcrumbList" in schema_types:
        f.append(Finding("Product SEO", "Breadcrumb schema", Severity.PASS,
            "BreadcrumbList schema found."))
    else:
        f.append(Finding("Product SEO", "Breadcrumb schema", Severity.WARNING,
            "No BreadcrumbList schema — category path will not show in search results.",
            "Add BreadcrumbList JSON-LD to display the product's category hierarchy in SERPs.",
            impact="Medium", effort="Medium"))

    # ── Product image quality ─────────────────────────────────────────────────
    images = page.images
    product_imgs = [
        img for img in images
        if re.search(r"(product|item|sku|pdp|gallery)", img["src"], re.I)
    ]

    # Multiple product images
    if is_product_page:
        img_count = len(images)
        if img_count == 0:
            f.append(Finding("Product SEO", "Product images", Severity.CRITICAL,
                "No images found on what appears to be a product page.",
                "Add multiple high-quality product images (front, back, detail, lifestyle).",
                impact="High", effort="Medium"))
        elif img_count == 1:
            f.append(Finding("Product SEO", "Product images", Severity.WARNING,
                "Only 1 image detected. Single-image product pages have lower conversion and ranking.",
                "Add 3–6 images showing different angles, uses, and scale.",
                impact="Medium", effort="Medium"))
        else:
            f.append(Finding("Product SEO", "Product images", Severity.PASS,
                f"{img_count} image(s) found — good visual coverage."))

    # Product image alt text relevance
    if images:
        # Extract potential product name from H1 / title
        h1_words = set(re.findall(r"[a-z]{3,}", " ".join(page.h1_tags).lower()))
        title_words = set(re.findall(r"[a-z]{3,}", page.title.lower()))
        product_keywords = h1_words | title_words

        missing_alt = [img for img in images if not img["alt"].strip()]
        trivial_alt = [
            img for img in images
            if img["alt"].strip()
            and not any(w in img["alt"].lower() for w in product_keywords if len(w) > 3)
            and re.match(r"^(image|photo|picture|img\d*|\.jpg|\.png|thumbnail)$",
                         img["alt"].strip().lower())
        ]
        if missing_alt:
            f.append(Finding("Product SEO", "Product image alt text — missing", Severity.CRITICAL,
                f"{len(missing_alt)}/{len(images)} image(s) have no alt text. "
                "Google Images cannot index untagged product images.",
                "Add descriptive alt text to every image, including product name and key attribute "
                "(e.g. 'Blue Nike Air Max 90 running shoe — left side view').",
                impact="High", effort="Medium"))
        elif trivial_alt:
            f.append(Finding("Product SEO", "Product image alt text — generic", Severity.WARNING,
                f"{len(trivial_alt)} image(s) have generic alt text ('image', 'photo', 'img1') "
                "with no product-relevant keywords.",
                "Use descriptive alt text containing the product name, colour, material, or use-case.",
                impact="Medium", effort="Quick Win"))
        else:
            f.append(Finding("Product SEO", "Product image alt text", Severity.PASS,
                "Image alt texts appear descriptive and product-relevant."))

    # Image filename keyword signal
    if images and not product_imgs:
        f.append(Finding("Product SEO", "Product image naming", Severity.INFO,
            "Image file paths don't contain product-related keywords (product/item/sku/gallery).",
            "Name product images with descriptive slugs (e.g. blue-nike-air-max-90-side.webp) "
            "for Google Image Search visibility.",
            impact="Low", effort="Medium"))

    # ── Product description depth ─────────────────────────────────────────────
    # Look for dedicated description section
    desc_section = (
        soup.find(attrs={"class": re.compile(r"(description|product.desc|overview)", re.I)})
        or soup.find("div", id=re.compile(r"(description|overview)", re.I))
    )
    if desc_section:
        desc_words = len(desc_section.get_text(separator=" ", strip=True).split())
        if desc_words < 80:
            f.append(Finding("Product SEO", "Product description depth", Severity.WARNING,
                f"Product description section is thin ({desc_words} words). "
                "Thin descriptions reduce organic ranking and conversion.",
                "Write at least 150–300 words covering: key features, specifications, "
                "use-cases, materials, and who the product is for.",
                impact="High", effort="Medium"))
        else:
            f.append(Finding("Product SEO", "Product description depth", Severity.PASS,
                f"Product description: {desc_words} words — good depth."))
    elif is_product_page:
        f.append(Finding("Product SEO", "Product description section", Severity.WARNING,
            "No dedicated product description section detected.",
            "Add a clearly marked description section with 150+ words of unique product copy.",
            impact="High", effort="Medium"))

    # ── Specification / feature table ─────────────────────────────────────────
    tables = soup.find_all("table")
    spec_table = any(
        re.search(r"(spec|feature|dimension|weight|material|compatib)", t.get_text(), re.I)
        for t in tables
    ) if tables else False

    spec_section = soup.find(attrs={"class": re.compile(r"(spec|specification|technical.detail)", re.I)})

    if is_product_page and not spec_table and not spec_section:
        f.append(Finding("Product SEO", "Specification table", Severity.INFO,
            "No product specification table or structured spec section found.",
            "Add a spec table (dimensions, weight, materials, compatibility) — "
            "frequently pulled into Google's structured snippets and comparison results.",
            impact="Medium", effort="Medium"))
    elif spec_table or spec_section:
        f.append(Finding("Product SEO", "Specification table", Severity.PASS,
            "Product specification table or section detected."))

    # ── Price visible in HTML text ────────────────────────────────────────────
    visible_price = soup.find_all(string=re.compile(r"[$£€₹]\s*[\d,]+(\.\d{2})?"))
    price_element = soup.find(attrs={"class": re.compile(r"(price|cost|amount)", re.I)})
    if is_product_page and not visible_price and not price_element:
        f.append(Finding("Product SEO", "Price visible in HTML", Severity.WARNING,
            "Price not detected in visible HTML. If price is rendered by JavaScript, "
            "Google may not index it reliably.",
            "Ensure the price is in server-rendered HTML, not only in JS or schema.",
            impact="Medium", effort="Medium"))
    elif visible_price or price_element:
        f.append(Finding("Product SEO", "Price visible in HTML", Severity.PASS,
            "Price found in visible HTML content."))

    # ── Availability text ─────────────────────────────────────────────────────
    availability = soup.find_all(string=re.compile(
        r"\b(in stock|out of stock|available|sold out|pre.order|ships in|delivery)\b", re.I))
    if availability:
        f.append(Finding("Product SEO", "Availability text", Severity.PASS,
            "Availability/delivery text found — clear purchase signals for users and crawlers."))
    elif is_product_page:
        f.append(Finding("Product SEO", "Availability text", Severity.INFO,
            "No clear availability status text detected.",
            "Display in-stock/out-of-stock status prominently (also add to schema's offers.availability).",
            impact="Medium", effort="Quick Win"))

    # ── Video on product page ─────────────────────────────────────────────────
    has_video = bool(
        soup.find("video")
        or soup.find("iframe", src=re.compile(r"(youtube|vimeo|wistia)", re.I))
        or soup.find(attrs={"class": re.compile(r"video|player", re.I)})
    )
    if is_product_page and not has_video:
        f.append(Finding("Product SEO", "Product video", Severity.INFO,
            "No product video detected. Video increases average order value and dwell time.",
            "Add a product demo or explainer video — also add VideoObject schema for SERP video thumbnails.",
            impact="Medium", effort="Long-term"))
    elif has_video:
        f.append(Finding("Product SEO", "Product video", Severity.PASS,
            "Video content detected — good for engagement and SERP video rich results."))

    # ── FAQ / Q&A on product page ─────────────────────────────────────────────
    faq_schema = "FAQPage" in schema_types
    faq_html = bool(soup.find_all(attrs={"class": re.compile(r"faq|accordion|q.a", re.I)}))
    if not faq_schema and not faq_html:
        f.append(Finding("Product SEO", "FAQ / Q&A section", Severity.INFO,
            "No FAQ section detected on product page.",
            "Add a FAQ section with FAQPage schema — captures 'question' searches and "
            "occupies extra SERP real estate.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Product SEO", "FAQ / Q&A section", Severity.PASS,
            "FAQ content detected."))

    return report
