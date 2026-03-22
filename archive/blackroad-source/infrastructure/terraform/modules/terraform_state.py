"""
BlackRoad Terraform State Backend
Production-quality remote state management with locking, versioning,
drift detection, workspace isolation, and backup. SQLite backed.
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Optional

DB_PATH = Path.home() / ".blackroad" / "terraform_state.db"

# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class TFResource:
    address: str            # e.g. "aws_instance.web"
    type: str               # e.g. "aws_instance"
    name: str               # e.g. "web"
    provider: str           # e.g. "registry.terraform.io/hashicorp/aws"
    attributes: dict        # resource attributes
    dependencies: list[str] = field(default_factory=list)
    mode: str = "managed"   # managed | data
    tainted: bool = False

    def to_dict(self) -> dict:
        return {
            "address": self.address,
            "mode": self.mode,
            "type": self.type,
            "name": self.name,
            "provider_config_key": self.provider,
            "attributes": self.attributes,
            "dependencies": self.dependencies,
            "tainted": self.tainted,
        }

    @classmethod
    def from_dict(cls, d: dict) -> "TFResource":
        return cls(
            address=d.get("address", ""),
            type=d.get("type", ""),
            name=d.get("name", ""),
            provider=d.get("provider_config_key", d.get("provider", "")),
            attributes=d.get("attributes", {}),
            dependencies=d.get("dependencies", []),
            mode=d.get("mode", "managed"),
            tainted=d.get("tainted", False),
        )


@dataclass
class TFState:
    workspace: str
    resources: list[TFResource]
    outputs: dict
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    version: int = 1
    terraform_version: str = "1.6.0"
    serial: int = 1
    lineage: str = field(default_factory=lambda: str(uuid.uuid4()))
    lock_holder: Optional[str] = None
    locked_at: Optional[float] = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    def is_locked(self) -> bool:
        return self.lock_holder is not None

    def to_tf_json(self) -> dict:
        """Export in standard Terraform state JSON format."""
        return {
            "version": self.version,
            "terraform_version": self.terraform_version,
            "serial": self.serial,
            "lineage": self.lineage,
            "outputs": self.outputs,
            "resources": [r.to_dict() for r in self.resources],
        }


@dataclass
class DriftItem:
    address: str
    type: str
    drift_kind: str     # added | removed | modified
    stored_attrs: Optional[dict] = None
    actual_attrs: Optional[dict] = None

    def summary(self) -> str:
        return f"{self.drift_kind.upper()} {self.address}"


# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------

def _get_db(path: Path = DB_PATH) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    _ensure_schema(conn)
    return conn


def _ensure_schema(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS tf_states (
            id                TEXT PRIMARY KEY,
            workspace         TEXT NOT NULL UNIQUE,
            state_json        TEXT NOT NULL DEFAULT '{}',
            outputs           TEXT NOT NULL DEFAULT '{}',
            version           INTEGER NOT NULL DEFAULT 1,
            terraform_version TEXT NOT NULL DEFAULT '1.6.0',
            serial            INTEGER NOT NULL DEFAULT 1,
            lineage           TEXT NOT NULL,
            lock_holder       TEXT,
            locked_at         REAL,
            state_hash        TEXT NOT NULL DEFAULT '',
            created_at        REAL NOT NULL,
            updated_at        REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tf_resources (
            id           TEXT PRIMARY KEY,
            workspace    TEXT NOT NULL,
            address      TEXT NOT NULL,
            type         TEXT NOT NULL,
            name         TEXT NOT NULL,
            provider     TEXT NOT NULL DEFAULT '',
            mode         TEXT NOT NULL DEFAULT 'managed',
            attributes   TEXT NOT NULL DEFAULT '{}',
            dependencies TEXT NOT NULL DEFAULT '[]',
            tainted      INTEGER NOT NULL DEFAULT 0,
            UNIQUE(workspace, address)
        );

        CREATE TABLE IF NOT EXISTS state_history (
            id          TEXT PRIMARY KEY,
            workspace   TEXT NOT NULL,
            serial      INTEGER NOT NULL,
            state_json  TEXT NOT NULL,
            state_hash  TEXT NOT NULL,
            operation   TEXT NOT NULL DEFAULT 'apply',
            created_at  REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS state_locks (
            workspace   TEXT PRIMARY KEY,
            holder      TEXT NOT NULL,
            operation   TEXT NOT NULL DEFAULT 'apply',
            info        TEXT NOT NULL DEFAULT '',
            locked_at   REAL NOT NULL,
            expires_at  REAL
        );

        CREATE INDEX IF NOT EXISTS idx_res_ws   ON tf_resources(workspace);
        CREATE INDEX IF NOT EXISTS idx_res_type ON tf_resources(type);
        CREATE INDEX IF NOT EXISTS idx_hist_ws  ON state_history(workspace);
    """)
    conn.commit()


