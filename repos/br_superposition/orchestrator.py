"""
Orchestrator: Manages measurement operations with coherence budget tracking
"""

from typing import Any, Optional, Literal
from dataclasses import dataclass
from .agent import Agent


@dataclass
class CoherenceBudget:
    """
    Tracks available "coherence budget" for measurement operations.

    Measurements consume coherence budget. When depleted, the system
    may need to pause or adjust measurement strategies.
    """

    value: float

    def consume(self, amount: float) -> bool:
        """
        Attempt to consume coherence budget.

        Args:
            amount: Amount to consume

        Returns:
            True if consumption succeeded, False if insufficient budget
        """
        if amount < 0:
            raise ValueError("Cannot consume negative amount")

        if self.value >= amount:
            self.value -= amount
            return True
        return False

    def replenish(self, amount: float) -> None:
        """
        Add to the coherence budget.

        Args:
            amount: Amount to add
        """
        if amount < 0:
            raise ValueError("Cannot replenish negative amount")
        self.value += amount

    def is_depleted(self) -> bool:
        """
        Check if budget is depleted (at or below zero).

        Returns:
            True if depleted
        """
        return self.value <= 0


@dataclass
class MeasurementConfig:
    """
    Configuration for a measurement operation.

    Attributes:
        strength: Measurement strength μ in [0, 1]
                 0 = no effect, 1 = full collapse
        temperature_shift: Optional temperature adjustment after measurement
        cost_multiplier: Multiplier for coherence budget consumption
    """

    strength: float
    temperature_shift: Optional[float] = None
    cost_multiplier: float = 1.0

    def __post_init__(self):
        if not (0 <= self.strength <= 1):
            raise ValueError("strength must be in [0, 1]")
        if self.cost_multiplier < 0:
            raise ValueError("cost_multiplier must be non-negative")


class Orchestrator:
    """
    Orchestrates measurement operations on agents with budget tracking.

    The orchestrator manages the quantum-inspired measurement protocol:
    1. Check coherence budget
    2. Perform measurement (hard or soft)
    3. Apply backaction: p'ᵢ = (1-μ)pᵢ + μqᵢ (Amundson equation)
    4. Consume budget
    5. Optionally apply temperature shifts
    """

    def __init__(self, coherence_budget: Optional[CoherenceBudget] = None):
        """
        Initialize orchestrator.

        Args:
            coherence_budget: Initial coherence budget (default: infinite)
        """
        self.coherence_budget = coherence_budget or CoherenceBudget(value=float("inf"))
        self.measurement_history: list = []

    def measure(
        self,
        agent: Agent,
        var_name: str,
        config: MeasurementConfig,
        mode: Literal["belief", "identity"] = "belief",
        outcome: Optional[Any] = None,
    ) -> tuple[Any, bool]:
        """
        Perform a measurement on an agent variable.

        Applies the full measurement protocol:
        1. Validates coherence budget
        2. Performs measurement based on strength
        3. Consumes budget
        4. Applies optional temperature shift
        5. Records measurement in history

        Args:
            agent: Agent to measure
            var_name: Name of variable to measure (for belief mode)
            config: Measurement configuration
            mode: "belief" or "identity"
            outcome: Optional specific outcome to measure

        Returns:
            Tuple of (measured_outcome, success)
            - measured_outcome: The measured state
            - success: True if budget was sufficient, False otherwise

        Raises:
            ValueError: If mode invalid or variable not found
        """
        # Calculate measurement cost (proportional to strength)
        cost = config.strength * config.cost_multiplier

        # Check budget
        if not self.coherence_budget.consume(cost):
            return (None, False)

        # Perform measurement based on mode and strength
        if mode == "belief":
            if config.strength >= 0.99:  # Treat near-1 as hard measurement
                measured_outcome = agent.measure_hard(var_name, outcome)
            else:
                measured_outcome = agent.measure_soft(var_name, config.strength, outcome)

            # Apply temperature shift if specified
            if config.temperature_shift is not None:
                belief = agent.get_belief(var_name)
                if belief is not None:
                    adjusted = belief.with_temperature(config.temperature_shift)
                    agent.add_belief(var_name, adjusted)

        elif mode == "identity":
            if config.strength >= 0.99:  # Treat near-1 as hard measurement
                measured_outcome = agent.measure_identity_hard(outcome)
            else:
                measured_outcome = agent.measure_identity_soft(config.strength, outcome)

            # Apply temperature shift if specified
            if config.temperature_shift is not None and agent.identities is not None:
                agent.identities = agent.identities.with_temperature(config.temperature_shift)

        else:
            raise ValueError(f"Invalid mode: {mode}. Must be 'belief' or 'identity'")

        # Record measurement
        self.measurement_history.append(
            {
                "var_name": var_name,
                "mode": mode,
                "strength": config.strength,
                "outcome": measured_outcome,
                "cost": cost,
                "remaining_budget": self.coherence_budget.value,
            }
        )

        return (measured_outcome, True)

    def get_budget(self) -> float:
        """
        Get current coherence budget value.

        Returns:
            Current budget value
        """
        return self.coherence_budget.value

    def replenish_budget(self, amount: float) -> None:
        """
        Add to the coherence budget.

        Args:
            amount: Amount to add
        """
        self.coherence_budget.replenish(amount)

    def reset_budget(self, new_value: float) -> None:
        """
        Reset coherence budget to a new value.

        Args:
            new_value: New budget value
        """
        if new_value < 0:
            raise ValueError("Budget value must be non-negative")
        self.coherence_budget.value = new_value

    def get_history(self) -> list:
        """
        Get measurement history.

        Returns:
            List of measurement records
        """
        return list(self.measurement_history)

    def clear_history(self) -> None:
        """
        Clear measurement history.
        """
        self.measurement_history = []
