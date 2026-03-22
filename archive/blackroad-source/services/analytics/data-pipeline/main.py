#!/usr/bin/env python3
"""
BlackRoad Data Pipeline — ETL framework with dependency graph execution.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sqlite3
import sys
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Optional


DB_PATH = Path(os.environ.get("PIPELINE_DB", "~/.blackroad/pipelines.db")).expanduser()


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS pipelines (
                id          TEXT PRIMARY KEY,
                name        TEXT NOT NULL,
                description TEXT,
                status      TEXT NOT NULL DEFAULT 'idle',
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL,
                config      TEXT NOT NULL DEFAULT '{}'
            );
            CREATE TABLE IF NOT EXISTS sources (
                id          TEXT PRIMARY KEY,
                pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
                name        TEXT NOT NULL,
                source_type TEXT NOT NULL,
                config      TEXT NOT NULL DEFAULT '{}',
                schema      TEXT,
                created_at  TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS transforms (
                id             TEXT PRIMARY KEY,
                pipeline_id    TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
                name           TEXT NOT NULL,
                transform_type TEXT NOT NULL,
                config         TEXT NOT NULL DEFAULT '{}',
                depends_on     TEXT NOT NULL DEFAULT '[]',
                order_index    INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS sinks (
                id          TEXT PRIMARY KEY,
                pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
                name        TEXT NOT NULL,
                sink_type   TEXT NOT NULL,
                config      TEXT NOT NULL DEFAULT '{}'
            );
            CREATE TABLE IF NOT EXISTS runs (
                id          TEXT PRIMARY KEY,
                pipeline_id TEXT NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
                status      TEXT NOT NULL DEFAULT 'pending',
                started_at  TEXT,
                finished_at TEXT,
                rows_read   INTEGER DEFAULT 0,
                rows_written INTEGER DEFAULT 0,
                error       TEXT,
                stats       TEXT NOT NULL DEFAULT '{}'
            );
        """)


# ─────────────────────────────────────────────
# Data classes
# ─────────────────────────────────────────────

@dataclass
class DataSource:
    id: str
    pipeline_id: str
    name: str
    source_type: str        # csv | json | sqlite | postgres | api
    config: dict
    schema: Optional[dict]
    created_at: str

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "DataSource":
        return cls(
            id=row["id"], pipeline_id=row["pipeline_id"], name=row["name"],
            source_type=row["source_type"], config=json.loads(row["config"]),
            schema=json.loads(row["schema"]) if row["schema"] else None,
            created_at=row["created_at"],
        )

    def read(self) -> list[dict]:
        if self.source_type == "csv":
            return self._read_csv()
        elif self.source_type == "json":
            return self._read_json()
        elif self.source_type == "sqlite":
            return self._read_sqlite()
        elif self.source_type == "inline":
            return self.config.get("data", [])
        else:
            raise ValueError(f"Unsupported source type: {self.source_type!r}")

    def _read_csv(self) -> list[dict]:
        path = self.config.get("path", "")
        delimiter = self.config.get("delimiter", ",")
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=delimiter)
            return list(reader)

    def _read_json(self) -> list[dict]:
        path = self.config.get("path", "")
        data = json.loads(Path(path).read_text())
        return data if isinstance(data, list) else [data]

    def _read_sqlite(self) -> list[dict]:
        db = self.config.get("database", "")
        table = self.config.get("table", "")
        query = self.config.get("query", f"SELECT * FROM {table}")
        conn = sqlite3.connect(db)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(query).fetchall()
        conn.close()
        return [dict(r) for r in rows]


