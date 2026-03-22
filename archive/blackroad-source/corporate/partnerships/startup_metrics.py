#!/usr/bin/env python3
"""
BlackRoad Ventures — Startup Metrics Tracker
=============================================
Track MRR, ARR, burn rate, runway, headcount, and growth rates
for portfolio companies. Generate investor-ready reports.

Usage:
    startup_metrics add-startup <id> <name> <stage> [options]
    startup_metrics log <startup_id> <metric> <value> <period>
    startup_metrics runway <startup_id>
    startup_metrics growth <startup_id> <metric> [--periods N]
    startup_metrics report <startup_id> [--format text|json]
    startup_metrics benchmarks <startup_id> [--stage seed|series_a|series_b]
    startup_metrics summary
    startup_metrics list
    startup_metrics demo
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# ─── Database ─────────────────────────────────────────────────────────────────

DB_PATH = Path.home() / ".blackroad" / "ventures_startups.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS startups (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    stage           TEXT NOT NULL DEFAULT 'pre_seed',
    mrr             REAL NOT NULL DEFAULT 0.0,
    arr             REAL NOT NULL DEFAULT 0.0,
    burn_rate       REAL NOT NULL DEFAULT 0.0,
    runway_months   REAL NOT NULL DEFAULT 0.0,
    headcount       INTEGER NOT NULL DEFAULT 1,
    cash_balance    REAL NOT NULL DEFAULT 0.0,
    sector          TEXT NOT NULL DEFAULT 'saas',
    founded_year    INTEGER,
    website         TEXT NOT NULL DEFAULT '',
    notes           TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    startup_id  TEXT NOT NULL REFERENCES startups(id),
    name        TEXT NOT NULL,
    value       REAL NOT NULL,
    period      TEXT NOT NULL,
    recorded_at TEXT NOT NULL,
    notes       TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS funding_rounds (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    startup_id      TEXT NOT NULL,
    round_name      TEXT NOT NULL,
    amount          REAL NOT NULL,
    lead_investor   TEXT NOT NULL DEFAULT '',
    valuation       REAL,
    closed_at       TEXT NOT NULL,
    notes           TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_metrics_startup ON metrics (startup_id, name, period);
CREATE INDEX IF NOT EXISTS idx_rounds_startup  ON funding_rounds (startup_id);
"""

VALID_STAGES = frozenset(
    {"pre_seed", "seed", "series_a", "series_b", "series_c", "growth", "profitable"}
)

# Stage benchmark data (SaaS benchmarks by stage)
STAGE_BENCHMARKS: Dict[str, dict] = {
    "pre_seed": {
        "mrr_target":       5_000,
        "growth_pct_mo":    20.0,
        "burn_rate_max":    30_000,
        "runway_min":       12,
        "arr_target":       60_000,
    },
    "seed": {
        "mrr_target":       50_000,
        "growth_pct_mo":    15.0,
        "burn_rate_max":    150_000,
        "runway_min":       18,
        "arr_target":       600_000,
    },
    "series_a": {
        "mrr_target":       500_000,
        "growth_pct_mo":    10.0,
        "burn_rate_max":    600_000,
        "runway_min":       18,
        "arr_target":       6_000_000,
    },
    "series_b": {
        "mrr_target":       2_000_000,
        "growth_pct_mo":    7.0,
        "burn_rate_max":    2_000_000,
        "runway_min":       24,
        "arr_target":       24_000_000,
    },
    "series_c": {
        "mrr_target":       8_000_000,
        "growth_pct_mo":    5.0,
        "burn_rate_max":    5_000_000,
        "runway_min":       24,
        "arr_target":       96_000_000,
    },
    "growth": {
        "mrr_target":       20_000_000,
        "growth_pct_mo":    3.0,
        "burn_rate_max":    10_000_000,
        "runway_min":       24,
        "arr_target":       240_000_000,
    },
    "profitable": {
        "mrr_target":       0,
        "growth_pct_mo":    2.0,
        "burn_rate_max":    0,
        "runway_min":       0,
        "arr_target":       0,
    },
}


# ─── Dataclasses ─────────────────────────────────────────────────────────────


