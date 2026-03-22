"""
BlackRoad Agents
================
Six specialized AI agents that communicate through the BlackRoad Gateway.
All agents are tokenless — they only talk to the gateway, never directly to providers.

Usage:
    from blackroad_agents import Lucidia, Alice, Octavia, Prism, Echo, Cipher

    agent = Lucidia()
    response = await agent.reason("What is the optimal agent topology for 30K concurrent tasks?")
"""
from .lucidia import Lucidia
from .alice import Alice
from .octavia import Octavia
from .prism import Prism
from .echo import Echo
from .cipher import Cipher

__all__ = ["Lucidia", "Alice", "Octavia", "Prism", "Echo", "Cipher"]
__version__ = "0.1.0"

_AGENT_REGISTRY: dict[str, type] = {
    "lucidia": Lucidia,
    "alice": Alice,
    "octavia": Octavia,
    "prism": Prism,
    "echo": Echo,
    "cipher": Cipher,
}


def get_agent(name: str, **kwargs):
    """Factory: get an agent instance by name (case-insensitive)."""
    cls = _AGENT_REGISTRY.get(name.lower())
    if cls is None:
        available = ", ".join(_AGENT_REGISTRY.keys())
        raise ValueError(f"Unknown agent '{name}'. Available: {available}")
    return cls(**kwargs)


def list_agents() -> list[str]:
    """Return names of all registered agents."""
    return list(_AGENT_REGISTRY.keys())
