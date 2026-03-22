// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
'use strict'

// Together AI — open model hosting (Llama, Qwen, DeepSeek, Mixtral, etc.)
// 200+ models available at: https://api.together.xyz/v1

const DEFAULT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo'

async function invoke({ input, system, model: requestedModel, stream }) {
  if (typeof fetch !== 'function') {
    throw new Error('Global fetch is not available')
  }

  const apiKey = process.env.BLACKROAD_TOGETHER_API_KEY
  if (!apiKey) {
    throw new Error('Missing BLACKROAD_TOGETHER_API_KEY')
  }

  const model = requestedModel || process.env.BLACKROAD_TOGETHER_MODEL || DEFAULT_MODEL

  const messages = []
  if (system && system.trim()) {
    messages.push({ role: 'system', content: system })
  }
  messages.push({ role: 'user', content: input })

  const body = {
    model,
    messages,
    stream: stream || false,
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.1
  }

  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  })

  if (stream) {
    return { stream: response.body, provider: 'together', model }
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error?.message || `Together error ${response.status}`)
  }

  const message = data.choices?.[0]?.message?.content
  return typeof message === 'string' ? message : ''
}

module.exports = { invoke, DEFAULT_MODEL }
