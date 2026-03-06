"""
BigQuery storage backend for SERP data.
Production-grade storage for large-scale tracking.

Requires: google-cloud-bigquery package and GCP credentials.
"""

from datetime import date
from typing import Optional

from ..collectors.base import SerpResult


class BigQueryStore:
    """BigQuery-based storage for SERP results and volatility scores."""

    def __init__(self, project_id: str, dataset_id: str = "serp_volatility"):
        try:
            from google.cloud import bigquery
        except ImportError:
            raise ImportError(
                "google-cloud-bigquery is required for BigQuery storage. "
                "Install with: pip install google-cloud-bigquery"
            )

        self.client = bigquery.Client(project=project_id)
        self.dataset_id = dataset_id
        self.project_id = project_id
        self._ensure_dataset()
        self._ensure_tables()

    def _ensure_dataset(self):
        from google.cloud import bigquery

        dataset_ref = f"{self.project_id}.{self.dataset_id}"
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = "asia-south1"  # Mumbai region for India data
        self.client.create_dataset(dataset, exists_ok=True)

    def _ensure_tables(self):
        from google.cloud import bigquery

        # SERP results table
        serp_schema = [
            bigquery.SchemaField("keyword", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("category", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("position", "INTEGER", mode="REQUIRED"),
            bigquery.SchemaField("url", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("title", "STRING"),
            bigquery.SchemaField("domain", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("device", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("country", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("snippet", "STRING"),
            bigquery.SchemaField("collected_at", "TIMESTAMP", mode="REQUIRED"),
            bigquery.SchemaField("collected_date", "DATE", mode="REQUIRED"),
        ]

        serp_table_ref = f"{self.project_id}.{self.dataset_id}.serp_results"
        serp_table = bigquery.Table(serp_table_ref, schema=serp_schema)
        serp_table.time_partitioning = bigquery.TimePartitioning(
            type_=bigquery.TimePartitioningType.DAY,
            field="collected_date",
        )
        self.client.create_table(serp_table, exists_ok=True)

        # Keywords table
        kw_schema = [
            bigquery.SchemaField("keyword", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("category", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("is_active", "BOOLEAN"),
            bigquery.SchemaField("added_at", "TIMESTAMP"),
        ]
        kw_table_ref = f"{self.project_id}.{self.dataset_id}.keywords"
        self.client.create_table(
            bigquery.Table(kw_table_ref, schema=kw_schema), exists_ok=True
        )

        # Volatility scores table
        vol_schema = [
            bigquery.SchemaField("score_date", "DATE", mode="REQUIRED"),
            bigquery.SchemaField("device", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("category", "STRING"),
            bigquery.SchemaField("score", "FLOAT", mode="REQUIRED"),
            bigquery.SchemaField("level", "STRING"),
            bigquery.SchemaField("keywords_tracked", "INTEGER"),
            bigquery.SchemaField("computed_at", "TIMESTAMP"),
        ]
        vol_table_ref = f"{self.project_id}.{self.dataset_id}.volatility_scores"
        vol_table = bigquery.Table(vol_table_ref, schema=vol_schema)
        vol_table.time_partitioning = bigquery.TimePartitioning(
            type_=bigquery.TimePartitioningType.DAY,
            field="score_date",
        )
        self.client.create_table(vol_table, exists_ok=True)

    def store_results(self, results: list[SerpResult]):
        """Store SERP results in BigQuery."""
        rows = [
            {
                "keyword": r.keyword,
                "category": r.category,
                "position": r.position,
                "url": r.url,
                "title": r.title,
                "domain": r.domain,
                "device": r.device,
                "country": r.country,
                "snippet": r.snippet,
                "collected_at": r.collected_at.isoformat(),
                "collected_date": r.collected_at.date().isoformat(),
            }
            for r in results
        ]

        table_ref = f"{self.project_id}.{self.dataset_id}.serp_results"
        errors = self.client.insert_rows_json(table_ref, rows)
        if errors:
            raise RuntimeError(f"BigQuery insert errors: {errors}")

    def add_keywords(self, keywords: list[dict]):
        """Add keywords to track."""
        from datetime import datetime, timezone

        rows = [
            {
                "keyword": kw["keyword"],
                "category": kw["category"],
                "is_active": True,
                "added_at": datetime.now(timezone.utc).isoformat(),
            }
            for kw in keywords
        ]

        table_ref = f"{self.project_id}.{self.dataset_id}.keywords"
        errors = self.client.insert_rows_json(table_ref, rows)
        if errors:
            raise RuntimeError(f"BigQuery insert errors: {errors}")

    def get_keywords_for_category(self, category: str) -> list[str]:
        """Get active keywords for a category."""
        query = f"""
            SELECT keyword
            FROM `{self.project_id}.{self.dataset_id}.keywords`
            WHERE category = @category AND is_active = TRUE
        """
        from google.cloud import bigquery

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("category", "STRING", category)
            ]
        )
        results = self.client.query(query, job_config=job_config).result()
        return [row.keyword for row in results]

    def get_tracked_categories(self) -> list[str]:
        """Get all categories with active keywords."""
        query = f"""
            SELECT DISTINCT category
            FROM `{self.project_id}.{self.dataset_id}.keywords`
            WHERE is_active = TRUE
        """
        results = self.client.query(query).result()
        return [row.category for row in results]

    def get_results_for_keyword(
        self, keyword: str, target_date: date, device: str = "desktop"
    ) -> list[dict]:
        """Get SERP results for a keyword on a specific date."""
        from google.cloud import bigquery

        query = f"""
            SELECT domain, position, url, title
            FROM `{self.project_id}.{self.dataset_id}.serp_results`
            WHERE keyword = @keyword
              AND collected_date = @target_date
              AND device = @device
            ORDER BY position
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("keyword", "STRING", keyword),
                bigquery.ScalarQueryParameter("target_date", "DATE", target_date),
                bigquery.ScalarQueryParameter("device", "STRING", device),
            ]
        )
        results = self.client.query(query, job_config=job_config).result()
        return [dict(row) for row in results]

    def get_keyword_count(self) -> int:
        """Get total active keyword count."""
        query = f"""
            SELECT COUNT(*) as cnt
            FROM `{self.project_id}.{self.dataset_id}.keywords`
            WHERE is_active = TRUE
        """
        result = self.client.query(query).result()
        for row in result:
            return row.cnt
        return 0

    def get_volatility_history(
        self, days: int = 30, device: str = "desktop", category: str = "overall"
    ) -> list[dict]:
        """Get historical volatility scores."""
        from google.cloud import bigquery

        query = f"""
            SELECT score_date, score, level, keywords_tracked
            FROM `{self.project_id}.{self.dataset_id}.volatility_scores`
            WHERE device = @device AND category = @category
            ORDER BY score_date DESC
            LIMIT @days
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("device", "STRING", device),
                bigquery.ScalarQueryParameter("category", "STRING", category),
                bigquery.ScalarQueryParameter("days", "INT64", days),
            ]
        )
        results = self.client.query(query, job_config=job_config).result()
        rows = [dict(row) for row in results]
        return list(reversed(rows))
