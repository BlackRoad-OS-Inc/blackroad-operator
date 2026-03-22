#!/usr/bin/env python3
"""
BlackRoad API Gateway - Intelligent Load Balancer
Routes requests to healthy backend nodes with round-robin, weighted, and least-connections strategies
"""

import asyncio
import aiohttp
from aiohttp import web
import json
import time
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from collections import defaultdict
import random

@dataclass
class Backend:
    name: str
    host: str
    port: int
    weight: int = 1
    healthy: bool = True
    last_check: float = 0
    response_time: float = 0
    connections: int = 0
    requests: int = 0
    errors: int = 0

@dataclass
class GatewayConfig:
    backends: List[Backend] = field(default_factory=list)
    strategy: str = "round_robin"  # round_robin, weighted, least_conn, random
    health_interval: int = 30
    timeout: int = 10
    retry_count: int = 2

class BlackRoadGateway:
    def __init__(self, config: GatewayConfig):
        self.config = config
        self.current_index = 0
        self.stats = {
            "total_requests": 0,
            "successful": 0,
            "failed": 0,
            "started_at": time.time()
        }

    def get_next_backend(self) -> Optional[Backend]:
        """Select next backend based on strategy"""
        healthy = [b for b in self.config.backends if b.healthy]
        if not healthy:
            return None

        if self.config.strategy == "round_robin":
            backend = healthy[self.current_index % len(healthy)]
            self.current_index += 1
            return backend

        elif self.config.strategy == "weighted":
            total_weight = sum(b.weight for b in healthy)
            r = random.randint(1, total_weight)
            for backend in healthy:
                r -= backend.weight
                if r <= 0:
                    return backend
            return healthy[0]

        elif self.config.strategy == "least_conn":
            return min(healthy, key=lambda b: b.connections)

        elif self.config.strategy == "random":
            return random.choice(healthy)

        return healthy[0]

    async def health_check(self):
        """Check health of all backends"""
        async with aiohttp.ClientSession() as session:
            for backend in self.config.backends:
                url = f"http://{backend.host}:{backend.port}/"
                try:
                    start = time.time()
                    async with session.get(url, timeout=5) as resp:
                        backend.response_time = time.time() - start
                        backend.healthy = resp.status < 500
                        backend.last_check = time.time()
                except:
                    backend.healthy = False
                    backend.last_check = time.time()

    async def proxy_request(self, request: web.Request) -> web.Response:
        """Proxy request to backend"""
        self.stats["total_requests"] += 1

        for attempt in range(self.config.retry_count):
            backend = self.get_next_backend()
            if not backend:
                self.stats["failed"] += 1
                return web.json_response({"error": "No healthy backends"}, status=503)

            backend.connections += 1
            backend.requests += 1

            url = f"http://{backend.host}:{backend.port}{request.path}"
            if request.query_string:
                url += f"?{request.query_string}"

            try:
                async with aiohttp.ClientSession() as session:
                    method = getattr(session, request.method.lower())

                    # Forward headers
                    headers = dict(request.headers)
                    headers["X-Forwarded-For"] = request.remote
                    headers["X-Forwarded-Host"] = request.host
                    headers["X-Backend"] = backend.name

                    # Get body if present
                    body = await request.read() if request.can_read_body else None

                    async with method(url, headers=headers, data=body, timeout=self.config.timeout) as resp:
                        backend.connections -= 1
                        self.stats["successful"] += 1

                        # Return response
                        response_body = await resp.read()
                        return web.Response(
                            body=response_body,
                            status=resp.status,
                            headers={
                                "X-Backend": backend.name,
                                "X-Response-Time": str(int((time.time() - backend.last_check) * 1000))
                            }
                        )

            except Exception as e:
                backend.connections -= 1
                backend.errors += 1
                backend.healthy = False
                continue

        self.stats["failed"] += 1
        return web.json_response({"error": "All backends failed"}, status=503)

    def get_stats(self) -> dict:
        """Get gateway statistics"""
        return {
            "stats": self.stats,
            "uptime": time.time() - self.stats["started_at"],
            "backends": [
                {
                    "name": b.name,
                    "healthy": b.healthy,
                    "requests": b.requests,
                    "errors": b.errors,
                    "response_time_ms": int(b.response_time * 1000),
                    "connections": b.connections
                }
                for b in self.config.backends
            ]
        }

# Create default config
config = GatewayConfig(
    backends=[
        Backend("cecilia", "192.168.4.89", 8000, weight=3),
        Backend("lucidia", "192.168.4.81", 8000, weight=2),
        Backend("octavia", "192.168.4.38", 8000, weight=2),
        Backend("aria", "192.168.4.82", 8000, weight=2),
        Backend("anastasia", "159.65.43.12", 8000, weight=1),
    ],
    strategy="weighted",
    health_interval=30
)

gateway = BlackRoadGateway(config)

# Routes
async def handle_stats(request):
    return web.json_response(gateway.get_stats())

async def handle_health(request):
    await gateway.health_check()
    healthy_count = sum(1 for b in config.backends if b.healthy)
    return web.json_response({
        "status": "healthy" if healthy_count > 0 else "unhealthy",
        "healthy_backends": healthy_count,
        "total_backends": len(config.backends)
    })

async def handle_proxy(request):
    return await gateway.proxy_request(request)

# Health check background task
async def health_check_loop(app):
    while True:
        await gateway.health_check()
        await asyncio.sleep(config.health_interval)

async def start_background_tasks(app):
    app['health_checker'] = asyncio.create_task(health_check_loop(app))

async def cleanup_background_tasks(app):
    app['health_checker'].cancel()

# App setup
app = web.Application()
app.router.add_get('/gateway/stats', handle_stats)
app.router.add_get('/gateway/health', handle_health)
app.router.add_route('*', '/{path:.*}', handle_proxy)

app.on_startup.append(start_background_tasks)
app.on_cleanup.append(cleanup_background_tasks)

if __name__ == '__main__':
    hostname = os.uname().nodename
    print(f"[{hostname}] BlackRoad Gateway starting on port 8080...")
    web.run_app(app, host='0.0.0.0', port=8080)
