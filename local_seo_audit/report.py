"""
Rich terminal report renderer for Local SEO Audit results.
"""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich import box
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .auditor import AuditResult

console = Console()

STATUS_COLORS = {"good": "green", "warn": "yellow", "bad": "red"}
STATUS_ICONS  = {"good": "✓", "warn": "⚠", "bad": "✗"}
GRADE_COLORS  = {"A": "bright_green", "B": "green", "C": "yellow", "D": "red", "F": "bright_red"}


def _score_bar(score: int, max_score: int, width: int = 20) -> str:
    filled = round((score / max_score) * width) if max_score else 0
    return "█" * filled + "░" * (width - filled)


def print_report(result: "AuditResult", insights: dict | None = None) -> None:
    console.print()

    # ── Header ────────────────────────────────────────────────────────────────
    grade_color = GRADE_COLORS.get(result.grade, "white")
    header = Text()
    header.append("  LOCAL SEO AUDIT REPORT\n", style="bold white")
    header.append(f"  {result.business_name}\n", style="bold cyan")
    if result.google_maps_url:
        header.append(f"  {result.google_maps_url}\n", style="dim")
    console.print(Panel(header, box=box.DOUBLE_EDGE, style="bold blue"))

    # ── Score summary ─────────────────────────────────────────────────────────
    score_text = Text()
    score_text.append(f"  Overall SEO Score: ", style="bold")
    score_text.append(f"{result.overall_score}/100", style=f"bold {grade_color}")
    score_text.append(f"  ({result.pct}%)", style="dim")
    score_text.append(f"  Grade: ", style="bold")
    score_text.append(f" {result.grade} ", style=f"bold reverse {grade_color}")
    console.print(score_text)
    console.print(f"  [dim]{_score_bar(result.overall_score, 100, 40)}[/dim]")
    console.print()

    # ── Signals table ─────────────────────────────────────────────────────────
    table = Table(
        title="Signal Breakdown",
        box=box.SIMPLE_HEAD,
        show_lines=False,
        header_style="bold cyan",
        title_style="bold",
    )
    table.add_column("Signal",      style="bold", min_width=22)
    table.add_column("Score",       justify="center", min_width=10)
    table.add_column("Status",      justify="center", min_width=8)
    table.add_column("Finding",     min_width=40)

    for sig in result.signals:
        color  = STATUS_COLORS.get(sig.status, "white")
        icon   = STATUS_ICONS.get(sig.status, "?")
        bar    = _score_bar(sig.score, sig.max_score, 10)
        score_str = f"{sig.score}/{sig.max_score} {bar}"

        table.add_row(
            sig.name,
            score_str,
            f"[{color}]{icon} {sig.status.upper()}[/{color}]",
            sig.detail,
        )

    console.print(table)
    console.print()

    # ── Quick wins (bad / warn signals only) ──────────────────────────────────
    issues = [s for s in result.signals if s.status != "good"]
    if issues:
        console.print("[bold yellow]⚡ Quick Wins[/bold yellow]")
        for s in issues:
            color = STATUS_COLORS[s.status]
            console.print(f"  [{color}]{STATUS_ICONS[s.status]}[/{color}] [bold]{s.name}[/bold]")
            console.print(f"    → {s.recommendation}")
        console.print()

    # ── AI Insights ───────────────────────────────────────────────────────────
    if insights:
        summary = insights.get("executive_summary", "")
        if summary:
            console.print(Panel(
                f"[italic]{summary}[/italic]",
                title="[bold magenta]AI Assessment[/bold magenta]",
                box=box.ROUNDED,
                style="magenta",
            ))
            console.print()

        fixes = insights.get("priority_fixes", [])
        if fixes:
            console.print("[bold magenta]🎯 Top Priority Fixes[/bold magenta]")
            for fix in fixes:
                console.print(f"  [bold cyan]{fix.get('rank', '?')}. {fix.get('action', '')}[/bold cyan]")
                console.print(f"     [dim]Why:[/dim] {fix.get('why', '')}")
                console.print(f"     [dim]How:[/dim] {fix.get('how', '')}")
            console.print()

        strategy = insights.get("growth_strategy", [])
        if strategy:
            console.print("[bold magenta]📈 30-90 Day Growth Strategy[/bold magenta]")
            for item in strategy:
                console.print(f"  • {item}")
            console.print()

        comp_note = insights.get("competitor_note", "")
        if comp_note:
            console.print(Panel(
                comp_note,
                title="[bold]Competitor Benchmark[/bold]",
                box=box.ROUNDED,
                style="dim",
            ))
            console.print()

    console.print("[dim]Audit powered by Google Places API + Claude claude-opus-4-6 AI[/dim]")
    console.print()
