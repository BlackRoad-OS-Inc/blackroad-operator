# BlackRoad OS Core Library
#
# Shared protocol definitions, manifest schemas, PS-SHA-infinity ID generation,
# and SDK utilities for the BlackRoad 30K-agent infrastructure.

try:
    from blackroad_core.ps_sha import generate_ps_sha_id, validate_ps_sha_id
    from blackroad_core.manifest import (
        AgentManifest,
        PackManifest,
        validate_agent_manifest,
        validate_pack_manifest,
        merge_manifests,
    )
    from blackroad_core.protocol import (
        JobStatus,
        AgentStatus,
        RuntimeType,
        EventType,
    )
except ImportError:
    from .ps_sha import generate_ps_sha_id, validate_ps_sha_id
    from .manifest import (
        AgentManifest,
        PackManifest,
        validate_agent_manifest,
        validate_pack_manifest,
        merge_manifests,
    )
    from .protocol import (
        JobStatus,
        AgentStatus,
        RuntimeType,
        EventType,
    )

__version__ = "0.1.0"
__all__ = [
    # PS-SHA
    "generate_ps_sha_id",
    "validate_ps_sha_id",
    # Manifest
    "AgentManifest",
    "PackManifest",
    "validate_agent_manifest",
    "validate_pack_manifest",
    "merge_manifests",
    # Protocol
    "JobStatus",
    "AgentStatus",
    "RuntimeType",
    "EventType",
]
