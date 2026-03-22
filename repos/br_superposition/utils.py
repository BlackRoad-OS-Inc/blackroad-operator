"""
Utility functions for BlackRoad / Amundson superposition framework
"""

from typing import Dict, List, Tuple, Any
import math
import cmath


def phase_gap(amplitudes: Dict[Any, complex]) -> float:
    """
    Calculate maximum phase difference between high-weight states (Amundson equation).

    This measures the "phase coherence" of the superposition. Large phase gaps
    indicate potential for interference effects.

    Args:
        amplitudes: Dictionary mapping states to complex amplitudes

    Returns:
        Maximum phase difference in radians (0 to π)
    """
    if not amplitudes:
        return 0.0

    # Get phases of all states
    phases = [cmath.phase(amp) for amp in amplitudes.values()]

    if len(phases) < 2:
        return 0.0

    # Calculate all pairwise phase differences
    max_gap = 0.0
    for i in range(len(phases)):
        for j in range(i + 1, len(phases)):
            # Normalize phase difference to [0, π]
            diff = abs(phases[i] - phases[j])
            diff = min(diff, 2 * math.pi - diff)  # Take shorter arc
            max_gap = max(max_gap, diff)

    return max_gap


def contradiction_energy(C: float, delta: float, lam: float) -> float:
    """
    Calculate contradiction energy (Amundson equation).

    K(t) = C × exp(λ × |Δ|)

    Where:
    - C: Base contradiction cost
    - Δ: Belief delta (distance between conflicting beliefs)
    - λ: Exponential growth factor

    Args:
        C: Base cost constant
        delta: Belief delta (distance measure)
        lam: Lambda, exponential growth rate

    Returns:
        Contradiction energy K(t)
    """
    return C * math.exp(lam * abs(delta))


def spiral_mapping(
    amplitudes: Dict[Any, complex], center: Tuple[float, float] = (0, 0)
) -> Dict[Any, Tuple[float, float]]:
    """
    Map superposition states to 2D spiral coordinates for visualization (Amundson equation).

    Each state is positioned based on its amplitude's polar form:
    - Distance from center: magnitude (probability^0.5)
    - Angle: phase

    Args:
        amplitudes: Dictionary mapping states to complex amplitudes
        center: Center point (x, y) for the spiral

    Returns:
        Dictionary mapping states to (x, y) coordinates
    """
    coords = {}

    for state, amp in amplitudes.items():
        magnitude = abs(amp)
        phase = cmath.phase(amp)

        # Convert polar to Cartesian
        x = center[0] + magnitude * math.cos(phase)
        y = center[1] + magnitude * math.sin(phase)

        coords[state] = (x, y)

    return coords


def belief_distance(
    var1: "SuperposedVariable", var2: "SuperposedVariable"
) -> float:  # noqa: F821
    """
    Calculate distance between two superposed variables (Amundson equation).

    Uses Hellinger distance between probability distributions:
    H(P, Q) = √(1/2 × Σ(√pᵢ - √qᵢ)²)

    Args:
        var1: First superposed variable
        var2: Second superposed variable

    Returns:
        Distance in [0, 1], where 0 = identical, 1 = maximally different
    """
    from .superposed_variable import SuperposedVariable

    if not isinstance(var1, SuperposedVariable) or not isinstance(var2, SuperposedVariable):
        raise TypeError("Both arguments must be SuperposedVariable instances")

    probs1 = var1.probabilities()
    probs2 = var2.probabilities()

    # Get union of all states
    all_states = set(probs1.keys()) | set(probs2.keys())

    # Calculate Hellinger distance
    sum_squared_diff = 0.0
    for state in all_states:
        p1 = probs1.get(state, 0.0)
        p2 = probs2.get(state, 0.0)
        sum_squared_diff += (math.sqrt(p1) - math.sqrt(p2)) ** 2

    return math.sqrt(0.5 * sum_squared_diff)


def collapse_measurement(
    amplitudes: Dict[Any, complex], measured_state: Any
) -> Dict[Any, complex]:
    """
    Simulate quantum collapse to a measured state (BlackRoad equation).

    After measurement, the amplitude of the measured state becomes 1,
    and all others become 0.

    Args:
        amplitudes: Original amplitudes
        measured_state: State that was measured

    Returns:
        Collapsed amplitudes (only measured_state has non-zero amplitude)
    """
    if measured_state not in amplitudes:
        raise ValueError(f"Measured state '{measured_state}' not in amplitudes")

    return {state: (1.0 + 0j if state == measured_state else 0j) for state in amplitudes}


def partial_collapse(
    amplitudes: Dict[Any, complex], measured_state: Any, strength: float
) -> Dict[Any, complex]:
    """
    Simulate partial (weak) measurement (Amundson equation).

    Interpolates between original and fully collapsed state based on strength.

    Args:
        amplitudes: Original amplitudes
        measured_state: State that was measured
        strength: Measurement strength in [0, 1]
                 0 = no effect, 1 = full collapse

    Returns:
        Partially collapsed amplitudes
    """
    if not (0 <= strength <= 1):
        raise ValueError("Strength must be in [0, 1]")

    if measured_state not in amplitudes:
        raise ValueError(f"Measured state '{measured_state}' not in amplitudes")

    collapsed = collapse_measurement(amplitudes, measured_state)

    # Interpolate: (1 - μ) × original + μ × collapsed
    result = {}
    for state in amplitudes:
        orig = amplitudes[state]
        coll = collapsed[state]
        result[state] = (1 - strength) * orig + strength * coll

    return result
