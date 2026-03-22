"""Demonstration of the offline Toolformer planner."""
from __future__ import annotations

from ..bus import Bus
from ..proto import new
from ..policies import Policy
from ..agents.qlm import QLM


def main() -> None:
    bus = Bus()
    agent = QLM(bus, policy=Policy(allow_network=False))

    def dispatch(message):
        if agent.can_handle(message):
            for response in agent.handle(message):
                bus.publish(response)

    bus.subscribe(dispatch)
    prompt = "Show a CHSH Bell inequality violation and plot the Bell outcomes."
    bus.publish(new("user", agent.name, "task", "solve_freeform", prompt=prompt))
    print("OK: toolformer freeform demo complete. Check artifacts/ and prompt_cache.jsonl")


if __name__ == "__main__":
    main()