def _state_hash(state_dict: dict) -> str:
    serialized = json.dumps(state_dict, sort_keys=True)
    return hashlib.sha256(serialized.encode()).hexdigest()[:16]


# ---------------------------------------------------------------------------
# Locking
# ---------------------------------------------------------------------------

def lock_state(
    workspace: str,
    holder: str,
    operation: str = "apply",
    info: str = "",
    timeout_secs: Optional[int] = None,
    db: Optional[sqlite3.Connection] = None,
) -> bool:
    """
    Acquire a lock on workspace. Returns True if acquired, False if already locked.
    """
    conn = db or _get_db()
    # Check for expired locks first
    now = time.time()
    conn.execute(
        "DELETE FROM state_locks WHERE workspace=? AND expires_at IS NOT NULL AND expires_at < ?",
        (workspace, now),
    )
    conn.commit()

    existing = conn.execute("SELECT holder FROM state_locks WHERE workspace=?", (workspace,)).fetchone()
    if existing:
        return False  # Already locked

    expires_at = now + timeout_secs if timeout_secs else None
    conn.execute(
        "INSERT INTO state_locks (workspace,holder,operation,info,locked_at,expires_at) VALUES (?,?,?,?,?,?)",
        (workspace, holder, operation, info, now, expires_at),
    )
    conn.execute(
        "UPDATE tf_states SET lock_holder=?, locked_at=? WHERE workspace=?",
        (holder, now, workspace),
    )
    conn.commit()
    return True


def unlock_state(
    workspace: str,
    holder: str,
    force: bool = False,
    db: Optional[sqlite3.Connection] = None,
) -> bool:
    """
    Release lock on workspace. Returns True if released.
    Pass force=True to release locks held by other holders.
    """
    conn = db or _get_db()
    row = conn.execute("SELECT holder FROM state_locks WHERE workspace=?", (workspace,)).fetchone()
    if not row:
        return False
    if row["holder"] != holder and not force:
        raise PermissionError(f"Lock held by '{row['holder']}', not '{holder}'")
    conn.execute("DELETE FROM state_locks WHERE workspace=?", (workspace,))
    conn.execute(
        "UPDATE tf_states SET lock_holder=NULL, locked_at=NULL WHERE workspace=?", (workspace,)
    )
    conn.commit()
    return True


def get_lock_info(workspace: str, db: Optional[sqlite3.Connection] = None) -> Optional[dict]:
    conn = db or _get_db()
    row = conn.execute("SELECT * FROM state_locks WHERE workspace=?", (workspace,)).fetchone()
    if not row:
        return None
    return {
        "workspace": workspace,
        "holder": row["holder"],
        "operation": row["operation"],
        "info": row["info"],
        "locked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(row["locked_at"])),
        "expires_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(row["expires_at"])) if row["expires_at"] else None,
    }


# ---------------------------------------------------------------------------
# State storage
# ---------------------------------------------------------------------------

