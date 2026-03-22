#!/usr/bin/env python3
"""Simple file indexer using SQLite + FTS5.

Features:
- Index files under given paths
- Update changed files using mtime/hash
- Search via FTS5 (or simple LIKE fallback)
"""
import argparse
import os
import sqlite3
import hashlib
import time
import sys

DEFAULT_DB = 'index.db'

CREATE_DOCS = '''
CREATE TABLE IF NOT EXISTS docs (
  id INTEGER PRIMARY KEY,
  path TEXT UNIQUE,
  mtime REAL,
  hash TEXT
);
'''

CREATE_FTS = '''
CREATE VIRTUAL TABLE IF NOT EXISTS docs_fts USING fts5(content, path UNINDEXED);
'''

def sha1_bytes(b):
    h = hashlib.sha1()
    h.update(b)
    return h.hexdigest()

def connect(db_path):
    conn = sqlite3.connect(db_path)
    conn.execute('PRAGMA journal_mode=WAL')
    return conn

def ensure_schema(conn):
    conn.executescript(CREATE_DOCS + '\n' + CREATE_FTS)
    conn.commit()


def index_paths(conn, paths, dry=False):
    cur = conn.cursor()
    for base in paths:
        for root, dirs, files in os.walk(base):
            for fn in files:
                path = os.path.join(root, fn)
                try:
                    st = os.stat(path)
                except Exception:
                    continue
                mtime = st.st_mtime
                # only index reasonable-sized files
                if st.st_size > 10 * 1024 * 1024:
                    continue
                try:
                    with open(path, 'rb') as f:
                        data = f.read()
                except Exception:
                    continue
                h = sha1_bytes(data)
                cur.execute('SELECT mtime, hash FROM docs WHERE path=?', (path,))
                row = cur.fetchone()
                if row and row[1] == h and abs(row[0] - mtime) < 1.0:
                    continue
                text = None
                try:
                    text = data.decode('utf-8')
                except Exception:
                    try:
                        text = data.decode('latin-1')
                    except Exception:
                        text = None
                if text is None:
                    continue
                print('Indexing', path)
                if not dry:
                    cur.execute('INSERT OR REPLACE INTO docs(path, mtime, hash) VALUES(?, ?, ?)', (path, mtime, h))
                    # upsert into FTS: delete old then insert
                    cur.execute('DELETE FROM docs_fts WHERE path=?', (path,))
                    cur.execute('INSERT INTO docs_fts(rowid, content, path) VALUES((SELECT id FROM docs WHERE path=?), ?, ?)', (path, text, path))
    conn.commit()


def search(conn, q, limit=20):
    cur = conn.cursor()
    try:
        cur.execute('SELECT path, snippet(docs_fts, 0, "", "", "...", 10) as snip FROM docs_fts WHERE docs_fts MATCH ? LIMIT ?', (q, limit))
        return cur.fetchall()
    except sqlite3.OperationalError:
        # FTS may not be available; fallback
        cur.execute('SELECT path FROM docs WHERE path LIKE ? LIMIT ?', ('%'+q+'%', limit))
        return cur.fetchall()


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--db', default=DEFAULT_DB)
    p.add_argument('--paths', nargs='*', default=['.'])
    p.add_argument('--index', action='store_true')
    p.add_argument('--search')
    p.add_argument('--dry', action='store_true')
    args = p.parse_args()

    conn = connect(args.db)
    ensure_schema(conn)

    if args.search:
        rows = search(conn, args.search)
        for r in rows:
            print(r)
        return

    if args.index or args.paths:
        index_paths(conn, args.paths, dry=args.dry)

if __name__ == '__main__':
    main()
