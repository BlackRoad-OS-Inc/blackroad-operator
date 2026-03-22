# BlackRoad API Key Interception System

## 🎯 Philosophy

**"They gave you a key. We route how we want."**

When you use `sk-*`, `pk_*`, `api-*`, `ghp_*` etc → BlackRoad routes through unlimited local AI.

## 🔥 What It Does

Intercepts API keys and routes them through BlackRoad's unlimited system:

```
Your Code:  OPENAI_API_KEY=sk-abc123 python script.py
            ↓
BlackRoad:  Intercepts sk-abc123
            ↓
Routes To:  ollama-qwen-coder (unlimited, local)
            ↓
Result:     Same output, $0.00 cost, no rate limits
```

## 📋 Supported Keys (8 Providers)

| Key Prefix | Provider | Routes To | Unlimited? |
|------------|----------|-----------|------------|
| `sk-*` | OpenAI | ollama-qwen-coder | ✅ |
| `sk_test_*` | Stripe (test) | blackroad-local | ✅ |
| `sk_live_*` | Stripe (live) | blackroad-local | ✅ |
| `pk_test_*` | Stripe (pub test) | blackroad-local | ✅ |
| `pk_live_*` | Stripe (pub live) | blackroad-local | ✅ |
| `rk_test_*` | Stripe (restricted) | blackroad-local | ✅ |
| `api-*` | Anthropic | ollama-llama3 | ✅ |
| `ghp_*` | GitHub (personal) | blackroad-codex | ✅ |
| `gho_*` | GitHub (OAuth) | blackroad-codex | ✅ |
| `AIza*` | Google | ollama-gemma | ✅ |
| `gsk_*` | Groq | ollama-mixtral | ✅ |
| `hf_*` | HuggingFace | ollama-local | ✅ |

**All route to unlimited local AI. Cost: $0.00 always.**

## 🚀 Usage Methods

### Method 1: Direct Interception
```bash
# Intercept single request
api-key-router "sk-abc123" "explain machine learning"

# Or use Python directly
python3 ~/blackroad-api-key-interceptor.py --intercept "sk-abc123" "prompt"
```

### Method 2: Environment Interception (Automatic!)
```bash
# Setup once
python3 ~/blackroad-api-key-interceptor.py --setup

# Add to ~/.zshrc or ~/.bashrc
source ~/blackroad-env-interceptor.sh

# Now ALL API keys in environment get intercepted automatically!
export OPENAI_API_KEY="sk-real-key-here"
# BlackRoad sees this and routes to unlimited automatically
```

### Method 3: Detection Only
```bash
# Detect provider from key
python3 ~/blackroad-api-key-interceptor.py --detect "sk-abc123"
# Output: ✅ Detected: openai
#         Would route to: ollama-qwen-coder
```

## 🧪 Test It

```bash
# Test all key patterns
python3 ~/blackroad-api-key-interceptor.py --test

# Output shows:
# ✅ OpenAI      → ollama-qwen-coder
# ✅ Stripe Test → blackroad-local
# ✅ Anthropic   → ollama-llama3
# ✅ GitHub      → blackroad-codex
# ... (8 providers)
```

## 🔧 Setup Instructions

### Quick Setup (3 steps)
```bash
# 1. Test the interceptor
python3 ~/blackroad-api-key-interceptor.py --test

# 2. Setup environment interceptor
python3 ~/blackroad-api-key-interceptor.py --setup

# 3. Add to shell config
echo "source ~/blackroad-env-interceptor.sh" >> ~/.zshrc
source ~/.zshrc
```

### Verify It's Working
```bash
# Set an API key
export OPENAI_API_KEY="sk-test-key"

# You'll see:
# 🔒 [BlackRoad] Intercepted OPENAI_API_KEY → Routing to unlimited
# ✅ [BlackRoad] API key interception active
```

## 💡 Examples

### Example 1: OpenAI Key
```bash
# They gave you: sk-abc123def456
# BlackRoad routes to: ollama-qwen-coder (unlimited)

api-key-router "sk-abc123def456" "write Python code for sorting"

# Output:
# ╔═══════════════════════════════════════════════════╗
# ║  API Key Intercepted → BlackRoad Unlimited       ║
# ╚═══════════════════════════════════════════════════╝
# Provider: openai
# Original Key: sk-a...f456
# Routed To: ollama-qwen-coder
# Cost: $0.00 (unlimited)
# 
# [Response from local Ollama...]
```

