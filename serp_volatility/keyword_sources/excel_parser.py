"""
Excel / CSV keyword parser.

Accepts files with any of these column naming conventions:
  keyword / query / search term / kw
  url / page / target url / landing page

Both keyword-only and keyword+URL formats are supported.
"""

import io
from pathlib import Path
from typing import Union

import pandas as pd

from .base import KeywordEntry, KeywordSource


# Accepted column name aliases (lowercased)
KEYWORD_ALIASES = {"keyword", "keywords", "query", "queries", "search term", "search terms", "kw", "term"}
URL_ALIASES = {"url", "urls", "page", "target url", "landing page", "page url", "link"}


class ExcelParser(KeywordSource):
    """
    Parse Excel (.xlsx) or CSV files into KeywordEntry objects.

    Expected columns (flexible naming):
      - keyword  (required)
      - url      (optional)
    """

    def __init__(self, file: Union[str, Path, bytes, io.BytesIO]):
        self.file = file

    def load(self) -> list[KeywordEntry]:
        df = self._read_file()
        df = self._normalise_columns(df)
        return self._to_entries(df)

    def _read_file(self) -> pd.DataFrame:
        """Read Excel or CSV from file path or bytes."""
        if isinstance(self.file, (str, Path)):
            path = Path(self.file)
            if path.suffix.lower() in (".xlsx", ".xls"):
                return pd.read_excel(path, engine="openpyxl")
            return pd.read_csv(path)

        # Bytes or BytesIO (from Streamlit file_uploader)
        if isinstance(self.file, bytes):
            self.file = io.BytesIO(self.file)

        # Try Excel first, fall back to CSV
        try:
            return pd.read_excel(self.file, engine="openpyxl")
        except Exception:
            self.file.seek(0)
            return pd.read_csv(self.file)

    def _normalise_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Map any supported column name variant to canonical names."""
        rename_map = {}
        for col in df.columns:
            col_lower = col.strip().lower()
            if col_lower in KEYWORD_ALIASES:
                rename_map[col] = "keyword"
            elif col_lower in URL_ALIASES:
                rename_map[col] = "url"

        df = df.rename(columns=rename_map)

        if "keyword" not in df.columns:
            raise ValueError(
                f"No keyword column found. Expected one of: {sorted(KEYWORD_ALIASES)}\n"
                f"Got columns: {list(df.columns)}"
            )

        return df

    def _to_entries(self, df: pd.DataFrame) -> list[KeywordEntry]:
        entries = []
        for _, row in df.iterrows():
            keyword = str(row["keyword"]).strip()
            if not keyword or keyword.lower() == "nan":
                continue

            url = None
            if "url" in df.columns:
                raw_url = str(row.get("url", "")).strip()
                if raw_url and raw_url.lower() != "nan":
                    url = raw_url

            entries.append(KeywordEntry(
                keyword=keyword,
                source="excel",
                target_url=url,
            ))

        return entries

    @staticmethod
    def get_template_df() -> pd.DataFrame:
        """Return a sample DataFrame showing the expected format."""
        return pd.DataFrame({
            "keyword": [
                "best mutual fund india",
                "jio recharge plan 84 days",
                "neet result 2025",
            ],
            "url": [
                "https://yourblog.com/mutual-fund-guide",
                "https://yourblog.com/jio-recharge",
                "",
            ],
        })
