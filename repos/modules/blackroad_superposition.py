"""BlackRoad Superposition Architecture primitives.

This module implements the equation taxonomy described in the BlackRoad
Superposition Architecture meta-prompt. It differentiates between the adopted
BlackRoad equations (BR-xx) and the newly defined Amundson equations (AM-xx)
within docstrings and comments for clarity.
"""

from __future__ import annotations

import cmath
import hashlib
import math
import random
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Mapping, MutableMapping, Optional, Tuple


def _normalized_phase(angle: float) -> float:
    """Normalize an angle to the ``[-pi, pi]`` range."""

    return math.atan2(math.sin(angle), math.cos(angle))


@dataclass
class SuperposedVariable:
    """State vector container using **BlackRoad Equation BR-02**.

    The amplitudes dictionary maps basis labels to complex amplitudes. Probable
    outcomes are derived using **BlackRoad Equation BR-01 (Born Rule)**, while
    entropy calculations reference **BlackRoad Equation BR-05**.
    """

    amplitudes: MutableMapping[str, complex]

    def copy(self) -> "SuperposedVariable":
        """Return a shallow copy of the superposed variable."""

        return SuperposedVariable(dict(self.amplitudes))

    # BR-01
    def probabilities(self) -> Dict[str, float]:
        """Compute measurement probabilities via **BR-01 (Born Rule)**."""

        total = sum(abs(amplitude) ** 2 for amplitude in self.amplitudes.values())
        if total == 0:
            raise ValueError("Cannot compute probabilities for zero amplitude state vector.")
        return {
            state: (abs(amplitude) ** 2) / total
            for state, amplitude in self.amplitudes.items()
        }

    # BR-05 and AM-05 when applied to identity states
    def entropy(self, *, base: float = math.e) -> float:
        """Return the Shannon entropy of the amplitudes using **BR-05**.

        The entropy acts as the **Amundson AM-05 identity superposition metric**
        when applied to identity amplitudes. The ``base`` argument allows the
        caller to switch between natural units (``e``) and bits (``2``).
        """

        probabilities = self.probabilities()
        if base <= 0 or base == 1:
            raise ValueError("Entropy base must be positive and not equal to 1.")

        log_base = math.log(base)
        entropy_value = -sum(
            probability * math.log(probability)
            for probability in probabilities.values()
            if probability > 0
        )
        return entropy_value / log_base

    # BR-04
    def phases(self) -> Dict[str, float]:
        """Return the phase of each amplitude using **BR-04 (polar form)**."""

        return {state: cmath.phase(amplitude) for state, amplitude in self.amplitudes.items()}

    def with_temperature(self, temperature: float) -> "SuperposedVariable":
        """Apply **AM-03** temperature transform to the amplitude magnitudes."""

        if temperature <= 0:
            raise ValueError("Temperature must be positive.")

        probabilities = self.probabilities()
        transformed_weights = {
            state: probability ** (1.0 / temperature)
            for state, probability in probabilities.items()
        }
        normalizer = sum(transformed_weights.values())
        if normalizer == 0:
            raise ValueError("Temperature transform resulted in zero normalization constant.")

        new_amplitudes: Dict[str, complex] = {}
        for state, weight in transformed_weights.items():
            if weight == 0:
                new_amplitudes[state] = 0j
                continue
            theta = cmath.phase(self.amplitudes[state])
            magnitude = math.sqrt(weight / normalizer)
            new_amplitudes[state] = cmath.rect(magnitude, theta)
        return SuperposedVariable(new_amplitudes)

    def collapse(self, outcome: str) -> "SuperposedVariable":
        """Collapse the state to ``outcome`` (hard measurement per **BR-01**)."""

        if outcome not in self.amplitudes:
            raise KeyError(f"Outcome '{outcome}' not part of the superposed variable.")
        final_phase = cmath.phase(self.amplitudes[outcome]) if self.amplitudes[outcome] else 0.0
        collapsed = {
            state: (cmath.rect(1.0, final_phase) if state == outcome else 0j)
            for state in self.amplitudes
        }
        return SuperposedVariable(collapsed)

    def with_phase_offsets(self, offsets: Mapping[str, float]) -> "SuperposedVariable":
        """Return a new variable with additional phase offsets (supports **AM-02**)."""

        return SuperposedVariable(
            {
                state: amplitude * cmath.rect(1.0, offsets.get(state, 0.0))
                for state, amplitude in self.amplitudes.items()
            }
        )


