"""
BlackRoad IoT Gateway - MQTT and HTTP bridge for IoT device management.
Handles device registration, command dispatch, topic subscriptions, and topology export.
"""

from __future__ import annotations

import hashlib
import json
import logging
import sqlite3
import uuid
from contextlib import contextmanager
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DB_PATH = Path("iot_gateway.db")


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class DeviceType(str, Enum):
    SENSOR = "sensor"
    ACTUATOR = "actuator"
    CAMERA = "camera"
    THERMOSTAT = "thermostat"
    LOCK = "lock"


class Protocol(str, Enum):
    MQTT = "mqtt"
    HTTP = "http"
    COAP = "coap"
    MODBUS = "modbus"


class CommandStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    ACKNOWLEDGED = "acked"
    FAILED = "failed"


# ---------------------------------------------------------------------------
# Dataclasses
# ---------------------------------------------------------------------------

@dataclass
class Device:
    id: str
    mac: str
    name: str
    type: DeviceType
    ip: str
    protocol: Protocol
    last_seen: Optional[str]
    firmware_version: str
    online: bool
    capabilities: List[str]

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["type"] = self.type.value
        d["protocol"] = self.protocol.value
        d["capabilities"] = json.dumps(self.capabilities)
        return d

    @classmethod
    def from_row(cls, row: tuple) -> "Device":
        (
            id_, mac, name, dtype, ip, protocol,
            last_seen, fw, online, caps
        ) = row
        return cls(
            id=id_,
            mac=mac,
            name=name,
            type=DeviceType(dtype),
            ip=ip,
            protocol=Protocol(protocol),
            last_seen=last_seen,
            firmware_version=fw,
            online=bool(online),
            capabilities=json.loads(caps) if caps else [],
        )


@dataclass
class MQTTMessage:
    topic: str
    payload: Dict[str, Any]
    qos: int = 0
    retained: bool = False
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_json(self) -> str:
        d = asdict(self)
        d["payload"] = json.dumps(self.payload)
        return json.dumps(d)


@dataclass
class CommandRecord:
    id: str
    device_id: str
    command: str
    params: Dict[str, Any]
    status: CommandStatus
    created_at: str
    updated_at: str

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["params"] = json.dumps(self.params)
        d["status"] = self.status.value
        return d

    @classmethod
    def from_row(cls, row: tuple) -> "CommandRecord":
        id_, dev_id, cmd, params, status, created, updated = row
        return cls(
            id=id_,
            device_id=dev_id,
            command=cmd,
            params=json.loads(params) if params else {},
            status=CommandStatus(status),
            created_at=created,
            updated_at=updated,
        )


@dataclass
class TopicSubscription:
    id: str
    device_id: str
    topic: str
    created_at: str


# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

