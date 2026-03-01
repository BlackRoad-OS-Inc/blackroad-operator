// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// Sovereign System — Provider-independent keys, memory, and API
export {
  sha256,
  doubleSha256,
  hmacSha256,
  secureRandom,
  generateKey,
  fingerprint,
  createSovereignKey,
  generateKeyPair,
  deriveKey,
  deriveAgentKey,
  validateKeyFormat,
  genesisEntry,
  chainEntry,
  verifyChain,
  type KeyPurpose,
  type SovereignKey,
  type KeyPair,
  type HashChainEntry,
} from './keys.js'

export {
  SovereignMemory,
  type MemoryEntry,
  type MemorySession,
  type MemoryStats,
  type MemoryLeak,
} from './memory.js'

export { createSovereignApi } from './api.js'
