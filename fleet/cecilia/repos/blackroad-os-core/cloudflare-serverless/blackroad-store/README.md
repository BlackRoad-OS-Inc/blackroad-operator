# BlackRoad Store

A complete e-commerce store for BlackRoad OS products and services.

## Overview

Professional e-commerce site selling BlackRoad OS subscriptions, agent packs, custom development services, enterprise support, and branded merchandise. Built with vanilla HTML/CSS/JS for deployment on Cloudflare Pages.

## Products

### 1. Subscriptions
- **Free**: $0/month - 100 agents, 10K API calls, 1 pack
- **Pro**: $49/month - 10K agents, unlimited API calls, all packs
- **Enterprise**: $499/month - 30K+ agents, dedicated infrastructure, custom SLA

### 2. Agent Packs ($29 each or $99 for all 5)
- **Finance Pack**: Transaction analysis, risk assessment, portfolio management
- **Legal Pack**: Contract analysis, case law research, compliance monitoring
- **Research Lab Pack**: Literature review, data analysis, hypothesis testing
- **Creator Studio Pack**: Content generation, marketing, social media
- **Infra DevOps Pack**: Deployment automation, monitoring, incident response

### 3. Custom Services
- **Single Agent Development**: $499 - Custom agent for specific use case
- **Custom Agent Suite**: $1,499 - Multi-agent system (3-5 agents)
- **Enterprise Pack Development**: $2,499 - Complete custom pack

### 4. Enterprise Support Plans
- **Basic Support**: $199/month - Email support, monthly office hours
- **Professional Support**: $499/month - Slack support, weekly office hours, architecture reviews
- **Enterprise Support**: $999/month - 24/7 phone support, dedicated team, custom SLA

### 5. Merchandise
- T-Shirts: $29
- Hoodies: $59
- Sticker Packs: $15
- Mugs: $19

## File Structure

```
dist/
├── index.html              # Homepage with product showcase
├── products/
│   ├── subscriptions.html  # Subscription plans with comparison table
│   ├── packs.html         # Agent packs catalog
│   └── services.html      # Professional services & support
├── css/
│   └── store.css          # Complete styling with BlackRoad dark theme
├── js/
│   └── store.js           # Shopping cart and checkout logic
└── 404.html               # Custom error page
```

## Features

### Design
- Dark theme with BlackRoad gradient colors (#FF9D00 → #0066FF)
- Modern card-based layout
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Accessible navigation

### Shopping Cart
- Persistent cart (localStorage)
- Real-time updates
- Slide-out sidebar
- Item management (add/remove)
- Total calculation
- Cart badge counter

### Checkout
- Demo checkout modal
- Line item summary
- Stripe integration ready
- Email contact fallback
- Support for subscriptions and one-time purchases

### User Experience
- Smooth scrolling
- Keyboard navigation (Escape to close modals)
- Toast notifications
- Loading states
- Error handling

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox
- **JavaScript (ES6+)**: Classes, LocalStorage API, Event handling
- **No frameworks**: Pure vanilla JS for maximum performance

## Deployment

### Cloudflare Pages

1. Push to GitHub repository
2. Connect to Cloudflare Pages
3. Build settings:
   - Build command: (none - static site)
   - Build output directory: `/dist`
   - Root directory: `/cloudflare-serverless/blackroad-store`

### Custom Domain
- Connect custom domain in Cloudflare Pages settings
- Automatic HTTPS via Cloudflare

## Development

### Local Preview
```bash
# Simple HTTP server
cd dist
python3 -m http.server 8000
# or
npx serve
```

Visit http://localhost:8000

### File Watching
```bash
# Install live-server globally
npm install -g live-server

# Run from dist directory
cd dist
live-server
```

## Integration Points

### Stripe Checkout (Production)
Update `store.js` with Stripe integration:

```javascript
async checkout() {
    const stripe = Stripe('your-publishable-key');
    const { error } = await stripe.redirectToCheckout({
        lineItems: this.items.map(item => ({
            price: item.stripePriceId,
            quantity: item.quantity
        })),
        mode: hasSubscriptions ? 'subscription' : 'payment',
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/cart',
    });
}
```

### Analytics
Uncomment Google Analytics tracking in `store.js`:

```javascript
Analytics.trackPageView(window.location.pathname);
Analytics.trackAddToCart(product);
Analytics.trackCheckout(items, value);
```

## Color Palette

```css
--gradient-start: #FF9D00  /* Orange */
--gradient-1: #FF6B00      /* Deep Orange */
--gradient-2: #FF0066      /* Pink */
--gradient-3: #FF006B      /* Magenta */
--gradient-4: #D600AA      /* Purple */
--gradient-5: #7700FF      /* Violet */
--gradient-end: #0066FF    /* Blue */
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Vanilla JS (no framework overhead)
- Lazy loading ready
- Service worker ready (PWA)
- Minimal dependencies
- Optimized CSS (CSS Grid/Flexbox)

## Contact

For sales inquiries: blackroad.systems@gmail.com

## License

© 2025 BlackRoad OS. All rights reserved.
