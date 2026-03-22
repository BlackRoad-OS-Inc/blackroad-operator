"""Unit tests for :mod:`agents.cusum_monitor_agent`."""

from datetime import datetime

import pytest

from agents.cusum_monitor_agent import CUSUMMonitorAgent


@pytest.fixture
def agent() -> CUSUMMonitorAgent:
    return CUSUMMonitorAgent({"model-a:v1": (0.0, 1.0)}, k=0.25, h=4.0)


def test_update_returns_none_when_no_alarm(agent: CUSUMMonitorAgent) -> None:
    for _ in range(5):
        assert agent.update("model-a:v1", 0.05) is None


def test_agent_emits_stage_shift_playbook(agent: CUSUMMonitorAgent) -> None:
    # Feed a persistent 0.5 sigma shift; the detector should alarm within ~16 points.
    event = None
    for _ in range(20):
        event = agent.update("model-a:v1", 0.5, timestamp=datetime(2024, 1, 1))
        if event:
            break

    assert event is not None
    assert event["direction"] == "up"
    assert event["model_key"] == "model-a:v1"
    assert event["timestamp"] == "2024-01-01T00:00:00"
    assert event["playbook"][0]["action"] == "traffic_shift"
    assert event["playbook"][1]["action"] == "diagnostic_ab"
    assert event["playbook"][2]["action"] == "decision_gate"


def test_register_baseline_overwrites_existing(agent: CUSUMMonitorAgent) -> None:
    agent.register_baseline("model-a:v1", mu=1.0, sigma=2.0, k=0.5, h=5.0)
    state = dict(agent.iter_state())["model-a:v1"]
    assert state["mu"] == 1.0
    assert state["sigma"] == 2.0
    assert state["k"] == 0.5
    assert state["h"] == 5.0
