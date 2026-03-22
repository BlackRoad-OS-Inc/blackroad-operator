from __future__ import annotations

from bots.base import new_msg
from bots.bus import Bus
from orchestrator.run_demo import wire


def test_pipeline_runs() -> None:
    bus = Bus()
    wire(bus)
    bus.publish(new_msg("user", "planner", "task", op="plan", goal="make_bell_hist"))
    assert len(bus.history()) > 0
