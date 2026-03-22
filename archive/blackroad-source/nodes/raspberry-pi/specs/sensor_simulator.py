"""
BlackRoad Hardware — IoT Sensor Simulator
Simulates Pi GPIO sensors for testing agent pipelines without hardware
"""
import math, time, random
from dataclasses import dataclass, field
from typing import Callable, Optional


@dataclass
class SensorReading:
    sensor_id: str
    sensor_type: str
    value: float
    unit: str
    timestamp: float = field(default_factory=time.time)
    quality: float = 1.0  # 0.0-1.0

    def to_dict(self) -> dict:
        return {
            "sensor_id":   self.sensor_id,
            "sensor_type": self.sensor_type,
            "value":       round(self.value, 3),
            "unit":        self.unit,
            "timestamp":   self.timestamp,
            "quality":     self.quality,
        }


class SensorSimulator:
    """Simulate IoT sensors for Pi nodes."""

    def __init__(self, node_id: str = "sim-01", noise: float = 0.02):
        self.node_id = node_id
        self.noise = noise
        self._t = 0.0
        self._callbacks: list[Callable] = []

    def _noisy(self, val: float) -> float:
        return val * (1 + random.gauss(0, self.noise))

    def temperature(self) -> SensorReading:
        """Simulate Pi CPU temperature (40-75°C with daily cycle)."""
        base = 55 + 15 * math.sin(self._t / 3600)
        return SensorReading(f"{self.node_id}/cpu-temp", "temperature",
                             self._noisy(base), "celsius")

    def cpu_load(self) -> SensorReading:
        """Simulate CPU load % (0-100)."""
        base = 30 + 40 * abs(math.sin(self._t / 300))
        return SensorReading(f"{self.node_id}/cpu-load", "percentage",
                             min(100, self._noisy(base)), "%")

    def ram_used_gb(self, total_gb: float = 8.0) -> SensorReading:
        """Simulate RAM usage."""
        used = total_gb * (0.3 + 0.4 * abs(math.sin(self._t / 600)))
        return SensorReading(f"{self.node_id}/ram-used", "memory",
                             self._noisy(used), "GB")

    def network_bytes(self) -> tuple[SensorReading, SensorReading]:
        """Simulate network RX/TX bytes/sec."""
        rx = 50_000 + 200_000 * abs(math.sin(self._t / 120))
        tx = 10_000 + 80_000 * abs(math.sin(self._t / 90))
        return (
            SensorReading(f"{self.node_id}/net-rx", "network", self._noisy(rx), "B/s"),
            SensorReading(f"{self.node_id}/net-tx", "network", self._noisy(tx), "B/s"),
        )

    def tick(self, dt: float = 1.0) -> list[SensorReading]:
        """Advance simulation by dt seconds and return all readings."""
        self._t += dt
        rx, tx = self.network_bytes()
        readings = [self.temperature(), self.cpu_load(), self.ram_used_gb(), rx, tx]
        for cb in self._callbacks:
            for r in readings:
                cb(r)
        return readings

    def on_reading(self, callback: Callable[[SensorReading], None]):
        self._callbacks.append(callback)

    def run(self, duration_s: float = 10.0, interval_s: float = 1.0):
        """Run simulation for duration_s seconds."""
        elapsed = 0.0
        while elapsed < duration_s:
            readings = self.tick(interval_s)
            yield readings
            elapsed += interval_s
            time.sleep(interval_s)


if __name__ == "__main__":
    sim = SensorSimulator("aria64")
    sim.on_reading(lambda r: print(f"  {r.sensor_id}: {r.value:.2f} {r.unit}"))
    print("Running 5-second simulation...")
    for _ in sim.run(5.0, 1.0):
        pass
