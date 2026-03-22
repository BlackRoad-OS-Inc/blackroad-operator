# 🌌 BlackRoad OS Web

**Production-grade Next.js application with 5 quantum domains** - Full-stack BlackRoad OS web platform with official brand design system.

## 🌐 Live Deployments

This application serves **5 quantum domains**:
- **blackroad.io** - Primary domain
- **blackroadai.com** - AI-focused portal
- **blackroadquantum.com** - Quantum computing interface
- **lucidia.earth** - Companion AI platform
- **earth.blackroad.io** - Earth visualization

## ✨ Features

- **Next.js 15** - Latest App Router architecture
- **TypeScript** - Full type safety
- **Brand Compliant** - Official BlackRoad design system
- **Authentication** - Secure login/signup flows
- **Workspace** - Multi-domain workspace interface
- **Real-time** - Conversation and collaboration features
- **Responsive** - Mobile-first design

## 🎨 Brand Compliance

✅ **OFFICIAL BlackRoad Brand Design System Integrated:**
- Hot Pink (#FF1D6C) primary color
- Golden Ratio spacing (φ = 1.618): 8px, 13px, 21px, 34px, 55px, 89px, 144px
- SF Pro Display typography
- Line height: 1.618 (Golden Ratio)
- Official gradient: 135deg @ 38.2% & 61.8%
- No forbidden old colors

See `app/globals.css` for complete brand system implementation.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/BlackRoad-OS/blackroad-os-web.git
cd blackroad-os-web

# Install dependencies
npm install
# or
bun install

# Run development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
blackroad-os-web/
├── app/                    # Next.js App Router
│   ├── (app)/             # Authenticated app routes
│   │   ├── workspace/     # Main workspace
│   │   └── conversations/ # Chat interface
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── globals.css        # 🌌 OFFICIAL BRAND SYSTEM
│   └── layout.tsx         # Root layout
├── components/            # React components
├── stores/               # Zustand state management
├── lib/                  # Utilities
└── public/              # Static assets
```

## 🔧 Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check

# Check GitHub, Gitea, Vercel, and Cloudflare wiring
npm run platform:check

# Push the current branch to GitHub and Gitea
npm run push:all
```

## 🚢 Deployment

### Platform Topology

- **GitHub** powers CI/CD and deployment automation
- **Gitea** is the internal mirror and secondary remote at `git.blackroad.io`
- **Cloudflare Pages** serves the edge deployment path
- **Vercel** provides preview and production Next.js deployments

Recommended flow:

```bash
npm run platform:check
npm run push:all
```

### Cloudflare Pages

```bash
# Manual fallback deployment
npx wrangler pages deploy . --project-name=blackroad-os-web
```

### Vercel

Vercel is configured by `vercel.json` and `.github/workflows/vercel-deploy.yml`.

### Automatic Deployment

Pushes to `main` trigger:
- Cloudflare Pages production deploy
- Vercel production deploy

Pull requests trigger:
- Cloudflare Pages preview deploy
- Vercel preview deploy

### Required GitHub Secrets

```env
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_ACCOUNT_ID=...
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
```

### Expected Git Remotes

```bash
origin  -> GitHub
gitea   -> git.blackroad.io
```

## 🔐 Environment Variables

Create `.env.local`:

```env
# Required
NEXT_PUBLIC_API_URL=https://api.blackroad.io
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 📊 Performance

- **Lighthouse Score Target:** >90
- **First Contentful Paint:** <1.5s
- **Time to Interactive:** <3s
- **Core Web Vitals:** All Green

## 🔒 Security

- HTTPS enforced across all domains
- Security headers configured
- CSP (Content Security Policy)
- XSS protection
- CORS properly configured
- Environment variables for secrets

## 🧪 Testing

```bash
# Unit tests (when configured)
npm run test

# E2E tests (when configured)
npm run test:e2e
```

## 📚 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Official Brand System
- **State:** Zustand
- **Deployment:** Cloudflare Pages
- **CI/CD:** GitHub Actions

## 🤝 Contributing

This is a production repository serving 5 live domains. All changes require:

1. GitHub issue or approved task
2. Pull request with comprehensive description
3. Brand compliance verification
4. All tests passing
5. Code review approval
6. No breaking changes to live domains

## 📄 License

Copyright © 2026 BlackRoad OS, Inc. All rights reserved.

See [LICENSE](./LICENSE) for details.

## 🔗 Related Projects

- [BlackRoad API](https://github.com/BlackRoad-OS/blackroad-api)
- [BlackRoad OS Interface](https://github.com/BlackRoad-OS/blackroad-os-interface)
- [BlackRoad Quantum](https://github.com/BlackRoad-OS/blackroad-os-quantum)
- [BlackRoad 30k Agents](https://github.com/BlackRoad-OS/blackroad-30k-agents)

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [BlackRoad Brand System](../../BLACKROAD_BRAND_SYSTEM.md)
- [Traffic Light System](./TRAFFIC_LIGHT_SYSTEM.md)

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/BlackRoad-OS/blackroad-os-web/issues)
- **Email:** blackroad.systems@gmail.com

---

**Built with ❤️ by BlackRoad OS Team** | [blackroad.io](https://blackroad.io) | Powering 5 quantum domains
