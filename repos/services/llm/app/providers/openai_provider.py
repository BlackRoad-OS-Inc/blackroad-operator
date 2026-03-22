"""OpenAI provider implementation."""

from __future__ import annotations

import logging
from typing import AsyncIterator
from uuid import uuid4

from openai import AsyncOpenAI, OpenAIError
from tenacity import retry, stop_after_attempt, wait_exponential

from .base import ChatRequest, ChatResponse, LLMProvider, StreamChunk

logger = logging.getLogger(__name__)


class OpenAIProvider(LLMProvider):
    """OpenAI API provider."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.openai.com/v1",
        default_model: str = "gpt-4o-mini",
        timeout: int = 60,
    ):
        """Initialize OpenAI provider.

        Args:
            api_key: OpenAI API key
            base_url: API base URL
            default_model: Default model to use
            timeout: Request timeout in seconds
        """
        super().__init__("openai")
        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url, timeout=timeout)
        self.default_model = default_model

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Generate chat completion using OpenAI API.

        Args:
            request: Chat request

        Returns:
            Chat response
        """
        try:
            response = await self.client.chat.completions.create(
                model=request.model or self.default_model,
                messages=[{"role": m.role, "content": m.content} for m in request.messages],
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                top_p=request.top_p,
                stop=request.stop,
            )

            choice = response.choices[0]
            return ChatResponse(
                id=response.id,
                model=response.model,
                content=choice.message.content or "",
                role=choice.message.role,
                finish_reason=choice.finish_reason,
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens,
                }
                if response.usage
                else None,
            )
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[StreamChunk]:
        """Generate streaming chat completion using OpenAI API.

        Args:
            request: Chat request

        Yields:
            Stream chunks
        """
        try:
            stream = await self.client.chat.completions.create(
                model=request.model or self.default_model,
                messages=[{"role": m.role, "content": m.content} for m in request.messages],
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                top_p=request.top_p,
                stop=request.stop,
                stream=True,
            )

            response_id = f"chatcmpl-{uuid4()}"
            model_name = request.model or self.default_model

            async for chunk in stream:
                choice = chunk.choices[0] if chunk.choices else None
                if choice:
                    delta = choice.delta.content or ""
                    finish_reason = choice.finish_reason

                    yield StreamChunk(
                        id=response_id,
                        model=model_name,
                        delta=delta,
                        finish_reason=finish_reason,
                    )
        except OpenAIError as e:
            logger.error(f"OpenAI streaming error: {e}")
            raise

    async def health_check(self) -> bool:
        """Check OpenAI API health.

        Returns:
            True if healthy
        """
        try:
            await self.client.models.list()
            return True
        except Exception as e:
            logger.warning(f"OpenAI health check failed: {e}")
            return False
