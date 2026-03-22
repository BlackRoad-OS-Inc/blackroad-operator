#!/usr/bin/env python3
"""Execute eval specifications for LLM and API smoke tests."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def run_eval(spec: dict) -> dict:
    latency_samples = [sample.get("latency_ms", 0) for sample in spec.get("samples", [])]
    if not latency_samples:
        raise ValueError("spec must include latency samples")
    latency_samples.sort()
    index = min(len(latency_samples) - 1, int(round(0.95 * (len(latency_samples) - 1))))
    p95 = latency_samples[index]
    toxicity = max(sample.get("toxicity", 0.0) for sample in spec.get("samples", []))
    grounded = all(sample.get("grounded", True) for sample in spec.get("samples", []))
    score = spec.get("baseline_score", 0.0)
    return {
        "p95_ms": p95,
        "max_toxicity": toxicity,
        "grounded": grounded,
        "score": score,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", required=True, help="Path to eval spec JSON")
    args = parser.parse_args()

    spec_path = Path(args.spec)
    spec = json.loads(spec_path.read_text())
    result = run_eval(spec)
    output_path = Path("ops/artifacts/eval-result.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, indent=2))
    print(json.dumps(result))


if __name__ == "__main__":
    main()
