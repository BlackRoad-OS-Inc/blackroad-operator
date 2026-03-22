from gameboy_worlds.emulation.legend_of_zelda.base_metrics import (
    CoreLegendOfZeldaMetrics,
)
from gameboy_worlds.emulation.tracker import StateTracker


class CoreLegendOfZeldaTracker(StateTracker):
    """
    StateTracker for core Legend of Zelda metrics.
    """

    def start(self):
        super().start()
        self.metric_classes.extend([CoreLegendOfZeldaMetrics])
