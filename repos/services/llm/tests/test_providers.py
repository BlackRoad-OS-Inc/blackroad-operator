"""Tests for LLM providers."""

import pytest

from app.providers import ChatRequest, EchoProvider, Message


@pytest.mark.asyncio
async def test_echo_provider_chat():
    """Test echo provider basic chat."""
    provider = EchoProvider()

    request = ChatRequest(
        messages=[
            Message(role="user", content="Hello, world!"),
        ],
        temperature=0.7,
    )

    response = await provider.chat(request)

    assert response.content == "[ECHO] Received: Hello, world!"
    assert response.model == "echo-v1"
    assert response.role == "assistant"
    assert response.finish_reason == "stop"
    assert response.usage is not None
    assert response.usage["total_tokens"] > 0


@pytest.mark.asyncio
async def test_echo_provider_streaming():
    """Test echo provider streaming."""
    provider = EchoProvider()

    request = ChatRequest(
        messages=[
            Message(role="user", content="Test"),
        ],
        stream=True,
    )

    chunks = []
    async for chunk in provider.stream_chat(request):
        chunks.append(chunk)

    assert len(chunks) > 0
    full_text = "".join(chunk.delta for chunk in chunks)
    assert "[ECHO]" in full_text
    assert "Test" in full_text
    assert chunks[-1].finish_reason == "stop"


@pytest.mark.asyncio
async def test_echo_provider_health():
    """Test echo provider health check."""
    provider = EchoProvider()
    assert await provider.health_check() is True


@pytest.mark.asyncio
async def test_echo_provider_empty_messages():
    """Test echo provider with empty messages."""
    provider = EchoProvider()

    request = ChatRequest(messages=[], temperature=0.7)

    response = await provider.chat(request)
    assert "(empty)" in response.content
