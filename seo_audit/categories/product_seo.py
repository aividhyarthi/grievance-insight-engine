"""
product_seo.py — Product SEO checks.
Covers: Product schema, price/availability markup, review schema,
        breadcrumbs, product images, category/facet URL signals.
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


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Product SEO",
        description="Schema and on-page signals for product and e-commerce pages.",
    )
    f = report.findings
    soup = page.soup
    schemas = _parse_schemas(page)
    schema_types = _flatten_types(schemas)

    # ── Product schema ─────────────────────────────────────────────────────────
    if "Product" in schema_types:
        f.append(Finding("Product SEO", "Product schema", Severity.PASS,
            "Product JSON-LD schema found."))

        # Price inside Product schema
        has_price = any(
            "offers" in str(s) or "price" in str(s).lower()
            for s in schemas
        )
        if has_price:
            f.append(Finding("Product SEO", "Price in schema", Severity.PASS,
                "Price / Offers found in Product schema."))
        else:
            f.append(Finding("Product SEO", "Price in schema", Severity.WARNING,
                "Product schema missing Offers/price markup.",
                "Add offers.price and offers.priceCurrency to enable rich results.",
                impact="High", effort="Medium"))

        # Review / AggregateRating
        if "AggregateRating" in schema_types or "Review" in schema_types:
            f.append(Finding("Product SEO", "Review/rating schema", Severity.PASS,
                "AggregateRating or Review schema found — eligible for star rich results."))
        else:
            f.append(Finding("Product SEO", "Review/rating schema", Severity.INFO,
                "No review/rating schema. Star ratings in SERPs can boost CTR by 30%+.",
                "Add AggregateRating to Product schema once you collect reviews.",
                impact="High", effort="Medium"))
    else:
        # Check if page looks like a product page
        price_signals = soup.find_all(text=re.compile(r"[$£€₹]\s*[\d,]+"))
        add_to_cart = soup.find_all(
            attrs={"class": re.compile(r"(cart|buy|add.to|purchase)", re.I)})
        if price_signals or add_to_cart:
            f.append(Finding("Product SEO", "Product schema", Severity.CRITICAL,
                "Product page detected but no Product JSON-LD schema found.",
                "Add Product schema with name, description, price, and availability.",
                impact="High", effort="Medium"))
        else:
            f.append(Finding("Product SEO", "Product schema", Severity.INFO,
                "Page does not appear to be a product page — Product schema not required."))

    # ── BreadcrumbList ────────────────────────────────────────────────────────
    if "BreadcrumbList" in schema_types:
        f.append(Finding("Product SEO", "Breadcrumb schema", Severity.PASS,
            "BreadcrumbList schema found."))
    else:
        f.append(Finding("Product SEO", "Breadcrumb schema", Severity.WARNING,
            "No BreadcrumbList schema.",
            "Add BreadcrumbList JSON-LD to display category path in SERPs.",
            impact="Medium", effort="Medium"))

    # ── Product image quality signals ─────────────────────────────────────────
    images = page.images
    product_imgs = [
        img for img in images
        if re.search(r"(product|item|sku|pdp)", img["src"], re.I)
    ]
    if images and not product_imgs:
        f.append(Finding("Product SEO", "Product image naming", Severity.INFO,
            "Image filenames don't contain product-related keywords.",
            "Name product images with descriptive keywords (e.g. blue-running-shoes.jpg).",
            impact="Medium", effort="Medium"))

    # ── Availability text ─────────────────────────────────────────────────────
    availability = soup.find_all(
        text=re.compile(r"\b(in stock|out of stock|available|sold out|pre.order)\b", re.I))
    if availability:
        f.append(Finding("Product SEO", "Availability text", Severity.PASS,
            "Availability text found on page."))
    else:
        f.append(Finding("Product SEO", "Availability text", Severity.INFO,
            "No clear availability text detected.",
            "Display clear in-stock/out-of-stock status (also add to schema).",
            impact="Medium", effort="Quick Win"))

    # ── FAQ / Q&A on product page ─────────────────────────────────────────────
    faq_schema = "FAQPage" in schema_types
    faq_html = bool(soup.find_all(attrs={"class": re.compile(r"faq|accordion|q.a", re.I)}))
    if not faq_schema and not faq_html:
        f.append(Finding("Product SEO", "FAQ / Q&A section", Severity.INFO,
            "No FAQ section detected on product page.",
            "Add a FAQ section with FAQPage schema to capture question-based searches.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Product SEO", "FAQ / Q&A section", Severity.PASS,
            "FAQ content detected."))

    return report
