// Request intent classifier
import { readFile } from 'fs/promises'

export class RequestClassifier {
  constructor() {
    this.rules = null
  }

  async load() {
    const data = await readFile('./config/routing-rules.json', 'utf-8')
    this.rules = JSON.parse(data)
  }

  classify(request) {
    if (!this.rules) {
      throw new Error('Classifier not loaded')
    }

    const text = request.toLowerCase()
    let bestMatch = { intent: this.rules.default_intent, confidence: 0 }

    // Check each intent's keywords
    for (const [intent, config] of Object.entries(this.rules.intents)) {
      if (config.keywords.length === 0) continue

      let matches = 0
      for (const keyword of config.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          matches++
        }
      }

      const confidence = matches / config.keywords.length
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence }
      }
    }

    // If no strong match (< 30% confidence), use default
    if (bestMatch.confidence < 0.3) {
      bestMatch.intent = this.rules.default_intent
    }

    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      models: this.rules.intents[bestMatch.intent].models,
      description: this.rules.intents[bestMatch.intent].description
    }
  }
}
