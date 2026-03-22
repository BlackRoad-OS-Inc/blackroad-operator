// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
'use strict'

// DeepSeek — advanced reasoning models (R1, V3, Coder)
// API is OpenAI-compatible

const DEFAULT_MODEL = 'deepseek-chat'

async function invoke({ input, system, model: requestedModel, stream }) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available')
  }

  const apiKey = process.env.BLACKROAD_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('Missing BLACKROAD_DEEPSEEK_API_KEY')
  }

  const model = requestedModel || process.env.BLACKROAD_DEEPSEEK_MODEL || DEFAULT_MODEL

  const messages = []
  if (system && system.trim()) {
    messages.push({ role: 'system', content: system })
  }
  messages.push({ role: 'user', content: input })

  const body = {
    model,
    messages,
    stream: stream || false,
    max_tokens: 8192,
    temperature: 0.7
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (stream) {
    return { stream: response.body, provider: 'deepseek', model }
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error?.message || `DeepSeek error ${response.status}`)
  }

  const message = data.choices?.[0]?.message?.content
  return typeof message === 'string' ? message : ''
}

module.exports = { invoke, DEFAULT_MODEL }
