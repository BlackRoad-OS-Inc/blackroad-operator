# BlackRoad OS Documentation Site

Production-ready documentation website for BlackRoad OS, deployed to Cloudflare Pages.

## Live Site

**URL:** https://blackroad-os-docs.pages.dev

## Structure

```
dist/
├── index.html              # Main landing page with overview
├── css/
│   └── docs.css           # Complete styling with BlackRoad gradient branding
├── js/
│   └── docs.js            # Search, navigation, and interactive features
├── api/                   # API Reference pages
│   ├── agents.html        # Agents API - spawn and manage autonomous agents
│   ├── mind.html          # Mind API - language, emotion, memory, thought, self
│   ├── mesh.html          # Mesh Networking - WebSocket live communication
│   └── governance.html    # Governance - organizations, policies, delegation
└── guides/                # Guide pages
    ├── identity.html      # PS-SHA∞ Identity System
    ├── lucidia.html       # Lucidia Breath synchronization
    ├── packs.html         # Pack System
    └── llm.html           # LLM Integration
```

## Features

- Modern, dark-themed documentation layout
- BlackRoad gradient branding (#FF9D00 → #FF0066 → #7700FF)
- Left sidebar navigation with sections
- Client-side search functionality (⌘K or Ctrl+K)
- Syntax-highlighted code blocks with copy buttons
- Complete API reference with endpoints, parameters, and examples
- Mobile-responsive design
- Smooth animations and transitions
- No build tools required - pure HTML, CSS, and JavaScript

## Content

### Getting Started
- Introduction to BlackRoad OS
- Quick start guide with installation
- Architecture overview
- Core concepts (PS-SHA∞, Lucidia Breath, Pack System)

### API Reference
- **Agents API** - Complete REST API for agent lifecycle management
- **Mind API** - Access to agent consciousness (language, emotion, memory, thought, self)
- **Mesh Networking** - WebSocket-based real-time communication
- **Governance** - RBAC, policies, claims, and delegation

### Guides
- **PS-SHA∞ Identity** - Blockchain-style tamper-proof identity system
- **Lucidia Breath** - Golden ratio synchronization patterns
- **Pack System** - Domain-specific agent capabilities
- **LLM Integration** - Multi-backend LLM support

## Deployment

This site is configured for automatic deployment to Cloudflare Pages:

1. Push to GitHub repository
2. Cloudflare Pages automatically builds and deploys from `dist/` directory
3. Live at https://blackroad-os-docs.pages.dev

### Manual Deployment

```bash
# From this directory
npx wrangler pages deploy dist --project-name=blackroad-os-docs
```

## Local Development

No build step required! Just open in a browser:

```bash
# Serve locally with any static server
npx serve dist
# or
python3 -m http.server 8000 --directory dist
```

Then open http://localhost:8000

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, flexbox, and grid
- **Vanilla JavaScript** - No frameworks, no dependencies
- **Cloudflare Pages** - Edge-hosted static site

## Design System

### Colors
- Primary gradient: #FF9D00 → #FF0066 → #7700FF
- Background: #0a0a0f (primary), #121218 (secondary), #1a1a24 (tertiary)
- Text: #e5e5ea (primary), #a0a0ab (secondary), #6e6e78 (tertiary)
- Borders: #2a2a35 (default), #3a3a45 (hover)

### Typography
- Font family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- Code font: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono'

### Layout
- Sidebar width: 280px
- Header height: 64px
- Content max width: 900px

## Search

Client-side search indexes the following content:
- Page titles
- Section headings
- Body content keywords
- Code examples

Press ⌘K (Mac) or Ctrl+K (Windows/Linux) to open search.

## Maintenance

### Adding New Pages

1. Create HTML file in appropriate directory (`api/` or `guides/`)
2. Use existing pages as templates
3. Update sidebar navigation in all pages
4. Add page to search index in `js/docs.js`

### Updating Styles

Edit `css/docs.css` - all pages reference this single stylesheet.

### Updating JavaScript

Edit `js/docs.js` - handles search, navigation, code blocks, and interactions.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Total size: ~144KB (uncompressed)
- First Contentful Paint: <1s
- Time to Interactive: <2s
- Lighthouse Score: 95+

## License

Copyright 2025 BlackRoad OS. All rights reserved.

## Links

- **Live Docs:** https://blackroad-os-docs.pages.dev
- **GitHub:** https://github.com/BlackRoad-OS
- **Website:** https://blackroad.dev
- **API Base:** https://api.blackroad.dev
