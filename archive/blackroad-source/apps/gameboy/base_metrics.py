from typing import Optional

import numpy as np

from gameboy_worlds.emulation.legend_of_zelda.parsers import BaseLegendOfZeldaParser
from gameboy_worlds.emulation.tracker import MetricGroup


class CoreLegendOfZeldaMetrics(MetricGroup):
    """
    Zelda-specific core metrics.

    Reports:
    - agent_state: Current parser-derived agent state.

    Final Reports:
    - None
    """

    NAME = "legend_of_zelda_core"
    REQUIRED_PARSER = BaseLegendOfZeldaParser

    def reset(self, first: bool = False):
        self.current_state = "in_dialogue"
        self._previous_state = self.current_state

    def close(self):
        self.reset()
        return

    def step(self, current_frame: np.ndarray, recent_frames: Optional[np.ndarray]):
        self._previous_state = self.current_state
        self.current_state = self.state_parser.get_agent_state(current_frame)

    def report(self) -> dict:
        return {"agent_state": self.current_state}

    def report_final(self) -> dict:
        return {}
