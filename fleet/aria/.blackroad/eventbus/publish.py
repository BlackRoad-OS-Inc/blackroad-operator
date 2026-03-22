#!/usr/bin/env python3
"""Publish events to the BlackRoad Event Bus"""

import asyncio
import websockets
import json
import sys
import os

async def publish(host, channel, message):
    hostname = os.uname().nodename
    uri = f"ws://{host}:8766"

    try:
        async with websockets.connect(uri) as ws:
            await ws.send(json.dumps({
                "cmd": "publish",
                "channel": channel,
                "message": message,
                "sender": hostname
            }))
            response = await ws.recv()
            data = json.loads(response)
            print(f"Published to {channel}: {data.get('subscribers_notified', 0)} subscribers notified")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: publish.py <host> <channel> <message>")
        sys.exit(1)

    asyncio.run(publish(sys.argv[1], sys.argv[2], " ".join(sys.argv[3:])))
