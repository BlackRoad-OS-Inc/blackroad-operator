"""
BlackRoad Labs — Data Pipeline
Staged data pipeline with validation, SQLite logging, and rich reporting.

Usage:
    python -m src.pipeline demo --runs 3
    python -m src.pipeline report --name demo_pipeline --last 10
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
import time
import traceback
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

DB_PATH = Path.home() / ".blackroad" / "labs-pipeline.db"


# ──────────────────────────────────────────────────────────────────────────────
# Exceptions
# ──────────────────────────────────────────────────────────────────────────────

class ValidationError(Exception):
    """Raised when a stage validate_fn detects an invalid output."""


# ──────────────────────────────────────────────────────────────────────────────
# Stage
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class StageResult:
    """Execution record for a single pipeline stage."""

    stage_name: str
    success:    bool
    input_type: str
    output_type: str
    duration_ms: float
    records_in:  int
    records_out: int
    error:    Optional[str]          = None
    warnings: List[str]              = field(default_factory=list)
    metadata: Dict[str, Any]         = field(default_factory=dict)


@dataclass
class Stage:
    """
    A single, named pipeline stage.

    Attributes:
        name:         Unique name for this stage.
        transform_fn: ``(data) -> data`` callable that transforms the data.
        validate_fn:  Optional ``(data) -> None`` callable; should raise
                      :class:`ValidationError` on bad output.
        enabled:      Set to ``False`` to skip this stage at runtime.
        description:  Human-readable description shown in reports.
        tags:         Arbitrary key-value metadata.
    """

    name:         str
    transform_fn: Callable[[Any], Any]
    validate_fn:  Optional[Callable[[Any], None]] = None
    enabled:      bool                            = True
    description:  str                             = ""
    tags:         Dict[str, str]                  = field(default_factory=dict)

    def run(self, data: Any) -> Tuple[Any, StageResult]:
        """
        Execute transform_fn then validate_fn on *data*.

        Returns:
            ``(transformed_data, StageResult)`` on success.

        Raises:
            Any exception raised by transform_fn or validate_fn is re-raised
            after the StageResult has been built.
        """
        input_type  = type(data).__name__
        records_in  = _count_records(data)
        start       = time.perf_counter()
        error: Optional[str] = None
        output = data

        try:
            output = self.transform_fn(data)
            if self.validate_fn is not None:
                self.validate_fn(output)
        except Exception as exc:
            error = f"{type(exc).__name__}: {exc}"
            raise
        finally:
            duration_ms = (time.perf_counter() - start) * 1000

        return output, StageResult(
            stage_name=self.name,
            success=True,
            input_type=input_type,
            output_type=type(output).__name__,
            duration_ms=duration_ms,
            records_in=records_in,
            records_out=_count_records(output),
            error=error,
        )


def _count_records(data: Any) -> int:
    if data is None:
        return 0
    if hasattr(data, "__len__"):
        return len(data)
    return 1


# ──────────────────────────────────────────────────────────────────────────────
# Pipeline
# ──────────────────────────────────────────────────────────────────────────────

@dataclass
class PipelineReport:
    """Complete report for one pipeline execution."""

    pipeline_name:    str
    run_id:           str
    timestamp:        str
    success:          bool
    total_duration_ms: float
    stages_total:     int
    stages_succeeded: int
    stages_failed:    int
    stages_skipped:   int
    stage_results:    List[StageResult]
    records_in:       int
    records_out:      int
    error:            Optional[str] = None

    def print_summary(self) -> None:
        """Print a human-readable summary table to stdout."""
        status = "\u2705 SUCCESS" if self.success else "\u274c FAILED"
        print(f"\n{'=' * 62}")
        print(f"  Pipeline : {self.pipeline_name}  [{status}]")
        print(f"  Run ID   : {self.run_id}")
        print(f"  Duration : {self.total_duration_ms:.1f} ms")
        print(f"  Stages   : {self.stages_succeeded}/{self.stages_total} succeeded")
        print(f"  Records  : {self.records_in} in \u2192 {self.records_out} out")
        print(f"{'─' * 62}")
        for sr in self.stage_results:
            icon    = "\u2713" if sr.success else "\u2717"
            err_str = f"  \u26a0 {sr.error}" if sr.error else ""
            skip    = " (skipped)" if "stage disabled" in (sr.warnings or []) else ""
            print(
                f"  {icon} {sr.stage_name:<26} "
                f"{sr.duration_ms:>7.1f}ms  "
                f"{sr.records_in}\u2192{sr.records_out} records"
                f"{skip}{err_str}"
            )
        print(f"{'=' * 62}\n")


class DataPipeline:
    """
    Staged data pipeline with SQLite run-logging and a report command.

    Example::

        p = DataPipeline("etl_pipeline")
        p.add_stage(Stage("load",      load_fn))
        p.add_stage(Stage("clean",     clean_fn, validate_fn=check_clean))
        p.add_stage(Stage("transform", transform_fn))
        report = p.run(raw_data)
        report.print_summary()
        p.report()
    """

    def __init__(
        self,
        name: str,
        db_path: Optional[Path] = None,
        stop_on_error: bool = True,
    ) -> None:
        self.name          = name
        self.db_path       = db_path or DB_PATH
        self.stop_on_error = stop_on_error
        self._stages: List[Stage]              = []
        self._run_history: List[PipelineReport] = []
        self._init_db()

    # ── Stage management ──────────────────────────────────────────────────────

    def add_stage(self, stage: Stage) -> "DataPipeline":
        """Append *stage*; returns self for chaining."""
        if any(s.name == stage.name for s in self._stages):
            raise ValueError(f"Stage '{stage.name}' already exists")
        self._stages.append(stage)
        return self

    def remove_stage(self, name: str) -> "DataPipeline":
        """Remove stage by name; returns self."""
        self._stages = [s for s in self._stages if s.name != name]
        return self

    def enable_stage(self, name: str) -> None:
        self._get_stage(name).enabled = True

    def disable_stage(self, name: str) -> None:
        self._get_stage(name).enabled = False

    def stage_names(self) -> List[str]:
        return [s.name for s in self._stages]

    def _get_stage(self, name: str) -> Stage:
        for s in self._stages:
            if s.name == name:
                return s
        raise KeyError(f"Stage '{name}' not found")

    # ── Execution ─────────────────────────────────────────────────────────────

    def run(self, data: Any) -> PipelineReport:
        """
        Execute all enabled stages in order.

        Args:
            data: Input data passed into the first enabled stage.

        Returns:
            :class:`PipelineReport` describing the run.  Also persisted to SQLite.
        """
        run_id    = _make_run_id(self.name)
        timestamp = datetime.now(timezone.utc).isoformat()
        start     = time.perf_counter()

        stage_results: List[StageResult] = []
        current = data
        success = True
        error_msg: Optional[str] = None
        records_in = _count_records(data)

        for stage in self._stages:
            if not stage.enabled:
                stage_results.append(StageResult(
                    stage_name=stage.name, success=True,
                    input_type=type(current).__name__, output_type=type(current).__name__,
                    duration_ms=0.0, records_in=0, records_out=0,
                    warnings=["stage disabled"],
                ))
                continue

            try:
                current, sr = stage.run(current)
                stage_results.append(sr)
            except Exception as exc:
                error_str = f"{type(exc).__name__}: {exc}"
                stage_results.append(StageResult(
                    stage_name=stage.name, success=False,
                    input_type=type(current).__name__, output_type="None",
                    duration_ms=0.0, records_in=_count_records(current), records_out=0,
                    error=error_str,
                ))
                success   = False
                error_msg = error_str
                if self.stop_on_error:
                    break

        total_ms = (time.perf_counter() - start) * 1000
        report = PipelineReport(
            pipeline_name=self.name,
            run_id=run_id,
            timestamp=timestamp,
            success=success,
            total_duration_ms=total_ms,
            stages_total=len(self._stages),
            stages_succeeded=sum(1 for sr in stage_results if sr.success),
            stages_failed=sum(1 for sr in stage_results if not sr.success),
            stages_skipped=len(self._stages) - len(stage_results),
            stage_results=stage_results,
            records_in=records_in,
            records_out=_count_records(current),
            error=error_msg,
        )
        self._run_history.append(report)
        self._persist_report(report)
        return report

    def validate(self, data: Any) -> List[str]:
        """
        Dry-run validation: apply transform + validate_fn for each stage.

        Returns:
            List of error strings (empty list means all valid).
        """
        errors: List[str] = []
        current = data
        for stage in self._stages:
            if not stage.enabled or stage.validate_fn is None:
                continue
            try:
                current = stage.transform_fn(current)
                stage.validate_fn(current)
            except Exception as exc:
                errors.append(f"[{stage.name}] {type(exc).__name__}: {exc}")
        return errors

    def report(self, last_n: int = 5) -> None:
        """Print a tabular summary of the last *last_n* runs from SQLite."""
        runs = self._load_recent_runs(last_n)
        print(f"\n\U0001f4ca Pipeline '{self.name}' — last {len(runs)} runs\n")
        print(f"  {'Run ID':<24}  {'OK':>4}  {'Duration':>10}  {'Records':>10}  Stages")
        print(f"  {'─'*24}  {'─'*4}  {'─'*10}  {'─'*10}  {'─'*6}")
        for r in runs:
            ok  = "\u2705" if r["success"] else "\u274c"
            dur = f"{r['total_duration_ms']:.1f}ms"
            rec = f"{r['records_in']}\u2192{r['records_out']}"
            stg = f"{r['stages_succeeded']}/{r['stages_total']}"
            print(f"  {r['run_id']:<24}  {ok:>4}  {dur:>10}  {rec:>10}  {stg}")
        print()

    # ── SQLite persistence ────────────────────────────────────────────────────

    def _init_db(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(self.db_path) as con:
            con.executescript("""
                CREATE TABLE IF NOT EXISTS pipeline_runs (
                    run_id            TEXT PRIMARY KEY,
                    pipeline_name     TEXT NOT NULL,
                    timestamp         TEXT NOT NULL,
                    success           INTEGER NOT NULL,
                    total_duration_ms REAL    NOT NULL,
                    stages_total      INTEGER,
                    stages_succeeded  INTEGER,
                    stages_failed     INTEGER,
                    records_in        INTEGER,
                    records_out       INTEGER,
                    error             TEXT,
                    payload           TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_pl_name ON pipeline_runs(pipeline_name);
                CREATE INDEX IF NOT EXISTS idx_pl_ts   ON pipeline_runs(timestamp);
            """)

    def _persist_report(self, report: PipelineReport) -> None:
        payload = json.dumps({"stage_results": [asdict(sr) for sr in report.stage_results]})
        with sqlite3.connect(self.db_path) as con:
            con.execute(
                """
                INSERT OR REPLACE INTO pipeline_runs
                    (run_id, pipeline_name, timestamp, success, total_duration_ms,
                     stages_total, stages_succeeded, stages_failed,
                     records_in, records_out, error, payload)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    report.run_id, report.pipeline_name, report.timestamp,
                    int(report.success), report.total_duration_ms,
                    report.stages_total, report.stages_succeeded, report.stages_failed,
                    report.records_in, report.records_out, report.error, payload,
                ),
            )

    def _load_recent_runs(self, n: int) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as con:
            con.row_factory = sqlite3.Row
            rows = con.execute(
                "SELECT * FROM pipeline_runs WHERE pipeline_name=? ORDER BY timestamp DESC LIMIT ?",
                (self.name, n),
            ).fetchall()
        return [dict(r) for r in rows]


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _make_run_id(name: str) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
    h  = hashlib.md5(f"{name}{ts}".encode()).hexdigest()[:6]
    return f"run-{ts}-{h}"


