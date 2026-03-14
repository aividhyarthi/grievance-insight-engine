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

    @app.route("/api/homepage/new-laws")
    def api_new_laws():
        """Recent and upcoming legislation changes in India."""
        laws = [
            {
                "name": "Bharatiya Nyaya Sanhita (BNS), 2023",
                "replaces": "Indian Penal Code, 1860",
                "effective": "01 Jul 2024",
                "status": "In Force",
                "highlights": "358 sections replacing 511 IPC sections. New offences: mob lynching, organized crime, terrorism, hit-and-run. Gender-neutral approach to several offences. Community service as punishment for petty offences.",
                "url": "https://www.indiacode.nic.in/",
            },
            {
                "name": "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023",
                "replaces": "Code of Criminal Procedure, 1973",
                "effective": "01 Jul 2024",
                "status": "In Force",
                "highlights": "531 sections replacing 484 CrPC sections. Mandatory forensic investigation for offences with 7+ years punishment. Electronic FIR and e-summons. Mandatory videography of search & seizure. 90-day trial completion for summons cases.",
                "url": "https://www.indiacode.nic.in/",
            },
            {
                "name": "Bharatiya Sakshya Adhiniyam (BSA), 2023",
                "replaces": "Indian Evidence Act, 1872",
                "effective": "01 Jul 2024",
                "status": "In Force",
                "highlights": "170 sections replacing 167 sections. Electronic records treated at par with paper records. Enhanced provisions for digital evidence. Video conferencing for witness examination.",
                "url": "https://www.indiacode.nic.in/",
            },
            {
                "name": "Digital Personal Data Protection Act, 2023",
                "replaces": "IT Act provisions on data protection",
                "effective": "Rules notified Jan 2025",
                "status": "Partially In Force",
                "highlights": "Consent-based data processing. Data Principal rights: access, correction, erasure, nomination. Data Protection Board for grievance redressal. Penalties up to Rs 250 crore. Children's data needs verifiable parental consent.",
                "url": "https://www.meity.gov.in/",
            },
            {
                "name": "Mediation Act, 2023",
                "replaces": "No predecessor (new legislation)",
                "effective": "09 Oct 2023",
                "status": "In Force",
                "highlights": "India's first standalone mediation law. Pre-litigation mediation for civil & commercial disputes. Mediation Council of India established. Mediated settlement agreements are enforceable as court decrees.",
                "url": "https://www.indiacode.nic.in/",
            },
            {
                "name": "Telecommunications Act, 2023",
                "replaces": "Indian Telegraph Act, 1885 & Indian Wireless Telegraphy Act, 1933",
                "effective": "26 Jun 2024 (partial)",
                "status": "Partially In Force",
                "highlights": "Spectrum assignment through auction/administrative allocation. Right of way provisions for telecom infrastructure. Biometric verification for SIM cards. Regulatory sandbox provisions.",
                "url": "https://www.indiacode.nic.in/",
            },
            {
                "name": "Jan Vishwas (Amendment of Provisions) Act, 2023",
                "replaces": "Amendments to 42 Acts",
                "effective": "2024 (phased)",
                "status": "In Force",
                "highlights": "Decriminalizes 183 offences across 42 Acts. Converts criminal penalties to civil fines. Reduces compliance burden on businesses. Covers IT Act, Environment Act, Agriculture Acts, and more.",
                "url": "https://www.indiacode.nic.in/",
            },
        ]
        return jsonify(laws)

    @app.route("/api/homepage/upcoming-holidays")
    def api_upcoming_holidays():
        """Court holidays coming up in the next 30 days."""
        import calendar
        today = date.today()
        # SC holidays for 2026 with approximate dates
        sc_holidays = [
            {"name": "Republic Day", "date": "2026-01-26", "court": "SC & All HCs"},
            {"name": "Maha Shivaratri", "date": "2026-02-15", "court": "SC & All HCs"},
            {"name": "Holi Vacation", "date": "2026-03-02", "end_date": "2026-03-07", "court": "Supreme Court"},
            {"name": "Holi", "date": "2026-03-04", "court": "SC & All HCs"},
            {"name": "Id-ul-Fitr (Eid)", "date": "2026-03-21", "court": "SC & All HCs"},
            {"name": "Ram Navami", "date": "2026-03-27", "court": "SC & All HCs"},
            {"name": "Mahavir Jayanti", "date": "2026-03-31", "court": "SC & All HCs"},
            {"name": "Good Friday", "date": "2026-04-03", "court": "SC & All HCs"},
            {"name": "Dr. Ambedkar Jayanti", "date": "2026-04-14", "court": "All HCs"},
            {"name": "Buddha Purnima", "date": "2026-05-01", "court": "SC & All HCs"},
            {"name": "Id-ul-Zuha (Bakrid)", "date": "2026-05-27", "court": "SC & All HCs"},
            {"name": "Summer Vacation", "date": "2026-06-01", "end_date": "2026-07-12", "court": "Supreme Court"},
            {"name": "Muharram", "date": "2026-06-26", "court": "SC & All HCs"},
            {"name": "Independence Day", "date": "2026-08-15", "court": "SC & All HCs"},
            {"name": "Milad-un-Nabi", "date": "2026-08-26", "court": "SC & All HCs"},
            {"name": "Janmashtami", "date": "2026-09-04", "court": "SC & All HCs"},
            {"name": "Mahatma Gandhi Jayanti", "date": "2026-10-02", "court": "SC & All HCs"},
            {"name": "Dussehra", "date": "2026-10-20", "court": "SC & All HCs"},
            {"name": "Dussehra Vacation", "date": "2026-10-19", "end_date": "2026-10-24", "court": "Supreme Court"},
            {"name": "Diwali", "date": "2026-11-08", "court": "SC & All HCs"},
            {"name": "Diwali Vacation", "date": "2026-11-09", "end_date": "2026-11-14", "court": "Supreme Court"},
            {"name": "Guru Nanak Jayanti", "date": "2026-11-24", "court": "SC & All HCs"},
            {"name": "Christmas", "date": "2026-12-25", "court": "SC & All HCs"},
            {"name": "Winter Vacation", "date": "2026-12-25", "end_date": "2027-01-01", "court": "Supreme Court"},
        ]
        upcoming = []
        for h in sc_holidays:
            hdate = date.fromisoformat(h["date"])
            end = date.fromisoformat(h["end_date"]) if h.get("end_date") else hdate
            days_away = (hdate - today).days
            # Show holidays within next 45 days or ongoing vacations
            if -1 <= days_away <= 45 or (hdate <= today <= end):
                upcoming.append({
                    "name": h["name"],
                    "date": hdate.strftime("%d %b %Y"),
                    "end_date": end.strftime("%d %b %Y") if h.get("end_date") else None,
                    "court": h["court"],
                    "days_away": max(0, days_away),
                    "is_today": hdate == today or (hdate <= today <= end),
                    "is_vacation": h.get("end_date") is not None,
                    "day_name": hdate.strftime("%A"),
                })
        return jsonify(upcoming[:8])

    @app.route("/api/homepage/high-profile-hearings")
    def api_high_profile_hearings():
        """High-profile cases with upcoming hearings this month (curated)."""
        today = date.today()
        month_name = today.strftime("%B %Y")
        # Build hearings with links to related cases in our DB
        hearing_defs = [
            {
                "case": "DPDP Act Challenge — Internet Freedom Foundation v. Union of India",
                "court": "Supreme Court of India",
                "next_date": "Listed for hearing",
                "description": "Constitutional challenge to Digital Personal Data Protection Rules, 2025. Government exemptions and Data Protection Board independence under scrutiny.",
                "parties": "Internet Freedom Foundation vs Union of India",
                "category": "Constitutional",
                "significance": "Will shape digital privacy for 1.4 billion Indians",
                "search_query": "Digital Personal Data Protection",
                "related_search": "privacy",
            },
            {
                "case": "Delhi Excise Policy Case — Multiple Accused",
                "court": "Rouse Avenue District Court / Supreme Court",
                "next_date": "Regular hearings",
                "description": "CBI & ED cases against multiple politicians and businesspersons in the Delhi excise policy scam involving alleged irregularities worth thousands of crores.",
                "parties": "CBI/ED vs K. Kavitha, Arvind Kejriwal & Others",
                "category": "Criminal / PMLA",
                "significance": "Politically sensitive; tests PMLA bail jurisprudence",
                "search_query": "Sisodia",
                "related_search": "PMLA bail",
            },
            {
                "case": "Same-Sex Marriage Review — Supriyo Chakraborty v. Union of India",
                "court": "Supreme Court of India",
                "next_date": "Review pending",
                "description": "Review petitions against the 2023 judgment declining to legalize same-sex marriage. Petitioners seek recognition of civil unions and anti-discrimination protections.",
                "parties": "Supriyo Chakraborty & Others vs Union of India",
                "category": "Constitutional",
                "significance": "LGBTQ+ rights and equality under Article 14",
                "search_query": "Supriyo",
                "related_search": "Navtej",
            },
            {
                "case": "Places of Worship Act Challenge",
                "court": "Supreme Court of India",
                "next_date": "Listed for hearing",
                "description": "Challenge to the constitutionality of the Places of Worship (Special Provisions) Act, 1991 which freezes the religious character of places of worship as on 15 August 1947.",
                "parties": "Multiple petitioners vs Union of India",
                "category": "Constitutional",
                "significance": "Sensitive religious-secular balance issue",
                "search_query": "Places of Worship",
                "related_search": "Article 370",
            },
            {
                "case": "Adani-Hindenburg Investigation — Vishal Tiwari v. Union of India",
                "court": "Supreme Court of India",
                "next_date": "SEBI investigation status",
                "description": "SC-monitored SEBI investigation into Hindenburg Research allegations against Adani Group. Expert committee report under consideration.",
                "parties": "Vishal Tiwari & Others vs Union of India",
                "category": "Securities / Corporate",
                "significance": "India's biggest corporate governance controversy",
                "search_query": "SEBI",
                "related_search": "Sahara",
            },
            {
                "case": "Chandigarh Mayoral Election — Irregularities",
                "court": "Supreme Court of India",
                "next_date": "Contempt proceedings",
                "description": "SC found ballot tampering by the presiding officer in Chandigarh mayoral election. Contempt proceedings and criminal investigation ongoing.",
                "parties": "Political parties vs Returning Officer",
                "category": "Election / Contempt",
                "significance": "Integrity of electoral process",
                "search_query": "election",
                "related_search": "Electoral Bond",
            },
        ]

        # Try to find matching cases in DB for direct links
        for h in hearing_defs:
            match = LegalCase.query.filter(
                LegalCase.case_name.ilike(f"%{h['search_query']}%")
            ).first()
            if match:
                h["case_id"] = match.id
                h["case_url"] = f"/case/{match.id}"
            else:
                h["case_url"] = f"/search?q={h['search_query']}"
            # Find related cases for "Read Related" link
            related = LegalCase.query.filter(
                or_(
                    LegalCase.case_name.ilike(f"%{h['related_search']}%"),
                    LegalCase.tags.ilike(f"%{h['related_search']}%"),
                )
            ).limit(3).all()
            h["related_cases"] = [{"id": c.id, "name": c.case_name, "year": c.year} for c in related]

        return jsonify({"month": month_name, "hearings": hearing_defs})

    @app.route("/api/homepage/celebrity-court")
    def api_celebrity_court():
        """Celebrities and notable personalities with court appearances."""
        celebrity_defs = [
            {
                "name": "Arvind Kejriwal",
                "role": "Former Chief Minister, Delhi",
                "case": "Delhi Excise Policy Case (PMLA & CBI)",
                "court": "Supreme Court / Rouse Avenue Court",
                "status": "On bail; regular hearings",
                "tag": "politician",
                "search_query": "excise policy",
            },
            {
                "name": "K. Kavitha",
                "role": "MLC & Daughter of former CM K. Chandrashekar Rao",
                "case": "Delhi Excise Policy Case (PMLA)",
                "court": "Supreme Court / Rouse Avenue Court",
                "status": "On bail; trial ongoing",
                "tag": "politician",
                "search_query": "PMLA bail",
            },
            {
                "name": "Manish Sisodia",
                "role": "Former Deputy CM, Delhi",
                "case": "Delhi Excise Policy Case (CBI & PMLA)",
                "court": "Rouse Avenue Court, Delhi",
                "status": "On bail (granted Aug 2024); trial ongoing",
                "tag": "politician",
                "search_query": "Sisodia",
            },
            {
                "name": "Brij Bhushan Sharan Singh",
                "role": "Former WFI President & MP",
                "case": "Sexual Harassment of Women Wrestlers",
                "court": "Rouse Avenue Court, Delhi",
                "status": "Trial ongoing; charges framed",
                "tag": "sports",
                "search_query": "Vishaka sexual harassment",
            },
            {
                "name": "Amanatullah Khan",
                "role": "AAP MLA, Okhla",
                "case": "Delhi Waqf Board irregularities (PMLA)",
                "court": "ED Special Court / HC",
                "status": "On bail; investigation ongoing",
                "tag": "politician",
                "search_query": "money laundering",
            },
            {
                "name": "Hemant Soren",
                "role": "Chief Minister, Jharkhand (reinstated)",
                "case": "Land fraud & PMLA case",
                "court": "Jharkhand High Court",
                "status": "On bail; case continuing",
                "tag": "politician",
                "search_query": "politician",
            },
            {
                "name": "Adani Group (Gautam Adani)",
                "role": "Chairman, Adani Group",
                "case": "Hindenburg allegations — SEBI probe monitored by SC",
                "court": "Supreme Court of India",
                "status": "SEBI investigation; SC monitoring",
                "tag": "businessman",
                "search_query": "Sahara SEBI",
            },
            {
                "name": "Prajwal Revanna",
                "role": "Former MP, Hassan",
                "case": "Sexual abuse & video scandal",
                "court": "Special Court, Bengaluru",
                "status": "Arrested; trial pending",
                "tag": "politician",
                "search_query": "sexual harassment",
            },
        ]
        # Link to matching cases or search
        for p in celebrity_defs:
            match = LegalCase.query.filter(
                LegalCase.case_name.ilike(f"%{p['search_query']}%")
            ).first()
            if match:
                p["case_id"] = match.id
                p["case_url"] = f"/case/{match.id}"
            else:
                p["case_url"] = f"/search?q={p['search_query']}"
        return jsonify(celebrity_defs)

    @app.route("/api/homepage/legal-quote")
    def api_legal_quote():
        """Daily rotating legal quote for inspiration."""
        quotes = [
            {"quote": "Be you ever so high, the law is above you.", "author": "Lord Denning", "source": "Master of the Rolls"},
            {"quote": "The law is reason, free from passion.", "author": "Aristotle", "source": "Politics"},
            {"quote": "Injustice anywhere is a threat to justice everywhere.", "author": "Martin Luther King Jr.", "source": "Letter from Birmingham Jail, 1963"},
            {"quote": "The safety of the people shall be the highest law.", "author": "Marcus Tullius Cicero", "source": "De Legibus"},
            {"quote": "It is emphatically the province and duty of the Judicial Department to say what the law is.", "author": "Chief Justice John Marshall", "source": "Marbury v. Madison (1803)"},
            {"quote": "Law and order exist for the purpose of establishing justice.", "author": "Martin Luther King Jr.", "source": ""},
            {"quote": "The right to personal liberty and the right to life are among the most cherished freedoms.", "author": "Justice H.R. Khanna", "source": "ADM Jabalpur dissent (1976)"},
            {"quote": "Procedure is the handmaid of justice, not its mistress.", "author": "Justice V.R. Krishna Iyer", "source": ""},
            {"quote": "Rights are not gifts from the state, they are inherent in the dignity of the human person.", "author": "Justice D.Y. Chandrachud", "source": "K.S. Puttaswamy v. Union of India (2017)"},
            {"quote": "The Constitution is not a mere lawyers' document, it is a vehicle of life.", "author": "Chief Justice Patanjali Sastri", "source": "State of West Bengal v. Subodh Gopal (1954)"},
            {"quote": "Equal justice under law is not merely a caption on the facade of the Supreme Court building, it is perhaps the most inspiring ideal of our society.", "author": "Justice Lewis F. Powell Jr.", "source": ""},
            {"quote": "Courts are the last resort for the helpless and the oppressed.", "author": "Justice P.N. Bhagwati", "source": "PIL jurisprudence"},
        ]
        today = date.today()
        idx = today.timetuple().tm_yday % len(quotes)
        return jsonify(quotes[idx])

    @app.route("/api/glossary/search-statute")
    def api_glossary_search_statute():
        """Search glossary for a statute/section reference to link from case detail pages."""
        q = request.args.get("q", "").strip()
        if not q:
            return jsonify([])
        terms = LegalGlossary.query.filter(or_(
            LegalGlossary.term.ilike(f"%{q}%"),
            LegalGlossary.definition.ilike(f"%{q}%"),
        )).limit(5).all()
        return jsonify([{
            "id": t.id,
            "term": t.term,
            "category": t.category,
            "definition": t.definition[:150] + "..." if len(t.definition) > 150 else t.definition,
        } for t in terms])

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
