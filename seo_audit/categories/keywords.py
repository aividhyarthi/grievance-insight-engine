"""
keywords.py — Keyword Research / Usage checks.
Covers: primary keyword in title/H1/meta, keyword density, keyword in URL,
        H2 keyword coverage, top keyword visibility in findings,
        semantic diversity, LSI depth, secondary keyword in meta.

Keyword extraction approach:
  Uses HEADING-WEIGHTED scoring, not raw body word frequency.
  H1 words: 10x weight | H2: 5x | H3: 3x | body <p>/<li>/<td>: 1x
  Nav/header/footer/aside text is EXCLUDED to avoid menu items and
  repeated footer copy polluting the keyword analysis.
  This ensures the detected primary keyword reflects the page's actual
  topic signal (what the author intended in H1) rather than whatever
  word happens to appear most in boilerplate.
"""

from __future__ import annotations

import re
from collections import Counter

from .base import CategoryReport, Finding, Severity
from ..crawler import PageData


_STOP_WORDS = {
    # Articles, conjunctions, prepositions, pronouns, auxiliary verbs
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "by","from","is","was","are","were","be","been","being","have","has",
    "had","do","does","did","will","would","could","should","may","might",
    "this","that","these","those","it","its","we","our","you","your",
    "they","their","he","she","his","her","as","if","so","not","no","up",
    "also","just","very","can","get","got","use","used","make","made",
    "about","more","than","then","when","what","which","who","how","all",
    # Generic UI / marketing words that pollute keyword analysis
    "home","menu","page","site","web","click","here","learn","read","view",
    "contact","help","support","login","sign","search","back","next","prev",
    "new","free","best","top","great","good","need","want","now","today",
    "see","let","find","know","well","www","http","https","com","org","net",
    "privacy","terms","cookie","copyright","rights","reserved","policy",
    "follow","share","like","tweet","post","send","submit","subscribe",
    # Generic nouns that appear in any article and don't identify the topic
    "people","person","someone","anyone","everyone",
    "something","anything","everything","nothing",
    "way","ways","thing","things","place","places",
    "world","city","cities","town","towns","area","areas","country","countries",
    "time","times","year","years","day","days","week","weeks","month","months",
    "part","parts","point","points","group","groups","life","lives","work",
    "fact","facts","reason","reasons","case","cases","result","results",
    "issue","issues","problem","problems","change","changes","example","examples",
    "number","numbers","system","systems","type","types","kind","kinds",
    "means","end","ends","level","levels","sense","means",
    "study","studies","report","reports","data","information","info",
    "says","said","say","seem","seems","seemed","came","goes","went",
    # Generic comparative / descriptive adjectives
    "better","worse","whether","many","much","such","same","other","another",
    "real","long","short","high","low","large","small","big","little",
    "old","young","early","late","first","second","third","last","next",
    "different","important","possible","likely","similar","various","certain",
    "major","minor","main","key","general","specific","common","popular",
    "recent","current","local","global","national","social","political",
    # Generic verbs beyond make/made already above
    "makes","taking","take","taken","comes","coming","gives","giving","given",
    "going","look","looks","looked","move","moves","moving","moved",
    "keep","keeps","kept","turn","turns","turning","turned",
    "become","becomes","becoming","became","include","includes","including","included",
    "show","shows","showing","shown","found","finding","think","thinking","thought",
    "call","calls","called","seem","put","puts","putting","mean","means","meant",
    "feel","feels","felt","leave","leaves","leaving","left",
    "try","tries","tried","trying","help","helps","helping","helped",
    "start","starts","started","starting","end","ended","ending",
    # Common adverbs
    "really","actually","simply","still","even","already","often","always","never",
    "usually","sometimes","perhaps","maybe","probably","certainly","especially",
    "particularly","generally","largely","mostly","nearly","quite","rather",
    "however","therefore","although","though","while","since","because","despite",
    "between","through","without","within","across","around","along","against",
}


def _extract_keywords_weighted(soup, top_n: int = 20) -> list[tuple[str, int]]:
    """
    Extract keywords using heading-weighted scoring.
    H1 = 10x, H2 = 5x, H3 = 3x, body content tags = 1x.
    Excludes nav / header / footer / aside / script / style elements.
    """
    counter: Counter = Counter()
    excluded_parents = ("nav", "header", "footer", "aside", "script", "style")

    def _in_excluded(tag) -> bool:
        return bool(tag.find_parent(excluded_parents))

    def _add_words(tag, weight: int) -> None:
        if _in_excluded(tag):
            return
        for w in re.findall(r"[a-z]{3,}", tag.get_text(separator=" ").lower()):
            if w not in _STOP_WORDS:
                counter[w] += weight

    soup_root = soup.find("body") or soup

    for h1 in soup_root.find_all("h1"):
        _add_words(h1, 10)
    for h2 in soup_root.find_all("h2"):
        _add_words(h2, 5)
    for h3 in soup_root.find_all("h3"):
        _add_words(h3, 3)
    for tag in soup_root.find_all(["p", "li", "td", "th", "blockquote", "figcaption"]):
        _add_words(tag, 1)

    return counter.most_common(top_n)


