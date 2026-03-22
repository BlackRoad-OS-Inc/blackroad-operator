#!/usr/bin/env python3
"""Subscribe to BlackRoad Event Bus channels"""

import asyncio
import websockets
import json
import sys

PINK = '\033[38;5;205m'
AMBER = '\033[38;5;214m'
GREEN = '\033[38;5;82m'
BLUE = '\033[38;5;69m'
NC = '\033[0m'

async def subscribe(host, channels):
    uri = f"ws://{host}:8766"

    try:
        async with websockets.connect(uri) as ws:
            # Subscribe to all channels
            for channel in channels:
                await ws.send(json.dumps({
                    "cmd": "subscribe",
                    "channel": channel
                }))
                print(f"{GREEN}Subscribed to:{NC} {channel}")

            print(f"\n{PINK}━━━ Listening for events ━━━{NC}\n")

            # Listen for events
            async for message in ws:
                data = json.loads(message)

                if data.get("type") == "event":
                    event = data["data"]
                    print(f"{AMBER}[{event['channel']}]{NC} {BLUE}{event['sender']}{NC}: {event['message']}")
                    print(f"  {event['timestamp']}\n")

                elif data.get("type") == "history":
                    event = data["data"]
                    print(f"{PINK}[history][{event['channel']}]{NC} {event['message']}")

    except KeyboardInterrupt:
        print("\nUnsubscribed")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: subscribe.py <host> <channel1> [channel2] ...")
        sys.exit(1)

    asyncio.run(subscribe(sys.argv[1], sys.argv[2:]))
