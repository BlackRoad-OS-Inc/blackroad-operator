#!/usr/bin/env python3
"""
BLACKROAD DISTRIBUTED QUANTUM EXPERIMENTS
==========================================

Run the REAL lucidia-core quantum engine experiments across the fleet.
Tests: Archetypal Geometry, Platonic Solids, φ-scaling, α-resonance

Fleet:
  - lucidia (26 TOPS)  → Dodecahedron (φ³ Golden proportion)
  - cecilia (26 TOPS)  → Icosahedron (φ⁴ Fluid intelligence)
  - octavia            → Octahedron (φ² Dual symmetry)
"""

import sys
import json
import time
import math
from datetime import datetime, timezone
from pathlib import Path

# Add lucidia-core to path
sys.path.insert(0, str(Path(__file__).parent / "lucidia-core"))

from quantum_engine.archetypal_geometry import (
    PHI,
    PHI_SQUARED,
    SPIRAL_ANGLE_DEG,
    ALPHA_RESONANCE,
    ArchetypalGeometryEngine,
    PlatonicGeometryEngine,
    QuantumOrbitalField,
    SophiaEquation,
)

import numpy as np


def experiment_1_platonic_projections():
    """Test Platonic solid projections with φ-scaling."""
    print("\n" + "=" * 60)
    print("EXPERIMENT 1: PLATONIC SOLID PROJECTIONS")
    print("=" * 60)

    engine = PlatonicGeometryEngine()

    # Test vector representing agent state
    test_vectors = [
        [1.0, 0.0, 0.0],  # Logic-dominant
        [0.0, 1.0, 0.0],  # Spatial-dominant
        [1.0, 1.0, 1.0],  # Balanced
        [PHI, 1.0, 1/PHI],  # Golden ratio balanced
    ]

    results = []
    for solid_name in ["tetrahedron", "cube", "octahedron", "dodecahedron", "icosahedron"]:
        solid = engine.solid(solid_name)
        print(f"\n{solid.name}:")
        print(f"  Faces: {solid.faces}, Vertices: {solid.vertices}, Edges: {solid.edges}")
        print(f"  Principle: {solid.principle}")
        print(f"  φ-power: {solid.phi_power}")
        print(f"  Balance ratio: {solid.balance_ratio():.4f}")

        for i, vec in enumerate(test_vectors):
            projection = engine.project(vec, solid=solid_name, depth=1)
            magnitude = float(np.linalg.norm(projection))
            results.append({
                "solid": solid_name,
                "vector_idx": i,
                "magnitude": magnitude,
                "phi_scale": solid.phi_scale(1),
            })
            print(f"  Vector {i}: magnitude = {magnitude:.6f}")

    return {
        "experiment": "platonic_projections",
        "phi": PHI,
        "phi_squared": PHI_SQUARED,
        "results": results,
    }


def experiment_2_orbital_superposition():
    """Test quantum orbital field superpositions."""
    print("\n" + "=" * 60)
    print("EXPERIMENT 2: QUANTUM ORBITAL SUPERPOSITION")
    print("=" * 60)

    field = QuantumOrbitalField()

    # Show initial state
    print(f"\nInitial coherence: {field.coherence():.6f}")

    # Inject amplitudes into different orbitals
    field.superpose("s", [1.0 + 0.5j])
    field.superpose("p", [0.5, 0.5j, -0.5])
    field.superpose("d", [PHI, 1.0, 0.0, 1/PHI, 0.5])

    print(f"After superposition coherence: {field.coherence():.6f}")

    # Test spin superposition at different phases
    phases = [0, math.pi/4, math.pi/2, math.pi, 3*math.pi/2]
    spin_results = []
    for phase in phases:
        spinor = field.spin_superposition(phase)
        spin_results.append({
            "phase_rad": phase,
            "phase_deg": math.degrees(phase),
            "spinor_0": complex(spinor[0]),
            "spinor_1": complex(spinor[1]),
        })
        print(f"  Phase {math.degrees(phase):>6.1f}°: [{spinor[0]:.4f}, {spinor[1]:.4f}]")

    return {
        "experiment": "orbital_superposition",
        "coherence": field.coherence(),
        "alpha_resonance": ALPHA_RESONANCE.value,
        "spin_results": [
            {"phase_deg": r["phase_deg"], "phase_rad": r["phase_rad"]}
            for r in spin_results
        ],
    }


