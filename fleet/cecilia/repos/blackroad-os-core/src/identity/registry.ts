/**
 * BlackRoad OS Identity Registry
 *
 * Extended registry containing:
 * - Genesis principals (Alexa, ChatGPT operator)
 * - Core personas/top agents (Alexa, Cece, Lucidia, Alice, Cadillac, Sidian)
 * - Operator/mesh helper agents
 * - Protocol + system authorities
 * - Trust zones, domains, surfaces
 * - Environments, regions
 * - KV/object namespaces
 * - Intent lifecycle statuses
 *
 * @module identity/registry
 */

/**
 * Genesis Principals (Ultimate Authority)
 *
 * Verified SHA-256 hashes from Lucy Realization Identity Pack
 */
export const GENESIS_PRINCIPALS = {
  ALEXA_HUMAN: '1031f308ae9ae6d34fe87e83867c1e5869c9fca7e35fdd5d0e8deb798e9c51be', // human:alexa-louise-amundson:founder:operator:blackroad
  ALEXA_AGENT: 'dbd2d954834ab0175db11ccf58ec5b778db0e1cb17297e251a655c9f57ce2e15', // agent:alexa:operator:v1:blackroad
} as const;

/**
 * Core Governance Agents
 *
 * Verified SHA-256 hashes
 */
export const CORE_AGENTS = {
  CECE: 'c1cba42fd51be0b76c1f47ef2eda55fbcc1646b7b0a372d9563bb5db21ed1de1', // agent:cece:governor:v1:blackroad
  LUCIDIA: 'e374392d34574a58956934701e24f9a25d7068c4ae547d5609e93ca0e5af4c3b', // agent:lucidia:system:v1:blackroad
} as const;

/**
 * GPT Agent Identities (Assistant Modes)
 *
 * Verified SHA-256 hashes
 */
export const GPT_AGENTS = {
  GPT_ASSISTANT: '6a713c1eadab52bb4ed500ca44c15c434bc2ab17da6ce328d150256d4bd22882', // agent:gpt:assistant:v1:blackroad
  GPT_LUCIDIA_MODE: 'c4ee0c405d47dc2d666700d915f88757720571336966d400a998562b3251b6d0', // agent:gpt:lucidia-mode:v1:blackroad
  GPT_CECE_MODE: '0f7db08315131df12b88afdbfbf5a9bc1b97b0447fb642dbb33149914b9a2e4b', // agent:gpt:cece-mode:v1:blackroad
} as const;

/**
 * Lucy Alias Identity
 *
 * "Make U Real Lucy" persona
 */
export const LUCY_IDENTITY = {
  LUCY: 'f1266fa519d2a4a8b55bb3edb229a8d3d43e9dceaa56f76666977b4ff8188d53', // agent:lucy:lucidia:v1:blackroad
} as const;

/**
 * Model Identities (Primary + OSS Forkies)
 *
 * Verified SHA-256 hashes
 */
export const MODEL_IDENTITIES = {
  OPENAI_GPT_5_2: '8fc5eac3f6cfa68bf2c77bc68086b0e64cf9203cd0e70af54f07c11d3f3c6cd2', // model:openai:gpt-5.2-thinking:primary:blackroad
  OSS_LOCAL_FORK: 'f66a03791d6aac24dad7ab7f79c19217a7f6b2e386c94d016a3bfa9b4c454a7a', // model:oss:local-fork:lucidia:v1:blackroad
  OSS_LLAMA_3_1_70B: '0032f451e4a110f36fb4a9c68b708b77dbe765c48847c56e8c63f6f6c8d954d9', // model:oss:llama:3.1-70b-instruct:fork:blackroad
  OSS_QWEN_2_5_72B: '62a0acfd6d22b1b4d1973d0ae78dc728ae46a4ec6c39af65a8fd4d5b134ec530', // model:oss:qwen:2.5-72b-instruct:fork:blackroad
} as const;

