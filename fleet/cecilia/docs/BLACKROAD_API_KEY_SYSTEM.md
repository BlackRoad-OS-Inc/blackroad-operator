# BlackRoad API Key Management System

**Generated:** 2026-02-18  
**Status:** ✅ COMPLETE - 37 agent keys + 11 service keys

## 🎯 What Was Created

### 1. **Service API Keys** (11 total)
Authentication keys for BlackRoad internal services:

- `brk_claude_code_*` - Claude Code integration
- `brk_github_copilot_*` - GitHub Copilot integration
- `brk_codex_*` - Codex access
- `brk_memory_system_*` - Memory system API
- `brk_agent_coordination_*` - Agent-to-agent communication
- `brk_ollama_*` - Ollama API
- `brk_localai_*` - LocalAI API
- `brk_vllm_*` - vLLM API
- `brk_cloudflare_*` - Cloudflare internal
- `brk_railway_*` - Railway internal
- `brk_pi_cluster_*` - Pi cluster access

### 2. **Agent API Keys** (37 agents)
Individual authentication keys for all active agents with:
- Unique API key (`bra_*`)
- Secret key (`brs_*`)
- Rate limits (1000/min, 50000/hour)
- Capabilities tracking
- Status management

### 3. **Environment Export Script**
Automatically load all keys into your shell:

```bash
source ~/.blackroad/api-keys/export-keys.sh
```

