// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// SOVEREIGN AI ONLY — No external API dependencies.
// All inference runs on local Ollama fleet. No OpenAI, no Anthropic, no Google, no xAI, no Groq.
'use strict'

const ollama = require('./ollama')
const ollamaFleet = require('./ollama-fleet')

const providers = {
  ollama,
  'ollama-fleet': ollamaFleet,
  // Aliases — all route to local Ollama
  local: ollama,
  fleet: ollamaFleet,
  default: ollamaFleet,
}

function getProvider(name) {
  return providers[name || 'default'] || ollamaFleet
}

module.exports = {
  getProvider
}
