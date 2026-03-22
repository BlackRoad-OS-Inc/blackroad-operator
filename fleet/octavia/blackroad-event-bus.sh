#!/bin/bash
# BlackRoad Event Bus - Distributed Pub/Sub System
# Real-time event streaming across all devices

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

HOSTNAME=$(hostname)

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PINK}  BlackRoad Event Bus - Installing on $HOSTNAME${NC}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

mkdir -p ~/.blackroad/eventbus
mkdir -p ~/.blackroad/eventbus/channels
mkdir -p ~/.blackroad/eventbus/logs

# ============================================================
# [1/4] Event Bus Server (Redis-like pub/sub over WebSocket)
# ============================================================
echo -e "${AMBER}[1/4]${NC} Creating Event Bus Server..."

cat > ~/.blackroad/eventbus/event_bus.py << 'EVENTBUS'
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
EVENTBUS

chmod +x ~/.blackroad/eventbus/event_bus.py
echo -e "${GREEN}Event Bus Server installed${NC}"

# ============================================================
# [2/4] Event Publisher CLI
# ============================================================
echo -e "${AMBER}[2/4]${NC} Creating Event Publisher..."

cat > ~/.blackroad/eventbus/publish.py << 'PUBLISH'
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
PUBLISH

chmod +x ~/.blackroad/eventbus/publish.py

# ============================================================
# [3/4] Event Subscriber CLI
# ============================================================
echo -e "${AMBER}[3/4]${NC} Creating Event Subscriber..."

cat > ~/.blackroad/eventbus/subscribe.py << 'SUBSCRIBE'
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
SUBSCRIBE

chmod +x ~/.blackroad/eventbus/subscribe.py

# ============================================================
# [4/4] Event Bus CLI
# ============================================================
echo -e "${AMBER}[4/4]${NC} Creating Event Bus CLI..."

cat > ~/br-eventbus << 'EVENTCLI'
#!/bin/bash
# br-eventbus - BlackRoad Event Bus CLI

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
NC='\033[0m'

# Default hub is cecilia
HUB="${EVENTBUS_HUB:-cecilia}"

case "$1" in
    start)
        echo -e "${PINK}Starting Event Bus...${NC}"
        nohup python3 ~/.blackroad/eventbus/event_bus.py > ~/.blackroad/eventbus/logs/bus.log 2>&1 &
        echo $! > ~/.blackroad/eventbus/bus.pid
        echo -e "${GREEN}Event Bus started on port 8766${NC}"
        ;;

    stop)
        if [ -f ~/.blackroad/eventbus/bus.pid ]; then
            kill $(cat ~/.blackroad/eventbus/bus.pid) 2>/dev/null
            rm ~/.blackroad/eventbus/bus.pid
            echo -e "${AMBER}Event Bus stopped${NC}"
        fi
        ;;

    status)
        if [ -f ~/.blackroad/eventbus/bus.pid ] && kill -0 $(cat ~/.blackroad/eventbus/bus.pid) 2>/dev/null; then
            echo -e "${GREEN}Event Bus running${NC} (PID: $(cat ~/.blackroad/eventbus/bus.pid))"
        else
            echo -e "${AMBER}Event Bus not running${NC}"
        fi
        ;;

    pub|publish)
        channel="${2:-system}"
        shift 2 2>/dev/null
        message="$*"
        python3 ~/.blackroad/eventbus/publish.py "$HUB" "$channel" "$message"
        ;;

    sub|subscribe)
        shift
        channels="${@:-system}"
        python3 ~/.blackroad/eventbus/subscribe.py "$HUB" $channels
        ;;

    fleet-start)
        echo -e "${PINK}Starting Event Bus on fleet...${NC}"
        for host in cecilia lucidia octavia aria anastasia; do
            echo -n "$host: "
            ssh "$host" 'nohup python3 ~/.blackroad/eventbus/event_bus.py > ~/.blackroad/eventbus/logs/bus.log 2>&1 &' && \
                echo -e "${GREEN}started${NC}" || echo "failed"
        done
        ;;

    announce)
        # Announce to all standard channels
        message="$2"
        for channel in system deploy memory tasks agents; do
            python3 ~/.blackroad/eventbus/publish.py "$HUB" "$channel" "$message"
        done
        echo -e "${GREEN}Announced to all channels${NC}"
        ;;

    *)
        echo -e "${PINK}br-eventbus${NC} - BlackRoad Event Bus"
        echo ""
        echo "Commands:"
        echo "  start          - Start local Event Bus"
        echo "  stop           - Stop local Event Bus"
        echo "  status         - Check Event Bus status"
        echo "  pub <ch> <msg> - Publish message to channel"
        echo "  sub <ch>...    - Subscribe to channel(s)"
        echo "  fleet-start    - Start Event Bus on all devices"
        echo "  announce <msg> - Announce to all channels"
        echo ""
        echo "Channels: system, deploy, memory, tasks, agents, alerts"
        echo ""
        echo "Examples:"
        echo "  br-eventbus pub deploy 'Deployed cecilia API v2'"
        echo "  br-eventbus sub deploy memory tasks"
        echo "  br-eventbus announce 'Fleet maintenance starting'"
        ;;
esac
EVENTCLI

chmod +x ~/br-eventbus

echo -e ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Event Bus Installed on $HOSTNAME!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Components:${NC}"
echo "  • Event Bus Server (port 8766)"
echo "  • Publisher & Subscriber clients"
echo "  • Fleet broadcast support"
echo ""
echo -e "${AMBER}Quick start:${NC}"
echo "  ~/br-eventbus start"
echo "  ~/br-eventbus pub deploy 'Service updated'"
echo "  ~/br-eventbus sub deploy memory"
