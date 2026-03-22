from __future__ import annotations

"""Tests for the LLM tool-calling runtime."""

import json
import os
from pathlib import Path

from qlm_lab.llm.runtime import ToolContext, execute_tagged_text
from qlm_lab.tools.registry import ToolRegistry, default_registry
from qlm_lab.policies import Policy
from qlm_lab.agents.qlm import QLM
from qlm_lab.bus import Bus
from qlm_lab.proto import new


LINEAGE_PATH = Path("artifacts/lineage.jsonl")


def _reset_lineage() -> None:
    if LINEAGE_PATH.exists():
        LINEAGE_PATH.unlink()


def test_tag_parse_and_dispatch_simple(monkeypatch):
    _reset_lineage()
    reg = default_registry()
    policy = Policy(allow_network=False)
    ctx = ToolContext()
    text = '<tool name="quantum_np.chsh_value_phi_plus" as="S"/>'
    out, trace = execute_tagged_text(text, reg, policy, ctx)
    assert "<result" in out
    assert any(t["name"].endswith("chsh_value_phi_plus") for t in trace)
    assert "S" in ctx.vars


def test_variable_flow_and_hist():
    _reset_lineage()
    reg = default_registry()
    policy = Policy()
    ctx = ToolContext()
    plan = (
        '<tool name="quantum_np.bell_phi_plus" as="psi"/>'
        '<tool name="quantum_np.measure_counts" from="psi" shots="1024" as="counts"/>'
        '<tool name="viz.hist" from="counts" fname="bell_hist_toolcaller_test.png" as="hist_path"/>'
    )
    out, trace = execute_tagged_text(plan, reg, policy, ctx)
    assert '<result name="counts"' in out
    assert ctx.vars["hist_path"].endswith("bell_hist_toolcaller_test.png")
    assert os.path.exists("artifacts/bell_hist_toolcaller_test.png")
    assert len(trace) == 3


def test_policy_blocks_llm_tools():
    _reset_lineage()
    reg = ToolRegistry()
    reg.register("llm.fake", lambda: "nope")
    policy = Policy(allow_network=False)
    ctx = ToolContext()
    text = '<tool name="llm.fake" as="resp"/>'
    out, trace = execute_tagged_text(text, reg, policy, ctx)
    assert "<error" in out
    assert trace == []
    assert LINEAGE_PATH.exists()
    lines = [json.loads(line) for line in LINEAGE_PATH.read_text().splitlines() if line.strip()]
    assert any(entry.get("kind") == "tool_error" for entry in lines)


def test_lineage_logs_tool_invocations():
    _reset_lineage()
    reg = default_registry()
    policy = Policy()
    ctx = ToolContext()
    execute_tagged_text('<tool name="quantum_np.chsh_value_phi_plus" as="S"/>', reg, policy, ctx)
    assert LINEAGE_PATH.exists()
    entries = [json.loads(line) for line in LINEAGE_PATH.read_text().splitlines() if line.strip()]
    assert any(entry.get("kind") == "tool" for entry in entries)


def test_qlm_agent_end_to_end_toolcaller():
    _reset_lineage()
    bus = Bus()
    agent = QLM(bus, policy=Policy(allow_network=False))
    msg = new("user", "qlm", "task", "solve_quantum_llm")
    responses = agent.handle(msg)
    assert responses and responses[0].kind == "result"
    payload = responses[0].args["text"]
    assert "<result" in payload
    assert os.path.exists("artifacts/bell_hist_empirical_toolcaller.png")
    entries = [json.loads(line) for line in LINEAGE_PATH.read_text().splitlines() if line.strip()]
    assert any(entry.get("kind") == "tool" for entry in entries)
