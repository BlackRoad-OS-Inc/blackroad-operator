#!/usr/bin/env python3
"""
BlackRoad Hardware Specs Manager
Tracks and reports hardware specifications for the BlackRoad fleet.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import List, Optional

# ── ANSI colours ──────────────────────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
RED    = "\033[91m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BLUE   = "\033[94m"
MAGENTA= "\033[95m"
DIM    = "\033[2m"

def c(colour: str, text: str) -> str:
    return f"{colour}{text}{RESET}"

# ── Dataclass ─────────────────────────────────────────────────────────────────
@dataclass
class HardwareSpec:
    name: str
    cpu: str
    ram_gb: float
    storage_gb: float
    arch: str                          # arm64, amd64, wasm, etc.
    role: str                          # worker, server, edge, serverless
    ip: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    # ── convenience ──────────────────────────────────────────────────────────
    @property
    def tags_str(self) -> str:
        return ",".join(self.tags)

    @classmethod
    def from_row(cls, row: tuple) -> "HardwareSpec":
        name, cpu, ram_gb, storage_gb, arch, role, ip, tags_str, created_at = row
        return cls(
            name=name,
            cpu=cpu,
            ram_gb=ram_gb,
            storage_gb=storage_gb,
            arch=arch,
            role=role,
            ip=ip or None,
            tags=tags_str.split(",") if tags_str else [],
            created_at=created_at,
        )

    def summary(self) -> str:
        tag_part = f"  {c(DIM, ' '.join(f'[{t}]' for t in self.tags))}" if self.tags else ""
        ip_part  = f"  ip={c(CYAN, self.ip)}" if self.ip else ""
        return (
            f"{c(BOLD+GREEN, self.name):<30}"
            f"  {c(YELLOW, self.cpu):<35}"
            f"  RAM={c(CYAN, f'{self.ram_gb}GB'):<12}"
            f"  Disk={c(CYAN, f'{self.storage_gb}GB'):<12}"
            f"  arch={c(MAGENTA, self.arch):<10}"
            f"  role={c(BLUE, self.role)}"
            f"{ip_part}{tag_part}"
        )


# ── Manager ───────────────────────────────────────────────────────────────────
class HardwareSpecManager:
    DB_PATH = Path.home() / ".blackroad" / "hardware-specs.db"

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or self.DB_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
        self._seed_fleet()

    # ── DB setup ─────────────────────────────────────────────────────────────
    def _conn(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with self._conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS hardware_specs (
                    name        TEXT PRIMARY KEY,
                    cpu         TEXT NOT NULL,
                    ram_gb      REAL NOT NULL,
                    storage_gb  REAL NOT NULL,
                    arch        TEXT NOT NULL,
                    role        TEXT NOT NULL,
                    ip          TEXT,
                    tags        TEXT DEFAULT '',
                    created_at  TEXT NOT NULL
                )
            """)
            conn.commit()

    # ── Seed fleet ───────────────────────────────────────────────────────────
    def _seed_fleet(self) -> None:
        defaults: List[HardwareSpec] = [
            HardwareSpec(
                name="aria64",
                cpu="Broadcom BCM2711 Cortex-A72 @ 1.8GHz (4-core)",
                ram_gb=8.0,
                storage_gb=128.0,
                arch="arm64",
                role="worker",
                ip="192.168.4.38",
                tags=["raspberry-pi", "pi4", "primary", "agent-host", "ollama"],
            ),
            HardwareSpec(
                name="alice",
                cpu="Broadcom BCM2711 Cortex-A72 @ 1.8GHz (4-core)",
                ram_gb=4.0,
                storage_gb=64.0,
                arch="arm64",
                role="worker",
                ip="192.168.4.49",
                tags=["raspberry-pi", "pi4", "secondary"],
            ),
            HardwareSpec(
                name="blackroad-pi",
                cpu="Broadcom BCM2711 Cortex-A72 @ 1.8GHz (4-core)",
                ram_gb=4.0,
                storage_gb=64.0,
                arch="arm64",
                role="worker",
                ip="192.168.4.64",
                tags=["raspberry-pi", "pi4", "cloudflared", "tunnel"],
            ),
            HardwareSpec(
                name="blackroad-os-infinity",
                cpu="Intel Xeon @ 2.5GHz (4-vCPU)",
                ram_gb=8.0,
                storage_gb=160.0,
                arch="amd64",
                role="server",
                ip="159.65.43.12",
                tags=["digitalocean", "droplet", "vps", "production"],
            ),
            HardwareSpec(
                name="cloudflare-workers",
                cpu="V8 Isolate (serverless)",
                ram_gb=0.128,
                storage_gb=0.0,
                arch="wasm",
                role="serverless",
                ip=None,
                tags=["cloudflare", "edge", "serverless", "workers"],
            ),
        ]
        with self._conn() as conn:
            for spec in defaults:
                conn.execute("""
                    INSERT OR IGNORE INTO hardware_specs
                    (name, cpu, ram_gb, storage_gb, arch, role, ip, tags, created_at)
                    VALUES (?,?,?,?,?,?,?,?,?)
                """, (spec.name, spec.cpu, spec.ram_gb, spec.storage_gb,
                      spec.arch, spec.role, spec.ip, spec.tags_str, spec.created_at))
            conn.commit()

    # ── CRUD ─────────────────────────────────────────────────────────────────
    def add_spec(self, spec: HardwareSpec, overwrite: bool = False) -> None:
        with self._conn() as conn:
            if overwrite:
                conn.execute("""
                    INSERT OR REPLACE INTO hardware_specs
                    (name, cpu, ram_gb, storage_gb, arch, role, ip, tags, created_at)
                    VALUES (?,?,?,?,?,?,?,?,?)
                """, (spec.name, spec.cpu, spec.ram_gb, spec.storage_gb,
                      spec.arch, spec.role, spec.ip, spec.tags_str, spec.created_at))
            else:
                conn.execute("""
                    INSERT INTO hardware_specs
                    (name, cpu, ram_gb, storage_gb, arch, role, ip, tags, created_at)
                    VALUES (?,?,?,?,?,?,?,?,?)
                """, (spec.name, spec.cpu, spec.ram_gb, spec.storage_gb,
                      spec.arch, spec.role, spec.ip, spec.tags_str, spec.created_at))
            conn.commit()
        print(c(GREEN, f"✅ Added: {spec.name}"))

    def list_specs(self, role: Optional[str] = None, tag: Optional[str] = None) -> List[HardwareSpec]:
        with self._conn() as conn:
            if role:
                rows = conn.execute(
                    "SELECT * FROM hardware_specs WHERE role=? ORDER BY name", (role,)
                ).fetchall()
            elif tag:
                rows = conn.execute(
                    "SELECT * FROM hardware_specs WHERE tags LIKE ? ORDER BY name",
                    (f"%{tag}%",)
                ).fetchall()
            else:
                rows = conn.execute("SELECT * FROM hardware_specs ORDER BY name").fetchall()
        return [HardwareSpec.from_row(r) for r in rows]

    def get_spec(self, name: str) -> Optional[HardwareSpec]:
        with self._conn() as conn:
            row = conn.execute(
                "SELECT * FROM hardware_specs WHERE name=?", (name,)
            ).fetchone()
        return HardwareSpec.from_row(row) if row else None

    def delete_spec(self, name: str) -> bool:
        with self._conn() as conn:
            cur = conn.execute("DELETE FROM hardware_specs WHERE name=?", (name,))
            conn.commit()
        return cur.rowcount > 0

    # ── Export ───────────────────────────────────────────────────────────────
    def export_json(self, path: Optional[Path] = None) -> str:
        specs = self.list_specs()
        data = {
            "exported_at": datetime.utcnow().isoformat(),
            "count": len(specs),
            "fleet": [asdict(s) for s in specs],
        }
        payload = json.dumps(data, indent=2)
        if path:
            path.write_text(payload)
            print(c(GREEN, f"✅ Exported {len(specs)} specs → {path}"))
        return payload

    # ── Report ────────────────────────────────────────────────────────────────
    def generate_report(self) -> str:
        specs = self.list_specs()
        lines: List[str] = []

        lines.append(c(BOLD + CYAN, "╔══════════════════════════════════════════════════════╗"))
        lines.append(c(BOLD + CYAN, "║        BlackRoad Hardware Fleet Report               ║"))
        lines.append(c(BOLD + CYAN, "╚══════════════════════════════════════════════════════╝"))
        lines.append(f"  Generated : {c(DIM, datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'))}")
        lines.append(f"  Devices   : {c(YELLOW, str(len(specs)))}")
        lines.append("")

        total_ram     = sum(s.ram_gb for s in specs if s.role != "serverless")
        total_storage = sum(s.storage_gb for s in specs if s.role != "serverless")
        pi_count      = sum(1 for s in specs if "raspberry-pi" in s.tags)
        edge_count    = sum(1 for s in specs if s.role in ("serverless", "edge"))

        lines.append(c(BOLD, "── Fleet Summary ────────────────────────────────────────"))
        lines.append(f"  Total RAM (excl. serverless) : {c(CYAN, f'{total_ram:.1f} GB')}")
        lines.append(f"  Total Disk (excl. serverless): {c(CYAN, f'{total_storage:.1f} GB')}")
        lines.append(f"  Raspberry Pi devices         : {c(GREEN, str(pi_count))}")
        lines.append(f"  Edge / Serverless nodes      : {c(MAGENTA, str(edge_count))}")
        lines.append("")

        by_arch: dict = {}
        for s in specs:
            by_arch.setdefault(s.arch, []).append(s.name)

        lines.append(c(BOLD, "── By Architecture ──────────────────────────────────────"))
        for arch, names in sorted(by_arch.items()):
            lines.append(f"  {c(MAGENTA, arch):<14} → {c(DIM, ', '.join(names))}")
        lines.append("")

        lines.append(c(BOLD, "── Device Listing ───────────────────────────────────────"))
        for spec in specs:
            lines.append("  " + spec.summary())
        lines.append("")

        return "\n".join(lines)


