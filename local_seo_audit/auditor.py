"""
SEO Auditor – scores a Google My Business listing across key local SEO signals.

Each signal has a max weight. The final score is a percentage of total possible points.

Signal weights (total = 100):
  - Business name present               5
  - Address / formatted_address        10
  - Phone number                        8
  - Website linked                     10
  - Primary category (types)            8
  - Business hours set                 10
  - Rating exists                       5
  - Review count                       15   (tiered: <5 = 2, 5–24 = 7, 25–99 = 12, 100+ = 15)
  - Average rating quality              8   (≥4.5 = 8, ≥4.0 = 6, ≥3.5 = 4, <3.5 = 2)
  - Photos uploaded                    10   (tiered: 0 = 0, 1–4 = 4, 5–19 = 7, 20+ = 10)
  - Description / editorial summary     7
  - Listing is open / operational       4
"""

from dataclasses import dataclass, field
from typing import Any, Optional


MAX_SCORE = 100


@dataclass
class AuditSignal:
    name: str
    score: int
    max_score: int
    status: str          # "good" | "warn" | "bad"
    detail: str          # human-readable finding
    recommendation: str  # quick-fix tip (used as AI context)


@dataclass
class AuditResult:
    business_name: str
    place_id: str
    google_maps_url: str
    overall_score: int
    grade: str                          # A / B / C / D / F
    signals: list[AuditSignal] = field(default_factory=list)
    raw: dict = field(default_factory=dict)  # full Places API response

    @property
    def pct(self) -> float:
        return round(self.overall_score / MAX_SCORE * 100, 1)


def _grade(score: int) -> str:
    if score >= 90: return "A"
    if score >= 75: return "B"
    if score >= 55: return "C"
    if score >= 35: return "D"
    return "F"


def _tier(value: int, tiers: list[tuple[int, int]]) -> int:
    """Return the score from the first tier where value >= threshold."""
    for threshold, pts in sorted(tiers, key=lambda t: -t[0]):
        if value >= threshold:
            return pts
    return 0


