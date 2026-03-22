from pathlib import Path
import csv
from typing import Dict

import settings
from dq import checks

BASE = Path("artifacts/pipelines/finance_margin")


def _read(path: Path):
    with path.open() as f:
        return list(csv.DictReader(f))


def run(inputs: Dict | None = None) -> Dict:
    inputs = inputs or {}
    sample_base = Path(inputs.get("sample_dir", "samples/generated/finance"))
    pricing = {r["id"]: float(r["price"]) for r in _read(sample_base / "pricing.csv")}
    cogs = {r["id"]: float(r["cogs"]) for r in _read(sample_base / "cogs.csv")}
    volume = {r["id"]: float(r["volume"]) for r in _read(sample_base / "volume.csv")}

    rows = []
    for pid in pricing:
        row = {
            "id": pid,
            "price": pricing[pid],
            "cogs": cogs.get(pid, 0.0),
            "volume": volume.get(pid, 0.0),
        }
        row["margin"] = (row["price"] - row["cogs"]) * row["volume"]
        rows.append(row)

    if settings.STRICT_DQ:
        mv = checks.check_missing_values(rows)
        sc = checks.check_schema(rows, {"id": str, "price": float, "cogs": float, "volume": float, "margin": float})
        if mv or sc:
            raise ValueError("DQ failure")

    BASE.mkdir(parents=True, exist_ok=True)
    out_path = BASE / "margin.csv"
    with out_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    return {"output": str(out_path), "rows": len(rows)}


if __name__ == "__main__":
    print(run())
from __future__ import annotations

from contracts.validate import validate_rows
from lake.io import write_table


def run() -> None:
    rows = [
        {"date": "2025-06-01", "region": "NA", "product": "A", "amount": 100.0, "profit": 40.0},
        {"date": "2025-06-01", "region": "EU", "product": "A", "amount": 200.0, "profit": 80.0},
    ]
    validate_rows("finance_txn", rows)
    write_table("finance_txn", rows)

