#!/usr/bin/env python3
"""BlackRoad Social Media API - Schedule, publish, and analyse social posts."""

import argparse
import csv
import hashlib
import json
import re
import sqlite3
import sys
import uuid
from collections import Counter
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

DB_PATH = Path.home() / ".blackroad" / "social_media.db"


# ---------------------------------------------------------------------------
# Data model
# ---------------------------------------------------------------------------

@dataclass
class SocialPost:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    platform: str = ""          # twitter, instagram, linkedin, facebook, …
    content: str = ""
    media_urls: List[str] = field(default_factory=list)
    scheduled_at: Optional[str] = None   # ISO-8601
    status: str = "draft"               # draft | scheduled | published | failed
    impressions: int = 0
    likes: int = 0
    shares: int = 0
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def _conn(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    _init_db(con)
    return con


def _init_db(con: sqlite3.Connection) -> None:
    con.executescript("""
        CREATE TABLE IF NOT EXISTS posts (
            id          TEXT PRIMARY KEY,
            platform    TEXT NOT NULL,
            content     TEXT NOT NULL,
            media_urls  TEXT DEFAULT '[]',
            scheduled_at TEXT,
            status      TEXT DEFAULT 'draft',
            created_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS analytics (
            id          TEXT PRIMARY KEY,
            post_id     TEXT NOT NULL REFERENCES posts(id),
            impressions INTEGER DEFAULT 0,
            likes       INTEGER DEFAULT 0,
            shares      INTEGER DEFAULT 0,
            recorded_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS platforms (
            name        TEXT PRIMARY KEY,
            credentials TEXT DEFAULT '{}',
            active      INTEGER DEFAULT 1
        );
    """)
    con.commit()


# ---------------------------------------------------------------------------
# Core operations
# ---------------------------------------------------------------------------

def schedule_post(post: SocialPost, db: Path = DB_PATH) -> SocialPost:
    """Persist a post with status=scheduled (or draft if no time given)."""
    if post.scheduled_at and post.status == "draft":
        post.status = "scheduled"
    with _conn(db) as con:
        con.execute(
            "INSERT OR REPLACE INTO posts VALUES (?,?,?,?,?,?,?)",
            (
                post.id,
                post.platform,
                post.content,
                json.dumps(post.media_urls),
                post.scheduled_at,
                post.status,
                post.created_at,
            ),
        )
    return post


def publish_now(post_id: str, db: Path = DB_PATH) -> dict:
    """Mark a post as published immediately (simulated send)."""
    with _conn(db) as con:
        row = con.execute(
            "SELECT * FROM posts WHERE id=?", (post_id,)
        ).fetchone()
        if not row:
            return {"ok": False, "error": f"Post {post_id} not found"}

        now = datetime.now(timezone.utc).isoformat()
        con.execute(
            "UPDATE posts SET status='published', scheduled_at=? WHERE id=?",
            (now, post_id),
        )
        # Stub: insert zero-baseline analytics row
        con.execute(
            "INSERT INTO analytics VALUES (?,?,0,0,0,?)",
            (str(uuid.uuid4()), post_id, now),
        )
    return {"ok": True, "post_id": post_id, "published_at": now}


def get_analytics(post_id: str, db: Path = DB_PATH) -> dict:
    """Return aggregated analytics for a post."""
    with _conn(db) as con:
        post = con.execute(
            "SELECT * FROM posts WHERE id=?", (post_id,)
        ).fetchone()
        if not post:
            return {"error": f"Post {post_id} not found"}

        agg = con.execute(
            """SELECT SUM(impressions) impressions,
                      SUM(likes)       likes,
                      SUM(shares)      shares
               FROM analytics WHERE post_id=?""",
            (post_id,),
        ).fetchone()

    return {
        "post_id": post_id,
        "platform": post["platform"],
        "status": post["status"],
        "impressions": agg["impressions"] or 0,
        "likes": agg["likes"] or 0,
        "shares": agg["shares"] or 0,
    }


def bulk_import(csv_path: str, db: Path = DB_PATH) -> dict:
    """Import posts from a CSV file.

    Expected columns: platform, content, media_urls (pipe-separated),
    scheduled_at (ISO-8601), status
    """
    imported, errors = 0, []
    with open(csv_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for i, row in enumerate(reader, start=2):
            try:
                media = [u.strip() for u in row.get("media_urls", "").split("|") if u.strip()]
                post = SocialPost(
                    platform=row.get("platform", "").strip(),
                    content=row.get("content", "").strip(),
                    media_urls=media,
                    scheduled_at=row.get("scheduled_at", "").strip() or None,
                    status=row.get("status", "draft").strip(),
                )
                schedule_post(post, db)
                imported += 1
            except Exception as exc:
                errors.append({"row": i, "error": str(exc)})

    return {"imported": imported, "errors": errors}


def export_report(days: int = 30, db: Path = DB_PATH) -> List[dict]:
    """Return a summary report for the last *days* days."""
    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    with _conn(db) as con:
        rows = con.execute(
            """SELECT p.id, p.platform, p.status,
                      COALESCE(SUM(a.impressions),0) impressions,
                      COALESCE(SUM(a.likes),0) likes,
                      COALESCE(SUM(a.shares),0) shares
               FROM posts p
               LEFT JOIN analytics a ON a.post_id = p.id
               WHERE p.created_at >= ?
               GROUP BY p.id
               ORDER BY impressions DESC""",
            (since,),
        ).fetchall()
    return [dict(r) for r in rows]


def hashtag_suggestions(content: str, top_n: int = 10) -> List[str]:
    """Suggest hashtags from keyword frequency in *content*.

    Simple approach: strip stop-words, count tokens, return top-N as hashtags.
    """
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
        "for", "of", "with", "by", "from", "is", "was", "are", "were",
        "be", "been", "have", "has", "had", "will", "would", "could",
        "should", "may", "might", "that", "this", "it", "its", "i",
        "we", "you", "they", "he", "she", "not", "no", "so", "if",
    }
    tokens = re.findall(r"[a-zA-Z]{3,}", content.lower())
    counts = Counter(t for t in tokens if t not in stop_words)
    return [f"#{word}" for word, _ in counts.most_common(top_n)]


def update_analytics(
    post_id: str,
    impressions: int,
    likes: int,
    shares: int,
    db: Path = DB_PATH,
) -> dict:
    """Record a new analytics snapshot for a post."""
    now = datetime.now(timezone.utc).isoformat()
    with _conn(db) as con:
        con.execute(
            "INSERT INTO analytics VALUES (?,?,?,?,?,?)",
            (str(uuid.uuid4()), post_id, impressions, likes, shares, now),
        )
    return {"ok": True, "post_id": post_id, "recorded_at": now}


def list_posts(status: Optional[str] = None, db: Path = DB_PATH) -> List[dict]:
    with _conn(db) as con:
        if status:
            rows = con.execute(
                "SELECT * FROM posts WHERE status=? ORDER BY scheduled_at", (status,)
            ).fetchall()
        else:
            rows = con.execute(
                "SELECT * FROM posts ORDER BY created_at DESC"
            ).fetchall()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="BlackRoad Social Media API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    # schedule
    sch = sub.add_parser("schedule", help="Schedule a new post")
    sch.add_argument("--platform", required=True)
    sch.add_argument("--content", required=True)
    sch.add_argument("--media", nargs="*", default=[])
    sch.add_argument("--at", dest="scheduled_at", default=None)

    # publish
    pub = sub.add_parser("publish", help="Publish a post immediately")
    pub.add_argument("post_id")

    # analytics
    ana = sub.add_parser("analytics", help="Get analytics for a post")
    ana.add_argument("post_id")

    # update-analytics
    ua = sub.add_parser("update-analytics", help="Record analytics snapshot")
    ua.add_argument("post_id")
    ua.add_argument("--impressions", type=int, default=0)
    ua.add_argument("--likes", type=int, default=0)
    ua.add_argument("--shares", type=int, default=0)

    # import
    imp = sub.add_parser("import", help="Bulk-import posts from CSV")
    imp.add_argument("csv_path")

    # report
    rep = sub.add_parser("report", help="Export analytics report")
    rep.add_argument("--days", type=int, default=30)

    # hashtags
    ht = sub.add_parser("hashtags", help="Suggest hashtags for content")
    ht.add_argument("content")
    ht.add_argument("--top", type=int, default=10)

    # list
    ls = sub.add_parser("list", help="List posts")
    ls.add_argument("--status", default=None)

    return p


def main(argv=None) -> None:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.cmd == "schedule":
        post = SocialPost(
            platform=args.platform,
            content=args.content,
            media_urls=args.media,
            scheduled_at=args.scheduled_at,
        )
        result = schedule_post(post)
        print(json.dumps(asdict(result), indent=2))

    elif args.cmd == "publish":
        print(json.dumps(publish_now(args.post_id), indent=2))

    elif args.cmd == "analytics":
        print(json.dumps(get_analytics(args.post_id), indent=2))

    elif args.cmd == "update-analytics":
        print(json.dumps(
            update_analytics(args.post_id, args.impressions, args.likes, args.shares),
            indent=2,
        ))

    elif args.cmd == "import":
        print(json.dumps(bulk_import(args.csv_path), indent=2))

    elif args.cmd == "report":
        rows = export_report(args.days)
        print(json.dumps(rows, indent=2))

    elif args.cmd == "hashtags":
        tags = hashtag_suggestions(args.content, args.top)
        print(json.dumps(tags, indent=2))

    elif args.cmd == "list":
        print(json.dumps(list_posts(args.status), indent=2))


if __name__ == "__main__":
    main()
