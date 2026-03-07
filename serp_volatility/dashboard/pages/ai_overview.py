"""
AI Overview Tracker — Streamlit Page

Shows:
  1. Keyword input (GSC connect / Excel upload / URL paste)
  2. Run AI Overview check
  3. Summary KPIs (traffic loss, % with AI Overview, you cited)
  4. Full keyword table with all signals
  5. Competitor citation leaderboard
"""

import io
import os
import sys
from pathlib import Path

import streamlit as st
import pandas as pd
import plotly.graph_objects as go

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from serp_volatility.keyword_sources.base import KeywordEntry
from serp_volatility.keyword_sources.excel_parser import ExcelParser
from serp_volatility.ai_overview.detector import AIOverviewDetector
from serp_volatility.ai_overview.analyzer import AIOverviewAnalyzer


# ── Page Config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="AI Overview Tracker",
    page_icon="🤖",
    layout="wide",
)

st.markdown("""
<style>
.block-container { padding-top: 1.2rem; }
.kpi-card {
    background: #0f172a;
    border-radius: 12px;
    padding: 20px 24px;
    text-align: center;
    border: 1px solid #1e293b;
}
.kpi-value { font-size: 2.2rem; font-weight: 800; margin: 0; }
.kpi-label { font-size: 0.8rem; color: #94a3b8; margin-top: 4px; }
.kpi-danger { color: #f87171; }
.kpi-safe   { color: #34d399; }
.kpi-warn   { color: #fbbf24; }
.kpi-neutral{ color: #60a5fa; }
.section-header {
    font-size: 1.1rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 24px 0 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #1e293b;
}
</style>
""", unsafe_allow_html=True)


# ── Header ───────────────────────────────────────────────────────────────────
st.markdown("## 🤖 AI Overview Tracker")
st.markdown(
    "Track which of your keywords trigger Google AI Overviews, "
    "whether you're cited, and how much traffic you're losing."
)

# ── Session State ─────────────────────────────────────────────────────────────
if "ao_entries" not in st.session_state:
    st.session_state.ao_entries = []
if "ao_checked" not in st.session_state:
    st.session_state.ao_checked = False


# ── Step 1: API Key ───────────────────────────────────────────────────────────
st.markdown('<div class="section-header">Step 1 — SERP API Key (Serper.dev)</div>', unsafe_allow_html=True)

serp_api_key = os.getenv("SERP_API_KEY", "")
if not serp_api_key:
    serp_api_key = st.text_input(
        "Serper.dev API key",
        type="password",
        help="Get a free key at serper.dev — 2,500 free queries/month",
        placeholder="Enter your Serper.dev API key",
    )
else:
    st.success("SERP_API_KEY loaded from environment.")


# ── Step 2: Keyword Input ─────────────────────────────────────────────────────
st.markdown('<div class="section-header">Step 2 — Add Keywords</div>', unsafe_allow_html=True)

tab_gsc, tab_excel, tab_url = st.tabs(["🔗 GSC Connect", "📊 Excel / CSV Upload", "🌐 URL Input"])

new_entries: list[KeywordEntry] = []

with tab_gsc:
    st.info(
        "Connect Google Search Console to pull your top keywords automatically with "
        "real impressions, clicks, CTR, and position data.",
        icon="ℹ️",
    )
    gsc_configured = bool(
        os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
        or os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE")
        or Path.home().joinpath(".serp_volatility/gsc_token.json").exists()
    )

    if not gsc_configured:
        st.warning(
            "GSC not connected. Set one of these environment variables:\n\n"
            "- `GOOGLE_SERVICE_ACCOUNT_JSON` — service account JSON (recommended)\n"
            "- `GOOGLE_SERVICE_ACCOUNT_FILE` — path to service account key file",
        )
    else:
        from serp_volatility.gsc.auth import GSCAuth
        from serp_volatility.gsc.client import GSCClient
        from serp_volatility.keyword_sources.gsc_source import GSCKeywordSource

        try:
            auth = GSCAuth()
            client = GSCClient(auth)

            with st.spinner("Loading GSC properties..."):
                sites = client.list_sites()

            if not sites:
                st.warning("No verified GSC properties found for this account.")
            else:
                selected_site = st.selectbox("Select GSC property", sites)
                col1, col2 = st.columns(2)
                gsc_days = col1.selectbox("Date range", [7, 28, 90], index=1, format_func=lambda d: f"Last {d} days")
                gsc_max = col2.number_input("Max keywords", min_value=10, max_value=5000, value=500, step=50)
                gsc_min_imp = st.slider("Min impressions", 0, 500, 10)

                if st.button("Pull keywords from GSC", type="primary"):
                    with st.spinner(f"Fetching keywords from {selected_site}..."):
                        source = GSCKeywordSource(
                            client=client,
                            site_url=selected_site,
                            days=gsc_days,
                            min_impressions=gsc_min_imp,
                            max_keywords=gsc_max,
                        )
                        new_entries = source.load()
                    st.success(f"Loaded {len(new_entries)} keywords from GSC.")

        except Exception as e:
            st.error(f"GSC error: {e}")


