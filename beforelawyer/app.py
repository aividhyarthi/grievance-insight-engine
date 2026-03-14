"""BeforeLawyer — Legal Case Research Library — Flask Application."""

import os
from datetime import date, datetime
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from beforelawyer.models import db, LegalCase, LegalGlossary, CaseBriefTemplate
from sqlalchemy import or_, func, extract


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)

    db_url = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(data_dir, 'beforelawyer.db')}",
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        # Seed if empty
        if LegalCase.query.count() == 0:
            from beforelawyer.seed_data import seed_database
            seed_database(db)

    # ── Pages ──────────────────────────────────────────────────────

    @app.route("/")
    def index():
        today = date.today()
        return render_template("index.html", today=today)

    @app.route("/search")
    def search_page():
        return render_template("search.html")

    @app.route("/case/<int:case_id>")
    def case_detail(case_id):
        case = LegalCase.query.get_or_404(case_id)
        return render_template("case_detail.html", case=case)

    @app.route("/analytics")
    def analytics():
        return render_template("analytics.html")

    @app.route("/toolkit")
    def toolkit():
        return render_template("toolkit.html")

    @app.route("/glossary")
    def glossary_page():
        return render_template("glossary.html")

    @app.route("/judges")
    def judges_page():
        return render_template("judges.html")

    @app.route("/resources")
    def resources_page():
        return render_template("resources.html")

    @app.route("/proceedings")
    def proceedings_page():
        return render_template("proceedings.html")

    @app.route("/holidays")
    def holidays_page():
        return render_template("holidays.html")

    # ── API: Search Suggestions ─────────────────────────────────

    @app.route("/api/suggestions")
    def api_suggestions():
        q = request.args.get("q", "").strip()
        if len(q) < 2:
            return jsonify([])
        suggestions = []
        # Case name matches
        cases = LegalCase.query.filter(
            LegalCase.case_name.ilike(f"%{q}%")
        ).order_by(LegalCase.year.desc()).limit(5).all()
        for c in cases:
            suggestions.append({
                "type": "case",
                "text": c.case_name,
                "sub": f"{c.court_level.capitalize()} Court · {c.year} · {c.case_type}",
                "url": f"/case/{c.id}",
            })
        # Glossary term matches
        terms = LegalGlossary.query.filter(
            LegalGlossary.term.ilike(f"%{q}%")
        ).order_by(func.lower(LegalGlossary.term)).limit(3).all()
        for t in terms:
            suggestions.append({
                "type": "glossary",
                "text": t.term,
                "sub": t.category,
                "url": f"/glossary?q={t.term}",
            })
        # Keyword search fallback — match by tags, statutes, judges
        if len(suggestions) < 3:
            extras = LegalCase.query.filter(or_(
                LegalCase.tags.ilike(f"%{q}%"),
                LegalCase.statutes_referenced.ilike(f"%{q}%"),
                LegalCase.judges.ilike(f"%{q}%"),
            )).limit(3).all()
            for c in extras:
                if not any(s["url"] == f"/case/{c.id}" for s in suggestions):
                    suggestions.append({
                        "type": "case",
                        "text": c.case_name,
                        "sub": f"{c.court_level.capitalize()} Court · {c.year}",
                        "url": f"/case/{c.id}",
                    })
        return jsonify(suggestions[:8])

    # ── API: Search & Filter ──────────────────────────────────────

    @app.route("/api/cases")
    def api_cases():
        query = LegalCase.query

        # Text search — covers case name, lawyers, judges, case number, and all content
        q = request.args.get("q", "").strip()
        if q:
            search_filter = or_(
                LegalCase.case_name.ilike(f"%{q}%"),
                LegalCase.case_number.ilike(f"%{q}%"),
                LegalCase.judges.ilike(f"%{q}%"),
                LegalCase.advocate_petitioner.ilike(f"%{q}%"),
                LegalCase.advocate_respondent.ilike(f"%{q}%"),
                LegalCase.petitioner.ilike(f"%{q}%"),
                LegalCase.respondent.ilike(f"%{q}%"),
                LegalCase.summary.ilike(f"%{q}%"),
                LegalCase.legal_reasoning.ilike(f"%{q}%"),
                LegalCase.judge_observations.ilike(f"%{q}%"),
                LegalCase.key_principles.ilike(f"%{q}%"),
                LegalCase.tags.ilike(f"%{q}%"),
                LegalCase.statutes_referenced.ilike(f"%{q}%"),
                LegalCase.facts.ilike(f"%{q}%"),
                LegalCase.issues.ilike(f"%{q}%"),
                LegalCase.arguments_petitioner.ilike(f"%{q}%"),
                LegalCase.arguments_respondent.ilike(f"%{q}%"),
                LegalCase.dissenting_opinion.ilike(f"%{q}%"),
            )
            query = query.filter(search_filter)

        # Filters
        case_type = request.args.get("case_type")
        if case_type:
            query = query.filter(LegalCase.case_type == case_type)

        court_level = request.args.get("court_level")
        if court_level:
            query = query.filter(LegalCase.court_level == court_level)

        year_from = request.args.get("year_from", type=int)
        if year_from:
            query = query.filter(LegalCase.year >= year_from)

        year_to = request.args.get("year_to", type=int)
        if year_to:
            query = query.filter(LegalCase.year <= year_to)

        outcome = request.args.get("outcome")
        if outcome:
            query = query.filter(LegalCase.outcome == outcome)

        jurisdiction = request.args.get("jurisdiction")
        if jurisdiction:
            query = query.filter(LegalCase.jurisdiction.ilike(f"%{jurisdiction}%"))

        # Sort
        sort = request.args.get("sort", "year_desc")
        if sort == "year_asc":
            query = query.order_by(LegalCase.year.asc())
        elif sort == "name":
            query = query.order_by(LegalCase.case_name.asc())
        else:
            query = query.order_by(LegalCase.year.desc())

        cases = query.all()
        return jsonify([c.to_dict() for c in cases])

    @app.route("/api/cases/<int:case_id>")
    def api_case_detail(case_id):
        case = LegalCase.query.get_or_404(case_id)
        return jsonify(case.to_dict())

    @app.route("/api/cases/<int:case_id>/similar")
    def api_similar_cases(case_id):
        """Find similar cases based on case type, tags, and statutes."""
        case = LegalCase.query.get_or_404(case_id)
        tags = case.tags.split(",") if case.tags else []

        similar_query = LegalCase.query.filter(LegalCase.id != case_id)
        filters = [LegalCase.case_type == case.case_type]
        for tag in tags[:3]:
            filters.append(LegalCase.tags.ilike(f"%{tag.strip()}%"))

        similar = similar_query.filter(or_(*filters)).limit(5).all()
        return jsonify([c.to_dict() for c in similar])

    # ── API: Analytics ────────────────────────────────────────────

    @app.route("/api/analytics/by-type")
    def analytics_by_type():
        results = db.session.query(
            LegalCase.case_type, func.count(LegalCase.id)
        ).group_by(LegalCase.case_type).all()
        return jsonify([{"type": r[0], "count": r[1]} for r in results])

    @app.route("/api/analytics/by-court")
    def analytics_by_court():
        results = db.session.query(
            LegalCase.court_level, func.count(LegalCase.id)
        ).group_by(LegalCase.court_level).all()
        return jsonify([{"court": r[0], "count": r[1]} for r in results])

    @app.route("/api/analytics/by-outcome")
    def analytics_by_outcome():
        results = db.session.query(
            LegalCase.outcome, func.count(LegalCase.id)
        ).group_by(LegalCase.outcome).all()
        return jsonify([{"outcome": r[0], "count": r[1]} for r in results])

    @app.route("/api/analytics/by-year")
    def analytics_by_year():
        results = db.session.query(
            LegalCase.year, func.count(LegalCase.id)
        ).group_by(LegalCase.year).order_by(LegalCase.year).all()
        return jsonify([{"year": r[0], "count": r[1]} for r in results])

    @app.route("/api/analytics/by-jurisdiction")
    def analytics_by_jurisdiction():
        results = db.session.query(
            LegalCase.jurisdiction, func.count(LegalCase.id)
        ).group_by(LegalCase.jurisdiction).all()
        return jsonify([{"jurisdiction": r[0], "count": r[1]} for r in results])

    # ── API: Filters metadata ─────────────────────────────────────

    @app.route("/api/filters")
    def api_filters():
        case_types = [r[0] for r in db.session.query(LegalCase.case_type).distinct().order_by(LegalCase.case_type).all()]
        court_levels = [r[0] for r in db.session.query(LegalCase.court_level).distinct().order_by(LegalCase.court_level).all()]
        jurisdictions = [r[0] for r in db.session.query(LegalCase.jurisdiction).distinct().order_by(LegalCase.jurisdiction).all()]
        year_range = db.session.query(func.min(LegalCase.year), func.max(LegalCase.year)).first()
        return jsonify({
            "case_types": case_types,
            "court_levels": court_levels,
            "jurisdictions": jurisdictions,
            "year_min": year_range[0],
            "year_max": year_range[1],
        })

    # ── API: Glossary ─────────────────────────────────────────────

    @app.route("/api/glossary")
    def api_glossary():
        q = request.args.get("q", "").strip()
        category = request.args.get("category")
        query = LegalGlossary.query

        if q:
            query = query.filter(or_(
                LegalGlossary.term.ilike(f"%{q}%"),
                LegalGlossary.definition.ilike(f"%{q}%"),
            ))
        if category:
            query = query.filter(LegalGlossary.category == category)

        terms = query.order_by(func.lower(LegalGlossary.term)).all()
        return jsonify([{
            "id": t.id,
            "term": t.term,
            "definition": t.definition,
            "category": t.category,
            "example_usage": t.example_usage,
            "related_terms": t.related_terms,
        } for t in terms])

    # ── API: Templates ────────────────────────────────────────────

    @app.route("/api/templates")
    def api_templates():
        case_type = request.args.get("case_type")
        query = CaseBriefTemplate.query
        if case_type:
            query = query.filter(CaseBriefTemplate.case_type == case_type)
        templates = query.all()
        return jsonify([{
            "id": t.id,
            "name": t.name,
            "case_type": t.case_type,
            "description": t.description,
            "template_content": t.template_content,
            "tips": t.tips,
        } for t in templates])

    # ── API: Scraper (fetch from gov open data) ────────────────────

    @app.route("/api/scrape", methods=["POST"])
    def api_scrape():
        """Trigger scraping of Indian Supreme Court judgments from gov open data.
        Source: eCourts (ecourts.gov.in) mirror on AWS Open Data Registry.
        """
        from beforelawyer.scraper import scrape_and_store
        data = request.get_json() or {}
        years = data.get("years", list(range(2020, 2026)))
        max_per_year = data.get("max_per_year", 20)
        try:
            added = scrape_and_store(db, years=years, max_per_year=max_per_year)
            return jsonify({"status": "success", "cases_added": added})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500

    @app.route("/api/stats")
    def api_stats():
        """Return overall library statistics."""
        total = LegalCase.query.count()
        indian = LegalCase.query.filter(LegalCase.jurisdiction == "India").count()
        types = db.session.query(LegalCase.case_type).distinct().count()
        courts = db.session.query(LegalCase.court).distinct().count()
        return jsonify({
            "total_cases": total,
            "indian_cases": indian,
            "case_types": types,
            "courts": courts,
        })

    # ── API: Homepage Dashboard ──────────────────────────────────

    @app.route("/api/homepage/on-this-day")
    def api_on_this_day():
        """Cases decided on this day (month+day) in history."""
        today = date.today()
        cases = LegalCase.query.filter(
            extract("month", LegalCase.date_decided) == today.month,
            extract("day", LegalCase.date_decided) == today.day,
        ).order_by(LegalCase.year.desc()).all()

        # If no exact match, widen to ±3 days in the same month
        if not cases:
            day_lo = max(1, today.day - 3)
            day_hi = min(31, today.day + 3)
            cases = LegalCase.query.filter(
                extract("month", LegalCase.date_decided) == today.month,
                extract("day", LegalCase.date_decided).between(day_lo, day_hi),
            ).order_by(LegalCase.year.desc()).limit(5).all()

        return jsonify([c.to_dict() for c in cases])

    @app.route("/api/homepage/important-cases")
    def api_important_cases():
        """Highlight important / landmark cases — rotate based on day-of-year."""
        today = date.today()
        day_of_year = today.timetuple().tm_yday
        all_ids = [r[0] for r in db.session.query(LegalCase.id).all()]
        if not all_ids:
            return jsonify([])
        # Pick 4 cases, rotating daily
        selected = []
        n = len(all_ids)
        for i in range(4):
            idx = (day_of_year + i * 7) % n
            selected.append(all_ids[idx])
        cases = LegalCase.query.filter(LegalCase.id.in_(selected)).all()
        return jsonify([c.to_dict() for c in cases])

    @app.route("/api/homepage/court-stats")
    def api_court_stats():
        """Return live-style court statistics for the dashboard."""
        total = LegalCase.query.count()
        sc_cases = LegalCase.query.filter(LegalCase.court_level == "supreme").count()
        hc_cases = LegalCase.query.filter(LegalCase.court_level == "high").count()
        indian = LegalCase.query.filter(LegalCase.jurisdiction == "India").count()
        constitutional = LegalCase.query.filter(LegalCase.case_type == "Constitutional").count()
        criminal = LegalCase.query.filter(LegalCase.case_type == "Criminal").count()
        civil = LegalCase.query.filter(LegalCase.case_type == "Civil").count()
        types_count = db.session.query(LegalCase.case_type).distinct().count()
        latest = LegalCase.query.order_by(LegalCase.year.desc()).first()
        oldest = LegalCase.query.order_by(LegalCase.year.asc()).first()
        return jsonify({
            "total_cases": total,
            "supreme_court_cases": sc_cases,
            "high_court_cases": hc_cases,
            "indian_cases": indian,
            "constitutional_cases": constitutional,
            "criminal_cases": criminal,
            "civil_cases": civil,
            "case_types": types_count,
            "latest_year": latest.year if latest else None,
            "oldest_year": oldest.year if oldest else None,
        })

    @app.route("/api/homepage/legal-news")
    def api_legal_news():
        """Curated legal news / updates with clickable links to official sources."""
        news = [
            {
                "title": "BNS, BNSS & BSA now fully replace IPC, CrPC & Evidence Act",
                "summary": "Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, and Bharatiya Sakshya Adhiniyam are in full effect from 1 July 2024.",
                "category": "Legislation",
                "date": "01 Jul 2024",
                "url": "https://www.indiacode.nic.in/",
            },
            {
                "title": "SC upholds sub-classification within SC/ST reservations",
                "summary": "A 7-judge Constitution Bench ruled that States can sub-classify Scheduled Castes and Tribes for reservation purposes.",
                "category": "Supreme Court",
                "date": "01 Aug 2024",
                "url": "https://www.sci.gov.in/",
            },
            {
                "title": "Digital Personal Data Protection Rules notified",
                "summary": "The DPDP Act 2023 rules are notified, operationalizing India's data protection framework with consent manager and Data Protection Board provisions.",
                "category": "Legislation",
                "date": "03 Jan 2026",
                "url": "https://www.meity.gov.in/",
            },
            {
                "title": "NJDG: Over 4.5 crore cases pending across India",
                "summary": "National Judicial Data Grid shows 4.5+ crore cases pending. District courts account for 87% of the backlog. SC urges fast-tracking old cases.",
                "category": "Court Data",
                "url": "https://njdg.ecourts.gov.in/njdgnew/",
                "date": "2026",
            },
            {
                "title": "e-Courts Phase III: AI tools & live-streaming of court proceedings",
                "summary": "Supreme Court extends live-streaming to Constitution Bench hearings. E-filing and virtual hearings now standard across all High Courts.",
                "category": "Digital Courts",
                "url": "https://ecourts.gov.in/ecourts_home/",
                "date": "2026",
            },
            {
                "title": "Mediation Act 2023 comes into force",
                "summary": "India's first standalone mediation law provides a framework for institutional mediation, enforceability of mediated settlements, and establishment of the Mediation Council.",
                "category": "Legislation",
                "date": "09 Oct 2023",
                "url": "https://www.indiacode.nic.in/",
            },
        ]
        return jsonify(news)

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
