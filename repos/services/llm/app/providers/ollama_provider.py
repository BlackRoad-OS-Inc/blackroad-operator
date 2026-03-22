"""Ollama provider implementation."""

from __future__ import annotations

import logging
from typing import AsyncIterator
from uuid import uuid4

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from .base import ChatRequest, ChatResponse, LLMProvider, StreamChunk

logger = logging.getLogger(__name__)


class OllamaProvider(LLMProvider):
    """Ollama API provider for local models."""

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        default_model: str = "llama3.1",
        timeout: int = 120,
    ):
        """Initialize Ollama provider.

        Args:
            base_url: Ollama server URL
            default_model: Default model to use
            timeout: Request timeout in seconds
        """
        super().__init__("ollama")
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.timeout = timeout

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Generate chat completion using Ollama API.

        Args:
            request: Chat request

        Returns:
            Chat response
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": request.model or self.default_model,
                        "messages": [{"role": m.role, "content": m.content} for m in request.messages],
                        "options": {
                            "temperature": request.temperature,
                            "num_predict": request.max_tokens,
                            "top_p": request.top_p,
                            "stop": request.stop,
                        },
                        "stream": False,
                    },
                )
                response.raise_for_status()
                data = response.json()

                response_id = f"ollama-{uuid4()}"
                content = data.get("message", {}).get("content", "")

                return ChatResponse(
                    id=response_id,
                    model=data.get("model", request.model or self.default_model),
                    content=content,
                    role="assistant",
                    finish_reason=data.get("done_reason", "stop"),
                    usage={
                        "prompt_tokens": data.get("prompt_eval_count", 0),
                        "completion_tokens": data.get("eval_count", 0),
                        "total_tokens": data.get("prompt_eval_count", 0) + data.get("eval_count", 0),
                    }
                    if "eval_count" in data
                    else None,
                )
        except httpx.HTTPError as e:
            logger.error(f"Ollama API error: {e}")
            raise

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[StreamChunk]:
        """Generate streaming chat completion using Ollama API.

        Args:
            request: Chat request

        Yields:
            Stream chunks
        """
        try:
            response_id = f"ollama-{uuid4()}"
            model_name = request.model or self.default_model

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/chat",
                    json={
                        "model": model_name,
                        "messages": [{"role": m.role, "content": m.content} for m in request.messages],
                        "options": {
                            "temperature": request.temperature,
                            "num_predict": request.max_tokens,
                            "top_p": request.top_p,
                            "stop": request.stop,
                        },
                        "stream": True,
                    },
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            import json

                            data = json.loads(line)
                            message = data.get("message", {})
                            content = message.get("content", "")
                            done = data.get("done", False)

                            yield StreamChunk(
                                id=response_id,
                                model=model_name,
                                delta=content,
                                finish_reason=data.get("done_reason") if done else None,
                            )
        except httpx.HTTPError as e:
            logger.error(f"Ollama streaming error: {e}")
            raise

    async def health_check(self) -> bool:
        """Check Ollama server health.

        Returns:
            True if healthy
        """
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return False
