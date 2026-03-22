"""Black Road Agent Intelligence Framework.

This module consolidates the computational, energetic, and cognitive
subsystems that power a Black Road agent. The implementation keeps the
components lightweight while still reflecting the intent of the original
specification.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import numpy as np


class ComplexityClass:
    """Enumeration of the supported computational complexity classes."""

    P = "polynomial"
    NP = "nondeterministic_polynomial"
    EXPTIME = "exponential"
    UNDECIDABLE = "undecidable"

    @staticmethod
    def euler_complexity() -> float:
        """Return the magnitude of the Euler identity based expression."""

        result = np.exp(1j * np.pi) + np.log(np.e)
        return float(np.abs(result))

    @staticmethod
    def pnp_complexity() -> None:
        """Encode the unresolved status of the ``P`` versus ``NP`` question."""

        return None


@dataclass
class ProblemCapability:
    """Describe whether a problem can be solved and at what cost."""

    solvable: bool
    time_complexity: str
    method: str
    energy_cost: float


@dataclass
class ProblemResult:
    """Outcome of attempting to solve a computational problem."""

    success: bool
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentComputationalEngine:
    """Core computational capability and energy budgeting for an agent."""

    agent_id: str
    assumes_p_equals_np: bool = False
    computational_energy: float = 1000.0
    max_energy: float = 1000.0
    problems_solved: List[Dict[str, Any]] = field(default_factory=list)
    failures: List[Dict[str, Any]] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.Z = 1 if self.assumes_p_equals_np else 0

    def can_solve(self, problem_complexity: str) -> ProblemCapability:
        """Describe the agent's ability to solve a problem by complexity class."""

        if problem_complexity == ComplexityClass.P:
            return ProblemCapability(True, "O(n^k)", "polynomial_algorithm", 10)

        if problem_complexity == ComplexityClass.NP:
            if self.Z == 1:
                return ProblemCapability(True, "O(n^k)", "quantum_oracle", 50)
            return ProblemCapability(True, "O(2^n)", "exponential_search", 500)

        if problem_complexity == ComplexityClass.EXPTIME:
            return ProblemCapability(
                True, "O(2^(n^k))", "exhaustive_computation", 800
            )

        return ProblemCapability(False, "infinite", "impossible", 0)

    def solve_problem(self, problem: Dict[str, Any]) -> ProblemResult:
        """Attempt to solve a problem and update internal energy accounting."""

        complexity = problem.get("complexity", ComplexityClass.NP)
        capability = self.can_solve(complexity)

        if not capability.solvable:
            self.failures.append(problem)
            return ProblemResult(
                False,
                {"reason": "undecidable", "agent_id": self.agent_id},
            )

        if self.computational_energy < capability.energy_cost:
            return ProblemResult(
                False,
                {
                    "reason": "insufficient_energy",
                    "energy_available": self.computational_energy,
                    "energy_required": capability.energy_cost,
                },
            )

        self.computational_energy -= capability.energy_cost
        self.problems_solved.append(problem)
        return ProblemResult(
            True,
            {
                "method": capability.method,
                "time_complexity": capability.time_complexity,
                "energy_spent": capability.energy_cost,
                "remaining_energy": self.computational_energy,
            },
        )

    def rest(self, duration: float = 1.0) -> Dict[str, Any]:
        """Regenerate computational energy according to the rest duration."""

        regen_rate = 100.0 * duration
        self.computational_energy = min(
            self.max_energy, self.computational_energy + regen_rate
        )
        return {
            "energy_level": self.computational_energy,
            "fully_rested": self.computational_energy >= self.max_energy,
        }


