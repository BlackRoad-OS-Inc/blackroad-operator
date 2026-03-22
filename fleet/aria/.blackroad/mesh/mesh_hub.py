#!/usr/bin/env python3
"""
BlackRoad WebSocket Mesh Hub
Real-time communication between all agents
"""

import asyncio
import json
import socket
import os
from datetime import datetime
from typing import Dict, Set
import sys

try:
    import websockets
except ImportError:
    print("Installing websockets...")
    os.system("pip3 install --user --break-system-packages websockets 2>/dev/null || pip3 install websockets")
    import websockets

MESH_PORT = 8765
PEERS: Dict[str, websockets.WebSocketServerProtocol] = {}
MESSAGE_LOG = os.path.expanduser("~/.blackroad/mesh/messages.jsonl")

class MeshHub:
    def __init__(self):
        self.hostname = socket.gethostname()
        self.peers: Dict[str, websockets.WebSocketServerProtocol] = {}
        self.subscriptions: Dict[str, Set[str]] = {}  # channel -> set of peer_ids

    async def register(self, websocket, peer_id: str):
        """Register new peer"""
        self.peers[peer_id] = websocket
        await self.broadcast_system(f"{peer_id} joined the mesh")
        print(f"[+] {peer_id} connected ({len(self.peers)} peers)")

    async def unregister(self, peer_id: str):
        """Unregister peer"""
        if peer_id in self.peers:
            del self.peers[peer_id]
            # Remove from all subscriptions
            for channel in self.subscriptions.values():
                channel.discard(peer_id)
            await self.broadcast_system(f"{peer_id} left the mesh")
            print(f"[-] {peer_id} disconnected ({len(self.peers)} peers)")

    async def broadcast(self, message: dict, exclude: str = None):
        """Broadcast to all peers"""
        msg_json = json.dumps(message)
        for peer_id, ws in list(self.peers.items()):
            if peer_id != exclude:
                try:
                    await ws.send(msg_json)
                except:
                    await self.unregister(peer_id)

    async def broadcast_system(self, text: str):
        """Broadcast system message"""
        await self.broadcast({
            "type": "system",
            "from": self.hostname,
            "text": text,
            "timestamp": datetime.utcnow().isoformat()
        })

    async def send_to_peer(self, peer_id: str, message: dict):
        """Send to specific peer"""
        if peer_id in self.peers:
            try:
                await self.peers[peer_id].send(json.dumps(message))
                return True
            except:
                await self.unregister(peer_id)
        return False

    async def publish(self, channel: str, message: dict):
        """Publish to channel subscribers"""
        subscribers = self.subscriptions.get(channel, set())
        for peer_id in list(subscribers):
            await self.send_to_peer(peer_id, {
                "type": "channel",
                "channel": channel,
                "message": message
            })

    def subscribe(self, peer_id: str, channel: str):
        """Subscribe peer to channel"""
        if channel not in self.subscriptions:
            self.subscriptions[channel] = set()
        self.subscriptions[channel].add(peer_id)

    def log_message(self, message: dict):
        """Log message to file"""
        with open(MESSAGE_LOG, "a") as f:
            f.write(json.dumps(message) + "\n")

    async def handler(self, websocket, path):
        """Handle WebSocket connection"""
        peer_id = None
        try:
            # Wait for registration
            reg_msg = await websocket.recv()
            reg = json.loads(reg_msg)
            peer_id = reg.get("peer_id", f"anon-{id(websocket)}")

            await self.register(websocket, peer_id)

            # Send welcome
            await websocket.send(json.dumps({
                "type": "welcome",
                "hub": self.hostname,
                "peers": list(self.peers.keys()),
                "timestamp": datetime.utcnow().isoformat()
            }))

            # Message loop
            async for message in websocket:
                try:
                    msg = json.loads(message)
                    msg["from"] = peer_id
                    msg["timestamp"] = datetime.utcnow().isoformat()

                    self.log_message(msg)

                    msg_type = msg.get("type", "message")

                    if msg_type == "broadcast":
                        await self.broadcast(msg, exclude=peer_id)

                    elif msg_type == "direct":
                        target = msg.get("to")
                        if target:
                            await self.send_to_peer(target, msg)

                    elif msg_type == "subscribe":
                        channel = msg.get("channel")
                        if channel:
                            self.subscribe(peer_id, channel)

                    elif msg_type == "publish":
                        channel = msg.get("channel")
                        if channel:
                            await self.publish(channel, msg)

                    elif msg_type == "ping":
                        await websocket.send(json.dumps({
                            "type": "pong",
                            "from": self.hostname,
                            "timestamp": datetime.utcnow().isoformat()
                        }))

                except json.JSONDecodeError:
                    pass

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            if peer_id:
                await self.unregister(peer_id)

async def main():
    hub = MeshHub()
    print(f"[*] BlackRoad Mesh Hub starting on port {MESH_PORT}...")
    async with websockets.serve(hub.handler, "0.0.0.0", MESH_PORT):
        print(f"[*] Mesh Hub ready on ws://0.0.0.0:{MESH_PORT}")
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
