# MEMORY BRIEF (2026-03-22T02:26:39.666923Z)

- Repo: `/Users/alexa/blackroad-operator`
- Session: `f828fdc8-e221-4949-8b8e-b3343f0e8e19`  Command: `start`
- Branch: `main`  Dirty: `True`
- Last commit: `05bf17b8b` — security: remove hardcoded credentials and clean up .bak files (2026-03-16 17:52:35 -0500)

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
- <div align="center">
- <img src="https://images.blackroad.io/pixel-art/road-logo.png" alt="BlackRoad OS" width="80" />
- # BlackRoad Operator
- **CLI tooling and operational control for the BlackRoad OS fleet.**
- [![BlackRoad OS](https://img.shields.io/badge/BlackRoad_OS-Pave_Tomorrow-FF2255?style=for-the-badge&labelColor=000000)](https://blackroad.io)
- </div>
- ---
- ## Overview
- The operator monorepo contains:
- - **TypeScript CLI** (`src/`) — `br` command with 8 subcommands
- - **Shell CLI** (`br` at root) — 90 tool scripts in `tools/`
- - **MCP Bridge** — FastAPI server for remote AI agent access