def _content_text_clean(soup) -> str:
    """
    Visible text from p/li/td tags only (excluding nav/header/footer/aside).
    Used for density calculations — must match the domain of _extract_keywords_weighted.
    """
    parts = []
    excluded_parents = ("nav", "header", "footer", "aside", "script", "style")
    root = soup.find("body") or soup
    for tag in root.find_all(["p", "li", "td", "th", "h1", "h2", "h3", "h4", "blockquote"]):
        if not tag.find_parent(excluded_parents):
            parts.append(tag.get_text(separator=" ", strip=True))
    return " ".join(parts)


def _density(word: str, text: str) -> float:
    total = len(text.split())
    if total == 0:
        return 0.0
    count = len(re.findall(rf"\b{re.escape(word)}\b", text, re.I))
    return round(count / total * 100, 2)


def run(page: PageData) -> CategoryReport:
    report = CategoryReport(
        name="Keyword Research & Usage",
        description=(
            "Keyword presence, density, semantic coverage, and H2-level topical signals. "
            "Keywords are detected using heading-weighted scoring — H1 words dominate so the "
            "primary keyword reflects the page's intended topic, not boilerplate repetition."
        ),
    )
    f = report.findings

    # Use content-only text for analysis (excludes nav/footer)
    content_text = _content_text_clean(page.soup)

    if not content_text.strip():
        # Fall back to full body if structured tags are empty
        body = page.soup.find("body")
        content_text = body.get_text(separator=" ", strip=True) if body else ""

    if not content_text.strip():
        f.append(Finding("Keywords", "Keyword analysis", Severity.CRITICAL,
            "No analysable content found.",
            impact="High", effort="Medium"))
        return report

    # ── Weighted keyword extraction ────────────────────────────────────────────
    top_kw = _extract_keywords_weighted(page.soup)

    if not top_kw:
        f.append(Finding("Keywords", "Keyword extraction", Severity.WARNING,
            "Could not extract meaningful keywords from page content.",
            impact="High", effort="Medium"))
        return report

    top_display = ", ".join(f"{w} ({c} pts)" for w, c in top_kw[:8])
    f.append(Finding("Keywords", "Detected top keywords", Severity.INFO,
        f"Top keywords by heading-weighted score: {top_display}.\n"
        "H1 words score 10×, H2 5×, H3 3×, body text 1× — "
        "so the primary keyword reflects what your headings emphasise, "
        "not navigation or footer repetition.\n"
        "If these don't match your intended topic: check that your H1 contains "
        "the target keyword, and verify nav/footer text isn't dominating the page.",
        impact="High", effort="Medium"))

    primary_kw, _primary_score = top_kw[0]
    secondary_kw = top_kw[1][0] if len(top_kw) > 1 else None

    report.notes = "Top keywords: " + ", ".join(f"{w}({c})" for w, c in top_kw[:10])

    # ── Primary keyword in title ──────────────────────────────────────────────
    title = page.title.lower()
    if primary_kw in title:
        title_words = title.split()
        pos = next((i for i, w in enumerate(title_words) if primary_kw in w), len(title_words))
        pos_note = " (near start — strong signal)" if pos < 3 else " (towards end — consider moving earlier)"
        f.append(Finding("Keywords", "Primary keyword in title", Severity.PASS,
            f"'{primary_kw}' present in title{pos_note}."))
    else:
        f.append(Finding("Keywords", "Primary keyword in title", Severity.CRITICAL,
            f"Primary keyword '{primary_kw}' not found in title tag.",
            "Include the primary keyword within the first 3 words of the title for maximum signal.",
            impact="High", effort="Quick Win"))

    # ── Primary keyword in H1 ─────────────────────────────────────────────────
    h1_text = " ".join(page.h1_tags).lower()
    if primary_kw in h1_text:
        f.append(Finding("Keywords", "Primary keyword in H1", Severity.PASS,
            f"'{primary_kw}' found in H1."))
    else:
        f.append(Finding("Keywords", "Primary keyword in H1", Severity.WARNING,
            f"'{primary_kw}' not in H1.",
            "Include primary keyword in H1 — it's the strongest on-page relevance signal after title.",
            impact="High", effort="Quick Win"))

    # ── Primary keyword in meta description ──────────────────────────────────
    meta = page.meta_description.lower()
    if primary_kw in meta:
        f.append(Finding("Keywords", "Keyword in meta description", Severity.PASS,
            f"'{primary_kw}' in meta description — Google may bold it for matched queries."))
    else:
        f.append(Finding("Keywords", "Keyword in meta description", Severity.INFO,
            f"'{primary_kw}' absent from meta description.",
            "Naturally include the primary keyword — Google may bold it in SERPs for matched searches.",
            impact="Medium", effort="Quick Win"))

    # ── Secondary keyword in meta description ────────────────────────────────
    if secondary_kw and secondary_kw not in meta and primary_kw in meta:
        f.append(Finding("Keywords", "Secondary keyword in meta description", Severity.INFO,
            f"Secondary keyword '{secondary_kw}' not in meta description.",
            "Including a secondary keyword widens the query surface with no extra effort.",
            impact="Low", effort="Quick Win"))

    # ── Keyword density — calculated against clean content text only ──────────
    density = _density(primary_kw, content_text)
    if density < 0.5:
        f.append(Finding("Keywords", "Keyword density", Severity.WARNING,
            f"'{primary_kw}' density: {density}% in body content (below 0.5%). "
            "Under-optimised — Google may not strongly associate this page with the term.",
            "Increase natural usage; include it in headings, intro paragraph, and conclusion.",
            impact="Medium", effort="Medium"))
    elif density > 3.0:
        f.append(Finding("Keywords", "Keyword density", Severity.WARNING,
            f"'{primary_kw}' density: {density}% — possible keyword stuffing. "
            "Over-repetition can trigger quality filters.",
            "Reduce repetition; replace some instances with synonyms and related terms.",
            impact="Medium", effort="Medium"))
    else:
        f.append(Finding("Keywords", "Keyword density", Severity.PASS,
            f"'{primary_kw}' density: {density}% — within the healthy 0.5–3% range."))

    # ── Keyword in URL ────────────────────────────────────────────────────────
    url_lower = page.url.lower()
    kw_slug = primary_kw.replace(" ", "-")
    if primary_kw in url_lower or kw_slug in url_lower:
        f.append(Finding("Keywords", "Keyword in URL", Severity.PASS,
            f"'{primary_kw}' present in URL slug."))
    else:
        alt_in_url = [kw for kw, _ in top_kw[1:4] if kw in url_lower]
        if alt_in_url:
            f.append(Finding("Keywords", "Keyword in URL", Severity.INFO,
                f"Primary keyword '{primary_kw}' not in URL, but '{alt_in_url[0]}' is.",
                "Ideally the URL slug matches the primary keyword exactly — consider for new pages.",
                impact="Low", effort="Long-term"))
        else:
            f.append(Finding("Keywords", "Keyword in URL", Severity.INFO,
                "No top keyword found in URL slug.",
                "Include the primary keyword in the URL path.",
                impact="Medium", effort="Long-term"))

    # ── H2 keyword coverage ────────────────────────────────────────────────────
    h2_text = " ".join(page.h2_tags).lower()
    top5_kws = [kw for kw, _ in top_kw[:5]]
    kws_in_h2 = [kw for kw in top5_kws if kw in h2_text]

    if not h2_text:
        f.append(Finding("Keywords", "H2 keyword coverage", Severity.WARNING,
            "No H2 tags found — missing topical signal across page sections.",
            "Add H2 subheadings that incorporate secondary keywords and related terms.",
            impact="Medium", effort="Quick Win"))
    elif not kws_in_h2:
        f.append(Finding("Keywords", "H2 keyword coverage", Severity.WARNING,
            f"None of the top 5 keywords ({', '.join(top5_kws)}) appear in any H2 heading.",
            "Include key topical terms in H2 headings — they signal section topics to Google.",
            impact="Medium", effort="Quick Win"))
    else:
        f.append(Finding("Keywords", "H2 keyword coverage", Severity.PASS,
            f"H2 headings contain: {', '.join(kws_in_h2)} — good topical signal across sections."))

    # ── Keyword in first 100 words of content ────────────────────────────────
    first_100 = " ".join(content_text.split()[:100]).lower()
    if primary_kw in first_100:
        f.append(Finding("Keywords", "Keyword in opening content", Severity.PASS,
            f"'{primary_kw}' appears in the first 100 content words."))
    else:
        f.append(Finding("Keywords", "Keyword in opening content", Severity.INFO,
            f"'{primary_kw}' not in first 100 content words.",
            "Front-load the primary keyword near the top of the body.",
            impact="Medium", effort="Quick Win"))

    # ── Semantic / LSI keyword diversity ─────────────────────────────────────
    vocab_size = len(set(re.findall(r"[a-z]{4,}", content_text.lower())))
    word_count = len(content_text.split())
    vocab_threshold = 80 + max(0, (word_count - 400) // 50)
    if vocab_size < vocab_threshold:
        f.append(Finding("Keywords", "Semantic keyword diversity", Severity.WARNING,
            f"Limited vocabulary ({vocab_size} unique meaningful words in content). "
            "Topical authority depends on covering the full semantic field of a topic.",
            "Expand content with LSI/related terms — use Google's 'People Also Ask' "
            "and Answer The Public to find related concepts.",
            impact="Medium", effort="Long-term"))
    else:
        f.append(Finding("Keywords", "Semantic keyword diversity", Severity.PASS,
            f"Good vocabulary depth ({vocab_size} unique meaningful words)."))

    return report
