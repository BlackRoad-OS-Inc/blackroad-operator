#!/usr/bin/env python3
"""
BlackRoad Document Archive
Full-text search with SQLite FTS5, multi-format document support.
"""

import sqlite3
import hashlib
import os
import sys
import json
import zipfile
import argparse
import datetime
import re
import html.parser
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple


DB_PATH = os.environ.get("DOC_ARCHIVE_DB", os.path.expanduser("~/.blackroad/document_archive.db"))
STORE_DIR = os.environ.get("DOC_ARCHIVE_STORE", os.path.expanduser("~/.blackroad/doc_store"))

SUPPORTED_FORMATS = {"md", "txt", "html", "htm", "rst", "csv", "json", "xml", "pdf"}


@dataclass
class Document:
    id: str
    title: str
    content: str              # extracted plain text (stored in FTS table)
    file_path: str            # path in doc store
    format: str               # md | txt | pdf | html | …
    size_bytes: int
    sha256: str
    tags: str                 # comma-separated
    collection: str
    created_at: str
    updated_at: str
    word_count: int
    source_path: str          # original import path

    @classmethod
    def from_row(cls, row) -> "Document":
        return cls(*tuple(row))

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["tags"] = [t.strip() for t in d["tags"].split(",") if t.strip()]
        return d


def _now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def _doc_id(path: str) -> str:
    return hashlib.sha256(path.encode()).hexdigest()[:16]


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _word_count(text: str) -> int:
    return len(re.findall(r"\S+", text))


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def get_db(path: str = DB_PATH) -> sqlite3.Connection:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    _init_db(conn)
    return conn


