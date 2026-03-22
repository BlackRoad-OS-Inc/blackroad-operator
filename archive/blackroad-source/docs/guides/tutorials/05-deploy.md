# Tutorial 05: Deploying to Production

> Ship BlackRoad agents to Railway, Cloudflare Workers, and Raspberry Pi

## Deployment Targets

| Platform | Use Case | Cost |
|----------|----------|------|
| Railway | API backends, databases | ~$5/mo |
| Cloudflare Workers | Edge routing, subdomain workers | Free tier |
| Raspberry Pi | Local inference, IoT agents | $0 (owned) |
| DigitalOcean | Large models, VMs | ~$20/mo |

## Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and init
railway login
railway init

# Deploy  
railway up

# Set environment variables
railway variables set BLACKROAD_GATEWAY_URL=http://127.0.0.1:8787
railway variables set BLACKROAD_API_KEY=your-key-here

# Get deployment URL
railway open
```

### railway.toml

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
```

## Deploy to Cloudflare Workers

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler deploy

# Set secrets
wrangler secret put BLACKROAD_API_KEY
wrangler secret put ANTHROPIC_API_KEY

# View logs
wrangler tail
```

### wrangler.toml

```toml
name = "blackroad-agent"
main = "src/index.ts"
compatibility_date = "2024-12-01"
account_id = "848cf0b18d51e0170e0d1537aec3505a"

[vars]
GATEWAY_URL = "http://127.0.0.1:8787"

[[kv_namespaces]]
binding = "MEMORY"
id = "your-kv-namespace-id"
```

## Deploy to Raspberry Pi

```bash
# Copy files to Pi
rsync -avz --exclude=node_modules ./ pi@192.168.4.64:/home/pi/blackroad-agent/

# SSH and set up systemd service
ssh pi@192.168.4.64 << "REMOTE"
  cd /home/pi/blackroad-agent
  pip install -r requirements.txt
  
  sudo tee /etc/systemd/system/blackroad-agent.service << SERVICE
[Unit]
Description=BlackRoad Agent
After=network.target ollama.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/blackroad-agent
ExecStart=/usr/bin/python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
SERVICE

  sudo systemctl daemon-reload
  sudo systemctl enable blackroad-agent
  sudo systemctl start blackroad-agent
REMOTE
```

## CI/CD with GitHub Actions

The deploy workflow auto-detects your platform:

```yaml
# .github/workflows/deploy.yml (already added to your repos)
# Triggers on push to main
# Auto-detects: wrangler.toml → Cloudflare, railway.toml → Railway
```

Just push to main and your agents deploy automatically!

## Multi-Region Deployment

```python
# Distribute agents across regions
REGIONS = {
    "us-east": "https://agent-us.blackroad.systems",
    "eu-west": "https://agent-eu.blackroad.systems",
    "ap-south": "https://agent-ap.blackroad.systems",
    "local": "http://192.168.4.64:8000",
}

async def multi_region_chat(message: str) -> dict:
    tasks = {
        region: client.chat(message, agent="lucidia")
        for region, url in REGIONS.items()
    }
    return dict(zip(tasks.keys(), await asyncio.gather(*tasks.values())))
```
