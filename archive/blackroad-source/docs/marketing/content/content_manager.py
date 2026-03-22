#!/usr/bin/env python3
"""BlackRoad Content Manager - Full-featured CMS backend in Python + SQLite."""

import argparse
import json
import re
import sqlite3
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote

DB_PATH = Path.home() / ".blackroad" / "content_manager.db"


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class Content:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    type: str = "article"          # article | page | post | doc | video
    title: str = ""
    body: str = ""
    tags: List[str] = field(default_factory=list)
    slug: str = ""
    status: str = "draft"          # draft | published | archived
    author: str = ""
    published_at: Optional[str] = None
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def _conn(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    _init_db(con)
    return con


def _init_db(con: sqlite3.Connection) -> None:
    con.executescript("""
        CREATE TABLE IF NOT EXISTS content (
            id           TEXT PRIMARY KEY,
            type         TEXT NOT NULL DEFAULT 'article',
            title        TEXT NOT NULL,
            body         TEXT NOT NULL DEFAULT '',
            slug         TEXT UNIQUE,
            status       TEXT NOT NULL DEFAULT 'draft',
            author       TEXT NOT NULL DEFAULT '',
            published_at TEXT,
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL
        );

        CREATE VIRTUAL TABLE IF NOT EXISTS content_fts
        USING fts5(id UNINDEXED, title, body, content='content', content_rowid='rowid');

        CREATE TRIGGER IF NOT EXISTS content_ai AFTER INSERT ON content BEGIN
            INSERT INTO content_fts(rowid, id, title, body)
            VALUES (new.rowid, new.id, new.title, new.body);
        END;

        CREATE TRIGGER IF NOT EXISTS content_au AFTER UPDATE ON content BEGIN
            INSERT INTO content_fts(content_fts, rowid, id, title, body)
            VALUES ('delete', old.rowid, old.id, old.title, old.body);
            INSERT INTO content_fts(rowid, id, title, body)
            VALUES (new.rowid, new.id, new.title, new.body);
        END;

        CREATE TABLE IF NOT EXISTS revisions (
            id         TEXT PRIMARY KEY,
            content_id TEXT NOT NULL REFERENCES content(id),
            title      TEXT NOT NULL,
            body       TEXT NOT NULL,
            author     TEXT NOT NULL DEFAULT '',
            saved_at   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tags (
            id         TEXT PRIMARY KEY,
            content_id TEXT NOT NULL REFERENCES content(id),
            tag        TEXT NOT NULL,
            UNIQUE(content_id, tag)
        );
    """)
    con.commit()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text)


def _save_tags(con: sqlite3.Connection, content_id: str, tags: List[str]) -> None:
    con.execute("DELETE FROM tags WHERE content_id=?", (content_id,))
    for tag in tags:
        con.execute(
            "INSERT OR IGNORE INTO tags VALUES (?,?,?)",
            (str(uuid.uuid4()), content_id, tag.strip().lower()),
        )


def _load_tags(con: sqlite3.Connection, content_id: str) -> List[str]:
    rows = con.execute(
        "SELECT tag FROM tags WHERE content_id=? ORDER BY tag", (content_id,)
    ).fetchall()
    return [r["tag"] for r in rows]


def _row_to_content(row, tags: List[str]) -> dict:
    d = dict(row)
    d["tags"] = tags
    return d


# ---------------------------------------------------------------------------
# Core operations
# ---------------------------------------------------------------------------