with tab_excel:
    st.markdown(
        "Upload an Excel (.xlsx) or CSV file. "
        "Required column: **keyword**. Optional: **url** (target page)."
    )

    # Download template button
    template_df = ExcelParser.get_template_df()
    csv_bytes = template_df.to_csv(index=False).encode()
    st.download_button(
        "Download template CSV",
        data=csv_bytes,
        file_name="keyword_template.csv",
        mime="text/csv",
    )

    uploaded = st.file_uploader(
        "Upload keyword file",
        type=["xlsx", "xls", "csv"],
        help="Columns: keyword, url (optional)",
    )

    if uploaded is not None:
        try:
            parser = ExcelParser(uploaded.read())
            new_entries = parser.load()
            st.success(f"Parsed {len(new_entries)} keywords from {uploaded.name}.")

            # Preview
            preview_df = pd.DataFrame([e.to_dict() for e in new_entries[:5]])[["keyword", "target_url"]]
            st.dataframe(preview_df, use_container_width=True)

        except ValueError as e:
            st.error(str(e))
        except Exception as e:
            st.error(f"Parse error: {e}")


with tab_url:
    st.markdown(
        "Paste a page URL. We'll find all keywords that page ranks for in GSC "
        "and check each one for AI Overview."
    )

    if not gsc_configured if 'gsc_configured' in dir() else True:
        st.warning("GSC must be connected (Step 2 → GSC Connect tab) to use URL input.")
    else:
        url_input = st.text_input(
            "Page URL",
            placeholder="https://yourblog.com/mutual-fund-guide",
        )
        url_days = st.selectbox("GSC date range", [7, 28, 90], index=1, format_func=lambda d: f"Last {d} days", key="url_days")

        if st.button("Find keywords for this URL") and url_input:
            try:
                from serp_volatility.keyword_sources.url_source import URLKeywordSource
                auth = GSCAuth()
                client = GSCClient(auth)
                sites = client.list_sites()

                if sites:
                    source = URLKeywordSource(
                        client=client,
                        site_url=sites[0],
                        page_url=url_input,
                        days=url_days,
                    )
                    with st.spinner("Fetching keywords from GSC..."):
                        new_entries = source.load()
                    st.success(f"Found {len(new_entries)} keywords for {url_input}")
            except Exception as e:
                st.error(f"Error: {e}")


# ── Merge new entries into session state ──────────────────────────────────────
if new_entries:
    existing_kws = {e.keyword.lower() for e in st.session_state.ao_entries}
    added = [e for e in new_entries if e.keyword.lower() not in existing_kws]
    st.session_state.ao_entries.extend(added)
    st.session_state.ao_checked = False
    if added:
        st.info(f"Added {len(added)} new keywords. Total: {len(st.session_state.ao_entries)}")


# ── Keyword Pool Status ───────────────────────────────────────────────────────
entries: list[KeywordEntry] = st.session_state.ao_entries

if entries:
    st.markdown(
        f'<div class="section-header">Keyword Pool — {len(entries)} keywords</div>',
        unsafe_allow_html=True,
    )

    col_clear, col_count = st.columns([1, 4])
    if col_clear.button("Clear all keywords"):
        st.session_state.ao_entries = []
        st.session_state.ao_checked = False
        st.rerun()


# ── Step 3: Run AI Overview Check ────────────────────────────────────────────
if entries:
    st.markdown('<div class="section-header">Step 3 — Run AI Overview Check</div>', unsafe_allow_html=True)

    col_run, col_limit = st.columns([2, 1])
    max_to_check = col_limit.number_input(
        "Max keywords to check",
        min_value=1,
        max_value=len(entries),
        value=min(50, len(entries)),
        help="Each keyword = 1 API call. Start small to test.",
    )

    run_check = col_run.button(
        f"🔍 Check {max_to_check} keywords for AI Overview",
        type="primary",
        disabled=not serp_api_key,
    )

    if not serp_api_key:
        st.caption("Add your Serper.dev API key in Step 1 to run the check.")

    if run_check and serp_api_key:
        subset = entries[:max_to_check]
        detector = AIOverviewDetector(api_key=serp_api_key)

        progress_bar = st.progress(0.0, text="Checking keywords...")

        def update_progress(current, total):
            pct = current / total if total > 0 else 0
            progress_bar.progress(pct, text=f"Checking {current}/{total} keywords...")

        with st.spinner("Running AI Overview checks..."):
            detector.check_keywords(subset, on_progress=update_progress)

        progress_bar.empty()
        st.session_state.ao_checked = True
        st.success(f"Done! Checked {len(subset)} keywords.")
        st.rerun()


# ── Results ───────────────────────────────────────────────────────────────────
checked_entries = [e for e in entries if e.ai_overview_present is not None]

