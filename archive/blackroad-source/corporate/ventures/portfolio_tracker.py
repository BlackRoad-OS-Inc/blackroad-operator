#!/usr/bin/env python3
"""
BlackRoad Ventures — Investment Portfolio Tracker
=================================================
Production-grade portfolio management with SQLite persistence,
diversification scoring, returns analysis, and rebalancing engine.

Usage:
    portfolio create <id> <name> <owner>
    portfolio add-asset <portfolio> <ticker> <shares> <cost> [options]
    portfolio update-prices <portfolio> TICKER=PRICE ...
    portfolio summary <portfolio>
    portfolio returns <portfolio>
    portfolio rebalance <portfolio> TICKER=PCT ...
    portfolio history <portfolio> <ticker>
    portfolio remove-asset <portfolio> <ticker> [--shares N]
    portfolio delete <portfolio>
    portfolio list
    portfolio demo
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

# ─── Database path ────────────────────────────────────────────────────────────

DB_PATH = Path.home() / ".blackroad" / "ventures_portfolio.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS portfolios (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    owner       TEXT NOT NULL,
    currency    TEXT NOT NULL DEFAULT 'USD',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id    TEXT    NOT NULL REFERENCES portfolios(id),
    ticker          TEXT    NOT NULL,
    shares          REAL    NOT NULL CHECK (shares > 0),
    avg_cost        REAL    NOT NULL CHECK (avg_cost >= 0),
    current_price   REAL    NOT NULL DEFAULT 0.0,
    asset_type      TEXT    NOT NULL DEFAULT 'equity',
    sector          TEXT    NOT NULL DEFAULT 'unknown',
    notes           TEXT    NOT NULL DEFAULT '',
    added_at        TEXT    NOT NULL,
    updated_at      TEXT    NOT NULL,
    UNIQUE (portfolio_id, ticker)
);

CREATE TABLE IF NOT EXISTS price_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id    TEXT    NOT NULL,
    ticker          TEXT    NOT NULL,
    price           REAL    NOT NULL,
    recorded_at     TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id    TEXT    NOT NULL,
    ticker          TEXT    NOT NULL,
    tx_type         TEXT    NOT NULL,
    shares          REAL    NOT NULL,
    price           REAL    NOT NULL,
    fee             REAL    NOT NULL DEFAULT 0.0,
    notes           TEXT    NOT NULL DEFAULT '',
    executed_at     TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_portfolio ON assets (portfolio_id);
CREATE INDEX IF NOT EXISTS idx_price_history_lookup
    ON price_history (portfolio_id, ticker, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio ON transactions (portfolio_id);
"""

VALID_ASSET_TYPES = frozenset(
    {"equity", "crypto", "etf", "bond", "real_estate", "cash", "fund", "commodity"}
)


# ─── Dataclasses ─────────────────────────────────────────────────────────────


@dataclass
class Asset:
    """Represents a single holding inside a portfolio."""

    ticker: str
    shares: float
    avg_cost: float
    current_price: float = 0.0
    asset_type: str = "equity"
    sector: str = "unknown"
    notes: str = ""

    # ── Derived properties ────────────────────────────────────────────────────

    @property
    def market_value(self) -> float:
        """Current market value of the holding."""
        return self.shares * self.current_price

    @property
    def cost_basis(self) -> float:
        """Total acquisition cost."""
        return self.shares * self.avg_cost

    @property
    def pnl(self) -> float:
        """Unrealised profit/loss."""
        return self.market_value - self.cost_basis

    @property
    def pnl_pct(self) -> float:
        """Unrealised return as a percentage of cost."""
        return (self.pnl / self.cost_basis * 100.0) if self.cost_basis else 0.0

    @property
    def price_change_pct(self) -> float:
        """Percentage change from avg_cost to current_price."""
        return (
            (self.current_price - self.avg_cost) / self.avg_cost * 100.0
        ) if self.avg_cost else 0.0


