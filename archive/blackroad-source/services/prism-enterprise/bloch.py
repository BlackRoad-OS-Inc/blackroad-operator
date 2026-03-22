"""Bloch sphere visualization utilities."""
from __future__ import annotations

import math
from pathlib import Path
from typing import Optional

import matplotlib.pyplot as plt
import numpy as np

StateVector = np.ndarray


def bloch_coordinates(state: StateVector) -> tuple[float, float, float]:
    """Return Bloch sphere coordinates for a single qubit state."""

    alpha, beta = state
    x = 2 * np.real(np.conjugate(alpha) * beta)
    y = 2 * np.imag(np.conjugate(alpha) * beta)
    z = np.abs(alpha) ** 2 - np.abs(beta) ** 2
    return float(x), float(y), float(z)


def plot_bloch(state: StateVector, path: Optional[Path] = None) -> Path:
    """Plot the Bloch vector and return the saved path."""

    if state.size != 2:
        raise ValueError("Bloch sphere is only defined for single qubits")
    x, y, z = bloch_coordinates(state)
    fig = plt.figure()
    ax = fig.add_subplot(111, projection="3d")
    u, v = np.mgrid[0 : 2 * math.pi : 40j, 0 : math.pi : 20j]
    ax.plot_surface(np.cos(u) * np.sin(v), np.sin(u) * np.sin(v), np.cos(v), color="lightblue", alpha=0.2)
    ax.quiver(0, 0, 0, x, y, z, color="red", linewidth=2)
    ax.set_xlim([-1, 1])
    ax.set_ylim([-1, 1])
    ax.set_zlim([-1, 1])
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_title("Bloch Sphere")
    output = path or Path("artifacts/bloch_example.png")
    output.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output, dpi=200)
    plt.close(fig)
    return output
