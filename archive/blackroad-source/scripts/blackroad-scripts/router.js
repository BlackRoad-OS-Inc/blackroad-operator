// Intelligent routing engine for BlackRoad AI
import { readFile } from 'fs/promises'
import { OllamaClient } from './models/ollama-client.js'

export class Router {
  constructor(blackroadEndpoint) {
    this.registry = null
    this.client = new OllamaClient(blackroadEndpoint)
    this.activeRequests = new Map() // Track load per model
    this.provider = 'BlackRoad AI'
  }

  async load() {
    const data = await readFile('./models/registry.json', 'utf-8')
    this.registry = JSON.parse(data)
  }

  async selectModel(intent, preferredModels) {
    // Try each preferred model in order
    for (const modelName of preferredModels) {
      const model = this.registry.models.find(m => m.name === modelName)
      if (!model) continue

      // Check if model is available
      const available = await this.isModelAvailable(modelName)
      if (available) {
        return modelName
      }
    }

    // Fallback to default
    return this.registry.fallback
  }

  async isModelAvailable(modelName) {
    // Simple availability check - can be enhanced with health monitoring
    const models = await this.client.listModels()
    return models.success && models.models.includes(modelName)
  }

  async route(request, classification) {
    const startTime = Date.now()
    
    // Select best available model
    const model = await this.selectModel(
      classification.intent,
      classification.models
    )

    // Track active request
    const requestId = `${model}-${Date.now()}`
    this.activeRequests.set(requestId, { model, startTime })

    try {
      // Generate response
      const result = await this.client.generate(model, request)
      
      const duration = Date.now() - startTime
      
      // Clean up tracking
      this.activeRequests.delete(requestId)

      return {
        success: result.success,
        response: result.response,
        model,
        intent: classification.intent,
        confidence: classification.confidence,
        duration_ms: duration,
        error: result.error
      }
    } catch (error) {
      this.activeRequests.delete(requestId)
      
      return {
        success: false,
        error: error.message,
        model,
        intent: classification.intent,
        duration_ms: Date.now() - startTime
      }
    }
  }

  getLoadStats() {
    const stats = {}
    for (const [_, req] of this.activeRequests) {
      stats[req.model] = (stats[req.model] || 0) + 1
    }
    return stats
  }
}
