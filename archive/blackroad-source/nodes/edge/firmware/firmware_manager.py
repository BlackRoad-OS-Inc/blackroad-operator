#!/usr/bin/env python3
"""
BlackRoad Firmware Manager
Manages firmware versions, OTA updates, and verification for the BlackRoad Pi fleet.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# ── ANSI colours ──────────────────────────────────────────────────────────────
RESET   = "\033[0m"
BOLD    = "\033[1m"
RED     = "\033[91m"
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
CYAN    = "\033[96m"
BLUE    = "\033[94m"
MAGENTA = "\033[95m"
DIM     = "\033[2m"

def c(colour: str, text: str) -> str:
    return f"{colour}{text}{RESET}"

# ── Known fleet devices ───────────────────────────────────────────────────────
FLEET_DEVICES = ["aria64", "alice", "blackroad-pi"]

# ── Dataclass ─────────────────────────────────────────────────────────────────
@dataclass
class FirmwareVersion:
    device: str
    component: str                  # os | kernel | bootloader
    version: str
    release_date: str
    checksum: str                   # sha256 hex
    status: str                     # current | available | deprecated | pending
    download_url: str = ""
    notes: str = ""
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    @classmethod
    def from_row(cls, row: tuple) -> "FirmwareVersion":
        (device, component, version, release_date, checksum,
         status, download_url, notes, created_at) = row
        return cls(
            device=device,
            component=component,
            version=version,
            release_date=release_date,
            checksum=checksum,
            status=status,
            download_url=download_url or "",
            notes=notes or "",
            created_at=created_at,
        )

    def one_line(self) -> str:
        status_colour = {
            "current":    GREEN,
            "available":  YELLOW,
            "deprecated": RED,
            "pending":    CYAN,
        }.get(self.status, RESET)
        return (
            f"  {c(BOLD+GREEN, self.device):<20}"
            f"  {c(MAGENTA, self.component):<14}"
            f"  {c(CYAN, self.version):<30}"
            f"  {c(DIM, self.release_date):<14}"
            f"  [{c(status_colour, self.status)}]"
        )


# ── Manager ───────────────────────────────────────────────────────────────────
class FirmwareManager:
    DB_PATH = Path.home() / ".blackroad" / "firmware.db"

    # Simulated latest firmware catalogue (what *should* be running)
    LATEST: Dict[str, Dict[str, str]] = {
        "os": {
            "version":      "2024-11-19",
            "release_date": "2024-11-19",
            "notes":        "Raspberry Pi OS Bookworm (Debian 12) 64-bit",
            "url":          "https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2024-11-19/",
        },
        "kernel": {
            "version":      "6.6.51",
            "release_date": "2024-10-01",
            "notes":        "Linux 6.6.y LTS — includes PREEMPT_RT patches",
            "url":          "https://github.com/raspberrypi/linux/releases",
        },
        "bootloader": {
            "version":      "2024-09-23",
            "release_date": "2024-09-23",
            "notes":        "EEPROM bootloader — improved USB boot + NVMe support",
            "url":          "https://github.com/raspberrypi/rpi-eeprom/releases",
        },
    }

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
                CREATE TABLE IF NOT EXISTS firmware_versions (
                    device        TEXT NOT NULL,
                    component     TEXT NOT NULL,
                    version       TEXT NOT NULL,
                    release_date  TEXT NOT NULL,
                    checksum      TEXT NOT NULL,
                    status        TEXT NOT NULL DEFAULT 'current',
                    download_url  TEXT DEFAULT '',
                    notes         TEXT DEFAULT '',
                    created_at    TEXT NOT NULL,
                    PRIMARY KEY (device, component)
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS update_log (
                    id            INTEGER PRIMARY KEY AUTOINCREMENT,
                    device        TEXT NOT NULL,
                    component     TEXT NOT NULL,
                    from_version  TEXT NOT NULL,
                    to_version    TEXT NOT NULL,
                    status        TEXT NOT NULL,
                    applied_at    TEXT NOT NULL
                )
            """)
            conn.commit()

    # ── Seed fleet ───────────────────────────────────────────────────────────
    def _fake_checksum(self, seed: str) -> str:
        return hashlib.sha256(seed.encode()).hexdigest()

    def _seed_fleet(self) -> None:
        # Simulate aria64 being up-to-date, alice slightly behind, blackroad-pi behind
        device_versions: Dict[str, Dict[str, str]] = {
            "aria64": {
                "os":         "2024-11-19",
                "kernel":     "6.6.51",
                "bootloader": "2024-09-23",
            },
            "alice": {
                "os":         "2024-07-04",
                "kernel":     "6.6.31",
                "bootloader": "2024-05-17",
            },
            "blackroad-pi": {
                "os":         "2024-03-15",
                "kernel":     "6.6.20",
                "bootloader": "2024-01-22",
            },
        }
        with self._conn() as conn:
            for device, components in device_versions.items():
                for component, version in components.items():
                    latest_ver = self.LATEST[component]["version"]
                    status = "current" if version == latest_ver else "available"
                    conn.execute("""
                        INSERT OR IGNORE INTO firmware_versions
                        (device, component, version, release_date, checksum, status,
                         download_url, notes, created_at)
                        VALUES (?,?,?,?,?,?,?,?,?)
                    """, (
                        device, component, version, version,
                        self._fake_checksum(f"{device}-{component}-{version}"),
                        status,
                        self.LATEST[component]["url"],
                        self.LATEST[component]["notes"],
                        datetime.utcnow().isoformat(),
                    ))
            conn.commit()

    # ── Query ─────────────────────────────────────────────────────────────────
    def list_versions(
        self,
        device: Optional[str] = None,
        component: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[FirmwareVersion]:
        query = "SELECT * FROM firmware_versions WHERE 1=1"
        params: List[str] = []
        if device:
            query += " AND device=?"; params.append(device)
        if component:
            query += " AND component=?"; params.append(component)
        if status:
            query += " AND status=?"; params.append(status)
        query += " ORDER BY device, component"
        with self._conn() as conn:
            rows = conn.execute(query, params).fetchall()
        return [FirmwareVersion.from_row(r) for r in rows]

    def get_version(self, device: str, component: str) -> Optional[FirmwareVersion]:
        with self._conn() as conn:
            row = conn.execute(
                "SELECT * FROM firmware_versions WHERE device=? AND component=?",
                (device, component)
            ).fetchone()
        return FirmwareVersion.from_row(row) if row else None

    # ── Check updates ─────────────────────────────────────────────────────────
    def check_updates(self, device: Optional[str] = None) -> List[Dict]:
        devices = [device] if device else FLEET_DEVICES
        updates: List[Dict] = []
        for dev in devices:
            for comp, info in self.LATEST.items():
                fv = self.get_version(dev, comp)
                current = fv.version if fv else "unknown"
                latest  = info["version"]
                if current != latest:
                    updates.append({
                        "device":   dev,
                        "component": comp,
                        "current":  current,
                        "latest":   latest,
                        "notes":    info["notes"],
                    })
        return updates

    # ── Progress bar ─────────────────────────────────────────────────────────
    @staticmethod
    def _progress_bar(label: str, total: int = 40) -> None:
        sys.stdout.write(f"  {c(CYAN, label)}")
        sys.stdout.flush()
        for i in range(total + 1):
            filled = "█" * i + "░" * (total - i)
            pct    = int(i / total * 100)
            sys.stdout.write(f"\r  {c(CYAN, label)} [{c(GREEN, filled)}] {pct:3d}%")
            sys.stdout.flush()
            time.sleep(0.03)
        print()

    # ── Simulated download ────────────────────────────────────────────────────
    def download(self, device: str, component: str) -> Optional[str]:
        info = self.LATEST.get(component)
        if not info:
            print(c(RED, f"✗ Unknown component: {component}"))
            return None
        print(c(BOLD + CYAN, f"\n⬇  Downloading {component} {info['version']} for {device}"))
        self._progress_bar(f"Fetching {component} firmware …")
        # Simulate a checksum of the "downloaded" payload
        fake_payload = f"{device}-{component}-{info['version']}-{datetime.utcnow().date()}"
        checksum     = hashlib.sha256(fake_payload.encode()).hexdigest()
        print(c(GREEN, f"   SHA-256 : {checksum}"))
        return checksum

    # ── Verify ────────────────────────────────────────────────────────────────
    def verify_checksum(self, device: str, component: str) -> bool:
        fv = self.get_version(device, component)
        if not fv:
            print(c(RED, f"✗ No record for {device}/{component}"))
            return False
        expected = fv.checksum
        print(c(CYAN, f"  Verifying {device}/{component} …"))
        time.sleep(0.4)
        # Re-derive the seeded checksum
        seed     = f"{device}-{component}-{fv.version}"
        computed = hashlib.sha256(seed.encode()).hexdigest()
        ok       = computed == expected
        if ok:
            print(c(GREEN, f"  ✅ Checksum OK  [{expected[:16]}…]"))
        else:
            print(c(RED, f"  ✗  Mismatch! expected={expected[:16]}…  got={computed[:16]}…"))
        return ok

    # ── Deploy (OTA simulation) ───────────────────────────────────────────────
    def deploy(self, device: str, component: str, dry_run: bool = False) -> bool:
        info = self.LATEST.get(component)
        if not info:
            print(c(RED, f"✗ Unknown component: {component}"))
            return False
        fv = self.get_version(device, component)
        current = fv.version if fv else "unknown"
        latest  = info["version"]
        if current == latest:
            print(c(GREEN, f"  ✅ {device}/{component} is already up-to-date ({latest})"))
            return True
        print(c(BOLD + YELLOW, f"\n🚀 OTA Update: {device} / {component}"))
        print(f"   {c(DIM, current)} → {c(GREEN, latest)}")
        if dry_run:
            print(c(MAGENTA, "   [dry-run] No changes applied."))
            return True
        checksum = self.download(device, component)
        if not checksum:
            return False
        self._progress_bar(f"Flashing {component} …", total=50)
        self._progress_bar(f"Verifying on-device …", total=20)
        with self._conn() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO firmware_versions
                (device, component, version, release_date, checksum, status,
                 download_url, notes, created_at)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (device, component, latest, latest, checksum, "current",
                  info["url"], info["notes"], datetime.utcnow().isoformat()))
            conn.execute("""
                INSERT INTO update_log
                (device, component, from_version, to_version, status, applied_at)
                VALUES (?,?,?,?,?,?)
            """, (device, component, current, latest, "success",
                  datetime.utcnow().isoformat()))
            conn.commit()
        print(c(GREEN, f"  ✅ Updated {device}/{component} to {latest}"))
        return True

    # ── Update log ────────────────────────────────────────────────────────────
    def update_log(self, limit: int = 20) -> List[Dict]:
        with self._conn() as conn:
            rows = conn.execute("""
                SELECT device, component, from_version, to_version, status, applied_at
                FROM update_log ORDER BY id DESC LIMIT ?
            """, (limit,)).fetchall()
        return [
            {"device": r[0], "component": r[1], "from": r[2],
             "to": r[3], "status": r[4], "applied_at": r[5]}
            for r in rows
        ]


