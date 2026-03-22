"""
BlackRoad Labs — Experiment Tracker
SQLite-backed ML/research experiment tracking with full run lifecycle,
metric logging, artifact registration, and comparison/ranking queries.

Usage:
    python -m src.experiment_tracker demo
    python -m src.experiment_tracker list --status completed
    python -m src.experiment_tracker compare RUN_A RUN_B --metric loss
    python -m src.experiment_tracker best loss --direction min
    python -m src.experiment_tracker show RUN_ID
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sqlite3
import sys
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple

DB_PATH = Path.home() / ".blackroad" / "labs-experiments.db"


# ──────────────────────────────────────────────────────────────────────────────
# Data models
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class MetricPoint:
    """A single scalar observation for a named metric."""
    key:       str
    value:     float
    step:      Optional[int]
    timestamp: str


@dataclass
class Artifact:
    """A file or blob produced by an experiment run."""
    name:          str
    path:          str
    size_bytes:    int
    artifact_type: str                       # model | dataset | plot | other
    metadata:      Dict[str, Any] = field(default_factory=dict)


@dataclass
class Experiment:
    """
    Complete record for one experiment run.

    Attributes:
        id:         Unique run identifier (auto-generated).
        name:       Human-readable experiment name.
        params:     Hyperparameter / config dict.
        metrics:    Mapping of metric_key → list of MetricPoint.
        artifacts:  Registered file artifacts.
        status:     pending | running | completed | failed.
        start_time: ISO-8601 UTC start timestamp.
        end_time:   ISO-8601 UTC end timestamp (None while running).
        duration_s: Wall-clock duration in seconds.
        tags:       Arbitrary string key-value metadata.
        parent_id:  Optional parent run for nested experiments.
        notes:      Free-form text notes.
    """
    id:         str
    name:       str
    params:     Dict[str, Any]                    = field(default_factory=dict)
    metrics:    Dict[str, List[MetricPoint]]      = field(default_factory=dict)
    artifacts:  List[Artifact]                    = field(default_factory=list)
    status:     str                               = "pending"
    start_time: Optional[str]                    = None
    end_time:   Optional[str]                    = None
    duration_s: Optional[float]                  = None
    tags:       Dict[str, str]                   = field(default_factory=dict)
    parent_id:  Optional[str]                    = None
    notes:      str                               = ""

    def final_metric(self, key: str) -> Optional[float]:
        """Last recorded value for *key*, or ``None``."""
        pts = self.metrics.get(key, [])
        return pts[-1].value if pts else None

    def best_metric(self, key: str, direction: str = "min") -> Optional[float]:
        """Best (min or max) value for *key*, or ``None``."""
        pts = self.metrics.get(key, [])
        if not pts:
            return None
        vals = [p.value for p in pts]
        return min(vals) if direction == "min" else max(vals)

    def param_hash(self) -> str:
        """Stable 12-char hex hash of the params dict (for deduplication)."""
        return hashlib.sha256(
            json.dumps(self.params, sort_keys=True).encode()
        ).hexdigest()[:12]

    def summary(self) -> Dict[str, Any]:
        return {
            "id":             self.id,
            "name":           self.name,
            "status":         self.status,
            "duration_s":     self.duration_s,
            "params":         self.params,
            "final_metrics":  {k: self.final_metric(k) for k in self.metrics},
        }


# ──────────────────────────────────────────────────────────────────────────────
# Tracker
# ──────────────────────────────────────────────────────────────────────────────

class ExperimentTracker:
    """
    SQLite-backed experiment tracker for ML/research runs.

    Example::

        tracker = ExperimentTracker()
        run_id  = tracker.start_run("lr_sweep", {"lr": 1e-3, "batch": 32})
        for epoch in range(10):
            tracker.log_metric("loss", compute_loss(), step=epoch)
            tracker.log_metric("acc",  compute_acc(),  step=epoch)
        tracker.end_run("completed")
        print(tracker.best_run("loss", direction="min"))
    """

    def __init__(self, db_path: Optional[Path] = None) -> None:
        self.db_path         = db_path or DB_PATH
        self._active_run_id: Optional[str] = None
        self._init_db()

    # ── DB bootstrap ──────────────────────────────────────────────────────────

    def _init_db(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.db_path) as con:
            con.executescript("""
                CREATE TABLE IF NOT EXISTS runs (
                    run_id     TEXT PRIMARY KEY,
                    name       TEXT NOT NULL,
                    status     TEXT NOT NULL DEFAULT 'pending',
                    start_time TEXT,
                    end_time   TEXT,
                    duration_s REAL,
                    params     TEXT NOT NULL DEFAULT '{}',
                    tags       TEXT NOT NULL DEFAULT '{}',
                    parent_id  TEXT,
                    notes      TEXT NOT NULL DEFAULT '',
                    param_hash TEXT
                );
                CREATE TABLE IF NOT EXISTS metrics (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id     TEXT NOT NULL REFERENCES runs(run_id),
                    metric_key TEXT NOT NULL,
                    value      REAL NOT NULL,
                    step       INTEGER,
                    timestamp  TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS params (
                    run_id      TEXT NOT NULL REFERENCES runs(run_id),
                    param_key   TEXT NOT NULL,
                    param_value TEXT NOT NULL,
                    PRIMARY KEY (run_id, param_key)
                );
                CREATE TABLE IF NOT EXISTS artifacts (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_id        TEXT NOT NULL REFERENCES runs(run_id),
                    name          TEXT NOT NULL,
                    path          TEXT NOT NULL,
                    size_bytes    INTEGER NOT NULL DEFAULT 0,
                    artifact_type TEXT NOT NULL DEFAULT 'other',
                    metadata      TEXT NOT NULL DEFAULT '{}'
                );
                CREATE INDEX IF NOT EXISTS idx_metrics_run  ON metrics(run_id);
                CREATE INDEX IF NOT EXISTS idx_metrics_key  ON metrics(metric_key);
                CREATE INDEX IF NOT EXISTS idx_runs_name    ON runs(name);
                CREATE INDEX IF NOT EXISTS idx_runs_status  ON runs(status);
                CREATE INDEX IF NOT EXISTS idx_runs_phash   ON runs(param_hash);
            """)

    # ── Run lifecycle ─────────────────────────────────────────────────────────

    def start_run(
        self,
        name:      str,
        params:    Optional[Dict[str, Any]]  = None,
        tags:      Optional[Dict[str, str]]  = None,
        parent_id: Optional[str]             = None,
        notes:     str                       = "",
    ) -> str:
        """
        Create and start a new experiment run.

        Args:
            name:      Experiment family name (e.g. "lr_sweep").
            params:    Hyperparameter dict logged verbatim.
            tags:      String key-value metadata (dataset, framework, …).
            parent_id: Optional parent run ID for nested experiments.
            notes:     Free-form run notes.

        Returns:
            Unique ``run_id`` string.
        """
        params   = params or {}
        tags     = tags   or {}
        run_id   = _make_run_id(name)
        ts       = _now()
        ph       = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]

        with sqlite3.connect(self.db_path) as con:
            con.execute(
                """
                INSERT INTO runs (run_id, name, status, start_time, params, tags,
                                  parent_id, notes, param_hash)
                VALUES (?, ?, 'running', ?, ?, ?, ?, ?, ?)
                """,
                (run_id, name, ts, json.dumps(params), json.dumps(tags),
                 parent_id, notes, ph),
            )
            for k, v in params.items():
                con.execute(
                    "INSERT OR REPLACE INTO params (run_id, param_key, param_value) VALUES (?,?,?)",
                    (run_id, k, json.dumps(v)),
                )

        self._active_run_id = run_id
        return run_id

    def log_metric(
        self,
        key:    str,
        value:  float,
        step:   Optional[int] = None,
        run_id: Optional[str] = None,
    ) -> None:
        """
        Log a scalar metric value.

        Args:
            key:    Metric name (e.g. "loss", "accuracy").
            value:  Finite scalar value.
            step:   Optional step / epoch index.
            run_id: Explicit run ID; uses the active run if ``None``.
        """
        run_id = run_id or self._active_run_id
        if run_id is None:
            raise RuntimeError("No active run — call start_run() first.")
        if not math.isfinite(value):
            raise ValueError(f"Metric value must be finite; got {value!r}")
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                "INSERT INTO metrics (run_id, metric_key, value, step, timestamp) VALUES (?,?,?,?,?)",
                (run_id, key, value, step, _now()),
            )

    def log_param(
        self,
        key:    str,
        value:  Any,
        run_id: Optional[str] = None,
    ) -> None:
        """
        Log or update a single hyperparameter.

        Args:
            key:    Parameter name.
            value:  JSON-serialisable value.
            run_id: Explicit run ID; uses the active run if ``None``.
        """
        run_id = run_id or self._active_run_id
        if run_id is None:
            raise RuntimeError("No active run — call start_run() first.")
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                "INSERT OR REPLACE INTO params (run_id, param_key, param_value) VALUES (?,?,?)",
                (run_id, key, json.dumps(value)),
            )
            row = con.execute("SELECT params FROM runs WHERE run_id=?", (run_id,)).fetchone()
            if row:
                current = json.loads(row[0])
                current[key] = value
                con.execute("UPDATE runs SET params=? WHERE run_id=?",
                            (json.dumps(current), run_id))

    def log_artifact(
        self,
        name:          str,
        path:          str,
        artifact_type: str                       = "other",
        metadata:      Optional[Dict[str, Any]] = None,
        run_id:        Optional[str]             = None,
    ) -> None:
        """Register a file artifact produced by this run."""
        run_id = run_id or self._active_run_id
        if run_id is None:
            raise RuntimeError("No active run — call start_run() first.")
        p    = Path(path)
        size = p.stat().st_size if p.exists() else 0
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                "INSERT INTO artifacts (run_id, name, path, size_bytes, artifact_type, metadata)"
                " VALUES (?,?,?,?,?,?)",
                (run_id, name, str(path), size, artifact_type, json.dumps(metadata or {})),
            )

    def end_run(
        self,
        status: str           = "completed",
        run_id: Optional[str] = None,
    ) -> None:
        """
        Finalize the current (or specified) run.

        Args:
            status: "completed" | "failed" | "killed".
            run_id: Explicit run ID; uses the active run if ``None``.
        """
        run_id = run_id or self._active_run_id
        if run_id is None:
            raise RuntimeError("No active run — call start_run() first.")

        end_ts   = _now()
        duration = None
        with sqlite3.connect(self.db_path) as con:
            row = con.execute("SELECT start_time FROM runs WHERE run_id=?", (run_id,)).fetchone()
            if row and row[0]:
                try:
                    s        = datetime.fromisoformat(row[0])
                    e        = datetime.fromisoformat(end_ts)
                    duration = (e - s).total_seconds()
                except Exception:
                    pass
            con.execute(
                "UPDATE runs SET status=?, end_time=?, duration_s=? WHERE run_id=?",
                (status, end_ts, duration, run_id),
            )

        if self._active_run_id == run_id:
            self._active_run_id = None

    # ── Queries ───────────────────────────────────────────────────────────────

    def get_run(self, run_id: str) -> Optional[Experiment]:
        """Load a full :class:`Experiment` object by run_id."""
        with sqlite3.connect(self.db_path) as con:
            con.row_factory = sqlite3.Row
            row = con.execute("SELECT * FROM runs WHERE run_id=?", (run_id,)).fetchone()
            if not row:
                return None
            return self._row_to_experiment(dict(row), con)

    def list_runs(
        self,
        name:       Optional[str]            = None,
        status:     Optional[str]            = None,
        tag_filter: Optional[Dict[str, str]] = None,
        limit:      int                      = 50,
    ) -> List[Dict[str, Any]]:
        """Return summary dicts for recent runs (optional filters)."""
        clauses: List[str] = []
        params:  List[Any] = []
        if name:
            clauses.append("name LIKE ?")
            params.append(f"%{name}%")
        if status:
            clauses.append("status = ?")
            params.append(status)
        where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
        with sqlite3.connect(self.db_path) as con:
            con.row_factory = sqlite3.Row
            rows = con.execute(
                f"SELECT * FROM runs {where} ORDER BY start_time DESC LIMIT ?",
                params + [limit],
            ).fetchall()
        results = []
        for row in rows:
            d            = dict(row)
            d["params"]  = json.loads(d.get("params") or "{}")
            d["tags"]    = json.loads(d.get("tags")   or "{}")
            results.append(d)
        if tag_filter:
            results = [r for r in results
                       if all(r["tags"].get(k) == v for k, v in tag_filter.items())]
        return results

    def compare_runs(
        self,
        run_ids: List[str],
        metrics: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Compare multiple runs side-by-side.

        Returns a dict containing a ``rows`` list where each row has the run
        metadata, per-param columns, and final metric columns.
        """
        exps = [self.get_run(rid) for rid in run_ids]
        exps = [e for e in exps if e is not None]
        if not exps:
            return {"error": "No runs found for given run_ids"}

        metric_keys = metrics or sorted({k for e in exps for k in e.metrics})
        param_keys  = sorted({k for e in exps for k in e.params})

        rows = []
        for exp in exps:
            row: Dict[str, Any] = {
                "run_id":     exp.id,
                "name":       exp.name,
                "status":     exp.status,
                "duration_s": exp.duration_s,
            }
            for pk in param_keys:
                row[f"param:{pk}"] = exp.params.get(pk)
            for mk in metric_keys:
                row[f"metric:{mk}"] = exp.final_metric(mk)
            rows.append(row)

        differing = [
            pk for pk in param_keys
            if len({r.get(f"param:{pk}") for r in rows}) > 1
        ]
        return {
            "run_ids":          [e.id for e in exps],
            "metrics":          metric_keys,
            "differing_params": differing,
            "rows":             rows,
        }

    def best_run(
        self,
        metric:    str,
        direction: str           = "min",
        name:      Optional[str] = None,
        status:    str           = "completed",
    ) -> Optional[Dict[str, Any]]:
        """
        Find the run with the best value for *metric*.

        Args:
            metric:    Metric key to optimise.
            direction: "min" or "max".
            name:      Optional partial-match filter on run name.
            status:    Only consider runs with this status.

        Returns:
            Summary dict (includes ``best_value`` key), or ``None`` if no match.
        """
        agg        = "MIN" if direction == "min" else "MAX"
        name_sql   = "AND r.name LIKE ?" if name else ""
        name_param = ([f"%{name}%"] if name else [])
        with sqlite3.connect(self.db_path) as con:
            con.row_factory = sqlite3.Row
            row = con.execute(
                f"""
                SELECT r.*, {agg}(m.value) AS best_value
                FROM   runs r
                JOIN   metrics m ON m.run_id = r.run_id
                WHERE  m.metric_key = ?
                  AND  r.status = ?
                  {name_sql}
                GROUP  BY r.run_id
                ORDER  BY best_value {'ASC' if direction == 'min' else 'DESC'}
                LIMIT  1
                """,
                [metric, status] + name_param,
            ).fetchone()
        if not row:
            return None
        d           = dict(row)
        d["params"] = json.loads(d.get("params") or "{}")
        d["tags"]   = json.loads(d.get("tags")   or "{}")
        return d

    def delete_run(self, run_id: str) -> bool:
        """Delete a run and all its metrics, params, and artifacts."""
        with sqlite3.connect(self.db_path) as con:
            for tbl in ("metrics", "params", "artifacts"):
                con.execute(f"DELETE FROM {tbl} WHERE run_id=?", (run_id,))
            cur = con.execute("DELETE FROM runs WHERE run_id=?", (run_id,))
            return cur.rowcount > 0

    def iter_metric(
        self, run_id: str, key: str
    ) -> Iterator[Tuple[Optional[int], float]]:
        """Yield (step, value) pairs for *key* ordered by step/timestamp."""
        with sqlite3.connect(self.db_path) as con:
            rows = con.execute(
                "SELECT step, value FROM metrics WHERE run_id=? AND metric_key=?"
                " ORDER BY step, timestamp",
                (run_id, key),
            ).fetchall()
        for step, value in rows:
            yield step, value

    # ── Internal helpers ──────────────────────────────────────────────────────

    def _row_to_experiment(self, row: Dict[str, Any], con: sqlite3.Connection) -> Experiment:
        run_id = row["run_id"]
        con.row_factory = sqlite3.Row

        # metrics
        metric_rows = con.execute(
            "SELECT * FROM metrics WHERE run_id=? ORDER BY step, timestamp", (run_id,)
        ).fetchall()
        metrics: Dict[str, List[MetricPoint]] = {}
        for mr in metric_rows:
            mr = dict(mr)
            pt = MetricPoint(key=mr["metric_key"], value=mr["value"],
                             step=mr["step"], timestamp=mr["timestamp"])
            metrics.setdefault(mr["metric_key"], []).append(pt)

        # artifacts
        art_rows  = con.execute("SELECT * FROM artifacts WHERE run_id=?", (run_id,)).fetchall()
        artifacts = [
            Artifact(name=ar["name"], path=ar["path"],
                     size_bytes=ar["size_bytes"], artifact_type=ar["artifact_type"],
                     metadata=json.loads(ar["metadata"]))
            for ar in art_rows
        ]

        return Experiment(
            id=run_id,
            name=row["name"],
            params=json.loads(row.get("params") or "{}"),
            metrics=metrics,
            artifacts=artifacts,
            status=row["status"],
            start_time=row.get("start_time"),
            end_time=row.get("end_time"),
            duration_s=row.get("duration_s"),
            tags=json.loads(row.get("tags") or "{}"),
            parent_id=row.get("parent_id"),
            notes=row.get("notes") or "",
        )


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_run_id(name: str) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    h  = hashlib.md5(f"{name}{ts}{time.monotonic_ns()}".encode()).hexdigest()[:8]
    return f"{name[:14]}-{ts}-{h}"


# ──────────────────────────────────────────────────────────────────────────────
# Demo
# ──────────────────────────────────────────────────────────────────────────────

def _run_demo() -> None:
    import random

    tracker = ExperimentTracker()
    print("\n\U0001f9ea Demo: learning-rate × batch-size sweep\n")

    lrs, batches, run_ids = [1e-3, 5e-4, 1e-4], [32, 64], []

    for lr in lrs:
        for bs in batches:
            run_id = tracker.start_run(
                "lr_batch_sweep",
                params={"learning_rate": lr, "batch_size": bs, "optimizer": "adam"},
                tags={"dataset": "synthetic", "framework": "demo"},
            )
            run_ids.append(run_id)
            loss = 2.0 + random.uniform(-0.2, 0.2)
            acc  = 0.3 + random.uniform(-0.05, 0.05)
            for epoch in range(15):
                loss *= 0.87 + random.uniform(-0.04, 0.04)
                acc   = min(0.99, acc + random.uniform(0.01, 0.04) * (1 - acc))
                tracker.log_metric("loss",     loss,                      step=epoch)
                tracker.log_metric("accuracy", acc,                       step=epoch)
                tracker.log_metric("val_loss",  loss * (1 + random.uniform(0.05, 0.15)),
                                   step=epoch)
            tracker.end_run("completed")
            exp = tracker.get_run(run_id)
            print(f"  {run_id[:32]}  lr={lr:.0e}  bs={bs:2}  "
                  f"loss={exp.final_metric('loss'):.4f}  "
                  f"acc={exp.final_metric('accuracy'):.4f}")

    best = tracker.best_run("loss", direction="min")
    if best:
        print(f"\n\U0001f947 Best (loss\u2193):  run={best['run_id'][:32]}"
              f"  lr={best['params'].get('learning_rate')}  "
              f"bs={best['params'].get('batch_size')}  "
              f"best_loss={best.get('best_value', '?'):.4f}")

    cmp = tracker.compare_runs(run_ids[:2])
    print(f"\n\U0001f4ca Comparing first 2 runs:")
    for row in cmp["rows"]:
        diff_str = "  ".join(f"{k}={row.get(f'param:{k}')}" for k in cmp["differing_params"])
        met_str  = "  ".join(
            f"{mk}={row[f'metric:{mk}']:.4f}" if row.get(f"metric:{mk}") is not None else f"{mk}=N/A"
            for mk in cmp["metrics"][:2]
        )
        print(f"  {row['run_id'][:32]}  {diff_str}  {met_str}")
    print()


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────

def _build_cli() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="experiment_tracker",
        description="BlackRoad Labs — Experiment Tracker",
    )
    sub = p.add_subparsers(dest="command", required=True)

    sub.add_parser("demo", help="Run a demo hyperparameter sweep")

    ls = sub.add_parser("list", help="List recent runs")
    ls.add_argument("--name",   default=None)
    ls.add_argument("--status", default=None)
    ls.add_argument("--limit",  type=int, default=20)

    cmp = sub.add_parser("compare", help="Compare two or more runs")
    cmp.add_argument("run_ids", nargs="+")
    cmp.add_argument("--metric", nargs="*", default=None)

    best = sub.add_parser("best", help="Find best run for a metric")
    best.add_argument("metric")
    best.add_argument("--direction", choices=["min", "max"], default="min")
    best.add_argument("--name", default=None)

    show = sub.add_parser("show", help="Show full details for a run")
    show.add_argument("run_id")

    return p


