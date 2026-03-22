"""Deterministic Engineering Change Control helpers for the PLM tests.

The historical repository snapshot for this module contained partially
applied merges which left duplicated function bodies, missing helpers and
name mismatches (``new_change`` vs ``create_change``).  The regression
suite in ``tests/plm_mfg/test_eco.py`` exercises a small, file-backed ECO
workflow: creating a change, inspecting impact information, enforcing
dual approvals for high-risk changes, and blocking release whenever SPC
findings are present.  This rewrite provides a compact, fully tested
implementation focused on that surface area.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List

ART_DIR: Path = Path("artifacts/plm/changes")
COUNTER_FILE: Path = ART_DIR / "_counter"
PLM_CATALOG_DIR: Path = Path("artifacts/plm")
ROUTING_DIR: Path = Path("artifacts/mfg/routing")
SPC_FINDINGS_PATH: Path = Path("artifacts/mfg/spc/findings.json")
SPC_BLOCK_FLAG: Path = Path("artifacts/mfg/spc/blocking.flag")


@dataclass
class Change:
    id: str
    item_id: str
    from_rev: str
    to_rev: str
    reason: str
    risk: str = "medium"
    status: str = "draft"
    type: str = "ECO"
    effects: List[str] = field(default_factory=list)
    approvals: List[str] = field(default_factory=list)


def _ensure_art_dir() -> Path:
    path = Path(ART_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _path(change_id: str) -> Path:
    return _ensure_art_dir() / f"{change_id}.json"


def _next_id() -> str:
    art_dir = _ensure_art_dir()
    counter_path = art_dir / COUNTER_FILE.name
    current = 0
    if counter_path.exists():
        try:
            current = int(counter_path.read_text(encoding="utf-8").strip() or "0")
        except ValueError:
            current = 0
    current += 1
    counter_path.write_text(str(current), encoding="utf-8")
    return f"ECO-{current:05d}"


def _load(change_id: str) -> Change:
    data = json.loads(_path(change_id).read_text(encoding="utf-8"))
    return Change(**data)


def _unique(values: Iterable[str]) -> List[str]:
    seen: set[str] = set()
    ordered: List[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            ordered.append(value)
    return ordered


def _write(change: Change) -> None:
    payload = json.dumps(asdict(change), indent=2, sort_keys=True)
    _path(change.id).write_text(payload, encoding="utf-8")
    _write_markdown(change)


def _markdown_path(change_id: str) -> Path:
    return _ensure_art_dir() / f"eco_{change_id}.md"


def _write_markdown(change: Change) -> None:
    timestamp = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    lines = [
        f"# Engineering Change {change.id}",
        "",
        f"Item: {change.item_id}",
        f"From rev: {change.from_rev}",
        f"To rev: {change.to_rev}",
        f"Status: {change.status}",
        f"Risk: {change.risk}",
        "",
        f"Reason: {change.reason}",
        "",
        f"Updated: {timestamp}",
    ]
    _markdown_path(change.id).write_text("\n".join(lines) + "\n", encoding="utf-8")


def create_change(
    item_id: str,
    from_rev: str,
    to_rev: str,
    reason: str,
    *,
    risk: str = "medium",
    change_type: str = "ECO",
) -> Change:
    change = Change(
        id=_next_id(),
        item_id=item_id,
        from_rev=from_rev,
        to_rev=to_rev,
        reason=reason,
        risk=risk,
        type=change_type,
        effects=[item_id],
        approvals=[],
    )
    _write(change)
    return change


def new_change(*args, **kwargs) -> Change:  # pragma: no cover - compatibility shim
    return create_change(*args, **kwargs)


def approve(change_id: str, user: str) -> Change:
    change = _load(change_id)
    change.approvals = _unique([*change.approvals, user])
    if change.risk.lower() != "high" or len(change.approvals) >= 2:
        change.status = "approved"
    _write(change)
    return change


def _catalog_path(name: str) -> Path:
    return PLM_CATALOG_DIR / name


def _load_catalog(name: str) -> List[Dict[str, Any]]:
    path = _catalog_path(name)
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return list(data.values())
    return []


def _items_index() -> Dict[str, Dict[str, Dict[str, Any]]]:
    index: Dict[str, Dict[str, Dict[str, Any]]] = {}
    for row in _load_catalog("items.json"):
        item_id = str(row.get("id", "")).strip()
        rev = str(row.get("rev", "A")).strip() or "A"
        if not item_id:
            continue
        index.setdefault(item_id, {})[rev] = row
    return index


def _boms_index() -> Dict[tuple[str, str], Dict[str, Any]]:
    index: Dict[tuple[str, str], Dict[str, Any]] = {}
    for row in _load_catalog("boms.json"):
        item_id = str(row.get("item_id", "")).strip()
        rev = str(row.get("rev", "A")).strip() or "A"
        if item_id:
            index[(item_id, rev)] = row
    return index


def _routing_index() -> Dict[str, Dict[str, Any]]:
    path = ROUTING_DIR / "routings.json"
    if not path.exists():
        return {}
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if isinstance(data, dict):
        return data
    index: Dict[str, Dict[str, Any]] = {}
    if isinstance(data, list):
        for entry in data:
            if isinstance(entry, dict):
                key = f"{entry.get('item')}" + "_" + f"{entry.get('rev')}"
                index[key] = entry
    return index


def _bom_cost(bom_row: Dict[str, Any], item_costs: Dict[str, float]) -> float:
    total = 0.0
    for line in bom_row.get("lines", []) or []:
        if not isinstance(line, dict):
            continue
        component = str(line.get("component_id", ""))
        qty = float(line.get("qty", 0) or 0.0)
        scrap = float(line.get("scrap_pct", 0) or 0.0)
        total += qty * (1 + scrap / 100.0) * item_costs.get(component, 0.0)
    return total


def _supplier_risk(components: Iterable[str], items: Dict[str, Dict[str, Any]]) -> str:
    for component in components:
        options = items.get(component, {})
        if not options:
            return "single_source"
        latest_rev = sorted(options)[-1]
        suppliers = options.get(latest_rev, {}).get("suppliers", [])
        if not isinstance(suppliers, list):
            return "single_source"
        supplier_count = len([str(s).strip() for s in suppliers if str(s).strip()])
        if supplier_count < 2:
            return "single_source"
    return "ok"


def _impact_path(change_id: str) -> Path:
    return _ensure_art_dir() / f"{change_id}_impact.json"


def impact(change_id: str) -> Dict[str, Any]:
    change = _load(change_id)

    items_index = _items_index()
    item_costs: Dict[str, float] = {}
    for item_id, revs in items_index.items():
        if not revs:
            continue
        latest_rev = sorted(revs)[-1]
        row = revs.get(latest_rev, {})
        try:
            item_costs[item_id] = float(row.get("cost", 0) or 0.0)
        except (TypeError, ValueError):
            item_costs[item_id] = 0.0

    boms = _boms_index()
    from_bom = boms.get((change.item_id, change.from_rev)) or {"lines": []}
    to_bom = boms.get((change.item_id, change.to_rev)) or {"lines": []}

    def _components(bom_row: Dict[str, Any]) -> List[str]:
        components: List[str] = []
        for line in bom_row.get("lines", []) or []:
            if isinstance(line, dict):
                component = str(line.get("component_id", ""))
                if component:
                    components.append(component)
        return components

    from_components = set(_components(from_bom))
    to_components = set(_components(to_bom))
    components_added = sorted(to_components - from_components)
    components_removed = sorted(from_components - to_components)

    cost_from = _bom_cost(from_bom, item_costs)
    cost_to = _bom_cost(to_bom, item_costs)
    cost_delta = round(cost_to - cost_from, 4)

    routing_key = f"{change.item_id}_{change.to_rev}"
    routing = _routing_index().get(routing_key, {})
    work_centers = sorted(
        {
            str(step.get("wc"))
            for step in routing.get("steps", []) or []
            if isinstance(step, dict) and step.get("wc")
        }
    )

    payload = {
        "id": change.id,
        "item_id": change.item_id,
        "from_rev": change.from_rev,
        "to_rev": change.to_rev,
        "cost_delta": cost_delta,
        "components_added": components_added,
        "components_removed": components_removed,
        "supplier_risk": _supplier_risk(to_components, items_index),
        "impacted_work_centers": work_centers,
    }

    _impact_path(change.id).write_text(
        json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8"
    )
    return payload


def _spc_findings() -> List[str]:
    findings: List[str] = []
    if SPC_FINDINGS_PATH.exists():
        try:
            raw = json.loads(SPC_FINDINGS_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            raw = None
        if isinstance(raw, dict):
            data = raw.get("findings")
            if isinstance(data, list):
                findings = [str(entry) for entry in data if entry]
        elif isinstance(raw, list):
            findings = [str(entry) for entry in raw if entry]
    return findings


def release(change_id: str) -> Change:
    change = _load(change_id)

    if change.risk.lower() == "high" and len(change.approvals) < 2:
        raise SystemExit("Policy: dual approval required for high risk changes")

    if SPC_BLOCK_FLAG.exists():
        raise SystemExit("DUTY_SPC_UNSTABLE: SPC blocking flag present")

    findings = _spc_findings()
    if findings:
        raise SystemExit("DUTY_SPC_UNSTABLE: SPC findings detected")

    change.status = "released"
    _write(change)
    return change


def cli_eco_new(argv: List[str] | None = None) -> Change:
    parser = argparse.ArgumentParser(prog="plm:eco:new", description="Create a new ECO")
    parser.add_argument("--item", required=True)
    parser.add_argument("--from", dest="from_rev", required=True)
    parser.add_argument("--to", dest="to_rev", required=True)
    parser.add_argument("--reason", required=True)
    parser.add_argument("--risk", default="medium")
    parser.add_argument("--type", dest="change_type", default="ECO")
    args = parser.parse_args(argv)
    return create_change(
        args.item,
        args.from_rev,
        args.to_rev,
        args.reason,
        risk=args.risk,
        change_type=args.change_type,
    )


def cli_eco_impact(argv: List[str] | None = None) -> Dict[str, Any]:
    parser = argparse.ArgumentParser(prog="plm:eco:impact", description="Summarise ECO impact")
    parser.add_argument("--id", required=True)
    args = parser.parse_args(argv)
    return impact(args.id)


def cli_eco_release(argv: List[str] | None = None) -> Change:
    parser = argparse.ArgumentParser(prog="plm:eco:release", description="Release an ECO")
    parser.add_argument("--id", required=True)
    args = parser.parse_args(argv)
    return release(args.id)


__all__ = [
    "Change",
    "ART_DIR",
    "create_change",
    "new_change",
    "approve",
    "impact",
    "release",
    "cli_eco_new",
    "cli_eco_impact",
    "cli_eco_release",
]

