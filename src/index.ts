// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
export { GatewayClient } from './core/client.js'
export { loadConfig } from './core/config.js'
export { logger } from './core/logger.js'
export { createSpinner } from './core/spinner.js'
export { formatTable } from './formatters/table.js'
export { formatJson } from './formatters/json.js'
export { brand } from './formatters/brand.js'
export type {
  HealthResult,
  MeshReport,
  DeployResult,
} from './infra/providers.js'
export {
  checkFullMesh,
  checkCloudflare,
  checkRailway,
  checkHuggingFace,
  checkSalesforce,
  checkOllama,
  checkPi,
  checkGateway,
} from './infra/providers.js'
export type { DeployTarget } from './infra/deploy.js'
export { deployService } from './infra/deploy.js'
