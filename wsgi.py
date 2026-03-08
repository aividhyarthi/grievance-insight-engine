"""WSGI entry point for production deployment (Railway, Heroku, etc.)."""

from legal_research.app import create_app

app = create_app()
