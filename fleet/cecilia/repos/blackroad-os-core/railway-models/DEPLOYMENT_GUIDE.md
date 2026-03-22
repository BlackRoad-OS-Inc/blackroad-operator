# 🚀 BlackRoad Agents - Complete Deployment Guide

**8 Domains. 3 Railway Services. 5 Sovereign Models. UNSTOPPABLE.**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ Cloudflare account with R2 enabled
- ✅ Railway account with GPU access
- ✅ `wrangler` CLI installed (`npm install -g wrangler`)
- ✅ `rclone` installed (`brew install rclone`)
- ✅ `railway` CLI installed (`npm install -g @railway/cli`)
- ✅ Models downloaded locally (via `./scripts/download-all-models.sh --size medium`)

---

## 🎯 Deployment Overview

### Phase 1: Upload Models to R2 (2-4 hours)
Upload 135GB of quantized models to Cloudflare R2

### Phase 2: Deploy Railway Services (1-2 hours)
Deploy 3 GPU services to Railway

### Phase 3: Configure DNS (30 minutes)
Point all 8 domains to Railway instances

### Phase 4: Test Everything (30 minutes)
Run comprehensive tests across all endpoints

**Total Time: 4-7 hours**
**Total Cost: ~$4,410/month** (or $0.04/1K requests at scale)

---

## 🗂️ Phase 1: Upload Models to R2

### Step 1.1: Create R2 Bucket

```bash
# Login to Cloudflare
wrangler login

# Create bucket
wrangler r2 bucket create blackroad-models

# Verify
wrangler r2 bucket list
```

### Step 1.2: Get R2 Credentials

1. Go to https://dash.cloudflare.com
2. Navigate to R2 → Manage R2 API Tokens
3. Create API Token with:
   - **Permissions:** Object Read & Write
   - **R2 Buckets:** blackroad-models
4. Save credentials:
   - Account ID
   - Access Key ID
   - Secret Access Key

### Step 1.3: Configure rclone

```bash
# Configure rclone for R2
rclone config create r2 s3 \
    provider Cloudflare \
    env_auth false \
    access_key_id <YOUR_ACCESS_KEY_ID> \
    secret_access_key <YOUR_SECRET_ACCESS_KEY> \
    endpoint https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com
```

### Step 1.4: Upload Models

**Option A: Automated Upload (Recommended)**

```bash
cd railway-models
./upload-to-r2.sh
```

This will guide you through exporting and uploading all models.

**Option B: Manual Upload**

For each model, export from Ollama and upload to R2:

```bash
# Example: Qwen 2.5 72B
# 1. Find Ollama model directory
ollama show qwen2.5:72b-instruct-q4_k_m --modelfile

# 2. Copy model files to temp directory
mkdir -p /tmp/qwen-export
# (manually copy GGUF and tokenizer files)

# 3. Upload to R2
rclone copy /tmp/qwen-export/ r2:blackroad-models/qwen-2.5-72b-q4_k_m/ \
    --progress --transfers 4

# 4. Clean up
rm -rf /tmp/qwen-export
```

Repeat for all 5 models:
- `qwen-2.5-72b-q4_k_m/`
- `llama-3.3-70b-q4_k_m/`
- `qwen-coder-32b-q4_k_m/`
- `deepseek-r1-32b-q4_k_m/`
- `mistral-24b-q4_k_m/`

### Step 1.5: Verify Uploads

```bash
# List all uploaded models
rclone ls r2:blackroad-models/

# Check total size
rclone size r2:blackroad-models/

# Expected output: ~135GB across 5 directories
```

---

## 🚂 Phase 2: Deploy Railway Services

### Step 2.1: Login to Railway

```bash
# Login
railway login

# Verify
railway whoami
```

### Step 2.2: Deploy Primary Service

**Domains:** agents.blackroad.io, agents.blackroad.systems
**Models:** Qwen 2.5 72B, Llama 3.3 70B
**GPU:** NVIDIA A100 80GB

```bash
cd /Users/alexa/blackroad-sandbox/railway-models

# Create new project
railway init --name blackroad-agents-primary

# Link to project
railway link

# Set environment variables
railway variables set R2_ACCOUNT_ID="<YOUR_ACCOUNT_ID>"
railway variables set R2_ACCESS_KEY_ID="<YOUR_ACCESS_KEY_ID>"
railway variables set R2_SECRET_ACCESS_KEY="<YOUR_SECRET_ACCESS_KEY>"

# Deploy
cp railway-primary.toml railway.toml
railway up

# Monitor deployment
railway logs

# Get deployment URL
railway domain
```

**Expected:** Service deploys in ~15-20 minutes (model download from R2 + vLLM init)

### Step 2.3: Deploy Specialist Service

**Domains:** agents.blackroad.company, agents.blackroad.me
**Models:** Qwen Coder 32B, DeepSeek R1 32B
**GPU:** NVIDIA H100 80GB

