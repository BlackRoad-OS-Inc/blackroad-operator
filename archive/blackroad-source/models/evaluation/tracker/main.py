#!/usr/bin/env python3
"""
BlackRoad Experiment Tracker - ML experiment tracking and comparison.
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


DB_PATH = Path(os.environ.get("EXPERIMENT_DB", "~/.blackroad/experiments.db")).expanduser()


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS experiments (
                id           TEXT PRIMARY KEY,
                name         TEXT NOT NULL,
                model        TEXT NOT NULL,
                status       TEXT NOT NULL DEFAULT 'running',
                hyperparams  TEXT NOT NULL DEFAULT '{}',
                metrics      TEXT NOT NULL DEFAULT '{}',
                artifacts    TEXT NOT NULL DEFAULT '[]',
                tags         TEXT NOT NULL DEFAULT '[]',
                created_at   TEXT NOT NULL,
                updated_at   TEXT NOT NULL,
                notes        TEXT DEFAULT ''
            );
            CREATE TABLE IF NOT EXISTS metric_logs (
                id            TEXT PRIMARY KEY,
                experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
                name          TEXT NOT NULL,
                value         REAL NOT NULL,
                step          INTEGER NOT NULL DEFAULT 0,
                logged_at     TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS artifact_refs (
                id            TEXT PRIMARY KEY,
                experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
                name          TEXT NOT NULL,
                path          TEXT NOT NULL,
                artifact_type TEXT NOT NULL DEFAULT 'file',
                size_bytes    INTEGER,
                created_at    TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_ml_exp ON metric_logs(experiment_id);
            CREATE INDEX IF NOT EXISTS idx_ml_name ON metric_logs(name);
        """)


@dataclass
class Experiment:
    id: str
    name: str
    model: str
    status: str
    hyperparams: dict
    metrics: dict
    artifacts: list
    tags: list
    created_at: str
    updated_at: str
    notes: str = ""

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Experiment":
        return cls(
            id=row["id"], name=row["name"], model=row["model"],
            status=row["status"],
            hyperparams=json.loads(row["hyperparams"]),
            metrics=json.loads(row["metrics"]),
            artifacts=json.loads(row["artifacts"]),
            tags=json.loads(row["tags"]),
            created_at=row["created_at"], updated_at=row["updated_at"],
            notes=row["notes"] or "",
        )

    def summary(self) -> dict:
        return {
            "id": self.id, "name": self.name, "model": self.model,
            "status": self.status, "hyperparams": self.hyperparams,
            "metrics": self.metrics, "tags": self.tags,
            "created_at": self.created_at,
        }