@dataclass
class Transform:
    id: str
    pipeline_id: str
    name: str
    transform_type: str     # filter | map | aggregate | join | sort | deduplicate
    config: dict
    depends_on: list[str]
    order_index: int

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Transform":
        return cls(
            id=row["id"], pipeline_id=row["pipeline_id"], name=row["name"],
            transform_type=row["transform_type"], config=json.loads(row["config"]),
            depends_on=json.loads(row["depends_on"]), order_index=row["order_index"],
        )

    def apply(self, data: list[dict], context: dict | None = None) -> list[dict]:
        ctx = context or {}
        if self.transform_type == "filter":
            return self._filter(data)
        elif self.transform_type == "map":
            return self._map(data)
        elif self.transform_type == "aggregate":
            return self._aggregate(data)
        elif self.transform_type == "join":
            return self._join(data, ctx)
        elif self.transform_type == "sort":
            return self._sort(data)
        elif self.transform_type == "deduplicate":
            return self._deduplicate(data)
        elif self.transform_type == "select":
            return self._select(data)
        elif self.transform_type == "rename":
            return self._rename(data)
        else:
            raise ValueError(f"Unknown transform: {self.transform_type!r}")

    def _filter(self, data: list[dict]) -> list[dict]:
        field_name = self.config.get("field", "")
        op = self.config.get("op", "eq")
        value = self.config.get("value")
        result = []
        for row in data:
            v = row.get(field_name)
            try:
                v_cmp = type(value)(v) if value is not None else v
            except (TypeError, ValueError):
                v_cmp = v
            if op == "eq" and v_cmp == value:
                result.append(row)
            elif op == "ne" and v_cmp != value:
                result.append(row)
            elif op == "gt" and v_cmp is not None and value is not None and v_cmp > value:
                result.append(row)
            elif op == "lt" and v_cmp is not None and value is not None and v_cmp < value:
                result.append(row)
            elif op == "contains" and str(value) in str(v):
                result.append(row)
            elif op == "notnull" and v is not None and v != "":
                result.append(row)
        return result

    def _map(self, data: list[dict]) -> list[dict]:
        field_name = self.config.get("field", "")
        operation = self.config.get("operation", "str")
        ops: dict[str, Callable] = {
            "str": str, "int": int, "float": float,
            "upper": lambda x: str(x).upper(),
            "lower": lambda x: str(x).lower(),
            "strip": lambda x: str(x).strip(),
        }
        fn = ops.get(operation, str)
        result = []
        for row in data:
            row = dict(row)
            if field_name in row:
                try:
                    row[field_name] = fn(row[field_name])
                except (TypeError, ValueError):
                    pass
            result.append(row)
        return result

    def _aggregate(self, data: list[dict]) -> list[dict]:
        group_by = self.config.get("group_by", [])
        agg_field = self.config.get("field", "")
        agg_fn = self.config.get("function", "count")
        groups: dict[tuple, list] = {}
        for row in data:
            key = tuple(row.get(g, "") for g in group_by)
            groups.setdefault(key, []).append(row)
        result = []
        for key, rows in groups.items():
            out_row = dict(zip(group_by, key))
            vals = [r.get(agg_field) for r in rows if r.get(agg_field) is not None]
            if agg_fn == "count":
                out_row[f"{agg_field}_count"] = len(rows)
            elif agg_fn == "sum":
                out_row[f"{agg_field}_sum"] = sum(float(v) for v in vals)
            elif agg_fn == "avg" and vals:
                out_row[f"{agg_field}_avg"] = sum(float(v) for v in vals) / len(vals)
            elif agg_fn == "max" and vals:
                out_row[f"{agg_field}_max"] = max(float(v) for v in vals)
            elif agg_fn == "min" and vals:
                out_row[f"{agg_field}_min"] = min(float(v) for v in vals)
            result.append(out_row)
        return result

    def _join(self, data: list[dict], ctx: dict) -> list[dict]:
        right_name = self.config.get("right", "")
        left_key = self.config.get("left_key", "id")
        right_key = self.config.get("right_key", "id")
        right_data = ctx.get(right_name, [])
        right_index = {r.get(right_key): r for r in right_data}
        result = []
        for row in data:
            match = right_index.get(row.get(left_key))
            if match:
                merged = {**row, **{f"r_{k}": v for k, v in match.items()}}
                result.append(merged)
        return result

    def _sort(self, data: list[dict]) -> list[dict]:
        field_name = self.config.get("field", "")
        reverse = self.config.get("descending", False)
        return sorted(data, key=lambda r: r.get(field_name, ""), reverse=reverse)

    def _deduplicate(self, data: list[dict]) -> list[dict]:
        keys = self.config.get("keys", list(data[0].keys()) if data else [])
        seen: set[tuple] = set()
        result = []
        for row in data:
            sig = tuple(row.get(k) for k in keys)
            if sig not in seen:
                seen.add(sig)
                result.append(row)
        return result

    def _select(self, data: list[dict]) -> list[dict]:
        fields = self.config.get("fields", [])
        return [{f: row[f] for f in fields if f in row} for row in data]

    def _rename(self, data: list[dict]) -> list[dict]:
        mapping = self.config.get("mapping", {})
        result = []
        for row in data:
            new_row = {mapping.get(k, k): v for k, v in row.items()}
            result.append(new_row)
        return result


