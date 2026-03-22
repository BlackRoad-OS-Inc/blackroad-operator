# BlackRoad Deployment Automation

Automated deployment and management scripts for BlackRoad services.

## 🚀 Quick Start

```bash
# Deploy all services
./deploy-all-services.sh

# Check service health
./check-all-services.sh

# Configure DNS
./configure-dns.sh
```

## 📜 Scripts

### 1. `deploy-all-services.sh`

Mass deployment script for all BlackRoad services to Vercel.

**Features:**
- Deploys all services in sequence
- Validates service directories
- Extracts deployment URLs
- Provides detailed summary

**Usage:**
```bash
./deploy-all-services.sh
```

**Services Deployed:**
- api
- brand
- core
- demo
- docs
- ideas
- infra
- operator
- prism
- research
- web

---

### 2. `check-all-services.sh`

Health check script for all deployed services.

**Features:**
- Tests `/api/health` endpoint for each service
- Color-coded status output
- Summary statistics
- Exit code indicates overall health (0 = healthy, 1 = issues)

**Usage:**
```bash
# Basic check
./check-all-services.sh

# Use in CI/CD
if ./check-all-services.sh; then
  echo "All services healthy"
else
  echo "Some services down!"
  exit 1
fi
```

**Example Output:**
```
🏥 BlackRoad Services Health Check
===================================

Checking prism... ✅ OK (https://prism-two-ruby.vercel.app)
Checking operator... ✅ OK (https://operator-swart.vercel.app)
...

===================================
📊 Summary
===================================
Healthy: 10
Unhealthy: 0
Total: 10

🎉 All services are healthy!
```

---

### 3. `configure-dns.sh`

Cloudflare DNS configuration script.

**Features:**
- Creates/updates CNAME records
- Points subdomains to Vercel
- Automatic record detection
- Batch processing

**Prerequisites:**
- Cloudflare API token at `~/.cloudflare_dns_token`
- Zone ID configured in script

**Usage:**
```bash
./configure-dns.sh
```

**DNS Records Created:**
- `prism.blackroad.systems` → `cname.vercel-dns.com`
- `operator.blackroad.systems` → `cname.vercel-dns.com`
- `brand.blackroad.systems` → `cname.vercel-dns.com`
- (and 7 more...)

---

## 🔧 Configuration

### Vercel CLI

Required for deployments. Install globally:

```bash
npm install -g vercel
vercel login
```

### Cloudflare Token

Create a token with DNS edit permissions:
1. Go to Cloudflare Dashboard
2. My Profile → API Tokens
3. Create Token → Edit zone DNS
4. Save to `~/.cloudflare_dns_token`

---

## 📊 Current Deployments

| Service | Status | URL |
|---------|--------|-----|
| Prism | ✅ Live | https://prism-two-ruby.vercel.app |
| Operator | ✅ Live | https://operator-swart.vercel.app |
| Brand | ✅ Live | https://brand-ten-woad.vercel.app |
| Docs | ✅ Live | https://docs-one-wheat.vercel.app |
| Core | ✅ Live | https://core-six-dun.vercel.app |
| Ideas | ✅ Live | https://ideas-five-self.vercel.app |
| Infra | ✅ Live | https://infra-ochre-three.vercel.app |
| Research | ✅ Live | https://research-ten-zeta.vercel.app |
| Demo | ✅ Live | https://demo-psi-hazel-24.vercel.app |
| API | ✅ Live | https://api-pearl-seven.vercel.app |

---

## 🛠️ Maintenance

### Update Service URLs

Edit the service mappings in each script:

**`check-all-services.sh`:**
```bash
SERVICES=(
  "service-name:service-url.vercel.app"
)
```

**`configure-dns.sh`:**
```bash
declare -A SERVICES=(
  ["subdomain"]="service-url.vercel.app"
)
```

### Add New Service

1. Create service directory in `services/`
2. Add to `deploy-all-services.sh` SERVICES array
3. Deploy: `./deploy-all-services.sh`
4. Add to health check and DNS scripts

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy and Verify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy services
        run: ./deploy-all-services.sh
      - name: Health check
        run: ./check-all-services.sh
```

---

## 📈 Monitoring

### Set up monitoring with cron

```bash
# Add to crontab
*/5 * * * * /path/to/check-all-services.sh || echo "Services down!" | mail -s "Alert" admin@example.com
```

---

## 🐛 Troubleshooting

### Deployment fails

```bash
# Check Vercel login
vercel whoami

# Check service directory
cd services/<service>
npm run build
```

### Health check fails

```bash
# Test individual service
curl https://service-url.vercel.app/api/health

# Check Vercel logs
vercel logs <service-url>
```

### DNS not updating

```bash
# Verify Cloudflare token
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $(cat ~/.cloudflare_dns_token)"

# Check DNS propagation
dig +short subdomain.blackroad.systems CNAME
```

---

## 📝 License

Part of the BlackRoad OS project.

---

**Last Updated:** 2026-02-03
