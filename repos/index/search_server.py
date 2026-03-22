#!/usr/bin/env python3
"""Small Flask server to query the index.db created by indexer.py
"""
from flask import Flask, request, jsonify
import sqlite3
import argparse

app = Flask('blackroad_index')
DB = 'index.db'

def get_conn(path):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/search')
def search():
    q = request.args.get('q','').strip()
    if not q:
        return jsonify([])
    limit = int(request.args.get('limit', '20'))
    conn = get_conn(app.config['DB'])
    cur = conn.cursor()
    try:
        cur.execute('SELECT path, snippet(docs_fts, 0, "", "", "...", 10) as snippet FROM docs_fts WHERE docs_fts MATCH ? LIMIT ?', (q, limit))
        rows = [dict(r) for r in cur.fetchall()]
    except Exception:
        cur.execute('SELECT path FROM docs WHERE path LIKE ? LIMIT ?', ('%'+q+'%', limit))
        rows = [{'path': r[0]} for r in cur.fetchall()]
    return jsonify(rows)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--db', default=DB)
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=8080)
    args = parser.parse_args()
    app.config['DB'] = args.db
    app.run(host=args.host, port=args.port)
