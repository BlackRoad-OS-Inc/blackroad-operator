"""BlackRoad OS - Agent State Store

Provides agent state persistence using Cloudflare KV."""

from __future__ import annotations

import json
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)


class AgentStateStore:
    """    Agent state persistence using Cloudflare KV.

    Provides a distributed key-value store for agent memory and state,
    enabling agents to persist across restarts and scale globally."""

    def __init__(self, client, namespace_id: str):
        """        Initialize the state store.

        Args:
            client: CloudflareClient instance with KV operations
            namespace_id: KV namespace ID to use for storage"""
        self.client = client
        self.namespace_id = namespace_id

    async def save_agent_state(
        self,
        agent_id: str,
        state: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """Save agent state to KV"""
        key = f"agent:{agent_id}:state"
        value = json.dumps(state)
        return await self.client.kv_put(
            self.namespace_id,
            key,
            value,
            expiration_ttl=ttl
        )

    async def load_agent_state(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Load agent state from KV"""
        key = f"agent:{agent_id}:state"
        value = await self.client.kv_get(self.namespace_id, key)

        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                logger.error(f"Failed to parse agent state for {agent_id}")
                return None

        return None

    async def delete_agent_state(self, agent_id: str) -> bool:
        """Delete agent state from KV"""
        key = f"agent:{agent_id}:state"
        return await self.client.kv_delete(self.namespace_id, key)

    async def list_agents(self, prefix: str = "agent:") -> List[str]:
        """List all agent IDs in storage"""
        keys = await self.client.kv_list_keys(self.namespace_id, prefix=prefix)
        return [
            key["name"].split(":")[1]  # Extract agent_id from "agent:{id}:state"
            for key in keys
            if key["name"].count(":") == 2
        ]


__all__ = ["AgentStateStore"]
