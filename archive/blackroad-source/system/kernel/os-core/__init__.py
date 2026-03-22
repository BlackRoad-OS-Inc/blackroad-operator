"""PS-SHA-Infinity ID Generation

Generates unique, deterministic identifiers for agents with optional lineage tracking.
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from typing import Any, Optional


def generate_ps_sha_id(
    manifest: dict[str, Any],
    creator_id: str,
    parent_ps_sha: Optional[str] = None,
    timestamp: Optional[datetime] = None,
) -> str:
    """Generate a PS-SHA-infinity ID for an agent instance.

    The ID is a SHA-256 hash of:
    - manifest: The agent's effective manifest
    - creator_id: The ID of the user/system creating the agent
    - timestamp: Creation time (defaults to now)
    - salt: Random bytes for uniqueness
    - parent: Optional parent PS-SHA for versioning/lineage

    Args:
        manifest: The agent manifest dictionary
        creator_id: UUID or identifier of the creator
        parent_ps_sha: Optional parent agent's PS-SHA ID for lineage
        timestamp: Optional timestamp (defaults to now)

    Returns:
        64-character hex string (SHA-256 hash)
    """
    if timestamp is None:
        timestamp = datetime.now(timezone.utc)

    payload = {
        "manifest": manifest,
        "creator_id": creator_id,
        "timestamp": timestamp.isoformat(),
        "salt": os.urandom(16).hex(),
        "parent": parent_ps_sha,
    }

    serialized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def validate_ps_sha_id(ps_sha_id: str) -> bool:
    """Validate that a string is a valid PS-SHA-infinity ID format.

    Args:
        ps_sha_id: The ID to validate

    Returns:
        True if valid, False otherwise
    """
    if not isinstance(ps_sha_id, str):
        return False
    if len(ps_sha_id) != 64:
        return False
    try:
        int(ps_sha_id, 16)
        return True
    except ValueError:
        return False


def generate_lineage_id(
    base_manifest: dict[str, Any],
    creator_id: str,
    lineage: list[str],
) -> str:
    """Generate a PS-SHA ID with full lineage chain.

    This creates an ID that incorporates the entire ancestry chain,
    making it possible to verify the complete history of an agent.

    Args:
        base_manifest: The agent manifest
        creator_id: The ID of the creator
        lineage: List of parent PS-SHA IDs (oldest first)

    Returns:
        PS-SHA ID incorporating lineage
    """
    parent_ps_sha = None
    if lineage:
        # Hash the entire lineage chain
        lineage_hash = hashlib.sha256(
            json.dumps(lineage, sort_keys=True).encode()
        ).hexdigest()
        parent_ps_sha = lineage_hash

    return generate_ps_sha_id(
        manifest=base_manifest,
        creator_id=creator_id,
        parent_ps_sha=parent_ps_sha,
    )


__all__ = [
    "generate_ps_sha_id",
    "validate_ps_sha_id",
    "generate_lineage_id",
]