def get_connection(db_path: Path = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


@contextmanager
def db_conn(db_path: Path = DB_PATH):
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path: Path = DB_PATH) -> None:
    """Initialise all tables."""
    with db_conn(db_path) as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS devices (
                id TEXT PRIMARY KEY,
                mac TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                ip TEXT NOT NULL,
                protocol TEXT NOT NULL,
                last_seen TEXT,
                firmware_version TEXT NOT NULL DEFAULT '0.0.0',
                online INTEGER NOT NULL DEFAULT 0,
                capabilities TEXT NOT NULL DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS mqtt_messages (
                id TEXT PRIMARY KEY,
                topic TEXT NOT NULL,
                payload TEXT NOT NULL,
                qos INTEGER NOT NULL DEFAULT 0,
                retained INTEGER NOT NULL DEFAULT 0,
                timestamp TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS commands (
                id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL,
                command TEXT NOT NULL,
                params TEXT NOT NULL DEFAULT '{}',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (device_id) REFERENCES devices(id)
            );

            CREATE TABLE IF NOT EXISTS topic_subscriptions (
                id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL,
                topic TEXT NOT NULL,
                created_at TEXT NOT NULL,
                UNIQUE(device_id, topic),
                FOREIGN KEY (device_id) REFERENCES devices(id)
            );

            CREATE TABLE IF NOT EXISTS firmware_updates (
                id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL,
                old_version TEXT NOT NULL,
                new_version TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (device_id) REFERENCES devices(id)
            );

            CREATE INDEX IF NOT EXISTS idx_devices_mac ON devices(mac);
            CREATE INDEX IF NOT EXISTS idx_commands_device ON commands(device_id);
            CREATE INDEX IF NOT EXISTS idx_msgs_topic ON mqtt_messages(topic);
            CREATE INDEX IF NOT EXISTS idx_subs_device ON topic_subscriptions(device_id);
        """)
    logger.info("Database initialised at %s", db_path)


# ---------------------------------------------------------------------------
# Gateway Core
# ---------------------------------------------------------------------------

class IoTGateway:
    """Central IoT gateway managing devices, messages, and commands."""

    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path
        init_db(db_path)
        logger.info("IoTGateway started (db=%s)", db_path)

    # ------------------------------------------------------------------
    # Device Management
    # ------------------------------------------------------------------

    def register_device(
        self,
        mac: str,
        name: str,
        device_type: str,
        protocol: str,
        ip: str,
        firmware_version: str = "1.0.0",
        capabilities: Optional[List[str]] = None,
    ) -> Device:
        """Register a new device or update an existing one."""
        if capabilities is None:
            capabilities = []

        dtype = DeviceType(device_type)
        proto = Protocol(protocol)
        now = datetime.now(timezone.utc).isoformat()

        with db_conn(self.db_path) as conn:
            # Check if device with this mac already exists
            row = conn.execute(
                "SELECT id FROM devices WHERE mac = ?", (mac,)
            ).fetchone()

            if row:
                device_id = row["id"]
                conn.execute(
                    """UPDATE devices SET name=?, type=?, ip=?, protocol=?,
                       last_seen=?, firmware_version=?, online=1, capabilities=?
                       WHERE id=?""",
                    (name, dtype.value, ip, proto.value, now,
                     firmware_version, json.dumps(capabilities), device_id),
                )
                logger.info("Updated existing device %s (mac=%s)", device_id, mac)
            else:
                device_id = str(uuid.uuid4())
                conn.execute(
                    """INSERT INTO devices
                       (id, mac, name, type, ip, protocol, last_seen,
                        firmware_version, online, capabilities)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)""",
                    (device_id, mac, name, dtype.value, ip, proto.value, now,
                     firmware_version, json.dumps(capabilities)),
                )
                logger.info("Registered new device %s (mac=%s)", device_id, mac)

        return self.get_device(device_id)

    def get_device(self, device_id: str) -> Device:
        """Retrieve a device by ID."""
        with db_conn(self.db_path) as conn:
            row = conn.execute(
                "SELECT id, mac, name, type, ip, protocol, last_seen, "
                "firmware_version, online, capabilities FROM devices WHERE id=?",
                (device_id,),
            ).fetchone()
        if not row:
            raise ValueError(f"Device not found: {device_id}")
        return Device.from_row(tuple(row))

    def list_devices(
        self,
        device_type: Optional[str] = None,
        online_only: bool = False,
    ) -> List[Device]:
        """List all devices, optionally filtered."""
        query = (
            "SELECT id, mac, name, type, ip, protocol, last_seen, "
            "firmware_version, online, capabilities FROM devices WHERE 1=1"
        )
        params: List[Any] = []

        if device_type:
            query += " AND type = ?"
            params.append(device_type)
        if online_only:
            query += " AND online = 1"

        with db_conn(self.db_path) as conn:
            rows = conn.execute(query, params).fetchall()
        return [Device.from_row(tuple(r)) for r in rows]

    def get_device_status(self, device_id: str) -> Dict[str, Any]:
        """Return a rich status summary for a device."""
        device = self.get_device(device_id)

        with db_conn(self.db_path) as conn:
            pending_cmds = conn.execute(
                "SELECT COUNT(*) FROM commands WHERE device_id=? AND status='pending'",
                (device_id,),
            ).fetchone()[0]

            sub_count = conn.execute(
                "SELECT COUNT(*) FROM topic_subscriptions WHERE device_id=?",
                (device_id,),
            ).fetchone()[0]

            last_msg = conn.execute(
                """SELECT m.topic, m.timestamp FROM mqtt_messages m
                   JOIN topic_subscriptions s ON m.topic = s.topic
                   WHERE s.device_id = ?
                   ORDER BY m.timestamp DESC LIMIT 1""",
                (device_id,),
            ).fetchone()

        return {
            "device": asdict(device),
            "pending_commands": pending_cmds,
            "topic_subscriptions": sub_count,
            "last_message_topic": last_msg["topic"] if last_msg else None,
            "last_message_at": last_msg["timestamp"] if last_msg else None,
        }

    def mark_offline(self, device_id: str) -> None:
        """Mark a device as offline."""
        with db_conn(self.db_path) as conn:
            conn.execute(
                "UPDATE devices SET online=0 WHERE id=?", (device_id,)
            )
        logger.info("Device %s marked offline", device_id)

    def mark_online(self, device_id: str) -> None:
        """Mark a device as online and update last_seen."""
        now = datetime.now(timezone.utc).isoformat()
        with db_conn(self.db_path) as conn:
            conn.execute(
                "UPDATE devices SET online=1, last_seen=? WHERE id=?",
                (now, device_id),
            )
        logger.info("Device %s marked online", device_id)

    # ------------------------------------------------------------------
    # Firmware
    # ------------------------------------------------------------------

    def update_firmware(self, device_id: str, version: str) -> Dict[str, Any]:
        """Record a firmware update for a device."""
        device = self.get_device(device_id)
        old_version = device.firmware_version
        now = datetime.now(timezone.utc).isoformat()
        update_id = str(uuid.uuid4())

        with db_conn(self.db_path) as conn:
            conn.execute(
                "UPDATE devices SET firmware_version=? WHERE id=?",
                (version, device_id),
            )
            conn.execute(
                """INSERT INTO firmware_updates
                   (id, device_id, old_version, new_version, updated_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (update_id, device_id, old_version, version, now),
            )

        logger.info(
            "Device %s firmware updated %s → %s", device_id, old_version, version
        )
        return {
            "update_id": update_id,
            "device_id": device_id,
            "old_version": old_version,
            "new_version": version,
            "updated_at": now,
        }

    def get_firmware_history(self, device_id: str) -> List[Dict[str, Any]]:
        """Return the firmware update history for a device."""
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                """SELECT id, device_id, old_version, new_version, updated_at
                   FROM firmware_updates WHERE device_id=? ORDER BY updated_at""",
                (device_id,),
            ).fetchall()
        return [dict(r) for r in rows]

    # ------------------------------------------------------------------
    # Commands
    # ------------------------------------------------------------------

    def send_command(
        self,
        device_id: str,
        command: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> CommandRecord:
        """Enqueue a command for a device."""
        if params is None:
            params = {}

        # Verify device exists
        self.get_device(device_id)

        cmd_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        with db_conn(self.db_path) as conn:
            conn.execute(
                """INSERT INTO commands
                   (id, device_id, command, params, status, created_at, updated_at)
                   VALUES (?, ?, ?, ?, 'pending', ?, ?)""",
                (cmd_id, device_id, command, json.dumps(params), now, now),
            )

        logger.info("Command '%s' queued for device %s", command, device_id)

        with db_conn(self.db_path) as conn:
            row = conn.execute(
                "SELECT id, device_id, command, params, status, created_at, updated_at "
                "FROM commands WHERE id=?",
                (cmd_id,),
            ).fetchone()
        return CommandRecord.from_row(tuple(row))

    def acknowledge_command(self, command_id: str) -> CommandRecord:
        """Mark a command as acknowledged."""
        return self._update_command_status(command_id, CommandStatus.ACKNOWLEDGED)

    def fail_command(self, command_id: str) -> CommandRecord:
        """Mark a command as failed."""
        return self._update_command_status(command_id, CommandStatus.FAILED)

    def _update_command_status(
        self, command_id: str, status: CommandStatus
    ) -> CommandRecord:
        now = datetime.now(timezone.utc).isoformat()
        with db_conn(self.db_path) as conn:
            conn.execute(
                "UPDATE commands SET status=?, updated_at=? WHERE id=?",
                (status.value, now, command_id),
            )
            row = conn.execute(
                "SELECT id, device_id, command, params, status, created_at, updated_at "
                "FROM commands WHERE id=?",
                (command_id,),
            ).fetchone()
        if not row:
            raise ValueError(f"Command not found: {command_id}")
        return CommandRecord.from_row(tuple(row))

    def bulk_update(
        self,
        device_ids: List[str],
        command: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> List[CommandRecord]:
        """Send the same command to multiple devices."""
        if params is None:
            params = {}
        results = []
        for dev_id in device_ids:
            try:
                rec = self.send_command(dev_id, command, params)
                results.append(rec)
            except ValueError as exc:
                logger.warning("Skipping device %s: %s", dev_id, exc)
        logger.info(
            "Bulk command '%s' sent to %d/%d devices",
            command, len(results), len(device_ids),
        )
        return results

    def get_pending_commands(self, device_id: str) -> List[CommandRecord]:
        """Return all pending commands for a device."""
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                "SELECT id, device_id, command, params, status, created_at, updated_at "
                "FROM commands WHERE device_id=? AND status='pending' ORDER BY created_at",
                (device_id,),
            ).fetchall()
        return [CommandRecord.from_row(tuple(r)) for r in rows]

    # ------------------------------------------------------------------
    # MQTT
    # ------------------------------------------------------------------

    def subscribe_topic(self, device_id: str, topic: str) -> TopicSubscription:
        """Subscribe a device to an MQTT topic."""
        # Verify device exists
        self.get_device(device_id)

        sub_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        with db_conn(self.db_path) as conn:
            try:
                conn.execute(
                    """INSERT INTO topic_subscriptions (id, device_id, topic, created_at)
                       VALUES (?, ?, ?, ?)""",
                    (sub_id, device_id, topic, now),
                )
            except sqlite3.IntegrityError:
                logger.info("Device %s already subscribed to %s", device_id, topic)
                row = conn.execute(
                    "SELECT id, device_id, topic, created_at "
                    "FROM topic_subscriptions WHERE device_id=? AND topic=?",
                    (device_id, topic),
                ).fetchone()
                return TopicSubscription(**dict(row))

        logger.info("Device %s subscribed to topic '%s'", device_id, topic)
        return TopicSubscription(
            id=sub_id, device_id=device_id, topic=topic, created_at=now
        )

    def unsubscribe_topic(self, device_id: str, topic: str) -> bool:
        """Remove a topic subscription for a device."""
        with db_conn(self.db_path) as conn:
            cursor = conn.execute(
                "DELETE FROM topic_subscriptions WHERE device_id=? AND topic=?",
                (device_id, topic),
            )
        removed = cursor.rowcount > 0
        if removed:
            logger.info("Device %s unsubscribed from '%s'", device_id, topic)
        return removed

    def process_message(
        self,
        topic: str,
        payload: Dict[str, Any],
        qos: int = 0,
        retained: bool = False,
    ) -> MQTTMessage:
        """Persist an MQTT message and route it to subscribed devices."""
        msg = MQTTMessage(topic=topic, payload=payload, qos=qos, retained=retained)
        msg_id = str(uuid.uuid4())

        with db_conn(self.db_path) as conn:
            conn.execute(
                """INSERT INTO mqtt_messages (id, topic, payload, qos, retained, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    msg_id,
                    topic,
                    json.dumps(payload),
                    qos,
                    int(retained),
                    msg.timestamp,
                ),
            )

            # Update last_seen for all subscribed online devices
            conn.execute(
                """UPDATE devices SET last_seen=? WHERE id IN (
                       SELECT device_id FROM topic_subscriptions WHERE topic=?
                   )""",
                (msg.timestamp, topic),
            )

        logger.debug("Processed message on topic '%s'", topic)
        return msg

    def get_topic_messages(
        self, topic: str, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Return the most recent messages for a topic."""
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                """SELECT id, topic, payload, qos, retained, timestamp
                   FROM mqtt_messages WHERE topic=?
                   ORDER BY timestamp DESC LIMIT ?""",
                (topic, limit),
            ).fetchall()
        return [dict(r) for r in rows]

    # ------------------------------------------------------------------
    # Topology
    # ------------------------------------------------------------------

    def export_topology(self) -> Dict[str, Any]:
        """Export the full network topology as a JSON-serialisable dict."""
        with db_conn(self.db_path) as conn:
            devices = conn.execute(
                "SELECT id, mac, name, type, ip, protocol, last_seen, "
                "firmware_version, online, capabilities FROM devices"
            ).fetchall()

            subscriptions = conn.execute(
                "SELECT device_id, topic FROM topic_subscriptions"
            ).fetchall()

            pending = conn.execute(
                "SELECT device_id, COUNT(*) as cnt FROM commands "
                "WHERE status='pending' GROUP BY device_id"
            ).fetchall()

        # Build subscription map
        sub_map: Dict[str, List[str]] = {}
        for row in subscriptions:
            sub_map.setdefault(row["device_id"], []).append(row["topic"])

        # Build pending command map
        cmd_map: Dict[str, int] = {r["device_id"]: r["cnt"] for r in pending}

        topology = {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "device_count": len(devices),
            "online_count": sum(1 for d in devices if d["online"]),
            "devices": [],
        }

        for d in devices:
            dev_dict = dict(d)
            dev_dict["capabilities"] = json.loads(dev_dict["capabilities"])
            dev_dict["subscribed_topics"] = sub_map.get(d["id"], [])
            dev_dict["pending_commands"] = cmd_map.get(d["id"], 0)
            topology["devices"].append(dev_dict)

        return topology

    def export_topology_json(self, path: Optional[str] = None) -> str:
        """Export topology to JSON string, optionally saving to a file."""
        topology = self.export_topology()
        json_str = json.dumps(topology, indent=2)
        if path:
            Path(path).write_text(json_str)
            logger.info("Topology exported to %s", path)
        return json_str

    # ------------------------------------------------------------------
    # Statistics
    # ------------------------------------------------------------------

    def get_stats(self) -> Dict[str, Any]:
        """Return aggregate gateway statistics."""
        with db_conn(self.db_path) as conn:
            total_devices = conn.execute(
                "SELECT COUNT(*) FROM devices"
            ).fetchone()[0]
            online_devices = conn.execute(
                "SELECT COUNT(*) FROM devices WHERE online=1"
            ).fetchone()[0]
            total_messages = conn.execute(
                "SELECT COUNT(*) FROM mqtt_messages"
            ).fetchone()[0]
            total_commands = conn.execute(
                "SELECT COUNT(*) FROM commands"
            ).fetchone()[0]
            pending_commands = conn.execute(
                "SELECT COUNT(*) FROM commands WHERE status='pending'"
            ).fetchone()[0]
            type_breakdown = conn.execute(
                "SELECT type, COUNT(*) as cnt FROM devices GROUP BY type"
            ).fetchall()
            proto_breakdown = conn.execute(
                "SELECT protocol, COUNT(*) as cnt FROM devices GROUP BY protocol"
            ).fetchall()

        return {
            "total_devices": total_devices,
            "online_devices": online_devices,
            "offline_devices": total_devices - online_devices,
            "total_messages": total_messages,
            "total_commands": total_commands,
            "pending_commands": pending_commands,
            "device_types": {r["type"]: r["cnt"] for r in type_breakdown},
            "protocols": {r["protocol"]: r["cnt"] for r in proto_breakdown},
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def generate_device_hash(mac: str) -> str:
        """Generate a deterministic device fingerprint from MAC address."""
        return hashlib.sha256(mac.encode()).hexdigest()[:16]

    def heartbeat(self, device_id: str) -> None:
        """Record a device heartbeat (update last_seen)."""
        now = datetime.now(timezone.utc).isoformat()
        with db_conn(self.db_path) as conn:
            conn.execute(
                "UPDATE devices SET last_seen=?, online=1 WHERE id=?",
                (now, device_id),
            )


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="BlackRoad IoT Gateway")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("stats", help="Show gateway statistics")
    sub.add_parser("topology", help="Export network topology")
    list_p = sub.add_parser("list", help="List devices")
    list_p.add_argument("--type", dest="device_type")
    list_p.add_argument("--online", action="store_true")

    args = parser.parse_args()
    gw = IoTGateway()

    if args.cmd == "stats":
        print(json.dumps(gw.get_stats(), indent=2))
    elif args.cmd == "topology":
        print(gw.export_topology_json())
    elif args.cmd == "list":
        devices = gw.list_devices(
            device_type=args.device_type, online_only=args.online
        )
        for d in devices:
            status = "✓" if d.online else "✗"
            print(f"{status} [{d.type.value}] {d.name} ({d.ip}) fw={d.firmware_version}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
