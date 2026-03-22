#!/usr/bin/env python3
"""CPU temperature sensor for Raspberry Pi."""

from __future__ import annotations
import asyncio
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

THERMAL_ZONE = Path("/sys/class/thermal/thermal_zone0/temp")
VCGENCMD = "/usr/bin/vcgencmd"


async def read_cpu_temp() -> Optional[float]:
    """Read CPU temperature in °C."""
    # Try sysfs first (works on all Linux)
    if THERMAL_ZONE.exists():
        try:
            raw = int(THERMAL_ZONE.read_text().strip())
            return raw / 1000.0
        except Exception:
            pass

    # Try vcgencmd (Pi-specific)
    try:
        proc = await asyncio.create_subprocess_exec(
            VCGENCMD, "measure_temp",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL
        )
        stdout, _ = await proc.communicate()
        # Output: temp=45.2'C
        text = stdout.decode().strip()
        temp_str = text.replace("temp=", "").replace("'C", "").replace("°C", "")
        return float(temp_str)
    except Exception:
        pass

    return None


async def thermal_throttle_check() -> dict:
    """Check Pi thermal throttling status via vcgencmd."""
    result = {"throttled": False, "under_voltage": False, "raw": None}
    try:
        proc = await asyncio.create_subprocess_exec(
            VCGENCMD, "get_throttled",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL
        )
        stdout, _ = await proc.communicate()
        text = stdout.decode().strip()
        # Output: throttled=0x0
        val = int(text.split("=")[1], 16)
        result["raw"] = val
        result["under_voltage"] = bool(val & 0x1)
        result["throttled"] = bool(val & 0x4)
    except Exception:
        pass
    return result


if __name__ == "__main__":
    import asyncio
    async def main():
        temp = await read_cpu_temp()
        throttle = await thermal_throttle_check()
        print(f"CPU Temp: {temp}°C")
        print(f"Throttle: {throttle}")
    asyncio.run(main())
