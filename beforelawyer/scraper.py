"""
Scraper for Indian Supreme Court Judgments from government open data sources.

Data Source: Indian Supreme Court Judgments — AWS Open Data Registry
  - Mirror of eCourts (ecourts.gov.in) government data
  - URL: https://registry.opendata.aws/indian-supreme-court-judgments/
  - S3 Bucket: indian-supreme-court-judgments (public, no auth needed)
  - Maintained by: github.com/vanga/indian-supreme-court-judgments

Metadata fields per judgment:
  title, petitioner, respondent, judge, author_judge, citation,
  case_id, cnr, decision_date, disposal_nature, court, description, year

This scraper fetches metadata JSON/Parquet from the public S3 bucket
and converts it into our LegalCase model format.
"""

import json
import logging
import os
import re
from datetime import date, datetime

import requests

logger = logging.getLogger(__name__)

S3_BASE = "https://indian-supreme-court-judgments.s3.ap-south-1.amazonaws.com"


def fetch_sci_metadata(year: int, max_cases: int = 50) -> list[dict]:
    """Fetch Supreme Court of India judgment metadata for a given year.

    Pulls JSON metadata from the public S3 bucket (eCourts gov data mirror).
    """
    metadata_url = f"{S3_BASE}/metadata/{year}/metadata.json"
    logger.info(f"Fetching SCI metadata for {year} from {metadata_url}")

    try:
        resp = requests.get(metadata_url, timeout=30)
        resp.raise_for_status()
        records = resp.json()
    except requests.exceptions.HTTPError:
        # Try alternative path structure
        index_url = f"{S3_BASE}/metadata/{year}/index.json"
        try:
            resp = requests.get(index_url, timeout=30)
            resp.raise_for_status()
            index_data = resp.json()
            logger.info(f"Found index for {year}: {index_data}")
            return []
        except Exception:
            logger.warning(f"No metadata available for year {year}")
            return []
    except Exception as e:
        logger.warning(f"Failed to fetch metadata for {year}: {e}")
        return []

    if isinstance(records, dict):
        records = records.get("judgments", records.get("data", [records]))
    if not isinstance(records, list):
        records = [records]

    cases = []
    for record in records[:max_cases]:
        case = _parse_sci_record(record, year)
        if case:
            cases.append(case)

    logger.info(f"Parsed {len(cases)} cases for year {year}")
    return cases


def _parse_sci_record(record: dict, fallback_year: int) -> dict | None:
    """Parse a single SCI judgment metadata record into our case format."""
    title = record.get("title", "").strip()
    if not title:
        return None

    # Parse decision date
    decision_date = None
    date_str = record.get("decision_date", "")
    if date_str:
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%dT%H:%M:%S"):
            try:
                decision_date = datetime.strptime(date_str[:10], fmt).date()
                break
            except ValueError:
                continue

    year = decision_date.year if decision_date else record.get("year", fallback_year)

    # Determine case type from title/description
    description = record.get("description", "") or ""
    case_type = _classify_case_type(title, description)

    # Build tags from disposal nature + case type
    tags_list = [case_type.lower()]
    disposal = record.get("disposal_nature", "")
    if disposal:
        tags_list.append(disposal.lower())
    tags_list.append("indian law")
    tags_list.append("supreme court")

    # Determine outcome from disposal nature
    outcome = _parse_outcome(disposal)

    return {
        "case_name": title,
        "case_number": record.get("citation", record.get("case_id", "")),
        "court": "Supreme Court of India",
        "court_level": "supreme",
        "case_type": case_type,
        "year": year,
        "date_decided": decision_date,
        "jurisdiction": "India",
        "judges": record.get("judge", record.get("author_judge", "")),
        "petitioner": record.get("petitioner", ""),
        "respondent": record.get("respondent", ""),
        "outcome": outcome,
        "summary": description[:2000] if description else f"Supreme Court of India judgment: {title}",
        "facts": "",
        "issues": "",
        "legal_reasoning": "",
        "key_principles": "",
        "statutes_referenced": "",
        "precedents_cited": "",
        "impact": "",
        "tags": ",".join(tags_list),
    }