@dataclass
class Sink:
    id: str
    pipeline_id: str
    name: str
    sink_type: str          # json | csv | sqlite | stdout
    config: dict

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Sink":
        return cls(
            id=row["id"], pipeline_id=row["pipeline_id"], name=row["name"],
            sink_type=row["sink_type"], config=json.loads(row["config"]),
        )

    def write(self, data: list[dict]) -> int:
        if self.sink_type == "stdout":
            print(json.dumps(data, indent=2))
            return len(data)
        elif self.sink_type == "json":
            path = self.config.get("path", "output.json")
            Path(path).write_text(json.dumps(data, indent=2))
            return len(data)
        elif self.sink_type == "csv":
            path = self.config.get("path", "output.csv")
            if not data:
                return 0
            with open(path, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=data[0].keys())
                writer.writeheader()
                writer.writerows(data)
            return len(data)
        elif self.sink_type == "sqlite":
            db = self.config.get("database", "output.db")
            table = self.config.get("table", "output")
            conn = sqlite3.connect(db)
            if data:
                cols = list(data[0].keys())
                placeholders = ",".join("?" * len(cols))
                col_defs = ",".join(f'"{c}" TEXT' for c in cols)
                conn.execute(f"CREATE TABLE IF NOT EXISTS {table} ({col_defs})")
                conn.executemany(
                    f"INSERT INTO {table} VALUES ({placeholders})",
                    [[row.get(c) for c in cols] for row in data],
                )
                conn.commit()
            conn.close()
            return len(data)
        else:
            raise ValueError(f"Unknown sink type: {self.sink_type!r}")


@dataclass
class Pipeline:
    id: str
    name: str
    description: str
    status: str
    created_at: str
    updated_at: str
    config: dict

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Pipeline":
        return cls(
            id=row["id"], name=row["name"], description=row["description"] or "",
            status=row["status"], created_at=row["created_at"],
            updated_at=row["updated_at"], config=json.loads(row["config"]),
        )


# ─────────────────────────────────────────────
# PipelineService
# ─────────────────────────────────────────────

