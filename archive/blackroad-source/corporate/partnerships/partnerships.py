"""
partnerships.py — BlackRoad Ventures Partnership Tracker
"""
import sqlite3, argparse, sys
from pathlib import Path

DB_PATH = Path.home() / ".blackroad" / "partnerships.db"
STATUSES = ["exploring", "in-negotiation", "active", "paused", "inactive"]
STATUS_EMOJI = {"exploring": "🔍", "in-negotiation": "🤝", "active": "✅", "paused": "⏸️", "inactive": "❌"}
PARTNER_TYPES = ["technology", "integration", "reseller", "strategic", "academic", "media", "government"]

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""CREATE TABLE IF NOT EXISTS partnerships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        partner TEXT NOT NULL, type TEXT DEFAULT 'technology',
        status TEXT DEFAULT 'exploring', contact TEXT, notes TEXT,
        value_usd REAL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )""")
    conn.commit()
    return conn

def main():
    ap = argparse.ArgumentParser(prog="partnerships")
    sub = ap.add_subparsers(dest="cmd")

    a = sub.add_parser("add")
    a.add_argument("partner"); a.add_argument("type", nargs="?"); a.add_argument("status", nargs="?")
    a.add_argument("contact", nargs="?"); a.add_argument("notes", nargs="?"); a.add_argument("--value", type=float, default=0)

    ls = sub.add_parser("list"); ls.add_argument("status", nargs="?")
    up = sub.add_parser("update"); up.add_argument("id", type=int); up.add_argument("status")
    sub.add_parser("report")

    args = ap.parse_args()
    conn = init_db()

    if args.cmd == "add":
        ptype = args.type if args.type in PARTNER_TYPES else "technology"
        st = args.status if args.status in STATUSES else "exploring"
        conn.execute("INSERT INTO partnerships (partner, type, status, contact, notes, value_usd) VALUES (?,?,?,?,?,?)",
                     [args.partner, ptype, st, args.contact or "", args.notes or "", args.value])
        conn.commit()
        print(f"Added: {args.partner} [{ptype}] {STATUS_EMOJI[st]}")

    elif args.cmd == "list":
        filt = args.status if hasattr(args, "status") and args.status in STATUSES else None
        q = "SELECT * FROM partnerships WHERE status=? ORDER BY partner" if filt else "SELECT * FROM partnerships ORDER BY status, partner"
        rows = conn.execute(q, [filt] if filt else []).fetchall()
        print(f"{'#':<4} {'Partner':<30} {'Type':<14} {'Status':<16} {'Contact'}")
        print("-" * 85)
        for r in rows:
            print(f"{r['id']:<4} {r['partner']:<30} {r['type']:<14} {STATUS_EMOJI.get(r['status'],'·')} {r['status']:<14} {r['contact'] or '—'}")
        print(f"\n  {len(rows)} partnerships")

    elif args.cmd == "update":
        if args.status not in STATUSES:
            print(f"Invalid status. Choose: {', '.join(STATUSES)}"); sys.exit(1)
        conn.execute("UPDATE partnerships SET status=?, updated_at=datetime('now') WHERE id=?", [args.status, args.id])
        conn.commit()
        print(f"Partnership #{args.id} → {STATUS_EMOJI[args.status]} {args.status}")

    elif args.cmd == "report":
        print("\n🌐 BlackRoad Ventures — Partnership Report\n")
        for st in STATUSES:
            rows = conn.execute("SELECT * FROM partnerships WHERE status=?", [st]).fetchall()
            if rows:
                print(f"  {STATUS_EMOJI[st]} {st.upper()}")
                for r in rows:
                    val = f" ${r['value_usd']:,.0f}" if r['value_usd'] else ""
                    print(f"     • {r['partner']} [{r['type']}]{val}")
        active = conn.execute("SELECT COUNT(*) as n, SUM(value_usd) as v FROM partnerships WHERE status='active'").fetchone()
        print(f"\n  Active: {active['n']} | Est. value: ${active['v'] or 0:,.0f}")

    else:
        ap.print_help()
    conn.close()

if __name__ == "__main__":
    main()
