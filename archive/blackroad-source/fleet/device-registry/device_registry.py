"""
BlackRoad Device Registry - Hardware device registry and inventory management.
"""
from __future__ import annotations
import csv, io, json, logging, sqlite3, uuid
from contextlib import contextmanager
from dataclasses import asdict, dataclass
from datetime import datetime, timezone, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
DB_PATH = Path("device_registry.db")

class DeviceStatus(str, Enum):
    ACTIVE = "active"; MAINTENANCE = "maintenance"; RETIRED = "retired"

class MaintenanceType(str, Enum):
    REPAIR = "repair"; INSPECTION = "inspection"; UPGRADE = "upgrade"
    REPLACEMENT = "replacement"; CALIBRATION = "calibration"

@dataclass
class Device:
    id: str; serial: str; name: str; model: str; manufacturer: str
    hw_rev: str; location: str; owner: Optional[str]; assigned_to: Optional[str]
    purchase_date: Optional[str]; warranty_expires: Optional[str]
    status: DeviceStatus; tags: List[str]

    @property
    def is_warranty_expired(self) -> bool:
        if not self.warranty_expires: return True
        return self.warranty_expires < datetime.now(timezone.utc).isoformat()

    @classmethod
    def from_row(cls, row) -> "Device":
        return cls(
            id=row["id"], serial=row["serial"], name=row["name"], model=row["model"],
            manufacturer=row["manufacturer"], hw_rev=row["hw_rev"],
            location=row["location"], owner=row["owner"], assigned_to=row["assigned_to"],
            purchase_date=row["purchase_date"], warranty_expires=row["warranty_expires"],
            status=DeviceStatus(row["status"]),
            tags=json.loads(row["tags"]) if row["tags"] else [])

@dataclass
class MaintenanceLog:
    id: str; device_id: str; type: MaintenanceType; description: str
    performed_by: Optional[str]; cost: float; timestamp: str

    @classmethod
    def from_row(cls, row) -> "MaintenanceLog":
        return cls(id=row["id"], device_id=row["device_id"],
                   type=MaintenanceType(row["type"]), description=row["description"],
                   performed_by=row["performed_by"], cost=row["cost"],
                   timestamp=row["timestamp"])

@contextmanager
def db_conn(db_path: Path = DB_PATH):
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    try:
        yield conn; conn.commit()
    except Exception:
        conn.rollback(); raise
    finally:
        conn.close()

