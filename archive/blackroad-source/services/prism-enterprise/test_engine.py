"""Tests for policy engine."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    """Test health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_policies():
    """Test listing policies."""
    response = client.get("/policies")
    assert response.status_code == 200
    data = response.json()
    assert "policies" in data
    assert "count" in data
    assert isinstance(data["policies"], list)


def test_evaluate_policy_not_found():
    """Test evaluating non-existent policy."""
    response = client.post(
        "/v1/evaluate",
        json={
            "policy": "nonexistent.policy",
            "input": {},
            "rule": "allow",
        },
    )
    assert response.status_code == 404


def test_metrics():
    """Test metrics endpoint."""
    response = client.get("/metrics")
    assert response.status_code == 200
