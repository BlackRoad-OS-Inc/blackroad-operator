"""BlackRoad OS - Cloudflare Data Models

Defines data structures for Cloudflare services."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class CloudflareServiceType(str, Enum):
    """Types of Cloudflare services"""
    KV = "kv"
    D1 = "d1"
    PAGES = "pages"
    WORKERS = "workers"
    TUNNEL = "tunnel"


@dataclass
class CloudflareConfig:
    """Cloudflare configuration"""
    account_id: str
    api_token: str
    api_base_url: str = "https://api.cloudflare.com/client/v4"


@dataclass
class KVNamespace:
    """KV namespace metadata"""
    id: str
    title: str
    supports_url_encoding: bool = True


@dataclass
class D1Database:
    """D1 database metadata"""
    uuid: str
    name: str
    version: str
    created_at: str


__all__ = [
    "CloudflareServiceType",
    "CloudflareConfig",
    "KVNamespace",
    "D1Database"
]
