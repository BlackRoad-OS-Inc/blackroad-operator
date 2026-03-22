#!/usr/bin/env python3
"""
BlackRoad Web Archiver — Web page archiving and snapshot comparison.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
import re
import sqlite3
import sys
import urllib.error
import urllib.request
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse


DB_PATH = Path(os.environ.get("ARCHIVER_DB", "~/.blackroad/web_archiver.db")).expanduser()
ARCHIVE_DIR = Path(os.environ.get("ARCHIVE_DIR", "~/.blackroad/web_archive")).expanduser()


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS sites (
                id          TEXT PRIMARY KEY,
                url         TEXT NOT NULL UNIQUE,
                name        TEXT NOT NULL,
                category    TEXT NOT NULL DEFAULT 'general',
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL,
                snapshot_count INTEGER NOT NULL DEFAULT 0
            );
            CREATE TABLE IF NOT EXISTS snapshots (
                id          TEXT PRIMARY KEY,
                site_id     TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                url         TEXT NOT NULL,
                title       TEXT,
                content_hash TEXT NOT NULL,
                content_size INTEGER NOT NULL,
                status_code  INTEGER,
                file_path   TEXT NOT NULL,
                captured_at TEXT NOT NULL,
                headers     TEXT NOT NULL DEFAULT '{}'
            );
            CREATE TABLE IF NOT EXISTS diff_reports (
                id          TEXT PRIMARY KEY,
                site_id     TEXT NOT NULL,
                snap_a_id   TEXT NOT NULL REFERENCES snapshots(id),
                snap_b_id   TEXT NOT NULL REFERENCES snapshots(id),
                diff_type   TEXT NOT NULL,
                changes     TEXT NOT NULL DEFAULT '[]',
                created_at  TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS crawl_jobs (
                id          TEXT PRIMARY KEY,
                site_id     TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
                status      TEXT NOT NULL DEFAULT 'pending',
                pages_found INTEGER NOT NULL DEFAULT 0,
                pages_archived INTEGER NOT NULL DEFAULT 0,
                started_at  TEXT,
                finished_at TEXT,
                error       TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_snap_site ON snapshots(site_id);
            CREATE INDEX IF NOT EXISTS idx_snap_hash ON snapshots(content_hash);
        """)


@dataclass
class Snapshot:
    id: str
    site_id: str
    url: str
    title: Optional[str]
    content_hash: str
    content_size: int
    status_code: Optional[int]
    file_path: str
    captured_at: str
    headers: dict

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Snapshot":
        return cls(
            id=row["id"], site_id=row["site_id"], url=row["url"],
            title=row["title"], content_hash=row["content_hash"],
            content_size=row["content_size"], status_code=row["status_code"],
            file_path=row["file_path"], captured_at=row["captured_at"],
            headers=json.loads(row["headers"]),
        )

    def read_content(self) -> Optional[str]:
        p = Path(self.file_path)
        if p.exists():
            return p.read_text(encoding="utf-8", errors="replace")
        return None


@dataclass
class Site:
    id: str
    url: str
    name: str
    category: str
    created_at: str
    updated_at: str
    snapshot_count: int

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Site":
        return cls(
            id=row["id"], url=row["url"], name=row["name"],
            category=row["category"], created_at=row["created_at"],
            updated_at=row["updated_at"], snapshot_count=row["snapshot_count"],
        )


