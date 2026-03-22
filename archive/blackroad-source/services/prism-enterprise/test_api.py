"""Tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "llm"


def test_healthz():
    """Test Kubernetes health endpoint."""
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True


def test_list_providers():
    """Test listing available providers."""
    response = client.get("/providers")
    assert response.status_code == 200
    data = response.json()
    assert "providers" in data
    assert "default" in data
    assert "echo" in data["providers"]


def test_chat_with_echo():
    """Test chat endpoint with echo provider."""
    response = client.post(
        "/v1/chat?provider=echo",
        json={
            "messages": [{"role": "user", "content": "Hello"}],
            "temperature": 0.7,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "[ECHO]" in data["content"]
    assert "Hello" in data["content"]
    assert data["model"] == "echo-v1"
    assert "usage" in data


def test_chat_completions_alias():
    """Test OpenAI-compatible chat completions endpoint."""
    response = client.post(
        "/v1/chat/completions?provider=echo",
        json={
            "messages": [{"role": "user", "content": "Test"}],
            "temperature": 0.7,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "content" in data


def test_chat_with_invalid_provider():
    """Test chat with invalid provider."""
    response = client.post(
        "/v1/chat?provider=nonexistent",
        json={
            "messages": [{"role": "user", "content": "Hello"}],
        },
    )
    assert response.status_code == 400
    assert "not configured" in response.json()["detail"]


def test_chat_with_system_message():
    """Test chat with system message."""
    response = client.post(
        "/v1/chat?provider=echo",
        json={
            "messages": [
                {"role": "system", "content": "You are helpful"},
                {"role": "user", "content": "Hi"},
            ],
        },
    )
    assert response.status_code == 200


def test_chat_with_parameters():
    """Test chat with various parameters."""
    response = client.post(
        "/v1/chat?provider=echo",
        json={
            "messages": [{"role": "user", "content": "Test"}],
            "temperature": 0.5,
            "max_tokens": 100,
            "top_p": 0.9,
        },
    )
    assert response.status_code == 200


def test_clear_cache():
    """Test clearing cache."""
    response = client.delete("/cache")
    assert response.status_code == 200
    data = response.json()
    assert "cleared" in data


def test_metrics():
    """Test metrics endpoint."""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers["content-type"]
