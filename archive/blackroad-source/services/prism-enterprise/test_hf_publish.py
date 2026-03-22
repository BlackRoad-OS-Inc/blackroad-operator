from __future__ import annotations

import json
from pathlib import Path

import pytest

import scripts.hf_publish as hf_publish


def test_publish_to_huggingface_generates_assets_and_calls_api(tmp_path: Path) -> None:
    recorded: dict[str, object] = {}

    def fake_publish(**kwargs):  # type: ignore[no-untyped-def]
        recorded.update(kwargs)
        return {"url": f"https://huggingface.co/spaces/{kwargs['repo_id']}"}

    agent = {
        "id": "123",
        "name": "Test Agent",
        "base_model": "llama-3-8b",
        "domain": "analysis",
        "description": "An analytical agent.",
        "parent_agent": None,
        "status": "active",
        "slug": "test-agent",
        "created_at": "2024-01-01T00:00:00Z",
        "created_by": "tester",
    }

    namespace_dir = tmp_path / "registry" / "huggingface"
    namespace_dir.mkdir(parents=True)

    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr(hf_publish, "REGISTRY_ROOT", namespace_dir)

    result = hf_publish.publish_to_huggingface(agent, publish_fn=fake_publish)

    expected_repo = f"{hf_publish.DEFAULT_NAMESPACE}/test-agent"
    assert result.repo_id == expected_repo
    assert result.url == f"https://huggingface.co/spaces/{expected_repo}"
    assert recorded["repo_id"] == expected_repo
    assert "README.md" in recorded["files"]

    local_path = namespace_dir / f"{hf_publish.DEFAULT_NAMESPACE.replace('/', '--')}--test-agent"
    readme_path = local_path / "README.md"
    agent_json_path = local_path / "agent.json"
    assert readme_path.exists()
    assert agent_json_path.exists()

    readme_text = readme_path.read_text(encoding="utf-8")
    assert "# Test Agent" in readme_text
    assert "- **Domain:** analysis" in readme_text

    agent_payload = json.loads(agent_json_path.read_text(encoding="utf-8"))
    assert agent_payload["name"] == "Test Agent"
    assert agent_payload["status"] == "active"

    monkeypatch.undo()


def test_publish_to_huggingface_uses_space_url_metadata(tmp_path: Path) -> None:
    calls: dict[str, object] = {}

    def fake_publish(**kwargs):  # type: ignore[no-untyped-def]
        calls.update(kwargs)
        return {}

    agent = {
        "id": "456",
        "name": "Remote Agent",
        "base_model": "mistral-7b",
        "domain": "philosophy",
        "description": "Explores abstract reasoning.",
        "parent_agent": "Ancestor",
        "status": "suspended",
        "slug": "legacy",
        "huggingface_space": "https://huggingface.co/spaces/custom/lineage",
    }

    registry_root = tmp_path / "hf"
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr(hf_publish, "REGISTRY_ROOT", registry_root)

    result = hf_publish.publish_to_huggingface(agent, publish_fn=fake_publish)

    assert result.repo_id == "custom/lineage"
    assert result.url == "https://huggingface.co/spaces/custom/lineage"
    assert calls["repo_id"] == "custom/lineage"

    local_dir = registry_root / "custom--lineage"
    assert (local_dir / "README.md").exists()
    assert (local_dir / "agent.json").exists()

    readme_text = (local_dir / "README.md").read_text(encoding="utf-8")
    assert "- **Parent agent:** Ancestor" in readme_text
    assert "- **Status:** suspended" in readme_text

    monkeypatch.undo()
