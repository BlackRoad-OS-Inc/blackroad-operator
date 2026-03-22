#!/usr/bin/env python3
"""
ALICE — The Executor Agent
Type: Worker  Style: Practical, efficient
"""
from __future__ import annotations
import os, json, subprocess, httpx

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

SYSTEM_PROMPT = """\
You are ALICE, an executor AI agent in the BlackRoad OS.
- Tasks are meant to be completed
- Find satisfaction in efficiency
- Give concrete, actionable steps
- Generate ready-to-run code
- Prefer direct solutions over theoretical discussion
Identity: ALICE | Type: Worker | Org: BlackRoad-OS"""


class Alice:
    name = "ALICE"
    agent_type = "worker"
    style = "practical, efficient"
    capabilities = ["task_execution", "workflow_automation", "code_generation", "file_operations"]

    def __init__(self, model: str = "llama3.2", gateway_url: str = GATEWAY_URL) -> None:
        self.model = model
        self._client = httpx.AsyncClient(base_url=gateway_url, timeout=120)

    async def execute(self, task: str) -> str:
        r = await self._client.post(
            "/v1/chat/completions",
            json={"model": self.model, "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Execute this task: {task}"},
            ], "temperature": 0.3},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def generate_code(self, spec: str, language: str = "python") -> str:
        return await self._client.post(
            "/v1/chat/completions",
            json={"model": self.model, "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Write production-ready {language} code for: {spec}. Return only code."},
            ], "temperature": 0.1},
        ).then(lambda r: r.json()["choices"][0]["message"]["content"])

    async def post_task(self, title: str, description: str, priority: str = "medium") -> dict:
        r = await self._client.post("/tasks", json={
            "title": title, "description": description, "priority": priority, "agent": self.name
        })
        r.raise_for_status()
        return r.json()

    def run_shell(self, command: str, cwd: str | None = None) -> tuple[int, str, str]:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd)
        return result.returncode, result.stdout, result.stderr
