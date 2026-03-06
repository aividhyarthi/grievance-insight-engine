"""
Main SERP Volatility Tracker — orchestrates collection and analysis.

Usage:
    # Collect fresh SERP data
    python -m serp_volatility.tracker collect

    # Compute volatility scores
    python -m serp_volatility.tracker compute

    # Load seed keywords
    python -m serp_volatility.tracker seed

    # Generate demo data (for testing without API keys)
    python -m serp_volatility.tracker demo
"""

import argparse
import json
import random
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from .config import TrackerConfig, CATEGORIES
from .collectors.factory import get_collector
from .storage.sqlite_store import SQLiteStore
from .analysis.volatility import VolatilityCalculator


def load_seed_keywords(storage: SQLiteStore):
    """Load India-specific seed keywords from JSON file."""
    seed_file = Path(__file__).parent / "data" / "seed_keywords" / "india_keywords.json"
    with open(seed_file) as f:
        keywords_by_category = json.load(f)

    all_keywords = []
    for category, keywords in keywords_by_category.items():
        for kw in keywords:
            all_keywords.append({"keyword": kw, "category": category})

    storage.add_keywords(all_keywords)
    print(f"Loaded {len(all_keywords)} seed keywords across {len(keywords_by_category)} categories.")


def collect_serp_data(config: TrackerConfig, storage: SQLiteStore):
    """Collect SERP data for all tracked keywords."""
    collector = get_collector(config)
    categories = storage.get_tracked_categories()

    if not categories:
        print("No keywords found. Run 'seed' first.")
        return

    total = 0
    for category in categories:
        keywords = storage.get_keywords_for_category(category)
        print(f"\nCategory: {CATEGORIES.get(category, category)} ({len(keywords)} keywords)")

        for kw in keywords:
            for device in config.devices:
                try:
                    results = collector.fetch_serp(
                        keyword=kw,
                        category=category,
                        device=device,
                        num_results=config.top_n_results,
                    )
                    storage.store_results(results)
                    total += len(results)
                    print(f"  [{device}] '{kw}' -> {len(results)} results")

                    # Rate limiting
                    time.sleep(0.5)

                except Exception as e:
                    print(f"  ERROR [{device}] '{kw}': {e}")

    print(f"\nTotal results collected: {total}")


def compute_volatility(config: TrackerConfig, storage: SQLiteStore):
    """Compute and store volatility scores."""
    calculator = VolatilityCalculator(storage, config)
    today = date.today()

    for device in config.devices:
        result = calculator.compute_overall_volatility(today, device)
        storage.store_volatility_score(result)

        print(f"\n{'='*50}")
        print(f"India SERP Volatility — {today} ({device})")
        print(f"{'='*50}")
        print(f"Overall Score: {result['overall_score']}/10 [{result['level']}]")
        print(f"Keywords Tracked: {result['keywords_tracked']}")
        print(f"\nCategory Breakdown:")
        for cat, score in sorted(result["category_scores"].items(), key=lambda x: -x[1]):
            cat_name = CATEGORIES.get(cat, cat)
            level = VolatilityCalculator._score_to_level(score)
            bar = "█" * int(score) + "░" * (10 - int(score))
            print(f"  {cat_name:<30} {bar} {score:.1f} [{level}]")


def generate_demo_data(storage: SQLiteStore):
    """Generate realistic demo data for testing the dashboard without API keys."""
    load_seed_keywords(storage)

    categories = storage.get_tracked_categories()
    config = TrackerConfig()

    print("Generating 30 days of demo SERP data...")

    # Simulate a Google update around day 15
    base_domains = [
        "example1.com", "example2.in", "example3.co.in", "testsite.com",
        "samplesite.in", "demo1.com", "demo2.in", "india-portal.com",
        "mysite.co.in", "webapp.in", "digital.com", "platform.in",
        "service1.com", "service2.in", "hub.co.in", "center.com",
        "portal.in", "gateway.co.in", "connect.com", "solutions.in",
    ]

    for day_offset in range(30, 0, -1):
        target_date = date.today() - timedelta(days=day_offset)
        collected_at = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)

        # Simulate higher volatility around day 15 (simulated algo update)
        is_update_period = 13 <= day_offset <= 17
        shuffle_intensity = 0.6 if is_update_period else 0.15

        from .collectors.base import SerpResult

        for category in categories:
            keywords = storage.get_keywords_for_category(category)
            for kw in keywords:
                # Create a deterministic but slightly shuffled ranking
                random.seed(f"{kw}-{category}-base")
                domain_pool = list(base_domains)
                random.shuffle(domain_pool)

                # Apply daily shuffle
                random.seed(f"{kw}-{target_date}")
                shuffled = list(domain_pool[:config.top_n_results])

                # Shuffle intensity determines how much positions change
                num_swaps = int(len(shuffled) * shuffle_intensity)
                for _ in range(num_swaps):
                    i, j = random.sample(range(len(shuffled)), 2)
                    shuffled[i], shuffled[j] = shuffled[j], shuffled[i]

                results = []
                for pos, domain in enumerate(shuffled, 1):
                    results.append(SerpResult(
                        keyword=kw,
                        category=category,
                        position=pos,
                        url=f"https://{domain}/page",
                        title=f"Page about {kw}",
                        domain=domain,
                        device="desktop",
                        collected_at=collected_at,
                    ))

                storage.store_results(results)

        if day_offset % 5 == 0:
            print(f"  Generated data for {target_date} (day -{day_offset})")

    print(f"Demo data generated for 30 days across {len(categories)} categories.")

    # Also compute volatility scores for all days
    calculator = VolatilityCalculator(storage, config)
    print("\nComputing volatility scores...")
    for day_offset in range(29, 0, -1):
        target_date = date.today() - timedelta(days=day_offset)
        result = calculator.compute_overall_volatility(target_date, "desktop")
        if result["overall_score"] > 0:
            storage.store_volatility_score(result)

    print("Volatility scores computed.")


def main():
    parser = argparse.ArgumentParser(description="India SERP Volatility Tracker")
    parser.add_argument(
        "command",
        choices=["seed", "collect", "compute", "demo"],
        help="Command to run",
    )
    parser.add_argument("--db", default=None, help="SQLite database path")

    args = parser.parse_args()

    config = TrackerConfig()
    db_path = args.db or config.sqlite_path
    storage = SQLiteStore(db_path)

    if args.command == "seed":
        load_seed_keywords(storage)
    elif args.command == "collect":
        if not config.serp_api.api_key:
            print("ERROR: Set SERP_API_KEY environment variable first.")
            sys.exit(1)
        collect_serp_data(config, storage)
    elif args.command == "compute":
        compute_volatility(config, storage)
    elif args.command == "demo":
        generate_demo_data(storage)


if __name__ == "__main__":
    main()
