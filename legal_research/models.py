from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()


class LegalCase(db.Model):
    __tablename__ = "legal_cases"

    id = db.Column(db.Integer, primary_key=True)
    case_name = db.Column(db.String(500), nullable=False)
    case_number = db.Column(db.String(200))
    court = db.Column(db.String(200), nullable=False)
    court_level = db.Column(db.String(50), nullable=False)  # supreme, high, district, tribunal
    case_type = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    date_decided = db.Column(db.Date)
    date_filed = db.Column(db.Date)
    jurisdiction = db.Column(db.String(100))
    judges = db.Column(db.Text)
    petitioner = db.Column(db.String(500))
    respondent = db.Column(db.String(500))
    advocate_petitioner = db.Column(db.Text)  # lawyer(s) for petitioner
    advocate_respondent = db.Column(db.Text)  # lawyer(s) for respondent
    bench_size = db.Column(db.String(50))  # e.g. "9-judge bench", "5-judge bench"
    outcome = db.Column(db.String(50))  # favor, against, partial, remanded
    outcome_detail = db.Column(db.Text)  # detailed outcome description
    hearing_count = db.Column(db.Integer)  # number of hearings
    case_duration_days = db.Column(db.Integer)  # total days from filing to decision
    summary = db.Column(db.Text, nullable=False)
    facts = db.Column(db.Text)
    issues = db.Column(db.Text)
    arguments_petitioner = db.Column(db.Text)  # key arguments by petitioner's side
    arguments_respondent = db.Column(db.Text)  # key arguments by respondent's side
    legal_reasoning = db.Column(db.Text)
    judge_observations = db.Column(db.Text)  # notable quotes/observations from judges
    key_principles = db.Column(db.Text)
    statutes_referenced = db.Column(db.Text)
    precedents_cited = db.Column(db.Text)
    dissenting_opinion = db.Column(db.Text)  # minority/dissenting view
    impact = db.Column(db.Text)
    tags = db.Column(db.Text)  # comma-separated keywords
    full_text_url = db.Column(db.String(500))
    timeline_events = db.Column(db.Text)  # JSON: [{"date":"YYYY-MM-DD","event":"..."},...]

    def to_dict(self):
        import json
        timeline = []
        if self.timeline_events:
            try:
                timeline = json.loads(self.timeline_events)
            except (json.JSONDecodeError, TypeError):
                timeline = []
        return {
            "id": self.id,
            "case_name": self.case_name,
            "case_number": self.case_number,
            "court": self.court,
            "court_level": self.court_level,
            "case_type": self.case_type,
            "year": self.year,
            "date_decided": str(self.date_decided) if self.date_decided else None,
            "date_filed": str(self.date_filed) if self.date_filed else None,
            "jurisdiction": self.jurisdiction,
            "judges": self.judges,
            "petitioner": self.petitioner,
            "respondent": self.respondent,
            "advocate_petitioner": self.advocate_petitioner,
            "advocate_respondent": self.advocate_respondent,
            "bench_size": self.bench_size,
            "outcome": self.outcome,
            "outcome_detail": self.outcome_detail,
            "hearing_count": self.hearing_count,
            "case_duration_days": self.case_duration_days,
            "summary": self.summary,
            "facts": self.facts,
            "issues": self.issues,
            "arguments_petitioner": self.arguments_petitioner,
            "arguments_respondent": self.arguments_respondent,
            "legal_reasoning": self.legal_reasoning,
            "judge_observations": self.judge_observations,
            "key_principles": self.key_principles,
            "statutes_referenced": self.statutes_referenced,
            "precedents_cited": self.precedents_cited,
            "dissenting_opinion": self.dissenting_opinion,
            "impact": self.impact,
            "tags": self.tags.split(",") if self.tags else [],
            "full_text_url": self.full_text_url,
            "timeline_events": timeline,
        }


class LegalGlossary(db.Model):
    __tablename__ = "legal_glossary"

    id = db.Column(db.Integer, primary_key=True)
    term = db.Column(db.String(200), nullable=False, unique=True)
    definition = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    example_usage = db.Column(db.Text)
    related_terms = db.Column(db.Text)


class CaseBriefTemplate(db.Model):
    __tablename__ = "case_brief_templates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    case_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    template_content = db.Column(db.Text, nullable=False)
    tips = db.Column(db.Text)
