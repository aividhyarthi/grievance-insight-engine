"""
engine.py — Orchestrates all 12 category checks into an AuditResult.
"""

from __future__ import annotations

from .crawler import PageData
from .site_types.profiles import SiteType, get_profile
from .categories import (
    onpage, technical, content, interlinking, pagespeed,
    keywords, ux_ui, product_seo, aeo, geo, offpage, backlinking,
)
from .outputs.models import AuditResult

_ALL_MODULES = [
    onpage, technical, content, interlinking, pagespeed,
    keywords, ux_ui, product_seo, aeo, geo, offpage, backlinking,
]


def run_audit(page: PageData, site_type: SiteType | str = SiteType.GENERIC) -> AuditResult:
    """
    Run all 12 category checks and return a fully populated AuditResult.
    AI narratives are NOT generated here — call outputs.ai_narratives.generate_all() separately.
    """
    profile = get_profile(site_type)
    result = AuditResult(
        url=page.url,
        site_type=profile.site_type,
        profile=profile,
    )
    for mod in _ALL_MODULES:
        result.category_reports.append(mod.run(page))

    return result
