import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "citations.db"


def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS scans (
            scan_id TEXT PRIMARY KEY,
            target_url TEXT NOT NULL,
            target_domain TEXT NOT NULL,
            competitor_urls TEXT NOT NULL,
            keywords TEXT NOT NULL,
            engines TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'running',
            created_at TEXT NOT NULL,
            completed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS citations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_id TEXT NOT NULL,
            keyword TEXT NOT NULL,
            engine TEXT NOT NULL,
            engine_name TEXT NOT NULL,
            engine_color TEXT NOT NULL,
            cited_url TEXT NOT NULL,
            cited_domain TEXT NOT NULL,
            is_target INTEGER NOT NULL,
            position INTEGER NOT NULL,
            citation_count INTEGER NOT NULL,
            sentiment TEXT NOT NULL,
            snippet TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (scan_id) REFERENCES scans(scan_id)
        );
    """)
    conn.commit()
    conn.close()


def create_scan(scan_id: str, request) -> None:
    conn = get_conn()
    conn.execute(
        """INSERT INTO scans
           (scan_id, target_url, target_domain, competitor_urls, keywords, engines, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'running', ?)""",
        (
            scan_id,
            request.target_url,
            _get_domain(request.target_url),
            json.dumps(request.competitor_urls),
            json.dumps(request.keywords),
            json.dumps(request.engines),
            datetime.utcnow().isoformat(),
        ),
    )
    conn.commit()
    conn.close()


def update_scan_status(scan_id: str, status: str) -> None:
    conn = get_conn()
    conn.execute(
        "UPDATE scans SET status=?, completed_at=? WHERE scan_id=?",
        (status, datetime.utcnow().isoformat(), scan_id),
    )
    conn.commit()
    conn.close()


def save_citations(scan_id: str, results: dict) -> None:
    conn = get_conn()
    for c in results["citations"]:
        conn.execute(
            """INSERT INTO citations
               (scan_id, keyword, engine, engine_name, engine_color, cited_url, cited_domain,
                is_target, position, citation_count, sentiment, snippet, timestamp)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                scan_id, c["keyword"], c["engine"], c["engine_name"], c["engine_color"],
                c["cited_url"], c["cited_domain"], 1 if c["is_target"] else 0,
                c["position"], c["citation_count"], c["sentiment"], c["snippet"], c["timestamp"],
            ),
        )
    conn.commit()
    conn.close()


def get_scan(scan_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute("SELECT * FROM scans WHERE scan_id=?", (scan_id,)).fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)


