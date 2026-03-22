from __future__ import annotations

"""Demonstration of the QLM agent executing tool-tagged plans."""

from ..bus import Bus
from ..policies import Policy
from ..proto import new
from ..agents.qlm import QLM


def main() -> None:
    bus = Bus()
    qlm = QLM(bus, policy=Policy(allow_network=False))
    bus.subscribe(lambda m: None)
    bus.publish(new("user", "qlm", "task", "prove_chsh_llm"))
    bus.publish(new("user", "qlm", "task", "solve_quantum_llm"))
    print("OK: toolcaller demo executed. See artifacts/ for histograms.")


if __name__ == "__main__":
    main()
