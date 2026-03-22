"""
blackroad-fleet-tracker — Vehicle & Device Fleet Management
Production: asset tracking, Haversine distance, geofencing, idle detection,
location history, nearest-asset search.
"""

from __future__ import annotations
import sqlite3
import json
import math
import threading
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

DB_PATH = "fleet_tracker.db"
_LOCK = threading.Lock()

EARTH_RADIUS_KM = 6371.0


# ─────────────────────────── Dataclasses ────────────────────────────

@dataclass
class Asset:
    id: str
    name: str
    type: str                    # vehicle / drone / container / sensor_node / robot
    location_lat: float
    location_lon: float
    status: str = "active"       # active / idle / offline / maintenance
    last_seen: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    speed_kmh: float = 0.0
    heading_deg: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    @property
    def coordinates(self) -> Tuple[float, float]:
        return (self.location_lat, self.location_lon)


@dataclass
class LocationPoint:
    asset_id: str
    lat: float
    lon: float
    speed_kmh: float
    heading_deg: float
    accuracy_m: float
    timestamp: str
    source: str = "gps"         # gps / cell / wifi / manual


@dataclass
class Geofence:
    id: str
    name: str
    center_lat: float
    center_lon: float
    radius_km: float
    type: str = "circle"         # circle (polygon support extensible)
    active: bool = True
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class GeofenceEvent:
    asset_id: str
    geofence_id: str
    event_type: str              # enter / exit / dwell
    lat: float
    lon: float
    timestamp: str


# ─────────────────────────── Database ───────────────────────────────