@dataclass
class Portfolio:
    """Aggregates assets and provides aggregate metrics."""

    id: str
    name: str
    owner: str
    assets: List[Asset] = field(default_factory=list)
    currency: str = "USD"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    # ── Aggregate metrics ─────────────────────────────────────────────────────

    @property
    def total_value(self) -> float:
        return sum(a.market_value for a in self.assets)

    @property
    def total_cost(self) -> float:
        return sum(a.cost_basis for a in self.assets)

    @property
    def pnl(self) -> float:
        return self.total_value - self.total_cost

    @property
    def pnl_pct(self) -> float:
        return (self.pnl / self.total_cost * 100.0) if self.total_cost else 0.0

    @property
    def asset_count(self) -> int:
        return len(self.assets)


# ─── Storage layer ────────────────────────────────────────────────────────────


class PortfolioStore:
    """SQLite-backed persistence for portfolios, assets, and price history."""

    def __init__(self, db_path: Path = DB_PATH):
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(db_path))
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(SCHEMA)
        self.conn.commit()

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _now(self) -> str:
        return datetime.utcnow().isoformat()

    def _row_to_asset(self, row: sqlite3.Row) -> Asset:
        return Asset(
            ticker=row["ticker"],
            shares=row["shares"],
            avg_cost=row["avg_cost"],
            current_price=row["current_price"],
            asset_type=row["asset_type"],
            sector=row["sector"],
            notes=row["notes"],
        )

    def _load_assets(self, portfolio_id: str) -> List[Asset]:
        rows = self.conn.execute(
            "SELECT * FROM assets WHERE portfolio_id=? ORDER BY ticker",
            (portfolio_id,),
        ).fetchall()
        return [self._row_to_asset(r) for r in rows]

    # ── Portfolio CRUD ────────────────────────────────────────────────────────

    def create_portfolio(self, portfolio: Portfolio) -> Portfolio:
        now = self._now()
        self.conn.execute(
            "INSERT OR IGNORE INTO portfolios "
            "(id, name, owner, currency, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            (portfolio.id, portfolio.name, portfolio.owner,
             portfolio.currency, now, now),
        )
        self.conn.commit()
        return portfolio

    def get_portfolio(self, portfolio_id: str) -> Optional[Portfolio]:
        row = self.conn.execute(
            "SELECT * FROM portfolios WHERE id=?", (portfolio_id,)
        ).fetchone()
        if not row:
            return None
        return Portfolio(
            id=row["id"],
            name=row["name"],
            owner=row["owner"],
            assets=self._load_assets(portfolio_id),
            currency=row["currency"],
            created_at=row["created_at"],
        )

    def list_portfolios(self) -> List[dict]:
        rows = self.conn.execute(
            "SELECT id, name, owner, currency, created_at FROM portfolios "
            "ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]

    def delete_portfolio(self, portfolio_id: str) -> bool:
        cur = self.conn.execute(
            "DELETE FROM portfolios WHERE id=?", (portfolio_id,)
        )
        self.conn.execute("DELETE FROM assets WHERE portfolio_id=?", (portfolio_id,))
        self.conn.execute(
            "DELETE FROM price_history WHERE portfolio_id=?", (portfolio_id,)
        )
        self.conn.execute(
            "DELETE FROM transactions WHERE portfolio_id=?", (portfolio_id,)
        )
        self.conn.commit()
        return cur.rowcount > 0

    # ── Asset operations ──────────────────────────────────────────────────────

    def add_asset(self, portfolio_id: str, asset: Asset) -> Asset:
        """Insert or merge (average-in) an asset into a portfolio."""
        now = self._now()
        self.conn.execute(
            """
            INSERT INTO assets
                (portfolio_id, ticker, shares, avg_cost, current_price,
                 asset_type, sector, notes, added_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(portfolio_id, ticker) DO UPDATE SET
                avg_cost  = (assets.avg_cost * assets.shares
                             + excluded.avg_cost * excluded.shares)
                            / (assets.shares + excluded.shares),
                shares    = assets.shares + excluded.shares,
                updated_at = excluded.updated_at
            """,
            (
                portfolio_id, asset.ticker, asset.shares, asset.avg_cost,
                asset.current_price, asset.asset_type, asset.sector,
                asset.notes, now, now,
            ),
        )
        self.conn.execute(
            "INSERT INTO transactions "
            "(portfolio_id, ticker, tx_type, shares, price, executed_at) "
            "VALUES (?,?,?,?,?,?)",
            (portfolio_id, asset.ticker, "BUY", asset.shares, asset.avg_cost, now),
        )
        self.conn.commit()
        return asset

    def remove_asset(
        self, portfolio_id: str, ticker: str, shares: Optional[float] = None
    ) -> bool:
        """Sell all or partial shares of an asset."""
        now = self._now()
        row = self.conn.execute(
            "SELECT shares, current_price FROM assets "
            "WHERE portfolio_id=? AND ticker=?",
            (portfolio_id, ticker),
        ).fetchone()
        if not row:
            return False

        sell_shares = shares if shares is not None else row["shares"]
        self.conn.execute(
            "INSERT INTO transactions "
            "(portfolio_id, ticker, tx_type, shares, price, executed_at) "
            "VALUES (?,?,?,?,?,?)",
            (portfolio_id, ticker, "SELL", sell_shares, row["current_price"], now),
        )
        if shares is not None and shares < row["shares"]:
            self.conn.execute(
                "UPDATE assets SET shares=?, updated_at=? "
                "WHERE portfolio_id=? AND ticker=?",
                (row["shares"] - shares, now, portfolio_id, ticker),
            )
        else:
            self.conn.execute(
                "DELETE FROM assets WHERE portfolio_id=? AND ticker=?",
                (portfolio_id, ticker),
            )
        self.conn.commit()
        return True

    def update_prices(
        self, portfolio_id: str, prices: Dict[str, float]
    ) -> int:
        """Bulk-update current prices and write to price_history."""
        now = self._now()
        updated = 0
        for ticker, price in prices.items():
            cur = self.conn.execute(
                "UPDATE assets SET current_price=?, updated_at=? "
                "WHERE portfolio_id=? AND ticker=?",
                (price, now, portfolio_id, ticker),
            )
            if cur.rowcount:
                self.conn.execute(
                    "INSERT INTO price_history "
                    "(portfolio_id, ticker, price, recorded_at) VALUES (?,?,?,?)",
                    (portfolio_id, ticker, price, now),
                )
                updated += cur.rowcount
        self.conn.commit()
        return updated

    def get_price_history(
        self, portfolio_id: str, ticker: str, limit: int = 60
    ) -> List[dict]:
        rows = self.conn.execute(
            "SELECT price, recorded_at FROM price_history "
            "WHERE portfolio_id=? AND ticker=? "
            "ORDER BY recorded_at DESC LIMIT ?",
            (portfolio_id, ticker, limit),
        ).fetchall()
        return [dict(r) for r in rows]

    def get_transactions(
        self, portfolio_id: str, ticker: Optional[str] = None
    ) -> List[dict]:
        if ticker:
            rows = self.conn.execute(
                "SELECT * FROM transactions WHERE portfolio_id=? AND ticker=? "
                "ORDER BY executed_at DESC",
                (portfolio_id, ticker),
            ).fetchall()
        else:
            rows = self.conn.execute(
                "SELECT * FROM transactions WHERE portfolio_id=? "
                "ORDER BY executed_at DESC",
                (portfolio_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    def close(self) -> None:
        self.conn.close()


# ─── Analytics engine ────────────────────────────────────────────────────────


class PortfolioAnalytics:
    """Pure-function analytics — no I/O, only Portfolio objects."""

    @staticmethod
    def calculate_returns(portfolio: Portfolio) -> Dict:
        """Per-asset and aggregate return metrics."""
        results: Dict[str, dict] = {}
        for asset in portfolio.assets:
            results[asset.ticker] = {
                "cost_basis": round(asset.cost_basis, 2),
                "market_value": round(asset.market_value, 2),
                "pnl": round(asset.pnl, 2),
                "pnl_pct": round(asset.pnl_pct, 2),
                "asset_type": asset.asset_type,
                "sector": asset.sector,
            }
        total_cost = portfolio.total_cost
        total_value = portfolio.total_value
        results["_aggregate"] = {
            "total_cost": round(total_cost, 2),
            "total_value": round(total_value, 2),
            "total_pnl": round(portfolio.pnl, 2),
            "total_pnl_pct": round(portfolio.pnl_pct, 2),
        }
        return results

    @staticmethod
    def diversification_score(portfolio: Portfolio) -> float:
        """
        Herfindahl–Hirschman Index based diversification.
        Returns 0–100; 100 = perfectly equal weights, 0 = single holding.
        """
        if not portfolio.assets or portfolio.total_value == 0:
            return 0.0
        weights = [
            a.market_value / portfolio.total_value
            for a in portfolio.assets
            if a.market_value > 0
        ]
        if len(weights) <= 1:
            return 0.0
        hhi = sum(w ** 2 for w in weights)
        n = len(weights)
        min_hhi = 1.0 / n
        score = (1.0 - hhi) / (1.0 - min_hhi) * 100.0
        return round(max(0.0, min(100.0, score)), 1)

    @staticmethod
    def type_allocation(portfolio: Portfolio) -> Dict[str, float]:
        """% of portfolio value by asset type."""
        totals: Dict[str, float] = {}
        tv = portfolio.total_value
        if tv == 0:
            return {}
        for a in portfolio.assets:
            totals[a.asset_type] = totals.get(a.asset_type, 0.0) + a.market_value
        return {k: round(v / tv * 100, 2) for k, v in sorted(totals.items())}

    @staticmethod
    def sector_allocation(portfolio: Portfolio) -> Dict[str, float]:
        """% of portfolio value by sector."""
        totals: Dict[str, float] = {}
        tv = portfolio.total_value
        if tv == 0:
            return {}
        for a in portfolio.assets:
            totals[a.sector] = totals.get(a.sector, 0.0) + a.market_value
        return {k: round(v / tv * 100, 2) for k, v in sorted(totals.items())}

    @staticmethod
    def rebalance_suggestion(
        portfolio: Portfolio,
        target_allocation: Dict[str, float],
    ) -> List[dict]:
        """
        Compute trades needed to align to target weights.

        Args:
            portfolio: Current portfolio state with prices set.
            target_allocation: {ticker: target_weight_pct}.
                                Weights must sum to ~100 (±0.5).

        Returns:
            Sorted list of {ticker, action, shares, value, current_pct, target_pct}.
        """
        total = sum(target_allocation.values())
        if abs(total - 100.0) > 0.5:
            raise ValueError(
                f"Target allocation must sum to 100%, got {total:.1f}%"
            )
        tv = portfolio.total_value
        if tv == 0:
            return []

        asset_map = {a.ticker: a for a in portfolio.assets}
        suggestions = []

        for ticker, target_pct in target_allocation.items():
            target_value = tv * target_pct / 100.0
            asset = asset_map.get(ticker)
            current_value = asset.market_value if asset else 0.0
            diff_value = target_value - current_value

            if abs(diff_value) < 0.50:
                continue

            price = asset.current_price if asset else 0.0
            if price <= 0:
                suggestions.append(
                    {
                        "ticker": ticker,
                        "action": "SET_PRICE",
                        "note": "No price data — set current price first",
                    }
                )
                continue

            shares = abs(diff_value) / price
            suggestions.append(
                {
                    "ticker": ticker,
                    "action": "BUY" if diff_value > 0 else "SELL",
                    "shares": round(shares, 6),
                    "value": round(abs(diff_value), 2),
                    "current_pct": round(current_value / tv * 100, 2),
                    "target_pct": target_pct,
                    "drift_pct": round(
                        (current_value / tv * 100) - target_pct, 2
                    ),
                }
            )

        return sorted(suggestions, key=lambda x: abs(x.get("value", 0)), reverse=True)

    @staticmethod
    def top_performers(portfolio: Portfolio, n: int = 3) -> List[dict]:
        """Return top-N assets by PnL %."""
        ranked = sorted(
            [
                {"ticker": a.ticker, "pnl_pct": round(a.pnl_pct, 2),
                 "pnl": round(a.pnl, 2)}
                for a in portfolio.assets
            ],
            key=lambda x: x["pnl_pct"],
            reverse=True,
        )
        return ranked[:n]

    @staticmethod
    def bottom_performers(portfolio: Portfolio, n: int = 3) -> List[dict]:
        """Return bottom-N assets by PnL %."""
        ranked = sorted(
            [
                {"ticker": a.ticker, "pnl_pct": round(a.pnl_pct, 2),
                 "pnl": round(a.pnl, 2)}
                for a in portfolio.assets
            ],
            key=lambda x: x["pnl_pct"],
        )
        return ranked[:n]


# ─── High-level manager ───────────────────────────────────────────────────────


class PortfolioManager:
    """Facade combining PortfolioStore + PortfolioAnalytics."""

    def __init__(self, db_path: Path = DB_PATH):
        self.store = PortfolioStore(db_path)
        self._analytics = PortfolioAnalytics()

    # ── Delegated to store ────────────────────────────────────────────────────

    def create(
        self,
        portfolio_id: str,
        name: str,
        owner: str,
        currency: str = "USD",
    ) -> Portfolio:
        p = Portfolio(
            id=portfolio_id, name=name, owner=owner, currency=currency
        )
        return self.store.create_portfolio(p)

    def add_asset(self, portfolio_id: str, asset: Asset) -> Asset:
        if asset.asset_type not in VALID_ASSET_TYPES:
            raise ValueError(
                f"Unknown asset_type {asset.asset_type!r}. "
                f"Valid: {sorted(VALID_ASSET_TYPES)}"
            )
        return self.store.add_asset(portfolio_id, asset)

    def update_prices(
        self, portfolio_id: str, prices: Dict[str, float]
    ) -> int:
        return self.store.update_prices(portfolio_id, prices)

    def remove_asset(
        self,
        portfolio_id: str,
        ticker: str,
        shares: Optional[float] = None,
    ) -> bool:
        return self.store.remove_asset(portfolio_id, ticker, shares)

    def delete_portfolio(self, portfolio_id: str) -> bool:
        return self.store.delete_portfolio(portfolio_id)

    # ── Analytics ─────────────────────────────────────────────────────────────

    def calculate_returns(self, portfolio_id: str) -> Dict:
        portfolio = self._require(portfolio_id)
        return self._analytics.calculate_returns(portfolio)

    def portfolio_summary(self, portfolio_id: str) -> dict:
        portfolio = self._require(portfolio_id)
        tv = portfolio.total_value
        assets_out = [
            {
                "ticker": a.ticker,
                "asset_type": a.asset_type,
                "sector": a.sector,
                "shares": a.shares,
                "avg_cost": round(a.avg_cost, 4),
                "current_price": round(a.current_price, 4),
                "cost_basis": round(a.cost_basis, 2),
                "market_value": round(a.market_value, 2),
                "pnl": round(a.pnl, 2),
                "pnl_pct": round(a.pnl_pct, 2),
                "weight_pct": round(a.market_value / tv * 100, 2) if tv else 0.0,
            }
            for a in sorted(portfolio.assets, key=lambda x: x.market_value, reverse=True)
        ]
        return {
            "portfolio_id": portfolio_id,
            "name": portfolio.name,
            "owner": portfolio.owner,
            "currency": portfolio.currency,
            "total_value": round(tv, 2),
            "total_cost": round(portfolio.total_cost, 2),
            "pnl": round(portfolio.pnl, 2),
            "pnl_pct": round(portfolio.pnl_pct, 2),
            "diversification_score": self._analytics.diversification_score(portfolio),
            "asset_count": portfolio.asset_count,
            "type_allocation": self._analytics.type_allocation(portfolio),
            "sector_allocation": self._analytics.sector_allocation(portfolio),
            "top_performers": self._analytics.top_performers(portfolio),
            "bottom_performers": self._analytics.bottom_performers(portfolio),
            "assets": assets_out,
            "generated_at": datetime.utcnow().isoformat(),
        }

    def rebalance_suggestion(
        self,
        portfolio_id: str,
        target_allocation: Dict[str, float],
    ) -> List[dict]:
        portfolio = self._require(portfolio_id)
        return self._analytics.rebalance_suggestion(portfolio, target_allocation)

    def price_history(
        self, portfolio_id: str, ticker: str, limit: int = 60
    ) -> List[dict]:
        return self.store.get_price_history(portfolio_id, ticker, limit)

    def transactions(
        self, portfolio_id: str, ticker: Optional[str] = None
    ) -> List[dict]:
        return self.store.get_transactions(portfolio_id, ticker)

    def _require(self, portfolio_id: str) -> Portfolio:
        p = self.store.get_portfolio(portfolio_id)
        if p is None:
            raise ValueError(f"Portfolio {portfolio_id!r} not found")
        return p

    def close(self) -> None:
        self.store.close()


# ─── CLI command handlers ────────────────────────────────────────────────────


def _j(obj: object) -> None:
    print(json.dumps(obj, indent=2, default=str))


def cmd_create(args, mgr: PortfolioManager) -> None:
    p = mgr.create(args.id, args.name, args.owner, args.currency)
    print(f"✅  Created portfolio '{p.name}' (id={p.id})")


def cmd_add_asset(args, mgr: PortfolioManager) -> None:
    asset = Asset(
        ticker=args.ticker.upper(),
        shares=args.shares,
        avg_cost=args.cost,
        current_price=args.price,
        asset_type=args.type,
        sector=args.sector,
        notes=args.notes,
    )
    mgr.add_asset(args.portfolio, asset)
    print(
        f"✅  Added {asset.shares} × {asset.ticker} "
        f"@ {asset.avg_cost} to portfolio '{args.portfolio}'"
    )


def cmd_remove_asset(args, mgr: PortfolioManager) -> None:
    ok = mgr.remove_asset(args.portfolio, args.ticker.upper(), args.shares)
    if ok:
        print(f"✅  Removed {args.ticker.upper()} from '{args.portfolio}'")
    else:
        print(f"❌  Asset {args.ticker.upper()} not found in '{args.portfolio}'")
        sys.exit(1)


def cmd_update_prices(args, mgr: PortfolioManager) -> None:
    prices: Dict[str, float] = {}
    for pair in args.prices:
        if "=" not in pair:
            print(f"❌  Invalid format {pair!r} — expected TICKER=PRICE")
            sys.exit(1)
        ticker, price_str = pair.split("=", 1)
        prices[ticker.upper()] = float(price_str)
    n = mgr.update_prices(args.portfolio, prices)
    print(f"✅  Updated {n} price(s)")


def cmd_summary(args, mgr: PortfolioManager) -> None:
    _j(mgr.portfolio_summary(args.portfolio))


def cmd_returns(args, mgr: PortfolioManager) -> None:
    _j(mgr.calculate_returns(args.portfolio))


def cmd_rebalance(args, mgr: PortfolioManager) -> None:
    target: Dict[str, float] = {}
    for pair in args.allocation:
        if "=" not in pair:
            print(f"❌  Invalid format {pair!r} — expected TICKER=PCT")
            sys.exit(1)
        ticker, pct_str = pair.split("=", 1)
        target[ticker.upper()] = float(pct_str)
    _j(mgr.rebalance_suggestion(args.portfolio, target))


def cmd_history(args, mgr: PortfolioManager) -> None:
    _j(mgr.price_history(args.portfolio, args.ticker.upper(), args.limit))


def cmd_transactions(args, mgr: PortfolioManager) -> None:
    ticker = args.ticker.upper() if args.ticker else None
    _j(mgr.transactions(args.portfolio, ticker))


def cmd_delete(args, mgr: PortfolioManager) -> None:
    ok = mgr.delete_portfolio(args.portfolio)
    if ok:
        print(f"✅  Deleted portfolio '{args.portfolio}'")
    else:
        print(f"❌  Portfolio '{args.portfolio}' not found")
        sys.exit(1)


def cmd_list(args, mgr: PortfolioManager) -> None:
    _j(mgr.store.list_portfolios())


def cmd_demo(args, mgr: PortfolioManager) -> None:
    """Seed a realistic demo portfolio."""
    pid = "demo-ventures"
    mgr.delete_portfolio(pid)
    mgr.create(pid, "BlackRoad Ventures Demo", "alexa@blackroad.io")

    demo_assets = [
        Asset("BTC",  0.50,  42_000, 68_000, "crypto",       "crypto"),
        Asset("ETH",  5.00,   2_200,  3_800, "crypto",       "crypto"),
        Asset("NVDA", 10.0,    450,    875,  "equity",       "technology"),
        Asset("AAPL", 20.0,    160,    190,  "equity",       "technology"),
        Asset("MSFT", 15.0,    300,    420,  "equity",       "technology"),
        Asset("SPY",   5.0,    400,    510,  "etf",          "diversified"),
        Asset("TLT",  10.0,    100,     88,  "bond",         "fixed_income"),
        Asset("GLD",   8.0,    170,    210,  "commodity",    "commodities"),
        Asset("BRDN", 1000,      1.0,   1.28, "fund",        "venture"),
    ]
    for a in demo_assets:
        mgr.add_asset(pid, a)
    mgr.update_prices(pid, {a.ticker: a.current_price for a in demo_assets})

    summary = mgr.portfolio_summary(pid)
    print(f"✅  Demo portfolio created (id={pid})")
    print(f"    Total value : ${summary['total_value']:,.2f}")
    print(f"    PnL         : ${summary['pnl']:+,.2f}  ({summary['pnl_pct']:+.1f}%)")
    print(
        f"    Div. score  : {summary['diversification_score']}/100"
    )
    print()
    _j(summary)


# ─── Argument parser ─────────────────────────────────────────────────────────


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="portfolio",
        description="BlackRoad Ventures — Investment Portfolio Tracker",
    )
    parser.add_argument("--db", metavar="PATH", help="Override SQLite database path")

    sub = parser.add_subparsers(dest="command", required=True)

    # create
    p = sub.add_parser("create", help="Create a new portfolio")
    p.add_argument("id",    help="Unique portfolio identifier")
    p.add_argument("name",  help="Human-readable portfolio name")
    p.add_argument("owner", help="Owner name or email")
    p.add_argument("--currency", default="USD")

    # add-asset
    p = sub.add_parser("add-asset", help="Add or buy more of an asset")
    p.add_argument("portfolio")
    p.add_argument("ticker")
    p.add_argument("shares",  type=float)
    p.add_argument("cost",    type=float, help="Average cost per share/unit")
    p.add_argument("--price", type=float, default=0.0,   help="Current market price")
    p.add_argument(
        "--type",
        default="equity",
        dest="type",
        choices=sorted(VALID_ASSET_TYPES),
        metavar="TYPE",
    )
    p.add_argument("--sector", default="unknown")
    p.add_argument("--notes",  default="")

    # remove-asset
    p = sub.add_parser("remove-asset", help="Sell all or partial shares")
    p.add_argument("portfolio")
    p.add_argument("ticker")
    p.add_argument("--shares", type=float, default=None, help="Shares to sell (default: all)")

    # update-prices
    p = sub.add_parser("update-prices", help="Update current market prices")
    p.add_argument("portfolio")
    p.add_argument("prices", nargs="+", metavar="TICKER=PRICE")

    # summary
    p = sub.add_parser("summary", help="Full portfolio summary with analytics")
    p.add_argument("portfolio")

    # returns
    p = sub.add_parser("returns", help="Per-asset return analysis")
    p.add_argument("portfolio")

    # rebalance
    p = sub.add_parser("rebalance", help="Rebalancing suggestions to match target weights")
    p.add_argument("portfolio")
    p.add_argument("allocation", nargs="+", metavar="TICKER=PCT")

    # history
    p = sub.add_parser("history", help="Price history for a ticker")
    p.add_argument("portfolio")
    p.add_argument("ticker")
    p.add_argument("--limit", type=int, default=60)

    # transactions
    p = sub.add_parser("transactions", help="Transaction log")
    p.add_argument("portfolio")
    p.add_argument("--ticker", default=None)

    # delete
    p = sub.add_parser("delete", help="Delete a portfolio and all its data")
    p.add_argument("portfolio")

    # list
    sub.add_parser("list", help="List all portfolios")

    # demo
    sub.add_parser("demo", help="Seed a demo portfolio with realistic data")

    return parser


def main(argv: Optional[List[str]] = None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)
    db_path = Path(args.db) if getattr(args, "db", None) else DB_PATH
    mgr = PortfolioManager(db_path)
    try:
        dispatch = {
            "create":        cmd_create,
            "add-asset":     cmd_add_asset,
            "remove-asset":  cmd_remove_asset,
            "update-prices": cmd_update_prices,
            "summary":       cmd_summary,
            "returns":       cmd_returns,
            "rebalance":     cmd_rebalance,
            "history":       cmd_history,
            "transactions":  cmd_transactions,
            "delete":        cmd_delete,
            "list":          cmd_list,
            "demo":          cmd_demo,
        }
        dispatch[args.command](args, mgr)
    finally:
        mgr.close()


if __name__ == "__main__":
    main()
