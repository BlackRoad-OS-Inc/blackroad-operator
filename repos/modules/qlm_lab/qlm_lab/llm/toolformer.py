from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List
import os
import yaml

FS_DIR = os.path.join(os.path.dirname(__file__), "..", "fewshot")


@dataclass
class ToolformerPlan:
    text_with_tags: str
    source: str  # "cache" | "rule" | "fewshot"


class Toolformer:
    """
    Offline Toolformer: turn NL prompts into <tool .../> tag sequences.
    Strategy:
      1) Keyword/rule routing for common intents (CHSH, Bell, Grover, QFT).
      2) Few-shot YAML patterns loaded from qlm_lab/fewshot/*.yaml.
      3) Fallback default: Bell→measure→hist.
    """

    def __init__(self) -> None:
        self.examples = self._load_examples()

    def _load_examples(self) -> Dict[str, List[Dict]]:
        out: Dict[str, List[Dict]] = {}
        idx_path = os.path.join(FS_DIR, "index.yaml")
        if not os.path.exists(idx_path):  # pragma: no cover - defensive
            return out
        with open(idx_path, "r", encoding="utf-8") as f:
            index = yaml.safe_load(f) or {}
        for name, file_ in index.get("files", {}).items():
            p = os.path.join(FS_DIR, file_)
            if not os.path.exists(p):  # pragma: no cover - defensive
                continue
            with open(p, "r", encoding="utf-8") as fh:
                out[name] = yaml.safe_load(fh) or []
        return out

    def generate(self, prompt: str) -> ToolformerPlan:
        p = prompt.lower()

        # 1) Rules
        if "chsh" in p or ("bell" in p and "violation" in p):
            text = (
                "Compute CHSH S for |Φ+> and draw an ideal Bell histogram.\n"
                '<tool name="quantum_np.chsh_value_phi_plus" as="S"/>\n'
                '<tool name="viz.hist" args="{\\"00\\":0.5,\\"11\\":0.5}" fname="bell_hist_toolformer.png" as="hist_path"/>'
            )
            return ToolformerPlan(text, "rule")

        if "grover" in p:
            text = (
                "Prepare Bell (as a sanity step), then plan Grover (placeholder):\n"
                '<tool name="quantum_np.bell_phi_plus" as="psi"/>\n'
                '<tool name="quantum_np.measure_counts" from="psi" shots="1024" as="counts"/>\n'
                '<tool name="viz.hist" from="counts" fname="bell_hist_for_grover.png" as="hist_path"/>'
            )
            return ToolformerPlan(text, "rule")

        if "qft" in p or "phase" in p:
            text = (
                "Generate QFT(2) matrix and confirm unitarity by QFT·QFT† ≈ I.\n"
                '<tool name="quantum_np.qft_matrix" n="2" as="F"/>\n'
                '<tool name="viz.hist" args="{\\"ok\\":1.0}" fname="qft_placeholder.png" as="hist_path"/>'
            )
            return ToolformerPlan(text, "rule")

        # 2) Few-shot match (keyword contains)
        for items in self.examples.values():
            for ex in items:
                if any(kw in p for kw in ex.get("keywords", [])):
                    return ToolformerPlan(ex["tags"], "fewshot")

        # 3) Fallback
        text = (
            "Default: prepare Bell and measure histogram.\n"
            '<tool name="quantum_np.bell_phi_plus" as="psi"/>\n'
            '<tool name="quantum_np.measure_counts" from="psi" shots="4096" as="counts"/>\n'
            '<tool name="viz.hist" from="counts" fname="bell_hist_fallback.png" as="hist_path"/>'
        )
        return ToolformerPlan(text, "rule")
