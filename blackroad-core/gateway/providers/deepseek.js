// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
// DEPRECATED: External AI providers removed. BlackRoad is sovereign.
// All inference runs on local Ollama fleet. This file exists only for backwards compatibility.
'use strict'

const ollamaFleet = require('./ollama-fleet')

async function invoke(opts) {
  console.warn(`[SOVEREIGN] External provider "${__filename}" called — routing to local Ollama fleet`)
  return ollamaFleet.invoke(opts)
}

module.exports = { invoke }
