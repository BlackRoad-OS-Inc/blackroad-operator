"""Utilities for resolving missing Amundson coherence inputs."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

K_BOLTZMANN: float = 1.380649e-23  # J/K


@dataclass(slots=True)
class AmbrContext:
    """Contextual defaults for coherence resolution."""

    last_phi_x: float = 0.0
    last_phi_y: float = 0.0
    default_temperature_K: float = 300.0
    default_r: float = 1.0


def _append_unique(target: List[str], key: str) -> None:
    if key not in target:
        target.append(key)


def resolve_coherence_inputs(
    ctx: AmbrContext | None = None,
    **payload: Any,
) -> Tuple[Dict[str, float], List[str], Dict[str, str]]:
    """Resolve missing coherence inputs and explain implicit defaults."""

    context = ctx or AmbrContext()
    resolved: Dict[str, float] = {}
    missing: List[str] = []
    why: Dict[str, str] = {}

    # Record supplied payload first so defaults never override explicit values.
    for key, value in payload.items():
        if value is None:
            continue
        resolved[key] = float(value)
        why[key] = "Provided explicitly in payload."
        if not math.isfinite(resolved[key]):
            _append_unique(missing, key)
            why[key] = "Provided value was not finite."

    defaults = (
        ("omega_0", 1.0, "Default angular frequency ω₀ = 1.0 rad/s."),
        ("lambda_", 0.5, "Default coupling λ = 0.5 (dimensionless)."),
        ("eta", 0.2, "Default dissipation η = 0.2 (dimensionless)."),
        ("phi_x", context.last_phi_x, "Phase φ_x inherited from context history (rad)."),
        ("phi_y", context.last_phi_y, "Phase φ_y inherited from context history (rad)."),
        ("r_x", context.default_r, "Amplitude r_x seeded from context default (dimensionless)."),
        ("r_y", context.default_r, "Amplitude r_y seeded from context default (dimensionless)."),
        ("r", context.default_r, "Legacy amplitude r seeded from context default (dimensionless)."),
        ("amplitude", 1.0, "Unit amplitude used when no magnitude supplied (dimensionless)."),
    )
    for key, value, explanation in defaults:
        if key not in resolved:
            resolved[key] = float(value)
            _append_unique(missing, key)
            why[key] = explanation

    # Temperature defaults depend on the context and feed into k_B·T.
    temperature = resolved.get("temperature_K")
    if temperature is None:
        temperature = context.default_temperature_K
        resolved["temperature_K"] = float(temperature)
        _append_unique(missing, "temperature_K")
        why["temperature_K"] = "Context-provided temperature baseline (K)."
    else:
        resolved["temperature_K"] = float(temperature)
        if not math.isfinite(resolved["temperature_K"]):
            _append_unique(missing, "temperature_K")
            why["temperature_K"] = "Provided value was not finite."

    if "k_b_t" not in resolved:
        resolved["k_b_t"] = K_BOLTZMANN * float(resolved["temperature_K"])
        _append_unique(missing, "k_b_t")
        why["k_b_t"] = (
            f"Computed k_B·T from temperature_K={resolved['temperature_K']:.3f} K (J)."
        )

    for key, value in resolved.items():
        if key in {"k_b_t", "temperature_K"}:
            continue
        if not math.isfinite(value):
            _append_unique(missing, key)
            why[key] = "Provided value was not finite."

    return resolved, missing, why


__all__ = ["AmbrContext", "K_BOLTZMANN", "resolve_coherence_inputs"]