def phase_gap(variable: SuperposedVariable, *, top_n: Optional[int] = None) -> float:
    """Compute **AM-02** cognitive phase gap ``\u03b4_t``.

    The function selects the ``top_n`` states by probability (all states if the
    argument is ``None``) and returns the maximum angular separation between any
    pair of phases.
    """

    probabilities = variable.probabilities()
    sorted_states = sorted(probabilities.items(), key=lambda item: item[1], reverse=True)
    if top_n is not None:
        sorted_states = sorted_states[:top_n]

    phases = [cmath.phase(variable.amplitudes[state]) for state, _ in sorted_states if variable.amplitudes[state] != 0]
    if len(phases) < 2:
        return 0.0

    max_gap = 0.0
    for i, theta_i in enumerate(phases):
        for theta_j in phases[i + 1 :]:
            delta = _normalized_phase(theta_i - theta_j)
            max_gap = max(max_gap, abs(delta))
    return max_gap


def contradiction_energy(capacity: float, delta: float, lam: float) -> float:
    """Compute **AM-01** contradiction energy ``K(t)``."""

    return capacity * math.exp(lam * abs(delta))


def spiral_mapping(
    variable: SuperposedVariable,
    *,
    radius_fn: Optional[Callable[[float], float]] = None,
) -> List[Tuple[str, float, float]]:
    """Return **AM-04** spiral coordinates ``(x, y)`` for plotting amplitudes.

    ``radius_fn`` allows callers to remap amplitude magnitudes (default identity).
    The returned list contains ``(state, x, y)`` tuples ready for polar scatter
    visualizations.
    """

    coords: List[Tuple[str, float, float]] = []
    for index, (state, amplitude) in enumerate(variable.amplitudes.items()):
        magnitude = abs(amplitude)
        radius = radius_fn(magnitude) if radius_fn is not None else magnitude
        theta = cmath.phase(amplitude) + 0.15 * index  # deterministic unwrapping for clarity
        x = radius * math.cos(theta)
        y = radius * math.sin(theta)
        coords.append((state, x, y))
    return coords


@dataclass
class MeasurementPolicy:
    """Measurement selection strategy for orchestrators.

    The policy compares contradiction energy (**AM-01**) against a threshold and
    chooses hard (**BR-01**) or soft measurements accordingly.
    """

    hard_threshold: float = math.inf
    lam: float = 1.0
    temperature_soft: float = 1.0
    temperature_hard: float = 0.25

    def decide(self, capacity: float, delta: float) -> str:
        """Return ``"hard"`` or ``"soft"`` based on the contradiction energy."""

        energy = contradiction_energy(capacity, delta, self.lam)
        return "hard" if energy >= self.hard_threshold else "soft"


