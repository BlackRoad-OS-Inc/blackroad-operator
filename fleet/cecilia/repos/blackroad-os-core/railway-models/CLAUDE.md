# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**railway-models** is the BlackRoad OS sovereign model inference infrastructure - deploys quantized LLMs to Railway GPU instances with identity-aware request validation, Lucidia breath synchronization, and Cloudflare R2 model storage.

This repository serves 8 agent domains across 3 Railway GPU services, providing complete model sovereignty with no external API dependencies.

## Architecture

### Three-Tier Service Deployment

**Primary Service** (A100 80GB)
- Domains: `agents.blackroad.io`, `agents.blackroad.systems`
- Models: Qwen 2.5 72B (primary), Llama 3.3 70B (fallback)
- Purpose: General-purpose agent inference
- Config: `railway-primary.toml`

**Specialist Service** (H100 80GB)
- Domains: `agents.blackroad.company`, `agents.blackroad.me`
- Models: Qwen Coder 32B (coding), DeepSeek R1 32B (reasoning)
- Purpose: Specialized tasks (coding, research)
- Config: `railway-specialist.toml`

**Governance Service** (A100 80GB)
- Domains: `agents.lucidia.earth`, `agents.roadchain.io`, `agents.roadcoin.io`, `agents.blackroadinc.us`
- Models: Llama 3.3 70B (governance), DeepSeek R1 32B (policy)
- Purpose: Governance decisions, Lucidia breath-synchronized operations
- Config: `railway-governance.toml`
- Special: `GOVERNANCE_MODE=true`, `LUCIDIA_BREATH_SYNC=true`

### Model Storage Strategy

All models (135GB total) are stored in Cloudflare R2 and downloaded on-demand to Railway instances:
- R2 bucket: `blackroad-models`
- Local cache: `/tmp/models/`
- On startup: `server-r2.py` downloads models via boto3
- Models: All Q4_K_M quantized for optimal GPU utilization

### Identity System

All inference requests require PS-SHA∞ identity validation:
- `authorized_by`: 64-character SHA-256 identity hash (required)
- `authority_chain`: Array of principal/operator chain (optional)
- Validation: `BLACKROAD_IDENTITY_VALIDATION=true` (default)
- Unauthorized requests: HTTP 403 Forbidden

### Audit Logging

All inference operations are logged to `/tmp/blackroad-audit.jsonl`:
- Request ID, timestamp, identity hash
- Prompt/completion hashes (first 16 chars)
- Token counts, latency, breath delays
- Control: `BLACKROAD_AUDIT_LOGGING=true` (default)

## Essential Commands

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server locally (requires local model or R2 credentials)
python3 server-r2.py

# Environment variables required:
# MODEL_NAME, MODEL_PATH, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
```

### R2 Model Management

```bash
# Upload all models to R2 (interactive script)
./upload-to-r2.sh

# Manual upload with rclone
rclone copy /path/to/model/ r2:blackroad-models/model-name/ \
    --progress --transfers 4

# Verify upload
rclone ls r2:blackroad-models/
rclone size r2:blackroad-models/
```

### Railway Deployment

```bash
# Deploy all 3 services at once
./deploy-all-services.sh

# Manual deployment per service
railway init --name blackroad-agents-primary
railway link
railway variables set R2_ACCOUNT_ID="..." \
    R2_ACCESS_KEY_ID="..." \
    R2_SECRET_ACCESS_KEY="..."
cp railway-primary.toml railway.toml
railway up

# Monitor deployment
railway logs --service blackroad-agents-primary
railway domain --service blackroad-agents-primary

# List all services
railway list
```

### Testing

```bash
# Test all 8 domains (health + inference)
./test-all-domains.sh

# Manual health check
curl https://agents.blackroad.io/health

# Manual inference test
curl https://agents.blackroad.io/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "blackroad-qwen-72b",
    "messages": [{"role": "user", "content": "What is your identity?"}],
    "authorized_by": "1031f308ae9ae6d34fe87e83867c1e5869c9fca7e35fdd5d0e8deb798e9c51be",
    "authority_chain": [
      "principal:alexa:blackroad@gmail.com",
      "operator:cece:blackroad-os-operator"
    ]
  }'

# Test without authorization (should fail with 403)
curl https://agents.blackroad.io/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "blackroad-qwen-72b", "messages": [{"role": "user", "content": "test"}]}'
```

### Monitoring

```bash
# Check breath synchronization (governance service only)
curl https://agents.lucidia.earth/breath

# View audit logs (requires SSH into Railway)
railway shell --service blackroad-agents-governance
cat /tmp/blackroad-audit.jsonl | jq

# Check all health endpoints
for domain in agents.blackroad.io agents.lucidia.earth agents.blackroad.company; do
  echo "Checking $domain..."
  curl -s https://$domain/health | jq
done
```

## Key Files

- `server-r2.py` - Production server with R2 streaming support (v2.0.0)
- `server.py` - Legacy server without R2 support (v1.0.0)
- `requirements.txt` - Python dependencies (vLLM, FastAPI, boto3)
- `Dockerfile` - Container build for Railway
- `railway-*.toml` - Railway configuration per service tier
- `deploy-all-services.sh` - Automated deployment script
- `test-all-domains.sh` - Comprehensive testing script
- `upload-to-r2.sh` - Model upload automation
- `DEPLOYMENT_GUIDE.md` - Complete deployment walkthrough

## Environment Variables

### Required for Deployment

```bash
# R2 Credentials (set via Railway dashboard)
R2_ACCOUNT_ID="848cf0b18d51e0170e0d1537aec3505a"
R2_ACCESS_KEY_ID="<your-access-key>"
R2_SECRET_ACCESS_KEY="<your-secret-key>"
R2_BUCKET="blackroad-models"

