"""
India SERP Volatility Dashboard — Streamlit App

Like SEMrush Sensor, but for India (google.co.in).

Run with:
    streamlit run serp_volatility/dashboard/app.py
"""

import sys
from datetime import date, timedelta
from pathlib import Path

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from serp_volatility.config import CATEGORIES, TrackerConfig
from serp_volatility.storage.sqlite_store import SQLiteStore
from serp_volatility.analysis.volatility import VolatilityCalculator


def ensure_demo_data(storage: SQLiteStore):
    """Auto-generate demo data if database is empty (first deploy)."""
    try:
        if storage.get_keyword_count() == 0:
            from serp_volatility.tracker import generate_demo_data
            with st.spinner("Generating demo data for first launch…"):
                generate_demo_data(storage)
    except Exception as e:
        st.warning(f"Demo data generation skipped: {e}")


# --- Page Config ---
st.set_page_config(
    page_title="India SERP Pulse",
    page_icon="🇮🇳",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# --- Custom CSS ---
st.markdown("""
<style>
    /* Hide default header padding */
    .block-container { padding-top: 1rem; }

    /* Hero banner */
    .hero {
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        border-radius: 16px;
        padding: 28px 36px;
        margin-bottom: 24px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .hero h1 { font-size: 2rem; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
    .hero p  { margin: 6px 0 0; opacity: 0.75; font-size: 0.95rem; }

    /* Pulse score badge */
    .pulse-badge {
        font-size: 3.5rem;
        font-weight: 900;
        line-height: 1;
        padding: 18px 28px;
        border-radius: 16px;
        text-align: center;
        min-width: 140px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.25);
    }
    .pulse-low      { background: #00c853; color: white; }
    .pulse-normal   { background: #ffd600; color: #1a1a1a; }
    .pulse-high     { background: #ff6d00; color: white; }
    .pulse-veryhigh { background: #d50000; color: white; }

    /* Stat chips */
    .stat-chip {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px;
        padding: 10px 18px;
        text-align: center;
        color: white;
        margin: 4px 0;
    }
    .stat-chip .val { font-size: 1.6rem; font-weight: 700; }
    .stat-chip .lbl { font-size: 0.75rem; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.5px; }

    /* Category pill */
    .cat-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 12px;
        margin: 4px 0;
        width: 100%;
        border-left: 4px solid;
        background: #f7f8fa;
    }
    .cat-pill .name { font-weight: 600; font-size: 0.9rem; flex: 1; }
    .cat-pill .score { font-size: 1.5rem; font-weight: 800; }
    .cat-pill .lvl  { font-size: 0.75rem; color: #666; }

    /* Device toggle */
    div[data-testid="stRadio"] > label { font-weight: 600; }

    /* FAQ accordion */
    .faq-q {
        font-weight: 700;
        font-size: 1rem;
        color: #1a1a1a;
        margin: 0;
    }
    .faq-a {
        color: #444;
        line-height: 1.7;
        margin-top: 6px;
    }

    /* Section header */
    .sec-header {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1a1a1a;
        border-bottom: 2px solid #e8eaf0;
        padding-bottom: 8px;
        margin: 20px 0 16px;
    }

    /* Alert callout */
    .callout {
        border-radius: 10px;
        padding: 14px 18px;
        margin: 12px 0;
        border-left: 4px solid;
    }
</style>
""", unsafe_allow_html=True)


def score_class(score: float) -> str:
    if score < 2.0:   return "low"
    if score < 5.0:   return "normal"
    if score < 8.0:   return "high"
    return "veryhigh"


def score_color(score: float) -> str:
    if score < 2.0:   return "#00c853"
    if score < 5.0:   return "#ffd600"
    if score < 8.0:   return "#ff6d00"
    return "#d50000"


def score_label(score: float) -> str:
    if score < 2.0:   return "Stable"
    if score < 5.0:   return "Normal"
    if score < 8.0:   return "High"
    return "Very High"


def main():
    config = TrackerConfig()
    storage = SQLiteStore(config.sqlite_path)
    ensure_demo_data(storage)
    calculator = VolatilityCalculator(storage, config)

    # Resolve today's date
    today = date.today()
    today_label = today.strftime("%d %b %Y")

    # --- Compact top controls (device + days) ---
    ctrl_left, ctrl_mid, ctrl_right = st.columns([3, 1, 1])
    with ctrl_mid:
        device = st.radio("Device", ["desktop", "mobile"], horizontal=True, label_visibility="collapsed")
    with ctrl_right:
        days_range = st.select_slider("Days", options=[7, 14, 30, 60, 90], value=30, label_visibility="collapsed")

    # Fetch today's score (fallback to yesterday)
    today_data = calculator.compute_overall_volatility(today, device)
    if today_data["overall_score"] == 0:
        today = today - timedelta(days=1)
        today_data = calculator.compute_overall_volatility(today, device)

    score = today_data["overall_score"]
    level = score_label(score)
    sc = score_class(score)
    color = score_color(score)

    # --- Hero Banner ---
    kw_count = storage.get_keyword_count()
    cat_count = len(today_data["category_scores"])

    st.markdown(f"""
    <div class="hero">
      <div>
        <h1>🇮🇳 India SERP Pulse</h1>
        <p>Real-time Google.co.in ranking volatility across {cat_count} Indian market categories</p>
        <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
          <div class="stat-chip">
            <div class="val">{kw_count}</div>
            <div class="lbl">Keywords</div>
          </div>
          <div class="stat-chip">
            <div class="val">{cat_count}</div>
            <div class="lbl">Categories</div>
          </div>
          <div class="stat-chip">
            <div class="val">{device.capitalize()}</div>
            <div class="lbl">Device</div>
          </div>
          <div class="stat-chip">
            <div class="val">{today.strftime("%d %b")}</div>
            <div class="lbl">Latest Data</div>
          </div>
        </div>
      </div>
      <div class="pulse-badge pulse-{sc}">
        {score}<br>
        <span style="font-size:1rem; font-weight:600;">{level}</span>
      </div>
    </div>
    """, unsafe_allow_html=True)

    # --- Tabs ---
    tab1, tab2, tab3, tab4 = st.tabs([
        "📈 Overview",
        "🗂️ Categories",
        "✨ SERP Features",
        "❓ How It Works",
    ])

    # =========================================================
    # TAB 1: OVERVIEW
    # =========================================================
    with tab1:
        history = storage.get_volatility_history(days_range, device, "overall")

        if history:
            df = pd.DataFrame(history)
            df["score_date"] = pd.to_datetime(df["score_date"])

            fig = go.Figure()
            fig.add_hrect(y0=0, y1=2, fillcolor="#00c853", opacity=0.04, line_width=0)
            fig.add_hrect(y0=2, y1=5, fillcolor="#ffd600", opacity=0.06, line_width=0)
            fig.add_hrect(y0=5, y1=8, fillcolor="#ff6d00", opacity=0.06, line_width=0)
            fig.add_hrect(y0=8, y1=10, fillcolor="#d50000", opacity=0.06, line_width=0)

            # Gradient fill line
            fig.add_trace(go.Scatter(
                x=df["score_date"],
                y=df["score"],
                mode="lines+markers",
                name="Volatility",
                line=dict(color=color, width=3),
                marker=dict(size=5, color=df["score"],
                            colorscale=[[0, "#00c853"], [0.3, "#ffd600"],
                                        [0.6, "#ff6d00"], [1.0, "#d50000"]],
                            cmin=0, cmax=10),
                fill="tozeroy",
                fillcolor=f"rgba(25, 118, 210, 0.08)",
                hovertemplate="<b>%{x|%d %b}</b><br>Score: %{y:.1f}<extra></extra>",
            ))

            # Annotation for peak
            peak_idx = df["score"].idxmax()
            peak_val = df.loc[peak_idx, "score"]
            peak_date = df.loc[peak_idx, "score_date"]
            if peak_val >= 5.0:
                fig.add_annotation(
                    x=peak_date, y=peak_val,
                    text=f"Peak: {peak_val}",
                    showarrow=True, arrowhead=2,
                    bgcolor="#fff", bordercolor=color,
                    font=dict(size=11, color=color),
                    ay=-30,
                )

            fig.update_layout(
                yaxis=dict(range=[0, 10], title="Volatility Score",
                           tickvals=[0, 2, 5, 8, 10],
                           ticktext=["0 Stable", "2", "5 High", "8", "10 Extreme"]),
                xaxis=dict(title=""),
                height=380,
                margin=dict(t=20, b=20, l=10, r=10),
                hovermode="x unified",
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
                showlegend=False,
            )
            st.plotly_chart(fig, use_container_width=True)

            # Summary row
            avg_score = df["score"].mean()
            max_score = df["score"].max()
            min_score = df["score"].min()
            days_high = (df["score"] >= 5).sum()

            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Today", f"{score}", delta=None)
            m2.metric(f"{days_range}d Average", f"{avg_score:.1f}")
            m3.metric("Peak", f"{max_score:.1f}")
            m4.metric("Days High/VeryHigh", f"{days_high} of {len(df)}")
        else:
            st.info("No historical data yet. Run `python -m serp_volatility demo` to generate demo data.")

    # =========================================================
    # TAB 2: CATEGORIES
    # =========================================================
    with tab2:
        if today_data["category_scores"]:
            sorted_cats = sorted(
                today_data["category_scores"].items(),
                key=lambda x: x[1], reverse=True,
            )

            left_col, right_col = st.columns([1, 2])

            with left_col:
                st.markdown('<div class="sec-header">Today\'s Rankings</div>', unsafe_allow_html=True)
                for cat, s in sorted_cats:
                    cat_name = CATEGORIES.get(cat, cat)
                    c = score_color(s)
                    lv = score_label(s)
                    st.markdown(
                        f'<div class="cat-pill" style="border-left-color:{c};">'
                        f'<span class="name">{cat_name}</span>'
                        f'<span class="score" style="color:{c};">{s:.1f}</span>'
                        f'<span class="lvl">{lv}</span>'
                        f'</div>',
                        unsafe_allow_html=True,
                    )

            with right_col:
                st.markdown('<div class="sec-header">Category Trends</div>', unsafe_allow_html=True)

                selected_cats = st.multiselect(
                    "Compare categories",
                    options=list(CATEGORIES.keys()),
                    default=list(CATEGORIES.keys())[:5],
                    format_func=lambda x: CATEGORIES.get(x, x),
                )

                if selected_cats:
                    fig_compare = go.Figure()
                    for cat in selected_cats:
                        cat_history = storage.get_volatility_history(days_range, device, cat)
                        if cat_history:
                            df_cat = pd.DataFrame(cat_history)
                            df_cat["score_date"] = pd.to_datetime(df_cat["score_date"])
                            fig_compare.add_trace(go.Scatter(
                                x=df_cat["score_date"],
                                y=df_cat["score"],
                                mode="lines",
                                name=CATEGORIES.get(cat, cat),
                                line=dict(width=2),
                                hovertemplate=f"<b>{CATEGORIES.get(cat, cat)}</b><br>%{{x|%d %b}}: %{{y:.1f}}<extra></extra>",
                            ))

                    fig_compare.update_layout(
                        yaxis=dict(range=[0, 10], title="Score"),
                        xaxis=dict(title=""),
                        height=420,
                        margin=dict(t=10, b=10, l=10, r=10),
                        hovermode="x unified",
                        legend=dict(orientation="h", yanchor="bottom", y=-0.3),
                        plot_bgcolor="rgba(0,0,0,0)",
                        paper_bgcolor="rgba(0,0,0,0)",
                    )
                    st.plotly_chart(fig_compare, use_container_width=True)

            # Horizontal bar chart at bottom
            st.markdown('<div class="sec-header">Score Comparison</div>', unsafe_allow_html=True)
            cat_names = [CATEGORIES.get(c, c) for c, _ in sorted_cats]
            cat_scores = [s for _, s in sorted_cats]
            cat_colors = [score_color(s) for s in cat_scores]

            fig_bar = go.Figure(go.Bar(
                x=cat_scores,
                y=cat_names,
                orientation="h",
                marker_color=cat_colors,
                text=[f"{s:.1f}" for s in cat_scores],
                textposition="outside",
                hovertemplate="%{y}: %{x:.1f}<extra></extra>",
            ))
            fig_bar.update_layout(
                xaxis=dict(range=[0, 10.5], title="Volatility Score"),
                height=max(360, len(sorted_cats) * 32),
                margin=dict(l=10, t=10, b=20, r=60),
                yaxis=dict(autorange="reversed"),
                plot_bgcolor="rgba(0,0,0,0)",
                paper_bgcolor="rgba(0,0,0,0)",
            )
            st.plotly_chart(fig_bar, use_container_width=True)

        else:
            st.info("No category data available yet.")

    # =========================================================
    # TAB 3: SERP FEATURES
    # =========================================================
    with tab3:
        FEATURE_LABELS = {
            "ai_overview":      "AI Overview (SGE)",
            "featured_snippet": "Featured Snippet",
            "people_also_ask":  "People Also Ask",
            "top_stories":      "Top Stories",
            "image_pack":       "Image Pack",
            "video":            "Video Results",
            "shopping":         "Shopping",
            "local_pack":       "Local Pack",
            "knowledge_panel":  "Knowledge Panel",
        }
        FEATURE_ICONS = {
            "ai_overview":      "🤖",
            "featured_snippet": "⭐",
            "people_also_ask":  "❓",
            "top_stories":      "📰",
            "image_pack":       "🖼️",
            "video":            "🎬",
            "shopping":         "🛒",
            "local_pack":       "📍",
            "knowledge_panel":  "📚",
        }

        feature_summary = storage.get_feature_summary(today, device)

        if feature_summary:
            total_kw = storage.get_keyword_count() or 1
            features_sorted = sorted(feature_summary, key=lambda x: x["keywords_with_feature"], reverse=True)

            st.markdown('<div class="sec-header">Feature Presence Today</div>', unsafe_allow_html=True)

            cols_per_row = 3
            for row_start in range(0, len(features_sorted), cols_per_row):
                row_features = features_sorted[row_start:row_start + cols_per_row]
                cols = st.columns(cols_per_row)
                for col, feat in zip(cols, row_features):
                    ft = feat["feature_type"]
                    label = FEATURE_LABELS.get(ft, ft.replace("_", " ").title())
                    icon = FEATURE_ICONS.get(ft, "📊")
                    pct = round(feat["keywords_with_feature"] / total_kw * 100, 1)
                    with col:
                        st.metric(
                            label=f"{icon} {label}",
                            value=f"{pct}%",
                            help=f"Appeared on {feat['keywords_with_feature']} of {total_kw} keywords today",
                        )

            st.markdown('<div class="sec-header">Feature Trends Over Time</div>', unsafe_allow_html=True)

            default_features = ["ai_overview", "featured_snippet", "top_stories", "people_also_ask"]
            available_features = [f["feature_type"] for f in feature_summary]
            selected_features = st.multiselect(
                "Select features",
                options=available_features,
                default=[f for f in default_features if f in available_features],
                format_func=lambda x: f"{FEATURE_ICONS.get(x, '')} {FEATURE_LABELS.get(x, x)}",
            )

            if selected_features:
                fig_ft = go.Figure()
                for ft in selected_features:
                    fhist = storage.get_feature_history(ft, days_range, device)
                    if fhist:
                        df_ft = pd.DataFrame(fhist)
                        df_ft["score_date"] = pd.to_datetime(df_ft["score_date"])
                        df_ft["pct"] = (df_ft["keywords_with_feature"] / df_ft["total_keywords"].replace(0, 1) * 100).round(1)
                        lbl = f"{FEATURE_ICONS.get(ft, '')} {FEATURE_LABELS.get(ft, ft)}"
                        fig_ft.add_trace(go.Scatter(
                            x=df_ft["score_date"],
                            y=df_ft["pct"],
                            mode="lines+markers",
                            name=lbl,
                            line=dict(width=2),
                            marker=dict(size=5),
                            hovertemplate=f"<b>{lbl}</b><br>%{{x|%d %b}}: %{{y:.1f}}%<extra></extra>",
                        ))

                fig_ft.update_layout(
                    yaxis=dict(title="% Keywords with Feature", range=[0, 100]),
                    xaxis=dict(title=""),
                    height=400,
                    margin=dict(t=10, b=10, l=10, r=10),
                    hovermode="x unified",
                    legend=dict(orientation="h", yanchor="bottom", y=-0.35),
                    plot_bgcolor="rgba(0,0,0,0)",
                    paper_bgcolor="rgba(0,0,0,0)",
                )
                st.plotly_chart(fig_ft, use_container_width=True)

            # AI Overview callout
            ai_data = next((f for f in feature_summary if f["feature_type"] == "ai_overview"), None)
            if ai_data:
                ai_pct = round(ai_data["keywords_with_feature"] / total_kw * 100, 1)
                ai_history = storage.get_feature_history("ai_overview", 2, device)
                delta_str = ""
                if len(ai_history) >= 2:
                    prev_pct = round(ai_history[-2]["keywords_with_feature"] / max(ai_history[-2]["total_keywords"], 1) * 100, 1)
                    delta = round(ai_pct - prev_pct, 1)
                    arrow = "↑" if delta > 0 else "↓" if delta < 0 else "→"
                    delta_str = f"  {arrow} {abs(delta)}% vs yesterday"

                callout_color = "#e53935" if ai_pct > 40 else "#fb8c00" if ai_pct > 20 else "#43a047"
                impact_msg = (
                    "High AI displacement — organic clicks may be significantly reduced."
                    if ai_pct > 40 else
                    "Moderate AI presence — monitor closely for traffic changes."
                    if ai_pct > 20 else
                    "Low AI Overview presence — organic results mostly unaffected."
                )
                st.markdown(
                    f'<div class="callout" style="background:{callout_color}18; border-color:{callout_color};">'
                    f'<strong>🤖 AI Overview Impact — {ai_pct}% of tracked keywords{delta_str}</strong><br>'
                    f'<span style="color:#555;">{impact_msg}</span>'
                    f'</div>',
                    unsafe_allow_html=True,
                )
        else:
            st.info("No SERP feature data yet. Run `python -m serp_volatility demo` to generate demo data.")

    # =========================================================
    # TAB 4: HOW IT WORKS / FAQ
    # =========================================================
    with tab4:
        st.markdown("## How India SERP Pulse Works")
        st.markdown(
            "A technical guide to how we collect data, calculate volatility scores, "
            "and what everything means for your SEO."
        )

        faqs = [
            (
                "What is a SERP Volatility Score?",
                """The volatility score (0–10) measures how much Google's search rankings are shifting for a given set of keywords.

- **0–2 (Stable):** Very little movement. Rankings are consistent day-over-day.
- **2–5 (Normal):** Typical daily fluctuation. Expected background noise.
- **5–8 (High):** Significant ranking changes. Likely a minor algorithm update or fresh content boost.
- **8–10 (Very High):** Major reshuffling. Usually indicates a confirmed algorithm update (e.g., Core Update, HCU).

The score is re-computed daily by comparing yesterday's top-20 rankings against today's for every tracked keyword."""
            ),
            (
                "How is the score calculated?",
                """We use a **position-change weighted formula**:

1. For each keyword, we compare the ranked domain list from Day N vs Day N-1.
2. We calculate the average position change across all domains in the top 20.
3. The raw change is multiplied by a **CTR weight** (positions 1–3 matter more than 18–20).
4. An overall score is the weighted average across all keywords in a category, then normalised to the 0–10 scale using the formula:

```
score = min(10, (avg_position_delta / max_expected_delta) × 10)
```

Where `max_expected_delta` is calibrated at 10 positions (a site dropping from #1 to #11 = max volatility contribution)."""
            ),
            (
                "What keywords are tracked?",
                """We track **150+ seed keywords** across 15 Indian market categories:

Education, E-Commerce, Banking & Finance, Health, News, Real Estate, Travel, Technology, Government Services, Jobs, Food, Entertainment, Automobile, Telecom, and Insurance.

Keywords are chosen to represent high-volume, competitive head terms typical of Indian search behaviour — e.g., "best mutual funds India", "OYO rooms Bangalore", "CBSE results 2025"."""
            ),
            (
                "What is the difference between Desktop and Mobile?",
                """Google serves **different results** for desktop vs mobile queries — especially for local, e-commerce, and featured snippets.

- **Desktop** tracks `gl=in, hl=en` queries with a standard browser user agent.
- **Mobile** tracks the same queries but with a mobile user agent and `device=mobile` parameter.

Mobile rankings tend to show higher local pack presence and slightly different featured snippet rates. Comparing the two can reveal device-specific algorithm behaviour."""
            ),
            (
                "What are SERP Features and why do they matter?",
                """SERP Features are non-organic elements Google inserts into results:

| Feature | Why It Matters |
|---|---|
| 🤖 AI Overview (SGE) | Reduces organic CTR by answering queries directly |
| ⭐ Featured Snippet | Can steal the "position 0" click from organic #1 |
| ❓ People Also Ask | Expands with related questions, pushing organics down |
| 📰 Top Stories | Favours news/AMP content, displacing regular pages |
| 🛒 Shopping | Paid product listings take prime real estate |
| 📍 Local Pack | Replaces organics for geo-intent queries |

When AI Overview coverage rises suddenly, it often correlates with organic CTR drops — even if rankings haven't changed."""
            ),
            (
                "How often is data collected?",
                """In production mode with an API key configured:

- Data is collected **once per day** (scheduled or on-demand via cron).
- Volatility scores are computed after each collection run.
- The dashboard auto-refreshes every time you reload the page.

In **demo mode** (no API key), 30 days of synthetic data is generated on first launch using deterministic randomisation that simulates a realistic algorithm update spike around day 15."""
            ),
            (
                "Which API providers are supported?",
                """Three SERP data providers are supported out of the box:

- **[Serper.dev](https://serper.dev)** — Fastest, cheapest (₹0.40/query approx). Recommended for most users.
- **[SerpAPI](https://serpapi.com)** — Most reliable, higher cost.
- **DataForSEO** — Enterprise-grade, bulk queries.

Set `SERP_PROVIDER` and `SERP_API_KEY` environment variables to switch providers. At 150 keywords × 2 devices = ~300 API calls/day."""
            ),
            (
                "How is this different from SEMrush Sensor?",
                """SEMrush Sensor tracks global (primarily US) keywords. **India SERP Pulse** is purpose-built for `google.co.in`:

- All keywords are India-specific (Hindi, English, regional).
- Categories reflect the Indian market (BFSI, OTT, Government portals, etc.).
- Mobile vs Desktop split is calibrated for India's mobile-first internet population.
- Fully open-source and self-hostable — no subscription required."""
            ),
        ]

        for question, answer in faqs:
            with st.expander(question):
                st.markdown(answer)

        st.markdown("---")
        st.markdown(
            "**Built by [AI Vidhyarthi](https://github.com/aividhyarthi)** | "
            "Data: Google.co.in via Serper.dev / SerpAPI | "
            "Open-source on GitHub"
        )

    # --- Footer ---
    st.markdown(
        "<div style='text-align:center; color:#aaa; font-size:0.8rem; margin-top:32px;'>"
        "India SERP Pulse · google.co.in · Updated daily"
        "</div>",
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()