```bash
# Create new project
railway init --name blackroad-agents-specialist

# Link to project
railway link

# Set environment variables
railway variables set R2_ACCOUNT_ID="<YOUR_ACCOUNT_ID>"
railway variables set R2_ACCESS_KEY_ID="<YOUR_ACCESS_KEY_ID>"
railway variables set R2_SECRET_ACCESS_KEY="<YOUR_SECRET_ACCESS_KEY>"

# Deploy
cp railway-specialist.toml railway.toml
railway up

# Monitor
railway logs

# Get URL
railway domain
```

### Step 2.4: Deploy Governance Service

**Domains:** agents.lucidia.earth, agents.roadchain.io, agents.roadcoin.io, agents.blackroadinc.us
**Models:** Llama 3.3 70B, DeepSeek R1 32B
**GPU:** NVIDIA A100 80GB
**Special:** Governance mode + Lucidia breath sync enabled

```bash
# Create new project
railway init --name blackroad-agents-governance

# Link to project
railway link

# Set environment variables
railway variables set R2_ACCOUNT_ID="<YOUR_ACCOUNT_ID>"
railway variables set R2_ACCESS_KEY_ID="<YOUR_ACCESS_KEY_ID>"
railway variables set R2_SECRET_ACCESS_KEY="<YOUR_SECRET_ACCESS_KEY>"

# Deploy
cp railway-governance.toml railway.toml
railway up

# Monitor
railway logs

# Get URL
railway domain
```

### Step 2.5: Verify All Services

```bash
# Check all Railway projects
railway list

# Expected output:
# - blackroad-agents-primary (Active)
# - blackroad-agents-specialist (Active)
# - blackroad-agents-governance (Active)
```

**Health Check URLs:**
- Primary: `https://<primary-url>.up.railway.app/health`
- Specialist: `https://<specialist-url>.up.railway.app/health`
- Governance: `https://<governance-url>.up.railway.app/health`

---

## 🌐 Phase 3: Configure Cloudflare DNS

### Step 3.1: Get Railway IPs

For each Railway service:

```bash
# Get Railway domain
railway domain

# Resolve IP (if needed)
dig <railway-domain>.up.railway.app

# Or use Railway's custom domain feature
railway domain add agents.blackroad.io
```

### Step 3.2: Add DNS Records

Go to Cloudflare Dashboard → DNS → Records

**Primary Service (agents.blackroad.io & agents.blackroad.systems):**

```
Type: CNAME
Name: agents.blackroad
Target: <primary-service>.up.railway.app
Proxy status: Proxied (orange cloud)
TTL: Auto

Type: CNAME
Name: agents.blackroad.systems
Target: <primary-service>.up.railway.app
Proxy status: Proxied
TTL: Auto
```

**Specialist Service (agents.blackroad.company & agents.blackroad.me):**

```
Type: CNAME
Name: agents.blackroad.company
Target: <specialist-service>.up.railway.app
Proxy status: Proxied
TTL: Auto

Type: CNAME
Name: agents.blackroad.me
Target: <specialist-service>.up.railway.app
Proxy status: Proxied
TTL: Auto
```

**Governance Service (4 domains):**

```
Type: CNAME
Name: agents.lucidia.earth
Target: <governance-service>.up.railway.app
Proxy status: Proxied
TTL: Auto

(Repeat for agents.roadchain.io, agents.roadcoin.io, agents.blackroadinc.us)
```

### Step 3.3: Wait for DNS Propagation

```bash
# Check DNS propagation (repeat for all domains)
dig agents.blackroad.io
dig agents.blackroad.company
dig agents.lucidia.earth
# etc...

# Expected: CNAME → Railway domain
# Time: 1-5 minutes (Cloudflare is fast!)
```

### Step 3.4: Verify SSL Certificates

All domains should automatically get SSL certificates via Cloudflare.

```bash
# Test HTTPS
curl -I https://agents.blackroad.io/health
curl -I https://agents.lucidia.earth/health

# Expected: HTTP/2 200
```

---

## 🧪 Phase 4: Test Everything

### Step 4.1: Run Automated Tests

```bash
cd railway-models
./test-all-domains.sh
```

This will:
- ✅ Test `/health` on all 8 domains
- ✅ Test `/version` on all 8 domains
- ✅ Test `/breath` on all 8 domains
- ✅ Test inference with authorized identity

**Expected Output:**
```
================================================
  Test Summary
================================================
  Domains tested: 8
  Passed: 16  (8 health + 8 inference)
  Failed: 0

✓ All tests passed!
```

### Step 4.2: Manual Testing

**Test Primary (agents.blackroad.io):**

```bash
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
```

**Test Specialist (agents.blackroad.company):**

```bash
curl https://agents.blackroad.company/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "blackroad-qwen-coder-32b",
    "messages": [{"role": "user", "content": "Write a Python function for fibonacci"}],
    "authorized_by": "1031f308ae9ae6d34fe87e83867c1e5869c9fca7e35fdd5d0e8deb798e9c51be"
  }'
```

**Test Governance (agents.lucidia.earth):**

