"""BlackRoad OS - Cloudflare Factory Functions

Provides factory functions for creating Cloudflare clients and setting up infrastructure."""

from __future__ import annotations

import os
import logging
from typing import Optional

from .models import CloudflareConfig
from .state_store import AgentStateStore

logger = logging.getLogger(__name__)


def create_cloudflare_client(
    account_id: Optional[str] = None,
    api_token: Optional[str] = None
):
    """    Create a Cloudflare client from environment variables or parameters.

    Args:
        account_id: Cloudflare account ID (defaults to CLOUDFLARE_ACCOUNT_ID env var)
        api_token: Cloudflare API token (defaults to CLOUDFLARE_API_TOKEN env var)

    Returns:
        Configured CloudflareClient instance"""
    # Import here to avoid circular dependency
    from . import CloudflareClient

    config = CloudflareConfig(
        account_id=account_id or os.getenv("CLOUDFLARE_ACCOUNT_ID", ""),
        api_token=api_token or os.getenv("CLOUDFLARE_API_TOKEN", "")
    )

    if not config.account_id or not config.api_token:
        raise ValueError(
            "Cloudflare credentials not configured. "
            "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables."
        )

    return CloudflareClient(config)


async def setup_agent_infrastructure(client) -> AgentStateStore:
    """    Setup Cloudflare infrastructure for agent system.

    Creates necessary KV namespaces and returns an AgentStateStore.

    Args:
        client: CloudflareClient instance

    Returns:
        AgentStateStore configured with the agent KV namespace"""
    # Check for existing "blackroad-agents" namespace
    namespaces = await client.list_kv_namespaces()
    agent_namespace = next(
        (ns for ns in namespaces if ns.title == "blackroad-agents"),
        None
    )

    # Create namespace if it doesn't exist
    if not agent_namespace:
        logger.info("Creating 'blackroad-agents' KV namespace...")
        agent_namespace = await client.create_kv_namespace("blackroad-agents")

        if not agent_namespace:
            raise Exception("Failed to create agent KV namespace")

        logger.info(f"Created namespace: {agent_namespace.id}")

    return AgentStateStore(client, agent_namespace.id)


__all__ = [
    "create_cloudflare_client",
    "setup_agent_infrastructure"
]
