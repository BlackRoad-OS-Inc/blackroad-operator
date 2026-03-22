"""BlackRoad OS - Cloudflare Infrastructure Integration

Connects BlackRoad OS with Cloudflare services:
- Workers KV: Agent state persistence
- D1 Database: Relational data storage
- Pages: Static site hosting
- Workers: Edge compute
- Tunnels: Secure device connections

Refactored into modular components:
- models: Data structures
- client: Base HTTP client
- kv: Workers KV operations
- d1: D1 database operations
- pages: Pages hosting operations
- state_store: Agent state persistence
- factory: Client creation and infrastructure setup"""

from __future__ import annotations

from .models import (
    CloudflareServiceType,
    CloudflareConfig,
    KVNamespace,
    D1Database
)
from .client import CloudflareClient as BaseClient
from .kv import KVOperations
from .d1 import D1Operations
from .pages import PagesOperations
from .state_store import AgentStateStore
from .factory import create_cloudflare_client, setup_agent_infrastructure


class CloudflareClient(BaseClient, KVOperations, D1Operations, PagesOperations):
    """    Client for Cloudflare API operations.

    Provides methods to interact with KV, D1, Pages, and other services.
    Combines base client with service-specific operations via mixins."""
    pass


__all__ = [
    "CloudflareClient",
    "CloudflareServiceType",
    "CloudflareConfig",
    "KVNamespace",
    "D1Database",
    "AgentStateStore",
    "create_cloudflare_client",
    "setup_agent_infrastructure"
]
