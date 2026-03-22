"""Quantum Language Model agent bridging reasoning and tools."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List

import numpy as np

from ..lineage import LineageLogger
from ..policies import PolicyGuard
from ..proto import Msg, new
from ..tools import viz
from ..tools.quantum_np import bell_pair, chsh_value, estimate_phase_with_qft, grover_demo_metrics, measure_counts
from .base import Agent


@dataclass
class ScenarioResult:
    text: str
    artifacts: List[str] = field(default_factory=list)


class QLM(Agent):
    def __init__(self, name: str, bus, policy: PolicyGuard, lineage: LineageLogger) -> None:
        super().__init__(name, bus)
        self.policy = policy
        self.lineage = lineage
        self.context: Dict[str, str] = {}

    def can_handle(self, message: Msg) -> bool:
        if message.kind == "result" and message.op == "context":
            return True
        return message.kind == "task" and message.op == "solve_quantum"

    def handle(self, message: Msg) -> list[Msg]:
        if message.kind == "result" and message.op == "context":
            self.context[message.args["topic"]] = message.args["content"]
            return []
        scenario = message.args.get("scenario")
        if scenario == "bell":
            result = self._handle_bell()
        elif scenario == "grover":
            result = self._handle_grover()
        elif scenario == "phase":
            result = self._handle_phase()
        else:
            result = ScenarioResult(text="Unknown scenario")
        return [new(self.name, "critic", "result", "analysis", text=result.text, artifacts=result.artifacts)]

    def _handle_bell(self) -> ScenarioResult:
        self.policy.ensure_tool_allowed('quantum_np')
        state = bell_pair()
        s_value = chsh_value(state)
        counts = measure_counts(state, shots=4096)
        bloch_vec = np.array([0.0, 0.0, 1.0])
        toolkit = viz.VizToolkit(self.policy, self.lineage)
        hist_path = toolkit.histogram(counts, "bell_hist.png")
        bloch_path = toolkit.bloch(bloch_vec, "bloch_q0.png")
        self.lineage.log_tool_use("quantum_np.bell_pair", {}, counts)
        text = f"Bell state prepared. CHSH S={s_value:.3f}."
        return ScenarioResult(text=text, artifacts=[str(hist_path), str(bloch_path)])

    def _handle_grover(self) -> ScenarioResult:
        self.policy.ensure_tool_allowed('quantum_np')
        metrics = grover_demo_metrics(3, target=5)
        iterations = np.array(metrics["iterations"], dtype=float)
        probabilities = np.array(metrics["probabilities"], dtype=float)
        toolkit = viz.VizToolkit(self.policy, self.lineage)
        curve_path = toolkit.curve(iterations, probabilities, "Iterations", "Success", "Grover Success", "grover_curve.png")
        advantage = metrics["advantage"]
        self.lineage.log_tool_use("quantum_np.grover_demo_metrics", {"n": 3, "target": 5}, metrics)
        text = f"Grover advantage {advantage:.2f}x over brute force."
        return ScenarioResult(text=text, artifacts=[str(curve_path)])

    def _handle_phase(self) -> ScenarioResult:
        phases = np.linspace(0.0, 1.0, 5)
        errors = []
        for phase in phases:
            self.policy.ensure_tool_allowed('quantum_np')
            result = estimate_phase_with_qft(float(phase))
            errors.append(result["error"])
            self.lineage.log_tool_use("quantum_np.estimate_phase_with_qft", {"phase": float(phase)}, result)
        toolkit = viz.VizToolkit(self.policy, self.lineage)
        curve_path = toolkit.curve(phases, np.array(errors), "Phase", "Error", "Phase estimation error", "phase_errors.png")
        text = "Phase estimation completed with mean error {:.3f}.".format(float(np.mean(errors)))
        return ScenarioResult(text=text, artifacts=[str(curve_path)])
