#!/usr/bin/env python3
"""
Local SEO Audit Tool – CLI entry point.

Usage:
    python run_seo_audit.py "Joe's Pizza, New York"
    python run_seo_audit.py "Starbucks 5th Ave NYC" --no-ai
    python run_seo_audit.py "Central Park Dentist" --json

Required env vars:
    GOOGLE_PLACES_API_KEY   – Google Maps / Places API key
    ANTHROPIC_API_KEY       – Anthropic API key (skip with --no-ai)
"""

import argparse
import json
import sys
import os


def main():
    parser = argparse.ArgumentParser(
        description="Audit a Google My Business listing for Local SEO health.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "business",
        help='Business name + location, e.g. "Joe\'s Pizza, Brooklyn NY"',
    )
    parser.add_argument(
        "--no-ai",
        action="store_true",
        help="Skip Claude AI insights (runs faster, no Anthropic API key needed)",
    )
    parser.add_argument(
        "--json",
        dest="output_json",
        action="store_true",
        help="Output raw JSON instead of the rich terminal report",
    )
    parser.add_argument(
        "--google-key",
        default=None,
        help="Google Places API key (overrides GOOGLE_PLACES_API_KEY env var)",
    )
    parser.add_argument(
        "--anthropic-key",
        default=None,
        help="Anthropic API key (overrides ANTHROPIC_API_KEY env var)",
    )
    args = parser.parse_args()

    # ── Imports (lazy, so --help is instant) ─────────────────────────────────
    from local_seo_audit.fetcher import PlacesFetcher
    from local_seo_audit.auditor import audit
    from local_seo_audit.report import console

    # ── Step 1: fetch Google Places data ─────────────────────────────────────
    console.print(f"\n[bold cyan]Searching Google Places for:[/bold cyan] {args.business}")
    try:
        fetcher = PlacesFetcher(api_key=args.google_key)
        place_data = fetcher.fetch(args.business)
    except ValueError as e:
        console.print(f"[bold red]Error:[/bold red] {e}")
        sys.exit(1)
    except Exception as e:
        console.print(f"[bold red]Places API error:[/bold red] {e}")
        sys.exit(1)

    found_name    = place_data["details"].get("name", place_data.get("search_name", "?"))
    found_address = place_data["details"].get("formatted_address", place_data.get("search_address", ""))
    console.print(f"[green]Found:[/green] {found_name} — {found_address}")

    # ── Step 2: run SEO audit ─────────────────────────────────────────────────
    console.print("[bold cyan]Running SEO audit…[/bold cyan]")
    result = audit(place_data)

    # ── Step 3: optional AI insights ──────────────────────────────────────────
    insights = None
    if not args.no_ai:
        console.print("[bold cyan]Generating Claude AI insights…[/bold cyan]")
        try:
            from local_seo_audit.ai_insights import get_ai_insights
            insights = get_ai_insights(result, api_key=args.anthropic_key)
        except ValueError as e:
            console.print(f"[yellow]AI insights skipped:[/yellow] {e}")
        except Exception as e:
            console.print(f"[yellow]AI insights error (continuing without):[/yellow] {e}")

    # ── Step 4: output ────────────────────────────────────────────────────────
    if args.output_json:
        output = {
            "business_name": result.business_name,
            "place_id": result.place_id,
            "google_maps_url": result.google_maps_url,
            "overall_score": result.overall_score,
            "grade": result.grade,
            "signals": [
                {
                    "name": s.name,
                    "score": s.score,
                    "max_score": s.max_score,
                    "status": s.status,
                    "detail": s.detail,
                    "recommendation": s.recommendation,
                }
                for s in result.signals
            ],
            "ai_insights": insights,
        }
        print(json.dumps(output, indent=2))
    else:
        from local_seo_audit.report import print_report
        print_report(result, insights)


if __name__ == "__main__":
    main()
