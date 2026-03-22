#!/usr/bin/env python3
"""
BlackRoad Labs — Agent Metrics Visualization
Plotly dashboard for real-time agent telemetry.
Run: python3 visualize.py [--port 8050]
"""
import argparse, random, math
from datetime import datetime, timedelta

try:
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    HAS_PLOTLY = True
except ImportError:
    HAS_PLOTLY = False

AGENTS = ["LUCIDIA", "ALICE", "OCTAVIA", "PRISM", "ECHO", "CIPHER"]
COLORS = {
    "LUCIDIA": "#EF4444", "ALICE": "#3B82F6", "OCTAVIA": "#22C55E",
    "PRISM": "#EAB308", "ECHO": "#A855F7", "CIPHER": "#06B6D4",
}


def mock_timeseries(n: int = 50) -> list[datetime]:
    now = datetime.now()
    return [now - timedelta(minutes=n - i) for i in range(n)]


def mock_tasks(agent: str, n: int = 50) -> list[float]:
    base = {"LUCIDIA": 12, "ALICE": 180, "OCTAVIA": 95, "PRISM": 40, "ECHO": 28, "CIPHER": 130}[agent]
    return [max(0, base + random.gauss(0, base * 0.15) + 5 * math.sin(i / 8)) for i in range(n)]


def build_dashboard() -> "go.Figure":
    if not HAS_PLOTLY:
        raise ImportError("pip install plotly")

    ts = mock_timeseries()
    fig = make_subplots(
        rows=2, cols=3,
        subplot_titles=[f"{a} Tasks/min" for a in AGENTS],
        shared_xaxes=True,
    )

    for i, agent in enumerate(AGENTS):
        row, col = divmod(i, 3)
        data = mock_tasks(agent)
        fig.add_trace(
            go.Scatter(x=ts, y=data, mode="lines+markers",
                       name=agent, line=dict(color=COLORS[agent], width=2),
                       marker=dict(size=4), fill="tozeroy",
                       fillcolor=COLORS[agent] + "22"),
            row=row + 1, col=col + 1,
        )

    fig.update_layout(
        title="BlackRoad Agent Metrics Dashboard",
        paper_bgcolor="#000000", plot_bgcolor="#0a0a0a",
        font=dict(color="#ffffff", family="SF Mono, monospace"),
        showlegend=False, height=700,
        title_font=dict(size=20),
    )
    fig.update_xaxes(gridcolor="#222", color="#666")
    fig.update_yaxes(gridcolor="#222", color="#666")
    return fig


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8050)
    parser.add_argument("--save", help="Save to HTML file instead of serving")
    args = parser.parse_args()

    fig = build_dashboard()
    if args.save:
        fig.write_html(args.save)
        print(f"Saved to {args.save}")
    else:
        try:
            import dash
            app = dash.Dash(__name__)
            app.layout = dash.html.Div([
                dash.dcc.Graph(figure=fig, style={"height": "100vh"}),
            ])
            print(f"Dashboard at http://localhost:{args.port}")
            app.run(debug=False, port=args.port)
        except ImportError:
            fig.write_html("/tmp/blackroad-metrics.html")
            print("Dash not installed. Saved to /tmp/blackroad-metrics.html")
            print("Install with: pip install dash plotly")
