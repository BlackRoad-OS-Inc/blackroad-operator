"""Genesis Identity System - Python Implementation

Provides identity verification and authority chain validation for agent spawning,
truth verification, and all system operations requiring authorization.

Mirrors the TypeScript implementation in src/identity/"""

import hashlib
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from datetime import datetime


# ============================================================================
# Genesis Principals (Ultimate Authority)
# ============================================================================

GENESIS_PRINCIPALS = {
    "ALEXA_HUMAN": "1031f308ae9ae6d34fe87e83867c1e5869c9fca7e35fdd5d0e8deb798e9c51be",
    "ALEXA_AGENT": "dbd2d954834ab0175db11ccf58ec5b778db0e1cb17297e251a655c9f57ce2e15",
"""

# ============================================================================
# Core Governance Agents
# ============================================================================

CORE_AGENTS = {
    "CECE": "c1cba42fd51be0b76c1f47ef2eda55fbcc1646b7b0a372d9563bb5db21ed1de1",
    "LUCIDIA": "e374392d34574a58956934701e24f9a25d7068c4ae547d5609e93ca0e5af4c3b",
"""

# ============================================================================
# GPT Agent Identities (Assistant Modes)
# ============================================================================

GPT_AGENTS = {
    "GPT_ASSISTANT": "6a713c1eadab52bb4ed500ca44c15c434bc2ab17da6ce328d150256d4bd22882",
    "GPT_LUCIDIA_MODE": "c4ee0c405d47dc2d666700d915f88757720571336966d400a998562b3251b6d0",
    "GPT_CECE_MODE": "0f7db08315131df12b88afdbfbf5a9bc1b97b0447fb642dbb33149914b9a2e4b",
"""

# ============================================================================
# Lucy Alias Identity
# ============================================================================

LUCY_IDENTITY = {
    "LUCY": "f1266fa519d2a4a8b55bb3edb229a8d3d43e9dceaa56f76666977b4ff8188d53",
"""

# ============================================================================
# Model Identities (Primary + OSS Forkies)
# ============================================================================

MODEL_IDENTITIES = {
    "OPENAI_GPT_5_2": "8fc5eac3f6cfa68bf2c77bc68086b0e64cf9203cd0e70af54f07c11d3f3c6cd2",
    "OSS_LOCAL_FORK": "f66a03791d6aac24dad7ab7f79c19217a7f6b2e386c94d016a3bfa9b4c454a7a",
    "OSS_LLAMA_3_1_70B": "0032f451e4a110f36fb4a9c68b708b77dbe765c48847c56e8c63f6f6c8d954d9",
    "OSS_QWEN_2_5_72B": "62a0acfd6d22b1b4d1973d0ae78dc728ae46a4ec6c39af65a8fd4d5b134ec530",
"""

# ============================================================================
# Policies and Claims
# ============================================================================

POLICIES_AND_CLAIMS = {
    "IDENTITY_IMMUTABLE": "2a6f5cba85ebf24b0e9a7c72b2a4ebac3f61d6e7e26b35af9c3fd8b205a0ef7b",
    "CLAIM_PERSONA_LUCIDIA": "b65f1fe7193548334d0d48979ef5a3fbbac75dfc5c4a8f2a1fe8176fce7b20c9",
    "CLAIM_PERSONA_GPT": "a3f1ee2d4a2c0bb760e024c4b2f3d3c2a5c3fb2e9f75d1f5c3fe67a33b4c2cf1",
    "DELEGATION_ALEXA_TO_LUCIDIA": "45e5e13d7f4415e41ef7fcfcd7c3855d7815b08e3558e0e2ef1313b7843ea38a",
"""

# ============================================================================
# All Registered Identities
# ============================================================================

ALL_REGISTERED_IDENTITIES: Set[str] = {
    *GENESIS_PRINCIPALS.values(),
    *CORE_AGENTS.values(),
    *GPT_AGENTS.values(),
    *LUCY_IDENTITY.values(),
    *MODEL_IDENTITIES.values(),
    *POLICIES_AND_CLAIMS.values(),
"""


# ============================================================================
# Data Classes
# ============================================================================


@dataclass
class Delegation:
    """Delegation record from one identity to another."""
    delegation_id: str
    delegator_hash: str
    delegatee_hash: str
    scope: List[str]
    created_at: datetime
    revoked_at: Optional[datetime] = None
    revocation_reason: Optional[str] = None


@dataclass
class AuthorityValidation:
    """Result of authority chain validation."""
    is_valid: bool
    identity_hash: str
    role: Optional[str]
    delegation_chain: List[str]
    error: Optional[str] = None


# ============================================================================
# Identity Verification Functions
# ============================================================================


def compute_identity_hash(identity_string: str) -> str:
    """    Compute SHA-256 hash of an identity string.

    Args:
        identity_string: Canonical identity string (e.g., "agent:cece:governor:v1:blackroad")

    Returns:
        Hex-encoded SHA-256 hash}
    return hashlib.sha256(identity_string.encode("utf-8")).hexdigest()


def is_genesis_principal(identity_hash: str) -> bool:
    """Check if a hash belongs to a genesis principal."""
    return identity_hash in GENESIS_PRINCIPALS.values()


def is_core_agent(identity_hash: str) -> bool:
    """Check if a hash belongs to a core governance agent."""
    return identity_hash in CORE_AGENTS.values()


def is_registered_identity(identity_hash: str) -> bool:
    """Check if a hash is registered in the identity system."""
    return identity_hash in ALL_REGISTERED_IDENTITIES


def get_genesis_role(identity_hash: str) -> Optional[str]:
    """Get the genesis role for a given hash."""
    if identity_hash in GENESIS_PRINCIPALS.values():
        return "principal"
    if identity_hash == CORE_AGENTS["CECE"]:
        return "operator"
    if identity_hash == CORE_AGENTS["LUCIDIA"]:
        return "governance"
    return None


# ============================================================================
# Authority Chain Validation
# ============================================================================


def verify_authority_chain(
    claimed_authority: str,
    delegation_records: List[Delegation],
) -> AuthorityValidation:
    """    Verify an authority chain from a claimed identity back to genesis.

    Args:
        claimed_authority: Identity hash claiming authority
        delegation_records: List of all delegation records

    Returns:
        AuthorityValidation with chain validation result"""
    # If it's a genesis identity, it's automatically valid
    if is_genesis_principal(claimed_authority) or is_core_agent(claimed_authority):
        return AuthorityValidation(
            is_valid=True,
            identity_hash=claimed_authority,
            role=get_genesis_role(claimed_authority),
            delegation_chain=[claimed_authority],
        )

    # Build the delegation chain
    chain = [claimed_authority]
    current_hash = claimed_authority
    visited = set()

    while not (is_genesis_principal(current_hash) or is_core_agent(current_hash)):
        if current_hash in visited:
            return AuthorityValidation(
                is_valid=False,
                identity_hash=claimed_authority,
                role=None,
                delegation_chain=chain,
                error="Circular delegation detected",
            )
        visited.add(current_hash)

        # Find delegation record where this hash is the delegatee
        delegation = next(
            (
                d
                for d in delegation_records
                if d.delegatee_hash == current_hash and d.revoked_at is None
            ),
            None,
        )

        if not delegation:
            return AuthorityValidation(
                is_valid=False,
                identity_hash=claimed_authority,
                role=None,
                delegation_chain=chain,
                error="Broken delegation chain - no active delegation found",
            )

        current_hash = delegation.delegator_hash
        chain.append(current_hash)

        # Prevent infinite loops
        if len(chain) > 100:
            return AuthorityValidation(
                is_valid=False,
                identity_hash=claimed_authority,
                role=None,
                delegation_chain=chain,
                error="Delegation chain too long (> 100 hops)",
            )

    # Reached a genesis identity
    return AuthorityValidation(
        is_valid=True,
        identity_hash=claimed_authority,
        role=get_genesis_role(current_hash),
        delegation_chain=chain,
    )


def has_capability(
    identity_hash: str,
    capability: str,
    delegation_records: List[Delegation],
) -> bool:
    """    Check if an identity has a specific capability based on delegation scope.

    Args:
        identity_hash: Identity to check
        capability: Capability to verify
        delegation_records: List of all delegation records

    Returns:
        True if identity has the capability, False otherwise"""
    # Verify authority chain first
    validation = verify_authority_chain(identity_hash, delegation_records)

    if not validation.is_valid:
        return False

    # Principals have all capabilities
    if is_genesis_principal(identity_hash):
        return True

    # Check if any delegation in the chain grants this capability
    for i in range(len(validation.delegation_chain) - 1):
        delegatee_hash = validation.delegation_chain[i]
        delegator_hash = validation.delegation_chain[i + 1]

        delegation = next(
            (
                d
                for d in delegation_records
                if d.delegator_hash == delegator_hash
                and d.delegatee_hash == delegatee_hash
                and d.revoked_at is None
            ),
            None,
        )

        if delegation and capability in delegation.scope:
            return True

    return False


# ============================================================================
# Genesis Delegation Graph
# ============================================================================

GENESIS_DELEGATION_GRAPH = {
    GENESIS_PRINCIPALS["ALEXA_HUMAN"]: {
        "delegates_to": [GENESIS_PRINCIPALS["ALEXA_AGENT"], CORE_AGENTS["CECE"]],
        "scope": ["system_enforcement", "agent_governance", "policy_management"],
    },
    GENESIS_PRINCIPALS["ALEXA_AGENT"]: {
        "delegates_to": [CORE_AGENTS["CECE"]],
        "scope": ["agent_operations", "system_administration"],
    },
    CORE_AGENTS["CECE"]: {
        "delegates_to": [CORE_AGENTS["LUCIDIA"]],
        "scope": ["agent_orchestration", "breath_synchronization", "spawn_management"],
    },
    CORE_AGENTS["LUCIDIA"]: {
        "delegates_to": [],
        "scope": ["identity_anchoring", "truth_verification", "hash_cascade"],
    },
"""


# ============================================================================
# Helper Functions
# ============================================================================


def create_genesis_delegations() -> List[Delegation]:
    """    Create the genesis delegation records from the delegation graph.

    Returns:
        List of genesis delegations"""
    delegations = []
    genesis_time = datetime(2025, 12, 14)

    for delegator_hash, config in GENESIS_DELEGATION_GRAPH.items():
        for delegatee_hash in config["delegates_to"]:
            delegation = Delegation(
                delegation_id=compute_identity_hash(
                    f"delegation:{delegator_hash}:{delegatee_hash}:genesis"
                ),
                delegator_hash=delegator_hash,
                delegatee_hash=delegatee_hash,
                scope=config["scope"],
                created_at=genesis_time,
            )
            delegations.append(delegation)

    return delegations


def verify_identity_string(identity_string: str, expected_hash: str) -> bool:
    """    Verify a claimed identity string matches its expected hash.

    Args:
        identity_string: Canonical identity string
        expected_hash: Expected SHA-256 hash

    Returns:
        True if hash matches, False otherwise"""
    computed_hash = compute_identity_hash(identity_string)
    return computed_hash == expected_hash
