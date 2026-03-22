"""Policy primitives for QLM Lab."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, List, Mapping


@dataclass
class Policy:
    """Lightweight runtime policy for tool execution."""

    allow_network: bool = False
    max_artifacts_mb: float = 20.0
    required_artifacts: List[str] = field(default_factory=list)


def enforce_file_caps(artifacts_dir: str | Path, policy: Policy | None = None) -> None:
    """Raise ``RuntimeError`` if artifacts exceed the configured quota."""

    policy = policy or Policy()
    root = Path(artifacts_dir)
    if not root.exists():
        return
    total_bytes = sum(path.stat().st_size for path in root.rglob("*") if path.is_file())
    limit_bytes = policy.max_artifacts_mb * 1_048_576
    if total_bytes > limit_bytes:
        raise RuntimeError(
            f"artifact quota exceeded: {total_bytes} bytes > {limit_bytes} bytes"
        )


def ensure_required_artifacts(root: Path, patterns: Iterable[str]) -> List[Path]:
    """Return missing artifact paths relative to ``root``."""

    return [root / pattern for pattern in patterns if not (root / pattern).exists()]


def chsh_within_bounds(value: float, lower: float = 2.2, upper: float = 2.9) -> bool:
    """Validate that a CHSH score lies within the Bell violation band."""

    return lower < value <= upper


def coverage_thresholds_met(coverage: Mapping[str, float], minimum: float) -> bool:
    """Ensure all provided coverage values exceed ``minimum``."""

    return all(score >= minimum for score in coverage.values())


def network_allowed(policy: Policy | None = None) -> bool:
    """Determine whether network access is permitted by policy or env override."""

    policy = policy or Policy()
    override = os.environ.get("QLAB_ALLOW_NETWORK")
    if override is not None:
        return override.lower() in {"1", "true", "yes"}
    return policy.allow_network


__all__ = [
    "Policy",
    "enforce_file_caps",
    "ensure_required_artifacts",
    "chsh_within_bounds",
    "coverage_thresholds_met",
    "network_allowed",
]
