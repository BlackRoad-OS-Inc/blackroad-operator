import json
import math
import sys
from typing import Dict, List

import numpy as np
from lib.data_loader import save_notebook_artifact


def simulate_factor_depth(n: int) -> List[int]:
    depths = []
    value = n
    while value > 1:
        for prime in range(2, int(math.sqrt(value)) + 1):
            if value % prime == 0:
                depths.append(prime)
                value //= prime
                break
        else:
            depths.append(value)
            break
    return depths


def build_summary(samples: int) -> Dict[str, float]:
    rng = np.random.default_rng(42)
    lengths = [len(simulate_factor_depth(int(x))) for x in rng.integers(50, 200, samples)]
    return {"mean_depth": float(np.mean(lengths)), "max_depth": float(np.max(lengths))}


def main(raw_cfg: str) -> None:
    try:
        cfg = json.loads(raw_cfg)
    except json.JSONDecodeError as e:
        print(f"Error: Provided argument is not valid JSON: {e}", file=sys.stderr)
        sys.exit(1)
    summary = build_summary(samples=25)
    save_notebook_artifact(cfg["notebook"], {"summary": summary, "cfg": cfg})


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python simulate_factor_tree.py '<json_config>'", file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1])
