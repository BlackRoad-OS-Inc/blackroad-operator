"""CLI helper for running a Lucidia Encompass vote.

Example
-------
$ python scripts/encompass_demo.py --prompt "Should we deploy the patch?"
"""
"""Command line demo for the Lucidia Encompass aggregator."""

from __future__ import annotations

import argparse
import json
from typing import Any

from agents.lucidia_encompass import run


def main(argv: Any = None) -> None:
    """Execute the demo CLI."""

    parser = argparse.ArgumentParser(description="Run a Lucidia Encompass vote")
    parser.add_argument("--prompt", required=True, help="Prompt to submit to all personas")
    args = parser.parse_args(argv)

    result = run(args.prompt)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
import pathlib
from typing import Any, Dict

from agents.lucidia_encompass import LucidiaEncompass
from agents.personas import load_default_personas


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", required=True, help="Prompt forwarded to every persona")
    parser.add_argument(
        "--output",
        type=pathlib.Path,
        default=None,
        help="Optional file where the JSON result will be written.",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="Pretty print JSON to stdout instead of a compact representation.",
    )
    return parser.parse_args(argv)


def run(prompt: str) -> Dict[str, Any]:
    personas = load_default_personas()
    aggregator = LucidiaEncompass(personas)
    return aggregator.run(prompt)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    result = run(args.prompt)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, indent=2 if args.pretty else None) + "\n", encoding="utf-8")

    json_payload = json.dumps(result, indent=2 if args.pretty else None)
    print(json_payload)
    return 0


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    raise SystemExit(main())
