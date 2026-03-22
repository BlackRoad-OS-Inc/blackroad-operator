#!/usr/bin/env python3
"""BlackRoad RAG API — HTTP service for semantic code search and retrieval.

Provides a REST API for querying the RAG index, generating context for LLMs,
and managing the index lifecycle.

Usage:
    python3 rag-api.py                  # Start on port 8900
    python3 rag-api.py --port 9000      # Custom port

Endpoints:
    GET  /health              — Health check
    GET  /status              — Index statistics
    POST /search              — Semantic search
    POST /context             — Generate RAG context for LLM prompts
    POST /embed               — Get embedding for text
    POST /index/add           — Add a document to the index
    POST /index/repo          — Index an entire repo directory
"""

import json
import os
import sys
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse, parse_qs

# Import the RAG engine (same directory)
sys.path.insert(0, str(Path(__file__).parent))
from importlib import import_module

# We'll use rag_engine functions directly
import importlib.util
spec = importlib.util.spec_from_file_location("rag_engine", Path(__file__).parent / "rag-engine.py")
rag = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rag)

# Load moral context module
moral_spec = importlib.util.spec_from_file_location("moral_context", Path(__file__).parent / "moral-context.py")
moral = importlib.util.module_from_spec(moral_spec)
moral_spec.loader.exec_module(moral)

# Load academic sources module
academic_spec = importlib.util.spec_from_file_location("academic_sources", Path(__file__).parent / "academic-sources.py")
academic = importlib.util.module_from_spec(academic_spec)
academic_spec.loader.exec_module(academic)

PORT = int(os.environ.get("RAG_API_PORT", "8900"))
BIND = os.environ.get("RAG_API_BIND", "0.0.0.0")


class RAGHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the RAG API."""

    def _send_json(self, data: Any, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        body = self.rfile.read(length)
        return json.loads(body.decode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/health":
            self._send_json({"status": "ok", "service": "blackroad-rag-api", "time": time.time()})

        elif path == "/status":
            status = rag.get_status()
            # Add chunk file info
            if rag.CHUNKS_FILE.exists():
                status["chunks_file_size_mb"] = round(rag.CHUNKS_FILE.stat().st_size / 1024 / 1024, 1)
            meta_file = rag.RAG_DIR / "embedding-meta.json"
            if meta_file.exists():
                status["embedding_meta"] = json.loads(meta_file.read_text())
            self._send_json(status)

        else:
            self._send_json({"error": "not found"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path

        try:
            body = self._read_body()
        except (json.JSONDecodeError, ValueError) as e:
            self._send_json({"error": f"Invalid JSON: {e}"}, 400)
            return

        if path == "/search":
            query = body.get("query", "")
            if not query:
                self._send_json({"error": "query required"}, 400)
                return

            top_k = body.get("top_k", 10)
            repo = body.get("repo")
            file_type = body.get("type")

            try:
                results = rag.search(query, top_k=top_k, repo_filter=repo, type_filter=file_type)
                self._send_json({"results": results, "query": query, "count": len(results)})
            except RuntimeError as e:
                self._send_json({"error": str(e)}, 500)

        elif path == "/context":
            # Generate RAG context suitable for injecting into LLM prompts
            query = body.get("query", "")
            if not query:
                self._send_json({"error": "query required"}, 400)
                return

            top_k = body.get("top_k", 5)
            max_tokens = body.get("max_tokens", 4000)
            repo = body.get("repo")

            try:
                results = rag.search(query, top_k=top_k, repo_filter=repo)

                # Build context string
                context_parts = []
                total_chars = 0
                char_limit = max_tokens * 4  # Rough chars-to-tokens ratio

                for r in results:
                    entry = f"### {r['repo']}/{r['file']}:{r['line']} (score: {r['score']:.3f})\n```{r['type']}\n{r['content']}\n```\n"
                    if total_chars + len(entry) > char_limit:
                        break
                    context_parts.append(entry)
                    total_chars += len(entry)

                context = "\n".join(context_parts)

                # Enrich with moral context (equality preamble + accessibility)
                enriched = moral.enrich_context(context, query)

                # Check for inclusive language issues in results
                inclusive_notes = moral.check_inclusive_language(context)

                self._send_json({
                    "context": enriched,
                    "sources": [
                        {"repo": r["repo"], "file": r["file"], "line": r["line"], "score": r["score"]}
                        for r in results[:len(context_parts)]
                    ],
                    "query": query,
                    "inclusive_language_notes": inclusive_notes if inclusive_notes else None,
                })
            except RuntimeError as e:
                self._send_json({"error": str(e)}, 500)

        elif path == "/verify":
            # Verify a claim against the codebase with academic rigor
            claim = body.get("claim", "")
            if not claim:
                self._send_json({"error": "claim required"}, 400)
                return
            top_k = body.get("top_k", 10)
            try:
                results = rag.search(claim, top_k=top_k)
                report = academic.verify_claim(claim, results)
                self._send_json(report)
            except RuntimeError as e:
                self._send_json({"error": str(e)}, 500)

        elif path == "/cite":
            # Get citations for a query in specified style
            query = body.get("query", "")
            style = body.get("style", "academic")  # inline, academic, markdown
            if not query:
                self._send_json({"error": "query required"}, 400)
                return
            top_k = body.get("top_k", 10)
            try:
                results = rag.search(query, top_k=top_k)
                citations = academic.format_citations(results, query, style=style)
                chain = academic.build_source_chain(results, query, enrich=(style == "academic"))
                self._send_json({
                    "citations": citations,
                    "confidence": chain.overall_confidence,
                    "cross_references": chain.cross_references,
                    "verification_notes": chain.verification_notes,
                })
            except RuntimeError as e:
                self._send_json({"error": str(e)}, 500)

        elif path == "/embed":
            text = body.get("text", "")
            if not text:
                self._send_json({"error": "text required"}, 400)
                return
            try:
                embedding = rag.get_embedding(text)
                self._send_json({"embedding": embedding, "dimensions": len(embedding)})
            except RuntimeError as e:
                self._send_json({"error": str(e)}, 500)

        elif path == "/index/add":
            # Add a single document
            content = body.get("content", "")
            repo = body.get("repo", "manual")
            file_path = body.get("file", "unknown")
            line = body.get("line", 0)
            file_type = body.get("type", "text")

            if not content:
                self._send_json({"error": "content required"}, 400)
                return

            try:
                embedding = rag.get_embedding(f"{repo}/{file_path}:{line}\n{content}")

                # Get next available ID
                status = rag.get_status()
                point_id = status.get("points", 0)

                rag.qdrant_request(f"/collections/{rag.COLLECTION}/points", {
                    "points": [{
                        "id": point_id,
                        "vector": embedding,
                        "payload": {
                            "repo": repo,
                            "file": file_path,
                            "line": line,
                            "type": file_type,
                            "content": content[:2000],
                        },
                    }],
                }, method="PUT")

                self._send_json({"indexed": True, "id": point_id})
            except RuntimeError as e:
                self._send_json({"error": str(e)}, 500)

        else:
            self._send_json({"error": "not found"}, 404)

    def log_message(self, format, *args):
        # Compact logging
        print(f"[RAG] {args[0]} {args[1]}" if len(args) >= 2 else f"[RAG] {format % args}")


def main():
    port = PORT
    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        port = int(sys.argv[idx + 1])

    server = HTTPServer((BIND, port), RAGHandler)
    print(f"\033[38;5;205mBlackRoad RAG API\033[0m")
    print(f"  Listening on {BIND}:{port}")
    print(f"  Qdrant:  {rag.QDRANT_HOST}")
    print(f"  Ollama:  {rag.OLLAMA_HOST}")
    print(f"  Model:   {rag.EMBED_MODEL}")
    print()
    print(f"  Endpoints:")
    print(f"    GET  /health")
    print(f"    GET  /status")
    print(f"    POST /search   {{\"query\": \"...\", \"top_k\": 10}}")
    print(f"    POST /context  {{\"query\": \"...\", \"max_tokens\": 4000}}")
    print(f"    POST /embed    {{\"text\": \"...\"}}")
    print(f"    POST /index/add {{\"content\": \"...\", \"repo\": \"...\"}}")
    print()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