class WebArchiver:

    def register_site(self, url: str, name: str, category: str = "general") -> Site:
        sid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        # Normalize URL
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        with get_conn() as conn:
            try:
                conn.execute(
                    "INSERT INTO sites(id, url, name, category, created_at, updated_at) VALUES (?,?,?,?,?,?)",
                    (sid, url, name, category, now, now),
                )
            except sqlite3.IntegrityError:
                row = conn.execute("SELECT * FROM sites WHERE url=?", (url,)).fetchone()
                return Site.from_row(row)
        return Site(id=sid, url=url, name=name, category=category,
                    created_at=now, updated_at=now, snapshot_count=0)

    def capture(self, url: str, site_id: str | None = None, timeout: int = 30) -> Snapshot:
        """Fetch and archive a web page."""
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        snap_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        # Fetch page
        status_code = 0
        headers: dict = {}
        content = ""
        title = None
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "BlackRoad-Archiver/1.0"})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                status_code = resp.status
                headers = dict(resp.headers)
                raw = resp.read()
                content = raw.decode("utf-8", errors="replace")
                title = self._extract_title(content)
        except urllib.error.HTTPError as e:
            status_code = e.code
            content = f"HTTP Error {e.code}: {e.reason}"
        except Exception as exc:
            content = f"Error: {exc}"

        # Save to disk
        ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
        safe_name = re.sub(r"[^a-zA-Z0-9_-]", "_", urlparse(url).netloc)
        file_path = ARCHIVE_DIR / f"{safe_name}_{snap_id[:8]}.html"
        file_path.write_text(content, encoding="utf-8")

        content_hash = hashlib.sha256(content.encode()).hexdigest()
        content_size = len(content.encode("utf-8"))

        # Auto-register site if needed
        if site_id is None:
            parsed = urlparse(url)
            site = self.register_site(f"{parsed.scheme}://{parsed.netloc}", parsed.netloc)
            site_id = site.id

        with get_conn() as conn:
            conn.execute(
                "INSERT INTO snapshots(id, site_id, url, title, content_hash, content_size, "
                "status_code, file_path, captured_at, headers) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (snap_id, site_id, url, title, content_hash, content_size,
                 status_code, str(file_path), now, json.dumps(headers)),
            )
            conn.execute(
                "UPDATE sites SET snapshot_count=snapshot_count+1, updated_at=? WHERE id=?",
                (now, site_id),
            )

        return Snapshot(
            id=snap_id, site_id=site_id, url=url, title=title,
            content_hash=content_hash, content_size=content_size,
            status_code=status_code, file_path=str(file_path),
            captured_at=now, headers=headers,
        )

    def compare_snapshots(self, snap_a_id: str, snap_b_id: str) -> dict:
        """Compare two snapshots for changes."""
        with get_conn() as conn:
            row_a = conn.execute("SELECT * FROM snapshots WHERE id=?", (snap_a_id,)).fetchone()
            row_b = conn.execute("SELECT * FROM snapshots WHERE id=?", (snap_b_id,)).fetchone()
        if not row_a or not row_b:
            raise ValueError("One or both snapshots not found")

        snap_a = Snapshot.from_row(row_a)
        snap_b = Snapshot.from_row(row_b)

        if snap_a.content_hash == snap_b.content_hash:
            return {
                "snap_a": snap_a_id,
                "snap_b": snap_b_id,
                "changed": False,
                "diff_type": "identical",
                "changes": [],
            }

        content_a = snap_a.read_content() or ""
        content_b = snap_b.read_content() or ""
        changes = self._diff_text(content_a, content_b)

        diff_type = "content_changed"
        if snap_a.title != snap_b.title:
            diff_type = "title_and_content_changed"

        # Persist diff report
        did = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        with get_conn() as conn:
            conn.execute(
                "INSERT INTO diff_reports(id, site_id, snap_a_id, snap_b_id, diff_type, changes, created_at) "
                "VALUES (?,?,?,?,?,?,?)",
                (did, snap_a.site_id, snap_a_id, snap_b_id, diff_type, json.dumps(changes), now),
            )

        return {
            "report_id": did,
            "snap_a": snap_a_id,
            "snap_b": snap_b_id,
            "changed": True,
            "diff_type": diff_type,
            "size_change": snap_b.content_size - snap_a.content_size,
            "title_a": snap_a.title,
            "title_b": snap_b.title,
            "changes": changes[:20],  # limit output
            "total_changes": len(changes),
        }

    def site_history(self, site_id: str, limit: int = 20) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM snapshots WHERE site_id=? ORDER BY captured_at DESC LIMIT ?",
                (site_id, limit),
            ).fetchall()
        return [dict(r) for r in rows]

    def search(self, query: str) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM snapshots WHERE title LIKE ? OR url LIKE ? ORDER BY captured_at DESC LIMIT 50",
                (f"%{query}%", f"%{query}%"),
            ).fetchall()
        return [dict(r) for r in rows]

    def list_sites(self) -> list[dict]:
        with get_conn() as conn:
            rows = conn.execute("SELECT * FROM sites ORDER BY updated_at DESC").fetchall()
        return [dict(r) for r in rows]

    def stats(self) -> dict:
        with get_conn() as conn:
            sites = conn.execute("SELECT COUNT(*) as c FROM sites").fetchone()["c"]
            snaps = conn.execute("SELECT COUNT(*) as c FROM snapshots").fetchone()["c"]
            size = conn.execute("SELECT SUM(content_size) as s FROM snapshots").fetchone()["s"] or 0
            changed = conn.execute("SELECT COUNT(*) as c FROM diff_reports WHERE diff_type != 'identical'").fetchone()["c"]
        return {
            "sites": sites,
            "snapshots": snaps,
            "total_size_bytes": size,
            "total_size_mb": round(size / 1_048_576, 2),
            "changed_snapshots": changed,
        }

    @staticmethod
    def _extract_title(html_content: str) -> Optional[str]:
        m = re.search(r"<title[^>]*>(.*?)</title>", html_content, re.IGNORECASE | re.DOTALL)
        if m:
            return html.unescape(m.group(1).strip())[:256]
        return None

    @staticmethod
    def _diff_text(text_a: str, text_b: str) -> list[dict]:
        lines_a = set(text_a.splitlines())
        lines_b = set(text_b.splitlines())
        added = lines_b - lines_a
        removed = lines_a - lines_b
        changes = []
        for line in list(removed)[:50]:
            if line.strip():
                changes.append({"type": "removed", "content": line[:200]})
        for line in list(added)[:50]:
            if line.strip():
                changes.append({"type": "added", "content": line[:200]})
        return changes


