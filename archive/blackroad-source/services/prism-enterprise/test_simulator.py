from __future__ import annotations

import numpy as np
import pytest

from bots.simple import get_default_bots
from simulator.engine import Scenario, run_scenario
from quantum_math_lab import BitFlipCode, QuantumCircuit, get_aer_simulator
from quantum_math_lab.ml_integration import HamiltonianTerm, TorchVQESolver
from quantum_math_lab.visuals import bloch_vector
from tests.golden import assert_matches_golden


def test_scenarios_run_with_trace_id():
    bots = get_default_bots()
    treas = bots["Treasury-BOT"].run("cash-view", {"accounts": [1, 2, 3]})
    assert_matches_golden("treasury_bot.json", treas)

    revops = bots["RevOps-BOT"].run("forecast", {"pipeline": [1, 2, 3]})
    assert_matches_golden("revops_forecast.json", revops)

    sre = bots["SRE-BOT"].run("error-budget", {"total": 10, "errors": 2})
    assert_matches_golden("sre_error_budget.json", sre)

    scenario = Scenario(
        id="demo",
        name="Demo",
        params={},
        steps=[{"name": "RevOps-BOT", "intent": "forecast", "inputs": {"pipeline": [1]}}],
    )
    result = run_scenario(scenario)
    assert "trace_id" in result
    assert result["steps"][0]["output"] == {"forecast": 1}


def test_quantum_circuit_hadamard_superposition():
    circuit = QuantumCircuit(1)
    circuit.hadamard(0)
    state = circuit.simulate()
    probabilities = np.abs(state) ** 2
    assert pytest.approx(probabilities[0], abs=1e-9) == 0.5
    assert pytest.approx(probabilities[1], abs=1e-9) == 0.5


def test_quantum_circuit_cnot_creates_bell_state():
    circuit = QuantumCircuit(2)
    circuit.hadamard(0)
    circuit.cnot(0, 1)
    state = circuit.simulate()
    expected = np.zeros(4, dtype=np.complex128)
    expected[0] = 1 / np.sqrt(2)
    expected[3] = 1 / np.sqrt(2)
    assert np.allclose(state, expected)


def test_quantum_circuit_qiskit_execution_roundtrip():
    pytest.importorskip("qiskit")
    circuit = QuantumCircuit(2)
    circuit.hadamard(0)
    circuit.cnot(0, 1)
    result = circuit.execute_on_backend(get_aer_simulator(), shots=128, measure=True)
    raw_counts = result.get_counts()
    counts: dict[str, int] = {}
    for key, value in raw_counts.items():
        trimmed = key.replace(" ", "")[-circuit.num_qubits :]
        counts[trimmed] = counts.get(trimmed, 0) + value
    assert sum(counts.values()) == 128
    assert set(counts).issubset({"00", "11"})


def test_quantum_bit_flip_code_corrects_single_error():
    code = BitFlipCode()
    circuit = code.prepare(theta=np.pi / 3)
    circuit.simulate()
    code.introduce_error(circuit, 1)
    inferred = code.correct(circuit)
    assert inferred == 1
    probabilities = circuit.probabilities()
    no_error_prob = sum(probabilities[int(bitstring, 2)] for bitstring in ("000", "111"))
    assert no_error_prob > 0.95


def test_quantum_bloch_vector_normalised_state():
    circuit = QuantumCircuit(1)
    circuit.hadamard(0)
    state = circuit.simulate()
    vector = bloch_vector(state)
    assert np.isclose(np.linalg.norm(vector), 1.0)


def test_quantum_torch_vqe_minimises_simple_hamiltonian():
    pytest.importorskip("torch")

    def ansatz(parameters):
        circuit = QuantumCircuit(1)
        circuit.ry(0, float(parameters[0]))
        return circuit

    solver = TorchVQESolver(
        ansatz,
        [HamiltonianTerm(coefficient=1.0, pauli_string="Z")],
        learning_rate=0.2,
        max_iterations=30,
    )
    result = solver.solve([0.3])
    assert result.optimal_value <= -0.5
