"""Visualization helpers that write into the artifacts directory."""
from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Dict, Iterable

import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401 - ensures 3D toolkit registered

ART_DIR = Path(__file__).resolve().parents[2] / "artifacts"
LEGACY_ART_DIR = Path(__file__).resolve().parents[2] / "modules" / "qlm_lab" / "artifacts"
ROOT_ART_DIR = Path(__file__).resolve().parents[4] / "artifacts"
for path in (ART_DIR, LEGACY_ART_DIR, ROOT_ART_DIR):
    path.mkdir(parents=True, exist_ok=True)

__all__ = ["hist", "bloch", "ascii_circuit"]


def _prepare_path(fname: str) -> Path:
    ART_DIR.mkdir(parents=True, exist_ok=True)
    return ART_DIR / fname


def _mirror_artifacts(path: Path) -> None:
    """Copy ``path`` into the legacy and repo-level artifact directories."""

    for target_dir in (LEGACY_ART_DIR, ROOT_ART_DIR):
        if path.parent == target_dir:
            continue
        try:
            target = target_dir / path.name
            shutil.copy2(path, target)
        except Exception:  # pragma: no cover - best effort mirroring
            pass


def hist(probs: Dict[str, float], fname: str = "hist.png") -> str:
    """Render a histogram of probabilities."""

    path = _prepare_path(fname)
    fig = plt.figure()
    xs, ys = list(probs.keys()), list(probs.values())
    plt.bar(range(len(xs)), ys, color="#4b9cd3")
    plt.xticks(range(len(xs)), xs)
    plt.ylabel("Probability")
    plt.title("Distribution")
    fig.savefig(path, dpi=160, bbox_inches="tight")
    plt.close(fig)
    _mirror_artifacts(path)
    return str(path)


def bloch(point: Iterable[float], fname: str = "bloch_q0.png") -> str:
    """Plot a Bloch sphere arrow for a single qubit."""

    x, y, z = point
    path = _prepare_path(fname)
    fig = plt.figure()
    ax = fig.add_subplot(111, projection="3d")
    u = np.linspace(0, 2 * np.pi, 50)
    v = np.linspace(0, np.pi, 50)
    xs = np.outer(np.cos(u), np.sin(v))
    ys = np.outer(np.sin(u), np.sin(v))
    zs = np.outer(np.ones_like(u), np.cos(v))
    ax.plot_surface(xs, ys, zs, color="lightgrey", alpha=0.2, linewidth=0)
    ax.quiver(0, 0, 0, x, y, z, length=1.0, color="crimson", linewidth=2)
    ax.set_xlabel("X")
    ax.set_ylabel("Y")
    ax.set_zlabel("Z")
    ax.set_title("Bloch Vector")
    ax.set_box_aspect([1, 1, 1])
    fig.savefig(path, dpi=160, bbox_inches="tight")
    plt.close(fig)
    _mirror_artifacts(path)
    return str(path)


def ascii_circuit(description: str) -> str:
    """Return a monospaced circuit rendering."""

    lines = ["┌" + "─" * (len(description) + 2) + "┐", f"│ {description} │", "└" + "─" * (len(description) + 2) + "┘"]
    return "\n".join(lines)
