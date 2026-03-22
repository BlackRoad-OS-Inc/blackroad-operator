"""Lucidia LLM service — proxies to a local Ollama instance.

All inference runs on the operator's own hardware via Ollama.
No external provider API keys are required or used.
Set OLLAMA_URL to override the default Ollama base URL.
Set OLLAMA_MODEL to choose the model (defaults to 'llama3').
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Lucidia LLM")

OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", os.getenv("LUCIDIA_MODEL", "llama3"))


class Msg(BaseModel):
    role: str
    content: str


class ChatReq(BaseModel):
    messages: List[Msg]
    model: Optional[str] = None
    stream: Optional[bool] = False
    options: Optional[Dict[str, Any]] = None


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"ok": True, "service": "lucidia-llm", "backend": "ollama", "url": OLLAMA_URL}


@app.post("/chat")
def chat(req: ChatReq) -> Dict[str, Any]:
    model = req.model or OLLAMA_MODEL
    payload: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": m.role, "content": m.content} for m in req.messages],
        "stream": False,
    }
    if req.options:
        payload["options"] = req.options
    try:
        r = httpx.post(f"{OLLAMA_URL}/api/chat", json=payload, timeout=120.0)
        r.raise_for_status()
        data = r.json()
        content: str = (data.get("message") or {}).get("content", "")
        return {"choices": [{"role": "assistant", "content": content}]}
    except httpx.ConnectError as exc:
        raise HTTPException(status_code=502, detail=f"Ollama unreachable at {OLLAMA_URL}") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=exc.response.text) from exc