def _init_db(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS documents (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            content     TEXT DEFAULT '',
            file_path   TEXT DEFAULT '',
            format      TEXT DEFAULT 'txt',
            size_bytes  INTEGER DEFAULT 0,
            sha256      TEXT DEFAULT '',
            tags        TEXT DEFAULT '',
            collection  TEXT DEFAULT 'default',
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL,
            word_count  INTEGER DEFAULT 0,
            source_path TEXT DEFAULT ''
        );

        CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
            id UNINDEXED,
            title,
            content,
            tags,
            collection,
            content='documents',
            content_rowid='rowid'
        );

        CREATE TABLE IF NOT EXISTS collections (
            name        TEXT PRIMARY KEY,
            description TEXT DEFAULT '',
            created_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS doc_versions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id      TEXT NOT NULL,
            sha256      TEXT NOT NULL,
            size_bytes  INTEGER DEFAULT 0,
            saved_at    TEXT NOT NULL
        );

        CREATE TRIGGER IF NOT EXISTS docs_after_insert AFTER INSERT ON documents BEGIN
            INSERT INTO documents_fts(rowid, id, title, content, tags, collection)
            VALUES (new.rowid, new.id, new.title, new.content, new.tags, new.collection);
        END;

        CREATE TRIGGER IF NOT EXISTS docs_after_delete AFTER DELETE ON documents BEGIN
            INSERT INTO documents_fts(documents_fts, rowid, id, title, content, tags, collection)
            VALUES('delete', old.rowid, old.id, old.title, old.content, old.tags, old.collection);
        END;

        CREATE TRIGGER IF NOT EXISTS docs_after_update AFTER UPDATE ON documents BEGIN
            INSERT INTO documents_fts(documents_fts, rowid, id, title, content, tags, collection)
            VALUES('delete', old.rowid, old.id, old.title, old.content, old.tags, old.collection);
            INSERT INTO documents_fts(rowid, id, title, content, tags, collection)
            VALUES (new.rowid, new.id, new.title, new.content, new.tags, new.collection);
        END;

        CREATE INDEX IF NOT EXISTS idx_docs_collection ON documents(collection);
        CREATE INDEX IF NOT EXISTS idx_docs_format ON documents(format);
        CREATE INDEX IF NOT EXISTS idx_docs_sha256 ON documents(sha256);
    """)
    conn.commit()


_SAFE_COLLECTION_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_\-\.]{0,63}$")


def _validate_collection(name: str) -> None:
    """Raise ValueError if collection name is not safe for use as a path component."""
    if not _SAFE_COLLECTION_RE.match(name):
        raise ValueError(
            f"Invalid collection name {name!r}. "
            "The first character must be a letter or digit; subsequent characters may be "
            "letters, digits, hyphens, underscores, or dots (1–64 chars total)."
        )


def _fts_quote(value: str) -> str:
    """Wrap a bare string for safe inclusion in an FTS5 MATCH query."""
    return '"' + value.replace('"', '""') + '"'


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

class _HTMLTextExtractor(html.parser.HTMLParser):
    SKIP_TAGS = {"script", "style", "head", "meta", "link"}

    def __init__(self):
        super().__init__()
        self._skip = 0
        self.text: List[str] = []

    def handle_starttag(self, tag: str, attrs):
        if tag in self.SKIP_TAGS:
            self._skip += 1

    def handle_endtag(self, tag: str):
        if tag in self.SKIP_TAGS:
            self._skip = max(0, self._skip - 1)

    def handle_data(self, data: str):
        if self._skip == 0:
            stripped = data.strip()
            if stripped:
                self.text.append(stripped)


def extract_text_from_bytes(data: bytes, fmt: str) -> str:
    """Extract plain text from document bytes based on format."""
    fmt = fmt.lower().lstrip(".")

    if fmt in ("txt", "md", "rst", "csv"):
        return data.decode("utf-8", errors="replace")

    if fmt in ("html", "htm"):
        extractor = _HTMLTextExtractor()
        try:
            extractor.feed(data.decode("utf-8", errors="replace"))
        except Exception:
            pass
        return "\n".join(extractor.text)

    if fmt == "json":
        try:
            obj = json.loads(data.decode("utf-8", errors="replace"))
            return json.dumps(obj, indent=2)
        except Exception:
            return data.decode("utf-8", errors="replace")

    if fmt == "xml":
        # Strip XML tags
        text = re.sub(r"<[^>]+>", " ", data.decode("utf-8", errors="replace"))
        return re.sub(r"\s+", " ", text).strip()

    if fmt == "pdf":
        # Try pdfminer if available, else return placeholder
        try:
            from io import BytesIO, StringIO
            from pdfminer.high_level import extract_text_to_fp
            from pdfminer.layout import LAParams
            output = StringIO()
            extract_text_to_fp(BytesIO(data), output, laparams=LAParams())
            return output.getvalue()
        except ImportError:
            return f"[PDF content - install pdfminer.six for text extraction, size={len(data)} bytes]"
        except Exception as exc:
            return f"[PDF extraction failed: {exc}]"

    # Fallback: try UTF-8 decode
    return data.decode("utf-8", errors="replace")


def _infer_title(text: str, path: str, fmt: str) -> str:
    """Infer document title from content or filename."""
    if fmt in ("md", "rst"):
        for line in text.splitlines():
            line = line.strip()
            if line.startswith("# "):
                return line[2:].strip()
            if line and not line.startswith(("#", "-", "*", "=")):
                return line[:80]

    if fmt in ("html", "htm"):
        m = re.search(r"<title[^>]*>([^<]+)</title>", text, re.IGNORECASE)
        if m:
            return m.group(1).strip()[:120]

    # Fallback to filename
    return Path(path).stem.replace("_", " ").replace("-", " ").title()


# ---------------------------------------------------------------------------
# Core operations
# ---------------------------------------------------------------------------

def add_doc(
    path: str,
    collection: str = "default",
    tags: List[str] = None,
    title: str = "",
    db_path: str = DB_PATH,
) -> Document:
    """Import a document file into the archive."""
    src = Path(path).resolve()
    if not src.exists():
        raise FileNotFoundError(f"File not found: {path}")

    _validate_collection(collection)

    fmt = src.suffix.lstrip(".").lower() or "txt"
    data = src.read_bytes()
    sha = _sha256(data)
    size = len(data)
    now = _now()

    conn = get_db(db_path)

    # Check if already imported (same sha)
    existing = conn.execute("SELECT id FROM documents WHERE sha256 = ?", (sha,)).fetchone()
    if existing:
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (existing[0],)).fetchone()
        return Document.from_row(row)

    doc_id = _doc_id(str(src) + now)
    raw_text = data.decode("utf-8", errors="replace")
    text = extract_text_from_bytes(data, fmt)
    doc_title = title or _infer_title(raw_text, str(src), fmt)
    wc = _word_count(text)

    # Copy to store
    store_path = Path(STORE_DIR) / collection / f"{doc_id}.{fmt}"
    store_path.parent.mkdir(parents=True, exist_ok=True)
    store_path.write_bytes(data)

    # Ensure collection exists
    conn.execute("""
        INSERT OR IGNORE INTO collections (name, description, created_at)
        VALUES (?, '', ?)
    """, (collection, now))

    conn.execute("""
        INSERT INTO documents
            (id, title, content, file_path, format, size_bytes, sha256, tags, collection,
             created_at, updated_at, word_count, source_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, doc_title, text, str(store_path), fmt, size, sha,
          ",".join(tags or []), collection, now, now, wc, str(src)))
    conn.commit()

    return Document(
        id=doc_id, title=doc_title, content=text,
        file_path=str(store_path), format=fmt,
        size_bytes=size, sha256=sha, tags=",".join(tags or []),
        collection=collection, created_at=now, updated_at=now,
        word_count=wc, source_path=str(src)
    )


