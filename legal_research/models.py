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
    jurisdiction = db.Column(db.String(100))
    judges = db.Column(db.Text)
    petitioner = db.Column(db.String(500))
    respondent = db.Column(db.String(500))
    outcome = db.Column(db.String(50))  # favor, against, partial, remanded
    summary = db.Column(db.Text, nullable=False)
    facts = db.Column(db.Text)
    issues = db.Column(db.Text)
    legal_reasoning = db.Column(db.Text)
    key_principles = db.Column(db.Text)
    statutes_referenced = db.Column(db.Text)
    precedents_cited = db.Column(db.Text)
    impact = db.Column(db.Text)
    tags = db.Column(db.Text)  # comma-separated keywords
    full_text_url = db.Column(db.String(500))

    def to_dict(self):
        return {
            "id": self.id,
            "case_name": self.case_name,
            "case_number": self.case_number,
            "court": self.court,
            "court_level": self.court_level,
            "case_type": self.case_type,
            "year": self.year,
            "date_decided": str(self.date_decided) if self.date_decided else None,
            "jurisdiction": self.jurisdiction,
            "judges": self.judges,
            "petitioner": self.petitioner,
            "respondent": self.respondent,
            "outcome": self.outcome,
            "summary": self.summary,
            "facts": self.facts,
            "issues": self.issues,
            "legal_reasoning": self.legal_reasoning,
            "key_principles": self.key_principles,
            "statutes_referenced": self.statutes_referenced,
            "precedents_cited": self.precedents_cited,
            "impact": self.impact,
            "tags": self.tags.split(",") if self.tags else [],
            "full_text_url": self.full_text_url,
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