def store_state(
    workspace: str,
    state_dict: dict,
    operation: str = "apply",
    db: Optional[sqlite3.Connection] = None,
) -> TFState:
    """
    Persist a Terraform state dict for the given workspace.
    Increments serial, archives previous state.
    """
    conn = db or _get_db()
    now = time.time()
    sha = _state_hash(state_dict)

    existing = conn.execute("SELECT * FROM tf_states WHERE workspace=?", (workspace,)).fetchone()
    resources_list = state_dict.get("resources", [])
    outputs = state_dict.get("outputs", {})
    tf_version = state_dict.get("terraform_version", "1.6.0")
    lineage = state_dict.get("lineage", str(uuid.uuid4()))

    if existing:
        new_serial = existing["serial"] + 1
        # Archive current
        conn.execute(
            "INSERT INTO state_history (id,workspace,serial,state_json,state_hash,operation,created_at) VALUES (?,?,?,?,?,?,?)",
            (str(uuid.uuid4()), workspace, existing["serial"], existing["state_json"], existing["state_hash"], operation, now),
        )
        conn.execute(
            """UPDATE tf_states SET state_json=?,outputs=?,version=?,terraform_version=?,
               serial=?,lineage=?,state_hash=?,updated_at=? WHERE workspace=?""",
            (json.dumps(state_dict), json.dumps(outputs), 4, tf_version,
             new_serial, lineage, sha, now, workspace),
        )
        state_id = existing["id"]
    else:
        state_id = str(uuid.uuid4())
        new_serial = state_dict.get("serial", 1)
        conn.execute(
            """INSERT INTO tf_states
               (id,workspace,state_json,outputs,version,terraform_version,serial,
                lineage,state_hash,created_at,updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (state_id, workspace, json.dumps(state_dict), json.dumps(outputs), 4,
             tf_version, new_serial, lineage, sha, now, now),
        )

    # Sync resource table
    conn.execute("DELETE FROM tf_resources WHERE workspace=?", (workspace,))
    for r_dict in resources_list:
        r = TFResource.from_dict(r_dict)
        conn.execute(
            """INSERT OR REPLACE INTO tf_resources
               (id,workspace,address,type,name,provider,mode,attributes,dependencies,tainted)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (str(uuid.uuid4()), workspace, r.address, r.type, r.name, r.provider,
             r.mode, json.dumps(r.attributes), json.dumps(r.dependencies), int(r.tainted)),
        )
    conn.commit()

    # Re-read to return accurate object
    return get_state(workspace, db=conn)


