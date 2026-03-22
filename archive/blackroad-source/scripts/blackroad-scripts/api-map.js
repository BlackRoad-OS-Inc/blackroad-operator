// API Map - maps model names to provider instances
import { ApiProvider } from './api-provider.js'
import { ApiInstance } from './api-instance.js'

export class ApiMap {
  constructor() {
    this.providers = new Map() // provider name -> ApiProvider
    this.modelMap = new Map()  // model name -> provider name
  }

  registerProvider(name, type, config) {
    const provider = new ApiProvider(name, type, config)
    this.providers.set(name, provider)
    return provider
  }

  addInstance(providerName, endpoint) {
    const provider = this.providers.get(providerName)
    if (!provider) {
      throw new Error(`Provider ${providerName} not registered`)
    }

    const instance = new ApiInstance(endpoint, provider)
    provider.addInstance(instance)
    return instance
  }

  mapModel(modelName, providerName) {
    this.modelMap.set(modelName, providerName)
  }

  async resolveModel(modelName, strategy = 'least-loaded') {
    // Step 1: Model name -> Provider
    const providerName = this.modelMap.get(modelName)
    if (!providerName) {
      throw new Error(`No provider mapped for model: ${modelName}`)
    }

    // Step 2: Provider -> Provider instance
    const provider = this.providers.get(providerName)
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`)
    }

    // Step 3: Select API instance
    const instance = await provider.selectInstance(strategy)
    if (!instance) {
      throw new Error(`No healthy instances for provider: ${providerName}`)
    }

    return {
      modelName,
      provider: providerName,
      instance: instance.endpoint,
      load: instance.load,
      latency: instance.avgLatency,
      successRate: instance.successRate
    }
  }

  async healthCheck() {
    const results = []
    for (const [name, provider] of this.providers) {
      for (const instance of provider.instances) {
        const healthy = await instance.checkHealth()
        results.push({
          provider: name,
          endpoint: instance.endpoint,
          healthy,
          load: instance.load,
          avgLatency: instance.avgLatency,
          successRate: instance.successRate
        })
      }
    }
    return results
  }

  getStats() {
    const stats = {
      providers: this.providers.size,
      models: this.modelMap.size,
      instances: 0,
      healthyInstances: 0,
      totalLoad: 0,
      avgLatency: 0
    }

    for (const provider of this.providers.values()) {
      stats.instances += provider.instances.length
      const healthy = provider.getHealthyInstances()
      stats.healthyInstances += healthy.length
      
      for (const instance of provider.instances) {
        stats.totalLoad += instance.load
        stats.avgLatency += instance.avgLatency
      }
    }

    if (stats.instances > 0) {
      stats.avgLatency = stats.avgLatency / stats.instances
    }

    return stats
  }
}
