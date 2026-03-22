"""Artifact lineage logging utilities for QLM Lab."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Iterable, List

ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"
ROOT_ARTIFACTS_DIR = Path(__file__).resolve().parents[3] / "artifacts"
LINEAGE_PATH = ARTIFACTS_DIR / "lineage.jsonl"
ROOT_LINEAGE_PATH = ROOT_ARTIFACTS_DIR / "lineage.jsonl"


def _coerce(value: Any) -> Any:
    """Convert values into JSON-serialisable primitives."""

    if isinstance(value, Path):
        return str(value)
    if isinstance(value, dict):
        return {str(key): _coerce(val) for key, val in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_coerce(item) for item in value]
    return value


def append(event: Dict[str, Any], path: Path | None = None) -> Path:
    """Append ``event`` to the lineage JSONL log and return the path used."""

    target = Path(path) if path is not None else LINEAGE_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(_coerce(event), sort_keys=True)
    with target.open("a", encoding="utf-8") as handle:
        handle.write(line + "\n")
    if ROOT_ARTIFACTS_DIR != ARTIFACTS_DIR:
        ROOT_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        with ROOT_LINEAGE_PATH.open("a", encoding="utf-8") as root_handle:
            root_handle.write(line + "\n")
    return target


def _iter_files(root: Path) -> Iterable[Path]:
    for entry in root.iterdir():
        if entry.is_file():
            yield entry


def artifact_index() -> Dict[str, Any]:
    """Return a summary of known artifacts within the lab."""

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    files: List[str] = sorted(entry.name for entry in _iter_files(ARTIFACTS_DIR))
    return {"count": len(files), "files": files}


__all__ = ["append", "artifact_index", "ARTIFACTS_DIR", "LINEAGE_PATH", "ROOT_LINEAGE_PATH"]