def get_state(workspace: str, db: Optional[sqlite3.Connection] = None) -> Optional[TFState]:
    """Retrieve the current state for a workspace."""
    conn = db or _get_db()
    row = conn.execute("SELECT * FROM tf_states WHERE workspace=?", (workspace,)).fetchone()
    if not row:
        return None
    res_rows = conn.execute("SELECT * FROM tf_resources WHERE workspace=?", (workspace,)).fetchall()
    resources = [
        TFResource(
            address=r["address"],
            type=r["type"],
            name=r["name"],
            provider=r["provider"],
            attributes=json.loads(r["attributes"]),
            dependencies=json.loads(r["dependencies"]),
            mode=r["mode"],
            tainted=bool(r["tainted"]),
        )
        for r in res_rows
    ]
    return TFState(
        id=row["id"],
        workspace=row["workspace"],
        resources=resources,
        outputs=json.loads(row["outputs"]),
        version=row["version"],
        terraform_version=row["terraform_version"],
        serial=row["serial"],
        lineage=row["lineage"],
        lock_holder=row["lock_holder"],
        locked_at=row["locked_at"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )


def list_workspaces(db: Optional[sqlite3.Connection] = None) -> list[str]:
    conn = db or _get_db()
    return [r["workspace"] for r in conn.execute("SELECT workspace FROM tf_states").fetchall()]


# ---------------------------------------------------------------------------
# Resource queries
# ---------------------------------------------------------------------------

def list_resources(
    workspace: str,
    type_filter: Optional[str] = None,
    db: Optional[sqlite3.Connection] = None,
) -> list[TFResource]:
    """List resources in a workspace, optionally filtered by type."""
    conn = db or _get_db()
    query = "SELECT * FROM tf_resources WHERE workspace=?"
    params: list[Any] = [workspace]
    if type_filter:
        query += " AND type=?"
        params.append(type_filter)
    rows = conn.execute(query, params).fetchall()
    return [
        TFResource(
            address=r["address"],
            type=r["type"],
            name=r["name"],
            provider=r["provider"],
            attributes=json.loads(r["attributes"]),
            dependencies=json.loads(r["dependencies"]),
            mode=r["mode"],
            tainted=bool(r["tainted"]),
        )
        for r in rows
    ]


def get_resource(workspace: str, address: str, db: Optional[sqlite3.Connection] = None) -> Optional[TFResource]:
    conn = db or _get_db()
    row = conn.execute("SELECT * FROM tf_resources WHERE workspace=? AND address=?", (workspace, address)).fetchone()
    if not row:
        return None
    return TFResource(
        address=row["address"],
        type=row["type"],
        name=row["name"],
        provider=row["provider"],
        attributes=json.loads(row["attributes"]),
        dependencies=json.loads(row["dependencies"]),
        mode=row["mode"],
        tainted=bool(row["tainted"]),
    )


# ---------------------------------------------------------------------------
# Drift detection
# ---------------------------------------------------------------------------

def get_drift(
    workspace: str,
    actual_resources: Optional[list[dict]] = None,
    db: Optional[sqlite3.Connection] = None,
) -> list[DriftItem]:
    """
    Compare stored state against actual_resources.
    If actual_resources is None, compare against previous state version.
    Returns list of DriftItem for each discrepancy.
    """
    conn = db or _get_db()
    stored = list_resources(workspace, db=conn)
    stored_by_addr = {r.address: r for r in stored}

    if actual_resources is None:
        # Compare current state vs previous state version
        row = conn.execute("SELECT * FROM tf_states WHERE workspace=?", (workspace,)).fetchone()
        if not row:
            return []
        history = conn.execute(
            "SELECT state_json FROM state_history WHERE workspace=? ORDER BY serial DESC LIMIT 1",
            (workspace,),
        ).fetchone()
        if not history:
            return []
        prev_state = json.loads(history["state_json"])
        actual_resources = prev_state.get("resources", [])

    actual_by_addr = {r.get("address", ""): r for r in actual_resources}

    drift: list[DriftItem] = []

    # Added in stored but not in actual
    for addr, res in stored_by_addr.items():
        if addr not in actual_by_addr:
            drift.append(DriftItem(addr, res.type, "added", stored_attrs=res.attributes))
            continue
        # Check attribute changes
        actual_attrs = actual_by_addr[addr].get("attributes", {})
        if res.attributes != actual_attrs:
            drift.append(DriftItem(addr, res.type, "modified",
                                   stored_attrs=res.attributes, actual_attrs=actual_attrs))

    # Present in actual but not in stored
    for addr, res in actual_by_addr.items():
        if addr not in stored_by_addr:
            drift.append(DriftItem(addr, res.get("type", ""), "removed",
                                   actual_attrs=res.get("attributes", {})))

    return drift


# ---------------------------------------------------------------------------
# Backup
# ---------------------------------------------------------------------------

def backup_state(
    workspace: str,
    backup_dir: Optional[Path] = None,
    db: Optional[sqlite3.Connection] = None,
) -> Path:
    """Write state JSON to a timestamped backup file. Returns backup path."""
    conn = db or _get_db()
    state = get_state(workspace, db=conn)
    if not state:
        raise ValueError(f"Workspace '{workspace}' not found")

    dest_dir = backup_dir or (Path.home() / ".blackroad" / "tf-backups" / workspace)
    dest_dir.mkdir(parents=True, exist_ok=True)
    ts = time.strftime("%Y%m%dT%H%M%S")
    backup_path = dest_dir / f"terraform.tfstate.{ts}.v{state.serial}.json"
    backup_path.write_text(json.dumps(state.to_tf_json(), indent=2))
    return backup_path


def get_state_history(workspace: str, limit: int = 10, db: Optional[sqlite3.Connection] = None) -> list[dict]:
    conn = db or _get_db()
    rows = conn.execute(
        "SELECT id, serial, state_hash, operation, created_at FROM state_history WHERE workspace=? ORDER BY serial DESC LIMIT ?",
        (workspace, limit),
    ).fetchall()
    return [
        {
            "id": r["id"],
            "serial": r["serial"],
            "state_hash": r["state_hash"],
            "operation": r["operation"],
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(r["created_at"])),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _cli_main() -> None:
    import argparse, sys

    p = argparse.ArgumentParser(prog="terraform_state", description="BlackRoad Terraform State Backend")
    sub = p.add_subparsers(dest="cmd")

    lock = sub.add_parser("lock", help="Lock a workspace")
    lock.add_argument("workspace")
    lock.add_argument("holder")
    lock.add_argument("--op", default="apply")

    unlock = sub.add_parser("unlock", help="Unlock a workspace")
    unlock.add_argument("workspace")
    unlock.add_argument("holder")
    unlock.add_argument("--force", action="store_true")

    push = sub.add_parser("push", help="Store state (reads JSON from stdin)")
    push.add_argument("workspace")
    push.add_argument("--op", default="apply")

    pull = sub.add_parser("pull", help="Get current state")
    pull.add_argument("workspace")

    ls = sub.add_parser("list", help="List resources in a workspace")
    ls.add_argument("workspace")
    ls.add_argument("--type", default=None)

    drift = sub.add_parser("drift", help="Show drift vs previous state")
    drift.add_argument("workspace")

    bkp = sub.add_parser("backup", help="Backup workspace state")
    bkp.add_argument("workspace")

    hist = sub.add_parser("history", help="Show state history")
    hist.add_argument("workspace")
    hist.add_argument("--limit", type=int, default=10)

    wks = sub.add_parser("workspaces", help="List all workspaces")

    args = p.parse_args()
    db = _get_db()

    if args.cmd == "lock":
        ok = lock_state(args.workspace, args.holder, operation=args.op, db=db)
        print(json.dumps({"locked": ok, "workspace": args.workspace, "holder": args.holder}))
    elif args.cmd == "unlock":
        ok = unlock_state(args.workspace, args.holder, force=args.force, db=db)
        print(json.dumps({"unlocked": ok, "workspace": args.workspace}))
    elif args.cmd == "push":
        state_dict = json.load(sys.stdin)
        s = store_state(args.workspace, state_dict, operation=args.op, db=db)
        print(json.dumps({"workspace": s.workspace, "serial": s.serial, "resources": len(s.resources)}))
    elif args.cmd == "pull":
        s = get_state(args.workspace, db=db)
        if not s:
            print(json.dumps({"error": "workspace not found"}))
        else:
            print(json.dumps(s.to_tf_json(), indent=2))
    elif args.cmd == "list":
        resources = list_resources(args.workspace, type_filter=args.type, db=db)
        print(json.dumps([r.to_dict() for r in resources], indent=2))
    elif args.cmd == "drift":
        drifts = get_drift(args.workspace, db=db)
        print(json.dumps([{"address": d.address, "type": d.type, "drift": d.drift_kind} for d in drifts], indent=2))
    elif args.cmd == "backup":
        path = backup_state(args.workspace, db=db)
        print(json.dumps({"backup_path": str(path)}))
    elif args.cmd == "history":
        print(json.dumps(get_state_history(args.workspace, limit=args.limit, db=db), indent=2))
    elif args.cmd == "workspaces":
        print(json.dumps(list_workspaces(db=db)))
    else:
        p.print_help()
        sys.exit(1)


if __name__ == "__main__":
    _cli_main()
