"""Lightweight resonance algebra utilities used by unit tests."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Protocol

__all__ = [
    "K_B",
    "State",
    "wrap_phase",
    "coherence",
    "interference_sum",
    "coupling_product",
    "normalize",
    "decohere",
    "phase_inversion",
    "associativity_defect",
    "phase_cost",
    "landauer_limit",
]

TAU = 2 * math.pi
K_B = 1.380649e-23  # Boltzmann constant (J/K)
_EPSILON = 1e-12
_PHASE_RESOLUTION = 1e-3


@dataclass(frozen=True)
class State:
    """Amplitude/phase representation of a resonance state."""

    r: float
    phi: float

    def as_complex(self) -> complex:
        """Return the complex embedding of the state."""

        return self.r * complex(math.cos(self.phi), math.sin(self.phi))

    def normalize(self, kappa: float = 1.0) -> "State":
        """Clamp the amplitude to ``kappa`` while preserving phase."""

        return State(min(self.r, kappa), self.phi)

    def inv(self) -> "State":
        """Return the phase inversion / multiplicative inverse."""

        if self.r == 0:
            raise ZeroDivisionError("null state has no multiplicative inverse")
        return State(1.0 / self.r, (-self.phi) % TAU)

    @classmethod
    def from_complex(cls, value: complex) -> "State":
        """Construct a state from a complex number."""

        amplitude = abs(value)
        if amplitude == 0:
            return cls(0.0, 0.0)
        return cls(amplitude, wrap_phase(math.atan2(value.imag, value.real)))


def wrap_phase(phase: float) -> float:
    """Normalize the phase to ``[0, 2π)``."""

    wrapped = math.fmod(phase, TAU)
    return wrapped + TAU if wrapped < 0 else wrapped


def coherence(a: State, b: State) -> float:
    """Return the cosine of the phase difference between two states."""

    return math.cos(a.phi - b.phi)


def interference_sum(a: State, b: State) -> State:
    """Phase-aware addition modelling interference."""

    z = a.as_complex() + b.as_complex()
    amplitude = abs(z)
    if amplitude < _EPSILON:
        return State(0.0, 0.0)
    phase = wrap_phase(math.atan2(z.imag, z.real))
    return State(amplitude, phase)


def coupling_product(a: State, b: State) -> State:
    """Rotation-scaled product modelling coupling."""

    return State(a.r * b.r, (a.phi + b.phi) % TAU)


def normalize(state: State, kappa: float = 1.0) -> State:
    """Functional form of :meth:`State.normalize`."""

    return state.normalize(kappa)


class RandomLike(Protocol):
    """Protocol describing the ``random`` method used by :func:`decohere`."""

    def random(self) -> float:  # pragma: no cover - protocol definition
        ...


def decohere(
    state: State,
    beta: float = 0.0,
    *,
    jitter: float | None = None,
    rng: RandomLike | None = None,
) -> State:
    """Return a decohered state with exponential amplitude decay and optional phase jitter."""

    amplitude = state.r * math.exp(-beta)
    if jitter is None:
        if rng is None:
            from random import random

            offset = random() * TAU
        else:
            offset = rng.random() * TAU
    else:
        offset = jitter
    return State(amplitude, wrap_phase(state.phi + offset))


def phase_inversion(state: State) -> State:
    """Return the multiplicative inverse of a non-null state."""

    return state.inv()


def _quantize_phase(phase: float, resolution: float = _PHASE_RESOLUTION) -> float:
    """Snap ``phase`` to a discrete grid to simulate instrumentation limits."""

    return round(phase / resolution) * resolution


def associativity_defect(a: State, b: State, c: State) -> float:
    """Return a heuristic measure of non-associativity in the interference operation."""

    left = interference_sum(a, b)
    left = State(left.r, wrap_phase(_quantize_phase(left.phi)))
    left = interference_sum(left, c)

    right = interference_sum(b, c)
    right = State(right.r, wrap_phase(_quantize_phase(right.phi)))
    right = interference_sum(a, right)

    return abs(left.r - right.r) + abs(left.phi - right.phi)


def phase_cost(delta_phi: float, r_a: float, r_b: float, *, temperature: float, lambda_: float) -> float:
    """Landauer-aware energetic cost for misalignment."""

    return K_B * temperature * lambda_ * r_a * r_b * (1 - math.cos(delta_phi))


def landauer_limit(bits: float, temperature: float) -> float:
    """Minimum energetic cost for an irreversible change of ``bits`` bits."""

    return bits * K_B * temperature * math.log(2.0)
