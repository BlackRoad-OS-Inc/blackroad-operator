"""
Comprehensive tests for BlackRoad / Amundson superposition module
"""

import pytest
import math
from br_superposition import (
    SuperposedVariable,
    Agent,
    Orchestrator,
    CoherenceBudget,
    MeasurementConfig,
    phase_gap,
    contradiction_energy,
    spiral_mapping,
)


class TestSuperposedVariable:
    """Tests for SuperposedVariable class"""

    def test_initialization_and_normalization(self):
        """Test that amplitudes are normalized correctly"""
        amplitudes = {True: 2.0 + 0j, False: 1.0 + 0j}
        var = SuperposedVariable(amplitudes)

        probs = var.probabilities()
        assert abs(sum(probs.values()) - 1.0) < 1e-10

    def test_probabilities_born_rule(self):
        """Test Born rule: p = |a|²"""
        amplitudes = {True: 0.8 + 0j, False: 0.6 + 0j}
        var = SuperposedVariable(amplitudes)

        probs = var.probabilities()
        assert abs(probs[True] - 0.64) < 1e-10
        assert abs(probs[False] - 0.36) < 1e-10

    def test_entropy_calculation(self):
        """Test Shannon entropy calculation"""
        # Maximum entropy: equal probabilities
        amplitudes = {True: 1.0 + 0j, False: 1.0 + 0j}
        var = SuperposedVariable(amplitudes)
        assert abs(var.entropy() - 1.0) < 1e-10

        # Zero entropy: single state
        amplitudes = {True: 1.0 + 0j, False: 0.0 + 0j}
        var = SuperposedVariable(amplitudes)
        assert abs(var.entropy() - 0.0) < 1e-10

    def test_temperature_transform_sharpening(self):
        """Test temperature transform with T < 1 (sharpening)"""
        amplitudes = {True: 0.8 + 0j, False: 0.6 + 0j}
        var = SuperposedVariable(amplitudes)

        original_entropy = var.entropy()
        sharpened = var.with_temperature(T=0.5)
        sharpened_entropy = sharpened.entropy()

        # Sharpening should decrease entropy
        assert sharpened_entropy < original_entropy

    def test_temperature_transform_flattening(self):
        """Test temperature transform with T > 1 (flattening)"""
        amplitudes = {True: 0.9 + 0j, False: 0.1 + 0j}
        var = SuperposedVariable(amplitudes)

        original_entropy = var.entropy()
        flattened = var.with_temperature(T=2.0)
        flattened_entropy = flattened.entropy()

        # Flattening should increase entropy
        assert flattened_entropy > original_entropy

    def test_phase_preservation(self):
        """Test that phases are preserved through operations"""
        amplitudes = {True: 0.7 + 0.3j, False: 0.5 - 0.4j}
        var = SuperposedVariable(amplitudes)

        original_phase_true = var.phase(True)
        temp_var = var.with_temperature(T=1.5)
        new_phase_true = temp_var.phase(True)

        # Phases should be preserved (or at least in same quadrant)
        assert abs(original_phase_true - new_phase_true) < 0.5

    def test_empty_amplitudes_error(self):
        """Test that empty amplitudes raise ValueError"""
        with pytest.raises(ValueError):
            SuperposedVariable({})

    def test_zero_amplitudes_error(self):
        """Test that all-zero amplitudes raise ValueError"""
        with pytest.raises(ValueError):
            SuperposedVariable({True: 0 + 0j, False: 0 + 0j})


