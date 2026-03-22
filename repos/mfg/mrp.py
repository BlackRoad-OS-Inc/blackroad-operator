"""Lightweight MRP planner used by the unit tests."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Dict, List

ART_DIR: Path = Path("artifacts/mfg/mrp")
PLM_DIR: Path = Path("artifacts/plm")
ITEMS_PATH: Path = PLM_DIR / "items.json"
BOMS_PATH: Path = PLM_DIR / "boms.json"


def _ensure_art_dir() -> Path:
    path = Path(ART_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _read_table(path: str, key_field: str, value_field: str) -> Dict[str, float]:
    table: Dict[str, float] = {}
    csv_path = Path(path)
    if not csv_path.exists():
        return table
    with csv_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            key = (row.get(key_field) or "").strip()
            if not key:
                continue
            try:
                value = float(row.get(value_field, 0) or 0)
            except ValueError:
                value = 0.0
            table[key] = table.get(key, 0.0) + value
    return table


def _load_items_catalog() -> Dict[str, Dict[str, float]]:
    catalog: Dict[str, Dict[str, float]] = {}
    if not ITEMS_PATH.exists():
        return catalog
    with ITEMS_PATH.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if isinstance(data, list):
        for row in data:
            item_id = str(row.get("id", ""))
            if not item_id:
                continue
            rev = str(row.get("rev", "A")) or "A"
            entry = catalog.setdefault(item_id, {})
            entry[rev] = float(row.get("lead_time_days", 0) or 0.0)
    return catalog


def _load_boms_catalog() -> Dict[tuple[str, str], Dict[str, object]]:
    mapping: Dict[tuple[str, str], Dict[str, object]] = {}
    if not BOMS_PATH.exists():
        return mapping
    with BOMS_PATH.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if isinstance(data, list):
        for row in data:
            item_id = str(row.get("item_id", ""))
            rev = str(row.get("rev", "A")) or "A"
            if item_id:
                mapping[(item_id, rev)] = row
    return mapping


def _latest_lead_time(item_id: str, catalog: Dict[str, Dict[str, float]]) -> float:
    revs = catalog.get(item_id, {})
    if not revs:
        return 0.0
    latest_rev = sorted(revs)[-1]
    return float(revs.get(latest_rev, 0.0))


def _explode_components(
    item_id: str,
    planned_qty: float,
    boms_catalog: Dict[tuple[str, str], Dict[str, object]],
) -> List[Dict[str, float]]:
    try:
        from plm import bom as plm_bom  # type: ignore

        if getattr(plm_bom, "_BOMS", []):
            rev = plm_bom.latest_revision(item_id)
            rows = plm_bom.explode(item_id, rev, level=1)
            return [
                {
                    "component_id": row["component_id"],
                    "qty": round(row["qty"] * planned_qty, 6),
                }
                for row in rows
            ]
    except Exception:
        pass

    revs = sorted(rev for (itm, rev) in boms_catalog if itm == item_id)
    if not revs:
        return []
    bom_row = boms_catalog[(item_id, revs[-1])]
    components: List[Dict[str, float]] = []
    for line in bom_row.get("lines", []) or []:
        if not isinstance(line, dict):
            continue
        comp_id = str(line.get("component_id", ""))
        if not comp_id:
            continue
        qty = float(line.get("qty", 0) or 0.0)
        scrap = float(line.get("scrap_pct", 0) or 0.0)
        components.append(
            {
                "component_id": comp_id,
                "qty": round(planned_qty * qty * (1 + scrap / 100.0), 6),
            }
        )
    return components


def _write_kitting_csv(art_dir: Path, item_id: str, components: List[Dict[str, float]]) -> None:
    path = art_dir / f"kitting_{item_id}.csv"
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["component_id", "qty"])
        for row in components:
            writer.writerow([row["component_id"], f"{row['qty']:.6f}"])


def plan(demand_csv: str, inventory_csv: str, pos_csv: str) -> Dict[str, Dict[str, float]]:
    """Compute a minimal MRP plan.

    Demand is netted against on-hand inventory and open purchase orders.
    Only positive net requirements result in a planned order.  The result
    structure is intentionally small and deterministic so the tests can
    assert on its contents and on the JSON artifact that is written.
    """

    demand = _read_table(demand_csv, "item_id", "qty")
    inventory = _read_table(inventory_csv, "item_id", "qty")
    pos = _read_table(pos_csv, "item_id", "qty_open")
    items_catalog = _load_items_catalog()
    boms_catalog = _load_boms_catalog()

    plan_output: Dict[str, Dict[str, float]] = {}
    kitting_components: Dict[str, List[Dict[str, float]]] = {}
    for item_id, demand_qty in sorted(demand.items()):
        net = demand_qty - inventory.get(item_id, 0.0) - pos.get(item_id, 0.0)
        if net <= 0:
            continue
        planned_qty = round(net, 6)
        components = _explode_components(item_id, planned_qty, boms_catalog)
        release_offset = _latest_lead_time(item_id, items_catalog)
        plan_output[item_id] = {
            "planned_qty": planned_qty,
            "release_day_offset": release_offset,
            "kitting_list": [row["component_id"] for row in components] or [item_id],
        }
        kitting_components[item_id] = components

    art_dir = _ensure_art_dir()
    plan_path = art_dir / "plan.json"
    plan_path.write_text(json.dumps(plan_output, indent=2, sort_keys=True), encoding="utf-8")
    for item_id, components in kitting_components.items():
        _write_kitting_csv(art_dir, item_id, components)
    return plan_output


def cli_mrp(argv: list[str] | None = None) -> Dict[str, Dict[str, float]]:
    parser = argparse.ArgumentParser(prog="mfg:mrp", description="Run a lightweight MRP plan")
    parser.add_argument("--demand", required=True)
    parser.add_argument("--inventory", required=True)
    parser.add_argument("--pos", required=True)
    args = parser.parse_args(argv)
    return plan(args.demand, args.inventory, args.pos)


__all__ = ["plan", "cli_mrp", "ART_DIR"]
