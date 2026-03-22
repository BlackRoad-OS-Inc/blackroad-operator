#!/usr/bin/env python3
"""BlackRoad RAG Engine — unified embedding, indexing, and retrieval.

Uses Ollama (nomic-embed-text) for embeddings and Qdrant for vector storage.
Indexes code chunks from all repos for semantic code search.

Usage:
    python3 rag-engine.py index          # Index all code chunks into Qdrant
    python3 rag-engine.py search "query" # Semantic search
    python3 rag-engine.py status         # Show index stats
    python3 rag-engine.py reindex        # Drop and rebuild index
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import List, Dict, Any, Optional

# Configuration
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://192.168.4.96:11434")
QDRANT_HOST = os.environ.get("QDRANT_HOST", "http://192.168.4.49:6333")
EMBED_MODEL = os.environ.get("EMBED_MODEL", "nomic-embed-text")
COLLECTION = os.environ.get("RAG_COLLECTION", "blackroad-code")
EMBED_DIM = 768
BATCH_SIZE = 32
RAG_DIR = Path.home() / ".blackroad-rag"
CHUNKS_FILE = RAG_DIR / "code-chunks.jsonl"

# Colors
PINK = "\033[38;5;205m"
GREEN = "\033[38;5;82m"
CYAN = "\033[38;5;69m"
AMBER = "\033[38;5;214m"
RESET = "\033[0m"


def api_request(url: str, data: Optional[dict] = None, method: str = None) -> dict:
    """Make an HTTP request and return JSON response."""
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode() if data else None
    if method is None:
        method = "POST" if body else "GET"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ""
        raise RuntimeError(f"HTTP {e.code} from {url}: {error_body}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Connection failed to {url}: {e.reason}")


def get_embedding(text: str) -> List[float]:
    """Get embedding vector from Ollama."""
    resp = api_request(f"{OLLAMA_HOST}/api/embeddings", {
        "model": EMBED_MODEL,
        "prompt": text[:8000],  # Truncate to avoid token limits
    })
    return resp["embedding"]


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Get embeddings for a batch of texts (sequential, Ollama doesn't batch)."""
    embeddings = []
    for text in texts:
        embeddings.append(get_embedding(text))
    return embeddings


def qdrant_request(path: str, data: Optional[dict] = None, method: str = "GET") -> dict:
    """Make a request to Qdrant."""
    return api_request(f"{QDRANT_HOST}{path}", data, method)


def ensure_collection():
    """Create Qdrant collection if it doesn't exist."""
    try:
        resp = qdrant_request(f"/collections/{COLLECTION}")
        if resp.get("status") == "ok":
            return False  # Already exists
    except RuntimeError:
        pass

    qdrant_request(f"/collections/{COLLECTION}", {
        "vectors": {
            "size": EMBED_DIM,
            "distance": "Cosine",
        },
        "optimizers_config": {
            "indexing_threshold": 10000,
        },
    }, method="PUT")

    # Create payload indices for filtering
    for field in ["repo", "file", "type"]:
        qdrant_request(f"/collections/{COLLECTION}/index", {
            "field_name": field,
            "field_schema": "keyword",
        }, method="PUT")

    qdrant_request(f"/collections/{COLLECTION}/index", {
        "field_name": "line",
        "field_schema": "integer",
    }, method="PUT")

    return True  # Created new


def load_chunks() -> List[Dict[str, Any]]:
    """Load code chunks from JSONL file."""
    chunks = []
    with open(CHUNKS_FILE) as f:
        for line in f:
            line = line.strip()
            if line:
                chunks.append(json.loads(line))
    return chunks


def index_chunks(chunks: List[Dict[str, Any]], start_id: int = 0):
    """Index chunks into Qdrant with embeddings."""
    total = len(chunks)
    indexed = 0
    errors = 0
    start_time = time.time()

    for batch_start in range(0, total, BATCH_SIZE):
        batch = chunks[batch_start:batch_start + BATCH_SIZE]
        texts = []
        for chunk in batch:
            # Build embedding text: include file context for better retrieval
            text = f"{chunk.get('repo', '')}/{chunk.get('file', '')}:{chunk.get('line', 0)}\n{chunk.get('content', '')}"
            texts.append(text)

        try:
            embeddings = get_embeddings_batch(texts)
        except RuntimeError as e:
            print(f"  {AMBER}Embedding error at batch {batch_start}: {e}{RESET}")
            errors += len(batch)
            continue

        # Build Qdrant points
        points = []
        for i, (chunk, embedding) in enumerate(zip(batch, embeddings)):
            point_id = start_id + batch_start + i
            points.append({
                "id": point_id,
                "vector": embedding,
                "payload": {
                    "repo": chunk.get("repo", ""),
                    "file": chunk.get("file", ""),
                    "line": chunk.get("line", 0),
                    "type": chunk.get("type", ""),
                    "content": chunk.get("content", "")[:2000],  # Cap payload size
                },
            })

        try:
            qdrant_request(f"/collections/{COLLECTION}/points", {
                "points": points,
            }, method="PUT")
            indexed += len(batch)
        except RuntimeError as e:
            print(f"  {AMBER}Qdrant error at batch {batch_start}: {e}{RESET}")
            errors += len(batch)

        elapsed = time.time() - start_time
        rate = indexed / elapsed if elapsed > 0 else 0
        pct = (batch_start + len(batch)) / total * 100
        print(f"\r  {GREEN}Indexed: {indexed}/{total} ({pct:.1f}%) | {rate:.1f} chunks/s | Errors: {errors}{RESET}", end="", flush=True)

    print()
    return indexed, errors


