#!/usr/bin/env python3
"""
main.py — CLI entry point for the SEO Audit Tool.

Single-page mode (default):
    python main.py https://example.com
    python main.py https://example.com --site-type ecommerce --excel report.xlsx
    python main.py https://example.com --site-type saas --output report.html --json report.json

Site-crawl mode (--crawl):
    python main.py https://example.com --crawl
    python main.py https://example.com --crawl --max-pages 30 --site-type news
    python main.py https://example.com --crawl --excel site_audit.xlsx --no-ai

Site types: generic, news, product, news_product, ecommerce, saas, events
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from seo_audit.crawler import fetch_page
from seo_audit.engine import run_audit
from seo_audit.site_types.profiles import SiteType
from seo_audit.categories.base import Severity
from seo_audit.outputs.html_report import save_html
from seo_audit.outputs.json_report import save_json
from seo_audit.outputs.ai_narratives import generate_all
from seo_audit.outputs.excel_report import save_excel, save_site_excel
from seo_audit.site_crawler import crawl_site


# ─── ANSI helpers ─────────────────────────────────────────────────────────────

_R = "\033[0m"
_B = "\033[1m"
_SEV = {
    Severity.CRITICAL: "\033[91m",
    Severity.WARNING:  "\033[93m",
    Severity.INFO:     "\033[94m",
    Severity.PASS:     "\033[92m",
}


def _c(text: str, code: str) -> str:
    return f"{code}{text}{_R}" if sys.stdout.isatty() else text


def _score_color(s: int) -> str:
    return _SEV[Severity.PASS] if s >= 70 else (_SEV[Severity.WARNING] if s >= 45 else _SEV[Severity.CRITICAL])


def _print_summary(result) -> None:
    """Print summary for a single-page AuditResult."""
    print(f"\n{_c('=== SEO AUDIT COMPLETE ===', _B)}")
    print(f"URL       : {result.url}")
    print(f"Site type : {result.profile.label}")
    sc = _score_color(result.overall_score)
    print(f"Score     : {_c(str(result.overall_score) + '/100', sc)}")
    print(f"Critical  : {_c(str(len(result.critical_findings)), _SEV[Severity.CRITICAL])}")
    print(f"Warnings  : {_c(str(len(result.warning_findings)), _SEV[Severity.WARNING])}")
    print(f"Quick wins: {_c(str(len(result.quick_wins)), _SEV[Severity.INFO])}")

    print(f"\n{_c('Category Scores:', _B)}")
    for cr in result.category_reports:
        sc = _score_color(cr.score)
        bar_len = cr.score // 5
        bar = "█" * bar_len + "░" * (20 - bar_len)
        print(f"  {cr.name:<42} {bar}  {_c(str(cr.score), sc)}")


def _print_site_summary(crawl) -> None:
    """Print summary for a SiteCrawlResult."""
    sc = _score_color(crawl.overall_score)
    print(f"\n{_c('=== SITE AUDIT COMPLETE ===', _B)}")
    print(f"Domain     : {crawl.base_url}")
    print(f"Site type  : {crawl.profile.label}")
    print(f"Pages      : {crawl.pages_audited}  ({len(crawl.crawl_errors)} errors)")
    print(f"Avg Score  : {_c(str(crawl.overall_score) + '/100', sc)}")
    print(f"Criticals  : {_c(str(len(crawl.all_critical)), _SEV[Severity.CRITICAL])}")
    print(f"Warnings   : {_c(str(len(crawl.all_warnings)), _SEV[Severity.WARNING])}")
    print(f"Quick Wins : {_c(str(len(crawl.all_quick_wins)), _SEV[Severity.INFO])}")

    print(f"\n{_c('Average Category Scores:', _B)}")
    for cat, avg in crawl.category_avg_scores.items():
        sc = _score_color(avg)
        bar_len = avg // 5
        bar = "█" * bar_len + "░" * (20 - bar_len)
        print(f"  {cat:<42} {bar}  {_c(str(avg), sc)}")

    if crawl.top_issues:
        print(f"\n{_c('Most Common Issues (across site):', _B)}")
        for check, count in crawl.top_issues[:8]:
            print(f"  {_c(str(count) + 'x', _SEV[Severity.WARNING])} {check}")

    print(f"\n{_c('Per-Page Scores (worst first):', _B)}")
    for pr in crawl.page_results:
        sc = _score_color(pr.overall_score)
        print(f"  {_c(str(pr.overall_score), sc):>4}  {pr.url}")


def _print_findings(result, verbose: bool = False) -> None:
    if result.critical_findings:
        print(f"\n{_c('Critical Issues:', _B)}")
        for f in result.critical_findings:
            print(f"  {_c('[CRITICAL]', _SEV[Severity.CRITICAL])} {f.category} › {f.check}")
            print(f"    {f.detail}")
            if f.recommendation:
                print(f"    {_c('Fix:', _B)} {f.recommendation}")

    if result.quick_wins:
        print(f"\n{_c('Quick Wins (fix these first):', _B)}")
        for f in result.quick_wins:
            sev_str = _c(f"[{f.severity.value.upper()}]", _SEV[f.severity])
            print(f"  {sev_str} {f.category} › {f.check}")
            if f.recommendation:
                print(f"    {_c('Fix:', _B)} {f.recommendation}")

    if verbose and result.warning_findings:
        print(f"\n{_c('All Warnings:', _B)}")
        for f in result.warning_findings:
            print(f"  {_c('[WARNING]', _SEV[Severity.WARNING])} {f.category} › {f.check}: {f.detail}")


# ─── main ─────────────────────────────────────────────────────────────────────

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="AI-powered SEO Audit Tool — 12 categories, site crawl, Excel export",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("url", help="URL to audit (or base domain for --crawl)")
    parser.add_argument(
        "--site-type", "-t",
        choices=[t.value for t in SiteType],
        default="generic",
        help="Site type for weighted analysis (default: generic)",
    )
    # Mode
    parser.add_argument(
        "--crawl", action="store_true",
        help="Crawl the full site (sitemap + link-following) instead of single page",
    )
    parser.add_argument(
        "--max-pages", type=int, default=20, metavar="N",
        help="Max pages to crawl in --crawl mode (default: 20)",
    )
    # Outputs
    parser.add_argument(
        "--output", "-o", metavar="FILE",
        default="seo_report.html",
        help="HTML report path (default: seo_report.html)",
    )
    parser.add_argument(
        "--json", "-j", metavar="FILE",
        default=None,
        help="JSON report path",
    )
    parser.add_argument(
        "--excel", "-e", metavar="FILE",
        default=None,
        help="Excel (.xlsx) report path — client-ready workbook",
    )
    # Misc
    parser.add_argument(
        "--no-ai", action="store_true",
        help="Skip AI narrative generation",
    )
    parser.add_argument(
        "--verbose", "-v", action="store_true",
        help="Print all warnings to terminal",
    )
    parser.add_argument(
        "--timeout", type=int, default=15,
        help="HTTP timeout in seconds (default: 15)",
    )
    args = parser.parse_args(argv)

    url = args.url
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # ── SITE CRAWL MODE ───────────────────────────────────────────────────────
    if args.crawl:
        print(f"\n{_c('Site Crawl Mode', _B)} — {url}")
        print(f"  Site type : {args.site_type}  |  Max pages: {args.max_pages}\n")

        def _progress(current, total, page_url):
            print(f"  [{current:>2}/{total}] {page_url}", flush=True)

        crawl = crawl_site(
            url,
            site_type=args.site_type,
            max_pages=args.max_pages,
            timeout=args.timeout,
            progress_cb=_progress,
        )

        if not crawl.page_results:
            print(f"\n{_c('ERROR:', _SEV[Severity.CRITICAL])} No pages could be audited.")
            return 1

        _print_site_summary(crawl)

        # HTML report (best page as representative)
        html_path = Path(args.output)
        worst = crawl.page_results[0]  # sorted worst-first
        save_html(worst, html_path)
        print(f"\n{_c('HTML report (lowest-scoring page):', _B)} {html_path.resolve()}")

        # Excel (full site workbook)
        excel_path = Path(args.excel) if args.excel else Path(
            args.output.replace(".html", ".xlsx") if args.output.endswith(".html") else "seo_report.xlsx"
        )
        try:
            save_site_excel(crawl, excel_path)
            print(f"{_c('Excel report (full site):', _B)} {excel_path.resolve()}")
        except ImportError:
            print("  (Install openpyxl to enable Excel export: pip install openpyxl)")

        if args.json:
            # JSON: list of per-page dicts
            import json
            from seo_audit.outputs.json_report import to_dict
            data = {
                "base_url": crawl.base_url,
                "site_type": crawl.site_type.value,
                "overall_score": crawl.overall_score,
                "pages_audited": crawl.pages_audited,
                "pages": [to_dict(r) for r in crawl.page_results],
            }
            Path(args.json).write_text(json.dumps(data, indent=2))
            print(f"{_c('JSON report:', _B)} {Path(args.json).resolve()}")

        return 0 if not crawl.all_critical else 1

    # ── SINGLE PAGE MODE ──────────────────────────────────────────────────────
    print(f"\n{_c('Fetching:', _B)} {url}")
    page = fetch_page(url, timeout=args.timeout)

    if page.error:
        print(f"\n{_c('ERROR:', _SEV[Severity.CRITICAL])} {page.error}")
        return 1
    print(f"  HTTP {page.status_code} | {page.load_time_ms} ms")

    print(f"\n{_c('Running 12-category SEO audit…', _B)}")
    result = run_audit(page, site_type=args.site_type)

    if not args.no_ai:
        print(f"{_c('Generating AI narratives…', _B)}")
        generate_all(result, page)
        if not result.ai_proposal:
            print("  (Set ANTHROPIC_API_KEY to enable AI narratives)")

    _print_summary(result)
    _print_findings(result, verbose=args.verbose)

    html_path = Path(args.output)
    save_html(result, html_path)
    print(f"\n{_c('HTML report:', _B)} {html_path.resolve()}")

    if args.json:
        from seo_audit.outputs.json_report import save_json
        save_json(result, Path(args.json))
        print(f"{_c('JSON report:', _B)} {Path(args.json).resolve()}")

    if args.excel:
        try:
            save_excel(result, Path(args.excel))
            print(f"{_c('Excel report:', _B)} {Path(args.excel).resolve()}")
        except ImportError:
            print("  (Install openpyxl to enable Excel export: pip install openpyxl)")

    return 0 if not result.critical_findings else 1


if __name__ == "__main__":
    sys.exit(main())
