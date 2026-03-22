"""Runtime for executing <tool .../> tags generated offline."""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Tuple

from ..lineage import append as log_event
from ..policies import Policy
from ..tools.registry import ToolRegistry

_TAG = re.compile(r"<tool\s+([^>/]+?)/>")
_ATTR_RE = re.compile(r"(\w+)\s*=\s*\"((?:\\.|[^\"])*)\"")


@dataclass
class ToolContext:
    """Execution context tracking variables and artifacts."""

    vars: Dict[str, Any] = field(default_factory=dict)
    artifacts: List[str] = field(default_factory=list)

    def remember(self, value: Any) -> None:
        """Record ``value`` if it corresponds to a persisted artifact."""

        if isinstance(value, str) and os.path.exists(value) and value not in self.artifacts:
            self.artifacts.append(value)


def _decode_value(value: str) -> Any:
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        lowered = value.lower()
        if lowered in {"true", "false"}:
            return lowered == "true"
        try:
            if "." in value:
                return float(value)
            return int(value)
        except ValueError:
            return value


def _parse_attrs(raw: str) -> Dict[str, Any]:
    attrs = dict(_ATTR_RE.findall(raw))
    out: Dict[str, Any] = {}
    for key, value in attrs.items():
        if key == "args":
            try:
                data = json.loads(value)
                if isinstance(data, dict):
                    out.update(data)
                else:
                    out[key] = data
            except json.JSONDecodeError:
                out[key] = value
        else:
            out[key] = _decode_value(value)
    return out


def _lookup(registry: ToolRegistry | Dict[str, Any], name: str):
    if hasattr(registry, "get"):
        return registry.get(name)
    return registry[name]


def execute_tagged_text(
    text: str,
    registry: ToolRegistry | Dict[str, Any],
    policy: Policy | None = None,
    ctx: ToolContext | None = None,
) -> Tuple[str, List[Dict[str, Any]]]:
    """Execute <tool .../> tags embedded in ``text``."""

    policy = policy or Policy()
    ctx = ctx or ToolContext()
    cursor = 0
    rendered: List[str] = []
    trace: List[Dict[str, Any]] = []

    for match in _TAG.finditer(text):
        rendered.append(text[cursor : match.start()])
        attrs = _parse_attrs(match.group(1))
        name = attrs.pop("name", None)
        if not name:
            raise ValueError(f"tool tag missing name attribute: {match.group(0)}")
        if name.startswith("llm.") and not policy.allow_network:
            log_event({"kind": "tool_error", "name": name, "error": "network disabled"})
            rendered.append(f'<error tool="{name}" reason="network disabled"/>')
            cursor = match.end()
            continue
        alias = attrs.pop("as", None)
        source_var = attrs.pop("from", None)
        call_kwargs = dict(attrs)
        try:
            func = _lookup(registry, name)
            if source_var:
                if source_var not in ctx.vars:
                    raise ValueError(f"Unknown var '{source_var}'")
                result = func(ctx.vars[source_var], **call_kwargs)
            else:
                result = func(**call_kwargs)
        except Exception as exc:
            log_event({"kind": "tool_error", "name": name, "error": str(exc)})
            rendered.append(f'<error tool="{name}" reason="{str(exc)}"/>')
            cursor = match.end()
            continue
        if alias:
            ctx.vars[alias] = result
        ctx.remember(result)
        trace.append({"name": name, "as": alias, "from": source_var, "type": type(result).__name__})
        log_event(
            {
                "kind": "tool",
                "name": name,
                "as": alias,
                "from": source_var,
                "args": {k: str(v)[:200] for k, v in call_kwargs.items()},
            }
        )
        rendered.append(f'<result name="{alias or name}" type="{type(result).__name__}"/>')
        cursor = match.end()
    rendered.append(text[cursor:])
    return "".join(rendered), trace


__all__ = ["ToolContext", "execute_tagged_text"]