def main() -> None:
    init_db()
    parser = argparse.ArgumentParser(prog="web-archiver", description="BlackRoad Web Archiver")
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")

    p = sub.add_parser("capture", help="Capture a web page")
    p.add_argument("url")
    p.add_argument("--timeout", type=int, default=30)

    p = sub.add_parser("register", help="Register a site")
    p.add_argument("url"); p.add_argument("name")
    p.add_argument("--category", default="general")

    p = sub.add_parser("compare", help="Compare two snapshots")
    p.add_argument("snap_a"); p.add_argument("snap_b")

    p = sub.add_parser("history", help="Show snapshot history for a site")
    p.add_argument("site_id"); p.add_argument("--limit", type=int, default=20)

    p = sub.add_parser("search", help="Search snapshots")
    p.add_argument("query")

    p = sub.add_parser("list", help="List registered sites")

    p = sub.add_parser("stats", help="Show archive statistics")

    args = parser.parse_args()
    archiver = WebArchiver()

    if args.command == "capture":
        snap = archiver.capture(args.url, timeout=args.timeout)
        print(json.dumps({
            "id": snap.id, "url": snap.url, "title": snap.title,
            "status_code": snap.status_code, "size": snap.content_size,
            "hash": snap.content_hash[:16] + "...",
        }, indent=2))
    elif args.command == "register":
        site = archiver.register_site(args.url, args.name, category=args.category)
        print(json.dumps({"id": site.id, "url": site.url, "name": site.name}, indent=2))
    elif args.command == "compare":
        result = archiver.compare_snapshots(args.snap_a, args.snap_b)
        print(json.dumps(result, indent=2))
    elif args.command == "history":
        print(json.dumps(archiver.site_history(args.site_id, limit=args.limit), indent=2))
    elif args.command == "search":
        print(json.dumps(archiver.search(args.query), indent=2))
    elif args.command == "list":
        print(json.dumps(archiver.list_sites(), indent=2))
    elif args.command == "stats":
        print(json.dumps(archiver.stats(), indent=2))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