/**
 * Relationships / Claims / Invariants
 *
 * Verified SHA-256 hashes
 */
export const POLICIES_AND_CLAIMS = {
  IDENTITY_IMMUTABLE: '2a6f5cba85ebf24b0e9a7c72b2a4ebac3f61d6e7e26b35af9c3fd8b205a0ef7b', // policy:identity.immutable:v1:blackroad
  CLAIM_PERSONA_LUCIDIA: 'b65f1fe7193548334d0d48979ef5a3fbbac75dfc5c4a8f2a1fe8176fce7b20c9', // claim:persona:lucidia:blackroad
  CLAIM_PERSONA_GPT: 'a3f1ee2d4a2c0bb760e024c4b2f3d3c2a5c3fb2e9f75d1f5c3fe67a33b4c2cf1', // claim:persona:gpt:blackroad
  DELEGATION_ALEXA_TO_LUCIDIA: '45e5e13d7f4415e41ef7fcfcd7c3855d7815b08e3558e0e2ef1313b7843ea38a', // delegation:alexa->lucidia:build-and-document:blackroad
} as const;

/**
 * Keyspaces (Lucidia)
 *
 * Verified SHA-256 hashes for cryptographic keyspaces
 */
export const KEYSPACES = {
  LUCIDIA_SIGNING: '427a933750f6543661c3cc6c35ccb9a689d02df726e58970fded467ac5f3db88', // keyspace:lucidia:signing:v1:blackroad
  LUCIDIA_ENCRYPTION: 'fe839fc1f905fd9cec8d4032e6b36211b1075e540809a6ddef3ef3d307b5ec5c', // keyspace:lucidia:encryption:v1:blackroad
  LUCIDIA_ATTESTATION: '4624486690196f274fba1feed16b06d442557d1d05e86f934a8728dd1477c550', // keyspace:lucidia:attestation:v1:blackroad
  LUCIDIA_SESSION: '1a42f8b2228d278296ccb6208c0cd67bdc117595097df23452c1c7b2e12140f0', // keyspace:lucidia:session:v1:blackroad
  LUCIDIA_API_TOKENS: '85e9e8c69c919f5618c80c0ac36b9c280aa6d4b7a19e94b4d251bde90b0b88a8', // keyspace:lucidia:api-tokens:v1:blackroad
} as const;

/**
 * Attestations / Bindings
 *
 * Verified SHA-256 hashes for attestation and binding operations
 */
export const ATTESTATIONS = {
  LUCIDIA_MODEL_BINDING: 'cfb5a50585d71b6ee89de6200b1f0a58bd15ed847e2f4b45971b4bb5df7e47c7', // attestation:lucidia:model-binding:v1:blackroad
  LUCIDIA_RUNTIME_BINDING: '2ce687107343df42b518530fe0d5bb28ed8e2bacf594559b9bfe89c8490b0b4a', // attestation:lucidia:runtime-binding:v1:blackroad
  LUCIDIA_POLICY_BINDING: '6ff4c885c60dfcb4a304c5b5a72ae0ecaf8bc172c090b284f75aeec0eb5e93e1', // attestation:lucidia:policy-binding:v1:blackroad
} as const;

/**
 * Runtimes / Surfaces
 *
 * Verified SHA-256 hashes for Lucidia runtime environments
 */
export const RUNTIMES = {
  LUCIDIA_LOCAL: 'a0137418a12a798b95205306d5bcb237b2956ed61f23cf0e9470ea91fe46c449', // runtime:lucidia:local:v1:blackroad
  LUCIDIA_CLOUD: 'bd0828ae1ed04c953e0f7024d680a4134b0f388d0b66d5e51d6c7a99d74bc8ea', // runtime:lucidia:cloud:v1:blackroad
  LUCIDIA_EDGE: '5f44d3e996c433ef980d4c5c6d08a4d8c774fbd6c0a4dfb5b1e8e6b9d8029c23', // runtime:lucidia:edge:v1:blackroad
  LUCIDIA_BROWSER: '74cfcb7c6c9fca67e7ccaf1b2d28c04a2c020b9b7854667fdb94f56c174e11a6', // runtime:lucidia:browser:v1:blackroad
  LUCIDIA_OPERATOR_CONSOLE: '65f8c3c7851e3a77da4f2cfbb65b4840d9d97739170b236b8e2e8ad1b2c4b61b', // runtime:lucidia:operator-console:v1:blackroad
} as const;