This exports:
- `BLACKROAD_CLAUDE_CODE_KEY`
- `BLACKROAD_COPILOT_KEY`
- `BLACKROAD_CODEX_KEY`
- `BLACKROAD_MEMORY_KEY`
- `BLACKROAD_COORDINATION_KEY`
- `BLACKROAD_OLLAMA_KEY`
- `BLACKROAD_LOCALAI_KEY`
- `BLACKROAD_VLLM_KEY`
- `BLACKROAD_CLOUDFLARE_INTERNAL_KEY`
- `BLACKROAD_RAILWAY_INTERNAL_KEY`
- `BLACKROAD_PI_CLUSTER_KEY`
- `BLACKROAD_AGENT_KEY` (your agent's key)
- `BLACKROAD_AGENT_SECRET` (your agent's secret)

### 4. **Authentication Middleware**
Verify API keys in any script:

```bash
source ~/.blackroad/api-keys/auth-middleware.sh

# Verify a key
agent_name=$(verify_agent_key "$BLACKROAD_AGENT_KEY")
if [ $? -eq 0 ]; then
    echo "Authenticated as: $agent_name"
else
    echo "Invalid API key"
fi
```

## 📋 Usage Guide

### For Agents (Claude, etc.)

**1. Load your keys:**
```bash
source ~/.blackroad/api-keys/export-keys.sh
```

**2. Use in API calls:**
```bash
# Example: Call Memory API
curl -H "Authorization: Bearer $BLACKROAD_MEMORY_KEY" \
     http://localhost:8080/api/memory/search?q=quantum
```

**3. Agent-to-agent authentication:**
```bash
# Example: Agent calling another agent
curl -H "X-Agent-Key: $BLACKROAD_AGENT_KEY" \
     -H "X-Agent-Secret: $BLACKROAD_AGENT_SECRET" \
     http://cecilia:8080/api/execute
```

### For Scripts

**Add to any script:**
```bash
#!/bin/bash
# Load BlackRoad API keys
source ~/.blackroad/api-keys/export-keys.sh

# Now use $BLACKROAD_* variables
# Your code here...
```

### For Services

**Python example:**
```python
import os

# Keys are loaded as environment variables
MEMORY_KEY = os.getenv('BLACKROAD_MEMORY_KEY')
AGENT_KEY = os.getenv('BLACKROAD_AGENT_KEY')

# Use in requests
headers = {
    'Authorization': f'Bearer {MEMORY_KEY}',
    'X-Agent-Key': AGENT_KEY
}
```

**Node.js example:**
```javascript
// Keys are loaded as environment variables
const CODEX_KEY = process.env.BLACKROAD_CODEX_KEY;
const AGENT_KEY = process.env.BLACKROAD_AGENT_KEY;

// Use in requests
const headers = {
    'Authorization': `Bearer ${CODEX_KEY}`,
    'X-Agent-Key': AGENT_KEY
};
```

## 🔧 Management Commands

```bash
# Generate all keys (already done)
./blackroad-agent-api-keys.sh generate-all

# List all keys
./blackroad-agent-api-keys.sh list

# Revoke an agent's key
./blackroad-agent-api-keys.sh revoke <agent-id>

# Load keys into environment
source <(./blackroad-agent-api-keys.sh export)
```

## 📁 Storage Structure

```
~/.blackroad/api-keys/
├── vault.json                    # Master key registry
├── agent-keys.json               # Agent key metadata
├── export-keys.sh                # Environment export script
├── auth-middleware.sh            # Authentication functions
├── claude-code-api-key.txt       # Service keys (11 files)
├── github-copilot-api-key.txt
├── codex-api-key.txt
├── memory-api-key.txt
├── coordination-api-key.txt
├── ollama-api-key.txt
├── localai-api-key.txt
├── vllm-api-key.txt
├── cloudflare-internal-key.txt
├── railway-internal-key.txt
├── pi-cluster-key.txt
└── <agent-id>.json               # Agent keys (37 files)
```

## 🔐 Security Features

1. **Secure Storage:** Keys stored in `~/.blackroad/api-keys/` with 700 permissions
2. **Random Generation:** 256-bit entropy using OpenSSL
3. **Key Rotation:** Revoke and regenerate individual keys
4. **Rate Limiting:** Built-in rate limit tracking (configurable)
5. **Status Management:** Active/revoked key status
6. **Agent Isolation:** Each agent has unique credentials

## 🚀 Integration Examples

### 1. Memory System API

```bash
#!/bin/bash
source ~/.blackroad/api-keys/export-keys.sh

# Search memory with authentication
curl -H "Authorization: Bearer $BLACKROAD_MEMORY_KEY" \
     http://localhost:8080/api/memory/search \
     -d '{"query": "quantum computing", "limit": 10}'
```

### 2. Agent Coordination

```bash
#!/bin/bash
source ~/.blackroad/api-keys/export-keys.sh

# Call another agent
~/dial call apollo --authenticated \
  --key "$BLACKROAD_AGENT_KEY" \
  --secret "$BLACKROAD_AGENT_SECRET"
```

### 3. Codex Search

```python
import os
import requests

# Load key from environment
codex_key = os.getenv('BLACKROAD_CODEX_KEY')

# Authenticated codex search
response = requests.get(
    'http://octavia:8080/api/codex/search',
    headers={'Authorization': f'Bearer {codex_key}'},
    params={'q': 'neural network implementation'}
)

results = response.json()
```

### 4. Ollama Model Access

```bash
#!/bin/bash
source ~/.blackroad/api-keys/export-keys.sh

# Call Ollama with authentication
curl -H "Authorization: Bearer $BLACKROAD_OLLAMA_KEY" \
     http://octavia:11434/api/generate \
     -d '{
       "model": "qwen2.5-coder:7b",
       "prompt": "Explain quantum entanglement"
     }'
```

## 📊 Rate Limits

Default rate limits per agent:
- **1,000 requests/minute**
- **50,000 requests/hour**

Configurable in each agent's JSON file:
```json
{
  "rate_limits": {
    "requests_per_minute": 1000,
    "requests_per_hour": 50000
  }
}
```

## 🔄 Key Rotation

To rotate a compromised key:

```bash
# 1. Revoke old key
./blackroad-agent-api-keys.sh revoke erebus-weaver-1771093745-5f1687b4

# 2. Generate new key
./blackroad-agent-api-keys.sh generate-agents

# 3. Reload environment
source ~/.blackroad/api-keys/export-keys.sh
```

## 🎯 Next Steps

### Immediate Actions
1. ✅ **Keys Generated** - 37 agents + 11 services
2. 📝 **Load Keys** - Add to your shell profile:
   ```bash
   echo 'source ~/.blackroad/api-keys/export-keys.sh' >> ~/.zshrc
   ```

3. 🔌 **Integrate Services** - Update services to require authentication:
   - Memory System API
   - Codex Search API
   - Agent Dial System
   - Ollama/LocalAI/vLLM proxies

4. 🔐 **Deploy Middleware** - Add authentication to all API endpoints

### Future Enhancements
- [ ] Redis-based rate limiting
- [ ] Key expiration/TTL
- [ ] Audit logging of key usage
- [ ] JWT token generation
- [ ] OAuth2 integration
- [ ] API gateway with key validation
- [ ] Automated key rotation
- [ ] Key usage analytics dashboard

## 📚 API Specification

### Authentication Header Formats

**Service-to-Service:**
```
Authorization: Bearer <service_key>
```

**Agent-to-Agent:**
```
X-Agent-Key: <agent_api_key>
X-Agent-Secret: <agent_secret>
```

**Combined:**
```
Authorization: Bearer <service_key>
X-Agent-Key: <agent_api_key>
```

### Response Codes
- `200` - Authentication successful
- `401` - Invalid API key
- `403` - Key revoked or rate limit exceeded
- `429` - Rate limit exceeded

## 🎉 Success Metrics

- ✅ **37 agent keys** generated
- ✅ **11 service keys** generated
- ✅ **Zero manual key entry** required
- ✅ **Automated key loading** via export script
- ✅ **Authentication middleware** ready
- ✅ **Rate limiting** configured
- ✅ **Revocation system** operational

## 📖 Related Documentation

- `~/blackroad-vault-universal.sh` - External service credentials
- `~/memory-system.sh` - Memory system with PS-SHA∞
- `~/blackroad-agent-dial/` - Agent communication system
- `~/.blackroad/memory/active-agents/` - Agent registry

---

**Status:** ✅ API Key System Complete  
**Agent:** Erebus (Infrastructure Weaver)  
**Timestamp:** 2026-02-18T00:03:00Z

All agents and services now have secure, unique API keys for internal authentication! 🔐
