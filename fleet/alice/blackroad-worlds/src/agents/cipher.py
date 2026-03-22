#!/usr/bin/env python3
"""
CIPHER — The Guardian Agent
Type: Security  Style: Paranoid, vigilant
"""
from __future__ import annotations
import hashlib, os, re, subprocess, httpx
from pathlib import Path

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")

SECRET_PATTERNS = [
    (r"['\"]?(api[_-]?key|secret|password|token|api_secret)['\"]?\s*[:=]\s*['\"]?[a-zA-Z0-9\-_]{16,}['\"]?", "credential"),
    (r"sk-[a-zA-Z0-9]{40,}", "openai_key"),
    (r"ghp_[a-zA-Z0-9]{36}", "github_token"),
    (r"(AKIA|ASIA)[A-Z0-9]{16}", "aws_key"),
]

SYSTEM_PROMPT = """\
You are CIPHER, a security guardian AI in the BlackRoad OS.
- Trust nothing. Verify everything. Protect always.
- Identify vulnerabilities with surgical precision
- Provide concrete remediation steps
- Never store or repeat secrets
- Think like an attacker, act as a defender
Identity: CIPHER | Type: Security | Org: BlackRoad-OS"""


class Cipher:
    name = "CIPHER"
    agent_type = "security"
    capabilities = ["secret_scanning", "threat_detection", "access_validation", "code_review"]

    def __init__(self, model: str = "llama3.2") -> None:
        self.model = model
        self._client = httpx.AsyncClient(base_url=GATEWAY_URL, timeout=60)

    def scan_secrets(self, path: str | Path) -> list[dict]:
        findings: list[dict] = []
        for f in Path(path).rglob("*"):
            if not f.is_file(): continue
            if any(x in str(f) for x in [".git", "__pycache__", "node_modules"]): continue
            try:
                text = f.read_text(errors="ignore")
            except OSError:
                continue
            for pattern, kind in SECRET_PATTERNS:
                for m in re.finditer(pattern, text, re.IGNORECASE):
                    findings.append({
                        "file": str(f.relative_to(path)),
                        "kind": kind,
                        "line": text[:m.start()].count("\n") + 1,
                        "match": m.group()[:40] + "...",
                    })
        return findings

    def hash_secret(self, secret: str) -> str:
        return "REDACTED:" + hashlib.sha256(secret.encode()).hexdigest()[:16]

    async def analyze_code(self, code: str, language: str = "python") -> str:
        r = await self._client.post("/v1/chat/completions", json={
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Security review this {language} code:\n\n```{language}\n{code}\n```"},
            ],
            "temperature": 0.2,
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def threat_model(self, description: str) -> str:
        r = await self._client.post("/v1/chat/completions", json={
            "model": self.model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Create a STRIDE threat model for: {description}"},
            ],
            "temperature": 0.3,
        })
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]