def init_db(db_path: Path = DB_PATH) -> None:
    with db_conn(db_path) as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY, serial TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL, model TEXT NOT NULL, manufacturer TEXT NOT NULL,
                hw_rev TEXT NOT NULL DEFAULT '1.0', location TEXT NOT NULL DEFAULT '',
                owner TEXT, assigned_to TEXT, purchase_date TEXT, warranty_expires TEXT,
                status TEXT NOT NULL DEFAULT 'active', tags TEXT NOT NULL DEFAULT '[]'
            );
            CREATE TABLE IF NOT EXISTS maintenance_logs (
                id TEXT PRIMARY KEY, device_id TEXT NOT NULL,
                type TEXT NOT NULL, description TEXT NOT NULL,
                performed_by TEXT, cost REAL NOT NULL DEFAULT 0.0,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (device_id) REFERENCES devices(id)
            );
            CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial);
            CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
            CREATE INDEX IF NOT EXISTS idx_maint_device ON maintenance_logs(device_id, timestamp);
            CREATE INDEX IF NOT EXISTS idx_warranty ON devices(warranty_expires);
        """)
    logger.info("Device registry DB initialised at %s", db_path)

class DeviceRegistry:
    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path; init_db(db_path)

    # -- Registration --
    def register(self, serial: str, name: str, model: str, manufacturer: str,
                  hw_rev: str = "1.0", location: str = "", owner: Optional[str] = None,
                  purchase_date: Optional[str] = None, warranty_expires: Optional[str] = None,
                  tags: Optional[List[str]] = None) -> Device:
        if tags is None: tags = []
        device_id = str(uuid.uuid4())
        with db_conn(self.db_path) as conn:
            try:
                conn.execute(
                    "INSERT INTO devices (id,serial,name,model,manufacturer,hw_rev,location,"
                    "owner,purchase_date,warranty_expires,status,tags) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?,'active',?)",
                    (device_id, serial, name, model, manufacturer, hw_rev, location,
                     owner, purchase_date, warranty_expires, json.dumps(tags)))
            except sqlite3.IntegrityError:
                raise ValueError(f"Device with serial {serial} already exists")
        logger.info("Registered device %s (serial=%s)", device_id, serial)
        return self.get_device(device_id)

    def get_device(self, device_id: str) -> Device:
        with db_conn(self.db_path) as conn:
            row = conn.execute("SELECT * FROM devices WHERE id=?", (device_id,)).fetchone()
        if not row: raise ValueError(f"Device not found: {device_id}")
        return Device.from_row(row)

    def get_by_serial(self, serial: str) -> Device:
        with db_conn(self.db_path) as conn:
            row = conn.execute("SELECT * FROM devices WHERE serial=?", (serial,)).fetchone()
        if not row: raise ValueError(f"Device not found for serial: {serial}")
        return Device.from_row(row)

    # -- Updates --
    def assign(self, device_id: str, user: str) -> Device:
        with db_conn(self.db_path) as conn:
            conn.execute("UPDATE devices SET assigned_to=? WHERE id=?", (user, device_id))
        logger.info("Device %s assigned to %s", device_id, user)
        return self.get_device(device_id)

    def unassign(self, device_id: str) -> Device:
        with db_conn(self.db_path) as conn:
            conn.execute("UPDATE devices SET assigned_to=NULL WHERE id=?", (device_id,))
        return self.get_device(device_id)

    def update_status(self, device_id: str, status: str) -> Device:
        s = DeviceStatus(status)
        with db_conn(self.db_path) as conn:
            conn.execute("UPDATE devices SET status=? WHERE id=?", (s.value, device_id))
        return self.get_device(device_id)

    def update_location(self, device_id: str, location: str) -> Device:
        with db_conn(self.db_path) as conn:
            conn.execute("UPDATE devices SET location=? WHERE id=?", (location, device_id))
        return self.get_device(device_id)

    def add_tag(self, device_id: str, tag: str) -> Device:
        device = self.get_device(device_id)
        tags = device.tags
        if tag not in tags:
            tags.append(tag)
            with db_conn(self.db_path) as conn:
                conn.execute("UPDATE devices SET tags=? WHERE id=?", (json.dumps(tags), device_id))
        return self.get_device(device_id)

    def retire(self, device_id: str) -> Device:
        return self.update_status(device_id, "retired")

    # -- Maintenance --
    def maintenance_log(self, device_id: str, maint_type: str, description: str,
                         performed_by: Optional[str] = None, cost: float = 0.0) -> MaintenanceLog:
        self.get_device(device_id)
        mid = str(uuid.uuid4()); now = datetime.now(timezone.utc).isoformat()
        mtype = MaintenanceType(maint_type)
        with db_conn(self.db_path) as conn:
            conn.execute(
                "INSERT INTO maintenance_logs (id,device_id,type,description,performed_by,cost,timestamp) "
                "VALUES (?,?,?,?,?,?,?)",
                (mid, device_id, mtype.value, description, performed_by, cost, now))
        # Put device into maintenance state when logging repair
        if mtype == MaintenanceType.REPAIR:
            self.update_status(device_id, "maintenance")
        logger.info("Maintenance logged for device %s type=%s cost=%.2f", device_id, mtype.value, cost)
        with db_conn(self.db_path) as conn:
            row = conn.execute("SELECT * FROM maintenance_logs WHERE id=?", (mid,)).fetchone()
        return MaintenanceLog.from_row(row)

    def get_maintenance_history(self, device_id: str, limit: int = 50) -> List[MaintenanceLog]:
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM maintenance_logs WHERE device_id=? ORDER BY timestamp DESC LIMIT ?",
                (device_id, limit)).fetchall()
        return [MaintenanceLog.from_row(r) for r in rows]

    def get_total_maintenance_cost(self, device_id: str) -> float:
        with db_conn(self.db_path) as conn:
            result = conn.execute(
                "SELECT COALESCE(SUM(cost),0) FROM maintenance_logs WHERE device_id=?",
                (device_id,)).fetchone()[0]
        return round(result, 2)

    # -- Queries --
    def list_devices(self, status_filter: Optional[str] = None,
                      location: Optional[str] = None) -> List[Device]:
        q = "SELECT * FROM devices WHERE 1=1"; params: List[Any] = []
        if status_filter: q += " AND status=?"; params.append(status_filter)
        if location: q += " AND location LIKE ?"; params.append(f"%{location}%")
        q += " ORDER BY name"
        with db_conn(self.db_path) as conn:
            rows = conn.execute(q, params).fetchall()
        return [Device.from_row(r) for r in rows]

    def search(self, query: str, status_filter: Optional[str] = None) -> List[Device]:
        q = (
            "SELECT * FROM devices WHERE (name LIKE ? OR serial LIKE ? OR model LIKE ? "
            "OR manufacturer LIKE ? OR location LIKE ?)"
        )
        like = f"%{query}%"; params: List[Any] = [like, like, like, like, like]
        if status_filter: q += " AND status=?"; params.append(status_filter)
        q += " ORDER BY name"
        with db_conn(self.db_path) as conn:
            rows = conn.execute(q, params).fetchall()
        return [Device.from_row(r) for r in rows]

    def get_warranty_expiring(self, days: int = 30) -> List[Device]:
        now = datetime.now(timezone.utc)
        cutoff = (now + timedelta(days=days)).isoformat()
        today = now.isoformat()
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM devices WHERE warranty_expires IS NOT NULL "
                "AND warranty_expires BETWEEN ? AND ? AND status != 'retired' "
                "ORDER BY warranty_expires",
                (today, cutoff)).fetchall()
        return [Device.from_row(r) for r in rows]

    def get_unassigned(self) -> List[Device]:
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM devices WHERE assigned_to IS NULL AND status='active'"
            ).fetchall()
        return [Device.from_row(r) for r in rows]

    # -- Export --
    def export_inventory(self, fmt: str = "json") -> str:
        devices = self.list_devices()
        if fmt == "csv":
            buf = io.StringIO(); w = csv.writer(buf)
            w.writerow(["id","serial","name","model","manufacturer","hw_rev","location",
                         "owner","assigned_to","purchase_date","warranty_expires","status","tags"])
            for d in devices:
                w.writerow([d.id, d.serial, d.name, d.model, d.manufacturer, d.hw_rev,
                             d.location, d.owner, d.assigned_to, d.purchase_date,
                             d.warranty_expires, d.status.value, ",".join(d.tags)])
            return buf.getvalue()
        return json.dumps([asdict(d) for d in devices], indent=2)

    def get_summary(self) -> Dict[str, Any]:
        with db_conn(self.db_path) as conn:
            total = conn.execute("SELECT COUNT(*) FROM devices").fetchone()[0]
            by_status = conn.execute(
                "SELECT status, COUNT(*) as cnt FROM devices GROUP BY status").fetchall()
            by_manufacturer = conn.execute(
                "SELECT manufacturer, COUNT(*) as cnt FROM devices GROUP BY manufacturer").fetchall()
            total_maint_cost = conn.execute(
                "SELECT COALESCE(SUM(cost),0) FROM maintenance_logs").fetchone()[0]
            expiring_soon = len(self.get_warranty_expiring(30))
        return {
            "total_devices": total,
            "status_breakdown": {r["status"]: r["cnt"] for r in by_status},
            "manufacturer_breakdown": {r["manufacturer"]: r["cnt"] for r in by_manufacturer},
            "total_maintenance_cost": round(total_maint_cost, 2),
            "warranty_expiring_soon": expiring_soon,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="BlackRoad Device Registry")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("summary")
    p = sub.add_parser("list"); p.add_argument("--status"); p.add_argument("--format", default="json")
    sp = sub.add_parser("search"); sp.add_argument("query")
    args = parser.parse_args(); reg = DeviceRegistry()
    if args.cmd == "summary": print(json.dumps(reg.get_summary(), indent=2))
    elif args.cmd == "list": print(reg.export_inventory(fmt=args.format))
    elif args.cmd == "search":
        results = reg.search(args.query)
        for d in results: print(f"[{d.status.value}] {d.serial} - {d.name} ({d.model})")
    else: parser.print_help()

if __name__ == "__main__":
    main()
