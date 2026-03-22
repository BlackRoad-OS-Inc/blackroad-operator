# BlackRoad OS - Unified Application

This is the production BlackRoad OS application deployed to blackroad.io.

## Architecture

- **Frontend**: Next.js 16 static export deployed to Cloudflare Pages
- **Backend**: Cloudflare Workers for API endpoints
- **3D Metaverse**: Integrated Three.js universe at /metaverse

## Deployments

- **Main Site**: https://blackroad.io (via Cloudflare Pages project: blackroad-os-web)
- **API**: https://blackroad-api.blackroad.workers.dev (Worker)
- **Preview**: https://0cb777dd.blackroad-os-web.pages.dev

## Local Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare Pages
wrangler pages deploy out --project-name=blackroad-os-web

# Deploy API worker
cd workers/api && wrangler deploy
```

## Project Structure

```
blackroad-io-app/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── dashboard/         # Dashboard
│   └── metaverse/         # 3D metaverse page
├── public/                # Static assets
│   └── metaverse/         # Metaverse JS files
├── workers/               # Cloudflare Workers
│   └── api/              # API worker
└── out/                   # Build output (static export)
```

## API Endpoints

- `GET /health` - Health check
- `GET /version` - Version info
- `GET /agents` - List agents

## Features

✅ Next.js 16 with App Router
✅ Static export for maximum performance
✅ Cloudflare Pages deployment
✅ Cloudflare Workers API
✅ 3D Metaverse integration
✅ Responsive design
✅ Tailwind CSS 4

## TODO

- [ ] Add Cloudflare Access for authentication
- [ ] Connect API routes to production backend
- [ ] Enhance metaverse with agent visualizations
- [ ] Add real-time agent status updates
- [ ] Implement dashboard data fetching from API

## Deployment History

- 2025-12-22: Initial deployment to Cloudflare Pages

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
