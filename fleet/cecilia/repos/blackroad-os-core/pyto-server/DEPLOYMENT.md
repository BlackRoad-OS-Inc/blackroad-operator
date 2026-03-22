# 🚀 BlackRoad OS Pyto Server - Deployment Guide

Complete deployment instructions for iOS Pyto, Railway, and Docker.

---

## 📱 Deploy to iOS Pyto

### Prerequisites
- iPhone or iPad with iOS 13+
- Pyto app from App Store ($2.99 one-time purchase)

### Step 1: Install Pyto
1. Open App Store on your iOS device
2. Search for "Pyto - Python 3"
3. Install the app (paid app, ~$3)

### Step 2: Copy Server Code
1. Transfer `main.py` to your iOS device using:
   - AirDrop
   - iCloud Drive
   - Email attachment
   - iTunes file sharing
2. Open the file in Pyto

### Step 3: Install Dependencies
1. Open Pyto
2. Tap the console icon (bottom right)
3. Run these commands:
   ```python
   import pip
   pip.main(['install', 'fastapi'])
   pip.main(['install', 'uvicorn'])
   pip.main(['install', 'pydantic'])
   pip.main(['install', 'websockets'])
   pip.main(['install', 'httpx'])
   pip.main(['install', 'psutil'])
   ```

### Step 4: Run the Server
1. Open `main.py` in Pyto
2. Tap the play button (▶️) at top right
3. Server will start on `http://localhost:8080`

### Step 5: Test the Server
1. In Pyto console, test endpoints:
   ```python
   import requests
   r = requests.get('http://localhost:8080/health')
   print(r.json())
   ```

2. Or use Safari on the same device:
   - Visit: `http://localhost:8080/docs`
   - Interactive API documentation will load

### Limitations on iOS
- Server only accessible from same device (localhost)
- Background execution limited (app must be active)
- Limited memory (~500MB for Python processes)
- No persistent storage between runs

### Workarounds
- **Expose to network:** Use ngrok or localtunnel
- **Background running:** Keep Pyto in foreground
- **Storage:** Use iCloud Drive for data persistence

---

## 🚂 Deploy to Railway

### Prerequisites
- Railway account (free tier available)
- Railway CLI (optional but recommended)

### Method 1: Deploy via CLI (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   cd pyto-server
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Set environment variables:**
   ```bash
   railway variables set ANTHROPIC_API_KEY=your_key_here
   railway variables set OPENAI_API_KEY=your_key_here
   railway variables set ENVIRONMENT=production
   ```

6. **Generate domain:**
   ```bash
   railway domain
   ```

7. **View logs:**
   ```bash
   railway logs
   ```

### Method 2: Deploy via GitHub

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: Add BlackRoad OS Pyto Server"
   git push origin main
   ```

2. **Connect to Railway:**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Python and deploy

3. **Configure environment:**
   - Click on your service
   - Go to "Variables" tab
   - Add required environment variables
   - Railway will auto-redeploy

### Method 3: Deploy via Railway Dashboard

1. **Go to Railway dashboard:**
   - Visit https://railway.app
   - Click "New Project" → "Empty Project"

2. **Create service:**
   - Click "New" → "GitHub Repo" or "Empty Service"
   - Connect your GitHub repo or upload files manually

3. **Configure build:**
   Railway auto-detects `railway.toml` and builds automatically

4. **Set environment variables:**
   - Variables tab → Add variables from `.env.example`

5. **Generate domain:**
   - Settings tab → Generate Domain

### Railway Configuration

The `railway.toml` file configures:
```toml
[build]
builder = "NIXPACKS"  # Auto-detects Python

[deploy]
startCommand = "python main.py"
healthcheckPath = "/health"
```

### Cost Estimation

**Free Tier:**
- $5 credit/month
- 512MB RAM
- Shared CPU
- Good for: 500-1000 agents

**Pro Plan ($20/month):**
- 8GB RAM
- 8 vCPU
- Custom domains
- Good for: 10,000+ agents

### Monitoring on Railway

1. **View logs:**
   - Dashboard → Your service → Logs tab

2. **Check metrics:**
   - Dashboard → Your service → Metrics tab

3. **Set up alerts:**
   - Settings → Webhooks
   - Configure alerts for downtime

---

## 🐳 Deploy with Docker

### Prerequisites
- Docker installed
- Docker Hub account (optional)

### Step 1: Create Dockerfile

```dockerfile
# Save as: Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY main.py .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Run server
CMD ["python", "main.py"]
```

### Step 2: Build Image

```bash
# Build image
docker build -t blackroad-os-pyto-server .