# ── CLI ───────────────────────────────────────────────────────────────────────
def cmd_list(args: argparse.Namespace, mgr: HardwareSpecManager) -> None:
    specs = mgr.list_specs(role=args.role or None, tag=args.tag or None)
    if not specs:
        print(c(YELLOW, "No specs found."))
        return
    print(c(BOLD + CYAN, f"\n{'Device':<30}  {'CPU':<35}  RAM           Disk          Arch        Role"))
    print(c(DIM, "─" * 140))
    for spec in specs:
        print("  " + spec.summary())
    print()


def cmd_add(args: argparse.Namespace, mgr: HardwareSpecManager) -> None:
    spec = HardwareSpec(
        name=args.name,
        cpu=args.cpu,
        ram_gb=float(args.ram),
        storage_gb=float(args.disk),
        arch=args.arch,
        role=args.role,
        ip=args.ip or None,
        tags=args.tags.split(",") if args.tags else [],
    )
    mgr.add_spec(spec, overwrite=args.overwrite)


def cmd_report(args: argparse.Namespace, mgr: HardwareSpecManager) -> None:
    print(mgr.generate_report())


def cmd_export(args: argparse.Namespace, mgr: HardwareSpecManager) -> None:
    out = Path(args.output) if args.output else None
    payload = mgr.export_json(out)
    if not args.output:
        print(payload)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="hardware-specs",
        description=c(BOLD + CYAN, "BlackRoad Hardware Specs Manager"),
    )
    sub = p.add_subparsers(dest="command", required=True)

    # list
    p_list = sub.add_parser("list", help="List all hardware specs")
    p_list.add_argument("--role", help="Filter by role (worker/server/edge/serverless)")
    p_list.add_argument("--tag",  help="Filter by tag")

    # add
    p_add = sub.add_parser("add", help="Add a new hardware spec")
    p_add.add_argument("name")
    p_add.add_argument("--cpu",   required=True)
    p_add.add_argument("--ram",   required=True, help="RAM in GB")
    p_add.add_argument("--disk",  required=True, help="Storage in GB")
    p_add.add_argument("--arch",  required=True, choices=["arm64","amd64","x86","wasm"])
    p_add.add_argument("--role",  required=True, choices=["worker","server","edge","serverless"])
    p_add.add_argument("--ip",    default="")
    p_add.add_argument("--tags",  default="", help="Comma-separated tags")
    p_add.add_argument("--overwrite", action="store_true")

    # report
    sub.add_parser("report", help="Generate full fleet report")

    # export
    p_exp = sub.add_parser("export", help="Export specs to JSON")
    p_exp.add_argument("--output", "-o", default="", help="Output file path")

    return p


def main() -> None:
    parser = build_parser()
    args   = parser.parse_args()
    mgr    = HardwareSpecManager()

    dispatch = {
        "list":   cmd_list,
        "add":    cmd_add,
        "report": cmd_report,
        "export": cmd_export,
    }
    dispatch[args.command](args, mgr)


if __name__ == "__main__":
    main()
