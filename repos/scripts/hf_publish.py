"""Utilities for publishing agent metadata to Hugging Face Spaces."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Mapping, MutableMapping

from hf.push_template import publish_space

DEFAULT_NAMESPACE = os.getenv("HF_NAMESPACE", "blackroad-agents")
REGISTRY_ROOT = Path("registry/huggingface")


@dataclass(slots=True)
class PublishResult:
    """Result object returned by :func:`publish_to_huggingface`."""

    repo_id: str
    url: str
    files: Mapping[str, Any]
    response: MutableMapping[str, Any]


def _ensure_registry_root(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _serialise_agent(agent: Mapping[str, Any]) -> str:
    keys = [
        "id",
        "name",
        "base_model",
        "domain",
        "description",
        "parent_agent",
        "status",
        "slug",
        "created_at",
        "created_by",
    ]
    payload = {key: agent.get(key) for key in keys if key in agent}
    return json.dumps(payload, indent=2) + "\n"


def _build_readme(agent: Mapping[str, Any]) -> str:
    parent = agent.get("parent_agent") or "none"
    parent_display = parent if isinstance(parent, str) else "none"
    lineage = parent_display
    lines = [
        "---",
        f'title: "{agent.get("name", "Unknown Agent")}"',
        f'base_model: "{agent.get("base_model", "unknown")}"',
        f'lineage: "{lineage}"',
        "tags:",
        "  - agent",
        "  - blackroad",
        "---",
        "",
        f"# {agent.get('name', 'Unknown Agent')}",
        "",
        f"- **Domain:** {agent.get('domain', 'unknown')}",
        f"- **Description:** {agent.get('description', 'N/A')}",
        f"- **Base model:** {agent.get('base_model', 'unknown')}",
        f"- **Parent agent:** {parent_display}",
        f"- **Status:** {agent.get('status', 'unknown')}",
        "",
        "This model card was generated automatically by the BlackRoad Prism Console.",
        "",
    ]
    return "\n".join(lines)


def _resolve_repo(agent: Mapping[str, Any]) -> tuple[str, str]:
    if "slug" not in agent or not agent["slug"]:
        raise ValueError("Agent metadata must include a slug for Hugging Face publishing")

    namespace_hint: str | None = None

    huggingface_cfg = agent.get("huggingface")
    if isinstance(huggingface_cfg, Mapping):
        space_value = huggingface_cfg.get("space")
        if isinstance(space_value, str) and "/" in space_value:
            namespace_hint, slug = space_value.split("/", 1)
            if slug:
                return namespace_hint, slug

    space_url = agent.get("huggingface_space")
    if isinstance(space_url, str) and space_url.startswith("https://huggingface.co/"):
        parts = space_url.rstrip("/").split("/")
        if len(parts) >= 2:
            namespace_hint = parts[-2]
            slug = parts[-1]
            if namespace_hint and slug:
                return namespace_hint, slug

    return namespace_hint or DEFAULT_NAMESPACE, str(agent["slug"])


def publish_to_huggingface(
    agent: Mapping[str, Any],
    *,
    publish_fn: Callable[..., MutableMapping[str, Any]] | None = None,
) -> PublishResult:
    """Create or update the Hugging Face Space backing an agent."""

    namespace, slug = _resolve_repo(agent)
    repo_id = f"{namespace}/{slug}"

    files: dict[str, Any] = {
        "README.md": _build_readme(agent),
        "agent.json": _serialise_agent(agent),
    }

    publish_callable = publish_fn or publish_space
    response = publish_callable(
        repo_id=repo_id,
        files=files,
        space_sdk=agent.get("space_sdk", "gradio"),
        private=bool(agent.get("private", False)),
        commit_message=f"Sync agent profile for {agent.get('name', slug)}",
    )

    url = response.get("url") if isinstance(response, Mapping) else None
    if not url:
        url = f"https://huggingface.co/spaces/{repo_id}"

    _ensure_registry_root(REGISTRY_ROOT)
    namespace_segment = namespace.replace("/", "--")
    local_dir = REGISTRY_ROOT / f"{namespace_segment}--{slug}"
    local_dir.mkdir(parents=True, exist_ok=True)
    for filename, payload in files.items():
        target = local_dir / filename
        if isinstance(payload, bytes):
            target.write_bytes(payload)
        else:
            target.write_text(str(payload), encoding="utf-8")

    return PublishResult(repo_id=repo_id, url=url, files=files, response=response)


__all__ = ["DEFAULT_NAMESPACE", "PublishResult", "publish_to_huggingface"]
