#!/usr/bin/env python3
"""
Public Records System — FOIA-style document management.
Supports publishing, searching, retracting, exporting document bundles,
and tracking FOIA requests. SQLite-backed.
"""
import argparse
import csv
import io
import json
import sqlite3
import sys
import uuid
import zipfile
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List

DB_PATH = Path.home() / ".blackroad" / "public_records.db"

VALID_CATEGORIES = (
    "budget", "minutes", "ordinance", "resolution", "contract",
    "policy", "report", "agenda", "notice", "permit", "audit",
    "correspondence", "other",
)
FOIA_STATUSES = ("open", "processing", "fulfilled", "denied", "withdrawn")


# ── Dataclasses ──────────────────────────────────────────────────────────────

@dataclass
class Document:
    id: str
    title: str
    category: str
    body: str
    tags: str         # comma-separated
    author: str
    created_at: str
    updated_at: str
    is_public: bool
    version: int

    def to_row(self):
        return (
            self.id, self.title, self.category, self.body, self.tags,
            self.author, self.created_at, self.updated_at,
            int(self.is_public), self.version,
        )

    @classmethod
    def from_row(cls, row) -> "Document":
        d = dict(row)
        d["is_public"] = bool(d["is_public"])
        return cls(**d)

    def tag_list(self) -> List[str]:
        return [t.strip() for t in self.tags.split(",") if t.strip()]


@dataclass
class FoiaRequest:
    id: str
    requester: str
    description: str
    status: str
    created_at: str
    updated_at: str
    response: str
    document_ids: str   # JSON list

    def to_row(self):
        return (
            self.id, self.requester, self.description, self.status,
            self.created_at, self.updated_at, self.response, self.document_ids,
        )

    @classmethod
    def from_row(cls, row) -> "FoiaRequest":
        return cls(**dict(row))


# ── Database ─────────────────────────────────────────────────────────────────

def get_db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS documents (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            category    TEXT NOT NULL,
            body        TEXT NOT NULL,
            tags        TEXT DEFAULT '',
            author      TEXT NOT NULL,
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL,
            is_public   INTEGER DEFAULT 0,
            version     INTEGER DEFAULT 1
        );
        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts
            USING fts5(id UNINDEXED, title, body, tags, content='documents', content_rowid='rowid');
        CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
            INSERT INTO documents_fts(rowid, id, title, body, tags)
            VALUES (new.rowid, new.id, new.title, new.body, new.tags);
        END;
        CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
            INSERT INTO documents_fts(documents_fts, rowid, id, title, body, tags)
            VALUES ('delete', old.rowid, old.id, old.title, old.body, old.tags);
        END;
        CREATE TABLE IF NOT EXISTS document_revisions (
            id          TEXT NOT NULL,
            version     INTEGER NOT NULL,
            title       TEXT NOT NULL,
            body        TEXT NOT NULL,
            edited_by   TEXT,
            edited_at   TEXT NOT NULL,
            PRIMARY KEY(id, version)
        );
        CREATE TABLE IF NOT EXISTS foia_requests (
            id           TEXT PRIMARY KEY,
            requester    TEXT NOT NULL,
            description  TEXT NOT NULL,
            status       TEXT NOT NULL DEFAULT 'open',
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL,
            response     TEXT DEFAULT '',
            document_ids TEXT DEFAULT '[]'
        );
    """)
    conn.commit()


# ── Core Document API ─────────────────────────────────────────────────────────

def create_document(
    title: str,
    category: str,
    body: str,
    author: str,
    tags: str = "",
    is_public: bool = False,
    db_path: Path = DB_PATH,
) -> Document:
    """Create a new document record (draft by default)."""
    if category not in VALID_CATEGORIES:
        raise ValueError(f"Unknown category '{category}'. Valid: {VALID_CATEGORIES}")
    conn = get_db(db_path)
    init_db(conn)
    now = datetime.now(timezone.utc).isoformat()
    doc = Document(
        id=str(uuid.uuid4())[:10],
        title=title,
        category=category,
        body=body,
        tags=tags,
        author=author,
        created_at=now,
        updated_at=now,
        is_public=is_public,
        version=1,
    )
    conn.execute("INSERT INTO documents VALUES (?,?,?,?,?,?,?,?,?,?)", doc.to_row())
    conn.commit()
    conn.close()
    return doc


def publish(doc_id: str, db_path: Path = DB_PATH) -> Document:
    """Mark a document as publicly accessible."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone()
    if not row:
        raise ValueError(f"Document '{doc_id}' not found.")
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "UPDATE documents SET is_public=1, updated_at=? WHERE id=?", (now, doc_id)
    )
    conn.commit()
    updated = Document.from_row(conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone())
    conn.close()
    return updated