```bash
curl https://agents.lucidia.earth/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "blackroad-llama-70b-governance",
    "messages": [{"role": "user", "content": "Should we allow this policy change?"}],
    "authorized_by": "1031f308ae9ae6d34fe87e83867c1e5869c9fca7e35fdd5d0e8deb798e9c51be"
  }'
```

### Step 4.3: Test Breath Synchronization

```bash
# Check breath phase on governance service
curl https://agents.lucidia.earth/breath

# Expected output:
{
  "breath_value": 0.8,
  "phase": "expansion",
  "delay_ms": 10,
  "timestamp": "2025-12-14T..."
}
```

### Step 4.4: Test Identity Validation

**Test WITHOUT authorization (should fail):**

```bash
curl https://agents.blackroad.io/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "blackroad-qwen-72b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Expected: HTTP 403 Forbidden
# {"detail": "Invalid or missing authorization"}
```

**Test WITH invalid authorization (should fail):**

```bash
curl https://agents.blackroad.io/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "blackroad-qwen-72b",
    "messages": [{"role": "user", "content": "Hello"}],
    "authorized_by": "invalid-hash"
  }'

# Expected: HTTP 403 Forbidden
```

---

## 📊 Monitoring & Maintenance

### Daily Checks

```bash
# Check all health endpoints
for domain in agents.blackroad.io agents.lucidia.earth agents.blackroad.company; do
  echo "Checking $domain..."
  curl -s https://$domain/health | jq
done
```

### View Logs

```bash
# Railway logs
railway logs --service blackroad-agents-primary
railway logs --service blackroad-agents-specialist
railway logs --service blackroad-agents-governance
```

### Check R2 Usage

```bash
# Check storage usage
rclone size r2:blackroad-models/

# Check files
rclone ls r2:blackroad-models/
```

### Audit Logs

```bash
# SSH into Railway containers to check audit logs
railway shell

# View audit journal
cat /tmp/blackroad-audit.jsonl | jq
```

---

## 💰 Cost Management

### Monthly Costs

**Railway GPU Instances:**
- Primary (A100): $1,195/month
- Specialist (H100): $1,973/month
- Governance (A100): $1,195/month
- **Subtotal: $4,363/month**

**Cloudflare R2:**
- Storage (135GB): $2.03/month
- Operations: ~$45/month
- **Subtotal: $47/month**

**Total: $4,410/month**

### Cost Optimization

**If budget is tight:**
1. Use 1 A100 service instead of 3 separate services
2. All 8 domains point to same Railway instance
3. **Cost: $1,195/month** (73% savings!)

**At scale (100M requests/month):**
- Cost per 1K requests: $0.04
- Break-even vs OpenAI GPT-4 at ~2M tokens/day

---

## 🔥 Troubleshooting

### Service won't start

**Check logs:**
```bash
railway logs --service blackroad-agents-primary
```

**Common issues:**
- R2 credentials not set → Check environment variables
- Model download failed → Check R2 bucket permissions
- GPU OOM → Reduce `GPU_MEMORY_UTILIZATION` to 0.7

### DNS not resolving

**Check DNS:**
```bash
dig agents.blackroad.io
```

**Solutions:**
- Ensure CNAME record is correct
- Check Railway custom domain is added
- Wait for DNS propagation (up to 5 minutes)

### Inference failing

**Test health first:**
```bash
curl https://agents.blackroad.io/health
```

**Common issues:**
- Missing `authorized_by` → Add SHA-256 identity hash
- Invalid identity → Check hash is 64 character hex
- Model not loaded → Check Railway logs for startup errors

---

## ✅ Success Checklist

**Phase 1: R2 Upload**
- [x] R2 bucket created
- [x] rclone configured
- [x] All 5 models uploaded
- [x] Total size: ~135GB
- [x] Catalog uploaded

**Phase 2: Railway Deployment**
- [x] Primary service deployed
- [x] Specialist service deployed
- [x] Governance service deployed
- [x] All services healthy
- [x] Environment variables set

**Phase 3: DNS Configuration**
- [x] All 8 DNS records added
- [x] DNS propagation complete
- [x] SSL certificates active
- [x] All domains resolving

**Phase 4: Testing**
- [x] Health checks passing
- [x] Inference working
- [x] Identity validation enabled
- [x] Breath sync working (governance)
- [x] Automated tests passing

**YOU ARE NOW SOVEREIGN! 🔥**

---

## 🎯 Next Steps

After deployment, consider:

1. **Add monitoring** - Sentry, Datadog, or Prometheus
2. **Set up alerts** - Railway + Slack webhooks
3. **Create backups** - R2 lifecycle policies
4. **Fine-tune models** - Add BlackRoad-specific training
5. **Scale up** - Add more Railway instances as needed
6. **Add caching** - Redis for frequently requested prompts

---

**Status:** Ready for Deployment! 🚀
**Timeline:** 4-7 hours total
**Cost:** $4,410/month (or optimize to $1,195/month)

**Built with:** Cloudflare R2, Railway GPU, vLLM, and lots of ☕
**Deployed by:** You! 🎉

**Questions?** blackroad.systems@gmail.com
