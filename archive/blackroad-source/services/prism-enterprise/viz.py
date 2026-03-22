"""Plotting helpers for the QLM lab."""
from __future__ import annotations

from pathlib import Path
from typing import Dict

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # type: ignore
import numpy as np

from ..policies import PolicyGuard
from ..lineage import LineageLogger


class VizToolkit:
    """Wraps matplotlib plotting with policy + lineage hooks."""

    def __init__(self, policy: PolicyGuard, lineage: LineageLogger) -> None:
        self.policy = policy
        self.lineage = lineage

    def _save(self, fig: plt.Figure, path: Path, description: str) -> Path:
        path.parent.mkdir(parents=True, exist_ok=True)
        fig.tight_layout()
        import io
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png')
        data = buffer.getvalue()
        self.policy.ensure_file_write_allowed(path, len(data))
        path.write_bytes(data)
        plt.close(fig)
        self.policy.enforce_total_size()
        self.lineage.log_artifact(path, description)
        return path

    def bloch(self, bloch_vector: np.ndarray, filename: str = "bloch.png") -> Path:
        """Plot a Bloch vector."""

        self.policy.ensure_tool_allowed('viz')
        fig = plt.figure()
        ax: Axes3D = fig.add_subplot(111, projection="3d")
        u = np.linspace(0, 2 * np.pi, 100)
        v = np.linspace(0, np.pi, 100)
        x = np.outer(np.cos(u), np.sin(v))
        y = np.outer(np.sin(u), np.sin(v))
        z = np.outer(np.ones_like(u), np.cos(v))
        ax.plot_surface(x, y, z, color="lightblue", alpha=0.2)
        ax.quiver(0, 0, 0, bloch_vector[0], bloch_vector[1], bloch_vector[2], color="red", linewidth=2)
        ax.set_xlabel("X")
        ax.set_ylabel("Y")
        ax.set_zlabel("Z")
        ax.set_title("Bloch Vector")
        path = self.policy.config.artifact_dir / filename
        return self._save(fig, path, "bloch_plot")

    def histogram(self, counts: Dict[str, float], filename: str = "hist.png") -> Path:
        self.policy.ensure_tool_allowed('viz')
        fig, ax = plt.subplots()
        keys = list(counts.keys())
        values = [counts[key] for key in keys]
        ax.bar(keys, values, color="steelblue")
        ax.set_xlabel("Outcome")
        ax.set_ylabel("Probability")
        ax.set_title("Measurement distribution")
        path = self.policy.config.artifact_dir / filename
        return self._save(fig, path, "histogram")

    def curve(self, x: np.ndarray, y: np.ndarray, xlabel: str, ylabel: str, title: str, filename: str) -> Path:
        self.policy.ensure_tool_allowed('viz')
        fig, ax = plt.subplots()
        ax.plot(x, y, marker="o")
        ax.set_xlabel(xlabel)
        ax.set_ylabel(ylabel)
        ax.set_title(title)
        path = self.policy.config.artifact_dir / filename
        return self._save(fig, path, "curve_plot")
