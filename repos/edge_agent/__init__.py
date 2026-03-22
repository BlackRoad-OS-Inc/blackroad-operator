"""Edge Agent package for frame capture, vitals computation, and gateway emission."""

from .config import EdgeAgentConfig, VitalWeights
from .runner import EdgeAgentRunner

__all__ = [
    "EdgeAgentConfig",
    "VitalWeights",
    "EdgeAgentRunner",
]
