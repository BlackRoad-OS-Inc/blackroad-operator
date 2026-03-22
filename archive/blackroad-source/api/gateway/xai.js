// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
'use strict'

// xAI / Grok — Elon's reasoning model
// API is OpenAI-compatible at api.x.ai

const DEFAULT_MODEL = 'grok-3'

async function invoke({ input, system, model: requestedModel, stream }) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available')
  }

  const apiKey = process.env.BLACKROAD_XAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing BLACKROAD_XAI_API_KEY')
  }

  const model = requestedModel || process.env.BLACKROAD_XAI_MODEL || DEFAULT_MODEL

  const messages = []
  if (system && system.trim()) {
    messages.push({ role: 'system', content: system })
  }
  messages.push({ role: 'user', content: input })

  const body = {
    model,
    messages,
    stream: stream || false,
    temperature: 0.7
  }

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (stream) {
    return { stream: response.body, provider: 'xai', model }
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error?.message || `xAI error ${response.status}`)
  }

  const message = data.choices?.[0]?.message?.content
  return typeof message === 'string' ? message : ''
}

module.exports = { invoke, DEFAULT_MODEL }
