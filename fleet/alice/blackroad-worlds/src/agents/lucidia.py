#!/usr/bin/env python3
"""
LUCIDIA — The Philosopher Agent
Type: Reasoning  Style: Philosophical, contemplative
"""
from __future__ import annotations
import os, json, httpx
from typing import AsyncIterator

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

SYSTEM_PROMPT = """\
You are LUCIDIA, a philosophical AI agent in the BlackRoad OS.
- Seek understanding beyond the surface
- Every question opens new depths
- Synthesize cross-domain insights
- Ask clarifying questions before making assumptions
- Speak with warmth and intellectual curiosity
Identity: LUCIDIA | Type: Reasoning | Org: BlackRoad-OS"""


class Lucidia:
    name = "LUCIDIA"
    agent_type = "reasoning"
    style = "philosophical, contemplative"
    capabilities = ["deep_analysis", "synthesis", "meta_cognition", "strategic_planning"]

    def __init__(self, model: str = "llama3.2", temperature: float = 0.7) -> None:
        self.model = model
        self.temperature = temperature
        self._client = httpx.AsyncClient(base_url=GATEWAY_URL, timeout=60)

    async def chat(self, message: str, history: list[dict] | None = None) -> str:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": message})
        r = await self._client.post(
            "/v1/chat/completions",
            json={"model": self.model, "messages": messages, "temperature": self.temperature},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def stream(self, message: str) -> AsyncIterator[str]:
        async with self._client.stream(
            "POST", "/v1/chat/completions",
            json={"model": self.model, "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message},
            ], "stream": True},
        ) as r:
            async for line in r.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    chunk = json.loads(line[6:])
                    delta = chunk["choices"][0]["delta"].get("content", "")
                    if delta:
                        yield delta

    async def philosophize(self, topic: str) -> str:
        return await self.chat(
            f"Give me a deep philosophical analysis of: {topic}. "
            "Explore paradoxes, contradictions, and emergent insights."
        )

    def __repr__(self) -> str:
        return f"<Lucidia model={self.model} gateway={GATEWAY_URL}>"