def _get_conn(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db(db_path: str = DB_PATH) -> None:
    with _get_conn(db_path) as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS assets (
            id              TEXT PRIMARY KEY,
            name            TEXT NOT NULL,
            type            TEXT NOT NULL,
            location_lat    REAL NOT NULL DEFAULT 0.0,
            location_lon    REAL NOT NULL DEFAULT 0.0,
            status          TEXT NOT NULL DEFAULT 'active',
            last_seen       TEXT NOT NULL,
            speed_kmh       REAL NOT NULL DEFAULT 0.0,
            heading_deg     REAL NOT NULL DEFAULT 0.0,
            metadata        TEXT NOT NULL DEFAULT '{}',
            created_at      TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS locations (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id        TEXT NOT NULL,
            lat             REAL NOT NULL,
            lon             REAL NOT NULL,
            speed_kmh       REAL NOT NULL DEFAULT 0.0,
            heading_deg     REAL NOT NULL DEFAULT 0.0,
            accuracy_m      REAL NOT NULL DEFAULT 10.0,
            timestamp       TEXT NOT NULL,
            source          TEXT NOT NULL DEFAULT 'gps',
            FOREIGN KEY(asset_id) REFERENCES assets(id)
        );
        CREATE INDEX IF NOT EXISTS idx_locations_asset_ts
            ON locations(asset_id, timestamp);
        CREATE TABLE IF NOT EXISTS geofences (
            id              TEXT PRIMARY KEY,
            name            TEXT NOT NULL,
            center_lat      REAL NOT NULL,
            center_lon      REAL NOT NULL,
            radius_km       REAL NOT NULL,
            type            TEXT NOT NULL DEFAULT 'circle',
            active          INTEGER NOT NULL DEFAULT 1,
            created_at      TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS geofence_events (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id        TEXT NOT NULL,
            geofence_id     TEXT NOT NULL,
            event_type      TEXT NOT NULL,
            lat             REAL NOT NULL,
            lon             REAL NOT NULL,
            timestamp       TEXT NOT NULL,
            FOREIGN KEY(asset_id) REFERENCES assets(id),
            FOREIGN KEY(geofence_id) REFERENCES geofences(id)
        );
        CREATE INDEX IF NOT EXISTS idx_gf_events_asset
            ON geofence_events(asset_id, timestamp);
        """)
    logger.info("fleet_tracker DB initialised at %s", db_path)


# ─────────────────────────── Core Math ──────────────────────────────

def calc_distance(lat1: float, lon1: float,
                  lat2: float, lon2: float) -> float:
    """Haversine formula — returns distance in km."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lam = math.radians(lon2 - lon1)

    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lam / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def calc_bearing(lat1: float, lon1: float,
                 lat2: float, lon2: float) -> float:
    """Initial bearing (degrees) from point 1 to point 2."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_lam = math.radians(lon2 - lon1)
    x = math.sin(d_lam) * math.cos(phi2)
    y = (math.cos(phi1) * math.sin(phi2)
         - math.sin(phi1) * math.cos(phi2) * math.cos(d_lam))
    bearing = math.degrees(math.atan2(x, y))
    return (bearing + 360) % 360


# ─────────────────────────── Tracker ────────────────────────────────

class FleetTracker:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        init_db(db_path)

    # ── Asset CRUD ────────────────────────────────────────────────────

    def register_asset(self, asset: Asset) -> Asset:
        with _LOCK, _get_conn(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO assets VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (asset.id, asset.name, asset.type,
                 asset.location_lat, asset.location_lon,
                 asset.status, asset.last_seen,
                 asset.speed_kmh, asset.heading_deg,
                 json.dumps(asset.metadata), asset.created_at)
            )
        return asset

    def get_asset(self, asset_id: str) -> Optional[Asset]:
        with _get_conn(self.db_path) as conn:
            row = conn.execute(
                "SELECT * FROM assets WHERE id=?", (asset_id,)
            ).fetchone()
        if not row:
            return None
        return Asset(
            id=row["id"], name=row["name"], type=row["type"],
            location_lat=row["location_lat"], location_lon=row["location_lon"],
            status=row["status"], last_seen=row["last_seen"],
            speed_kmh=row["speed_kmh"], heading_deg=row["heading_deg"],
            metadata=json.loads(row["metadata"]),
            created_at=row["created_at"]
        )

    def list_assets(self, status: Optional[str] = None,
                    asset_type: Optional[str] = None) -> List[Asset]:
        q = "SELECT * FROM assets WHERE 1=1"
        params: list = []
        if status:
            q += " AND status=?"; params.append(status)
        if asset_type:
            q += " AND type=?"; params.append(asset_type)
        with _get_conn(self.db_path) as conn:
            rows = conn.execute(q, params).fetchall()
        return [
            Asset(id=r["id"], name=r["name"], type=r["type"],
                  location_lat=r["location_lat"], location_lon=r["location_lon"],
                  status=r["status"], last_seen=r["last_seen"],
                  speed_kmh=r["speed_kmh"], heading_deg=r["heading_deg"],
                  metadata=json.loads(r["metadata"]),
                  created_at=r["created_at"])
            for r in rows
        ]

    # ── Location updates ──────────────────────────────────────────────

    def update_location(self, asset_id: str, lat: float, lon: float,
                        speed_kmh: float = 0.0, heading_deg: float = 0.0,
                        accuracy_m: float = 10.0,
                        source: str = "gps") -> LocationPoint:
        if not -90 <= lat <= 90:
            raise ValueError(f"Invalid latitude: {lat}")
        if not -180 <= lon <= 180:
            raise ValueError(f"Invalid longitude: {lon}")

        asset = self.get_asset(asset_id)
        if not asset:
            raise ValueError(f"Asset {asset_id!r} not found")

        # compute heading from previous location if not provided
        if heading_deg == 0.0 and (asset.location_lat != lat or asset.location_lon != lon):
            heading_deg = calc_bearing(
                asset.location_lat, asset.location_lon, lat, lon
            )

        ts = datetime.utcnow().isoformat()
        point = LocationPoint(
            asset_id=asset_id, lat=lat, lon=lon,
            speed_kmh=speed_kmh, heading_deg=heading_deg,
            accuracy_m=accuracy_m, timestamp=ts, source=source
        )

        with _LOCK, _get_conn(self.db_path) as conn:
            conn.execute(
                "INSERT INTO locations "
                "(asset_id, lat, lon, speed_kmh, heading_deg, accuracy_m, timestamp, source) "
                "VALUES (?,?,?,?,?,?,?,?)",
                (asset_id, lat, lon, speed_kmh, heading_deg, accuracy_m, ts, source)
            )
            conn.execute(
                "UPDATE assets SET location_lat=?, location_lon=?, "
                "speed_kmh=?, heading_deg=?, last_seen=? WHERE id=?",
                (lat, lon, speed_kmh, heading_deg, ts, asset_id)
            )

        # check all active geofences
        self._check_geofences(asset_id, lat, lon, asset)
        return point

    # ── Spatial queries ───────────────────────────────────────────────

    def get_assets_near(self, lat: float, lon: float,
                        radius_km: float) -> List[Dict[str, Any]]:
        assets = self.list_assets()
        result = []
        for a in assets:
            dist = calc_distance(lat, lon, a.location_lat, a.location_lon)
            if dist <= radius_km:
                result.append({
                    "asset_id": a.id, "name": a.name, "type": a.type,
                    "lat": a.location_lat, "lon": a.location_lon,
                    "distance_km": round(dist, 4), "status": a.status
                })
        return sorted(result, key=lambda x: x["distance_km"])

    # ── Geofencing ────────────────────────────────────────────────────

    def add_geofence(self, geofence: Geofence) -> Geofence:
        with _LOCK, _get_conn(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO geofences VALUES (?,?,?,?,?,?,?,?)",
                (geofence.id, geofence.name, geofence.center_lat,
                 geofence.center_lon, geofence.radius_km, geofence.type,
                 int(geofence.active), geofence.created_at)
            )
        return geofence

    def check_geofence(self, asset_id: str,
                       geofence_id: str) -> Dict[str, Any]:
        asset = self.get_asset(asset_id)
        if not asset:
            raise ValueError(f"Asset {asset_id!r} not found")
        with _get_conn(self.db_path) as conn:
            row = conn.execute(
                "SELECT * FROM geofences WHERE id=?", (geofence_id,)
            ).fetchone()
        if not row:
            raise ValueError(f"Geofence {geofence_id!r} not found")

        dist = calc_distance(
            asset.location_lat, asset.location_lon,
            row["center_lat"], row["center_lon"]
        )
        inside = dist <= row["radius_km"]
        return {
            "asset_id": asset_id,
            "geofence_id": geofence_id,
            "geofence_name": row["name"],
            "inside": inside,
            "distance_km": round(dist, 4),
            "radius_km": row["radius_km"]
        }

    def _check_geofences(self, asset_id: str, lat: float, lon: float,
                          prev_asset: Asset) -> None:
        with _get_conn(self.db_path) as conn:
            fences = conn.execute(
                "SELECT * FROM geofences WHERE active=1"
            ).fetchall()
        for f in fences:
            prev_dist = calc_distance(
                prev_asset.location_lat, prev_asset.location_lon,
                f["center_lat"], f["center_lon"]
            )
            new_dist = calc_distance(lat, lon, f["center_lat"], f["center_lon"])
            prev_inside = prev_dist <= f["radius_km"]
            new_inside = new_dist <= f["radius_km"]

            event_type = None
            if not prev_inside and new_inside:
                event_type = "enter"
            elif prev_inside and not new_inside:
                event_type = "exit"

            if event_type:
                ts = datetime.utcnow().isoformat()
                with _LOCK, _get_conn(self.db_path) as conn2:
                    conn2.execute(
                        "INSERT INTO geofence_events "
                        "(asset_id, geofence_id, event_type, lat, lon, timestamp) "
                        "VALUES (?,?,?,?,?,?)",
                        (asset_id, f["id"], event_type, lat, lon, ts)
                    )
                logger.info("GEOFENCE %s: %s %s", event_type.upper(),
                            asset_id, f["name"])

    def get_geofence_events(self, asset_id: Optional[str] = None,
                            hours: int = 24) -> List[Dict[str, Any]]:
        since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        q = "SELECT * FROM geofence_events WHERE timestamp>=?"
        params: list = [since]
        if asset_id:
            q += " AND asset_id=?"
            params.append(asset_id)
        q += " ORDER BY timestamp DESC"
        with _get_conn(self.db_path) as conn:
            rows = conn.execute(q, params).fetchall()
        return [dict(r) for r in rows]

    # ── History & Analytics ───────────────────────────────────────────

    def get_asset_history(self, asset_id: str,
                          hours: int = 24) -> List[LocationPoint]:
        since = (datetime.utcnow() - timedelta(hours=hours)).isoformat()
        with _get_conn(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM locations WHERE asset_id=? AND timestamp>=? "
                "ORDER BY timestamp ASC",
                (asset_id, since)
            ).fetchall()
        return [
            LocationPoint(
                asset_id=r["asset_id"], lat=r["lat"], lon=r["lon"],
                speed_kmh=r["speed_kmh"], heading_deg=r["heading_deg"],
                accuracy_m=r["accuracy_m"], timestamp=r["timestamp"],
                source=r["source"]
            )
            for r in rows
        ]

    def calc_trip_distance(self, asset_id: str, hours: int = 24) -> float:
        history = self.get_asset_history(asset_id, hours=hours)
        total = 0.0
        for i in range(1, len(history)):
            total += calc_distance(
                history[i-1].lat, history[i-1].lon,
                history[i].lat, history[i].lon
            )
        return round(total, 4)

    def detect_idle(self, asset_id: str,
                    threshold_minutes: int = 30) -> Dict[str, Any]:
        """Asset is idle if no significant movement over threshold_minutes."""
        history = self.get_asset_history(asset_id, hours=threshold_minutes / 60 + 1)
        if not history:
            asset = self.get_asset(asset_id)
            if not asset:
                raise ValueError(f"Asset {asset_id!r} not found")
            last_seen = datetime.fromisoformat(asset.last_seen)
            minutes_since = (datetime.utcnow() - last_seen).total_seconds() / 60
            return {
                "asset_id": asset_id, "idle": True,
                "minutes_idle": round(minutes_since, 1),
                "reason": "no_history"
            }

        # compute total distance in window
        total_km = 0.0
        for i in range(1, len(history)):
            total_km += calc_distance(
                history[i-1].lat, history[i-1].lon,
                history[i].lat, history[i].lon
            )

        IDLE_MOVEMENT_THRESHOLD_KM = 0.1
        is_idle = total_km < IDLE_MOVEMENT_THRESHOLD_KM

        first_ts = datetime.fromisoformat(history[0].timestamp)
        last_ts = datetime.fromisoformat(history[-1].timestamp)
        span_min = (last_ts - first_ts).total_seconds() / 60

        return {
            "asset_id": asset_id,
            "idle": is_idle,
            "total_km_in_window": round(total_km, 4),
            "window_minutes": round(span_min, 1),
            "threshold_km": IDLE_MOVEMENT_THRESHOLD_KM,
            "points": len(history)
        }

    def get_fleet_status(self) -> Dict[str, Any]:
        assets = self.list_assets()
        by_status: Dict[str, int] = {}
        for a in assets:
            by_status[a.status] = by_status.get(a.status, 0) + 1
        return {
            "total": len(assets),
            "by_status": by_status,
            "assets": [
                {"id": a.id, "name": a.name, "type": a.type,
                 "status": a.status, "last_seen": a.last_seen,
                 "lat": a.location_lat, "lon": a.location_lon}
                for a in assets
            ]
        }


def demo() -> None:
    import os, random
    os.remove(DB_PATH) if os.path.exists(DB_PATH) else None

    tracker = FleetTracker()

    # NYC depot
    truck1 = Asset("t1", "Truck Alpha", "vehicle", 40.7128, -74.0060)
    drone1 = Asset("d1", "Drone-1", "drone", 40.7128, -74.0060)
    tracker.register_asset(truck1)
    tracker.register_asset(drone1)

    # warehouse geofence
    wh = Geofence("gf-wh", "Warehouse", 40.7128, -74.0060, radius_km=1.0)
    tracker.add_geofence(wh)

    # simulate movement
    lats = [40.7128 + i * 0.005 for i in range(10)]
    lons = [-74.0060 + i * 0.005 for i in range(10)]
    for lat, lon in zip(lats, lons):
        tracker.update_location("t1", lat, lon, speed_kmh=60.0)

    dist = calc_distance(40.7128, -74.0060, 40.7614, -73.9776)
    print(f"Distance to uptown NYC: {dist:.2f} km")

    nearby = tracker.get_assets_near(40.7128, -74.0060, radius_km=5.0)
    print(f"Assets within 5km: {len(nearby)}")

    history = tracker.get_asset_history("t1", hours=1)
    print(f"Location points: {len(history)}")

    trip_km = tracker.calc_trip_distance("t1", hours=1)
    print(f"Trip distance: {trip_km} km")

    idle = tracker.detect_idle("t1", threshold_minutes=30)
    print(f"Idle: {idle['idle']}")

    gf_check = tracker.check_geofence("t1", "gf-wh")
    print(f"In warehouse geofence: {gf_check['inside']}")

    print(tracker.get_fleet_status())


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    demo()
