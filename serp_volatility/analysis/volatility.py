"""
SERP Volatility Calculator for India.

Methodology:
1. For each tracked keyword, compare today's top-N SERP results with yesterday's.
2. Compute per-keyword volatility using traffic-weighted position changes.
3. Aggregate across keywords in a category to get category-level volatility.
4. Aggregate across all categories to get overall India SERP volatility score.

Scale: 0 (no change) to 10 (massive upheaval).
"""

import math
from collections import defaultdict
from datetime import date, timedelta
from typing import Optional

from ..config import CTR_BY_POSITION, CATEGORIES


class VolatilityCalculator:
    """Calculate SERP volatility scores on a 0-10 scale."""

    def __init__(self, storage, config=None):
        self.storage = storage
        self.config = config

    def compute_keyword_volatility(
        self,
        keyword: str,
        date_current: date,
        date_previous: date,
        device: str = "desktop",
    ) -> Optional[float]:
        """
        Compute volatility for a single keyword between two dates.

        Uses traffic-weighted comparison:
        - For each position in today's SERP, check if the same URL was there yesterday.
        - Weight changes by CTR (position 1 matters more than position 20).
        - Returns raw volatility score (0.0 to 1.0).
        """
        current_results = self.storage.get_results_for_keyword(
            keyword, date_current, device
        )
        previous_results = self.storage.get_results_for_keyword(
            keyword, date_previous, device
        )

        if not current_results or not previous_results:
            return None

        # Build position maps: domain -> position
        current_positions = {r["domain"]: r["position"] for r in current_results}
        previous_positions = {r["domain"]: r["position"] for r in previous_results}

        all_domains = set(current_positions.keys()) | set(previous_positions.keys())

        if not all_domains:
            return None

        total_weighted_change = 0.0
        total_weight = 0.0
        max_pos = max(
            max(current_positions.values(), default=20),
            max(previous_positions.values(), default=20),
        )
        # Position beyond tracked range
        out_of_range = max_pos + 1

        for domain in all_domains:
            curr_pos = current_positions.get(domain, out_of_range)
            prev_pos = previous_positions.get(domain, out_of_range)

            # Weight by the higher (more visible) position
            best_pos = min(curr_pos, prev_pos)
            weight = CTR_BY_POSITION.get(best_pos, 0.003)

            position_change = abs(curr_pos - prev_pos)
            total_weighted_change += weight * position_change
            total_weight += weight

        if total_weight == 0:
            return 0.0

        # Normalized weighted average change
        avg_weighted_change = total_weighted_change / total_weight

        # Normalize to 0-1 range (cap at max_expected_change positions)
        max_change = self.config.max_expected_change if self.config else 10.0
        volatility = min(avg_weighted_change / max_change, 1.0)

        return volatility

    def compute_category_volatility(
        self,
        category: str,
        target_date: date,
        device: str = "desktop",
    ) -> Optional[float]:
        """
        Compute volatility score for an entire category.
        Returns score on 0-10 scale.
        """
        previous_date = target_date - timedelta(days=1)
        keywords = self.storage.get_keywords_for_category(category)

        if not keywords:
            return None

        volatilities = []
        for kw in keywords:
            v = self.compute_keyword_volatility(kw, target_date, previous_date, device)
            if v is not None:
                volatilities.append(v)

        if not volatilities:
            return None

        # Average volatility across keywords, scaled to 0-10
        avg = sum(volatilities) / len(volatilities)
        return round(avg * 10.0, 2)

    def compute_overall_volatility(
        self,
        target_date: date,
        device: str = "desktop",
    ) -> dict:
        """
        Compute overall and per-category volatility for India SERPs.

        Returns:
            {
                "date": "2026-03-06",
                "device": "desktop",
                "overall_score": 4.2,
                "category_scores": {
                    "education": 3.8,
                    "ecommerce": 5.1,
                    ...
                },
                "level": "Normal",  # Low / Normal / High / Very High
                "keywords_tracked": 150,
            }
        """
        category_scores = {}
        all_volatilities = []

        categories = self.storage.get_tracked_categories()

        for category in categories:
            score = self.compute_category_volatility(category, target_date, device)
            if score is not None:
                category_scores[category] = score
                all_volatilities.append(score)

        overall = round(sum(all_volatilities) / len(all_volatilities), 2) if all_volatilities else 0.0
        keywords_count = self.storage.get_keyword_count()

        return {
            "date": target_date.isoformat(),
            "device": device,
            "overall_score": overall,
            "category_scores": category_scores,
            "level": self._score_to_level(overall),
            "keywords_tracked": keywords_count,
        }

    def compute_history(
        self,
        days: int = 30,
        device: str = "desktop",
    ) -> list[dict]:
        """Get volatility scores for the last N days."""
        today = date.today()
        history = []
        for i in range(days):
            target = today - timedelta(days=i)
            result = self.compute_overall_volatility(target, device)
            if result["overall_score"] > 0:
                history.append(result)
        return list(reversed(history))

    @staticmethod
    def _score_to_level(score: float) -> str:
        """Convert numeric score to human-readable level."""
        if score < 2.0:
            return "Low"
        elif score < 5.0:
            return "Normal"
        elif score < 8.0:
            return "High"
        else:
            return "Very High"
