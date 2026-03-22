"""
BlackRoad K8s Operator
Production-quality Kubernetes operator with SQLite-backed resource tracking,
YAML parsing, reconciliation loop, event watching, and full CRD lifecycle.
"""

from __future__ import annotations

import json
import re
import sqlite3
import sys
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Generator, Optional

DB_PATH = Path.home() / ".blackroad" / "k8s_operator.db"

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class ResourceKind(str, Enum):
    DEPLOYMENT = "Deployment"
    SERVICE = "Service"
    CONFIG_MAP = "ConfigMap"
    SECRET = "Secret"
    INGRESS = "Ingress"
    JOB = "Job"
    STATEFUL_SET = "StatefulSet"
    DAEMON_SET = "DaemonSet"
    CRON_JOB = "CronJob"
    NAMESPACE = "Namespace"


class ResourceStatus(str, Enum):
    PENDING = "Pending"
    RUNNING = "Running"
    SUCCEEDED = "Succeeded"
    FAILED = "Failed"
    UNKNOWN = "Unknown"
    TERMINATING = "Terminating"


class EventType(str, Enum):
    ADDED = "ADDED"
    MODIFIED = "MODIFIED"
    DELETED = "DELETED"
    ERROR = "ERROR"


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------

@dataclass
class Resource:
    kind: str
    name: str
    namespace: str
    spec: dict
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    status: str = ResourceStatus.PENDING.value
    created_at: float = field(default_factory=time.time)
    labels: dict = field(default_factory=dict)
    annotations: dict = field(default_factory=dict)
    resource_version: int = 1
    finalizers: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "apiVersion": "blackroad.io/v1",
            "kind": self.kind,
            "metadata": {
                "name": self.name,
                "namespace": self.namespace,
                "labels": self.labels,
                "annotations": self.annotations,
                "resourceVersion": str(self.resource_version),
                "uid": self.id,
                "creationTimestamp": time.strftime(
                    "%Y-%m-%dT%H:%M:%SZ", time.gmtime(self.created_at)
                ),
                "finalizers": self.finalizers,
            },
            "spec": self.spec,
            "status": {"phase": self.status},
        }


@dataclass
class Event:
    event_type: str
    resource: Resource
    message: str = ""
    timestamp: float = field(default_factory=time.time)
    reason: str = ""


@dataclass
class ReconcileResult:
    success: bool
    action: str  # created / updated / deleted / noop / error
    resource_id: str
    message: str = ""
    duration_ms: float = 0.0


