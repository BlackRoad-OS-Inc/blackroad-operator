#!/usr/bin/env python3
"""
BlackRoad Content Scheduler — manage social posts across platforms.
"""

import json
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path


class ContentScheduler:
    def __init__(self, db_path: str = "~/.blackroad/content.db"):
        self.db = Path(db_path).expanduser()
        self.db.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS posts (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    status TEXT DEFAULT 'draft',
                    scheduled_at TEXT,
                    published_at TEXT,
                    tags TEXT DEFAULT '[]',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS campaigns (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    goal TEXT,
                    start_date TEXT,
                    end_date TEXT,
                    status TEXT DEFAULT 'active'
                )
            """)

    def create_post(self, title: str, content: str, platform: str,
                    tags: list[str] = None, scheduled_at: str = None) -> str:
        post_id = str(uuid.uuid4())[:8]
        with sqlite3.connect(self.db) as conn:
            conn.execute(
                "INSERT INTO posts (id, title, content, platform, tags, scheduled_at) VALUES (?,?,?,?,?,?)",
                (post_id, title, content, platform, json.dumps(tags or []), scheduled_at)
            )
        return post_id

    def list_posts(self, status: str = None, platform: str = None) -> list[dict]:
        query = "SELECT * FROM posts WHERE 1=1"
        params = []
        if status:
            query += " AND status = ?"
            params.append(status)
        if platform:
            query += " AND platform = ?"
            params.append(platform)
        query += " ORDER BY created_at DESC"
        
        with sqlite3.connect(self.db) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(query, params).fetchall()
        
        return [dict(r) for r in rows]

    def publish_post(self, post_id: str) -> bool:
        with sqlite3.connect(self.db) as conn:
            conn.execute(
                "UPDATE posts SET status='published', published_at=? WHERE id=?",
                (datetime.utcnow().isoformat(), post_id)
            )
        return True

    def get_stats(self) -> dict:
        with sqlite3.connect(self.db) as conn:
            rows = conn.execute(
                "SELECT platform, status, COUNT(*) as count FROM posts GROUP BY platform, status"
            ).fetchall()
        
        stats = {}
        for platform, status, count in rows:
            if platform not in stats:
                stats[platform] = {}
            stats[platform][status] = count
        return stats


if __name__ == "__main__":
    import argparse

    sched = ContentScheduler()
    parser = argparse.ArgumentParser(description="BlackRoad Content Scheduler")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("add")
    p.add_argument("title")
    p.add_argument("platform", choices=["twitter", "linkedin", "mastodon", "blog", "newsletter"])
    p.add_argument("--content", default="")
    p.add_argument("--tags", nargs="+", default=[])

    p = sub.add_parser("list")
    p.add_argument("--status", default=None)
    p.add_argument("--platform", default=None)

    p = sub.add_parser("publish")
    p.add_argument("post_id")

    sub.add_parser("stats")

    args = parser.parse_args()

    if args.cmd == "add":
        pid = sched.create_post(args.title, args.content, args.platform, args.tags)
        print(f"✓ Created post {pid}")
    elif args.cmd == "list":
        posts = sched.list_posts(args.status, args.platform)
        print(f"{'ID':<10} {'Platform':<12} {'Status':<10} {'Title'}")
        print("-" * 60)
        for p in posts:
            print(f"{p['id']:<10} {p['platform']:<12} {p['status']:<10} {p['title'][:30]}")
    elif args.cmd == "publish":
        sched.publish_post(args.post_id)
        print(f"✓ Published {args.post_id}")
    elif args.cmd == "stats":
        stats = sched.get_stats()
        print(json.dumps(stats, indent=2))