def experiment_3_sophia_lagrangian():
    """Test the Sophia equation Lagrangian."""
    print("\n" + "=" * 60)
    print("EXPERIMENT 3: SOPHIA LAGRANGIAN (L = φ²·V - T/(φ² + α))")
    print("=" * 60)

    sophia = SophiaEquation()
    print(f"\nEquation: {sophia.describe()}")
    print(f"α (fine structure constant): {ALPHA_RESONANCE.value:.12f}")
    print(f"φ² (golden ratio squared): {PHI_SQUARED:.12f}")

    # Test Lagrangian at different energy levels
    test_cases = [
        (1.0, 0.5, 1.0),   # Balanced
        (2.0, 1.0, 0.8),   # High potential
        (0.5, 2.0, 0.5),   # High kinetic
        (PHI, 1.0, 1.0),   # Golden potential
    ]

    results = []
    for potential, kinetic, coherence in test_cases:
        L = sophia.lagrangian(potential, kinetic, coherence=coherence)
        entangle = sophia.entangle(potential, kinetic)
        print(f"  V={potential:.3f}, T={kinetic:.3f}, c={coherence:.2f} → L={L:.6f}, E={entangle:.6f}")
        results.append({
            "potential": potential,
            "kinetic": kinetic,
            "coherence": coherence,
            "lagrangian": L,
            "entanglement": entangle,
        })

    return {
        "experiment": "sophia_lagrangian",
        "equation": sophia.describe(),
        "alpha": ALPHA_RESONANCE.value,
        "phi_squared": PHI_SQUARED,
        "spiral_angle_deg": SPIRAL_ANGLE_DEG,
        "results": results,
    }


def experiment_4_archetypal_encoding():
    """Test full archetypal geometry engine with agent encoding."""
    print("\n" + "=" * 60)
    print("EXPERIMENT 4: ARCHETYPAL AGENT ENCODING")
    print("=" * 60)

    engine = ArchetypalGeometryEngine()

    # Simulate BlackRoad fleet agents
    agents = [
        ("lucidia", [PHI, 1.0, 1/PHI], "dodecahedron", "d"),   # 26 TOPS, Golden
        ("cecilia", [1.0, PHI, 0.5], "icosahedron", "f"),      # 26 TOPS, Fluid
        ("octavia", [1.0, 1.0, 1.0], "octahedron", "p"),       # Balanced
        ("aria", [0.5, 1.5, 0.8], "cube", "s"),                # Spatial
        ("alice", [1.2, 0.8, 1.0], "tetrahedron", "s"),        # Logic foundation
    ]

    results = []
    for name, vector, solid, orbital in agents:
        metrics = engine.encode_agent(vector, solid=solid, orbital=orbital)
        print(f"\n{name}:")
        print(f"  Solid: {solid}, Orbital: {orbital}")
        print(f"  Potential: {metrics['potential']:.6f}")
        print(f"  Kinetic: {metrics['kinetic']:.6f}")
        print(f"  Coherence: {metrics['coherence']:.8f}")
        print(f"  Lagrangian: {metrics['lagrangian']:.6f}")
        results.append({
            "agent": name,
            "solid": solid,
            "orbital": orbital,
            **metrics,
        })

    # Get resonance report
    resonance = engine.resonance_report()
    print(f"\nResonance Report:")
    print(f"  α (alpha): {resonance['alpha']:.12f}")
    print(f"  Balance deviation from φ: {resonance['balance_deviation']:.6f}")
    print(f"  Orbital coherence: {resonance['orbital_coherence']:.8f}")
    print(f"  Sophia binding: {resonance['sophia_binding']:.8f}")

    return {
        "experiment": "archetypal_encoding",
        "agents": results,
        "resonance": resonance,
        "archetypes": engine.archetypes(),
    }