def get_scan_results(scan_id: str) -> dict | None:
    conn = get_conn()
    scan = conn.execute("SELECT * FROM scans WHERE scan_id=?", (scan_id,)).fetchone()
    if not scan:
        conn.close()
        return None

    scan = dict(scan)
    rows = conn.execute(
        "SELECT * FROM citations WHERE scan_id=? ORDER BY keyword, engine, position", (scan_id,)
    ).fetchall()
    conn.close()

    citations = [dict(r) for r in rows]
    for c in citations:
        c["is_target"] = bool(c["is_target"])

    target_domain = scan["target_domain"]
    competitor_domains = json.loads(scan["competitor_urls"])
    keywords = json.loads(scan["keywords"])
    engines = json.loads(scan["engines"])

    target_cites = [c for c in citations if c["is_target"]]
    all_domains = [target_domain] + [_get_domain(u) for u in competitor_domains]

    # Summary stats
    total = len(citations)
    target_count = len(target_cites)
    total_keywords = len(keywords)
    citation_rate = round(target_count / (total_keywords * len(engines)) if total_keywords else 0, 2)
    avg_pos = round(sum(c["position"] for c in target_cites) / len(target_cites), 1) if target_cites else 0

    pos_count = sum(1 for c in target_cites if c["sentiment"] == "positive")
    neg_count = sum(1 for c in target_cites if c["sentiment"] == "negative")
    sentiment_score = int((pos_count - neg_count * 2) / max(len(target_cites), 1) * 50 + 50)
    sentiment_score = max(0, min(100, sentiment_score))

    # Rank vs competitors
    domain_counts = {d: 0 for d in all_domains}
    for c in citations:
        if c["cited_domain"] in domain_counts:
            domain_counts[c["cited_domain"]] += c["citation_count"]
    sorted_domains = sorted(domain_counts.items(), key=lambda x: x[1], reverse=True)
    rank = next((i + 1 for i, (d, _) in enumerate(sorted_domains) if d == target_domain), len(sorted_domains))
    rank_label = f"{rank}{'st' if rank == 1 else 'nd' if rank == 2 else 'rd' if rank == 3 else 'th'} of {len(all_domains)}"

    summary = {
        "total_citations": total,
        "target_citation_count": target_count,
        "target_citation_rate": citation_rate,
        "avg_position": avg_pos,
        "sentiment_score": sentiment_score,
        "rank_vs_competitors": rank_label,
        "engines_covered": len(engines),
        "keywords_tracked": total_keywords,
    }

    # Competitor analysis
    competitor_analysis = {}
    for domain in all_domains:
        domain_cites = [c for c in citations if c["cited_domain"] == domain]
        sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
        engine_counts = {}
        for c in domain_cites:
            sentiment_counts[c["sentiment"]] = sentiment_counts.get(c["sentiment"], 0) + 1
            engine_counts[c["engine"]] = engine_counts.get(c["engine"], 0) + c["citation_count"]
        competitor_analysis[domain] = {
            "total_citations": sum(c["citation_count"] for c in domain_cites),
            "citation_appearances": len(domain_cites),
            "avg_position": round(sum(c["position"] for c in domain_cites) / len(domain_cites), 1) if domain_cites else 0,
            "sentiment_breakdown": sentiment_counts,
            "engine_breakdown": engine_counts,
            "is_target": domain == target_domain,
        }

    # Engine breakdown (target only)
    engine_breakdown = {}
    for eng in engines:
        eng_cites = [c for c in target_cites if c["engine"] == eng]
        engine_breakdown[eng] = {
            "count": len(eng_cites),
            "total_mentions": sum(c["citation_count"] for c in eng_cites),
            "avg_position": round(sum(c["position"] for c in eng_cites) / len(eng_cites), 1) if eng_cites else 0,
        }

    # Keyword performance
    keyword_performance = {}
    for kw in keywords:
        kw_cites = [c for c in citations if c["keyword"] == kw]
        kw_target = [c for c in kw_cites if c["is_target"]]
        all_positions = [c["position"] for c in kw_target]
        keyword_performance[kw] = {
            "total_appearances": len(kw_cites),
            "target_cited": len(kw_target) > 0,
            "target_appearances": len(kw_target),
            "best_position": min(all_positions) if all_positions else None,
            "engines_cited_in": list({c["engine"] for c in kw_target}),
            "competitor_appearances": len(kw_cites) - len(kw_target),
        }

    return {
        "scan_id": scan_id,
        "status": scan["status"],
        "target_url": scan["target_url"],
        "target_domain": target_domain,
        "competitor_urls": competitor_domains,
        "keywords": keywords,
        "engines_used": engines,
        "created_at": scan["created_at"],
        "completed_at": scan.get("completed_at"),
        "summary": summary,
        "citations": citations,
        "competitor_analysis": competitor_analysis,
        "engine_breakdown": engine_breakdown,
        "keyword_performance": keyword_performance,
    }


def get_all_scans() -> list:
    conn = get_conn()
    rows = conn.execute(
        "SELECT scan_id, target_url, target_domain, status, created_at, completed_at FROM scans ORDER BY created_at DESC LIMIT 50"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def _get_domain(url: str) -> str:
    url = url.replace("https://", "").replace("http://", "").replace("www.", "")
    return url.split("/")[0].split("?")[0]
