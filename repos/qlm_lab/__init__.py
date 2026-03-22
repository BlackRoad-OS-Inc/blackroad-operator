"""Quantum Language Model (QLM) laboratory package.

This package provides a minimal yet extensible multi-agent framework where
classical language-model agents collaborate with quantum-aware computation tools
implemented with NumPy.  The top-level package exposes the orchestrator entry
points used by the demos and notebooks.
"""

from .orchestrator import Orchestrator  # noqa: F401

__all__ = ["Orchestrator"]
