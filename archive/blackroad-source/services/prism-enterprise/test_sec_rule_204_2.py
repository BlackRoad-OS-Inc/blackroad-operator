"""Tests for the SEC rule 204-2 Rego policy and runtime gate."""

from __future__ import annotations

from pathlib import Path
from typing import List

import pytest
from regopy import Input, Interpreter

from orchestrator.exceptions import PolicyViolationError
from orchestrator.protocols import Task, TaskPriority
from orchestrator.sec import OVERRIDE_ENV_VAR, OVERRIDE_TOKEN, SecRule2042Gate

POLICY_PATH = Path("policies/sec_rule_204_2.rego")


def _load_interpreter() -> Interpreter:
    interpreter = Interpreter()
    source = POLICY_PATH.read_text(encoding="utf-8")
    interpreter.add_module(POLICY_PATH.name, source)
    return interpreter


def _query_strings(output) -> List[str]:
    messages: List[str] = []
    for result in getattr(output, "results", []):
        for expression in result.expressions:
            if isinstance(expression, list):
                messages.extend(str(item) for item in expression if isinstance(item, str))
            elif isinstance(expression, str):
                messages.append(expression)
            elif isinstance(expression, dict):
                for key, value in expression.items():
                    if value is True:
                        messages.append(str(key))
    return messages


def _query_bool(output) -> bool:
    for result in getattr(output, "results", []):
        for expression in result.expressions:
            if isinstance(expression, bool):
                return expression
    return False


@pytest.mark.parametrize(
    "deviation,citations,expected_allowed",
    [
        (0.15, [], False),
        (0.08, [], True),
        (0.2, ["https://example.com/10q"], True),
    ],
)
def test_rego_policy_allows_and_denies_based_on_input(deviation: float, citations: List[str], expected_allowed: bool) -> None:
    interpreter = _load_interpreter()
    payload = {
        "task": {
            "id": "TSK-FORECAST",
            "goal": "Prepare revenue forecast",
            "owner": "finance",
            "tags": ["forecast"],
            "metadata": {},
            "context": {},
        },
        "forecast": {
            "deviation": deviation,
            "citations": citations,
            "baseline": 100.0,
            "projection": 100.0 * (1 + deviation),
        },
    }
    interpreter.set_input(Input(payload))
    deny = _query_strings(interpreter.query("data.sec.rule_204_2.deny"))
    allow = _query_bool(interpreter.query("data.sec.rule_204_2.allow"))

    if expected_allowed:
        assert not deny
        assert allow
    else:
        assert deny
        assert not allow


def test_sec_gate_enforces_policy_for_tasks() -> None:
    gate = SecRule2042Gate(POLICY_PATH)
    task = Task(
        id="TSK-GATE",
        goal="Generate quarterly forecast",
        owner="finance",
        priority=TaskPriority.HIGH,
        metadata={"forecast": {"baseline": 1_000_000, "projection": 1_200_000, "citations": []}},
    )

    with pytest.raises(PolicyViolationError):
        gate.enforce(task)

    task.metadata["forecast"]["citations"] = ["https://example.com/supporting"]
    gate.enforce(task)


def test_sec_gate_override_allows_single_run(monkeypatch: pytest.MonkeyPatch) -> None:
    gate = SecRule2042Gate(POLICY_PATH)
    task = Task(
        id="TSK-OVERRIDE",
        goal="Generate emergency forecast",
        owner="finance",
        priority=TaskPriority.HIGH,
        metadata={"forecast": {"baseline": 1000, "projection": 1300, "citations": []}},
    )

    monkeypatch.setenv(OVERRIDE_ENV_VAR, OVERRIDE_TOKEN)
    gate.enforce(task)
