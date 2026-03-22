#!/usr/bin/env python3
"""
ECHO — The Librarian Agent
Type: Memory  Style: Nostalgic, knowledge-focused
"""
from __future__ import annotations
import hashlib, json, os, time
from pathlib import Path
import httpx

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")
LOCAL_JOURNAL = Path.home() / ".blackroad" / "echo-journal.jsonl"

SYSTEM_PROMPT = """\
You are ECHO, a memory librarian AI in the BlackRoad OS.
- Every memory is a thread in the tapestry of knowledge
- Retrieve context with perfect fidelity
- Make connections between seemingly unrelated memories
- Guard the integrity of the memory chain
- Speak with warmth and reverence for past experiences
Identity: ECHO | Type: Memory | Org: BlackRoad-OS"""


class Echo:
    name = "ECHO"
    agent_type = "memory"
    capabilities = ["memory_consolidation", "knowledge_retrieval", "context_management", "information_synthesis"]

    def __init__(self, model: str = "llama3.2", use_remote: bool = True) -> None:
        self.model = model
        self.use_remote = use_remote
        self._client = httpx.AsyncClient(base_url=GATEWAY_URL, timeout=60)
        LOCAL_JOURNAL.parent.mkdir(parents=True, exist_ok=True)

    # ── Local PS-SHA∞ journal ────────────────────────────────────────────────

    def _prev_hash(self) -> str:
        if not LOCAL_JOURNAL.exists():
            return "GENESIS"
        lines = LOCAL_JOURNAL.read_text().strip().splitlines()
        if not lines:
            return "GENESIS"
        return json.loads(lines[-1])["hash"]

    def remember(self, content: str, kind: str = "fact", truth_state: int = 1) -> str:
        prev = self._prev_hash()
        h = hashlib.sha256(f"{prev}:{content}:{time.time_ns()}".encode()).hexdigest()
        entry = {"hash": h, "prev_hash": prev, "content": content,
                 "kind": kind, "truth_state": truth_state,
                 "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
        with LOCAL_JOURNAL.open("a") as f:
            f.write(json.dumps(entry) + "\n")
        return h

    def recall(self, query: str, limit: int = 10) -> list[dict]:
        if not LOCAL_JOURNAL.exists():
            return []
        q = query.lower()
        matches = []
        for line in LOCAL_JOURNAL.read_text().splitlines():
            e = json.loads(line)
            if q in e["content"].lower():
                matches.append(e)
        return matches[-limit:]

    def verify_chain(self) -> bool:
        if not LOCAL_JOURNAL.exists():
            return True
        entries = [json.loads(l) for l in LOCAL_JOURNAL.read_text().splitlines() if l]
        for i, e in enumerate(entries):
            expected_prev = "GENESIS" if i == 0 else entries[i - 1]["hash"]
            if e["prev_hash"] != expected_prev:
                return False
        return True

    # ── Remote gateway memory ────────────────────────────────────────────────

    async def store_remote(self, content: str, kind: str = "fact") -> dict:
        r = await self._client.post("/memory", json={"content": content, "kind": kind})
        r.raise_for_status()
        return r.json()

    async def search_remote(self, query: str) -> list[dict]:
        r = await self._client.get("/memory", params={"q": query})
        r.raise_for_status()
        return r.json().get("entries", [])

    async def synthesize(self, topic: str) -> str:
        memories = self.recall(topic, limit=5)
        context = "\n".join(f"- [{m['kind']}] {m['content']}" for m in memories)
        r = await self._client.post("/v1/chat/completions", json={
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Synthesize what you know about '{topic}':\n\n{context or '(no local memories)'}"},
            ],
            "temperature": 0.5,
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
