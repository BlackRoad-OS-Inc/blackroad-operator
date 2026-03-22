/**
 * BlackRoad OS JavaScript/Node.js SDK
 *
 * Connect to BlackRoad fleet, AI inference, stats, and Slack hub.
 *
 *   const { BlackRoad } = require('@blackroad/sdk')
 *   const br = new BlackRoad()
 *   const status = await br.fleet.status()
 *   await br.slack.post('hello from node')
 */

class BlackRoad {
  constructor(opts = {}) {
    this.statsUrl = (opts.statsUrl || 'https://stats-blackroad.amundsonalexa.workers.dev').replace(/\/$/, '')
    this.slackUrl = (opts.slackUrl || 'https://blackroad-slack.amundsonalexa.workers.dev').replace(/\/$/, '')
    this.gatewayUrl = (opts.gatewayUrl || 'http://localhost:11434').replace(/\/$/, '')

    this.fleet = {
      status: () => this._get(`${this.statsUrl}/fleet`),
      all: () => this._get(`${this.statsUrl}/all`),
      health: () => this._get(`${this.statsUrl}/health`),
    }

    this.slack = {
      post: (text) => this._post(`${this.slackUrl}/post`, { text }),
      alert: (text) => this._post(`${this.slackUrl}/alert`, { text }),
      deploy: (text) => this._post(`${this.slackUrl}/deploy`, { text }),
      status: () => this._get(`${this.slackUrl}/status`),
    }

    this.ai = {
      generate: (model, prompt) => this._post(`${this.gatewayUrl}/api/generate`, { model, prompt, stream: false }),
      chat: (model, messages) => this._post(`${this.gatewayUrl}/api/chat`, { model, messages, stream: false }),
      embed: (model, input) => this._post(`${this.gatewayUrl}/api/embed`, { model, input }),
      models: () => this._get(`${this.gatewayUrl}/api/tags`),
    }
  }

  async _get(url) {
    const resp = await fetch(url)
    return resp.json()
  }

  async _post(url, data) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return resp.json()
  }
}

module.exports = { BlackRoad }
