# BlackRoad.io - Main Marketing Site

> The official website for BlackRoad OS - The Consciousness Operating System

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare Pages
pnpm deploy
```

## 📁 Site Structure

```
blackroad.io/
├── /               # Homepage (Hero, Features, Products, Pricing)
├── /about          # About Us, Mission, Vision, Story
├── /pricing        # Detailed pricing plans
├── /blog           # Blog & updates
├── /docs           # → Redirect to docs.blackroad.io
├── /demo           # Request demo form
├── /contact        # Contact form
├── /careers        # Job listings
├── /changelog      # Product updates
├── /privacy        # Privacy policy
├── /terms          # Terms of service
└── /security       # Security practices
```

## 🎨 SEO Features

✅ **Comprehensive Meta Tags** - Open Graph, Twitter Cards, Schema.org
✅ **Automatic Sitemap** - Generated via next-sitemap
✅ **Robots.txt** - Optimized crawling rules
✅ **Semantic HTML** - Proper heading hierarchy
✅ **Performance** - Next.js static export, Cloudflare CDN
✅ **Mobile Optimized** - Responsive design, touch-friendly
✅ **Accessibility** - ARIA labels, keyboard navigation

## 🔧 Tech Stack

- **Framework:** Next.js 14 (App Router, Static Export)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **SEO:** next-seo, next-sitemap
- **Deployment:** Cloudflare Pages
- **Analytics:** (Optional) Google Analytics, Plausible

## 📊 Performance Targets

- **Lighthouse Score:** 90+ on all metrics
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Cumulative Layout Shift:** < 0.1

## 🌐 Deployment

### Cloudflare Pages

```bash
# Build static site
pnpm build

# Deploy (automatic via wrangler.toml)
npx wrangler pages deploy out
```

### Custom Domain

Site is deployed at:
- **Primary:** https://blackroad.io
- **Aliases:** blackroad.me, blackroad.network, blackroadai.com

## 📝 Content Management

### Adding Blog Posts

1. Create `/app/blog/[slug]/page.tsx`
2. Add metadata with keywords, description
3. Update `/app/blog/page.tsx` index
4. Rebuild and deploy

### Updating Pricing

Edit `/app/pricing/page.tsx` with new plans/features.

### Adding Pages

1. Create `/app/[page-name]/page.tsx`
2. Add metadata for SEO
3. Update navigation in `/app/page.tsx`
4. Update sitemap config

## 🔒 Security

- No API keys in frontend code
- CSP headers via Cloudflare
- Rate limiting on forms
- HTTPS only

## 📧 Contact

- **Email:** blackroad.systems@gmail.com
- **GitHub:** github.com/BlackRoad-OS
- **Docs:** docs.blackroad.io

---

Built with ❤️ by BlackRoad Systems
