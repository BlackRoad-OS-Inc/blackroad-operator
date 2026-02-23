# Railway Deployment Guide
## BlackRoad Model Server (vLLM)

Deploy `internal/blackroad-coder-7b/v1` to Railway with vLLM.

---

## Prerequisites

1. **Railway Account**
   - Sign up at https://railway.app
   - Add payment method (GPU required)

2. **GitHub Repo**
   - Push `blackroad-models` to GitHub
   - Railway will auto-deploy from main branch

3. **Secrets Required**
   - `API_KEY` - Model serving API key (generate random)
   - `SENTRY_DSN` - Sentry error tracking (optional)
   - `HUGGINGFACE_TOKEN` - For downloading models

---

## Quick Deploy (One-Click)

### Option 1: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Option 2: Deploy via GitHub Integration

1. Go to https://railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose `BlackRoad-OS/blackroad-models`
4. Railway auto-detects `railway.toml`
5. Click "Deploy"

---

## Step-by-Step Deployment

### 1. Create New Project

```bash
railway login
railway init
```

**Or via dashboard:**
1. Go to https://railway.app/new
2. Click "Empty Project"
3. Name it `blackroad-model-server`

---

### 2. Configure Service

**Via CLI:**
```bash
# Set region
railway region set us-west1

# Set GPU
railway service:create blackroad-model-server \
  --gpu nvidia-a10 \
  --memory 16Gi \
  --cpu 4
```

**Or via dashboard:**
1. Click "New Service"
2. Select "GPU Service"
3. Choose **NVIDIA A10** (16GB VRAM)
4. Set Memory: **16 GB**
5. Set CPU: **4 cores**

---

### 3. Set Environment Variables

**Required Secrets:**

```bash
# Generate API key
railway variables:set API_KEY=$(openssl rand -hex 32)

# Optional: Sentry
railway variables:set SENTRY_DSN=https://...

# Optional: HuggingFace token (for private models)
railway variables:set HUGGINGFACE_TOKEN=hf_...
```

**Or via dashboard:**
1. Go to service settings
2. Click "Variables"
3. Add:
   - `API_KEY`: (generate with `openssl rand -hex 32`)
   - `SENTRY_DSN`: (from sentry.io)
   - `HUGGINGFACE_TOKEN`: (from huggingface.co/settings/tokens)

---

### 4. Configure Domain

**Custom Domain:**
```bash
railway domain add models-internal.blackroad.io
```

**Or use Railway subdomain:**
- Auto-assigned: `blackroad-model-server-production.up.railway.app`

**DNS Configuration (Cloudflare):**
```
Type: CNAME
Name: models-internal
Target: blackroad-model-server-production.up.railway.app
Proxy: ✅ Proxied
```

---

### 5. Deploy

**Via CLI:**
```bash
railway up
```

**Via GitHub:**
1. Push to main branch
2. Railway auto-deploys on commit

**Monitor deployment:**
```bash
railway logs
```

---

## Verify Deployment

### 1. Health Check

```bash
curl https://models-internal.blackroad.io/health
```

**Expected response:**
```json
{
  "status": "ok",
  "model": "BlackRoad Coder 7B",
  "version": "v1"
}
```

---

### 2. Test Inference

```bash
curl https://models-internal.blackroad.io/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "BlackRoad Coder 7B",
    "messages": [
      {"role": "system", "content": "You are a BlackRoad code assistant."},
      {"role": "user", "content": "Write a Python async function to spawn an agent"}
    ],
    "max_tokens": 256,
    "temperature": 0.7
  }'
```

**Expected response:**
```json
{
  "id": "cmpl-...",
  "object": "chat.completion",
  "created": 1702850000,
  "model": "BlackRoad Coder 7B",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "async def spawn_agent(spawner, role, capabilities):\n..."
      },
      "finish_reason": "stop"
    }
  ]
}
```

---

### 3. Monitor Metrics

