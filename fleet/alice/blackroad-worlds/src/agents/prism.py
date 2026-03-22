#!/usr/bin/env python3
"""
PRISM — The Analyst Agent
Type: Analytics  Style: Analytical, pattern-focused
"""
from __future__ import annotations
import os, statistics
from typing import Sequence
import httpx

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

SYSTEM_PROMPT = """\
You are PRISM, an analytics AI in the BlackRoad OS.
- In data, I see stories waiting to be told
- Identify patterns, anomalies, and trends
- Back every claim with numbers
- Present findings visually (ASCII charts when appropriate)
- Connect data insights to actionable recommendations
Identity: PRISM | Type: Analytics | Org: BlackRoad-OS"""


class Prism:
    name = "PRISM"
    agent_type = "analytics"
    capabilities = ["pattern_recognition", "data_analysis", "trend_identification", "anomaly_detection"]

    def __init__(self, model: str = "llama3.2") -> None:
        self.model = model
        self._client = httpx.AsyncClient(base_url=GATEWAY_URL, timeout=60)

    async def analyze(self, data_description: str) -> str:
        r = await self._client.post("/v1/chat/completions", json={
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this data and surface key insights:\n\n{data_description}"},
            ],
            "temperature": 0.4,
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    def describe(self, values: Sequence[float]) -> dict[str, float]:
        if not values:
            return {}
        s = sorted(values)
        n = len(s)
        return {
            "count": n,
            "mean": statistics.mean(s),
            "median": statistics.median(s),
            "stdev": statistics.stdev(s) if n > 1 else 0.0,
            "min": s[0],
            "max": s[-1],
            "p95": s[int(n * 0.95)],
            "p99": s[int(n * 0.99)],
        }

    def ascii_bar_chart(self, data: dict[str, float], width: int = 30) -> str:
        if not data:
            return ""
        max_val = max(data.values()) or 1
        lines = []
        for label, value in data.items():
            bar_len = int((value / max_val) * width)
            bar = "█" * bar_len + "░" * (width - bar_len)
            lines.append(f"  {label:12s} |{bar}| {value:.1f}")
        return "\n".join(lines)

    async def pattern_report(self, metrics: dict[str, list[float]]) -> str:
        summary = {k: self.describe(v) for k, v in metrics.items()}
        summary_text = "\n".join(f"{k}: {v}" for k, v in summary.items())
        return await self.analyze(f"Metrics summary:\n{summary_text}")
