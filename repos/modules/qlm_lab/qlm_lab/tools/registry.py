"""Tool registry helpers for the Toolformer runtime."""
from __future__ import annotations

from typing import Any, Callable, Dict

from . import la, math_cas, quantum_np, viz


class ToolRegistry:
    """Name→callable registry for LLM tool-calling."""

    def __init__(self) -> None:
        self._map: Dict[str, Callable[..., Any]] = {}

    def register(self, name: str, fn: Callable[..., Any]) -> None:
        self._map[name] = fn

    def get(self, name: str) -> Callable[..., Any]:
        if name not in self._map:
            raise KeyError(f"Unknown tool '{name}'")
        return self._map[name]

    def as_dict(self) -> Dict[str, Callable[..., Any]]:
        return dict(self._map)


def default_registry() -> ToolRegistry:
    """Populate a registry with the standard QLM tools."""

    reg = ToolRegistry()
    reg.register("quantum_np.bell_phi_plus", quantum_np.bell_phi_plus)
    reg.register("quantum_np.measure_counts", quantum_np.measure_counts)
    reg.register("quantum_np.chsh_value_phi_plus", quantum_np.chsh_value_phi_plus)
    reg.register("quantum_np.qft_matrix", quantum_np.qft_matrix)
    reg.register("viz.hist", viz.hist)
    reg.register("viz.bloch", viz.bloch)
    reg.register("viz.ascii_circuit", viz.ascii_circuit)
    if hasattr(la, "eig"):
        reg.register("la.eig", getattr(la, "eig"))
    if hasattr(math_cas, "simplify"):
        reg.register("math_cas.simplify", getattr(math_cas, "simplify"))
    return reg


__all__ = ["ToolRegistry", "default_registry"]
