#!/usr/bin/env python3
"""
BlackRoad Backup Manager
Production-grade backup system: full, incremental, and differential backups.
Uses tarfile + hashlib. SQLite for job tracking.
"""

import sqlite3
import tarfile
import hashlib
import logging
import os
import sys
import json
import argparse
import datetime
import shutil
import fnmatch
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional, List, Dict, Any, Set

logger = logging.getLogger(__name__)


DB_PATH = os.environ.get("BACKUP_MANAGER_DB", os.path.expanduser("~/.blackroad/backup_manager.db"))
DEFAULT_KEEP = 5


@dataclass
class BackupJob:
    id: str
    source_path: str
    dest_path: str
    backup_type: str        # 'full' | 'incremental' | 'differential'
    status: str             # 'pending' | 'running' | 'success' | 'failed' | 'verified'
    size_bytes: int
    checksum: str           # SHA-256 of the tar archive
    created_at: str
    completed_at: str
    file_count: int
    parent_job_id: str      # for incremental/differential
    error_message: str
    compression: str        # 'gz' | 'bz2' | 'xz' | 'none'
    tags: str

    @classmethod
    def from_row(cls, row) -> "BackupJob":
        return cls(*tuple(row))

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def _job_id(source: str, btype: str) -> str:
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
    short = hashlib.sha256(source.encode()).hexdigest()[:6]
    return f"{btype}_{ts}_{short}"


