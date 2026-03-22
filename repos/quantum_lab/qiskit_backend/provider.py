"""Provider utilities for Qiskit backends."""
from __future__ import annotations

import importlib
import os
from dataclasses import dataclass
from typing import List


@dataclass
class BackendInfo:
    """Metadata describing a backend entry."""

    name: str
    description: str
    qubits: int
    online: bool


def load_backends() -> List[BackendInfo]:
    """Load backend definitions from the YAML file."""

    import yaml

    with open(os.path.join(os.path.dirname(__file__), "backends.yaml"), "r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    return [BackendInfo(**entry) for entry in data["backends"]]


def get_provider():
    """Return an authenticated provider when possible."""

    token = os.getenv("QISKIT_API_TOKEN")
    if not token:
        return None
    qiskit_ibm_runtime = importlib.import_module("qiskit_ibm_runtime")
    service_cls = getattr(qiskit_ibm_runtime, "QiskitRuntimeService")
    return service_cls(channel="ibm_quantum", token=token)
