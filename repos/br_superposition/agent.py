"""
Agent: Entity with superposed beliefs and identities
"""

from typing import Dict, Any, Optional
import random
from .superposed_variable import SuperposedVariable
from .utils import partial_collapse, collapse_measurement


class Agent:
    """
    An agent with quantum-inspired belief and identity states.

    The agent maintains:
    - beliefs: Dictionary of belief variables in superposition
    - identities: A single superposed variable representing possible agent identities

    Measurements can be "hard" (full collapse) or "soft" (partial collapse).
    """

    def __init__(
        self,
        beliefs: Optional[Dict[str, SuperposedVariable]] = None,
        identities: Optional[SuperposedVariable] = None,
    ):
        """
        Initialize an agent.

        Args:
            beliefs: Dictionary mapping belief variable names to SuperposedVariable instances
            identities: SuperposedVariable representing possible identities
        """
        self.beliefs = beliefs if beliefs is not None else {}
        self.identities = identities

    def add_belief(self, name: str, variable: SuperposedVariable) -> None:
        """
        Add or update a belief variable.

        Args:
            name: Name of the belief variable
            variable: SuperposedVariable instance
        """
        self.beliefs[name] = variable

    def get_belief(self, name: str) -> Optional[SuperposedVariable]:
        """
        Get a belief variable by name.

        Args:
            name: Name of the belief variable

        Returns:
            SuperposedVariable instance or None if not found
        """
        return self.beliefs.get(name)

    def measure_hard(self, var_name: str, outcome: Optional[Any] = None) -> Any:
        """
        Perform a hard (projective) measurement on a belief variable (BlackRoad equation).

        This collapses the superposition to a single state.

        Args:
            var_name: Name of the belief variable to measure
            outcome: Specific outcome to measure (if None, sample from probabilities)

        Returns:
            Measured state

        Raises:
            KeyError: If var_name not found
        """
        if var_name not in self.beliefs:
            raise KeyError(f"Belief '{var_name}' not found")

        variable = self.beliefs[var_name]
        probs = variable.probabilities()

        # Determine outcome
        if outcome is None:
            # Sample from probability distribution
            states = list(probs.keys())
            probabilities = [probs[s] for s in states]
            outcome = random.choices(states, weights=probabilities, k=1)[0]
        elif outcome not in probs:
            raise ValueError(f"Outcome '{outcome}' not in variable states")

        # Collapse to measured state
        collapsed_amplitudes = collapse_measurement(variable.amplitudes, outcome)
        self.beliefs[var_name] = SuperposedVariable(collapsed_amplitudes)

        return outcome

    def measure_soft(self, var_name: str, strength: float, outcome: Optional[Any] = None) -> Any:
        """
        Perform a soft (weak) measurement on a belief variable (Amundson equation).

        This partially collapses the superposition based on strength parameter.

        Args:
            var_name: Name of the belief variable to measure
            strength: Measurement strength in [0, 1]
                     0 = no effect, 1 = full collapse (equivalent to hard measurement)
            outcome: Specific outcome to measure (if None, sample from probabilities)

        Returns:
            Measured state

        Raises:
            KeyError: If var_name not found
            ValueError: If strength not in [0, 1]
        """
        if var_name not in self.beliefs:
            raise KeyError(f"Belief '{var_name}' not found")

        if not (0 <= strength <= 1):
            raise ValueError("Strength must be in [0, 1]")

        variable = self.beliefs[var_name]
        probs = variable.probabilities()

        # Determine outcome
        if outcome is None:
            # Sample from probability distribution
            states = list(probs.keys())
            probabilities = [probs[s] for s in states]
            outcome = random.choices(states, weights=probabilities, k=1)[0]
        elif outcome not in probs:
            raise ValueError(f"Outcome '{outcome}' not in variable states")

        # Partially collapse toward measured state
        new_amplitudes = partial_collapse(variable.amplitudes, outcome, strength)
        self.beliefs[var_name] = SuperposedVariable(new_amplitudes)

        return outcome

    def measure_identity_hard(self, outcome: Optional[Any] = None) -> Any:
        """
        Perform a hard measurement on agent identity (BlackRoad equation).

        Args:
            outcome: Specific outcome to measure (if None, sample from probabilities)

        Returns:
            Measured identity

        Raises:
            ValueError: If identities not set
        """
        if self.identities is None:
            raise ValueError("Agent has no identity superposition")

        probs = self.identities.probabilities()

        # Determine outcome
        if outcome is None:
            states = list(probs.keys())
            probabilities = [probs[s] for s in states]
            outcome = random.choices(states, weights=probabilities, k=1)[0]
        elif outcome not in probs:
            raise ValueError(f"Outcome '{outcome}' not in identity states")

        # Collapse to measured state
        collapsed_amplitudes = collapse_measurement(self.identities.amplitudes, outcome)
        self.identities = SuperposedVariable(collapsed_amplitudes)

        return outcome

    def measure_identity_soft(self, strength: float, outcome: Optional[Any] = None) -> Any:
        """
        Perform a soft measurement on agent identity (Amundson equation).

        Args:
            strength: Measurement strength in [0, 1]
            outcome: Specific outcome to measure (if None, sample from probabilities)

        Returns:
            Measured identity

        Raises:
            ValueError: If identities not set or strength invalid
        """
        if self.identities is None:
            raise ValueError("Agent has no identity superposition")

        if not (0 <= strength <= 1):
            raise ValueError("Strength must be in [0, 1]")

        probs = self.identities.probabilities()

        # Determine outcome
        if outcome is None:
            states = list(probs.keys())
            probabilities = [probs[s] for s in states]
            outcome = random.choices(states, weights=probabilities, k=1)[0]
        elif outcome not in probs:
            raise ValueError(f"Outcome '{outcome}' not in identity states")

        # Partially collapse toward measured state
        new_amplitudes = partial_collapse(self.identities.amplitudes, outcome, strength)
        self.identities = SuperposedVariable(new_amplitudes)

        return outcome

    def __repr__(self) -> str:
        belief_str = ", ".join(f"{name}: {var}" for name, var in self.beliefs.items())
        identity_str = str(self.identities) if self.identities else "None"
        return f"Agent(beliefs=[{belief_str}], identities={identity_str})"
