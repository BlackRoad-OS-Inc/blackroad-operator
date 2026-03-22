# BlackRoad Design System Templates

[![HTML](https://img.shields.io/badge/HTML-15%2B_templates-E34F26.svg)](https://blackroad.io)
[![CSS](https://img.shields.io/badge/CSS-gradient--first-1572B6.svg)](https://blackroad.io)
[![Dark Mode](https://img.shields.io/badge/dark-mode-000000.svg)](https://blackroad.io)



A collection of HTML templates built with the BlackRoad Design System.

## Templates

| # | File | Description |
|---|------|-------------|
| 01 | `01-landing.html` | Landing page with hero, features, stats, CTA |
| 02 | `02-dashboard.html` | App dashboard with sidebar, tables, charts |
| 03 | `03-auth.html` | Login/signup with OAuth buttons |
| 04 | `04-docs.html` | Documentation with sidebar, code blocks, TOC |
| 05 | `05-pricing.html` | Pricing tiers with comparison table, FAQ |
| 06 | `06-contact.html` | Contact form with office locations |
| 07 | `07-animation-showcase.html` | 18 CSS/Canvas animations gallery |
| 08 | `08-404.html` | Error page with glitch effects |
| 09 | `09-blog.html` | Blog listing with featured post, grid |
| 10 | `10-settings.html` | Settings page with forms, toggles |
| 11 | `11-status.html` | System status page with uptime chart |
| 12 | `12-profile.html` | User profile with avatar, activity feed, contributions |
| 13 | `13-changelog.html` | Release notes with version timeline |
| 14 | `14-onboarding.html` | Multi-step wizard with progress bar |
| 15 | `15-api.html` | API reference with endpoints, code examples |
| 16 | `16-team.html` | Team page with leadership, members, values |
| 17 | `17-integrations.html` | Integrations marketplace with categories |

## Design System

### Colors

```css
/* Grayscale */
--gray-950: #000000;
--gray-900: #0a0a0a;
--gray-800: #1a1a1a;
--gray-700: #404040;
--gray-600: #525252;
--gray-500: #737373;
--gray-400: #a3a3a3;
--gray-300: #d4d4d4;
--gray-100: #f5f5f5;

/* Accent Gradient */
--accent-1: #ff8700;  /* Orange */
--accent-2: #ff5f00;  /* Deep Orange */
--accent-3: #ff0087;  /* Hot Pink */
--accent-4: #af5fd7;  /* Purple */
--accent-5: #ff00ff;  /* Magenta */
--accent-6: #1e90ff;  /* Electric Blue */

/* Status */
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

### Typography

- **Headlines**: Space Grotesk
- **Body**: Inter
- **Code/Data**: JetBrains Mono

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;
--radius-xl: 12px;
--radius-2xl: 16px;
```

## Usage

Each template is a self-contained HTML file with embedded CSS. Just open in a browser or deploy to any static hosting:

```bash
# Local preview
open 01-landing.html

# Deploy to Cloudflare Pages
npx wrangler pages deploy .
```

## License

MIT - BlackRoad OS 2026