def search(query: str, top_k: int = 10, repo_filter: Optional[str] = None,
           type_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """Semantic search across indexed code."""
    query_embedding = get_embedding(query)

    search_params: Dict[str, Any] = {
        "vector": query_embedding,
        "limit": top_k,
        "with_payload": True,
    }

    # Build filters
    conditions = []
    if repo_filter:
        conditions.append({
            "key": "repo",
            "match": {"value": repo_filter},
        })
    if type_filter:
        conditions.append({
            "key": "type",
            "match": {"value": type_filter},
        })

    if conditions:
        search_params["filter"] = {"must": conditions}

    resp = qdrant_request(f"/collections/{COLLECTION}/points/search", search_params, method="POST")

    results = []
    for point in resp.get("result", []):
        payload = point.get("payload", {})
        results.append({
            "score": point.get("score", 0),
            "repo": payload.get("repo", ""),
            "file": payload.get("file", ""),
            "line": payload.get("line", 0),
            "type": payload.get("type", ""),
            "content": payload.get("content", ""),
        })

    return results


def get_status() -> Dict[str, Any]:
    """Get collection status from Qdrant."""
    try:
        resp = qdrant_request(f"/collections/{COLLECTION}")
        info = resp.get("result", {})
        return {
            "exists": True,
            "points": info.get("points_count", 0),
            "indexed": info.get("indexed_vectors_count", 0),
            "segments": info.get("segments_count", 0),
            "status": info.get("status", "unknown"),
            "disk_mb": round(info.get("disk_data_size", 0) / 1024 / 1024, 1),
            "ram_mb": round(info.get("ram_data_size", 0) / 1024 / 1024, 1),
        }
    except RuntimeError:
        return {"exists": False, "points": 0}


def delete_collection():
    """Delete the Qdrant collection."""
    try:
        qdrant_request(f"/collections/{COLLECTION}", method="DELETE")
        return True
    except RuntimeError:
        return False


def cmd_index():
    """Index all code chunks."""
    print(f"{PINK}BlackRoad RAG Engine — Indexing{RESET}")
    print(f"  Ollama: {OLLAMA_HOST} ({EMBED_MODEL})")
    print(f"  Qdrant: {QDRANT_HOST} (collection: {COLLECTION})")
    print()

    # Test connectivity
    try:
        get_embedding("test")
        print(f"  {GREEN}✓ Ollama embedding OK{RESET}")
    except RuntimeError as e:
        print(f"  {AMBER}✗ Ollama failed: {e}{RESET}")
        sys.exit(1)

    try:
        qdrant_request("/collections")
        print(f"  {GREEN}✓ Qdrant OK{RESET}")
    except RuntimeError as e:
        print(f"  {AMBER}✗ Qdrant failed: {e}{RESET}")
        sys.exit(1)

    # Load chunks
    if not CHUNKS_FILE.exists():
        print(f"  {AMBER}No chunks file at {CHUNKS_FILE}{RESET}")
        sys.exit(1)

    chunks = load_chunks()
    print(f"  {CYAN}Loaded {len(chunks)} chunks from {CHUNKS_FILE.name}{RESET}")

    # Check existing index
    status = get_status()
    if status["exists"] and status["points"] > 0:
        print(f"  {AMBER}Collection already has {status['points']} points. Use 'reindex' to rebuild.{RESET}")
        # Only index new chunks
        start_id = status["points"]
        if start_id >= len(chunks):
            print(f"  {GREEN}All chunks already indexed.{RESET}")
            return
        chunks = chunks[start_id:]
        print(f"  {CYAN}Indexing {len(chunks)} new chunks (starting at ID {start_id}){RESET}")
    else:
        start_id = 0
        created = ensure_collection()
        if created:
            print(f"  {GREEN}Created collection '{COLLECTION}'{RESET}")

    print()
    indexed, errors = index_chunks(chunks, start_id=start_id)

    print()
    print(f"  {GREEN}Done! Indexed {indexed} chunks, {errors} errors{RESET}")

    # Save embedding metadata
    meta = {
        "model": EMBED_MODEL,
        "dimensions": EMBED_DIM,
        "ollama_host": OLLAMA_HOST,
        "qdrant_host": QDRANT_HOST,
        "collection": COLLECTION,
        "total_indexed": start_id + indexed,
        "last_indexed": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    with open(RAG_DIR / "embedding-meta.json", "w") as f:
        json.dump(meta, f, indent=2)


def cmd_search(query: str, top_k: int = 10, repo: Optional[str] = None,
               file_type: Optional[str] = None):
    """Search and display results."""
    print(f"{PINK}BlackRoad RAG Search{RESET}")
    print(f"  Query: {CYAN}{query}{RESET}")
    if repo:
        print(f"  Repo filter: {repo}")
    if file_type:
        print(f"  Type filter: {file_type}")
    print()

    results = search(query, top_k=top_k, repo_filter=repo, type_filter=file_type)

    if not results:
        print(f"  {AMBER}No results found.{RESET}")
        return

    for i, r in enumerate(results, 1):
        score_color = GREEN if r["score"] > 0.7 else AMBER if r["score"] > 0.5 else RESET
        print(f"  {PINK}{i}.{RESET} [{score_color}{r['score']:.3f}{RESET}] {CYAN}{r['repo']}/{r['file']}:{r['line']}{RESET}")
        # Show first 3 lines of content
        lines = r["content"].strip().split("\n")[:3]
        for line in lines:
            print(f"     {line}")
        print()


def cmd_status():
    """Show index status."""
    print(f"{PINK}BlackRoad RAG Status{RESET}")

    # Check Ollama
    try:
        emb = get_embedding("test")
        print(f"  {GREEN}✓ Ollama{RESET}: {OLLAMA_HOST} ({EMBED_MODEL}, {len(emb)}d)")
    except (RuntimeError, Exception) as e:
        print(f"  {AMBER}✗ Ollama{RESET}: {OLLAMA_HOST} ({e})")

    # Check Qdrant
    try:
        qdrant_request("/collections")
        print(f"  {GREEN}✓ Qdrant{RESET}: {QDRANT_HOST}")
    except RuntimeError:
        print(f"  {AMBER}✗ Qdrant{RESET}: {QDRANT_HOST} (unreachable)")

    # Collection info
    status = get_status()
    if status["exists"]:
        print(f"  {GREEN}✓ Collection{RESET}: {COLLECTION}")
        print(f"    Points:   {status['points']}")
        print(f"    Indexed:  {status['indexed']}")
        print(f"    Segments: {status['segments']}")
        print(f"    Status:   {status['status']}")
        print(f"    Disk:     {status['disk_mb']} MB")
        print(f"    RAM:      {status['ram_mb']} MB")
    else:
        print(f"  {AMBER}✗ Collection{RESET}: {COLLECTION} (not found)")

    # Chunks file
    if CHUNKS_FILE.exists():
        chunk_count = sum(1 for _ in open(CHUNKS_FILE))
        size_mb = CHUNKS_FILE.stat().st_size / 1024 / 1024
        print(f"  {GREEN}✓ Chunks{RESET}: {chunk_count} ({size_mb:.1f} MB)")
    else:
        print(f"  {AMBER}✗ Chunks{RESET}: not found")

    # Embedding metadata
    meta_file = RAG_DIR / "embedding-meta.json"
    if meta_file.exists():
        meta = json.loads(meta_file.read_text())
        print(f"  {GREEN}✓ Last indexed{RESET}: {meta.get('last_indexed', 'unknown')}")
        print(f"    Total indexed: {meta.get('total_indexed', 0)}")


def cmd_reindex():
    """Drop and rebuild the entire index."""
    print(f"{PINK}BlackRoad RAG — Full Reindex{RESET}")
    print(f"  {AMBER}Dropping collection '{COLLECTION}'...{RESET}")
    delete_collection()
    print(f"  {GREEN}Dropped.{RESET}")
    print()
    cmd_index()


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "index":
        cmd_index()
    elif cmd == "search":
        query = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
        if not query:
            print("Usage: rag-engine.py search <query> [--repo NAME] [--type python|javascript] [--top N]")
            sys.exit(1)
        # Parse optional flags
        repo = None
        file_type = None
        top_k = 10
        args = sys.argv[2:]
        query_parts = []
        i = 0
        while i < len(args):
            if args[i] == "--repo" and i + 1 < len(args):
                repo = args[i + 1]
                i += 2
            elif args[i] == "--type" and i + 1 < len(args):
                file_type = args[i + 1]
                i += 2
            elif args[i] == "--top" and i + 1 < len(args):
                top_k = int(args[i + 1])
                i += 2
            else:
                query_parts.append(args[i])
                i += 1
        cmd_search(" ".join(query_parts), top_k=top_k, repo=repo, file_type=file_type)
    elif cmd == "status":
        cmd_status()
    elif cmd == "reindex":
        cmd_reindex()
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
