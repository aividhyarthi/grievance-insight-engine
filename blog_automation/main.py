"""
Automated Blog Publishing Pipeline
====================================
Entry point — runs on a configurable schedule and orchestrates:
  1.  Topic discovery (Google Trends / custom URLs / LinkedIn)
  2.  AI content generation (Claude API)
  3.  Image generation (DALL-E / Stability / Unsplash fallback)
  4.  WordPress publishing
  5.  Social media posting (Twitter, LinkedIn, Instagram)

Usage:
  python main.py                  # Run once immediately
  python main.py --schedule       # Run on the schedule set in config.yaml
  python main.py --dry-run        # Run pipeline but don't publish anywhere
  python main.py --topic "AI in Education"  # Use a specific topic instead of trending
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import yaml

# Add parent directory to path so modules can be imported
sys.path.insert(0, str(Path(__file__).parent))

from modules.topic_finder import TopicFinder
from modules.content_generator import ContentGenerator
from modules.image_generator import ImageGenerator
from modules.publisher import WordPressPublisher
from modules.social_media import SocialMediaPoster


# ------------------------------------------------------------------ #
# Setup                                                                #
# ------------------------------------------------------------------ #

def load_config(config_path: str = "config.yaml") -> dict:
    with open(config_path) as f:
        cfg = yaml.safe_load(f)

    # Inject env vars into config (override empty fields)
    cfg.setdefault("api_keys", {})
    cfg["api_keys"]["anthropic"] = os.getenv("ANTHROPIC_API_KEY",
                                              cfg["api_keys"].get("anthropic", ""))
    cfg["api_keys"]["openai"] = os.getenv("OPENAI_API_KEY",
                                           cfg["api_keys"].get("openai", ""))
    cfg["api_keys"]["stability"] = os.getenv("STABILITY_API_KEY",
                                              cfg["api_keys"].get("stability", ""))
    return cfg


def setup_logging(config: dict) -> None:
    log_cfg = config.get("output", {})
    level = getattr(logging, log_cfg.get("log_level", "INFO").upper(), logging.INFO)
    handlers = [logging.StreamHandler(sys.stdout)]

    log_file = log_cfg.get("log_file")
    if log_file:
        Path(log_file).parent.mkdir(parents=True, exist_ok=True)
        handlers.append(logging.FileHandler(log_file))

    logging.basicConfig(
        level=level,
        format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=handlers,
    )


logger = logging.getLogger(__name__)


# ------------------------------------------------------------------ #
# Core Pipeline                                                        #
# ------------------------------------------------------------------ #

def run_pipeline(config: dict, dry_run: bool = False,
                 manual_topic: str | None = None) -> dict:
    """
    Execute the full blog publishing pipeline for one post.
    Returns a summary dict with the published URLs.
    """
    run_start = datetime.now()
    logger.info("=" * 60)
    logger.info("Pipeline started at %s", run_start.strftime("%Y-%m-%d %H:%M:%S"))
    logger.info("Mode: %s", "DRY RUN" if dry_run else "LIVE")
    logger.info("=" * 60)

    result = {
        "timestamp": run_start.isoformat(),
        "topic": None,
        "blog_title": None,
        "blog_url": None,
        "social_urls": {},
        "success": False,
    }

    # ── Step 1: Find Topic ──────────────────────────────────────────
    if manual_topic:
        from modules.topic_finder import Topic
        topic = Topic(title=manual_topic, source="manual", score=1.0)
        logger.info("Using manual topic: '%s'", manual_topic)
    else:
        logger.info("Step 1/5 — Finding trending topic…")
        finder = TopicFinder(config)
        topic = finder.find_best_topic()

    if not topic:
        logger.error("No suitable topic found. Aborting pipeline.")
        return result

    result["topic"] = topic.title
    logger.info("Topic: '%s' (source: %s)", topic.title, topic.source)

    # ── Step 2: Generate Content ────────────────────────────────────
    logger.info("Step 2/5 — Generating blog content…")
    generator = ContentGenerator(config)
    post = generator.generate(
        topic_title=topic.title,
        related_terms=topic.related_terms,
        source_url=topic.url,
    )

    result["blog_title"] = post.title
    logger.info("Generated: '%s' (%d words)", post.title, post.word_count)

    # ── Step 3: Generate Images ─────────────────────────────────────
    logger.info("Step 3/5 — Generating images…")
    img_gen = ImageGenerator(config)

    if post.image_prompt:
        header_path = img_gen.generate_blog_header(post.image_prompt, post.slug)
        social_path = img_gen.generate_social_image(post.image_prompt, post.slug)
        post.image_url = header_path
        logger.info("Header image: %s", header_path or "skipped")
        logger.info("Social image: %s", social_path or "skipped")
    else:
        header_path = social_path = ""

    # ── Step 4: Save locally ────────────────────────────────────────
    if config.get("output", {}).get("save_locally", True):
        _save_output(config, post)

    if dry_run:
        logger.info("DRY RUN — skipping publishing steps.")
        result["success"] = True
        return result

    # ── Step 5a: Publish to WordPress ───────────────────────────────
    logger.info("Step 4/5 — Publishing to WordPress…")
    publisher = WordPressPublisher(config)
    pub_result = publisher.publish(post)

    if pub_result:
        result["blog_url"] = pub_result.get("url", "")
        logger.info("WordPress: %s", result["blog_url"])
    else:
        logger.warning("WordPress publishing failed or disabled.")

    # ── Step 5b: Post to Social Media ───────────────────────────────
    logger.info("Step 5/5 — Posting to social media…")
    social_poster = SocialMediaPoster(config)
    blog_url = result["blog_url"] or config.get("content", {}).get("website_url", "")
    social_urls = social_poster.post_all(post, blog_url, social_path)
    result["social_urls"] = social_urls

    for platform, url in social_urls.items():
        logger.info("%s: %s", platform.capitalize(), url)

    # ── Done ────────────────────────────────────────────────────────
    duration = (datetime.now() - run_start).total_seconds()
    result["success"] = True
    logger.info("=" * 60)
    logger.info("Pipeline complete in %.1f seconds", duration)
    logger.info("Blog URL: %s", result.get("blog_url") or "N/A")
    logger.info("=" * 60)

    return result


# ------------------------------------------------------------------ #
# Local Output Saver                                                   #
# ------------------------------------------------------------------ #

def _save_output(config: dict, post) -> None:
    from modules.content_generator import BlogPost
    output_dir = Path(config.get("output", {}).get("output_dir", "output"))
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save HTML
    html_path = output_dir / f"{post.slug}.html"
    html_path.write_text(post.body_html, encoding="utf-8")

    # Save Markdown
    md_path = output_dir / f"{post.slug}.md"
    md_path.write_text(post.body_markdown, encoding="utf-8")

    # Save metadata JSON (SEO, schema, social captions)
    meta = {
        "title": post.title,
        "slug": post.slug,
        "meta_title": post.meta_title,
        "meta_description": post.meta_description,
        "focus_keyword": post.focus_keyword,
        "secondary_keywords": post.secondary_keywords,
        "tags": post.tags,
        "hashtags": post.hashtags,
        "schema_markup": post.schema_markup,
        "faq_schema": post.faq_schema,
        "twitter_caption": post.twitter_caption,
        "linkedin_caption": post.linkedin_caption,
        "instagram_caption": post.instagram_caption,
        "image_prompt": post.image_prompt,
        "image_alt_text": post.image_alt_text,
        "word_count": post.word_count,
    }
    meta_path = output_dir / f"{post.slug}_meta.json"
    meta_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    logger.info("Output saved to: %s", output_dir)


# ------------------------------------------------------------------ #
# Scheduler                                                            #
# ------------------------------------------------------------------ #

def run_scheduled(config: dict, dry_run: bool = False,
                  manual_topic: str | None = None) -> None:
    """Run the pipeline repeatedly on the configured interval."""
    try:
        from apscheduler.schedulers.blocking import BlockingScheduler
        from apscheduler.triggers.interval import IntervalTrigger
        import pytz
    except ImportError:
        logger.error("APScheduler not installed. Run: pip install apscheduler")
        sys.exit(1)

    sched_cfg = config.get("schedule", {})
    interval_hours = sched_cfg.get("interval_hours", 24)
    tz_name = sched_cfg.get("timezone", "UTC")
    timezone = pytz.timezone(tz_name)

    scheduler = BlockingScheduler(timezone=timezone)
    scheduler.add_job(
        func=run_pipeline,
        trigger=IntervalTrigger(hours=interval_hours, timezone=timezone),
        args=[config, dry_run, manual_topic],
        id="blog_pipeline",
        name="Automated Blog Publisher",
        replace_existing=True,
        next_run_time=datetime.now(timezone),  # Run immediately on start
    )

    logger.info("Scheduler started — running every %d hour(s) [%s timezone]",
                interval_hours, tz_name)
    logger.info("Press Ctrl+C to stop.")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        logger.info("Scheduler stopped.")


# ------------------------------------------------------------------ #
# CLI Entry Point                                                      #
# ------------------------------------------------------------------ #

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Automated Blog Publishing Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                            # Run pipeline once
  python main.py --schedule                 # Run on configured interval (default 24h)
  python main.py --schedule --interval 5    # Override: run every 5 hours
  python main.py --dry-run                  # Generate content but don't publish
  python main.py --topic "Prompt Engineering Tips"  # Use a specific topic
  python main.py --config custom.yaml       # Use a different config file
        """,
    )
    parser.add_argument("--config", default="config.yaml",
                        help="Path to config file (default: config.yaml)")
    parser.add_argument("--schedule", action="store_true",
                        help="Run on a recurring schedule instead of once")
    parser.add_argument("--interval", type=int, default=None,
                        help="Override schedule interval in hours (e.g. 1, 5, 24)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Generate content but skip publishing")
    parser.add_argument("--topic", type=str, default=None,
                        help="Force a specific topic instead of auto-discovery")
    args = parser.parse_args()

    # Load config
    config_path = Path(args.config)
    if not config_path.exists():
        print(f"Config file not found: {config_path}")
        sys.exit(1)

    config = load_config(str(config_path))
    setup_logging(config)

    # Override interval if provided
    if args.interval:
        config.setdefault("schedule", {})["interval_hours"] = args.interval

    # Validate Anthropic API key (required)
    if not os.getenv("ANTHROPIC_API_KEY"):
        logger.error(
            "ANTHROPIC_API_KEY environment variable is not set.\n"
            "  export ANTHROPIC_API_KEY='your-key-here'"
        )
        sys.exit(1)

    if args.schedule:
        run_scheduled(config, dry_run=args.dry_run, manual_topic=args.topic)
    else:
        result = run_pipeline(config, dry_run=args.dry_run, manual_topic=args.topic)
        if not result["success"]:
            sys.exit(1)


if __name__ == "__main__":
    main()