# ---------------------------------------------------------------------------
# DB helpers
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
        CREATE TABLE IF NOT EXISTS resources (
            id              TEXT PRIMARY KEY,
            kind            TEXT NOT NULL,
            name            TEXT NOT NULL,
            namespace       TEXT NOT NULL DEFAULT 'default',
            spec            TEXT NOT NULL DEFAULT '{}',
            status          TEXT NOT NULL DEFAULT 'Pending',
            labels          TEXT NOT NULL DEFAULT '{}',
            annotations     TEXT NOT NULL DEFAULT '{}',
            resource_version INTEGER NOT NULL DEFAULT 1,
            finalizers      TEXT NOT NULL DEFAULT '[]',
            created_at      REAL NOT NULL,
            updated_at      REAL NOT NULL,
            UNIQUE(kind, name, namespace)
        );

        CREATE TABLE IF NOT EXISTS events (
            id          TEXT PRIMARY KEY,
            event_type  TEXT NOT NULL,
            resource_id TEXT NOT NULL,
            kind        TEXT NOT NULL,
            name        TEXT NOT NULL,
            namespace   TEXT NOT NULL,
            reason      TEXT NOT NULL DEFAULT '',
            message     TEXT NOT NULL DEFAULT '',
            timestamp   REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reconcile_log (
            id          TEXT PRIMARY KEY,
            resource_id TEXT NOT NULL,
            action      TEXT NOT NULL,
            success     INTEGER NOT NULL,
            message     TEXT NOT NULL DEFAULT '',
            duration_ms REAL NOT NULL DEFAULT 0,
            timestamp   REAL NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_res_ns ON resources(namespace);
        CREATE INDEX IF NOT EXISTS idx_res_kind ON resources(kind);
        CREATE INDEX IF NOT EXISTS idx_events_ns ON events(namespace);
        CREATE INDEX IF NOT EXISTS idx_events_res ON events(resource_id);
    """)
    conn.commit()


def _row_to_resource(row: sqlite3.Row) -> Resource:
    return Resource(
        id=row["id"],
        kind=row["kind"],
        name=row["name"],
        namespace=row["namespace"],
        spec=json.loads(row["spec"]),
        status=row["status"],
        labels=json.loads(row["labels"]),
        annotations=json.loads(row["annotations"]),
        resource_version=row["resource_version"],
        finalizers=json.loads(row["finalizers"]),
        created_at=row["created_at"],
    )


# ---------------------------------------------------------------------------
# YAML → dict (no pyyaml: pure regex / json)
# ---------------------------------------------------------------------------

def _yaml_to_dict(yaml_str: str) -> dict:
    """
    Minimal YAML parser for Kubernetes manifests.
    Handles: string/int/bool scalars, quoted strings, block mappings,
    block sequences, multi-document (---)  for simple manifests.
    Falls back to JSON if input looks like JSON.
    """
    text = yaml_str.strip()
    if text.startswith("{"):
        return json.loads(text)

    # Strip document separator
    text = re.sub(r"^---\s*\n?", "", text)

    def _parse_value(val: str) -> Any:
        val = val.strip()
        if val in ("true", "True", "yes", "Yes"):
            return True
        if val in ("false", "False", "no", "No"):
            return False
        if val in ("null", "Null", "~", ""):
            return None
        if re.fullmatch(r"-?\d+", val):
            return int(val)
        if re.fullmatch(r"-?\d+\.\d*", val):
            return float(val)
        # Quoted string
        if (val.startswith('"') and val.endswith('"')) or (
            val.startswith("'") and val.endswith("'")
        ):
            return val[1:-1]
        return val

    def _parse_lines(lines: list[str], base_indent: int = 0) -> tuple[Any, int]:
        """Returns (parsed_object, lines_consumed)."""
        if not lines:
            return None, 0

        first = lines[0]
        indent = len(first) - len(first.lstrip())

        # Sequence
        if first.lstrip().startswith("- "):
            result = []
            i = 0
            while i < len(lines):
                line = lines[i]
                cur_indent = len(line) - len(line.lstrip())
                if cur_indent < indent:
                    break
                stripped = line.lstrip()
                if stripped.startswith("- "):
                    val_str = stripped[2:].strip()
                    if val_str:
                        result.append(_parse_value(val_str))
                    else:
                        sub, consumed = _parse_lines(lines[i + 1 :], indent + 2)
                        result.append(sub)
                        i += consumed
                i += 1
            return result, i

        # Mapping
        result = {}
        i = 0
        while i < len(lines):
            line = lines[i]
            if not line.strip() or line.strip().startswith("#"):
                i += 1
                continue
            cur_indent = len(line) - len(line.lstrip())
            if cur_indent < indent:
                break
            m = re.match(r"^(\s*)([^:]+?):\s*(.*)", line)
            if not m:
                i += 1
                continue
            key = m.group(2).strip()
            val_str = m.group(3).strip()
            if val_str:
                result[key] = _parse_value(val_str)
                i += 1
            else:
                # Look ahead for children
                children = []
                j = i + 1
                while j < len(lines):
                    child_line = lines[j]
                    if not child_line.strip():
                        j += 1
                        continue
                    child_indent = len(child_line) - len(child_line.lstrip())
                    if child_indent <= cur_indent:
                        break
                    children.append(child_line)
                    j += 1
                if children:
                    child_obj, _ = _parse_lines(children, cur_indent + 2)
                    result[key] = child_obj
                    i = j
                else:
                    result[key] = None
                    i += 1
        return result, i

    lines = text.splitlines()
    obj, _ = _parse_lines(lines)
    return obj if isinstance(obj, dict) else {"raw": obj}


# ---------------------------------------------------------------------------
# Controller
# ---------------------------------------------------------------------------

class Controller:
    """
    Kubernetes-style controller for a given resource type.
    All state is persisted in SQLite.
    """

    def __init__(self, resource_type: str, db_path: Path = DB_PATH):
        self.resource_type = resource_type
        self._db = _get_db(db_path)

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    def create_resource(
        self,
        kind: str,
        name: str,
        namespace: str,
        spec: dict,
        labels: Optional[dict] = None,
        annotations: Optional[dict] = None,
    ) -> Resource:
        """Create and persist a new resource. Returns the created Resource."""
        r = Resource(
            kind=kind,
            name=name,
            namespace=namespace,
            spec=spec,
            labels=labels or {},
            annotations=annotations or {},
        )
        now = time.time()
        self._db.execute(
            """
            INSERT INTO resources
                (id, kind, name, namespace, spec, status, labels, annotations,
                 resource_version, finalizers, created_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                r.id, r.kind, r.name, r.namespace,
                json.dumps(r.spec), r.status,
                json.dumps(r.labels), json.dumps(r.annotations),
                r.resource_version, json.dumps(r.finalizers),
                now, now,
            ),
        )
        self._db.commit()
        self._emit_event(EventType.ADDED, r, reason="Created", message=f"{kind} {name} created")
        return r

    def delete_resource(self, resource_id: str) -> bool:
        """Delete resource by id. Returns True if deleted."""
        row = self._db.execute(
            "SELECT * FROM resources WHERE id=?", (resource_id,)
        ).fetchone()
        if not row:
            return False
        r = _row_to_resource(row)
        # Set terminating first
        self._db.execute(
            "UPDATE resources SET status=?, updated_at=? WHERE id=?",
            (ResourceStatus.TERMINATING.value, time.time(), resource_id),
        )
        self._db.commit()
        self._emit_event(EventType.DELETED, r, reason="Deleted", message=f"{r.kind} {r.name} deleted")
        self._db.execute("DELETE FROM resources WHERE id=?", (resource_id,))
        self._db.commit()
        return True

    def update_resource(self, resource_id: str, spec: Optional[dict] = None, labels: Optional[dict] = None) -> Optional[Resource]:
        """Patch spec or labels of an existing resource."""
        row = self._db.execute("SELECT * FROM resources WHERE id=?", (resource_id,)).fetchone()
        if not row:
            return None
        r = _row_to_resource(row)
        new_spec = spec if spec is not None else r.spec
        new_labels = labels if labels is not None else r.labels
        new_rv = r.resource_version + 1
        self._db.execute(
            "UPDATE resources SET spec=?, labels=?, resource_version=?, updated_at=? WHERE id=?",
            (json.dumps(new_spec), json.dumps(new_labels), new_rv, time.time(), resource_id),
        )
        self._db.commit()
        r.spec = new_spec
        r.labels = new_labels
        r.resource_version = new_rv
        self._emit_event(EventType.MODIFIED, r, reason="Updated", message=f"{r.kind} {r.name} updated")
        return r

    # ------------------------------------------------------------------
    # Scaling
    # ------------------------------------------------------------------

    def scale(self, deployment_id: str, replicas: int) -> dict:
        """Scale a Deployment to the given replica count."""
        if replicas < 0:
            raise ValueError("replicas must be >= 0")
        row = self._db.execute("SELECT * FROM resources WHERE id=?", (deployment_id,)).fetchone()
        if not row:
            return {"success": False, "error": "resource not found"}
        r = _row_to_resource(row)
        if r.kind != ResourceKind.DEPLOYMENT.value:
            return {"success": False, "error": f"Cannot scale kind={r.kind}"}
        old_replicas = r.spec.get("replicas", 1)
        r.spec["replicas"] = replicas
        self.update_resource(deployment_id, spec=r.spec)
        return {
            "success": True,
            "deployment": r.name,
            "namespace": r.namespace,
            "old_replicas": old_replicas,
            "new_replicas": replicas,
        }

    # ------------------------------------------------------------------
    # Status
    # ------------------------------------------------------------------

    def get_status(self, resource_id: str) -> dict:
        """Return full status object for a resource."""
        row = self._db.execute("SELECT * FROM resources WHERE id=?", (resource_id,)).fetchone()
        if not row:
            return {"error": "not found", "id": resource_id}
        r = _row_to_resource(row)
        events = self._db.execute(
            "SELECT * FROM events WHERE resource_id=? ORDER BY timestamp DESC LIMIT 10",
            (resource_id,),
        ).fetchall()
        return {
            "id": r.id,
            "kind": r.kind,
            "name": r.name,
            "namespace": r.namespace,
            "status": r.status,
            "resource_version": r.resource_version,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(r.created_at)),
            "spec": r.spec,
            "labels": r.labels,
            "recent_events": [
                {
                    "type": e["event_type"],
                    "reason": e["reason"],
                    "message": e["message"],
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(e["timestamp"])),
                }
                for e in events
            ],
        }

    def set_status(self, resource_id: str, status: str) -> bool:
        """Update the status field of a resource."""
        cur = self._db.execute(
            "UPDATE resources SET status=?, updated_at=? WHERE id=?",
            (status, time.time(), resource_id),
        )
        self._db.commit()
        return cur.rowcount > 0

    # ------------------------------------------------------------------
    # Event watching (generator)
    # ------------------------------------------------------------------

    def watch_events(
        self,
        namespace: str = "default",
        since: Optional[float] = None,
        timeout_secs: float = 30.0,
    ) -> Generator[Event, None, None]:
        """
        Generator that yields Events from the given namespace.
        Polls the DB every 0.5 s for new events until timeout.
        """
        cursor_ts = since if since is not None else time.time()
        deadline = time.time() + timeout_secs
        while time.time() < deadline:
            rows = self._db.execute(
                """SELECT e.*, r.spec, r.labels, r.annotations,
                          r.resource_version, r.finalizers, r.created_at
                   FROM events e
                   JOIN resources r ON r.id = e.resource_id
                   WHERE e.namespace=? AND e.timestamp > ?
                   ORDER BY e.timestamp ASC""",
                (namespace, cursor_ts),
            ).fetchall()
            for row in rows:
                r = Resource(
                    id=row["resource_id"],
                    kind=row["kind"],
                    name=row["name"],
                    namespace=row["namespace"],
                    spec=json.loads(row["spec"]),
                    status="",
                    labels=json.loads(row["labels"]),
                    annotations=json.loads(row["annotations"]),
                    resource_version=row["resource_version"],
                    finalizers=json.loads(row["finalizers"]),
                    created_at=row["created_at"],
                )
                ev = Event(
                    event_type=row["event_type"],
                    resource=r,
                    message=row["message"],
                    reason=row["reason"],
                    timestamp=row["timestamp"],
                )
                cursor_ts = max(cursor_ts, row["timestamp"])
                yield ev
            if not rows:
                time.sleep(0.5)

    # ------------------------------------------------------------------
    # Apply manifest (YAML → resource)
    # ------------------------------------------------------------------

    def apply_manifest(self, yaml_str: str) -> Resource:
        """
        Parse a Kubernetes-style YAML manifest and upsert the resource.
        No external dependencies – uses the built-in _yaml_to_dict parser.
        """
        doc = _yaml_to_dict(yaml_str)
        metadata = doc.get("metadata", {})
        kind = doc.get("kind", self.resource_type)
        name = metadata.get("name", "unnamed")
        namespace = metadata.get("namespace", "default")
        spec = doc.get("spec", {})
        labels = metadata.get("labels", {})
        annotations = metadata.get("annotations", {})

        # Check if resource already exists
        row = self._db.execute(
            "SELECT id FROM resources WHERE kind=? AND name=? AND namespace=?",
            (kind, name, namespace),
        ).fetchone()
        if row:
            return self.update_resource(row["id"], spec=spec, labels=labels)
        return self.create_resource(kind, name, namespace, spec, labels, annotations)

    # ------------------------------------------------------------------
    # Reconciliation
    # ------------------------------------------------------------------

    def reconcile(
        self,
        desired_state: list[dict],
        actual_state: Optional[list[dict]] = None,
    ) -> list[ReconcileResult]:
        """
        Reconcile desired state (list of resource dicts) against actual state.
        If actual_state is None, uses the DB as ground truth.
        Returns list of ReconcileResults.
        """
        if actual_state is None:
            rows = self._db.execute("SELECT * FROM resources WHERE kind=?", (self.resource_type,)).fetchall()
            actual_state = [dict(r) for r in rows]

        actual_by_key: dict[str, dict] = {}
        for r in actual_state:
            key = f"{r.get('kind','')}/{r.get('namespace','default')}/{r.get('name','')}"
            actual_by_key[key] = r

        desired_keys: set[str] = set()
        results: list[ReconcileResult] = []

        for desired in desired_state:
            start = time.time()
            kind = desired.get("kind", self.resource_type)
            name = desired.get("name", desired.get("metadata", {}).get("name", ""))
            namespace = desired.get("namespace", desired.get("metadata", {}).get("namespace", "default"))
            spec = desired.get("spec", {})
            labels = desired.get("labels", {})
            key = f"{kind}/{namespace}/{name}"
            desired_keys.add(key)

            existing = actual_by_key.get(key)
            try:
                if not existing:
                    r = self.create_resource(kind, name, namespace, spec, labels)
                    action = "created"
                    rid = r.id
                else:
                    rid = existing.get("id", "")
                    stored_spec = json.loads(existing.get("spec", "{}")) if isinstance(existing.get("spec"), str) else existing.get("spec", {})
                    if stored_spec != spec:
                        self.update_resource(rid, spec=spec, labels=labels)
                        action = "updated"
                    else:
                        action = "noop"
                duration = (time.time() - start) * 1000
                results.append(ReconcileResult(True, action, rid, duration_ms=duration))
            except Exception as exc:
                results.append(ReconcileResult(False, "error", "", str(exc)))

        # Garbage collect extras no longer in desired state
        for key, actual in actual_by_key.items():
            if key not in desired_keys:
                rid = actual.get("id", "")
                if rid:
                    self.delete_resource(rid)
                    results.append(ReconcileResult(True, "deleted", rid, f"GC: {key}"))

        self._log_reconcile(results)
        return results

    def _log_reconcile(self, results: list[ReconcileResult]) -> None:
        now = time.time()
        self._db.executemany(
            "INSERT INTO reconcile_log (id,resource_id,action,success,message,duration_ms,timestamp) VALUES (?,?,?,?,?,?,?)",
            [
                (str(uuid.uuid4()), r.resource_id, r.action, int(r.success), r.message, r.duration_ms, now)
                for r in results
            ],
        )
        self._db.commit()

    # ------------------------------------------------------------------
    # Export
    # ------------------------------------------------------------------

    def export_yaml(self, resource_id: str) -> str:
        """Serialize a resource back to a minimal YAML string."""
        row = self._db.execute("SELECT * FROM resources WHERE id=?", (resource_id,)).fetchone()
        if not row:
            return f"# Error: resource {resource_id} not found\n"
        r = _row_to_resource(row)
        d = r.to_dict()
        return _dict_to_yaml(d)

    def list_resources(
        self,
        namespace: Optional[str] = None,
        kind: Optional[str] = None,
        label_selector: Optional[dict] = None,
    ) -> list[Resource]:
        """List resources with optional namespace/kind/label filters."""
        query = "SELECT * FROM resources WHERE 1=1"
        params: list[Any] = []
        if namespace:
            query += " AND namespace=?"
            params.append(namespace)
        if kind:
            query += " AND kind=?"
            params.append(kind)
        rows = self._db.execute(query, params).fetchall()
        resources = [_row_to_resource(r) for r in rows]
        if label_selector:
            resources = [
                r for r in resources
                if all(r.labels.get(k) == v for k, v in label_selector.items())
            ]
        return resources

    def get_reconcile_history(self, limit: int = 50) -> list[dict]:
        rows = self._db.execute(
            "SELECT * FROM reconcile_log ORDER BY timestamp DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _emit_event(
        self,
        event_type: EventType,
        resource: Resource,
        reason: str = "",
        message: str = "",
    ) -> None:
        self._db.execute(
            """INSERT INTO events
               (id, event_type, resource_id, kind, name, namespace, reason, message, timestamp)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (
                str(uuid.uuid4()),
                event_type.value,
                resource.id,
                resource.kind,
                resource.name,
                resource.namespace,
                reason,
                message,
                time.time(),
            ),
        )
        self._db.commit()


# ---------------------------------------------------------------------------
# YAML serializer (dict → YAML string, no deps)
# ---------------------------------------------------------------------------

def _dict_to_yaml(d: Any, indent: int = 0) -> str:
    pad = "  " * indent
    if isinstance(d, dict):
        if not d:
            return "{}\n"
        lines = []
        for k, v in d.items():
            if isinstance(v, (dict, list)):
                child = _dict_to_yaml(v, indent + 1)
                lines.append(f"{pad}{k}:\n{child}")
            else:
                lines.append(f"{pad}{k}: {_yaml_scalar(v)}\n")
        return "".join(lines)
    elif isinstance(d, list):
        if not d:
            return f"{pad}[]\n"
        lines = []
        for item in d:
            if isinstance(item, (dict, list)):
                child = _dict_to_yaml(item, indent + 1)
                lines.append(f"{pad}- \n{child}")
            else:
                lines.append(f"{pad}- {_yaml_scalar(item)}\n")
        return "".join(lines)
    else:
        return f"{pad}{_yaml_scalar(d)}\n"


def _yaml_scalar(v: Any) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v)
    if any(c in s for c in (':', '{', '}', '[', ']', ',', '#', '&', '*', '?', '|', '-', '<', '>', '=', '!', '%', '@', '`')):
        return f'"{s}"'
    return s


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _cmd_create(args) -> None:
    c = Controller(args.kind)
    spec = json.loads(args.spec) if args.spec else {}
    labels = json.loads(args.labels) if args.labels else {}
    r = c.create_resource(args.kind, args.name, args.namespace, spec, labels)
    print(json.dumps({"id": r.id, "name": r.name, "status": r.status}, indent=2))


def _cmd_delete(args) -> None:
    c = Controller("")
    ok = c.delete_resource(args.id)
    print(json.dumps({"deleted": ok, "id": args.id}))


def _cmd_scale(args) -> None:
    c = Controller(ResourceKind.DEPLOYMENT.value)
    result = c.scale(args.id, args.replicas)
    print(json.dumps(result, indent=2))


def _cmd_status(args) -> None:
    c = Controller("")
    result = c.get_status(args.id)
    print(json.dumps(result, indent=2))


def _cmd_apply(args) -> None:
    c = Controller("")
    yaml_content = sys.stdin.read() if args.file == "-" else Path(args.file).read_text()
    r = c.apply_manifest(yaml_content)
    print(json.dumps({"id": r.id, "name": r.name, "kind": r.kind}, indent=2))


def _cmd_list(args) -> None:
    c = Controller(args.kind or "")
    resources = c.list_resources(namespace=args.namespace, kind=args.kind)
    out = [{"id": r.id, "kind": r.kind, "name": r.name, "namespace": r.namespace, "status": r.status} for r in resources]
    print(json.dumps(out, indent=2))


def _cmd_export(args) -> None:
    c = Controller("")
    print(c.export_yaml(args.id))


def build_parser():
    import argparse
    p = argparse.ArgumentParser(prog="k8s_operator", description="BlackRoad K8s Operator")
    sub = p.add_subparsers(dest="cmd")

    cr = sub.add_parser("create", help="Create a resource")
    cr.add_argument("kind", choices=[k.value for k in ResourceKind])
    cr.add_argument("name")
    cr.add_argument("--namespace", default="default")
    cr.add_argument("--spec", help="JSON spec")
    cr.add_argument("--labels", help="JSON labels")
    cr.set_defaults(func=_cmd_create)

    dl = sub.add_parser("delete", help="Delete resource by id")
    dl.add_argument("id")
    dl.set_defaults(func=_cmd_delete)

    sc = sub.add_parser("scale", help="Scale a Deployment")
    sc.add_argument("id", help="Deployment resource ID")
    sc.add_argument("replicas", type=int)
    sc.set_defaults(func=_cmd_scale)

    st = sub.add_parser("status", help="Get resource status")
    st.add_argument("id")
    st.set_defaults(func=_cmd_status)

    ap = sub.add_parser("apply", help="Apply a YAML manifest")
    ap.add_argument("file", help="Path to YAML file or - for stdin")
    ap.set_defaults(func=_cmd_apply)

    ls = sub.add_parser("list", help="List resources")
    ls.add_argument("--namespace", default=None)
    ls.add_argument("--kind", default=None)
    ls.set_defaults(func=_cmd_list)

    ex = sub.add_parser("export", help="Export resource as YAML")
    ex.add_argument("id")
    ex.set_defaults(func=_cmd_export)

    return p


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    if not hasattr(args, "func"):
        parser.print_help()
        sys.exit(1)
    args.func(args)


if __name__ == "__main__":
    main()
