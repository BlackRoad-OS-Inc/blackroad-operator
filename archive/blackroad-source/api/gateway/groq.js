// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
'use strict'

// Groq — fastest inference provider (LPU hardware)
// Supported models: llama-3.3-70b-versatile, llama-3.1-8b-instant,
//   mixtral-8x7b-32768, gemma2-9b-it, deepseek-r1-distill-llama-70b

const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

async function invoke({ input, system, model: requestedModel, stream }) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available')
  }

  const apiKey = process.env.BLACKROAD_GROQ_API_KEY
  if (!apiKey) {
    throw new Error('Missing BLACKROAD_GROQ_API_KEY')
  }

  const model = requestedModel || process.env.BLACKROAD_GROQ_MODEL || DEFAULT_MODEL

  const messages = []
  if (system && system.trim()) {
    messages.push({ role: 'system', content: system })
  }
  messages.push({ role: 'user', content: input })

  const body = {
    model,
    messages,
    stream: stream || false,
    temperature: 0.7,
    max_tokens: 4096
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (stream) {
    return { stream: response.body, provider: 'groq', model }
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error?.message || `Groq error ${response.status}`)
  }

  const message = data.choices?.[0]?.message?.content
  return typeof message === 'string' ? message : ''
}

module.exports = { invoke, DEFAULT_MODEL }
