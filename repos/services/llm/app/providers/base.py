"""Base provider interface and shared models."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import AsyncIterator, Literal

from pydantic import BaseModel, Field


class Message(BaseModel):
    """Chat message."""

    role: Literal["system", "user", "assistant"] = Field(..., description="Message role")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Chat completion request."""

    messages: list[Message] = Field(..., description="Conversation messages")
    model: str | None = Field(None, description="Model to use (provider-specific)")
    temperature: float = Field(0.7, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: int | None = Field(None, ge=1, le=128000, description="Maximum tokens to generate")
    top_p: float = Field(1.0, ge=0.0, le=1.0, description="Nucleus sampling parameter")
    stream: bool = Field(False, description="Enable streaming responses")
    stop: list[str] | None = Field(None, description="Stop sequences")


class ChatResponse(BaseModel):
    """Chat completion response."""

    id: str = Field(..., description="Unique response ID")
    model: str = Field(..., description="Model used")
    content: str = Field(..., description="Generated response")
    role: str = Field("assistant", description="Response role")
    finish_reason: str | None = Field(None, description="Reason for completion")
    usage: dict[str, int] | None = Field(None, description="Token usage statistics")


class StreamChunk(BaseModel):
    """Streaming response chunk."""

    id: str = Field(..., description="Response ID")
    model: str = Field(..., description="Model used")
    delta: str = Field("", description="Content delta")
    finish_reason: str | None = Field(None, description="Reason for completion if done")


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    def __init__(self, name: str):
        """Initialize provider.

        Args:
            name: Provider name for logging/metrics
        """
        self.name = name

    @abstractmethod
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Generate chat completion.

        Args:
            request: Chat request

        Returns:
            Chat response

        Raises:
            Exception: On provider errors
        """
        pass

    @abstractmethod
    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[StreamChunk]:
        """Generate streaming chat completion.

        Args:
            request: Chat request

        Yields:
            Stream chunks

        Raises:
            Exception: On provider errors
        """
        pass

    async def health_check(self) -> bool:
        """Check provider health.

        Returns:
            True if healthy
        """
        return True
