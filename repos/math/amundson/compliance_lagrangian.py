"""Compliance-as-Lagrangian utilities.

A direct transcription of the Amundson policy idea where compliance is treated
as a Lagrange constraint.  The Hamiltonian is augmented by a Hermitian policy
operator and an energy multiplier derived from the Landauer limit.  The module
also exposes a light-weight GKSL integrator so that the policy term can be
studied inside open quantum evolutions.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

import numpy as np

k_B = 1.380649e-23  # Boltzmann constant in J/K.


@dataclass
class ComplianceModel:
    """Container storing the base Hamiltonian and the policy operator."""

    hamiltonian: np.ndarray
    policy_operator: np.ndarray

    def augmented_hamiltonian(self, mu: float) -> np.ndarray:
        """Return :math:`H' = H + \mu C`."""

        return self.hamiltonian + mu * self.policy_operator


def landauer_multiplier_from_budget(energy_budget: float, temperature: float) -> float:
    """Translate an energy budget into the compliance multiplier ``mu``.

    Landauer's principle gives a minimum dissipation ``k_B T ln 2`` per bit
    erasure.  Matching the budget to ``mu`` lets us tie governance energy to
    measurable thermodynamic resources.
    """

    if temperature <= 0:
        raise ValueError("Temperature must be positive")
    return energy_budget / (k_B * temperature * np.log(2.0))


def commutator(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Return the commutator [A, B]."""

    return a @ b - b @ a


def gksl_generator(rho: np.ndarray, hamiltonian: np.ndarray, lindblad_ops: Sequence[np.ndarray], rates: Sequence[float]) -> np.ndarray:
    """Return the GKSL derivative for the supplied density matrix."""

    unitary = -1j * commutator(hamiltonian, rho)
    dissipative = np.zeros_like(rho, dtype=complex)
    for op, gamma in zip(lindblad_ops, rates):
        dissipative += gamma * (op @ rho @ op.conj().T - 0.5 * (op.conj().T @ op @ rho + rho @ op.conj().T @ op))
    return unitary + dissipative


def gksl_step(rho: np.ndarray, model: ComplianceModel, mu: float, lindblad_ops: Sequence[np.ndarray], rates: Sequence[float], dt: float) -> np.ndarray:
    """Advance the density matrix using an Euler step of the GKSL equation."""

    h_aug = model.augmented_hamiltonian(mu)
    derivative = gksl_generator(rho, h_aug, lindblad_ops, rates)
    return rho + dt * derivative


__all__ = [
    "ComplianceModel",
    "commutator",
    "gksl_generator",
    "gksl_step",
    "k_B",
    "landauer_multiplier_from_budget",
]
