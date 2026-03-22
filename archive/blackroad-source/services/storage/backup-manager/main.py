#!/usr/bin/env python3
"""
BlackRoad Backup Manager — Automated backup management with retention policies.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import logging
import os
import shutil
import sqlite3
import sys
import tarfile
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)


DB_PATH = Path(os.environ.get("BACKUP_DB", "~/.blackroad/backups.db")).expanduser()
BACKUP_STORE = Path(os.environ.get("BACKUP_STORE", "~/.blackroad/backup_store")).expanduser()


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS backup_targets (
                id              TEXT PRIMARY KEY,
                name            TEXT NOT NULL,
                target_type     TEXT NOT NULL DEFAULT 'directory',
                source_path     TEXT NOT NULL,
                compression     TEXT NOT NULL DEFAULT 'gzip',
                retention_days  INTEGER NOT NULL DEFAULT 30,
                retention_count INTEGER NOT NULL DEFAULT 10,
                schedule        TEXT,
                created_at      TEXT NOT NULL,
                updated_at      TEXT NOT NULL,
                last_backup_at  TEXT,
                enabled         INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS backups (
                id              TEXT PRIMARY KEY,
                target_id       TEXT NOT NULL REFERENCES backup_targets(id) ON DELETE CASCADE,
                file_path       TEXT NOT NULL,
                file_size       INTEGER NOT NULL DEFAULT 0,
                checksum        TEXT NOT NULL,
                backup_type     TEXT NOT NULL DEFAULT 'full',
                status          TEXT NOT NULL DEFAULT 'pending',
                started_at      TEXT NOT NULL,
                finished_at     TEXT,
                duration_ms     INTEGER,
                files_count     INTEGER NOT NULL DEFAULT 0,
                error           TEXT,
                tags            TEXT NOT NULL DEFAULT '[]'
            );
            CREATE TABLE IF NOT EXISTS restore_jobs (
                id              TEXT PRIMARY KEY,
                backup_id       TEXT NOT NULL REFERENCES backups(id),
                restore_path    TEXT NOT NULL,
                status          TEXT NOT NULL DEFAULT 'pending',
                started_at      TEXT NOT NULL,
                finished_at     TEXT,
                files_restored  INTEGER NOT NULL DEFAULT 0,
                error           TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_backup_target ON backups(target_id);
            CREATE INDEX IF NOT EXISTS idx_backup_status ON backups(status);
        """)


@dataclass
class BackupTarget:
    id: str
    name: str
    target_type: str
    source_path: str
    compression: str
    retention_days: int
    retention_count: int
    schedule: Optional[str]
    created_at: str
    updated_at: str
    last_backup_at: Optional[str]
    enabled: bool

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "BackupTarget":
        return cls(
            id=row["id"], name=row["name"], target_type=row["target_type"],
            source_path=row["source_path"], compression=row["compression"],
            retention_days=row["retention_days"], retention_count=row["retention_count"],
            schedule=row["schedule"], created_at=row["created_at"],
            updated_at=row["updated_at"], last_backup_at=row["last_backup_at"],
            enabled=bool(row["enabled"]),
        )


@dataclass
class Backup:
    id: str
    target_id: str
    file_path: str
    file_size: int
    checksum: str
    backup_type: str
    status: str
    started_at: str
    finished_at: Optional[str]
    duration_ms: Optional[int]
    files_count: int
    error: Optional[str]
    tags: list

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Backup":
        return cls(
            id=row["id"], target_id=row["target_id"], file_path=row["file_path"],
            file_size=row["file_size"], checksum=row["checksum"],
            backup_type=row["backup_type"], status=row["status"],
            started_at=row["started_at"], finished_at=row["finished_at"],
            duration_ms=row["duration_ms"], files_count=row["files_count"],
            error=row["error"], tags=json.loads(row["tags"]),
        )


