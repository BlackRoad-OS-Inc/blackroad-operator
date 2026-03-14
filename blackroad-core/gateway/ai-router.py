"""
BlackRoad AI Gateway — Unified API for fleet inference
Routes requests to Ollama models across the Pi mesh.
Updated 2026-03-14 with correct fleet IPs.
"""

import os
import random
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import httpx
from enum import Enum


class ModelType(str, Enum):
    QWEN = "qwen"
    DEEPSEEK = "deepseek"
    OLLAMA = "ollama"
    EMBED = "embed"
    AUTO = "auto"


class ChatRequest(BaseModel):
    message: str
    model: ModelType = ModelType.AUTO
    specific_model: Optional[str] = None
    max_tokens: int = 512
    temperature: float = 0.7
    session_id: Optional[str] = None
    prefer_node: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    model_used: str
    node_used: str
    latency_ms: int


class ClusterNode(BaseModel):
    name: str
    ip: str
    port: int = 11434
    models: List[str] = []
    healthy: bool = True
    load: int = 0


# Fleet with CORRECT IPs (as of 2026-03-14)
FLEET = [
    ClusterNode(name="cecilia", ip="192.168.4.96", models=[
        "llama3.2:3b", "qwen3:8b", "deepseek-coder:1.3b", "cece:latest",
        "nomic-embed-text", "codellama:7b", "deepseek-r1:1.5b",
    ]),
    ClusterNode(name="octavia", ip="192.168.4.101", models=[
        "llama3.2:3b", "qwen2.5-coder:3b",
    ]),
    ClusterNode(name="aria", ip="192.168.4.98", models=["tinyllama:latest"]),
    ClusterNode(name="lucidia", ip="192.168.4.38", models=["llama3.2:1b"]),
]


app = FastAPI(title="BlackRoad AI Gateway", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/")
async def root():
    return {"service": "BlackRoad AI Gateway", "version": "2.0.0", "nodes": len(FLEET), "status": "online"}


@app.get("/health")
async def health():
    healthy = [n for n in FLEET if n.healthy]
    return {"status": "healthy" if healthy else "degraded", "total": len(FLEET), "healthy": len(healthy),
            "nodes": [{"name": n.name, "ip": n.ip, "models": len(n.models), "healthy": n.healthy} for n in FLEET]}


@app.get("/models")
async def list_models():
    models = {}
    for node in FLEET:
        for model in node.models:
            models.setdefault(model, []).append(node.name)
    return models


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    start = time.time()

    # Find a node that has the requested model
    model_name = request.specific_model
    candidates = [n for n in FLEET if n.healthy]

    if request.prefer_node:
        preferred = [n for n in candidates if n.name == request.prefer_node]
        if preferred:
            candidates = preferred

    if model_name:
        candidates = [n for n in candidates if model_name in n.models] or candidates

    if not candidates:
        raise HTTPException(503, "No healthy nodes available")

    node = min(candidates, key=lambda n: n.load) if len(candidates) > 1 else candidates[0]
    node.load += 1

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(f"http://{node.ip}:{node.port}/api/generate", json={
                "model": model_name or node.models[0],
                "prompt": request.message,
                "stream": False,
                "options": {"num_predict": request.max_tokens, "temperature": request.temperature},
            })
            data = resp.json()

        node.load = max(0, node.load - 1)
        return ChatResponse(
            response=data.get("response", ""),
            model_used=model_name or node.models[0],
            node_used=node.name,
            latency_ms=int((time.time() - start) * 1000),
        )

    except httpx.ConnectError:
        node.healthy = False
        node.load = max(0, node.load - 1)
        raise HTTPException(503, f"Node {node.name} unreachable")


@app.post("/embed")
async def embed(text: str, model: str = "nomic-embed-text"):
    """Get embeddings from Cecilia"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post("http://192.168.4.96:11434/api/embeddings", json={"model": model, "prompt": text})
        return resp.json()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000, log_level="info")
