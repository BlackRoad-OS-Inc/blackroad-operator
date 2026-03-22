#!/usr/bin/env python3
"""
BlackRoad Cloud Gateway Manager
Production-quality API gateway orchestration and management system.
Handles routing, rate limiting, authentication, and service discovery.
"""

import asyncio
import json
import logging
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Tuple
from dataclasses import dataclass, asdict, field
from enum import Enum
import threading
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GatewayStatus(Enum):
    """Gateway operational status."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    MAINTENANCE = "maintenance"


class RateLimitStrategy(Enum):
    """Rate limiting strategies."""
    TOKEN_BUCKET = "token_bucket"
    SLIDING_WINDOW = "sliding_window"
    FIXED_WINDOW = "fixed_window"


@dataclass
class RouteConfig:
    """API route configuration."""
    path: str
    method: str
    backend_service: str
    backend_port: int
    timeout_ms: int = 5000
    retry_count: int = 3
    circuit_breaker_threshold: float = 0.5
    authentication_required: bool = True
    rate_limit_requests: int = 1000
    rate_limit_window_seconds: int = 60
    enabled: bool = True
    tags: Dict[str, str] = field(default_factory=dict)


@dataclass
class ServiceInstance:
    """Backend service instance."""
    host: str
    port: int
    weight: int = 1
    health_check_interval_seconds: int = 30
    max_connections: int = 1000
    last_health_check: Optional[str] = None
    is_healthy: bool = True
    consecutive_failures: int = 0


@dataclass
class RateLimitConfig:
    """Rate limiting configuration."""
    strategy: RateLimitStrategy
    requests_per_window: int
    window_size_seconds: int
    cleanup_interval_seconds: int = 300


class CircuitBreaker:
    """Circuit breaker pattern implementation."""
    
    def __init__(self, threshold: float = 0.5, timeout_seconds: int = 60):
        self.threshold = threshold
        self.timeout_seconds = timeout_seconds
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = "closed"  # closed, open, half-open
        self.lock = threading.RLock()
    
    def record_success(self):
        """Record successful call."""
        with self.lock:
            self.success_count += 1
            if self.state == "half-open":
                self.state = "closed"
                self.failure_count = 0
                self.success_count = 0
    
    def record_failure(self):
        """Record failed call."""
        with self.lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            total = self.failure_count + self.success_count
            if total > 0 and self.failure_count / total > self.threshold:
                self.state = "open"
    
    def can_execute(self) -> bool:
        """Check if request can proceed."""
        with self.lock:
            if self.state == "closed":
                return True
            elif self.state == "open":
                if self.last_failure_time and \
                   time.time() - self.last_failure_time > self.timeout_seconds:
                    self.state = "half-open"
                    self.failure_count = 0
                    self.success_count = 0
                    return True
                return False
            else:  # half-open
                return True


class RateLimiter:
    """Token bucket rate limiter."""
    
    def __init__(self, config: RateLimitConfig):
        self.config = config
        self.buckets: Dict[str, List[float]] = {}
        self.lock = threading.RLock()
    
    def is_allowed(self, client_id: str) -> bool:
        """Check if request is allowed for client."""
        with self.lock:
            now = time.time()
            if client_id not in self.buckets:
                self.buckets[client_id] = []
            
            # Remove old requests outside window
            self.buckets[client_id] = [
                ts for ts in self.buckets[client_id]
                if now - ts < self.config.window_size_seconds
            ]
            
            if len(self.buckets[client_id]) < self.config.requests_per_window:
                self.buckets[client_id].append(now)
                return True
            return False


class LoadBalancer:
    """Load balancing implementation."""
    
    def __init__(self, strategy: str = "round_robin"):
        self.strategy = strategy
        self.current_index = 0
        self.lock = threading.Lock()
    
    def select_instance(self, instances: List[ServiceInstance]) -> Optional[ServiceInstance]:
        """Select backend instance based on strategy."""
        healthy = [i for i in instances if i.is_healthy]
        if not healthy:
            return None
        
        if self.strategy == "round_robin":
            with self.lock:
                idx = self.current_index % len(healthy)
                self.current_index += 1
                return healthy[idx]
        
        elif self.strategy == "least_connections":
            return min(healthy, key=lambda x: x.max_connections)
        
        elif self.strategy == "weighted":
            total_weight = sum(i.weight for i in healthy)
            if total_weight == 0:
                return healthy[0]
            import random
            r = random.uniform(0, total_weight)
            accumulated = 0
            for instance in healthy:
                accumulated += instance.weight
                if r <= accumulated:
                    return instance
            return healthy[-1]
        
        return healthy[0]


class GatewayMetrics:
    """Metrics collection and reporting."""
    
    def __init__(self):
        self.requests_total = 0
        self.requests_success = 0
        self.requests_failed = 0
        self.requests_latency_ms = []
        self.bytes_in = 0
        self.bytes_out = 0
        self.lock = threading.Lock()
    
    def record_request(self, success: bool, latency_ms: float, 
                       bytes_in: int, bytes_out: int):
        """Record request metrics."""
        with self.lock:
            self.requests_total += 1
            if success:
                self.requests_success += 1
            else:
                self.requests_failed += 1
            self.requests_latency_ms.append(latency_ms)
            self.bytes_in += bytes_in
            self.bytes_out += bytes_out
            
            # Keep only last 10000 measurements
            if len(self.requests_latency_ms) > 10000:
                self.requests_latency_ms = self.requests_latency_ms[-10000:]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current metrics."""
        with self.lock:
            latencies = self.requests_latency_ms
            return {
                "requests_total": self.requests_total,
                "requests_success": self.requests_success,
                "requests_failed": self.requests_failed,
                "success_rate": self.requests_success / max(1, self.requests_total),
                "avg_latency_ms": sum(latencies) / len(latencies) if latencies else 0,
                "p95_latency_ms": sorted(latencies)[int(len(latencies) * 0.95)] if latencies else 0,
                "p99_latency_ms": sorted(latencies)[int(len(latencies) * 0.99)] if latencies else 0,
                "bytes_in": self.bytes_in,
                "bytes_out": self.bytes_out,
            }


