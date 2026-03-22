/**
 * @typedef {Object} Org
 * @property {string} name
 * @property {0|1|2} tier
 * @property {string} purpose
 * @property {string} owner
 * @property {string[]} domains
 * @property {string} github
 */

/**
 * @typedef {Object} Domain
 * @property {string} domain
 * @property {string} org
 * @property {string} purpose
 * @property {'cloudflare'|'gematria'|'octavia'|'self-hosted'} infra
 * @property {'live'|'down'|'pending'} status
 */

/**
 * @typedef {Object} Node
 * @property {string} hostname
 * @property {string} ip
 * @property {'gateway'|'ai'|'git'|'web'|'edge'|'backup'|'compute'} role
 * @property {string[]} services
 * @property {'online'|'offline'|'degraded'} status
 */

/**
 * @typedef {Object} Agent
 * @property {string} name
 * @property {string} org
 * @property {string} node
 * @property {string[]} capabilities
 * @property {'active'|'offline'|'idle'} status
 */

/**
 * @typedef {Object} Service
 * @property {string} name
 * @property {string} node
 * @property {number} port
 * @property {string} org
 * @property {'http'|'https'|'tcp'|'dns'|'nats'} protocol
 * @property {'running'|'stopped'|'error'} status
 */

/**
 * @typedef {Object} Repo
 * @property {string} org
 * @property {string} name
 * @property {string} purpose
 * @property {'active'|'archived'|'deprecated'} status
 * @property {string} [gitea_url]
 * @property {string} [github_url]
 */

/**
 * @typedef {Object} AuditEvent
 * @property {number} id
 * @property {string} timestamp
 * @property {string} actor
 * @property {string} action
 * @property {string} entity_type
 * @property {string} entity_id
 * @property {Object} [details]
 * @property {string} [hash]
 */

module.exports = {};