class BackupManager:

    def register_target(self, name: str, source_path: str, target_type: str = "directory",
                        compression: str = "gzip", retention_days: int = 30,
                        retention_count: int = 10, schedule: str | None = None) -> BackupTarget:
        tid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO backup_targets(id, name, target_type, source_path, compression, "
                "retention_days, retention_count, schedule, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (tid, name, target_type, source_path, compression,
                 retention_days, retention_count, schedule, now, now),
            )
        return BackupTarget(id=tid, name=name, target_type=target_type, source_path=source_path,
                            compression=compression, retention_days=retention_days,
                            retention_count=retention_count, schedule=schedule,
                            created_at=now, updated_at=now, last_backup_at=None, enabled=True)

    def run_backup(self, target_id: str, backup_type: str = "full",
                   tags: list[str] | None = None) -> Backup:
        """Create a backup of the target source."""
        with get_conn() as conn:
            row = conn.execute("SELECT * FROM backup_targets WHERE id=?", (target_id,)).fetchone()
        if not row:
            raise ValueError(f"Target {target_id!r} not found")
        target = BackupTarget.from_row(row)

        bid = str(uuid.uuid4())
        started = datetime.now(timezone.utc)
        BACKUP_STORE.mkdir(parents=True, exist_ok=True)

        # Determine output path
        ts = started.strftime("%Y%m%d_%H%M%S")
        out_name = f"{target.name}_{ts}_{bid[:8]}"
        if target.compression == "gzip":
            out_name += ".tar.gz"
        else:
            out_name += ".tar"
        out_path = BACKUP_STORE / out_name

        # Perform backup
        error = None
        file_size = 0
        files_count = 0
        checksum = ""
        try:
            source = Path(target.source_path).expanduser()
            if not source.exists():
                raise FileNotFoundError(f"Source path does not exist: {source}")

            mode = "w:gz" if target.compression == "gzip" else "w"
            with tarfile.open(str(out_path), mode) as tar:
                if source.is_dir():
                    for p in source.rglob("*"):
                        if p.is_file():
                            tar.add(str(p), arcname=str(p.relative_to(source.parent)))
                            files_count += 1
                else:
                    tar.add(str(source), arcname=source.name)
                    files_count = 1

            file_size = out_path.stat().st_size
            checksum = self._checksum(out_path)
        except Exception as exc:
            error = str(exc)

        finished = datetime.now(timezone.utc)
        dur = int((finished - started).total_seconds() * 1000)
        status = "success" if error is None else "failed"

        with get_conn() as conn:
            conn.execute(
                "INSERT INTO backups(id, target_id, file_path, file_size, checksum, backup_type, "
                "status, started_at, finished_at, duration_ms, files_count, error, tags) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (bid, target_id, str(out_path), file_size, checksum, backup_type,
                 status, started.isoformat(), finished.isoformat(), dur,
                 files_count, error, json.dumps(tags or [])),
            )
            conn.execute(
                "UPDATE backup_targets SET last_backup_at=?, updated_at=? WHERE id=?",
                (finished.isoformat(), finished.isoformat(), target_id),
            )

        return Backup(
            id=bid, target_id=target_id, file_path=str(out_path), file_size=file_size,
            checksum=checksum, backup_type=backup_type, status=status,
            started_at=started.isoformat(), finished_at=finished.isoformat(),
            duration_ms=dur, files_count=files_count, error=error, tags=tags or [],
        )

    def restore_backup(self, backup_id: str, restore_path: str) -> dict:
        """Restore a backup to the given path."""
        with get_conn() as conn:
            row = conn.execute("SELECT * FROM backups WHERE id=?", (backup_id,)).fetchone()
        if not row:
            raise ValueError(f"Backup {backup_id!r} not found")
        backup = Backup.from_row(row)

        rid = str(uuid.uuid4())
        started = datetime.now(timezone.utc)
        restore_dir = Path(restore_path).expanduser()
        restore_dir.mkdir(parents=True, exist_ok=True)

        with get_conn() as conn:
            conn.execute(
                "INSERT INTO restore_jobs(id, backup_id, restore_path, started_at) VALUES (?,?,?,?)",
                (rid, backup_id, str(restore_dir), started.isoformat()),
            )

        files_restored = 0
        error = None
        try:
            bak_path = Path(backup.file_path)
            if not bak_path.exists():
                raise FileNotFoundError(f"Backup file not found: {bak_path}")
            # Verify checksum
            actual = self._checksum(bak_path)
            if actual != backup.checksum:
                raise ValueError(f"Checksum mismatch: expected {backup.checksum}, got {actual}")
            with tarfile.open(str(bak_path), "r:*") as tar:
                tar.extractall(str(restore_dir), filter="data")
                files_restored = len(tar.getnames())
        except Exception as exc:
            error = str(exc)

        finished = datetime.now(timezone.utc)
        status = "success" if error is None else "failed"
        with get_conn() as conn:
            conn.execute(
                "UPDATE restore_jobs SET status=?, finished_at=?, files_restored=?, error=? WHERE id=?",
                (status, finished.isoformat(), files_restored, error, rid),
            )
        return {
            "restore_id": rid, "status": status, "files_restored": files_restored,
            "restore_path": str(restore_dir), "error": error,
        }

    def verify_backup(self, backup_id: str) -> dict:
        with get_conn() as conn:
            row = conn.execute("SELECT * FROM backups WHERE id=?", (backup_id,)).fetchone()
        if not row:
            raise ValueError(f"Backup {backup_id!r} not found")
        backup = Backup.from_row(row)
        bak_path = Path(backup.file_path)
        if not bak_path.exists():
            return {"valid": False, "error": "Backup file missing"}
        actual = self._checksum(bak_path)
        valid = actual == backup.checksum
        return {
            "valid": valid,
            "backup_id": backup_id,
            "expected_checksum": backup.checksum,
            "actual_checksum": actual,
            "file_exists": True,
            "file_size": bak_path.stat().st_size,
        }

    def enforce_retention(self, target_id: str) -> dict:
        """Delete old backups based on retention policy."""
        with get_conn() as conn:
            row = conn.execute("SELECT * FROM backup_targets WHERE id=?", (target_id,)).fetchone()
        if not row:
            raise ValueError(f"Target {target_id!r} not found")
        target = BackupTarget.from_row(row)

        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM backups WHERE target_id=? AND status='success' ORDER BY started_at DESC",
                (target_id,),
            ).fetchall()

        backups = [Backup.from_row(r) for r in rows]
        deleted = 0
        cutoff = datetime.now(timezone.utc) - timedelta(days=target.retention_days)

        to_delete = []
        # Keep newest N
        if len(backups) > target.retention_count:
            to_delete.extend(backups[target.retention_count:])
        # Delete by age
        for b in backups:
            try:
                b_dt = datetime.fromisoformat(b.started_at)
                if b_dt < cutoff and b not in to_delete:
                    to_delete.append(b)
            except ValueError:
                pass

        for b in to_delete:
            p = Path(b.file_path)
            if p.exists():
                p.unlink()
            with get_conn() as conn:
                conn.execute("DELETE FROM backups WHERE id=?", (b.id,))
            deleted += 1

        return {"deleted": deleted, "remaining": len(backups) - deleted}

    def list_backups(self, target_id: str | None = None, limit: int = 50) -> list[dict]:
        query = "SELECT * FROM backups WHERE 1=1"
        params: list[Any] = []
        if target_id:
            query += " AND target_id=?"
            params.append(target_id)
        query += " ORDER BY started_at DESC LIMIT ?"
        params.append(limit)
        with get_conn() as conn:
            rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

    def list_targets(self) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute("SELECT * FROM backup_targets ORDER BY name").fetchall()
        return [dict(r) for r in rows]

    def storage_summary(self) -> dict:
        with get_conn() as conn:
            row = conn.execute(
                "SELECT COUNT(*) as count, SUM(file_size) as total_size FROM backups WHERE status='success'"
            ).fetchone()
            targets = conn.execute("SELECT COUNT(*) as c FROM backup_targets WHERE enabled=1").fetchone()["c"]
        total_size = row["total_size"] or 0
        return {
            "total_backups": row["count"],
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / 1_048_576, 2),
            "active_targets": targets,
        }

    @staticmethod
    def _checksum(path: Path) -> str:
        h = hashlib.sha256()
        with open(str(path), "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                h.update(chunk)
        return h.hexdigest()


def main() -> None:
    init_db()
    parser = argparse.ArgumentParser(prog="backup-manager", description="BlackRoad Backup Manager")
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    p = sub.add_parser("register", help="Register a backup target")
    p.add_argument("name"); p.add_argument("source_path")
    p.add_argument("--type", default="directory")
    p.add_argument("--compression", default="gzip")
    p.add_argument("--retention-days", type=int, default=30)
    p.add_argument("--retention-count", type=int, default=10)

    p = sub.add_parser("backup", help="Run a backup")
    p.add_argument("target_id")
    p.add_argument("--type", default="full")

    p = sub.add_parser("restore", help="Restore a backup")
    p.add_argument("backup_id"); p.add_argument("restore_path")

    p = sub.add_parser("verify", help="Verify backup integrity")
    p.add_argument("backup_id")

    p = sub.add_parser("retention", help="Enforce retention policy")
    p.add_argument("target_id")

    p = sub.add_parser("list", help="List backups")
    p.add_argument("--target", default=None)

    p = sub.add_parser("targets", help="List backup targets")

    p = sub.add_parser("stats", help="Storage summary")

    args = parser.parse_args()
    mgr = BackupManager()

    if args.command == "register":
        t = mgr.register_target(args.name, args.source_path, target_type=args.type,
                                 compression=args.compression,
                                 retention_days=args.retention_days,
                                 retention_count=args.retention_count)
        print(json.dumps({"id": t.id, "name": t.name, "source": t.source_path}, indent=2))
    elif args.command == "backup":
        b = mgr.run_backup(args.target_id, backup_type=args.type)
        print(json.dumps({
            "id": b.id, "status": b.status, "size": b.file_size,
            "files": b.files_count, "duration_ms": b.duration_ms,
            "error": b.error,
        }, indent=2))
    elif args.command == "restore":
        result = mgr.restore_backup(args.backup_id, args.restore_path)
        print(json.dumps(result, indent=2))
    elif args.command == "verify":
        result = mgr.verify_backup(args.backup_id)
        print(json.dumps(result, indent=2))
    elif args.command == "retention":
        result = mgr.enforce_retention(args.target_id)
        print(json.dumps(result, indent=2))
    elif args.command == "list":
        print(json.dumps(mgr.list_backups(target_id=args.target), indent=2))
    elif args.command == "targets":
        print(json.dumps(mgr.list_targets(), indent=2))
    elif args.command == "stats":
        print(json.dumps(mgr.storage_summary(), indent=2))
    else:
        parser.print_help()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    main()
