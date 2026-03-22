from __future__ import annotations

import json
from pathlib import Path
from typing import List

from ..agents.orchestrator import Orchestrator
from ..lineage import ARTIFACTS_DIR, LINEAGE_PATH, artifact_index

REQUIRED_ARTIFACTS = [
    "bell_hist.png",
    "bell_hist_empirical.png",
    "lineage.jsonl",
]


def _artifact_paths(names: List[str]) -> List[Path]:
    return [ARTIFACTS_DIR / name for name in names]


def main() -> None:
    orchestrator = Orchestrator()
    orchestrator.run_goal("prove bell correlations")
    summary = artifact_index()
    missing = [name for name in REQUIRED_ARTIFACTS if name not in summary["files"]]
    if missing:
        raise SystemExit(f"Missing artifacts: {missing}")
    payload = {
        "artifacts": [str(path.resolve()) for path in _artifact_paths(REQUIRED_ARTIFACTS)],
        "lineage": str(LINEAGE_PATH.resolve()),
    }
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
