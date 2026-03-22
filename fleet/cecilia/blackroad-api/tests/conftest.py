"""Pytest configuration."""
import pytest

@pytest.fixture
def gateway_url():
    return "http://127.0.0.1:8787"
