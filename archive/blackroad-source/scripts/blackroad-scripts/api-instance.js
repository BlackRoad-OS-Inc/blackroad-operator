// API Instance - represents a single API endpoint
export class ApiInstance {
  constructor(endpoint, provider) {
    this.endpoint = endpoint
    this.provider = provider
    this.healthy = true
    this.load = 0 // Active requests
    this.avgLatency = 0
    this.totalRequests = 0
    this.successfulRequests = 0
    this.lastHealthCheck = null
  }

  get successRate() {
    return this.totalRequests > 0 
      ? this.successfulRequests / this.totalRequests 
      : 0
  }

  recordRequest(latency, success) {
    this.totalRequests++
    if (success) this.successfulRequests++
    
    // Update average latency (exponential moving average)
    this.avgLatency = this.avgLatency * 0.9 + latency * 0.1
  }

  incrementLoad() {
    this.load++
  }

  decrementLoad() {
    this.load = Math.max(0, this.load - 1)
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`)
      this.healthy = response.ok
      this.lastHealthCheck = Date.now()
      return this.healthy
    } catch (error) {
      this.healthy = false
      this.lastHealthCheck = Date.now()
      return false
    }
  }
}