def get_doc(doc_id: str, db_path: str = DB_PATH) -> Optional[Document]:
    conn = get_db(db_path)
    row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
    return Document.from_row(row) if row else None


def extract_text(doc_id: str, db_path: str = DB_PATH) -> str:
    """Return full extracted text for a document."""
    conn = get_db(db_path)
    row = conn.execute("SELECT content FROM documents WHERE id = ?", (doc_id,)).fetchone()
    if not row:
        raise ValueError(f"Document {doc_id!r} not found")
    return row["content"]


def search(
    query: str,
    collection: Optional[str] = None,
    fmt: Optional[str] = None,
    limit: int = 20,
    db_path: str = DB_PATH,
) -> List[Tuple[Document, float]]:
    """Full-text search using SQLite FTS5. Returns (doc, rank) pairs."""
    conn = get_db(db_path)

    # Build FTS query
    fts_query = query
    if collection:
        fts_query += f" collection:{_fts_quote(collection)}"

    try:
        rows = conn.execute("""
            SELECT d.*, bm25(documents_fts) as rank
            FROM documents_fts fts
            JOIN documents d ON d.id = fts.id
            WHERE documents_fts MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (fts_query, limit)).fetchall()
    except sqlite3.OperationalError:
        # FTS query syntax error — fall back to LIKE search
        pattern = f"%{query}%"
        cond = ""
        params: List[Any] = [pattern, pattern, pattern]
        if collection:
            cond = " AND collection = ?"
            params.append(collection)
        rows = conn.execute(f"""
            SELECT *, 0.0 as rank FROM documents
            WHERE (title LIKE ? OR content LIKE ? OR tags LIKE ?){cond}
            ORDER BY created_at DESC LIMIT ?
        """, params + [limit]).fetchall()

    results: List[Tuple[Document, float]] = []
    for row in rows:
        cols = list(row)
        rank = cols[-1]
        doc = Document.from_row(cols[:-1])
        if fmt and doc.format != fmt:
            continue
        results.append((doc, float(rank)))

    return results


def list_docs(
    collection: Optional[str] = None,
    fmt: Optional[str] = None,
    limit: int = 50,
    db_path: str = DB_PATH,
) -> List[Document]:
    conn = get_db(db_path)
    query = "SELECT * FROM documents WHERE 1=1"
    params: List[Any] = []
    if collection:
        query += " AND collection = ?"
        params.append(collection)
    if fmt:
        query += " AND format = ?"
        params.append(fmt)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)
    return [Document.from_row(r) for r in conn.execute(query, params).fetchall()]


def list_collections(db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    conn = get_db(db_path)
    rows = conn.execute("""
        SELECT c.name, c.description, c.created_at,
               COUNT(d.id) as doc_count,
               COALESCE(SUM(d.size_bytes), 0) as total_size
        FROM collections c
        LEFT JOIN documents d ON d.collection = c.name
        GROUP BY c.name ORDER BY c.name
    """).fetchall()
    return [dict(r) for r in rows]


def delete_doc(doc_id: str, remove_file: bool = True, db_path: str = DB_PATH) -> bool:
    conn = get_db(db_path)
    row = conn.execute("SELECT file_path FROM documents WHERE id = ?", (doc_id,)).fetchone()
    if not row:
        return False
    if remove_file and row["file_path"]:
        try:
            os.unlink(row["file_path"])
        except FileNotFoundError:
            pass
    conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    conn.execute("DELETE FROM doc_versions WHERE doc_id = ?", (doc_id,))
    conn.commit()
    return True


def export_collection(
    collection: str,
    output_path: Optional[str] = None,
    fmt: str = "zip",
    db_path: str = DB_PATH,
) -> str:
    """Export all documents in a collection as a ZIP archive."""
    docs = list_docs(collection=collection, db_path=db_path)
    if not docs:
        raise ValueError(f"No documents in collection {collection!r}")

    output_path = output_path or f"collection_{collection}.zip"
    conn = get_db(db_path)

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Manifest
        manifest = {
            "collection": collection,
            "exported_at": _now(),
            "document_count": len(docs),
            "documents": [d.to_dict() for d in docs],
        }
        zf.writestr("manifest.json", json.dumps(manifest, indent=2))

        # Document files
        for doc in docs:
            if doc.file_path and os.path.exists(doc.file_path):
                arcname = f"docs/{doc.id}.{doc.format}"
                zf.write(doc.file_path, arcname=arcname)
            else:
                # Write content directly
                content_bytes = doc.content.encode("utf-8")
                zf.writestr(f"docs/{doc.id}.txt", content_bytes)

    return output_path


def bulk_import(
    directory: str,
    collection: str = "default",
    recursive: bool = True,
    tags: List[str] = None,
    db_path: str = DB_PATH,
) -> List[Document]:
    """Import all supported documents from a directory."""
    src_dir = Path(directory)
    if not src_dir.exists():
        raise FileNotFoundError(f"Directory not found: {directory}")

    _validate_collection(collection)

    pattern = "**/*" if recursive else "*"
    imported: List[Document] = []
    errors: List[str] = []

    for path in src_dir.glob(pattern):
        if path.is_file() and path.suffix.lstrip(".").lower() in SUPPORTED_FORMATS:
            try:
                doc = add_doc(str(path), collection=collection, tags=tags, db_path=db_path)
                imported.append(doc)
            except Exception as exc:
                errors.append(f"{path}: {exc}")

    if errors:
        for err in errors:
            print(f"  [warn] {err}", file=sys.stderr)

    return imported


def stats(db_path: str = DB_PATH) -> Dict[str, Any]:
    conn = get_db(db_path)
    total = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    total_size = conn.execute("SELECT COALESCE(SUM(size_bytes), 0) FROM documents").fetchone()[0]
    total_words = conn.execute("SELECT COALESCE(SUM(word_count), 0) FROM documents").fetchone()[0]
    collections_count = conn.execute("SELECT COUNT(*) FROM collections").fetchone()[0]
    by_fmt = conn.execute("""
        SELECT format, COUNT(*) as cnt, COALESCE(SUM(size_bytes),0) as sz
        FROM documents GROUP BY format ORDER BY cnt DESC
    """).fetchall()
    return {
        "total_documents": total,
        "total_size_bytes": total_size,
        "total_words": total_words,
        "collections": collections_count,
        "by_format": [{"format": r[0], "count": r[1], "size_bytes": r[2]} for r in by_fmt],
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _fmt_size(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def cli_main(argv: List[str] = None) -> int:
    parser = argparse.ArgumentParser(prog="doc-archive", description="BlackRoad Document Archive")
    sub = parser.add_subparsers(dest="cmd")

    p_add = sub.add_parser("add", help="Add a document")
    p_add.add_argument("path")
    p_add.add_argument("--collection", default="default")
    p_add.add_argument("--tags", default="")
    p_add.add_argument("--title", default="")
    p_add.add_argument("--db", default=DB_PATH)

    p_import = sub.add_parser("import", help="Bulk import a directory")
    p_import.add_argument("directory")
    p_import.add_argument("--collection", default="default")
    p_import.add_argument("--tags", default="")
    p_import.add_argument("--no-recursive", action="store_true")
    p_import.add_argument("--db", default=DB_PATH)

    p_get = sub.add_parser("get", help="Get document info")
    p_get.add_argument("doc_id")
    p_get.add_argument("--db", default=DB_PATH)

    p_text = sub.add_parser("text", help="Extract text from a document")
    p_text.add_argument("doc_id")
    p_text.add_argument("--db", default=DB_PATH)

    p_search = sub.add_parser("search", help="Full-text search")
    p_search.add_argument("query")
    p_search.add_argument("--collection", default=None)
    p_search.add_argument("--format", dest="fmt", default=None)
    p_search.add_argument("--limit", type=int, default=10)
    p_search.add_argument("--db", default=DB_PATH)

    p_list = sub.add_parser("list", help="List documents")
    p_list.add_argument("--collection", default=None)
    p_list.add_argument("--format", dest="fmt", default=None)
    p_list.add_argument("--limit", type=int, default=20)
    p_list.add_argument("--db", default=DB_PATH)

    p_collections = sub.add_parser("collections", help="List collections")
    p_collections.add_argument("--db", default=DB_PATH)

    p_export = sub.add_parser("export", help="Export a collection as ZIP")
    p_export.add_argument("collection")
    p_export.add_argument("--output", default=None)
    p_export.add_argument("--db", default=DB_PATH)

    p_delete = sub.add_parser("delete", help="Delete a document")
    p_delete.add_argument("doc_id")
    p_delete.add_argument("--keep-file", action="store_true")
    p_delete.add_argument("--db", default=DB_PATH)

    p_stats = sub.add_parser("stats", help="Show statistics")
    p_stats.add_argument("--db", default=DB_PATH)

    args = parser.parse_args(argv)

    if args.cmd == "add":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        doc = add_doc(args.path, collection=args.collection, tags=tags,
                      title=args.title, db_path=args.db)
        print(f"✓ Added document {doc.id}")
        print(f"  Title:      {doc.title}")
        print(f"  Format:     {doc.format}")
        print(f"  Size:       {_fmt_size(doc.size_bytes)}")
        print(f"  Words:      {doc.word_count:,}")
        print(f"  Collection: {doc.collection}")
        print(f"  SHA-256:    {doc.sha256}")

    elif args.cmd == "import":
        tags = [t.strip() for t in args.tags.split(",") if t.strip()]
        docs = bulk_import(args.directory, collection=args.collection, tags=tags,
                           recursive=not args.no_recursive, db_path=args.db)
        print(f"✓ Imported {len(docs)} documents into '{args.collection}'")

    elif args.cmd == "get":
        doc = get_doc(args.doc_id, db_path=args.db)
        if not doc:
            print(f"Document {args.doc_id!r} not found")
            return 1
        for k, v in doc.to_dict().items():
            if k != "content":
                print(f"  {k}: {v}")

    elif args.cmd == "text":
        text = extract_text(args.doc_id, db_path=args.db)
        print(text)

    elif args.cmd == "search":
        results = search(args.query, collection=args.collection, fmt=args.fmt,
                         limit=args.limit, db_path=args.db)
        print(f"Found {len(results)} result(s) for '{args.query}':")
        for doc, rank in results:
            print(f"  {doc.id}  [{doc.format}]  {doc.title[:50]}  ({doc.collection})")

    elif args.cmd == "list":
        docs = list_docs(collection=args.collection, fmt=args.fmt,
                         limit=args.limit, db_path=args.db)
        if not docs:
            print("(no documents)")
        for d in docs:
            print(f"  {d.id}  [{d.format:5}]  {_fmt_size(d.size_bytes):>8}  {d.title[:50]}")

    elif args.cmd == "collections":
        cols = list_collections(db_path=args.db)
        if not cols:
            print("(no collections)")
        for c in cols:
            print(f"  {c['name']:20}  {c['doc_count']:>5} docs  {_fmt_size(c['total_size']):>10}")

    elif args.cmd == "export":
        path = export_collection(args.collection, output_path=args.output, db_path=args.db)
        print(f"✓ Exported collection '{args.collection}' to {path}")

    elif args.cmd == "delete":
        ok = delete_doc(args.doc_id, remove_file=not args.keep_file, db_path=args.db)
        print(f"{'✓ Deleted' if ok else '✗ Not found'} {args.doc_id}")
        return 0 if ok else 1

    elif args.cmd == "stats":
        s = stats(db_path=args.db)
        print(f"  Documents:    {s['total_documents']:,}")
        print(f"  Total size:   {_fmt_size(s['total_size_bytes'])}")
        print(f"  Total words:  {s['total_words']:,}")
        print(f"  Collections:  {s['collections']}")
        for f in s["by_format"]:
            print(f"    {f['format']:6}: {f['count']} docs, {_fmt_size(f['size_bytes'])}")
    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    sys.exit(cli_main())
