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
    if storage.get_keyword_count() == 0:
        from serp_volatility.tracker import generate_demo_data
        generate_demo_data(storage)


# --- Page Config ---
st.set_page_config(
    page_title="India SERP Volatility Tracker",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- Custom CSS ---
st.markdown("""
<style>
    .big-score {
        font-size: 72px;
        font-weight: bold;
        text-align: center;
        padding: 20px;
        border-radius: 15px;
        margin: 10px 0;
    }
    .score-low { background: linear-gradient(135deg, #00c853, #69f0ae); color: white; }
    .score-normal { background: linear-gradient(135deg, #ffd600, #ffff8d); color: #333; }
    .score-high { background: linear-gradient(135deg, #ff6d00, #ffab40); color: white; }
    .score-veryhigh { background: linear-gradient(135deg, #d50000, #ff5252); color: white; }
    .category-card {
        padding: 15px;
        border-radius: 10px;
        border-left: 5px solid;
        margin: 5px 0;
        background: #f8f9fa;
    }
    .stMetric { text-align: center; }
</style>
""", unsafe_allow_html=True)


def get_score_class(score: float) -> str:
    if score < 2.0:
        return "score-low"
    elif score < 5.0:
        return "score-normal"
    elif score < 8.0:
        return "score-high"
    return "score-veryhigh"


def get_score_color(score: float) -> str:
    if score < 2.0:
        return "#00c853"
    elif score < 5.0:
        return "#ffd600"
    elif score < 8.0:
        return "#ff6d00"
    return "#d50000"


def main():
    config = TrackerConfig()
    db_path = config.sqlite_path
    storage = SQLiteStore(db_path)
    ensure_demo_data(storage)
    calculator = VolatilityCalculator(storage, config)

    # --- Sidebar ---
    st.sidebar.title("India SERP Volatility")
    st.sidebar.caption("Track Google.co.in ranking fluctuations")

    device = st.sidebar.radio("Device", ["desktop", "mobile"], index=0)
    days_range = st.sidebar.slider("History (days)", 7, 90, 30)

    st.sidebar.markdown("---")
    st.sidebar.markdown("**Scale Reference:**")
    st.sidebar.markdown("- 🟢 0-2: Low (stable)")
    st.sidebar.markdown("- 🟡 2-5: Normal")
    st.sidebar.markdown("- 🟠 5-8: High (fluctuations)")
    st.sidebar.markdown("- 🔴 8-10: Very High (algo update likely)")

    st.sidebar.markdown("---")
    st.sidebar.markdown(
        "Built for **India** market | "
        f"**{storage.get_keyword_count()}** keywords tracked"
    )

    # --- Main Content ---
    st.title("India SERP Volatility Tracker")
    st.caption(
        "Like SEMrush Sensor — but for India (google.co.in) | "
        "Tracks ranking fluctuations across 15 Indian market categories"
    )

    # Today's score
    today = date.today()
    today_data = calculator.compute_overall_volatility(today, device)

    # If no data for today, try yesterday
    if today_data["overall_score"] == 0:
        today = today - timedelta(days=1)
        today_data = calculator.compute_overall_volatility(today, device)

    col1, col2, col3 = st.columns([2, 1, 1])

    with col1:
        score = today_data["overall_score"]
        level = today_data["level"]
        score_class = get_score_class(score)

        st.markdown(
            f'<div class="big-score {score_class}">'
            f'{score}<br><span style="font-size:24px">{level}</span>'
            f'</div>',
            unsafe_allow_html=True,
        )
        st.caption(f"Overall volatility for {today} ({device})")

    with col2:
        st.metric("Keywords Tracked", today_data["keywords_tracked"])
        st.metric("Categories", len(today_data["category_scores"]))

    with col3:
        st.metric("Date", today.strftime("%b %d, %Y"))
        st.metric("Device", device.capitalize())

    st.markdown("---")

    # --- Volatility History Chart ---
    st.subheader("Volatility Over Time")

    history = storage.get_volatility_history(days_range, device, "overall")

    if history:
        df_history = pd.DataFrame(history)
        df_history["score_date"] = pd.to_datetime(df_history["score_date"])

        fig = go.Figure()

        # Add colored background zones
        fig.add_hrect(y0=0, y1=2, fillcolor="green", opacity=0.05, line_width=0)
        fig.add_hrect(y0=2, y1=5, fillcolor="yellow", opacity=0.05, line_width=0)
        fig.add_hrect(y0=5, y1=8, fillcolor="orange", opacity=0.05, line_width=0)
        fig.add_hrect(y0=8, y1=10, fillcolor="red", opacity=0.05, line_width=0)

        # Main line
        fig.add_trace(go.Scatter(
            x=df_history["score_date"],
            y=df_history["score"],
            mode="lines+markers",
            name="Volatility Score",
            line=dict(color="#1976d2", width=3),
            marker=dict(size=6),
            fill="tozeroy",
            fillcolor="rgba(25, 118, 210, 0.1)",
        ))

        fig.update_layout(
            yaxis=dict(range=[0, 10], title="Volatility Score"),
            xaxis=dict(title="Date"),
            height=400,
            margin=dict(t=20, b=40),
            hovermode="x unified",
        )

        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("No historical data yet. Run `python -m serp_volatility demo` to generate demo data.")

    st.markdown("---")

    # --- Category Breakdown ---
    st.subheader("Category Breakdown")

    if today_data["category_scores"]:
        # Sort by score descending
        sorted_cats = sorted(
            today_data["category_scores"].items(),
            key=lambda x: x[1],
            reverse=True,
        )

        # Bar chart
        cat_names = [CATEGORIES.get(c, c) for c, _ in sorted_cats]
        cat_scores = [s for _, s in sorted_cats]
        cat_colors = [get_score_color(s) for s in cat_scores]

        fig_cats = go.Figure(go.Bar(
            x=cat_scores,
            y=cat_names,
            orientation="h",
            marker_color=cat_colors,
            text=[f"{s:.1f}" for s in cat_scores],
            textposition="outside",
        ))

        fig_cats.update_layout(
            xaxis=dict(range=[0, 10], title="Volatility Score"),
            height=max(400, len(sorted_cats) * 35),
            margin=dict(l=200, t=20, b=40),
            yaxis=dict(autorange="reversed"),
        )

        st.plotly_chart(fig_cats, use_container_width=True)

        # Category detail cards in columns
        st.subheader("Category Details")
        cols = st.columns(3)
        for i, (cat, score) in enumerate(sorted_cats):
            col = cols[i % 3]
            cat_name = CATEGORIES.get(cat, cat)
            color = get_score_color(score)
            level = VolatilityCalculator._score_to_level(score)

            with col:
                st.markdown(
                    f'<div class="category-card" style="border-left-color: {color};">'
                    f'<strong>{cat_name}</strong><br>'
                    f'<span style="font-size:28px; color:{color};">{score:.1f}</span> '
                    f'<span style="color:#666;">/ 10 — {level}</span>'
                    f'</div>',
                    unsafe_allow_html=True,
                )

        # Category comparison over time
        st.markdown("---")
        st.subheader("Category Comparison Over Time")

        selected_cats = st.multiselect(
            "Select categories to compare",
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
                    ))

            fig_compare.update_layout(
                yaxis=dict(range=[0, 10], title="Volatility Score"),
                xaxis=dict(title="Date"),
                height=400,
                margin=dict(t=20, b=40),
                hovermode="x unified",
                legend=dict(orientation="h", yanchor="bottom", y=-0.3),
            )
            st.plotly_chart(fig_compare, use_container_width=True)

    else:
        st.info("No category data available. Run data collection first.")

    # --- Footer ---
    st.markdown("---")
    st.caption(
        "India SERP Volatility Tracker | "
        "Powered by Google.co.in SERP data | "
        "Built by AI Vidhyarthi"
    )


if __name__ == "__main__":
    main()
