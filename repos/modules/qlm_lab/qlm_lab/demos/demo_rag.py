"""Demonstrate retrieval-augmented planning between Researcher and QLM."""
from __future__ import annotations

from ..agents.qlm import QLM
from ..agents.researcher import INDEX_PATH, RAG_TOPK_PATH, Researcher
from ..bus import Bus
from ..policies import Policy
from ..proto import new


def main() -> None:
    """Run a retrieval query followed by a freeform solve that consumes citations."""

    if not INDEX_PATH.exists():
        raise FileNotFoundError(
            f"Missing retrieval index at {INDEX_PATH}. Run `make ingest` and `make index` first."
        )
    bus = Bus()
    researcher = Researcher(bus)
    qlm = QLM(bus, policy=Policy())
    for agent in (researcher, qlm):
        bus.subscribe(agent)

    bus.publish(new("demo", "researcher", "task", "retrieve", query="CHSH Bell inequality", k=3))
    bus.publish(
        new(
            "demo",
            "qlm",
            "task",
            "solve_freeform",
            prompt="Explain the CHSH violation for Bell states.",
        )
    )
    print(f"RAG demo complete. Citations saved to {RAG_TOPK_PATH.resolve()}")


if __name__ == "__main__":
    main()
