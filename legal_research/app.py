"""Legal Case Research Library — Flask Application."""

import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from legal_research.models import db, LegalCase, LegalGlossary, CaseBriefTemplate
from sqlalchemy import or_, func


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)

    db_url = os.environ.get(
        "DATABASE_URL",
        f"sqlite:///{os.path.join(data_dir, 'legal_research.db')}",
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        # Seed if empty
        if LegalCase.query.count() == 0:
            from legal_research.seed_data import seed_database
            seed_database(db)

    # ── Pages ──────────────────────────────────────────────────────

    @app.route("/")
    def index():
        return render_template("index.html")

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

    # ── API: Search & Filter ──────────────────────────────────────

    @app.route("/api/cases")
    def api_cases():
        query = LegalCase.query

        # Text search
        q = request.args.get("q", "").strip()
        if q:
            search_filter = or_(
                LegalCase.case_name.ilike(f"%{q}%"),
                LegalCase.summary.ilike(f"%{q}%"),
                LegalCase.legal_reasoning.ilike(f"%{q}%"),
                LegalCase.key_principles.ilike(f"%{q}%"),
                LegalCase.tags.ilike(f"%{q}%"),
                LegalCase.statutes_referenced.ilike(f"%{q}%"),
                LegalCase.facts.ilike(f"%{q}%"),
                LegalCase.issues.ilike(f"%{q}%"),
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

        terms = query.order_by(LegalGlossary.term).all()
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
        from legal_research.scraper import scrape_and_store
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

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
