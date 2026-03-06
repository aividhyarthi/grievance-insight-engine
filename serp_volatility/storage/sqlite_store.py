"""
SQLite storage backend for SERP data.
Lightweight local storage — good for development and small-scale tracking.
"""

import json
import sqlite3
from datetime import date, datetime
from pathlib import Path
from typing import Optional

from ..collectors.base import SerpFeature, SerpResult


class SQLiteStore:
    """SQLite-based storage for SERP results and volatility scores."""

    def __init__(self, db_path: str = "serp_volatility/data/serp_data.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        """Create tables if they don't exist."""
        with self._connect() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS serp_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    keyword TEXT NOT NULL,
                    category TEXT NOT NULL,
                    position INTEGER NOT NULL,
                    url TEXT NOT NULL,
                    title TEXT,
                    domain TEXT NOT NULL,
                    device TEXT NOT NULL DEFAULT 'desktop',
                    country TEXT NOT NULL DEFAULT 'IN',
                    snippet TEXT,
                    collected_at TIMESTAMP NOT NULL,
                    collected_date DATE NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_serp_keyword_date
                    ON serp_results(keyword, collected_date, device);

                CREATE INDEX IF NOT EXISTS idx_serp_category_date
                    ON serp_results(category, collected_date);

                CREATE TABLE IF NOT EXISTS keywords (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    keyword TEXT NOT NULL,
                    category TEXT NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(keyword, category)
                );

                CREATE TABLE IF NOT EXISTS volatility_scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    score_date DATE NOT NULL,
                    device TEXT NOT NULL DEFAULT 'desktop',
                    category TEXT,
                    score REAL NOT NULL,
                    level TEXT,
                    keywords_tracked INTEGER,
                    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(score_date, device, category)
                );

                CREATE INDEX IF NOT EXISTS idx_volatility_date
                    ON volatility_scores(score_date, device);

                CREATE TABLE IF NOT EXISTS serp_features (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    keyword TEXT NOT NULL,
                    category TEXT NOT NULL,
                    device TEXT NOT NULL DEFAULT 'desktop',
                    feature_type TEXT NOT NULL,
                    count INTEGER NOT NULL DEFAULT 1,
                    feature_data TEXT,
                    collected_date DATE NOT NULL,
                    collected_at TIMESTAMP NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_features_date
                    ON serp_features(collected_date, device, feature_type);

                CREATE INDEX IF NOT EXISTS idx_features_keyword
                    ON serp_features(keyword, collected_date);
            """)

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def store_results(self, results: list[SerpResult]):
        """Store a batch of SERP results."""
        with self._connect() as conn:
            conn.executemany(
                """INSERT INTO serp_results
                   (keyword, category, position, url, title, domain, device,
                    country, snippet, collected_at, collected_date)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    (
                        r.keyword, r.category, r.position, r.url, r.title,
                        r.domain, r.device, r.country, r.snippet,
                        r.collected_at.isoformat(),
                        r.collected_at.date().isoformat(),
                    )
                    for r in results
                ],
            )

    def add_keywords(self, keywords: list[dict]):
        """Add keywords to track. Each dict has 'keyword' and 'category'."""
        with self._connect() as conn:
            conn.executemany(
                """INSERT OR IGNORE INTO keywords (keyword, category)
                   VALUES (?, ?)""",
                [(kw["keyword"], kw["category"]) for kw in keywords],
            )

    def get_keywords_for_category(self, category: str) -> list[str]:
        """Get active keywords for a category."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT keyword FROM keywords WHERE category = ? AND is_active = 1",
                (category,),
            ).fetchall()
            return [r["keyword"] for r in rows]

    def get_tracked_categories(self) -> list[str]:
        """Get all categories that have active keywords."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT DISTINCT category FROM keywords WHERE is_active = 1"
            ).fetchall()
            return [r["category"] for r in rows]

    def get_results_for_keyword(
        self, keyword: str, target_date: date, device: str = "desktop"
    ) -> list[dict]:
        """Get SERP results for a keyword on a specific date."""
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT domain, position, url, title
                   FROM serp_results
                   WHERE keyword = ? AND collected_date = ? AND device = ?
                   ORDER BY position""",
                (keyword, target_date.isoformat(), device),
            ).fetchall()
            return [dict(r) for r in rows]

    def get_keyword_count(self) -> int:
        """Get total number of active keywords."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT COUNT(*) as cnt FROM keywords WHERE is_active = 1"
            ).fetchone()
            return row["cnt"]

    def store_volatility_score(self, score_data: dict):
        """Store computed volatility scores."""
        with self._connect() as conn:
            # Store overall score
            conn.execute(
                """INSERT OR REPLACE INTO volatility_scores
                   (score_date, device, category, score, level, keywords_tracked)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    score_data["date"],
                    score_data["device"],
                    "overall",
                    score_data["overall_score"],
                    score_data["level"],
                    score_data["keywords_tracked"],
                ),
            )
            # Store per-category scores
            for category, score in score_data.get("category_scores", {}).items():
                conn.execute(
                    """INSERT OR REPLACE INTO volatility_scores
                       (score_date, device, category, score, level, keywords_tracked)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (
                        score_data["date"],
                        score_data["device"],
                        category,
                        score,
                        VolatilityCalculator._score_to_level(score),
                        None,
                    ),
                )

    def store_features(self, features: list[SerpFeature]):
        """Store detected SERP features for a batch of keywords."""
        if not features:
            return
        with self._connect() as conn:
            conn.executemany(
                """INSERT INTO serp_features
                   (keyword, category, device, feature_type, count, feature_data,
                    collected_date, collected_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                [
                    (
                        f.keyword, f.category, f.device, f.feature_type, f.count,
                        f.feature_data,
                        f.collected_at.date().isoformat(),
                        f.collected_at.isoformat(),
                    )
                    for f in features
                ],
            )

    def get_feature_summary(
        self, target_date: date, device: str = "desktop"
    ) -> list[dict]:
        """
        For a given date, return for each feature_type:
          - how many keywords triggered it
          - total count of items (e.g. number of top stories shown)
        """
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT feature_type,
                          COUNT(DISTINCT keyword) AS keywords_with_feature,
                          SUM(count) AS total_items
                   FROM serp_features
                   WHERE collected_date = ? AND device = ?
                   GROUP BY feature_type
                   ORDER BY keywords_with_feature DESC""",
                (target_date.isoformat(), device),
            ).fetchall()
            return [dict(r) for r in rows]

    def get_feature_history(
        self, feature_type: str, days: int = 30, device: str = "desktop"
    ) -> list[dict]:
        """
        Day-by-day presence of a specific SERP feature:
          - date
          - keywords_with_feature  (number of keywords where it appeared)
          - total_keywords          (total tracked on that date, for % calc)
        """
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT
                       f.collected_date AS score_date,
                       COUNT(DISTINCT f.keyword) AS keywords_with_feature,
                       (SELECT COUNT(DISTINCT keyword) FROM serp_features
                        WHERE collected_date = f.collected_date AND device = f.device
                       ) AS total_keywords
                   FROM serp_features f
                   WHERE f.feature_type = ? AND f.device = ?
                   GROUP BY f.collected_date
                   ORDER BY f.collected_date DESC
                   LIMIT ?""",
                (feature_type, device, days),
            ).fetchall()
            return [dict(r) for r in reversed(rows)]

    def get_volatility_history(
        self, days: int = 30, device: str = "desktop", category: str = "overall"
    ) -> list[dict]:
        """Get historical volatility scores."""
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT score_date, score, level, keywords_tracked
                   FROM volatility_scores
                   WHERE device = ? AND category = ?
                   ORDER BY score_date DESC
                   LIMIT ?""",
                (device, category, days),
            ).fetchall()
            return [dict(r) for r in reversed(rows)]


# Avoid circular import — import here for store_volatility_score
from ..analysis.volatility import VolatilityCalculator