def create_content(content: Content, db: Path = DB_PATH) -> Content:
    """Persist new content (generates slug if empty)."""
    if not content.slug:
        content.slug = _slugify(content.title)
    with _conn(db) as con:
        con.execute(
            """INSERT INTO content VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (
                content.id,
                content.type,
                content.title,
                content.body,
                content.slug,
                content.status,
                content.author,
                content.published_at,
                content.created_at,
                content.updated_at,
            ),
        )
        _save_tags(con, content.id, content.tags)
    return content


def update_content(
    content_id: str,
    title: Optional[str] = None,
    body: Optional[str] = None,
    tags: Optional[List[str]] = None,
    author: str = "system",
    db: Path = DB_PATH,
) -> dict:
    """Update content and save revision."""
    now = datetime.now(timezone.utc).isoformat()
    with _conn(db) as con:
        row = con.execute("SELECT * FROM content WHERE id=?", (content_id,)).fetchone()
        if not row:
            return {"error": f"Content {content_id} not found"}

        new_title = title if title is not None else row["title"]
        new_body = body if body is not None else row["body"]

        # save revision
        con.execute(
            "INSERT INTO revisions VALUES (?,?,?,?,?,?)",
            (str(uuid.uuid4()), content_id, row["title"], row["body"], row["author"], now),
        )
        con.execute(
            "UPDATE content SET title=?, body=?, updated_at=? WHERE id=?",
            (new_title, new_body, now, content_id),
        )
        if tags is not None:
            _save_tags(con, content_id, tags)
    return {"ok": True, "content_id": content_id, "updated_at": now}


def publish(content_id: str, db: Path = DB_PATH) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with _conn(db) as con:
        rows_affected = con.execute(
            "UPDATE content SET status='published', published_at=?, updated_at=? WHERE id=?",
            (now, now, content_id),
        ).rowcount
    if rows_affected == 0:
        return {"error": f"Content {content_id} not found"}
    return {"ok": True, "content_id": content_id, "published_at": now}


def unpublish(content_id: str, db: Path = DB_PATH) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with _conn(db) as con:
        rows_affected = con.execute(
            "UPDATE content SET status='draft', published_at=NULL, updated_at=? WHERE id=?",
            (now, content_id),
        ).rowcount
    if rows_affected == 0:
        return {"error": f"Content {content_id} not found"}
    return {"ok": True, "content_id": content_id, "status": "draft"}


def search(query: str, db: Path = DB_PATH) -> List[dict]:
    """Full-text search over title + body."""
    with _conn(db) as con:
        rows = con.execute(
            """SELECT c.* FROM content c
               JOIN content_fts f ON c.id = f.id
               WHERE content_fts MATCH ?
               ORDER BY rank""",
            (query,),
        ).fetchall()
        return [_row_to_content(r, _load_tags(con, r["id"])) for r in rows]


def get_by_tag(tag: str, db: Path = DB_PATH) -> List[dict]:
    with _conn(db) as con:
        rows = con.execute(
            """SELECT c.* FROM content c
               JOIN tags t ON t.content_id = c.id
               WHERE t.tag = ?
               ORDER BY c.created_at DESC""",
            (tag.lower(),),
        ).fetchall()
        return [_row_to_content(r, _load_tags(con, r["id"])) for r in rows]


def get_content(content_id: str, db: Path = DB_PATH) -> Optional[dict]:
    with _conn(db) as con:
        row = con.execute("SELECT * FROM content WHERE id=?", (content_id,)).fetchone()
        if not row:
            return None
        return _row_to_content(row, _load_tags(con, content_id))


def word_count(content_id: str, db: Path = DB_PATH) -> dict:
    with _conn(db) as con:
        row = con.execute("SELECT body FROM content WHERE id=?", (content_id,)).fetchone()
    if not row:
        return {"error": "Not found"}
    words = len(row["body"].split())
    return {"content_id": content_id, "word_count": words}


def reading_time(content_id: str, wpm: int = 200, db: Path = DB_PATH) -> dict:
    wc = word_count(content_id, db)
    if "error" in wc:
        return wc
    minutes = max(1, round(wc["word_count"] / wpm))
    return {
        "content_id": content_id,
        "word_count": wc["word_count"],
        "reading_time_minutes": minutes,
        "wpm": wpm,
    }


def export_sitemap(base_url: str, db: Path = DB_PATH) -> str:
    """Generate an XML sitemap of all published content."""
    base_url = base_url.rstrip("/")
    with _conn(db) as con:
        rows = con.execute(
            "SELECT slug, updated_at FROM content WHERE status='published' ORDER BY updated_at DESC"
        ).fetchall()

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for row in rows:
        slug = quote(row["slug"] or "")
        lastmod = (row["updated_at"] or "")[:10]
        lines.append(f"  <url><loc>{base_url}/{slug}</loc><lastmod>{lastmod}</lastmod></url>")
    lines.append("</urlset>")
    return "\n".join(lines)


def list_content(status: Optional[str] = None, db: Path = DB_PATH) -> List[dict]:
    with _conn(db) as con:
        if status:
            rows = con.execute(
                "SELECT * FROM content WHERE status=? ORDER BY created_at DESC", (status,)
            ).fetchall()
        else:
            rows = con.execute(
                "SELECT * FROM content ORDER BY created_at DESC"
            ).fetchall()
        return [_row_to_content(r, _load_tags(con, r["id"])) for r in rows]


def get_revisions(content_id: str, db: Path = DB_PATH) -> List[dict]:
    with _conn(db) as con:
        rows = con.execute(
            "SELECT * FROM revisions WHERE content_id=? ORDER BY saved_at DESC",
            (content_id,),
        ).fetchall()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="BlackRoad Content Manager")
    sub = p.add_subparsers(dest="cmd", required=True)

    create = sub.add_parser("create", help="Create content")
    create.add_argument("--type", default="article")
    create.add_argument("--title", required=True)
    create.add_argument("--body", default="")
    create.add_argument("--tags", nargs="*", default=[])
    create.add_argument("--author", default="")
    create.add_argument("--slug", default="")

    sub.add_parser("list", help="List all content").add_argument("--status", default=None)

    get = sub.add_parser("get", help="Get content by ID")
    get.add_argument("content_id")

    pub = sub.add_parser("publish", help="Publish content")
    pub.add_argument("content_id")

    upub = sub.add_parser("unpublish", help="Unpublish content")
    upub.add_argument("content_id")

    srch = sub.add_parser("search", help="Full-text search")
    srch.add_argument("query")

    tag = sub.add_parser("by-tag", help="Get content by tag")
    tag.add_argument("tag")

    wc = sub.add_parser("word-count", help="Word count")
    wc.add_argument("content_id")

    rt = sub.add_parser("reading-time", help="Reading time")
    rt.add_argument("content_id")
    rt.add_argument("--wpm", type=int, default=200)

    sm = sub.add_parser("sitemap", help="Export XML sitemap")
    sm.add_argument("base_url")

    rev = sub.add_parser("revisions", help="List revisions")
    rev.add_argument("content_id")

    return p


def main(argv=None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.cmd == "create":
        c = Content(
            type=args.type,
            title=args.title,
            body=args.body,
            tags=args.tags,
            author=args.author,
            slug=args.slug,
        )
        print(json.dumps(asdict(create_content(c)), indent=2))

    elif args.cmd == "list":
        print(json.dumps(list_content(args.status), indent=2))

    elif args.cmd == "get":
        result = get_content(args.content_id)
        print(json.dumps(result, indent=2))

    elif args.cmd == "publish":
        print(json.dumps(publish(args.content_id), indent=2))

    elif args.cmd == "unpublish":
        print(json.dumps(unpublish(args.content_id), indent=2))

    elif args.cmd == "search":
        print(json.dumps(search(args.query), indent=2))

    elif args.cmd == "by-tag":
        print(json.dumps(get_by_tag(args.tag), indent=2))

    elif args.cmd == "word-count":
        print(json.dumps(word_count(args.content_id), indent=2))

    elif args.cmd == "reading-time":
        print(json.dumps(reading_time(args.content_id, args.wpm), indent=2))

    elif args.cmd == "sitemap":
        print(export_sitemap(args.base_url))

    elif args.cmd == "revisions":
        print(json.dumps(get_revisions(args.content_id), indent=2))


if __name__ == "__main__":
    main()