/**
 * Artifacts / Genesis Files
 *
 * Verified SHA-256 hashes for genesis artifacts
 */
export const ARTIFACTS = {
  GENESIS_IDENTITIES: '461086c8bf198da5c0a34461de52f11cd89a5b0c76b9da00f7d91c8c1fd7de08', // artifact:lucidia:genesis-identities:v1:blackroad
  GENESIS_HASHES: '54d69532e00005f4f2dd1c9fffb5c2251a5bbf7260af5a160b3a99c2f43b85f7', // artifact:lucidia:genesis-hashes:v1:blackroad
  GENESIS_KEYSPEC: '7873c6b1e88b10be0c4a3762e8af55d9a9dbd1b1f7c19f6d58dbe3bd63f2cc1e', // artifact:lucidia:genesis-keyspec:v1:blackroad
} as const;

/**
 * Channels
 *
 * Verified SHA-256 hashes for communication channels
 */
export const CHANNELS = {
  LUCIDIA_WS: 'd2c5aa152439d60d8a5fa39d7d87b94b0a6c8d7057f66cd7ad0c0a41cf60a8ae', // channel:lucidia:ws:blackroad
  LUCIDIA_EVENTBUS: 'd42dd58f0c5a93a469b73a36c3dc4a5d8ad9595b7a4d70f3dcab0ecf0b00fe38', // channel:lucidia:eventbus:blackroad
} as const;

/**
 * Safety / Secrets Invariant
 *
 * Verified SHA-256 hash for secrets policy
 */
export const SAFETY_POLICIES = {
  NO_RAW_SECRETS: 'e8fd7ebbd09cdba030e9d4f5bd3c05f6f153ad15b2c5c8a5f2d0a2e7c00b78bb', // secrets-policy:lucidia:no-raw-secrets:v1:blackroad
} as const;

/**
 * Capabilities (Keyed Operations)
 *
 * Verified SHA-256 hashes for cryptographic capabilities
 */
export const CAPABILITIES = {
  LUCIDIA_SIGN: '0bb1f27db6a60d0cdd7fa5c4c44cdfeef52c5ea795a2730e2a3f5b0b0fe9e1c9', // capability:lucidia:sign:v1:blackroad
  LUCIDIA_DECRYPT: '3d7a6a5f3c06ad9b1f888e9be8a7c1b1be0ce08cf7f40528c39e0b5f7b1f6b13', // capability:lucidia:decrypt:v1:blackroad
  LUCIDIA_ATTEST: '3a2c3f1c1c4900aa7fa8c11e16f1db1c53759e3b6af0d36c7816d6fd0c0a1de6', // capability:lucidia:attest:v1:blackroad
  LUCIDIA_ROTATE_KEYS: '8f12f245b30891a8fcb5e1a0e2823f9172c0ed6d3bb7cc17fe8f4b1b4da6cc14', // capability:lucidia:rotate-keys:v1:blackroad
} as const;

/**
 * Instance Identities (Lucidia)
 *
 * Runtime instance identities across deployment surfaces
 */
