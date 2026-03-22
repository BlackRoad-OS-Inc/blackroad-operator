// API Provider layer - abstracts provider-specific APIs
export class ApiProvider {
  constructor(name, type, config) {
    this.name = name // 'BlackRoad AI'
    this.type = type // 'ollama', 'openai', 'anthropic', etc.
    this.config = config
    this.instances = [] // Multiple API instances
    this.roundRobinIndex = 0
  }

  addInstance(instance) {
    this.instances.push(instance)
  }

  getHealthyInstances() {
    return this.instances.filter(i => i.healthy)
  }

  async selectInstance(strategy = 'round-robin') {
    const healthy = this.getHealthyInstances()
    if (healthy.length === 0) return null

    switch (strategy) {
      case 'round-robin':
        return healthy[this.roundRobinIndex++ % healthy.length]
      case 'least-loaded':
        return healthy.reduce((a, b) => a.load < b.load ? a : b)
      case 'fastest':
        return healthy.reduce((a, b) => a.avgLatency < b.avgLatency ? a : b)
      default:
        return healthy[0]
    }
  }
}
