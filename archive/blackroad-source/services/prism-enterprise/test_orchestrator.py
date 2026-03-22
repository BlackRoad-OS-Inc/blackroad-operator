from bots.finance import FinanceBot
from orchestrator.orchestrator import Orchestrator

import time

from lucidia.orchestrator import run_shards

def test_routing_finance_bot(tmp_path):
    mem = tmp_path / "mem.jsonl"
    orch = Orchestrator(memory_path=mem)
    orch.register_bot("finance", FinanceBot())
    task = orch.create_task("Review treasury position", "finance")
    response = orch.route(task.id)
    assert response.status == "success"
    assert "treasury" in response.data.lower()


def test_state_persistence_across_instances(tmp_path):
    memory_path = tmp_path / "memory.jsonl"
    state_path = tmp_path / "orch_state.json"

    first = Orchestrator(memory_path=memory_path, state_path=state_path)
    first.register_bot("finance", FinanceBot())
    created = first.create_task("Check liquidity", "finance")
    first.route(created.id)

    # Recreate orchestrator using the same storage paths to ensure state loads.
    second = Orchestrator(memory_path=memory_path, state_path=state_path)
    second.register_bot("finance", FinanceBot())

    results, errors = run_shards(job, num_shards=10, timebox_seconds=0.05)
    assert 0 not in results
    assert 0 in errors

from pathlib import Path
import json
from datetime import datetime

from orchestrator.protocols import Task
from orchestrator.orchestrator import route
from orchestrator.base import assert_guardrails
from tools import storage


def test_treasury_bot_route_appends_memory():
    memory_path = Path("orchestrator/memory.jsonl")
    if memory_path.exists():
        memory_path.unlink()
    task = Task(id="TTEST", goal="Build 13-week cash view", context={}, created_at=datetime.utcnow())
    response = route(task, "Treasury-BOT")
    assert_guardrails(response)
    lines = storage.read(str(memory_path)).strip().splitlines()
    assert len(lines) == 1
    record = json.loads(lines[0])
    assert record["task"]["id"] == "TTEST"
    assert created.id in {task.id for task in second.list_tasks()}
    restored = second.get_status(created.id)
    assert restored is not None
    assert restored.status == "success"
