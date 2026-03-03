// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
export { GatewayClient } from './core/client.js'
export { loadConfig } from './core/config.js'
export { logger, type LogLevel } from './core/logger.js'
export { createSpinner } from './core/spinner.js'
export { formatTable } from './formatters/table.js'
export { formatJson } from './formatters/json.js'
export { brand } from './formatters/brand.js'

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
  SovereignMemory,
  createSovereignApi,
} from './sovereign/index.js'
