"""RoadQLM command line interface."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from .bench.harness import run_suite
from .core.circuit import Circuit
from .core.oq3 import export as export_oq3


def _load_example(path: Path) -> Circuit:
    data = json.loads(path.read_text())
    circuit = Circuit(num_qubits=data["num_qubits"])
    for op in data.get("operations", []):
        circuit.add(op["name"], *op["qubits"], params=op.get("params"))
    for meas in data.get("measurements", []):
        circuit.measure(meas["qubit"], meas["cbit"])
    return circuit


def _command_bench(args: argparse.Namespace) -> None:
    results = run_suite(output_dir=args.output)
    print(json.dumps(results, indent=2))


def _command_export(args: argparse.Namespace) -> None:
    circuit = _load_example(Path(args.input))
    if args.format == "oq3":
        text = export_oq3(circuit)
    else:
        raise ValueError(f"Unsupported format: {args.format}")
    Path(args.output).write_text(text)
    print(f"Exported to {args.output}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="roadqlm", description="Agent-first quantum SDK")
    sub = parser.add_subparsers(dest="command")

    bench_parser = sub.add_parser("bench", help="Run benchmark suite")
    bench_parser.add_argument("--output", type=str, default=None)
    bench_parser.set_defaults(func=_command_bench)

    export_parser = sub.add_parser("export", help="Export circuits")
    export_parser.add_argument("--format", type=str, default="oq3")
    export_parser.add_argument("--input", type=str, required=True)
    export_parser.add_argument("--output", type=str, required=True)
    export_parser.set_defaults(func=_command_export)

    return parser


def main(argv: list[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    if not hasattr(args, "func"):
        parser.print_help()
        return
    args.func(args)


__all__ = ["build_parser", "main"]
