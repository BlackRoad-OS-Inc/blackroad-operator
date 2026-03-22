"""PyTorch utilities for Lindblad-style open quantum system integration."""
from __future__ import annotations

from typing import Callable, Iterable, Sequence

import torch
from torch import Tensor, nn


Channel = Callable[[Tensor], Tensor]


def dagger(tensor: Tensor) -> Tensor:
    """Return the conjugate transpose of ``tensor``."""

    return tensor.conj().transpose(-1, -2)


def project_psd_trace1(rho: Tensor, eps: float = 1e-12) -> Tensor:
    """Project ``rho`` onto the positive semidefinite, trace-1 manifold."""

    rho = 0.5 * (rho + dagger(rho))
    evals, evecs = torch.linalg.eigh(rho)
    evals = torch.clamp(evals, min=0.0)
    trace_value = evals.sum()
    if trace_value.item() < eps:
        evals = torch.zeros_like(evals)
        evals[-1] = 1.0
        trace_value = evals.sum()
    evals = evals / trace_value
    diag = torch.diag(evals).to(rho.dtype)
    return evecs @ diag @ dagger(evecs)


def gksl_rhs(rho: Tensor, hamiltonian: Tensor, lindblad_ops: Sequence[Tensor]) -> Tensor:
    """Compute the GKSL right-hand side for ``rho``."""

    unitary = -1j * (hamiltonian @ rho - rho @ hamiltonian)
    dissip = torch.zeros_like(rho)
    for L in lindblad_ops:
        dissip = dissip + L @ rho @ dagger(L) - 0.5 * (dagger(L) @ L @ rho + rho @ dagger(L) @ L)
    return unitary + dissip


def apply_channel_mix(rho: Tensor, channels: Iterable[Channel], weights: Tensor) -> Tensor:
    """Apply a convex combination of channels to ``rho`` with ``weights``."""

    if rho.ndim != 2:
        raise ValueError("rho must be a matrix (rank-2 tensor)")
    if weights.ndim != 1:
        raise ValueError("weights must be a 1D tensor")

    norm = weights.sum()
    if not torch.isclose(norm, torch.as_tensor(1.0, dtype=weights.dtype, device=weights.device)):
        weights = weights / norm

    channel_list = tuple(channels)
    if len(channel_list) != len(weights):
        raise ValueError("weights and channels must have the same length")

    mixed = torch.zeros_like(rho)
    for weight, channel in zip(weights, channel_list):
        mixed = mixed + weight.to(rho.dtype) * channel(rho)
    return mixed


def kraus_channel(kraus_ops: Sequence[Tensor]) -> Channel:
    """Create a channel callable from Kraus operators."""

    kraus_ops = tuple(op.clone() for op in kraus_ops)

    def channel(rho: Tensor) -> Tensor:
        result = torch.zeros_like(rho)
        for op in kraus_ops:
            result = result + op @ rho @ dagger(op)
        return result

    return channel


class AmundsonIntegrator(nn.Module):
    """Differentiable integrator for the augmented GKSL dynamics."""

    def __init__(
        self,
        hamiltonian: Tensor,
        lindblad_ops: Sequence[Tensor],
        channels: Sequence[Channel] | None = None,
        dt: float = 0.01,
        tau: float = 0.02,
        lam: float = 0.1,
    ) -> None:
        super().__init__()
        self.register_buffer("hamiltonian", hamiltonian.clone())
        self.lindblad_ops = nn.ParameterList(
            [nn.Parameter(op.clone(), requires_grad=False) for op in lindblad_ops]
        )
        self.channels = tuple(channels) if channels is not None else tuple()
        self.dt = dt
        self.tau = tau
        self.lam = lam

    def forward(self, rho: Tensor, weights: Tensor | None = None) -> Tensor:
        """Advance ``rho`` by one integrator step."""

        lindblad_ops = [op for op in self.lindblad_ops]
        gksl = gksl_rhs(rho, self.hamiltonian, lindblad_ops)
        rho_pred = project_psd_trace1(rho + self.tau * gksl)
        temporal = rho_pred - rho

        if self.channels and weights is None:
            raise ValueError("weights must be provided when channels are defined")

        w_term = torch.zeros_like(rho)
        if self.channels:
            rho_mix = apply_channel_mix(rho, self.channels, weights)
            w_term = rho_mix - rho

        rho_next = rho + self.dt * (gksl + self.lam * temporal + w_term)
        return project_psd_trace1(rho_next)

    def step_sequence(self, rho: Tensor, weights_sequence: Iterable[Tensor]) -> Tensor:
        """Integrate ``rho`` over a sequence of weight vectors."""

        state = rho
        for weights in weights_sequence:
            state = self.forward(state, weights)
        return state
