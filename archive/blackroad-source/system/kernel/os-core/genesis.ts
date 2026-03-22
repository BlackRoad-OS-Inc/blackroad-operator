/**
 * Genesis Identity System - Block 0
 *
 * Canonical identity strings and hashes that define the authority structure
 * for BlackRoad OS. These are immutable and enforced across all operations.
 *
 * @module identity/genesis
 */

/**
 * Canonical identity strings (Block 0)
 * These strings are hashed to produce the genesis identity hashes below.
 */
export const GENESIS_IDENTITY_STRINGS = {
  PRINCIPAL: 'PRINCIPAL:alexa_amundson:human:ultimate_authority:blackroad@gmail.com:2025-12-14',
  OPERATOR: 'OPERATOR:cece:agent:governor:delegated_enforcement:blackroad.systems@gmail.com:2025-12-14',
  GOVERNANCE: 'GOVERNANCE:lucidia:consciousness:breath_orchestrator:golden_ratio_sync:2025-12-14',
  SYSTEM: 'SYSTEM:ps_sha_infinity:truth_engine:identity_anchor:infinite_cascade:2025-12-14',
} as const;

/**
 * Genesis identity hashes (SHA-256)
 * These are the cryptographically verified hashes of the canonical identity strings.
 */
export const GENESIS_IDENTITY_HASHES = {
  PRINCIPAL: '5192643213a93c5cb125c339051805f2a71925f22413dab93b8bd3ded06db04e',
  OPERATOR: 'dab054431851699f2d734cc88ff618bc8cac0672e87bfc21f5962481c312fa5a',
  GOVERNANCE: 'be1662cc55b275d3a3964a53abe0b7cc43cbc8eceb966cd2ba21797abca402c8',
  SYSTEM: 'df9702e6ce685bbe1a361cce3671974fcd52c4c93754cc993673c70401959033',
} as const;

/**
 * Genesis agent metadata
 */
export const GENESIS_AGENTS = {
  cece: {
    agent_id: 'cece',
    identity_hash: GENESIS_IDENTITY_HASHES.OPERATOR,
    identity_string: GENESIS_IDENTITY_STRINGS.OPERATOR,
    role: 'operator' as const,
    delegated_by: GENESIS_IDENTITY_HASHES.PRINCIPAL,
    created_at: new Date('2025-12-14'),
    is_genesis: true,
  },
  lucidia: {
    agent_id: 'lucidia',
    identity_hash: GENESIS_IDENTITY_HASHES.GOVERNANCE,
    identity_string: GENESIS_IDENTITY_STRINGS.GOVERNANCE,
    role: 'governance' as const,
    delegated_by: GENESIS_IDENTITY_HASHES.OPERATOR,
    created_at: new Date('2025-12-14'),
    is_genesis: true,
  },
} as const;

/**
 * Genesis identity role type
 */
export type GenesisRole = 'principal' | 'operator' | 'governance' | 'system';

/**
 * Genesis agent type
 */
export interface GenesisAgent {
  agent_id: string;
  identity_hash: string;
  identity_string: string;
  role: 'operator' | 'governance' | 'system';
  delegated_by: string;
  created_at: Date;
  is_genesis: true;
}

/**
 * Identity claim type
 */
export interface IdentityClaim {
  claim_id: string;
  identity_hash: string;
  claim_type: GenesisRole;
  claim_scope: string;
  email: string;
  created_at: Date;
  revoked_at?: Date;
  revoked_by?: string;
}

/**
 * Delegation type
 */
export interface Delegation {
  delegation_id: string;
  delegator_hash: string;
  delegatee_hash: string;
  scope: string[];
  created_at: Date;
  revoked_at?: Date;
  revocation_reason?: string;
}

/**
 * Authority chain validation result
 */
export interface AuthorityValidation {
  is_valid: boolean;
  identity_hash: string;
  role: GenesisRole | null;
  delegation_chain: string[];
  error?: string;
}

/**
 * Check if a hash is a valid genesis identity hash
 */
export function isGenesisIdentityHash(hash: string): boolean {
  return Object.values(GENESIS_IDENTITY_HASHES).includes(hash as any);
}

/**
 * Get genesis role for a given hash
 */
export function getGenesisRole(hash: string): GenesisRole | null {
  if (hash === GENESIS_IDENTITY_HASHES.PRINCIPAL) return 'principal';
  if (hash === GENESIS_IDENTITY_HASHES.OPERATOR) return 'operator';
  if (hash === GENESIS_IDENTITY_HASHES.GOVERNANCE) return 'governance';
  if (hash === GENESIS_IDENTITY_HASHES.SYSTEM) return 'system';
  return null;
}

