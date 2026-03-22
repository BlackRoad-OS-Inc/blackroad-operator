#!/usr/bin/env python3
"""
BlackRoad IPFS Content Tracker
Production-grade IPFS content management with SQLite persistence.
"""

import sqlite3
import json
import hashlib
import logging
import subprocess
import urllib.request
import urllib.error
import urllib.parse
import os
import sys
import argparse
import zipfile
import datetime
from dataclasses import dataclass, asdict, field
from typing import Optional, List, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


DB_PATH = os.environ.get("IPFS_TRACKER_DB", os.path.expanduser("~/.blackroad/ipfs_tracker.db"))
DEFAULT_GATEWAYS = [
    "https://ipfs.io/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://dweb.link/ipfs/",
]


@dataclass
class Content:
    id: str
    cid: str
    name: str
    size_bytes: int
    content_type: str
    description: str
    tags: str          # comma-separated
    pinned: bool
    gateway_url: str
    created_at: str

    def __post_init__(self) -> None:
        # SQLite stores booleans as INTEGER; normalise to Python bool.
        self.pinned = bool(self.pinned)

    @classmethod
    def from_row(cls, row: tuple) -> "Content":
        return cls(*row)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["tags"] = [t.strip() for t in d["tags"].split(",") if t.strip()]
        return d


def _generate_id(cid: str) -> str:
    return hashlib.sha256(cid.encode()).hexdigest()[:16]


def _now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