class ExperimentTracker:

    def create(self, name: str, model: str, hyperparams: dict | None = None,
               tags: list[str] | None = None, notes: str = "") -> Experiment:
        eid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        hp = hyperparams or {}
        t = tags or []
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO experiments(id, name, model, hyperparams, tags, notes, created_at, updated_at) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (eid, name, model, json.dumps(hp), json.dumps(t), notes, now, now),
            )
        return Experiment(id=eid, name=name, model=model, status="running",
                          hyperparams=hp, metrics={}, artifacts=[], tags=t,
                          created_at=now, updated_at=now, notes=notes)

    def log_metric(self, exp_id: str, name: str, value: float, step: int = 0) -> None:
        mid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO metric_logs(id, experiment_id, name, value, step, logged_at) VALUES (?,?,?,?,?,?)",
                (mid, exp_id, name, value, step, now),
            )
            # Update summary metrics
            row = conn.execute("SELECT metrics FROM experiments WHERE id=?", (exp_id,)).fetchone()
            if row:
                metrics = json.loads(row["metrics"])
                existing = metrics.get(name, [])
                existing.append({"step": step, "value": value})
                metrics[name] = existing
                conn.execute(
                    "UPDATE experiments SET metrics=?, updated_at=? WHERE id=?",
                    (json.dumps(metrics), now, exp_id),
                )

    def log_artifact(self, exp_id: str, name: str, path: str, artifact_type: str = "file") -> None:
        aid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        size: Optional[int] = None
        p = Path(path)
        if p.exists():
            size = p.stat().st_size
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO artifact_refs(id, experiment_id, name, path, artifact_type, size_bytes, created_at) "
                "VALUES (?,?,?,?,?,?,?)",
                (aid, exp_id, name, path, artifact_type, size, now),
            )
            row = conn.execute("SELECT artifacts FROM experiments WHERE id=?", (exp_id,)).fetchone()
            if row:
                arts = json.loads(row["artifacts"])
                arts.append({"name": name, "path": path, "type": artifact_type})
                conn.execute(
                    "UPDATE experiments SET artifacts=?, updated_at=? WHERE id=?",
                    (json.dumps(arts), now, exp_id),
                )

    def finish(self, exp_id: str, status: str = "completed") -> None:
        now = datetime.now(timezone.utc).isoformat()
        with get_conn() as conn:
            conn.execute(
                "UPDATE experiments SET status=?, updated_at=? WHERE id=?",
                (status, now, exp_id),
            )

    def get(self, exp_id: str) -> Experiment:
        with get_conn() as conn:
            row = conn.execute("SELECT * FROM experiments WHERE id=?", (exp_id,)).fetchone()
        if not row:
            raise ValueError(f"Experiment {exp_id!r} not found")
        return Experiment.from_row(row)

    def list(self, status: str | None = None, model: str | None = None) -> list[dict]:
        query = "SELECT * FROM experiments WHERE 1=1"
        params: list[Any] = []
        if status:
            query += " AND status=?"
            params.append(status)
        if model:
            query += " AND model=?"
            params.append(model)
        query += " ORDER BY created_at DESC"
        with get_conn() as conn:
            rows = conn.execute(query, params).fetchall()
        return [Experiment.from_row(r).summary() for r in rows]

    def compare(self, ids: list[str]) -> dict:
        """Compare multiple experiments side by side."""
        experiments = [self.get(eid) for eid in ids]
        comparison: dict[str, Any] = {
            "experiments": [e.summary() for e in experiments],
            "metric_comparison": {},
            "hyperparam_comparison": {},
        }
        # Metrics: show last value for each metric across experiments
        all_metrics: set[str] = set()
        for exp in experiments:
            all_metrics.update(exp.metrics.keys())
        for metric in sorted(all_metrics):
            comparison["metric_comparison"][metric] = {}
            for exp in experiments:
                vals = exp.metrics.get(metric, [])
                if vals:
                    last_val = vals[-1]["value"]
                    comparison["metric_comparison"][metric][exp.id] = last_val
        # Hyperparams: show all hyperparams across experiments
        all_hp: set[str] = set()
        for exp in experiments:
            all_hp.update(exp.hyperparams.keys())
        for hp in sorted(all_hp):
            comparison["hyperparam_comparison"][hp] = {
                exp.id: exp.hyperparams.get(hp, "N/A") for exp in experiments
            }
        return comparison

    def best_run(self, metric: str, maximize: bool = True, status: str = "completed") -> Optional[dict]:
        """Find the best experiment for a given metric."""
        exps = [self.get(e["id"]) for e in self.list(status=status)]
        best: Optional[Experiment] = None
        best_val: Optional[float] = None
        for exp in exps:
            vals = exp.metrics.get(metric, [])
            if not vals:
                continue
            last_val = vals[-1]["value"]
            if best_val is None:
                best_val = last_val
                best = exp
            elif maximize and last_val > best_val:
                best_val = last_val
                best = exp
            elif not maximize and last_val < best_val:
                best_val = last_val
                best = exp
        if best is None:
            return None
        result = best.summary()
        result["best_value"] = best_val
        result["metric"] = metric
        return result

    def export_report(self, exp_id: str, output_path: str | None = None) -> str:
        """Export a Markdown report for an experiment."""
        exp = self.get(exp_id)
        with get_conn() as conn:
            log_rows = conn.execute(
                "SELECT * FROM metric_logs WHERE experiment_id=? ORDER BY step, logged_at",
                (exp_id,),
            ).fetchall()
        lines = [
            f"# Experiment Report: {exp.name}",
            f"",
            f"| Field | Value |",
            f"|-------|-------|",
            f"| ID | `{exp.id}` |",
            f"| Model | {exp.model} |",
            f"| Status | {exp.status} |",
            f"| Created | {exp.created_at} |",
            f"| Updated | {exp.updated_at} |",
            f"",
            f"## Hyperparameters",
            f"",
            f"| Parameter | Value |",
            f"|-----------|-------|",
        ]
        for k, v in exp.hyperparams.items():
            lines.append(f"| {k} | {v} |")
        lines += ["", "## Metrics", ""]
        for metric, values in exp.metrics.items():
            if values:
                last = values[-1]["value"]
                best = max(v["value"] for v in values)
                lines.append(f"- **{metric}**: last={last:.4f}, best={best:.4f} over {len(values)} steps")
        lines += ["", "## Metric Log", "", "| Step | Metric | Value |", "|------|--------|-------|"]
        for row in log_rows:
            lines.append(f"| {row['step']} | {row['name']} | {row['value']:.4f} |")
        if exp.artifacts:
            lines += ["", "## Artifacts", ""]
            for art in exp.artifacts:
                lines.append(f"- `{art['name']}` ({art['type']}): {art['path']}")
        if exp.notes:
            lines += ["", "## Notes", "", exp.notes]
        report = "\n".join(lines)
        out_path = output_path or f"experiment_{exp_id[:8]}_report.md"
        Path(out_path).write_text(report)
        return out_path


