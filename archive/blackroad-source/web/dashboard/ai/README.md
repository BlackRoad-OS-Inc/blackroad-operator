# BlackRoad AI Dashboard

[![CI](https://github.com/blackboxprogramming/blackroad-ai-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/blackboxprogramming/blackroad-ai-dashboard/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://typescriptlang.org)
[![Ollama](https://img.shields.io/badge/Ollama-fleet-FF6B2B.svg)](https://ollama.ai)



Real-time monitoring and chat interface for AI agents running across the BlackRoad Pi cluster. Built with Next.js and TypeScript.

## Agents

| Team | Device | Agents |
|------|--------|--------|
| Infrastructure | Lucidia | Lucidia (Systems Lead), Marcus (PM), Viktor (Dev), Sophia (Data) |
| Creative | Cecilia | CECE (Creative Lead), Luna (UX), Dante (Backend) |
| Coding | Aria | Aria-Prime (Code), Aria-Tiny (Quick Response) |

## Features

- Live agent status across 3 Pi nodes
- Chat interface with each agent
- Team-based organization
- Dark theme UI

## Development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
# Deploys to Cloudflare Pages
```

## Stack

- Next.js 14, TypeScript, React
- Cloudflare Pages

## License

Copyright 2026 BlackRoad OS, Inc. All rights reserved.

## Related Projects

| Project | Description |
|---------|-------------|
| [BlackRoad Operating System](https://github.com/blackboxprogramming/BlackRoad-Operating-System) | Edge computing OS for Pi fleet |
| [BlackRoad Desktop App](https://github.com/blackboxprogramming/blackroad-desktop-app) | Electron app for fleet management |
| [BlackRoad Chrome Extension](https://github.com/blackboxprogramming/blackroad-chrome-extension) | Browser extension for fleet monitoring |
| [Lucidia](https://github.com/blackboxprogramming/lucidia) | Autonomous AI agent with persistent memory |
