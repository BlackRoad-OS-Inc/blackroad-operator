// BlackRoad AI client (Ollama-powered)
// Ollama IS BlackRoad - this is the BlackRoad AI fleet
export class OllamaClient {
  constructor(endpoint = 'http://localhost:11434') {
    this.endpoint = endpoint
    this.timeout = 30000
    this.provider = 'BlackRoad AI (Ollama)'
  }

  async generate(model, prompt, options = {}) {
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          ...options
        }),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`BlackRoad AI error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        response: data.response,
        model,
        context: data.context,
        eval_count: data.eval_count,
        eval_duration: data.eval_duration
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model
      }
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`)
      if (!response.ok) return { success: false, models: [] }
      
      const data = await response.json()
      return {
        success: true,
        models: data.models.map(m => m.name)
      }
    } catch (error) {
      return { success: false, models: [], error: error.message }
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  async showModel(model) {
    try {
      const response = await fetch(`${this.endpoint}/api/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model })
      })
      
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }
}
