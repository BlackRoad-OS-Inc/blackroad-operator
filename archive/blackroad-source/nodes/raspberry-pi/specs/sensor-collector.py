#!/usr/bin/env python3
"""
BlackRoad Hardware — IoT Sensor Collector
Collects sensor data from MQTT broker and stores in SQLite + forwards to gateway.
"""
from __future__ import annotations
import asyncio, json, sqlite3, time, os, hashlib
import paho.mqtt.client as mqtt

MQTT_HOST   = os.getenv("MQTT_HOST", "localhost")
MQTT_PORT   = int(os.getenv("MQTT_PORT", "1883"))
GATEWAY_URL = os.getenv("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")
DB_PATH     = os.getenv("SENSOR_DB", "/tmp/sensors.db")

TOPICS = [
    "blackroad/sensors/+/temperature",
    "blackroad/sensors/+/humidity",
    "blackroad/sensors/+/pressure",
    "blackroad/agents/+/status",
    "blackroad/pi/+/cpu",
    "blackroad/pi/+/memory",
]


def init_db(db: sqlite3.Connection):
    db.executescript("""
    CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        device TEXT NOT NULL,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT DEFAULT '',
        hash TEXT NOT NULL,
        prev_hash TEXT NOT NULL,
        timestamp INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_device ON readings (device, timestamp);
    CREATE INDEX IF NOT EXISTS idx_metric ON readings (metric, timestamp);
    """)
    db.commit()


class SensorCollector:
    def __init__(self):
        self.db = sqlite3.connect(DB_PATH)
        init_db(self.db)
        self.prev_hash = "GENESIS"
        self.client = mqtt.Client(client_id="blackroad-collector")
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message

    def _on_connect(self, client, userdata, flags, rc):
        print(f"[MQTT] Connected rc={rc}")
        for t in TOPICS:
            client.subscribe(t)
            print(f"[MQTT] Subscribed: {t}")

    def _on_message(self, client, userdata, msg):
        try:
            parts = msg.topic.split("/")
            device = parts[2] if len(parts) > 2 else "unknown"
            metric = parts[-1]
            try:
                value = float(msg.payload.decode())
            except ValueError:
                data = json.loads(msg.payload.decode())
                value = data.get("value", 0.0)

            content = f"{msg.topic}:{value}:{time.time_ns()}"
            h = hashlib.sha256(f"{self.prev_hash}:{content}".encode()).hexdigest()

            self.db.execute(
                "INSERT INTO readings (topic, device, metric, value, hash, prev_hash, timestamp) VALUES (?,?,?,?,?,?,?)",
                [msg.topic, device, metric, value, h, self.prev_hash, int(time.time())]
            )
            self.db.commit()
            self.prev_hash = h
            print(f"[{device}] {metric}={value} hash={h[:8]}")
        except Exception as e:
            print(f"[ERROR] {e}")

    def start(self):
        print(f"[Collector] Connecting to MQTT {MQTT_HOST}:{MQTT_PORT}")
        self.client.connect(MQTT_HOST, MQTT_PORT, keepalive=60)
        self.client.loop_forever()


if __name__ == "__main__":
    SensorCollector().start()
