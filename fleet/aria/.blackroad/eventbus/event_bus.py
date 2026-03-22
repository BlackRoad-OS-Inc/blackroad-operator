#!/usr/bin/env python3
"""
BlackRoad Event Bus - Distributed Pub/Sub System
Real-time event streaming with channel subscriptions
"""

import asyncio
import json
import websockets
from datetime import datetime
from collections import defaultdict
import os

class EventBus:
    def __init__(self):
        self.subscribers = defaultdict(set)  # channel -> set of websockets
        self.message_history = defaultdict(list)  # channel -> last 100 messages
        self.stats = {
            "messages_total": 0,
            "subscribers_total": 0,
            "channels_active": 0,
            "started_at": datetime.now().isoformat()
        }

    async def subscribe(self, websocket, channel):
        self.subscribers[channel].add(websocket)
        self.stats["subscribers_total"] = sum(len(s) for s in self.subscribers.values())
        self.stats["channels_active"] = len(self.subscribers)

        # Send last 10 messages from history
        history = self.message_history[channel][-10:]
        for msg in history:
            await websocket.send(json.dumps({"type": "history", "data": msg}))

    async def unsubscribe(self, websocket, channel=None):
        if channel:
            self.subscribers[channel].discard(websocket)
        else:
            for ch in self.subscribers:
                self.subscribers[ch].discard(websocket)

        # Clean up empty channels
        empty = [ch for ch, subs in self.subscribers.items() if not subs]
        for ch in empty:
            del self.subscribers[ch]

        self.stats["subscribers_total"] = sum(len(s) for s in self.subscribers.values())
        self.stats["channels_active"] = len(self.subscribers)

    async def publish(self, channel, message, sender="system"):
        event = {
            "channel": channel,
            "message": message,
            "sender": sender,
            "timestamp": datetime.now().isoformat()
        }

        # Store in history (keep last 100)
        self.message_history[channel].append(event)
        if len(self.message_history[channel]) > 100:
            self.message_history[channel] = self.message_history[channel][-100:]

        # Broadcast to subscribers
        dead_sockets = set()
        for ws in self.subscribers[channel]:
            try:
                await ws.send(json.dumps({"type": "event", "data": event}))
            except:
                dead_sockets.add(ws)

        # Clean up dead connections
        for ws in dead_sockets:
            await self.unsubscribe(ws, channel)

        self.stats["messages_total"] += 1
        return len(self.subscribers[channel])

bus = EventBus()

async def handler(websocket, path):
    hostname = os.uname().nodename
    print(f"[{hostname}] New connection from {websocket.remote_address}")

    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                cmd = data.get("cmd")

                if cmd == "subscribe":
                    channel = data.get("channel", "default")
                    await bus.subscribe(websocket, channel)
                    await websocket.send(json.dumps({
                        "type": "subscribed",
                        "channel": channel
                    }))

                elif cmd == "unsubscribe":
                    channel = data.get("channel")
                    await bus.unsubscribe(websocket, channel)
                    await websocket.send(json.dumps({
                        "type": "unsubscribed",
                        "channel": channel
                    }))

                elif cmd == "publish":
                    channel = data.get("channel", "default")
                    msg = data.get("message", "")
                    sender = data.get("sender", hostname)
                    count = await bus.publish(channel, msg, sender)
                    await websocket.send(json.dumps({
                        "type": "published",
                        "channel": channel,
                        "subscribers_notified": count
                    }))

                elif cmd == "stats":
                    await websocket.send(json.dumps({
                        "type": "stats",
                        "data": bus.stats
                    }))

                elif cmd == "channels":
                    channels = {ch: len(subs) for ch, subs in bus.subscribers.items()}
                    await websocket.send(json.dumps({
                        "type": "channels",
                        "data": channels
                    }))

            except json.JSONDecodeError:
                await websocket.send(json.dumps({"error": "Invalid JSON"}))

    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await bus.unsubscribe(websocket)
        print(f"[{hostname}] Connection closed: {websocket.remote_address}")

async def main():
    hostname = os.uname().nodename
    print(f"[{hostname}] BlackRoad Event Bus starting on port 8766...")
    async with websockets.serve(handler, "0.0.0.0", 8766):
        print(f"[{hostname}] Event Bus ready - ws://{hostname}:8766")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
