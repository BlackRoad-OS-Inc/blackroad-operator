from __future__ import annotations

"""LLM provider abstractions used by the QLM agent."""

from dataclasses import dataclass

from ..policies import Policy


@dataclass
class LLMProvider:
    """Abstract interface returning text that may contain tool tags."""

    def run(self, prompt: str, policy: Policy) -> str:  # pragma: no cover - interface
        raise NotImplementedError


class NullLLM(LLMProvider):
    """Offline provider that simply echoes the prompt."""

    def run(self, prompt: str, policy: Policy) -> str:
        return prompt


class OpenAIProvider(LLMProvider):
    """Placeholder provider raising when network access is disallowed."""

    def __init__(self) -> None:  # pragma: no cover - trivial init
        pass

    def run(self, prompt: str, policy: Policy) -> str:
        if not policy.allow_network:
            raise PermissionError("Remote LLM disabled by policy")
        raise NotImplementedError("Wire a real client only when policy allows")


__all__ = ["LLMProvider", "NullLLM", "OpenAIProvider"]
