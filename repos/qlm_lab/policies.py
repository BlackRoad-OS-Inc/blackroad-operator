"""Policy enforcement utilities for the QLM laboratory."""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Set


class PolicyError(RuntimeError):
    """Raised when a policy constraint is violated."""


@dataclass
class PolicyConfig:
    """Configurable policy knobs for an agent run."""

    max_artifacts_mb: int = 20
    allow_network: bool = False
    allowed_tools: Set[str] = field(default_factory=lambda: {
        "math_cas",
        "la",
        "quantum_np",
        "viz",
        "files",
        "tests",
    })
    artifact_dir: Path = Path("artifacts")
    lineage_path: Path = Path("artifacts/lineage.jsonl")


class PolicyGuard:
    """Enforces the configured policy constraints."""

    def __init__(self, config: PolicyConfig | None = None) -> None:
        self.config = config or PolicyConfig()
        self.config.artifact_dir.mkdir(parents=True, exist_ok=True)

    def ensure_tool_allowed(self, tool_name: str) -> None:
        if tool_name not in self.config.allowed_tools:
            raise PolicyError(f"Tool '{tool_name}' is not permitted by policy")

    def ensure_network_allowed(self) -> None:
        if not self.config.allow_network:
            raise PolicyError("Network access is disabled by policy")

    def ensure_file_write_allowed(self, path: Path, size_bytes: int) -> None:
        if not str(path).startswith(str(self.config.artifact_dir)):
            raise PolicyError("Artifacts must be written under the artifacts directory")
        max_bytes = self.config.max_artifacts_mb * 1024 * 1024
        if size_bytes > max_bytes:
            raise PolicyError(
                f"Artifact size {size_bytes} exceeds policy limit of {max_bytes} bytes"
            )

    def total_artifact_size(self) -> int:
        total = 0
        for file in self.config.artifact_dir.glob("**/*"):
            if file.is_file():
                total += file.stat().st_size
        return total

    def enforce_total_size(self) -> None:
        max_bytes = self.config.max_artifacts_mb * 1024 * 1024
        if self.total_artifact_size() > max_bytes:
            raise PolicyError("Total artifact footprint exceeds policy limit")

    def restrict_tools(self, allowed: Iterable[str]) -> None:
        self.config.allowed_tools = set(allowed)