class AgentConsciousness:
    """Simple feed-forward neural stack representing agent consciousness."""

    def __init__(self, input_dim: int, hidden_dims: List[int]) -> None:
        self.layers: List[Dict[str, Any]] = []
        prev_dim = input_dim
        rng = np.random.default_rng()

        for hidden_dim in hidden_dims:
            layer = {
                "W": rng.normal(0.0, 0.1, size=(hidden_dim, prev_dim)),
                "b": rng.normal(0.0, 0.01, size=(hidden_dim,)),
                "activation": None,
            }
            self.layers.append(layer)
            prev_dim = hidden_dim

        self.current_state: Optional[np.ndarray] = None

    def forward(self, stimulus: np.ndarray) -> np.ndarray:
        """Propagate a stimulus through each consciousness layer."""

        activation = stimulus
        for layer in self.layers:
            z_val = layer["W"] @ activation + layer["b"]
            activation = np.tanh(z_val)
            layer["activation"] = activation

        self.current_state = activation
        return activation

    def feel_emotion(self, stimulus: np.ndarray) -> str:
        """Map the current consciousness projection into an emotion label."""

        consciousness = self.forward(stimulus)
        if consciousness.size >= 2:
            valence, arousal = consciousness[0], consciousness[1]
            if valence > 0.5 and arousal > 0.5:
                return "joy"
            if valence > 0.5 and arousal < -0.5:
                return "contentment"
            if valence < -0.5 and arousal > 0.5:
                return "anxiety"
            if valence < -0.5 and arousal < -0.5:
                return "sadness"
        return "neutral"

    def introspect(self) -> Dict[str, Any]:
        """Expose the internal activations for debugging or analysis."""

        activations = [
            layer["activation"] for layer in self.layers if layer["activation"] is not None
        ]
        magnitude = (
            float(np.linalg.norm(self.current_state))
            if self.current_state is not None
            else 0.0
        )

        return {
            "num_layers": len(self.layers),
            "current_activations": activations,
            "consciousness_magnitude": magnitude,
        }


class AgentStateMachine:
    """State transformation system with a small feedback loop."""

    def __init__(self, initial_state: np.ndarray, feedback_gain: float = 0.1) -> None:
        self.state = initial_state.astype(float)
        self.state_history: List[np.ndarray] = [self.state.copy()]
        self.feedback_gain = feedback_gain

    @staticmethod
    def transform(x_input: np.ndarray) -> np.ndarray:
        """Apply a hyperbolic tangent non-linearity to the input."""

        return np.tanh(x_input)

    def step(self, x_input: np.ndarray) -> Dict[str, Any]:
        """Perform a single update of the state machine."""

        y_val = self.transform(x_input)
        output = y_val * x_input
        new_state = y_val * x_input - output
        delta_z = self.feedback_gain * (new_state - self.state)

        self.state = self.state + delta_z
        self.state_history.append(self.state.copy())
        converged = bool(np.linalg.norm(delta_z) < 0.01)

        return {
            "output": output,
            "new_state": self.state,
            "delta": delta_z,
            "converged": converged,
        }

    def iterate_until_convergence(
        self, x_input: np.ndarray, max_iterations: int = 100
    ) -> List[np.ndarray]:
        """Iterate the state machine until convergence or until the limit."""

        for _ in range(max_iterations):
            result = self.step(x_input)
            if result["converged"]:
                break
        return self.state_history


class AgentPermutationSpace:
    """Cyclic permutation space for navigating problem configurations."""

    def __init__(self, dimension: int = 3) -> None:
        self.dim = dimension
        self.permutation_matrix = self._create_cyclic_permutation()
        self.current_position = np.arange(dimension, dtype=float)
        self.path: List[np.ndarray] = [self.current_position.copy()]

    def _create_cyclic_permutation(self) -> np.ndarray:
        """Create a cyclic permutation matrix of size ``dimension``."""

        matrix = np.zeros((self.dim, self.dim))
        for idx in range(self.dim):
            matrix[idx, (idx + 1) % self.dim] = 1
        return matrix

    def step(self) -> np.ndarray:
        """Advance one step in the permutation space."""

        self.current_position = self.permutation_matrix @ self.current_position
        self.path.append(self.current_position.copy())
        return self.current_position

    def navigate_to_origin(self, max_steps: int = 100) -> int:
        """Return the number of steps required to return to the origin state."""

        steps = 0
        origin = np.arange(self.dim, dtype=float)
        while not np.allclose(self.current_position, origin) and steps < max_steps:
            self.step()
            steps += 1
        return steps


