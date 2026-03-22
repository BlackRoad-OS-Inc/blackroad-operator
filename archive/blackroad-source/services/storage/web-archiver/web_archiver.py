#!/usr/bin/env python3
"""
BlackRoad Web Archiver
Production-grade web snapshot tool using stdlib only.
"""

import sqlite3
import hashlib
import os
import sys
import json
import zipfile
import difflib
import argparse
import datetime
import urllib.request
import urllib.error
import urllib.parse
import re
import html
import html.parser
from dataclasses import dataclass, asdict
from typing import Optional, List, Dict, Tuple, Any, Set
from pathlib import Path


DB_PATH = os.environ.get("WEB_ARCHIVER_DB", os.path.expanduser("~/.blackroad/web_archiver.db"))
SNAPSHOT_DIR = os.environ.get("WEB_ARCHIVER_SNAPSHOTS", os.path.expanduser("~/.blackroad/snapshots"))
MAX_CRAWL_DEPTH = 3
DEFAULT_TIMEOUT = 15
USER_AGENT = "BlackRoad-WebArchiver/1.0 (+https://blackroad.io)"


@dataclass
class ArchiveJob:
    id: str
    url: str
    title: str
    snapshot_html: str       # path to stored HTML file
    screenshot_path: str     # path (empty if not captured)
    crawl_depth: int
    created_at: str
    checksum: str            # SHA-256 of HTML content
    status: str              # 'pending'|'success'|'failed'
    content_length: int
    links_found: int
    error_message: str

    @classmethod
    def from_row(cls, row) -> "ArchiveJob":
        return cls(*tuple(row))

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f") + "Z"


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _job_id(url: str) -> str:
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d%H%M%S")
    short = hashlib.sha256(url.encode()).hexdigest()[:8]
    return f"{ts}_{short}"


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def get_db(path: str = DB_PATH) -> sqlite3.Connection:
    parent = os.path.dirname(os.path.abspath(path))
    os.makedirs(parent, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    _init_db(conn)
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS archive_jobs (
            id              TEXT PRIMARY KEY,
            url             TEXT NOT NULL,
            title           TEXT DEFAULT '',
            snapshot_html   TEXT DEFAULT '',
            screenshot_path TEXT DEFAULT '',
            crawl_depth     INTEGER DEFAULT 0,
            created_at      TEXT NOT NULL,
            checksum        TEXT DEFAULT '',
            status          TEXT DEFAULT 'pending',
            content_length  INTEGER DEFAULT 0,
            links_found     INTEGER DEFAULT 0,
            error_message   TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS crawled_pages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id      TEXT NOT NULL,
            url         TEXT NOT NULL,
            depth       INTEGER NOT NULL,
            checksum    TEXT DEFAULT '',
            status_code INTEGER DEFAULT 0,
            crawled_at  TEXT NOT NULL,
            UNIQUE(job_id, url)
        );

        CREATE TABLE IF NOT EXISTS extracted_links (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id   TEXT NOT NULL,
            page_url TEXT NOT NULL,
            link_url TEXT NOT NULL,
            link_text TEXT DEFAULT '',
            depth    INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_jobs_url ON archive_jobs(url);
        CREATE INDEX IF NOT EXISTS idx_jobs_status ON archive_jobs(status);
        CREATE INDEX IF NOT EXISTS idx_crawled_job ON crawled_pages(job_id);
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------

class _LinkExtractor(html.parser.HTMLParser):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url
        self.links: List[Tuple[str, str]] = []  # (url, text)
        self._current_text: List[str] = []
        self._in_anchor = False
        self._current_href = ""

    def handle_starttag(self, tag: str, attrs):
        attr_dict = dict(attrs)
        if tag == "a" and attr_dict.get("href"):
            href = attr_dict["href"].strip()
            if href and not href.startswith(("#", "javascript:", "mailto:", "tel:")):
                try:
                    full = urllib.parse.urljoin(self.base_url, href)
                    self._current_href = full
                    self._in_anchor = True
                    self._current_text = []
                except Exception:
                    pass

    def handle_endtag(self, tag: str):
        if tag == "a" and self._in_anchor:
            text = " ".join(self._current_text).strip()
            self.links.append((self._current_href, text))
            self._in_anchor = False
            self._current_href = ""
            self._current_text = []

    def handle_data(self, data: str):
        if self._in_anchor:
            self._current_text.append(data.strip())


class _TitleExtractor(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self._in_title = False
        self._buf: List[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag == "title":
            self._in_title = True

    def handle_endtag(self, tag: str):
        if tag == "title":
            self.title = "".join(self._buf).strip()
            self._in_title = False

    def handle_data(self, data: str):
        if self._in_title:
            self._buf.append(data)


def extract_title(html_content: str) -> str:
    p = _TitleExtractor()
    try:
        p.feed(html_content)
    except Exception:
        pass
    return p.title or "(untitled)"


def extract_links(html_content: str, base_url: str) -> List[Tuple[str, str]]:
    """Extract (url, text) pairs from HTML."""
    p = _LinkExtractor(base_url)
    try:
        p.feed(html_content)
    except Exception:
        pass
    # Deduplicate while preserving order
    seen: Set[str] = set()
    unique: List[Tuple[str, str]] = []
    for url, text in p.links:
        if url not in seen:
            seen.add(url)
            unique.append((url, text))
    return unique


def _same_origin(url1: str, url2: str) -> bool:
    try:
        p1 = urllib.parse.urlparse(url1)
        p2 = urllib.parse.urlparse(url2)
        return p1.netloc == p2.netloc
    except Exception:
        return False


# ---------------------------------------------------------------------------
# HTTP fetch
# ---------------------------------------------------------------------------

def _fetch_url(url: str, timeout: int = DEFAULT_TIMEOUT) -> Tuple[bytes, int, Dict[str, str]]:
    """Fetch URL, return (body_bytes, status_code, headers)."""
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Only http and https URLs are supported, got: {parsed.scheme!r}")
    req = urllib.request.Request(url)
    req.add_header("User-Agent", USER_AGENT)
    req.add_header("Accept", "text/html,application/xhtml+xml,*/*;q=0.8")
    req.add_header("Accept-Language", "en-US,en;q=0.9")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read(), resp.status, dict(resp.headers)
    except urllib.error.HTTPError as exc:
        return b"", exc.code, {}
    except Exception as exc:
        raise RuntimeError(f"Fetch failed: {exc}") from exc


def store_snapshot(job_id: str, url: str, content: bytes) -> str:
    """Write HTML snapshot to disk, return file path."""
    snap_dir = Path(SNAPSHOT_DIR) / job_id
    snap_dir.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r"[^\w\-.]", "_", url)[:80]
    path = snap_dir / f"{safe_name}.html"
    path.write_bytes(content)
    return str(path)


def retrieve(job_id: str, db_path: str = DB_PATH) -> Optional[ArchiveJob]:
    """Retrieve an archive job by ID."""
    conn = get_db(db_path)
    try:
        row = conn.execute("SELECT * FROM archive_jobs WHERE id = ?", (job_id,)).fetchone()
        return ArchiveJob.from_row(row) if row else None
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Core archival logic
# ---------------------------------------------------------------------------

def archive(
    url: str,
    depth: int = 1,
    same_origin_only: bool = True,
    db_path: str = DB_PATH,
) -> ArchiveJob:
    """Archive a URL (and optionally its linked pages up to depth)."""
    if depth > MAX_CRAWL_DEPTH:
        depth = MAX_CRAWL_DEPTH

    conn = get_db(db_path)
    job_id = _job_id(url)
    now = _now()

    try:
        # Insert pending job
        conn.execute("""
            INSERT INTO archive_jobs (id, url, created_at, status, crawl_depth)
            VALUES (?, ?, ?, 'pending', ?)
        """, (job_id, url, now, depth))
        conn.commit()

        try:
            body, status_code, headers = _fetch_url(url)
            if status_code >= 400:
                raise RuntimeError(f"HTTP {status_code} for {url}")

            html_text = body.decode("utf-8", errors="replace")
            title = extract_title(html_text)
            checksum = _sha256(body)
            snap_path = store_snapshot(job_id, url, body)
            all_links = extract_links(html_text, url)

            # Store root crawl
            conn.execute("""
                INSERT OR IGNORE INTO crawled_pages (job_id, url, depth, checksum, status_code, crawled_at)
                VALUES (?, ?, 0, ?, ?, ?)
            """, (job_id, url, checksum, status_code, now))

            # Store links
            for link_url, link_text in all_links:
                conn.execute("""
                    INSERT INTO extracted_links (job_id, page_url, link_url, link_text, depth)
                    VALUES (?, ?, ?, ?, 0)
                """, (job_id, url, link_url, link_text[:200]))

            # Crawl deeper if requested
            crawl_queue: List[Tuple[str, int]] = [(link_url, 1) for link_url, _ in all_links
                                                   if (not same_origin_only or _same_origin(url, link_url))]
            visited: Set[str] = {url}

            for _ in range(depth - 1):
                next_queue: List[Tuple[str, int]] = []
                for link_url, current_depth in crawl_queue:
                    if link_url in visited or current_depth >= depth:
                        continue
                    visited.add(link_url)
                    try:
                        sub_body, sub_status, _ = _fetch_url(link_url, timeout=10)
                        sub_html = sub_body.decode("utf-8", errors="replace")
                        sub_checksum = _sha256(sub_body)
                        store_snapshot(job_id, link_url, sub_body)
                        sub_links = extract_links(sub_html, link_url)
                        conn.execute("""
                            INSERT OR IGNORE INTO crawled_pages
                                (job_id, url, depth, checksum, status_code, crawled_at)
                            VALUES (?, ?, ?, ?, ?, ?)
                        """, (job_id, link_url, current_depth, sub_checksum, sub_status, _now()))
                        for sl_url, sl_text in sub_links:
                            conn.execute("""
                                INSERT INTO extracted_links (job_id, page_url, link_url, link_text, depth)
                                VALUES (?, ?, ?, ?, ?)
                            """, (job_id, link_url, sl_url, sl_text[:200], current_depth))
                            if not same_origin_only or _same_origin(url, sl_url):
                                next_queue.append((sl_url, current_depth + 1))
                    except Exception:
                        pass
                crawl_queue = next_queue

            total_links = conn.execute(
                "SELECT COUNT(*) FROM extracted_links WHERE job_id = ?", (job_id,)
            ).fetchone()[0]

            conn.execute("""
                UPDATE archive_jobs SET
                    title = ?, snapshot_html = ?, checksum = ?,
                    status = 'success', content_length = ?, links_found = ?
                WHERE id = ?
            """, (title, snap_path, checksum, len(body), total_links, job_id))
            conn.commit()

            return ArchiveJob(
                id=job_id, url=url, title=title, snapshot_html=snap_path,
                screenshot_path="", crawl_depth=depth, created_at=now,
                checksum=checksum, status="success",
                content_length=len(body), links_found=total_links, error_message=""
            )

        except Exception as exc:
            msg = str(exc)
            conn.execute("""
                UPDATE archive_jobs SET status = 'failed', error_message = ? WHERE id = ?
            """, (msg, job_id))
            conn.commit()
            return ArchiveJob(
                id=job_id, url=url, title="", snapshot_html="",
                screenshot_path="", crawl_depth=depth, created_at=now,
                checksum="", status="failed",
                content_length=0, links_found=0, error_message=msg
            )
    finally:
        conn.close()


def export_bundle(job_id: str, output_path: Optional[str] = None, db_path: str = DB_PATH) -> str:
    """Bundle all snapshots for a job into a ZIP archive."""
    job = retrieve(job_id, db_path=db_path)
    if not job:
        raise ValueError(f"Job {job_id!r} not found")

    output_path = output_path or f"archive_{job_id}.zip"
    snap_dir = Path(SNAPSHOT_DIR) / job_id

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Write manifest
        conn = get_db(db_path)
        try:
            pages = conn.execute(
                "SELECT url, depth, checksum, status_code FROM crawled_pages WHERE job_id = ?",
                (job_id,)
            ).fetchall()
        finally:
            conn.close()
        manifest = {
            "job": job.to_dict(),
            "pages": [dict(p) for p in pages],
            "exported_at": _now(),
        }
        zf.writestr("manifest.json", json.dumps(manifest, indent=2))

        # Add all HTML snapshots
        if snap_dir.exists():
            for html_file in snap_dir.rglob("*.html"):
                zf.write(html_file, arcname=str(html_file.relative_to(snap_dir)))

    return output_path


def compare_snapshots(id1: str, id2: str, db_path: str = DB_PATH) -> Dict[str, Any]:
    """Compare two archive job snapshots, return unified diff and stats."""
    job1 = retrieve(id1, db_path=db_path)
    job2 = retrieve(id2, db_path=db_path)
    if not job1 or not job2:
        raise ValueError("One or both job IDs not found")

    def _read_snap(path: str) -> List[str]:
        try:
            return Path(path).read_text(errors="replace").splitlines(keepends=True)
        except Exception:
            return []

    lines1 = _read_snap(job1.snapshot_html)
    lines2 = _read_snap(job2.snapshot_html)
    diff = list(difflib.unified_diff(lines1, lines2, fromfile=id1, tofile=id2, n=3))

    added = sum(1 for l in diff if l.startswith("+") and not l.startswith("+++"))
    removed = sum(1 for l in diff if l.startswith("-") and not l.startswith("---"))
    same_checksum = job1.checksum == job2.checksum

    return {
        "id1": id1,
        "id2": id2,
        "url1": job1.url,
        "url2": job2.url,
        "same_checksum": same_checksum,
        "lines_added": added,
        "lines_removed": removed,
        "diff_lines": len(diff),
        "diff": "".join(diff[:200]),  # Limit to first 200 diff lines in output
    }


def list_jobs(
    status: Optional[str] = None,
    limit: int = 50,
    db_path: str = DB_PATH,
) -> List[ArchiveJob]:
    conn = get_db(db_path)
    try:
        query = "SELECT * FROM archive_jobs"
        params: List[Any] = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        return [ArchiveJob.from_row(r) for r in conn.execute(query, params).fetchall()]
    finally:
        conn.close()


def get_job_links(job_id: str, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    conn = get_db(db_path)
    try:
        rows = conn.execute("""
            SELECT link_url, link_text, depth FROM extracted_links
            WHERE job_id = ? ORDER BY depth, link_url
        """, (job_id,)).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def stats(db_path: str = DB_PATH) -> Dict[str, Any]:
    conn = get_db(db_path)
    try:
        total = conn.execute("SELECT COUNT(*) FROM archive_jobs").fetchone()[0]
        success = conn.execute("SELECT COUNT(*) FROM archive_jobs WHERE status='success'").fetchone()[0]
        failed = conn.execute("SELECT COUNT(*) FROM archive_jobs WHERE status='failed'").fetchone()[0]
        total_size = conn.execute(
            "SELECT COALESCE(SUM(content_length), 0) FROM archive_jobs"
        ).fetchone()[0]
        total_links = conn.execute("SELECT COUNT(*) FROM extracted_links").fetchone()[0]
        pages_crawled = conn.execute("SELECT COUNT(*) FROM crawled_pages").fetchone()[0]
        return {
            "total_jobs": total,
            "successful": success,
            "failed": failed,
            "total_content_bytes": total_size,
            "total_links_extracted": total_links,
            "total_pages_crawled": pages_crawled,
        }
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cli_main(argv: List[str] = None) -> int:
    parser = argparse.ArgumentParser(prog="web-archiver", description="BlackRoad Web Archiver")
    sub = parser.add_subparsers(dest="cmd")

    p_arch = sub.add_parser("archive", help="Archive a URL")
    p_arch.add_argument("url")
    p_arch.add_argument("--depth", type=int, default=1)
    p_arch.add_argument("--allow-external", action="store_true")
    p_arch.add_argument("--db", default=DB_PATH)

    p_get = sub.add_parser("get", help="Retrieve archive job info")
    p_get.add_argument("job_id")
    p_get.add_argument("--db", default=DB_PATH)

    p_list = sub.add_parser("list", help="List archive jobs")
    p_list.add_argument("--status", choices=["pending", "success", "failed"], default=None)
    p_list.add_argument("--limit", type=int, default=20)
    p_list.add_argument("--db", default=DB_PATH)

    p_export = sub.add_parser("export", help="Export job as ZIP bundle")
    p_export.add_argument("job_id")
    p_export.add_argument("--output", default=None)
    p_export.add_argument("--db", default=DB_PATH)

    p_compare = sub.add_parser("compare", help="Compare two snapshots")
    p_compare.add_argument("id1")
    p_compare.add_argument("id2")
    p_compare.add_argument("--db", default=DB_PATH)

    p_links = sub.add_parser("links", help="List links found in a job")
    p_links.add_argument("job_id")
    p_links.add_argument("--db", default=DB_PATH)

    p_stats = sub.add_parser("stats", help="Show statistics")
    p_stats.add_argument("--db", default=DB_PATH)

    args = parser.parse_args(argv)

    if args.cmd == "archive":
        print(f"Archiving {args.url} (depth={args.depth})…")
        job = archive(args.url, depth=args.depth,
                      same_origin_only=not args.allow_external,
                      db_path=args.db)
        icon = "✓" if job.status == "success" else "✗"
        print(f"{icon} [{job.status}] Job ID: {job.id}")
        if job.status == "success":
            print(f"  Title:   {job.title}")
            print(f"  SHA-256: {job.checksum}")
            print(f"  Size:    {job.content_length:,} bytes")
            print(f"  Links:   {job.links_found}")
            print(f"  Snap:    {job.snapshot_html}")
        else:
            print(f"  Error: {job.error_message}")
        return 0 if job.status == "success" else 1

    elif args.cmd == "get":
        job = retrieve(args.job_id, db_path=args.db)
        if not job:
            print(f"Job {args.job_id!r} not found")
            return 1
        for k, v in job.to_dict().items():
            print(f"  {k}: {v}")

    elif args.cmd == "list":
        jobs = list_jobs(status=args.status, limit=args.limit, db_path=args.db)
        if not jobs:
            print("(no jobs)")
        for j in jobs:
            icon = "✓" if j.status == "success" else "✗"
            print(f"  {icon} {j.id}  {j.url[:50]}  [{j.status}]  {j.created_at[:19]}")

    elif args.cmd == "export":
        path = export_bundle(args.job_id, output_path=args.output, db_path=args.db)
        print(f"✓ Exported bundle to {path}")

    elif args.cmd == "compare":
        result = compare_snapshots(args.id1, args.id2, db_path=args.db)
        same = "identical" if result["same_checksum"] else "different"
        print(f"Snapshots are {same}")
        print(f"  +{result['lines_added']} added, -{result['lines_removed']} removed")
        if result["diff"]:
            print("\n--- Diff (first 200 lines) ---")
            print(result["diff"][:3000])

    elif args.cmd == "links":
        links = get_job_links(args.job_id, db_path=args.db)
        print(f"Links found in job {args.job_id}: {len(links)}")
        for lnk in links[:50]:
            print(f"  [{lnk['depth']}] {lnk['link_url'][:80]}  {lnk['link_text'][:40]}")

    elif args.cmd == "stats":
        s = stats(db_path=args.db)
        for k, v in s.items():
            print(f"  {k}: {v}")
    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    sys.exit(cli_main())
