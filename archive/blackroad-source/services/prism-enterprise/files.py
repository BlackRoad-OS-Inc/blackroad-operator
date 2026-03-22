"""Safe file IO utilities respecting policy constraints."""
from __future__ import annotations

from pathlib import Path
from ..policies import PolicyGuard


def safe_write(path: Path, data: str, policy: PolicyGuard) -> Path:
    encoded = data.encode("utf-8")
    policy.ensure_file_write_allowed(path, len(encoded))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(data, encoding="utf-8")
    policy.enforce_total_size()
    return path


def safe_read(path: Path, max_bytes: int = 1_000_000) -> str:
    data = path.read_text(encoding="utf-8")
    if len(data.encode("utf-8")) > max_bytes:
        raise ValueError("File exceeds allowed size")
    return data


def list_artifacts(policy: PolicyGuard) -> list[Path]:
    return [p for p in policy.config.artifact_dir.glob("**/*") if p.is_file()]
