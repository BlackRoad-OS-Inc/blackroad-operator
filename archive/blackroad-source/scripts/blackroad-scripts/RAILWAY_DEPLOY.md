# Deploy BlackRoad Web to Railway

## Quick Deployment Steps

### 1. Install Railway CLI (if not already installed)

```bash
npm install -g @railway/cli
# or
brew install railway
```

### 2. Login to Railway

```bash
railway login
```

This will open your browser to authenticate with Railway.

### 3. Initialize Railway Project

From the `services/web` directory:

```bash
cd /Users/alexa/services/web

# Link to existing project or create new one
railway link

# Or create a new project
railway init
```

### 4. Set Environment Variables

```bash
railway variables set SERVICE_NAME=blackroad-os-web
railway variables set SERVICE_ENV=production
railway variables set SERVICE_VERSION=0.0.1
railway variables set NEXT_PUBLIC_APP_NAME="BlackRoad Web"
railway variables set NEXT_PUBLIC_BASE_URL=https://web.blackroad.systems
```

### 5. Deploy

```bash
railway up
```

Railway will:
- Detect the `railway.json` configuration
- Use Nixpacks to build the project
- Run `npm install && npm run build`
- Start the service with `npm start`
- Set up health checks on `/api/health`

### 6. Get Your Railway URL

```bash
railway status
```

This will show your deployment URL, something like:
`https://blackroad-os-web-production-xxxx.up.railway.app`

### 7. Test the Deployment

```bash
# Replace with your actual Railway URL
curl https://your-service.up.railway.app/api/health
curl https://your-service.up.railway.app/api/version
curl https://your-service.up.railway.app/api/ready
```

## Configure Custom Domain (Cloudflare)

### In Railway Dashboard

1. Go to your project → Settings → Domains
2. Click "Add Custom Domain"
3. Enter: `web.blackroad.systems`
4. Railway will provide a CNAME target

### In Cloudflare Dashboard

1. Go to DNS → Records
2. Add CNAME record:
   - **Type**: CNAME
   - **Name**: `web`
   - **Target**: `[your-railway-url].up.railway.app` (from step 6)
   - **Proxy status**: Proxied (orange cloud) ✓
   - **TTL**: Auto

3. Verify DNS propagation:
```bash
dig web.blackroad.systems
```

4. Test custom domain:
```bash
curl https://web.blackroad.systems/api/health
```

## Alternative: Deploy via Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Set root directory: `services/web`
6. Railway auto-detects `railway.json`
7. Add environment variables in Settings → Variables
8. Deploy automatically triggers

## Monitoring

### View Logs
```bash
railway logs
```

### View Deployments
```bash
railway status
```

### Open in Browser
```bash
railway open
```

## Environment Variables Reference

Required variables for production:

| Variable | Value |
|----------|-------|
| `SERVICE_NAME` | `blackroad-os-web` |
| `SERVICE_ENV` | `production` |
| `SERVICE_VERSION` | `0.0.1` |
| `NEXT_PUBLIC_APP_NAME` | `BlackRoad Web` |
| `NEXT_PUBLIC_BASE_URL` | `https://web.blackroad.systems` |

## Troubleshooting

### Build Fails

Check logs:
```bash
railway logs --deployment
```

### Service Won't Start

1. Check health endpoint is accessible
2. Verify `railway.json` is in the root of the service directory
3. Ensure `package.json` scripts are correct

### DNS Not Resolving

1. Wait 5-10 minutes for DNS propagation
2. Check Cloudflare DNS records
3. Verify CNAME target matches Railway URL
4. Ensure proxy (orange cloud) is enabled

## Next Steps

After successful deployment:

1. Deploy Prism service: `cd ../prism && railway up`
2. Deploy Operator service: `cd ../operator && railway up`
3. Set up remaining services from the registry
4. Configure monitoring and alerts
5. Set up CI/CD for automatic deployments

## Railway Configuration

The `railway.json` file in this directory configures:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Useful Commands

```bash
# View service status
railway status

# View logs
railway logs

# View environment variables
railway variables

# SSH into container
railway run bash

# Restart service
railway restart

# Delete service
railway down
```

---

**Ready to Deploy**: All files are configured and ready for Railway deployment.