@dataclass
class Agent:
    """Agent with superposed beliefs, identities, and intentions."""

    name: str
    beliefs: SuperposedVariable
    identities: SuperposedVariable
    intentions: SuperposedVariable
    policy: MeasurementPolicy = field(default_factory=MeasurementPolicy)

    def measure_hard(self, variable: SuperposedVariable) -> str:
        """Perform a hard measurement, collapsing the variable (uses **BR-01**)."""

        probabilities = variable.probabilities()
        outcomes, weights = zip(*probabilities.items())
        chosen = random.choices(outcomes, weights=weights, k=1)[0]
        collapsed = variable.collapse(chosen)
        variable.amplitudes = collapsed.amplitudes
        return chosen

    def measure_soft(self, variable: SuperposedVariable, *, temperature: Optional[float] = None) -> Dict[str, float]:
        """Perform a soft measurement, optionally applying **AM-03** temperature."""

        if temperature is None or math.isclose(temperature, 1.0):
            return variable.probabilities()
        warmed = variable.with_temperature(temperature)
        variable.amplitudes = warmed.amplitudes
        return warmed.probabilities()

    def measure_identity(self, context: str, *, capacity: float = 1.0) -> Tuple[str, Dict[str, float]]:
        """Measure the identity register in a context-aligned basis (supports **AM-02**)."""

        offsets = {
            state: _context_phase_offset(context, state)
            for state in self.identities.amplitudes
        }
        adjusted = self.identities.with_phase_offsets(offsets)
        delta = phase_gap(adjusted, top_n=3)
        mode = self.policy.decide(capacity, delta)

        if mode == "hard":
            outcome = self.measure_hard(adjusted)
            self.identities = adjusted
            return mode, {outcome: 1.0}

        distribution = self.measure_soft(adjusted, temperature=self.policy.temperature_soft)
        self.identities = adjusted
        return mode, distribution

    def identity_entropy(self, *, base: float = math.e) -> float:
        """Return the identity entropy using **AM-05** via ``SuperposedVariable.entropy``."""

        return self.identities.entropy(base=base)


def _context_phase_offset(context: str, state: str) -> float:
    """Deterministic phase offset derived from context/state (supports **AM-02**)."""

    digest = hashlib.sha256(f"{context}:{state}".encode("utf-8")).digest()
    integer = int.from_bytes(digest[:8], "big")
    return (integer / 2**64) * 2 * math.pi


def _demo_agent() -> Agent:
    """Create a demo agent to showcase module behavior."""

    beliefs = SuperposedVariable(
        {
            "bullish": cmath.rect(0.6, math.pi / 6),
            "bearish": cmath.rect(0.5, -math.pi / 3),
            "wait": cmath.rect(0.3, math.pi / 2),
        }
    )
    identities = SuperposedVariable(
        {
            "researcher": cmath.rect(0.7, math.pi / 5),
            "trader": cmath.rect(0.5, -math.pi / 4),
            "compliance_officer": cmath.rect(0.4, math.pi / 7),
            "founder": cmath.rect(0.2, -math.pi / 2),
        }
    )
    intentions = SuperposedVariable(
        {
            "explore": cmath.rect(0.8, math.pi / 8),
            "deploy": cmath.rect(0.3, -math.pi / 6),
            "archive": cmath.rect(0.2, math.pi / 3),
        }
    )
    policy = MeasurementPolicy(hard_threshold=2.0, lam=1.1, temperature_soft=1.15, temperature_hard=0.2)
    return Agent("Cecilia", beliefs, identities, intentions, policy)


if __name__ == "__main__":
    agent = _demo_agent()

    # Demonstrate AM-02 and AM-01 on beliefs
    delta = phase_gap(agent.beliefs, top_n=3)
    energy = contradiction_energy(capacity=1.0, delta=delta, lam=agent.policy.lam)
    print(f"Belief phase gap δ_t={delta:.3f} rad, contradiction energy K(t)={energy:.3f}")

    soft_distribution = agent.measure_soft(agent.beliefs.copy(), temperature=agent.policy.temperature_soft)
    print("Soft measurement distribution (beliefs):", soft_distribution)

    hard_outcome = agent.measure_hard(agent.beliefs)
    print("Hard measurement outcome (beliefs):", hard_outcome)

    # Demonstrate AM-05 identity entropy and contextual measurement
    print(f"Identity entropy before context: {agent.identity_entropy():.3f}")
    mode, payload = agent.measure_identity("governance_committee", capacity=1.5)
    print(f"Identity measurement mode={mode}, payload={payload}")
    print(f"Identity entropy after context: {agent.identity_entropy():.3f}")

    # Spiral coordinates for visualization hooks (AM-04)
    spiral_coords = spiral_mapping(agent.intentions)
    print("Spiral mapping coordinates (intentions):", spiral_coords)