def audit(place_data: dict) -> AuditResult:
    """
    Accepts the dict returned by PlacesFetcher.fetch() and returns an AuditResult.
    """
    details: dict[str, Any] = place_data.get("details", {})
    signals: list[AuditSignal] = []

    # ── 1. Business name ──────────────────────────────────────────────────────
    name = details.get("name", "")
    if name:
        signals.append(AuditSignal("Business Name", 5, 5, "good",
            f"Name found: \"{name}\"",
            "Ensure the name matches your storefront exactly — no keyword stuffing."))
    else:
        signals.append(AuditSignal("Business Name", 0, 5, "bad",
            "No business name returned.",
            "Add/confirm your business name in Google Business Profile."))

    # ── 2. Address ────────────────────────────────────────────────────────────
    address = details.get("formatted_address", "")
    if address:
        signals.append(AuditSignal("Address (NAP)", 10, 10, "good",
            f"Address: {address}",
            "Make sure this address matches exactly on your website and all directories."))
    else:
        signals.append(AuditSignal("Address (NAP)", 0, 10, "bad",
            "No address listed.",
            "Add a complete, accurate address to your Google Business Profile."))

    # ── 3. Phone number ───────────────────────────────────────────────────────
    phone = details.get("international_phone_number", "")
    if phone:
        signals.append(AuditSignal("Phone Number", 8, 8, "good",
            f"Phone: {phone}",
            "Keep this number consistent across all directories (Yelp, Facebook, etc.)."))
    else:
        signals.append(AuditSignal("Phone Number", 0, 8, "bad",
            "No phone number listed.",
            "Add a local phone number — it's a critical NAP signal for local SEO."))

    # ── 4. Website ────────────────────────────────────────────────────────────
    website = details.get("website", "")
    if website:
        signals.append(AuditSignal("Website Link", 10, 10, "good",
            f"Website: {website}",
            "Ensure your website has a local landing page matching this listing's city/area."))
    else:
        signals.append(AuditSignal("Website Link", 0, 10, "bad",
            "No website linked.",
            "Link your website — it drives traffic and signals legitimacy to Google."))

    # ── 5. Categories ─────────────────────────────────────────────────────────
    types = [t for t in details.get("types", []) if t not in ("point_of_interest", "establishment")]
    if types:
        cat_score = 8 if len(types) >= 2 else 5
        cat_status = "good" if len(types) >= 2 else "warn"
        signals.append(AuditSignal("Business Categories", cat_score, 8, cat_status,
            f"Categories: {', '.join(types)}",
            "Make sure your primary category is the most specific fit. Add up to 9 secondary categories."))
    else:
        signals.append(AuditSignal("Business Categories", 2, 8, "warn",
            "Only generic categories detected.",
            "Set a specific primary category in Google Business Profile (e.g. 'Italian Restaurant' not just 'Restaurant')."))

    # ── 6. Business hours ─────────────────────────────────────────────────────
    hours = details.get("opening_hours", {})
    if hours and hours.get("periods"):
        signals.append(AuditSignal("Business Hours", 10, 10, "good",
            f"Hours set ({len(hours['periods'])} period(s) / week).",
            "Keep hours updated during holidays — Google flags mismatches and it hurts ranking."))
    elif hours:
        signals.append(AuditSignal("Business Hours", 5, 10, "warn",
            "Partial hours data found.",
            "Fill in complete weekly hours including weekend schedules."))
    else:
        signals.append(AuditSignal("Business Hours", 0, 10, "bad",
            "No hours listed.",
            "Add business hours — 'Hours not listed' pushes customers to competitors."))

    # ── 7. Rating ─────────────────────────────────────────────────────────────
    rating: Optional[float] = details.get("rating")
    if rating is not None:
        signals.append(AuditSignal("Rating Exists", 5, 5, "good",
            f"Rating: {rating} ★",
            "Respond to every review — both positive and negative — to boost engagement signals."))
    else:
        signals.append(AuditSignal("Rating Exists", 0, 5, "bad",
            "No reviews / rating yet.",
            "Start a review acquisition campaign — ask happy customers to leave a Google review."))

    # ── 8. Review count ───────────────────────────────────────────────────────
    review_count: int = details.get("user_ratings_total", 0)
    rev_score = _tier(review_count, [(100, 15), (25, 12), (5, 7), (1, 2)])
    rev_status = "good" if rev_score >= 12 else ("warn" if rev_score >= 7 else "bad")
    signals.append(AuditSignal("Review Volume", rev_score, 15, rev_status,
        f"{review_count} total reviews.",
        "Target 100+ reviews. Automate review requests via post-purchase email/SMS. "
        "Never incentivise reviews — it violates Google policy."))

    # ── 9. Average rating quality ─────────────────────────────────────────────
    if rating is not None:
        qual_score = _tier(int(rating * 10), [(45, 8), (40, 6), (35, 4), (0, 2)])
        qual_status = "good" if qual_score >= 6 else ("warn" if qual_score >= 4 else "bad")
        signals.append(AuditSignal("Rating Quality", qual_score, 8, qual_status,
            f"Average rating: {rating} / 5.0",
            "Respond to negative reviews professionally & resolve issues offline. "
            "A consistent stream of new 5-star reviews will raise your average over time."))
    else:
        signals.append(AuditSignal("Rating Quality", 0, 8, "bad",
            "No rating to assess.",
            "Build your review base — your first 10 reviews have the biggest impact."))

    # ── 10. Photos ────────────────────────────────────────────────────────────
    photos = details.get("photos", [])
    photo_count = len(photos)
    photo_score = _tier(photo_count, [(20, 10), (5, 7), (1, 4)])
    photo_status = "good" if photo_score >= 7 else ("warn" if photo_score >= 4 else "bad")
    signals.append(AuditSignal("Photos", photo_score, 10, photo_status,
        f"{photo_count} photo(s) found.",
        "Aim for 20+ photos: exterior, interior, team, products/menu. "
        "Google favours listings with regular fresh photo uploads."))

    # ── 11. Description / editorial summary ──────────────────────────────────
    summary = details.get("editorial_summary", {}).get("overview", "")
    if summary:
        signals.append(AuditSignal("Business Description", 7, 7, "good",
            f"Description present ({len(summary)} chars).",
            "Include your primary keyword + city in the first sentence of your description."))
    else:
        signals.append(AuditSignal("Business Description", 0, 7, "bad",
            "No business description found.",
            "Write a 750-char description with your main service keyword + city naturally woven in."))

    # ── 12. Business status ───────────────────────────────────────────────────
    status = details.get("business_status", "")
    if status == "OPERATIONAL":
        signals.append(AuditSignal("Listing Status", 4, 4, "good",
            "Listing is marked OPERATIONAL.",
            "If you've moved or closed temporarily, update immediately to avoid ranking penalty."))
    elif status == "CLOSED_TEMPORARILY":
        signals.append(AuditSignal("Listing Status", 2, 4, "warn",
            "Listing is TEMPORARILY CLOSED.",
            "If you're open again, update your status in Google Business Profile ASAP."))
    else:
        signals.append(AuditSignal("Listing Status", 0, 4, "bad",
            f"Status: {status or 'unknown'}.",
            "Verify and claim your listing so you control the status and details."))

    total_score = sum(s.score for s in signals)
    return AuditResult(
        business_name=name or place_data.get("search_name", "Unknown"),
        place_id=place_data.get("place_id", ""),
        google_maps_url=details.get("url", ""),
        overall_score=total_score,
        grade=_grade(total_score),
        signals=signals,
        raw=details,
    )