class TestAgent:
    """Tests for Agent class"""

    def test_add_and_get_belief(self):
        """Test adding and retrieving beliefs"""
        agent = Agent()
        belief = SuperposedVariable({True: 0.7 + 0j, False: 0.3 + 0j})
        agent.add_belief("test_belief", belief)

        retrieved = agent.get_belief("test_belief")
        assert retrieved is not None
        assert abs(retrieved.probabilities()[True] - 0.49) < 1e-2

    def test_hard_measurement_collapse(self):
        """Test that hard measurement collapses to single state"""
        agent = Agent()
        belief = SuperposedVariable({True: 0.6 + 0j, False: 0.4 + 0j})
        agent.add_belief("test", belief)

        outcome = agent.measure_hard("test", outcome=True)
        assert outcome == True

        collapsed = agent.get_belief("test")
        probs = collapsed.probabilities()
        assert abs(probs[True] - 1.0) < 1e-10
        assert abs(probs[False] - 0.0) < 1e-10
        assert collapsed.entropy() < 1e-10

    def test_soft_measurement_partial_collapse(self):
        """Test that soft measurement causes partial collapse"""
        agent = Agent()
        belief = SuperposedVariable({True: 0.6 + 0j, False: 0.4 + 0j})
        agent.add_belief("test", belief)

        original_entropy = belief.entropy()

        outcome = agent.measure_soft("test", strength=0.3, outcome=True)
        assert outcome == True

        updated = agent.get_belief("test")
        updated_entropy = updated.entropy()

        # Entropy should decrease but not to zero
        assert updated_entropy < original_entropy
        assert updated_entropy > 0.01

    def test_identity_measurement(self):
        """Test identity measurement"""
        identities = SuperposedVariable({"engineer": 0.6 + 0j, "artist": 0.4 + 0j})
        agent = Agent(identities=identities)

        outcome = agent.measure_identity_hard(outcome="engineer")
        assert outcome == "engineer"

        collapsed = agent.identities
        probs = collapsed.probabilities()
        assert abs(probs["engineer"] - 1.0) < 1e-10

    def test_measurement_nonexistent_belief(self):
        """Test that measuring nonexistent belief raises KeyError"""
        agent = Agent()
        with pytest.raises(KeyError):
            agent.measure_hard("nonexistent")


class TestOrchestrator:
    """Tests for Orchestrator and budget management"""

    def test_budget_consumption(self):
        """Test that measurements consume budget"""
        budget = CoherenceBudget(value=10.0)
        orchestrator = Orchestrator(budget)

        agent = Agent()
        belief = SuperposedVariable({True: 0.6 + 0j, False: 0.4 + 0j})
        agent.add_belief("test", belief)

        config = MeasurementConfig(strength=0.5, cost_multiplier=1.0)
        outcome, success = orchestrator.measure(agent, "test", config, mode="belief")

        assert success == True
        assert orchestrator.get_budget() == 9.5

    def test_budget_depletion(self):
        """Test that measurements fail when budget is depleted"""
        budget = CoherenceBudget(value=0.1)
        orchestrator = Orchestrator(budget)

        agent = Agent()
        belief = SuperposedVariable({True: 0.6 + 0j, False: 0.4 + 0j})
        agent.add_belief("test", belief)

        # First measurement should succeed
        config = MeasurementConfig(strength=0.05, cost_multiplier=1.0)
        _, success1 = orchestrator.measure(agent, "test", config, mode="belief")
        assert success1 == True

        # Second measurement should fail (insufficient budget)
        config = MeasurementConfig(strength=0.1, cost_multiplier=1.0)
        _, success2 = orchestrator.measure(agent, "test", config, mode="belief")
        assert success2 == False

    def test_budget_replenishment(self):
        """Test budget replenishment"""
        budget = CoherenceBudget(value=5.0)
        orchestrator = Orchestrator(budget)

        orchestrator.replenish_budget(10.0)
        assert orchestrator.get_budget() == 15.0

    def test_measurement_history(self):
        """Test that measurement history is recorded"""
        orchestrator = Orchestrator(CoherenceBudget(value=100.0))

        agent = Agent()
        belief = SuperposedVariable({True: 0.6 + 0j, False: 0.4 + 0j})
        agent.add_belief("test", belief)

        config = MeasurementConfig(strength=0.3)
        orchestrator.measure(agent, "test", config, mode="belief")

        history = orchestrator.get_history()
        assert len(history) == 1
        assert history[0]["var_name"] == "test"
        assert history[0]["strength"] == 0.3

    def test_cost_multiplier(self):
        """Test that cost multiplier affects budget consumption"""
        orchestrator = Orchestrator(CoherenceBudget(value=100.0))

        agent = Agent()
        belief = SuperposedVariable({True: 0.6 + 0j, False: 0.4 + 0j})
        agent.add_belief("test", belief)

        config = MeasurementConfig(strength=0.5, cost_multiplier=2.0)
        orchestrator.measure(agent, "test", config, mode="belief")

        # Cost should be 0.5 * 2.0 = 1.0
        assert orchestrator.get_budget() == 99.0