# Run container
docker run -d \
  --name blackroad-server \
  -p 8080:8080 \
  -e ENVIRONMENT=production \
  blackroad-os-pyto-server

# Check logs
docker logs -f blackroad-server

# Test
curl http://localhost:8080/health
```

### Step 3: Push to Docker Hub (Optional)

```bash
# Login
docker login

# Tag image
docker tag blackroad-os-pyto-server yourusername/blackroad-os-pyto-server:latest

# Push
docker push yourusername/blackroad-os-pyto-server:latest
```

### Docker Compose (Optional)

```yaml
# Save as: docker-compose.yml
version: '3.8'

services:
  blackroad-server:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ENVIRONMENT=production
      - PORT=8080
      - HOST=0.0.0.0
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Add Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## ☁️ Deploy to Cloud Platforms

### Cloudflare Workers (Not Recommended)
- Python not natively supported
- Requires WASM compilation
- Limited to 128MB memory

### Heroku
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create blackroad-os-pyto

# Add Procfile
echo "web: python main.py" > Procfile

# Deploy
git push heroku main

# Set env vars
heroku config:set ANTHROPIC_API_KEY=your_key_here

# Open app
heroku open
```

### DigitalOcean App Platform
1. Connect GitHub repo
2. Select Python
3. Configure build command: `pip install -r requirements.txt`
4. Configure run command: `python main.py`
5. Add environment variables
6. Deploy

### AWS Lambda (Advanced)
- Use AWS Lambda + API Gateway
- Package with Zappa or Serverless Framework
- Cold start: 1-3 seconds
- Cost: ~$1-5/month for 10K requests

### Google Cloud Run
```bash
# Install gcloud CLI
brew install google-cloud-sdk

# Login
gcloud auth login

# Deploy
gcloud run deploy blackroad-os-pyto \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🔒 Security Hardening

### 1. Environment Variables
Never commit secrets to git:
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
```

### 2. HTTPS Only
```python
# Add to main.py
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
app.add_middleware(HTTPSRedirectMiddleware)
```

### 3. CORS Restrictions
```python
# Update CORS in main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Restrict origins
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Limit methods
    allow_headers=["*"],
)
```

### 4. Rate Limiting
```bash
# Install slowapi
pip install slowapi

# Add to main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/agents", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
async def list_agents():
    ...
```

### 5. API Keys
```python
# Add API key authentication
from fastapi import Security, HTTPException
from fastapi.security.api_key import APIKeyHeader

API_KEY = os.getenv("API_KEY", "your-secret-key")
api_key_header = APIKeyHeader(name="X-API-Key")

def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key

# Protect endpoints
@app.post("/agents/spawn", dependencies=[Depends(verify_api_key)])
async def spawn_agent():
    ...
```

---

## 📊 Monitoring & Logging

### 1. Structured Logging
```python
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(json.dumps({
        "method": request.method,
        "path": request.url.path,
        "timestamp": datetime.now(UTC).isoformat()
    }))
    response = await call_next(request)
    return response
```

### 2. Error Tracking (Sentry)
```bash
pip install sentry-sdk[fastapi]
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
)
```

### 3. Prometheus Metrics
```bash
pip install prometheus-fastapi-instrumentator
```

```python
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

---

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl https://your-deployment-url/health
```

### 2. Full Test Suite
```bash
python test_client.py
```

### 3. Load Testing
```bash
# Install hey
brew install hey

# Run load test (1000 requests, 50 concurrent)
hey -n 1000 -c 50 https://your-deployment-url/health
```

---

## 🆘 Troubleshooting

### Server won't start
```bash
# Check Python version
python --version  # Must be 3.11+

# Check dependencies
pip list | grep fastapi

# Check port availability
lsof -i :8080
```

### Memory issues
```bash
# Check memory usage
curl https://your-url/system/metrics

# Reduce MAX_AGENTS
export MAX_AGENTS=1000
```

### High latency
```bash
# Check logs
railway logs  # Railway
docker logs blackroad-server  # Docker

# Enable debug logging
export LOG_LEVEL=DEBUG
```

---

## 📞 Support

- **GitHub Issues:** https://github.com/BlackRoad-OS/blackroad-os-core/issues
- **Email:** blackroad.systems@gmail.com
- **Railway Docs:** https://docs.railway.app
- **Pyto Docs:** https://pyto.app

---

**Ready to deploy! 🚀**

Choose your platform and follow the steps above. For most users, we recommend **Railway** for the best balance of ease and features.
