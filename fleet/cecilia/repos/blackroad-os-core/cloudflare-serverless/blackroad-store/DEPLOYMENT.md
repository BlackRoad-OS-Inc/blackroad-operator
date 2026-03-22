# BlackRoad Store - Deployment Guide

Complete guide for deploying the BlackRoad Store to Cloudflare Pages.

## Quick Deploy

### Option 1: Cloudflare Pages (Recommended)

1. **Push to GitHub**
   ```bash
   cd /Users/alexa/blackroad-sandbox/cloudflare-serverless/blackroad-store
   git add .
   git commit -m "Add BlackRoad Store"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to Pages
   - Click "Create a project"
   - Connect to GitHub repository: `BlackRoad-OS/blackroad-os-brand`
   - Configure build settings:
     - **Framework preset**: None
     - **Build command**: (leave empty)
     - **Build output directory**: `cloudflare-serverless/blackroad-store/dist`
     - **Root directory**: `cloudflare-serverless/blackroad-store`

3. **Deploy**
   - Click "Save and Deploy"
   - Wait for deployment to complete
   - Your store will be live at `https://blackroad-store.pages.dev`

4. **Custom Domain** (Optional)
   - Go to Custom Domains in Pages settings
   - Add `store.blackroad.systems` or your preferred domain
   - Update DNS records as instructed
   - Automatic HTTPS enabled

### Option 2: Cloudflare Workers Sites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
cd /Users/alexa/blackroad-sandbox/cloudflare-serverless/blackroad-store
wrangler pages deploy dist --project-name=blackroad-store
```

### Option 3: Manual Upload

1. Go to Cloudflare Pages dashboard
2. Click "Upload assets"
3. Drag and drop the entire `dist/` folder
4. Deploy

## Configuration

### Environment Variables

No environment variables required for basic deployment. For production with Stripe:

```
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

Add via Cloudflare Pages Settings > Environment Variables

### Custom Headers

Headers are configured in `wrangler.toml`:
- Security headers (X-Frame-Options, CSP, etc.)
- Cache control for static assets
- Compression enabled

### Redirects

Configured in `wrangler.toml`:
- `/store` → `/`
- `/products` → `/products/subscriptions.html`
- `/pricing` → `/products/subscriptions.html`
- `/packs` → `/products/packs.html`
- `/services` → `/products/services.html`
- 404 handling

## Post-Deployment

### 1. Test All Pages

```bash
# Homepage
curl -I https://blackroad-store.pages.dev

# Subscriptions
curl -I https://blackroad-store.pages.dev/products/subscriptions.html

# Packs
curl -I https://blackroad-store.pages.dev/products/packs.html

# Services
curl -I https://blackroad-store.pages.dev/products/services.html

# 404
curl -I https://blackroad-store.pages.dev/nonexistent
```

### 2. Verify Cart Functionality

- Add items to cart
- Check localStorage persistence
- Test cart sidebar
- Verify checkout flow

### 3. Mobile Testing

Test on:
- iOS Safari
- Chrome Android
- Responsive breakpoints (320px, 768px, 1024px, 1440px)

### 4. Performance Testing

```bash
# Lighthouse audit
npx lighthouse https://blackroad-store.pages.dev --view

# PageSpeed Insights
# Visit https://pagespeed.web.dev/
```

Target scores:
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## Integration with Stripe

### 1. Create Stripe Products

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create products
stripe products create --name="BlackRoad OS Pro" --description="Professional agent infrastructure"
stripe prices create --product=prod_xxx --unit-amount=4900 --currency=usd --recurring[interval]=month