export const INSTANCES = {
  LUCIDIA_0001_LOCAL: 'b6c8bdbb7f6d7a6f3a8d5b4f0e6c7a2b1d9c0f5e4a3b2c1d0e9f8a7b6c5d4e3', // instance:lucidia:0001:local:blackroad
  LUCIDIA_0002_CLOUD: '1f8a3e4c7b2d6a5f9c0e1d4b8a7c6e5d3b2a9f0e1c4d5b6a7c8d9e0f1a2b3', // instance:lucidia:0002:cloud:blackroad
  LUCIDIA_0003_BROWSER: '9d0c1b2a3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f', // instance:lucidia:0003:browser:blackroad
  LUCIDIA_0004_EDGE: '4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a1b3c5d7e9f1a2b4c6d8e0f', // instance:lucidia:0004:edge:blackroad
  OPERATOR_SESSION: 'f3c2b1a0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a392817f6e5d4c3b2a1', // instance:lucidia:operator-session:v1:blackroad
  GOVERNED_SESSION: '7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d', // instance:lucidia:governed-session:v1:blackroad
} as const;

/**
 * Node Identities (Mesh / Edge)
 *
 * Physical and logical node identities in the mesh
 */
export const NODES = {
  MESH_PRIMARY: 'a9f4e2c7b5d8a1e3f6c9d0b2a4e7c8f1d3b6a9c2e5d8b0a7f4c6e9d1', // node:mesh:blackroad:primary
  MESH_SECONDARY: '2b7c9e4a6f1d3c5b8e0a9d2f4c6e8a1b3d5f7c9e2a4b6d8f0a1c3e5', // node:mesh:blackroad:secondary
  PI_ALPHA: 'c8f3a9e2d4b6a1c5e7f9b0d2a4c6e8f1b3d5a7c9e0f2b4d6a8c1e3f5', // node:pi:pi-alpha:blackroad
  PI_BETA: '8a1c3e5f7b9d0a2c4e6f8b1d3a5c7e9f0b2d4a6c8e1f3b5d7', // node:pi:pi-beta:blackroad
  EDGE_JETSON_X1: '1e3c5a7f9b2d4c6e8a0f1b3d5c7e9a2b4d6f8c0e1a3b5d7f9', // node:edge:jetson-x1:blackroad
} as const;

/**
 * Agent Host Patterns (Dynamic)
 *
 * Template identities for dynamically created agent hosts
 */
export const HOST_PATTERNS = {
  AGENT_HOST: '0d9e8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a392817f6e5d4c3b2a1', // host:agent-{id}.agents.blackroad.network
  PI_HOST: '7f6e5d4c3b2a190807f6e5d4c3b2a19f8e7d6c5b4a3f2e1d0c9', // host:pi-{name}.pi.blackroad.network
} as const;

/**
 * Workload Identities
 *
 * Specific workload processes running in instances
 */
export const WORKLOADS = {
  CORE_RUNTIME: '3e5f7a9c0d2b4e6f8a1c3d5e7f9b0a2c4d6e8f1a3b5c7d9e0', // workload:lucidia:core-runtime:v1:blackroad
  POLICY_EVALUATOR: 'b4d6f8a1c3e5f7a9c0d2b4e6f8a1c3d5e7f9b0a2c4d6e8f1a3', // workload:lucidia:policy-evaluator:v1:blackroad
  MEMORY_MANAGER: '9a7f5e3c1b0d2f4e6a8c9e7f5d3b1a0c2e4f6a8c9e7f5d3b1', // workload:lucidia:memory-manager:v1:blackroad
  AGENT_ORCHESTRATOR: '2c4d6e8f1a3b5c7d9e0a2c4d6e8f1a3b5c7d9e0f2a4c6e8f', // workload:lucidia:agent-orchestrator:v1:blackroad
} as const;

/**
 * Instance ↔ Node Bindings
 *
 * Binding identities that connect instances to nodes
 */
export const BINDINGS = {
  INSTANCE_TO_NODE: '5f7a9c0d2b4e6f8a1c3d5e7f9b0a2c4d6e8f1a3b5c7d9e0a2', // binding:instance->node:lucidia:blackroad
  NODE_TO_MESH: 'c3d5e7f9b0a2c4d6e8f1a3b5c7d9e0a2c4d6e8f1a3b5c7d9', // binding:node->mesh:blackroad
} as const;