def _classify_case_type(title: str, description: str) -> str:
    """Classify case type from title and description text."""
    text = (title + " " + description).lower()

    patterns = {
        "Criminal": ["criminal", "murder", "theft", "robbery", "fir ", "crpc", "ipc ", "penal", "bail", "accused", "conviction", "sentence"],
        "Constitutional": ["constitution", "fundamental right", "article 14", "article 19", "article 21", "writ petition", "pil"],
        "Civil": ["civil", "suit", "decree", "injunction", "specific performance", "damages", "tort", "negligence"],
        "Family": ["divorce", "marriage", "custody", "maintenance", "matrimonial", "adoption", "family"],
        "Labor": ["labour", "labor", "employment", "industrial dispute", "workmen", "worker", "esi ", "gratuity", "wages"],
        "Tax": ["tax", "income tax", "gst", "excise", "customs duty", "assessment", "revenue"],
        "Corporate": ["company", "corporate", "shareholder", "director", "winding up", "insolvency", "nclt", "sebi"],
        "Property": ["property", "land", "tenant", "rent", "eviction", "acquisition", "real estate", "transfer of property"],
        "Environmental": ["environment", "pollution", "forest", "wildlife", "green tribunal", "ngt"],
        "Administrative": ["administrative", "service matter", "government servant", "transfer", "promotion", "pension"],
    }

    for case_type, keywords in patterns.items():
        if any(kw in text for kw in keywords):
            return case_type

    return "Civil"


def _parse_outcome(disposal_nature: str) -> str:
    """Parse outcome from disposal nature field."""
    if not disposal_nature:
        return "partial"
    d = disposal_nature.lower()
    if any(w in d for w in ["allowed", "granted", "accepted", "favor"]):
        return "favor"
    if any(w in d for w in ["dismissed", "rejected", "denied"]):
        return "against"
    if any(w in d for w in ["partly", "partial", "modified"]):
        return "partial"
    if any(w in d for w in ["remand", "sent back"]):
        return "remanded"
    return "partial"


def scrape_and_store(db, years: list[int] = None, max_per_year: int = 20):
    """Scrape SCI judgments and store in database.

    Args:
        db: SQLAlchemy database instance
        years: List of years to scrape (default: recent 5 years)
        max_per_year: Max cases to import per year
    """
    from beforelawyer.models import LegalCase

    if years is None:
        years = list(range(2020, 2026))

    total_added = 0
    for year in years:
        cases = fetch_sci_metadata(year, max_cases=max_per_year)
        for case_data in cases:
            # Skip if already exists
            existing = LegalCase.query.filter_by(
                case_name=case_data["case_name"],
                year=case_data["year"],
            ).first()
            if existing:
                continue

            case = LegalCase(**case_data)
            db.session.add(case)
            total_added += 1

        db.session.commit()
        logger.info(f"Year {year}: added {len(cases)} cases")

    logger.info(f"Total cases added from scraper: {total_added}")
    return total_added


def fetch_ecourts_judgments_page(court_code: str = "1", page: int = 1) -> list[dict]:
    """Fetch judgments from the eCourts government portal.

    court_code: 1 = Supreme Court of India
    Note: This endpoint may have rate limiting. Use respectfully.
    """
    url = "https://judgments.ecourts.gov.in/pdfsearch/"
    try:
        resp = requests.get(url, timeout=30, headers={
            "User-Agent": "BeforeLawyer/1.0 (Educational Tool)",
        })
        if resp.status_code == 200:
            logger.info("eCourts portal accessible")
            return []
        else:
            logger.warning(f"eCourts returned status {resp.status_code}")
            return []
    except Exception as e:
        logger.warning(f"eCourts fetch failed: {e}")
        return []
