"""Histogram plotting for measurement probabilities."""
from __future__ import annotations

from pathlib import Path
from typing import Mapping

import matplotlib.pyplot as plt


def plot_histogram(data: Mapping[str, float], path: Path) -> Path:
    """Plot a probability histogram."""

    labels = list(data.keys())
    values = [data[label] for label in labels]
    path.parent.mkdir(parents=True, exist_ok=True)
    fig, ax = plt.subplots()
    ax.bar(labels, values)
    ax.set_xlabel("Outcome")
    ax.set_ylabel("Probability")
    ax.set_title("Measurement Results")
    fig.tight_layout()
    fig.savefig(path, dpi=200)
    plt.close(fig)
    return path
