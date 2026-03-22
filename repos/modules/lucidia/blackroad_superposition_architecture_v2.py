"""BlackRoad Superposition Architecture v2.

Extends the Part 1 scaffolding with:
- Conscious orchestrator abstraction
- Weak measurement channel with Amundson backaction
- Explicit coherence budget tracking

This module is intentionally dependency-light (NumPy only) so that it can be
used inside Codex / code-mode sandboxes without extra setup.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, Mapping, MutableMapping

import math
import cmath
import numpy as np

EPS = 1e-12


def _normalize_amplitudes(amplitudes: Mapping[str, complex]) -> Dict[str, complex]:
    """Return amplitudes scaled so that Σ |ψ|² = 1 (# BR-01)."""
    norm_sq = float(sum(abs(a) ** 2 for a in amplitudes.values()))
    if norm_sq <= EPS:
        raise ValueError("Amplitude norm vanished; need at least one non-zero component.")
    scale = 1.0 / math.sqrt(norm_sq)
    return {state: amp * scale for state, amp in amplitudes.items()}


@dataclass
class SuperposedVariable:
    """Quantum-like register that stores amplitudes over named states."""

    amplitudes: MutableMapping[str, complex]
    temperature: float = 1.0

    def __post_init__(self) -> None:
        normalized = _normalize_amplitudes(self.amplitudes)
        self.amplitudes.clear()
        self.amplitudes.update(normalized)

    def copy(self) -> "SuperposedVariable":
        return SuperposedVariable(dict(self.amplitudes), self.temperature)

    # ------------------------------------------------------------------
    # Core statistics
    # ------------------------------------------------------------------
    def probabilities(self) -> Dict[str, float]:
        """Return Born probabilities p_i = |ψ_i|² (# BR-01)."""
        return {state: float(abs(amp) ** 2) for state, amp in self.amplitudes.items()}

    def entropy(self) -> float:
        """Shannon entropy H = -Σ p log₂ p (von Neumann diagonal) (# BR-05)."""
        probs = self.probabilities()
        return -sum(p * math.log(p, 2) for p in probs.values() if p > EPS)

    def contradiction_energy(self) -> float:
        """AM-01 contradiction energy K = Σ p_i (1 - p_i)."""
        probs = self.probabilities()
        return sum(p * (1.0 - p) for p in probs.values())  # AM-01

    def phase_gap(self) -> float:
        """AM-02 phase gap δ = |φ_max - φ_min| wrapped into [0, π]."""
        if len(self.amplitudes) < 2:
            return 0.0
        probs = self.probabilities()
        phases = {state: cmath.phase(amp) for state, amp in self.amplitudes.items()}
        ordered = sorted(probs.items(), key=lambda item: item[1], reverse=True)
        top, second = ordered[0][0], ordered[1][0]
        delta = phases[top] - phases[second]
        # wrap into [0, π]
        delta = (delta + math.pi) % (2 * math.pi) - math.pi
        return abs(delta)  # AM-02

    def spiral_projection(self, a: float = 0.8) -> Dict[str, tuple[float, float]]:
        """AM-04 spiral map: r = exp(a p_i), θ = 2π p_i."""
        coords: Dict[str, tuple[float, float]] = {}
        for state, p in self.probabilities().items():
            r = math.exp(a * p)  # AM-04 radius
            theta = 2 * math.pi * p  # AM-04 angle
            coords[state] = (r, theta)
        return coords

    # ------------------------------------------------------------------
    # Thermodynamic controls
    # ------------------------------------------------------------------
    def apply_temperature_shift(self, delta: float) -> float:
        """AM-03 decoherence transform using softmax with β = 1/T."""
        self.temperature = max(EPS, self.temperature + delta)
        beta = 1.0 / max(EPS, self.temperature)
        probs = self.probabilities()
        reweighted = {state: p ** beta for state, p in probs.items()}  # AM-03
        total = sum(reweighted.values())
        if total <= EPS:
            return self.temperature
        normalized = {state: val / total for state, val in reweighted.items()}
        self.update_probabilities(normalized)
        return self.temperature

    # ------------------------------------------------------------------
    # Mutation helpers
    # ------------------------------------------------------------------
    def update_probabilities(self, probs: Mapping[str, float]) -> None:
        """Update amplitudes with new probabilities while keeping phases."""
        phases = {state: cmath.phase(self.amplitudes.get(state, 1.0 + 0j)) for state in probs}
        new_amplitudes: Dict[str, complex] = {}
        for state, prob in probs.items():
            magnitude = math.sqrt(max(prob, 0.0))
            new_amplitudes[state] = magnitude * complex(math.cos(phases[state]), math.sin(phases[state]))
        normalized = _normalize_amplitudes(new_amplitudes)
        self.amplitudes.clear()
        self.amplitudes.update(normalized)

    def states(self) -> Iterable[str]:
        return list(self.amplitudes.keys())


@dataclass
class Agent:
    """Agent with belief/identity/intent registers."""

    name: str
    beliefs: Dict[str, SuperposedVariable]
    identities: Dict[str, SuperposedVariable]
    intents: Dict[str, SuperposedVariable]
    ambient_temperature: float = 1.0

    def get_variable(self, mode: str, var_name: str) -> SuperposedVariable:
        table = {
            "belief": self.beliefs,
            "identity": self.identities,
            "intent": self.intents,
        }
        if mode not in table:
            raise KeyError(f"Unknown mode '{mode}'")
        registry = table[mode]
        if var_name not in registry:
            raise KeyError(f"Agent '{self.name}' has no {mode} variable '{var_name}'")
        return registry[var_name]

    def identity_entropy(self) -> float:
        if not self.identities:
            return 0.0
        return sum(var.entropy() for var in self.identities.values()) / len(self.identities)


@dataclass
class MeasurementConfig:
    """Configuration for orchestrated measurement (AM-06)."""

    strength: float
    temperature_shift: float = 0.0

    def __post_init__(self) -> None:
        if not 0.0 <= self.strength <= 1.0:
            raise ValueError("Measurement strength μ must lie in [0, 1].")  # AM-06


@dataclass
class CoherenceBudget:
    """Track available coherence capital B(t) (AM-08)."""

    value: float
    cost_factor: float = 1.0

    def consume(self, strength: float) -> float:
        cost = max(0.0, self.cost_factor * strength)  # AM-08
        self.value = max(0.0, self.value - cost)
        return cost

    def allow(self, requested_strength: float) -> float:
        if self.cost_factor <= EPS:
            return requested_strength
        max_strength = self.value / self.cost_factor
        return min(requested_strength, max_strength)


class ContextBasis:
    """Change of basis via amplitude reweighting for contextual probes."""

    def __init__(self, weights: Mapping[str, float] | None = None) -> None:
        self.weights = dict(weights or {})

    def apply(self, var: SuperposedVariable) -> SuperposedVariable:
        scaled = {state: amp * self.weights.get(state, 1.0) for state, amp in var.amplitudes.items()}
        if sum(abs(amp) ** 2 for amp in scaled.values()) <= EPS:
            return var.copy()
        return SuperposedVariable(scaled, temperature=var.temperature)


def apply_backaction(
    probs: Mapping[str, float],
    target: Mapping[str, float],
    mu: float,
) -> Dict[str, float]:
    """AM-07 backaction p' = (1-μ) p + μ q."""
    mu = min(max(mu, 0.0), 1.0)
    keys = set(probs) | set(target)
    updated = {}
    for state in keys:
        p = probs.get(state, 0.0)
        q = target.get(state, 0.0)
        updated[state] = (1.0 - mu) * p + mu * q  # AM-07
    total = sum(updated.values())
    if total <= EPS:
        # fallback to uniform if target cancelled everything
        size = len(keys)
        return {state: 1.0 / size for state in keys}
    return {state: val / total for state, val in updated.items()}


class Orchestrator:
    """Conscious-style orchestrator managing measurements and coherence."""

    def __init__(self, budget: CoherenceBudget, rng: np.random.Generator | None = None) -> None:
        self.budget = budget
        self.rng = rng or np.random.default_rng(0)

    def measure(
        self,
        agent: Agent,
        var_name: str,
        config: MeasurementConfig,
        mode: str = "belief",
        context: ContextBasis | None = None,
    ) -> str | Dict[str, float]:
        variable = agent.get_variable(mode, var_name)
        effective_strength = self.budget.allow(config.strength)
        if effective_strength < config.strength:
            # downgrade measurement if budget insufficient
            config = MeasurementConfig(strength=effective_strength, temperature_shift=config.temperature_shift)
        # apply optional context reweighting
        working = variable.copy()
        if context is not None:
            working = context.apply(working)
        probs = working.probabilities()
        if effective_strength >= 0.95:
            states, weights = zip(*probs.items())
            cumulative = np.cumsum(weights)
            r = float(self.rng.random())
            idx = int(np.searchsorted(cumulative, r, side="right"))
            idx = min(idx, len(states) - 1)
            outcome = states[idx]
            target = {state: 1.0 if state == outcome else 0.0 for state in states}
        else:
            exponent = 1.0 + effective_strength
            weighted = {}
            for state, p in probs.items():
                context_weight = 1.0
                if context is not None:
                    context_weight = context.weights.get(state, 1.0)
                weighted[state] = max(p, EPS) ** exponent * context_weight
            total = sum(weighted.values())
            if total <= EPS:
                weighted = {state: 1.0 for state in probs}
                total = float(len(weighted))
            target = {state: val / total for state, val in weighted.items()}
            outcome = "distribution"
        updated_probs = apply_backaction(probs, target, effective_strength)
        variable.update_probabilities(updated_probs)
        variable.apply_temperature_shift(config.temperature_shift)
        agent.ambient_temperature = max(EPS, agent.ambient_temperature + config.temperature_shift)
        self.budget.consume(effective_strength)
        return outcome if outcome != "distribution" else updated_probs


if __name__ == "__main__":
    # Demo run showing weak vs. strong measurement effects.
    belief = SuperposedVariable(
        {
            "launch_now": 0.6 + 0.2j,
            "delay": 0.5 - 0.3j,
            "pivot": 0.3 + 0.4j,
        }
    )
    identity = SuperposedVariable(
        {
            "visionary": 0.7 + 0.0j,
            "guardian": 0.4 + 0.5j,
        }
    )
    agent = Agent(
        name="BlackRoad-Strategist",
        beliefs={"launch_roadchain": belief},
        identities={"core_identity": identity},
        intents={},
    )
    budget = CoherenceBudget(value=1.5, cost_factor=0.6)
    orchestrator = Orchestrator(budget)

    def report(stage: str) -> None:
        probs = agent.get_variable("belief", "launch_roadchain").probabilities()
        entropy = agent.get_variable("belief", "launch_roadchain").entropy()
        phase_gap = agent.get_variable("belief", "launch_roadchain").phase_gap()
        contradiction = agent.get_variable("belief", "launch_roadchain").contradiction_energy()
        identity_entropy = agent.identity_entropy()
        print(f"\n[{stage}]")
        print("Probabilities:", {k: round(v, 4) for k, v in probs.items()})
        print("Entropy (bits):", round(entropy, 4))
        print("Phase gap δ (rad):", round(phase_gap, 4))
        print("Contradiction energy K:", round(contradiction, 4))
        print("Coherence budget B:", round(budget.value, 4))
        print("Identity entropy H_I:", round(identity_entropy, 4))

    report("Initial")

    soft_config = MeasurementConfig(strength=0.1, temperature_shift=0.1)
    soft_result = orchestrator.measure(agent, "launch_roadchain", soft_config, mode="belief")
    report("After soft measurement")
    print("Soft measurement returned distribution:", {k: round(v, 4) for k, v in soft_result.items()})

    hard_config = MeasurementConfig(strength=1.0, temperature_shift=-0.5)
    hard_outcome = orchestrator.measure(agent, "launch_roadchain", hard_config, mode="belief")
    report("After hard measurement")
    print("Hard measurement outcome:", hard_outcome)