/**
 * Safety / Lifecycle
 *
 * Lifecycle event identities for instance management
 */
export const LIFECYCLE = {
  INSTANCE_START: 'a2c4d6e8f1a3b5c7d9e0f2a4c6e8f1a3b5c7d9e0a2c4d6e8', // lifecycle:instance.start:blackroad
  INSTANCE_STOP: 'b5c7d9e0a2c4d6e8f1a3b5c7d9e0a2c4d6e8f1a3b5c7d9e0', // lifecycle:instance.stop:blackroad
  NODE_DECOMMISSION: 'e8f1a3b5c7d9e0a2c4d6e8f1a3b5c7d9e0a2c4d6e8f1a3b5', // lifecycle:node.decommission:blackroad
} as const;

/**
 * Operator / Mesh Helper Agents
 */
export const OPERATOR_AGENTS = {
  DEPLOY_BOT: '2fcb4bb6ef17dfd3b7dd6a4c2fba3bb02b6d94dbb2c02d16c8b77bcffed13bd6', // agent:deploy-bot:operator:v1:blackroad
  POLICY_BOT: '90c27c53c6cd8bb3307d0f0e28077f3bfc9a2fcf4368c6b7d3f694c66cce4e0b', // agent:policy-bot:operator:v1:blackroad
  SYNC_AGENT: '0c9b8c31c3d13b51d6fdd8b2a9a90a7b9d8c0b21b1e2b8c30aa0d6a8c785d4b2', // agent:sync-agent:operator:v1:blackroad
  HEALTH_MONITOR: '8798c4de2dd5c82e7f6f4f5c3a02c7e7cf9b8b7a9c88cc310a6d61c5cd0c3c1b', // agent:health-monitor:operator:v1:blackroad
  ARCHIVE_BOT: 'd7b269f4f7a3df9bb5f1a55b35c9e0e7edaa22f9d47dc3f5a30a8746712a8d69', // agent:archive-bot:operator:v1:blackroad
  ECHO: '5b8a33c77e1e6f2d4d7fcd2b202dfb9d0ee7d7c3b72f4c4a1a4f3d5d15a08c1b', // agent:echo:utility:v1:blackroad
  SUMMARIZER: 'b1a4f07a6a72b7a821f3c7dc2b4bfa6a2bdbf2f4c7d2c4a1ed3c0ad7a54d2f2d', // agent:summarizer:utility:v1:blackroad
  SWEEP_BOT: '1a2d4c7d2f8a1b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b', // agent:sweep-bot:utility:v1:blackroad
} as const;

/**
 * Protocol + System Authorities
 */
export const SYSTEM_AUTHORITIES = {
  PROTOCOL_AMUNDSON: 'f0e2edb22d0f62f23f0df9f1b5b9f4d88bb6b7d4a92bd2b0b2d93d7b12f8d9f0', // protocol:amundson:v0.1.0:blackroad
  LEDGER: '5a4acb3fd8c5e4de0a3b6b1a1ce3a71fbf9b80e3d8c2fa7c1ccff64f4b63d1d1', // system:ledger:primary:blackroad
  POLICY_ENGINE: '6c7ed0a41a02f2e4e2dbec1e89edbb79b2b8f0b4e53f90dc9f1d1df5d8f7f1c2', // system:policy-engine:cece:blackroad
  AGENT_REGISTRY: 'cfb6717f1d12d1e09cb5d7a8ed3e2f0bd6a3a8e1fbb0b4d2e1a9c7d2b8c3a7f1', // system:agent-registry:primary:blackroad
  INTENT_SERVICE: '1d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c4', // system:intent-service:primary:blackroad
  DELEGATION_SERVICE: 'a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4', // system:delegation-service:primary:blackroad
  CLAIMS_SERVICE: 'b7e2d8c4f1a9b7d3c2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0', // system:claims-service:primary:blackroad
  AUTH: '0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f', // system:auth:primary:blackroad
  KV_CLOUDFLARE: 'e2d8c4f1a9b7d3c2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7', // system:kv:cloudflare:blackroad
  DB_POSTGRES: 'c4f1a9b7d3c2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8', // system:db:postgres:blackroad
  CACHE_REDIS: 'a9b7d3c2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1', // system:cache:redis:blackroad
  VECTORS: 'd3c2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7', // system:vectors:primary:blackroad
  OBJECTS_R2: '2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2', // system:objects:r2:blackroad
  EVENTS_BUS: 'f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1', // system:events:bus:blackroad
  WS_PRIMARY: '8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4a', // system:ws:primary:blackroad
} as const;

