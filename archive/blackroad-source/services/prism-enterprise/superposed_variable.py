"""
SuperposedVariable: Quantum-inspired representation of belief states

This class implements the core superposition mechanics for agent beliefs and identities.
"""

from typing import Dict, Any
import math
import cmath


class SuperposedVariable:
    """
    Represents a variable in a superposition of multiple states.

    Each state has an associated complex amplitude, which determines its probability
    through the Born rule (BlackRoad equation).

    Attributes:
        amplitudes: Dictionary mapping state labels to complex amplitudes
    """

    def __init__(self, amplitudes: Dict[Any, complex]):
        """
        Initialize a superposed variable.

        Args:
            amplitudes: Dictionary mapping state values to complex amplitudes.
                       Example: {"true": 0.6+0.2j, "false": 0.4-0.1j}
        """
        if not amplitudes:
            raise ValueError("amplitudes cannot be empty")

        self.amplitudes = dict(amplitudes)
        self._normalize()

    def _normalize(self) -> None:
        """
        Normalize amplitudes so that sum of |a|² = 1 (BlackRoad equation: Born rule)
        """
        total = sum(abs(a) ** 2 for a in self.amplitudes.values())
        if total == 0:
            raise ValueError("Cannot normalize zero amplitudes")

        sqrt_total = math.sqrt(total)
        self.amplitudes = {k: v / sqrt_total for k, v in self.amplitudes.items()}

    def probabilities(self) -> Dict[Any, float]:
        """
        Calculate probabilities using Born rule (BlackRoad equation).

        Returns:
            Dictionary mapping states to their probabilities (|amplitude|²)
        """
        return {state: abs(amp) ** 2 for state, amp in self.amplitudes.items()}

    def entropy(self) -> float:
        """
        Calculate Shannon entropy of the probability distribution (BlackRoad equation).

        H = -Σ pᵢ log₂(pᵢ)

        Returns:
            Shannon entropy in bits. Higher values indicate more uncertainty.
        """
        probs = self.probabilities()
        entropy_value = 0.0

        for p in probs.values():
            if p > 0:  # Avoid log(0)
                entropy_value -= p * math.log2(p)

        return entropy_value

    def with_temperature(self, T: float) -> "SuperposedVariable":
        """
        Apply temperature transform (Amundson equation).

        Creates a new superposed variable with modified probabilities:
        pᵢ(T) ∝ pᵢ^(1/T)

        Args:
            T: Temperature parameter
               - T < 1: Sharpens distribution (more peaked)
               - T = 1: No change
               - T > 1: Flattens distribution (more uniform)

        Returns:
            New SuperposedVariable with temperature-adjusted amplitudes
        """
        if T <= 0:
            raise ValueError("Temperature must be positive")

        probs = self.probabilities()

        # Apply temperature transform: p'ᵢ ∝ pᵢ^(1/T) (Amundson equation)
        transformed_probs = {state: p ** (1.0 / T) for state, p in probs.items()}

        # Normalize transformed probabilities
        total = sum(transformed_probs.values())
        if total == 0:
            raise ValueError("Temperature transform resulted in zero probabilities")

        normalized_probs = {state: p / total for state, p in transformed_probs.items()}

        # Convert back to amplitudes (keep original phases)
        new_amplitudes = {}
        for state, new_prob in normalized_probs.items():
            original_amp = self.amplitudes[state]
            original_phase = cmath.phase(original_amp)
            new_magnitude = math.sqrt(new_prob)
            new_amplitudes[state] = cmath.rect(new_magnitude, original_phase)

        return SuperposedVariable(new_amplitudes)

    def phase(self, state: Any) -> float:
        """
        Get the phase angle of a specific state's amplitude.

        Args:
            state: State label

        Returns:
            Phase angle in radians
        """
        if state not in self.amplitudes:
            raise KeyError(f"State '{state}' not found")

        return cmath.phase(self.amplitudes[state])

    def magnitude(self, state: Any) -> float:
        """
        Get the magnitude of a specific state's amplitude.

        Args:
            state: State label

        Returns:
            Magnitude (absolute value) of the amplitude
        """
        if state not in self.amplitudes:
            raise KeyError(f"State '{state}' not found")

        return abs(self.amplitudes[state])

    def __repr__(self) -> str:
        probs = self.probabilities()
        items = [f"{state}: {prob:.3f}" for state, prob in sorted(probs.items())]
        return f"SuperposedVariable({', '.join(items)})"

    def __str__(self) -> str:
        return self.__repr__()