class PipelineService:

    def create_pipeline(self, name: str, description: str = "") -> Pipeline:
        pid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO pipelines(id, name, description, created_at, updated_at) VALUES (?,?,?,?,?)",
                (pid, name, description, now, now),
            )
        return Pipeline(id=pid, name=name, description=description, status="idle",
                        created_at=now, updated_at=now, config={})

    def add_source(self, pipeline_id: str, name: str, source_type: str, config: dict) -> DataSource:
        sid = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO sources(id, pipeline_id, name, source_type, config, created_at) VALUES (?,?,?,?,?,?)",
                (sid, pipeline_id, name, source_type, json.dumps(config), now),
            )
        return DataSource(id=sid, pipeline_id=pipeline_id, name=name, source_type=source_type,
                          config=config, schema=None, created_at=now)

    def add_transform(self, pipeline_id: str, name: str, transform_type: str,
                      config: dict, depends_on: list[str] | None = None, order_index: int = 0) -> Transform:
        tid = str(uuid.uuid4())
        deps = depends_on or []
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO transforms(id, pipeline_id, name, transform_type, config, depends_on, order_index) "
                "VALUES (?,?,?,?,?,?,?)",
                (tid, pipeline_id, name, transform_type, json.dumps(config), json.dumps(deps), order_index),
            )
        return Transform(id=tid, pipeline_id=pipeline_id, name=name, transform_type=transform_type,
                         config=config, depends_on=deps, order_index=order_index)

    def add_sink(self, pipeline_id: str, name: str, sink_type: str, config: dict) -> Sink:
        sid = str(uuid.uuid4())
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO sinks(id, pipeline_id, name, sink_type, config) VALUES (?,?,?,?,?)",
                (sid, pipeline_id, name, sink_type, json.dumps(config)),
            )
        return Sink(id=sid, pipeline_id=pipeline_id, name=name, sink_type=sink_type, config=config)

    def run_pipeline(self, pipeline_id: str) -> dict:
        """Execute all sources -> transforms -> sinks for a pipeline."""
        run_id = str(uuid.uuid4())
        started = datetime.utcnow()
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO runs(id, pipeline_id, status, started_at) VALUES (?,?,?,?)",
                (run_id, pipeline_id, "running", started.isoformat()),
            )

        try:
            # Load components
            with get_conn() as conn:
                src_rows = conn.execute("SELECT * FROM sources WHERE pipeline_id=?", (pipeline_id,)).fetchall()
                trn_rows = conn.execute("SELECT * FROM transforms WHERE pipeline_id=? ORDER BY order_index", (pipeline_id,)).fetchall()
                snk_rows = conn.execute("SELECT * FROM sinks WHERE pipeline_id=?", (pipeline_id,)).fetchall()

            sources = [DataSource.from_row(r) for r in src_rows]
            transforms = [Transform.from_row(r) for r in trn_rows]
            sinks = [Sink.from_row(r) for r in snk_rows]

            # Read
            data: list[dict] = []
            source_data: dict[str, list[dict]] = {}
            for src in sources:
                read = src.read()
                source_data[src.name] = read
                data.extend(read)
            rows_read = len(data)

            # Transform
            for transform in transforms:
                data = transform.apply(data, context=source_data)

            # Write
            rows_written = 0
            for sink in sinks:
                rows_written += sink.write(data)

            finished = datetime.utcnow()
            dur = int((finished - started).total_seconds() * 1000)
            with get_conn() as conn:
                conn.execute(
                    "UPDATE runs SET status=?, finished_at=?, rows_read=?, rows_written=?, "
                    "stats=? WHERE id=?",
                    ("success", finished.isoformat(), rows_read, rows_written,
                     json.dumps({"duration_ms": dur}), run_id),
                )

            return {"run_id": run_id, "status": "success", "rows_read": rows_read,
                    "rows_written": rows_written, "duration_ms": dur}

        except Exception as exc:
            finished = datetime.utcnow()
            with get_conn() as conn:
                conn.execute(
                    "UPDATE runs SET status=?, finished_at=?, error=? WHERE id=?",
                    ("failed", finished.isoformat(), str(exc), run_id),
                )
            return {"run_id": run_id, "status": "failed", "error": str(exc)}

    def validate_schema(self, source_id: str) -> dict:
        """Infer and validate schema for a data source."""
        with get_conn() as conn:
            row = conn.execute("SELECT * FROM sources WHERE id=?", (source_id,)).fetchone()
        if not row:
            raise ValueError(f"Source {source_id!r} not found")
        src = DataSource.from_row(row)
        try:
            data = src.read()
        except Exception as exc:
            return {"valid": False, "error": str(exc)}
        if not data:
            return {"valid": True, "schema": {}, "rows": 0, "warning": "Empty dataset"}
        schema: dict[str, set[str]] = {}
        for row_data in data:
            for k, v in row_data.items():
                schema.setdefault(k, set()).add(type(v).__name__)
        return {
            "valid": True,
            "rows": len(data),
            "schema": {k: list(v) for k, v in schema.items()},
        }

    def list_pipelines(self) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute("SELECT * FROM pipelines ORDER BY updated_at DESC").fetchall()
        return [dict(r) for r in rows]

    def list_runs(self, pipeline_id: str) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM runs WHERE pipeline_id=? ORDER BY started_at DESC",
                (pipeline_id,),
            ).fetchall()
        return [dict(r) for r in rows]


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

def main() -> None:
    init_db()
    parser = argparse.ArgumentParser(
        prog="pipeline",
        description="BlackRoad Data Pipeline — ETL framework",
    )
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    p = sub.add_parser("create", help="Create a pipeline")
    p.add_argument("name"); p.add_argument("--description", default="")

    p = sub.add_parser("list", help="List pipelines")

    p = sub.add_parser("run", help="Run a pipeline")
    p.add_argument("id", help="Pipeline ID")

    p = sub.add_parser("runs", help="Show run history")
    p.add_argument("id", help="Pipeline ID")

    p = sub.add_parser("validate", help="Validate a source schema")
    p.add_argument("source_id")

    args = parser.parse_args()
    svc = PipelineService()

    if args.command == "create":
        p = svc.create_pipeline(args.name, args.description)
        print(json.dumps({"id": p.id, "name": p.name}, indent=2))
    elif args.command == "list":
        print(json.dumps(svc.list_pipelines(), indent=2))
    elif args.command == "run":
        result = svc.run_pipeline(args.id)
        print(json.dumps(result, indent=2))
    elif args.command == "runs":
        print(json.dumps(svc.list_runs(args.id), indent=2))
    elif args.command == "validate":
        result = svc.validate_schema(args.source_id)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
