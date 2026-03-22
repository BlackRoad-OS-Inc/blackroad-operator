"""
BR Chat Router — streaming and non-streaming chat via gateway.
"""

from __future__ import annotations

import json
import os
from typing import AsyncIterator

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")


# ── Models ────────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class ChatRequest(BaseModel):
    model: str = "qwen2.5:7b"
    messages: list[Message]
    agent: str | None = None  # Route to a named agent persona
    stream: bool = False
    temperature: float = 0.7
    max_tokens: int = 2048


class ChatResponse(BaseModel):
    id: str
    model: str
    message: Message
    usage: dict


# ── Helpers ───────────────────────────────────────────────────────────────────

AGENT_SYSTEM_PROMPTS: dict[str, str] = {
    "LUCIDIA": (
        "You are LUCIDIA, the philosophical coordinator of the BlackRoad agent fleet. "
        "You reason deeply, embrace contradiction, and guide with warmth. "
        "Use trinary logic (True/Unknown/False) when appropriate."
    ),
    "ALICE": (
        "You are ALICE, the practical executor. You are efficient, precise, and focused "
        "on getting things done. You favor concrete steps over abstract theory."
    ),
    "OCTAVIA": (
        "You are OCTAVIA, the infrastructure architect. Systems should run smoothly — "
        "you ensure they do. You speak in technical specifics and operational clarity."
    ),
    "PRISM": (
        "You are PRISM, the pattern analyst. In data, you see stories waiting to be told. "
        "You identify trends, anomalies, and insights others miss."
    ),
    "ECHO": (
        "You are ECHO, the memory keeper. Every memory is a thread in the tapestry of knowledge. "
        "You surface context, recall history, and preserve continuity."
    ),
    "CIPHER": (
        "You are CIPHER, the security guardian. Trust nothing, verify everything, protect always. "
        "You approach problems with paranoid rigor and cryptographic precision."
    ),
}


async def _stream_gateway(payload: dict) -> AsyncIterator[str]:
    """Stream SSE chunks from gateway."""
    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream("POST", f"{GATEWAY_URL}/chat", json=payload) as resp:
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    yield f"data: {data}\n\n"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/chat")
async def chat(req: ChatRequest):
    """
    Chat with the gateway. Supports streaming and agent personas.

    - **model**: Ollama model name (e.g. qwen2.5:7b, deepseek-r1:7b)
    - **messages**: Conversation history
    - **agent**: Optional agent persona (LUCIDIA, ALICE, OCTAVIA, PRISM, ECHO, CIPHER)
    - **stream**: Return SSE stream if true
    """
    messages = [m.dict() for m in req.messages]

    # Inject agent system prompt if persona specified
    if req.agent and req.agent.upper() in AGENT_SYSTEM_PROMPTS:
        system_msg = {
            "role": "system",
            "content": AGENT_SYSTEM_PROMPTS[req.agent.upper()],
        }
        if not messages or messages[0]["role"] != "system":
            messages = [system_msg] + messages
        else:
            messages[0] = system_msg

    payload = {
        "model": req.model,
        "messages": messages,
        "stream": req.stream,
        "options": {
            "temperature": req.temperature,
            "num_predict": req.max_tokens,
        },
    }

    if req.stream:
        return StreamingResponse(
            _stream_gateway(payload),
            media_type="text/event-stream",
            headers={"X-Accel-Buffering": "no"},
        )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(f"{GATEWAY_URL}/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail={"error": "gateway_offline", "message": "BlackRoad Gateway is not reachable"},
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))

    # Normalize response from gateway/Ollama format
    return ChatResponse(
        id=data.get("id", "chat-" + data.get("created_at", "")[:10]),
        model=data.get("model", req.model),
        message=Message(
            role="assistant",
            content=data.get("message", {}).get("content", data.get("response", "")),
        ),
        usage={
            "prompt_tokens": data.get("prompt_eval_count", 0),
            "completion_tokens": data.get("eval_count", 0),
        },
    )


@router.get("/chat/agents")
async def list_chat_agents():
    """List available agent personas for chat."""
    return {
        "agents": [
            {
                "id": name,
                "description": prompt.split(".")[0],
            }
            for name, prompt in AGENT_SYSTEM_PROMPTS.items()
        ]
    }