# Repeat for all products
```

### 2. Update store.js

Replace demo checkout with Stripe:

```javascript
async checkout() {
    const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

    const lineItems = this.items.map(item => ({
        price: item.stripePriceId, // Add to product data
        quantity: item.quantity
    }));

    const { error } = await stripe.redirectToCheckout({
        lineItems,
        mode: this.hasSubscriptions() ? 'subscription' : 'payment',
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cart`,
        customerEmail: undefined, // Optional
    });

    if (error) {
        console.error('Stripe error:', error);
        this.showNotification('Checkout failed. Please try again.');
    }
}
```

### 3. Create Success Page

Create `dist/success.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Order Confirmed | BlackRoad Store</title>
    <link rel="stylesheet" href="/css/store.css">
</head>
<body>
    <div class="success-page">
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase.</p>
        <a href="/" class="btn btn-primary">Back to Store</a>
    </div>
    <script src="/js/store.js"></script>
    <script>
        // Clear cart after successful purchase
        if (window.cart) {
            window.cart.clearCart();
        }
    </script>
</body>
</html>
```

## Analytics Integration

### Google Analytics 4

Add to `<head>` in all HTML files:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Uncomment tracking calls in `store.js`:

```javascript
Analytics.trackPageView(window.location.pathname);
Analytics.trackAddToCart(product);
Analytics.trackCheckout(items, value);
```

### Cloudflare Web Analytics

Add to `<head>`:

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js'
        data-cf-beacon='{"token": "your-token-here"}'></script>
```

## Monitoring

### Cloudflare Analytics

Built-in metrics:
- Page views
- Unique visitors
- Bandwidth
- Requests
- Performance

Access via Cloudflare Dashboard > Analytics

### Error Tracking

Add Sentry for error monitoring:

```html
<script src="https://browser.sentry-cdn.com/7.x.x/bundle.min.js"></script>
<script>
  Sentry.init({
    dsn: "https://your-dsn@sentry.io/project-id",
    environment: "production",
  });
</script>
```

## SEO Optimization

### 1. Update Meta Tags

Add to all pages:

```html
<!-- Open Graph -->
<meta property="og:title" content="BlackRoad Store - Autonomous Agent Infrastructure">
<meta property="og:description" content="Purchase BlackRoad OS subscriptions, agent packs, and services">
<meta property="og:image" content="https://store.blackroad.systems/og-image.png">
<meta property="og:url" content="https://store.blackroad.systems">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="BlackRoad Store">
<meta name="twitter:description" content="Autonomous agent infrastructure">
<meta name="twitter:image" content="https://store.blackroad.systems/twitter-card.png">
```

### 2. Add robots.txt

Create `dist/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://store.blackroad.systems/sitemap.xml
```

### 3. Add sitemap.xml

Create `dist/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://store.blackroad.systems/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://store.blackroad.systems/products/subscriptions.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://store.blackroad.systems/products/packs.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://store.blackroad.systems/products/services.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>
```

## Security Checklist

- [x] HTTPS enabled (automatic with Cloudflare)
- [x] Security headers configured
- [x] No sensitive data in client-side code
- [x] XSS protection enabled
- [x] CSRF tokens for forms (add if needed)
- [x] Rate limiting (Cloudflare automatic)
- [ ] Content Security Policy (add if needed)
- [ ] Subresource Integrity for CDN assets

## Performance Optimization

### Current Optimizations

- Vanilla JS (no framework overhead)
- Minimal CSS (single file, ~15KB)
- No external dependencies
- Lazy loading ready
- LocalStorage for cart persistence
- Efficient event delegation

### Additional Optimizations

1. **Minify assets**
   ```bash
   # CSS
   npx csso dist/css/store.css -o dist/css/store.min.css

   # JS
   npx terser dist/js/store.js -o dist/js/store.min.js
   ```

2. **Add service worker** (PWA)
   Create `dist/sw.js` for offline support

3. **Image optimization**
   Add product images and optimize:
   ```bash
   npx @squoosh/cli --webp auto dist/images/*.png
   ```

## Rollback Plan

### If deployment fails:

1. **Cloudflare Pages**: Click "View build logs" → "Rollback to previous deployment"
2. **Wrangler**: Deploy previous version
   ```bash
   wrangler pages deploy dist --project-name=blackroad-store
   ```

### Emergency contact:
- Email: blackroad.systems@gmail.com
- Support: Check Cloudflare status at https://www.cloudflarestatus.com

## Maintenance

### Regular Updates

- Review analytics monthly
- Update product pricing as needed
- Test checkout flow weekly
- Monitor error rates via Cloudflare
- Update dependencies (none currently)

### Backup

```bash
# Backup dist folder
tar -czf blackroad-store-backup-$(date +%Y%m%d).tar.gz dist/

# Backup to cloud
aws s3 cp blackroad-store-backup-*.tar.gz s3://blackroad-backups/
```

## Support

For deployment issues:
- Cloudflare Docs: https://developers.cloudflare.com/pages
- Cloudflare Community: https://community.cloudflare.com
- Email: blackroad.systems@gmail.com

## Next Steps

1. Deploy to Cloudflare Pages
2. Set up custom domain (store.blackroad.systems)
3. Configure Stripe integration
4. Add analytics tracking
5. Test thoroughly
6. Announce launch!
