# MEMORY BRIEF (2026-03-29T04:19:10.551870Z)

- Repo: `/Users/alexa/blackroad-operator`
- Session: `56117b81-6186-4212-a0b1-4cf7620066b2`  Command: `start`
- Branch: `main`  Dirty: `True`
- Last commit: `d7b01fe8f` — fix(workflows): stabilize scheduled automation on hosted runners (2026-03-26 15:51:59 -0500)

## Allowlisted file highlights
### AGENTS.md (TODO/FIXME: 0)
- # BlackRoad OS Agents
- > Complete guide to the AI agents in BlackRoad OS
- ---
- ## 📋 Table of Contents
- - [Overview](#overview)
- - [Core Agents](#core-agents)
- - [Agent Architecture](#agent-architecture)
- - [Agent Communication](#agent-communication)
- - [Creating Custom Agents](#creating-custom-agents)
- - [Agent Configuration](#agent-configuration)
- - [Agent Lifecycle](#agent-lifecycle)
- - [Best Practices](#best-practices)

### README.md (TODO/FIXME: 0)
- # BlackRoad Operator
- The local control plane for BlackRoad OS. This repo runs websites, workflows, Pi fleet operations, health checks, Cloudflare tasks, and Ollama-driven agent automation.
- ## Start Here
- ```bash
- cd /Users/alexa/blackroad-operator
- # Human-first CLI
- ./br health
- ./br pi status
- ./br ai chat
- # Ollama-first control plane
- ./tools/ai/br-ai.sh ops "check the Pi fleet and list available models"
- ./tools/ai/br-ai.sh autonomous "regenerate public sites and report what changed"