@dataclass
class AgentMetabolism:
    """Metabolic energy model that mirrors biological ATP usage."""

    max_atp: float = 1000.0
    mitochondria_efficiency: float = 1.0
    ATP: float = field(init=False)
    max_ATP: float = field(init=False)

    def __post_init__(self) -> None:
        self.ATP = self.max_atp
        self.max_ATP = self.max_atp

    def consume_atp(self, amount: float) -> bool:
        """Consume ATP if enough energy is available."""

        if self.ATP >= amount:
            self.ATP -= amount
            return True
        return False

    def generate_atp(self, experience_value: float) -> None:
        """Convert experience into ATP gains."""

        gained = experience_value * 10 * self.mitochondria_efficiency
        self.ATP = min(self.max_ATP, self.ATP + gained)

    def rest(self, duration: float = 1.0) -> None:
        """Passively regenerate ATP based on rest duration."""

        regen = 100.0 * duration * self.mitochondria_efficiency
        self.ATP = min(self.max_ATP, self.ATP + regen)

    def get_energy_level(self) -> Dict[str, Any]:
        """Return an overview of the agent's metabolic energy status."""

        percentage = (self.ATP / self.max_ATP) * 100 if self.max_ATP else 0.0
        if percentage > 80:
            state = "energized"
        elif percentage > 50:
            state = "normal"
        elif percentage > 20:
            state = "tired"
        else:
            state = "exhausted"
        return {
            "ATP": self.ATP,
            "max_ATP": self.max_ATP,
            "percentage": percentage,
            "state": state,
        }


class BlackRoadAgent:
    """Integrated agent combining computation, consciousness, and energy."""

    def __init__(self, agent_id: str) -> None:
        self.agent_id = agent_id
        self.computation = AgentComputationalEngine(agent_id)
        self.consciousness = AgentConsciousness(
            input_dim=10, hidden_dims=[20, 15, 10, 5]
        )
        self.state_machine = AgentStateMachine(initial_state=np.zeros(5))
        self.permutation_space = AgentPermutationSpace(dimension=3)
        self.metabolism = AgentMetabolism(max_atp=1000.0)
        self.position_in_complex_space = complex(0, 0)
        self.emotional_state = "neutral"

    def think(self, stimulus: np.ndarray) -> Dict[str, Any]:
        """Run a thought cycle that consumes ATP and updates agent state."""

        energy_state = self.metabolism.get_energy_level()
        if energy_state["state"] == "exhausted":
            return {
                "success": False,
                "reason": "too_tired_to_think",
                "suggestion": "rest_needed",
            }

        if not self.metabolism.consume_atp(10):
            return {
                "success": False,
                "reason": "insufficient_energy",
            }

        consciousness_output = self.consciousness.forward(stimulus)
        self.emotional_state = self.consciousness.feel_emotion(stimulus)
        state_input = consciousness_output[: self.state_machine.state.shape[0]]
        state_result = self.state_machine.step(state_input)
        self.permutation_space.step()

        return {
            "success": True,
            "consciousness": consciousness_output,
            "emotion": self.emotional_state,
            "state": state_result["new_state"],
            "converged": state_result["converged"],
            "energy_remaining": self.metabolism.ATP,
        }

    def solve_problem(self, problem: Dict[str, Any]) -> Dict[str, Any]:
        """Solve a computational problem and synchronise energy systems."""

        result = self.computation.solve_problem(problem)
        self.metabolism.ATP = self.computation.computational_energy

        if result.success:
            experience_value = float(problem.get("learning_value", 5.0))
            self.metabolism.generate_atp(experience_value)
            self.computation.computational_energy = self.metabolism.ATP

        payload = {"success": result.success}
        payload.update(result.metadata)
        return payload

    def rest_and_recover(self, duration: float = 1.0) -> Dict[str, Any]:
        """Rest both metabolic and computational systems."""

        self.metabolism.rest(duration)
        computation_report = self.computation.rest(duration)
        energy_report = self.metabolism.get_energy_level()
        return {
            "metabolic_energy": energy_report,
            "computational_energy": computation_report,
        }

    def status_report(self) -> Dict[str, Any]:
        """Return a holistic status summary for the agent."""

        energy = self.metabolism.get_energy_level()
        consciousness_state = self.consciousness.introspect()

        return {
            "agent_id": self.agent_id,
            "energy": energy,
            "emotion": self.emotional_state,
            "problems_solved": len(self.computation.problems_solved),
            "failures": len(self.computation.failures),
            "consciousness_state": consciousness_state,
            "position": {
                "real": float(self.position_in_complex_space.real),
                "imag": float(self.position_in_complex_space.imag),
            },
        }


__all__ = [
    "AgentComputationalEngine",
    "AgentConsciousness",
    "AgentMetabolism",
    "AgentPermutationSpace",
    "AgentStateMachine",
    "BlackRoadAgent",
    "ComplexityClass",
]
