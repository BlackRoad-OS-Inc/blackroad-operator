#!/usr/bin/env python3
"""BlackRoad Hardware — IoT Device Orchestrator with edge AI inference"""
import asyncio, json, logging, os, time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import httpx
except ImportError:
    httpx = None

logger = logging.getLogger("device-orchestrator")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")

GATEWAY_URL = os.environ.get("BLACKROAD_GATEWAY_URL", "http://127.0.0.1:8787")
MQTT_HOST   = os.environ.get("MQTT_HOST", "localhost")
MQTT_PORT   = int(os.environ.get("MQTT_PORT", "1883"))

@dataclass
class Device:
    id: str
    name: str
    type: str  # sensor | actuator | camera | compute
    location: str
    ip: str
    online: bool = True
    last_seen: str = ""
    telemetry: dict = None

    def __post_init__(self):
        if self.telemetry is None:
            self.telemetry = {}
        if not self.last_seen:
            self.last_seen = datetime.utcnow().isoformat()

class DeviceOrchestrator:
    def __init__(self):
        self.devices: dict[str, Device] = {}
        self.rules: list[dict] = []
        self.artifact_dir = Path.home() / ".blackroad" / "iot"
        self.artifact_dir.mkdir(parents=True, exist_ok=True)

    def register(self, device: Device):
        self.devices[device.id] = device
        logger.info(f"Registered {device.type}: {device.name} @ {device.ip}")

    def update_telemetry(self, device_id: str, data: dict):
        if device_id not in self.devices:
            logger.warning(f"Unknown device: {device_id}")
            return
        d = self.devices[device_id]
        d.telemetry.update(data)
        d.last_seen = datetime.utcnow().isoformat()
        self._check_rules(device_id, data)

    def add_rule(self, name: str, device_id: str, field: str,
                 operator: str, threshold: float, action: str, action_target: str = ""):
        self.rules.append({
            "name": name, "device_id": device_id, "field": field,
            "operator": operator, "threshold": threshold,
            "action": action, "target": action_target,
            "triggered_count": 0
        })
        logger.info(f"Rule added: {name} → if {device_id}.{field} {operator} {threshold} then {action}")

    def _check_rules(self, device_id: str, data: dict):
        for rule in self.rules:
            if rule["device_id"] != device_id:
                continue
            field = rule["field"]
            if field not in data:
                continue
            val = float(data[field])
            thr = rule["threshold"]
            op  = rule["operator"]
            triggered = (
                (op == ">" and val > thr) or
                (op == "<" and val < thr) or
                (op == ">=" and val >= thr) or
                (op == "<=" and val <= thr) or
                (op == "==" and val == thr)
            )
            if triggered:
                rule["triggered_count"] += 1
                logger.warning(f"RULE TRIGGERED: {rule['name']} — {field}={val} {op} {thr}")
                asyncio.create_task(self._execute_action(rule, val))

    async def _execute_action(self, rule: dict, value: float):
        action = rule["action"]
        target = rule.get("target", "")
        if action == "alert":
            await self._send_alert(rule["name"], value, rule["field"], target)
        elif action == "ai_analyze":
            await self._ai_analyze(rule["device_id"], rule["field"], value)
        elif action == "log":
            log_file = self.artifact_dir / f"alerts_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
            with open(log_file, "a") as f:
                f.write(json.dumps({"rule": rule["name"], "value": value,
                                    "at": datetime.utcnow().isoformat()}) + "\n")

    async def _send_alert(self, rule: str, value: float, field: str, target: str):
        logger.info(f"ALERT → {rule}: {field}={value}")
        # In production: send to Slack/PagerDuty/etc.

    async def _ai_analyze(self, device_id: str, field: str, value: float):
        if not httpx:
            return
        device = self.devices.get(device_id)
        if not device:
            return
        prompt = (
            f"IoT device '{device.name}' ({device.type}) at {device.location} "
            f"reported anomalous {field}={value}. Telemetry: {json.dumps(device.telemetry)}. "
            f"Diagnose the issue and suggest corrective actions."
        )
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(f"{GATEWAY_URL}/v1/chat", json={
                    "model": "qwen2.5:3b",
                    "messages": [{"role": "user", "content": prompt}]
                })
                if resp.status_code == 200:
                    analysis = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                    out = self.artifact_dir / f"ai_analysis_{device_id}_{int(time.time())}.md"
                    out.write_text(f"# AI Analysis: {device.name}\n\n{analysis}\n")
                    logger.info(f"AI analysis saved: {out.name}")
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")

    def fleet_report(self) -> dict:
        online = sum(1 for d in self.devices.values() if d.online)
        return {
            "total_devices": len(self.devices),
            "online": online,
            "offline": len(self.devices) - online,
            "devices": [asdict(d) for d in self.devices.values()],
            "rules": len(self.rules),
            "generated_at": datetime.utcnow().isoformat()
        }

async def demo():
    orch = DeviceOrchestrator()

    # Register sample Pi fleet
    orch.register(Device("pi-01", "aria64", "compute", "Server Room", "192.168.4.38"))
    orch.register(Device("pi-02", "alice",  "compute", "Lab",         "192.168.4.49"))
    orch.register(Device("sensor-01", "TempSensor-A", "sensor", "Greenhouse", "192.168.4.100"))
    orch.register(Device("cam-01", "SecurityCam-1", "camera", "Entrance", "192.168.4.101"))

    # Define rules
    orch.add_rule("High CPU", "pi-01", "cpu_pct", ">", 90, "alert", "slack")
    orch.add_rule("Low Disk", "pi-01", "disk_free_gb", "<", 10, "ai_analyze")
    orch.add_rule("High Temp", "sensor-01", "temperature_c", ">", 35, "alert", "pagerduty")

    # Simulate telemetry
    orch.update_telemetry("pi-01", {"cpu_pct": 45, "ram_free_gb": 4.2, "disk_free_gb": 174})
    orch.update_telemetry("sensor-01", {"temperature_c": 22.4, "humidity_pct": 65})

    report = orch.fleet_report()
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    asyncio.run(demo())