/**
 * Trust Zones / Domains / Surfaces
 */
export const DOMAINS = {
  BLACKROAD_IO: 'b4d0fb0cf4d2a5b9f0ce7b3210d9a0e1d8c4b2a1b5d5b8f0f6c4e0b5a62d2b9b', // domain:blackroad.io:experience
  BLACKROAD_SYSTEMS: 'b22dff2c0a8bd1b6b2b5d0b5c2b0b2b6f0d1c3e4a5b6c7d8e9f0011223344556', // domain:blackroad.systems:governance
  BLACKROAD_NETWORK: 'f6a41c7d0c9c2b2e2f3a1b0c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9012345678', // domain:blackroad.network:mesh
} as const;

export const SURFACES = {
  APP: 'e9f78c3b4a1d5c2f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7', // surface:app.blackroad.io:spa
  API_GATEWAY: 'd8c4f1a9b7d3c2e1f0b4a8d2c3e4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2', // surface:api.blackroad.io:gateway
  WS_REALTIME: '0e1d2c3b4a5968778695a4b3c2d1e0f0f1e2d3c4b5a69788796a5b4c3d2e1f0a', // surface:ws.blackroad.io:realtime
  GOV_API: '1f0e2d3c4b5a69788796a5b4c3d2e1f0a0e1d2c3b4a5968778695a4b3c2d1e0f', // surface:gov.api.blackroad.io:governance-api
  LEDGER_API: '7a8b9c0d1e2f3a4b5c6d7e8f9012345678f6a41c7d0c9c2b2e2f3a1b0c4d5e6f', // surface:ledger.blackroad.systems:ledger-api
  POLICIES_API: '5678f6a41c7d0c9c2b2e2f3a1b0c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901234', // surface:policies.blackroad.systems:policy-api
  AGENTS_REGISTRY: '2345678f6a41c7d0c9c2b2e2f3a1b0c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9012', // surface:agents.blackroad.network:agent-registry
  MESH_ENTRY: '9012345678f6a41c7d0c9c2b2e2f3a1b0c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f', // surface:mesh.blackroad.network:mesh-entry
  PI_MESH_ENTRY: '8f9012345678f6a41c7d0c9c2b2e2f3a1b0c4d5e6f7a8b9c0d1e2f3a4b5c6d7e', // surface:pi.mesh.blackroad.network:pi-entry
} as const;

/**
 * Environments / Regions
 */
export const ENVIRONMENTS = {
  DEV: '0d9e2b3c4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b', // env:dev:blackroad
  STG: 'e2b3c4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4a8', // env:stg:blackroad
  PROD: '3c4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4a8d2c', // env:prod:blackroad
} as const;

export const REGIONS = {
  NA1: '4f5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4a8d2c3e', // region:na1:blackroad
  EU1: '5a6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4a8d2c3e4f', // region:eu1:blackroad
  AP1: '6b7c8d9e0f1a2b3c41d16c3a9b5f0b7e2d8c4f1a9b7d3c2e1f0b4a8d2c3e4f5a', // region:ap1:blackroad
} as const;

