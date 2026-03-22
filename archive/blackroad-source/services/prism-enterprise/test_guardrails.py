import pytest

from orchestrator.base import assert_guardrails
from orchestrator.protocols import BotResponse


def test_guardrails_missing_fields():
    bad = BotResponse(
        task_id="T1",
        summary="",
        steps=[],
        data={},
        risks=[],
        artifacts=[],
        next_actions=[],
        ok=True,
    )
    with pytest.raises(AssertionError):
        assert_guardrails(bad)

from sales import guardrails


def test_sales_guardrails_codes():
    quote = {
        "lines": [
            {"sku": "F500-CORE", "qty": 1, "unit_price": 60, "options": {}}
        ],
    }
    rules = {"max_discount_pct": 15, "floor_prices": {"F500-CORE": 70}}
    violations = guardrails.check(quote, rules)
    codes = {v.code for v in violations}
    assert "DISC_OVER_MAX" in codes
    assert "BELOW_FLOOR" in codes
import json

import pytest

from bots.finance import FinanceBot
from orchestrator.orchestrator import Orchestrator
from tools import web_search


def test_web_search_disabled():
    with pytest.raises(NotImplementedError):
        web_search.search("test")


def test_logging(tmp_path):
    mem = tmp_path / "mem.jsonl"
    orch = Orchestrator(memory_path=mem)
    orch.register_bot("finance", FinanceBot())
    task = orch.create_task("Check treasury", "finance")
    orch.route(task.id)
    logs = [json.loads(line) for line in mem.read_text().splitlines()]
    events = {entry["event"] for entry in logs}
    assert {"task_created", "task_routed"} <= events
