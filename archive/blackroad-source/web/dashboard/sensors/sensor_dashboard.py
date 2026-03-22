"""
BlackRoad Sensor Dashboard - Real-time sensor data, anomaly detection, and alerting.
"""
from __future__ import annotations
import csv, io, json, logging, sqlite3, statistics, uuid
from contextlib import contextmanager
from dataclasses import asdict, dataclass
from datetime import datetime, timezone, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)
DB_PATH = Path("sensor_dashboard.db")

class SensorType(str, Enum):
    TEMPERATURE = "temperature"; HUMIDITY = "humidity"; PRESSURE = "pressure"
    CO2 = "co2"; LIGHT = "light"; MOTION = "motion"; POWER = "power"

class ReadingQuality(str, Enum):
    GOOD = "good"; DEGRADED = "degraded"; ERROR = "error"

class AlertType(str, Enum):
    THRESHOLD = "threshold"; ANOMALY = "anomaly"; OFFLINE = "offline"

class AlertSeverity(str, Enum):
    INFO = "info"; WARNING = "warning"; CRITICAL = "critical"

DEFAULT_THRESHOLDS: Dict[str, tuple] = {
    SensorType.TEMPERATURE: (-40.0, 85.0),
    SensorType.HUMIDITY: (0.0, 100.0),
    SensorType.PRESSURE: (870.0, 1084.0),
    SensorType.CO2: (400.0, 5000.0),
    SensorType.LIGHT: (0.0, 100000.0),
    SensorType.MOTION: (0.0, 1.0),
    SensorType.POWER: (0.0, 10000.0),
}

@dataclass
class Sensor:
    id: str; device_id: str; type: SensorType; unit: str
    min_value: float; max_value: float; calibration_offset: float = 0.0
    name: Optional[str] = None; location: Optional[str] = None

    @classmethod
    def from_row(cls, row) -> "Sensor":
        return cls(id=row["id"], device_id=row["device_id"],
                   type=SensorType(row["type"]), unit=row["unit"],
                   min_value=row["min_value"], max_value=row["max_value"],
                   calibration_offset=row["calibration_offset"],
                   name=row["name"], location=row["location"])

@dataclass
class Reading:
    id: str; sensor_id: str; raw_value: float; calibrated_value: float
    timestamp: str; quality: ReadingQuality

    @classmethod
    def from_row(cls, row) -> "Reading":
        return cls(id=row["id"], sensor_id=row["sensor_id"],
                   raw_value=row["raw_value"], calibrated_value=row["calibrated_value"],
                   timestamp=row["timestamp"], quality=ReadingQuality(row["quality"]))