def main() -> None:
    init_db()
    parser = argparse.ArgumentParser(prog="experiment-tracker", description="ML experiment tracking")
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    p = sub.add_parser("create", help="Create experiment")
    p.add_argument("name"); p.add_argument("model")
    p.add_argument("--hyperparams", default="{}", help="JSON hyperparams")
    p.add_argument("--tags", default="[]", help="JSON list of tags")

    p = sub.add_parser("log", help="Log a metric")
    p.add_argument("id"); p.add_argument("metric"); p.add_argument("value", type=float)
    p.add_argument("--step", type=int, default=0)

    p = sub.add_parser("finish", help="Mark experiment done")
    p.add_argument("id"); p.add_argument("--status", default="completed")

    p = sub.add_parser("get", help="Get experiment details")
    p.add_argument("id")

    p = sub.add_parser("list", help="List experiments")
    p.add_argument("--status", default=None); p.add_argument("--model", default=None)

    p = sub.add_parser("compare", help="Compare experiments")
    p.add_argument("ids", nargs="+")

    p = sub.add_parser("best", help="Find best run for metric")
    p.add_argument("metric")
    p.add_argument("--minimize", action="store_true")

    p = sub.add_parser("report", help="Export report")
    p.add_argument("id"); p.add_argument("--output", default=None)

    args = parser.parse_args()
    tracker = ExperimentTracker()

    if args.command == "create":
        exp = tracker.create(args.name, args.model,
                              hyperparams=json.loads(args.hyperparams),
                              tags=json.loads(args.tags))
        print(json.dumps(exp.summary(), indent=2))
    elif args.command == "log":
        tracker.log_metric(args.id, args.metric, args.value, step=args.step)
        print(f"Logged {args.metric}={args.value} at step {args.step}")
    elif args.command == "finish":
        tracker.finish(args.id, status=args.status)
        print(f"Experiment {args.id} marked as {args.status}")
    elif args.command == "get":
        exp = tracker.get(args.id)
        print(json.dumps(asdict(exp), indent=2))
    elif args.command == "list":
        print(json.dumps(tracker.list(status=args.status, model=args.model), indent=2))
    elif args.command == "compare":
        print(json.dumps(tracker.compare(args.ids), indent=2))
    elif args.command == "best":
        result = tracker.best_run(args.metric, maximize=not args.minimize)
        print(json.dumps(result, indent=2))
    elif args.command == "report":
        out = tracker.export_report(args.id, output_path=args.output)
        print(f"Report saved to: {out}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
