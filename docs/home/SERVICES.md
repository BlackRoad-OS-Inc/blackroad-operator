# BlackRoad OS Services

Overview of all BlackRoad OS microservices.

## Core Services

### 🌐 Web (`services/web`)
Main web interface with authentication and checkout.
- **Port:** 3000
- **Status:** ✅ Active
- **URL:** https://blackroad.io

### 🔍 Prism (`services/prism`)
Data scraping and indexing service.
- **Port:** 3001
- **Status:** ✅ Active
- **URL:** https://prism.blackroad.io

### ⚙️ Operator (`services/operator`)
Operations control center.
- **Port:** 3002
- **Status:** ✅ Active
- **URL:** https://operator.blackroad.io

### 📡 API (`services/api`)
Central API gateway.
- **Port:** 3003
- **Status:** ✅ Active
- **URL:** https://api.blackroad.io

## Additional Services

### 🗺️ Atlas (`services/atlas`)
Service discovery and mapping.

### 🎨 Brand (`services/brand`)
Brand assets and design system.

### 📚 Docs (`services/docs`)
Documentation portal.

### 🏠 Home (`services/home`)
Landing and marketing pages.

### 💡 Ideas (`services/ideas`)
Innovation and experimentation.

### 🔬 Research (`services/research`)
R&D and prototyping.

### 🎮 Demo (`services/demo`)
Interactive demonstrations.

### 🖥️ Desktop (`services/desktop`)
Desktop application interface.

### 🛠️ Developer (`services/developer`)
Developer tools and SDKs.

### 🏗️ Infra (`services/infra`)
Infrastructure management.

### 🎯 Core (`services/core`)
Core platform utilities.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start a service
cd services/web && pnpm dev

# Start multiple services
cd services/web && pnpm dev &
cd services/prism && pnpm dev &
cd services/operator && pnpm dev &
```

## Architecture

All services follow the same structure:
- Next.js 14 + TypeScript
- API routes in `app/api/`
- UI components in `app/`
- Environment config in `.env`

## Deployment

Services deploy to:
- **Vercel**: Web service
- **Cloudflare Pages**: Static services
- **Railway**: API and backend services

Routing handled by `blackroad-router` Cloudflare Worker.

Built with ❤️ by BlackRoad Infrastructure
