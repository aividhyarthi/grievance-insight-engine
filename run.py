#!/usr/bin/env python3
"""Run the BeforeLawyer web application."""

from beforelawyer.app import create_app

app = create_app()

if __name__ == "__main__":
    print("\n  BeforeLawyer — Legal Case Research Library")
    print("  ──────────────────────────────────────────")
    print("  Open http://localhost:5000 in your browser\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
