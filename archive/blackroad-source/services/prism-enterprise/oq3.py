"""Helpers for OpenQASM3 export."""

from __future__ import annotations

from .circuit import Circuit


def export(circuit: Circuit) -> str:
    """Return the OpenQASM 3 representation of *circuit*."""

    return circuit.to_openqasm3()


__all__ = ["export"]
