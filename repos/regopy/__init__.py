"""Lightweight stub of the regopy interface used in tests."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class Input:
    """Wrapper holding evaluation input."""

    value: Dict[str, Any]


@dataclass
class _QueryResult:
    expressions: List[Any]


class _Output:
    def __init__(self, expressions: Optional[List[Any]] = None) -> None:
        if expressions:
            self.results = [_QueryResult(expressions)]
        else:
            self.results: List[_QueryResult] = []


class Interpreter:
    """Minimal interpreter that evaluates the bundled SEC rule.

    The implementation mirrors the behaviour required by the unit tests without
    depending on the external :mod:`regopy` package.
    """

    def __init__(self) -> None:
        self._modules: Dict[str, str] = {}
        self._input: Optional[Dict[str, Any]] = None

    def add_module(self, name: str, source: str) -> None:
        """Store module source for completeness."""

        self._modules[name] = source

    def set_input(self, payload: Input) -> None:
        self._input = payload.value

    def query(self, path: str) -> _Output:
        if self._input is None:
            raise RuntimeError("input must be set before querying")

        if path.endswith(".deny"):
            message = self._deny_message(self._input)
            return _Output([message] if message else None)
        if path.endswith(".allow"):
            allowed = self._allow(self._input)
            return _Output([allowed])
        return _Output()

    def _allow(self, data: Dict[str, Any]) -> bool:
        return self._deny_message(data) is None

    def _deny_message(self, data: Dict[str, Any]) -> Optional[str]:
        if not self._is_forecast_task(data):
            return None
        deviation = self._forecast_deviation(data)
        citations = self._citations(data)
        if deviation is None:
            return None
        threshold = 0.10
        if deviation > threshold and len(citations) == 0:
            return (
                f"Forecast deviation {deviation * 100:.1f}% exceeds "
                f"{threshold * 100:.0f}% limit without citation"
            )
        return None

    def _citations(self, data: Dict[str, Any]) -> List[str]:
        forecast = data.get("forecast", {})
        citations = forecast.get("citations", [])
        if isinstance(citations, list):
            return [str(item) for item in citations]
        return []

    def _forecast_deviation(self, data: Dict[str, Any]) -> Optional[float]:
        forecast = data.get("forecast", {})
        deviation = forecast.get("deviation")
        if isinstance(deviation, (int, float)):
            return abs(float(deviation))
        if isinstance(deviation, str):
            try:
                return abs(float(deviation))
            except ValueError:
                pass
        baseline = forecast.get("baseline")
        projection = forecast.get("projection")
        try:
            baseline_val = float(baseline)
            projection_val = float(projection)
        except (TypeError, ValueError):
            return None
        if baseline_val == 0:
            return None
        return abs(projection_val - baseline_val) / abs(baseline_val)

    def _is_forecast_task(self, data: Dict[str, Any]) -> bool:
        task = data.get("task", {})
        goal = task.get("goal")
        if isinstance(goal, str) and "forecast" in goal.lower():
            return True
        metadata = task.get("metadata", {})
        intent = metadata.get("intent")
        if isinstance(intent, str) and intent.lower() == "forecast":
            return True
        tags = task.get("tags", [])
        if isinstance(tags, list):
            for tag in tags:
                if isinstance(tag, str) and "forecast" in tag.lower():
                    return True
        return False


__all__ = ["Input", "Interpreter"]
