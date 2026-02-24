from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime


class SuggestRequest(BaseModel):
    url: str


class ScanRequest(BaseModel):
    target_url: str
    competitor_urls: List[str] = []
    keywords: List[str]
    engines: List[str] = ["perplexity", "google_ai_overview", "chatgpt_search", "chatgpt_chat"]
    use_demo: bool = True


class ScanResponse(BaseModel):
    scan_id: str
    status: str
    created_at: str


class CitationRecord(BaseModel):
    keyword: str
    engine: str
    engine_name: str
    engine_color: str
    cited_url: str
    cited_domain: str
    is_target: bool
    position: int
    citation_count: int
    sentiment: str
    snippet: str
    timestamp: str


class SummaryStats(BaseModel):
    total_citations: int
    target_citation_count: int
    target_citation_rate: float
    avg_position: float
    sentiment_score: int
    rank_vs_competitors: str
    engines_covered: int
    keywords_tracked: int


class ScanResult(BaseModel):
    scan_id: str
    status: str
    target_url: str
    target_domain: str
    competitor_urls: List[str]
    keywords: List[str]
    engines_used: List[str]
    created_at: str
    completed_at: Optional[str]
    summary: Optional[SummaryStats]
    citations: List[CitationRecord]
    competitor_analysis: Dict[str, Any]
    engine_breakdown: Dict[str, Any]
    keyword_performance: Dict[str, Any]
