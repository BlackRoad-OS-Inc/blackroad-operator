BlackRoad-OS-Inc/index

A local indexing and search system for the BlackRoad workspace.

Quickstart

1. Install Python deps: pip install -r requirements.txt
2. Index directories: python3 indexer.py --db ./index.db --paths /path/to/code /another/path
3. Start search server: python3 search_server.py --db ./index.db
4. Query: GET /search?q=your+terms (default port 8080)

Notes
- Use run_index.sh as a convenience wrapper to index common locations.
- For large codebases, run the indexer on a machine with sufficient disk and memory.
