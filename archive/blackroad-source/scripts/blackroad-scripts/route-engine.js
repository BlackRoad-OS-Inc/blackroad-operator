// Route Engine - orchestrates the complete routing flow
import { ApiMap } from './api-map.js'
import { readFile } from 'fs/promises'
import { OllamaClient } from '../models/ollama-client.js'

export class RouteEngine {
  constructor() {
    this.apiMap = new ApiMap()
    this.registry = null
    this.routingHistory = []
  }

  async initialize() {
    // Load model registry
    const data = await readFile('./models/registry.json', 'utf-8')
    this.registry = JSON.parse(data)

    // Register BlackRoad AI provider
    this.apiMap.registerProvider(
      'BlackRoad AI',
      'ollama',
      { type: 'ollama', version: '0.1.0' }
    )

    // Add instances (can add multiple for load balancing)
    const endpoints = [
      process.env.BLACKROAD_AI_ENDPOINT || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
      // Add more instances: 'http://cecilia:11434', 'http://lucidia:11434', etc.
    ]

    for (const endpoint of endpoints) {
      this.apiMap.addInstance('BlackRoad AI', endpoint)
    }

    // Map all models to BlackRoad AI provider
    for (const model of this.registry.models) {
      this.apiMap.mapModel(model.name, 'BlackRoad AI')
    }

    console.error(`🗺️  Route engine initialized with ${endpoints.length} instance(s)`)
  }

  async route(request, classification) {
    const startTime = Date.now()
    
    // Step 1: Select best model based on classification
    const modelName = await this.selectModel(classification)
    
    // Step 2-7: Model name -> API -> Provider -> Instance -> Route -> BlackRoad
    const resolution = await this.apiMap.resolveModel(modelName, 'least-loaded')
    
    // Step 8: Execute request
    const instance = resolution.instance
    const client = new OllamaClient(instance)
    
    // Track load
    const provider = this.apiMap.providers.get(resolution.provider)
    const apiInstance = provider.instances.find(i => i.endpoint === instance)
    apiInstance.incrementLoad()

    try {
      const result = await client.generate(modelName, request.prompt, request.options)
      const latency = Date.now() - startTime
      
      // Record success
      apiInstance.recordRequest(latency, result.success)
      apiInstance.decrementLoad()

      // Log routing decision
      this.logRoute({
        timestamp: new Date().toISOString(),
        request: request.prompt.substring(0, 100),
        intent: classification.intent,
        confidence: classification.confidence,
        modelSelected: modelName,
        provider: resolution.provider,
        instance: resolution.instance,
        latency,
        success: result.success
      })

      return {
        success: result.success,
        model: modelName,
        provider: resolution.provider,
        instance: resolution.instance,
        response: result.response,
        latency,
        load: resolution.load
      }
    } catch (error) {
      const latency = Date.now() - startTime
      apiInstance.recordRequest(latency, false)
      apiInstance.decrementLoad()

      // Log failure
      this.logRoute({
        timestamp: new Date().toISOString(),
        request: request.prompt.substring(0, 100),
        intent: classification.intent,
        modelSelected: modelName,
        provider: resolution.provider,
        instance: resolution.instance,
        latency,
        success: false,
        error: error.message
      })

      throw error
    }
  }

  async selectModel(classification) {
    // Try each preferred model in order
    for (const modelName of classification.models) {
      const model = this.registry.models.find(m => m.name === modelName)
      if (!model) continue

      // Check if model is available
      try {
        await this.apiMap.resolveModel(modelName)
        return modelName
      } catch (error) {
        continue // Try next model
      }
    }

    // Fallback to default
    return this.registry.fallback
  }

  logRoute(decision) {
    this.routingHistory.push(decision)
    
    // Keep last 1000 decisions in memory
    if (this.routingHistory.length > 1000) {
      this.routingHistory.shift()
    }
  }

  getStats() {
    const apiStats = this.apiMap.getStats()
    
    return {
      ...apiStats,
      totalRoutes: this.routingHistory.length,
      recentRoutes: this.routingHistory.slice(-10)
    }
  }

  async healthCheck() {
    return await this.apiMap.healthCheck()
  }
}
