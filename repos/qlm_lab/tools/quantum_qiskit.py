"""Placeholder for optional Qiskit integration."""
from __future__ import annotations

from typing import Any, Dict


class QiskitUnavailable(RuntimeError):
    pass


def ensure_available() -> None:
    raise QiskitUnavailable("Qiskit backend not implemented in this lightweight build")


def run_circuit(*_args: Any, **_kwargs: Any) -> Dict[str, Any]:
    ensure_available()
    return {}