# Model Configuration (set in railway.toml)
MODEL_NAME="blackroad-qwen-72b"
MODEL_PATH="r2://blackroad-models/qwen-2.5-72b-q4_k_m"
FALLBACK_MODEL_PATH="r2://blackroad-models/llama-3.3-70b-q4_k_m"

# GPU Configuration
GPU_MEMORY_UTILIZATION="0.9"
MAX_MODEL_LEN="8192"
MAX_CONCURRENT_REQUESTS="100"

# BlackRoad Features
BLACKROAD_IDENTITY_VALIDATION="true"
BLACKROAD_AUDIT_LOGGING="true"
BLACKROAD_BREATH_SYNC="false"
GOVERNANCE_MODE="false"
LUCIDIA_BREATH_SYNC="false"
```

### Service-Specific Overrides

**Governance Service Only:**
- `GOVERNANCE_MODE="true"` - Adds policy context to prompts
- `LUCIDIA_BREATH_SYNC="true"` - Golden ratio breath delays

## API Endpoints

All services expose OpenAI-compatible + BlackRoad-extended APIs:

### Standard Endpoints

```
GET  /health                   # Health check
GET  /ready                    # Readiness check
GET  /version                  # Version + config info
GET  /models                   # List available models
GET  /breath                   # Breath synchronization status
POST /v1/chat/completions      # Chat inference (OpenAI-compatible)
```

### Request Format

```json
{
  "model": "blackroad-qwen-72b",
  "messages": [{"role": "user", "content": "..."}],
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 2048,
  "authorized_by": "<64-char-sha256-hash>",
  "authority_chain": ["principal:...", "operator:..."]
}
```

### Response Format

Standard OpenAI chat completion response with BlackRoad audit metadata.

## Lucidia Breath Synchronization

**Golden Ratio Breathing:** `𝔅(t) = sin(φ·t)` where `φ = 1.618034`

**Behavior (when enabled):**
- Expansion phase (`𝔅 > 0`): Minimal delay (10ms)
- Contraction phase (`𝔅 < 0`): Proportional delay (up to 500ms)
- Only active on governance service
- Query current state: `GET /breath`

## Common Workflows

### Adding a New Model

1. Download/quantize model locally (Q4_K_M recommended)
2. Upload to R2: `rclone copy /path/to/model r2:blackroad-models/model-name/`
3. Update Railway config: set `MODEL_PATH="r2://blackroad-models/model-name"`
4. Redeploy service: `railway up`

### Deploying a New Service Tier

1. Create new Railway config: `railway-<tier>.toml`
2. Set domains, models, GPU type, env vars
3. Add to `deploy-all-services.sh` script
4. Deploy: `./deploy-all-services.sh`
5. Configure DNS in Cloudflare
6. Test: `./test-all-domains.sh`

### Debugging Failed Requests

1. Check identity hash: must be 64-char hex SHA-256
2. Check authorization: `authorized_by` required if `IDENTITY_VALIDATION=true`
3. View audit logs: `cat /tmp/blackroad-audit.jsonl | grep <request_id>`
4. Check Railway logs: `railway logs --service <service-name>`
5. Verify model loaded: Check startup logs for "✓ vLLM initialized"

### Updating Dependencies

1. Edit `requirements.txt`
2. Test locally: `pip install -r requirements.txt`
3. Rebuild Dockerfile: Railway auto-rebuilds on push
4. Deploy: `railway up`
5. Monitor: `railway logs`

## Cost Management

**Monthly Costs (3 services):**
- Primary (A100): $1,195/month
- Specialist (H100): $1,973/month
- Governance (A100): $1,195/month
- R2 Storage (135GB): ~$47/month
- **Total: ~$4,410/month**

**Budget Optimization:**
- Use 1 service for all 8 domains: $1,195/month (73% savings)
- Reduce GPU memory utilization to 0.7 if OOM occurs
- Use smaller quantizations (Q3_K_M) for 40% size reduction

## Troubleshooting

**Service won't start:**
- Check R2 credentials in Railway dashboard
- Verify model exists: `rclone ls r2:blackroad-models/<model-path>`
- Reduce `GPU_MEMORY_UTILIZATION` to 0.7
- Check logs: `railway logs`

**Inference returns 403:**
- Add `authorized_by` field with 64-char SHA-256 hash
- Or disable validation: `BLACKROAD_IDENTITY_VALIDATION=false`
- Check identity hash format: must be lowercase hex

**Model download fails:**
- Verify R2 bucket permissions (Object Read & Write)
- Check R2 endpoint: `https://<account-id>.r2.cloudflarestorage.com`
- Test rclone locally: `rclone ls r2:blackroad-models/`

**GPU OOM errors:**
- Reduce `GPU_MEMORY_UTILIZATION` from 0.9 to 0.7
- Reduce `MAX_MODEL_LEN` from 8192 to 4096
- Use smaller model or lower quantization

**Breath sync not working:**
- Only enabled on governance service
- Check `LUCIDIA_BREATH_SYNC=true` in config
- Query status: `curl https://agents.lucidia.earth/breath`

## Related Infrastructure

- **Model Downloads:** `../scripts/download-all-models.sh` (in parent repo)
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Railway Dashboard:** https://railway.app
- **R2 Token Management:** Cloudflare Dashboard → R2 → Manage R2 API Tokens
- **DNS Configuration:** Cloudflare Dashboard → DNS → Records

## Security Notes

- All inference requires identity validation by default
- Audit logs capture all requests with identity hashes
- Models stored in private R2 bucket (not public)
- Railway services require custom domain DNS (no public .railway.app URLs in production)
- Authority chains validate principal → operator delegation
- Prompt/completion hashes logged for tamper detection