@dataclass
class Alert:
    id: str; sensor_id: str; type: AlertType; severity: AlertSeverity
    message: str; triggered_at: str; resolved_at: Optional[str] = None

    @property
    def is_active(self) -> bool:
        return self.resolved_at is None

    @classmethod
    def from_row(cls, row) -> "Alert":
        return cls(id=row["id"], sensor_id=row["sensor_id"],
                   type=AlertType(row["type"]), severity=AlertSeverity(row["severity"]),
                   message=row["message"], triggered_at=row["triggered_at"],
                   resolved_at=row["resolved_at"])

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
            CREATE TABLE IF NOT EXISTS sensors (
                id TEXT PRIMARY KEY, device_id TEXT NOT NULL, type TEXT NOT NULL,
                unit TEXT NOT NULL, min_value REAL NOT NULL, max_value REAL NOT NULL,
                calibration_offset REAL NOT NULL DEFAULT 0.0,
                name TEXT, location TEXT
            );
            CREATE TABLE IF NOT EXISTS readings (
                id TEXT PRIMARY KEY, sensor_id TEXT NOT NULL,
                raw_value REAL NOT NULL, calibrated_value REAL NOT NULL,
                timestamp TEXT NOT NULL, quality TEXT NOT NULL DEFAULT 'good',
                FOREIGN KEY (sensor_id) REFERENCES sensors(id)
            );
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY, sensor_id TEXT NOT NULL,
                type TEXT NOT NULL, severity TEXT NOT NULL,
                message TEXT NOT NULL, triggered_at TEXT NOT NULL, resolved_at TEXT,
                FOREIGN KEY (sensor_id) REFERENCES sensors(id)
            );
            CREATE INDEX IF NOT EXISTS idx_readings_sensor ON readings(sensor_id, timestamp);
            CREATE INDEX IF NOT EXISTS idx_alerts_sensor ON alerts(sensor_id);
        """)
    logger.info("DB initialised at %s", db_path)

class SensorDashboard:
    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = db_path; init_db(db_path)

    # -- Sensor CRUD --
    def add_sensor(self, device_id: str, sensor_type: str, unit: str,
                   min_value: Optional[float] = None, max_value: Optional[float] = None,
                   calibration_offset: float = 0.0,
                   name: Optional[str] = None, location: Optional[str] = None) -> Sensor:
        stype = SensorType(sensor_type)
        defaults = DEFAULT_THRESHOLDS.get(stype, (-999.0, 999.0))
        min_val = min_value if min_value is not None else defaults[0]
        max_val = max_value if max_value is not None else defaults[1]
        sensor_id = str(uuid.uuid4())
        with db_conn(self.db_path) as conn:
            conn.execute(
                "INSERT INTO sensors (id,device_id,type,unit,min_value,max_value,"
                "calibration_offset,name,location) VALUES (?,?,?,?,?,?,?,?,?)",
                (sensor_id, device_id, stype.value, unit, min_val, max_val,
                 calibration_offset, name, location))
        return self.get_sensor(sensor_id)

    def get_sensor(self, sensor_id: str) -> Sensor:
        with db_conn(self.db_path) as conn:
            row = conn.execute("SELECT * FROM sensors WHERE id=?", (sensor_id,)).fetchone()
        if not row: raise ValueError(f"Sensor not found: {sensor_id}")
        return Sensor.from_row(row)

    def list_sensors(self, device_id: Optional[str] = None) -> List[Sensor]:
        q = "SELECT * FROM sensors WHERE 1=1"; params: List[Any] = []
        if device_id: q += " AND device_id=?"; params.append(device_id)
        with db_conn(self.db_path) as conn:
            rows = conn.execute(q, params).fetchall()
        return [Sensor.from_row(r) for r in rows]

    def update_calibration(self, sensor_id: str, offset: float) -> Sensor:
        with db_conn(self.db_path) as conn:
            conn.execute("UPDATE sensors SET calibration_offset=? WHERE id=?", (offset, sensor_id))
        return self.get_sensor(sensor_id)

    # -- Readings --
    def log_reading(self, sensor_id: str, value: float, quality: str = "good") -> Reading:
        sensor = self.get_sensor(sensor_id)
        calibrated = value + sensor.calibration_offset
        q = ReadingQuality(quality); rid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        with db_conn(self.db_path) as conn:
            conn.execute(
                "INSERT INTO readings (id,sensor_id,raw_value,calibrated_value,timestamp,quality) "
                "VALUES (?,?,?,?,?,?)",
                (rid, sensor_id, value, calibrated, now, q.value))
        self.check_thresholds(sensor_id)
        return Reading(id=rid, sensor_id=sensor_id, raw_value=value,
                       calibrated_value=calibrated, timestamp=now, quality=q)

    def get_current(self, sensor_id: str) -> Optional[Reading]:
        with db_conn(self.db_path) as conn:
            row = conn.execute(
                "SELECT * FROM readings WHERE sensor_id=? ORDER BY timestamp DESC LIMIT 1",
                (sensor_id,)).fetchone()
        return Reading.from_row(row) if row else None

    def get_history(self, sensor_id: str, hours: int = 24,
                    quality_filter: Optional[str] = None) -> List[Reading]:
        since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
        q = "SELECT * FROM readings WHERE sensor_id=? AND timestamp >= ?"
        params: List[Any] = [sensor_id, since]
        if quality_filter: q += " AND quality=?"; params.append(quality_filter)
        q += " ORDER BY timestamp"
        with db_conn(self.db_path) as conn:
            rows = conn.execute(q, params).fetchall()
        return [Reading.from_row(r) for r in rows]

    def get_stats(self, sensor_id: str, hours: int = 24) -> Dict[str, Any]:
        readings = self.get_history(sensor_id, hours=hours)
        values = [r.calibrated_value for r in readings if r.quality != ReadingQuality.ERROR]
        if not values: return {"count": 0, "min": None, "max": None, "avg": None, "stddev": None}
        mean = statistics.mean(values)
        stdev = statistics.stdev(values) if len(values) > 1 else 0.0
        return {"count": len(values), "min": min(values), "max": max(values),
                "avg": round(mean, 4), "stddev": round(stdev, 4)}

    def batch_log(self, entries: List[Dict[str, Any]]) -> List[Reading]:
        return [self.log_reading(e["sensor_id"], e["value"], e.get("quality", "good"))
                for e in entries]

    # -- Anomaly Detection --
    def detect_anomaly(self, sensor_id: str, window: int = 60,
                       z_threshold: float = 2.5) -> Optional[Alert]:
        since = (datetime.now(timezone.utc) - timedelta(minutes=window)).isoformat()
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                "SELECT calibrated_value FROM readings "
                "WHERE sensor_id=? AND timestamp >= ? AND quality != 'error' ORDER BY timestamp",
                (sensor_id, since)).fetchall()
        values = [r["calibrated_value"] for r in rows]
        if len(values) < 5: return None
        mean = statistics.mean(values); stdev = statistics.stdev(values)
        if stdev == 0: return None
        latest = values[-1]; z = abs((latest - mean) / stdev)
        if z > z_threshold:
            sev = AlertSeverity.CRITICAL if z > z_threshold * 1.5 else AlertSeverity.WARNING
            return self._create_alert(sensor_id, AlertType.ANOMALY, sev,
                f"Anomaly: value={latest:.3f} z={z:.2f} (mean={mean:.3f} std={stdev:.3f})")
        return None

    # -- Thresholds --
    def check_thresholds(self, sensor_id: str) -> Optional[Alert]:
        reading = self.get_current(sensor_id)
        if not reading: return None
        sensor = self.get_sensor(sensor_id); val = reading.calibrated_value
        if val < sensor.min_value:
            return self._create_alert(sensor_id, AlertType.THRESHOLD, AlertSeverity.CRITICAL,
                f"Value {val:.3f} below minimum {sensor.min_value}")
        if val > sensor.max_value:
            return self._create_alert(sensor_id, AlertType.THRESHOLD, AlertSeverity.CRITICAL,
                f"Value {val:.3f} above maximum {sensor.max_value}")
        return None

    def _create_alert(self, sensor_id: str, alert_type: AlertType,
                      severity: AlertSeverity, message: str) -> Alert:
        aid = str(uuid.uuid4()); now = datetime.now(timezone.utc).isoformat()
        with db_conn(self.db_path) as conn:
            conn.execute(
                "INSERT INTO alerts (id,sensor_id,type,severity,message,triggered_at) "
                "VALUES (?,?,?,?,?,?)",
                (aid, sensor_id, alert_type.value, severity.value, message, now))
        logger.warning("Alert sensor=%s: %s", sensor_id, message)
        return Alert(id=aid, sensor_id=sensor_id, type=alert_type,
                     severity=severity, message=message, triggered_at=now)

    def resolve_alert(self, alert_id: str) -> Alert:
        now = datetime.now(timezone.utc).isoformat()
        with db_conn(self.db_path) as conn:
            conn.execute("UPDATE alerts SET resolved_at=? WHERE id=?", (now, alert_id))
            row = conn.execute("SELECT * FROM alerts WHERE id=?", (alert_id,)).fetchone()
        if not row: raise ValueError(f"Alert not found: {alert_id}")
        return Alert.from_row(row)

    def get_active_alerts(self) -> List[Alert]:
        with db_conn(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM alerts WHERE resolved_at IS NULL ORDER BY triggered_at DESC"
            ).fetchall()
        return [Alert.from_row(r) for r in rows]

    def get_all_alerts(self) -> List[Alert]:
        with db_conn(self.db_path) as conn:
            rows = conn.execute("SELECT * FROM alerts ORDER BY triggered_at DESC").fetchall()
        return [Alert.from_row(r) for r in rows]

    # -- Dashboard --
    def get_dashboard_data(self) -> Dict[str, Any]:
        sensors = self.list_sensors(); active_alerts = self.get_active_alerts()
        summaries = []
        for s in sensors:
            current = self.get_current(s.id); stats = self.get_stats(s.id, hours=1)
            summaries.append({
                "sensor_id": s.id, "name": s.name or s.id[:8],
                "type": s.type.value, "unit": s.unit, "location": s.location,
                "current_value": current.calibrated_value if current else None,
                "current_quality": current.quality.value if current else None,
                "last_reading_at": current.timestamp if current else None,
                "stats_1h": stats,
                "alert_count": sum(1 for a in active_alerts if a.sensor_id == s.id),
            })
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_sensors": len(sensors),
            "active_alerts": len(active_alerts),
            "critical_alerts": sum(1 for a in active_alerts if a.severity == AlertSeverity.CRITICAL),
            "sensors": summaries,
            "alerts": [asdict(a) for a in active_alerts],
        }

    # -- Export --
    def export_timeseries(self, sensor_id: str, hours: int = 24, fmt: str = "json") -> str:
        readings = self.get_history(sensor_id, hours=hours)
        if fmt == "csv":
            buf = io.StringIO(); w = csv.writer(buf)
            w.writerow(["id","sensor_id","raw_value","calibrated_value","timestamp","quality"])
            for r in readings:
                w.writerow([r.id, r.sensor_id, r.raw_value, r.calibrated_value,
                             r.timestamp, r.quality.value])
            return buf.getvalue()
        return json.dumps([{"timestamp": r.timestamp, "value": r.calibrated_value,
                             "raw": r.raw_value, "quality": r.quality.value}
                            for r in readings], indent=2)

    def export_alerts(self, active_only: bool = True) -> str:
        alerts = self.get_active_alerts() if active_only else self.get_all_alerts()
        return json.dumps([asdict(a) for a in alerts], indent=2)

    def mark_sensor_offline(self, sensor_id: str) -> Alert:
        return self._create_alert(sensor_id, AlertType.OFFLINE, AlertSeverity.WARNING,
                                  f"Sensor {sensor_id} appears offline")

def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="BlackRoad Sensor Dashboard")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("dashboard"); sub.add_parser("alerts")
    args = parser.parse_args(); dash = SensorDashboard()
    if args.cmd == "dashboard": print(json.dumps(dash.get_dashboard_data(), indent=2))
    elif args.cmd == "alerts": print(dash.export_alerts())
    else: parser.print_help()

if __name__ == "__main__":
    main()
