#!/usr/bin/env python3
"""
BlackRoad Ventures — Cap Table Manager
=======================================
Track shareholders, share classes, dilution events, vesting schedules,
and model liquidation waterfalls for exit scenarios.

Usage:
    cap_table create <cap_table_id> <company>
    cap_table add-shareholder <cap_table_id> <name> <shares> <price> [options]
    cap_table dilute <cap_table_id> <new_shares> <price>
    cap_table ownership <cap_table_id> [--shareholder ID]
    cap_table fully-diluted <cap_table_id>
    cap_table waterfall <cap_table_id> <exit_value>
    cap_table export-csv <cap_table_id> [--out FILE]
    cap_table list
    cap_table demo
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import sqlite3
import sys
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# ─── Database ─────────────────────────────────────────────────────────────────

DB_PATH = Path.home() / ".blackroad" / "ventures_captable.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS cap_tables (
    id           TEXT PRIMARY KEY,
    company      TEXT NOT NULL,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shareholders (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    cap_table_id     TEXT NOT NULL REFERENCES cap_tables(id),
    name             TEXT NOT NULL,
    shareholder_type TEXT NOT NULL DEFAULT 'individual',
    shares           REAL NOT NULL CHECK (shares >= 0),
    share_class      TEXT NOT NULL DEFAULT 'common',
    price_per_share  REAL NOT NULL DEFAULT 0.0,
    options          REAL NOT NULL DEFAULT 0.0,
    vesting_months   INTEGER NOT NULL DEFAULT 0,
    cliff_months     INTEGER NOT NULL DEFAULT 0,
    vesting_start    TEXT,
    notes            TEXT NOT NULL DEFAULT '',
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dilution_events (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    cap_table_id     TEXT NOT NULL,
    event_type       TEXT NOT NULL,
    new_shares       REAL NOT NULL,
    price_per_share  REAL NOT NULL,
    pre_money_val    REAL,
    post_money_val   REAL,
    notes            TEXT NOT NULL DEFAULT '',
    occurred_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sh_captable ON shareholders (cap_table_id);
CREATE INDEX IF NOT EXISTS idx_dil_captable ON dilution_events (cap_table_id);
"""

VALID_SHARE_CLASSES = frozenset(
    {"common", "preferred_a", "preferred_b", "preferred_c", "safe", "convertible"}
)
VALID_SHAREHOLDER_TYPES = frozenset(
    {"founder", "employee", "investor", "advisor", "individual", "institution", "trust"}
)

# Liquidation preference multipliers by share class (preferred gets 1× first)
LIQUIDATION_PREFERENCE = {
    "common":      0.0,
    "preferred_a": 1.0,
    "preferred_b": 1.0,
    "preferred_c": 1.0,
    "safe":        1.0,
    "convertible": 1.0,
}


# ─── Dataclasses ─────────────────────────────────────────────────────────────


@dataclass
class Shareholder:
    """A single entry on the cap table."""

    name: str
    shareholder_type: str
    shares: float
    share_class: str
    price_per_share: float
    options: float = 0.0
    vesting_months: int = 0
    cliff_months: int = 0
    vesting_start: Optional[str] = None
    notes: str = ""
    id: Optional[int] = None

    @property
    def investment(self) -> float:
        """Total capital invested."""
        return self.shares * self.price_per_share

    @property
    def total_diluted_shares(self) -> float:
        """Shares + options (fully diluted basis)."""
        return self.shares + self.options

    def vested_shares(self, as_of: Optional[date] = None) -> float:
        """
        Calculate vested shares for employees/advisors.
        Uses standard 4-year / 1-year cliff schedule if vesting configured.
        """
        if self.vesting_months == 0 or self.vesting_start is None:
            return self.shares

        target_date = as_of or date.today()
        start = date.fromisoformat(self.vesting_start)
        months_elapsed = (
            (target_date.year - start.year) * 12
            + (target_date.month - start.month)
        )

        if months_elapsed < self.cliff_months:
            return 0.0

        vested_pct = min(months_elapsed / self.vesting_months, 1.0)
        return round(self.shares * vested_pct, 2)


