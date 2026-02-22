#!/usr/bin/env python3
"""
main.py — CLI entry point for the SEO Audit Tool.

Usage:
    python main.py <url> [options]

Examples:
    python main.py https://example.com
    python main.py https://example.com --output report.html
    python main.py https://example.com --json report.json
    python main.py https://example.com --no-ai
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from seo_audit.crawler import fetch_page
from seo_audit.analyzer import analyze, Severity
from seo_audit.reporter import save_html, save_json, to_dict
from seo_audit.ai_insights import get_ai_insights


# ─── ANSI colour helpers ───────────────────────────────────────────────────────

_RESET = "\033[0m"
_BOLD = "\033[1m"

_SEV_COLOR = {
    Severity.CRITICAL: "\033[91m",   # bright red
    Severity.WARNING:  "\033[93m",   # bright yellow
    Severity.INFO:     "\033[94m",   # bright blue
    Severity.PASS:     "\033[92m",   # bright green
}


def _colored(text: str, code: str) -> str:
    # Disable colours if stdout is not a TTY (e.g. piped to a file)
    if not sys.stdout.isatty():
        return text
    return f"{code}{text}{_RESET}"


def _print_finding(f) -> None:
    sev_str = _colored(f"[{f.severity.value.upper():8s}]", _SEV_COLOR[f.severity])
    print(f"  {sev_str}  {_BOLD}{f.category} › {f.check}{_RESET}")
    print(f"             {f.detail}")
    if f.recommendation:
        print(f"             {_colored('Fix:', _BOLD)} {f.recommendation}")
    print()


# ─── main ─────────────────────────────────────────────────────────────────────

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="AI-powered SEO Audit Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("url", help="URL to audit (include https://)")
    parser.add_argument(
        "--output", "-o", metavar="FILE",
        help="Save HTML report to this file (default: seo_report.html)",
        default="seo_report.html",
    )
    parser.add_argument(
        "--json", "-j", metavar="FILE",
        help="Also save a JSON report to this file",
        default=None,
    )
    parser.add_argument(
        "--no-ai", action="store_true",
        help="Skip AI insights (useful when no API key is set)",
    )
    parser.add_argument(
        "--timeout", type=int, default=15,
        help="HTTP request timeout in seconds (default: 15)",
    )
    args = parser.parse_args(argv)

    url = args.url
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    # 1. Fetch
    print(f"\n{_BOLD}Fetching:{_RESET} {url}")
    page = fetch_page(url, timeout=args.timeout)

    if page.error:
        print(f"\n{_colored('ERROR:', _SEV_COLOR[Severity.CRITICAL])} {page.error}")
        return 1

    print(f"  Status: HTTP {page.status_code}  |  Load time: {page.load_time_ms} ms\n")

    # 2. Analyse
    report = analyze(page)

    # 3. Print findings to terminal
    print(f"{_BOLD}Findings ({len(report.findings)} total){_RESET}\n")
    for finding in report.findings:
        _print_finding(finding)

    # 4. Score summary
    sc_color = (
        _SEV_COLOR[Severity.PASS] if report.score >= 80
        else _SEV_COLOR[Severity.WARNING] if report.score >= 50
        else _SEV_COLOR[Severity.CRITICAL]
    )
    print(
        f"{_BOLD}SEO Score:{_RESET} {_colored(str(report.score) + '/100', sc_color)}  "
        f"({report.critical_count} critical, {report.warning_count} warnings, "
        f"{report.pass_count} passed)\n"
    )

    # 5. AI insights
    if not args.no_ai:
        print(f"{_BOLD}Fetching AI insights from Claude…{_RESET}")
        report.ai_insights = get_ai_insights(report, page)
        if report.ai_insights:
            print("\n" + report.ai_insights + "\n")

    # 6. Save reports
    html_path = Path(args.output)
    save_html(report, html_path)
    print(f"{_colored('HTML report saved:', _BOLD)} {html_path.resolve()}")

    if args.json:
        json_path = Path(args.json)
        save_json(report, json_path)
        print(f"{_colored('JSON report saved:', _BOLD)} {json_path.resolve()}")

    return 0 if report.critical_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