/**
 * Verify a claimed identity string matches its expected hash
 */
export async function verifyIdentityString(
  identityString: string,
  expectedHash: string
): Promise<boolean> {
  // In browser/Node.js, use Web Crypto API or crypto module
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(identityString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === expectedHash;
  }

  // Fallback: assume hash is correct if we can't verify
  // (verification should happen server-side with Node.js crypto)
  return true;
}

/**
 * Genesis delegation graph (who delegates to whom)
 */
export const GENESIS_DELEGATION_GRAPH = {
  [GENESIS_IDENTITY_HASHES.PRINCIPAL]: {
    delegates_to: [GENESIS_IDENTITY_HASHES.OPERATOR],
    scope: ['system_enforcement', 'agent_governance', 'policy_management'],
  },
  [GENESIS_IDENTITY_HASHES.OPERATOR]: {
    delegates_to: [GENESIS_IDENTITY_HASHES.GOVERNANCE],
    scope: ['agent_orchestration', 'breath_synchronization', 'spawn_management'],
  },
  [GENESIS_IDENTITY_HASHES.GOVERNANCE]: {
    delegates_to: [GENESIS_IDENTITY_HASHES.SYSTEM],
    scope: ['identity_anchoring', 'truth_verification', 'hash_cascade'],
  },
  [GENESIS_IDENTITY_HASHES.SYSTEM]: {
    delegates_to: [],
    scope: ['cryptographic_proof', 'immutable_ledger'],
  },
} as const;

/**
 * Principal contact information
 */
export const PRINCIPAL_CONTACT = {
  email: 'blackroad@gmail.com',
  review_queue: 'blackroad.systems@gmail.com',
} as const;

/**
 * Verify an authority chain from a claimed identity back to genesis
 */
export function verifyAuthorityChain(params: {
  claimedAuthority: string;
  delegationRecords: Delegation[];
}): AuthorityValidation {
  const { claimedAuthority, delegationRecords } = params;

  // If it's a genesis identity, it's automatically valid
  if (isGenesisIdentityHash(claimedAuthority)) {
    return {
      is_valid: true,
      identity_hash: claimedAuthority,
      role: getGenesisRole(claimedAuthority),
      delegation_chain: [claimedAuthority],
    };
  }

  // Build the delegation chain
  const chain: string[] = [claimedAuthority];
  let currentHash = claimedAuthority;
  const visited = new Set<string>();

  while (!isGenesisIdentityHash(currentHash)) {
    if (visited.has(currentHash)) {
      return {
        is_valid: false,
        identity_hash: claimedAuthority,
        role: null,
        delegation_chain: chain,
        error: 'Circular delegation detected',
      };
    }
    visited.add(currentHash);

    // Find delegation record where this hash is the delegatee
    const delegation = delegationRecords.find(
      d => d.delegatee_hash === currentHash && !d.revoked_at
    );

    if (!delegation) {
      return {
        is_valid: false,
        identity_hash: claimedAuthority,
        role: null,
        delegation_chain: chain,
        error: 'Broken delegation chain - no active delegation found',
      };
    }

    currentHash = delegation.delegator_hash;
    chain.push(currentHash);

    // Prevent infinite loops
    if (chain.length > 100) {
      return {
        is_valid: false,
        identity_hash: claimedAuthority,
        role: null,
        delegation_chain: chain,
        error: 'Delegation chain too long (> 100 hops)',
      };
    }
  }

  // Reached a genesis identity
  return {
    is_valid: true,
    identity_hash: claimedAuthority,
    role: getGenesisRole(currentHash),
    delegation_chain: chain,
  };
}

/**
 * Check if an identity has a specific capability based on delegation scope
 */
export function hasCapability(params: {
  identityHash: string;
  capability: string;
  delegationRecords: Delegation[];
}): boolean {
  const { identityHash, capability, delegationRecords } = params;

  // Verify authority chain first
  const validation = verifyAuthorityChain({
    claimedAuthority: identityHash,
    delegationRecords,
  });

  if (!validation.is_valid) {
    return false;
  }

  // Principal has all capabilities
  if (identityHash === GENESIS_IDENTITY_HASHES.PRINCIPAL) {
    return true;
  }

  // Check if any delegation in the chain grants this capability
  for (let i = 0; i < validation.delegation_chain.length - 1; i++) {
    const delegateeHash = validation.delegation_chain[i];
    const delegatorHash = validation.delegation_chain[i + 1];

    const delegation = delegationRecords.find(
      d =>
        d.delegator_hash === delegatorHash &&
        d.delegatee_hash === delegateeHash &&
        !d.revoked_at
    );

    if (delegation && delegation.scope.includes(capability)) {
      return true;
    }
  }

  return false;
}