if checked_entries:
    analyzer = AIOverviewAnalyzer(checked_entries)
    stats = analyzer.summary()

    st.markdown('<div class="section-header">Results</div>', unsafe_allow_html=True)

    # KPI Cards
    c1, c2, c3, c4, c5 = st.columns(5)

    def kpi(col, value, label, color_class="kpi-neutral"):
        col.markdown(
            f'<div class="kpi-card">'
            f'<div class="kpi-value {color_class}">{value}</div>'
            f'<div class="kpi-label">{label}</div>'
            f'</div>',
            unsafe_allow_html=True,
        )

    kpi(c1, stats["checked"], "Keywords Checked", "kpi-neutral")
    kpi(
        c2,
        f"{stats['ai_overview_pct']}%",
        "Have AI Overview",
        "kpi-danger" if stats["ai_overview_pct"] > 40 else "kpi-warn",
    )
    kpi(
        c3,
        f"{stats['you_cited_pct']}%",
        "You're Cited",
        "kpi-safe" if stats["you_cited_pct"] > 30 else "kpi-warn",
    )
    kpi(
        c4,
        f"{stats['monthly_traffic_loss']:,}",
        "Est. Traffic Loss/Month",
        "kpi-danger" if stats["monthly_traffic_loss"] > 1000 else "kpi-warn",
    )
    kpi(
        c5,
        f"{stats['traffic_loss_pct']}%",
        "Traffic Stolen by AIO",
        "kpi-danger" if stats["traffic_loss_pct"] > 20 else "kpi-warn",
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # Tabs: full table | at-risk | competitors
    res_tab1, res_tab2, res_tab3 = st.tabs(["📋 All Keywords", "🔴 At-Risk Keywords", "🏆 Competitor Citations"])

    with res_tab1:
        df = analyzer.to_dataframe()

        # Colour AI Overview column
        def highlight_aio(val):
            if val is True:
                return "background-color: #450a0a; color: #fca5a5"
            if val is False:
                return "background-color: #052e16; color: #86efac"
            return ""

        display_cols = [
            "Keyword", "Source", "Target URL", "Impressions", "Clicks",
            "Actual CTR %", "Avg Position", "AI Overview", "You Cited",
            "Competitor Cited", "Traffic Loss/Month",
        ]
        display_cols = [c for c in display_cols if c in df.columns]

        styled = df[display_cols].style.applymap(
            highlight_aio, subset=["AI Overview"] if "AI Overview" in display_cols else []
        )
        st.dataframe(styled, use_container_width=True, height=450)

        # Export
        csv = df.to_csv(index=False).encode()
        st.download_button(
            "Export full table as CSV",
            data=csv,
            file_name="ai_overview_report.csv",
            mime="text/csv",
        )

    with res_tab2:
        at_risk = analyzer.at_risk_keywords()
        if not at_risk:
            st.success("No high-risk keywords found (AI Overview present but you're not cited).")
        else:
            st.warning(
                f"{len(at_risk)} keywords where AI Overview exists but **you are NOT cited**. "
                "These are your biggest content opportunities."
            )
            at_risk_df = pd.DataFrame([e.to_dict() for e in at_risk])
            at_risk_df = at_risk_df.sort_values("traffic_loss_monthly", ascending=False)
            st.dataframe(at_risk_df[["keyword", "target_url", "impressions", "position",
                                     "traffic_loss_monthly", "competitor_cited"]].rename(columns={
                "keyword": "Keyword",
                "target_url": "Your URL",
                "impressions": "Impressions",
                "position": "Position",
                "traffic_loss_monthly": "Traffic Loss/Month",
                "competitor_cited": "Competitor Cited",
            }), use_container_width=True)

    with res_tab3:
        comp_df = analyzer.competitor_citations()
        if comp_df.empty:
            st.info("No competitor citation data yet.")
        else:
            st.markdown("**Domains most cited in AI Overviews for your keywords:**")
            fig = go.Figure(go.Bar(
                x=comp_df["ai_overview_citations"],
                y=comp_df["domain"],
                orientation="h",
                marker_color="#3b82f6",
                text=comp_df["ai_overview_citations"],
                textposition="outside",
            ))
            fig.update_layout(
                plot_bgcolor="#0f172a",
                paper_bgcolor="#0f172a",
                font_color="#e2e8f0",
                xaxis=dict(showgrid=False),
                yaxis=dict(autorange="reversed"),
                margin=dict(l=10, r=40, t=20, b=20),
                height=max(250, len(comp_df) * 40),
            )
            st.plotly_chart(fig, use_container_width=True)

elif entries and not st.session_state.ao_checked:
    st.info(f"{len(entries)} keywords loaded. Run the AI Overview check above to see results.")

elif not entries:
    st.markdown("---")
    st.markdown(
        "**Get started:** Add keywords using GSC Connect, Excel upload, or URL input above."
    )
