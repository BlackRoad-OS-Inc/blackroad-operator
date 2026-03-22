# BlackRoad API SDKs

Official client libraries for the BlackRoad OS platform. Python, JavaScript, and Go.

## Install

```bash
# Python
pip install ./python

# JavaScript
npm install ./javascript

# Go
go get github.com/blackboxprogramming/blackroad-api-sdks/go
```

## Quick Start

### Python

```python
from blackroad import BlackRoad

br = BlackRoad()

# Fleet status
status = br.fleet.status()

# Post to Slack
br.slack.post("deploy complete")

# AI inference (requires Ollama access)
response = br.ai.generate("qwen2.5:7b", "explain edge computing in one sentence")
```

### JavaScript

```javascript
const { BlackRoad } = require('@blackroad/sdk')

const br = new BlackRoad()

// Fleet status
const status = await br.fleet.status()

// Post to Slack
await br.slack.post('deploy complete')

// AI inference
const response = await br.ai.generate('qwen2.5:7b', 'explain edge computing')
```

### Go

```go
package main

import (
    "fmt"
    blackroad "github.com/blackboxprogramming/blackroad-api-sdks/go"
)

func main() {
    client := blackroad.New()

    status, _ := client.Fleet.Status()
    fmt.Println(status)

    client.Slack.Post("deploy complete")
}
```

## API Reference

### Fleet

| Method | Endpoint | Description |
|--------|----------|-------------|
| `fleet.status()` | GET /fleet | All node status (temp, disk, RAM, uptime) |
| `fleet.all()` | GET /all | Full data: infra, GitHub, analytics |
| `fleet.health()` | GET /health | Stats API health check |

### Slack

| Method | Endpoint | Description |
|--------|----------|-------------|
| `slack.post(text)` | POST /post | Post to default channel |
| `slack.alert(text)` | POST /alert | Post alert |
| `slack.deploy(text)` | POST /deploy | Deploy notification |
| `slack.status()` | GET /status | Hub status |

### AI (requires Ollama gateway access)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `ai.generate(model, prompt)` | POST /api/generate | Text generation |
| `ai.chat(model, messages)` | POST /api/chat | Chat completion |
| `ai.embed(model, input)` | POST /api/embed | Embeddings |
| `ai.models()` | GET /api/tags | List available models |

## Live Endpoints

| Service | URL |
|---------|-----|
| Stats API | `stats-blackroad.amundsonalexa.workers.dev` |
| Slack Hub | `blackroad-slack.amundsonalexa.workers.dev` |
| Ollama (local) | `localhost:11434` |

## Structure

```
blackroad-api-sdks/
  python/
    blackroad.py      # SDK source
    pyproject.toml    # Package config
  javascript/
    index.js          # SDK source
    package.json      # Package config
  go/
    blackroad.go      # SDK source
    go.mod            # Module config
```

## License

Copyright 2024-2026 BlackRoad OS, Inc. All rights reserved. See LICENSE.

---

BlackRoad OS -- Pave Tomorrow.
