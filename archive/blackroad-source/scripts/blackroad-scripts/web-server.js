#!/usr/bin/env node
// BlackRoad Copilot Gateway - Web Dashboard
import express from 'express'
import { readFile } from 'fs/promises'
import { RouteEngine } from './layers/route-engine.js'
import { RequestClassifier } from './classifier.js'

const app = express()
const port = process.env.PORT || 3030

// Initialize components
const classifier = new RequestClassifier()
const routeEngine = new RouteEngine()

await classifier.load()
await routeEngine.initialize()

// Serve static HTML dashboard
app.get('/', async (req, res) => {
  const html = await readFile('./web/dashboard.html', 'utf-8')
  res.send(html)
})

// API: Health check all instances
app.get('/api/health', async (req, res) => {
  const health = await routeEngine.healthCheck()
  res.json({ success: true, instances: health })
})

// API: Gateway statistics
app.get('/api/stats', async (req, res) => {
  const stats = routeEngine.getStats()
  res.json({ success: true, stats })
})

// API: List models
app.get('/api/models', async (req, res) => {
  const models = routeEngine.registry.models.map(m => ({
    name: m.name,
    provider: m.provider,
    capabilities: m.capabilities,
    priority: m.priority,
    description: m.description
  }))
  res.json({ success: true, models })
})

// API: Recent routing decisions
app.get('/api/routing-history', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50
  const history = routeEngine.routingHistory.slice(-limit)
  res.json({ success: true, history })
})

// API: Test route (for testing without Copilot CLI)
app.post('/api/test-route', express.json(), async (req, res) => {
  try {
    const { prompt, intent } = req.body
    
    // Classify or use provided intent
    let classification
    if (intent) {
      const intentRule = classifier.rules.intents[intent]
      classification = {
        intent,
        confidence: 1.0,
        models: intentRule.models,
        description: intentRule.description
      }
    } else {
      classification = classifier.classify(prompt)
    }

    // Route through engine
    const result = await routeEngine.route(
      { prompt, options: {} },
      classification
    )

    res.json({
      success: true,
      routing: {
        intent: classification.intent,
        confidence: classification.confidence,
        model: result.model,
        provider: result.provider,
        instance: result.instance,
        latency: result.latency,
        load: result.load
      },
      response: result.response
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.listen(port, () => {
  console.log(`🌐 BlackRoad Copilot Gateway Web Dashboard`)
  console.log(`📊 Dashboard: http://localhost:${port}`)
  console.log(`🤖 BlackRoad AI endpoint: ${process.env.BLACKROAD_AI_ENDPOINT || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434'}`)
  console.log(`🗺️  Multi-layer routing active`)
})