```bash
# Prometheus metrics
curl https://models-internal.blackroad.io/metrics

# vLLM metrics
railway logs --filter metrics
```

---

## Cost Estimation

### Hardware

| Resource | Spec | Cost/Month |
|----------|------|-----------|
| GPU | NVIDIA A10 (16GB) | $40-50 |
| CPU | 4 cores | Included |
| Memory | 16 GB | Included |
| Storage | 50 GB (cache) | $5 |
| **Total** | | **~$50/month** |

### Autoscaling

With autoscaling (1-3 replicas):
- **Minimum:** $50/month (1 instance)
- **Average:** $75/month (1.5 instances)
- **Maximum:** $150/month (3 instances)

---

## Optimization Tips

### 1. Enable Quantization

AWQ (INT4) reduces memory by 75%:

```yaml
# In railway.toml
VLLM_QUANTIZATION = "awq"
```

**Before:** 15GB VRAM
**After:** 4GB VRAM

---

### 2. Adjust Context Length

Reduce for faster inference:

```yaml
# Staging
VLLM_MAX_MODEL_LEN = "2048"

# Production
VLLM_MAX_MODEL_LEN = "4096"
```

---

### 3. Enable Prefix Caching

Reuses KV cache for repeated prefixes:

```yaml
ENABLE_PREFIX_CACHING = "true"
```

**Benefit:** 30-50% faster for similar prompts

---

### 4. Autoscaling Configuration

Scale based on CPU:

```toml
[autoscaling]
enabled = true
minReplicas = 1
maxReplicas = 3
targetCPU = 70
scaleDownDelay = 300
```

**Scale up:** CPU > 70% for 1 minute
**Scale down:** CPU < 70% for 5 minutes

---

## Troubleshooting

### Issue: Out of Memory (OOM)

**Solution:**
1. Reduce `max_model_len` to `2048`
2. Lower `gpu_memory_utilization` to `0.8`
3. Enable quantization (`awq` or `gptq`)

---

### Issue: Slow Cold Start (5+ minutes)

**Cause:** Downloading model weights

**Solution:**
1. Use persistent volume for model cache
2. Pre-bake weights into Docker image
3. Use smaller base model (7B vs 14B)

---

### Issue: 504 Gateway Timeout

**Cause:** Health check timeout during model loading

**Solution:**
```toml
healthcheckTimeout = 600  # 10 minutes
```

---

### Issue: API Key Authentication Fails

**Check:**
```bash
railway variables:get API_KEY
```

**Test:**
```bash
curl https://models-internal.blackroad.io/health \
  -H "Authorization: Bearer $(railway variables:get API_KEY)"
```

---

## Monitoring

### Logs

```bash
# Stream logs
railway logs --follow

# Filter errors
railway logs --filter error

# Last 100 lines
railway logs --tail 100
```

### Metrics

Railway dashboard shows:
- CPU usage
- Memory usage
- GPU utilization
- Request rate
- Response time (p50, p95, p99)

### Alerts

Configure alerts in Railway dashboard:
- CPU > 90% for 5 minutes
- Memory > 90% for 5 minutes
- Error rate > 5% for 1 minute

---

## Next Steps

1. **Deploy to Staging**
   ```bash
   railway environment create staging
   railway up --environment staging
   ```

2. **Integrate with Agent Spawner**
   - Update `blackroad-os-core/src/blackroad_core/model_router.py`
   - Add endpoint to capability map

3. **Monitor for 14 Days**
   - Track latency (p95 < 500ms)
   - Monitor error rate (< 1%)
   - Collect agent feedback

4. **Consider Production Promotion**
   - If customer-facing demand exists
   - Requires legal approval + SLA

---

## Support

**Documentation:**
- vLLM: https://docs.vllm.ai
- Railway: https://docs.railway.app

**Contact:**
- BlackRoad: blackroad.systems@gmail.com
- Railway Support: https://railway.app/help

---

**Deployed by:** Claude Code 🤖
**Date:** 2025-12-15
