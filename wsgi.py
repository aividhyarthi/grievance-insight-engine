"""WSGI entry point for production deployment (Railway, Heroku, etc.)."""

from beforelawyer.app import create_app

app = create_app()
