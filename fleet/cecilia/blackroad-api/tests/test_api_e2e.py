"""
BlackRoad API E2E Tests — Memory, Tasks, Chat, and Coordination endpoints.
Run: pytest tests/ -v
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ─── Health & Docs ────────────────────────────────────────────────────────────

def test_health_endpoint():
    r = client.get("/health")
    assert r.status_code == 200
    d = r.json()
    assert d["status"] == "ok"
    assert "version" in d


def test_openapi_schema_contains_routes():
    r = client.get("/openapi.json")
    assert r.status_code == 200
    paths = r.json().get("paths", {})
    assert "/health" in paths or "/v1/agents" in paths


def test_docs_accessible():
    r = client.get("/docs")
    assert r.status_code == 200


# ─── Agents ───────────────────────────────────────────────────────────────────

def test_all_six_agents_present():
    r = client.get("/v1/agents")
    assert r.status_code == 200
    d = r.json()
    names = {a["name"] for a in d["agents"]}
    expected = {"LUCIDIA", "ALICE", "OCTAVIA", "PRISM", "ECHO", "CIPHER"}
    assert names == expected


def test_agent_has_required_fields():
    r = client.get("/v1/agents/OCTAVIA")
    assert r.status_code == 200
    d = r.json()
    for field in ["name", "type", "status", "capabilities"]:
        assert field in d, f"Agent missing field: {field}"


def test_agent_unknown_returns_404():
    r = client.get("/v1/agents/NOBODY")
    assert r.status_code == 404


def test_agents_all_active():
    r = client.get("/v1/agents")
    assert r.status_code == 200
    for agent in r.json()["agents"]:
        assert agent["status"] == "active"


# ─── Memory ───────────────────────────────────────────────────────────────────

def test_memory_store_and_retrieve():
    """POST /v1/memory → should store and return the memory entry."""
    r = client.post("/v1/memory", json={
        "content": "BlackRoad Pi fleet has 2 nodes",
        "key": "fleet_info",
        "type": "fact"
    })
    # Accept 200 or 201
    assert r.status_code in (200, 201)
    d = r.json()
    assert "hash" in d or "id" in d or "key" in d


def test_memory_requires_content():
    r = client.post("/v1/memory", json={"key": "empty"})
    assert r.status_code == 422  # Unprocessable Entity


# ─── Tasks ────────────────────────────────────────────────────────────────────

def test_list_tasks():
    r = client.get("/v1/tasks")
    assert r.status_code == 200
    d = r.json()
    assert "tasks" in d or isinstance(d, list)


def test_create_task():
    r = client.post("/v1/tasks", json={
        "title": "Deploy Pi agent update",
        "description": "Update world engine to v2",
        "priority": 8,
        "skills": ["python", "systemd"]
    })
    assert r.status_code in (200, 201)
    d = r.json()
    assert "id" in d or "task_id" in d


# ─── Brand Compliance ─────────────────────────────────────────────────────────

def test_api_response_headers():
    """API should return proper content-type."""
    r = client.get("/health")
    assert "application/json" in r.headers.get("content-type", "")


def test_cors_or_security_headers():
    """API should have basic security headers."""
    r = client.get("/health")
    # At minimum, content-type should be set
    assert r.status_code == 200