# ──────────────────────────────────────────────────────────────────────────────
# Demo pipeline
# ──────────────────────────────────────────────────────────────────────────────

def _build_demo_pipeline() -> DataPipeline:
    """Return a five-stage demo pipeline that processes synthetic records."""
    import random

    def generate(_: Any = None) -> List[Dict[str, Any]]:
        return [
            {"id": i, "value": random.uniform(-100, 100), "label": f"item_{i}"}
            for i in range(200)
        ]

    def filter_positive(data: List[Dict]) -> List[Dict]:
        return [d for d in data if d["value"] > 0]

    def normalize(data: List[Dict]) -> List[Dict]:
        mx = max((d["value"] for d in data), default=1.0)
        return [{**d, "norm": d["value"] / mx} for d in data]

    def add_tier(data: List[Dict]) -> List[Dict]:
        def tier(v: float) -> str:
            if v >= 0.75:
                return "high"
            if v >= 0.35:
                return "medium"
            return "low"
        return [{**d, "tier": tier(d["norm"])} for d in data]

    def validate_tiers(data: List[Dict]) -> None:
        valid = {"high", "medium", "low"}
        bad   = [d for d in data if d.get("tier") not in valid]
        if bad:
            raise ValidationError(f"{len(bad)} records have invalid tier label")

    def summarize(data: List[Dict]) -> Dict[str, Any]:
        tiers: Dict[str, int] = {}
        for d in data:
            tiers[d["tier"]] = tiers.get(d["tier"], 0) + 1
        return {"count": len(data), "tiers": tiers}

    p = DataPipeline("demo_pipeline")
    p.add_stage(Stage("generate",  generate,       description="Generate 200 synthetic records"))
    p.add_stage(Stage("filter",    filter_positive, description="Keep positive-value records"))
    p.add_stage(Stage("normalize", normalize,       description="Normalize values to [0, 1]"))
    p.add_stage(Stage("tier",      add_tier,        validate_fn=validate_tiers,
                      description="Assign high/medium/low tier"))
    p.add_stage(Stage("summarize", summarize,       description="Aggregate summary dict"))
    return p


# ──────────────────────────────────────────────────────────────────────────────
# CLI
# ──────────────────────────────────────────────────────────────────────────────

def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        prog="pipeline",
        description="BlackRoad Labs — Data Pipeline",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    demo_p = sub.add_parser("demo", help="Run the built-in demo pipeline")
    demo_p.add_argument("--runs", type=int, default=3)

    rep_p = sub.add_parser("report", help="Print pipeline run history")
    rep_p.add_argument("--name", default="demo_pipeline")
    rep_p.add_argument("--last", type=int, default=10)

    args = parser.parse_args(argv)

    if args.command == "demo":
        p = _build_demo_pipeline()
        for i in range(args.runs):
            print(f"\n\U0001f504 Run {i + 1}/{args.runs}")
            report = p.run(None)
            report.print_summary()
        p.report(last_n=args.runs)
        return 0

    elif args.command == "report":
        p = DataPipeline(args.name)
        p.report(last_n=args.last)
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
