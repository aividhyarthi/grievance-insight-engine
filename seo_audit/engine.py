"""
engine.py — Orchestrates all 12 category checks into an AuditResult.
"""

from __future__ import annotations
import traceback

from .crawler import PageData
from .site_types.profiles import SiteType, get_profile
from .categories import (
    onpage, technical, content, interlinking, pagespeed,
    keywords, ux_ui, product_seo, aeo, geo, offpage, backlinking,
    crawlability,
)
from .categories.base import CategoryReport, Finding, Severity
from .outputs.models import AuditResult

_ALL_MODULES = [
    onpage, technical, content, interlinking, pagespeed,
    keywords, ux_ui, product_seo, aeo, geo, offpage, backlinking,
    crawlability,
]


def run_audit(page: PageData, site_type: SiteType | str = SiteType.GENERIC) -> AuditResult:
    """
    Run all 13 category checks and return a fully populated AuditResult.
    AI narratives are NOT generated here — call outputs.ai_narratives.generate_all() separately.
    """
    profile = get_profile(site_type)
    result = AuditResult(
        url=page.url,
        site_type=profile.site_type,
        profile=profile,
    )
    for mod in _ALL_MODULES:
        try:
            result.category_reports.append(mod.run(page))
        except Exception as exc:
            mod_name = getattr(mod, "__name__", str(mod)).split(".")[-1].replace("_", " ").title()
            fallback = CategoryReport(
                name=mod_name,
                description="This check encountered an unexpected error and was skipped.",
            )
            fallback.findings.append(Finding(
                mod_name, "Check error", Severity.INFO,
                f"This category check failed with an internal error: {exc}. "
                "Please try again or contact support if the issue persists.",
                impact=None, effort=None,
            ))
            result.category_reports.append(fallback)

    return result
