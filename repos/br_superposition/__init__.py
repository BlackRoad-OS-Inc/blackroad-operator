"""
BlackRoad / Amundson Superposition Module

This module implements the mathematical framework for agent beliefs and identities
based on quantum-inspired superposition principles.

The module separates:
- BlackRoad equations: Established quantum mechanics (Born rule, entropy, etc.)
- Amundson equations: Novel extensions (contradiction energy, phase gap, temperature transforms)
"""

from .superposed_variable import SuperposedVariable
from .agent import Agent
from .orchestrator import Orchestrator, CoherenceBudget, MeasurementConfig
from .utils import phase_gap, contradiction_energy, spiral_mapping

__all__ = [
    "SuperposedVariable",
    "Agent",
    "Orchestrator",
    "CoherenceBudget",
    "MeasurementConfig",
    "phase_gap",
    "contradiction_energy",
    "spiral_mapping",
]

__version__ = "0.1.0"