def get_db(path: str = DB_PATH) -> sqlite3.Connection:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    _init_db(conn)
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS content (
            id           TEXT PRIMARY KEY,
            cid          TEXT UNIQUE NOT NULL,
            name         TEXT NOT NULL,
            size_bytes   INTEGER DEFAULT 0,
            content_type TEXT DEFAULT 'application/octet-stream',
            description  TEXT DEFAULT '',
            tags         TEXT DEFAULT '',
            pinned       INTEGER DEFAULT 0,
            gateway_url  TEXT DEFAULT '',
            created_at   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pin_events (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id TEXT NOT NULL,
            event_type TEXT NOT NULL,  -- 'pin' | 'unpin'
            timestamp  TEXT NOT NULL,
            details    TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS availability_checks (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id   TEXT NOT NULL,
            gateway      TEXT NOT NULL,
            status_code  INTEGER,
            latency_ms   INTEGER,
            available    INTEGER NOT NULL,
            checked_at   TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_content_cid ON content(cid);
        CREATE INDEX IF NOT EXISTS idx_content_tags ON content(tags);
        CREATE INDEX IF NOT EXISTS idx_pin_events_content ON pin_events(content_id);
    """)
    conn.commit()


# ---------------------------------------------------------------------------
# IPFS CLI / HTTP API helpers
# ---------------------------------------------------------------------------

def _ipfs_available() -> bool:
    try:
        result = subprocess.run(
            ["ipfs", "version"],
            capture_output=True, text=True, timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _ipfs_api_available(api_url: str = "http://127.0.0.1:5001") -> bool:
    try:
        req = urllib.request.Request(f"{api_url}/api/v0/version", method="POST")
        with urllib.request.urlopen(req, timeout=3) as resp:
            return resp.status == 200
    except Exception:
        return False


def _ipfs_pin_add(cid: str, api_url: str = "http://127.0.0.1:5001") -> bool:
    """Pin CID via IPFS HTTP API or CLI."""
    if _ipfs_api_available(api_url):
        try:
            url = f"{api_url}/api/v0/pin/add?arg={cid}"
            req = urllib.request.Request(url, method="POST")
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read())
                return cid in data.get("Pins", [])
        except Exception as exc:
            logger.warning("HTTP API pin failed: %s", exc)

    if _ipfs_available():
        result = subprocess.run(
            ["ipfs", "pin", "add", cid],
            capture_output=True, text=True, timeout=60
        )
        return result.returncode == 0

    return False


def _ipfs_pin_rm(cid: str, api_url: str = "http://127.0.0.1:5001") -> bool:
    """Unpin CID via IPFS HTTP API or CLI."""
    if _ipfs_api_available(api_url):
        try:
            url = f"{api_url}/api/v0/pin/rm?arg={cid}"
            req = urllib.request.Request(url, method="POST")
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())
                return cid in data.get("Pins", [])
        except Exception as exc:
            logger.warning("HTTP API unpin failed: %s", exc)

    if _ipfs_available():
        result = subprocess.run(
            ["ipfs", "pin", "rm", cid],
            capture_output=True, text=True, timeout=30
        )
        return result.returncode == 0

    return False


def _ipfs_stat(cid: str, api_url: str = "http://127.0.0.1:5001") -> Optional[Dict[str, Any]]:
    """Get object stats for a CID."""
    if _ipfs_api_available(api_url):
        try:
            url = f"{api_url}/api/v0/object/stat?arg={cid}"
            req = urllib.request.Request(url, method="POST")
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read())
        except Exception:
            pass

    if _ipfs_available():
        result = subprocess.run(
            ["ipfs", "object", "stat", cid],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            stat: Dict[str, Any] = {}
            for line in result.stdout.splitlines():
                if ":" in line:
                    key, _, val = line.partition(":")
                    stat[key.strip()] = val.strip()
            return stat

    return None


# ---------------------------------------------------------------------------
# Core operations
# ---------------------------------------------------------------------------

def add_content(
    cid: str,
    name: str = "",
    size_bytes: int = 0,
    content_type: str = "application/octet-stream",
    description: str = "",
    tags: Optional[List[str]] = None,
    auto_pin: bool = False,
    db_path: str = DB_PATH,
) -> Content:
    """Register a CID in the tracker database."""
    conn = get_db(db_path)
    content_id = _generate_id(cid)
    tags_str = ",".join(tags or [])
    gateway_url = f"{DEFAULT_GATEWAYS[0]}{cid}"

    # Try to auto-fetch size from IPFS
    if size_bytes == 0:
        stat = _ipfs_stat(cid)
        if stat:
            size_bytes = int(stat.get("CumulativeSize", stat.get("DataSize", 0)))

    pinned = False
    if auto_pin:
        pinned = _ipfs_pin_add(cid)

    now = _now()
    conn.execute("""
        INSERT OR REPLACE INTO content
            (id, cid, name, size_bytes, content_type, description, tags, pinned, gateway_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (content_id, cid, name or cid[:16], size_bytes, content_type,
          description, tags_str, int(pinned), gateway_url, now))
    conn.commit()

    return Content(
        id=content_id, cid=cid, name=name or cid[:16],
        size_bytes=size_bytes, content_type=content_type,
        description=description, tags=tags_str,
        pinned=pinned, gateway_url=gateway_url, created_at=now
    )


def pin_content(content_id: str, db_path: str = DB_PATH) -> bool:
    """Pin a tracked CID via IPFS."""
    conn = get_db(db_path)
    row = conn.execute("SELECT cid FROM content WHERE id = ?", (content_id,)).fetchone()
    if not row:
        raise ValueError(f"Content {content_id!r} not found")

    cid = row["cid"]
    success = _ipfs_pin_add(cid)
    conn.execute("UPDATE content SET pinned = ? WHERE id = ?", (int(success), content_id))
    conn.execute("""
        INSERT INTO pin_events (content_id, event_type, timestamp, details)
        VALUES (?, 'pin', ?, ?)
    """, (content_id, _now(), "success" if success else "failed"))
    conn.commit()
    return success


def unpin_content(content_id: str, db_path: str = DB_PATH) -> bool:
    """Unpin a tracked CID from IPFS."""
    conn = get_db(db_path)
    row = conn.execute("SELECT cid FROM content WHERE id = ?", (content_id,)).fetchone()
    if not row:
        raise ValueError(f"Content {content_id!r} not found")

    cid = row["cid"]
    success = _ipfs_pin_rm(cid)
    conn.execute("UPDATE content SET pinned = 0 WHERE id = ?", (content_id,))
    conn.execute("""
        INSERT INTO pin_events (content_id, event_type, timestamp, details)
        VALUES (?, 'unpin', ?, ?)
    """, (content_id, _now(), "success" if success else "failed"))
    conn.commit()
    return success


def verify_availability(
    content_id: str,
    gateways: List[str] = None,
    db_path: str = DB_PATH,
) -> Dict[str, Any]:
    """Check whether a CID is reachable via public gateways."""
    conn = get_db(db_path)
    row = conn.execute("SELECT cid, name FROM content WHERE id = ?", (content_id,)).fetchone()
    if not row:
        raise ValueError(f"Content {content_id!r} not found")

    cid = row["cid"]
    gateways = gateways or DEFAULT_GATEWAYS
    results: List[Dict[str, Any]] = []

    for gateway in gateways:
        url = f"{gateway}{cid}"
        start = datetime.datetime.utcnow()
        available = False
        status_code = 0
        try:
            req = urllib.request.Request(url, method="HEAD")
            req.add_header("User-Agent", "BlackRoad-IPFS-Tracker/1.0")
            with urllib.request.urlopen(req, timeout=10) as resp:
                status_code = resp.status
                available = status_code < 400
        except urllib.error.HTTPError as exc:
            status_code = exc.code
        except Exception:
            pass

        latency_ms = int((datetime.datetime.utcnow() - start).total_seconds() * 1000)
        now = _now()
        conn.execute("""
            INSERT INTO availability_checks
                (content_id, gateway, status_code, latency_ms, available, checked_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (content_id, gateway, status_code, latency_ms, int(available), now))
        results.append({
            "gateway": gateway,
            "url": url,
            "available": available,
            "status_code": status_code,
            "latency_ms": latency_ms,
        })

    conn.commit()
    reachable = sum(1 for r in results if r["available"])
    return {
        "content_id": content_id,
        "cid": cid,
        "gateways_checked": len(results),
        "gateways_available": reachable,
        "fully_available": reachable == len(results),
        "results": results,
    }


def list_content(
    pinned_only: bool = False,
    tag: Optional[str] = None,
    db_path: str = DB_PATH,
) -> List[Content]:
    """List tracked content with optional filters."""
    conn = get_db(db_path)
    query = "SELECT * FROM content WHERE 1=1"
    params: List[Any] = []
    if pinned_only:
        query += " AND pinned = 1"
    if tag:
        query += " AND (',' || tags || ',') LIKE ?"
        params.append(f"%,{tag},%")
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    return [Content(*tuple(r)) for r in rows]


def get_content(content_id: str, db_path: str = DB_PATH) -> Optional[Content]:
    conn = get_db(db_path)
    row = conn.execute("SELECT * FROM content WHERE id = ?", (content_id,)).fetchone()
    if row:
        return Content(*tuple(row))
    return None


def _escape_like(s: str) -> str:
    """Escape SQL LIKE special characters so user input is treated literally."""
    return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def search(query: str, db_path: str = DB_PATH) -> List[Content]:
    """Search content by name, description, or tags."""
    conn = get_db(db_path)
    escaped = _escape_like(query)
    pattern = f"%{escaped}%"
    rows = conn.execute("""
        SELECT * FROM content
        WHERE name LIKE ? ESCAPE '\\'
           OR description LIKE ? ESCAPE '\\'
           OR tags LIKE ? ESCAPE '\\'
           OR cid LIKE ? ESCAPE '\\'
        ORDER BY created_at DESC
    """, (pattern, pattern, pattern, pattern)).fetchall()
    return [Content(*tuple(r)) for r in rows]


def export_manifest(
    output_path: str = "ipfs_manifest.json",
    db_path: str = DB_PATH,
) -> str:
    """Export all tracked content as a JSON manifest."""
    items = list_content(db_path=db_path)
    manifest = {
        "exported_at": _now(),
        "total_items": len(items),
        "pinned_items": sum(1 for c in items if c.pinned),
        "total_size_bytes": sum(c.size_bytes for c in items),
        "content": [c.to_dict() for c in items],
    }
    with open(output_path, "w") as fh:
        json.dump(manifest, fh, indent=2)
    return output_path


def bulk_import_from_json(
    json_path: str,
    auto_pin: bool = False,
    db_path: str = DB_PATH,
) -> List[Content]:
    """Bulk import content entries from a JSON file."""
    with open(json_path) as fh:
        data = json.load(fh)

    # Support both manifest format and plain list
    items = data.get("content", data) if isinstance(data, dict) else data
    if not isinstance(items, list):
        raise ValueError("JSON must be a list or manifest with 'content' key")

    imported: List[Content] = []
    for entry in items:
        if "cid" not in entry:
            continue
        content = add_content(
            cid=entry["cid"],
            name=entry.get("name", ""),
            size_bytes=int(entry.get("size_bytes", 0)),
            content_type=entry.get("content_type", "application/octet-stream"),
            description=entry.get("description", ""),
            tags=entry.get("tags", []) if isinstance(entry.get("tags"), list)
                 else [t.strip() for t in str(entry.get("tags", "")).split(",") if t.strip()],
            auto_pin=auto_pin,
            db_path=db_path,
        )
        imported.append(content)
    return imported


def delete_content(content_id: str, unpin_first: bool = True, db_path: str = DB_PATH) -> bool:
    """Remove a content entry from the tracker."""
    conn = get_db(db_path)
    row = conn.execute("SELECT * FROM content WHERE id = ?", (content_id,)).fetchone()
    if not row:
        return False
    if unpin_first and row["pinned"]:
        _ipfs_pin_rm(row["cid"])
    conn.execute("DELETE FROM content WHERE id = ?", (content_id,))
    conn.execute("DELETE FROM pin_events WHERE content_id = ?", (content_id,))
    conn.execute("DELETE FROM availability_checks WHERE content_id = ?", (content_id,))
    conn.commit()
    return True


def stats(db_path: str = DB_PATH) -> Dict[str, Any]:
    """Return aggregate statistics about tracked content."""
    conn = get_db(db_path)
    total = conn.execute("SELECT COUNT(*) FROM content").fetchone()[0]
    pinned = conn.execute("SELECT COUNT(*) FROM content WHERE pinned = 1").fetchone()[0]
    total_size = conn.execute("SELECT COALESCE(SUM(size_bytes), 0) FROM content").fetchone()[0]
    types = conn.execute(
        "SELECT content_type, COUNT(*) as cnt FROM content GROUP BY content_type ORDER BY cnt DESC"
    ).fetchall()
    recent_checks = conn.execute("""
        SELECT available, COUNT(*) as cnt FROM availability_checks
        WHERE checked_at > datetime('now', '-24 hours')
        GROUP BY available
    """).fetchall()
    return {
        "total_items": total,
        "pinned_items": pinned,
        "unpinned_items": total - pinned,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "content_types": [{"type": r[0], "count": r[1]} for r in types],
        "availability_24h": {
            "available": next((r[1] for r in recent_checks if r[0] == 1), 0),
            "unavailable": next((r[1] for r in recent_checks if r[0] == 0), 0),
        },
        "ipfs_daemon": _ipfs_available(),
        "ipfs_api": _ipfs_api_available(),
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


def _print_content(c: Content) -> None:
    print(f"  ID:          {c.id}")
    print(f"  CID:         {c.cid}")
    print(f"  Name:        {c.name}")
    print(f"  Size:        {_fmt_size(c.size_bytes)}")
    print(f"  Type:        {c.content_type}")
    print(f"  Pinned:      {'✓' if c.pinned else '✗'}")
    print(f"  Tags:        {c.tags or '(none)'}")
    print(f"  Description: {c.description or '(none)'}")
    print(f"  Gateway:     {c.gateway_url}")
    print(f"  Created:     {c.created_at}")


def cli_main(argv: List[str] = None) -> int:
    parser = argparse.ArgumentParser(
        prog="ipfs-tracker",
        description="BlackRoad IPFS Content Tracker"
    )
    sub = parser.add_subparsers(dest="cmd")

    # add
    p_add = sub.add_parser("add", help="Track a CID")
    p_add.add_argument("cid")
    p_add.add_argument("--name", default="")
    p_add.add_argument("--size", type=int, default=0)
    p_add.add_argument("--type", dest="content_type", default="application/octet-stream")
    p_add.add_argument("--description", default="")
    p_add.add_argument("--tags", default="")
    p_add.add_argument("--pin", action="store_true")
    p_add.add_argument("--db", default=DB_PATH)

    # pin / unpin
    p_pin = sub.add_parser("pin", help="Pin a tracked content")
    p_pin.add_argument("content_id")
    p_pin.add_argument("--db", default=DB_PATH)

    p_unpin = sub.add_parser("unpin", help="Unpin a tracked content")
    p_unpin.add_argument("content_id")
    p_unpin.add_argument("--db", default=DB_PATH)

    # verify
    p_verify = sub.add_parser("verify", help="Verify availability across gateways")
    p_verify.add_argument("content_id")
    p_verify.add_argument("--gateways", nargs="*", default=None)
    p_verify.add_argument("--db", default=DB_PATH)

    # list
    p_list = sub.add_parser("list", help="List tracked content")
    p_list.add_argument("--pinned", action="store_true")
    p_list.add_argument("--tag", default=None)
    p_list.add_argument("--db", default=DB_PATH)

    # search
    p_search = sub.add_parser("search", help="Search content")
    p_search.add_argument("query")
    p_search.add_argument("--db", default=DB_PATH)

    # export
    p_export = sub.add_parser("export", help="Export manifest JSON")
    p_export.add_argument("--output", default="ipfs_manifest.json")
    p_export.add_argument("--db", default=DB_PATH)

    # import
    p_import = sub.add_parser("import", help="Bulk import from JSON")
    p_import.add_argument("json_file")
    p_import.add_argument("--pin", action="store_true")
    p_import.add_argument("--db", default=DB_PATH)

    # delete
    p_del = sub.add_parser("delete", help="Remove a content entry")
    p_del.add_argument("content_id")
    p_del.add_argument("--keep-pin", action="store_true")
    p_del.add_argument("--db", default=DB_PATH)

    # stats
    p_stats = sub.add_parser("stats", help="Show aggregate statistics")
    p_stats.add_argument("--db", default=DB_PATH)

    args = parser.parse_args(argv)

    if args.cmd == "add":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        c = add_content(args.cid, name=args.name, size_bytes=args.size,
                        content_type=args.content_type, description=args.description,
                        tags=tags, auto_pin=args.pin, db_path=args.db)
        print(f"✓ Added content {c.id}")
        _print_content(c)

    elif args.cmd == "pin":
        try:
            ok = pin_content(args.content_id, db_path=args.db)
        except ValueError as exc:
            print(f"✗ {exc}", file=sys.stderr)
            return 1
        print(f"{'✓ Pinned' if ok else '✗ Pin failed'} {args.content_id}")
        return 0 if ok else 1

    elif args.cmd == "unpin":
        try:
            ok = unpin_content(args.content_id, db_path=args.db)
        except ValueError as exc:
            print(f"✗ {exc}", file=sys.stderr)
            return 1
        print(f"{'✓ Unpinned' if ok else '✗ Unpin failed'} {args.content_id}")
        return 0 if ok else 1

    elif args.cmd == "verify":
        try:
            result = verify_availability(args.content_id, gateways=args.gateways, db_path=args.db)
        except ValueError as exc:
            print(f"✗ {exc}", file=sys.stderr)
            return 1
        print(f"CID: {result['cid']}")
        print(f"Reachable via {result['gateways_available']}/{result['gateways_checked']} gateways")
        for r in result["results"]:
            status = "✓" if r["available"] else "✗"
            print(f"  {status} {r['gateway']}  [{r['status_code']}]  {r['latency_ms']}ms")

    elif args.cmd == "list":
        items = list_content(pinned_only=args.pinned, tag=args.tag, db_path=args.db)
        if not items:
            print("(no content tracked)")
        for c in items:
            pin_icon = "📌" if c.pinned else "  "
            print(f"{pin_icon} {c.id}  {c.cid[:20]}…  {c.name}  {_fmt_size(c.size_bytes)}")

    elif args.cmd == "search":
        results = search(args.query, db_path=args.db)
        print(f"Found {len(results)} result(s) for '{args.query}':")
        for c in results:
            print(f"  {c.id}  {c.name}  ({c.cid})")

    elif args.cmd == "export":
        path = export_manifest(output_path=args.output, db_path=args.db)
        items = list_content(db_path=args.db)
        print(f"✓ Exported {len(items)} items to {path}")

    elif args.cmd == "import":
        imported = bulk_import_from_json(args.json_file, auto_pin=args.pin, db_path=args.db)
        print(f"✓ Imported {len(imported)} content entries")

    elif args.cmd == "delete":
        ok = delete_content(args.content_id, unpin_first=not args.keep_pin, db_path=args.db)
        print(f"{'✓ Deleted' if ok else '✗ Not found'} {args.content_id}")
        return 0 if ok else 1

    elif args.cmd == "stats":
        s = stats(db_path=args.db)
        print(f"IPFS Tracker Statistics")
        print(f"  Total items:     {s['total_items']}")
        print(f"  Pinned:          {s['pinned_items']}")
        print(f"  Total size:      {_fmt_size(s['total_size_bytes'])}")
        print(f"  IPFS daemon:     {'✓' if s['ipfs_daemon'] else '✗'}")
        print(f"  IPFS API:        {'✓' if s['ipfs_api'] else '✗'}")
        print(f"  Content types:")
        for ct in s["content_types"]:
            print(f"    {ct['type']}: {ct['count']}")
    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    sys.exit(cli_main())