@dataclass
class Metric:
    """A time-series data point for a startup KPI."""

    startup_id: str
    name: str
    value: float
    period: str      # e.g. "2024-01", "Q1-2024", "2024"
    recorded_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    notes: str = ""


@dataclass
class Startup:
    """Core startup record with key SaaS metrics."""

    id: str
    name: str
    stage: str = "pre_seed"
    mrr: float = 0.0
    arr: float = 0.0
    burn_rate: float = 0.0
    runway_months: float = 0.0
    headcount: int = 1
    cash_balance: float = 0.0
    sector: str = "saas"
    founded_year: Optional[int] = None
    website: str = ""
    notes: str = ""
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    @property
    def computed_arr(self) -> float:
        """ARR derived from MRR."""
        return self.mrr * 12.0

    @property
    def computed_runway(self) -> float:
        """Months of runway given current cash and burn."""
        if self.burn_rate <= 0:
            return float("inf")
        return self.cash_balance / self.burn_rate

    @property
    def arr_per_employee(self) -> float:
        """ARR / headcount efficiency metric."""
        return self.arr / self.headcount if self.headcount > 0 else 0.0

    @property
    def burn_multiple(self) -> float:
        """Burn multiple = net burn / net new ARR. Lower is better."""
        new_arr_monthly = self.mrr  # simplified: assume all MRR is new
        return self.burn_rate / new_arr_monthly if new_arr_monthly > 0 else float("inf")


# ─── Storage ─────────────────────────────────────────────────────────────────