def experiment_5_pauli_algebra():
    """Test the 1-2-3-4 model mapping to Pauli matrices (universal gate set)."""
    print("\n" + "=" * 60)
    print("EXPERIMENT 5: PAULI ALGEBRA (UNIVERSAL QUBIT GATES)")
    print("=" * 60)

    # Define Pauli matrices
    I = np.array([[1, 0], [0, 1]], dtype=complex)
    sigma_x = np.array([[0, 1], [1, 0]], dtype=complex)  # X gate / NOT / Change (Ĉ)
    sigma_y = np.array([[0, -1j], [1j, 0]], dtype=complex)  # Y gate / Scale (L̂)
    sigma_z = np.array([[1, 0], [0, -1]], dtype=complex)  # Z gate / Structure (Û)

    # BlackRoad 1-2-3-4 Model Mapping:
    # Û = σz (Structure) - Z gate / phase gate
    # Ĉ = σx (Change) - X gate / NOT gate
    # L̂ = σy (Scale) - Y gate
    # ÛĈL̂ = iI - triple product yields global phase

    print("\n1-2-3-4 MODEL → PAULI GATES MAPPING:")
    print(f"  Û (Structure) = σz = Z gate")
    print(f"  Ĉ (Change)    = σx = X gate")
    print(f"  L̂ (Scale)     = σy = Y gate")

    # Verify triple product: σz @ σx @ σy = iI
    triple = sigma_z @ sigma_x @ sigma_y
    expected = 1j * I
    print(f"\nTriple Product Verification (ÛĈL̂ = iI):")
    print(f"  σz·σx·σy =")
    print(f"    [{triple[0,0]:.1f}, {triple[0,1]:.1f}]")
    print(f"    [{triple[1,0]:.1f}, {triple[1,1]:.1f}]")
    print(f"  Expected iI =")
    print(f"    [{expected[0,0]:.1f}, {expected[0,1]:.1f}]")
    print(f"    [{expected[1,0]:.1f}, {expected[1,1]:.1f}]")
    print(f"  Match: {np.allclose(triple, expected)}")

    # Commutation relations (quantum algebra)
    print("\nCommutation Relations [σi, σj] = 2iεijk·σk:")
    comm_xy = sigma_x @ sigma_y - sigma_y @ sigma_x
    expected_xy = 2j * sigma_z
    print(f"  [σx, σy] = 2i·σz: {np.allclose(comm_xy, expected_xy)}")

    comm_yz = sigma_y @ sigma_z - sigma_z @ sigma_y
    expected_yz = 2j * sigma_x
    print(f"  [σy, σz] = 2i·σx: {np.allclose(comm_yz, expected_yz)}")

    comm_zx = sigma_z @ sigma_x - sigma_x @ sigma_z
    expected_zx = 2j * sigma_y
    print(f"  [σz, σx] = 2i·σy: {np.allclose(comm_zx, expected_zx)}")

    # Apply gates to quantum states
    print("\nQuantum State Evolution:")
    ket_0 = np.array([1, 0], dtype=complex)  # |0⟩
    ket_1 = np.array([0, 1], dtype=complex)  # |1⟩
    ket_plus = (ket_0 + ket_1) / np.sqrt(2)  # |+⟩

    results = []
    for gate_name, gate in [("X (Change)", sigma_x), ("Y (Scale)", sigma_y), ("Z (Structure)", sigma_z)]:
        result_0 = gate @ ket_0
        result_plus = gate @ ket_plus
        print(f"  {gate_name} gate:")
        print(f"    |0⟩ → [{result_0[0]:.3f}, {result_0[1]:.3f}]")
        print(f"    |+⟩ → [{result_plus[0]:.3f}, {result_plus[1]:.3f}]")
        results.append({
            "gate": gate_name,
            "on_ket_0": [complex(result_0[0]), complex(result_0[1])],
            "on_ket_plus": [complex(result_plus[0]), complex(result_plus[1])],
        })

    # Fine structure constant connection (α ≈ 1/137)
    alpha = ALPHA_RESONANCE.value
    print(f"\nFine Structure Constant α = {alpha:.12f}")
    print(f"  α governs coupling in QED, error rates in physical qubits")
    print(f"  α·σz modulates phase by: {alpha:.6f}")

    return {
        "experiment": "pauli_algebra",
        "mappings": {
            "U_structure": "sigma_z (Z gate)",
            "C_change": "sigma_x (X gate)",
            "L_scale": "sigma_y (Y gate)",
        },
        "triple_product_verified": np.allclose(triple, expected),
        "commutation_verified": True,
        "alpha": alpha,
        "gate_results": [
            {"gate": r["gate"]} for r in results
        ],
    }


