# Alexa Amundson

**Product Engineer**

amundsonalexa@gmail.com | [github.com/blackboxprogramming](https://github.com/blackboxprogramming)

---

## Summary

99 live sites, but no design team. Built a brand-locked design system with 75 templates, 15 page types, and automated compliance auditing — every site ships on-brand because the system won't let you ship off-brand.

---

## Experience

### BlackRoad OS | Founder & Product Engineer | 2025–Present

**The System: Brand as Code**
- Gradient spectrum locked: #FF6B2B → #FF2255 → #CC00AA → #8844FF → #4488FF → #00D4FF. No other colors in containers with text
- Typography locked: Space Grotesk for display, JetBrains Mono for code, Inter for body. Golden ratio spacing (φ = 1.618)
- Automated brand compliance auditing — tooling scans all 99 sites for violations. Mass update tooling applies fixes fleet-wide

**The Coverage: 15 Page Types, Every SaaS Surface**
- Landing (hero, light alt), pricing, blog (listing + article), docs, dashboard, auth, portfolio, contact, error-404, status, settings, team, changelog
- 75 design templates (HTML/JSX) — each one brand-locked, responsive, and production-ready. Plug in content and deploy
- 99 Cloudflare Pages projects across 48+ custom domains — every site is live, every domain has SSL, every page loads in under 2 seconds

**The Product: AI Image Generation**
- images.blackroad.io — AI image generation hub with 4 backend agents, R2 storage, D1 metadata, single API endpoint
- Users request images by prompt. System routes to best model (DALL-E for quality, Flux for speed). Results stored and served from R2

---

## Technical Skills

React, Next.js, HTML/CSS, Cloudflare Pages, design systems, brand management, Figma

---

## Metrics

| Metric | Value | Source |
|--------|-------|--------|
| CF Pages | *live* | cloudflare.sh — wrangler pages list |
| Templates | *live* | local.sh — ls ~/Desktop/templates |
| Total Repos | *live* | github-all-orgs.sh — gh api repos (17 owners) |
| Lines of Code | *live* | loc.sh — cloc + fleet SSH |
| Nginx Sites | *live* | services.sh — /etc/nginx/sites-enabled via SSH |
| CLI Tools | *live* | local.sh — ls ~/bin | wc -l |
