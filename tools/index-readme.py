#!/usr/bin/env python3
"""
Index BLACKROADREADME.txt into a searchable FTS5 SQLite database.
Splits the 5MB file into chunks by blank-line-separated blocks,
stores each with line numbers, and provides full-text search.

Usage:
  python3 index-readme.py build              # Build/rebuild the index
  python3 index-readme.py search "query"     # Search the index
  python3 index-readme.py stats              # Show index stats
"""
import sqlite3
import sys
import os
import re

SOURCE = os.path.expanduser("~/Desktop/BLACKROADREADME.txt")
DB_PATH = os.path.expanduser("~/.blackroad/readme-index.db")

def build():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("DROP TABLE IF EXISTS chunks")
    c.execute("DROP TABLE IF EXISTS chunks_fts")
    c.execute("""
        CREATE TABLE chunks (
            id INTEGER PRIMARY KEY,
            line_start INTEGER,
            line_end INTEGER,
            content TEXT
        )
    """)
    c.execute("""
        CREATE VIRTUAL TABLE chunks_fts USING fts5(
            content,
            content='chunks',
            content_rowid='id',
            tokenize='porter unicode61'
        )
    """)

    with open(SOURCE, "r", errors="replace") as f:
        lines = f.readlines()

    # Split into chunks: groups of non-empty lines separated by 2+ blank lines
    chunks = []
    current_lines = []
    current_start = 1
    blank_count = 0

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped == "":
            blank_count += 1
            if blank_count >= 2 and current_lines:
                text = "".join(current_lines).strip()
                if len(text) > 20:  # skip tiny fragments
                    chunks.append((current_start, i - blank_count, text))
                current_lines = []
                current_start = i + 1
            continue
        else:
            if blank_count == 1 and current_lines:
                current_lines.append("\n")
            blank_count = 0
            current_lines.append(line)

    # Last chunk
    if current_lines:
        text = "".join(current_lines).strip()
        if len(text) > 20:
            chunks.append((current_start, len(lines), text))

    # If chunks are too large (>2000 chars), split them further
    final_chunks = []
    for start, end, text in chunks:
        if len(text) <= 2000:
            final_chunks.append((start, end, text))
        else:
            # Split by lines into ~1500 char sub-chunks
            sub_lines = text.split("\n")
            buf = []
            buf_start = start
            buf_len = 0
            for j, sl in enumerate(sub_lines):
                buf.append(sl)
                buf_len += len(sl) + 1
                if buf_len > 1500:
                    final_chunks.append((buf_start, buf_start + len(buf), "\n".join(buf)))
                    buf_start = buf_start + len(buf)
                    buf = []
                    buf_len = 0
            if buf:
                final_chunks.append((buf_start, end, "\n".join(buf)))

    c.executemany("INSERT INTO chunks (line_start, line_end, content) VALUES (?, ?, ?)", final_chunks)
    c.execute("""
        INSERT INTO chunks_fts (rowid, content)
        SELECT id, content FROM chunks
    """)
    conn.commit()
    print(f"Indexed {len(final_chunks)} chunks from {len(lines)} lines ({os.path.getsize(SOURCE) / 1024 / 1024:.1f}MB)")
    print(f"Database: {DB_PATH} ({os.path.getsize(DB_PATH) / 1024:.0f}KB)")
    conn.close()

def search(query):
    if not os.path.exists(DB_PATH):
        print("Index not built. Run: python3 index-readme.py build")
        return
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # FTS5 search with snippet
    c.execute("""
        SELECT c.line_start, c.line_end,
               snippet(chunks_fts, 0, '>>>', '<<<', '...', 40) as snip,
               rank
        FROM chunks_fts
        JOIN chunks c ON c.id = chunks_fts.rowid
        WHERE chunks_fts MATCH ?
        ORDER BY rank
        LIMIT 20
    """, (query,))

    results = c.fetchall()
    if not results:
        print(f"No results for: {query}")
        conn.close()
        return

    print(f"Found {len(results)} results for: {query}\n")
    for i, (start, end, snip, rank) in enumerate(results, 1):
        # Clean up snippet markers
        snip = snip.replace(">>>", "\033[1m").replace("<<<", "\033[0m")
        snip = re.sub(r'\s+', ' ', snip).strip()
        print(f"  [{i}] Lines {start}-{end}")
        print(f"      {snip}")
        print()

    conn.close()

def stats():
    if not os.path.exists(DB_PATH):
        print("Index not built. Run: python3 index-readme.py build")
        return
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*), MIN(line_start), MAX(line_end) FROM chunks")
    count, min_l, max_l = c.fetchone()
    c.execute("SELECT SUM(LENGTH(content)) FROM chunks")
    total_bytes = c.fetchone()[0]
    print(f"Chunks: {count}")
    print(f"Lines:  {min_l} - {max_l}")
    print(f"Text:   {total_bytes / 1024 / 1024:.1f}MB indexed")
    print(f"DB:     {os.path.getsize(DB_PATH) / 1024:.0f}KB")
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 index-readme.py [build|search|stats] [query]")
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == "build":
        build()
    elif cmd == "search":
        if len(sys.argv) < 3:
            print("Usage: python3 index-readme.py search \"query\"")
            sys.exit(1)
        search(" ".join(sys.argv[2:]))
    elif cmd == "stats":
        stats()
    else:
        print(f"Unknown command: {cmd}")