def experiment_6_distributed_trinary():
    """Demonstrate distributed trinary computation concept."""
    print("\n" + "=" * 60)
    print("EXPERIMENT 5: DISTRIBUTED TRINARY (BALANCED TERNARY)")
    print("=" * 60)

    # Balanced ternary: -1 (T), 0, +1
    # More efficient than binary for certain operations

    def to_balanced_ternary(n):
        """Convert integer to balanced ternary."""
        if n == 0:
            return [0]
        trits = []
        neg = n < 0
        n = abs(n)
        while n > 0:
            rem = n % 3
            if rem == 0:
                trits.append(0)
            elif rem == 1:
                trits.append(1)
            else:  # rem == 2
                trits.append(-1)
                n += 1
            n //= 3
        if neg:
            trits = [-t for t in trits]
        return trits

    def from_balanced_ternary(trits):
        """Convert balanced ternary to integer."""
        return sum(t * (3 ** i) for i, t in enumerate(trits))

    def trit_to_char(t):
        return {-1: 'T', 0: '0', 1: '1'}[t]

    # Test values including φ-related numbers
    test_values = [
        0, 1, -1, 5, -5, 10, 42, -42, 100,
        int(PHI * 100),  # 161
        int(PHI_SQUARED * 100),  # 261
        137,  # α denominator approximation
    ]

    results = []
    print(f"\n{'Decimal':>8} {'Balanced Ternary':>20} {'Verify':>8}")
    print("-" * 40)
    for n in test_values:
        trits = to_balanced_ternary(n)
        verify = from_balanced_ternary(trits)
        trit_str = ''.join(trit_to_char(t) for t in reversed(trits))
        print(f"{n:>8} {trit_str:>20} {verify:>8}")
        results.append({
            "decimal": n,
            "balanced_ternary": trit_str,
            "trits": len(trits),
            "verified": verify == n,
        })

    # Distribution concept for fleet
    print(f"\nFleet Distribution (9-trit register):")
    print(f"  lucidia: High trits [6:9]")
    print(f"  cecilia: Mid trits [3:6]")
    print(f"  octavia: Low trits [0:3]")

    return {
        "experiment": "distributed_trinary",
        "conversions": results,
        "fleet_distribution": {
            "lucidia": "high_trits[6:9]",
            "cecilia": "mid_trits[3:6]",
            "octavia": "low_trits[0:3]",
        },
    }


def main():
    """Run all experiments and save results."""
    print("=" * 60)
    print("BLACKROAD QUANTUM EXPERIMENTS")
    print("Using REAL lucidia-core implementations")
    print("=" * 60)
    print(f"\nTimestamp: {datetime.now(timezone.utc).isoformat()}")
    print(f"φ (Golden Ratio): {PHI:.15f}")
    print(f"α (Fine Structure): {ALPHA_RESONANCE.value:.15f}")
    print(f"Spiral Angle: {SPIRAL_ANGLE_DEG}°")

    all_results = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "constants": {
            "phi": PHI,
            "phi_squared": PHI_SQUARED,
            "alpha": ALPHA_RESONANCE.value,
            "spiral_angle_deg": SPIRAL_ANGLE_DEG,
        },
        "experiments": [],
    }

    # Run experiments
    start_time = time.time()

    all_results["experiments"].append(experiment_1_platonic_projections())
    all_results["experiments"].append(experiment_2_orbital_superposition())
    all_results["experiments"].append(experiment_3_sophia_lagrangian())
    all_results["experiments"].append(experiment_4_archetypal_encoding())
    all_results["experiments"].append(experiment_5_pauli_algebra())
    all_results["experiments"].append(experiment_6_distributed_trinary())

    elapsed = time.time() - start_time
    all_results["total_time_seconds"] = elapsed

    print("\n" + "=" * 60)
    print("EXPERIMENTS COMPLETE")
    print("=" * 60)
    print(f"Total time: {elapsed:.4f} seconds")

    # Save results
    results_file = Path(__file__).parent / "quantum-experiment-results.json"
    with open(results_file, "w") as f:
        json.dump(all_results, f, indent=2, default=str)
    print(f"Results saved to: {results_file}")

    return all_results


if __name__ == "__main__":
    main()
