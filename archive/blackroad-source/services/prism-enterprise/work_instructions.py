"""Generate simple Markdown and HTML work instructions."""

from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, Optional

ART_DIR: Path = Path("artifacts/mfg/wi")


def _ensure_art_dir() -> Path:
    path = Path(ART_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _format_steps(steps: Iterable[str]) -> str:
    lines = []
    for index, step in enumerate(steps, 1):
        lines.append(f"{index}. {step}")
    return "\n".join(lines) if lines else "1. Assemble per routing"


def _resolve_routing(
    item: str, rev: str, routing: Optional[Dict[str, object]]
) -> Dict[str, object]:
    if routing is None:
        try:
            from mfg import routing as routing_mod  # type: ignore

            routing = routing_mod.ROUT_DB.get(f"{item}_{rev}")
        except Exception:  # pragma: no cover - routing module optional in tests
            routing = None
    if routing is None:
        raise FileNotFoundError(f"routing not found for {item} rev {rev}")

    if isinstance(routing, dict):
        item_hint = str(routing.get("item")) if routing.get("item") else item
        rev_hint = str(routing.get("rev")) if routing.get("rev") else rev
        if item_hint and item_hint != item:
            raise SystemExit("DUTY_REV_MISMATCH: routing item mismatch")
        if rev_hint and rev_hint != rev:
            raise SystemExit("DUTY_REV_MISMATCH: routing revision mismatch")
    else:
        raise ValueError("routing must be a dictionary")

    try:
        from plm import bom as plm_bom  # type: ignore

        if plm_bom._BOMS:  # type: ignore[attr-defined]
            bom = plm_bom.get_bom(item, rev)
            if bom is None:
                raise SystemExit("DUTY_REV_MISMATCH: BOM revision missing")
    except Exception:
        # BOM catalog not loaded – skip duty gate
        pass

    return routing


def render(item: str, rev: str, routing: Optional[Dict[str, object]] = None) -> Path:
    """Render Markdown and HTML work instructions for ``item``/``rev``."""

    art_dir = _ensure_art_dir()
    key = f"{item}_{rev}"

    routing = _resolve_routing(item, rev, routing)

    routing_steps = []
    if routing and isinstance(routing.get("steps"), list):
        for step in routing["steps"]:
            if isinstance(step, dict):
                label = step.get("op") or step.get("description") or "Unnamed step"
                wc = step.get("wc")
                if wc:
                    label = f"{label} @ {wc}"
                routing_steps.append(str(label))
            else:
                routing_steps.append(str(step))

    timestamp = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    summary_lines = [
        f"# Work Instructions — {item} rev {rev}",
        "",
        f"Generated: {timestamp}",
        "",
        "## Steps",
        _format_steps(routing_steps),
    ]
    markdown = "\n".join(summary_lines) + "\n"

    md_path = art_dir / f"{key}.md"
    html_path = art_dir / f"{key}.html"
    meta_path = art_dir / f"{key}.json"
    md_path.write_text(markdown, encoding="utf-8")
    html_path.write_text(f"<html><body><pre>{markdown}</pre></body></html>", encoding="utf-8")
    meta_path.write_text(
        json.dumps(
            {
                "item": item,
                "rev": rev,
                "generated_at": timestamp,
                "step_count": len(routing_steps),
            },
            indent=2,
            sort_keys=True,
        ),
        encoding="utf-8",
    )
    return md_path


def cli_wi_render(argv: Optional[list[str]] = None) -> Path:
    parser = argparse.ArgumentParser(prog="mfg:wi:render", description="Render work instructions")
    parser.add_argument("--item", required=True)
    parser.add_argument("--rev", required=True)
    args = parser.parse_args(argv)
    return render(args.item, args.rev)


__all__ = ["render", "cli_wi_render", "ART_DIR"]