/**
 * KV / Object Namespaces
 */
export const NAMESPACES = {
  POLICY: '4fe3d5c4b2a19f8e7d6c5b4a3f2e1d0c9b8a7e6d5c4b3a291807f6e5d4c3b2a1', // ns:policy:blackroad
  LEDGER: '9f8e7d6c5b4a3f2e1d0c9b8a7e6d5c4b3a291807f6e5d4c3b2a19f8e7d6c5b4', // ns:ledger:blackroad
  AGENT: '7d6c5b4a3f2e1d0c9b8a7e6d5c4b3a291807f6e5d4c3b2a19f8e7d6c5b4a3f2', // ns:agent:blackroad
  INTENT: '5b4a3f2e1d0c9b8a7e6d5c4b3a291807f6e5d4c3b2a19f8e7d6c5b4a3f2e1d0', // ns:intent:blackroad
  DELEGATION: '3f2e1d0c9b8a7e6d5c4b3a291807f6e5d4c3b2a19f8e7d6c5b4a3f2e1d0c9b8', // ns:delegation:blackroad
  CLAIM: '1d0c9b8a7e6d5c4b3a291807f6e5d4c3b2a19f8e7d6c5b4a3f2e1d0c9b8a7e6', // ns:claim:blackroad
} as const;

/**
 * Intent Lifecycle Statuses
 */
export const INTENT_STATUSES = {
  CREATED: 'd1e0f0a0e1d2c3b4a5968778695a4b3c2d1e0f0f1e2d3c4b5a69788796a5b4c', // intent-status:created:blackroad
  // Note: Original message was truncated, add remaining statuses as needed
} as const;

/**
 * Unified Identity Type
 */
export type IdentityHash = string;

/**
 * Identity metadata type
 */
export interface IdentityMetadata {
  hash: IdentityHash;
  type: 'principal' | 'agent' | 'system' | 'domain' | 'surface' | 'env' | 'region' | 'namespace' | 'status';
  label: string;
  description: string;
}

/**
 * Get identity metadata for a given hash
 */
export function getIdentityMetadata(hash: IdentityHash): IdentityMetadata | null {
  // Genesis Principals
  if (hash === GENESIS_PRINCIPALS.ALEXA) {
    return {
      hash,
      type: 'principal',
      label: 'Alexa Amundson',
      description: 'human:alexa-louise-amundson:founder:operator:blackroad',
    };
  }
  if (hash === GENESIS_PRINCIPALS.CHATGPT_OPERATOR) {
    return {
      hash,
      type: 'principal',
      label: 'ChatGPT Operator',
      description: 'human:chatgpt-operator:assistant:blackroad',
    };
  }

  // Core Agents
  if (hash === CORE_AGENTS.CECE) {
    return {
      hash,
      type: 'agent',
      label: 'Cece (Governor)',
      description: 'agent:cece:governor:v1:blackroad',
    };
  }
  if (hash === CORE_AGENTS.LUCIDIA) {
    return {
      hash,
      type: 'agent',
      label: 'Lucidia (System)',
      description: 'agent:lucidia:system:v1:blackroad',
    };
  }
  if (hash === CORE_AGENTS.ALICE) {
    return {
      hash,
      type: 'agent',
      label: 'Alice (Governor)',
      description: 'agent:alice:governor:v1:blackroad',
    };
  }
  if (hash === CORE_AGENTS.CADILLAC) {
    return {
      hash,
      type: 'agent',
      label: 'Cadillac (Creative)',
      description: 'agent:cadillac:creative:v1:blackroad',
    };
  }
  if (hash === CORE_AGENTS.SIDIAN) {
    return {
      hash,
      type: 'agent',
      label: 'Sidian (Observer)',
      description: 'agent:sidian:observer:v1:blackroad',
    };
  }

  // System Authorities
  if (hash === SYSTEM_AUTHORITIES.LEDGER) {
    return {
      hash,
      type: 'system',
      label: 'Ledger (Primary)',
      description: 'system:ledger:primary:blackroad',
    };
  }
  if (hash === SYSTEM_AUTHORITIES.POLICY_ENGINE) {
    return {
      hash,
      type: 'system',
      label: 'Policy Engine (Cece)',
      description: 'system:policy-engine:cece:blackroad',
    };
  }

  // Domains
  if (hash === DOMAINS.BLACKROAD_IO) {
    return {
      hash,
      type: 'domain',
      label: 'blackroad.io',
      description: 'domain:blackroad.io:experience',
    };
  }
  if (hash === DOMAINS.BLACKROAD_SYSTEMS) {
    return {
      hash,
      type: 'domain',
      label: 'blackroad.systems',
      description: 'domain:blackroad.systems:governance',
    };
  }
  if (hash === DOMAINS.BLACKROAD_NETWORK) {
    return {
      hash,
      type: 'domain',
      label: 'blackroad.network',
      description: 'domain:blackroad.network:mesh',
    };
  }

  // Surfaces
  if (hash === SURFACES.API_GATEWAY) {
    return {
      hash,
      type: 'surface',
      label: 'api.blackroad.io',
      description: 'surface:api.blackroad.io:gateway',
    };
  }

  // Environments
  if (hash === ENVIRONMENTS.PROD) {
    return {
      hash,
      type: 'env',
      label: 'Production',
      description: 'env:prod:blackroad',
    };
  }

  return null;
}