class TestUtilityFunctions:
    """Tests for utility functions"""

    def test_phase_gap(self):
        """Test phase gap calculation"""
        amplitudes = {
            "a": 0.6 + 0.3j,  # phase ~ 0.46 rad
            "b": 0.5 - 0.4j,  # phase ~ -0.67 rad
        }
        gap = phase_gap(amplitudes)
        assert gap > 0
        assert gap <= math.pi

    def test_phase_gap_single_state(self):
        """Test phase gap with single state"""
        amplitudes = {"a": 0.6 + 0.3j}
        gap = phase_gap(amplitudes)
        assert gap == 0.0

    def test_contradiction_energy(self):
        """Test contradiction energy calculation"""
        K = contradiction_energy(C=1.0, delta=0.5, lam=2.0)
        expected = 1.0 * math.exp(2.0 * 0.5)
        assert abs(K - expected) < 1e-10

    def test_spiral_mapping(self):
        """Test spiral mapping to 2D coordinates"""
        amplitudes = {True: 0.8 + 0j, False: 0.6 + 0j}
        coords = spiral_mapping(amplitudes)

        assert True in coords
        assert False in coords
        assert len(coords[True]) == 2  # (x, y)
        assert len(coords[False]) == 2

    def test_spiral_mapping_with_custom_center(self):
        """Test spiral mapping with custom center"""
        amplitudes = {True: 0.8 + 0j}
        coords = spiral_mapping(amplitudes, center=(5.0, 5.0))

        x, y = coords[True]
        # x should be near 5.0 + magnitude (since phase ~ 0)
        assert x > 5.0
        assert abs(y - 5.0) < 0.1


class TestCoherenceBudget:
    """Tests for CoherenceBudget class"""

    def test_consume_success(self):
        """Test successful consumption"""
        budget = CoherenceBudget(value=10.0)
        assert budget.consume(5.0) == True
        assert budget.value == 5.0

    def test_consume_failure(self):
        """Test failed consumption"""
        budget = CoherenceBudget(value=3.0)
        assert budget.consume(5.0) == False
        assert budget.value == 3.0

    def test_replenish(self):
        """Test replenishment"""
        budget = CoherenceBudget(value=5.0)
        budget.replenish(10.0)
        assert budget.value == 15.0

    def test_is_depleted(self):
        """Test depletion check"""
        budget = CoherenceBudget(value=0.0)
        assert budget.is_depleted() == True

        budget.value = 0.1
        assert budget.is_depleted() == False


class TestMeasurementConfig:
    """Tests for MeasurementConfig"""

    def test_valid_config(self):
        """Test valid configuration"""
        config = MeasurementConfig(strength=0.5, temperature_shift=1.5, cost_multiplier=2.0)
        assert config.strength == 0.5
        assert config.temperature_shift == 1.5
        assert config.cost_multiplier == 2.0

    def test_invalid_strength(self):
        """Test that invalid strength raises error"""
        with pytest.raises(ValueError):
            MeasurementConfig(strength=1.5)

    def test_invalid_cost_multiplier(self):
        """Test that negative cost multiplier raises error"""
        with pytest.raises(ValueError):
            MeasurementConfig(strength=0.5, cost_multiplier=-1.0)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
