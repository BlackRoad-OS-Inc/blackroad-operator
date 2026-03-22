#!/usr/bin/env python3
"""Quick demo harness: prints one headline result per module.
Run:  python scripts/demo_amundson_math_core.py
"""
import sys
from contextlib import suppress

import numpy as np

from agents.blackroad_agent_framework_package5 import (
    AgentStateEnumerators,
    FourierConsciousnessAnalyzer,
    LindbladianSuperoperator,
    RamanujanMagicSquare,
    UnifiedHarmonicOperator,
)

from utils.safety import panic_guard, soft_guard


def hr(name: str):
    print("\n" + name)
    print("-" * len(name))


def demo_unified_harmonic():
    hr("UNIFIED HARMONIC")
    op = UnifiedHarmonicOperator()
    val = op.compute_unified_action(n_points=720)
    print(f"unified_action ≈ {val.real:.4f} + {val.imag:.4f}i | |val|={abs(val):.4f}")


def demo_fourier():
    hr("FOURIER CONSCIOUSNESS")
    dt = 0.001
    t = np.arange(0.0, 1.0, dt)
    sig = np.sin(2 * np.pi * 5 * t) + 0.5 * np.sin(2 * np.pi * 10 * t)
    freqs = FourierConsciousnessAnalyzer.resonance_frequencies(sig, dt=dt, threshold=0.25)
    rounded = sorted(set(np.round(np.abs(freqs)).astype(int).tolist()))
    print(f"resonances ≈ {rounded[:6]}")


def demo_magic_square():
    hr("RAMANUJAN MAGIC SQUARE")
    ms = RamanujanMagicSquare()
    square = ms.create_ramanujan_dob_square()
    v = ms.verify_magic()
    print(f"magic_constant={ms.magic_constant} | is_magic={v['is_magic']}")


def demo_lindbladian():
    hr("LINDBLADIAN")
    L = LindbladianSuperoperator(n_dim=2)
    sigma_minus = np.array([[0, 1], [0, 0]], dtype=complex)
    L.add_lindblad_operator(sigma_minus, gamma=0.1)
    rho = np.array([[0, 0], [0, 1]], dtype=complex)
    D = L.lindblad_dissipator(rho)
    tr = np.trace(D)
    print(f"dρ/dt hermitian={np.allclose(D, D.conj().T)} | trace(dρ)={tr:.2e}")


def demo_number_theory():
    hr("AGENT STATE ENUMERATORS")
    vals = [12, 30, 60, 100]
    pairs = [(n, AgentStateEnumerators.euler_totient(n), AgentStateEnumerators.mobius(n)) for n in vals]
    print("n | φ(n) | μ(n)")
    for n, phi, mu in pairs:
        print(f"{n:>3} | {phi:>4} | {mu:>2}")


if __name__ == "__main__":
    with suppress(SystemExit):
        panic_guard()

    if not soft_guard(name="demo_amundson_math_core", stream=sys.stderr):
        print("[demo] Running in SAFE_MODE read-only mode.")

    demo_unified_harmonic()
    demo_fourier()
    demo_magic_square()
    demo_lindbladian()
    demo_number_theory()
    print("\nOK — Amundson Set I demo complete.")
