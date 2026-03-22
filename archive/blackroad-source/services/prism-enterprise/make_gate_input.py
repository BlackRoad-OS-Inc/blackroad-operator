"""Generate the Prism gate input for QLM Lab."""
from __future__ import annotations

import json
import os
import xml.etree.ElementTree as ET
from pathlib import Path

from qlm_lab.tools import quantum_np

ROOT = Path(__file__).resolve().parents[3]
MODULE_ROOT = Path(__file__).resolve().parents[1]
COVERAGE_FILE = MODULE_ROOT / "coverage.xml"
ARTIFACTS_DIR = MODULE_ROOT / "artifacts"
OUTPUT_PATH = ROOT / "prism" / "ci" / "qlm_lab.coverage.json"
MODULE_OUTPUT_PATH = MODULE_ROOT / "prism" / "ci" / "qlm_lab.coverage.json"
RAG_OUTPUT_PATH = ROOT / "prism" / "ci" / "qlm_lab.rag.json"
MODULE_RAG_OUTPUT_PATH = MODULE_ROOT / "prism" / "ci" / "qlm_lab.rag.json"
TARGET_FILE = "qlm_lab/tools/quantum_np.py"
ALT_TARGET_FILE = "tools/quantum_np.py"


def _coverage_for_target() -> float:
    if not COVERAGE_FILE.exists():
        raise FileNotFoundError(COVERAGE_FILE)
    tree = ET.parse(COVERAGE_FILE)
    root = tree.getroot()
    for cls in root.iter("class"):
        filename = cls.attrib.get("filename")
        if filename in {TARGET_FILE, ALT_TARGET_FILE}:
            return float(cls.attrib.get("line-rate", 0.0))
    raise RuntimeError(f"coverage entry for {TARGET_FILE} not found")


def _artifact_count() -> int:
    if not ARTIFACTS_DIR.exists():
        return 0
    return sum(1 for path in ARTIFACTS_DIR.iterdir() if path.is_file())


def _allow_network() -> bool:
    raw = os.environ.get("ALLOW_NETWORK", "false")
    return raw.lower() in {"1", "true", "yes"}


def _citation_count() -> int:
    rag_path = ARTIFACTS_DIR / "rag_topk.json"
    if not rag_path.exists():
        return 0
    try:
        data = json.loads(rag_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return 0
    if isinstance(data, list):
        return len(data)
    return 0


def main() -> None:
    coverage_value = _coverage_for_target()
    chsh_value = float(quantum_np.chsh_value_phi_plus())
    artifacts = _artifact_count()
    citations = _citation_count()
    payload = {
        "coverage": {TARGET_FILE: round(coverage_value, 4)},
        "metrics": {"chsh": round(chsh_value, 4)},
        "artifacts": {"count": artifacts},
        "policy": {"allow_network": _allow_network()},
    }
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    MODULE_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    MODULE_OUTPUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    rag_payload = {"citations": {"count": citations}}
    RAG_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    RAG_OUTPUT_PATH.write_text(json.dumps(rag_payload, indent=2) + "\n", encoding="utf-8")
    MODULE_RAG_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    MODULE_RAG_OUTPUT_PATH.write_text(json.dumps(rag_payload, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
