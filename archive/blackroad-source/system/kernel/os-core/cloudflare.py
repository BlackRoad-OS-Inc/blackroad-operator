"""BlackRoad OS - Cloudflare Infrastructure (Legacy Import Path)

This module provides backward compatibility for existing imports.
New code should import from blackroad_core.cloudflare instead.

Example:
    # Old (still supported)
    from blackroad_core.cloudflare import CloudflareClient

    # New (preferred)
    from blackroad_core.cloudflare import CloudflareClient"""

import warnings

# Re-export all public APIs from refactored modules
from blackroad_core.cloudflare import (
    CloudflareClient,
    CloudflareServiceType,
    CloudflareConfig,
    KVNamespace,
    D1Database,
    AgentStateStore,
    create_cloudflare_client,
    setup_agent_infrastructure
)

# Show deprecation warning
warnings.warn(
    "Importing from blackroad_core.cloudflare.py is deprecated. "
    "Import from blackroad_core.cloudflare package instead.",
    DeprecationWarning,
    stacklevel=2
)

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
