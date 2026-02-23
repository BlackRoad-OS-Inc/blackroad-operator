# BlackRoad Deployment Documentation

Complete operational documentation for deploying sites across the BlackRoad infrastructure.

## 📚 Documentation Index

### Universal Deployment System
- **[DEPLOYMENT-SYSTEM-README.md](./DEPLOYMENT-SYSTEM-README.md)** - Complete guide to the universal deployment script
- **[blackroad-deploy-system.sh](./blackroad-deploy-system.sh)** - The deployment script itself

### DNS Configuration
- **[dns-update-guide.md](./dns-update-guide.md)** - Manual DNS update procedures (rarely needed)

### Deployment Summaries
- **[docs-deployment-summary.md](./docs-deployment-summary.md)** - Master infrastructure inventory and docs.blackroad.io deployment
- **[lucidia-earth-deployment-summary.md](./lucidia-earth-deployment-summary.md)** - lucidia.earth deployment details
- **[lucidia-earth-deployment-plan.md](./lucidia-earth-deployment-plan.md)** - Original build plan for lucidia.earth

## 🚀 Quick Start

Deploy any domain with one command:

```bash
# Deploy to Cloudflare Pages (static sites)
~/blackroad-deploy-system.sh pages myapp.blackroad.io ~/projects/myapp

# Deploy to Docker on aria64 (dynamic sites)
~/blackroad-deploy-system.sh docker api.blackroad.io ~/projects/api

# Route existing port through tunnel
~/blackroad-deploy-system.sh tunnel newsite.blackroad.io 3060
```

## 📖 Key Concepts

### Infrastructure
- **aria64** (192.168.4.64) - Raspberry Pi running all Docker containers
- **Caddy** - Reverse proxy handling all HTTP/HTTPS routing
- **Cloudflare Tunnel** - Secure routing without port forwarding
- **Cloudflare Pages** - Static site hosting platform

### Deployment Methods
1. **Cloudflare Pages** - Best for static sites (Next.js, React, Vue)
2. **Docker on aria64** - Best for APIs and custom backends
3. **Cloudflare Tunnel** - Route existing services to public domains

### Automation
- ✅ Zero-config DNS (Cloudflare Tunnel auto-creates records)
- ✅ Automatic SSL certificates
- ✅ GitHub integration
- ✅ Container management
- ✅ Port allocation

## 🏗️ Current Deployments

### Major Sites
- **blackroad.io** (Port 3000) - Main landing page
- **lucidia.earth** (Port 3040) - The soul site
- **docs.blackroad.io** (Port 3050) - Documentation
- **earth.blackroad.io** (Port 3013) - Earth subdomain
- **16+ other sites** (Ports 3001-3031) - Various BlackRoad projects

### Infrastructure Services
- **Caddy** (Ports 80/443) - Reverse proxy
- **Portainer** (Ports 9000/9443) - Container management
- **LLM Service** (Port 8000) - AI services

## 🔧 Common Operations

### Check Deployment Status
```bash
~/blackroad-deploy-system.sh status yourdomain.com
```

### List All Deployments
```bash
~/blackroad-deploy-system.sh list
```

### Update Existing Site
```bash
cd ~/projects/yoursite
git add . && git commit -m "Updates" && git push
ssh aria64 "cd ~/blackroad/yoursite && git pull && docker build -t yoursite:latest . && docker restart yoursite"
```

### View Container Logs
```bash
ssh aria64 "docker logs -f container-name"
```

## 📞 Support

For issues, check:
1. Script output for detailed error messages
2. Container logs: `docker logs container-name`
3. Caddy logs: `docker logs caddy`
4. DNS resolution: `dig +short domain @1.1.1.1`
5. Status check: `~/blackroad-deploy-system.sh status domain`

## 🔗 Related Repositories

- [BlackRoad-OS/lucidia-earth-website](https://github.com/BlackRoad-OS/lucidia-earth-website)
- [BlackRoad-OS/blackroad-docs](https://github.com/BlackRoad-OS/blackroad-docs)
- [BlackRoad-OS organization](https://github.com/BlackRoad-OS)

---

**Last Updated:** December 22, 2025
**Status:** Production Ready ✅

---

## 📜 License & Copyright

**Copyright © 2026 BlackRoad OS, Inc. All Rights Reserved.**

**CEO:** Alexa Amundson | **PROPRIETARY AND CONFIDENTIAL**

This software is NOT for commercial resale. Testing purposes only.

### 🏢 Enterprise Scale:
- 30,000 AI Agents
- 30,000 Human Employees
- CEO: Alexa Amundson

**Contact:** blackroad.systems@gmail.com

See [LICENSE](LICENSE) for complete terms.
