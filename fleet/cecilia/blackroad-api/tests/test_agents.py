"""
Tests for /v1/agents endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import httpx

from app.main import app

client = TestClient(app)


def test_list_agents_returns_six():
    """Core 6 agents are always returned."""
    response = client.get("/v1/agents")
    assert response.status_code == 200
    data = response.json()
    assert "agents" in data
    assert data["total"] == 6
    names = [a["name"] for a in data["agents"]]
    assert set(names) == {"LUCIDIA", "ALICE", "OCTAVIA", "PRISM", "ECHO", "CIPHER"}


def test_get_agent_lucidia():
    response = client.get("/v1/agents/LUCIDIA")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "LUCIDIA"
    assert data["type"] == "reasoning"
    assert "reasoning" in data["capabilities"]


def test_get_agent_case_insensitive():
    """Agent names should be case-insensitive."""
    response = client.get("/v1/agents/lucidia")
    assert response.status_code == 200
    assert response.json()["name"] == "LUCIDIA"


def test_get_agent_not_found():
    response = client.get("/v1/agents/UNKNOWN")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_filter_agents_by_type():
    response = client.get("/v1/agents?type=reasoning")
    assert response.status_code == 200
    agents = response.json()["agents"]
    assert all(a["type"] == "reasoning" for a in agents)


@pytest.mark.asyncio
async def test_message_agent_proxies_to_gateway():
    """Message endpoint should proxy to gateway."""
    mock_response = {
        "agent": "LUCIDIA",
        "response": "Hello from LUCIDIA!",
        "memory_hash": "abc123",
        "truth_state": 1,
    }
    
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = AsyncMock(
            status_code=200,
            json=lambda: mock_response,
        )
        mock_post.return_value.raise_for_status = lambda: None
        
        response = client.post(
            "/v1/agents/LUCIDIA/message",
            json={"message": "Hello!"},
        )
        assert response.status_code == 200
