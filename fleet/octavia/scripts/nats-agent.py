#!/usr/bin/env python3
"""BlackRoad NATS Agent — connects a Pi node to the NATS mesh.

Subscribes to blackroad.> events, publishes heartbeats,
and routes commands to local services.

Usage: python3 blackroad-nats-agent.py [--node-name NAME]
"""

import asyncio
import json
import os
import platform
import signal
import socket
import subprocess
import sys
import time

# Use nats-py (pure Python, no C deps)
try:
    import nats
    from nats.aio.client import Client as NATS
except ImportError:
    print("Installing nats-py...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "nats-py", "-q"])
    import nats
    from nats.aio.client import Client as NATS

NATS_URL = os.environ.get("NATS_URL", "nats://192.168.4.101:4222")
NODE_NAME = os.environ.get("NODE_NAME", platform.node().split(".")[0])
HEARTBEAT_INTERVAL = 30  # seconds


async def get_node_info():
    """Gather local node info for heartbeat."""
    info = {
        "node": NODE_NAME,
        "hostname": platform.node(),
        "ip": socket.gethostbyname(socket.gethostname()),
        "timestamp": time.time(),
        "uptime": float(open("/proc/uptime").read().split()[0]) if os.path.exists("/proc/uptime") else 0,
    }

    # CPU temp
    try:
        temp = float(open("/sys/class/thermal/thermal_zone0/temp").read().strip()) / 1000
        info["cpu_temp_c"] = round(temp, 1)
    except (FileNotFoundError, ValueError):
        pass

    # Memory
    try:
        with open("/proc/meminfo") as f:
            lines = f.readlines()
            total = int(lines[0].split()[1])
            avail = int(lines[2].split()[1])
            info["memory_pct"] = round((1 - avail / total) * 100, 1)
    except (FileNotFoundError, IndexError):
        pass

    # Ollama models
    try:
        result = subprocess.run(
            ["curl", "-s", "http://localhost:11434/api/tags"],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0:
            models = json.loads(result.stdout).get("models", [])
            info["ollama_models"] = len(models)
    except (subprocess.TimeoutExpired, json.JSONDecodeError):
        pass

    return info


async def handle_command(msg):
    """Handle incoming commands from the mesh."""
    try:
        data = json.loads(msg.data.decode())
        cmd = data.get("command", "")
        print(f"[{NODE_NAME}] Received command: {cmd} on {msg.subject}")

        if cmd == "ping":
            info = await get_node_info()
            await msg.respond(json.dumps({"status": "pong", **info}).encode())

        elif cmd == "status":
            info = await get_node_info()
            await msg.respond(json.dumps(info).encode())

        elif cmd == "ollama_list":
            result = subprocess.run(
                ["curl", "-s", "http://localhost:11434/api/tags"],
                capture_output=True, text=True, timeout=10,
            )
            await msg.respond(result.stdout.encode() if result.returncode == 0 else b'{"error":"unavailable"}')

    except Exception as e:
        print(f"[{NODE_NAME}] Command error: {e}")


async def main():
    nc = NATS()
    print(f"[{NODE_NAME}] Connecting to NATS at {NATS_URL}...")

    try:
        await nc.connect(NATS_URL, name=f"blackroad-{NODE_NAME}")
        print(f"[{NODE_NAME}] Connected to NATS")
    except Exception as e:
        print(f"[{NODE_NAME}] Failed to connect: {e}")
        sys.exit(1)

    # Subscribe to node-specific commands
    await nc.subscribe(f"blackroad.node.{NODE_NAME}", cb=handle_command)
    await nc.subscribe("blackroad.node.all", cb=handle_command)
    await nc.subscribe("blackroad.broadcast", cb=handle_command)

    print(f"[{NODE_NAME}] Subscribed to blackroad.node.{NODE_NAME}, blackroad.node.all, blackroad.broadcast")

    # Publish initial announcement
    info = await get_node_info()
    await nc.publish("blackroad.fleet.join", json.dumps({"event": "join", **info}).encode())
    print(f"[{NODE_NAME}] Published join event")

    # Heartbeat loop
    try:
        while True:
            info = await get_node_info()
            await nc.publish(f"blackroad.heartbeat.{NODE_NAME}", json.dumps(info).encode())
            await asyncio.sleep(HEARTBEAT_INTERVAL)
    except asyncio.CancelledError:
        pass
    finally:
        info = await get_node_info()
        await nc.publish("blackroad.fleet.leave", json.dumps({"event": "leave", **info}).encode())
        await nc.close()
        print(f"[{NODE_NAME}] Disconnected from NATS")


if __name__ == "__main__":
    if "--node-name" in sys.argv:
        idx = sys.argv.index("--node-name")
        NODE_NAME = sys.argv[idx + 1]

    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        print(f"\n[{NODE_NAME}] Shutting down")
