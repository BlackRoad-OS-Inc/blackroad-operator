"""Very small routing helpers used in the capacity test."""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Dict, Iterable, List

import yaml

ART_DIR: Path = Path("artifacts/mfg/routing")
WC_PATH: Path = ART_DIR / "work_centers.json"
ROUTINGS_PATH: Path = ART_DIR / "routings.json"

WC_DB: Dict[str, Dict[str, float]] = {}
ROUT_DB: Dict[str, Dict[str, object]] = {}


def _ensure_art_dir() -> Path:
    path = Path(ART_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def load_work_centers(csv_path: str) -> Dict[str, Dict[str, float]]:
    table: Dict[str, Dict[str, float]] = {}
    with Path(csv_path).open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            wc_id = (row.get("id") or row.get("work_center_id") or "").strip()
            if not wc_id:
                continue
            skills_raw = row.get("skills", "")
            if isinstance(skills_raw, str):
                skills = [token.strip() for token in skills_raw.replace(";", "|").split("|") if token.strip()]
            else:
                skills = []
            table[wc_id] = {
                "name": (row.get("name") or wc_id).strip(),
                "capacity_per_shift": float(row.get("capacity_per_shift", 0) or 0.0),
                "skills": skills,
                "cost_rate": float(row.get("cost_rate", 0) or 0.0),
            }

    WC_DB.clear()
    WC_DB.update(table)
    _ensure_art_dir()
    WC_PATH.write_text(json.dumps(table, indent=2, sort_keys=True), encoding="utf-8")
    return table


def load_routings(directory: str, strict: bool = False) -> Dict[str, Dict[str, object]]:
    routings: Dict[str, Dict[str, object]] = {}
    for path in sorted(Path(directory).glob("*.y*ml")):
        with path.open(encoding="utf-8") as handle:
            data = yaml.safe_load(handle) or {}
        if not isinstance(data, dict):
            if strict:
                raise ValueError(f"invalid routing payload in {path}")
            continue
        item = str(data.get("item") or data.get("item_id") or "").strip()
        rev = str(data.get("rev", "A")).strip() or "A"
        if not item:
            if strict:
                raise ValueError(f"routing missing item id in {path}")
            continue
        key = f"{item}_{rev}"
        steps = data.get("steps") or []
        normalised_steps: List[dict] = []
        if isinstance(steps, list):
            for step in steps:
                if isinstance(step, dict):
                    normalised_steps.append(
                        {
                            "wc": step.get("wc"),
                            "op": step.get("op"),
                            "std_time_min": float(step.get("std_time_min", 0) or 0.0),
                            "yield_pct": float(step.get("yield_pct", 100) or 100.0),
                            "instructions_path": step.get("instructions_path"),
                        }
                    )
        routings[key] = {"item": item, "rev": rev, "steps": normalised_steps}

    ROUT_DB.clear()
    ROUT_DB.update(routings)
    _ensure_art_dir()
    ROUTINGS_PATH.write_text(json.dumps(routings, indent=2, sort_keys=True), encoding="utf-8")
    return routings


def _iter_steps(item: str, rev: str) -> Iterable[dict]:
    routing = ROUT_DB.get(f"{item}_{rev}")
    if not routing:
        raise ValueError(f"routing not found for {item} rev {rev}")
    steps = routing.get("steps") or []
    if not isinstance(steps, list):
        raise ValueError("steps must be a list")
    for step in steps:
        if not isinstance(step, dict):
            raise ValueError("routing steps must be dictionaries")
        yield step


def capcheck(item: str, rev: str, qty: float) -> Dict[str, object]:
    """Aggregate standard times and theoretical labour cost.

    The helper expects ``WC_DB`` to contain work centre definitions with
    ``capacity_per_shift`` (in hours) and ``cost_rate`` (per hour).  The
    routing dictionary mirrors what the tests populate: a mapping with a
    ``steps`` list containing ``std_time_min`` values.
    """

    wc_totals: Dict[str, float] = {}
    for step in _iter_steps(item, rev):
        wc = step.get("wc")
        if not wc:
            continue
        std_time = float(step.get("std_time_min", 0) or 0)
        yield_pct = float(step.get("yield_pct", 100) or 100)
        effective = std_time / (yield_pct / 100.0) if yield_pct else std_time
        wc_totals[wc] = wc_totals.get(wc, 0.0) + qty * effective

    work_centers: Dict[str, Dict[str, float]] = {}
    labour_cost = 0.0
    for wc, required_min in wc_totals.items():
        wc_def = WC_DB.get(wc, {})
        capacity_hours = float(wc_def.get("capacity_per_shift", 0) or 0)
        cost_rate = float(wc_def.get("cost_rate", 0) or 0)
        capacity_min = capacity_hours * 60.0
        work_centers[wc] = {
            "required_minutes": required_min,
            "available_minutes": capacity_min,
        }
        labour_cost += (required_min / 60.0) * cost_rate

    result = {
        "item": item,
        "rev": rev,
        "qty": qty,
        "work_centers": work_centers,
        "theoretical_labor_cost": labour_cost,
    }
    _ensure_art_dir()
    out_path = ART_DIR / f"capcheck_{item}_{rev}.json"
    out_path.write_text(json.dumps(result, indent=2, sort_keys=True), encoding="utf-8")
    return result


__all__ = [
    "ART_DIR",
    "WC_DB",
    "ROUT_DB",
    "load_work_centers",
    "load_routings",
    "capcheck",
]
