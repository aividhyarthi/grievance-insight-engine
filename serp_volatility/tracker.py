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
                    results, features = collector.fetch_serp(
                        keyword=kw,
                        category=category,
                        device=device,
                        num_results=config.top_n_results,
                    )
                    storage.store_results(results)
                    storage.store_features(features)
                    total += len(results)
                    feature_names = [f.feature_type for f in features]
                    feature_str = f" | features: {', '.join(feature_names)}" if feature_names else ""
                    print(f"  [{device}] '{kw}' -> {len(results)} results{feature_str}")

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


def _generate_demo_features(storage, categories, target_date, collected_at, is_update_period, devices=None):
    """Generate realistic demo SERP feature presence data for a single day."""
    from .collectors.base import SerpFeature

    if devices is None:
        devices = ["desktop", "mobile"]

    # Base probability a feature appears for a given keyword (realistic rates)
    # During an algo update period, AI Overview and Featured Snippet rates spike
    base_probs = {
        "ai_overview":      0.30 if is_update_period else 0.18,
        "featured_snippet": 0.25 if is_update_period else 0.20,
        "people_also_ask":  0.70,
        "top_stories":      0.35,
        "knowledge_panel":  0.15,
        "local_pack":       0.12,
        "shopping":         0.20,
        "image_pack":       0.40,
        "video":            0.22,
    }

    # Mobile has slightly different feature rates
    mobile_adjustments = {
        "local_pack":   0.10,   # Local pack shows more on mobile
        "image_pack":   0.05,
        "shopping":     0.05,
        "knowledge_panel": -0.03,
    }

    # Some categories are more likely to trigger specific features
    category_boosts = {
        "news":         {"top_stories": 0.40, "knowledge_panel": 0.10},
        "ecommerce":    {"shopping": 0.40, "image_pack": 0.20},
        "travel":       {"local_pack": 0.25, "image_pack": 0.15},
        "health":       {"featured_snippet": 0.20, "people_also_ask": 0.15},
        "government":   {"featured_snippet": 0.20, "knowledge_panel": 0.15},
        "entertainment":{"video": 0.30, "top_stories": 0.15, "image_pack": 0.15},
        "food":         {"local_pack": 0.35, "image_pack": 0.15},
        "education":    {"featured_snippet": 0.15, "people_also_ask": 0.10},
    }

    all_features = []
    for device in devices:
        for category in categories:
            keywords = storage.get_keywords_for_category(category)
            boosts = category_boosts.get(category, {})

            for kw in keywords:
                random.seed(f"{kw}-features-{target_date}-{device}")
                for feature_type, base_prob in base_probs.items():
                    mobile_adj = mobile_adjustments.get(feature_type, 0.0) if device == "mobile" else 0.0
                    prob = min(base_prob + boosts.get(feature_type, 0.0) + mobile_adj, 0.95)
                    if random.random() < prob:
                        count = 1
                        if feature_type in ("top_stories", "people_also_ask"):
                            count = random.randint(3, 8)
                        elif feature_type in ("shopping", "image_pack"):
                            count = random.randint(4, 12)

                        all_features.append(SerpFeature(
                            keyword=kw,
                            category=category,
                            device=device,
                            feature_type=feature_type,
                            collected_at=collected_at,
                            count=count,
                        ))

    storage.store_features(all_features)


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

        for device in config.devices:
            for category in categories:
                keywords = storage.get_keywords_for_category(category)
                for kw in keywords:
                    # Create a deterministic but slightly shuffled ranking
                    random.seed(f"{kw}-{category}-{device}-base")
                    domain_pool = list(base_domains)
                    random.shuffle(domain_pool)

                    # Mobile rankings differ slightly from desktop
                    if device == "mobile":
                        random.seed(f"{kw}-{category}-mobile-swap")
                        for _ in range(3):
                            i, j = random.sample(range(len(domain_pool)), 2)
                            domain_pool[i], domain_pool[j] = domain_pool[j], domain_pool[i]

                    # Apply daily shuffle
                    random.seed(f"{kw}-{target_date}-{device}")
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
                            device=device,
                            collected_at=collected_at,
                        ))

                    storage.store_results(results)

        # Generate realistic demo SERP feature data (both devices)
        _generate_demo_features(storage, categories, target_date, collected_at, is_update_period, config.devices)

        if day_offset % 5 == 0:
            print(f"  Generated data for {target_date} (day -{day_offset})")

    print(f"Demo data generated for 30 days across {len(categories)} categories.")

    # Also compute volatility scores for all days (both devices)
    calculator = VolatilityCalculator(storage, config)
    print("\nComputing volatility scores...")
    for day_offset in range(29, 0, -1):
        target_date = date.today() - timedelta(days=day_offset)
        for device in config.devices:
            result = calculator.compute_overall_volatility(target_date, device)
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
