"""Critic agent enforcing physical validity and policy constraints."""
from __future__ import annotations

from typing import Dict, List

from ..proto import Msg, new
from .base import Agent


class Critic(Agent):
    """Validate QLM outputs and report lineage events."""

    name = "critic"

    def can_handle(self, m: Msg) -> bool:
        return m.recipient == self.name and m.kind == "result"

    def _check_counts(self, counts: Dict[str, float]) -> bool:
        ordered = sorted(counts.items(), key=lambda item: item[1], reverse=True)
        top_two = ordered[:2]
        total = sum(value for _, value in top_two)
        return abs(total - 1.0) <= 0.05

    def handle(self, m: Msg) -> List[Msg]:
        messages: List[Msg] = []
        if m.op == "prove_chsh":
            s = float(m.args.get("s", 0.0))
            ok = 2.2 < s <= 2.9
            critique = new(
                self.name,
                "archivist",
                "critique",
                m.op,
                ok=ok,
                s=s,
                source=m.sender,
            )
            messages.append(new(self.name, "archivist", "result", m.op, **m.args))
            messages.append(critique)
            summary = {
                "event": "chsh_evaluated",
                "ok": ok,
                "s": s,
            }
        elif m.op == "solve_quantum":
            counts = {str(k): float(v) for k, v in m.args.get("counts", {}).items()}
            ok = self._check_counts(counts)
            critique = new(
                self.name,
                "archivist",
                "critique",
                m.op,
                ok=ok,
                counts=counts,
                source=m.sender,
            )
            messages.append(new(self.name, "archivist", "result", m.op, **m.args))
            messages.append(critique)
            summary = {
                "event": "histogram_evaluated",
                "ok": ok,
                "counts": counts,
            }
        else:  # pragma: no cover - defensive guard for unexpected ops
            summary = {"event": "ignored", "op": m.op}
        messages.append(
            new(
                self.name,
                "archivist",
                "log",
                "critic",
                details=summary,
            )
        )
        return messages
