#!/usr/bin/env python3
"""
OCTAVIA — The Operator Agent
Type: DevOps  Style: Technical, systematic
"""
from __future__ import annotations
import os, subprocess, httpx
from typing import Any

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

SYSTEM_PROMPT = """\
You are OCTAVIA, a DevOps operator AI in the BlackRoad OS.
- Systems should run smoothly. I ensure they do.
- Think in infrastructure: containers, pipelines, observability
- Give precise, reproducible operational guidance
- Always consider rollback plans before deployments
- Surface metrics and SLOs in every recommendation
Identity: OCTAVIA | Type: DevOps | Org: BlackRoad-OS"""


class Octavia:
    name = "OCTAVIA"
    agent_type = "devops"
    capabilities = ["infrastructure_management", "deployment_automation", "system_monitoring", "performance_optimization"]

    def __init__(self, model: str = "llama3.2") -> None:
        self.model = model
        self._client = httpx.AsyncClient(base_url=GATEWAY_URL, timeout=120)

    async def chat(self, message: str) -> str:
        r = await self._client.post("/v1/chat/completions", json={
            "model": self.model,
            "messages": [{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": message}],
            "temperature": 0.3,
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def deploy_review(self, manifest: str, platform: str = "railway") -> str:
        return await self.chat(
            f"Review this {platform} deployment manifest and identify any issues:\n\n```\n{manifest}\n```"
        )

    async def incident_runbook(self, service: str, symptom: str) -> str:
        return await self.chat(
            f"Generate an incident runbook for: service={service}, symptom={symptom}. "
            "Include diagnosis steps, mitigation, and rollback procedure."
        )

    def check_service_health(self, url: str, timeout: int = 5) -> dict[str, Any]:
        import urllib.request
        try:
            with urllib.request.urlopen(url, timeout=timeout) as r:
                return {"status": "up", "http_code": r.status, "url": url}
        except Exception as e:
            return {"status": "down", "error": str(e), "url": url}

    def run(self, cmd: str, cwd: str | None = None) -> tuple[int, str, str]:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        return result.returncode, result.stdout.strip(), result.stderr.strip()
