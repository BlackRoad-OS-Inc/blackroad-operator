"""Bell/CHSH demo orchestrating the agent system."""
from __future__ import annotations

from ..orchestrator import Orchestrator


def main() -> None:
    orchestrator = Orchestrator()
    result = orchestrator.run_goal("demo_bell")
    for report in result.reports:
        print(report)


if __name__ == "__main__":  # pragma: no cover
    main()
