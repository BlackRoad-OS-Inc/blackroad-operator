"""
vLLM MVP — High-performance inference server wrapper with model loading,
request batching, and streaming responses.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import time
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import Iterator, List, Optional

# ── ANSI colours ─────────────────────────────────────────────────────────────
R = "\033[0;31m"; G = "\033[0;32m"; Y = "\033[1;33m"
C = "\033[0;36m"; B = "\033[0;34m"; M = "\033[0;35m"; NC = "\033[0m"
BOLD = "\033[1m"

DB_PATH = Path.home() / ".blackroad" / "vllm_mvp.db"


# ── Data models ───────────────────────────────────────────────────────────────
@dataclass
class ModelConfig:
    model_id: str
    name: str
    max_tokens: int = 2048
    temperature: float = 0.7
    top_p: float = 0.9
    dtype: str = "float16"
    quantization: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class InferenceRequest:
    request_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    model_id: str = ""
    prompt: str = ""
    max_tokens: int = 256
    temperature: float = 0.7
    stream: bool = False
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class InferenceResponse:
    request_id: str
    model_id: str
    text: str
    tokens_generated: int
    latency_ms: float
    finish_reason: str = "stop"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class BatchRequest:
    batch_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    requests: List[InferenceRequest] = field(default_factory=list)
    priority: int = 1
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


# ── Core class ────────────────────────────────────────────────────────────────
class VLLMInferenceServer:
    """Production vLLM inference server wrapper."""

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._models: dict[str, ModelConfig] = {}
        self._request_queue: List[InferenceRequest] = []
        self._conn = sqlite3.connect(str(self.db_path))
        self._init_db()

    # ── persistence ───────────────────────────────────────────────────────────
    def _init_db(self) -> None:
        self._conn.executescript("""
            CREATE TABLE IF NOT EXISTS models (
                model_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                config_json TEXT NOT NULL,
                loaded_at TEXT
            );
            CREATE TABLE IF NOT EXISTS requests (
                request_id TEXT PRIMARY KEY,
                model_id TEXT,
                prompt TEXT,
                response_json TEXT,
                latency_ms REAL,
                created_at TEXT
            );
            CREATE TABLE IF NOT EXISTS batches (
                batch_id TEXT PRIMARY KEY,
                request_count INTEGER,
                total_tokens INTEGER,
                avg_latency_ms REAL,
                completed_at TEXT
            );
        """)
        self._conn.commit()

    # ── model management ──────────────────────────────────────────────────────
    def load_model(self, config: ModelConfig) -> None:
        """Register and load a model configuration."""
        self._models[config.model_id] = config
        self._conn.execute(
            "INSERT OR REPLACE INTO models VALUES (?, ?, ?, ?)",
            (config.model_id, config.name, json.dumps(asdict(config)),
             datetime.utcnow().isoformat())
        )
        self._conn.commit()
        print(f"{G}✓{NC} Model {BOLD}{config.name}{NC} loaded "
              f"[id={C}{config.model_id}{NC}]")

    def list_models(self) -> List[ModelConfig]:
        """Return all registered models."""
        rows = self._conn.execute(
            "SELECT config_json FROM models ORDER BY loaded_at DESC"
        ).fetchall()
        return [ModelConfig(**json.loads(r[0])) for r in rows]

    # ── inference ─────────────────────────────────────────────────────────────
    def submit_request(self, req: InferenceRequest) -> InferenceResponse:
        """Process a single inference request (simulated)."""
        if req.model_id not in self._models and not self._models:
            raise ValueError(f"Model '{req.model_id}' not loaded. Run load_model() first.")

        t0 = time.perf_counter()
        # Simulate token generation
        words = req.prompt.split()
        simulated_tokens = min(req.max_tokens, max(10, len(words) * 3))
        generated = f"[{req.model_id}] " + " ".join(
            f"token_{i}" for i in range(simulated_tokens)
        )
        latency = (time.perf_counter() - t0) * 1000 + simulated_tokens * 0.5

        resp = InferenceResponse(
            request_id=req.request_id,
            model_id=req.model_id,
            text=generated,
            tokens_generated=simulated_tokens,
            latency_ms=round(latency, 2),
        )
        self._conn.execute(
            "INSERT OR REPLACE INTO requests VALUES (?, ?, ?, ?, ?, ?)",
            (req.request_id, req.model_id, req.prompt,
             json.dumps(asdict(resp)), resp.latency_ms, req.created_at)
        )
        self._conn.commit()
        return resp

    def batch_inference(self, batch: BatchRequest) -> List[InferenceResponse]:
        """Process a batch of inference requests concurrently (simulated)."""
        print(f"{C}⚡{NC} Processing batch {BOLD}{batch.batch_id}{NC} "
              f"({len(batch.requests)} requests, priority={batch.priority})")
        responses = []
        total_tokens = 0
        t0 = time.perf_counter()
        for req in batch.requests:
            resp = self.submit_request(req)
            responses.append(resp)
            total_tokens += resp.tokens_generated
        avg_latency = (time.perf_counter() - t0) * 1000 / max(len(batch.requests), 1)
        self._conn.execute(
            "INSERT OR REPLACE INTO batches VALUES (?, ?, ?, ?, ?)",
            (batch.batch_id, len(batch.requests), total_tokens,
             round(avg_latency, 2), datetime.utcnow().isoformat())
        )
        self._conn.commit()
        print(f"{G}✓{NC} Batch complete: {total_tokens} tokens, "
              f"avg {avg_latency:.1f}ms/req")
        return responses

    def stream_response(self, req: InferenceRequest) -> Iterator[str]:
        """Yield response tokens one by one (simulated streaming)."""
        resp = self.submit_request(req)
        tokens = resp.text.split()
        for tok in tokens:
            yield tok + " "
            time.sleep(0.01)

    def get_stats(self) -> dict:
        """Return aggregate server statistics."""
        row = self._conn.execute(
            "SELECT COUNT(*), AVG(latency_ms), SUM(CAST(json_extract(response_json,'$.tokens_generated') AS INTEGER)) "
            "FROM requests"
        ).fetchone()
        models_loaded = self._conn.execute("SELECT COUNT(*) FROM models").fetchone()[0]
        batches_run = self._conn.execute("SELECT COUNT(*) FROM batches").fetchone()[0]
        return {
            "total_requests": row[0] or 0,
            "avg_latency_ms": round(row[1] or 0, 2),
            "total_tokens": row[2] or 0,
            "models_loaded": models_loaded,
            "batches_run": batches_run,
        }

    def close(self) -> None:
        self._conn.close()


# ── CLI ───────────────────────────────────────────────────────────────────────
def _print_stats(stats: dict) -> None:
    print(f"\n{BOLD}{B}── vLLM Server Stats ──────────────────{NC}")
    for k, v in stats.items():
        print(f"  {C}{k:<20}{NC} {Y}{v}{NC}")


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="vllm-mvp",
        description="BlackRoad vLLM MVP — inference server wrapper",
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    # serve
    srv = sub.add_parser("serve", help="Start server with a model")
    srv.add_argument("--model-id", default="llama3-8b")
    srv.add_argument("--name", default="LLaMA-3 8B")
    srv.add_argument("--max-tokens", type=int, default=2048)
    srv.add_argument("--dtype", default="float16")

    # infer
    inf = sub.add_parser("infer", help="Run single inference")
    inf.add_argument("--model-id", default="llama3-8b")
    inf.add_argument("--prompt", required=True)
    inf.add_argument("--max-tokens", type=int, default=128)
    inf.add_argument("--stream", action="store_true")

    # batch
    bat = sub.add_parser("batch", help="Run batch inference")
    bat.add_argument("--model-id", default="llama3-8b")
    bat.add_argument("--prompts", nargs="+", required=True)
    bat.add_argument("--priority", type=int, default=1)

    # stats
    sub.add_parser("stats", help="Show server statistics")

    # models
    sub.add_parser("models", help="List loaded models")

    args = parser.parse_args()
    server = VLLMInferenceServer()

    try:
        if args.cmd == "serve":
            cfg = ModelConfig(
                model_id=args.model_id, name=args.name,
                max_tokens=args.max_tokens, dtype=args.dtype,
            )
            server.load_model(cfg)
            print(f"{G}Server ready.{NC} Press Ctrl+C to stop.")
            while True:
                time.sleep(1)

        elif args.cmd == "infer":
            req = InferenceRequest(
                model_id=args.model_id, prompt=args.prompt,
                max_tokens=args.max_tokens, stream=args.stream,
            )
            if args.stream:
                print(f"{C}Streaming:{NC} ", end="", flush=True)
                for tok in server.stream_response(req):
                    print(tok, end="", flush=True)
                print()
            else:
                resp = server.submit_request(req)
                print(f"\n{G}Response [{resp.request_id}]{NC}")
                print(f"  {resp.text[:200]}")
                print(f"  {Y}{resp.tokens_generated} tokens, {resp.latency_ms}ms{NC}")

        elif args.cmd == "batch":
            reqs = [
                InferenceRequest(model_id=args.model_id, prompt=p)
                for p in args.prompts
            ]
            batch = BatchRequest(requests=reqs, priority=args.priority)
            responses = server.batch_inference(batch)
            for resp in responses:
                print(f"  {C}{resp.request_id}{NC} → {resp.tokens_generated} tokens "
                      f"in {resp.latency_ms}ms")

        elif args.cmd == "stats":
            _print_stats(server.get_stats())

        elif args.cmd == "models":
            models = server.list_models()
            if not models:
                print(f"{Y}No models loaded.{NC}")
            for m in models:
                print(f"  {C}{m.model_id:<20}{NC} {m.name:<30} dtype={m.dtype}")

    except KeyboardInterrupt:
        print(f"\n{Y}Server stopped.{NC}")
    finally:
        server.close()


if __name__ == "__main__":
    main()