def _sha256_file(path: str, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        while data := fh.read(chunk):
            h.update(data)
    return h.hexdigest()


def _sha256_dir_manifest(root: str) -> Dict[str, str]:
    """Return {rel_path: sha256} for every file under root."""
    manifest: Dict[str, str] = {}
    root_path = Path(root)
    for p in sorted(root_path.rglob("*")):
        if p.is_file():
            rel = str(p.relative_to(root_path))
            manifest[rel] = _sha256_file(str(p))
    return manifest


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def get_db(path: str = DB_PATH) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    _init_db(conn)
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS backup_jobs (
            id             TEXT PRIMARY KEY,
            source_path    TEXT NOT NULL,
            dest_path      TEXT NOT NULL,
            backup_type    TEXT NOT NULL DEFAULT 'full',
            status         TEXT NOT NULL DEFAULT 'pending',
            size_bytes     INTEGER DEFAULT 0,
            checksum       TEXT DEFAULT '',
            created_at     TEXT NOT NULL,
            completed_at   TEXT DEFAULT '',
            file_count     INTEGER DEFAULT 0,
            parent_job_id  TEXT DEFAULT '',
            error_message  TEXT DEFAULT '',
            compression    TEXT DEFAULT 'gz',
            tags           TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS file_manifests (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id      TEXT NOT NULL,
            rel_path    TEXT NOT NULL,
            checksum    TEXT NOT NULL,
            size_bytes  INTEGER DEFAULT 0,
            modified_at TEXT DEFAULT '',
            UNIQUE(job_id, rel_path)
        );

        CREATE TABLE IF NOT EXISTS restore_events (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id       TEXT NOT NULL,
            dest_path    TEXT NOT NULL,
            status       TEXT NOT NULL,
            files_written INTEGER DEFAULT 0,
            restored_at  TEXT NOT NULL,
            error        TEXT DEFAULT ''
        );

        CREATE INDEX IF NOT EXISTS idx_jobs_source ON backup_jobs(source_path);
        CREATE INDEX IF NOT EXISTS idx_jobs_type ON backup_jobs(backup_type);
        CREATE INDEX IF NOT EXISTS idx_manifests_job ON file_manifests(job_id);
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# Manifest helpers for incremental/differential
# ---------------------------------------------------------------------------

def _load_manifest(conn: sqlite3.Connection, job_id: str) -> Dict[str, str]:
    rows = conn.execute(
        "SELECT rel_path, checksum FROM file_manifests WHERE job_id = ?", (job_id,)
    ).fetchall()
    return {r["rel_path"]: r["checksum"] for r in rows}


def _save_manifest(conn: sqlite3.Connection, job_id: str, manifest: Dict[str, str], source_root: str) -> None:
    source_path = Path(source_root)
    for rel_path, checksum in manifest.items():
        full = source_path / rel_path
        size = full.stat().st_size if full.exists() else 0
        mtime = datetime.datetime.fromtimestamp(full.stat().st_mtime, datetime.timezone.utc).isoformat().replace("+00:00", "Z") if full.exists() else ""
        conn.execute("""
            INSERT OR REPLACE INTO file_manifests (job_id, rel_path, checksum, size_bytes, modified_at)
            VALUES (?, ?, ?, ?, ?)
        """, (job_id, rel_path, checksum, size, mtime))
    conn.commit()


def _changed_files(current: Dict[str, str], baseline: Dict[str, str]) -> Set[str]:
    """Files that are new or modified compared to baseline."""
    changed: Set[str] = set()
    for rel, chk in current.items():
        if rel not in baseline or baseline[rel] != chk:
            changed.add(rel)
    return changed


# ---------------------------------------------------------------------------
# Core backup operations
# ---------------------------------------------------------------------------

def create_backup(
    source: str,
    dest: str,
    backup_type: str = "full",
    compression: str = "gz",
    tags: List[str] = None,
    exclude_patterns: List[str] = None,
    parent_job_id: str = "",
    db_path: str = DB_PATH,
) -> BackupJob:
    """Create a backup of source path into dest directory."""
    source = str(Path(source).resolve())
    if not os.path.exists(source):
        raise FileNotFoundError(f"Source not found: {source}")
    if backup_type not in ("full", "incremental", "differential"):
        raise ValueError(f"Invalid backup type: {backup_type}")

    conn = get_db(db_path)
    job_id = _job_id(source, backup_type)
    now = _now()
    ext = {"gz": "tar.gz", "bz2": "tar.bz2", "xz": "tar.xz", "none": "tar"}.get(compression, "tar.gz")
    archive_name = f"{job_id}.{ext}"
    dest_dir = Path(dest)
    dest_dir.mkdir(parents=True, exist_ok=True)
    archive_path = str(dest_dir / archive_name)

    conn.execute("""
        INSERT INTO backup_jobs (id, source_path, dest_path, backup_type, status, created_at,
                                 parent_job_id, compression, tags)
        VALUES (?, ?, ?, ?, 'running', ?, ?, ?, ?)
    """, (job_id, source, archive_path, backup_type, now,
          parent_job_id, compression, ",".join(tags or [])))
    conn.commit()
    logger.info("Backup job %s started: %s -> %s (%s)", job_id, source, archive_path, backup_type)

    try:
        current_manifest = _sha256_dir_manifest(source)
        files_to_backup: Set[str]

        if backup_type == "full":
            files_to_backup = set(current_manifest.keys())
        elif backup_type in ("incremental", "differential"):
            if not parent_job_id:
                # Find last backup of same source
                last = conn.execute("""
                    SELECT id FROM backup_jobs
                    WHERE source_path = ? AND status IN ('success', 'verified')
                    ORDER BY created_at DESC LIMIT 1
                """, (source,)).fetchone()
                parent_job_id = last["id"] if last else ""

            if parent_job_id:
                if backup_type == "incremental":
                    # Only vs the direct parent
                    baseline = _load_manifest(conn, parent_job_id)
                else:
                    # Differential: vs the last FULL backup
                    full_job = conn.execute("""
                        SELECT id FROM backup_jobs
                        WHERE source_path = ? AND backup_type = 'full'
                              AND status IN ('success', 'verified')
                        ORDER BY created_at DESC LIMIT 1
                    """, (source,)).fetchone()
                    baseline = _load_manifest(conn, full_job["id"] if full_job else parent_job_id)
                files_to_backup = _changed_files(current_manifest, baseline)
            else:
                # No parent found — fall back to full
                files_to_backup = set(current_manifest.keys())
        else:
            files_to_backup = set(current_manifest.keys())

        # Apply exclusion patterns
        if exclude_patterns:
            filtered: Set[str] = set()
            for rel in files_to_backup:
                if not any(fnmatch.fnmatch(rel, pat) for pat in exclude_patterns):
                    filtered.add(rel)
            files_to_backup = filtered

        # Write tar archive
        mode = f"w:{compression}" if compression != "none" else "w"
        source_path = Path(source)
        file_count = 0

        with tarfile.open(archive_path, mode) as tar:
            for rel in sorted(files_to_backup):
                full_path = source_path / rel
                if full_path.exists():
                    tar.add(str(full_path), arcname=rel)
                    file_count += 1

        checksum = _sha256_file(archive_path)
        size = os.path.getsize(archive_path)
        completed_at = _now()

        # Save manifest for future incrementals
        _save_manifest(conn, job_id, {k: v for k, v in current_manifest.items() if k in files_to_backup}, source)

        conn.execute("""
            UPDATE backup_jobs SET
                status = 'success', size_bytes = ?, checksum = ?,
                completed_at = ?, file_count = ?, parent_job_id = ?
            WHERE id = ?
        """, (size, checksum, completed_at, file_count, parent_job_id, job_id))
        conn.commit()
        logger.info("Backup job %s succeeded: %d files, %d bytes", job_id, file_count, size)

        return BackupJob(
            id=job_id, source_path=source, dest_path=archive_path,
            backup_type=backup_type, status="success", size_bytes=size,
            checksum=checksum, created_at=now, completed_at=completed_at,
            file_count=file_count, parent_job_id=parent_job_id,
            error_message="", compression=compression, tags=",".join(tags or [])
        )

    except Exception as exc:
        msg = str(exc)
        conn.execute("""
            UPDATE backup_jobs SET status = 'failed', error_message = ?, completed_at = ?
            WHERE id = ?
        """, (msg, _now(), job_id))
        conn.commit()
        logger.error("Backup job %s failed: %s", job_id, msg)
        # Clean up partial archive
        if os.path.exists(archive_path):
            os.unlink(archive_path)
        raise RuntimeError(f"Backup failed: {msg}") from exc


def restore(
    job_id: str,
    dest: str,
    db_path: str = DB_PATH,
) -> Dict[str, Any]:
    """Restore files from a backup job to dest directory."""
    conn = get_db(db_path)
    row = conn.execute("SELECT * FROM backup_jobs WHERE id = ?", (job_id,)).fetchone()
    if not row:
        raise ValueError(f"Job {job_id!r} not found")

    archive_path = row["dest_path"]
    if not os.path.exists(archive_path):
        raise FileNotFoundError(f"Archive not found: {archive_path}")

    dest_path = Path(dest)
    dest_path.mkdir(parents=True, exist_ok=True)

    files_written = 0
    try:
        with tarfile.open(archive_path, "r:*") as tar:
            members = tar.getmembers()
            for member in members:
                tar.extract(member, path=str(dest_path), set_attrs=False, filter="data")
                files_written += 1

        logger.info("Restore of job %s succeeded: %d files written to %s", job_id, files_written, dest_path)
        conn.execute("""
            INSERT INTO restore_events (job_id, dest_path, status, files_written, restored_at)
            VALUES (?, ?, 'success', ?, ?)
        """, (job_id, str(dest_path), files_written, _now()))
        conn.commit()

        return {
            "job_id": job_id,
            "dest": str(dest_path),
            "files_written": files_written,
            "status": "success",
        }

    except Exception as exc:
        logger.error("Restore of job %s failed: %s", job_id, exc)
        conn.execute("""
            INSERT INTO restore_events (job_id, dest_path, status, files_written, restored_at, error)
            VALUES (?, ?, 'failed', ?, ?, ?)
        """, (job_id, str(dest_path), files_written, _now(), str(exc)))
        conn.commit()
        raise


def verify_integrity(job_id: str, db_path: str = DB_PATH) -> Dict[str, Any]:
    """Verify a backup archive by checksum and member listing."""
    conn = get_db(db_path)
    row = conn.execute("SELECT * FROM backup_jobs WHERE id = ?", (job_id,)).fetchone()
    if not row:
        raise ValueError(f"Job {job_id!r} not found")

    archive_path = row["dest_path"]
    stored_checksum = row["checksum"]

    if not os.path.exists(archive_path):
        return {"job_id": job_id, "valid": False, "reason": "archive file missing"}

    # Recompute checksum
    actual_checksum = _sha256_file(archive_path)
    checksum_ok = actual_checksum == stored_checksum

    # Verify tar integrity
    tar_ok = False
    member_count = 0
    try:
        with tarfile.open(archive_path, "r:*") as tar:
            members = tar.getmembers()
            member_count = len(members)
            tar_ok = True
    except Exception as exc:
        tar_ok = False

    valid = checksum_ok and tar_ok
    if valid:
        conn.execute("UPDATE backup_jobs SET status = 'verified' WHERE id = ?", (job_id,))
        conn.commit()
    logger.info("Verify job %s: valid=%s checksum_ok=%s tar_readable=%s", job_id, valid, checksum_ok, tar_ok)

    return {
        "job_id": job_id,
        "valid": valid,
        "checksum_ok": checksum_ok,
        "tar_readable": tar_ok,
        "member_count": member_count,
        "stored_checksum": stored_checksum,
        "actual_checksum": actual_checksum,
        "archive_path": archive_path,
    }


def list_jobs(
    source: Optional[str] = None,
    backup_type: Optional[str] = None,
    limit: int = 50,
    db_path: str = DB_PATH,
) -> List[BackupJob]:
    conn = get_db(db_path)
    query = "SELECT * FROM backup_jobs WHERE 1=1"
    params: List[Any] = []
    if source:
        query += " AND source_path = ?"
        params.append(source)
    if backup_type:
        query += " AND backup_type = ?"
        params.append(backup_type)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    return [BackupJob.from_row(r) for r in conn.execute(query, params).fetchall()]


def get_job(job_id: str, db_path: str = DB_PATH) -> Optional[BackupJob]:
    conn = get_db(db_path)
    row = conn.execute("SELECT * FROM backup_jobs WHERE id = ?", (job_id,)).fetchone()
    return BackupJob.from_row(row) if row else None


def prune_old(
    source: str,
    keep_last: int = DEFAULT_KEEP,
    dry_run: bool = False,
    db_path: str = DB_PATH,
) -> Dict[str, Any]:
    """Delete oldest backup jobs beyond keep_last, per backup type."""
    conn = get_db(db_path)
    deleted_jobs: List[str] = []
    freed_bytes = 0

    for btype in ("full", "incremental", "differential"):
        rows = conn.execute("""
            SELECT id, dest_path, size_bytes FROM backup_jobs
            WHERE source_path = ? AND backup_type = ? AND status IN ('success', 'verified')
            ORDER BY created_at DESC
        """, (source, btype)).fetchall()

        to_delete = rows[keep_last:]
        for row in to_delete:
            if not dry_run:
                if os.path.exists(row["dest_path"]):
                    os.unlink(row["dest_path"])
                    freed_bytes += row["size_bytes"]
                conn.execute("DELETE FROM backup_jobs WHERE id = ?", (row["id"],))
                conn.execute("DELETE FROM file_manifests WHERE job_id = ?", (row["id"],))
            deleted_jobs.append(row["id"])

    if not dry_run:
        conn.commit()
    logger.info("Prune for %s: deleted=%d freed=%d bytes dry_run=%s",
                source, len(deleted_jobs), freed_bytes, dry_run)
    return {
        "dry_run": dry_run,
        "deleted": deleted_jobs,
        "freed_bytes": freed_bytes,
        "kept_per_type": keep_last,
    }


def schedule_info(source: str, db_path: str = DB_PATH) -> Dict[str, Any]:
    """Show schedule recommendation based on existing jobs."""
    conn = get_db(db_path)
    jobs = conn.execute("""
        SELECT backup_type, created_at, size_bytes FROM backup_jobs
        WHERE source_path = ? AND status IN ('success', 'verified')
        ORDER BY created_at DESC LIMIT 30
    """, (source,)).fetchall()

    by_type: Dict[str, List[Any]] = {"full": [], "incremental": [], "differential": []}
    for j in jobs:
        by_type[j["backup_type"]].append(j)

    def _last(rows: List[Any]) -> Optional[str]:
        return rows[0]["created_at"] if rows else None

    return {
        "source": source,
        "last_full": _last(by_type["full"]),
        "last_incremental": _last(by_type["incremental"]),
        "last_differential": _last(by_type["differential"]),
        "total_full": len(by_type["full"]),
        "total_incremental": len(by_type["incremental"]),
        "total_differential": len(by_type["differential"]),
        "recommendation": (
            "Run a full backup" if not by_type["full"]
            else "Run an incremental backup" if len(by_type["incremental"]) < 6
            else "Consider pruning old backups"
        ),
    }


def stats(db_path: str = DB_PATH) -> Dict[str, Any]:
    conn = get_db(db_path)
    total = conn.execute("SELECT COUNT(*) FROM backup_jobs").fetchone()[0]
    by_type = conn.execute("""
        SELECT backup_type, COUNT(*) as cnt, COALESCE(SUM(size_bytes),0) as sz
        FROM backup_jobs GROUP BY backup_type
    """).fetchall()
    total_size = conn.execute("SELECT COALESCE(SUM(size_bytes),0) FROM backup_jobs").fetchone()[0]
    return {
        "total_jobs": total,
        "total_size_bytes": total_size,
        "by_type": [{"type": r[0], "count": r[1], "size_bytes": r[2]} for r in by_type],
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _fmt_size(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} PB"


def cli_main(argv: List[str] = None) -> int:
    parser = argparse.ArgumentParser(prog="backup-manager", description="BlackRoad Backup Manager")
    sub = parser.add_subparsers(dest="cmd")

    p_create = sub.add_parser("backup", help="Create a backup")
    p_create.add_argument("source")
    p_create.add_argument("dest")
    p_create.add_argument("--type", dest="backup_type", choices=["full", "incremental", "differential"],
                          default="full")
    p_create.add_argument("--compression", choices=["gz", "bz2", "xz", "none"], default="gz")
    p_create.add_argument("--tags", default="")
    p_create.add_argument("--exclude", nargs="*", default=[])
    p_create.add_argument("--db", default=DB_PATH)

    p_restore = sub.add_parser("restore", help="Restore from a backup")
    p_restore.add_argument("job_id")
    p_restore.add_argument("dest")
    p_restore.add_argument("--db", default=DB_PATH)

    p_verify = sub.add_parser("verify", help="Verify backup integrity")
    p_verify.add_argument("job_id")
    p_verify.add_argument("--db", default=DB_PATH)

    p_list = sub.add_parser("list", help="List backup jobs")
    p_list.add_argument("--source", default=None)
    p_list.add_argument("--type", dest="backup_type", default=None)
    p_list.add_argument("--limit", type=int, default=20)
    p_list.add_argument("--db", default=DB_PATH)

    p_prune = sub.add_parser("prune", help="Prune old backups")
    p_prune.add_argument("source")
    p_prune.add_argument("--keep", type=int, default=DEFAULT_KEEP)
    p_prune.add_argument("--dry-run", action="store_true")
    p_prune.add_argument("--db", default=DB_PATH)

    p_sched = sub.add_parser("schedule", help="Show schedule info")
    p_sched.add_argument("source")
    p_sched.add_argument("--db", default=DB_PATH)

    p_stats = sub.add_parser("stats", help="Show statistics")
    p_stats.add_argument("--db", default=DB_PATH)

    args = parser.parse_args(argv)

    if args.cmd == "backup":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        print(f"Creating {args.backup_type} backup: {args.source} → {args.dest}")
        job = create_backup(args.source, args.dest, backup_type=args.backup_type,
                            compression=args.compression, tags=tags,
                            exclude_patterns=args.exclude, db_path=args.db)
        print(f"✓ Backup created: {job.id}")
        print(f"  Type:     {job.backup_type}")
        print(f"  Files:    {job.file_count}")
        print(f"  Size:     {_fmt_size(job.size_bytes)}")
        print(f"  Checksum: {job.checksum}")
        print(f"  Archive:  {job.dest_path}")

    elif args.cmd == "restore":
        print(f"Restoring {args.job_id} → {args.dest}")
        result = restore(args.job_id, args.dest, db_path=args.db)
        print(f"✓ Restored {result['files_written']} files to {result['dest']}")

    elif args.cmd == "verify":
        result = verify_integrity(args.job_id, db_path=args.db)
        icon = "✓" if result["valid"] else "✗"
        print(f"{icon} Integrity {'OK' if result['valid'] else 'FAILED'}")
        print(f"  Checksum match: {result['checksum_ok']}")
        print(f"  Tar readable:   {result['tar_readable']}")
        print(f"  Members:        {result['member_count']}")
        return 0 if result["valid"] else 1

    elif args.cmd == "list":
        jobs = list_jobs(source=args.source, backup_type=args.backup_type,
                         limit=args.limit, db_path=args.db)
        if not jobs:
            print("(no backups found)")
        for j in jobs:
            icon = "✓" if j.status in ("success", "verified") else "✗"
            print(f"  {icon} {j.id}  [{j.backup_type:13}]  {_fmt_size(j.size_bytes):>10}  {j.created_at[:19]}")

    elif args.cmd == "prune":
        result = prune_old(args.source, keep_last=args.keep, dry_run=args.dry_run, db_path=args.db)
        action = "Would delete" if result["dry_run"] else "Deleted"
        print(f"{action} {len(result['deleted'])} old backup(s), freed {_fmt_size(result['freed_bytes'])}")
        for jid in result["deleted"]:
            print(f"  - {jid}")

    elif args.cmd == "schedule":
        info = schedule_info(args.source, db_path=args.db)
        for k, v in info.items():
            print(f"  {k}: {v}")

    elif args.cmd == "stats":
        s = stats(db_path=args.db)
        print(f"  Total jobs:  {s['total_jobs']}")
        print(f"  Total size:  {_fmt_size(s['total_size_bytes'])}")
        for t in s["by_type"]:
            print(f"    {t['type']:13}: {t['count']} jobs, {_fmt_size(t['size_bytes'])}")
    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    sys.exit(cli_main())