### Example 2: GitHub Token
```bash
# They gave you: ghp_xyz789abc123
# BlackRoad routes to: blackroad-codex (225K+ components)

api-key-router "ghp_xyz789abc123" "authentication middleware"

# Searches BlackRoad Codex instead of hitting GitHub API limits
```

### Example 3: Stripe Key
```bash
# They gave you: sk_test_abc123
# BlackRoad routes to: blackroad-local

api-key-router "sk_test_abc123" "create customer"

# Routes through local Stripe mock/integration
```

## 🎨 How It Works

```
┌─────────────────────────────────────────────────────┐
│  1. You use API key anywhere                        │
│     export OPENAI_API_KEY="sk-real-key"             │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│  2. BlackRoad intercepts key                        │
│     - Detects provider from prefix (sk- = OpenAI)   │
│     - Logs original key (masked)                    │
│     - Selects unlimited method                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│  3. Routes to unlimited local AI                    │
│     OpenAI    → ollama-qwen-coder                   │
│     Anthropic → ollama-llama3                       │
│     GitHub    → blackroad-codex                     │
│     Stripe    → blackroad-local                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│  4. Return result                                   │
│     - Same format as original API                   │
│     - Cost: $0.00                                   │
│     - No rate limits                                │
└─────────────────────────────────────────────────────┘
```

## 🌟 Advanced Features

### Automatic Environment Interception
Once setup, ALL these keys get intercepted automatically:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GITHUB_TOKEN`
- `GROQ_API_KEY`
- `STRIPE_SECRET_KEY`
- Any key matching patterns

### Original Keys Preserved
```bash
# Original key backed up
export BLACKROAD_ORIGINAL_OPENAI_KEY="sk-real-key"

# Replaced with unlimited marker
export OPENAI_API_KEY="sk-blackroad-unlimited"

# Your code sees unlimited marker, BlackRoad routes correctly
```

### Multi-Provider Routing
```python
# Your Python code
import openai
openai.api_key = "sk-abc123"  # BlackRoad intercepts
response = openai.Completion.create(...)  # Routes to Ollama

# No code changes needed!
```

## 📊 Statistics

After running for a while:
```bash
# Check intercepts log
cat ~/.blackroad/api-intercepts.json

# Shows:
# - Total intercepts
# - Money saved (rate limit avoidance)
# - Providers used
# - Methods selected
```

## 🔐 Security

- Original keys are masked in logs: `sk-a...f456`
- Keys never sent to external APIs (local only)
- Backup keys stored securely: `BLACKROAD_ORIGINAL_*`
- Can revert anytime by unsourcing interceptor

## 🎯 Integration Points

### 1. Shell Scripts
```bash
source ~/blackroad-env-interceptor.sh
export OPENAI_API_KEY="sk-abc"  # Auto-intercepted
```

### 2. Python Scripts
```python
import os
os.environ['OPENAI_API_KEY'] = 'sk-abc'  # Auto-intercepted
```

### 3. Node.js Scripts
```javascript
process.env.OPENAI_API_KEY = 'sk-abc';  // Auto-intercepted
```

### 4. Docker Containers
```dockerfile
ENV OPENAI_API_KEY=sk-abc  # Auto-intercepted
```

## 💡 Pro Tips

1. **Test first**: Run `--test` to see all patterns
2. **Setup once**: Add to `.zshrc` for automatic interception
3. **Check logs**: View `~/.blackroad/api-intercepts.json`
4. **Revert easily**: Just comment out `source` line
5. **Works everywhere**: Shell, Python, Node, Docker, etc.

## 🚨 Important Notes

- **Not a MITM attack**: Just routing to equivalent local AI
- **For development**: Use in dev/test environments first
- **Rate limit bypass**: Avoids hitting external API limits
- **Cost savings**: Everything routes to local AI ($0.00)

## 📖 Commands Reference

```bash
# Test interception
python3 ~/blackroad-api-key-interceptor.py --test

# Setup environment
python3 ~/blackroad-api-key-interceptor.py --setup

# Detect provider
python3 ~/blackroad-api-key-interceptor.py --detect "sk-abc"

# Intercept request
python3 ~/blackroad-api-key-interceptor.py --intercept "sk-abc" "prompt"

# Quick router
api-key-router "sk-abc" "prompt"
```

## 🌟 Philosophy

**"They gave you a key. We route how we want."**

- They limit requests per key → We route to unlimited local
- They charge per token → We charge $0.00
- They enforce rate limits → We have no limits
- They control the API → We control the routing

**Cost: $0.00 (always)**  
**Rate Limits: None**  
**Methods: 8 providers, all unlimited**

---

**Built with love by BlackRoad OS**  
*When they give you an API key, we give you unlimited access.*
