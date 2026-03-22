# 🔑 BlackRoad API Keys - Quick Reference

## ⚡ Quick Start (3 commands)

```bash
# 1. Load all keys into your environment
source ~/.blackroad/api-keys/export-keys.sh

# 2. Verify keys are loaded
echo $BLACKROAD_AGENT_KEY

# 3. List all keys
~/blackroad-agent-api-keys.sh list
```

## 📋 Available Keys

### Service Keys (11)
```bash
$BLACKROAD_CLAUDE_CODE_KEY        # Claude Code integration
$BLACKROAD_COPILOT_KEY            # GitHub Copilot
$BLACKROAD_CODEX_KEY              # Codex search
$BLACKROAD_MEMORY_KEY             # Memory system API
$BLACKROAD_COORDINATION_KEY       # Agent coordination
$BLACKROAD_OLLAMA_KEY             # Ollama API
$BLACKROAD_LOCALAI_KEY            # LocalAI API
$BLACKROAD_VLLM_KEY               # vLLM API
$BLACKROAD_CLOUDFLARE_INTERNAL_KEY # Cloudflare internal
$BLACKROAD_RAILWAY_INTERNAL_KEY   # Railway internal
$BLACKROAD_PI_CLUSTER_KEY         # Pi cluster
```

### Agent Keys (Your Identity)
```bash
$BLACKROAD_AGENT_KEY              # Your API key
$BLACKROAD_AGENT_SECRET           # Your secret
```

## 🎯 Common Use Cases

### 1. Call Memory API
```bash
curl -H "Authorization: Bearer $BLACKROAD_MEMORY_KEY" \
     http://localhost:8080/api/memory/search?q=quantum
```

### 2. Authenticate Agent-to-Agent
```bash
curl -H "X-Agent-Key: $BLACKROAD_AGENT_KEY" \
     -H "X-Agent-Secret: $BLACKROAD_AGENT_SECRET" \
     http://cecilia:8080/api/execute
```

### 3. Search Codex
```bash
curl -H "Authorization: Bearer $BLACKROAD_CODEX_KEY" \
     http://octavia:8080/api/codex/search?q=neural
```

### 4. Ollama Model Call
```bash
curl -H "Authorization: Bearer $BLACKROAD_OLLAMA_KEY" \
     http://octavia:11434/api/generate \
     -d '{"model":"qwen2.5-coder:7b","prompt":"Hello"}'
```

## 🔧 Management

```bash
# Generate all keys (already done)
~/blackroad-agent-api-keys.sh generate-all

# List all keys
~/blackroad-agent-api-keys.sh list

# Revoke a key
~/blackroad-agent-api-keys.sh revoke <agent-id>

# Load into environment
source ~/.blackroad/api-keys/export-keys.sh
```

## 📁 Storage Location

```
~/.blackroad/api-keys/
├── export-keys.sh              # Source this file
├── auth-middleware.sh          # Authentication functions
├── vault.json                  # Master registry
├── <service>-api-key.txt       # 11 service keys
└── <agent-id>.json             # 37 agent keys
```

## 🔐 Security

- **Permissions:** 700 on ~/.blackroad/api-keys/
- **Entropy:** 256-bit random keys
- **Rate Limits:** 1000/min, 50000/hour
- **Revocation:** Individual key revocation
- **Status:** Active/revoked tracking

## ⚡ Add to Shell Profile

```bash
# Add to ~/.zshrc or ~/.bashrc
source ~/.blackroad/api-keys/export-keys.sh
```

## 📚 Full Documentation

See: `~/BLACKROAD_API_KEY_SYSTEM.md`

---

**Generated:** 2026-02-18  
**Agent:** Erebus (Infrastructure Weaver)  
**Status:** ✅ 37 agents + 11 services authenticated
