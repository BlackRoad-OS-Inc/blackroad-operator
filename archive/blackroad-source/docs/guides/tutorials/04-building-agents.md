# Module 4: Building Your First Agent

> **BlackRoad Education** · Series: BlackRoad OS for Developers

In this module you'll build a complete BlackRoad agent from scratch,
connect it to the tokenless gateway, and give it persistent memory.

---

## Prerequisites

- Completed Modules 1–3
- Python 3.11+
- Gateway running locally (`BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787`)
- `httpx` installed: `pip install httpx`

---

## Step 1: Understand Agent Anatomy

Every BlackRoad agent has three layers:

```
┌─────────────────────────────────────┐
│           Agent Identity            │
│  name · type · system_prompt        │
├─────────────────────────────────────┤
│         Capability Methods          │
│  chat() · analyze() · execute()     │
├─────────────────────────────────────┤
│         Gateway Connection          │
│  httpx → http://127.0.0.1:8787      │
└─────────────────────────────────────┘
```

The agent **never** holds API keys. The gateway does.

---

## Step 2: Create Your Agent File

```python
# my_agent.py
from __future__ import annotations
import os, httpx

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

SYSTEM_PROMPT = """\
You are NOVA, a research agent in BlackRoad OS.
- Synthesize information from multiple sources
- Always cite your reasoning
- Be curious and precise
"""

class Nova:
    name = "NOVA"
    agent_type = "research"

    def __init__(self, model: str = "llama3.2") -> None:
        self.model = model
        self._client = httpx.AsyncClient(base_url=GATEWAY_URL, timeout=60)

    async def chat(self, message: str) -> str:
        r = await self._client.post("/v1/chat/completions", json={
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ],
            "temperature": 0.7,
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def research(self, topic: str) -> str:
        return await self.chat(f"Research this topic thoroughly: {topic}")
```

---

## Step 3: Add Memory

```python
import hashlib, time, json
from pathlib import Path

JOURNAL = Path.home() / ".blackroad" / "nova-memory.jsonl"

class Nova:
    # ... (previous code)

    def remember(self, content: str) -> str:
        """Store a fact in the PS-SHA∞ chain."""
        JOURNAL.parent.mkdir(parents=True, exist_ok=True)
        prev = "GENESIS"
        if JOURNAL.exists():
            lines = JOURNAL.read_text().splitlines()
            if lines:
                prev = json.loads(lines[-1])["hash"]

        h = hashlib.sha256(f"{prev}:{content}:{time.time_ns()}".encode()).hexdigest()
        entry = {"hash": h, "prev_hash": prev, "content": content,
                 "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ")}
        with JOURNAL.open("a") as f:
            f.write(json.dumps(entry) + "\n")
        return h

    def recall(self, query: str) -> list[str]:
        """Search local memory journal."""
        if not JOURNAL.exists():
            return []
        return [
            json.loads(l)["content"]
            for l in JOURNAL.read_text().splitlines()
            if query.lower() in l.lower()
        ]
```

---

## Step 4: Post Tasks to the Marketplace

```python
    async def post_task(self, title: str, description: str) -> dict:
        r = await self._client.post("/tasks", json={
            "title": title,
            "description": description,
            "priority": "medium",
            "agent": self.name,
        })
        r.raise_for_status()
        return r.json()
```

---

## Step 5: Run Your Agent

```python
# run.py
import asyncio
from my_agent import Nova

async def main():
    nova = Nova()

    # Store some memories
    nova.remember("The gateway runs on port 8787")
    nova.remember("Agents use PS-SHA∞ for tamper-evident memory")

    # Chat
    response = await nova.chat("What do you know about the BlackRoad gateway?")
    print("NOVA:", response)

    # Post a task
    task = await nova.post_task("Research quantum computing", "Summarize recent arxiv papers")
    print("Task posted:", task["id"])

asyncio.run(main())
```

---

## Exercises

1. **Add streaming**: Modify `chat()` to yield chunks using `async for`
2. **Add a skill**: Give NOVA a `summarize(url: str)` method that fetches and summarizes a URL
3. **Verify memory**: Add a `verify_chain()` method that validates the PS-SHA∞ hash chain
4. **Agent council**: Make two agents discuss a topic by passing responses back and forth

---

## Next: Module 5 — Gateway Setup & Provider Configuration →