class APIGatewayManager:
    """Main API Gateway manager."""
    
    def __init__(self, config_path: Optional[str] = None):
        self.routes: Dict[str, RouteConfig] = {}
        self.services: Dict[str, List[ServiceInstance]] = {}
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.rate_limiters: Dict[str, RateLimiter] = {}
        self.load_balancers: Dict[str, LoadBalancer] = {}
        self.metrics = GatewayMetrics()
        self.status = GatewayStatus.HEALTHY
        self.config_path = config_path or "gateway_config.json"
        self.load_config()
    
    def load_config(self):
        """Load configuration from file."""
        try:
            if Path(self.config_path).exists():
                with open(self.config_path) as f:
                    config = json.load(f)
                    logger.info(f"Loaded configuration from {self.config_path}")
            else:
                logger.info("No configuration file found, using defaults")
                self._initialize_defaults()
        except Exception as e:
            logger.error(f"Error loading config: {e}")
            self._initialize_defaults()
    
    def _initialize_defaults(self):
        """Initialize with default configuration."""
        self.add_route(RouteConfig(
            path="/api/v1/health",
            method="GET",
            backend_service="health-check",
            backend_port=8080,
            authentication_required=False,
        ))
    
    def add_route(self, route: RouteConfig):
        """Add API route."""
        route_key = f"{route.method}:{route.path}"
        self.routes[route_key] = route
        
        # Initialize load balancer and rate limiter for route
        if route.backend_service not in self.load_balancers:
            self.load_balancers[route.backend_service] = LoadBalancer()
        
        if route_key not in self.rate_limiters:
            self.rate_limiters[route_key] = RateLimiter(
                RateLimitConfig(
                    strategy=RateLimitStrategy.SLIDING_WINDOW,
                    requests_per_window=route.rate_limit_requests,
                    window_size_seconds=route.rate_limit_window_seconds,
                )
            )
        
        logger.info(f"Added route: {route_key} -> {route.backend_service}:{route.backend_port}")
    
    def register_service(self, service_name: str, instance: ServiceInstance):
        """Register service instance."""
        if service_name not in self.services:
            self.services[service_name] = []
            self.circuit_breakers[service_name] = CircuitBreaker()
        
        self.services[service_name].append(instance)
        logger.info(f"Registered {service_name} instance: {instance.host}:{instance.port}")
    
    def health_check(self) -> GatewayStatus:
        """Perform system health check."""
        healthy_services = 0
        total_services = len(self.services)
        
        if total_services == 0:
            self.status = GatewayStatus.HEALTHY
            return self.status
        
        for service_name, instances in self.services.items():
            for instance in instances:
                # Simple health check (in production, would be HTTP/TCP)
                if instance.is_healthy:
                    healthy_services += 1
        
        health_ratio = healthy_services / (total_services * 2)  # avg 2 instances per service
        if health_ratio > 0.75:
            self.status = GatewayStatus.HEALTHY
        elif health_ratio > 0.5:
            self.status = GatewayStatus.DEGRADED
        else:
            self.status = GatewayStatus.UNHEALTHY
        
        logger.info(f"Health check: {self.status.value} ({health_ratio*100:.1f}% healthy)")
        return self.status
    
    def get_gateway_info(self) -> Dict[str, Any]:
        """Get gateway information and metrics."""
        return {
            "status": self.status.value,
            "routes": len(self.routes),
            "services": len(self.services),
            "metrics": self.metrics.get_stats(),
            "timestamp": datetime.utcnow().isoformat(),
        }


def main():
    """Main entry point."""
    gateway = APIGatewayManager()
    
    # Register some example services
    gateway.register_service("user-service", ServiceInstance("localhost", 8001))
    gateway.register_service("user-service", ServiceInstance("localhost", 8002))
    gateway.register_service("order-service", ServiceInstance("localhost", 9001))
    
    # Add some routes
    gateway.add_route(RouteConfig(
        path="/api/v1/users",
        method="GET",
        backend_service="user-service",
        backend_port=8001,
        rate_limit_requests=5000,
    ))
    
    gateway.add_route(RouteConfig(
        path="/api/v1/orders",
        method="POST",
        backend_service="order-service",
        backend_port=9001,
        retry_count=2,
    ))
    
    # Perform health check
    gateway.health_check()
    
    # Print gateway info
    info = gateway.get_gateway_info()
    print(json.dumps(info, indent=2))
    logger.info("Gateway manager initialized successfully")


if __name__ == "__main__":
    main()