@dataclass
class CapTable:
    """A company cap table aggregating all shareholders."""

    id: str
    company: str
    shareholders: List[Shareholder] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    @property
    def total_shares(self) -> float:
        return sum(s.shares for s in self.shareholders)

    @property
    def total_fully_diluted(self) -> float:
        return sum(s.total_diluted_shares for s in self.shareholders)

    @property
    def total_raised(self) -> float:
        return sum(s.investment for s in self.shareholders)

    @property
    def implied_valuation(self) -> float:
        """Post-money valuation from latest preferred round price."""
        preferred = [
            s for s in self.shareholders
            if s.share_class != "common" and s.price_per_share > 0
        ]
        if not preferred:
            return 0.0
        latest_price = max(s.price_per_share for s in preferred)
        return self.total_fully_diluted * latest_price


# ─── Storage ─────────────────────────────────────────────────────────────────


class CapTableStore:
    def __init__(self, db_path: Path = DB_PATH):
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(db_path))
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    def _now(self) -> str:
        return datetime.utcnow().isoformat()

    # ── Cap table CRUD ────────────────────────────────────────────────────────

    def create(self, ct: CapTable) -> CapTable:
        now = self._now()
        self.conn.execute(
            "INSERT OR IGNORE INTO cap_tables (id, company, created_at, updated_at) "
            "VALUES (?,?,?,?)",
            (ct.id, ct.company, now, now),
        )
        self.conn.commit()
        return ct

    def get(self, cap_table_id: str) -> Optional[CapTable]:
        row = self.conn.execute(
            "SELECT * FROM cap_tables WHERE id=?", (cap_table_id,)
        ).fetchone()
        if not row:
            return None
        shareholders = self._load_shareholders(cap_table_id)
        return CapTable(
            id=row["id"],
            company=row["company"],
            shareholders=shareholders,
            created_at=row["created_at"],
        )

    def list_all(self) -> List[dict]:
        rows = self.conn.execute(
            "SELECT id, company, created_at FROM cap_tables ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]

    def delete(self, cap_table_id: str) -> bool:
        cur = self.conn.execute(
            "DELETE FROM cap_tables WHERE id=?", (cap_table_id,)
        )
        self.conn.execute(
            "DELETE FROM shareholders WHERE cap_table_id=?", (cap_table_id,)
        )
        self.conn.execute(
            "DELETE FROM dilution_events WHERE cap_table_id=?", (cap_table_id,)
        )
        self.conn.commit()
        return cur.rowcount > 0

    # ── Shareholder operations ────────────────────────────────────────────────

    def add_shareholder(self, cap_table_id: str, sh: Shareholder) -> int:
        now = self._now()
        cur = self.conn.execute(
            """
            INSERT INTO shareholders
                (cap_table_id, name, shareholder_type, shares, share_class,
                 price_per_share, options, vesting_months, cliff_months,
                 vesting_start, notes, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                cap_table_id, sh.name, sh.shareholder_type, sh.shares,
                sh.share_class, sh.price_per_share, sh.options,
                sh.vesting_months, sh.cliff_months,
                sh.vesting_start, sh.notes, now, now,
            ),
        )
        self.conn.commit()
        return cur.lastrowid

    def update_shareholder_shares(
        self, shareholder_id: int, new_shares: float
    ) -> None:
        self.conn.execute(
            "UPDATE shareholders SET shares=?, updated_at=? WHERE id=?",
            (new_shares, self._now(), shareholder_id),
        )
        self.conn.commit()

    def log_dilution(
        self,
        cap_table_id: str,
        event_type: str,
        new_shares: float,
        price: float,
        pre_money: Optional[float] = None,
        post_money: Optional[float] = None,
        notes: str = "",
    ) -> None:
        self.conn.execute(
            "INSERT INTO dilution_events "
            "(cap_table_id, event_type, new_shares, price_per_share, "
            " pre_money_val, post_money_val, notes, occurred_at) "
            "VALUES (?,?,?,?,?,?,?,?)",
            (cap_table_id, event_type, new_shares, price,
             pre_money, post_money, notes, self._now()),
        )
        self.conn.commit()

    def get_dilution_history(self, cap_table_id: str) -> List[dict]:
        rows = self.conn.execute(
            "SELECT * FROM dilution_events WHERE cap_table_id=? "
            "ORDER BY occurred_at DESC",
            (cap_table_id,),
        ).fetchall()
        return [dict(r) for r in rows]

    def _load_shareholders(self, cap_table_id: str) -> List[Shareholder]:
        rows = self.conn.execute(
            "SELECT * FROM shareholders WHERE cap_table_id=? ORDER BY shares DESC",
            (cap_table_id,),
        ).fetchall()
        return [
            Shareholder(
                id=r["id"],
                name=r["name"],
                shareholder_type=r["shareholder_type"],
                shares=r["shares"],
                share_class=r["share_class"],
                price_per_share=r["price_per_share"],
                options=r["options"],
                vesting_months=r["vesting_months"],
                cliff_months=r["cliff_months"],
                vesting_start=r["vesting_start"],
                notes=r["notes"],
            )
            for r in rows
        ]

    def close(self) -> None:
        self.conn.close()


# ─── Cap table manager ────────────────────────────────────────────────────────


class CapTableManager:
    """High-level API for cap table operations."""

    def __init__(self, db_path: Path = DB_PATH):
        self.store = CapTableStore(db_path)

    def create(self, cap_table_id: str, company: str) -> CapTable:
        ct = CapTable(id=cap_table_id, company=company)
        return self.store.create(ct)

    def add_shareholder(self, cap_table_id: str, sh: Shareholder) -> int:
        if sh.share_class not in VALID_SHARE_CLASSES:
            raise ValueError(
                f"Invalid share class {sh.share_class!r}. "
                f"Valid: {sorted(VALID_SHARE_CLASSES)}"
            )
        if sh.shareholder_type not in VALID_SHAREHOLDER_TYPES:
            raise ValueError(
                f"Invalid shareholder type {sh.shareholder_type!r}. "
                f"Valid: {sorted(VALID_SHAREHOLDER_TYPES)}"
            )
        return self.store.add_shareholder(cap_table_id, sh)

    def dilute(
        self,
        cap_table_id: str,
        new_shares: float,
        new_price: float,
        event_type: str = "round",
        notes: str = "",
    ) -> dict:
        """
        Issue new_shares at new_price.
        Returns dilution summary with pre/post ownership percentages.
        """
        ct = self._require(cap_table_id)
        pre_total = ct.total_shares
        pre_money = pre_total * new_price
        post_money = pre_money + new_shares * new_price

        self.store.log_dilution(
            cap_table_id=cap_table_id,
            event_type=event_type,
            new_shares=new_shares,
            price=new_price,
            pre_money=pre_money,
            post_money=post_money,
            notes=notes,
        )
        return {
            "event_type": event_type,
            "new_shares": new_shares,
            "price_per_share": new_price,
            "pre_money_valuation": round(pre_money, 2),
            "post_money_valuation": round(post_money, 2),
            "pre_total_shares": pre_total,
            "post_total_shares": pre_total + new_shares,
            "dilution_pct": round(new_shares / (pre_total + new_shares) * 100, 2),
        }

    def get_ownership_pct(self, cap_table_id: str) -> List[dict]:
        """Return ownership percentages for all shareholders (basic + fully diluted)."""
        ct = self._require(cap_table_id)
        total = ct.total_shares
        total_fd = ct.total_fully_diluted
        result = []
        for sh in ct.shareholders:
            result.append(
                {
                    "id": sh.id,
                    "name": sh.name,
                    "type": sh.shareholder_type,
                    "share_class": sh.share_class,
                    "shares": sh.shares,
                    "options": sh.options,
                    "total_diluted": sh.total_diluted_shares,
                    "ownership_pct": round(sh.shares / total * 100, 4) if total else 0.0,
                    "ownership_pct_fd": round(
                        sh.total_diluted_shares / total_fd * 100, 4
                    ) if total_fd else 0.0,
                    "investment": round(sh.investment, 2),
                    "vested_shares": sh.vested_shares(),
                }
            )
        return sorted(result, key=lambda x: x["ownership_pct"], reverse=True)

    def calculate_fully_diluted(self, cap_table_id: str) -> dict:
        """Fully-diluted share count and implied metrics."""
        ct = self._require(cap_table_id)
        return {
            "cap_table_id": cap_table_id,
            "company": ct.company,
            "total_shares_basic": round(ct.total_shares, 2),
            "total_shares_fully_diluted": round(ct.total_fully_diluted, 2),
            "total_options_pool": round(
                sum(s.options for s in ct.shareholders), 2
            ),
            "total_raised": round(ct.total_raised, 2),
            "implied_valuation": round(ct.implied_valuation, 2),
            "shareholder_count": len(ct.shareholders),
        }

    def waterfall_analysis(
        self, cap_table_id: str, exit_value: float
    ) -> dict:
        """
        Simulate a liquidation waterfall.
        Priority: preferred shareholders recover 1× investment first
                  (participating preferred), then remainder pro-rata.
        """
        ct = self._require(cap_table_id)
        remaining = exit_value
        payouts: Dict[str, float] = {sh.name: 0.0 for sh in ct.shareholders}

        # Phase 1 — liquidation preferences (preferred shares get 1× investment)
        preferred = [
            sh for sh in ct.shareholders
            if LIQUIDATION_PREFERENCE.get(sh.share_class, 0) > 0
        ]
        common = [
            sh for sh in ct.shareholders
            if LIQUIDATION_PREFERENCE.get(sh.share_class, 0) == 0
        ]

        phase1_total = sum(sh.investment for sh in preferred)
        if remaining >= phase1_total:
            for sh in preferred:
                payouts[sh.name] += sh.investment
            remaining -= phase1_total
        else:
            # Pro-rate among preferred if exit < total preferences
            for sh in preferred:
                pct = sh.investment / phase1_total if phase1_total else 0
                payouts[sh.name] += round(remaining * pct, 2)
            remaining = 0.0

        # Phase 2 — remaining split pro-rata on fully-diluted basis
        if remaining > 0:
            total_fd = ct.total_fully_diluted
            if total_fd > 0:
                for sh in ct.shareholders:
                    pct = sh.total_diluted_shares / total_fd
                    payouts[sh.name] += round(remaining * pct, 2)

        rows = []
        for sh in sorted(ct.shareholders, key=lambda x: payouts.get(x.name, 0), reverse=True):
            payout = payouts.get(sh.name, 0.0)
            rows.append(
                {
                    "name": sh.name,
                    "share_class": sh.share_class,
                    "shares": sh.shares,
                    "investment": round(sh.investment, 2),
                    "payout": round(payout, 2),
                    "moic": round(payout / sh.investment, 2) if sh.investment else None,
                    "pct_of_exit": round(payout / exit_value * 100, 2) if exit_value else 0.0,
                }
            )

        return {
            "cap_table_id": cap_table_id,
            "company": ct.company,
            "exit_value": exit_value,
            "total_distributed": round(sum(payouts.values()), 2),
            "undistributed": round(exit_value - sum(payouts.values()), 2),
            "waterfall": rows,
        }

    def export_csv(self, cap_table_id: str) -> str:
        """Export full cap table to CSV string."""
        ownership = self.get_ownership_pct(cap_table_id)
        fd = self.calculate_fully_diluted(cap_table_id)
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(
            [
                "company", "id", "name", "type", "share_class",
                "shares", "options", "total_diluted",
                "ownership_pct", "ownership_pct_fd",
                "investment", "vested_shares",
            ]
        )
        for row in ownership:
            writer.writerow(
                [
                    fd["company"],
                    row["id"], row["name"], row["type"], row["share_class"],
                    row["shares"], row["options"], row["total_diluted"],
                    row["ownership_pct"], row["ownership_pct_fd"],
                    row["investment"], row["vested_shares"],
                ]
            )
        return buf.getvalue()

    def _require(self, cap_table_id: str) -> CapTable:
        ct = self.store.get(cap_table_id)
        if ct is None:
            raise ValueError(f"Cap table {cap_table_id!r} not found")
        return ct

    def close(self) -> None:
        self.store.close()


# ─── CLI ─────────────────────────────────────────────────────────────────────


def _j(obj: object) -> None:
    print(json.dumps(obj, indent=2, default=str))


def cmd_ct_create(args, mgr: CapTableManager) -> None:
    ct = mgr.create(args.id, args.company)
    print(f"✅  Created cap table '{ct.company}' (id={ct.id})")


def cmd_ct_add(args, mgr: CapTableManager) -> None:
    sh = Shareholder(
        name=args.name,
        shareholder_type=args.type,
        shares=args.shares,
        share_class=args.share_class,
        price_per_share=args.price,
        options=args.options,
        vesting_months=args.vesting,
        cliff_months=args.cliff,
        vesting_start=args.vesting_start,
        notes=args.notes,
    )
    row_id = mgr.add_shareholder(args.cap_table, sh)
    print(f"✅  Added shareholder '{args.name}' (row id={row_id})")


def cmd_ct_dilute(args, mgr: CapTableManager) -> None:
    result = mgr.dilute(args.cap_table, args.new_shares, args.price, args.type, args.notes)
    _j(result)


def cmd_ct_ownership(args, mgr: CapTableManager) -> None:
    ownership = mgr.get_ownership_pct(args.cap_table)
    if args.shareholder:
        ownership = [o for o in ownership if str(o["id"]) == args.shareholder]
    _j(ownership)


def cmd_ct_fully_diluted(args, mgr: CapTableManager) -> None:
    _j(mgr.calculate_fully_diluted(args.cap_table))


def cmd_ct_waterfall(args, mgr: CapTableManager) -> None:
    _j(mgr.waterfall_analysis(args.cap_table, args.exit_value))


def cmd_ct_export_csv(args, mgr: CapTableManager) -> None:
    csv_str = mgr.export_csv(args.cap_table)
    if args.out:
        Path(args.out).write_text(csv_str)
        print(f"✅  Exported to {args.out}")
    else:
        print(csv_str, end="")


def cmd_ct_list(args, mgr: CapTableManager) -> None:
    _j(mgr.store.list_all())


def cmd_ct_demo(args, mgr: CapTableManager) -> None:
    """Seed a realistic Series-A startup cap table."""
    cid = "demo-captable"
    mgr.store.delete(cid)
    mgr.create(cid, "BlackRoad Ventures Portfolio Co")

    shareholders = [
        Shareholder("Alice Founder", "founder", 4_000_000, "common", 0.001,
                    vesting_months=48, cliff_months=12,
                    vesting_start="2022-01-01"),
        Shareholder("Bob Cofounder", "founder", 3_000_000, "common", 0.001,
                    vesting_months=48, cliff_months=12,
                    vesting_start="2022-01-01"),
        Shareholder("Seed Fund I", "institution", 1_000_000, "preferred_a", 1.00),
        Shareholder("Angel Investor", "investor", 500_000, "preferred_a", 1.00),
        Shareholder("Series A Fund", "institution", 2_000_000, "preferred_b", 3.00),
        Shareholder("Employee Pool", "employee", 500_000, "common", 0.001,
                    options=500_000, vesting_months=48, cliff_months=12,
                    vesting_start="2023-01-01"),
        Shareholder("Advisor", "advisor", 0, "common", 0.001, options=50_000,
                    vesting_months=24, cliff_months=6, vesting_start="2023-06-01"),
    ]

    for sh in shareholders:
        mgr.add_shareholder(cid, sh)

    mgr.dilute(cid, 2_000_000, 3.00, "series_a",
               "Series A — $6M at $18M pre-money")

    print(f"✅  Demo cap table created (id={cid})")
    print()
    _j(mgr.calculate_fully_diluted(cid))
    print()
    _j(mgr.waterfall_analysis(cid, 30_000_000))


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="cap_table",
        description="BlackRoad Ventures — Cap Table Manager",
    )
    parser.add_argument("--db", metavar="PATH", help="Override SQLite database path")
    sub = parser.add_subparsers(dest="command", required=True)

    # create
    p = sub.add_parser("create", help="Create a new cap table")
    p.add_argument("id",      help="Unique cap table ID")
    p.add_argument("company", help="Company name")

    # add-shareholder
    p = sub.add_parser("add-shareholder", help="Add a shareholder")
    p.add_argument("cap_table")
    p.add_argument("name")
    p.add_argument("shares",       type=float)
    p.add_argument("price",        type=float, help="Price per share at acquisition")
    p.add_argument("--type",       default="individual", dest="type",
                   choices=sorted(VALID_SHAREHOLDER_TYPES))
    p.add_argument("--share-class", default="common", dest="share_class",
                   choices=sorted(VALID_SHARE_CLASSES))
    p.add_argument("--options",       type=float, default=0.0)
    p.add_argument("--vesting",       type=int,   default=0,  metavar="MONTHS")
    p.add_argument("--cliff",         type=int,   default=0,  metavar="MONTHS")
    p.add_argument("--vesting-start", default=None, metavar="YYYY-MM-DD")
    p.add_argument("--notes",         default="")

    # dilute
    p = sub.add_parser("dilute", help="Issue new shares (funding round, option grant)")
    p.add_argument("cap_table")
    p.add_argument("new_shares", type=float)
    p.add_argument("price",      type=float, help="Price per new share")
    p.add_argument("--type",     default="round", dest="type",
                   choices=["round", "option_grant", "convertible", "safe"])
    p.add_argument("--notes",    default="")

    # ownership
    p = sub.add_parser("ownership", help="Show ownership percentages")
    p.add_argument("cap_table")
    p.add_argument("--shareholder", default=None, metavar="ID",
                   help="Filter to single shareholder by ID")

    # fully-diluted
    p = sub.add_parser("fully-diluted", help="Fully-diluted share count and metrics")
    p.add_argument("cap_table")

    # waterfall
    p = sub.add_parser("waterfall", help="Liquidation waterfall for an exit scenario")
    p.add_argument("cap_table")
    p.add_argument("exit_value", type=float, help="Total exit proceeds in dollars")

    # export-csv
    p = sub.add_parser("export-csv", help="Export cap table to CSV")
    p.add_argument("cap_table")
    p.add_argument("--out", default=None, metavar="FILE", help="Output file path")

    # list
    sub.add_parser("list", help="List all cap tables")

    # demo
    sub.add_parser("demo", help="Seed a demo cap table")

    return parser


def main(argv: Optional[List[str]] = None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)
    db_path = Path(args.db) if getattr(args, "db", None) else DB_PATH
    mgr = CapTableManager(db_path)
    try:
        dispatch = {
            "create":          cmd_ct_create,
            "add-shareholder": cmd_ct_add,
            "dilute":          cmd_ct_dilute,
            "ownership":       cmd_ct_ownership,
            "fully-diluted":   cmd_ct_fully_diluted,
            "waterfall":       cmd_ct_waterfall,
            "export-csv":      cmd_ct_export_csv,
            "list":            cmd_ct_list,
            "demo":            cmd_ct_demo,
        }
        dispatch[args.command](args, mgr)
    finally:
        mgr.close()


if __name__ == "__main__":
    main()