# ── CLI ───────────────────────────────────────────────────────────────────────
def cmd_list(args: argparse.Namespace, mgr: FirmwareManager) -> None:
    versions = mgr.list_versions(
        device=args.device or None,
        component=args.component or None,
        status=args.status or None,
    )
    if not versions:
        print(c(YELLOW, "No firmware records found."))
        return
    print(c(BOLD + CYAN, f"\n{'Device':<20}  {'Component':<14}  {'Version':<30}  {'Date':<14}  Status"))
    print(c(DIM, "─" * 100))
    for fv in versions:
        print(fv.one_line())
    print()


def cmd_check(args: argparse.Namespace, mgr: FirmwareManager) -> None:
    updates = mgr.check_updates(device=args.device or None)
    if not updates:
        print(c(GREEN, "\n✅ All devices are up-to-date!\n"))
        return
    print(c(BOLD + YELLOW, f"\n⚠  {len(updates)} update(s) available:\n"))
    for u in updates:
        print(
            f"  {c(GREEN, u['device']):<20}"
            f"  {c(MAGENTA, u['component']):<14}"
            f"  {c(DIM, u['current']):<22} → {c(CYAN, u['latest'])}"
        )
        print(f"    {c(DIM, u['notes'])}")
    print()


def cmd_update(args: argparse.Namespace, mgr: FirmwareManager) -> None:
    devices    = [args.device] if args.device else FLEET_DEVICES
    components = [args.component] if args.component else list(FirmwareManager.LATEST.keys())
    for device in devices:
        for component in components:
            mgr.deploy(device, component, dry_run=args.dry_run)
    print()


