# Lucidia Railway Deployment Instructions

## Status: READY TO DEPLOY ✅

**What's Ready:**
- ✅ Dockerfile created
- ✅ railway.json configured
- ✅ Backend dependencies verified
- ✅ 14 API endpoints ready
- ✅ Railway CLI authenticated

## Deployment Steps

### Option 1: Quick Deploy (Automated)
```bash
cd ~/lucidia-enhanced
railway init
railway up
railway domain
```

### Option 2: Manual Deploy
1. Go to https://railway.app/dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `BlackRoad-OS/lucidia-enhanced`
4. Railway will auto-detect Dockerfile
5. Add environment variables:
   - `PORT=8080` (auto-provided)
   - `OLLAMA_HOST=http://octavia:11434` (if using Ollama)
6. Deploy!

## Required Environment Variables

```bash
PORT=8080                              # Auto-provided by Railway
OLLAMA_HOST=http://octavia:11434       # Optional: External Ollama server
ENVIRONMENT=production
```

## Post-Deployment Verification

```bash
# Test health endpoint
curl https://your-lucidia.railway.app/health

# Test API version
curl https://your-lucidia.railway.app/api/version

# Test documentation
curl https://your-lucidia.railway.app/docs
```

## API Endpoints Available

1. `/` - Root
2. `/health` - Health check
3. `/api/version` - Version info
4. `/api/ready` - Readiness probe
5. `/api/chat` - Chat endpoint
6. `/api/router/parse` - Intent parsing
7. `/api/tools/blackroad os/search` - BlackRoad OS search
8. `/api/tools/memory/read` - Memory access
9. `/api/tools/commands/execute` - Command execution
10. `/api/voice/synthesize` - Text-to-speech
11. `/api/voice/transcribe` - Speech-to-text
12. `/api/voice/status` - Voice system status
13. `/docs` - Swagger UI
14. `/redoc` - ReDoc UI

## Next Steps

Once deployed:
1. Get Railway URL
2. Update DNS: lucidia.blackroad.systems → Railway URL
3. Test all endpoints
4. Add to monitoring dashboard
5. Configure webhooks for auto-deploy

## Current Blocker

**ACTION REQUIRED:** Create Railway project

Run this command:
```bash
cd ~/lucidia-enhanced && railway init
```

Then tell Hermes: "railway project created"
