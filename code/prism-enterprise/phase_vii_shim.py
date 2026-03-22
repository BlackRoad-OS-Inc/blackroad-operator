"""Lightweight Phase VII shim used when ``codex_phase_07`` cannot be imported."""

from __future__ import annotations

import json
import socket
import time
from dataclasses import dataclass
from typing import Callable, Dict, Optional, Tuple

import numpy as np
from numpy.linalg import eigvalsh


@dataclass
class PhysicalConstants:
    k_B: float = 1.380649e-23
    hbar: float = 1.054571817e-34
    c: float = 2.99792458e8

    @staticmethod
    def landauer_bound(T: float, N_bits: int = 1) -> float:
        return PhysicalConstants.k_B * T * np.log(2.0) * N_bits


CONST = PhysicalConstants()


@dataclass
class LagrangianConfig:
    m_a: float = 1.0
    I_theta: float = 1.0
    gamma_a: float = 0.1
    gamma_theta: float = 0.1
    k_a: float = 1.0
    k_theta: float = 0.0
    rho_weight: float = 1.0


class VariationalSystem:
    """Minimal 2-DOF system with trust coupling."""

    def __init__(self, cfg: LagrangianConfig):
        self.cfg = cfg

    def EL_rhs(self, t: float, y: np.ndarray, rho_fun: Callable[[float], float]) -> np.ndarray:
        a, a_dot, theta, theta_dot = y
        rho = rho_fun(t)
        dV_da = self.cfg.k_a * a + self.cfg.rho_weight * rho * 0.0  # rho enters quadratically
        dV_dtheta = self.cfg.k_theta * np.sin(theta)
        a_ddot = -(dV_da + self.cfg.gamma_a * a_dot) / self.cfg.m_a
        theta_ddot = -(dV_dtheta + self.cfg.gamma_theta * theta_dot) / self.cfg.I_theta
        return np.array([a_dot, a_ddot, theta_dot, theta_ddot], dtype=float)

    def leapfrog(self, y0: np.ndarray, t: np.ndarray, rho_fun: Callable[[float], float]) -> np.ndarray:
        dt = float(t[1] - t[0])
        y = np.zeros((len(t), 4), dtype=float)
        y[0] = y0
        a, v, theta, omega = map(float, y0)
        acc_state = self.EL_rhs(t[0], y0, rho_fun)
        v += 0.5 * dt * acc_state[1]
        omega += 0.5 * dt * acc_state[3]

        for idx in range(1, len(t)):
            a += dt * v
            theta += dt * omega
            state = np.array([a, v, theta, omega], dtype=float)
            acc_state = self.EL_rhs(t[idx], state, rho_fun)
            v += dt * acc_state[1]
            omega += dt * acc_state[3]
            y[idx] = np.array(
                [a, v - 0.5 * dt * acc_state[1], theta, omega - 0.5 * dt * acc_state[3]],
                dtype=float,
            )
        return y

    @staticmethod
    def energy(
        cfg: LagrangianConfig,
        y: np.ndarray,
        rho_fun: Callable[[float], float],
        t: np.ndarray,
    ) -> np.ndarray:
        a, a_dot, theta, theta_dot = y.T
        rho_vals = np.array([rho_fun(float(ti)) for ti in t])
        kinetic = 0.5 * cfg.m_a * a_dot * a_dot + 0.5 * cfg.I_theta * theta_dot * theta_dot
        potential = (
            0.5 * cfg.k_a * a * a
            + cfg.k_theta * (1.0 - np.cos(theta))
            + 0.5 * cfg.rho_weight * rho_vals * rho_vals
        )
        return kinetic + potential


def ensure_hermitian(matrix: np.ndarray) -> np.ndarray:
    return 0.5 * (matrix + matrix.conj().T)


class GKSL:
    """Single-qubit GKSL integrator with RK4 stepping."""

    def __init__(self, H: np.ndarray, L_ops: Tuple[np.ndarray, ...]):
        self.H = ensure_hermitian(np.array(H, dtype=complex))
        self.L_ops = tuple(np.array(L, dtype=complex) for L in L_ops)

    @staticmethod
    def _d_rho(H: np.ndarray, L_ops: Tuple[np.ndarray, ...], rho: np.ndarray, hbar: float) -> np.ndarray:
        comm = H @ rho - rho @ H
        derivative = -1j / hbar * comm
        for L in L_ops:
            LdL = L.conj().T @ L
            derivative += L @ rho @ L.conj().T - 0.5 * (LdL @ rho + rho @ LdL)
        return derivative

    def step_rk4(self, rho: np.ndarray, dt: float, hbar: float) -> np.ndarray:
        k1 = self._d_rho(self.H, self.L_ops, rho, hbar)
        k2 = self._d_rho(self.H, self.L_ops, rho + 0.5 * dt * k1, hbar)
        k3 = self._d_rho(self.H, self.L_ops, rho + 0.5 * dt * k2, hbar)
        k4 = self._d_rho(self.H, self.L_ops, rho + dt * k3, hbar)
        rho_next = rho + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)
        rho_next = ensure_hermitian(rho_next)
        vals, vecs = np.linalg.eigh(rho_next)
        vals = np.clip(vals.real, 0.0, None)
        rho_next = vecs @ np.diag(vals) @ vecs.conj().T
        trace = np.trace(rho_next).real
        if trace > 0:
            rho_next /= trace
        return rho_next


def von_neumann_entropy(rho: np.ndarray) -> float:
    vals = np.clip(eigvalsh(ensure_hermitian(rho)), 1e-16, 1.0)
    return float(-np.sum(vals * np.log(vals)))


class UnityBridge:
    """Simple UDP sender with context manager support."""

    def __init__(self, host: str = "127.0.0.1", port: int = 44444):
        self.addr = (host, int(port))
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def __enter__(self) -> "UnityBridge":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def send(self, payload: Dict) -> None:
        message = json.dumps({"topic": "phase_vii", "t": time.time(), "payload": payload})
        self.sock.sendto(message.encode("utf-8"), self.addr)

    def close(self) -> None:
        self.sock.close()


__all__ = [
    "CONST",
    "GKSL",
    "LagrangianConfig",
    "UnityBridge",
    "VariationalSystem",
    "von_neumann_entropy",
]
