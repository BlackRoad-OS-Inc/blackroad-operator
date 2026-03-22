"""Thermodynamic helpers for Amundson–BlackRoad simulations."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, Optional, Union

import numpy as np
from numpy.typing import ArrayLike

K_BOLTZMANN = 1.380649e-23  # J/K


def spiral_entropy(
    a: Union[float, ArrayLike],
    theta: Union[float, ArrayLike],
    *,
    k_b: float = K_BOLTZMANN,
) -> float:
    """Return the entropy-like measure associated with a spiral state."""

    a_arr = np.asarray(a, dtype=float)
    theta_arr = np.asarray(theta, dtype=float)
    if a_arr.ndim == 0 and theta_arr.ndim == 0:
        return k_b * float(a_arr) * float(theta_arr)
    amplitude_energy = np.abs(a_arr) ** 2 + np.abs(theta_arr) ** 2
    total = float(np.sum(amplitude_energy))
    if total <= 0.0:
        return 0.0
    probabilities = amplitude_energy / total
    mask = probabilities > 0
    entropy = -float(np.sum(probabilities[mask] * np.log(probabilities[mask])))
    return k_b * entropy


def _energy_increment_scalar(
    T: float,
    da: float,
    dtheta: float,
    a: float,
    theta: float,
    *,
    Omega: float = 0.0,
    k_b: float = K_BOLTZMANN,
) -> float:
    return T * k_b * (da * theta + a * dtheta) + Omega * dtheta


def _energy_increment_field(
    a: ArrayLike,
    theta: ArrayLike,
    dt: float,
    *,
    gamma: float,
    eta: float,
) -> float:
    if dt <= 0:
        raise ValueError("dt must be positive")
    a_arr = np.nan_to_num(np.asarray(a, dtype=float), nan=0.0, posinf=0.0, neginf=0.0)
    theta_arr = np.nan_to_num(np.asarray(theta, dtype=float), nan=0.0, posinf=0.0, neginf=0.0)
    dissipation = gamma * np.square(a_arr)
    coupling = eta * np.abs(a_arr * theta_arr)
    integrand = dissipation + coupling
    return float(np.trapz(integrand, dx=dt))


def energy_increment(*args, **kwargs) -> float:
    """Dispatch to the appropriate energy increment formulation."""

    if len(args) == 5:
        T, da, dtheta, a, theta = args
        return _energy_increment_scalar(T, da, dtheta, a, theta, **kwargs)
    if len(args) == 6:
        T, da, dtheta, a, theta, Omega = args
        return _energy_increment_scalar(T, da, dtheta, a, theta, Omega=Omega, **kwargs)
    if len(args) == 3:
        a, theta, dt = args
        return _energy_increment_field(a, theta, dt, **kwargs)
    raise TypeError("energy_increment expects either (T, da, dtheta, a, theta) or (a, theta, dt)")


def landauer_min(
    value: float,
    other: float | None = None,
    *,
    k_b: float = K_BOLTZMANN,
    n_bits: float | None = None,
) -> float:
    """Return the Landauer minimum energy for irreversible computation."""

    if n_bits is not None and other is not None:
        raise TypeError("provide bits via positional argument or n_bits keyword, not both")
    if n_bits is not None:
        temperature = float(value)
        bits = float(n_bits)
    elif other is not None:
        bits = float(value)
        temperature = float(other)
    else:
        raise TypeError("landauer_min requires both bits and temperature")
    if bits < 0:
        raise ValueError("n_bits must be non-negative")
    if temperature <= 0:
        raise ValueError("temperature must be positive")
    return k_b * temperature * math.log(2.0) * bits


def landauer_floor(bits: float, temperature: float, *, k_b: float = K_BOLTZMANN) -> float:
    """Return the Landauer floor for a given bit count and temperature."""

    return landauer_min(bits, temperature, k_b=k_b)


def irreversible_energy(transitions: int, temperature: float) -> float:
    """Compute the Landauer floor for a count of irreversible transitions."""

    if transitions < 0:
        raise ValueError("transitions must be non-negative")
    return landauer_floor(float(transitions), temperature)


@dataclass(slots=True)
class ThermoRecord:
    """Structured metadata describing an irreversible run."""

    bits: float
    temperature: float
    delta_e_min: float
    seed: Optional[int] = None
    provided_energy: Optional[float] = None
    landauer_ok: Optional[bool] = None


def annotate_run_with_thermo(
    payload: Dict[str, object],
    *,
    bits: float,
    temperature: float,
    seed: Optional[int] = None,
    n_bits: Optional[float] = None,
    Omega: float | None = None,
    da: float | None = None,
    dtheta: float | None = None,
    a: Union[float, ArrayLike, None] = None,
    theta: Union[float, ArrayLike, None] = None,
    energy: Optional[float] = None,
) -> Dict[str, object]:
    """Attach Landauer provenance and optional AM-4 ledger entries."""

    effective_bits = float(n_bits if n_bits is not None else bits)
    delta_e_min_effective = landauer_min(temperature, n_bits=effective_bits)
    delta_e_bits = landauer_floor(bits, temperature)
    provided_energy = None if energy is None else float(energy)
    landauer_ok = None if provided_energy is None else provided_energy >= delta_e_bits
    record = ThermoRecord(
        bits=float(bits),
        temperature=float(temperature),
        delta_e_min=delta_e_bits,
        seed=seed,
        provided_energy=provided_energy,
        landauer_ok=landauer_ok,
    )
    thermo_payload: Dict[str, object] = {
        "bits": record.bits,
        "temperature_K": record.temperature,
        "delta_e_min_J": record.delta_e_min,
        "delta_e_effective_J": delta_e_min_effective,
        "landauer_ok": record.landauer_ok,
    }
    if record.seed is not None:
        thermo_payload["seed"] = record.seed
    if provided_energy is not None:
        thermo_payload["provided_energy_J"] = provided_energy
    if a is not None and theta is not None and da is not None and dtheta is not None:
        thermo_payload["spiral_entropy_J_per_K"] = spiral_entropy(a, theta)
        thermo_payload["energy_increment_J"] = _energy_increment_scalar(
            temperature,
            float(da),
            float(dtheta),
            float(a),
            float(theta),
            Omega=Omega or 0.0,
        )
        thermo_payload["theta_work_J"] = (Omega or 0.0) * float(dtheta)
    enriched = dict(payload)
    enriched["thermo"] = thermo_payload
    return enriched


__all__ = [
    "K_BOLTZMANN",
    "ThermoRecord",
    "annotate_run_with_thermo",
    "energy_increment",
    "irreversible_energy",
    "landauer_floor",
    "landauer_min",
    "spiral_entropy",
]
