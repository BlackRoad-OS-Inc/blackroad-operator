"""Visualization utilities for quantum states and circuits."""

from __future__ import annotations

from typing import Sequence

import matplotlib.pyplot as plt
import numpy as np

from ..quantum_simulator import QuantumCircuit


def bloch_vector(state: Sequence[complex]) -> np.ndarray:
    """Compute the Bloch vector for a single-qubit state."""

    amplitudes = np.asarray(state, dtype=np.complex128)
    if amplitudes.size != 2:
        raise ValueError("Bloch vectors are defined for single-qubit states")
    norm = np.linalg.norm(amplitudes)
    if not np.isclose(norm, 1.0):
        amplitudes = amplitudes / norm
    alpha, beta = amplitudes
    x = 2 * np.real(np.conj(alpha) * beta)
    y = 2 * np.imag(np.conj(alpha) * beta)
    z = np.abs(alpha) ** 2 - np.abs(beta) ** 2
    return np.array([x, y, z], dtype=float)


def plot_bloch_sphere(state: Sequence[complex], ax: plt.Axes | None = None) -> plt.Figure:
    """Plot a Bloch vector for the given single-qubit state."""

    if ax is None:
        fig = plt.figure(figsize=(4, 4))
        ax = fig.add_subplot(111, projection="3d")
    else:
        fig = ax.figure
    vector = bloch_vector(state)
    u = np.linspace(0, 2 * np.pi, 100)
    v = np.linspace(0, np.pi, 100)
    x = np.outer(np.cos(u), np.sin(v))
    y = np.outer(np.sin(u), np.sin(v))
    z = np.outer(np.ones_like(u), np.cos(v))
    ax.plot_surface(x, y, z, color="lightgray", alpha=0.2, linewidth=0)
    ax.quiver(0, 0, 0, *vector, color="crimson", linewidth=2)
    ax.set_xlim([-1, 1])
    ax.set_ylim([-1, 1])
    ax.set_zlim([-1, 1])
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_title("Bloch Sphere")
    return fig


def plot_state_probabilities(state: Sequence[complex], ax: plt.Axes | None = None) -> plt.Figure:
    """Plot measurement probabilities of a computational basis state vector."""

    amplitudes = np.asarray(state, dtype=np.complex128)
    probabilities = np.abs(amplitudes) ** 2
    labels = [format(i, f"0{int(np.log2(probabilities.size))}b") for i in range(probabilities.size)]
    if ax is None:
        fig, ax = plt.subplots(figsize=(6, 3))
    else:
        fig = ax.figure
    ax.bar(labels, probabilities, color="navy", alpha=0.7)
    ax.set_ylim(0, 1)
    ax.set_ylabel("Probability")
    ax.set_xlabel("Computational basis state")
    ax.set_title("Measurement distribution")
    ax.grid(axis="y", linestyle="--", linewidth=0.5, alpha=0.5)
    return fig


def plot_circuit_state(circuit: QuantumCircuit, ax: plt.Axes | None = None) -> plt.Figure:
    """Simulate ``circuit`` and plot the resulting probability distribution."""

    state = circuit.simulate()
    return plot_state_probabilities(state, ax=ax)


__all__ = ["plot_bloch_sphere", "plot_state_probabilities", "plot_circuit_state", "bloch_vector"]
