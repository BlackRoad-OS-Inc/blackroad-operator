"""Wave generation utilities for the math API."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from math import tau
from pathlib import Path
from typing import Dict

import matplotlib
import matplotlib.pyplot as plt
import numpy as np

from .storage import ensure_domain, write_json

matplotlib.use("Agg", force=True)

DOMAIN = "waves"


@dataclass(slots=True)
class SineWave:
    time: np.ndarray
    values: np.ndarray
    plot_path: Path
    samples_path: Path

    @property
    def invariants(self) -> Dict[str, float]:
        return {
            "mean": float(np.mean(self.values)),
            "rms": float(np.sqrt(np.mean(self.values ** 2))),
            "max": float(np.max(self.values)),
            "min": float(np.min(self.values)),
        }


def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y%m%dT%H%M%S%f")


def generate_sine_wave(
    *,
    frequency: float,
    phase: float,
    samples: int,
    sample_rate: float = 1000.0,
    amplitude: float = 1.0,
) -> SineWave:
    if frequency <= 0:
        raise ValueError("frequency must be positive")
    if samples <= 0:
        raise ValueError("samples must be positive")
    if sample_rate <= 0:
        raise ValueError("sample_rate must be positive")

    output_dir = ensure_domain(DOMAIN)
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = _timestamp()

    time = np.linspace(0.0, samples / sample_rate, samples, endpoint=False)
    values = amplitude * np.sin(tau * frequency * time + phase)

    plot_path = output_dir / f"sine_{timestamp}.png"
    fig, ax = plt.subplots(figsize=(6, 3), dpi=150)
    ax.plot(time, values)
    ax.set_xlabel("t (s)")
    ax.set_ylabel("Amplitude")
    ax.set_title("Sine wave")
    fig.tight_layout()
    fig.savefig(plot_path)
    plt.close(fig)

    samples_path = output_dir / f"sine_{timestamp}.json"
    payload = {
        "time": time.tolist(),
        "values": values.tolist(),
    }
    write_json(samples_path, payload)

    return SineWave(time=time, values=values, plot_path=plot_path, samples_path=samples_path)


def demo() -> Dict[str, object]:
    sine = generate_sine_wave(frequency=1.0, phase=0.0, samples=128, sample_rate=128.0)
    return {
        "plot_path": str(sine.plot_path),
        "samples_path": str(sine.samples_path),
        "invariants": sine.invariants,
    }
