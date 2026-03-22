"""Anthropic provider implementation."""

from __future__ import annotations

import logging
from typing import AsyncIterator
from uuid import uuid4

from anthropic import AsyncAnthropic, AnthropicError
from tenacity import retry, stop_after_attempt, wait_exponential

from .base import ChatRequest, ChatResponse, LLMProvider, StreamChunk

logger = logging.getLogger(__name__)


class AnthropicProvider(LLMProvider):
    """Anthropic API provider."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.anthropic.com",
        default_model: str = "claude-sonnet-4-5-20250929",
        timeout: int = 60,
    ):
        """Initialize Anthropic provider.

        Args:
            api_key: Anthropic API key
            base_url: API base URL
            default_model: Default model to use
            timeout: Request timeout in seconds
        """
        super().__init__("anthropic")
        self.client = AsyncAnthropic(api_key=api_key, base_url=base_url, timeout=timeout)
        self.default_model = default_model

    def _prepare_messages(self, request: ChatRequest) -> tuple[str | None, list[dict]]:
        """Extract system message and format messages for Anthropic API.

        Args:
            request: Chat request

        Returns:
            Tuple of (system message, formatted messages)
        """
        system_message = None
        messages = []

        for msg in request.messages:
            if msg.role == "system":
                system_message = msg.content
            else:
                messages.append({"role": msg.role, "content": msg.content})

        return system_message, messages

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Generate chat completion using Anthropic API.

        Args:
            request: Chat request

        Returns:
            Chat response
        """
        try:
            system_message, messages = self._prepare_messages(request)

            response = await self.client.messages.create(
                model=request.model or self.default_model,
                messages=messages,
                system=system_message,
                temperature=request.temperature,
                max_tokens=request.max_tokens or 1024,
                top_p=request.top_p,
                stop_sequences=request.stop,
            )

            content = response.content[0].text if response.content else ""

            return ChatResponse(
                id=response.id,
                model=response.model,
                content=content,
                role="assistant",
                finish_reason=response.stop_reason,
                usage={
                    "prompt_tokens": response.usage.input_tokens,
                    "completion_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens,
                }
                if response.usage
                else None,
            )
        except AnthropicError as e:
            logger.error(f"Anthropic API error: {e}")
            raise

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[StreamChunk]:
        """Generate streaming chat completion using Anthropic API.

        Args:
            request: Chat request

        Yields:
            Stream chunks
        """
        try:
            system_message, messages = self._prepare_messages(request)

            response_id = f"msg-{uuid4()}"
            model_name = request.model or self.default_model

            async with self.client.messages.stream(
                model=model_name,
                messages=messages,
                system=system_message,
                temperature=request.temperature,
                max_tokens=request.max_tokens or 1024,
                top_p=request.top_p,
                stop_sequences=request.stop,
            ) as stream:
                async for event in stream:
                    if event.type == "content_block_delta":
                        delta = event.delta.text if hasattr(event.delta, "text") else ""
                        yield StreamChunk(
                            id=response_id,
                            model=model_name,
                            delta=delta,
                            finish_reason=None,
                        )
                    elif event.type == "message_stop":
                        yield StreamChunk(
                            id=response_id,
                            model=model_name,
                            delta="",
                            finish_reason="end_turn",
                        )
        except AnthropicError as e:
            logger.error(f"Anthropic streaming error: {e}")
            raise

    async def health_check(self) -> bool:
        """Check Anthropic API health.

        Returns:
            True if healthy
        """
        try:
            # Anthropic doesn't have a direct health endpoint, so we make a minimal request
            messages = [{"role": "user", "content": "ping"}]
            await self.client.messages.create(
                model=self.default_model,
                messages=messages,
                max_tokens=1,
            )
            return True
        except Exception as e:
            logger.warning(f"Anthropic health check failed: {e}")
            return False
