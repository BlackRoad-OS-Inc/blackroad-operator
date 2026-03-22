"""Shared storage utilities for the Lucidia math services."""

from __future__ import annotations

import hashlib
import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT_ROOT = BASE_DIR / "output"


@dataclass(frozen=True)
class ArtifactRecord:
    """Descriptor for a stored artifact."""

    path: Path
    sha512: str
    bytes: int

    def to_response(self) -> Dict[str, Any]:
        return {
            "path": str(self.path),
            "relative_path": str(relative_to_output(self.path)),
            "sha512": self.sha512,
            "bytes": self.bytes,
        }


def get_output_root() -> Path:
    """Return the configured output directory."""

    override = os.getenv("MATH_OUTPUT_DIR")
    if override:
        return Path(override)
    return DEFAULT_OUTPUT_ROOT


def ensure_domain(domain: str) -> Path:
    """Ensure the domain directory exists and return it."""

    root = get_output_root()
    target = root / domain
    target.mkdir(parents=True, exist_ok=True)
    return target


def compute_sha512(path: Path) -> str:
    """Compute the SHA-512 hash of ``path``."""

    digest = hashlib.sha512()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def record_artifact(domain: str, path: Path) -> ArtifactRecord:
    """Produce the :class:`ArtifactRecord` for an artefact."""

    if not path.is_absolute():
        path = ensure_domain(domain) / path
    sha512 = compute_sha512(path)
    bytes_count = path.stat().st_size
    return ArtifactRecord(path=path, sha512=sha512, bytes=bytes_count)


def write_json(path: Path, payload: Dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, sort_keys=True))


def log_run(
    domain: str,
    *,
    params: Dict[str, Any],
    invariants: Dict[str, Any],
    artifact: Optional[ArtifactRecord] = None,
    extras: Optional[Dict[str, Any]] = None,
) -> Path:
    """Persist a provenance record for a computation run."""

    runs_dir = ensure_domain(domain) / "runs"
    runs_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    run_payload: Dict[str, Any] = {
        "timestamp": timestamp,
        "params": params,
        "invariants": invariants,
    }
    if artifact:
        run_payload["artifact"] = artifact.to_response()
    if extras:
        run_payload.update(extras)
    identifier = timestamp.replace(":", "").replace("-", "").replace("+", "_")
    run_path = runs_dir / f"run_{identifier}.json"
    write_json(run_path, run_payload)
    return run_path


def relative_to_output(path: Path) -> Path:
    """Return ``path`` relative to the configured output root."""

    root = get_output_root()
    try:
        return path.relative_to(root)
    except ValueError:
        return path


def format_units(pairs: Iterable[tuple[str, str]]) -> Dict[str, str]:
    """Helper to build the units dictionary from key/unit pairs."""

    return {key: unit for key, unit in pairs}