def cmd_verify(args: argparse.Namespace, mgr: FirmwareManager) -> None:
    devices    = [args.device] if args.device else FLEET_DEVICES
    components = [args.component] if args.component else list(FirmwareManager.LATEST.keys())
    all_ok = True
    for device in devices:
        for component in components:
            ok = mgr.verify_checksum(device, component)
            if not ok:
                all_ok = False
    if all_ok:
        print(c(GREEN, "\n✅ All checksums verified.\n"))
    else:
        print(c(RED, "\n✗  Some checksums failed.\n"))
        sys.exit(1)


def cmd_log(args: argparse.Namespace, mgr: FirmwareManager) -> None:
    entries = mgr.update_log(limit=args.limit)
    if not entries:
        print(c(YELLOW, "No update log entries found."))
        return
    print(c(BOLD + CYAN, "\n── Update Log ──────────────────────────────────────────"))
    for e in entries:
        status_col = GREEN if e["status"] == "success" else RED
        print(
            f"  {c(DIM, e['applied_at'][:19])}"
            f"  {c(GREEN, e['device']):<20}"
            f"  {c(MAGENTA, e['component']):<14}"
            f"  {c(DIM, e['from']):<22} → {c(CYAN, e['to'])}"
            f"  [{c(status_col, e['status'])}]"
        )
    print()


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="firmware-manager",
        description=c(BOLD + CYAN, "BlackRoad Firmware Manager — Pi Fleet OTA"),
    )
    sub = p.add_subparsers(dest="command", required=True)

    # list
    p_list = sub.add_parser("list", help="List firmware versions")
    p_list.add_argument("--device",    default="", help="Filter by device")
    p_list.add_argument("--component", default="", choices=["","os","kernel","bootloader"])
    p_list.add_argument("--status",    default="", choices=["","current","available","deprecated","pending"])

    # check
    p_check = sub.add_parser("check", help="Check for available updates")
    p_check.add_argument("--device", default="", help="Limit to one device")

    # update
    p_update = sub.add_parser("update", help="Apply OTA firmware updates")
    p_update.add_argument("--device",    default="", help="Target device (default: all)")
    p_update.add_argument("--component", default="", choices=["","os","kernel","bootloader"])
    p_update.add_argument("--dry-run",   action="store_true", help="Simulate without applying")

    # verify
    p_verify = sub.add_parser("verify", help="Verify firmware checksums")
    p_verify.add_argument("--device",    default="")
    p_verify.add_argument("--component", default="", choices=["","os","kernel","bootloader"])

    # log
    p_log = sub.add_parser("log", help="Show update history")
    p_log.add_argument("--limit", type=int, default=20)

    return p


def main() -> None:
    parser = build_parser()
    args   = parser.parse_args()
    mgr    = FirmwareManager()

    dispatch = {
        "list":   cmd_list,
        "check":  cmd_check,
        "update": cmd_update,
        "verify": cmd_verify,
        "log":    cmd_log,
    }
    dispatch[args.command](args, mgr)


if __name__ == "__main__":
    main()
