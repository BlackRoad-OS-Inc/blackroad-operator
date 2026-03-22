#!/usr/bin/env python3
"""Background RAG indexer — runs continuously, writes progress to file.

Usage: python3 index-background.py [--start-from N]
Progress: tail -f ~/.blackroad-rag/index-progress.txt
"""

import importlib.util
import json
import os
import sys
import time
from pathlib import Path

# Load RAG engine
spec = importlib.util.spec_from_file_location("rag_engine", Path(__file__).parent / "rag-engine.py")
rag = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rag)

PROGRESS_FILE = Path(__file__).parent / "index-progress.txt"
META_FILE = Path(__file__).parent / "embedding-meta.json"


def log(msg):
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(PROGRESS_FILE, "a") as f:
        f.write(line + "\n")


def main():
    start_from = 0
    if "--start-from" in sys.argv:
        idx = sys.argv.index("--start-from")
        start_from = int(sys.argv[idx + 1])

    log("BlackRoad RAG Background Indexer starting")
    log(f"  Ollama: {rag.OLLAMA_HOST}")
    log(f"  Qdrant: {rag.QDRANT_HOST}")

    # Ensure collection exists
    rag.ensure_collection()

    # Check current state
    status = rag.get_status()
    current_points = status.get("points", 0)
    log(f"  Current points in Qdrant: {current_points}")

    # Load chunks
    chunks = rag.load_chunks()
    total = len(chunks)
    log(f"  Total chunks: {total}")

    # Determine start point
    if start_from > 0:
        offset = start_from
    else:
        offset = current_points

    if offset >= total:
        log("All chunks already indexed!")
        return

    remaining = chunks[offset:]
    log(f"  Indexing from ID {offset}, {len(remaining)} remaining")

    # Index in small batches with progress logging
    batch_size = 16
    indexed_total = 0
    errors_total = 0
    start_time = time.time()

    for batch_start in range(0, len(remaining), batch_size):
        batch = remaining[batch_start:batch_start + batch_size]

        try:
            texts = []
            for chunk in batch:
                text = f"{chunk.get('repo', '')}/{chunk.get('file', '')}:{chunk.get('line', 0)}\n{chunk.get('content', '')}"
                texts.append(text)

            embeddings = rag.get_embeddings_batch(texts)

            points = []
            for i, (chunk, embedding) in enumerate(zip(batch, embeddings)):
                point_id = offset + batch_start + i
                points.append({
                    "id": point_id,
                    "vector": embedding,
                    "payload": {
                        "repo": chunk.get("repo", ""),
                        "file": chunk.get("file", ""),
                        "line": chunk.get("line", 0),
                        "type": chunk.get("type", ""),
                        "content": chunk.get("content", "")[:2000],
                    },
                })

            rag.qdrant_request(f"/collections/{rag.COLLECTION}/points", {
                "points": points,
            }, method="PUT")

            indexed_total += len(batch)
        except Exception as e:
            errors_total += len(batch)
            log(f"  ERROR at batch {batch_start}: {e}")
            time.sleep(5)  # Back off on error
            continue

        elapsed = time.time() - start_time
        rate = indexed_total / elapsed if elapsed > 0 else 0
        pct = (offset + batch_start + len(batch)) / total * 100
        eta_hours = (total - offset - batch_start - len(batch)) / rate / 3600 if rate > 0 else 0

        if (batch_start % (batch_size * 10)) == 0 or batch_start + batch_size >= len(remaining):
            log(f"  Progress: {offset + batch_start + len(batch)}/{total} ({pct:.1f}%) | {rate:.2f}/s | ETA: {eta_hours:.1f}h | Errors: {errors_total}")

    # Save metadata
    meta = {
        "model": rag.EMBED_MODEL,
        "dimensions": rag.EMBED_DIM,
        "ollama_host": rag.OLLAMA_HOST,
        "qdrant_host": rag.QDRANT_HOST,
        "collection": rag.COLLECTION,
        "total_indexed": offset + indexed_total,
        "last_indexed": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    with open(META_FILE, "w") as f:
        json.dump(meta, f, indent=2)

    log(f"Done! Indexed {indexed_total} chunks, {errors_total} errors")


if __name__ == "__main__":
    main()
