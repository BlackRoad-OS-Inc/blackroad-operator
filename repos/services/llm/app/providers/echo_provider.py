"""Echo provider for testing and development."""

from __future__ import annotations

import asyncio
import logging
from typing import AsyncIterator
from uuid import uuid4

from .base import ChatRequest, ChatResponse, LLMProvider, StreamChunk

logger = logging.getLogger(__name__)


class EchoProvider(LLMProvider):
    """Echo provider that returns formatted input for testing."""

    def __init__(self):
        """Initialize echo provider."""
        super().__init__("echo")

    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Echo the last message with formatting.

        Args:
            request: Chat request

        Returns:
            Chat response
        """
        last_message = request.messages[-1].content if request.messages else "(empty)"
        response_text = f"[ECHO] Received: {last_message}"

        response_id = f"echo-{uuid4()}"

        return ChatResponse(
            id=response_id,
            model="echo-v1",
            content=response_text,
            role="assistant",
            finish_reason="stop",
            usage={
                "prompt_tokens": len(last_message.split()),
                "completion_tokens": len(response_text.split()),
                "total_tokens": len(last_message.split()) + len(response_text.split()),
            },
        )

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[StreamChunk]:
        """Stream the echo response word by word.

        Args:
            request: Chat request

        Yields:
            Stream chunks
        """
        last_message = request.messages[-1].content if request.messages else "(empty)"
        response_text = f"[ECHO] Received: {last_message}"

        response_id = f"echo-{uuid4()}"

        # Stream word by word
        words = response_text.split()
        for i, word in enumerate(words):
            await asyncio.sleep(0.05)  # Simulate processing delay
            is_last = i == len(words) - 1
            yield StreamChunk(
                id=response_id,
                model="echo-v1",
                delta=word + (" " if not is_last else ""),
                finish_reason="stop" if is_last else None,
            )

    async def health_check(self) -> bool:
        """Echo provider is always healthy.

        Returns:
            True
        """
        return True