def main(argv: Optional[List[str]] = None) -> int:
    args    = _build_cli().parse_args(argv)
    tracker = ExperimentTracker()

    if args.command == "demo":
        _run_demo()
        return 0

    elif args.command == "list":
        runs = tracker.list_runs(name=args.name, status=args.status, limit=args.limit)
        print(f"\n{'Run ID':<38} {'Name':<20} {'Status':<12} {'Duration':>10}")
        print(f"{'─'*38} {'─'*20} {'─'*12} {'─'*10}")
        for r in runs:
            dur = f"{r['duration_s']:.1f}s" if r.get("duration_s") else "—"
            print(f"{r['run_id']:<38} {r['name']:<20} {r['status']:<12} {dur:>10}")
        print()
        return 0

    elif args.command == "compare":
        cmp = tracker.compare_runs(args.run_ids, metrics=args.metric)
        if "error" in cmp:
            print(f"Error: {cmp['error']}")
            return 1
        print(f"\nComparing {len(cmp['run_ids'])} runs\n")
        for row in cmp["rows"]:
            print(f"  {row['run_id']}")
            for pk in cmp["differing_params"]:
                print(f"    {pk}: {row.get(f'param:{pk}')}")
            for mk in cmp["metrics"]:
                v = row.get(f"metric:{mk}")
                print(f"    {mk}: {v:.4f}" if v is not None else f"    {mk}: N/A")
            print()
        return 0

    elif args.command == "best":
        best = tracker.best_run(args.metric, direction=args.direction, name=args.name)
        if not best:
            print(f"No completed runs found for metric '{args.metric}'")
            return 1
        print(f"\nBest run ({args.metric} {args.direction}):")
        print(f"  Run ID   : {best['run_id']}")
        print(f"  Name     : {best['name']}")
        print(f"  Value    : {best.get('best_value', 'N/A')}")
        print(f"  Params   : {best.get('params', {})}")
        print()
        return 0

    elif args.command == "show":
        exp = tracker.get_run(args.run_id)
        if not exp:
            print(f"Run '{args.run_id}' not found")
            return 1
        print(f"\nRun    : {exp.id}")
        print(f"Name   : {exp.name}")
        print(f"Status : {exp.status}")
        if exp.duration_s is not None:
            print(f"Duration: {exp.duration_s:.2f}s")
        print(f"Params : {exp.params}")
        print("Metrics:")
        for k, pts in exp.metrics.items():
            vals = [p.value for p in pts]
            print(f"  {k}: final={vals[-1]:.4f}  min={min(vals):.4f}  max={max(vals):.4f}  n={len(vals)}")
        if exp.artifacts:
            print("Artifacts:")
            for a in exp.artifacts:
                print(f"  {a.name}  ({a.artifact_type})  {a.size_bytes}B  {a.path}")
        print()
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