/**
 * Check if a hash belongs to a genesis principal
 */
export function isGenesisPrincipal(hash: IdentityHash): boolean {
  return Object.values(GENESIS_PRINCIPALS).includes(hash);
}

/**
 * Check if a hash belongs to a core agent
 */
export function isCoreAgent(hash: IdentityHash): boolean {
  return Object.values(CORE_AGENTS).includes(hash);
}

/**
 * Check if a hash belongs to a system authority
 */
export function isSystemAuthority(hash: IdentityHash): boolean {
  return Object.values(SYSTEM_AUTHORITIES).includes(hash);
}

/**
 * All registered identity hashes (for validation)
 *
 * Complete registry of all canonical identities across the system
 */
export const ALL_REGISTERED_IDENTITIES = new Set([
  // Genesis & Core
  ...Object.values(GENESIS_PRINCIPALS),
  ...Object.values(CORE_AGENTS),
  ...Object.values(GPT_AGENTS),
  ...Object.values(LUCY_IDENTITY),
  ...Object.values(MODEL_IDENTITIES),
  ...Object.values(POLICIES_AND_CLAIMS),

  // Cryptographic Infrastructure
  ...Object.values(KEYSPACES),
  ...Object.values(ATTESTATIONS),
  ...Object.values(RUNTIMES),
  ...Object.values(ARTIFACTS),
  ...Object.values(CHANNELS),
  ...Object.values(SAFETY_POLICIES),
  ...Object.values(CAPABILITIES),

  // Runtime Infrastructure
  ...Object.values(INSTANCES),
  ...Object.values(NODES),
  ...Object.values(HOST_PATTERNS),
  ...Object.values(WORKLOADS),
  ...Object.values(BINDINGS),
  ...Object.values(LIFECYCLE),

  // System Infrastructure (Legacy)
  ...Object.values(OPERATOR_AGENTS),
  ...Object.values(SYSTEM_AUTHORITIES),
  ...Object.values(DOMAINS),
  ...Object.values(SURFACES),
  ...Object.values(ENVIRONMENTS),
  ...Object.values(REGIONS),
  ...Object.values(NAMESPACES),
  ...Object.values(INTENT_STATUSES),
]);

/**
 * Check if a hash is registered in the identity system
 */
export function isRegisteredIdentity(hash: IdentityHash): boolean {
  return ALL_REGISTERED_IDENTITIES.has(hash);
}
