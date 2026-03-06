"""
Generate a static HTML dashboard for India SERP Volatility Tracker.
Opens directly in any browser — no server needed.

Usage:
    python serp_volatility/dashboard/generate_html.py
"""

import sys
import json
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from serp_volatility.config import CATEGORIES, TrackerConfig
from serp_volatility.storage.sqlite_store import SQLiteStore
from serp_volatility.analysis.volatility import VolatilityCalculator


def get_score_color(score):
    if score < 2.0:
        return "#00c853"
    elif score < 5.0:
        return "#ffd600"
    elif score < 8.0:
        return "#ff6d00"
    return "#d50000"


def get_level(score):
    if score < 2.0:
        return "Low"
    elif score < 5.0:
        return "Normal"
    elif score < 8.0:
        return "High"
    return "Very High"


def generate():
    config = TrackerConfig()
    storage = SQLiteStore(config.sqlite_path)
    calculator = VolatilityCalculator(storage, config)

    # Get latest data
    today = date.today()
    today_data = calculator.compute_overall_volatility(today, "desktop")
    if today_data["overall_score"] == 0:
        today = today - timedelta(days=1)
        today_data = calculator.compute_overall_volatility(today, "desktop")

    # History
    history = storage.get_volatility_history(30, "desktop", "overall")
    history_dates = [h["score_date"] for h in history if h["score"] > 0]
    history_scores = [h["score"] for h in history if h["score"] > 0]

    # Category scores
    sorted_cats = sorted(
        today_data["category_scores"].items(),
        key=lambda x: x[1],
        reverse=True,
    )
    cat_names = [CATEGORIES.get(c, c) for c, _ in sorted_cats]
    cat_scores = [s for _, s in sorted_cats]
    cat_colors = [get_score_color(s) for s in cat_scores]

    # Category history for top 5
    cat_history_data = {}
    for cat, _ in sorted_cats[:5]:
        cat_hist = storage.get_volatility_history(30, "desktop", cat)
        if cat_hist:
            cat_history_data[CATEGORIES.get(cat, cat)] = {
                "dates": [h["score_date"] for h in cat_hist if h.get("score", 0) > 0],
                "scores": [h["score"] for h in cat_hist if h.get("score", 0) > 0],
            }

    overall_score = today_data["overall_score"]
    overall_level = today_data["level"]
    overall_color = get_score_color(overall_score)
    score_class = "low" if overall_score < 2 else "normal" if overall_score < 5 else "high" if overall_score < 8 else "veryhigh"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>India SERP Volatility Tracker</title>
    <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f1117;
            color: #fafafa;
            min-height: 100vh;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}

        header {{
            text-align: center;
            padding: 30px 0 10px;
        }}
        header h1 {{
            font-size: 28px;
            font-weight: 700;
            color: #fafafa;
        }}
        header p {{
            color: #888;
            font-size: 14px;
            margin-top: 5px;
        }}

        .score-section {{
            display: flex;
            gap: 20px;
            margin: 30px 0;
            align-items: stretch;
        }}
        .big-score {{
            flex: 2;
            text-align: center;
            padding: 40px 20px;
            border-radius: 16px;
            color: white;
        }}
        .big-score.low {{ background: linear-gradient(135deg, #00c853, #69f0ae); }}
        .big-score.normal {{ background: linear-gradient(135deg, #f9a825, #fdd835); color: #333; }}
        .big-score.high {{ background: linear-gradient(135deg, #ff6d00, #ffab40); }}
        .big-score.veryhigh {{ background: linear-gradient(135deg, #d50000, #ff5252); }}
        .big-score .number {{ font-size: 80px; font-weight: 800; line-height: 1; }}
        .big-score .label {{ font-size: 22px; margin-top: 8px; opacity: 0.9; }}
        .big-score .sublabel {{ font-size: 13px; margin-top: 4px; opacity: 0.7; }}

        .stats-card {{
            flex: 1;
            background: #1a1c23;
            border-radius: 16px;
            padding: 25px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 20px;
        }}
        .stat {{ text-align: center; }}
        .stat .value {{ font-size: 32px; font-weight: 700; color: #4fc3f7; }}
        .stat .desc {{ font-size: 12px; color: #888; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }}

        .card {{
            background: #1a1c23;
            border-radius: 16px;
            padding: 25px;
            margin: 20px 0;
        }}
        .card h2 {{
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #ccc;
        }}

        .scale-ref {{
            display: flex;
            gap: 15px;
            justify-content: center;
            margin: 15px 0;
            flex-wrap: wrap;
        }}
        .scale-item {{
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #999;
        }}
        .scale-dot {{
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }}

        .cat-row {{
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #2a2d35;
        }}
        .cat-row:last-child {{ border-bottom: none; }}
        .cat-name {{ flex: 1; font-size: 14px; color: #ccc; }}
        .cat-bar-container {{ flex: 2; height: 24px; background: #2a2d35; border-radius: 12px; overflow: hidden; position: relative; }}
        .cat-bar {{ height: 100%; border-radius: 12px; transition: width 0.5s ease; }}
        .cat-score {{ width: 80px; text-align: right; font-size: 16px; font-weight: 600; }}
        .cat-level {{ width: 80px; text-align: right; font-size: 12px; color: #888; }}

        footer {{
            text-align: center;
            padding: 30px 0;
            color: #555;
            font-size: 12px;
        }}

        @media (max-width: 768px) {{
            .score-section {{ flex-direction: column; }}
            .cat-row {{ flex-wrap: wrap; gap: 5px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>India SERP Volatility Tracker</h1>
            <p>Like SEMrush Sensor — but for India (google.co.in) | Tracks ranking fluctuations across 15 categories</p>
        </header>

        <div class="scale-ref">
            <div class="scale-item"><div class="scale-dot" style="background:#00c853"></div> 0-2 Low (Stable)</div>
            <div class="scale-item"><div class="scale-dot" style="background:#ffd600"></div> 2-5 Normal</div>
            <div class="scale-item"><div class="scale-dot" style="background:#ff6d00"></div> 5-8 High</div>
            <div class="scale-item"><div class="scale-dot" style="background:#d50000"></div> 8-10 Very High (Algo Update)</div>
        </div>

        <div class="score-section">
            <div class="big-score {score_class}">
                <div class="number">{overall_score}</div>
                <div class="label">{overall_level}</div>
                <div class="sublabel">{today.strftime('%B %d, %Y')} &middot; Desktop</div>
            </div>
            <div class="stats-card">
                <div class="stat">
                    <div class="value">{today_data['keywords_tracked']}</div>
                    <div class="desc">Keywords Tracked</div>
                </div>
                <div class="stat">
                    <div class="value">{len(today_data['category_scores'])}</div>
                    <div class="desc">Categories</div>
                </div>
                <div class="stat">
                    <div class="value">IN</div>
                    <div class="desc">Country (google.co.in)</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Volatility Over Time (Last 30 Days)</h2>
            <div id="history-chart"></div>
        </div>

        <div class="card">
            <h2>Category Breakdown</h2>
            <div id="category-chart"></div>
        </div>

        <div class="card">
            <h2>Category Details</h2>
            {"".join(f'''
            <div class="cat-row">
                <div class="cat-name">{name}</div>
                <div class="cat-bar-container">
                    <div class="cat-bar" style="width:{score*10}%; background:{get_score_color(score)};"></div>
                </div>
                <div class="cat-score" style="color:{get_score_color(score)}">{score:.1f}</div>
                <div class="cat-level">{get_level(score)}</div>
            </div>
            ''' for name, score in zip(cat_names, cat_scores))}
        </div>

        <div class="card">
            <h2>Top 5 Categories — Trend Comparison</h2>
            <div id="comparison-chart"></div>
        </div>

        <footer>
            India SERP Volatility Tracker | Powered by Google.co.in SERP Data | Built by AI Vidhyarthi
        </footer>
    </div>

    <script>
        var plotConfig = {{ responsive: true, displayModeBar: false }};
        var darkLayout = {{
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {{ color: '#ccc', family: '-apple-system, sans-serif' }},
            xaxis: {{ gridcolor: '#2a2d35', title: 'Date' }},
            yaxis: {{ gridcolor: '#2a2d35', range: [0, 10], title: 'Volatility Score' }},
            margin: {{ t: 20, b: 50, l: 50, r: 20 }},
            hovermode: 'x unified'
        }};

        // History chart
        var histTrace = {{
            x: {json.dumps(history_dates)},
            y: {json.dumps(history_scores)},
            type: 'scatter',
            mode: 'lines+markers',
            fill: 'tozeroy',
            fillcolor: 'rgba(25, 118, 210, 0.15)',
            line: {{ color: '#1976d2', width: 3 }},
            marker: {{ size: 5 }},
            name: 'Volatility'
        }};

        var histLayout = JSON.parse(JSON.stringify(darkLayout));
        histLayout.shapes = [
            {{ type: 'rect', xref: 'paper', x0: 0, x1: 1, y0: 0, y1: 2, fillcolor: 'green', opacity: 0.04, line: {{ width: 0 }} }},
            {{ type: 'rect', xref: 'paper', x0: 0, x1: 1, y0: 2, y1: 5, fillcolor: 'yellow', opacity: 0.04, line: {{ width: 0 }} }},
            {{ type: 'rect', xref: 'paper', x0: 0, x1: 1, y0: 5, y1: 8, fillcolor: 'orange', opacity: 0.04, line: {{ width: 0 }} }},
            {{ type: 'rect', xref: 'paper', x0: 0, x1: 1, y0: 8, y1: 10, fillcolor: 'red', opacity: 0.04, line: {{ width: 0 }} }}
        ];
        Plotly.newPlot('history-chart', [histTrace], histLayout, plotConfig);

        // Category bar chart
        var catTrace = {{
            y: {json.dumps(cat_names)},
            x: {json.dumps(cat_scores)},
            type: 'bar',
            orientation: 'h',
            marker: {{ color: {json.dumps(cat_colors)} }},
            text: {json.dumps([f"{s:.1f}" for s in cat_scores])},
            textposition: 'outside',
            textfont: {{ color: '#ccc' }}
        }};
        var catLayout = JSON.parse(JSON.stringify(darkLayout));
        catLayout.xaxis = {{ gridcolor: '#2a2d35', range: [0, 10], title: 'Volatility Score' }};
        catLayout.yaxis = {{ gridcolor: '#2a2d35', autorange: 'reversed' }};
        catLayout.height = {max(400, len(sorted_cats) * 35)};
        catLayout.margin = {{ t: 20, b: 50, l: 200, r: 60 }};
        Plotly.newPlot('category-chart', [catTrace], catLayout, plotConfig);

        // Comparison chart
        var compTraces = [];
        var compData = {json.dumps(cat_history_data)};
        var colors = ['#1976d2', '#e91e63', '#00bcd4', '#ff9800', '#4caf50'];
        var i = 0;
        for (var cat in compData) {{
            compTraces.push({{
                x: compData[cat].dates,
                y: compData[cat].scores,
                type: 'scatter',
                mode: 'lines',
                name: cat,
                line: {{ width: 2, color: colors[i % colors.length] }}
            }});
            i++;
        }}
        var compLayout = JSON.parse(JSON.stringify(darkLayout));
        compLayout.legend = {{ orientation: 'h', y: -0.25, font: {{ size: 11 }} }};
        compLayout.height = 400;
        Plotly.newPlot('comparison-chart', compTraces, compLayout, plotConfig);
    </script>
</body>
</html>"""

    output_path = Path(__file__).parent.parent.parent / "india_serp_volatility_dashboard.html"
    output_path.write_text(html)
    print(f"Dashboard generated: {output_path}")
    print(f"Open in browser: file://{output_path.resolve()}")


if __name__ == "__main__":
    generate()
