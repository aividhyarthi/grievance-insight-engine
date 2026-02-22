#!/usr/bin/env python3
"""
main.py — CLI entry point for the SEO Audit Tool.

Usage:
    python main.py <url> [options]

Examples:
    python main.py https://example.com
    python main.py https://example.com --site-type ecommerce
    python main.py https://example.com --site-type saas --output report.html --json report.json
    python main.py https://example.com --no-ai

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
        description="AI-powered SEO Audit Tool — 12 categories, 3 output formats",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("url", help="URL to audit (include https://)")
    parser.add_argument(
        "--site-type", "-t",
        choices=[t.value for t in SiteType],
        default="generic",
        help="Site type for weighted analysis (default: generic)",
    )
    parser.add_argument(
        "--output", "-o", metavar="FILE",
        default="seo_report.html",
        help="HTML report output path (default: seo_report.html)",
    )
    parser.add_argument(
        "--json", "-j", metavar="FILE",
        default=None,
        help="JSON report output path",
    )
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

    # 1. Fetch
    print(f"\n{_c('Fetching:', _B)} {url}")
    page = fetch_page(url, timeout=args.timeout)

    if page.error:
        print(f"\n{_c('ERROR:', _SEV[Severity.CRITICAL])} {page.error}")
        return 1
    print(f"  HTTP {page.status_code} | {page.load_time_ms} ms")

    # 2. Run audit
    print(f"\n{_c('Running 12-category SEO audit…', _B)}")
    result = run_audit(page, site_type=args.site_type)

    # 3. AI narratives
    if not args.no_ai:
        print(f"{_c('Generating AI narratives (Proposal + Roadmap + Traffic Strategy)…', _B)}")
        generate_all(result, page)
        if not result.ai_proposal:
            print("  (Set ANTHROPIC_API_KEY to enable AI narratives)")

    # 4. Print terminal summary
    _print_summary(result)
    _print_findings(result, verbose=args.verbose)

    # 5. Save reports
    html_path = Path(args.output)
    save_html(result, html_path)
    print(f"\n{_c('HTML report:', _B)} {html_path.resolve()}")

    if args.json:
        json_path = Path(args.json)
        save_json(result, json_path)
        print(f"{_c('JSON report:', _B)} {json_path.resolve()}")

    return 0 if not result.critical_findings else 1


if __name__ == "__main__":
    sys.exit(main())
