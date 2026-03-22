'use strict'

// Fleet-aware Ollama provider — distributes inference across all nodes
// Round-robin with health checking and automatic failover

// Sovereign fleet — local Ollama nodes only. No external APIs.
const FLEET_NODES = [
  { name: 'octavia', url: 'http://192.168.4.101:11434', models: ['blackroad-road:latest', 'blackroad-alice:latest', 'blackroad-cipher:latest', 'blackroad-octavia:latest', 'tinyllama:latest', 'nomic-embed-text:latest'] },
  { name: 'lucidia', url: 'http://192.168.4.38:11434', models: ['tinyllama:latest', 'nomic-embed-text:latest'] },
  { name: 'aria', url: 'http://192.168.4.98:11434', models: ['tinyllama:latest', 'nomic-embed-text:latest'] },
]

// Health state
const nodeHealth = new Map()
let roundRobinIndex = 0

function getHealthyNodes() {
  const now = Date.now()
  return FLEET_NODES.filter(node => {
    const health = nodeHealth.get(node.name)
    // Consider healthy if never checked or last failure > 60s ago
    if (!health) return true
    if (health.healthy) return true
    return (now - health.lastCheck) > 60000 // retry after 60s
  })
}

function findNodeWithModel(model) {
  const healthy = getHealthyNodes()
  // Find nodes that have this specific model
  const matching = healthy.filter(n => n.models.some(m => m === model || m.startsWith(model.split(':')[0])))
  if (matching.length > 0) {
    roundRobinIndex = (roundRobinIndex + 1) % matching.length
    return matching[roundRobinIndex]
  }
  // Fallback: any healthy node (use its default model)
  if (healthy.length > 0) {
    roundRobinIndex = (roundRobinIndex + 1) % healthy.length
    return healthy[roundRobinIndex]
  }
  return null
}

function selectNode(requestedModel) {
  if (requestedModel) {
    return findNodeWithModel(requestedModel)
  }
  // Round-robin across all healthy nodes
  const healthy = getHealthyNodes()
  if (healthy.length === 0) return null
  roundRobinIndex = (roundRobinIndex + 1) % healthy.length
  return healthy[roundRobinIndex]
}

async function invoke({ input, system, model: requestedModel }) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available')
  }

  const model = requestedModel || process.env.BLACKROAD_OLLAMA_MODEL || 'llama3.2:3b'
  const node = selectNode(model)

  if (!node) {
    throw new Error('No healthy Ollama nodes available')
  }

  const prompt = system ? `${system}\n\n${input}` : input

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120000) // 2 min timeout

    const response = await fetch(`${node.url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      nodeHealth.set(node.name, { healthy: false, lastCheck: Date.now(), error: data.error })
      throw new Error(data.error || `Ollama error ${response.status} on ${node.name}`)
    }

    // Mark healthy
    nodeHealth.set(node.name, { healthy: true, lastCheck: Date.now() })

    const result = typeof data.response === 'string' ? data.response
      : (data.message && typeof data.message.content === 'string') ? data.message.content
      : ''

    return { output: result, node: node.name, model }

  } catch (err) {
    nodeHealth.set(node.name, { healthy: false, lastCheck: Date.now(), error: err.message })

    // Try fallback to next node
    const fallbackNode = selectNode(model)
    if (fallbackNode && fallbackNode.name !== node.name) {
      try {
        const response = await fetch(`${fallbackNode.url}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: fallbackNode.models[0], prompt, stream: false }),
        })
        const data = await response.json().catch(() => ({}))
        if (response.ok && data.response) {
          nodeHealth.set(fallbackNode.name, { healthy: true, lastCheck: Date.now() })
          return { output: data.response, node: fallbackNode.name, model: fallbackNode.models[0], fallback: true }
        }
      } catch (e) {
        nodeHealth.set(fallbackNode.name, { healthy: false, lastCheck: Date.now(), error: e.message })
      }
    }

    throw err
  }
}

function getFleetStatus() {
  return FLEET_NODES.map(node => ({
    name: node.name,
    url: node.url,
    models: node.models,
    health: nodeHealth.get(node.name) || { healthy: true, lastCheck: null }
  }))
}

module.exports = {
  invoke,
  getFleetStatus,
  FLEET_NODES
}