class StartupStore:
    def __init__(self, db_path: Path = DB_PATH):
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(db_path))
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    def _now(self) -> str:
        return datetime.utcnow().isoformat()

    # ── Startup CRUD ──────────────────────────────────────────────────────────

    def create(self, startup: Startup) -> Startup:
        now = self._now()
        self.conn.execute(
            """
            INSERT OR IGNORE INTO startups
                (id, name, stage, mrr, arr, burn_rate, runway_months,
                 headcount, cash_balance, sector, founded_year,
                 website, notes, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                startup.id, startup.name, startup.stage,
                startup.mrr, startup.arr or startup.mrr * 12,
                startup.burn_rate, startup.runway_months,
                startup.headcount, startup.cash_balance,
                startup.sector, startup.founded_year,
                startup.website, startup.notes, now, now,
            ),
        )
        self.conn.commit()
        return startup

    def get(self, startup_id: str) -> Optional[Startup]:
        row = self.conn.execute(
            "SELECT * FROM startups WHERE id=?", (startup_id,)
        ).fetchone()
        if not row:
            return None
        return Startup(
            id=row["id"], name=row["name"], stage=row["stage"],
            mrr=row["mrr"], arr=row["arr"],
            burn_rate=row["burn_rate"], runway_months=row["runway_months"],
            headcount=row["headcount"], cash_balance=row["cash_balance"],
            sector=row["sector"], founded_year=row["founded_year"],
            website=row["website"], notes=row["notes"],
            created_at=row["created_at"],
        )

    def update(self, startup_id: str, **kwargs) -> bool:
        if not kwargs:
            return False
        now = self._now()
        set_clause = ", ".join(f"{k}=?" for k in kwargs)
        values = list(kwargs.values()) + [now, startup_id]
        cur = self.conn.execute(
            f"UPDATE startups SET {set_clause}, updated_at=? WHERE id=?",
            values,
        )
        self.conn.commit()
        return cur.rowcount > 0

    def list_all(self) -> List[dict]:
        rows = self.conn.execute(
            "SELECT id, name, stage, mrr, arr, burn_rate, runway_months, "
            "headcount, sector FROM startups ORDER BY arr DESC"
        ).fetchall()
        return [dict(r) for r in rows]

    def delete(self, startup_id: str) -> bool:
        cur = self.conn.execute("DELETE FROM startups WHERE id=?", (startup_id,))
        self.conn.execute("DELETE FROM metrics WHERE startup_id=?", (startup_id,))
        self.conn.execute(
            "DELETE FROM funding_rounds WHERE startup_id=?", (startup_id,)
        )
        self.conn.commit()
        return cur.rowcount > 0

    # ── Metrics ───────────────────────────────────────────────────────────────

    def log_metric(self, metric: Metric) -> int:
        now = self._now()
        cur = self.conn.execute(
            "INSERT INTO metrics (startup_id, name, value, period, recorded_at, notes) "
            "VALUES (?,?,?,?,?,?)",
            (metric.startup_id, metric.name, metric.value,
             metric.period, now, metric.notes),
        )
        self.conn.commit()
        return cur.lastrowid

    def get_metric_series(
        self, startup_id: str, metric_name: str, limit: int = 24
    ) -> List[dict]:
        rows = self.conn.execute(
            "SELECT value, period, recorded_at FROM metrics "
            "WHERE startup_id=? AND name=? "
            "ORDER BY period DESC LIMIT ?",
            (startup_id, metric_name, limit),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_latest_metric(
        self, startup_id: str, metric_name: str
    ) -> Optional[float]:
        row = self.conn.execute(
            "SELECT value FROM metrics "
            "WHERE startup_id=? AND name=? "
            "ORDER BY period DESC, recorded_at DESC LIMIT 1",
            (startup_id, metric_name),
        ).fetchone()
        return row["value"] if row else None

    def get_all_metrics_latest(self, startup_id: str) -> Dict[str, float]:
        """Return the most-recent value for each metric of a startup."""
        rows = self.conn.execute(
            """
            SELECT name, value FROM metrics
            WHERE startup_id=? AND recorded_at = (
                SELECT MAX(recorded_at) FROM metrics m2
                WHERE m2.startup_id = metrics.startup_id
                  AND m2.name = metrics.name
            )
            """,
            (startup_id,),
        ).fetchall()
        return {r["name"]: r["value"] for r in rows}

    # ── Funding rounds ────────────────────────────────────────────────────────

    def add_funding_round(
        self,
        startup_id: str,
        round_name: str,
        amount: float,
        lead_investor: str = "",
        valuation: Optional[float] = None,
        notes: str = "",
    ) -> int:
        now = self._now()
        cur = self.conn.execute(
            "INSERT INTO funding_rounds "
            "(startup_id, round_name, amount, lead_investor, valuation, closed_at, notes) "
            "VALUES (?,?,?,?,?,?,?)",
            (startup_id, round_name, amount, lead_investor, valuation, now, notes),
        )
        self.conn.commit()
        return cur.lastrowid

    def get_funding_history(self, startup_id: str) -> List[dict]:
        rows = self.conn.execute(
            "SELECT * FROM funding_rounds WHERE startup_id=? ORDER BY closed_at DESC",
            (startup_id,),
        ).fetchall()
        return [dict(r) for r in rows]

    def close(self) -> None:
        self.conn.close()


# ─── Analytics ────────────────────────────────────────────────────────────────


class StartupAnalytics:
    """Pure functions for startup metrics analysis."""

    @staticmethod
    def get_runway(startup: Startup) -> dict:
        """Detailed runway analysis."""
        cash = startup.cash_balance
        burn = startup.burn_rate
        if burn <= 0:
            months = None
            status = "profitable" if startup.mrr > 0 else "unknown"
        else:
            months = round(cash / burn, 1)
            if months >= 24:
                status = "healthy"
            elif months >= 18:
                status = "adequate"
            elif months >= 12:
                status = "watch"
            elif months >= 6:
                status = "danger"
            else:
                status = "critical"

        return {
            "cash_balance": cash,
            "monthly_burn": burn,
            "runway_months": months,
            "runway_status": status,
            "raise_by": (
                datetime.utcnow().isoformat()[:7]  # simplified — month reference
                if months and months < 12 else None
            ),
        }

    @staticmethod
    def calculate_growth_rate(
        series: List[dict], periods: int = 3
    ) -> Optional[float]:
        """
        Compute compound monthly growth rate (CMGR) over last `periods` periods.
        series: list of {value, period} dicts ordered DESC by period.
        """
        if len(series) < 2:
            return None

        recent = series[:periods]
        if len(recent) < 2:
            return None

        oldest_val = recent[-1]["value"]
        newest_val = recent[0]["value"]

        if oldest_val <= 0:
            return None

        n = len(recent) - 1
        if newest_val <= 0:
            return -100.0

        try:
            cmgr = ((newest_val / oldest_val) ** (1.0 / n) - 1.0) * 100.0
        except (ZeroDivisionError, ValueError):
            return None

        return round(cmgr, 2)

    @staticmethod
    def benchmarks(startup: Startup, stage: Optional[str] = None) -> dict:
        """Compare startup metrics to stage benchmarks."""
        effective_stage = stage or startup.stage
        bench = STAGE_BENCHMARKS.get(effective_stage, STAGE_BENCHMARKS["seed"])

        mrr_gap = startup.mrr - bench["mrr_target"]
        arr_gap = startup.arr - bench["arr_target"]
        runway_ok = startup.runway_months >= bench["runway_min"]
        burn_ok = startup.burn_rate <= bench["burn_rate_max"] or bench["burn_rate_max"] == 0

        return {
            "stage": effective_stage,
            "benchmarks": bench,
            "actuals": {
                "mrr": startup.mrr,
                "arr": startup.arr,
                "burn_rate": startup.burn_rate,
                "runway_months": startup.runway_months,
            },
            "gaps": {
                "mrr_gap": round(mrr_gap, 2),
                "arr_gap": round(arr_gap, 2),
                "runway_ok": runway_ok,
                "burn_ok": burn_ok,
            },
            "scores": {
                "mrr_score": round(
                    min(startup.mrr / bench["mrr_target"] * 100, 200) if bench["mrr_target"] else 100,
                    1,
                ),
                "arr_score": round(
                    min(startup.arr / bench["arr_target"] * 100, 200) if bench["arr_target"] else 100,
                    1,
                ),
                "runway_score": round(
                    min(startup.runway_months / bench["runway_min"] * 100, 200) if bench["runway_min"] else 100,
                    1,
                ),
            },
        }

    @staticmethod
    def investor_report_text(
        startup: Startup, metrics: Dict[str, float], funding: List[dict]
    ) -> str:
        """Generate a plain-text investor update."""
        lines = [
            "=" * 60,
            f"INVESTOR UPDATE — {startup.name.upper()}",
            f"Stage: {startup.stage.replace('_', ' ').title()} | "
            f"Sector: {startup.sector.upper()}",
            "=" * 60,
            "",
            "📊 KEY METRICS",
            f"  MRR         : ${startup.mrr:>12,.0f}",
            f"  ARR         : ${startup.arr:>12,.0f}",
            f"  Burn Rate   : ${startup.burn_rate:>12,.0f} / month",
            f"  Runway      : {startup.runway_months:.1f} months",
            f"  Headcount   : {startup.headcount}",
            f"  Cash Balance: ${startup.cash_balance:>12,.0f}",
            "",
            "📈 TRACKED KPIs",
        ]
        for k, v in sorted(metrics.items()):
            lines.append(f"  {k:<20}: {v:,.2f}")

        if funding:
            lines += [
                "",
                "💰 FUNDING HISTORY",
            ]
            total_raised = 0.0
            for r in funding:
                lines.append(
                    f"  {r['round_name']:<15} ${r['amount']:>10,.0f}"
                    + (f"  (lead: {r['lead_investor']})" if r["lead_investor"] else "")
                )
                total_raised += r["amount"]
            lines.append(f"  {'TOTAL':<15} ${total_raised:>10,.0f}")

        lines += [
            "",
            f"  ARR/Employee: ${startup.arr_per_employee:,.0f}",
            f"  Burn Multiple: {startup.burn_multiple:.2f}×",
            "",
            f"  Generated: {datetime.utcnow().isoformat()[:19]} UTC",
            "=" * 60,
        ]
        return "\n".join(lines)


# ─── High-level manager ───────────────────────────────────────────────────────


class StartupMetricsManager:
    """Facade combining StartupStore + StartupAnalytics."""

    def __init__(self, db_path: Path = DB_PATH):
        self.store = StartupStore(db_path)
        self._analytics = StartupAnalytics()

    def add_startup(
        self,
        startup_id: str,
        name: str,
        stage: str = "pre_seed",
        mrr: float = 0.0,
        burn_rate: float = 0.0,
        cash_balance: float = 0.0,
        headcount: int = 1,
        sector: str = "saas",
        founded_year: Optional[int] = None,
        website: str = "",
        notes: str = "",
    ) -> Startup:
        if stage not in VALID_STAGES:
            raise ValueError(
                f"Invalid stage {stage!r}. Valid: {sorted(VALID_STAGES)}"
            )
        startup = Startup(
            id=startup_id, name=name, stage=stage,
            mrr=mrr, arr=mrr * 12,
            burn_rate=burn_rate,
            runway_months=(cash_balance / burn_rate) if burn_rate > 0 else 0.0,
            cash_balance=cash_balance,
            headcount=headcount, sector=sector,
            founded_year=founded_year, website=website, notes=notes,
        )
        return self.store.create(startup)

    def update_startup(self, startup_id: str, **kwargs) -> bool:
        # Auto-derive arr and runway when mrr/cash/burn changes
        if "mrr" in kwargs and "arr" not in kwargs:
            kwargs["arr"] = kwargs["mrr"] * 12
        s = self._require(startup_id)
        burn = kwargs.get("burn_rate", s.burn_rate)
        cash = kwargs.get("cash_balance", s.cash_balance)
        if burn > 0 and "runway_months" not in kwargs:
            kwargs["runway_months"] = cash / burn
        return self.store.update(startup_id, **kwargs)

    def log_metric(
        self,
        startup_id: str,
        name: str,
        value: float,
        period: str,
        notes: str = "",
    ) -> int:
        self._require(startup_id)  # validate exists
        m = Metric(
            startup_id=startup_id, name=name, value=value,
            period=period, notes=notes,
        )
        return self.store.log_metric(m)

    def get_runway(self, startup_id: str) -> dict:
        startup = self._require(startup_id)
        return self._analytics.get_runway(startup)

    def calculate_growth_rate(
        self, startup_id: str, metric: str, periods: int = 3
    ) -> Optional[float]:
        series = self.store.get_metric_series(startup_id, metric, limit=periods + 1)
        return self._analytics.calculate_growth_rate(series, periods=periods)

    def investor_report(
        self, startup_id: str, fmt: str = "text"
    ) -> str:
        startup = self._require(startup_id)
        metrics = self.store.get_all_metrics_latest(startup_id)
        funding = self.store.get_funding_history(startup_id)

        if fmt == "json":
            return json.dumps(
                {
                    "startup": {
                        "id": startup.id,
                        "name": startup.name,
                        "stage": startup.stage,
                        "mrr": startup.mrr,
                        "arr": startup.arr,
                        "burn_rate": startup.burn_rate,
                        "runway_months": startup.runway_months,
                        "cash_balance": startup.cash_balance,
                        "headcount": startup.headcount,
                        "arr_per_employee": round(startup.arr_per_employee, 2),
                        "burn_multiple": round(startup.burn_multiple, 2),
                    },
                    "metrics": metrics,
                    "funding": funding,
                    "generated_at": datetime.utcnow().isoformat(),
                },
                indent=2,
            )
        return self._analytics.investor_report_text(startup, metrics, funding)

    def benchmarks(self, startup_id: str, stage: Optional[str] = None) -> dict:
        startup = self._require(startup_id)
        return self._analytics.benchmarks(startup, stage)

    def portfolio_summary(self) -> List[dict]:
        """Summary view of all startups."""
        startups = self.store.list_all()
        result = []
        for row in startups:
            s = self.store.get(row["id"])
            runway = self._analytics.get_runway(s)
            result.append(
                {
                    "id": s.id,
                    "name": s.name,
                    "stage": s.stage,
                    "mrr": s.mrr,
                    "arr": s.arr,
                    "burn_rate": s.burn_rate,
                    "runway_status": runway["runway_status"],
                    "runway_months": runway["runway_months"],
                    "headcount": s.headcount,
                    "arr_per_employee": round(s.arr_per_employee, 0),
                }
            )
        return result

    def add_funding_round(
        self,
        startup_id: str,
        round_name: str,
        amount: float,
        lead_investor: str = "",
        valuation: Optional[float] = None,
        notes: str = "",
    ) -> int:
        return self.store.add_funding_round(
            startup_id, round_name, amount, lead_investor, valuation, notes
        )

    def _require(self, startup_id: str) -> Startup:
        s = self.store.get(startup_id)
        if s is None:
            raise ValueError(f"Startup {startup_id!r} not found")
        return s

    def close(self) -> None:
        self.store.close()


# ─── CLI ─────────────────────────────────────────────────────────────────────


def _j(obj: object) -> None:
    print(json.dumps(obj, indent=2, default=str))


def cmd_add_startup(args, mgr: StartupMetricsManager) -> None:
    mgr.add_startup(
        startup_id=args.id,
        name=args.name,
        stage=args.stage,
        mrr=args.mrr,
        burn_rate=args.burn,
        cash_balance=args.cash,
        headcount=args.headcount,
        sector=args.sector,
        founded_year=args.year,
        website=args.website,
        notes=args.notes,
    )
    print(f"✅  Added startup '{args.name}' (id={args.id})")


def cmd_log(args, mgr: StartupMetricsManager) -> None:
    row_id = mgr.log_metric(args.startup, args.metric, args.value, args.period, args.notes)
    print(f"✅  Logged {args.metric}={args.value} for period {args.period} (row={row_id})")


def cmd_runway(args, mgr: StartupMetricsManager) -> None:
    _j(mgr.get_runway(args.startup))


def cmd_growth(args, mgr: StartupMetricsManager) -> None:
    rate = mgr.calculate_growth_rate(args.startup, args.metric, args.periods)
    if rate is None:
        print(f"Not enough data for {args.metric} growth rate (need ≥2 periods)")
    else:
        print(f"CMGR ({args.periods} periods): {rate:+.2f}%/month")


def cmd_report(args, mgr: StartupMetricsManager) -> None:
    print(mgr.investor_report(args.startup, fmt=args.format))


def cmd_benchmarks(args, mgr: StartupMetricsManager) -> None:
    _j(mgr.benchmarks(args.startup, args.stage))


def cmd_summary(args, mgr: StartupMetricsManager) -> None:
    _j(mgr.portfolio_summary())


def cmd_list(args, mgr: StartupMetricsManager) -> None:
    _j(mgr.store.list_all())


def cmd_demo(args, mgr: StartupMetricsManager) -> None:
    """Seed three realistic portfolio startups."""
    startups = [
        dict(
            startup_id="br-saas-001",
            name="CloudSync AI",
            stage="seed",
            mrr=42_000,
            burn_rate=85_000,
            cash_balance=1_400_000,
            headcount=12,
            sector="saas",
            founded_year=2022,
            website="https://cloudsync.ai",
        ),
        dict(
            startup_id="br-fintech-002",
            name="LedgerFlow",
            stage="series_a",
            mrr=215_000,
            burn_rate=340_000,
            cash_balance=5_800_000,
            headcount=38,
            sector="fintech",
            founded_year=2021,
        ),
        dict(
            startup_id="br-health-003",
            name="MediTrack",
            stage="pre_seed",
            mrr=8_500,
            burn_rate=22_000,
            cash_balance=320_000,
            headcount=4,
            sector="healthtech",
            founded_year=2023,
        ),
    ]

    metric_series = {
        "br-saas-001": [
            ("mrr", 28000, "2024-10"), ("mrr", 33000, "2024-11"), ("mrr", 38000, "2024-12"),
            ("mrr", 42000, "2025-01"),
            ("cac", 1200, "2024-12"), ("ltv", 9600, "2024-12"),
            ("churn_pct", 2.1, "2024-12"), ("nps", 62, "2024-12"),
        ],
        "br-fintech-002": [
            ("mrr", 160000, "2024-10"), ("mrr", 185000, "2024-11"),
            ("mrr", 200000, "2024-12"), ("mrr", 215000, "2025-01"),
            ("cac", 4200, "2024-12"), ("ltv", 38000, "2024-12"),
            ("churn_pct", 0.8, "2024-12"), ("nps", 71, "2024-12"),
        ],
        "br-health-003": [
            ("mrr", 5000, "2024-10"), ("mrr", 6500, "2024-11"),
            ("mrr", 7800, "2024-12"), ("mrr", 8500, "2025-01"),
            ("dau", 420, "2024-12"),
        ],
    }

    funding_data = [
        ("br-saas-001",    "Seed",     1_500_000, "BlackRoad Ventures", 8_000_000),
        ("br-fintech-002", "Pre-Seed",   500_000, "Angel Syndicate",    2_500_000),
        ("br-fintech-002", "Seed",     3_000_000, "Fintech Fund I",    12_000_000),
        ("br-fintech-002", "Series A", 8_000_000, "Growth Capital LP", 32_000_000),
    ]

    for s in startups:
        try:
            mgr.store.delete(s["startup_id"])
            mgr.add_startup(**s)
        except Exception as e:
            print(f"⚠️  {s['startup_id']}: {e}")

    for sid, series in metric_series.items():
        for name, value, period in series:
            mgr.log_metric(sid, name, value, period)

    for sid, rname, amount, lead, val in funding_data:
        mgr.add_funding_round(sid, rname, amount, lead, val)

    print("✅  Demo startups created")
    print()
    _j(mgr.portfolio_summary())


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="startup_metrics",
        description="BlackRoad Ventures — Startup Metrics Tracker",
    )
    parser.add_argument("--db", metavar="PATH", help="Override SQLite database path")
    sub = parser.add_subparsers(dest="command", required=True)

    # add-startup
    p = sub.add_parser("add-startup", help="Register a new startup")
    p.add_argument("id",   help="Unique startup ID")
    p.add_argument("name", help="Company name")
    p.add_argument("stage", choices=sorted(VALID_STAGES))
    p.add_argument("--mrr",       type=float, default=0.0)
    p.add_argument("--burn",      type=float, default=0.0, metavar="MONTHLY_BURN")
    p.add_argument("--cash",      type=float, default=0.0, metavar="CASH_BALANCE")
    p.add_argument("--headcount", type=int,   default=1)
    p.add_argument("--sector",    default="saas")
    p.add_argument("--year",      type=int,   default=None, dest="year")
    p.add_argument("--website",   default="")
    p.add_argument("--notes",     default="")

    # log
    p = sub.add_parser("log", help="Log a metric value for a period")
    p.add_argument("startup")
    p.add_argument("metric", help="Metric name (e.g. mrr, cac, ltv, churn_pct)")
    p.add_argument("value",  type=float)
    p.add_argument("period", help="Period identifier, e.g. 2024-01 or Q1-2024")
    p.add_argument("--notes", default="")

    # runway
    p = sub.add_parser("runway", help="Runway analysis")
    p.add_argument("startup")

    # growth
    p = sub.add_parser("growth", help="Calculate CMGR for a metric")
    p.add_argument("startup")
    p.add_argument("metric")
    p.add_argument("--periods", type=int, default=3)

    # report
    p = sub.add_parser("report", help="Generate investor report")
    p.add_argument("startup")
    p.add_argument(
        "--format", choices=["text", "json"], default="text", dest="format"
    )

    # benchmarks
    p = sub.add_parser("benchmarks", help="Compare against stage benchmarks")
    p.add_argument("startup")
    p.add_argument("--stage", default=None, choices=sorted(VALID_STAGES))

    # summary
    sub.add_parser("summary", help="Portfolio summary of all startups")

    # list
    sub.add_parser("list", help="List all startups")

    # demo
    sub.add_parser("demo", help="Seed demo portfolio startups")

    return parser


def main(argv: Optional[List[str]] = None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)
    db_path = Path(args.db) if getattr(args, "db", None) else DB_PATH
    mgr = StartupMetricsManager(db_path)
    try:
        dispatch = {
            "add-startup": cmd_add_startup,
            "log":         cmd_log,
            "runway":      cmd_runway,
            "growth":      cmd_growth,
            "report":      cmd_report,
            "benchmarks":  cmd_benchmarks,
            "summary":     cmd_summary,
            "list":        cmd_list,
            "demo":        cmd_demo,
        }
        dispatch[args.command](args, mgr)
    finally:
        mgr.close()


if __name__ == "__main__":
    main()
