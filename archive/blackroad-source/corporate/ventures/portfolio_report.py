#!/usr/bin/env python3
"""BlackRoad Ventures — Portfolio Report Generator.

Generates structured portfolio performance reports from the SQLite tracker.
Outputs: markdown, HTML, or JSON.

Usage:
  python portfolio_report.py --format markdown
  python portfolio_report.py --format html --output report.html
"""

from __future__ import annotations
import argparse
import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path.home() / ".blackroad" / "portfolio.db"


def _db() -> sqlite3.Connection:
    return sqlite3.connect(str(DB_PATH))


def load_data() -> dict:
    conn = _db()
    conn.row_factory = sqlite3.Row
    
    try:
        companies = conn.execute("SELECT * FROM companies ORDER BY investment_amount DESC").fetchall()
        deals = conn.execute("SELECT * FROM deal_pipeline ORDER BY created_at DESC").fetchall()
        partners = conn.execute("SELECT * FROM partnerships ORDER BY created_at DESC LIMIT 10").fetchall() if _table_exists(conn, "partnerships") else []
    except Exception:
        return {"companies": [], "deals": [], "partners": []}
    
    return {
        "companies": [dict(r) for r in companies],
        "deals": [dict(r) for r in deals],
        "partners": [dict(r) for r in partners],
    }


def _table_exists(conn, name: str) -> bool:
    return bool(conn.execute(
        "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?", (name,)
    ).fetchone()[0])


def generate_markdown(data: dict) -> str:
    companies = data["companies"]
    deals = data["deals"]
    now = datetime.utcnow().strftime("%Y-%m-%d")
    
    total_invested = sum(c.get("investment_amount", 0) for c in companies)
    total_valuation = sum(c.get("current_valuation", 0) for c in companies)
    
    lines = [
        f"# BlackRoad Ventures — Portfolio Report",
        f"",
        f"**Generated:** {now}  ",
        f"**Portfolio Size:** {len(companies)} companies  ",
        f"**Total Invested:** ${total_invested:,.0f}  ",
        f"**Total Valuation:** ${total_valuation:,.0f}  ",
        f"**Unrealized Return:** {((total_valuation / total_invested - 1) * 100):.1f}%" if total_invested else "",
        f"",
        f"## Portfolio Companies",
        f"",
        f"| Company | Stage | Invested | Valuation | Multiple |",
        f"|---------|-------|----------|-----------|----------|",
    ]
    
    for c in companies:
        inv = c.get("investment_amount", 0)
        val = c.get("current_valuation", 0)
        mult = f"{val/inv:.1f}x" if inv else "—"
        lines.append(
            f"| {c.get('name','?')} | {c.get('stage','?')} | "
            f"${inv:,.0f} | ${val:,.0f} | {mult} |"
        )
    
    lines += ["", "## Deal Pipeline", "", f"| Deal | Stage | Amount | Owner |", f"|------|-------|--------|-------|"]
    
    for d in deals[:10]:
        lines.append(
            f"| {d.get('company','?')} | {d.get('stage','?')} | "
            f"${d.get('amount',0):,.0f} | {d.get('assigned_to','—')} |"
        )
    
    return "\n".join(lines)


def generate_html(data: dict) -> str:
    md = generate_markdown(data)
    # Simple markdown → HTML (no deps)
    lines = md.split("\n")
    html_lines = ["<!DOCTYPE html><html lang='en'><head>",
                  "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
                  "<title>BlackRoad Ventures Report</title>",
                  "<style>body{font-family:-apple-system,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;background:#0a0a0a;color:#e5e5e5}",
                  "h1{background:linear-gradient(135deg,#F5A623,#FF1D6C,#9C27B0,#2979FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent}",
                  "table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px 12px;border:1px solid #333;text-align:left}th{background:#1a1a1a}</style>",
                  "</head><body>"]
    
    in_table = False
    for line in lines:
        if line.startswith("# "): html_lines.append(f"<h1>{line[2:]}</h1>")
        elif line.startswith("## "): html_lines.append(f"<h2>{line[3:]}</h2>")
        elif line.startswith("|"):
            if not in_table:
                html_lines.append("<table>")
                in_table = True
            cells = [c.strip() for c in line.split("|")[1:-1]]
            if all(set(c) <= set("-: ") for c in cells):
                continue
            is_header = in_table and html_lines[-1] == "<table>"
            tag = "th" if is_header else "td"
            html_lines.append("<tr>" + "".join(f"<{tag}>{c}</{tag}>" for c in cells) + "</tr>")
        else:
            if in_table:
                html_lines.append("</table>")
                in_table = False
            if line.startswith("**"): html_lines.append(f"<p>{line}</p>")
            elif line: html_lines.append(f"<p>{line}</p>")
    
    if in_table:
        html_lines.append("</table>")
    html_lines.append("</body></html>")
    return "\n".join(html_lines)


def main():
    parser = argparse.ArgumentParser(description="Portfolio Report Generator")
    parser.add_argument("--format", choices=["markdown", "html", "json"], default="markdown")
    parser.add_argument("--output", help="Output file")
    args = parser.parse_args()

    data = load_data()

    if args.format == "markdown":
        result = generate_markdown(data)
    elif args.format == "html":
        result = generate_html(data)
    else:
        result = json.dumps(data, indent=2, default=str)

    if args.output:
        Path(args.output).write_text(result)
        print(f"✓ Report written to {args.output}")
    else:
        print(result)


if __name__ == "__main__":
    main()