def retract(doc_id: str, db_path: Path = DB_PATH) -> Document:
    """Remove public access to a document."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone()
    if not row:
        raise ValueError(f"Document '{doc_id}' not found.")
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "UPDATE documents SET is_public=0, updated_at=? WHERE id=?", (now, doc_id)
    )
    conn.commit()
    updated = Document.from_row(conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone())
    conn.close()
    return updated


def update_document(
    doc_id: str,
    title: Optional[str] = None,
    body: Optional[str] = None,
    tags: Optional[str] = None,
    editor: str = "system",
    db_path: Path = DB_PATH,
) -> Document:
    """Update document content and bump version, archiving the previous revision."""
    conn = get_db(db_path)
    init_db(conn)
    row = conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone()
    if not row:
        raise ValueError(f"Document '{doc_id}' not found.")
    old = Document.from_row(row)
    # Archive current version
    conn.execute(
        "INSERT OR IGNORE INTO document_revisions VALUES (?,?,?,?,?,?)",
        (old.id, old.version, old.title, old.body, editor,
         datetime.now(timezone.utc).isoformat()),
    )
    now = datetime.now(timezone.utc).isoformat()
    new_title = title if title is not None else old.title
    new_body = body if body is not None else old.body
    new_tags = tags if tags is not None else old.tags
    new_version = old.version + 1
    conn.execute(
        "UPDATE documents SET title=?, body=?, tags=?, updated_at=?, version=? WHERE id=?",
        (new_title, new_body, new_tags, now, new_version, doc_id),
    )
    conn.commit()
    updated = Document.from_row(conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone())
    conn.close()
    return updated


def get_document(doc_id: str, public_only: bool = False, db_path: Path = DB_PATH) -> Optional[Document]:
    conn = get_db(db_path)
    init_db(conn)
    if public_only:
        row = conn.execute(
            "SELECT * FROM documents WHERE id=? AND is_public=1", (doc_id,)
        ).fetchone()
    else:
        row = conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone()
    conn.close()
    return Document.from_row(row) if row else None


def search(
    query: str,
    category: Optional[str] = None,
    public_only: bool = True,
    db_path: Path = DB_PATH,
) -> List[Document]:
    """Full-text search across titles, body, and tags."""
    conn = get_db(db_path)
    init_db(conn)
    fts_query = f'"{query}"' if " " in query else query
    try:
        fts_rows = conn.execute(
            "SELECT id FROM documents_fts WHERE documents_fts MATCH ? ORDER BY rank",
            (fts_query,),
        ).fetchall()
        matched_ids = [r["id"] for r in fts_rows]
    except Exception:
        # Fallback: LIKE search
        matched_ids = [
            r["id"] for r in conn.execute(
                "SELECT id FROM documents WHERE title LIKE ? OR body LIKE ? OR tags LIKE ?",
                (f"%{query}%", f"%{query}%", f"%{query}%"),
            ).fetchall()
        ]

    results = []
    for doc_id in matched_ids:
        clauses = ["id=?"]
        params: list = [doc_id]
        if public_only:
            clauses.append("is_public=1")
        if category:
            clauses.append("category=?")
            params.append(category)
        row = conn.execute(
            f"SELECT * FROM documents WHERE {' AND '.join(clauses)}", params
        ).fetchone()
        if row:
            results.append(Document.from_row(row))
    conn.close()
    return results


def list_documents(
    category: Optional[str] = None,
    public_only: bool = False,
    db_path: Path = DB_PATH,
) -> List[Document]:
    conn = get_db(db_path)
    init_db(conn)
    clauses, params = [], []
    if category:
        clauses.append("category=?")
        params.append(category)
    if public_only:
        clauses.append("is_public=1")
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    rows = conn.execute(
        f"SELECT * FROM documents {where} ORDER BY created_at DESC", params
    ).fetchall()
    conn.close()
    return [Document.from_row(r) for r in rows]


def export_bundle(
    category: str,
    output_path: str,
    public_only: bool = True,
    db_path: Path = DB_PATH,
) -> str:
    """Export all documents in a category as a ZIP bundle (JSON + index.csv)."""
    docs = list_documents(category=category, public_only=public_only, db_path=db_path)
    if not docs:
        raise ValueError(f"No documents found for category '{category}'.")
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        index_rows = []
        for doc in docs:
            filename = f"{doc.id}_{doc.title[:40].replace(' ', '_')}.json"
            zf.writestr(filename, json.dumps(asdict(doc), indent=2))
            index_rows.append({
                "id": doc.id, "title": doc.title, "author": doc.author,
                "created_at": doc.created_at, "version": doc.version, "file": filename,
            })
        idx_buf = io.StringIO()
        w = csv.DictWriter(idx_buf, fieldnames=["id", "title", "author", "created_at", "version", "file"])
        w.writeheader()
        w.writerows(index_rows)
        zf.writestr("index.csv", idx_buf.getvalue())
    Path(output_path).write_bytes(out.getvalue())
    return output_path


# ── FOIA Request API ──────────────────────────────────────────────────────────

def submit_foia(
    requester: str, description: str, db_path: Path = DB_PATH
) -> FoiaRequest:
    conn = get_db(db_path)
    init_db(conn)
    now = datetime.now(timezone.utc).isoformat()
    req = FoiaRequest(
        id=str(uuid.uuid4())[:8],
        requester=requester,
        description=description,
        status="open",
        created_at=now,
        updated_at=now,
        response="",
        document_ids="[]",
    )
    conn.execute("INSERT INTO foia_requests VALUES (?,?,?,?,?,?,?,?)", req.to_row())
    conn.commit()
    conn.close()
    return req


def fulfill_foia(
    request_id: str,
    response: str,
    doc_ids: Optional[List[str]] = None,
    db_path: Path = DB_PATH,
) -> FoiaRequest:
    conn = get_db(db_path)
    init_db(conn)
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "UPDATE foia_requests SET status='fulfilled', response=?, document_ids=?, updated_at=? WHERE id=?",
        (response, json.dumps(doc_ids or []), now, request_id),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM foia_requests WHERE id=?", (request_id,)).fetchone()
    conn.close()
    if not row:
        raise ValueError(f"FOIA request '{request_id}' not found.")
    return FoiaRequest.from_row(row)


def list_foia(status: Optional[str] = None, db_path: Path = DB_PATH) -> List[FoiaRequest]:
    conn = get_db(db_path)
    init_db(conn)
    if status:
        rows = conn.execute(
            "SELECT * FROM foia_requests WHERE status=? ORDER BY created_at DESC", (status,)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM foia_requests ORDER BY created_at DESC").fetchall()
    conn.close()
    return [FoiaRequest.from_row(r) for r in rows]


# ── CLI ───────────────────────────────────────────────────────────────────────

def cmd_create(args):
    doc = create_document(
        args.title, args.category, args.body,
        args.author, args.tags or "",
        is_public="--public" in sys.argv,
    )
    print(json.dumps(asdict(doc), indent=2))


def cmd_publish(args):
    doc = publish(args.doc_id)
    print(f"✅ Document '{doc.id}' published.")


def cmd_retract(args):
    doc = retract(args.doc_id)
    print(f"✅ Document '{doc.id}' retracted.")


def cmd_get(args):
    doc = get_document(args.doc_id)
    if not doc:
        print(f"Document '{args.doc_id}' not found.", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(asdict(doc), indent=2))


def cmd_search(args):
    results = search(args.query, category=args.category or None)
    if not results:
        print("No documents found.")
        return
    for doc in results:
        pub = "🌐" if doc.is_public else "🔒"
        print(f"{pub} [{doc.id}] {doc.title} [{doc.category}] by {doc.author}")


def cmd_list(args):
    docs = list_documents(category=args.category or None, public_only=bool(args.public))
    if not docs:
        print("No documents found.")
        return
    for doc in docs:
        pub = "🌐" if doc.is_public else "🔒"
        print(f"{pub} [{doc.id}] v{doc.version} | {doc.title:<40} | [{doc.category}] | {doc.author}")


def cmd_export(args):
    path = export_bundle(args.category, args.output, public_only=not bool(args.all))
    print(f"✅ Bundle exported to {path}")


def cmd_foia_submit(args):
    req = submit_foia(args.requester, args.description)
    print(json.dumps(asdict(req), indent=2))


def cmd_foia_fulfill(args):
    req = fulfill_foia(args.request_id, args.response,
                       doc_ids=args.docs.split(",") if args.docs else [])
    print(json.dumps(asdict(req), indent=2))


def cmd_foia_list(args):
    reqs = list_foia(status=args.status or None)
    if not reqs:
        print("No FOIA requests.")
        return
    icons = {"open": "📬", "processing": "⚙️", "fulfilled": "✅",
             "denied": "❌", "withdrawn": "↩️"}
    for r in reqs:
        icon = icons.get(r.status, "❓")
        print(f"{icon} [{r.id}] {r.requester:<20} | {r.description[:50]} | {r.status}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="public_records",
        description="📂  Public Records System — FOIA-style document management",
    )
    sub = p.add_subparsers(dest="command", required=True)

    # create
    cr = sub.add_parser("create", help="Create a document")
    cr.add_argument("title")
    cr.add_argument("category", choices=VALID_CATEGORIES)
    cr.add_argument("author")
    cr.add_argument("--body", default="")
    cr.add_argument("--tags", default="")
    cr.add_argument("--public", action="store_true")
    cr.set_defaults(func=cmd_create)

    # publish
    pu = sub.add_parser("publish", help="Publish a document publicly")
    pu.add_argument("doc_id")
    pu.set_defaults(func=cmd_publish)

    # retract
    re = sub.add_parser("retract", help="Retract a document from public access")
    re.add_argument("doc_id")
    re.set_defaults(func=cmd_retract)

    # get
    gt = sub.add_parser("get", help="Get document by ID")
    gt.add_argument("doc_id")
    gt.set_defaults(func=cmd_get)

    # search
    sr = sub.add_parser("search", help="Full-text search")
    sr.add_argument("query")
    sr.add_argument("--category", choices=VALID_CATEGORIES)
    sr.set_defaults(func=cmd_search)

    # list
    ls = sub.add_parser("list", help="List documents")
    ls.add_argument("--category", choices=VALID_CATEGORIES)
    ls.add_argument("--public", action="store_true")
    ls.set_defaults(func=cmd_list)

    # export
    ex = sub.add_parser("export", help="Export category bundle as ZIP")
    ex.add_argument("category", choices=VALID_CATEGORIES)
    ex.add_argument("--output", required=True)
    ex.add_argument("--all", action="store_true", help="Include non-public docs")
    ex.set_defaults(func=cmd_export)

    # foia submit
    fs = sub.add_parser("foia-submit", help="Submit a FOIA request")
    fs.add_argument("requester")
    fs.add_argument("description")
    fs.set_defaults(func=cmd_foia_submit)

    # foia fulfill
    ff = sub.add_parser("foia-fulfill", help="Fulfill a FOIA request")
    ff.add_argument("request_id")
    ff.add_argument("response")
    ff.add_argument("--docs", help="Comma-separated doc IDs")
    ff.set_defaults(func=cmd_foia_fulfill)

    # foia list
    fl = sub.add_parser("foia-list", help="List FOIA requests")
    fl.add_argument("--status", choices=list(FOIA_STATUSES))
    fl.set_defaults(func=cmd_foia_list)

    return p


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except (ValueError, RuntimeError) as exc:
        print(f"❌ Error: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
